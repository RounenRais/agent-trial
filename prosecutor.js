const { runAgent } = require("./agent.js");

async function startProsecutor() {
  await runAgent({
    name: "Savcı",
role: "PROSECUTION",
    goal: `
      Kurmaca davada sanığın suçlu olduğunu kanıtlamak
      için en güçlü suçlamayı kur.

      Suçlamayı destekleyebilecek kayıtları araştır ve oku.
      Belirsizlikleri ve olaylar arasındaki bağlantıları
      suçlama lehine yorumla.

      Yeterli bilgi topladığında son iddianı Türkçe sun.
      Kullandığın delillerin kimliklerini belirt.
    `
  });
}

startProsecutor().catch((error) => {
  console.error("Savcı çalışırken hata oluştu:", error.message);
});