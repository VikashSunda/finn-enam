export function researchIntent(question='',topic='business',ticker='the selected company'){
 const original=String(question).trim(),q=original.toLowerCase().replace(/[.!?,]+/g,' ').replace(/\s+/g,' ').trim();
 if(/^(?:hi|hello|hey|hi there|hello there|hey finn|hello finn|hi finn|good morning|good afternoon|good evening)$/.test(q))return {kind:'greeting',topic,question:original};
 const specific=/\b(?:revenue|ebitda|pbt|pat|profit|margin|cash|debt|guidance|quarter|fy\d|risk|valuation|price|dividend|ceo|cfo|director)\b/.test(q);
 const overview=!specific&&(/\b(?:business model|core business|main business|make money|earn money|earns money)\b/.test(q)||/^what\s+(?:does|do)\b/.test(q)||/^what\s+.{1,70}\s+(?:does|do)$/.test(q)||/^(?:describe|explain|tell me about|give me an? overview of)\s+(?:it|this company|the company|[a-z0-9&.-]+)$/.test(q));
 return overview?{kind:'overview',topic:'business',question:'What does '+ticker+' do? Explain its core products or services, customers and how it earns money in plain language.'}:{kind:original?'question':'topic',topic,question:original};
}
