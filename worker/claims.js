const normalise=value=>String(value).normalize('NFKC').replace(/[“”]/g,'"').replace(/[‘’]/g,"'").replace(/\s+/g,' ').trim().toLowerCase();
const numbers=text=>(String(text).match(/\d+(?:,\d{3})*(?:\.\d+)?/g)||[]).map(n=>String(Number(n.replaceAll(',',''))));

// Deterministic support checks, not a claim of semantic entailment.
export function validateClaims(result,evidence){
  const byId=new Map(evidence.map(e=>[e.id,e]));
  if(!Array.isArray(result.claims)||!result.claims.length||result.claims.length>5)throw new Error('Model output failed evidence validation');
  return result.claims.map(claim=>{
    if(!claim||typeof claim.text!=='string'||!claim.text.trim()||claim.text.length>1400||!['fact','inference','limitation'].includes(claim.kind)||!Array.isArray(claim.sources)||claim.sources.length<1||claim.sources.length>3||claim.sources.some(id=>!byId.has(id)))throw new Error('Model output failed evidence validation');
    const sources=[...new Set(claim.sources)];
    const support=[];
    if(claim.kind!=='limitation'){
      if(!Array.isArray(claim.support)||claim.support.length<1||claim.support.length>3)throw new Error('Model output has no verifiable supporting quotes');
      for(const item of claim.support){
        if(!item||!sources.includes(item.sourceId)||typeof item.quote!=='string'||normalise(item.quote).length<24||item.quote.length>600||!normalise(byId.get(item.sourceId).text).includes(normalise(item.quote)))throw new Error('Model supporting quote does not match its cited passage');
        support.push({sourceId:item.sourceId,quote:item.quote});
      }
      if(sources.some(id=>!support.some(s=>s.sourceId===id)))throw new Error('Model citation lacks a supporting quote');
      const allowed=new Set(numbers(sources.map(id=>byId.get(id).text+' '+byId.get(id).label).join(' ')));
      if(numbers(claim.text).some(n=>!allowed.has(n)))throw new Error('Model numeric claim is absent from cited evidence');
    }
    return {text:claim.kind==='limitation'?'The retrieved passages do not establish the requested answer.':claim.text,kind:claim.kind,sources,support,verification:claim.kind==='limitation'?'scope_only':'quotes_and_numbers_checked'};
  });
}
