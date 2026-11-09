/* A hash-chain experiment, deliberately without transaction validation or consensus. */
(() => {
 'use strict';
 const inputs=['block-one','block-two','block-three'].map(id=>document.getElementById(id));
 const status=document.getElementById('chain-status'),list=document.getElementById('chain-values');
 const buttons=['chain-build','chain-check'].map(id=>document.getElementById(id));
 let saved=null;
 const hash=async (data,previous)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify([data,previous])))),v=>v.toString(16).padStart(2,'0')).join('');
 async function run(build){
  buttons.forEach(b=>b.disabled=true);inputs.forEach(i=>i.disabled=true);
  try {
   if(!globalThis.crypto?.subtle) throw new Error('Servono un browser con Web Crypto e una pagina in un contesto sicuro (HTTPS o localhost).');
   if(build){
    const next=[];let previous='GENESI';
    for(const input of inputs){const digest=await hash(input.value,previous);next.push({previous,digest});previous=digest;}
    saved=next;list.replaceChildren();
    saved.forEach((block,i)=>{const li=document.createElement('li');li.textContent=`Blocco ${i+1} — precedente: ${block.previous} — impronta salvata: ${block.digest}`;list.append(li);});
    status.textContent='Catena creata: collegamenti coerenti. Questo non verifica autorizzazioni, saldi o consenso.';
   } else {
    if(!saved){status.textContent='Prima crea la catena.';return;}
    const broken=[];
    for(let i=0;i<inputs.length;i++) if(await hash(inputs[i].value,saved[i].previous)!==saved[i].digest || saved[i].previous!==(i?saved[i-1].digest:'GENESI')) broken.push(i+1);
    status.textContent=broken.length?`Alterazione rilevata nei blocchi: ${broken.join(', ')}. Le impronte salvate non descrivono più questi dati; ricalcolare un blocco richiederebbe aggiornare i riferimenti successivi.`:'Catena coerente con le impronte salvate. Non dimostra che i trasferimenti siano autorizzati o accettati dalla rete.';
   }
  }catch(error){status.textContent=error.message;}finally{buttons.forEach(b=>b.disabled=false);inputs.forEach(i=>i.disabled=false);}
 }
 buttons[0].addEventListener('click',()=>run(true));buttons[1].addEventListener('click',()=>run(false));
 inputs.forEach(input=>input.addEventListener('input',()=>{status.textContent='Dati modificati: verifica per confrontarli con le impronte salvate.';}));
})();
