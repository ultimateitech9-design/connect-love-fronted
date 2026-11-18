const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../src/features/discovery/api.ts'), 'utf8');
const exportsObject = {};
let account = 'one', calls = [];
const context = {
  exports: exportsObject, URLSearchParams, DOMException,
  require: name => name === '@/lib/auth' ? { getToken: () => account } : {
    directFetch: async (url, init) => {
      calls.push({ url, init });
      return { items: [{ id: 'test' }], nextCursor: null, hasMore: false };
    },
  },
};
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, context);
(async () => {
  const api = exportsObject;
  await api.searchDiscoveryProfiles({ search: '  ' });
  assert.equal(calls.length, 0, 'No empty search request');
  await api.searchDiscoveryProfiles({ search: ' PK   Dwivedi ' });
  assert.equal(calls.length, 1);
  assert(calls[0].url.includes('compact=true'));
  await api.searchDiscoveryProfiles({ search: 'PK Dwivedi' });
  assert.equal(calls.length, 1, 'Repeated search uses cache');
  account = 'two';
  await api.searchDiscoveryProfiles({ search: 'PK Dwivedi' });
  assert.equal(calls.length, 2, 'Cache is scoped to the signed-in account');
  await api.searchDiscoveryProfiles({ search: 'PK Dwivedi', verifiedOnly: true });
  assert.equal(calls.length, 3, 'Filter changes use a different cache');
  const controller = new AbortController(); controller.abort();
  await assert.rejects(() => api.searchDiscoveryProfiles({ search: 'PK Dwivedi' }, controller.signal), /Aborted/);
  await api.swipeProfile('test', 'pass');
  const before = calls.length;
  await api.searchDiscoveryProfiles({ search: 'PK Dwivedi' });
  assert.equal(calls.length, before + 1, 'Actions invalidate search caches');
  console.log('Passed: blank-request suppression, compact payload request, repeat-search cache, account/filter isolation, cancellation and action invalidation.');
})().catch(error => { console.error(error); process.exitCode = 1; });
