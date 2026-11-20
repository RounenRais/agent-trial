const { runAgent } = require("./agent.js");

runAgent({
  name: "Avukat",
  role: "LAWYER",
  goal:
    "Sanığın suçsuz olduğunu kanıtlamak için en güçlü savunmayı kur. Belirsizlikleri ve alternatif açıklamaları savunma lehine kullan."
}).catch((error) => {
  console.error("Avukat çalışırken hata oluştu:", error.message);
});