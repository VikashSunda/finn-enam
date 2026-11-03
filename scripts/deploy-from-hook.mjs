import {execFileSync} from 'node:child_process';
const hook=process.env.RENDER_DEPLOY_HOOK;
if(!hook)throw new Error('Configure the RENDER_DEPLOY_HOOK repository secret before enabling daily deployment.');
let url;try{url=new URL(hook);}catch{throw new Error('Invalid deploy-hook configuration.');}
if(url.protocol!=='https:'||url.hostname!=='api.render.com'||url.pathname!=='/deploy/srv-dbku1gtbedkc73eilfp0'||url.username||url.password)throw new Error('Deploy hook must target this FINN Render service.');
// Never log the hook, credentials or the Render response body.
let response;try{response=await fetch(url,{method:'POST',signal:AbortSignal.timeout(30000)});}catch{throw new Error('Render deploy-hook request failed.');}
if(!response.ok)throw new Error('Render rejected the deploy request (HTTP '+response.status+').');
console.log('Render accepted the deployment request. Waiting for the exact revision.');
const expected=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),origin=process.env.FINN_HOSTED_ORIGIN||'https://finn-enam-yid1.onrender.com';
for(let attempt=0;attempt<30;attempt++){
 await new Promise(r=>setTimeout(r,10000));
 try{const r=await fetch(origin+'/healthz',{signal:AbortSignal.timeout(10000)});const health=await r.json();if(r.ok&&health.ok&&health.revision===expected){console.log('Verified live revision '+expected);process.exit(0);}}catch{}
}
throw new Error('Expected revision did not become healthy in time. Check Render deployment logs.');
