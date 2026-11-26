// Synthetic relationship changes model another device or missed socket events.
// No live accounts or production matches are touched.
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.FRONTEND_TEST_URL || 'http://localhost:3009';
const viewer = randomUUID(), peer = randomUUID(), matchId = randomUUID();
const token = `header.${Buffer.from(JSON.stringify({sub: viewer})).toString('base64url')}.signature`;
const me = {id:viewer,name:'List Viewer',gender:'female',role:'user',plan:'free',status:'active',onboardingCompleted:true,photos:[]};
const member = {id:peer,name:'PK Sync Fixture',age:36,photos:['/connect-love-logo.png'],bio:'List synchronization fixture'};
let state = 'MATCHED', superLike = false, messagesRequests = 0, browser;
const record = () => ({id:matchId,senderId:viewer,receiverId:peer,sender:null,receiver:member,status:state,isSuperLike:superLike,locked:false,createdAt:new Date().toISOString(),lastMessage:'No messages yet.'});
async function run() {
 browser = await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE}:{})});
 const context = await browser.newContext({viewport:{width:1365,height:950}});
 await context.addCookies([{name:'sm_auth',value:'1',url:origin}]);
 await context.addInitScript(({token,viewer})=>{localStorage.setItem('sm_token',token);sessionStorage.setItem(`connect-love:matches-synced:v2:${viewer}`,'1');},{token,viewer});
 const page = await context.newPage();page.setDefaultTimeout(30000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{
  const request=route.request(),url=new URL(request.url()),path=url.pathname.replace(/^\/backend-api/,'');
  if(path.includes('socket.io'))return route.abort();
  if(!['5002','5003'].includes(url.port)&&!url.pathname.startsWith('/backend-api/'))return route.continue();
  const respond=json=>route.fulfill({json,headers:{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'*'}});
  if(request.method()==='OPTIONS')return respond({});
  if(path==='/users/me')return respond(me);
  if(path==='/matches/summary')return respond({active:state==='MATCHED'?1:0,sent:state==='PENDING'?1:0,sentSuper:state==='PENDING'&&superLike?1:0,received:0,blocked:0});
  if(path==='/matches/page'){
   const filter=url.searchParams.get('filter'),kind=url.searchParams.get('kind');
   const include=filter==='active'&&state==='MATCHED'||filter==='sent'&&state==='PENDING'&&(kind==='super')===superLike;
   return respond({items:include?[record()]:[],page:0,pageSize:20,hasMore:false});
  }
  if(path==='/matches'){
   messagesRequests++;
   return respond(state==='MATCHED'?[record()]:[]);
  }
  if(path.startsWith('/messages/'))return respond([]);
  if(path.startsWith('/first-impressions'))return respond({items:[]});
  return respond({items:[],onlineIds:[]});
 });
 const nav=label=>page.getByRole('link',{name:label,exact:true}).first().click();
 const profile=()=>page.getByRole('button',{name:'View profile of PK Sync Fixture',exact:true});
 await page.goto(origin+'/user/matches',{waitUntil:'domcontentloaded'});
 await profile().waitFor();
 await page.getByRole('tab',{name:/Pending Requests/}).click();
 await page.getByText('No sent likes yet.',{exact:true}).waitFor();
 await nav('Messages');await page.getByRole('button').filter({hasText:'PK Sync Fixture'}).first().waitFor();
 const initialRequests=messagesRequests;assert(initialRequests>0,'old once-per-session marker cannot suppress initial sync');
 state='PENDING';
 await nav('Matches');await page.getByText('No active matches yet.',{exact:true}).waitFor();
 await page.getByRole('tab',{name:/Pending Requests/}).click();await profile().waitFor();
 await page.getByRole('tab',{name:/Pending Requests \(1\)/}).waitFor();
 await nav('Messages');
 await page.waitForFunction(()=>document.body.textContent.includes('Select a conversation'));
 await page.getByText('PK Sync Fixture',{exact:true}).waitFor({state:'hidden',timeout:2000});
 assert.equal(await page.getByText('PK Sync Fixture',{exact:true}).count(),0,'old IndexedDB match is removed by the latest empty snapshot');
 assert(messagesRequests>initialRequests,'returning to Messages requests current relationship state');
 state='MATCHED';await nav('Matches');await profile().waitFor();
 await page.getByRole('tab',{name:/Active Matches \(1\)/}).waitFor();
 state='PENDING';superLike=true;
 await page.getByRole('tab',{name:/Pending Requests/}).click();
 await page.getByRole('button',{name:'Super Likes (1)',exact:true}).click();await profile().waitFor();
 assert.deepEqual(errors,[]);
 console.log('PASS: old session markers, stale Messages removal, current active/pending tabs, counts, acceptance and super-like filtering remain consistent without socket events.');
}
run().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();});
