/* UI for the same numerical traces exercised by scripts/test-crypto-algorithms.cjs. */
(() => {
  'use strict';
  const A = globalThis.CryptoAlgorithms;
  const bin = n => Number(n).toString(2).padStart(8, '0');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function mount(root) {
    const stage = root.querySelector('.crypto-stage');
    root.id = 'animazione-' + root.dataset.cryptoDemo;
    stage.id = 'stato-' + root.dataset.cryptoDemo;
    const controls = document.createElement('div'); controls.className = 'trace-controls';
    controls.innerHTML = '<button type="button" data-action="reset">Ricomincia</button><button type="button" data-action="prev">← Indietro</button><button type="button" data-action="play">Riproduci</button><button type="button" data-action="next">Avanti →</button><label>Passaggio <input type="range" min="0" value="0" step="1"></label>';
    root.append(controls);
    const status = document.createElement('p'); status.className='trace-status'; status.setAttribute('role','status'); root.append(status);
    const range=controls.querySelector('input'), play=controls.querySelector('[data-action="play"]');
    let frames=[], index=0, timer=null;
    const stop=()=>{clearInterval(timer);timer=null;play.textContent='Riproduci';play.setAttribute('aria-pressed','false');};
    function draw() {
      const frame=frames[index]; if (!frame) return;
      let html=`<p class="trace-counter">${index+1} / ${frames.length}</p><h3>${esc(frame.title)}</h3><p>${esc(frame.text)}</p>`;
      if (frame.bytes) {
        html+='<div class="byte-matrix" role="group" aria-label="Stato AES: quattro righe e quattro colonne">';
        for (let r=0;r<4;r++) for (let c=0;c<4;c++) {
          const i=c*4+r, changed=index>0&&frames[index-1].bytes?.[i]!==frame.bytes[i];
          html+=`<span class="byte-cell${changed?' changed':''}" title="Riga ${r}, colonna ${c}">${A.hex([frame.bytes[i]])}</span>`;
        }
        html+='</div><p class="trace-caption">Lettura per colonne. Le caselle evidenziate hanno cambiato valore rispetto al passaggio precedente.</p>';
        html+=`<p class="trace-key">${frame.key?'Chiave di questo round: <code>'+A.hex(frame.key)+'</code>':'La chiave di round compare nei passaggi AddRoundKey.'}</p>`;
      }
      if(frame.words) html+='<div class="word-grid">'+frame.words.map((v,i)=>`<div><small>${'abcdefgh'[i]}</small><code>${A.wordHex(v)}</code></div>`).join('')+'</div>';
      if(frame.result) html+=`<dl class="trace-values"><dt>Accumulatore</dt><dd>${esc(frame.result)}</dd><dt>Base corrente</dt><dd>${esc(frame.base)}</dd><dt>Esponente residuo</dt><dd>${esc(frame.exponent)}</dd></dl>`;
      if(frame.formula) html+=`<p class="trace-formula">${esc(frame.formula)}</p>`;
      if(frame.digest) html+=`<p class="trace-formula">${esc(frame.digest)}</p>`;
      stage.innerHTML=html;
      range.value=index; range.setAttribute('aria-valuetext',`${index+1} di ${frames.length}: ${frame.title}`);
      controls.querySelector('[data-action="prev"]').disabled=index===0;
      controls.querySelector('[data-action="next"]').disabled=index===frames.length-1;
      status.textContent=`Passaggio ${index+1} di ${frames.length}: ${frame.title}`;
    }
    const set = next => {stop();frames=next;index=0;range.max=frames.length-1;draw();};
    controls.addEventListener('click', e=>{
      const action=e.target.dataset.action;
      if (action==='play') {
        if(timer){stop();return;}
        if(index===frames.length-1) index=0;
        play.textContent='Pausa'; play.setAttribute('aria-pressed','true');draw();
        timer=setInterval(()=>{if(index<frames.length-1){index++;draw();}if(index===frames.length-1)stop();},1600);
      } else if (action) { stop(); index=action==='reset'?0:Math.max(0,Math.min(frames.length-1,index+(action==='next'?1:-1)));draw(); }
    });
    range.addEventListener('input',()=>{stop();index=Number(range.value);draw();});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
    const form=root.querySelector('form');
    const error=root.querySelector('.trace-error');
    const values=()=>Object.fromEntries(new FormData(form));
    function update() {
      try {
        if(error)error.textContent='';
        const v=form?values():{};
        switch(root.dataset.cryptoDemo) {
          case 'xor': {
            const p=Number(v.plain),k=Number(v.key),c=p^k;
            if(!Number.isInteger(p)||!Number.isInteger(k)||p<0||p>255||k<0||k>255)throw new Error('Scegli due interi tra 0 e 255.');
            set([{title:'Due byte da combinare',text:'Per ogni colonna: bit uguali → 0; bit diversi → 1.',formula:`P = ${bin(p)} (${p})     K = ${bin(k)} (${k})`},
              ...Array.from({length:8},(_,i)=>({title:`Bit ${i+1} di 8`,text:`${bin(p)[i]} XOR ${bin(k)[i]} = ${bin(c)[i]}. Leggiamo da sinistra verso destra.`,formula:`${bin(p)} ⊕ ${bin(k)} = ${bin(c).slice(0,i+1)}${'·'.repeat(7-i)}`})),
              {title:'Decifrare ripete XOR',text:'La stessa chiave annulla il proprio effetto. Un singolo XOR è reversibile, ma da solo non è AES.',formula:`${bin(c)} ⊕ ${bin(k)} = ${bin(c^k)} (${p})`}]);break;
          }
          case 'aes':set(A.aesTrace(v.plain,v.key));break;
          case 'sha':set(A.shaTrace(v.message));break;
          case 'rsa':set(v.operation==='decrypt'?A.modPowTrace(2790,2753,3233):A.modPowTrace(65,17,3233));break;
          case 'dh': {
            const a=Number(v.alice),b=Number(v.bruno);
            if(!Number.isInteger(a)||!Number.isInteger(b)||a<1||a>21||b<1||b>21)throw new Error('Gli esponenti del giocattolo devono essere interi da 1 a 21.');
            const x=A.pow(5,a,23),y=A.pow(5,b,23),s=A.pow(y,a,23);
            set([{title:'Parametri pubblici, segreti locali',text:`Tutti conoscono p = 23 e g = 5. Alice conserva a = ${a}; Bruno conserva b = ${b}. Qui li mostriamo per studiare i conti.`,formula:'Rete: p = 23, g = 5'},
              {title:'Alice prepara il contributo',text:`Alice eleva 5 al proprio esponente e prende il resto. Invia A = ${x}; non invia a.`,formula:`A = 5^${a} mod 23 = ${x}`},
              {title:'Bruno prepara il contributo',text:`Bruno invia B = ${y}; l’osservatore vede A e B.`,formula:`B = 5^${b} mod 23 = ${y}`},
              {title:'Alice usa il valore ricevuto',text:'Alice combina il contributo pubblico di Bruno con il proprio segreto.',formula:`B^a mod p = ${y}^${a} mod 23 = ${s}`},
              {title:'Bruno trova lo stesso segreto',text:'I due percorsi coincidono perché ab = ba. Da questo segreto il protocollo deriva chiavi: non usa direttamente questo piccolo numero come chiave AES.',formula:`A^b mod p = ${x}^${b} mod 23 = ${A.pow(x,b,23)}`}]);break;
          }
          case 'nonce': {
            const p=65,q=66,k=Number(v.stream);if(!Number.isInteger(k)||k<0||k>255)throw new Error('Il byte del flusso deve essere tra 0 e 255.');
            set([{title:'Due messaggi, stesso flusso',text:'Modello a un byte del riuso di un flusso. A vale 65, B vale 66. Il byte S rappresenta una porzione del flusso prodotto con la stessa chiave e lo stesso nonce.',formula:`P₁ = ${bin(p)}; P₂ = ${bin(q)}; S = ${bin(k)}`},
              {title:'L’osservatore legge i cifrati',text:'Non conosce S, ma può combinare tra loro i due cifrati pubblici.',formula:`C₁ = P₁ ⊕ S = ${bin(p^k)}; C₂ = P₂ ⊕ S = ${bin(q^k)}`},
              {title:'Il segreto si cancella',text:'S XOR S vale zero: resta una relazione tra i due chiari, indipendente dal valore segreto.',formula:`C₁ ⊕ C₂ = P₁ ⊕ P₂ = ${bin(p^q)}`},
              {title:'Un chiaro noto rivela l’altro',text:'Se il primo byte è noto, il secondo si recupera senza cercare la chiave AES. In GCM il riuso può compromettere anche l’autenticazione.',formula:`P₂ = P₁ ⊕ C₁ ⊕ C₂ = ${bin(p^(p^k)^(q^k))} = 66 = B`}]);break;
          }
          case 'certificate': {
            const nameOK=v.hostname==='correct';
            const frames=[{title:'Una radice già fidata',text:'Il browser parte da una chiave radice presente nel proprio archivio di fiducia. La fiducia iniziale non nasce dall’autofirma della radice.',formula:'Archivio locale → chiave pubblica della radice'},
              {title:'Verifica dell’intermedio',text:'La chiave della radice verifica la firma sui dati del certificato intermedio. Si controllano anche vincoli e autorizzazione a emettere certificati.',formula:'Verifica(pubblica radice, dati intermedio, firma) = valida'},
              {title:'Verifica del certificato del sito',text:'La chiave dell’intermedio verifica la firma sul certificato del sito. Una firma valida non completa ancora la validazione.',formula:'Verifica(pubblica intermedio, dati sito, firma) = valida'},
              {title:nameOK?'Il nome coincide':'STOP: nome diverso',text:nameOK?'Il nome richiesto compare nei nomi ammessi del certificato. Seguono periodo di validità, vincoli e controlli di stato secondo la politica del client.':'Il certificato di registro.example non autentica intruso.example, anche se le firme sono matematicamente valide.',formula:nameOK?'Richiesto: registro.example → nome ammesso':'Richiesto: intruso.example → nome non ammesso'}];
            if(nameOK)frames.push({title:'Possesso della privata e handshake',text:'Nel TLS con certificato il server firma il contesto dello scambio; il browser verifica con la pubblica del sito e verifica Finished. Il certificato da solo è copiabile.',formula:'Catena valida + nome + prova di possesso + conferma dello scambio'});
            set(frames);break;
          }
          default: {
            const script=root.querySelector('script[type="application/json"]');
            if(script)set(JSON.parse(script.textContent));
          }
        }
      }catch(err){stop();if(error)error.textContent=err.message;}
    }
    if(form)form.addEventListener('submit',event=>{event.preventDefault();update();});
    update();
  }
  document.querySelectorAll('[data-crypto-demo]').forEach(mount);
  // This separate experiment uses the browser's actual ECDSA implementation.
  document.querySelectorAll('[data-signature-demo]').forEach(root=>{
    const button=root.querySelector('button'),output=root.querySelector('output'),input=root.querySelector('textarea');
    let keys,signature,original;
    button.addEventListener('click',async()=>{
      button.disabled=true;
      try {
        if(!globalThis.crypto?.subtle)throw new Error('La firma reale richiede HTTPS o localhost. La sequenza didattica sopra resta disponibile.');
        if(!keys) {
          keys=await CryptoTeaching.newSigningKeys();original=input.value;signature=await CryptoTeaching.sign(keys.privateKey,original);
          output.textContent='Firma creata su questi byte: '+CryptoTeaching.hex(signature)+'\nOra modifica il testo e premi Verifica.';button.textContent='Verifica';
        }else{
          const ok=await CryptoTeaching.verify(keys.publicKey,signature,input.value);
          output.textContent=(ok?'Firma valida: i byte corrispondono.':'Firma NON valida: il testo è cambiato.')+'\nTesto firmato inizialmente: '+original;
        }
      }catch(err){output.textContent=err.message;}finally{button.disabled=false;}
    });
  });
})();
