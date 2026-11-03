import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../dist/server/index.js';
const req=(path,options)=>new Request('https://finn.test'+path,options);
test('reviewed financials disclose annual scope, missing EBITDA and unsupported companies',async()=>{const response=await worker.fetch(req('/api/reviewed-financials?ticker=INFY'),{}),data=await response.json();assert.equal(response.status,200);assert.match(data.curation,/not automatic/);assert.ok(data.rows[0].yoy.value>9);assert.equal(data.rows[0].qoq.value,null);assert.equal(data.rows.find(r=>r.metric==='EBITDA').current,null);assert.equal((await worker.fetch(req('/api/reviewed-financials?ticker=TCS'),{})).status,404);});
test('homepage and assets are served; status discloses missing model key',async()=>{
  const home=await worker.fetch(req('/'),{});assert.equal(home.status,200);assert.match(await home.text(),/Welcome back, Vikash/);
  const status=await(await worker.fetch(req('/api/status'),{})).json();
  assert.equal(status.companies.length,18);assert.equal(status.aiConfigured,false);assert.ok(status.researchTickers.includes('INFY'));
  const css=await worker.fetch(req('/styles.css'),{});assert.match(css.headers.get('content-type'),/text\/css/);
  const script=await worker.fetch(req('/app.js'),{});assert.match(await script.text(),/document\.querySelector/);
});

test('malformed JSON and non-object research payloads return a clear client error',async()=>{
  for(const body of ['{','null','[]']){
    const response=await worker.fetch(req('/api/research',{method:'POST',body}),{});
    assert.equal(response.status,400);assert.match((await response.json()).error,/JSON object/);
  }
});

test('status reports the selected model without exposing provider credentials',async()=>{
  const env={GEMINI_API_KEY:'mock-secret-gemini',OPENAI_API_KEY:'mock-secret-openai',GEMINI_MODEL:'gemini-3.1-flash-lite'};
  const response=await worker.fetch(req('/api/status'),env);
  const text=await response.text(),status=JSON.parse(text);
  assert.equal(status.aiProvider,'gemini');assert.equal(status.aiModel,env.GEMINI_MODEL);
  assert.ok(!text.includes(env.GEMINI_API_KEY));assert.ok(!text.includes(env.OPENAI_API_KEY));
});

test('provider quota failure preserves evidence and explicitly falls back',async t=>{
  t.mock.method(globalThis,'fetch',async()=>new Response('{}',{status:429}));
  const response=await worker.fetch(req('/api/research',{method:'POST',body:JSON.stringify({ticker:'INFY',topic:'cash',question:'quota failure regression'})}),{GEMINI_API_KEY:'mock-only'});
  const result=await response.json();
  assert.equal(response.status,200);assert.equal(result.analysis.mode,'extractive');
  assert.match(result.analysis.note,/429/);assert.ok(result.evidence.length);
});

test('Gemini errors explain model failures without reflecting credentials',async t=>{
  const secret='mock-private-provider-credential';
  t.mock.method(globalThis,'fetch',async()=>Response.json({error:{message:'Model not available. Received '+secret}},{status:404}));
  const result=await(await worker.fetch(req('/api/research',{method:'POST',body:JSON.stringify({ticker:'INFY',topic:'cash',question:'safe provider diagnostics'})}),{GEMINI_API_KEY:secret})).json();
  assert.equal(result.analysis.mode,'extractive');assert.match(result.analysis.note,/Model not available/);
  assert.ok(!JSON.stringify(result).includes(secret));assert.match(result.analysis.note,/redacted/);
});

