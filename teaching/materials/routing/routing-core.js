(function (root) {
  'use strict';
  const nodes = {PC1:[65,180], R1:[230,180], R2:[420,65], R3:[420,295], R4:[610,180], PC4:[775,180]};
  const links = [
    ['PC1','R1','192.168.1.0/24','192.168.1.10','192.168.1.1'],
    ['R1','R2','192.168.12.0/24','192.168.12.1','192.168.12.2'],
    ['R1','R3','192.168.13.0/24','192.168.13.1','192.168.13.3'],
    ['R2','R4','192.168.24.0/24','192.168.24.2','192.168.24.4'],
    ['R3','R4','192.168.34.0/24','192.168.34.3','192.168.34.4'],
    ['R4','PC4','192.168.4.0/24','192.168.4.4','192.168.4.10']
  ];
  const graph = [['A','B',2],['A','C',5],['B','C',1],['B','D',4],['C','D',2]];
  function ipv4(value) {
    if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(value)) throw new Error('Inserisci quattro ottetti IPv4, da 0 a 255.');
    const bytes = value.split('.').map(Number);
    if (bytes.some(n => n > 255)) throw new Error('Ogni ottetto deve essere compreso tra 0 e 255.');
    return bytes.reduce((n,b) => n * 256 + b,0);
  }
  function matches(ip, cidr) {
    const [network, bits] = cidr.split('/'), prefix = Number(bits);
    if (!/^\d+$/.test(bits || '') || prefix < 0 || prefix > 32) throw new Error('Prefisso IPv4 non valido.');
    const size = 2 ** (32 - prefix);
    return Math.floor(ipv4(ip) / size) === Math.floor(ipv4(network) / size);
  }
  const routes = [
    {prefix:'0.0.0.0/0', via:'ISP', source:'S*', ad:1},
    {prefix:'10.0.0.0/8', via:'R2', source:'S', ad:1},
    {prefix:'10.1.0.0/16', via:'R3', source:'O', ad:110},
    {prefix:'10.1.2.0/24', via:'R4', source:'O', ad:110},
    {prefix:'10.1.2.34/32', via:'R5', source:'S', ad:1}
  ];
  function lookup(ip, table = routes) {
    ipv4(ip);
    return table.filter(r => matches(ip,r.prefix)).sort((a,b) => Number(b.prefix.split('/')[1])-Number(a.prefix.split('/')[1]))[0] || null;
  }
  function dijkstra(edges = graph, start = 'A') {
    const names = [...new Set(edges.flatMap(e => e.slice(0,2)))].sort();
    if (!names.includes(start) || edges.some(e => !Number.isFinite(e[2]) || e[2] < 0)) throw new Error('Grafo non valido.');
    const distances = Object.fromEntries(names.map(n => [n,Infinity])), previous = {}, visited = [];
    distances[start] = 0;
    const snapshot = (current, message) => ({current, message, distances:{...distances},previous:{...previous},visited:[...visited]});
    const steps = [snapshot(null, `Inizializzazione: ${start} = 0; tutti gli altri nodi hanno distanza infinita.`)];
    while (visited.length < names.length) {
      const current = names.filter(n => !visited.includes(n)).sort((a,b) => distances[a]-distances[b] || a.localeCompare(b))[0];
      if (distances[current] === Infinity) break;
      visited.push(current);
      const changes = [];
      for (const [a,b,cost] of edges) {
        const neighbor = a === current ? b : b === current ? a : null;
        if (!neighbor || visited.includes(neighbor)) continue;
        const candidate = distances[current] + cost;
        if (candidate < distances[neighbor]) {
          changes.push(`${neighbor}: ${distances[neighbor] === Infinity ? '∞' : distances[neighbor]} → ${candidate} via ${current}`);
          distances[neighbor] = candidate; previous[neighbor] = current;
        }
      }
      steps.push(snapshot(current, `Fisso ${current} a costo ${distances[current]}. ${changes.length ? 'Aggiorno ' + changes.join('; ') + '.' : 'Nessun miglioramento.'}`));
    }
    return steps;
  }
  function pathTo(step, target) {
    if (!Number.isFinite(step.distances[target])) return [];
    const path = [target];
    while (step.previous[path[0]]) path.unshift(step.previous[path[0]]);
    return path;
  }
  function trace({via = 'R3', scenario = 'ok', ttl = 64} = {}) {
    if (!['R2','R3'].includes(via) || !Number.isInteger(ttl) || ttl < 1 || ttl > 255) throw new Error('Parametri del pacchetto non validi.');
    const outward = ['PC1','R1',via,'R4','PC4'];
    const backward = [...outward].reverse();
    const frames = [{node:'PC1',ttl, direction:'andata',message:'PC1 confronta le subnet: PC4 è remoto. Risolve via ARP il MAC del gateway R1. Il pacchetto mantiene come destinazione 192.168.4.10.'}];
    for (const [direction,path] of [['andata',outward],['ritorno',backward]]) {
      let remaining = ttl;
      for (let i=0; i<path.length-1; i++) {
        const from=path[i], to=path[i+1];
        const error = scenario === 'no-route' && from === 'R1' && direction === 'andata' ? 'R1 non ha una rotta per 192.168.4.0/24 né una default. Il pacchetto viene scartato.' :
          scenario === 'no-return' && from === 'R4' && direction === 'ritorno' ? 'La richiesta è arrivata a PC4, ma R4 non ha una rotta di ritorno per 192.168.1.0/24. La risposta viene scartata: il ping fallisce.' :
          from.startsWith('R') && remaining <= 1 ? `${from} decrementerebbe il TTL a 0: scarta il pacchetto e può generare ICMP Time Exceeded.` : null;
        if (error) {frames.push({node:from,ttl:remaining <= 1 ? 0 : remaining,direction,drop:true,message:error});return frames;}
        if (from.startsWith('R')) remaining--;
        const link = links.find(l => l.includes(from) && l.includes(to));
        const forward = link[0] === from;
        const src = forward ? link[3] : link[4], dest = forward ? link[4] : link[3];
        const mac = ip => '02:00:' + ip.split('.').map(b => Number(b).toString(16).padStart(2,'0')).join(':');
        const decision = from.startsWith('PC') ? 'Destinazione remota: frame al gateway.' : to.startsWith('PC') ? 'Rete Connected: consegna diretta tramite ARP.' : `Rotta per la LAN remota: prossimo hop ${dest}.`;
        frames.push({node:to,from,to,ttl:remaining,direction,macSource:mac(src),macDestination:mac(dest),nextHop:dest,
          message:`${from} → ${to}. ${decision} ${from.startsWith('R') ? 'Il router decrementa il TTL e costruisce un nuovo frame Ethernet.' : 'Il mittente non decrementa il TTL iniziale.'} ${to === 'PC4' ? 'PC4 riceve la richiesta e prepara la risposta con un nuovo TTL iniziale.' : to === 'PC1' ? 'PC1 riceve la risposta: scambio completato.' : ''}`});
      }
    }
    return frames;
  }
  function distanceVector(edges = graph, target = 'D') {
    const names = [...new Set(edges.flatMap(e => e.slice(0,2)))].sort();
    let distances = Object.fromEntries(names.map(n => [n,n === target ? 0 : 16])), next = {};
    const steps = [{distances:{...distances},next:{},message:`Solo ${target} conosce la propria destinazione: distanza 0. Gli altri hanno 16, cioè irraggiungibile in RIP.`}];
    for (let round=1; round<=names.length; round++) {
      const updated = {...distances}, hops = {...next};
      for (const node of names.filter(n => n !== target)) {
        for (const [a,b] of edges) {
          const neighbor = a === node ? b : b === node ? a : null;
          if (neighbor && distances[neighbor]+1 < updated[node]) {updated[node]=Math.min(16,distances[neighbor]+1);hops[node]=neighbor;}
        }
      }
      const stable = names.every(n => distances[n] === updated[n]);
      distances=updated;next=hops;
      steps.push({distances:{...distances},next:{...next},message:stable ? `Nessuna distanza cambia: il modello è convergente verso ${target}. I costi scritti sui link non contano per RIP.` : `Round ${round}: ogni router usa gli annunci del round precedente e aggiunge 1 hop. Distanze massime utilizzabili: 15; 16 indica irraggiungibile.`});
      if (stable) break;
    }
    return steps;
  }
  const api = {nodes,links,graph,routes,ipv4,matches,lookup,dijkstra,pathTo,trace,distanceVector};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Routing = api;
})(typeof window === 'undefined' ? globalThis : window);
