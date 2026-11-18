const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ts = require('typescript');
const saved = new Map();
const storage = { getItem: key => saved.get(key), setItem: (key, value) => saved.set(key, value), removeItem: key => saved.delete(key) };
const compile = file => ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const preferences = {};
vm.runInNewContext(compile('features/discovery/filterPreferences.ts'), { exports: preferences, atob, localStorage: storage });
const token = id => 'header.' + Buffer.from(JSON.stringify({ sub: id })).toString('base64url') + '.signature';
function mount(account) {
  const slots = [];
  let index = 0, effects = [];
  const react = {
    useState(initial) { const i = index++; if (!(i in slots)) slots[i] = initial; return [slots[i], next => { slots[i] = typeof next === 'function' ? next(slots[i]) : next; }]; },
    useEffect(effect, deps) { const i = index++; if (!(i in slots) || deps.some((value, n) => value !== slots[i][n])) { slots[i] = deps; effects.push(effect); } },
  };
  const exports = {};
  vm.runInNewContext(compile('hooks/useDiscoverPreferences.ts'), { exports, require: name => name === 'react' ? react : preferences });
  const render = () => { index = 0; effects = []; const output = exports.useDiscoverPreferences(token(account)); effects.forEach(effect => effect()); return output; };
  render();
  return render;
}
const render = mount('one');
let view = render();
assert.equal(view.ready, true);
view.change({ ...view.draft, ageMin: 25, ageMax: 40, maxDistance: 50, interestedIn: 'female', interests: ['Music'], verifiedOnly: true });
view = render();
assert.equal(view.filters.ageMin, 18, 'Draft edits do not alter applied filters');
assert.equal(view.draft.ageMin, 25);
view.apply();
view = render();
assert.equal(view.filters.ageMin, 25);
assert.equal(view.filters.maxDistance, 50);
view.change({ ...view.draft, search: 'Shree', ageMin: 30 });
view = render();
assert.equal(view.filters.search, 'Shree', 'Name search remains live');
assert.equal(view.filters.ageMin, 25, 'Live search does not apply draft age');
const restored = mount('one')();
assert.equal(restored.filters.ageMin, 25, 'Applied settings survive a remount');
assert.equal(restored.filters.interests.length, 0, 'Removed interests filter is not restored');
assert.equal(restored.filters.search, '', 'Transient name searches are not persisted');
assert.equal(mount('two')().filters.ageMin, 18, 'Accounts have isolated preferences');
view.reset();
view = render();
assert.equal(view.filters.ageMin, 18);
assert.equal(view.draft.maxDistance, 10000);
assert.equal(saved.has(preferences.filterPreferenceKey(token('one'))), false);
assert.equal(mount('one')().filters.ageMin, 18, 'Reset survives a remount');
assert.equal(preferences.normalizeFilterPreferences({ ageMin: -99, ageMax: 999 }).ageMin, 18);
assert.equal(preferences.normalizeFilterPreferences({ ageMin: -99, ageMax: 999 }).ageMax, 90);
console.log('Passed: draft/apply separation, live name search, saved preferences, account isolation, explicit reset and stored-value validation.');
