// All signup/OTP requests are mocked. No account or reward is created.
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const origin='http://localhost:3009';let browser,page;const registrations=[];
async function run(){
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE}:{})});
 const context=await browser.newContext();page=await context.newPage();page.setDefaultTimeout(30000);page.setDefaultNavigationTimeout(120000);
 await context.route('**/*',route=>{
  const req=route.request(),url=new URL(req.url()),path=url.pathname;
  if(path.includes('socket.io'))return route.abort();
  if(!['5002','5003'].includes(url.port))return route.continue();
  const respond=(json,status=200)=>route.fulfill({status,json,headers:{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'*'}});
  if(req.method()==='OPTIONS')return respond({});
  if(path==='/auth/register/request-otp')return respond({message:'Mock OTP ready'});
  if(path==='/auth/register'){registrations.push(req.postDataJSON());return respond({message:'Signup request captured for testing'},400);}
  return respond({});
 });
 await page.goto(origin+'/invite/ruchi-317935',{waitUntil:'domcontentloaded'});
 await page.getByRole('heading',{name:"You've been invited!",exact:true}).waitFor();
 assert.equal(await page.getByRole('link',{name:'Register on website',exact:true}).getAttribute('href'),'/register?ref=ruchi-317935');
 const appLink=new URL(await page.getByRole('link',{name:'Download Android app',exact:true}).getAttribute('href'));
 assert.equal(new URLSearchParams(appLink.searchParams.get('referrer')).get('ref'),'ruchi-317935');
 await page.waitForFunction(()=>localStorage.getItem('connect-love:pending-signup-referral')==='ruchi-317935');
 const invitationPage=page;page=await context.newPage();page.setDefaultTimeout(30000);page.setDefaultNavigationTimeout(120000);
 await page.goto(origin+'/register',{waitUntil:'domcontentloaded'});await invitationPage.close();
 const code=page.getByLabel('Invitation code (optional)',{exact:true});await code.waitFor();
 await page.waitForFunction(()=>document.querySelector('#signup-invitation-code')?.value==='ruchi-317935');
 assert.equal(await code.inputValue(),'ruchi-317935','a new tab can recover the invitation after the app-store visit');
 await page.goto(origin+'/register',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('#signup-invitation-code')?.value==='ruchi-317935');
 assert.equal(await code.inputValue(),'ruchi-317935','a navigation without query keeps attribution');
 await page.getByRole('button',{name:'Continue without referral',exact:true}).click();assert.equal(await code.inputValue(),'');
 await code.fill(' RUCHI-317935 ');
 await page.locator('#signup-name').fill('Invited test member');await page.locator('#signup-dob').fill('1995-01-01');
 await page.locator('#signup-email').fill('referral-ui@example.invalid');await page.locator('#signup-gender').selectOption('female');
 await page.locator('#signup-password').fill('TestPassword123!');await page.locator('#signup-agree-terms').check();
 await page.getByRole('button',{name:'Create My Account',exact:true}).click();
 for(let i=1;i<=6;i++)await page.getByLabel(`OTP digit ${i}`,{exact:true}).fill(String(i));
 await page.getByRole('button',{name:'Verify & Continue',exact:true}).click();
 await page.getByText('Signup request captured for testing',{exact:true}).waitFor();
 assert.equal(registrations.length,1);assert.equal(registrations[0].referralCode,'ruchi-317935');assert.equal(registrations[0].gender,'female');assert.equal(registrations[0].otp,'123456');
 console.log('PASS: URL referral survives navigation, explicit removal, manual app code entry and verified-signup payload carry the normalized invitation. APIs mocked.');
}
run().catch(async error=>{console.error(error);if(page)console.error((await page.locator('body').innerText()).slice(-1200));process.exitCode=1}).finally(async()=>{await browser?.close()});
