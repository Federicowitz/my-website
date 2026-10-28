const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {webcrypto} = require('node:crypto');
const folder = path.resolve(__dirname, '../teaching/materials/crittografia');
// Exercise the same implementation loaded by the browser, using Node's Web Crypto.
const context = {TextEncoder, TextDecoder, crypto: webcrypto, module: {exports: {}}};
vm.runInNewContext(fs.readFileSync(path.join(folder, 'crypto-core.js'), 'utf8'), context);
const api = context.module.exports;
const decode = value => value.replaceAll('&gt;', '>').replaceAll('&lt;', '<').replaceAll('&amp;', '&');
async function main() {
  assert.equal(api.caesar('CIAO, MONDO!', 3), 'FLDR, PRQGR!');
  assert.equal(api.caesar('ZAINO', 3), 'CDLQR');
  const original = 'Zz Aa, città! 0123 🙂';
  for (let k = -53; k <= 53; k++) assert.equal(api.caesar(api.caesar(original, k), -k), original);
  assert.equal(api.caesar('CIAO', 29), api.caesar('CIAO', 3));
  assert.throws(() => api.caesar('A', 1.5));
  assert.equal(api.frequencies('aAb! è')[0].count, 2);
  assert.equal(api.frequencies('!🙂').length, 0);
  assert.equal(await api.sha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.notEqual(await api.sha256('abc'), await api.sha256('abc\n'));
  assert.throws(() => api.fromHex('f'));
  assert.throws(() => api.fromHex('gg'));
  assert.equal(api.hex(api.fromHex('00abFF')), '00abff');
  const key = await api.newAesKey();
  const text = 'Importo: 100 €. Città e simboli 🙂';
  const encrypted = await api.encrypt(key, text, 'contratto-001');
  assert.equal(key.extractable, false);
  assert.equal(encrypted.iv.length, 12);
  assert.equal(encrypted.data.length, new TextEncoder().encode(text).length + 16);
  assert.equal(await api.decrypt(key, encrypted.iv, encrypted.data, 'contratto-001'), text);
  for (const index of [0, encrypted.data.length - 1]) {
    const altered = new Uint8Array(encrypted.data); altered[index] ^= 1;
    await assert.rejects(() => api.decrypt(key, encrypted.iv, altered, 'contratto-001'));
  }
  await assert.rejects(() => api.decrypt(key, encrypted.iv, encrypted.data, 'contratto-002'));
  const wrongIv = new Uint8Array(encrypted.iv); wrongIv[0] ^= 1;
  await assert.rejects(() => api.decrypt(key, wrongIv, encrypted.data, 'contratto-001'));
  const wrongKey = await api.newAesKey();
  await assert.rejects(() => api.decrypt(wrongKey, encrypted.iv, encrypted.data, 'contratto-001'));
  const empty = await api.encrypt(key, '');
  assert.equal(await api.decrypt(key, empty.iv, empty.data), '');
  const keys = await api.newSigningKeys(), otherKeys = await api.newSigningKeys();
  const signature = await api.sign(keys.privateKey, text);
  assert.equal(keys.privateKey.extractable, false);
  assert.equal(await api.verify(keys.publicKey, signature, text), true);
  assert.equal(await api.verify(keys.publicKey, signature, text + '!'), false);
  assert.equal(await api.verify(otherKeys.publicKey, signature, text), false);
  const damagedSignature = new Uint8Array(signature); damagedSignature[0] ^= 1;
  assert.equal(await api.verify(keys.publicKey, damagedSignature, text), false);
  // Run the modular exponentiation actually printed in the exercise page.
  const exercise = fs.readFileSync(path.join(folder, 'esercizi.html'), 'utf8');
  const code = decode(exercise.match(/<pre><code>([\s\S]*?)<\/code><\/pre>/)[1]);
  const maths = {console: {log() {}}}; vm.createContext(maths); vm.runInContext(code, maths);
  const power = maths.potenzaModulare;
  assert.equal(power(65n, 17n, 3233n), 2790n);
  assert.equal(power(2790n, 2753n, 3233n), 65n);
  assert.equal(power(5n, 6n, 23n), 8n);
  assert.equal(power(5n, 15n, 23n), 19n);
  assert.equal(power(19n, 6n, 23n), 2n);
  assert.equal(power(8n, 15n, 23n), 2n);
  const quiz = {window: {}};
  const quizHTML = fs.readFileSync(path.join(folder, 'test.html'), 'utf8');
  vm.runInNewContext(quizHTML.match(/<script>\s*(window.quizData=[\s\S]*?)<\/script>/)[1], quiz);
  assert.equal(quiz.window.quizData.questions.length, 20);
  for (const [question, options, answer, explanation] of quiz.window.quizData.questions) {
    assert.ok(question && explanation); assert.ok(Number.isInteger(answer) && answer >= 0 && answer < options.length);
    assert.equal(new Set(options).size, options.length);
  }
  // Check deep links as well as files: the general repository check ignores fragments.
  for (const filename of fs.readdirSync(folder).filter(file => file.endsWith('.html'))) {
    const html = fs.readFileSync(path.join(folder, filename), 'utf8');
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(ids).size, ids.length, 'Duplicate anchor in ' + filename);
    for (const [, file, anchor] of html.matchAll(/href="([^"#]*\.html)?#([^"#]+)"/g)) {
      const target = fs.readFileSync(path.resolve(folder, file || filename), 'utf8');
      assert.ok(target.includes(`id="${anchor}"`), `${filename}: missing ${file || filename}#${anchor}`);
    }
  }
  console.log('OK: cifrari, vettore SHA-256, autenticazione GCM, firme, esempi RSA/DH, 20 domande e ancore del percorso.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
