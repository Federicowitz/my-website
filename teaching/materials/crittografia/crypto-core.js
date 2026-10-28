/* Shared by the teaching controls and the executable cryptography checks. */
(() => {
  'use strict';
  const bytes = text => new TextEncoder().encode(text);
  const hex = data => Array.from(new Uint8Array(data), b => b.toString(16).padStart(2, '0')).join('');
  function fromHex(value) {
    const clean = value.trim();
    if (!clean || clean.length % 2 || !/^[0-9a-f]+$/i.test(clean)) {
      throw new Error('Inserisci una sequenza esadecimale non vuota con due cifre per byte.');
    }
    return Uint8Array.from(clean.match(/../g), pair => parseInt(pair, 16));
  }
  function caesar(text, key) {
    if (!Number.isSafeInteger(key)) throw new Error('La chiave deve essere un numero intero valido.');
    const k = ((key % 26) + 26) % 26;
    return text.replace(/[A-Za-z]/g, letter => {
      const base = letter <= 'Z' ? 65 : 97;
      return String.fromCharCode(base + (letter.charCodeAt(0) - base + k) % 26);
    });
  }
  function frequencies(text) {
    const letters = text.replace(/[^A-Za-z]/g, '').toUpperCase();
    const counts = new Map();
    for (const letter of letters) counts.set(letter, (counts.get(letter) || 0) + 1);
    return Array.from(counts, ([letter, count]) => ({letter, count, percent: count / letters.length * 100}))
      .sort((a, b) => b.count - a.count || a.letter.localeCompare(b.letter));
  }
  const sha256 = async text => hex(await globalThis.crypto.subtle.digest('SHA-256', bytes(text)));
  const newAesKey = () => globalThis.crypto.subtle.generateKey({name: 'AES-GCM', length: 256}, false, ['encrypt', 'decrypt']);
  async function encrypt(key, text, associated = '') {
    const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
    const data = await globalThis.crypto.subtle.encrypt({name: 'AES-GCM', iv, additionalData: bytes(associated), tagLength: 128}, key, bytes(text));
    return {iv, data: new Uint8Array(data)};
  }
  async function decrypt(key, iv, data, associated = '') {
    if (iv.length !== 12) throw new Error('Questo laboratorio usa un nonce di esattamente 12 byte (24 cifre esadecimali).');
    const plain = await globalThis.crypto.subtle.decrypt({name: 'AES-GCM', iv, additionalData: bytes(associated), tagLength: 128}, key, data);
    return new TextDecoder('utf-8', {fatal: true}).decode(plain);
  }
  const newSigningKeys = () => globalThis.crypto.subtle.generateKey({name: 'ECDSA', namedCurve: 'P-256'}, false, ['sign', 'verify']);
  const sign = async (privateKey, text) => new Uint8Array(await globalThis.crypto.subtle.sign({name: 'ECDSA', hash: 'SHA-256'}, privateKey, bytes(text)));
  const verify = (publicKey, signature, text) => globalThis.crypto.subtle.verify({name: 'ECDSA', hash: 'SHA-256'}, publicKey, signature, bytes(text));
  const api = Object.freeze({hex, fromHex, caesar, frequencies, sha256, newAesKey, encrypt, decrypt, newSigningKeys, sign, verify});
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else globalThis.CryptoTeaching = api;
})();
