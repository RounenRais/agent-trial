const caseData=require("./caseData.js");
const {searchEvidence,readEvidence}=require("./tools.js");
const results = searchEvidence(caseData.evidence, "kamera");

console.log("Bulunan deliller:", results);

if (results.length > 0) {
  const firstEvidence = readEvidence(
    caseData.evidence,
    results[0].id
  );

  console.log("İlk delilin içeriği:", firstEvidence);
}