/* Demonstrates primitives; not an authenticated channel or an HPKE implementation. */
(() => {
 'use strict';
 const api=globalThis.CryptoTeaching,$=id=>document.getElementById(id);
 const controls=['agreement-new','agreement-send','agreement-read','agreement-wrong'].map($);
 let alice,bruno,eva,salt,packet;
 async function run(action){
  controls.forEach(b=>b.disabled=true);
  try {if(!globalThis.crypto?.subtle)throw new Error('Questa prova richiede Web Crypto in un contesto sicuro (HTTPS o localhost).');await action();}
  catch(error){$('agreement-output').textContent=error.name==='OperationError'?'Apertura rifiutata: questa chiave non corrisponde al pacchetto.':error.message;}
  finally{controls.forEach(b=>b.disabled=false);}
 }
 controls[0].addEventListener('click',()=>run(async()=>{
  packet=null;
  [alice,bruno,eva]=await Promise.all([api.newAgreementKeys(),api.newAgreementKeys(),api.newAgreementKeys()]);
  salt=crypto.getRandomValues(new Uint8Array(32));
  const pubA=api.hex(await crypto.subtle.exportKey('raw',alice.publicKey));
  const pubB=api.hex(await crypto.subtle.exportKey('raw',bruno.publicKey));
  $('agreement-public').textContent=`Pubblica di Alice: ${pubA}\nPubblica di Bruno: ${pubB}\nParametro pubblico per la derivazione: ${api.hex(salt)}`;
  $('agreement-output').textContent='Due coppie create. Le private restano nella memoria della prova. Ora Alice può preparare il messaggio.';
 }));
 controls[1].addEventListener('click',()=>run(async()=>{
  if(!alice)throw new Error('Prima crea le due coppie.');
  const key=await api.deriveTrafficKey(alice.privateKey,bruno.publicKey,salt);
  packet=await api.encrypt(key,$('agreement-text').value);
  $('agreement-output').textContent=`Alice combina la propria privata con la pubblica di Bruno, deriva una chiave simmetrica e cifra.\nPacchetto cifrato: ${api.hex(packet.data)}\nNonce pubblico: ${api.hex(packet.iv)}\nOra Bruno deve ricavare la sua chiave, senza ricevere quella di Alice.`;
 }));
 async function read(wrong){
  if(!packet)throw new Error('Prima prepara il messaggio di Alice.');
  const key=await api.deriveTrafficKey(wrong?eva.privateKey:bruno.privateKey,alice.publicKey,salt);
  const plain=await api.decrypt(key,packet.iv,packet.data);
  $('agreement-output').textContent='Bruno ha combinato la propria privata con la pubblica di Alice e derivato una chiave che apre il pacchetto: '+plain;
 }
 controls[2].addEventListener('click',()=>run(()=>read(false)));
 controls[3].addEventListener('click',()=>run(()=>read(true)));
})();
