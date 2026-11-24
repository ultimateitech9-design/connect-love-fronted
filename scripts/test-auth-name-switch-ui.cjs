// Browser regression with mocked accounts and deliberately delayed /users/me.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.FRONTEND_TEST_URL || 'http://localhost:3009';
const user = { id: 'name-switch-new-account', name: 'New Account Name', gender: 'female', plan: 'free', role: 'user', status: 'active', onboardingCompleted: true, photos: [] };
const token = `header.${Buffer.from(JSON.stringify({ sub: user.id, role: 'user', exp: 9999999999 })).toString('base64url')}.signature`;

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE } : {}) });
  let releaseProfile;
  let gate = new Promise(resolve => { releaseProfile = resolve; });
  let profilesFinished = 0;
  try {
    const context = await browser.newContext();
    await context.addInitScript(() => {
      if (!sessionStorage.getItem('name-switch-test-seeded')) {
        localStorage.setItem('cl_user_name', 'Previous Account Name');
        localStorage.setItem('cl_auth_identity', JSON.stringify({ id: 'previous-account', name: 'Previous Account Name' }));
        sessionStorage.setItem('name-switch-test-seeded', '1');
      }
      window.oldNameFlashes = 0;
      new MutationObserver(() => {
        if (document.body?.innerText.includes('Previous Account Name')) window.oldNameFlashes++;
      }).observe(document, { subtree: true, childList: true, characterData: true });
    });
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await page.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.pathname.includes('socket.io')) return route.abort();
      if (url.port !== '5002' && !url.pathname.startsWith('/backend-api/')) return route.continue();
      const path = url.pathname.replace(/^\/backend-api/, '');
      const respond = value => route.fulfill({ json: value, headers: { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': '*' } });
      if (route.request().method() === 'OPTIONS') return respond({});
      if (path === '/auth/login') return respond({ access_token: token, user });
      if (path === '/users/me') { await gate; profilesFinished++; return respond(user).catch(() => {}); }
      if (path.includes('profile-visitors')) return respond({ items: [], hasMore: false, locked: true });
      if (path === '/matches' || path.includes('profile-views')) return respond([]);
      if (path.startsWith('/discovery') || path.includes('first-impressions') || path.includes('missed') || path.includes('withdrawals')) return respond({ items: [], hasMore: false });
      return respond({});
    });
    await page.goto(`${origin}/login`, { waitUntil: 'domcontentloaded' });
    await page.locator('#login-email').fill('new-account@example.invalid');
    await page.locator('#login-password').fill('Password123');
    await page.locator('#login-submit-btn').click();
    await page.waitForURL('**/user/discover');
    await page.getByText(user.name, { exact: true }).waitFor({ state: 'visible' });
    assert.equal(profilesFinished, 0, 'login response shows the new name before /users/me returns');
    assert.equal(await page.evaluate(() => window.oldNameFlashes), 0, 'old name never entered the DOM');
    assert.equal(await page.evaluate(() => localStorage.getItem('cl_user_name')), null, 'legacy shared name cache cleared');
    const releasePreviousPage = releaseProfile;
    // Legacy/mismatched storage on reload must show a placeholder, never the old name.
    gate = new Promise(resolve => { releaseProfile = resolve; });
    await page.evaluate(() => {
      localStorage.setItem('cl_auth_identity', JSON.stringify({ id: 'previous-account', name: 'Previous Account Name' }));
      sessionStorage.removeItem('cl_auth_identity');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    releasePreviousPage();
    await page.getByLabel('Loading your name').waitFor();
    assert.equal(await page.evaluate(() => window.oldNameFlashes), 0);
    releaseProfile();
    await page.getByText(user.name, { exact: true }).waitFor({ state: 'visible' });
    assert.equal(await page.evaluate(() => window.oldNameFlashes), 0);
    console.log('PASS: new login name visible before profile response; previous name never flashes, including legacy cache reload');
  } finally { releaseProfile(); await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
