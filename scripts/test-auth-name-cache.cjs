const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { QueryClient } = require('@tanstack/react-query');

class MemoryStorage {
  values = new Map();
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}
const localStorage = new MemoryStorage(), sessionStorage = new MemoryStorage();
const windowMock = new EventTarget();
Object.assign(windowMock, { localStorage, sessionStorage });
function load(file, mocks, extra = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, { exports, require: name => mocks[name] || require(name), window: windowMock, document: { cookie: '' },
    atob, CustomEvent, AbortController, console, ...extra });
  return exports;
}
const auth = load('src/lib/auth.ts', { '@/config/runtime': { API_ORIGIN: 'http://localhost' } });
const token = id => `header.${Buffer.from(JSON.stringify({ sub: id })).toString('base64url')}.sig`;
const userA = { id: 'account-a', name: 'Previous Account' }, userB = { id: 'account-b', name: 'New Account' };
const effects = [];
const provider = load('src/components/QueryProvider.tsx', {
  react: { useState: init => [typeof init === 'function' ? init() : init], useEffect: fn => effects.push(fn) },
});
const element = provider.QueryProvider({ children: null });
const client = element.props.client;
const cleanups = effects.slice(0, 1).map(fn => fn());
auth.setToken(token(userA.id), userA);
assert.equal(auth.getAuthIdentity().name, userA.name);
client.setQueryData(['current-user', userA.id], userA);
localStorage.setItem('cl_user_name', userA.name);
localStorage.setItem('cl_avatar_url', 'https://example.invalid/old-photo');
auth.clearToken();
assert.equal(auth.getAuthIdentity(), null);
assert.equal(localStorage.getItem('cl_user_name'), null);
assert.equal(localStorage.getItem('cl_avatar_url'), null);
assert.equal(client.getQueryCache().getAll().length, 0, 'logout clears React Query cache');
auth.setToken(token(userB.id), userB);
assert.equal(auth.getAuthIdentity().name, userB.name, 'new name available synchronously at login');
auth.cacheAuthIdentity(userA);
assert.equal(auth.getAuthIdentity().name, userB.name, 'late previous-account results cannot overwrite new identity');
localStorage.setItem('cl_auth_identity', JSON.stringify(userA));
assert.equal(auth.getAuthIdentity(), null, 'mismatched saved identity is never displayed');
auth.setToken(token(userB.id));
assert.equal(auth.getAuthIdentity(), null, 'token-only login cannot reuse previous name');
const hooks = load('src/hooks/useCurrentUser.ts', {
  '@/lib/auth': auth, '@/config/runtime': { API_ORIGIN: 'http://localhost' },
});
assert.notDeepEqual(hooks.currentUserQueryKey(token(userA.id)), hooks.currentUserQueryKey(token(userB.id)), 'profile queries are isolated by account');
cleanups.forEach(fn => fn?.());
client.clear();
console.log('PASS: instant login name, logout cleanup, account-scoped profile cache, legacy cache removal and stale-response protection');
