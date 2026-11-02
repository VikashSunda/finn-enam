import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../dist/server/index.js';
const req=(path,options)=>new Request('https://finn.test'+path,options);
test('homepage and assets are served; status discloses missing model key',async()=>{
  const home=await worker.fetch(req('/'),{});assert.equal(home.status,200);assert.match(await home.text(),/Your portfolio, in focus/);
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

test('provider quota failure preserves evidence and explicitly falls back',async t=>{
  t.mock.method(globalThis,'fetch',async()=>new Response('{}',{status:429}));
  const response=await worker.fetch(req('/api/research',{method:'POST',body:JSON.stringify({ticker:'INFY',topic:'cash',question:'quota failure regression'})}),{GEMINI_API_KEY:'mock-only'});
  const result=await response.json();
  assert.equal(response.status,200);assert.equal(result.analysis.mode,'extractive');
  assert.match(result.analysis.note,/429/);assert.ok(result.evidence.length);
});

test('one invalid citation rejects the whole answer instead of silently omitting claims',async t=>{
  const payload={ticker:'INFY',topic:'cash',question:'citation rejection regression'};
  const baseline=await(await worker.fetch(req('/api/research',{method:'POST',body:JSON.stringify(payload)}),{})).json();
  t.mock.method(globalThis,'fetch',async()=>Response.json({candidates:[{content:{parts:[{text:JSON.stringify({claims:[{text:'Supported excerpt.',kind:'fact',sources:[baseline.evidence[0].id]},{text:'Unsupported.',kind:'fact',sources:['invented-id']}]})}]}}]}));
  const result=await(await worker.fetch(req('/api/research',{method:'POST',body:JSON.stringify(payload)}),{GEMINI_API_KEY:'mock-only'})).json();
  assert.equal(result.analysis.mode,'extractive');assert.match(result.analysis.note,/evidence validation/);
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
