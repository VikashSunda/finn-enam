import test from 'node:test';
import assert from 'node:assert/strict';
import {createAppServer} from '../scripts/server.mjs';
import worker from '../dist/server/index.js';

async function serve(t,handler=worker){const server=createAppServer(handler,{});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>new Promise(resolve=>{server.close(resolve);server.closeAllConnections();}));return 'http://127.0.0.1:'+server.address().port;}
test('production server serves home, assets and an inexpensive health check',async t=>{const origin=await serve(t);for(const path of ['/','/styles.css','/app.js','/charts.js','/healthz'])assert.equal((await fetch(origin+path)).status,200);assert.equal((await(await fetch(origin+'/healthz')).json()).ok,true);assert.equal(await(await fetch(origin+'/',{method:'HEAD'})).text(),'');});
test('production mode cannot expose Windows delivery even with a localhost Host header',async t=>{const origin=await serve(t);const response=await fetch(origin+'/api/alert-delivery',{headers:{host:'localhost'}});assert.equal(response.status,404);});
test('production adapter preserves JSON requests and limits body size before calling the app',async t=>{let calls=0;const origin=await serve(t,{async fetch(request,env){calls++;assert.equal(env.FINN_HOSTED,'1');return Response.json(await request.json());}});assert.deepEqual(await(await fetch(origin+'/api/example',{method:'POST',body:'{"ticker":"INFY"}'})).json(),{ticker:'INFY'});assert.equal((await fetch(origin+'/api/example',{method:'POST',body:'x'.repeat(17000)})).status,413);assert.equal(calls,1);});
test('production errors never reflect internal exception details',async t=>{const origin=await serve(t,{fetch(){throw new Error('mock-secret-not-for-client');}});const response=await fetch(origin+'/api/example');assert.equal(response.status,500);assert.doesNotMatch(await response.text(),/mock-secret/);});
