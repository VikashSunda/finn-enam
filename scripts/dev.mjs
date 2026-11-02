import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
// Run the same bundled Worker under Node; no alternate application backend.
await import('./build.mjs');
const {default:worker}=await import(pathToFileURL(process.cwd()+'/dist/server/index.js'));
const portArg=process.argv.indexOf('--port');
const port=Number(portArg>=0?process.argv[portArg+1]:(process.env.PORT||3000));
createServer(async(req,res)=>{
  try{
    if(req.url==='/_qa/mobile'){
      res.writeHead(200,{'content-type':'text/html'});
      res.end('<!doctype html><title>FINN mobile QA · 390px</title><style>body{margin:0;background:#e5e9e1;display:flex;justify-content:center;padding:15px}iframe{width:390px;height:844px;border:0;background:white;box-shadow:0 5px 25px #253e2520}</style><iframe src="/" title="FINN 390px mobile viewport"></iframe>');
      return;
    }
    const bytes=[];for await(const chunk of req)bytes.push(chunk);
    const request=new Request('http://localhost:'+port+req.url,{method:req.method,headers:req.headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(bytes)})});
    const response=await worker.fetch(request,process.env,{});
    res.writeHead(response.status,Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  }catch(e){res.writeHead(500);res.end('Development server error');console.error(e.message);}
}).listen(port,'0.0.0.0',()=>console.log('FINN listening on '+port));
