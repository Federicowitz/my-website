(() => {
  'use strict';
  const api = window.CryptoTeaching, $ = id => document.getElementById(id);
  const supported = !!(globalThis.crypto && globalThis.crypto.subtle && globalThis.TextEncoder);
  const controls = Array.from(document.querySelectorAll('[data-webcrypto]'));
  $('crypto-availability').textContent = supported
    ? 'Web Crypto disponibile. Puoi eseguire tutti e tre gli esperimenti.'
    : 'Web Crypto non disponibile in questo contesto. Apri la pagina con un browser aggiornato su HTTPS o su localhost. Puoi comunque leggere le procedure e i risultati attesi.';
  controls.forEach(button => button.disabled = !supported);
  let aesKey = null, signingKeys = null;
  async function run(outputId, action) {
    if (!supported) return;
    controls.forEach(button => button.disabled = true);
    try { await action(); }
    catch (error) {
      $(outputId).textContent = error.name === 'OperationError'
        ? 'Verifica fallita: chiave, nonce, cifrato, tag o dati associati non corrispondono. Nessun testo viene restituito.'
        : error.message || 'Operazione non riuscita.';
    } finally { controls.forEach(button => button.disabled = false); }
  }
  $('hash-form').addEventListener('submit', event => {
    event.preventDefault();
    run('hash-output', async () => { $('hash-output').textContent = await api.sha256($('hash-text').value); });
  });
  $('aes-encrypt').addEventListener('click', () => run('aes-output', async () => {
    aesKey ||= await api.newAesKey();
    const result = await api.encrypt(aesKey, $('aes-text').value, $('aes-aad').value);
    $('aes-iv').value = api.hex(result.iv);
    $('aes-cipher').value = api.hex(result.data);
    $('aes-output').textContent = `Cifratura completata: nonce di 12 byte, ${result.data.length - 16} byte cifrati e 16 byte di tag. La chiave resta in memoria.`;
  }));
  $('aes-decrypt').addEventListener('click', () => run('aes-output', async () => {
    if (!aesKey) throw new Error('La chiave non è disponibile: cifra un nuovo messaggio in questa pagina.');
    const plain = await api.decrypt(aesKey, api.fromHex($('aes-iv').value), api.fromHex($('aes-cipher').value), $('aes-aad').value);
    $('aes-output').textContent = 'Verifica riuscita. Messaggio: ' + (plain || '(vuoto)');
  }));
  $('aes-tamper').addEventListener('click', () => run('aes-output', async () => {
    const data = api.fromHex($('aes-cipher').value);
    data[0] ^= 1;
    $('aes-cipher').value = api.hex(data);
    $('aes-output').textContent = 'Il primo byte è stato alterato. Ora premi «Verifica e decifra».';
  }));
  $('aes-reset').addEventListener('click', () => run('aes-output', async () => {
    aesKey = null; $('aes-iv').value = ''; $('aes-cipher').value = '';
    $('aes-output').textContent = 'Riferimento alla chiave eliminato. La prossima cifratura genererà una chiave nuova; i vecchi dati non sono più recuperabili da questa prova.';
  }));
  $('sign-create').addEventListener('click', () => run('sign-output', async () => {
    signingKeys ||= await api.newSigningKeys();
    $('sign-value').value = api.hex(await api.sign(signingKeys.privateKey, $('sign-text').value));
    $('sign-output').textContent = 'Firma creata. Il testo resta leggibile. Verificalo, poi modifica una parola.';
  }));
  async function checkSignature(other) {
    if (!signingKeys) throw new Error('Firma prima un messaggio in questa pagina.');
    const signature = api.fromHex($('sign-value').value);
    const keys = other ? await api.newSigningKeys() : signingKeys;
    const ok = await api.verify(keys.publicKey, signature, $('sign-text').value);
    $('sign-output').textContent = ok
      ? 'Firma valida per questo messaggio e questa chiave pubblica. Non è una validazione qualificata dell’identità.'
      : 'Firma non valida per la combinazione di messaggio, firma e chiave pubblica.';
  }
  $('sign-verify').addEventListener('click', () => run('sign-output', () => checkSignature(false)));
  $('sign-other').addEventListener('click', () => run('sign-output', () => checkSignature(true)));
})();
