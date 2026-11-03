import {readFile,mkdir,writeFile} from 'node:fs/promises';
const origin=process.env.FINN_AUDIT_ORIGIN||'http://localhost:3002';
const companies=JSON.parse(await readFile('data/companies.json','utf8'));
const seed=JSON.parse(await readFile('data/snapshot.json','utf8'));
const directory='.cache/reliability';await mkdir(directory,{recursive:true});
async function api(path,body){
  const response=await fetch(origin+path,{signal:AbortSignal.timeout(150000),...(body?{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}:{})});
  const data=await response.json();return {status:response.status,data};
}
const run={checkedAt:new Date().toISOString(),origin,previousSnapshot:seed.generatedAt};
console.log('Checking all '+companies.length+' registered companies on '+origin);
const portfolio=await api('/api/portfolio?refresh=1&tickers='+encodeURIComponent(companies.map(c=>c.ticker).join(',')));
if(portfolio.status!==200||portfolio.data.rows?.length!==companies.length)throw new Error('Portfolio response is incomplete; snapshot unchanged');
await writeFile(directory+'/portfolio-response.json',JSON.stringify(portfolio.data,null,2));
run.feeds=portfolio.data.rows.map(row=>{
  const p=row.price,s=p.summary,f=row.filings;
  return {ticker:row.ticker,priceMode:p.mode,session:s?.date||null,priceFetchedAt:p.fetchedAt||null,baselineDays:s?.baselineDays||0,historyDays:s?.history?.length||0,priceError:p.error||null,priceSource:p.source||null,filingMode:f.mode,filingCount:f.items?.length||0,newestFiling:f.items?.map(i=>i.date).sort().at(-1)||null,filingFetchedAt:f.fetchedAt||null,filingError:f.error||null,filingSource:f.source||null};
});
console.log(JSON.stringify({priceModes:run.feeds.reduce((a,r)=>(a[r.priceMode]=(a[r.priceMode]||0)+1,a),{}),filingModes:run.feeds.reduce((a,r)=>(a[r.filingMode]=(a[r.filingMode]||0)+1,a),{}),sessions:[...new Set(run.feeds.map(r=>r.session))]},null,2));
await writeFile(directory+'/audit.json',JSON.stringify(run,null,2));
run.research=[];
for(const ticker of ['AXISBANK','ASIANPAINT','COFORGE','ZZFINNINVALID123']){
  console.log('Checking unfamiliar research: '+ticker);
  try{
    const {status,data}=await api('/api/research',{ticker,topic:'business',refresh:true});
    await writeFile(directory+'/research-'+ticker+'.json',JSON.stringify(data,null,2));
    const result={ticker,status,mode:data.mode||null,error:data.error||null,evidenceCount:data.evidence?.length||0,analysisMode:data.analysis?.mode||null,analysisNote:data.analysis?.note||null,allEvidenceAttributed:(data.evidence||[]).every(e=>Number.isInteger(e.page)&&e.page>0&&data.documents?.some(d=>d.id===e.documentId&&d.url===e.url)),documents:data.documents?.map(d=>({label:d.label,status:d.status,pages:d.parsedPages,error:d.error||null,url:d.url}))||[]};
    run.research.push(result);console.log(JSON.stringify(result));
  }catch(error){run.research.push({ticker,error:error.message});console.log(ticker+': '+error.message);}
  await writeFile(directory+'/audit.json',JSON.stringify(run,null,2));
}
console.log('Saved audit and raw non-secret API responses in '+directory);
