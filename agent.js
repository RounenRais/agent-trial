const { getAgentConfig } = require("./config.js");
const { createModelSession } = require("./providers.js");
const { searchEvidence, readEvidence } = require("./tools.js");
const caseData = require("./caseData.js");

const searchEvidenceTool = {
  name: "searchEvidence",

  description:
    "Aranacak tek kelime. Örnek: izin, arşiv, ödeme, test."+
    "Eşleşen delillerin kimliklerini ve başlıklarını getirir.",

  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Aranacak tek kelime. Örnek: kart, kamera, saat."
      }
    },
    required: ["query"]
  }
};

const readEvidenceTool = {
  name: "readEvidence",
  strict: true,

  description:
    "Bir delilin kimliğini alır ve tam içeriğini getirir. " +
    "Kimlik, arama sonuçlarından seçilmelidir.",

  input_schema: {
    type: "object",
    properties: {
      evidenceId: {
        type: "string",
        description: "Okunacak delilin kimliği. Örnek: E2."
      }
    },
    required: ["evidenceId"],
    additionalProperties: false
  }
};

const submitArgumentTool = {
  name: "submitArgument",
  strict: true,

  description:
    "Mahkemeye sunacağın konuşmayı ve seçtiğin delil kimliklerini gönderir. " +
    "Konuşma turunu bitirir; diğer araçlarla aynı yanıtta çağrılmamalıdır.",

  input_schema: {
    type: "object",

    properties: {
      text: {
        type: "string",
        description:
          "Mahkemeye sunulacak, en fazla 2000 karakterlik konuşma."
      },

      evidenceIds: {
        type: "array",
        items: {
          type: "string"
        },
        description:
          "Okunmuş veya ortak tutanakta görülmüş en fazla iki delilin " +
          "kimliği. Atıf yoksa boş dizi."
      }
    },

    required: ["text", "evidenceIds"],
    additionalProperties: false
  }
};

function executeTool(toolCall, evidenceList) {
  const { name, input } = toolCall;

  if (name === "searchEvidence") {
    return searchEvidence(evidenceList, input.query);
  }

  if (name === "readEvidence") {
    return readEvidence(evidenceList, input.evidenceId);
  }

  throw new Error("Tanımsız araç: " + name);
}

