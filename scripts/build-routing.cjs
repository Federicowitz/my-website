const fs = require('node:fs');
const path = require('node:path');
const R = require('../teaching/materials/routing/routing-core.js');
const lessons = require('./routing-lessons.cjs');
const { lessonPanels, visualPanel } = require('./routing-visual-content.cjs');

const folder = path.resolve(__dirname, '../teaching/materials/routing');
const escape = value => String(value).replace(/[&<>"']/g, char =>
  ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'})[char]);
const visualScripts = '<script src="routing-core.js"></script><script src="visual-core.js"></script><script src="visual-labs.js"></script>';

function page(file, title, lead, body, kind = 'lesson', scripts = '') {
  fs.writeFileSync(path.join(folder, file), `<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(title)}</title><meta name="description" content="${escape(lead)}"><meta name="school-kind" content="${kind}">
<link rel="stylesheet" href="../../reader.css"><link rel="stylesheet" href="routing.css"></head>
<body><main class="reading routing-reading">
<p class="eyebrow">ROUTING · DALLE RETI AI PERCORSI</p><h1>${escape(title)}</h1><p class="lead">${escape(lead)}</p>
${body}
<p class="source-note"><a href="mappa.html">Mappa del percorso</a> · <a href="fonti.html">Riferimenti</a></p></main>${scripts}</body></html>
`);
}

function diagram(points, edges, label) {
  return `<div class="network-scroll"><svg class="network-svg" viewBox="0 0 840 365" role="img" aria-label="${label}">
${edges.map(([from, to, cost]) => {
    const [x1, y1] = points[from], [x2, y2] = points[to];
    return `<line class="edge" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>` +
      (cost === undefined ? '' : `<text class="link-label" x="${(x1+x2)/2+18}" y="${(y1+y2)/2-12}">${cost}</text>`);
  }).join('')}
${Object.entries(points).map(([node, [x,y]]) => `<g class="node"><circle cx="${x}" cy="${y}" r="28"/><text x="${x}" y="${y+6}">${node}</text></g>`).join('')}
</svg></div>`;
}

// The introductory lessons are maintained as standalone pages.
const basics = [
  ['01-fondamenti.html', '01 · Reti, livelli e dispositivi'],
  ['02-indirizzi.html', '02 · IP, MAC, subnet e NAT'],
  ['03-viaggio-applicazione.html', '03 · Dall’applicazione alla rete']
];
for (const { file, title, lead, body, extra = '' } of lessons) {
  const key = file.slice(0,2);
  let content = body;
  if (key === '04') {
    const network = diagram(R.nodes, R.links.map(link => link.slice(0,2)),
      'PC1 è collegato a R1. Da R1 si raggiunge R4 attraverso R2 oppure R3. R4 è collegato a PC4.');
    content = body.replace('<p class="callout"><strong>Andata', network + '<p class="callout"><strong>Andata');
  }
  if (key === '07') {
    const graph = diagram({ A:[140,180], B:[380,65], C:[380,300], D:[670,180] }, R.graph,
      'A–B costa 2, A–C costa 5, B–C costa 1, B–D costa 4 e C–D costa 2.');
    content = body.replace(/<pre class="diagram-code".*?<\/pre>/, graph);
  }
  page(file, title, lead, content + lessonPanels[key] + extra, key === '12' ? 'exercise' : 'lesson', visualScripts);
}

const roadmap = [...basics, ...lessons.map(({file,title}) => [file,title])];
page('mappa.html', 'Routing', 'Come fa un pacchetto a raggiungere un computer in un’altra rete?', `
<p>Segui prima un pacchetto, poi scopri come si costruiscono le rotte. Le lezioni usano una rete piccola per spiegare i primi passaggi e una rete di dodici router per mettere alla prova gli stessi concetti.</p>
<h2>Studia in ordine</h2><ol class="roadmap">${roadmap.map(([file,title]) => `<li><a href="${file}">${escape(title)}</a></li>`).join('')}</ol>
<p><a href="laboratorio.html">Simulazioni interattive</a> · <a href="test.html">Verifica finale</a> · <a href="fonti.html">Riferimenti</a></p>`);

const labLinks = [
  ['packet','04-pacchetto.html','Il viaggio del pacchetto'],
  ['prefix','05-tabella.html','La scelta del prefisso'],
  ['spf','07-dinamico-dijkstra.html','Il calcolo di Dijkstra'],
  ['failure','08-ospf.html','Le rotte dopo un guasto'],
  ['rip','09-rip-eigrp-isis.html','Imparare le distanze dai vicini']
];
page('laboratorio.html', 'Laboratorio · Come si scelgono le rotte',
  'Riprendi gli esperimenti delle lezioni oppure confrontali sulla stessa rete.', `
<ul>${labLinks.map(([id,file,label]) => `<li id="${id}"><a href="${file}#esperimento-visuale">${label}</a></li>`).join('')}</ul>
<p>Il confronto riprende Open Shortest Path First (OSPF), che usa i costi dei collegamenti, e Routing Information Protocol (RIP), che conta i salti. Nel viaggio del pacchetto, il Time To Live (TTL) è il contatore che diminuisce a ogni router.</p>
${visualPanel('laboratorio-esteso', 'packet,prefix,static,spf,ospf,rip,bgp,diagnostic',
    'Confronto completo sulla rete A–L',
    'Dodici router e venti collegamenti. Confronta le rotte manuali con quelle aggiornate dopo un guasto, oppure cerca il percorso con meno salti e quello con costo minore. Per il Border Gateway Protocol (BGP) il disegno passa a sei sistemi autonomi, le reti che si scambiano annunci su Internet.', 'full')}
<details id="protocolli-facoltativi"><summary>Approfondimento facoltativo · Altri protocolli interni</summary>
<p>L’<strong>Enhanced Interior Gateway Routing Protocol (EIGRP)</strong> verifica se un vicino può offrire una strada di riserva. Prova a cambiare la distanza che il vicino annuncia. Il modello confronta quella distanza con il valore di riferimento del router.</p>
<p><strong>Intermediate System to Intermediate System (IS-IS)</strong> usa i costi dei collegamenti per trovare la strada migliore. Qui vedi il calcolo di Dijkstra all’interno di un singolo livello.</p>
${visualPanel('protocolli-interni', 'eigrp,isis', 'Prova le due idee', 'Scegli un esperimento e avanza un passo alla volta.')}
</details>`, 'lab', visualScripts);

page('fonti.html', 'Riferimenti di networking e routing', 'Documenti tecnici per approfondire dopo le lezioni.', `
<p>Request for Comments (RFC) è il nome della serie di documenti che raccoglie questi riferimenti.</p>
<ul>
<li><a href="https://www.rfc-editor.org/rfc/rfc1812">RFC 1812 · Requisiti dei router Internet Protocol versione 4 (IPv4)</a></li>
<li><a href="https://www.rfc-editor.org/rfc/rfc4632">RFC 4632 · Prefissi e instradamento senza classi</a></li>
<li><a href="https://www.rfc-editor.org/rfc/rfc2328">RFC 2328 · Open Shortest Path First (OSPF)</a></li>
<li><a href="https://www.rfc-editor.org/rfc/rfc2453">RFC 2453 · Routing Information Protocol (RIP)</a></li>
<li><a href="https://www.rfc-editor.org/rfc/rfc4271">RFC 4271 · Border Gateway Protocol (BGP)</a></li>
<li><a href="https://www.rfc-editor.org/rfc/rfc7868">RFC 7868 · Enhanced Interior Gateway Routing Protocol (EIGRP)</a></li>
<li><a href="https://www.rfc-editor.org/rfc/rfc1195">RFC 1195 · Intermediate System to Intermediate System (IS-IS)</a></li>
</ul>`);

const questions = require('./routing-quiz.cjs');
page('test.html', 'Verifica · Networking e routing', 'Metti alla prova le competenze del corso.', `
<p>Rispondi e usa la correzione per rivedere i passaggi che ti hanno messo in difficoltà.</p>
<form id="quiz"><div class="actions"><button type="submit">Correggi il test</button><button type="button" class="secondary" id="retry">Riprova</button></div></form>
<p id="score" role="status"></p><noscript>Abilita JavaScript per svolgere il test oppure apri gli <a href="12-esercizi.html">esercizi con soluzione</a>.</noscript>`,
  'test', `<script>window.quizData=${JSON.stringify({questions})};</script><script src="../../quiz.js"></script>`);
console.log('Routing: lezioni 04–13, mappa, laboratori, riferimenti e verifica.');