test('valid Gemini output retains claim kind and exact source attribution',async t=>{
  const payload={ticker:'INFY',topic:'cash',question:'valid provider contract regression'};
  const baseline=await(await worker.fetch(req('/api/research',{method:'POST',body:JSON.stringify(payload)}),{})).json();
  const id=baseline.evidence[0].id;
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    assert.match(String(url),/generateContent$/);
    assert.equal(options.headers['x-goog-api-key'],'mock-only');
    const prompt=JSON.parse(options.body).contents[0].parts[0].text;
    assert.equal(JSON.parse(options.body).generationConfig.thinkingConfig.thinkingLevel,'minimal');
    assert.ok(prompt.includes(id));
    const required=JSON.parse(options.body).generationConfig.responseJsonSchema.properties.claims.items.required;
    assert.ok(required.includes('support'),'Provider must require supporting quotes in its output contract');
    return Response.json({candidates:[{content:{parts:[{text:JSON.stringify({claims:[{text:'Management reported the figure in the cited passage.',kind:'fact',sources:[id],support:[{sourceId:id,quote:baseline.evidence[0].text.slice(0,150)}]}],note:'Period limited to the excerpt.'})}]}}]});
  });
  const result=await(await worker.fetch(req('/api/research',{method:'POST',body:JSON.stringify(payload)}),{GEMINI_API_KEY:'mock-only',GEMINI_MODEL:'gemini-3.1-flash-lite'})).json();
  assert.equal(result.analysis.mode,'ai');assert.equal(result.analysis.model,'gemini-3.1-flash-lite');
  assert.deepEqual(result.analysis.claims[0].sources,[id]);assert.equal(result.analysis.claims[0].kind,'fact');
});

test('one invalid citation rejects the whole answer instead of silently omitting claims',async t=>{
  const payload={ticker:'INFY',topic:'cash',question:'citation rejection regression'};
  const baseline=await(await worker.fetch(req('/api/research',{method:'POST',body:JSON.stringify(payload)}),{})).json();
  t.mock.method(globalThis,'fetch',async()=>Response.json({candidates:[{content:{parts:[{text:JSON.stringify({claims:[{text:'Supported excerpt.',kind:'fact',sources:[baseline.evidence[0].id],support:[{sourceId:baseline.evidence[0].id,quote:baseline.evidence[0].text.slice(0,150)}]},{text:'Unsupported.',kind:'fact',sources:['invented-id']}]})}]}}]}));
  const result=await(await worker.fetch(req('/api/research',{method:'POST',body:JSON.stringify(payload)}),{GEMINI_API_KEY:'mock-only'})).json();
  assert.equal(result.analysis.mode,'extractive');assert.match(result.analysis.note,/evidence validation/);
});

test('limitation-only answers cannot use the model note to overstate corpus coverage',async t=>{
  const payload={ticker:'INFY',topic:'financials',question:'limitation coverage scope regression'};
  const baseline=await(await worker.fetch(req('/api/research',{method:'POST',body:JSON.stringify(payload)}),{})).json();
  const id=baseline.evidence[0].id;
  t.mock.method(globalThis,'fetch',async()=>Response.json({candidates:[{content:{parts:[{text:JSON.stringify({claims:[{text:'Not established by these excerpts.',kind:'limitation',sources:[id]}],note:'All company documents end at FY2026.'})}]}}]}));
  const result=await(await worker.fetch(req('/api/research',{method:'POST',body:JSON.stringify(payload)}),{GEMINI_API_KEY:'mock-only'})).json();
  assert.equal(result.analysis.mode,'ai');assert.match(result.analysis.note,/retrieved passages/);
  assert.ok(!result.analysis.note.includes('FY2026'));assert.match(result.analysis.note,/has not been assessed/);
});

test('unfamiliar ticker retains discovered document URLs when every download is blocked',async t=>{
  t.mock.method(globalThis,'fetch',async url=>{
    if(String(url).includes('screener.in'))return new Response('<h3>Annual reports</h3><ul><li><a href="https://company.example/annual.pdf">Annual Report 2026</a></li></ul>');
    if(String(url).includes('nseindia.com'))return Response.json([]);
    return new Response('Blocked',{status:403});
  });
  const response=await worker.fetch(req('/api/research',{method:'POST',body:JSON.stringify({ticker:'TESTBLOCKED'})}),{});
  const result=await response.json();
  assert.equal(response.status,200);assert.equal(result.mode,'unavailable');assert.equal(result.analysis.mode,'extractive');
  assert.equal(result.documents[0].url,'https://company.example/annual.pdf');
  assert.match(result.documents[0].error,/403/);assert.deepEqual(result.evidence,[]);
});

