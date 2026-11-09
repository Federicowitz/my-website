(function(root) {
  'use strict';
  const R = typeof module !== 'undefined' && module.exports ? require('./routing-core.js') : root.Routing;
  const nodes = {A:[80,210],B:[230,70],C:[230,210],D:[230,350],E:[420,70],F:[420,210],G:[420,350],H:[610,70],I:[610,210],J:[610,350],K:[790,140],L:[790,280]};
  const edges = [['A','B',2],['A','C',8],['A','D',3],['B','E',2],['B','C',2],['C','F',6],['C','D',2],['D','G',3],['E','H',2],['E','F',2],['F','I',5],['F','G',2],['G','J',3],['H','K',2],['H','I',2],['I','L',5],['I','J',2],['J','L',3],['K','L',2],['C','L',20]];
  const asNodes = {'64512':[70,210],'64520':[270,70],'64530':[470,70],'64540':[700,210],'64550':[370,350],'64560':[600,350]};
  const asEdges = [['64512','64520',''],['64520','64530',''],['64530','64540',''],['64512','64550',''],['64550','64540',''],['64512','64560',''],['64560','64540','']];
  function graph(failed='', expensive=false) {return edges.filter(([a,b])=>`${a}-${b}`!==failed).map(([a,b,c])=>[a,b,expensive&&a==='E'&&b==='H'?18:c]);}
  function shortest(es=edges) {return R.pathTo(R.dijkstra(es,'A').at(-1),'L');}
  function cost(path,es=edges) {return path.slice(1).reduce((sum,b,i)=>sum+(es.find(([x,y])=>x===path[i]&&y===b||y===path[i]&&x===b)?.[2]??Infinity),0);}
  function vectorPath(step,start='A',target='L') {const path=[start];while(path.at(-1)!==target){const n=step.next[path.at(-1)];if(!n||path.includes(n))return [];path.push(n);}return path;}
  function packet({ttl=8,failed='',noReturn=false,asymmetric=false,noRoute=false}={}) {
    const forward=['PC',...shortest(),'Server'];
    const backward=asymmetric?['Server','L','J','G','D','A','PC']:[...forward].reverse();
    const steps=[{path:[],current:'PC',message:'PC 192.0.2.10 → Server 198.51.100.10. Il server è remoto: ARP risolve il MAC del gateway A.',rows:[['IP destinazione','198.51.100.10'],['TTL iniziale',ttl]]}];
    for(const [direction,path] of [['Andata',forward],['Ritorno',backward]]) {
      let remaining=ttl;
      for(let i=0;i<path.length-1;i++) {
        const from=path[i],to=path[i+1],router=!!nodes[from];
        const broken=failed===`${from}-${to}`||failed===`${to}-${from}`;
        const missing = noRoute && direction === 'Andata' && from === 'A';
        const drop=missing||broken||(noReturn&&direction==='Ritorno'&&from==='L')||(router&&remaining<=1);
        if(router&&remaining<=1)remaining=0;
        if(drop){steps.push({current:from,path:path.slice(0,i+1),failed,message:missing?'A: manca una rotta per la rete del server. Il pacchetto si ferma al gateway.':remaining===0?`${from}: TTL esaurito. Il router scarta il pacchetto.`:broken?`${from}: collegamento verso ${to} guasto. Le rotte di questo esperimento non sono ancora aggiornate.`:'L: manca la rotta di ritorno verso 192.0.2.0/24. Richiesta arrivata, risposta persa.',rows:[['Esito','SCARTATO'],['TTL',remaining]]});return steps;}
        if(router)remaining--;
        steps.push({current:to,path:path.slice(0,i+2),message:`${direction}: ${from} → ${to}. ${router?'Controlla la destinazione, riduce il TTL di uno e crea il frame per il prossimo salto.':'Il mittente crea il pacchetto con il proprio TTL iniziale.'} ${to==='Server'?'Richiesta consegnata; il server genera una risposta indipendente.':to==='PC'?'Risposta consegnata: scambio completato.':''}`,rows:[['IP sorgente',direction==='Andata'?'192.0.2.10':'198.51.100.10'],['IP destinazione',direction==='Andata'?'198.51.100.10':'192.0.2.10'],['Frame Ethernet',`MAC ${from} (uscita) → MAC ${to} (ingresso)`],['TTL sul collegamento',remaining],['Prossimo salto',to]]});
      }
    }
    return steps;
  }
  function bgp(policy='equal', full=true) {
    const routes=[{via:'64520',path:['64520','64530','64540'],lp:policy==='prefer'?200:100},{via:'64550',path:['64550','64540'],lp:100},{via:'64560',path:['64560','64540'],lp:80}];
    if (!full) routes.pop();
    const accepted=routes.filter(r=>policy!=='filter'||r.via!=='64550');
    const winner=[...accepted].sort((a,b)=>b.lp-a.lp||a.path.length-b.path.length)[0];
    const rows=routes.map(r=>[`via AS ${r.via}`,`Preferenza locale ${r.lp} · percorso ${r.path.join(' → ')}${!accepted.includes(r)?' · FILTRATO':''}`]);
    const announcements = routes.map(route => {
      const path = [...route.path].reverse().concat('64512');
      return {path, current:'64512',
        message:`L’annuncio raggiunge l’azienda: ${path.join(' → ')}.`,
        rows:[['Rete annunciata','203.0.113.0/24'], ['Fornitore',route.via]]};
    });
    return [
      {message:'Il sistema autonomo 64540 annuncia che da lui si raggiunge la rete 203.0.113.0/24.',current:'64540'},
      ...announcements,
      {message:'L’azienda confronta le rotte ricevute e applica la preferenza locale. Le altre condizioni sono equivalenti in questo esempio.',rows},
      {message:`Scelta: via AS ${winner.via}. Prima conta la preferenza locale. A parità di preferenza conta il percorso più corto.`,rows,path:['64512',...winner.path]},
      {message:'Il traffico parte dall’azienda verso 203.0.113.0/24, nel verso opposto all’annuncio. Ogni sistema autonomo può contenere molti router.',path:['64512',...winner.path],current:'64540',rows}
    ];
  }
  function feasible(rd=7) {return rd<10;}

  function defaultRoute(configuration = 'missing') {
    const ip = '8.8.8.8';
    const routes = [
      {prefix:'192.168.1.0/24', via:'Consegna diretta'},
      {prefix:'192.168.4.0/24', via:'R3'}
    ];
    if (configuration !== 'missing') routes.push({prefix:'0.0.0.0/0', via:'R2'});
    if (configuration === 'specific') routes.push({prefix:'8.8.8.0/24', via:'R3'});
    const matching = routes.filter(route => R.matches(ip, route.prefix));
    const winner = R.lookup(ip, routes);
    const rows = routes.map(route => [route.prefix, `${route.via} · ${matching.includes(route) ? 'corrisponde' : 'non corrisponde'}`]);
    return [
      {current:'R1', message:`R1 riceve un pacchetto per ${ip}. Cerca nella propria tabella.`, rows},
      {current:'R1', message:matching.length
        ? `Prefissi compatibili: ${matching.map(route => route.prefix).join(', ')}.`
        : 'Nessuna riga è compatibile. Non c’è nemmeno una rotta predefinita.', rows},
      winner
        ? {current:winner.via, path:['R1', winner.via],
          message:`R1 sceglie ${winner.prefix} e inoltra a ${winner.via}. La consegna finale dipende dalle tappe successive.`,
          rows:[['Prefisso scelto',winner.prefix], ['Prossimo router',winner.via]]}
        : {current:'R1', message:'R1 scarta il pacchetto: manca una rotta utilizzabile.', rows:[['Esito','Scartato']]}
    ];
  }

  function spfSteps(links, target, heading) {
    const steps = R.dijkstra(links, 'A');
    const finalPath = R.pathTo(steps.at(-1), target);
    return steps.map(step => ({
      message:heading + step.message,
      path:step.current ? R.pathTo(step, step.current) : [],
      current:step.current,
      visited:step.visited,
      rows:Object.entries(step.distances).map(([node,distance]) => [node,
        `${Number.isFinite(distance) ? distance : '∞'} · precedente ${step.previous[node] || '—'} · ${step.visited.includes(node) ? 'definitiva' : 'provvisoria'}`])
    })).concat({
      path:finalPath,
      message:`Percorso da A a ${target}: ${finalPath.join(' → ')}. Costo totale ${cost(finalPath, links)}.`,
      rows:[['Prossimo salto da A',finalPath[1]]]
    });
  }

  function simulate(mode,opts={}) {
    const es=graph(opts.failed,opts.expensive);
    if (mode === 'default') return defaultRoute(opts.configuration);
    if (mode === 'spf-small') return spfSteps(R.graph, 'D', '');
    if(mode==='prefix') {
      const ip=opts.ip||'10.1.2.34',winner=R.lookup(ip),outlets={ISP:'D',R2:'B',R3:'C',R4:'E',R5:'F'};
      const rows=R.routes.map(r=>[r.prefix,`via ${r.via} · ${R.matches(ip,r.prefix)?'compatibile':'non compatibile'}`]);
      return [{current:'A',message:`Arriva ad A un pacchetto per ${ip}. Queste sono rotte già installate, con prefissi sovrapposti.`,rows},{current:'A',message:`Confronto i bit del prefisso con ${ip}. Restano le sole rotte compatibili.`,rows:rows.filter((r,i)=>R.matches(ip,R.routes[i].prefix))},{path:['A',outlets[winner.via]],current:outlets[winner.via],message:`Vince ${winner.prefix}, il prefisso compatibile più lungo. Inoltro verso ${winner.via}. Il prossimo router prenderà la decisione successiva.`,rows:[['Destinazione',ip],['Prefisso scelto',winner.prefix],['Prossimo salto',winner.via]]}];
    }
    if (mode === 'manual') {
      const scenario = opts.noRoute ? 'no-route' : opts.noReturn ? 'no-return' : 'ok';
      const frames = R.trace({via:opts.via || 'R3', scenario});
      return frames.map(step => ({
        current:step.node,
        path:step.from ? [step.from, step.to] : [],
        message:step.message,
        rows:[['Viaggio',step.direction], ['TTL',step.ttl]]
      }));
    }
    if(mode==='packet'||mode==='diagnostic')return packet(opts);
    if(mode==='bgp')return bgp(opts.policy,opts.full);
    if(mode==='rip')return R.distanceVector(es,'L').map(s=>({message:s.message,path:vectorPath(s),visited:Object.keys(s.distances).filter(n=>s.distances[n]<16),rows:Object.entries(s.distances).map(([node,distance])=>[
      node, distance===16 ? 'Irraggiungibile (16)' : `${distance} ${distance===1?'salto':'salti'} · prossimo router ${s.next[node]||'—'}`
    ])}));
    if(mode==='eigrp') {
      const rd=opts.strict?12:7;
      return [{current:'A',path:shortest(),message:'A usa B. Il costo di riferimento di A è 10. D propone una strada alternativa.',rows:[['B · vicino in uso','distanza totale 10'],['D · alternativa',`distanza annunciata ${rd}; distanza totale ${rd+6}`]]},{current:'A',path:['A','D'],message:`La distanza annunciata da D (${rd}) è minore del costo di riferimento (10)? ${feasible(rd)?'Sì: D offre una strada di riserva già verificata.':'No: Questa verifica non basta per usare subito la strada via D.'}`,rows:[['Condizione sufficiente','Distanza annunciata dal vicino minore del costo di riferimento']]},{current:'A',path:feasible(rd)?['A','D','G','J','L']:[],failed:'A-B',message:feasible(rd)?'Perso il collegamento a B, A può usare subito D.':'Perso il collegamento a B, A deve chiedere informazioni ai vicini prima di scegliere una nuova strada.',rows:[['Stato',feasible(rd)?'Alternativa disponibile':'Ricerca di un’alternativa']]}];
    }
    if(mode==='static'||mode==='ospf') {
      const failed=opts.failed||'E-H',fresh=graph(failed,opts.expensive),old=shortest(),route=shortest(fresh);
      const [near, far] = failed.split('-');
      const untilFailure = old.slice(0, old.indexOf(near) + 1);
      const before = {path:old, message:`Percorso iniziale da A a L, costo ${cost(old)}.`};
      const detected = {failed, path:untilFailure, current:near,
        message:`${near} e ${far} rilevano che il collegamento ${failed} si è interrotto. Il pacchetto sul vecchio percorso può fermarsi a ${near}.`};
      if (mode === 'static') return [before, detected, {
        failed, path:untilFailure, current:'A',
        message:'A continua a usare B, che è ancora raggiungibile. La rotta manuale resta in uso finché non viene cambiata.',
        rows:[['Esito','Serve impostare un percorso alternativo']]
      }];
      return [before, detected,
        {failed, visited:[near,far], message:`${near} e ${far} aggiornano gli annunci. La notizia passa da vicino a vicino sui collegamenti ancora attivi.`},
        {failed, current:'A', visited:Object.keys(nodes), message:'A ha ricevuto la notizia. La sua mappa aggiornata esclude il collegamento interrotto.'},
        {failed, current:'A', message:'A ricalcola con Dijkstra e installa la nuova rotta verso L.',
          rows:[['Costo precedente',cost(old)],['Costo nuovo',cost(route,fresh)],['Prossimo salto',route[1]]]},
        {failed, path:route, message:`Dopo la convergenza i nuovi pacchetti possono seguire ${route.join(' → ')}. Quelli già scartati non vengono recuperati da OSPF.`}
      ];
    }
    return spfSteps(es, 'L', mode === 'isis' ? 'IS-IS, singolo livello · ' : 'Dijkstra · ');
  }
  const api={smallNodes:R.nodes,smallEdges:R.links.map(link=>link.slice(0,2)),smallGraph:R.graph,nodes,edges,asNodes,asEdges,graph,shortest,cost,packet,bgp,feasible,simulate};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.RoutingVisual=api;
})(typeof window==='undefined'?globalThis:window);