function createAgent({ role, name, goal }) {
  role = String(role).trim().toUpperCase();

  if (!["LAWYER", "PROSECUTION"].includes(role)) {
    throw new Error("Bu ajan yalnızca LAWYER veya PROSECUTION olabilir.");
  }

  const config = getAgentConfig(role);
  const knownEvidence = new Map();

  let seenEntries = 0;

  const session = createModelSession(config, {
    system:
      "Kurmaca mahkemede " + name + " rolündesin. Hedefin: " + goal +
      " Türkçe konuş. Karşı tarafın son iddiasına cevap ver. " +
      "Her konuşma turunda en fazla iki arama ve bir okuma yapabilirsin. " +
      "Kaynak bilgiyi ve kendi yorumunu ayır. " +
      "Konuşmanı en fazla 2000 karakter tut. " +
      "Turu bitirmek için submitArgument aracını tek başına çağır. " +
      "En fazla iki delile atıf yap; yalnızca okuduğun veya ortak " +
      "tutanakta gördüğün delilleri seçebilirsin. " +
      "Delilsiz bir açıklama için evidenceIds boş olabilir.",

    prompt:
      "Dava özeti: " + caseData.description +
      "\nMahkeme yeni konuşma turunu bildirdiğinde araştır ve açıklamanı sun.",

    tools: [
      searchEvidenceTool,
      readEvidenceTool,
      submitArgumentTool
    ]
  });

  return {
    async takeTurn({ round, publicRecord }) {
      const newEntries = publicRecord.slice(seenEntries);

      for (const entry of newEntries) {
        for (const evidence of entry.evidence) {
          knownEvidence.set(
            evidence.id,
            structuredClone(evidence)
          );
        }
      }

      session.addUser(JSON.stringify({
        instruction:
          "Yeni duruşma turu. Son iddialara karşılık ver " +
          "ve submitArgument ile tamamla.",
        round,
        newPublicEntries: newEntries
      }));

      seenEntries = publicRecord.length;

      let searches = 0;
      let reads = 0;

      for (let step = 1; step <= 6; step++) {
        console.log(
          name + " / Duruşma " + round + " / Adım " + step
        );

        const reply = await session.next();

        if (reply.toolCalls.length === 0) {
          session.addUser(
            "Bu turun konuşmasını submitArgument aracını kullanarak sun."
          );
          continue;
        }

        let submission = null;

        const results = reply.toolCalls.map((call) => {
          try {
            if (call.name === "submitArgument") {
              if (reply.toolCalls.length !== 1) {
                throw new Error(
                  "submitArgument tek başına çağrılmalı."
                );
              }

              const { text, evidenceIds } = call.input || {};

              if (
                typeof text !== "string" ||
                !text.trim() ||
                text.length > 2000
              ) {
                throw new Error(
                  "Konuşma 1–2000 karakter uzunluğunda bir metin olmalı."
                );
              }

              if (
                !Array.isArray(evidenceIds) ||
                evidenceIds.some((id) => typeof id !== "string")
              ) {
                throw new Error(
                  "evidenceIds bir metin dizisi olmalı."
                );
              }

              const ids = [...new Set(evidenceIds)];

              if (ids.length > 2) {
                throw new Error(
                  "Bir konuşmada en fazla iki delil sunabilirsin."
                );
              }

              for (const id of ids) {
                if (!knownEvidence.has(id)) {
                  throw new Error(
                    "Önce okumalı veya ortak tutanakta görmelisin: " + id
                  );
                }
              }

              submission = {
                round,
                role,
                name,
                text: text.trim(),

                evidence: ids.map((id) =>
                  structuredClone(knownEvidence.get(id))
                )
              };

              return {
                id: call.id,
                content: JSON.stringify({ accepted: true })
              };
            }

            if (call.name === "searchEvidence") {
              if (searches >= 2) {
                throw new Error("Bu turun arama hakkı bitti.");
              }

              searches++;

              if (
                typeof call.input?.query !== "string" ||
                !call.input.query.trim()
              ) {
                throw new Error(
                  "Arama kelimesi boş olmayan bir metin olmalı."
                );
              }
            } else if (call.name === "readEvidence") {
              if (reads >= 1) {
                throw new Error("Bu turun okuma hakkı bitti.");
              }

              reads++;

              if (typeof call.input?.evidenceId !== "string") {
                throw new Error("evidenceId bir metin olmalı.");
              }
            } else {
              throw new Error("Tanımsız araç: " + call.name);
            }

            const result = executeTool(
              call,
              caseData.evidence
            );

            if (call.name === "readEvidence") {
              if (result === null) {
                throw new Error("İstenen delil bulunamadı.");
              }

              knownEvidence.set(
                result.id,
                structuredClone(result)
              );
            }

            console.log(
              name + " / " + call.name,
              call.input,
              result
            );

            return {
              id: call.id,
              content: JSON.stringify(result)
            };
          } catch (error) {
            return {
              id: call.id,
              content: error.message,
              isError: true
            };
          }
        });

        session.addToolResults(results);

        if (submission) {
          return submission;
        }
      }

      throw new Error(
        name + " bu konuşma turunu tamamlayamadı."
      );
    }
  };
}

async function runAgent(options) {
  const agent = createAgent(options);

  const entry = await agent.takeTurn({
    round: 1,
    publicRecord: []
  });

  console.log("\n" + options.name + ":", entry.text);

  return entry.text;
}

module.exports = {
  createAgent,
  runAgent
};