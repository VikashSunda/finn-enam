import {build} from 'esbuild';
import {mkdir,rm,copyFile} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});
await mkdir('dist/server',{recursive:true});
await mkdir('dist/.openai',{recursive:true});
await build({entryPoints:['worker/index.js'],outfile:'dist/server/index.js',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,loader:{'.html':'text','.css':'text'},plugins:[{name:'client-as-text',setup(b){b.onLoad({filter:/web[\\/]app\.js$/},async args=>({contents:await(await import('node:fs/promises')).readFile(args.path,'utf8'),loader:'text'}));}}]});
await copyFile('.openai/hosting.json','dist/.openai/hosting.json');
console.log('Built FINN worker.');
