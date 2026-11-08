/* Educational, inspectable traces. Not a cryptographic library for applications. */
(() => {
  'use strict';
  const hex = values => Array.from(values, v => v.toString(16).padStart(2, '0')).join('');
  function unhex(s) {
    if (!/^[\da-f]{32}$/i.test(s)) throw new Error('Servono esattamente 32 cifre esadecimali (16 byte).');
    return s.match(/../g).map(v => parseInt(v, 16));
  }
  // Multiplication in the AES byte field, reduced by x^8+x^4+x^3+x+1.
  function mul(a, b) {
    let result = 0;
    for (let i = 0; i < 8; i++) {
      if (b & 1) result ^= a;
      a = ((a << 1) ^ ((a & 128) ? 0x11b : 0)) & 255;
      b >>>= 1;
    }
    return result;
  }
  function substitute(x) {
    let inv = 0;
    if (x) { inv = 1; for (let i = 0; i < 254; i++) inv = mul(inv, x); }
    const rot = n => ((inv << n) | (inv >>> (8 - n))) & 255;
    return inv ^ rot(1) ^ rot(2) ^ rot(3) ^ rot(4) ^ 0x63;
  }
  const sbox = Array.from({length: 256}, (_, i) => substitute(i));
  function expandKey(key) {
    const expanded = key.slice(); let rc = 1;
    while (expanded.length < 176) {
      let t = expanded.slice(-4);
      if (expanded.length % 16 === 0) {
        t.push(t.shift()); t = t.map(v => sbox[v]); t[0] ^= rc; rc = mul(rc, 2);
      }
      for (let i = 0; i < 4; i++) expanded.push(expanded[expanded.length - 16] ^ t[i]);
    }
    return Array.from({length: 11}, (_, i) => expanded.slice(i * 16, i * 16 + 16));
  }
  function aesTrace(plain, key) {
    let state = unhex(plain); const keys = expandKey(unhex(key)); const frames = [];
    const frame = (title, text, round, extra = {}) => frames.push({title, text, round, bytes: state.slice(), ...extra});
    frame('Ingresso: 16 byte', 'I byte riempiono la matrice per colonne. Ogni casella mostra un byte in esadecimale.', 0);
    const add = round => {
      state = state.map((v, i) => v ^ keys[round][i]);
      frame('AddRoundKey · round ' + round, 'Ogni byte viene combinato con XOR con il byte corrispondente della chiave di round.', round, {key: keys[round]});
    };
    add(0);
    for (let round = 1; round <= 10; round++) {
      state = state.map(v => sbox[v]);
      frame('SubBytes · round ' + round, 'Sostituiamo ciascun byte attraverso la stessa tabella invertibile, la S-box. Introduce non linearità.', round);
      const before = state.slice();
      state = state.map((_, i) => before[4 * ((Math.floor(i / 4) + i % 4) % 4) + i % 4]);
      frame('ShiftRows · round ' + round, 'Le righe 0, 1, 2, 3 ruotano a sinistra rispettivamente di 0, 1, 2, 3 posizioni. I valori cambiano colonna.', round);
      if (round < 10) {
        for (let c = 0; c < 4; c++) {
          const i = c * 4, [a,b,c0,d] = state.slice(i, i + 4);
          state.splice(i, 4, mul(a,2)^mul(b,3)^c0^d, a^mul(b,2)^mul(c0,3)^d, a^b^mul(c0,2)^mul(d,3), mul(a,3)^b^c0^mul(d,2));
        }
        frame('MixColumns · round ' + round, 'Ogni colonna è moltiplicata per una matrice fissa nel campo dei byte. Ogni uscita dipende da tutti e quattro i byte della colonna.', round);
      }
      add(round);
    }
    return frames;
  }
  function modPowTrace(base, exponent, modulus) {
    let b = BigInt(base), e = BigInt(exponent), m = BigInt(modulus), result = 1n;
    if (m < 2n || e < 0n) throw new Error('Modulo o esponente non valido.');
    b = ((b % m) + m) % m;
    const frames = [{title:'Partenza', text:`Calcoliamo ${base}^${exponent} mod ${modulus}. Accumulatore = 1.`, result:'1', base:String(b), exponent:String(e)}];
    while (e > 0n) {
      const old = result, bit = e & 1n;
      if (bit) result = result * b % m;
      frames.push({title: 'Leggi il bit ' + bit, text: bit ? `${old} × ${b} mod ${m} = ${result}. Il bit vale 1: aggiorniamo l’accumulatore.` : 'Il bit vale 0: saltiamo la moltiplicazione dell’accumulatore.', result:String(result), base:String(b), exponent:String(e)});
      const previous = b; b = b * b % m; e >>= 1n;
      frames.push({title:e ? 'Quadrato e dimezzamento' : 'Risultato', text:`Base: ${previous}² mod ${m} = ${b}. Esponente residuo: ${e}.` + (e ? ' Passiamo al bit successivo.' : ` Il risultato è ${result}.`), result:String(result), base:String(b), exponent:String(e)});
    }
    return frames;
  }
  const pow = (b,e,m) => BigInt(modPowTrace(b,e,m).at(-1).result);
  const constants = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  const wordHex = v => (v >>> 0).toString(16).padStart(8,'0');
  const rotr = (v,n) => (v >>> n) | (v << (32-n));
  function shaTrace(text) {
    const bytes = Array.from(new TextEncoder().encode(text));
    if (bytes.length > 55) throw new Error('La dimostrazione segue un solo blocco: massimo 55 byte UTF-8.');
    const length = bytes.length * 8; bytes.push(128);
    while (bytes.length < 56) bytes.push(0);
    bytes.push(0,0,0,0,0,0,(length >>> 8) & 255,length & 255);
    const w = Array.from({length:16}, (_,i) => ((bytes[i*4]<<24)|(bytes[i*4+1]<<16)|(bytes[i*4+2]<<8)|bytes[i*4+3])>>>0);
    for (let t=16;t<64;t++) {
      const x=w[t-15],y=w[t-2];
      w[t]=(w[t-16]+(rotr(x,7)^rotr(x,18)^(x>>>3))+w[t-7]+(rotr(y,17)^rotr(y,19)^(y>>>10)))>>>0;
    }
    const initial=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    let state=initial.slice();
    const frames=[{title:'Preparazione del blocco',text:`${length} bit di messaggio, un bit 1, zeri e lunghezza finale: 512 bit. W[0] = ${wordHex(w[0])}. Le otto parole iniziali sono costanti pubbliche.`,words:state.slice()}];
    for (let t=0;t<64;t++) {
      const [a,b,c,d,e,f,g,h]=state;
      const t1=(h+(rotr(e,6)^rotr(e,11)^rotr(e,25))+((e&f)^(~e&g))+constants[t]+w[t])>>>0;
      const t2=((rotr(a,2)^rotr(a,13)^rotr(a,22))+((a&b)^(a&c)^(b&c)))>>>0;
      state=[(t1+t2)>>>0,a,b,c,(d+t1)>>>0,e,f,g];
      frames.push({title:`SHA-256 · round ${t+1} / 64`,text:`W[${t}] = ${wordHex(w[t])}; K[${t}] = ${wordHex(constants[t])}. T1 = ${wordHex(t1)}, T2 = ${wordHex(t2)}. Le somme conservano i 32 bit bassi.`,words:state.slice()});
    }
    const digest=state.map((v,i)=>(v+initial[i])>>>0);
    frames.push({title:'Somma finale e digest',text:'Sommiamo lo stato di lavoro alle otto parole iniziali, modulo 2^32, e concateniamo i risultati.',words:digest,digest:digest.map(wordHex).join('')});
    return frames;
  }
  const api=Object.freeze({hex,unhex,mul,sbox,expandKey,aesTrace,modPowTrace,pow,shaTrace,wordHex});
  if (typeof module !== 'undefined' && module.exports) module.exports=api;
  else globalThis.CryptoAlgorithms=api;
})();
