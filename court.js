const { createAgent } = require("./agent.js");
const { runJudge } = require("./judge.js");
const caseData = require("./caseData.js");

async function main() {
  const prosecution = createAgent({
    role: "PROSECUTION",
    name: "Savcı",
    goal:
      "Sanığın suçlu olduğunu savunan en güçlü iddiayı kur. " +
      "Karşı tarafın açıklamalarına cevap ver."
  });

  const lawyer = createAgent({
    role: "LAWYER",
    name: "Avukat",
    goal:
      "Sanığın suçsuz olduğunu savunan en güçlü açıklamayı kur. " +
      "Karşı tarafın iddialarını çürüt."
  });

  const publicRecord = [];
  const roundCount = 3;

  for (let round = 1; round <= roundCount; round++) {
  const order = [prosecution, lawyer];

    for (const agent of order) {
      const entry = await agent.takeTurn({
        round,
        publicRecord
      });

      publicRecord.push(entry);

      console.log("\n" + entry.name + " / Konuşma:");
      console.log(entry.text);

      console.log(
        "Sunulan deliller:",
        entry.evidence.map((item) => item.id)
      );
    }
  }
console.log("\nHâkim karar hazırlıyor...");
  const decision = await runJudge({
    caseDescription: caseData.description,
    publicRecord
  });

  console.log(
    "\nHAKİMİN DEĞERLENDİRMESİ\n" + decision
  );
}

main().catch((error) => {
  console.error("Duruşma durdu:", error.message);
  console.error("Model ayrıntıları:", error.details);
  console.error("API hata ayrıntısı:", {
  status: error.status,
  code: error.error?.code ?? error.code,
  failedGeneration: error.error?.failed_generation
});
  process.exitCode = 1;
});