test('missing company discovery pages return a useful error without invented research',async t=>{
  t.mock.method(globalThis,'fetch',async()=>new Response('Not found',{status:404}));
  const response=await worker.fetch(req('/api/research',{method:'POST',body:JSON.stringify({ticker:'NODISCOVER123'})}),{});
  assert.equal(response.status,422);const result=await response.json();
  assert.match(result.error,/Check the NSE symbol/);assert.equal(result.evidence,undefined);
});

test('empty fresh price responses retain the old usable snapshot rather than claiming live coverage',async t=>{
  t.mock.method(globalThis,'fetch',async()=>Response.json({chart:{result:[{timestamp:[],indicators:{quote:[{close:[],volume:[]}]}}]}}));
  const response=await worker.fetch(req('/api/portfolio?tickers=INFY&refresh=1'),{});
  const {rows}=await response.json();assert.equal(response.status,200);
  assert.equal(rows[0].price.mode,'stale_snapshot');assert.ok(rows[0].price.summary);
  assert.match(rows[0].price.error,/no usable completed sessions/);
});
test('seeded research returns only attributed primary evidence without pretending to use AI',async()=>{
  const r=await worker.fetch(req('/api/research',{method:'POST',body:JSON.stringify({ticker:'INFY',topic:'cash'})}),{});
  assert.equal(r.status,200);const data=await r.json();
  assert.equal(data.analysis.mode,'extractive');assert.ok(data.evidence.length>0);
  for(const e of data.evidence){assert.ok(e.page>0);assert.ok(e.url.startsWith('https://'));assert.ok(data.documents.some(d=>d.id===e.documentId));}
  assert.ok(data.documents.some(d=>d.type==='annual_report'&&d.parsedPages>0));
});
test('invalid research input and unbounded portfolios are rejected',async()=>{
  const invalid=await worker.fetch(req('/api/research',{method:'POST',body:JSON.stringify({ticker:'../../etc'})}),{});assert.equal(invalid.status,422);
  const many=await worker.fetch(req('/api/portfolio?tickers='+Array.from({length:26},(_,i)=>'T'+i).join(',')),{});assert.equal(many.status,400);
});

test('fallback model output must pass the same quote and citation checks',async t=>{
 const payload={ticker:'INFY',topic:'cash',question:'Fallback evidence guard regression'};let calls=0;
 t.mock.method(globalThis,'fetch',async()=>{if(++calls===1)return Response.json({error:{message:'High demand'}},{status:503});return Response.json({candidates:[{content:{parts:[{text:JSON.stringify({claims:[{text:'A fabricated return.',kind:'fact',sources:['fake-id'],support:[]}]})}]}}]});});
 const result=await(await worker.fetch(req('/api/research',{method:'POST',body:JSON.stringify(payload)}),{GEMINI_API_KEY:'mock-only'})).json();
 assert.equal(calls,2);assert.equal(result.analysis.mode,'extractive');assert.match(result.analysis.note,/evidence validation/);assert.ok(result.evidence.length);
});

