const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const file = path.join(__dirname, '../src/features/referrals/shareInvitation.ts');
const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const context = { exports: {}, URL, process: { env: {} } };
vm.runInNewContext(js, context);
const { referralShareLink, referralInvitationText } = context.exports;
const code = 'b67dd47a922f18cb3f6563e6';
const sharePath = `/register?ref=${code}`;
const expected = `https://connectlove.in${sharePath}`;
for (const origin of ['', 'invalid', 'http://localhost:3009', 'https://localhost:3009', 'https://127.0.0.1', 'https://192.168.1.5', 'https://10.0.0.5', 'https://172.16.0.1', 'https://[::1]']) {
  assert.equal(referralShareLink(sharePath, origin), expected);
}
assert.equal(referralShareLink(`http://localhost:3009${sharePath}`, ''), expected, 'old absolute local paths retain their referral code');
assert.equal(referralShareLink(sharePath, 'https://staging.connectlove.in'), `https://staging.connectlove.in${sharePath}`);
const text = referralInvitationText(expected);
assert(text.includes('₹100 each'));
assert(text.endsWith(`\n\n${expected}`));
assert.equal((text.match(/https:\/\//g) || []).length, 1);
assert(!text.includes('localhost'));
console.log('PASS: public referral URLs, local/private fallbacks, code preservation and one complete message + link payload.');
