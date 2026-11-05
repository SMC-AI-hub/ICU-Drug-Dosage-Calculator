/* Persistent screenshot/probe driver. */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import wsPkg from '/home/user/node_modules/ws/index.js';
const { WebSocket } = wsPkg;

const [, , url, outdir, recipeJson] = process.argv;
const recipe = JSON.parse(recipeJson);
mkdirSync(outdir, { recursive: true });
const profile = '/tmp/chrome-profile';
rmSync(profile, { recursive: true, force: true });
const chrome = spawn('chromium', ['--headless=new','--no-sandbox','--disable-gpu','--hide-scrollbars',
  '--remote-debugging-port=9230',`--user-data-dir=${profile}`,'--no-first-run','--disable-dev-shm-usage','about:blank'],
  { stdio: ['ignore','ignore','pipe'] });
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function targetWs(){ for(let i=0;i<60;i++){ try{
  const l = await (await fetch('http://127.0.0.1:9230/json/list')).json();
  const p = l.find(t=>t.type==='page'); if(p?.webSocketDebuggerUrl) return p.webSocketDebuggerUrl;
 }catch{} await sleep(250);} throw new Error('no chromium target'); }
const ws = new WebSocket(await targetWs());
await new Promise((res,rej)=>{ws.on('open',res);ws.on('error',rej);});
let seq=0; const pending=new Map();
ws.on('message', raw=>{ const m=JSON.parse(raw.toString());
  if(m.id&&pending.has(m.id)){const{resolve,reject}=pending.get(m.id);pending.delete(m.id);
    m.error?reject(new Error(JSON.stringify(m.error))):resolve(m.result);} });
function send(method,params={}){ const id=++seq; return new Promise((resolve,reject)=>{
  pending.set(id,{resolve,reject}); ws.send(JSON.stringify({id,method,params}));
  setTimeout(()=>{if(pending.has(id)){pending.delete(id);reject(new Error('timeout '+method));}},30000);});}
async function evaluate(expression){ const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
  if(r.exceptionDetails) throw new Error('eval: '+(r.exceptionDetails.exception?.description??JSON.stringify(r.exceptionDetails)));
  return r.result?.value; }
async function shot(name){ const{data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  writeFileSync(`${outdir}/${name}.png`,Buffer.from(data,'base64')); console.log('  saved',name); }
await send('Page.enable'); await send('Runtime.enable');
const errors=[];
ws.on('message',raw=>{const m=JSON.parse(raw.toString());
  if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description??'exception');
  if(m.method==='Log.entryAdded'&&m.params.entry.level==='error')errors.push(m.params.entry.text);});
await send('Log.enable').catch(()=>{});
for(const step of recipe){
  console.log('#',step.name);
  await send('Emulation.setDeviceMetricsOverride',{width:step.w,height:step.h,deviceScaleFactor:step.dsf??2,mobile:!!step.mobile});
  await send('Page.navigate',{url}); await sleep(step.load??2000);
  for(const s of step.steps??[]){
    if(s.wait) await sleep(s.wait);
    if(s.eval){ const v=await evaluate(s.eval); if(v!==undefined&&v!==null) console.log('   ->',typeof v==='string'?v:JSON.stringify(v)); }
    if(s.shot) await shot(s.shot);
  }
  console.log('  errors:',errors.length?errors:'none'); errors.length=0;
}
ws.close(); chrome.kill('SIGKILL'); process.exit(0);
