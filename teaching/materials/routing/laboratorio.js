(() => {
  'use strict';
  const R = window.Routing;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const players = [];
  function paint(section, {path = [], current = null, visited = [], failed = false, flooding = false} = {}) {
    section.querySelectorAll('[data-node]').forEach(node => {
      node.classList.toggle('current',node.dataset.node === current);
      node.classList.toggle('visited',visited.includes(node.dataset.node));
    });
    section.querySelectorAll('[data-edge]').forEach(edge => {
      const [a,b] = edge.dataset.edge.split('-');
      const onPath = path.some((n,i) => i < path.length-1 && ((n === a && path[i+1] === b) || (n === b && path[i+1] === a)));
      edge.classList.toggle('active',onPath);
      edge.classList.toggle('failed',failed && a === 'R3' && b === 'R4');
      edge.classList.toggle('lsa',flooding && a.startsWith('R') && b.startsWith('R') && !(a === 'R3' && b === 'R4'));
    });
  }
  function player(section, getSteps, render) {
    let steps = getSteps(), index = 0, timer = null;
    const play = $('[data-action="play"]',section), next = $('[data-action="next"]',section), prev = $('[data-action="prev"]',section);
    function stop() {if (timer !== null) clearInterval(timer);timer = null;play.textContent = 'Avvia';play.setAttribute('aria-pressed','false');}
    function draw() {
      render(steps[index],index,steps.length);
      $('[data-step]',section).textContent = `Passo ${index+1} di ${steps.length}`;
      prev.disabled = index === 0; next.disabled = index === steps.length-1;
      if (index === steps.length-1) stop();
    }
    function reset() {stop();steps = getSteps();index = 0;draw();}
    next.addEventListener('click',() => {stop();index = Math.min(steps.length-1,index+1);draw();});
    prev.addEventListener('click',() => {stop();index = Math.max(0,index-1);draw();});
    $('[data-action="reset"]',section).addEventListener('click',reset);
    play.addEventListener('click',() => {
      if (timer !== null) {stop();return;}
      // Keep at most one explanation moving at a time.
      players.forEach(p => p.stop());
      if (index === steps.length-1) {index=0;draw();}
      play.textContent = 'Pausa';play.setAttribute('aria-pressed','true');
      timer = setInterval(() => {index = Math.min(steps.length-1,index+1);draw();},2200);
    });
    const api = {stop,reset};players.push(api);draw();return api;
  }
  const packet = $('#packet');
  const packetPlayer = player(packet,() => R.trace({via:$('#packet-via').value,scenario:$('#packet-scenario').value,ttl:Number($('#packet-ttl').value)}), step => {
    paint(packet,{path:step.from?[step.from,step.to]:[],current:step.node});
    const dot = $('[data-packet]',packet), [x,y] = R.nodes[step.node];
    dot.setAttribute('cx',x);dot.setAttribute('cy',y);dot.classList.toggle('dropped',!!step.drop);
    const status = $('[data-status]',packet);status.textContent = step.message;status.classList.toggle('error',!!step.drop);
    const reverse = step.direction === 'ritorno';
    const values = [
      ['Direzione',reverse?'Risposta · PC4 → PC1':'Richiesta · PC1 → PC4'],
      ['IP sorgente → destinazione',reverse?'192.168.4.10 → 192.168.1.10':'192.168.1.10 → 192.168.4.10'],
      ['MAC sorgente → destinazione del frame',step.macSource?`${step.macSource} → ${step.macDestination}`:'Nessun frame in transito in questo passo'],
      ['TTL del pacchetto',step.ttl],
      ['Next hop sul tratto mostrato',step.nextHop || '—'],
      ['Stato',step.drop?'SCARTATO':step.node === 'PC1' && reverse?'SCAMBIO COMPLETATO':`Presso ${step.node}`]
    ];
    $('#packet-fields').innerHTML=values.map(([name,value])=>`<div><dt>${escape(name)}</dt><dd>${escape(value)}</dd></div>`).join('');
  });
  for (const select of packet.querySelectorAll('select')) select.addEventListener('change',packetPlayer.reset);

  const prefix = $('#prefix');
  function search() {
    const ip = $('#prefix-ip').value.trim(), mode = $('#prefix-mode').value;
    const table = R.routes.filter(r => !(mode === 'no-host' && r.prefix.endsWith('/32')) && !(mode === 'no-default' && r.prefix.endsWith('/0')));
    const status = $('[data-status]',prefix);
    try {
      const winner = R.lookup(ip,table);status.classList.toggle('error',!winner);
      $('#prefix-rows').innerHTML=table.map(route => {
        const match = R.matches(ip,route.prefix), chosen = route === winner;
        return `<tr class="${chosen?'winner':match?'match':''}"><td>${route.source}</td><td>${route.prefix}</td><td>${route.via}</td><td>${route.ad}</td><td>${chosen?'SCELTA · più specifica':match?'Corrisponde':'Non corrisponde'}</td></tr>`;
      }).join('');
      status.textContent = winner?`Per ${ip} viene scelta ${winner.prefix} via ${winner.via}. ${winner.prefix.endsWith('/0')?'Nessuna rotta più specifica coincide: si usa la default.':'Fra le rotte compatibili ha il maggior numero di bit di prefisso.'}`:`Nessuna rotta per ${ip}, nemmeno default: il pacchetto viene scartato.`;
    } catch (error) {$('#prefix-rows').replaceChildren();status.textContent=error.message;status.classList.add('error');}
  }
  $('#prefix-form').addEventListener('submit',event => {event.preventDefault();search();});
  $('#prefix-mode').addEventListener('change',search);
  prefix.querySelectorAll('[data-ip]').forEach(button => button.addEventListener('click',() => {$('#prefix-ip').value=button.dataset.ip;search();}));
  search();

  const spf = $('#spf');
  player(spf,() => R.dijkstra(),(step,index,total) => {
    const finished = index === total-1;
    paint(spf,{path:finished?R.pathTo(step,'D'):step.current?R.pathTo(step,step.current):[],current:step.current,visited:step.visited});
    $('[data-status]',spf).textContent = step.message + (finished?' Percorso A → B → C → D, costo 5; da A il next hop è B.':'');
    $('[data-distances]',spf).innerHTML=Object.entries(step.distances).map(([name,d]) => `<tr><td>${name}</td><td>${d === Infinity?'∞':d}</td><td>${step.previous[name] || '—'}</td><td>${step.visited.includes(name)?'Fissata':'Provvisoria'}</td></tr>`).join('');
  });

  const failure = $('#failure');
  const failurePlayer = player(failure,() => {
    const staticMode = $('#failure-mode').value === 'static';
    const common = [
      {path:['PC1','R1','R3','R4','PC4'],message:'Rete operativa. Il traffico segue R1 → R3 → R4. Nel caso OSPF, questo percorso ha costo 2, contro 6 via R2.',result:'Percorso attivo: via R3.'},
      {path:['PC1','R1','R3'],failed:true,message:'Il collegamento R3–R4 si interrompe. Un pacchetto sul vecchio percorso non può proseguire. Il link R1–R3 resta attivo.',result:'La consegna non è garantita durante il cambiamento.'}
    ];
    return staticMode?common.concat([
      {failed:true,path:['PC1','R1','R3'],message:'R3 non può usare il collegamento guasto. R1 può conservare la statica perché il suo next hop R3 è ancora raggiungibile. Nessun protocollo gli insegna il cammino via R2.',result:'Pacchetto perso sul percorso via R3.'},
      {failed:true,path:['PC1','R1','R3'],message:'Il modello rimane in questo stato: occorre un intervento di configurazione o un meccanismo di backup/tracking predisposto. La presenza del cammino fisico via R2 non basta.',result:'Statico senza backup: percorso alternativo non appreso.'}
    ]):common.concat([
      {failed:true,message:'I router adiacenti rilevano il cambiamento del link o dell’adiacenza. Il tempo reale dipende dal tipo di guasto e dai meccanismi di rilevamento.',result:'1 · Rilevamento della variazione.'},
      {failed:true,flooding:true,message:'Le nuove informazioni link-state vengono diffuse sulle adiacenze rimaste. Il viola rappresenta schematicamente le LSA, cioè controllo, non pacchetti applicativi.',result:'2 · Aggiornamento delle LSDB nell’area.'},
      {failed:true,message:'Ogni router esegue il proprio ricalcolo SPF sulla topologia aggiornata. Il percorso via R3 non è più disponibile; il percorso via R2 rimane utilizzabile.',result:'3 · Calcolo e aggiornamento delle rotte.'},
      {failed:true,path:['PC1','R1','R2','R4','PC4'],message:'Dopo la convergenza, il modello usa PC1 → R1 → R2 → R4 → PC4, con rotte coerenti anche per il ritorno. I pacchetti persi durante il guasto non vengono recuperati da OSPF.',result:'4 · Nuovo percorso attivo: via R2.'}
    ]);
  },step => {
    paint(failure,step);$('[data-status]',failure).textContent=step.message;$('[data-result]',failure).textContent=step.result;
  });
  $('#failure-mode').addEventListener('change',failurePlayer.reset);

  const rip = $('#rip');
  player(rip,() => R.distanceVector(),(step,index,total) => {
    paint(rip,{visited:Object.keys(step.distances).filter(n => step.distances[n]<16),path:index===total-1?['A','B','D']:[]});
    $('[data-status]',rip).textContent=step.message;
    $('[data-vectors]',rip).innerHTML=Object.entries(step.distances).map(([name,d])=>`<tr><td>${name}</td><td>${d===16?'16 · irraggiungibile':d}</td><td>${step.next[name] || (name==='D'?'Destinazione locale':'—')}</td></tr>`).join('');
  });
  document.addEventListener('visibilitychange',() => {if(document.hidden) players.forEach(p=>p.stop());});
  window.addEventListener('pagehide',() => players.forEach(p=>p.stop()));
})();
