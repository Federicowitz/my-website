(() => {
  'use strict';
  const V=window.RoutingVisual;
  const names={prefix:'Longest Prefix Match',packet:'Viaggio del pacchetto',static:'Rotte statiche',spf:'Dijkstra / OSPF',ospf:'OSPF: guasto e convergenza',rip:'RIP / Bellman–Ford',eigrp:'EIGRP: condizione di fattibilità',isis:'IS-IS: SPF in un livello',bgp:'BGP: policy tra AS',diagnostic:'Diagnostica del pacchetto'};
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const players=[];
  document.querySelectorAll('[data-routing-visual]').forEach((panel,panelIndex)=>{
    const modes=panel.dataset.routingVisual.split(',');
    panel.innerHTML+=`<div class="controls"><label>Esperimento<select data-mode>${modes.map(m=>`<option value="${m}">${names[m]}</option>`).join('')}</select></label><label data-option="ip">IP destinazione<select data-ip><option>10.1.2.34</option><option>10.1.2.35</option><option>10.1.50.8</option><option>10.2.50.8</option><option>203.0.113.10</option></select></label><label data-option="ttl">TTL iniziale<select data-ttl><option>8</option><option>3</option><option>5</option><option>16</option></select></label><label data-option="scenario">Scenario<select data-scenario><option value="normal">Rete operativa</option><option value="return">Manca la rotta di ritorno</option><option value="asymmetric">Ritorno su un altro percorso</option><option value="failure">Guasto E–H</option></select></label><label data-option="failed">Collegamento rimosso<select data-failed><option value="">Nessuno</option>${V.edges.map(([a,b])=>`<option>${a}-${b}</option>`).join('')}</select></label><label data-option="expensive">Costo E–H<select data-expensive><option value="no">2</option><option value="yes">18</option></select></label><label data-option="policy">Policy di import<select data-policy><option value="equal">Preferenze uguali per 64520 e 64550</option><option value="prefer">Preferisci 64520: LOCAL_PREF 200</option><option value="filter">Filtra il prefisso da 64550</option></select></label><label data-option="strict">Distanza annunciata da D<select data-strict><option value="no">7 · soddisfa la condizione</option><option value="yes">12 · non soddisfa la condizione</option></select></label></div><div data-diagram class="network-scroll"></div><p class="legend">Blu spesso: percorso osservato · nodo blu: posizione corrente · verde: nodi elaborati/informati · rosso tratteggiato: link guasto. Il testo sotto descrive sempre lo stato.</p><div class="actions"><button type="button" data-action="prev">Indietro</button><button type="button" data-action="play" aria-pressed="false">Avvia</button><button type="button" data-action="next">Avanti</button><button type="button" data-action="reset">Ricomincia</button><span data-counter class="step-count"></span></div><p data-status class="lab-status" role="status" aria-live="polite"></p><div class="visual-table"><table><caption>Stato del modello al passo corrente</caption><thead><tr><th scope="col">Elemento</th><th scope="col">Valore / decisione</th></tr></thead><tbody data-rows></tbody></table></div><p data-limit class="legend"></p>`;
    const $=s=>panel.querySelector(s);
    let steps=[],index=0,timer=null;
    function stop(){clearInterval(timer);timer=null;$('[data-action="play"]').textContent='Avvia';$('[data-action="play"]').setAttribute('aria-pressed','false');}
    players.push({stop});
    function draw(){
      const mode=$('[data-mode]').value,s=steps[index],bgp=mode==='bgp',packet=mode==='packet'||mode==='diagnostic';
      const prefix=mode==='prefix';
      const prefixPoints={A:[100,210],B:[420,50],C:[420,130],D:[420,210],E:[420,290],F:[420,370]};
      const points=prefix?prefixPoints:bgp?V.asNodes:packet?{PC:[20,210],...V.nodes,Server:[930,280]}:V.nodes;
      const links=prefix?[['A','B','10.0.0.0/8'],['A','C','10.1.0.0/16'],['A','D','default'],['A','E','10.1.2.0/24'],['A','F','10.1.2.34/32']]:bgp?V.asEdges:packet?[['PC','A','LAN'],...V.edges,['L','Server','LAN']]:V.graph('', ['spf','rip','isis'].includes(mode)&&$('[data-expensive]').value==='yes');
      const path=s.path||[],failed=s.failed||(!['static','ospf','packet','diagnostic','eigrp','bgp'].includes(mode)?$('[data-failed]').value:'');
      const onPath=(a,b)=>path.some((n,i)=>n===a&&path[i+1]===b||n===b&&path[i+1]===a);
      $('[data-diagram]').innerHTML=`<svg class="network-svg visual-network" viewBox="-20 0 1000 430" role="img" aria-labelledby="visual-title-${panelIndex}"><title id="visual-title-${panelIndex}">${prefix?'Tabella e next hop':bgp?'Sei sistemi autonomi':'Dodici router con percorsi alternativi'}: ${escape(s.message)}</title>${links.map(([a,b,c])=>{const [x,y]=points[a],[xx,yy]=points[b];const broken=failed===`${a}-${b}`;const shortcut=a==='C'&&b==='L';return `<g>${shortcut?`<path d="M ${x} ${y} Q 500 470 ${xx} ${yy}"`:`<line x1="${x}" y1="${y}" x2="${xx}" y2="${yy}"`} class="edge ${onPath(a,b)?'active':''} ${broken?'failed':''}"/><text class="link-label" x="${shortcut?520:(x+xx)/2}" y="${shortcut?402:(y+yy)/2-9}">${escape(mode==='eigrp'?'':c)}${broken?' ×':''}</text></g>`;}).join('')}${Object.entries(points).map(([n,[x,y]])=>`<g class="node ${(s.visited||[]).includes(n)?'visited':''} ${s.current===n?'current':''}"><circle cx="${x}" cy="${y}" r="${bgp?34:23}"/><text x="${x}" y="${y+5}">${escape(prefix?({A:'A',B:'R2',C:'R3',D:'ISP',E:'R4',F:'R5'}[n]):n)}</text></g>`).join('')}${packet&&s.current?'<circle class="packet" cx="'+points[s.current][0]+'" cy="'+(points[s.current][1]-32)+'" r="7"/>':''}</svg>`;
      $('[data-status]').textContent=s.message;
      $('[data-counter]').textContent=`Passo ${index+1} / ${steps.length}`;
      $('[data-rows]').innerHTML=(s.rows||[]).map(([a,b])=>`<tr><th scope="row">${escape(a)}</th><td>${escape(b)}</td></tr>`).join('');
      $('.visual-table').hidden=!(s.rows||[]).length;
      $('[data-action="prev"]').disabled=index===0;$('[data-action="next"]').disabled=index===steps.length-1;
      if(index===steps.length-1)stop();
    }
    function reset(){
      stop();index=0;const mode=$('[data-mode]').value,packet=['packet','diagnostic'].includes(mode);
      const allowed=mode==='prefix'?['ip']:packet?['ttl','scenario']:mode==='bgp'?['policy']:mode==='eigrp'?['strict']:['static','ospf'].includes(mode)?[]:['failed','expensive'];
      panel.querySelectorAll('[data-option]').forEach(el=>{el.hidden=!allowed.includes(el.dataset.option);});
      const scenario=$('[data-scenario]').value;
      steps=V.simulate(mode,{ip:$('[data-ip]').value,ttl:Number($('[data-ttl]').value),failed:packet?(scenario==='failure'?'E-H':''):(['static','ospf'].includes(mode)?'E-H':$('[data-failed]').value),expensive:!['static','ospf'].includes(mode)&&$('[data-expensive]').value==='yes',noReturn:scenario==='return',asymmetric:scenario==='asymmetric',policy:$('[data-policy]').value,strict:$('[data-strict]').value==='yes'});
      $('[data-limit]').textContent=mode==='prefix'?'Vista logica delle uscite della tabella: non è la topologia A–L. Le rotte sono già installate.' :mode==='bgp'?'Modello BGP ridotto: filtri → LOCAL_PREF → lunghezza AS_PATH, a parità degli altri criteri. ASN privati; nessuna simulazione del best-path completo.':mode==='eigrp'?'Dimostrazione della condizione RD < FD con metriche già assegnate. Non implementa DUAL completo né il calcolo della metrica da banda e ritardo.':packet?'Tutti i link sono Ethernet; MAC indicati simbolicamente per interfaccia. Nessun NAT. Rotte già installate; il ritorno può essere diverso dall’andata.':mode==='rip'?'Round sincroni verso il router L (distanza locale 0). Ogni link vale un hop; 16 significa irraggiungibile. Ogni modifica riparte da zero: non simula count-to-infinity o timer.':mode==='isis'?'SPF su un singolo livello con costi simmetrici. Non simula L1/L2, LSP o adiacenze IS-IS.':'Modello didattico con costi simmetrici e una sola area. A parità di costo viene mostrato un percorso; ECMP e timer non sono simulati.';
      draw();
    }
    panel.querySelectorAll('select').forEach(el=>el.addEventListener('change',reset));
    $('[data-action="next"]').addEventListener('click',()=>{stop();index=Math.min(index+1,steps.length-1);draw();});
    $('[data-action="prev"]').addEventListener('click',()=>{stop();index=Math.max(index-1,0);draw();});
    $('[data-action="reset"]').addEventListener('click',reset);
    $('[data-action="play"]').addEventListener('click',()=>{if(timer){stop();return;}players.forEach(p=>p.stop());if(index===steps.length-1){index=0;draw();}timer=setInterval(()=>{index=Math.min(index+1,steps.length-1);draw();},1800);$('[data-action="play"]').textContent='Pausa';$('[data-action="play"]').setAttribute('aria-pressed','true');});
    reset();
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)players.forEach(p=>p.stop());});
  window.addEventListener('pagehide',()=>players.forEach(p=>p.stop()));
})();

