(() => {
  'use strict';
  const api = window.CryptoTeaching;
  const form = document.getElementById('caesar-form');
  const input = document.getElementById('caesar-text');
  const key = document.getElementById('caesar-key');
  const output = document.getElementById('caesar-result');
  const stats = document.getElementById('caesar-frequencies');
  function show(mode) {
    if (!form.reportValidity()) return;
    try {
      const k = Number(key.value);
      if (mode === 'attack') {
        output.textContent = Array.from({length: 26}, (_, n) => `k=${String(n).padStart(2, '0')}: ${api.caesar(input.value, -n)}`).join('\n');
        stats.textContent = 'Le frequenze descrivono il testo inserito: ogni tentativo cambia i simboli ma conserva i conteggi.';
      } else {
        const result = api.caesar(input.value, mode === 'decrypt' ? -k : k);
        output.textContent = result || '(Testo vuoto)';
        const counts = api.frequencies(result);
        stats.textContent = counts.length ? counts.map(x => `${x.letter}: ${x.count} (${x.percent.toFixed(1)}%)`).join(' · ') : 'Nessuna lettera A–Z da contare.';
      }
    } catch (error) { output.textContent = error.message; }
  }
  form.addEventListener('submit', event => { event.preventDefault(); show('encrypt'); });
  document.getElementById('caesar-decrypt').addEventListener('click', () => show('decrypt'));
  document.getElementById('caesar-attack').addEventListener('click', () => show('attack'));
})();
