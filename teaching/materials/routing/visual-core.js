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
  function packet({ttl=8,failed='',noReturn=false,asymmetric=false}={}) {
    const forward=['PC',...shortest(),'Server'];
    const backward=asymmetric?['Server','L','J','G','D','A','PC']:[...forward].reverse();
    const steps=[{path:[],current:'PC',message:'PC 192.0.2.10 → Server 198.51.100.10. Il server è remoto: ARP risolve il MAC del gateway A.',rows:[['IP destinazione','198.51.100.10'],['TTL iniziale',ttl]]}];
    for(const [direction,path] of [['Andata',forward],['Ritorno',backward]]) {
      let remaining=ttl;
      for(let i=0;i<path.length-1;i++) {
        const from=path[i],to=path[i+1],router=!!nodes[from];
        const broken=failed===`${from}-${to}`||failed===`${to}-${from}`;
        const drop=broken||(noReturn&&direction==='Ritorno'&&from==='L')||(router&&remaining<=1);
        if(router&&remaining<=1)remaining=0;
        if(drop){steps.push({current:from,path:path.slice(0,i+1),failed,message:remaining===0?`${from}: TTL esaurito, scarto e possibile ICMP Time Exceeded.`:broken?`${from}: collegamento verso ${to} guasto. Le rotte di questo esperimento non sono ancora aggiornate.`:'L: manca la rotta di ritorno verso 192.0.2.0/24. Richiesta arrivata, risposta persa.',rows:[['Esito','SCARTATO'],['TTL',remaining]]});return steps;}
        if(router)remaining--;
        steps.push({current:to,path:path.slice(0,i+2),message:`${direction}: ${from} → ${to}. ${router?'Lookup della destinazione, TTL − 1, nuovo frame per il prossimo hop.':'Il mittente crea il pacchetto con il proprio TTL iniziale.'} ${to==='Server'?'Richiesta consegnata; il server genera una risposta indipendente.':to==='PC'?'Risposta consegnata: scambio completato.':''}`,rows:[['IP sorgente',direction==='Andata'?'192.0.2.10':'198.51.100.10'],['IP destinazione',direction==='Andata'?'198.51.100.10':'192.0.2.10'],['Frame Ethernet',`MAC ${from} (uscita) → MAC ${to} (ingresso)`],['TTL sul collegamento',remaining],['Next hop',to]]});
      }
    }
    return steps;
  }
  function bgp(policy='equal') {
    const routes=[{via:'64520',path:['64520','64530','64540'],lp:policy==='prefer'?200:100},{via:'64550',path:['64550','64540'],lp:100},{via:'64560',path:['64560','64540'],lp:80}];
    const accepted=routes.filter(r=>policy!=='filter'||r.via!=='64550');
    const winner=[...accepted].sort((a,b)=>b.lp-a.lp||a.path.length-b.path.length)[0];
    const rows=routes.map(r=>[`via AS ${r.via}`,`LOCAL_PREF ${r.lp}; AS_PATH ${r.path.join(' ')}${!accepted.includes(r)?' · FILTRATO':''}`]);
    return [{message:'AS 64540 origina 203.0.113.0/24. Gli annunci si propagano verso AS 64512; il traffico viaggerà verso la destinazione.',current:'64540',rows}, {message:'Import: applico filtri e LOCAL_PREF. Le tre rotte hanno NEXT_HOP raggiungibili; gli altri attributi precedenti sono equivalenti.',rows}, {message:`Scelta: via AS ${winner.via}. Prima la LOCAL_PREF più alta, poi l’AS_PATH più breve fra i candidati rimasti.`,rows,path:['64512',...winner.path]}, {message:'Inoltro del traffico verso 203.0.113.0/24 lungo gli AS evidenziati. Ogni AS contiene una propria rete di router: questi nodi non sono hop IP.',path:['64512',...winner.path],current:'64540',rows}];
  }
  function feasible(rd=7) {return rd<10;}
  function simulate(mode,opts={}) {
    const es=graph(opts.failed,opts.expensive);
    if(mode==='prefix') {
      const ip=opts.ip||'10.1.2.34',winner=R.lookup(ip),outlets={ISP:'D',R2:'B',R3:'C',R4:'E',R5:'F'};
      const rows=R.routes.map(r=>[r.prefix,`next hop ${r.via}; AD ${r.ad}; ${R.matches(ip,r.prefix)?'compatibile':'non compatibile'}`]);
      return [{current:'A',message:`Arriva ad A un pacchetto per ${ip}. Queste sono rotte già installate, con prefissi sovrapposti.`,rows},{current:'A',message:`Confronto i bit del prefisso con ${ip}. Restano le sole rotte compatibili; non confronto l’AD di prefissi diversi.`,rows:rows.filter((r,i)=>R.matches(ip,R.routes[i].prefix))},{path:['A',outlets[winner.via]],current:outlets[winner.via],message:`Vince ${winner.prefix}, il prefisso compatibile più lungo. Inoltro verso ${winner.via}. Il router sceglie un next hop, non l’intero percorso.`,rows:[['Destinazione',ip],['Prefisso scelto',winner.prefix],['Next hop',winner.via]]}];
    }
    if(mode==='packet'||mode==='diagnostic')return packet(opts);
    if(mode==='bgp')return bgp(opts.policy);
    if(mode==='rip')return R.distanceVector(es,'L').map(s=>({message:s.message,path:vectorPath(s),visited:Object.keys(s.distances).filter(n=>s.distances[n]<16),rows:Object.keys(nodes).map(n=>[n,`${s.distances[n]} hop${s.distances[n]===16?' · irraggiungibile':''}; next hop ${s.next[n]||'—'}`])}));
    if(mode==='eigrp') {
      const rd=opts.strict?12:7;
      return [{current:'A',path:shortest(),message:'Esempio DUAL separato dai costi SPF: A ha successor B e feasible distance di riferimento 10. Metriche EIGRP già calcolate, in unità didattiche.',rows:[['B · successor','distanza totale 10'],['D · alternativa',`reported distance ${rd}; distanza totale ${rd+6}`]]},{current:'A',path:['A','D'],message:`Controllo D: RD ${rd} < FD 10? ${feasible(rd)?'Sì: D è un feasible successor, anche se la sua distanza totale è maggiore.':'No: D non è un feasible successor. Non significa che il percorso sia necessariamente in loop.'}`,rows:[['Condizione sufficiente','RD del vicino < FD di riferimento']]},{current:'A',path:feasible(rd)?['A','D','G','J','L']:[],failed:'A-B',message:feasible(rd)?'Perdita del successor B: D è già un’alternativa ammissibile e può essere promosso. Il percorso evidenziato illustra la sua uscita.':'Perdita di B, nessun feasible successor nel modello: stato Active, Query/Reply prima di una nuova decisione. Non si sceglie automaticamente D.',rows:[['Stato',feasible(rd)?'Passive · alternativa disponibile':'Active · ricerca distribuita']]}];
    }
    if(mode==='static'||mode==='ospf') {
      const failed=opts.failed||'E-H',fresh=graph(failed,opts.expensive),old=shortest(),route=shortest(fresh);
      return [{path:old,message:'Prima del guasto: percorso installato A → L, costo '+cost(old)+'.',rows:[]},{failed,path:old.slice(0,old.indexOf(failed.split('-')[0])+1),message:`Si interrompe ${failed}. La vecchia rotta non garantisce più la consegna.`,rows:[]},...(mode==='static'?[{failed,path:old,message:'Statica senza tracking o backup: A continua a usare B, che è ancora raggiungibile. Un guasto remoto non insegna ad A una nuova strada.',rows:[['Esito','Serve configurazione o backup predisposto']]}]:[{failed,visited:Object.keys(nodes),message:'Flooding delle nuove informazioni link-state sulle adiacenze superstiti: aggiornamento delle LSDB nella stessa area. Schema logico, non temporizzazione dei messaggi.',rows:[]},{failed,message:'Ogni router ricalcola SPF dalla propria radice. Qui osserviamo A: aggiorna la rotta per L.',rows:[['Costo precedente',cost(old)],['Costo nuovo',cost(route,fresh)]]},{failed,path:route,message:'Dopo la convergenza: '+route.join(' → ')+'. OSPF non recupera i pacchetti persi durante il guasto.',rows:[]}])];
    }
    return R.dijkstra(es,'A').map(s=>({message:(mode==='isis'?'IS-IS, singolo livello: ':'SPF: ')+s.message,path:s.current?R.pathTo(s,s.current):[],current:s.current,visited:s.visited,rows:Object.keys(nodes).map(n=>[n,`${Number.isFinite(s.distances[n])?s.distances[n]:'∞'} · via ${s.previous[n]||'—'} · ${s.visited.includes(n)?'definitiva':'provvisoria'}`])})).concat([{path:shortest(es),message:`Percorso finale A → L: ${shortest(es).join(' → ')}. Costo ${cost(shortest(es),es)}. ${mode==='isis'?'È il calcolo SPF dentro un livello, non una simulazione della gerarchia L1/L2.':'I costi sono configurati: non rappresentano automaticamente latenza o traffico.'}`,rows:[]}]);
  }
  const api={nodes,edges,asNodes,asEdges,graph,shortest,cost,packet,bgp,feasible,simulate};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.RoutingVisual=api;
})(typeof window==='undefined'?globalThis:window);
