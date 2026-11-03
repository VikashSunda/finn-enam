import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../dist/server/index.js';
const req=(path,options)=>new Request('https://finn.test'+path,options);
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
