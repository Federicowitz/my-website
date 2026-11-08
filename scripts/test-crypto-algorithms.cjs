const assert = require('node:assert/strict');
const {createCipheriv, createHash} = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const A = require('../teaching/materials/crittografia/algoritmi.js');

// Published AES-128 example: check intermediate states, not just round-trip behavior.
const plain='00112233445566778899aabbccddeeff', key='000102030405060708090a0b0c0d0e0f';
const trace=A.aesTrace(plain,key);
assert.equal(trace.length,41);
const firstRound=[plain,'00102030405060708090a0b0c0d0e0f0','63cab7040953d051cd60e0e7ba70e18c','6353e08c0960e104cd70b751bacad0e7','5f72641557f5bc92f7be3b291db9f91a','89d810e8855ace682d1843d8cb128fe4'];
firstRound.forEach((value,i)=>assert.equal(A.hex(trace[i].bytes),value));
assert.equal(A.hex(trace.at(-1).bytes),'69c4e0d86a7b0430d8cdb78070b4c55a');
assert.equal(A.hex(A.expandKey(A.unhex(key))[1]),'d6aa74fdd2af72fadaa678f1d6ab76fe');
assert.equal(A.sbox[0],0x63); assert.equal(A.sbox[0x53],0xed);
assert.equal(new Set(A.sbox).size,256);
assert.equal(A.mul(0x57,2),0xae);assert.equal(A.mul(0x83,2),0x1d);
// Compare independent implementations on varied public test inputs.
for(let i=0;i<32;i++){
  const p=Buffer.from(Array.from({length:16},(_,j)=>(i*31+j*17)&255));
  const k=Buffer.from(Array.from({length:16},(_,j)=>(i*7+j*29)&255));
  const cipher=createCipheriv('aes-128-ecb',k,null);cipher.setAutoPadding(false);
  const expected=Buffer.concat([cipher.update(p),cipher.final()]).toString('hex');
  assert.equal(A.hex(A.aesTrace(p.toString('hex'),k.toString('hex')).at(-1).bytes),expected);
}
assert.throws(()=>A.aesTrace('ff',key));assert.throws(()=>A.aesTrace(plain,'z'.repeat(32)));
// Include UTF-8 and the exact one-block padding boundary.
for(const text of ['', 'abc', 'abd','abc\n','città 🙂','a'.repeat(55),'é'.repeat(27),'漢字']){
  const sha=A.shaTrace(text);assert.equal(sha.length,66);
  assert.equal(sha.at(-1).digest,createHash('sha256').update(text).digest('hex'));
}
assert.equal(A.shaTrace('abc')[1].words[0],0x5d6aebcd);
assert.throws(()=>A.shaTrace('a'.repeat(56)));assert.throws(()=>A.shaTrace('🙂'.repeat(14)));
assert.equal(A.pow(65,17,3233),2790n);assert.equal(A.pow(2790,2753,3233),65n);
assert.equal(A.pow(0,0,23),1n);
// Verify both parties agree across every selectable pair in the DH experiment.
for(let a=1;a<=21;a++)for(let b=1;b<=21;b++){
  assert.equal(A.pow(A.pow(5,a,23),b,23),A.pow(A.pow(5,b,23),a,23));
}
const folder=path.resolve(__dirname,'../teaching/materials/crittografia');
for(const file of fs.readdirSync(folder).filter(f=>/^(0[6-9]|1[0-4])-.*\.html$/.test(f))){
  const html=fs.readFileSync(path.join(folder,file),'utf8');
  assert.ok(html.includes('data-crypto-demo='),'Missing interactive explanation: '+file);
  for(const [,json] of html.matchAll(/<script type="application\/json">([\s\S]*?)<\/script>/g)){
    const steps=JSON.parse(json);assert.ok(steps.length>1);for(const step of steps)assert.ok(step.title&&step.text);
  }
}
console.log('OK: stati AES di riferimento e 32 confronti con OpenSSL, SHA-256 e limiti UTF-8, RSA, 441 accordi DH, sequenze delle lezioni 6–14.');
