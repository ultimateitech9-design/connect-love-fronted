const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const exportsObject = {};
const source = fs.readFileSync(path.join(__dirname, '../src/features/user/matchFriends.ts'), 'utf8');
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, { exports: exportsObject });
const { matchFriends, clearCachedPresence, onlineMatchFriends } = exportsObject;
const match = (id, peer, extra = {}) => ({
  id, status: 'MATCHED', senderId: 'self', receiverId: peer,
  sender: { id: 'self', name: 'Me' },
  receiver: { id: peer, name: 'Friend ' + peer, isOnline: true, status: 'active', showOnlineStatus: true },
  ...extra,
});
const rows = Array.from({ length: 15 }, (_, i) => match('match-' + i, 'friend-' + i));
rows.push(match('duplicate', 'friend-0'));
rows.push(match('locked', 'locked', { locked: true }));
rows.push(match('pending', 'pending', { status: 'PENDING' }));
rows.push(match('blocked', 'blocked', { status: 'BLOCKED' }));
rows.push(match('stranger', 'stranger', { senderId: 'someone-else' }));
rows.push(match('hidden', 'hidden', { receiver: { id: 'hidden', name: 'Private', isOnline: true, status: 'active', showOnlineStatus: false } }));
rows.push(match('inactive', 'inactive', { receiver: { id: 'inactive', name: 'Inactive', isOnline: true, status: 'banned' } }));
const friends = matchFriends(rows, 'self');
const online = friends.filter(friend => friend.isOnline);
assert.equal(online.length, 15, 'Includes online friends beyond the first nine');
assert.equal(new Set(online.map(friend => friend.userId)).size, online.length);
assert(!online.some(friend => ['locked', 'pending', 'blocked', 'stranger', 'hidden', 'inactive'].includes(friend.userId)));
assert.equal(matchFriends(clearCachedPresence(rows), 'self').filter(friend => friend.isOnline).length, 0, 'Cached/disconnected presence cannot show an online box');
const incoming = match('incoming', 'self', { senderId: 'other', sender: { id: 'other', name: 'Other', isOnline: true, status: 'active' } });
assert.equal(matchFriends([incoming], 'self')[0].userId, 'other');
assert.equal(matchFriends([], 'self').length, 0);
assert.equal(onlineMatchFriends(friends, []).length, 0, 'A stale DB isOnline flag cannot show any friend without a live snapshot');
assert.equal(onlineMatchFriends(friends, ['friend-12']).length, 1);
assert.equal(onlineMatchFriends(friends, ['friend-12'])[0].userId, 'friend-12');
assert.equal(onlineMatchFriends(friends, ['not-a-friend']).length, 0);
console.log('Passed: all matched friends, both directions, deduplication, online-only display, private/inactive/locked/blocked exclusion and stale presence clearing.');
