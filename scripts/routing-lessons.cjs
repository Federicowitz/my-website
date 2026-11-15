const { visualPanel } = require('./routing-visual-content.cjs');
const { links } = require('../teaching/materials/routing/routing-core.js');

const lesson05Answers = ["Rete direttamente collegata","Router R2","Router R3","Scarta il pacchetto"];
const lesson05Questions = [
  ["Destinazione 192.168.4.10", lesson05Answers, 2, "Corrispondono /24 e /0. Vince 192.168.4.0/24, quindi R1 inoltra a R3."],
  ["Destinazione 192.168.4.200", lesson05Answers, 1, "Corrispondono /25, /24 e /0. Vince 192.168.4.128/25, quindi R1 inoltra a R2."],
  ["Destinazione 192.168.1.50", lesson05Answers, 0, "Vince 192.168.1.0/24, che indica una rete direttamente collegata a R1."],
  ["Destinazione 11.23.54.253", lesson05Answers, 1, "L’unico prefisso compatibile è 0.0.0.0/0, quindi R1 inoltra a R2."],
  ["Destinazione 11.23.54.253 (senza la rotta predefinita)", lesson05Answers, 3, "Senza la /0, la tabella non contiene alcun prefisso compatibile. R1 scarta il pacchetto."]
];

const lessons = [
  {
    file: '04-pacchetto.html', title: '04 · Il viaggio di un pacchetto',
    lead: 'Segui una richiesta e la sua risposta. A ogni tappa, osserva che cosa cambia.',
    body: `
<section id="sezione-9"><h2>Il server è fuori dalla rete locale</h2>
<p>PC1 ha indirizzo 192.168.1.10/24 e vuole raggiungere PC4, all’indirizzo 192.168.4.10/24. Confrontando i prefissi, PC1 capisce che i due computer sono in reti diverse. Per uscire dalla sua rete, consegna il pacchetto al <strong>gateway</strong>, il router R1.</p></section>
<section id="sezione-10"><h2>Un router decide una tappa alla volta</h2>
<p class="callout"><strong>Andata</strong> · PC1 → R1 → R3 → R4 → PC4</p>
<p>R1 legge l’indirizzo di destinazione e consulta la propria tabella. La tabella gli indica R3 come <strong>prossimo salto</strong> (next hop). R3 prende la sua decisione e passa il pacchetto a R4, che può consegnarlo direttamente a PC4.</p>
<p>Chiamiamo <strong>instradamento</strong> (routing) il modo in cui si costruiscono le rotte, e <strong>inoltro</strong> (forwarding) l’uso di una rotta per far avanzare il singolo pacchetto.</p>
<h3>Dentro R1, un passaggio alla volta</h3>
<ol><li>R1 riceve un frame Ethernet su un’interfaccia, cioè il punto in cui è collegato alla rete locale.</li>
<li>Estrae il pacchetto IP (Internet Protocol) dal frame e legge l’indirizzo di destinazione.</li>
<li>Cerca una rotta utilizzabile per quell’indirizzo. La rotta gli indica un prossimo router oppure una rete direttamente collegata.</li>
<li>Se può inoltrare, prepara un nuovo frame adatto al collegamento d’uscita. In questo esempio lo consegna a R3, che ripeterà la ricerca nella propria tabella.</li></ol></section>
<section id="sezione-11"><h2>Che cosa cambia durante il viaggio?</h2>
<p>Seguiamo una richiesta con <strong>IPv4</strong> (Internet Protocol versione 4) su collegamenti Ethernet. Nel nostro esempio non c’è traduzione degli indirizzi di rete, detta <strong>NAT</strong> (Network Address Translation).</p>
<ul><li>Gli indirizzi IP della richiesta identificano i due computer e in questo viaggio restano uguali.</li>
<li>Gli indirizzi <strong>MAC</strong> (Media Access Control) valgono sul singolo collegamento. R1 invia a R3 un nuovo frame Ethernet con gli indirizzi delle due interfacce su quel tratto. Per trovare il MAC del prossimo destinatario locale si usa <strong>ARP</strong> (Address Resolution Protocol).</li>
<li>Il <strong>TTL</strong> (Time To Live) è un contatore che ogni router riduce di uno. Quando arriverebbe a zero, il pacchetto viene scartato.</li></ul>
<table><thead><tr><th scope="col">Tratto</th><th scope="col">Destinazione IP</th><th scope="col">Destinazione MAC del frame</th></tr></thead><tbody>
<tr><td>PC1 → R1</td><td>PC4 · 192.168.4.10</td><td>Interfaccia locale di R1</td></tr>
<tr><td>R1 → R3</td><td>PC4 · 192.168.4.10</td><td>Interfaccia di R3 verso R1</td></tr>
<tr><td>R3 → R4</td><td>PC4 · 192.168.4.10</td><td>Interfaccia di R4 verso R3</td></tr>
<tr><td>R4 → PC4</td><td>PC4 · 192.168.4.10</td><td>Interfaccia di PC4</td></tr>
</tbody></table>
<p>PC4 crea un nuovo pacchetto per rispondere. Gli indirizzi IP sono invertiti e la risposta ha un proprio TTL iniziale.</p>
<details><summary>Verifica · Di chi cerca il MAC PC1?</summary><p>Di R1, il gateway locale. L’indirizzo IP di destinazione della richiesta rimane quello di PC4.</p></details></section>
<p class="callout"><strong>E se R1 non sa dove mandare il pacchetto?</strong> R1 deve trovare una rotta utilizzabile nella sua tabella. Se non la trova, il pacchetto si ferma. Nella <a href="05-tabella.html">lezione 05</a> vedrai come il router cerca una corrispondenza e quando può usare una rotta di ripiego.</p>`
  },
  {
    file: '05-tabella.html', title: '05 · Come leggere una tabella di routing',
    lead: 'Come fa R1 a scegliere dove inoltrare un pacchetto? Leggi la sua tabella, confronta i prefissi e individua il prossimo salto.',
    body: `
<section id="sezione-12">
<h2>1. Dal routing al forwarding</h2>
<p>Nella <a href="04-pacchetto.html">lezione 04</a> abbiamo seguito un pacchetto da PC1 a PC4. Quando riceve il frame, R1 estrae il pacchetto IP e legge l’indirizzo di destinazione. Ora deve decidere dove farlo proseguire.</p>
<p>Il <strong>routing</strong> costruisce e aggiorna le informazioni sui percorsi disponibili. Il <strong>forwarding</strong>, o inoltro, usa quelle informazioni per far avanzare ogni pacchetto di una tappa.</p>

<h2>2. Che cosa contiene una tabella di routing?</h2>
<p>R1 potrebbe ricevere pacchetti per <code>192.168.1.25</code>, <code>192.168.4.10</code> o <code>8.8.8.8</code>. La tabella raggruppa le destinazioni in <strong>prefissi</strong> e indica come raggiungere gli indirizzi coperti da ciascuno.</p>
<table>
<thead><tr><th scope="col">Destinazione</th><th scope="col">Prossimo passo</th></tr></thead>
<tbody>
<tr><th scope="row"><code>192.168.1.0/24</code></th><td>Rete direttamente collegata</td></tr>
<tr><th scope="row"><code>192.168.4.0/24</code></th><td>Router R3</td></tr>
<tr><th scope="row"><code>0.0.0.0/0</code></th><td>Router R2</td></tr>
</tbody>
</table>
<ul>
<li><strong>Destinazione.</strong> Il prefisso che R1 confronta con l’indirizzo IP del pacchetto.</li>
<li><strong>Prossimo salto (next hop).</strong> Il router vicino a cui affidare il pacchetto quando la rotta passa per un altro router. Qui usiamo i nomi R2 e R3. In una tabella reale si vede normalmente l’indirizzo IP dell’interfaccia del vicino.</li>
<li><strong>Interfaccia di uscita.</strong> L’interfaccia collegata alla rete di destinazione o al collegamento attraverso cui raggiungere il prossimo salto.</li>
</ul>
</section>

<section id="tabelle-reali">
<h2>3. Leggere le tabelle di Windows e Linux</h2>
<p>Anche un computer consulta una tabella di routing per scegliere se consegnare un pacchetto sul collegamento locale oppure passarlo a un gateway.</p>
<h3>Windows</h3>
<p>Il comando <code>route print</code> mostra, tra le altre informazioni, le rotte attive IPv4.</p>
<table>
<thead><tr><th scope="col">Network Destination</th><th scope="col">Netmask</th><th scope="col">Gateway</th><th scope="col">Interface</th><th scope="col">Metric</th></tr></thead>
<tbody>
<tr><td>0.0.0.0</td><td>0.0.0.0</td><td>192.168.122.1</td><td>192.168.122.128</td><td>261</td></tr>
<tr><td>192.168.122.0</td><td>255.255.255.0</td><td>On-link</td><td>192.168.122.128</td><td>261</td></tr>
<tr><td>192.168.122.128</td><td>255.255.255.255</td><td>On-link</td><td>192.168.122.128</td><td>261</td></tr>
</tbody>
</table>
<p class="legend">Estratto delle rotte attive IPv4 dalla <a href="https://lia.disi.unibo.it/Courses/AmmSistemi1819/ARP-Forwarding-Walter-Cerroni.pdf#page=29">schermata di <code>route print</code> dell’Università di Bologna</a>.</p>
<ul>
<li>La maschera <code>0.0.0.0</code> equivale a <code>/0</code>. La prima riga indica il gateway predefinito <code>192.168.122.1</code>.</li>
<li>La maschera <code>255.255.255.0</code> equivale a <code>/24</code>. <code>On-link</code> indica che la rete <code>192.168.122.0/24</code> è sul collegamento locale.</li>
<li>La maschera <code>255.255.255.255</code> equivale a <code>/32</code>. La riga copre un solo indirizzo, quello del computer stesso.</li>
</ul>
<p><code>Interface</code> mostra l’indirizzo locale dell’interfaccia. <code>Metric</code> contiene un valore usato nella valutazione delle rotte.</p>
<h3>Linux</h3>
<p>Il comando <code>ip -4 route show</code> mostra le rotte IPv4. In questo esempio il computer usa <code>eth0</code> per entrambe le rotte.</p>
<pre><code>$ ip -4 route show
default via 172.26.36.1 dev eth0
172.26.36.0/22 dev eth0 proto kernel scope link src 172.26.39.198</code></pre>
<ul>
<li><code>default via 172.26.36.1</code> indica il gateway predefinito.</li>
<li><code>172.26.36.0/22 dev eth0</code> senza <code>via</code> indica una rete direttamente collegata a <code>eth0</code>. In questa riga <code>scope link</code> descrive il collegamento locale.</li>
<li><code>src 172.26.39.198</code> è l’indirizzo sorgente preferito per il traffico generato dal computer che usa questa rotta.</li>
</ul>
<p>Per la sintassi dei campi, consulta il <a href="https://www.man7.org/linux/man-pages/man8/ip-route.8.html">manuale di <code>ip route</code></a>.</p>
</section>

<section id="sezione-14">
<h2>4. Come decide R1?</h2>
<p>Torniamo alla tabella semplificata. PC1 ha indirizzo <code>192.168.1.10</code> e usa R1 come gateway. Quando la destinazione è fuori dalla rete locale, PC1 consegna il frame a R1. R1 legge l’indirizzo IP di destinazione e consulta la propria tabella.</p>
<dl>
<dt><strong><code>192.168.4.10</code> · R3</strong></dt>
<dd>È l’indirizzo di PC4. Corrisponde a <code>192.168.4.0/24</code> e a <code>0.0.0.0/0</code>. R1 usa la rotta più specifica, la <code>/24</code>, e affida il pacchetto a R3. R3 farà una nuova ricerca nella propria tabella.</dd>
<dt><strong><code>192.168.1.25</code> · Consegna diretta</strong></dt>
<dd>La rotta più specifica è <code>192.168.1.0/24</code>. R1 può individuare il destinatario sul collegamento e consegnargli il pacchetto attraverso l’interfaccia locale.</dd>
<dt><strong><code>8.8.8.8</code> · R2</strong></dt>
<dd>L’unico prefisso compatibile è <code>0.0.0.0/0</code>. R1 inoltra il pacchetto al prossimo router, R2.</dd>
</dl>
</section>

<section id="sezione-13">
<h2>5. Come si sceglie fra più rotte compatibili?</h2>
<p>Aggiungiamo a R1 una rotta per <code>192.168.4.128/25</code> attraverso R2. Questa sottorete copre solo la metà superiore della <code>/24</code>. Vediamo quali rotte corrispondono a due pacchetti.</p>
<table>
<caption>Confronto delle destinazioni <code>192.168.4.200</code> e <code>192.168.4.90</code></caption>
<thead><tr><th scope="col">Destinazione della rotta</th><th scope="col">Prossimo passo</th><th scope="col">Corrisponde a <code>.200</code>?</th><th scope="col">Corrisponde a <code>.90</code>?</th></tr></thead>
<tbody>
<tr><th scope="row"><code>192.168.1.0/24</code></th><td>Consegna diretta</td><td>No</td><td>No</td></tr>
<tr><th scope="row"><code>192.168.4.0/24</code></th><td>R3</td><td>Sì</td><td><strong>Sì, scelta</strong></td></tr>
<tr><th scope="row"><code>192.168.4.128/25</code></th><td>R2</td><td><strong>Sì, scelta</strong></td><td>No</td></tr>
<tr><th scope="row"><code>0.0.0.0/0</code></th><td>R2</td><td>Sì</td><td>Sì</td></tr>
</tbody>
</table>
<p class="callout"><strong>Longest Prefix Match.</strong> Prima R1 individua i prefissi che corrispondono all’indirizzo IP di destinazione. Poi sceglie il più lungo fra quelli compatibili. Un prefisso più lungo richiede che coincidano più bit iniziali dell’indirizzo.</p>
<h3>Perché <code>.200</code> va a R2 e <code>.90</code> va a R3?</h3>
<p>La rete <code>192.168.4.0/24</code> copre tutto l’intervallo da <code>192.168.4.0</code> a <code>192.168.4.255</code>. Il bit in più della <code>/25</code> divide l’ultimo ottetto in due metà.</p>
<table>
<thead><tr><th scope="col">Ultimo ottetto da 0 a 127</th><th scope="col">Ultimo ottetto da 128 a 255</th></tr></thead>
<tbody><tr><td><strong><code>.90</code> è qui.</strong> Corrisponde alla <code>/24</code> e alla <code>/0</code>. Vince la <code>/24</code> e R1 inoltra a <strong>R3</strong>.</td><td><strong><code>.200</code> è qui.</strong> Corrisponde anche alla <code>192.168.4.128/25</code>. Vince la <code>/25</code> e R1 inoltra a <strong>R2</strong>.</td></tr></tbody>
</table>
<p>Gli intervalli comprendono gli indirizzi di rete e di broadcast perché qui stiamo verificando la corrispondenza con il prefisso.</p>
</section>

<section id="sezione-15">
<h2>6. Quando si usa la rotta predefinita?</h2>
<p><code>0.0.0.0/0</code> richiede zero bit iniziali in comune, quindi corrisponde a qualsiasi indirizzo IPv4. R1 la usa quando nessun prefisso più specifico corrisponde.</p>
<p>Se togliamo la <code>/0</code> e arriva un pacchetto per <code>8.8.8.8</code>, nessuna rotta corrisponde. R1 scarta il pacchetto e può inviare al mittente un messaggio ICMP di destinazione irraggiungibile.</p>
<p>Con la <code>/0</code>, R1 può affidare il pacchetto a R2. La consegna dipende anche dalle rotte e dai collegamenti delle tappe successive.</p>
</section>
${visualPanel('rotta-predefinita', 'default', 'Un pacchetto per 8.8.8.8 arriva a R1',
  'Cambia le rotte disponibili. Premi Avanti per vedere prima le corrispondenze, poi la decisione di R1.')}

<section id="origine-rotte">
<h2>7. Da dove arrivano le rotte?</h2>
<ul>
<li><strong>Direttamente collegata.</strong> Il router conosce il prefisso della rete associata a un’interfaccia attiva e configurata.</li>
<li><strong>Statica.</strong> Un amministratore configura manualmente la rotta.</li>
<li><strong>Dinamica.</strong> Il router apprende la rotta attraverso un protocollo di routing che scambia informazioni con altri router.</li>
</ul>
<p>Anche la rotta predefinita può essere configurata manualmente o appresa.</p>
</section>`,
    extra: `
<section id="verifica">
<h2>8. E se cambiassimo la destinazione?</h2>
<p>Usa la tabella di R1 con le quattro rotte della sezione sul <a href="#sezione-13">Longest Prefix Match</a>. Per ogni pacchetto, elenca i prefissi compatibili e scegli l’uscita. Nell’ultima domanda rimuovi la rotta predefinita.</p>
<form id="quiz"><div class="actions"><button type="submit">Verifica risposte</button><button type="button" class="secondary" id="retry">Ricomincia</button></div></form>
<p id="score" role="status"></p>
<noscript>Abilita JavaScript per usare il quiz. Puoi aprire gli esempi qui sotto anche senza JavaScript.</noscript>

<h3>Altri esempi da ragionare</h3>
<details><summary><code>192.168.4.127</code> · Quale prefisso vince appena sotto il confine?</summary>
<p><code>.127</code> è fuori dall’intervallo della <code>192.168.4.128/25</code>. Fra <code>/24</code> e <code>/0</code> vince la <code>/24</code>, quindi R1 inoltra a <strong>R3</strong>.</p></details>
<details><summary><code>192.168.4.129</code> · Che cosa cambia appena sopra il confine?</summary>
<p><code>.129</code> è compreso fra <code>.128</code> e <code>.255</code>. Corrisponde a <code>/25</code>, <code>/24</code> e <code>/0</code>. Vince la <code>/25</code>, quindi R1 inoltra a <strong>R2</strong>.</p></details>
<details><summary><code>11.23.54.253</code> · Quale riga rimane?</summary>
<p>La <code>0.0.0.0/0</code> è l’unica corrispondenza, quindi R1 inoltra a <strong>R2</strong>. Se la togli dalla tabella, R1 <strong>scarta il pacchetto</strong>.</p></details>

<h3>Domande di ragionamento</h3>
<ol>
<li>Come può R1 conoscere una rotta per un’intera rete senza memorizzare un indirizzo per ogni dispositivo?</li>
<li>Se R1 inoltra un pacchetto a R3, che cosa deve succedere perché il pacchetto raggiunga PC4?</li>
<li>Che cosa fa R1 quando la rotta scelta indica una rete direttamente collegata? Che cosa fa quando indica un prossimo router?</li>
</ol>
</section>

<section id="dalla-lettura-alla-configurazione">
<h2>9. Dalla lettura alla configurazione</h2>
<p>Per <code>192.168.4.10</code>, R1 sceglie la rotta <code>192.168.4.0/24</code> via R3. In questa riga il prefisso indica gli indirizzi a cui si applica la rotta. R3 è il prossimo salto e riceve un pacchetto che ha ancora <code>192.168.4.10</code> come destinazione IP.</p>
<details><summary>Se R3 conosce solo le sue reti direttamente collegate, dove si ferma il pacchetto?</summary><p>Si ferma a R3. R1 ha raggiunto il suo prossimo salto, ma R3 deve consultare la propria tabella. La rete di PC4 è collegata a R4, quindi R3 scarta il pacchetto se non dispone di una rotta compatibile.</p></details>
<p>Come inseriamo la rotta mancante su R3? Quali rotte servono perché anche la risposta di PC4 arrivi a PC1? Nella <a href="06-statico.html">lezione 06</a> configureremo andata e ritorno un router alla volta.</p>
</section>`,
    scripts: '<script>window.quizData=' + JSON.stringify({ questions: lesson05Questions }) + ';</script><script src="../../quiz.js"></script>'
  },
  {
    file: '06-statico.html', title: '06 · Routing statico e strada di ritorno',
    lead: 'Configura le rotte da PC1 a PC4, prepara il ritorno e osserva che cosa succede quando un collegamento si guasta.',
    body: `
<section id="sezione-16">
<h2>1. Come si configura un prossimo salto?</h2>
<p>Nella <a href="05-tabella.html#dalla-lettura-alla-configurazione">lezione 05</a> avevamo letto una rotta di R1 per <code>192.168.4.0/24</code> attraverso R3. Ora partiamo dalle sole reti direttamente collegate e aggiungiamo quella rotta.</p>
<p>Nel <strong>routing statico</strong> l’amministratore configura manualmente le rotte che ciascun router userà per inoltrare i pacchetti.</p>
<ul>
<li><strong>Rete di destinazione.</strong> Il prefisso da raggiungere, qui <code>192.168.4.0/24</code>.</li>
<li><strong>Prossimo salto (next hop).</strong> L’indirizzo IP dell’interfaccia del router vicino sul collegamento da usare.</li>
<li><strong>Interfaccia di uscita.</strong> L’interfaccia locale da cui parte il frame successivo.</li>
</ul>
<p>A seconda del sistema e del tipo di collegamento, si può indicare il prossimo salto, l’interfaccia di uscita oppure entrambi. Quando specifichiamo il prossimo salto, il router deve determinare attraverso quale interfaccia può raggiungerlo.</p>
</section>

<section id="topologia">
<h2>2. Gli indirizzi della topologia</h2>
<p>Il percorso che configuriamo passa per <strong>PC1 → R1 → R3 → R4 → PC4</strong>. PC1 usa come gateway R1 (<code>192.168.1.1</code>) e PC4 usa R4 (<code>192.168.4.1</code>). Il percorso alternativo passa per R2.</p>
<table>
<caption>Prefissi e indirizzi delle interfacce dei due dispositivi su ciascun collegamento</caption>
<thead><tr><th scope="col">Collegamento</th><th scope="col">Prefisso</th><th scope="col">Primo dispositivo</th><th scope="col">Secondo dispositivo</th></tr></thead>
<tbody>
${links.map(([first, second, prefix, firstAddress, secondAddress]) =>
  `<tr><th scope="row">${first}–${second}</th><td><code>${prefix}</code></td><td>${first} · <code>${firstAddress}</code></td><td>${second} · <code>${secondAddress}</code></td></tr>`
).join('\n')}
</tbody>
</table>
<p>Ogni prefisso <code>/30</code> di questa topologia fornisce due indirizzi utilizzabili, uno per ciascuna estremità del collegamento. R3 ha un indirizzo verso R1 (<code>10.0.13.2</code>) e un altro verso R4 (<code>10.0.34.1</code>).</p>
</section>

<section id="andata">
<h2>3. Costruiamo il percorso di andata</h2>
<p>PC1 invia un pacchetto a <code>192.168.4.10</code>. La destinazione è fuori dalla sua rete locale, quindi PC1 consegna il frame al gateway R1.</p>
<p>All’inizio R1 conosce soltanto <code>192.168.1.0/24</code>, <code>10.0.12.0/30</code> e <code>10.0.13.0/30</code>. Senza una rotta predefinita o un’altra rotta compatibile, scarta il pacchetto.</p>
<table>
<thead><tr><th scope="col">Router</th><th scope="col">Rete di destinazione</th><th scope="col">Prossimo passo</th></tr></thead>
<tbody>
<tr><th scope="row">R1</th><td><code>192.168.4.0/24</code></td><td>Rotta statica via <code>10.0.13.2</code> (R3)</td></tr>
<tr><th scope="row">R3</th><td><code>192.168.4.0/24</code></td><td>Rotta statica via <code>10.0.34.2</code> (R4)</td></tr>
<tr><th scope="row">R4</th><td><code>192.168.4.0/24</code></td><td>Rete direttamente collegata</td></tr>
</tbody>
</table>
<ol>
<li>Con la prima rotta, R1 consegna il pacchetto a R3. L’indirizzo IP di destinazione nel pacchetto è ancora <code>192.168.4.10</code>.</li>
<li>R3 consulta la propria tabella. Con la seconda rotta arriva a R4. Se R3 dispone soltanto delle proprie reti direttamente collegate, il pacchetto si ferma a R3.</li>
<li>R4 riconosce la rete di PC4 come direttamente collegata e consegna il pacchetto sul collegamento locale.</li>
</ol>
</section>

<section id="ritorno">
<h2>4. Prepariamo la strada di ritorno</h2>
<p>PC4 risponde con un nuovo pacchetto. La sorgente è <code>192.168.4.10</code> e la destinazione è <code>192.168.1.10</code>. PC4 consegna il frame al suo gateway R4.</p>
<p>Se R4 conosce soltanto le proprie reti direttamente collegate, scarta la risposta. Per completare lo scambio, ogni router sul ritorno deve avere una rotta utilizzabile verso la rete di PC1.</p>
<table>
<thead><tr><th scope="col">Router</th><th scope="col">Rete di destinazione</th><th scope="col">Prossimo passo</th></tr></thead>
<tbody>
<tr><th scope="row">R4</th><td><code>192.168.1.0/24</code></td><td>Rotta statica via <code>10.0.34.1</code> (R3)</td></tr>
<tr><th scope="row">R3</th><td><code>192.168.1.0/24</code></td><td>Rotta statica via <code>10.0.13.1</code> (R1)</td></tr>
<tr><th scope="row">R1</th><td><code>192.168.1.0/24</code></td><td>Rete direttamente collegata</td></tr>
</tbody>
</table>
<p class="callout"><strong>Andata e ritorno sono due ricerche distinte.</strong> La risposta ha come destinazione PC1 e può anche seguire un percorso diverso, per esempio via R2, se tutti i router su quel percorso dispongono delle rotte necessarie.</p>
<p><a href="#rotta-manuale">Prova nel simulatore dove si ferma la risposta quando manca la rotta su R4.</a></p>
</section>

<section id="configurazione-linux">
<h2>5. Aggiungiamo una rotta su Linux</h2>
<p>Su R1, con i privilegi di amministrazione, possiamo aggiungere la rotta di andata e poi visualizzare la tabella IPv4.</p>
<pre><code>sudo ip route add 192.168.4.0/24 via 10.0.13.2
ip -4 route show</code></pre>
<p>Se <code>eth1</code> è l’interfaccia di R1 sul collegamento verso R3, nella tabella possiamo leggere una riga di questo tipo.</p>
<pre><code>192.168.4.0/24 via 10.0.13.2 dev eth1</code></pre>
<p>La configurazione vale per la tabella corrente di R1. Per ripristinarla al riavvio, va salvata nella configurazione di rete del sistema. Perché Linux inoltri pacchetti IPv4 tra interfacce, deve essere abilitato anche <code>net.ipv4.ip_forward</code>. Consulta il <a href="https://www.man7.org/linux/man-pages/man8/ip-route.8.html">manuale di <code>ip route</code></a> e la <a href="https://www.kernel.org/doc/html/latest/networking/ip-sysctl.html">documentazione di <code>ip_forward</code></a>.</p>
</section>

<section id="sezione-17">
<h2>6. Che cosa succede se cade R3–R4?</h2>
<p>R1 raggiunge ancora <code>10.0.13.2</code>, quindi può continuare a spedire pacchetti a R3. Su R3, la rotta via <code>10.0.34.2</code> può risultare inutilizzabile o uscire dalle rotte disponibili, a seconda del dispositivo e della configurazione. Senza una rotta alternativa utilizzabile da R3, il pacchetto si ferma lì.</p>
<p>Il percorso fisico via R2 è ancora disponibile. Per spostare lo scambio su quella strada, predisponiamo queste rotte al posto di quelle via R3 nelle direzioni interessate.</p>
<table>
<thead><tr><th scope="col">Direzione</th><th scope="col">Router</th><th scope="col">Rete di destinazione</th><th scope="col">Prossimo salto</th></tr></thead>
<tbody>
<tr><td>Andata</td><th scope="row">R1</th><td><code>192.168.4.0/24</code></td><td><code>10.0.12.2</code> (R2)</td></tr>
<tr><td>Andata</td><th scope="row">R2</th><td><code>192.168.4.0/24</code></td><td><code>10.0.24.2</code> (R4)</td></tr>
<tr><td>Ritorno</td><th scope="row">R4</th><td><code>192.168.1.0/24</code></td><td><code>10.0.24.1</code> (R2)</td></tr>
<tr><td>Ritorno</td><th scope="row">R2</th><td><code>192.168.1.0/24</code></td><td><code>10.0.12.1</code> (R1)</td></tr>
</tbody>
</table>
<p>La consegna finale avviene ancora sulle due reti direttamente collegate. Per usare un percorso di riserva automaticamente servono rotte predisposte e un meccanismo che rilevi il guasto e faccia scegliere l’alternativa. Nel <a href="#esperimento-visuale">simulatore della rete grande</a> puoi osservare lo stesso problema sul collegamento E–H.</p>

<h3>Quando conviene il routing statico?</h3>
<p>In una rete piccola e stabile, le rotte esplicite rendono prevedibile l’inoltro e funzionano senza uno scambio di aggiornamenti fra router. Man mano che aumentano le reti e i percorsi, anche una modifica locale può richiedere aggiornamenti su più router. La gestione dei guasti richiede interventi manuali o meccanismi di riserva configurati in anticipo.</p>
</section>`,
    extra: `
<section id="verifica">
<h2>7. Verifica il percorso</h2>
<p>PC1 invia un pacchetto a PC4. R1 ha la rotta per <code>192.168.4.0/24</code> via R3. R3 conosce soltanto le reti direttamente collegate e non ha una rotta predefinita.</p>
<ol>
<li>Fino a quale router arriva il pacchetto?</li>
<li>Perché si ferma lì?</li>
<li>Quale prefisso e quale prossimo salto devi configurare su R3 per farlo proseguire?</li>
</ol>
<details><summary>Mostra la soluzione</summary><p>Il pacchetto arriva a R3, che scarta perché <code>192.168.4.10</code> è fuori dalle sue reti direttamente collegate. Aggiungi su R3 la rotta per <code>192.168.4.0/24</code> via <code>10.0.34.2</code>, l’interfaccia di R4 sul collegamento con R3. Per ricevere una risposta, verifica anche le rotte di ritorno su R4 e R3.</p></details>
<p>Nella <a href="07-dinamico-dijkstra.html">lezione 07</a> vedrai come i router possono scambiarsi informazioni, calcolare i percorsi e aggiornarli quando cambia la topologia.</p>
</section>`
  },
  {
    file: '07-dinamico-dijkstra.html', title: '07 · Routing dinamico e Dijkstra',
    lead: 'Scopri come i router possono adattarsi a un cambiamento e come si calcola un percorso a costo minimo.',
    body: `
<section id="sezione-18"><h2>Quando cambiare le rotte a mano diventa difficile</h2>
<p>Riprendi il guasto E–H della lezione precedente. In una rete grande, aggiornare manualmente tutte le rotte coinvolte richiede tempo. Nel <strong>routing dinamico</strong> i router si scambiano informazioni e aggiornano le rotte sulla base di quello che apprendono.</p>
<p>E e H devono prima accorgersi del guasto. La notizia deve poi raggiungere A, che può ancora inoltrare come prima durante l’attesa. Quando i router coinvolti hanno aggiornato le proprie decisioni e le rotte si stabilizzano, la rete ha raggiunto la <strong>convergenza</strong>.</p></section>
<section><h2>Che cosa rappresenta un costo?</h2>
<p>Il costo di un collegamento è un numero che esprime quanto conviene usarlo nel calcolo. La <strong>metrica</strong> è il criterio numerico con cui un protocollo confronta i percorsi. Qui la metrica del percorso è la somma dei costi dei collegamenti attraversati.</p>
<p>In un piccolo esempio, A–C costa 8, mentre A–B e B–C costano 2 ciascuno. La strada diretta richiede un salto e costa 8. Passando da B i salti sono due, ma il costo è 2 + 2 = 4.</p>
<p>Nel simulatore i costi sono assegnati per rendere visibili le differenze. In una rete reale il valore può essere configurato o ricavato da parametri come la capacità dell’interfaccia, secondo il protocollo e la sua implementazione. Un costo 8 non equivale a 8 millisecondi e non misura automaticamente distanza o congestione.</p>
<h3>Due strade da A a L nella rete a dodici router</h3>
<table><thead><tr><th scope="col">Percorso</th><th scope="col">Salti</th><th scope="col">Costo</th></tr></thead><tbody>
<tr><td>A → C → L</td><td>2</td><td>8 + 20 = 28</td></tr>
<tr><td>A → B → E → H → K → L</td><td>5</td><td>2 + 2 + 2 + 2 + 2 = 10</td></tr></tbody></table>
<p>Se conti i salti, scegli il primo. Se sommi i costi, fra questi due scegli il secondo. Dijkstra permette di cercare il costo minimo anche quando i percorsi possibili sono molti.</p></section>
<section id="sezione-19"><h2>Calcola il costo su quattro nodi</h2>
<p>Un costo è un numero associato a un collegamento. Per confrontare due percorsi, somma i costi dei collegamenti che attraversano. Qui usiamo quattro nodi per fare il conto a mano prima di passare alla rete grande.</p>
<pre class="diagram-code" aria-label="Collegamenti e costi"><code>A–B: 2    A–C: 5    B–C: 1    B–D: 4    C–D: 2</code></pre>
<ol><li><strong>Inizializza.</strong> A ha costo 0. Gli altri nodi partono senza un costo noto, indicato con ∞.</li>
<li><strong>Elabora A.</strong> I collegamenti diretti danno B = 2 e C = 5. D resta ancora a ∞.</li>
<li><strong>Scegli il costo provvisorio minore.</strong> Tocca a B. Da B arrivi a C con 2 + 1 = 3, meglio di 5. Arrivi anche a D con 2 + 4 = 6. Aggiorni entrambi e annoti B come nodo precedente.</li>
<li><strong>Ripeti.</strong> Ora C ha il costo provvisorio minore, 3. Da C arrivi a D con 3 + 2 = 5. Sostituisci il 6 con 5 e annoti C come nodo precedente. Quando elabori D, il suo costo è definitivo.</li>
<li><strong>Ricostruisci.</strong> Risali da D attraverso i nodi precedenti, D ← C ← B ← A. Letto al contrario è il percorso A → B → C → D.</li></ol>
<details><summary>Verifica · Quale strada ha meno collegamenti? Quale costa meno?</summary><p>A → B → D usa due collegamenti e costa 6. A → B → C → D ne usa tre e costa 5.</p></details></section>
${visualPanel('dijkstra-quattro-nodi', 'spf-small', 'Osserva le distanze cambiare',
  'Avanza sul grafo a quattro nodi. Segui la riga di D: prima il costo è sconosciuto, poi vale 6 via B e infine 5 via C.')}`
  },
  {
    file: '08-ospf.html', title: '08 · Come OSPF aggiorna le rotte',
    lead: 'Segui il cambiamento di un collegamento fino al nuovo percorso.',
    body: `
<section id="sezione-20"><h2>Come si costruisce la mappa?</h2>
<p>Dijkstra parte da una mappa. <strong>OSPF</strong> (Open Shortest Path First) è un protocollo che permette ai router di costruirla insieme. Il metodo si chiama <strong>link-state</strong>, perché parte dallo stato dei collegamenti.</p>
<ol><li><strong>Scoprire i vicini.</strong> E invia messaggi chiamati <em>Hello</em> sui collegamenti dove usa OSPF. I messaggi servono a riconoscere i router vicini e a controllare nel tempo che siano ancora presenti.</li>
<li><strong>Condividere lo stato.</strong> E contribuisce alla mappa annunciando lo stato e i costi dei propri collegamenti, per esempio E–H e E–F. La notizia può arrivare ad A attraverso altri vicini. Questi messaggi servono ad aggiornare la rete. Il traffico dell’utente segue invece le rotte che ciascun router ha già installato.</li>
<li><strong>Raccogliere le informazioni.</strong> Nella stessa area, cioè nella porzione di rete dell’esempio, i router raccolgono gli annunci per ottenere una mappa coerente.</li>
<li><strong>Calcolare dal proprio punto di vista.</strong> A parte da A, E parte da E. Ciascuno esegue Dijkstra sulla mappa e ricava le proprie uscite. Per arrivare a L, A può scegliere B anche quando E sceglie H.</li></ol></section>
<section id="sezione-21"><h2>Quando si interrompe E–H</h2>
<ol><li>E e H rilevano che il collegamento non è più disponibile.</li><li>I router aggiornano le informazioni sul tratto interrotto e le inviano lungo i collegamenti rimasti attivi.</li><li>Quando A riceve la notizia, aggiorna la mappa. Nel frattempo, alcuni pacchetti possono ancora partire lungo il vecchio percorso e andare persi.</li><li>A ricalcola e installa una nuova rotta verso L. Ora parte da D e prosegue per G e J. I nuovi pacchetti possono usare questa strada.</li></ol>
<p>Rilevamento, diffusione e calcolo richiedono tempo. Nel simulatore ogni fase ha un passo separato per aiutarti a seguirla.</p>
<details><summary>Verifica · A può aggiornare correttamente il percorso usando solo la vecchia mappa?</summary><p>No. La vecchia mappa contiene ancora E–H. Serve prima ricevere la notizia del guasto e aggiornare la mappa.</p></details></section>
<section id="sezione-22"><h2>I nomi che trovi nella documentazione</h2>
<p>Un <strong>LSA</strong> (Link State Advertisement) è un annuncio di stato. La raccolta degli annunci è il <strong>LSDB</strong> (Link State Database). Il calcolo dei percorsi a costo minimo si chiama <strong>SPF</strong> (Shortest Path First).</p></section>`,
    extra: `<details><summary>Approfondimento facoltativo · Organizzare una rete in aree</summary><p>Una rete OSPF grande può essere divisa in aree. I router mantengono la mappa dettagliata delle aree a cui partecipano e apprendono come raggiungere le destinazioni delle altre aree. L’area 0 collega le altre aree. Il simulatore mostra una sola area.</p></details>`
  },
  {
    file: '09-rip-eigrp-isis.html', title: '09 · RIP e il confronto con OSPF',
    lead: 'Impara una distanza dai vicini e confronta il risultato con quello ottenuto usando una mappa.',
    body: `
<section id="rip"><h2>Un vicino può dirti quanto manca</h2>
<p>All’inizio A non conosce una strada verso L. L ha distanza zero da sé e la comunica ai vicini. C è collegato a L, quindi aggiunge un salto. Al turno seguente C annuncia ad A quella distanza. A aggiunge il collegamento A–C e registra due salti, con C come prossimo router.</p>
<table><thead><tr><th scope="col">Momento</th><th scope="col">Distanza di C da L</th><th scope="col">Distanza di A da L</th></tr></thead><tbody>
<tr><td>Inizio</td><td>Sconosciuta</td><td>Sconosciuta</td></tr>
<tr><td>C riceve l’annuncio di L</td><td>1 via L</td><td>Sconosciuta</td></tr>
<tr><td>A riceve l’annuncio di C</td><td>1 via L</td><td>2 via C</td></tr></tbody></table>
<p><strong>RIP</strong> (Routing Information Protocol) applica questo metodo, detto <strong>distance vector</strong>, o vettore delle distanze. Ogni router confronta le distanze che gli annunciano i vicini, aggiungendo un salto. L’idea di calcolare una distanza a partire da quelle dei vicini viene dall’algoritmo di Bellman–Ford. In RIP si arriva al massimo a 15 salti: 16 significa irraggiungibile.</p></section>
<section><h2>Quando una distanza smette di valere</h2>
<p>Immagina per un momento una rete con i soli A, C e L in fila. Se C perde il collegamento con L, deve smettere di annunciare la vecchia distanza. A potrebbe ancora pensare di raggiungere L via C finché non riceve l’aggiornamento.</p>
<p>Se C accettasse a sua volta un vecchio annuncio di A che dipende proprio da C, i due potrebbero indicarsi a vicenda come prossima tappa. In quel periodo un pacchetto potrebbe girare fra A e C. I protocolli a vettore delle distanze usano regole per limitare questi problemi. Il simulatore mostra l’apprendimento a partire da rotte sconosciute, mentre qui abbiamo seguito un guasto dopo l’apprendimento.</p></section>
<section id="confronto"><h2>Stessa rete, scelte diverse</h2>
<p>Torniamo alla rete a dodici router della lezione 07. Per RIP ogni collegamento vale un salto. Per OSPF il costo di ciascun tratto può essere diverso. A–C–L costa 8 + 20 = 28, mentre la strada più lunga via B, E, H e K costa 10.</p>
<table><thead><tr><th scope="col">RIP</th><th scope="col">OSPF</th></tr></thead><tbody>
<tr><td>Apprende le distanze dai vicini</td><td>Costruisce una mappa dei collegamenti</td></tr>
<tr><td>Conta i salti</td><td>Somma i costi</td></tr>
<tr><td>A → C → L, 2 salti</td><td>A → B → E → H → K → L, costo 10</td></tr></tbody></table>
<p>Il limite di 15 salti riduce la dimensione delle reti in cui RIP può trovare percorsi utilizzabili. Qui è utile soprattutto per capire come si apprende una rotta dai vicini.</p>
<details><summary>Verifica · Il collegamento C–L costa 20. Perché RIP lo usa?</summary><p>Per RIP vale un salto, come ogni altro collegamento. Per OSPF quel 20 pesa nella somma del percorso.</p></details></section>`,
    extra: `<details id="panorama"><summary>Approfondimento facoltativo · Altri protocolli interni</summary>
<p id="eigrp"><strong>EIGRP</strong> (Enhanced Interior Gateway Routing Protocol) impara dai vicini e può preparare un’alternativa al percorso in uso. L’algoritmo <strong>DUAL</strong> (Diffusing Update Algorithm) aiuta a scegliere percorsi senza giri chiusi. Se l’alternativa soddisfa la condizione di sicurezza, può prendere il posto della rotta persa.</p>
<p id="isis"><strong>IS-IS</strong> (Intermediate System to Intermediate System) usa una mappa dei collegamenti e calcola percorsi a costo minimo, come hai visto con OSPF. Il laboratorio facoltativo mostra il calcolo all’interno di un singolo livello della sua rete.</p>
<p><a href="laboratorio.html#protocolli-facoltativi">Apri le due simulazioni facoltative</a>.</p></details>`
  },
  {
    file: '10-bgp.html', title: '10 · Come comunicano le reti di Internet',
    lead: 'Scopri come un’azienda con due fornitori sceglie da quale rete uscire.',
    body: `
<section id="as"><h2>Internet collega reti gestite da organizzazioni diverse</h2>
<p>Nel disegno A–L ogni nodo era un router. Ora ogni nodo rappresenta un gruppo di reti con una politica di instradamento comune, chiamato <strong>sistema autonomo</strong> (Autonomous System, <strong>AS</strong>). Un sistema autonomo può contenere molti router.</p>
<p>Un’azienda è collegata a due fornitori. Entrambi le dicono che attraverso di loro può raggiungere la stessa rete. Il <strong>BGP</strong> (Border Gateway Protocol) permette ai sistemi autonomi di annunciarsi quali destinazioni possono raggiungere.</p>
<h3>Segui un annuncio</h3>
<p>Il sistema 64540 annuncia il prefisso 203.0.113.0/24. Il fornitore 64550 lo apprende direttamente da 64540. Il fornitore 64520 lo apprende attraverso 64530. Quando entrambi passano l’informazione all’azienda 64512, questa riceve due annunci per la stessa destinazione, ciascuno con una sequenza diversa.</p>
<p>Gli annunci vanno da chi offre la raggiungibilità verso l’azienda. I pacchetti dell’azienda partiranno nella direzione opposta, verso la rete annunciata.</p></section>
<section id="attributi"><h2>Due annunci, una scelta</h2>
<p>Un fornitore propone un percorso attraverso tre sistemi autonomi, l’altro attraverso due. La sequenza dei sistemi autonomi è l’<code>AS_PATH</code>. Se il resto è equivalente, il percorso più corto può prevalere.</p>
<p>L’azienda può però preferire il primo fornitore perché il contratto rende quel transito meno costoso o perché vuole riservare l’altra uscita a un altro tipo di traffico. Assegnando a quella rotta una preferenza locale più alta (<code>LOCAL_PREF</code>), può sceglierla anche se attraversa più sistemi autonomi.</p>
<p>Prima l’azienda apprende che la rete è raggiungibile attraverso entrambe le uscite. Poi decide quale usare. La lunghezza di questa sequenza conta sistemi autonomi e non dice quanti router interni attraverserà il pacchetto. I costi dei singoli collegamenti OSPF non vengono sommati per fare questa scelta.</p>
<details><summary>Verifica · Che cosa può far vincere il percorso più lungo?</summary><p>La preferenza locale assegnata dall’azienda. La simulazione mantiene uguali gli altri criteri rilevanti per mostrare questa scelta.</p></details></section>`,
    extra: `<details><summary>Approfondimento facoltativo · Scambiare e distribuire gli annunci</summary><p>Tra organizzazioni diverse si usa <strong>eBGP</strong> (external Border Gateway Protocol). I router della stessa organizzazione possono usare <strong>iBGP</strong> (internal Border Gateway Protocol) per condividere le destinazioni apprese. Per arrivare al router di uscita possono usare le rotte interne, per esempio quelle calcolate da OSPF.</p></details>`
  },
  {
    file: '11-diagnostica.html', title: '11 · Diagnosticare un problema di routing',
    lead: 'Individua l’ultimo punto in cui il pacchetto riesce a proseguire.',
    body: `
<section id="sezione-23"><h2>Parti dal computer che invia</h2>
<ol><li>Controlla indirizzo, prefisso e collegamento locale. Il computer raggiunge il gateway?</li><li>Controlla la tabella del gateway e segui il prossimo salto fino alla destinazione.</li><li>Se la richiesta arriva, segui anche la risposta dalla destinazione verso la sorgente.</li></ol></section>
<section id="sezione-24"><h2>Dal sintomo alla verifica</h2>
<ul><li><strong>Il computer non raggiunge il gateway.</strong> Parti dal collegamento locale e controlla indirizzo, prefisso e gateway configurato.</li>
<li><strong>Il gateway risponde, il server no.</strong> La prima tappa funziona almeno per quella prova. Controlla la rotta del gateway verso il server e la raggiungibilità del prossimo router.</li>
<li><strong>La richiesta arriva, la risposta no.</strong> Verifica il ritorno a partire dal router del server. Anche un filtro può impedire la risposta.</li>
<li><strong>Il problema è iniziato dopo un cambiamento.</strong> Cerca il collegamento coinvolto e verifica quale rotta è ancora in uso. La rete potrebbe essere ancora in fase di aggiornamento.</li></ul>
<h3>Tre guasti da distinguere</h3>
<table><thead><tr><th scope="col">Osservazione</th><th scope="col">Controllo successivo</th></tr></thead><tbody>
<tr><td>A scarta la richiesta perché non trova un’uscita</td><td>Cerca una rotta per la rete del server o una rotta predefinita.</td></tr>
<tr><td>Il server riceve la richiesta e la risposta si ferma a L</td><td>Cerca su L la rotta per tornare alla rete del mittente.</td></tr>
<tr><td>La richiesta si ferma a E mentre tenta di raggiungere H</td><td>Controlla il collegamento E–H e verifica se è disponibile un’altra rotta.</td></tr></tbody></table>
<p><strong>Rotta mancante o prossimo router irraggiungibile?</strong> Nel primo caso la ricerca non dà un’uscita. Nel secondo, il percorso in uso prevede un vicino che il router non riesce più a raggiungere. Nel guasto E–H, A può ancora trovare la sua rotta via B e consegnargli il pacchetto. Il primo collegamento inutilizzabile è più avanti, quando E tenta di raggiungere H.</p></section>
<section id="sezione-25"><h2>Due strumenti per orientarsi</h2>
<p><code>ping</code> manda una richiesta e attende la risposta. Se la risposta manca, può esserci un problema all’andata, al ritorno o un filtro che blocca le richieste. <code>traceroute</code> (o <code>tracert</code> su Windows) usa sonde con TTL crescenti per osservare le tappe. Alcuni router possono limitare o omettere le risposte.</p>
<pre><code>1   A       1 ms
2   *       nessuna risposta
3   E       8 ms
4   *       nessuna risposta</code></pre>
<details><summary>Che cosa puoi concludere da questa prova?</summary><p>Almeno una sonda è arrivata fino a E e la risposta di E è tornata. L’asterisco alla tappa 2 non dimostra che lì si blocchi l’inoltro. Quello alla tappa 4 non basta per dichiarare un guasto su E–H. Controlla il collegamento e il ritorno delle risposte.</p></details>
<p>Se un errore fa tornare il pacchetto sempre sugli stessi router, si crea un <strong>loop</strong>, cioè un giro chiuso. Il TTL evita che il pacchetto continui a circolare indefinitamente.</p>
<details><summary>Verifica · Un ping senza risposta dimostra che l’andata è rotta?</summary><p>No. Potrebbe essere il ritorno a interrompersi. Cerca prima di capire se la richiesta ha raggiunto la destinazione.</p></details></section>`,
    extra: `<details><summary>Approfondimento facoltativo · Versione degli indirizzi e dimensione dei pacchetti</summary><p>Una rete che usa <strong>IPv6</strong> (Internet Protocol versione 6) richiede rotte per gli indirizzi IPv6. Il contatore che svolge il ruolo del TTL si chiama <em>Hop Limit</em>, limite dei salti.</p><p>Se i pacchetti piccoli passano e quelli grandi si fermano, controlla anche la dimensione massima consentita lungo il percorso. È detta <strong>MTU</strong> (Maximum Transmission Unit).</p></details>`
  },
  {
    file: '12-esercizi.html', title: '12 · Laboratori ed esercizi guidati',
    lead: 'Fai una previsione, controllala nel simulatore e confronta il tuo ragionamento con la soluzione.',
    body: `
<section id="sezione-26"><h2>Tre laboratori da svolgere in ordine</h2>
<h3>1. Scegli una rotta</h3><p>Per 10.1.50.8 e 203.0.113.10 scegli fra 10.0.0.0/8, 10.1.0.0/16 e 0.0.0.0/0. Verifica nel <a href="05-tabella.html#esperimento-visuale">simulatore della tabella</a>.</p>
<details><summary>Soluzione 1</summary><p>10.1.50.8 corrisponde a tutte e tre le righe. Vince la /16. 203.0.113.10 corrisponde solo alla /0.</p></details>
<h3>2. Completa il ritorno</h3><p>PC1 raggiunge PC4 via R2, ma R4 non conosce la rete di PC1. Scrivi la destinazione e il prossimo router della rotta mancante. Poi verifica <a href="06-statico.html#rotta-manuale">nel modello a quattro router</a>.</p>
<details><summary>Soluzione 2</summary><p>Su R4 serve una rotta per 192.168.1.0/24 via R2. R2 deve a sua volta sapere che quella rete si raggiunge via R1.</p></details></section>
<section id="sezione-27"><h3>3. Reagisci a un guasto</h3><p>Il collegamento E–H cade. Prevedi che cosa accade alla rotta manuale di A e come cambia il percorso dopo l’aggiornamento di OSPF. Confronta i due esperimenti qui sotto.</p>
<details><summary>Soluzione 3</summary><p>A può continuare a mandare a B con la rotta manuale, anche se il percorso si spezza su E–H. Con OSPF, dopo il ricalcolo la rete passa per A → D → G → J → L, a costo 12.</p></details></section>`,
    extra: `<section><h2>Secondo giro · Collega più decisioni</h2>
<p>Per ciascun caso, scrivi dove andrebbe il pacchetto e perché. Verifica nel simulatore indicato, poi apri la soluzione.</p>
<h3>4. Tre decisioni per lo stesso pacchetto</h3>
<p>Un pacchetto per 8.8.8.8 arriva a R1. Prevedi l’esito con le sole reti locali, poi con la rotta predefinita verso R2 e infine aggiungendo 8.8.8.0/24 verso R3. Usa la <a href="05-tabella.html#rotta-predefinita">prova delle tre tabelle</a>.</p>
<details><summary>Soluzione 4</summary><p>R1 prima scarta, poi passa a R2 e infine passa a R3. Nell’ultimo caso corrispondono sia /0 sia /24, quindi prevale /24. Per sapere se la consegna riesce devi ancora seguire la decisione del router successivo.</p></details>
<h3>5. La richiesta arriva, la risposta si ferma</h3>
<p>Via R3, PC4 riceve la richiesta ma R4 scarta la risposta. Scrivi la rotta mancante su R4. Se R3 non conoscesse la rete di PC1, dove si fermerebbe ora la risposta? Prova a <a href="06-statico.html#rotta-manuale">ripristinare il ritorno</a>.</p>
<details><summary>Soluzione 5</summary><p>Su R4 serve 192.168.1.0/24 via R3. Con quella riga, R4 inoltra. Se R3 non ha alcuna rotta utilizzabile per PC1, la risposta si ferma a R3. R3 deve poter passare il pacchetto a R1.</p></details>
<h3>6. Meno salti o meno costo?</h3>
<p>Calcola il costo dei percorsi A → C → L e A → B → E → H → K → L. Prevedi cosa cambia portando E–H da 2 a 18. Verifica con <a href="07-dinamico-dijkstra.html#esperimento-visuale">Dijkstra</a> e confronta con <a href="09-rip-eigrp-isis.html#esperimento-visuale">RIP</a>.</p>
<details><summary>Soluzione 6</summary><p>I percorsi costano 28 e 10. Aumentando E–H, il secondo costa 26, ma la strada via D, G e J costa 12 ed è migliore. RIP continua a contare i salti e sceglie A → C → L, perché i collegamenti sono ancora disponibili.</p></details>
<h3>7. Prima funziona, poi smette</h3>
<p>Dopo un guasto il computer raggiunge A, ma il server non riceve la richiesta. La tabella di A indica ancora B. Che cosa controlli prima di cambiare la rotta? Confronta la tua ipotesi nella <a href="11-diagnostica.html#esperimento-visuale">simulazione diagnostica</a>.</p>
<details><summary>Soluzione 7</summary><p>Verifica se A riesce a consegnare a B, poi segui le tappe successive. Se il pacchetto arriva a E ma E non raggiunge H, il primo problema osservato è E–H. Con OSPF, dopo l’aggiornamento della mappa, confronta la nuova rotta con quella vecchia. Se invece il server ricevesse la richiesta, sposteresti la verifica sul ritorno.</p></details>
</section>`
  },
  {
    file: '13-ripasso.html', title: '13 · Errori comuni, glossario e ripasso',
    lead: 'Ricostruisci un viaggio completo sulla rete A–L e spiega ogni decisione.',
    body: `
<section id="sezione-28"><h2>Errori da riconoscere</h2><ul>
<li><strong>Confondere il gateway con il server.</strong> Il gateway riceve il primo frame locale. Il server è la destinazione del pacchetto.</li>
<li><strong>Dare per scontato il ritorno.</strong> Una richiesta consegnata non garantisce che la risposta trovi una rotta.</li>
<li><strong>Confondere salti e costo.</strong> Un percorso con più collegamenti può avere un costo totale minore.</li>
<li><strong>Scambiare la rotta predefinita per una garanzia.</strong> Indica solo il prossimo passo quando manca una rotta più specifica.</li>
<li><strong>Vedere un collegamento alternativo e presumere che sia già in uso.</strong> I router devono avere rotte che lo utilizzano.</li>
<li><strong>Attribuire a tutti i router una mappa completa.</strong> RIP apprende distanze dai vicini, mentre OSPF ricostruisce la mappa della propria area.</li>
<li><strong>Aspettarsi un recupero istantaneo.</strong> Dopo un guasto servono tempo per diffondere la notizia e nuove decisioni di inoltro.</li>
<li><strong>Leggere un asterisco come prova di un guasto.</strong> Una sonda senza risposta indica che quella prova non ha ricevuto risposta.</li></ul></section>
<section id="sezione-29"><h2>Il glossario essenziale</h2><dl>
<dt>Prefisso</dt><dd>Indica la parte di indirizzo che identifica una rete.</dd>
<dt>Gateway</dt><dd>Router a cui un dispositivo affida i pacchetti diretti fuori dalla rete locale.</dd>
<dt>Rotta</dt><dd>Voce che associa una destinazione a un’uscita o a un prossimo router.</dd>
<dt>Prossimo salto</dt><dd>Il vicino a cui viene consegnato il pacchetto per farlo proseguire.</dd>
<dt>Convergenza</dt><dd>Stabilizzazione delle rotte dopo un cambiamento della rete.</dd></dl></section>
<section id="sezione-30"><h2>Un viaggio, dall’inizio alla fine</h2>
<p>Il computer 192.0.2.10 deve raggiungere il server 198.51.100.10 dietro L. Sulla rete A–L, ricostruisci lo scambio prima di avviare il simulatore.</p>
<ol><li>Spiega a chi va il primo frame e quale destinazione porta il pacchetto.</li><li>Scegli la riga di A fra 198.51.100.0/24 via B e 0.0.0.0/0 via D. Segui il percorso e individua quale rete deve conoscere L per il ritorno.</li><li>Interrompi E–H. Prevedi dove si ferma la richiesta se le rotte restano statiche e quale strada si apre dopo il ricalcolo di OSPF.</li><li>Ora immagina che ad A manchino entrambe le righe. Che cosa accade? Che cosa puoi dedurre se aggiungi soltanto la predefinita via D?</li></ol>
<details><summary>Soluzione ragionata</summary><p>Il primo frame va al gateway A. Il pacchetto è diretto al server, quindi A sceglie la /24 via B. Il viaggio attraversa A, B, E, H, K e L. Per rispondere, L deve poter raggiungere 192.0.2.0/24. Con E–H guasto e le vecchie rotte, la richiesta si ferma a E. Dopo il ricalcolo, A può usare D → G → J → L.</p><p>Senza una riga compatibile, A scarta. Se aggiungi solo la predefinita, A può consegnare a D. Per concludere che il server riceverà il pacchetto devi ancora verificare le rotte successive e, per ricevere una risposta, la strada di ritorno.</p></details></section>`,
    extra: `<p><a href="laboratorio.html#laboratorio-esteso">Esplora il confronto completo</a> · <a href="test.html">Svolgi la verifica finale</a></p>`
  }
];
module.exports = lessons;

