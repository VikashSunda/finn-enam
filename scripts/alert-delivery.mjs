import {createServer} from 'node:http';
import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {timestamp,makeAlerts} from '../worker/core.js';
const dir='.cache/alert-delivery';let config={enabled:false,priceThreshold:4,volumeThreshold:2,categories:[],tickers:[]},seen=new Set(),initialised=false,lastCheck=null,lastDelivery=null,lastError=null;
async function persist(name,value){await mkdir(dir,{recursive:true});await writeFile(dir+'/'+name+'.tmp',JSON.stringify(value,null,2));await rename(dir+'/'+name+'.tmp',dir+'/'+name+'.json');}
export function validateConfig(value){
 if(typeof value.enabled!=='boolean'||!Number.isFinite(value.priceThreshold)||value.priceThreshold<.1||value.priceThreshold>50||!Number.isFinite(value.volumeThreshold)||value.volumeThreshold<1||value.volumeThreshold>20||!Array.isArray(value.tickers)||!value.tickers.length||value.tickers.length>25||value.tickers.some(t=>typeof t!=='string'||!/^[A-Z0-9][A-Z0-9&-]{0,24}$/.test(t))||!Array.isArray(value.categories)||value.categories.length>20||value.categories.some(c=>typeof c!=='string'||!['results','management_change','M&A','litigation','fund_raise','credit_rating','capex','pledging','earnings_call','dividend','bonus_split','press_release'].includes(c)))throw new Error('Invalid delivery rules');
 return {enabled:value.enabled,priceThreshold:value.priceThreshold,volumeThreshold:value.volumeThreshold,tickers:[...new Set(value.tickers)],categories:[...new Set(value.categories)]};
}
export function deliveryEvents(rows,rules,now=Date.now()){
 const selected=rows.filter(r=>rules.tickers.includes(r.ticker));
 const prices=Object.fromEntries(selected.filter(r=>r.price.mode==='live').map(r=>[r.ticker,r.price]));
 const market=makeAlerts(prices,rules).map(a=>({...a,id:a.ticker+':'+a.type+':'+a.date,text:a.ticker+' '+(a.type==='price'?a.value.toFixed(2)+'% price move':a.value.toFixed(2)+'x volume')+' ('+a.date+')'}));
 const filings=selected.filter(r=>r.filings.mode==='live').flatMap(r=>r.filings.items.filter(f=>f.priority!=='routine'&&rules.categories.includes(f.category)&&timestamp(f.date)>=now-86400000&&timestamp(f.date)<=now).map(f=>({id:r.ticker+':filing:'+f.id,text:r.ticker+': '+f.headline})));
 return [...market,...filings];
}
export async function startDeliveryControl(){
 try{config=validateConfig(JSON.parse(await readFile(dir+'/config.json','utf8')));}catch{}
 try{const state=JSON.parse(await readFile(dir+'/state.json','utf8'));seen=new Set(state.seen);initialised=state.initialised;}catch{}
 const server=createServer(async(req,res)=>{
  const reply=(data,status=200)=>{res.writeHead(status,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(data));};
  try{
   if(req.url!=='/config'||req.headers['x-finn-local']!=='1')return reply({error:'Not found'},404);
   if(req.method==='POST'){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>5000)return reply({error:'Too large'},413);}const body=JSON.parse(raw);if(body.action==='test'){if(!config.enabled)return reply({error:'Enable and save desktop delivery first.'},409);await notify('FINN desktop delivery is connected. New portfolio alerts will appear here while the local monitor runs.');return reply({ok:true,note:'Test sent to Windows. Check your notification settings if it is not visible.'});}const next=validateConfig(body);config=next;initialised=false;seen.clear();await persist('config',config);await persist('state',{seen:[],initialised:false});}
   else if(req.method!=='GET')return reply({error:'Method not allowed'},405);
   reply({available:true,config,lastCheck,lastDelivery,lastError,platform:process.platform,intervalMinutes:15});
  }catch(error){reply({error:error.message},400);}
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(3003,'127.0.0.1',resolve);});console.log('Local alert delivery control listening on 127.0.0.1:3003');
}
async function notify(message){
 if(process.platform!=='win32')throw new Error('Desktop delivery currently supports Windows only');
 const script=`Add-Type -AssemblyName System.Windows.Forms; Add-Type -AssemblyName System.Drawing; $text=[Console]::In.ReadToEnd(); $icon=New-Object System.Windows.Forms.NotifyIcon; $icon.Icon=[System.Drawing.SystemIcons]::Information; $icon.Visible=$true; $icon.ShowBalloonTip(7000,'FINN portfolio alerts',$text,[System.Windows.Forms.ToolTipIcon]::Info); Start-Sleep -Seconds 8; $icon.Dispose()`;
 await new Promise((resolve,reject)=>{const child=spawn('powershell.exe',['-NoProfile','-NonInteractive','-Command',script],{windowsHide:true,stdio:['pipe','ignore','pipe']});let error='';child.stderr.on('data',b=>error+=b.toString());child.once('error',reject);child.once('exit',code=>code===0?resolve():reject(new Error(error.slice(0,250)||'Windows notification failed')));child.stdin.end(message);});
}
export function pendingDelivery(events,seen,initialised){return initialised?events.filter(e=>!seen.has(e.id)):[];}
export function deliveryTickers(){return config.enabled?config.tickers:[];}
export async function processDelivery(rows){
 lastCheck=new Date().toISOString();if(!config.enabled)return;
 const events=deliveryEvents(rows,config),fresh=pendingDelivery(events,seen,initialised);
 if(!initialised){for(const e of events)seen.add(e.id);initialised=true;await persist('state',{seen:[...seen],initialised});console.log('Alert delivery baseline saved; historical alerts suppressed.');return;}
 if(!fresh.length)return;
 try{await notify(fresh.slice(0,4).map(e=>e.text.slice(0,160)).join('\n')+(fresh.length>4?'\n+'+(fresh.length-4)+' more. Open FINN Alerts.':''));for(const e of fresh)seen.add(e.id);lastDelivery=new Date().toISOString();lastError=null;await persist('state',{seen:[...seen].slice(-5000),initialised});await persist('last-delivery',{at:lastDelivery,events:fresh});}
 catch(error){lastError=error.message;console.error('Alert delivery: '+lastError);}
}
