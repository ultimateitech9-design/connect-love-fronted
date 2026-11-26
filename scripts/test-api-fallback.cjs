// Runtime API routing regression; all responses are synthetic.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');
const code = ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/config/runtime.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const calls=[];
let respond;
const context={exports:{},URL,Response,AbortController,process:{env:{NEXT_PUBLIC_API_URL:'https://api.connectlove.in'}},window:{location:{origin:'https://connectlove.in',hostname:'connectlove.in',protocol:'https:',port:''}},fetch:async(url,init)=>{calls.push({url,init});return respond(url,init);}};
vm.runInNewContext(code,context);
const api=context.exports.apiFetch;
async function run(){
 respond=()=>Response.json({message:'This request is no longer available.',statusCode:404},{status:404});
 let response=await api('/matches/test/profile');assert.equal(response.status,404);assert.equal((await response.json()).message,'This request is no longer available.');assert.equal(calls.length,1,'domain errors never fall through to the website');
 calls.length=0;respond=url=>url.startsWith('https://api.')?new Response('<html>Not Found</html>',{status:404,headers:{'content-type':'text/html'}}):Response.json({profile:{id:'member'}});
 response=await api('/matches/test/profile');assert.equal(response.status,200);assert.deepEqual(calls.map(call=>call.url),['https://api.connectlove.in/matches/test/profile','https://connectlove.in/backend-api/matches/test/profile']);
 calls.length=0;respond=url=>url.startsWith('https://api.')?Response.json({message:'Cannot GET /matches/test/profile',statusCode:404},{status:404}):Response.json({ok:true});
 assert.equal((await api('/matches/test/profile')).status,200,'a missing deployment route can use the configured proxy');assert.equal(calls.length,2);
 calls.length=0;respond=()=>Response.json({message:'Match request not found.',statusCode:404},{status:404});
 await api('/matches/respond',{method:'POST',body:'{}'});assert.equal(calls.length,1,'failed domain mutation is not replayed at another origin');
 calls.length=0;const controller=new AbortController();controller.abort();respond=()=>{throw new Error('aborted');};
 await assert.rejects(api('/matches/test/profile',{signal:controller.signal}),/aborted/);assert.equal(calls.length,1,'cancelled modal requests cannot continue against another origin');
 console.log('PASS: authoritative JSON errors, correct same-origin backend proxy, route fallback, mutation non-replay and request cancellation.');
}
run().catch(error=>{console.error(error);process.exitCode=1});
