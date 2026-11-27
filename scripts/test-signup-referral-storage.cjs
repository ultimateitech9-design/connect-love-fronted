const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
function load(file,dependencies={}){
 const context={exports:{},URL,URLSearchParams,process:{env:{}},require:name=>{if(!(name in dependencies))throw new Error('Unexpected import: '+name);return dependencies[name];}};
 const source=fs.readFileSync(path.join(__dirname,'../src/features/referrals',file),'utf8');
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,context);
 return context.exports;
}
const invitation=load('shareInvitation.ts');
const api=load('signupAttribution.ts',{'./shareInvitation':invitation});
const values=new Map(),storage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
assert.equal(api.captureSignupReferral('?ref=ruchi-317935',storage),'ruchi-317935');
assert.equal(api.captureSignupReferral('',storage),'ruchi-317935','reload/navigation cannot lose the invitation');
assert.equal(api.saveSignupReferral(' RUCHI-317935 ',storage),'ruchi-317935');
api.clearSignupReferral(storage);assert.equal(api.captureSignupReferral('',storage),'','successful signup or opt-out clears attribution');
assert.equal(api.saveSignupReferral('not-a-code',storage),'');
assert.equal(api.captureSignupReferral('?referrer=ref%3Druchi-317935',storage),'ruchi-317935','Android-forwarded payload is accepted');
const denied={getItem(){throw new Error('denied')},setItem(){throw new Error('denied')},removeItem(){throw new Error('denied')}};
assert.equal(api.captureSignupReferral('?ref=ruchi-317935',denied),'ruchi-317935','storage denial cannot lose a current URL code');
console.log('PASS: signup code normalization, navigation persistence, Android-forwarded payload, opt-out/success clearing and denied storage.');
