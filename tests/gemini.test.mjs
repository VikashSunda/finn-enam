import test from 'node:test';
import assert from 'node:assert/strict';
import {geminiModels,generateGemini} from '../worker/gemini.js';
const env={GEMINI_API_KEY:'mock-private-only'};
const options={env,prompt:'Primary evidence only',schema:{type:'object'},wait:async()=>{}};
const response=()=>Response.json({candidates:[{content:{parts:[{text:'{"claims":[]}'}]}}]});
const failure=status=>Object.assign(new Error('Provider failure'),{status});
test('503 advances sequentially to another model and reports the actual responder',async()=>{
 const called=[];
 const result=await generateGemini({...options,remote:async(url,request,timeout)=>{
  called.push(url);assert.equal(timeout,25000);assert.equal(request.headers['x-goog-api-key'],env.GEMINI_API_KEY);
  const config=JSON.parse(request.body).generationConfig;
  if(called.length===1){assert.equal(config.thinkingConfig.thinkingLevel,'minimal');throw failure(503);}
  assert.equal(config.thinkingConfig,undefined);assert.deepEqual(config.responseJsonSchema,options.schema);return response();
 }});
 assert.equal(called.length,2);assert.equal(result.model,'gemini-3.5-flash-lite');assert.deepEqual(result.attempts.map(a=>a.status),[503,'responded']);
});
test('quota, credentials and bad requests stop without trying more models',async()=>{
 for(const status of [400,401,403,429]){let calls=0;await assert.rejects(generateGemini({...options,remote:async()=>{calls++;throw failure(status);}}));assert.equal(calls,1);}
});
test('all unavailable models are capped at three attempts',async()=>{
 let calls=0;await assert.rejects(generateGemini({...options,remote:async()=>{calls++;throw failure(503);}}),error=>error.attempts.length===3);assert.equal(calls,3);
});
test('timeouts can advance but malformed provider data does not cause model hopping',async()=>{
 let calls=0;const r=await generateGemini({...options,remote:async()=>{if(++calls===1)throw Object.assign(new Error('timeout'),{name:'TimeoutError'});return response();}});assert.equal(r.attempts[0].status,'timeout');
 calls=0;await assert.rejects(generateGemini({...options,remote:async()=>{calls++;return new Response('not json');}}));assert.equal(calls,1);
});
test('fallback configuration deduplicates, bounds and validates model names',()=>{
 assert.deepEqual(geminiModels({GEMINI_FALLBACK_MODELS:''}),['gemini-3.1-flash-lite']);
 assert.deepEqual(geminiModels({GEMINI_FALLBACK_MODELS:'gemini-3.1-flash-lite, gemini-3.5-flash-lite'}),['gemini-3.1-flash-lite','gemini-3.5-flash-lite']);
 assert.throws(()=>geminiModels({GEMINI_MODEL:'../../bad'}),/Invalid/);
 assert.equal(geminiModels({GEMINI_FALLBACK_MODELS:'gemini-a,gemini-b,gemini-c,gemini-d'}).length,3);
});

test('native read-only timeout exceptions preserve diagnostics when every model times out',async()=>{
 await assert.rejects(generateGemini({...options,remote:async()=>{throw new DOMException('The operation timed out','TimeoutError');}}),error=>error.attempts.length===3&&error.message.includes('timed out')&&!error.message.includes('Cannot set'));
});
