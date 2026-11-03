import {mkdir,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
const once=process.argv.includes('--once'),origin=process.env.FINN_MONITOR_ORIGIN||'http://localhost:3002';
const interval=15*60*1000;let busy=false;
function run(file){return new Promise((resolve,reject)=>{const child=spawn(process.execPath,[file],{stdio:'inherit',windowsHide:true});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error(file+' exited '+code)));});}
async function refresh(){if(busy)return;busy=true;try{
 console.log('Portfolio check '+new Date().toISOString());
 const response=await fetch(origin+'/api/portfolio?refresh=1',{signal:AbortSignal.timeout(150000)});if(!response.ok)throw new Error('Portfolio HTTP '+response.status);
 const data=await response.json();await mkdir('.cache/reliability',{recursive:true});await writeFile('.cache/reliability/portfolio-response.json',JSON.stringify(data,null,2));
 const report={checkedAt:new Date().toISOString(),feeds:data.rows.map(r=>({ticker:r.ticker,priceMode:r.price.mode,session:r.price.summary?.date,priceFetchedAt:r.price.fetchedAt,filingMode:r.filings.mode,filings:r.filings.items.length,filingFetchedAt:r.filings.fetchedAt,priceError:r.price.error||null,filingError:r.filings.error||null}))};
 await mkdir('reports',{recursive:true});await writeFile('reports/PORTFOLIO_FRESHNESS.json',JSON.stringify(report,null,2));
 await run('scripts/refresh-audited-snapshot.mjs');await run('scripts/build.mjs');console.log('Validated snapshot refreshed.');
 }catch(error){console.error('Refresh failed; existing snapshot retained: '+error.message);if(once)process.exitCode=1;}finally{busy=false;}}
if(!process.argv.includes('--wait'))await refresh();if(!once){console.log('Monitoring every 15 minutes while this process and FINN server remain running.');setInterval(refresh,interval);}
