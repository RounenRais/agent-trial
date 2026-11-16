function searchEvidence(evidenceList,query){
    const keyword=query.trim().toLocaleLowerCase("tr-TR");
    if (keyword=="")
        return [];
    return evidenceList.filter(evidence=>{
    const text=`${evidence.title} ${evidence.content}`
    return text.toLocaleLowerCase("tr-TR")
    .includes(keyword)
    }
    )
    .map(evidence=>({
        id:evidence.id,
        title:evidence.title,
    }))
    
}
function readEvidence(evidenceList,evidenceId){
const evidence=evidenceList.find(evidence=>evidence.id==evidenceId);

if (!evidence)
    return null;
return { ...evidence };

}
module.exports={searchEvidence,readEvidence};
