// Offline hook regression checks using a minimal effect/state runner.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/hooks/useDiscovery.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const pause = () => new Promise(resolve => setTimeout(resolve, 50));
const token = id => 'header.' + Buffer.from(JSON.stringify({ sub: id })).toString('base64url') + '.signature';
const profile = id => ({ id: String(id), photos: ['test-photo'], photoCount: 1 });
function mount(api, account = 'one', saved = new Map()) {
  const slots = [], cleanup = new Map();
  let index = 0, effects = [], scheduled = false, stopped = false, output;
  const schedule = () => { if (!scheduled && !stopped) { scheduled = true; queueMicrotask(() => { scheduled = false; if (!stopped) render(); }); } };
  const react = {
    useState(initial) {
      const i = index++;
      if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial;
      return [slots[i], next => { const value = typeof next === 'function' ? next(slots[i]) : next; if (!Object.is(value, slots[i])) { slots[i] = value; schedule(); } }];
    },
    useRef(initial) { const i = index++; if (!(i in slots)) slots[i] = { current: initial }; return slots[i]; },
    useEffect(effect, deps) {
      const i = index++;
      if (!(i in slots) || deps.some((value, n) => !Object.is(value, slots[i][n]))) {
        slots[i] = deps; effects.push(() => { cleanup.get(i)?.(); cleanup.set(i, effect()); });
      }
    },
  };
  const exports = {};
  const context = {
    exports, require: name => name === 'react' ? react : name === 'sonner' ? { toast: { error() {} } } : {
      getDiscoveryProfiles: api, getDiscoveryProfileDetails: async () => ({}),
      swipeProfile: async () => ({}), undoSwipeProfile: async () => ({}),
    },
    console: { warn() {} }, AbortController, atob, setTimeout: (fn, ms) => setTimeout(fn, Math.min(ms, 10)), clearTimeout,
    sessionStorage: { getItem: key => saved.get(key), setItem: (key, value) => saved.set(key, value), removeItem: key => saved.delete(key) },
    window: { setTimeout, clearTimeout, location: {} },
  };
  vm.runInNewContext(code, context);
  function render() { index = 0; effects = []; output = exports.useDiscovery(token(account), {}); const pending = effects; pending.forEach(effect => effect()); }
  render();
  return { get value() { return output; }, saved, stop() { stopped = true; for (const clean of cleanup.values()) clean?.(); } };
}
(async () => {
  const calls = [];
  const run = mount(async filters => {
    calls.push(filters);
    return { items: Array.from({ length: filters.limit }, (_, i) => profile(calls.length * 100 + i)), hasMore: true, nextCursor: String(calls.length) };
  });
  await pause();
  assert.equal(calls[0].limit, 4);
  assert.equal(run.value.profiles.length, 24);
  assert.equal(run.value.error, false);
  const saved = run.saved;
  run.stop();
  const pendingRequest = (_, signal) => new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(Error('Aborted')), { once: true }));
  const cached = mount(pendingRequest, 'one', saved);
  await pause();
  assert(cached.value.profiles.length > 0, 'Cached profiles paint before the network resolves');
  cached.stop();
  const other = mount(pendingRequest, 'two', saved);
  await pause();
  assert.equal(other.value.profiles.length, 0, 'Cache does not leak to another account');
  other.stop();
  let legacyCalls = 0;
  const legacy = mount(async () => ++legacyCalls === 1 ? [profile('legacy')] : []);
  await pause();
  assert.equal(legacy.value.profiles[0].id, 'legacy');
  assert.equal(legacy.value.error, false, 'Old array responses are supported');
  legacy.stop();
  let attempts = 0;
  const retry = mount(async () => { if (++attempts <= 2) throw Error('Temporary outage'); return { items: [profile('recovered')], hasMore: false }; });
  await pause();
  assert.equal(retry.value.profiles[0].id, 'recovered');
  assert.equal(retry.value.error, false);
  retry.stop();
  console.log('Passed: 4-card initial fetch, 24-card prefetch, immediate cache, account isolation, legacy API response and automatic retries.');
})().catch(error => { console.error(error); process.exitCode = 1; });