function filingPDF(){
 const text='The board approved an acquisition subject to regulatory approval. The proposed transaction is not complete. Funding terms remain subject to the conditions described in this filing.';
 const stream='BT /F1 12 Tf 40 700 Td ('+text+') Tj ET';
 const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>','<< /Length '+stream.length+' >>\nstream\n'+stream+'\nendstream'];
 let pdf='%PDF-1.4\n',offsets=[0];for(const [i,obj] of objects.entries()){offsets.push(pdf.length);pdf+=(i+1)+' 0 obj\n'+obj+'\nendobj\n';}const xref=pdf.length;pdf+='xref\n0 6\n0000000000 65535 f \n'+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF';return pdf;
}
test('filing analysis rejects unindexed IDs without fetching user URLs',async t=>{
 let calls=0;t.mock.method(globalThis,'fetch',async()=>{calls++;throw new Error('Unexpected network');});
 const response=await worker.fetch(req('/api/filing-analysis',{method:'POST',body:JSON.stringify({ticker:'ITC',id:'nonexistent',url:'https://attacker.example/file.pdf'})}),{});assert.equal(response.status,404);assert.equal(calls,0);
});
test('filing analysis reads actual PDF text with page attribution when AI is not configured',async t=>{
 const feed=await(await worker.fetch(req('/api/portfolio?tickers=ITC'),{})).json();const filing=feed.rows[0].filings.items[0];
 t.mock.method(globalThis,'fetch',async url=>{assert.equal(String(url),filing.url);return new Response(filingPDF(),{headers:{'content-type':'application/pdf'}});});
 const response=await worker.fetch(req('/api/filing-analysis',{method:'POST',body:JSON.stringify({ticker:'ITC',id:filing.id})}),{});const result=await response.json();assert.equal(response.status,200);assert.equal(result.analysis.mode,'extractive');assert.ok(result.evidence.length);assert.match(result.evidence[0].text,/subject to regulatory approval/);assert.equal(result.evidence[0].page,1);assert.equal(result.evidence[0].url,filing.url);
});
test('blocked filing PDF reports a source failure without synthesising from the headline',async t=>{
 const feed=await(await worker.fetch(req('/api/portfolio?tickers=TCS'),{})).json();const filing=feed.rows[0].filings.items[0];
 t.mock.method(globalThis,'fetch',async()=>new Response('blocked',{status:403}));
 const response=await worker.fetch(req('/api/filing-analysis',{method:'POST',body:JSON.stringify({ticker:'TCS',id:filing.id})}),{});const result=await response.json();assert.equal(response.status,422);assert.match(result.error,/403/);assert.equal(result.analysis,undefined);
});

test('filing synthesis accepts copied support and rejects invented quotations',async t=>{
 const feed=await(await worker.fetch(req('/api/portfolio?tickers=ITC'),{})).json();const filing=feed.rows[0].filings.items[0],payload={ticker:'ITC',id:filing.id};
 const baseline=await(await worker.fetch(req('/api/filing-analysis',{method:'POST',body:JSON.stringify(payload)}),{})).json();const e=baseline.evidence[0];
 let invalid=false;t.mock.method(globalThis,'fetch',async()=>Response.json({candidates:[{content:{parts:[{text:JSON.stringify({claims:[{text:'The acquisition is subject to regulatory approval.',kind:'fact',sources:[e.id],support:[{sourceId:e.id,quote:invalid?'The company guarantees exceptional investment returns forever.':e.text.slice(0,150)}]}]})}]}}]}));
 const call=async model=>(await(await worker.fetch(req('/api/filing-analysis',{method:'POST',body:JSON.stringify(payload)}),{GEMINI_API_KEY:'mock-only',GEMINI_MODEL:model})).json());
 assert.equal((await call('gemini-test-filing-valid')).analysis.mode,'ai');invalid=true;
 const rejected=await call('gemini-test-filing-invalid');assert.equal(rejected.analysis.mode,'extractive');assert.match(rejected.analysis.note,/does not match/);assert.ok(rejected.evidence.length);
});

test('desktop delivery control is not exposed by hosted origins',async()=>{const r=await worker.fetch(req('/api/alert-delivery'),{});assert.equal(r.status,404);});
test('local desktop delivery changes reject cross-origin callers',async()=>{const r=await worker.fetch(new Request('http://localhost:3002/api/alert-delivery',{method:'POST',headers:{origin:'https://attacker.example','content-type':'application/json'},body:'{}'}),{});assert.equal(r.status,403);});

test('reviewed guidance exposes sources and does not pretend every ticker has a scorecard',async()=>{const r=await worker.fetch(req('/api/guidance?ticker=INFY'),{});const data=await r.json();assert.equal(r.status,200);assert.equal(data.comparison.status,'within_range');assert.equal(data.history.length,4);assert.ok(data.guidance.source.url.startsWith('https://'));assert.ok(data.note.includes('FY27 annual delivery is pending'));const missing=await worker.fetch(req('/api/guidance?ticker=TCS'),{});assert.equal(missing.status,404);});
