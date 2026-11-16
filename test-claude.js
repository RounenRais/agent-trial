const { Anthropic } = require("@anthropic-ai/sdk");

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});
const caseData = require("./caseData.js");
async function testClaude() {

    const response = await client.messages.create({
        model: "claude-haiku-5-5",
        tools: [searchEvidenceTool],
        tool_choice: {
            type: "tool",
            name: "searchEvidence"
        },
        max_tokens: 2048,
        system: `
    Kurmaca bir mahkeme simülasyonunda savunma avukatısın.
    Hedefin sanık lehine güçlü bir savunma kurmaktır.
    Belirsizlikleri ve alternatif açıklamaları araştır.

    Türkçe yanıt ver.
  `,
        messages: [
            {
                role: "user",
                content: `  Dava açıklaması: ${caseData.description}

  Savunmaya yardımcı olabilecek delilleri arayarak araştırmaya başla.`
            }
        ]
    });

    const answer = response.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("\n");

console.log(
  response.content.filter((block) => block.type !== "thinking")
);

console.log("Durma nedeni:", response.stop_reason);

}

testClaude().catch((error) => {
    console.error("İstek başarısız:", error.message);
});
const searchEvidenceTool = {
    name: "searchEvidence",

    description:
        "Tek bir anahtar kelimeyle dava delillerinde arama yapar. Eşleşen delillerin kimliklerini ve başlıklarını getirir.",

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