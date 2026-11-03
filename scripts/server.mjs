import {createServer} from 'node:http';
import {pathToFileURL} from 'node:url';

// Production adapter for the same bundled application used locally.
export function createAppServer(worker,env=process.env){
  const server=createServer(async(req,res)=>{
    try{
      const url=new URL(req.url,'https://finn-hosted.invalid');
      if(url.pathname==='/healthz'){
        res.writeHead(200,{'content-type':'application/json','cache-control':'no-store'});
        res.end(req.method==='HEAD'?undefined:JSON.stringify({ok:true,service:'finn',revision:env.RENDER_GIT_COMMIT||null}));return;
      }
      const bytes=[];let size=0;
      for await(const chunk of req){size+=chunk.length;if(size>16384){res.writeHead(413,{'content-type':'application/json'});res.end('{"error":"Request too large"}');return;}bytes.push(chunk);}
      const request=new Request(url,{method:req.method,headers:req.headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(bytes)})});
      const response=await worker.fetch(request,{...env,FINN_HOSTED:'1'},{});
      res.writeHead(response.status,Object.fromEntries(response.headers));
      res.end(req.method==='HEAD'?undefined:Buffer.from(await response.arrayBuffer()));
    }catch{if(!res.headersSent)res.writeHead(500,{'content-type':'application/json','cache-control':'no-store'});res.end('{"error":"Server request failed. Please retry."}');}
  });
  server.requestTimeout=180000;server.headersTimeout=30000;
  return server;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const {default:worker}=await import('../dist/server/index.js');
  const port=Number(process.env.PORT||3000);
  if(!Number.isInteger(port)||port<1||port>65535)throw new Error('PORT must be a valid TCP port.');
  const server=createAppServer(worker);
  server.listen(port,'0.0.0.0',()=>console.log('FINN production server listening on '+port));
  for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>{server.close(()=>process.exit(0));setTimeout(()=>process.exit(1),10000).unref();});
}
