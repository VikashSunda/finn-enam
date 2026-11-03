export function compareGuidance(guidance,actual){
 if(!guidance||!actual)return {status:'pending',reason:'A matching completed-period result is not available.'};
 for(const field of ['period','metric','unit','basis'])if(typeof guidance[field]!=='string'||!guidance[field].trim()||guidance[field]!==actual[field])return {status:'not_comparable',reason:'The '+field+' is missing or differs; no delivery score is assigned.'};
 if(![guidance.low,guidance.high,actual.value].every(Number.isFinite)||guidance.low>guidance.high)return {status:'not_comparable',reason:'Numeric inputs are incomplete or invalid.'};
 return {status:actual.value<guidance.low?'below_range':actual.value>guidance.high?'above_range':'within_range',reason:'Matched period, metric, units and reporting basis. This evaluates the disclosed range, not investment performance.'};
}
