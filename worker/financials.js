export function financialChange(current,previous,comparison='yoy'){
 if(!current||!previous||![current.value,previous.value].every(Number.isFinite))return {value:null,reason:'Comparable reported values are unavailable.'};
 for(const key of ['metric','unit','currency','basis','periodType'])if(typeof current[key]!=='string'||!current[key].trim()||current[key]!==previous[key])return {value:null,reason:'Reporting '+key+' is missing or differs.'};
 if(!['annual','quarter'].includes(current.periodType))return {value:null,reason:'Unsupported reporting period.'};
 if(!['yoy','qoq'].includes(comparison))return {value:null,reason:'Unknown comparison.'};
 const a=/^(\d{4})-(\d{2})-(\d{2})$/.exec(current.periodEnd),b=/^(\d{4})-(\d{2})-(\d{2})$/.exec(previous.periodEnd);
 if(!a||!b||[current.periodEnd,previous.periodEnd].some(d=>{const t=new Date(d+'T00:00:00Z');return !Number.isFinite(t.getTime())||t.toISOString().slice(0,10)!==d;}))return {value:null,reason:'Period dates are missing or invalid.'};
 if([current.periodEnd,previous.periodEnd].some(d=>{const t=new Date(d+'T00:00:00Z');return t.getUTCDate()!==new Date(Date.UTC(t.getUTCFullYear(),t.getUTCMonth()+1,0)).getUTCDate();}))return {value:null,reason:'Only aligned calendar month-end periods are supported.'};
 const months=(+a[1]-b[1])*12+(+a[2]-b[2]);
 if(months!==(comparison==='yoy'?12:3)||(comparison==='qoq'&&current.periodType!=='quarter'))return {value:null,reason:'Periods do not align for '+comparison.toUpperCase()+'.'};
 if(previous.value<=0)return {value:null,reason:'A zero or negative base is not expressed as conventional percentage growth.'};
 return {value:(current.value/previous.value-1)*100,reason:'Calculated from aligned reported values: (current / prior - 1) × 100.'};
}
