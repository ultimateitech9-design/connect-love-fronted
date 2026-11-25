// Browser test: every member API is intercepted, no real matches are modified.
const assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const viewer=randomUUID(), peer=randomUUID();
const token=`header.${Buffer.from(JSON.stringify({sub:viewer,role:'user',exp:9999999999})).toString('base64url')}.signature`;
const user={id:peer,name:'Profile Member',age:27,photos:['/connect-love-logo.png'],bio:'A sample bio'};
const records={active:{id:randomUUID(),senderId:viewer,receiverId:peer,status:'MATCHED',receiver:user},received:{id:randomUUID(),senderId:peer,receiverId:viewer,status:'PENDING',sender:user},sent:{id:randomUUID(),senderId:viewer,receiverId:peer,status:'PENDING',receiver:user},super:{id:randomUUID(),senderId:viewer,receiverId:peer,status:'PENDING',isSuperLike:true,receiver:user},blocked:{id:randomUUID(),senderId:viewer,receiverId:peer,status:'BLOCKED',receiver:user}};
const details={id:peer,name:'Profile Member',age:27,city:'Jaipur',profession:'Designer',bio:'All about this member',relationshipGoal:'Long term',religion:'Hindu',height:'165 cm',interests:['Music'],hobbies:['Reading'],personality:['Kind'],photos:['/connect-love-logo.png','/apple-touch-icon.png','/connect-love-logo-96.webp'],isVerified:true,showOnlineStatus:false,isOnline:false,distanceKm:null};
let browser, currentPage, opened=0, withdrawals=0, failNext=false;
async function run(){
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 await context.addCookies([{name:'sm_auth',value:'1',domain:'localhost',path:'/'}]);
 await context.addInitScript(value=>{localStorage.setItem('sm_token',value);},token);
 const page=await context.newPage();currentPage=page;page.setDefaultTimeout(30000);
 await page.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url());
  if(url.pathname.includes('socket.io'))return route.abort();
  if(!['5002','5003'].includes(url.port)&&!url.pathname.startsWith('/backend-api/'))return route.continue();
  const path=url.pathname.replace(/^\/backend-api/,'');
  const respond=value=>route.fulfill({json:value,headers:{'Access-Control-Allow-Origin':'http://localhost:3009','Access-Control-Allow-Headers':'*'}});
  if(req.method()==='OPTIONS')return respond({});
  if(path==='/users/me')return respond({id:viewer,name:'Viewer',gender:'female',role:'user',plan:'free',status:'active',onboardingCompleted:true,photos:[]});
  if(path==='/matches')return respond([]);
  if(path==='/matches/summary')return respond({active:1,received:1,sent:2,sentSuper:1,blocked:1});
  if(path==='/matches/page'){const filter=url.searchParams.get('filter');return respond({items:[records[filter==='sent'&&url.searchParams.get('kind')==='super'?'super':filter]],page:0,pageSize:20,hasMore:false});}
  if(/^\/matches\/[^/]+\/profile$/.test(path)){
   opened++;
   if(failNext){return route.fulfill({status:404,json:{message:'This profile is no longer available.'},headers:{'Access-Control-Allow-Origin':'http://localhost:3009'}});}
   const record=Object.values(records).find(row=>path.includes(row.id));assert(record);
   const relationship=record.status==='MATCHED'?'matched':record.status==='BLOCKED'?'blocked':record.senderId===viewer?'pending':'received';
   return respond({matchId:record.id,relationship,isSuperLike:!!record.isSuperLike,since:new Date().toISOString(),profile:details});
  }
  if(path.startsWith('/matches/pending/')){withdrawals++;return respond({success:true});}
  if(path.startsWith('/first-impressions'))return respond({items:[]});
  if(path.includes('profile-visitors'))return respond({items:[],locked:true,hasMore:false});
  return respond({items:[],onlineIds:[]});
 });
 await page.goto('http://localhost:3009/user/matches',{waitUntil:'domcontentloaded'});
 const open=async(label)=>{
  await page.getByRole('button',{name:'View profile of Profile Member',exact:true}).click();
  const dialog=page.getByRole('dialog');await dialog.getByText(label,{exact:true}).waitFor();
  await dialog.getByText('Jaipur',{exact:true}).waitFor();await dialog.getByText('Designer',{exact:true}).waitFor();
  assert.equal(await dialog.getByLabel('View photo 3',{exact:true}).count(),1);
  return dialog;
 };
 console.log('Checking active match profile');
 let dialog=await open('Matched');
 await dialog.getByLabel('Next photo',{exact:true}).click();await dialog.getByAltText('Profile Member — photo 2 of 3',{exact:true}).waitFor();
 await dialog.getByLabel('View photo 3',{exact:true}).click();await dialog.getByAltText('Profile Member — photo 3 of 3',{exact:true}).waitFor();
 await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'detached'});
 assert.equal(await page.getByRole('button',{name:'View profile of Profile Member'}).evaluate(el=>el===document.activeElement),true,'focus returns to the profile button');
 console.log('Checking received like profile');
 await page.getByRole('tab',{name:/Requests Received/}).click();dialog=await open('Like received');await dialog.getByLabel('Close profile').click();
 console.log('Checking pending request profile');
 await page.getByRole('tab',{name:/Pending Requests/}).click();dialog=await open('Request pending');await dialog.getByLabel('Close profile').click();
 await page.getByRole('button',{name:/Super Likes \(/}).click();dialog=await open('Request pending');await dialog.getByText('Super Like',{exact:true}).waitFor();await dialog.getByLabel('Close profile').click();
 const before=opened;await page.getByRole('button',{name:'Delete Super Like',exact:true}).click();assert.equal(withdrawals,1);assert.equal(opened,before,'action buttons do not open profile');
 console.log('Checking blocked profile and mobile view');
 await page.getByRole('tab',{name:/Blocked Users/}).click();dialog=await open('Blocked');assert.equal(await dialog.getByText('Online',{exact:true}).count(),0);
 await page.setViewportSize({width:390,height:844});
 assert(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth+1),'profile fits mobile viewport');await dialog.getByLabel('Close profile').click();
 failNext=true;await page.getByRole('button',{name:'View profile of Profile Member',exact:true}).click();await page.getByRole('dialog').getByText('This profile is no longer available.',{exact:true}).waitFor();
 failNext=false;
 await page.getByRole('dialog').getByRole('button',{name:'Try again',exact:true}).click();await page.getByRole('dialog').getByText('Blocked',{exact:true}).waitFor();
 await page.getByRole('dialog').getByLabel('Close profile').click();
 console.log('PASS: all four tabs plus super likes, gallery controls, details, server statuses, close/Escape/focus, action isolation, mobile width and error retry.');
}
run().catch(async e=>{console.error(e);if(currentPage)console.error('Dialog content:',await currentPage.locator('dialog').allTextContents());process.exitCode=1}).finally(async()=>{await browser?.close()});
