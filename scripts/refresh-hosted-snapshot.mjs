import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {validateHostedSnapshot} from '../worker/snapshot-validation.js';
import {safeSourceURL} from '../worker/core.js';
const origin=safeSourceURL(process.env.FINN_HOSTED_ORIGIN||'https://finn-enam-yid1.onrender.com').origin;
const companies=JSON.parse(await readFile('data/companies.json','utf8'));let raw;
for(let attempt=0;attempt<3;attempt++){
 try{const response=await fetch(origin+'/api/portfolio?refresh=1',{signal:AbortSignal.timeout(180000)});if(!response.ok)throw new Error('Portfolio HTTP '+response.status);raw=await response.json();break;}
 catch(error){if(attempt===2)throw error;console.log('Retrying source refresh after a transient request failure.');await new Promise(r=>setTimeout(r,5000));}
}
const candidate=validateHostedSnapshot(raw,companies);
const report={checkedAt:candidate.generatedAt,origin,feeds:raw.rows.map(r=>({ticker:r.ticker,priceMode:r.price.mode,session:r.price.summary.date,priceFetchedAt:r.price.fetchedAt,filingMode:r.filings.mode,filings:r.filings.items.length,filingFetchedAt:r.filings.fetchedAt}))};
await mkdir('reports',{recursive:true});
// Validate everything before replacing the fallback; commits contain no keys.
const temporary='data/snapshot.'+process.pid+'.tmp';await writeFile(temporary,JSON.stringify(candidate));await rename(temporary,'data/snapshot.json');
await writeFile('reports/HOSTED_REFRESH.json',JSON.stringify(report,null,2));
console.log('Validated '+raw.rows.length+' live companies. Sessions: '+[...new Set(report.feeds.map(f=>f.session))].join(', '));
