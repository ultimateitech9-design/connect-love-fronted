const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { EventEmitter } = require('node:events');
const { QueryClient } = require('@tanstack/react-query');

const queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } });
const token = `header.${Buffer.from(JSON.stringify({ sub: 'receiver' })).toString('base64')}.sig`;
const socket = new EventEmitter();
socket.connected = true;
socket.timeout = () => ({ emit() {} });
socket.disconnect = () => { socket.connected = false; socket.emit('disconnect'); };
let connects = 0;
socket.connect = () => { connects++; };
const timers = new Map();
const listeners = new Map();
const windowMock = {
  setInterval(fn, ms) { timers.set(ms, fn); return ms; },
  clearInterval(ms) { timers.delete(ms); },
  addEventListener(name, fn) { listeners.set(name, fn); },
  removeEventListener(name) { listeners.delete(name); },
};
let effect;
const exportsObject = {};
const mocks = {
  react: { useEffect(fn) { effect = fn; } },
  '@tanstack/react-query': { useQueryClient: () => queryClient },
  'socket.io-client': { io: () => socket },
  '@/config/runtime': { socketConnectionOptions: () => ({ origin: 'http://localhost', options: {} }) },
  '@/lib/auth': { getToken: () => token },
  '@/features/user/matchFriends': { clearCachedPresence: x => x },
  '@/features/matches/liveNotifications': { liveLikesKey: id => ['live-likes', id] },
};
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/components/GlobalPresence.tsx'), 'utf8');
vm.runInNewContext(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, {
  exports: exportsObject, require: name => {
    assert.ok(mocks[name], `Unexpected import ${name}`); return mocks[name];
  }, window: windowMock, navigator: { onLine: true }, atob: value => Buffer.from(value, 'base64').toString(), console,
});
exportsObject.GlobalPresence();
const cleanup = effect();
let syncs = 0;
queryClient.invalidateQueries = () => { syncs++; return Promise.resolve(); };
const like = { id: 'like-1', senderId: 'sender', receiverId: 'receiver', status: 'PENDING', createdAt: new Date().toISOString() };
socket.emit('matchChanged', like);
assert.equal(queryClient.getQueryData(['live-likes', 'receiver'])[0].id, like.id, 'bell data available synchronously without an API response');
socket.emit('matchChanged', like);
assert.equal(queryClient.getQueryData(['live-likes', 'receiver']).length, 1, 'duplicate events count once');
socket.emit('matchChanged', { ...like, id: 'stranger', senderId: 'other', receiverId: 'someone-else' });
assert.equal(queryClient.getQueryData(['live-likes', 'receiver']).length, 1, 'unrelated events ignored');
queryClient.setQueryData(['matches', 'received'], [like]);
socket.emit('matchChanged', { ...like, status: 'DELETED' });
assert.equal(queryClient.getQueryData(['live-likes', 'receiver']).length, 0);
assert.equal(queryClient.getQueryData(['matches', 'received']).length, 0, 'withdrawn like removed immediately');
queryClient.setQueryData(['matches', 'dashboard-page', 'receiver'], { items: [], hasMore: false });
queryClient.setQueryData(['matches', 'summary', 'receiver'], { active: 1, received: 2 });
socket.emit('USER_STATUS_CHANGED', { userId: 'sender', isOnline: true });
assert.equal(queryClient.getQueryData(['matches', 'summary', 'receiver']).received, 2, 'presence handlers safely preserve object-shaped page and summary caches');
socket.emit('presenceReady');
let before = syncs;
timers.get(5000)();
assert.equal(syncs, before, 'no REST polling while socket is ready');
socket.disconnect();
timers.get(5000)();
assert.equal(syncs, before + 1, 'REST fallback while disconnected');
listeners.get('online')();
assert.equal(connects, 1, 'network restoration reconnects');
before = syncs;
socket.connected = true;
socket.emit('presenceReady');
assert.equal(syncs, before + 1, 'reconnect reconciles missed events after room join');
cleanup();
assert.equal(timers.size, 0, 'timers cleaned up');
queryClient.clear();
console.log('PASS: immediate bell data, deduplication, room filtering, withdrawal, fallback and reconnection');

const runtimeExports = {};
const runtime = fs.readFileSync(require('node:path').join(__dirname, '../src/config/runtime.ts'), 'utf8');
vm.runInNewContext(ts.transpileModule(runtime, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, {
  exports: runtimeExports, process: { env: { NEXT_PUBLIC_SOCKET_URL: 'https://connectlove.in/backend-api' } }, URL,
});
const config = runtimeExports.socketConnectionOptions();
assert.equal(config.origin, 'https://connectlove.in');
assert.equal(config.options.path, '/backend-api/socket.io');
assert.equal(config.options.tryAllTransports, true);
assert.equal(config.options.reconnection, true);
console.log('PASS: proxied socket path and transport fallback configuration');
