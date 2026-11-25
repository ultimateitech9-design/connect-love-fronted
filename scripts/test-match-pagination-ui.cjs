// Browser regression with synthetic API responses; no real user data is changed.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.FRONTEND_TEST_URL || 'http://localhost:3009';
const user = { id: 'pagination-viewer', name: 'Pagination Viewer', gender: 'female', plan: 'free', status: 'active', onboardingCompleted: true, photos: [], walletBalance: 0 };
const token = `header.${Buffer.from(JSON.stringify({ sub: user.id })).toString('base64url')}.signature`;
const summary = { active: 1, received: 1005, sent: 47, sentSuper: 23, blocked: 1 };

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE } : {}) });
  try {
    const context = await browser.newContext({ viewport: { width: 1365, height: 900 } });
    await context.addCookies([{ name: 'sm_auth', value: '1', url: origin }]);
    await context.addInitScript(value => localStorage.setItem('sm_token', value), token);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    const requests = [], errors = [];
    let failReceivedPage2 = false;
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.pathname.includes('socket.io')) return route.abort();
      if (url.port !== '5002' && !url.pathname.startsWith('/backend-api/')) return route.continue();
      const path = url.pathname.replace(/^\/backend-api/, '');
      const respond = value => route.fulfill({ json: value, headers: { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': '*' } });
      if (route.request().method() === 'OPTIONS') return respond({});
      if (path === '/users/me') return respond(user);
      if (path === '/matches/summary') return respond(summary);
      if (path === '/matches/page') {
        requests.push(url.search);
        const filter = url.searchParams.get('filter');
        const pageIndex = Number(url.searchParams.get('page'));
        const kind = url.searchParams.get('kind');
        if (failReceivedPage2 && filter === 'received' && pageIndex === 2) return route.fulfill({ status: 503, json: { message: 'Synthetic API failure' }, headers: { 'Access-Control-Allow-Origin': origin } });
        const count = filter === 'received' ? 1005 : filter === 'sent' ? (kind === 'super' ? 23 : 24) : 1;
        const items = Array.from({ length: Math.max(0, Math.min(20, count - pageIndex * 20)) }, (_, index) => {
          const id = `${filter}-${kind}-${pageIndex * 20 + index}`;
          const peer = { id, name: `Profile ${id}`, age: 28, bio: 'Pagination fixture', photos: [] };
          return { id, senderId: filter === 'received' ? id : user.id, receiverId: filter === 'received' ? user.id : id,
            sender: filter === 'received' ? peer : null, receiver: filter === 'received' ? null : peer,
            status: filter === 'active' ? 'MATCHED' : filter === 'blocked' ? 'BLOCKED' : 'PENDING',
            isSuperLike: kind === 'super', locked: false, createdAt: new Date().toISOString() };
        });
        return respond({ items, page: pageIndex, pageSize: 20, hasMore: (pageIndex + 1) * 20 < count });
      }
      if (path === '/matches') return respond([]);
      if (path.includes('first-impressions') || path.includes('/missed') || path.includes('withdrawals')) return respond({ items: [] });
      return respond({});
    });
    const panel = () => page.getByRole('tabpanel');
    const tab = name => page.getByRole('tab', { name: new RegExp(name) });
    const expectCards = count => panel().getByText('Pagination fixture', { exact: true }).count().then(actual => assert.equal(actual, count));
    await page.goto(`${origin}/user/matches`, { waitUntil: 'domcontentloaded' });
    await panel().getByText('Profile active-null-0', { exact: false }).waitFor();
    assert.ok(requests.every(search => new URLSearchParams(search).get('filter') === 'active'), 'unopened tabs never fetched');
    await tab('Requests Received').click();
    await panel().getByText('Profile received-null-0,', { exact: false }).waitFor();
    await expectCards(20);
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await panel().getByText('Profile received-null-20,', { exact: false }).waitFor();
    await expectCards(20);
    const activeBefore = requests.filter(search => new URLSearchParams(search).get('filter') === 'active').length;
    await tab('Active Matches').click();
    await panel().getByText('Profile active-null-0,', { exact: false }).waitFor();
    assert.equal(requests.filter(search => new URLSearchParams(search).get('filter') === 'active').length, activeBefore, 'fresh tab cache avoids refetch');
    await tab('Requests Received').click();
    await panel().getByText('Profile received-null-20,', { exact: false }).waitFor();
    assert.equal(await page.getByText('Page 2', { exact: true }).count(), 1, 'each tab retains its page');
    await tab('Pending Requests').click();
    await panel().getByText('Profile sent-normal-0,', { exact: false }).waitFor();
    await page.getByRole('button', { name: 'Super Likes (23)', exact: true }).click();
    await panel().getByText('Profile sent-super-0,', { exact: false }).waitFor();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await panel().getByText('Profile sent-super-20,', { exact: false }).waitFor();
    await expectCards(3);
    assert.equal(await page.getByRole('button', { name: 'Next', exact: true }).isDisabled(), true);
    await tab('Requests Received').click();
    await panel().getByText('Profile received-null-20,', { exact: false }).waitFor();
    failReceivedPage2 = true;
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('button', { name: 'Retry', exact: false }).waitFor();
    failReceivedPage2 = false;
    await page.getByRole('button', { name: 'Retry', exact: false }).click();
    await panel().getByText('Profile received-null-40,', { exact: false }).waitFor();
    await expectCards(20);
    const beforeDirect = requests.length;
    await page.goto(`${origin}/user/matches?tab=received`, { waitUntil: 'domcontentloaded' });
    await panel().getByText('Profile received-null-0,', { exact: false }).waitFor();
    assert.ok(requests.slice(beforeDirect).every(search => new URLSearchParams(search).get('filter') === 'received'), 'direct received link never loads the active dashboard tab');
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'mobile page has no horizontal overflow');
    assert.deepEqual(errors, [], 'no browser runtime errors');
    console.log('PASS: lazy tabs, 20-card pages, cache reuse, tab page memory, super-like filtering, error recovery, direct links and mobile layout');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
