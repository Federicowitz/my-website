const { visualPanel } = require('./routing-visual-content.cjs');

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
<p>Per <code>192.168.4.200</code> corrispondono tre rotte, <code>/0</code>, <code>/24</code> e <code>/25</code>. Vince <code>192.168.4.128/25</code> perché <code>.200</code> è nel suo intervallo e i suoi 25 bit di prefisso coincidono con quelli della destinazione. R1 inoltra quindi a R2. Il router controlla le rotte disponibili e sceglie quella con il maggior numero di bit iniziali corrispondenti.</p>
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
    file: "06-statico.html", title: "06 · Routing statico e strada di ritorno",
    lead: "Come si configura una rete affinché due computer possano comunicare? Come si prepara un percorso alternativo quando un router si guasta?",
    body: `
<p>Nella lezione precedente abbiamo imparato a leggere una tabella di routing. Sappiamo che un router, quando riceve un pacchetto IP, consulta le informazioni di instradamento per scegliere il prossimo salto (<em>next hop</em>).</p>
<p>Ma da dove arrivano queste informazioni?</p>
<p>Una possibilità è configurarle manualmente, attraverso il <strong>routing statico</strong>.</p>
<p>In questa lezione costruiremo una rete funzionante partendo da una situazione in cui i computer non riescono a comunicare. Aggiungeremo le rotte necessarie una alla volta, osserveremo le tabelle dei dispositivi e configureremo un percorso di riserva.</p>
<section id="sezione-16">
<h2>1. La rete che vogliamo far funzionare</h2>
<p>Consideriamo una piccola rete aziendale con due computer, PC1 e PC4, e quattro router.</p>
<div data-routing-diagram="network"></div>
<p>I due computer appartengono a reti locali differenti:</p>
<table><thead><tr><th scope="col">Dispositivo</th><th scope="col">Indirizzo IP</th><th scope="col">Rete</th></tr></thead><tbody>
<tr><td>PC1</td><td><code>192.168.1.10</code></td><td><code>192.168.1.0/24</code></td></tr>
<tr><td>PC4</td><td><code>192.168.4.10</code></td><td><code>192.168.4.0/24</code></td></tr>
</tbody></table>
<p>PC1 si trova nella LAN collegata a R1, mentre PC4 si trova nella LAN collegata a R4.</p>
<p>Esistono due possibili percorsi attraverso la rete:</p>
<p><strong>Percorso superiore:</strong> PC1 → R1 → R3 → R4 → PC4</p>
<p><strong>Percorso inferiore:</strong> PC1 → R1 → R2 → R4 → PC4</p>
<p>Vogliamo inizialmente utilizzare il percorso superiore, passando per R3.</p>
<p>In seguito prepareremo quello inferiore, passando per R2, come alternativa in caso di guasto.</p>
<p>L'obiettivo è permettere a PC1 di eseguire correttamente un <code>ping</code> verso PC4, ricevendo anche la risposta.</p>
</section>
<section id="topologia">
<h2>2. Gli indirizzi IP dei collegamenti</h2>
<p>Perché i router possano comunicare tra loro, ogni collegamento deve avere indirizzi IP opportunamente configurati.</p>
<p>Nella nostra rete utilizziamo i seguenti indirizzi.</p>
<table><thead><tr><th scope="col">Collegamento</th><th scope="col">Prefisso</th><th scope="col">Primo dispositivo</th><th scope="col">Secondo dispositivo</th></tr></thead><tbody>
<tr><td>PC1–R1</td><td><code>192.168.1.0/24</code></td><td>PC1: <code>192.168.1.10</code></td><td>R1: <code>192.168.1.1</code></td></tr>
<tr><td>R1–R3</td><td><code>10.0.13.0/30</code></td><td>R1: <code>10.0.13.1</code></td><td>R3: <code>10.0.13.2</code></td></tr>
<tr><td>R3–R4</td><td><code>10.0.34.0/30</code></td><td>R3: <code>10.0.34.1</code></td><td>R4: <code>10.0.34.2</code></td></tr>
<tr><td>R1–R2</td><td><code>10.0.12.0/30</code></td><td>R1: <code>10.0.12.1</code></td><td>R2: <code>10.0.12.2</code></td></tr>
<tr><td>R2–R4</td><td><code>10.0.24.0/30</code></td><td>R2: <code>10.0.24.1</code></td><td>R4: <code>10.0.24.2</code></td></tr>
<tr><td>R4–PC4</td><td><code>192.168.4.0/24</code></td><td>R4: <code>192.168.4.1</code></td><td>PC4: <code>192.168.4.10</code></td></tr>
</tbody></table>
<p>Ogni router possiede più interfacce di rete, quindi può avere più indirizzi IP.</p>
<p>Per esempio, R3 ha l'indirizzo <code>10.0.13.2</code> sul collegamento verso R1 e l'indirizzo <code>10.0.34.1</code> sul collegamento verso R4.</p>
<p>Le reti <code>/30</code> utilizzate tra i router permettono, nel normale indirizzamento IPv4, di assegnare due indirizzi utilizzabili, uno a ciascuna estremità.</p>
<h3>I gateway dei computer</h3>
<p>I due PC devono conoscere il router al quale affidare i pacchetti destinati a reti remote.</p>
<table><thead><tr><th scope="col">Computer</th><th scope="col">Gateway predefinito</th></tr></thead><tbody>
<tr><td>PC1</td><td><code>192.168.1.1</code> (R1)</td></tr>
<tr><td>PC4</td><td><code>192.168.4.1</code> (R4)</td></tr>
</tbody></table>
<p>PC1 non ha bisogno di conoscere R2, R3 e R4. Per comunicare con una rete esterna gli basta conoscere il proprio gateway R1.</p>
<p>Lo stesso vale per PC4, che utilizza R4.</p>
<p>In tutta la lezione supponiamo che le interfacce siano attive e che i router siano già abilitati a inoltrare pacchetti IP.</p>
</section>
<section id="parte-3">
<h2>3. Che cosa conosce un router prima di configurare le rotte?</h2>
<p>Un router conosce le reti direttamente collegate alle sue interfacce attive e configurate.</p>
<p>Per esempio, R1 possiede un'interfaccia nella LAN di PC1, una verso R3 e una verso R2.</p>
<p>La sua tabella iniziale contiene quindi queste reti:</p>
<table><thead><tr><th scope="col">Destinazione</th><th scope="col">Come raggiungerla</th></tr></thead><tbody>
<tr><td><code>192.168.1.0/24</code></td><td>Direttamente collegata</td></tr>
<tr><td><code>10.0.13.0/30</code></td><td>Direttamente collegata</td></tr>
<tr><td><code>10.0.12.0/30</code></td><td>Direttamente collegata</td></tr>
</tbody></table>
<p>Notiamo che <strong>non compare <code>192.168.4.0/24</code></strong>, la rete di PC4.</p>
<p>R1 conosce R3 e R2 perché sono suoi vicini, ma non conosce automaticamente quali altre reti si possano raggiungere attraverso di loro.</p>
<p>Lo stesso problema riguarda gli altri router.</p>
<p>In questa situazione iniziale abbiamo deciso di non configurare rotte predefinite sui router: ognuno conosce soltanto le proprie reti direttamente collegate.</p>
</section>
<section id="parte-4">
<h2>4. Il primo tentativo: PC1 vuole raggiungere PC4</h2>
<p>PC1 deve inviare un pacchetto a <code>192.168.4.10</code>.</p>
<p>Vediamo cosa succede.</p>
<h3>Passaggio 1 — PC1 controlla la destinazione</h3>
<p>PC1 possiede <code>192.168.1.10/24</code> e quindi appartiene alla rete <code>192.168.1.0/24</code>.</p>
<p>Il destinatario <code>192.168.4.10</code> non appartiene a quella rete.</p>
<p>PC1 comprende che deve utilizzare il gateway predefinito <code>192.168.1.1</code>, cioè R1.</p>
<p>Per il collegamento Ethernet, PC1 individua tramite ARP il MAC del gateway, se non lo conosce già, e gli consegna un frame contenente il pacchetto IP.</p>
<p>Il pacchetto ha:</p>
<ul>
<li>IP sorgente: <code>192.168.1.10</code></li>
<li>IP destinazione: <code>192.168.4.10</code></li>
</ul>
<h3>Passaggio 2 — R1 consulta la tabella</h3>
<p>R1 riceve il frame, estrae il pacchetto IP e legge la destinazione <code>192.168.4.10</code>.</p>
<p>Consulta la tabella di routing.</p>
<p>Le sue rotte riguardano soltanto:</p>
<ul>
<li><code>192.168.1.0/24</code></li>
<li><code>10.0.13.0/30</code></li>
<li><code>10.0.12.0/30</code></li>
</ul>
<p>Nessuna di queste comprende <code>192.168.4.10</code>.</p>
<p>Non esiste neppure una rotta predefinita.</p>
<p>R1 non ha quindi una rotta utilizzabile per la destinazione e <strong>scarta il pacchetto</strong>. Può anche notificare il problema con un messaggio ICMP.</p>
<p>Il percorso si interrompe:</p>
<p><strong>PC1 → R1 → STOP</strong></p>
<p>Il collegamento fra PC1 e R1 funziona. Anche R1 e R3 sono collegati correttamente.</p>
<p>Il problema è che R1 non sa quale strada utilizzare per arrivare alla rete di PC4.</p>
</section>
<section id="parte-5">
<h2>5. La soluzione: configurare una rotta statica</h2>
<p>Il <strong>routing statico</strong> consiste nell'inserire manualmente nelle configurazioni dei router le rotte necessarie.</p>
<p>L'amministratore decide come raggiungere una determinata rete e indica al router il prossimo salto da utilizzare.</p>
<p>Per esempio, su R1 possiamo configurare questa rotta:</p>
<table><thead><tr><th scope="col">Rete di destinazione</th><th scope="col">Prossimo salto</th></tr></thead><tbody>
<tr><td><code>192.168.4.0/24</code></td><td><code>10.0.13.2</code></td></tr>
</tbody></table>
<p>Il significato è:</p>
<p><strong>«Se devi raggiungere la rete 192.168.4.0/24, invia il pacchetto al router con indirizzo 10.0.13.2».</strong></p>
<p>Il router che possiede <code>10.0.13.2</code> è R3.</p>
<h3>Destinazione, next hop e interfaccia di uscita</h3>
<p>Una rotta viene descritta mediante informazioni differenti.</p>
<p><strong>Destinazione:</strong> il prefisso degli indirizzi ai quali si applica la rotta. In questo caso è <code>192.168.4.0/24</code>.</p>
<p><strong>Next hop:</strong> il prossimo router al quale bisogna affidare il pacchetto. In questo caso è R3, all'indirizzo <code>10.0.13.2</code>.</p>
<p><strong>Interfaccia di uscita:</strong> l'interfaccia locale attraverso la quale il router raggiunge il prossimo salto.</p>
<p>Per esempio:</p>
<table><thead><tr><th scope="col">Destinazione</th><th scope="col">Next hop</th><th scope="col">Interfaccia di uscita</th></tr></thead><tbody>
<tr><td><code>192.168.4.0/24</code></td><td><code>10.0.13.2</code> (R3)</td><td>Verso R3</td></tr>
</tbody></table>
<p>Per raggiungere il next hop, il router utilizza le informazioni della propria tabella per individuare il collegamento necessario.</p>
<p>In questa topologia il next hop è direttamente raggiungibile.</p>
<p>La rete di destinazione e il prossimo salto non devono essere confusi: il pacchetto è destinato a PC4, anche se inizialmente viene inoltrato a R3.</p>
</section>
<section id="andata">
<h2>6. Configuriamo il percorso di andata</h2>
<p>Aggiungiamo le rotte una alla volta, verificando ogni volta dove arriva il pacchetto.</p>
<h3>Prima rotta: R1 deve inoltrare a R3</h3>
<p>Su R1 aggiungiamo:</p>
<table><thead><tr><th scope="col">Router</th><th scope="col">Destinazione</th><th scope="col">Next hop</th></tr></thead><tbody>
<tr><td>R1</td><td><code>192.168.4.0/24</code></td><td><code>10.0.13.2</code> (R3)</td></tr>
</tbody></table>
<p>Ora PC1 invia nuovamente il pacchetto.</p>
<p>R1 consulta la tabella e trova la nuova rotta. Inoltra quindi il pacchetto a R3.</p>
<p><strong>PC1 → R1 → R3 → STOP</strong></p>
<p>Perché il pacchetto si ferma su R3?</p>
<p>R3 conosce i collegamenti <code>10.0.13.0/30</code> e <code>10.0.34.0/30</code>, ma non conosce ancora <code>192.168.4.0/24</code>.</p>
<p>Anche se è collegato fisicamente a R4, non sa automaticamente che la rete di PC4 è raggiungibile attraverso R4.</p>
<p>Dobbiamo configurare una rotta anche su R3.</p>
<h3>Seconda rotta: R3 deve inoltrare a R4</h3>
<p>Su R3 aggiungiamo:</p>
<table><thead><tr><th scope="col">Router</th><th scope="col">Destinazione</th><th scope="col">Next hop</th></tr></thead><tbody>
<tr><td>R3</td><td><code>192.168.4.0/24</code></td><td><code>10.0.34.2</code> (R4)</td></tr>
</tbody></table>
<p>Adesso R3 sa che, per raggiungere la LAN di PC4, deve inoltrare il pacchetto a R4.</p>
<p>Il percorso diventa:</p>
<p><strong>PC1 → R1 → R3 → R4 → PC4</strong></p>
<p>R4 conosce già <code>192.168.4.0/24</code>, perché è direttamente collegata a una sua interfaccia.</p>
<p>Può quindi effettuare la consegna sul collegamento locale a PC4.</p>
<h3>Le rotte utilizzate per l'andata</h3>
<table><thead><tr><th scope="col">Router</th><th scope="col">Destinazione</th><th scope="col">Come raggiungerla</th></tr></thead><tbody>
<tr><td>R1</td><td><code>192.168.4.0/24</code></td><td>Via R3</td></tr>
<tr><td>R3</td><td><code>192.168.4.0/24</code></td><td>Via R4</td></tr>
<tr><td>R4</td><td><code>192.168.4.0/24</code></td><td>Direttamente collegata</td></tr>
</tbody></table>
<p>Per configurare il percorso di andata sono state necessarie soltanto due rotte statiche.</p>
<p>Ma la comunicazione non è ancora completa.</p>
</section>
<section id="parte-7">
<h2>7. Il pacchetto arriva, ma la risposta non torna</h2>
<p>Supponiamo che PC1 abbia eseguito:</p>
<p><code>ping 192.168.4.10</code></p>
<p>Il comando <code>ping</code> invia messaggi ICMP Echo Request e attende messaggi Echo Reply.</p>
<p>Grazie alle rotte appena configurate, la richiesta raggiunge PC4.</p>
<p>PC4 genera quindi una risposta con:</p>
<ul>
<li>IP sorgente: <code>192.168.4.10</code></li>
<li>IP destinazione: <code>192.168.1.10</code></li>
</ul>
<p>PC4 deve raggiungere un indirizzo esterno alla propria LAN, quindi consegna la risposta al gateway R4.</p>
<p>Ma R4 non conosce la rete <code>192.168.1.0/24</code>.</p>
<p>La risposta si ferma.</p>
<p><strong>PC4 → R4 → STOP</strong></p>
<p>PC1 non riceve l'Echo Reply e il <code>ping</code> fallisce.</p>
<p>Questo dimostra che <strong>il percorso di andata e quello di ritorno devono entrambi essere utilizzabili</strong>.</p>
<p>I router non ricavano automaticamente la strada di ritorno osservando il percorso seguito dalla richiesta.</p>
<p>La risposta è un nuovo pacchetto, con una nuova destinazione IP, per il quale vengono effettuate nuove decisioni di routing.</p>
</section>
<section id="ritorno">
<h2>8. Configuriamo il percorso di ritorno</h2>
<p>Vogliamo che la risposta segua:</p>
<p><strong>PC4 → R4 → R3 → R1 → PC1</strong></p>
<h3>Prima rotta di ritorno: R4 deve inoltrare a R3</h3>
<p>Su R4 aggiungiamo:</p>
<table><thead><tr><th scope="col">Router</th><th scope="col">Destinazione</th><th scope="col">Next hop</th></tr></thead><tbody>
<tr><td>R4</td><td><code>192.168.1.0/24</code></td><td><code>10.0.34.1</code> (R3)</td></tr>
</tbody></table>
<p>La risposta ora può arrivare a R3.</p>
<p><strong>PC4 → R4 → R3 → STOP</strong></p>
<p>R3 però non conosce ancora la rete di PC1.</p>
<h3>Seconda rotta di ritorno: R3 deve inoltrare a R1</h3>
<p>Su R3 aggiungiamo:</p>
<table><thead><tr><th scope="col">Router</th><th scope="col">Destinazione</th><th scope="col">Next hop</th></tr></thead><tbody>
<tr><td>R3</td><td><code>192.168.1.0/24</code></td><td><code>10.0.13.1</code> (R1)</td></tr>
</tbody></table>
<p>Ora la risposta arriva a R1.</p>
<p>R1 conosce già la rete <code>192.168.1.0/24</code> perché direttamente collegata.</p>
<p>La risposta raggiunge quindi PC1.</p>
<p><strong>PC4 → R4 → R3 → R1 → PC1</strong></p>
<p>Abbiamo completato la comunicazione.</p>
<h3>Riepilogo delle quattro rotte statiche</h3>
<table><thead><tr><th scope="col">Router</th><th scope="col">Rete di destinazione</th><th scope="col">Next hop</th><th scope="col">Utilizzo</th></tr></thead><tbody>
<tr><td>R1</td><td><code>192.168.4.0/24</code></td><td><code>10.0.13.2</code> (R3)</td><td>Andata</td></tr>
<tr><td>R3</td><td><code>192.168.4.0/24</code></td><td><code>10.0.34.2</code> (R4)</td><td>Andata</td></tr>
<tr><td>R4</td><td><code>192.168.1.0/24</code></td><td><code>10.0.34.1</code> (R3)</td><td>Ritorno</td></tr>
<tr><td>R3</td><td><code>192.168.1.0/24</code></td><td><code>10.0.13.1</code> (R1)</td><td>Ritorno</td></tr>
</tbody></table>
<p>Non è necessario configurare una rotta statica su R1 verso PC1, né su R4 verso PC4: sono reti direttamente collegate.</p>
<p>Inoltre, andata e ritorno non devono necessariamente percorrere gli stessi router. La nostra configurazione utilizza lo stesso percorso in entrambe le direzioni soltanto per semplicità.</p>
</section>
<section id="parte-9">
<h2>9. Le tabelle di routing dopo la configurazione</h2>
<p>Vediamo le informazioni presenti sui dispositivi quando la comunicazione attraverso R3 funziona.</p>
<p>Per semplicità, le tabelle mostrano le rotte alle reti, senza le rotte locali <code>/32</code> e altri dettagli dipendenti dal sistema operativo. La colonna «Interfaccia» indica il collegamento di uscita, senza assegnare nomi fisici specifici alle porte.</p>
<h3>PC1</h3>
<table><thead><tr><th scope="col">Destinazione</th><th scope="col">Next hop</th><th scope="col">Uscita</th></tr></thead><tbody>
<tr><td><code>192.168.1.0/24</code></td><td>Diretta</td><td>LAN</td></tr>
<tr><td><code>0.0.0.0/0</code></td><td><code>192.168.1.1</code> (R1)</td><td>LAN</td></tr>
</tbody></table>
<p>PC1 affida al gateway R1 i pacchetti destinati a reti esterne.</p>
<h3>R1</h3>
<table><thead><tr><th scope="col">Destinazione</th><th scope="col">Next hop</th><th scope="col">Uscita</th></tr></thead><tbody>
<tr><td><code>192.168.1.0/24</code></td><td>Diretto</td><td>LAN PC1</td></tr>
<tr><td><code>10.0.13.0/30</code></td><td>Diretto</td><td>Verso R3</td></tr>
<tr><td><code>10.0.12.0/30</code></td><td>Diretto</td><td>Verso R2</td></tr>
<tr><td><code>192.168.4.0/24</code></td><td><code>10.0.13.2</code> (R3)</td><td>Verso R3</td></tr>
</tbody></table>
<p>La quarta riga è la rotta statica che abbiamo aggiunto.</p>
<h3>R3</h3>
<table><thead><tr><th scope="col">Destinazione</th><th scope="col">Next hop</th><th scope="col">Uscita</th></tr></thead><tbody>
<tr><td><code>10.0.13.0/30</code></td><td>Diretto</td><td>Verso R1</td></tr>
<tr><td><code>10.0.34.0/30</code></td><td>Diretto</td><td>Verso R4</td></tr>
<tr><td><code>192.168.4.0/24</code></td><td><code>10.0.34.2</code> (R4)</td><td>Verso R4</td></tr>
<tr><td><code>192.168.1.0/24</code></td><td><code>10.0.13.1</code> (R1)</td><td>Verso R1</td></tr>
</tbody></table>
<p>R3 possiede due rotte statiche, una per ciascuna LAN remota.</p>
<h3>R4</h3>
<table><thead><tr><th scope="col">Destinazione</th><th scope="col">Next hop</th><th scope="col">Uscita</th></tr></thead><tbody>
<tr><td><code>192.168.4.0/24</code></td><td>Diretto</td><td>LAN PC4</td></tr>
<tr><td><code>10.0.34.0/30</code></td><td>Diretto</td><td>Verso R3</td></tr>
<tr><td><code>10.0.24.0/30</code></td><td>Diretto</td><td>Verso R2</td></tr>
<tr><td><code>192.168.1.0/24</code></td><td><code>10.0.34.1</code> (R3)</td><td>Verso R3</td></tr>
</tbody></table>
<p>La rotta statica verso la LAN di PC1 è necessaria per il ritorno.</p>
<h3>PC4</h3>
<table><thead><tr><th scope="col">Destinazione</th><th scope="col">Next hop</th><th scope="col">Uscita</th></tr></thead><tbody>
<tr><td><code>192.168.4.0/24</code></td><td>Diretta</td><td>LAN</td></tr>
<tr><td><code>0.0.0.0/0</code></td><td><code>192.168.4.1</code> (R4)</td><td>LAN</td></tr>
</tbody></table>
<h3>R2</h3>
<p>Per ora R2 non viene attraversato dai pacchetti tra PC1 e PC4.</p>
<p>La sua tabella contiene soltanto:</p>
<table><thead><tr><th scope="col">Destinazione</th><th scope="col">Next hop</th><th scope="col">Uscita</th></tr></thead><tbody>
<tr><td><code>10.0.12.0/30</code></td><td>Diretto</td><td>Verso R1</td></tr>
<tr><td><code>10.0.24.0/30</code></td><td>Diretto</td><td>Verso R4</td></tr>
</tbody></table>
<p>R2 è fisicamente collegato alla rete, ma non sa ancora come raggiungere le LAN di PC1 e PC4.</p>
</section>
<section id="parte-10">
<h2>10. Che cosa succede se R3 si guasta?</h2>
<p>La comunicazione funziona attraverso il percorso superiore:</p>
<p><code>PC1 → R1 → R3 → R4 → PC4</code></p>
<p>Supponiamo però che R3 smetta completamente di funzionare.</p>
<p>Il percorso principale si interrompe.</p>
<p>Fisicamente esiste ancora il percorso inferiore:</p>
<p><code>PC1 → R1 → R2 → R4 → PC4</code></p>
<p>Ma la presenza dei collegamenti non basta.</p>
<p>R1 deve sapere di poter raggiungere la LAN di PC4 attraverso R2. Inoltre, R2 deve sapere dove inoltrare i pacchetti ricevuti.</p>
<p>Infine, anche R4 deve disporre di una strada per il ritorno attraverso R2.</p>
<h3>10.1 Prima possibilità: cambiare manualmente le rotte</h3>
<p>Con il routing statico tradizionale, un amministratore può intervenire e modificare il percorso.</p>
<p>Su R1 sostituisce la rotta:</p>
<p><code>192.168.4.0/24 → R3</code></p>
<p>con:</p>
<p><code>192.168.4.0/24 → R2</code></p>
<p>Poi configura R2 per raggiungere PC4 tramite R4.</p>
<p>Per il ritorno modifica la rotta di R4 affinché utilizzi R2 e aggiunge su R2 quella verso la LAN di PC1.</p>
<p>Le rotte necessarie per il nuovo percorso sono:</p>
<table><thead><tr><th scope="col">Router</th><th scope="col">Destinazione</th><th scope="col">Next hop</th></tr></thead><tbody>
<tr><td>R1</td><td><code>192.168.4.0/24</code></td><td><code>10.0.12.2</code> (R2)</td></tr>
<tr><td>R2</td><td><code>192.168.4.0/24</code></td><td><code>10.0.24.2</code> (R4)</td></tr>
<tr><td>R4</td><td><code>192.168.1.0/24</code></td><td><code>10.0.24.1</code> (R2)</td></tr>
<tr><td>R2</td><td><code>192.168.1.0/24</code></td><td><code>10.0.12.1</code> (R1)</td></tr>
</tbody></table>
<p>Il nuovo percorso funziona, ma ha richiesto modifiche manuali.</p>
<p>È possibile preparare le rotte alternative prima del guasto?</p>
</section>
<section id="parte-11">
<h2>11. Preparare una rotta statica di riserva</h2>
<p>Su molti router è possibile configurare due rotte verso la stessa rete, indicando una rotta principale e una di riserva.</p>
<p>Per esempio, R1 potrebbe avere entrambe queste informazioni:</p>
<table><thead><tr><th scope="col">Destinazione</th><th scope="col">Next hop</th><th scope="col">Ruolo</th></tr></thead><tbody>
<tr><td><code>192.168.4.0/24</code></td><td><code>10.0.13.2</code> (R3)</td><td>Principale</td></tr>
<tr><td><code>192.168.4.0/24</code></td><td><code>10.0.12.2</code> (R2)</td><td>Riserva</td></tr>
</tbody></table>
<p>Ma sorge una domanda: <strong>come fa R1 a scegliere R3 invece di R2?</strong></p>
<h3>11.1 Non basta il Longest Prefix Match</h3>
<p>Nella lezione precedente abbiamo imparato che, quando più prefissi corrispondono all'indirizzo di destinazione, vince quello più lungo.</p>
<p>In questo caso, però, le due rotte hanno esattamente lo stesso prefisso:</p>
<p><code>192.168.4.0/24</code></p>
<p>Non possiamo distinguerle con il Longest Prefix Match.</p>
<p>Serve quindi un ulteriore criterio di selezione.</p>
<h3>11.2 La preferenza delle rotte</h3>
<p>Su router come quelli Cisco esiste un parametro chiamato <strong>distanza amministrativa</strong> (<em>Administrative Distance</em>).</p>
<p>Il suo scopo è esprimere la preferenza assegnata a una rotta rispetto a un'altra candidata per lo stesso prefisso.</p>
<p>Su Cisco, un valore più basso indica una preferenza maggiore.</p>
<p>Per esempio:</p>
<table><thead><tr><th scope="col">Destinazione</th><th scope="col">Next hop</th><th scope="col">Distanza amministrativa</th></tr></thead><tbody>
<tr><td><code>192.168.4.0/24</code></td><td>R3</td><td>1</td></tr>
<tr><td><code>192.168.4.0/24</code></td><td>R2</td><td>10</td></tr>
</tbody></table>
<p>In questo esempio, basato sul criterio di preferenza Cisco:</p>
<ul>
<li>La rotta via R3 viene scelta come principale.</li>
<li>La rotta via R2 viene mantenuta come riserva.</li>
</ul>
<p>La seconda prende il nome di <strong>floating static route</strong>, cioè rotta statica di riserva.</p>
<p>La rotta può essere presente nella configurazione del router senza essere installata nella tabella attiva utilizzata per inoltrare i pacchetti.</p>
<p>Quando la rotta principale diventa inutilizzabile e viene rimossa dalla tabella attiva, quella di riserva può prendere il suo posto.</p>
<p><strong>Attenzione:</strong> se due rotte hanno lo stesso prefisso e la stessa preferenza, alcuni dispositivi possono utilizzarle entrambe, distribuendo il traffico tra più percorsi. Non significa necessariamente che una faccia da riserva all'altra.</p>
</section>
<section id="parte-12">
<h2>12. Prepariamo il percorso alternativo completo</h2>
<p>Non basta configurare su R1 una rotta di riserva verso R2.</p>
<p>Bisogna preparare tutti i router necessari al nuovo percorso.</p>
<h3>Passaggio 1 — Configurare R2</h3>
<p>R2 deve conoscere entrambe le reti locali.</p>
<p>Aggiungiamo:</p>
<table><thead><tr><th scope="col">Destinazione</th><th scope="col">Next hop</th></tr></thead><tbody>
<tr><td><code>192.168.4.0/24</code></td><td><code>10.0.24.2</code> (R4)</td></tr>
<tr><td><code>192.168.1.0/24</code></td><td><code>10.0.12.1</code> (R1)</td></tr>
</tbody></table>
<p>La nuova tabella di R2 sarà:</p>
<table><thead><tr><th scope="col">Destinazione</th><th scope="col">Next hop</th><th scope="col">Uscita</th></tr></thead><tbody>
<tr><td><code>10.0.12.0/30</code></td><td>Diretto</td><td>Verso R1</td></tr>
<tr><td><code>10.0.24.0/30</code></td><td>Diretto</td><td>Verso R4</td></tr>
<tr><td><code>192.168.4.0/24</code></td><td><code>10.0.24.2</code> (R4)</td><td>Verso R4</td></tr>
<tr><td><code>192.168.1.0/24</code></td><td><code>10.0.12.1</code> (R1)</td><td>Verso R1</td></tr>
</tbody></table>
<p>R2 è adesso pronto a inoltrare pacchetti verso PC4 e verso PC1.</p>
<h3>Passaggio 2 — Configurare la riserva su R1</h3>
<p>Su R1 predisponiamo:</p>
<table><thead><tr><th scope="col">Destinazione</th><th scope="col">Next hop</th><th scope="col">Preferenza</th></tr></thead><tbody>
<tr><td><code>192.168.4.0/24</code></td><td>R3</td><td>Principale</td></tr>
<tr><td><code>192.168.4.0/24</code></td><td>R2</td><td>Riserva</td></tr>
</tbody></table>
<p>Finché R3 funziona, R1 continua a utilizzare R3.</p>
<h3>Passaggio 3 — Configurare la riserva su R4</h3>
<p>Anche il percorso di ritorno deve poter cambiare.</p>
<p>Su R4 predisponiamo:</p>
<table><thead><tr><th scope="col">Destinazione</th><th scope="col">Next hop</th><th scope="col">Preferenza</th></tr></thead><tbody>
<tr><td><code>192.168.1.0/24</code></td><td>R3</td><td>Principale</td></tr>
<tr><td><code>192.168.1.0/24</code></td><td>R2</td><td>Riserva</td></tr>
</tbody></table>
<p>Ora entrambi gli estremi della rete possiedono un percorso di riserva configurato.</p>
<h3>Tutte le rotte statiche predisposte</h3>
<table><thead><tr><th scope="col">Router</th><th scope="col">Destinazione</th><th scope="col">Next hop</th><th scope="col">Ruolo</th></tr></thead><tbody>
<tr><td>R1</td><td><code>192.168.4.0/24</code></td><td>R3</td><td>Principale</td></tr>
<tr><td>R1</td><td><code>192.168.4.0/24</code></td><td>R2</td><td>Riserva</td></tr>
<tr><td>R2</td><td><code>192.168.4.0/24</code></td><td>R4</td><td>Statica</td></tr>
<tr><td>R2</td><td><code>192.168.1.0/24</code></td><td>R1</td><td>Statica</td></tr>
<tr><td>R3</td><td><code>192.168.4.0/24</code></td><td>R4</td><td>Statica</td></tr>
<tr><td>R3</td><td><code>192.168.1.0/24</code></td><td>R1</td><td>Statica</td></tr>
<tr><td>R4</td><td><code>192.168.1.0/24</code></td><td>R3</td><td>Principale</td></tr>
<tr><td>R4</td><td><code>192.168.1.0/24</code></td><td>R2</td><td>Riserva</td></tr>
</tbody></table>
<p>Questa tabella rappresenta la <strong>configurazione delle rotte</strong>, comprese quelle di riserva.</p>
<p>Non è identica alla tabella delle rotte attive.</p>
<p>Con R3 funzionante, R1 e R4 continuano a utilizzare le rotte principali via R3. Le rispettive rotte floating via R2 rimangono in attesa. Su R2, invece, le due nuove rotte statiche sono già installate.</p>
</section>
<section id="parte-13">
<h2>13. R3 si spegne: come cambiano le tabelle?</h2>
<div data-routing-diagram="network-backup"></div>
<p>Supponiamo che R3 si spenga completamente, provocando la disattivazione dei collegamenti R1–R3 e R3–R4.</p>
<p>R1 non può più raggiungere il next hop <code>10.0.13.2</code> attraverso il collegamento diretto, ormai inattivo.</p>
<p>La rotta principale via R3 non è più utilizzabile.</p>
<p>R1 possiede però una rotta di riserva attraverso R2, che è ancora raggiungibile.</p>
<p>La rotta di riserva può quindi diventare attiva.</p>
<p>Lo stesso succede su R4 per il ritorno.</p>
<p>Il traffico passa ora attraverso:</p>
<p><strong>Andata:</strong> PC1 → R1 → R2 → R4 → PC4</p>
<p><strong>Ritorno:</strong> PC4 → R4 → R2 → R1 → PC1</p>
<p>Vediamo le tabelle attive dopo il guasto.</p>
<h3>PC1 — Nessuna modifica</h3>
<table><thead><tr><th scope="col">Destinazione</th><th scope="col">Next hop</th></tr></thead><tbody>
<tr><td><code>192.168.1.0/24</code></td><td>Diretto</td></tr>
<tr><td><code>0.0.0.0/0</code></td><td><code>192.168.1.1</code> (R1)</td></tr>
</tbody></table>
<p>PC1 continua a utilizzare R1 come gateway.</p>
<h3>R1 — Ora utilizza R2</h3>
<table><thead><tr><th scope="col">Destinazione</th><th scope="col">Next hop</th><th scope="col">Uscita</th></tr></thead><tbody>
<tr><td><code>192.168.1.0/24</code></td><td>Diretto</td><td>LAN PC1</td></tr>
<tr><td><code>10.0.12.0/30</code></td><td>Diretto</td><td>Verso R2</td></tr>
<tr><td><code>192.168.4.0/24</code></td><td><code>10.0.12.2</code> (R2)</td><td>Verso R2</td></tr>
</tbody></table>
<p>La rotta principale attraverso R3 non è più attiva.</p>
<p>Anche la rete direttamente collegata <code>10.0.13.0/30</code> è scomparsa dalle rotte collegate attive perché il relativo collegamento è sceso.</p>
<h3>R2 — Le rotte sono già pronte</h3>
<table><thead><tr><th scope="col">Destinazione</th><th scope="col">Next hop</th><th scope="col">Uscita</th></tr></thead><tbody>
<tr><td><code>10.0.12.0/30</code></td><td>Diretto</td><td>Verso R1</td></tr>
<tr><td><code>10.0.24.0/30</code></td><td>Diretto</td><td>Verso R4</td></tr>
<tr><td><code>192.168.4.0/24</code></td><td><code>10.0.24.2</code> (R4)</td><td>Verso R4</td></tr>
<tr><td><code>192.168.1.0/24</code></td><td><code>10.0.12.1</code> (R1)</td><td>Verso R1</td></tr>
</tbody></table>
<p>R2 non deve cambiare le proprie rotte.</p>
<p>Prima del guasto erano già configurate e utilizzabili. Ora R2 riceve anche il traffico che precedentemente passava per R3.</p>
<h3>R3 — Fuori servizio</h3>
<p>R3 è spento e non partecipa all'inoltro dei pacchetti.</p>
<h3>R4 — Ora utilizza R2</h3>
<table><thead><tr><th scope="col">Destinazione</th><th scope="col">Next hop</th><th scope="col">Uscita</th></tr></thead><tbody>
<tr><td><code>192.168.4.0/24</code></td><td>Diretto</td><td>LAN PC4</td></tr>
<tr><td><code>10.0.24.0/30</code></td><td>Diretto</td><td>Verso R2</td></tr>
<tr><td><code>192.168.1.0/24</code></td><td><code>10.0.24.1</code> (R2)</td><td>Verso R2</td></tr>
</tbody></table>
<p>La rotta di ritorno via R3 non è più attiva.</p>
<h3>PC4 — Nessuna modifica</h3>
<table><thead><tr><th scope="col">Destinazione</th><th scope="col">Next hop</th></tr></thead><tbody>
<tr><td><code>192.168.4.0/24</code></td><td>Diretto</td></tr>
<tr><td><code>0.0.0.0/0</code></td><td><code>192.168.4.1</code> (R4)</td></tr>
</tbody></table>
<h3>Confronto prima e dopo il guasto</h3>
<table><thead><tr><th scope="col">Router</th><th scope="col">Rete da raggiungere</th><th scope="col">Prima</th><th scope="col">Dopo</th></tr></thead><tbody>
<tr><td>R1</td><td><code>192.168.4.0/24</code></td><td>R3</td><td><strong>R2</strong></td></tr>
<tr><td>R2</td><td><code>192.168.4.0/24</code></td><td>R4</td><td>R4</td></tr>
<tr><td>R2</td><td><code>192.168.1.0/24</code></td><td>R1</td><td>R1</td></tr>
<tr><td>R4</td><td><code>192.168.1.0/24</code></td><td>R3</td><td><strong>R2</strong></td></tr>
</tbody></table>
<p>Il cambiamento delle decisioni di inoltro interessa R1 e R4.</p>
<p>R2 era già stato configurato.</p>
<p>I computer continuano a utilizzare i loro gateway abituali.</p>
<p>Questo esempio mostra come una rotta statica di riserva possa essere utilizzata quando il percorso principale diventa chiaramente inutilizzabile.</p>
</section>
<section id="sezione-17">
<h2>14. Un problema importante: R1 non vede tutti i guasti</h2>
<p>Finora abbiamo supposto che R3 si spegnesse completamente.</p>
<p>Ma consideriamo una situazione diversa.</p>
<p>R3 continua a funzionare e il collegamento R1–R3 rimane attivo.</p>
<p>Si interrompe soltanto il collegamento R3–R4.</p>
<div data-routing-diagram="network-failed"></div>
<p>Che cosa succede?</p>
<p>R1 può ancora raggiungere R3 all'indirizzo <code>10.0.13.2</code>.</p>
<p>La rotta statica di R1 attraverso R3 può quindi rimanere attiva, anche se R3 non riesce più a raggiungere R4 lungo il percorso previsto.</p>
<p>R1 continua a inviare i pacchetti a R3.</p>
<p><strong>PC1 → R1 → R3 → STOP</strong></p>
<p>R3 non dispone di una rotta alternativa utilizzabile verso PC4.</p>
<p>Il pacchetto si ferma, nonostante la presenza di un percorso fisico attraverso R2.</p>
<h3>Perché non viene attivata automaticamente la riserva?</h3>
<p>Perché R1 può rilevare che il proprio collegamento con R3 funziona, ma questo non dimostra che tutta la strada fino alla destinazione sia funzionante.</p>
<p>R1 non conosce automaticamente lo stato di ogni collegamento remoto.</p>
<p>Una floating static route, da sola, non garantisce quindi il recupero da tutti i guasti.</p>
<h3>Possibili soluzioni</h3>
<p><strong>Intervento manuale:</strong> l'amministratore rileva il problema e cambia la rotta di R1 affinché utilizzi R2.</p>
<p><strong>Monitoraggio del percorso:</strong> su alcuni dispositivi è possibile verificare periodicamente la raggiungibilità di una destinazione oltre R3. Un meccanismo di controllo, come IP SLA associato a route tracking su Cisco, può disattivare la rotta principale quando una condizione monitorata non è più soddisfatta.</p>
<p>Il controllo deve essere configurato in modo da verificare effettivamente la raggiungibilità attraverso il percorso principale.</p>
<p><strong>Routing dinamico:</strong> protocolli specifici permettono ai router di scambiarsi informazioni sui percorsi e aggiornare le proprie rotte quando cambia la rete.</p>
<p>Il routing dinamico sarà affrontato nella prossima lezione.</p>
</section>
<section id="parte-15">
<h2>15. E il costo di un percorso?</h2>
<div data-routing-diagram="network-costs"></div>
<p>Finora abbiamo utilizzato una rotta principale e una di riserva, stabilendo manualmente quale preferire.</p>
<p>Ma in una rete possono esistere diversi percorsi per raggiungere la stessa destinazione.</p>
<p>Come si può stabilire quale sia il migliore?</p>
<p>Uno dei criteri possibili è il <strong>costo del percorso</strong>.</p>
<p>Supponiamo di assegnare i seguenti costi ai collegamenti fra i router della nostra topologia:</p>
<table><thead><tr><th scope="col">Collegamento</th><th scope="col">Costo</th></tr></thead><tbody>
<tr><td>R1–R3</td><td>2</td></tr>
<tr><td>R3–R4</td><td>2</td></tr>
<tr><td>R1–R2</td><td>3</td></tr>
<tr><td>R2–R4</td><td>3</td></tr>
</tbody></table>
<p>Il costo complessivo di un percorso è, in questo esempio, la somma dei costi dei collegamenti attraversati.</p>
<p><strong>Percorso attraverso R3:</strong></p>
<p>R1 → R3 → R4</p>
<p>Costo: <code>2 + 2 = 4</code></p>
<p><strong>Percorso attraverso R2:</strong></p>
<p>R1 → R2 → R4</p>
<p>Costo: <code>3 + 3 = 6</code></p>
<p>Il percorso attraverso R3 ha costo minore.</p>
<p>Se un algoritmo di routing deve individuare il percorso meno costoso utilizzando questi valori, sceglierà R3.</p>
<h3>Il costo non indica necessariamente il numero di router</h3>
<p>Un percorso con pochi collegamenti non è automaticamente migliore di uno con più collegamenti.</p>
<p>Per esempio:</p>
<ul>
<li>Un percorso diretto potrebbe avere costo 10.</li>
<li>Un percorso con tre collegamenti potrebbe avere costi 2, 2 e 2, per un totale di 6.</li>
</ul>
<p>Il secondo attraversa più collegamenti, ma ha costo minore.</p>
<p>Nelle reti reali, il costo dipende dalla metrica adottata dal protocollo. Può essere configurato oppure derivare da caratteristiche come la capacità del collegamento.</p>
<p>Un costo pari a 4 non significa necessariamente quattro millisecondi o quattro chilometri.</p>
<h3>Costo del percorso e distanza amministrativa non sono la stessa cosa</h3>
<p>È importante distinguere due concetti.</p>
<table><thead><tr><th scope="col">Costo del percorso</th><th scope="col">Distanza amministrativa</th></tr></thead><tbody>
<tr><td>Serve a confrontare i percorsi secondo una metrica di routing.</td><td>Serve a esprimere la preferenza tra rotte candidate, secondo le regole del dispositivo.</td></tr>
<tr><td>Può derivare dalla somma dei costi dei collegamenti.</td><td>Non rappresenta la somma dei costi dei collegamenti.</td></tr>
<tr><td>Viene utilizzato, per esempio, dagli algoritmi di routing dinamico.</td><td>Può essere utilizzato per configurare una floating static route su Cisco.</td></tr>
</tbody></table>
<p>Nella nostra rete statica, la scelta di usare R3 come percorso principale era stata stabilita manualmente.</p>
<p>I costi 4 e 6 sono un esempio per mostrare come si potrebbe confrontare matematicamente i due percorsi, <strong>non valori che R1 calcola automaticamente grazie alle rotte statiche configurate</strong>.</p>
<p>Nella prossima lezione vedremo come i router possono calcolare percorsi a costo minimo con un algoritmo come Dijkstra e aggiornare le loro decisioni quando la rete cambia.</p>
</section>
<section id="parte-16">
<h2>16. Routing statico: vantaggi e limiti</h2>
<p>Il routing statico è particolarmente adatto a reti piccole, stabili e con percorsi relativamente semplici.</p>
<p>Offre alcuni vantaggi:</p>
<ul>
<li>Le rotte sono esplicitamente controllate dall'amministratore.</li>
<li>Il funzionamento è prevedibile quando la configurazione è corretta.</li>
<li>Non è necessario utilizzare un protocollo dinamico per apprendere quelle rotte.</li>
<li>In reti semplici, le tabelle possono essere facili da comprendere e verificare.</li>
</ul>
<p>Presenta però anche dei limiti:</p>
<ul>
<li>Le rotte devono essere configurate sui router interessati.</li>
<li>Bisogna considerare sia l'andata sia il ritorno.</li>
<li>Una nuova rete può richiedere modifiche su più dispositivi.</li>
<li>Un guasto remoto può non essere rilevato automaticamente.</li>
<li>Preparare percorsi di riserva richiede una configurazione appropriata.</li>
</ul>
<p>Quando la rete cresce, gestire manualmente ogni percorso diventa sempre più difficile.</p>
</section>
<section id="parte-17">
<h2>17. Riepilogo</h2>
<p><strong>1. Reti direttamente collegate.</strong> Un router conosce le reti associate alle proprie interfacce attive e configurate.</p>
<p><strong>2. Rotte statiche.</strong> Le reti remote possono essere raggiunte attraverso rotte inserite manualmente.</p>
<p><strong>3. Prossimo salto.</strong> Ogni router deve sapere a quale vicino inoltrare il pacchetto; non è necessario che una singola rotta descriva tutto il percorso.</p>
<p><strong>4. Strada di ritorno.</strong> La richiesta e la risposta sono pacchetti distinti. Entrambe devono trovare rotte utilizzabili.</p>
<p><strong>5. Tabelle di routing.</strong> Le rotte configurate non coincidono necessariamente con le rotte effettivamente attive.</p>
<p><strong>6. Percorsi alternativi.</strong> Possono essere preparati in anticipo attraverso rotte statiche di riserva.</p>
<p><strong>7. Rilevamento dei guasti.</strong> Una rotta di riserva non garantisce automaticamente il recupero da ogni interruzione.</p>
<p><strong>8. Costo del percorso.</strong> Un criterio numerico può permettere di confrontare percorsi alternativi, ma non va confuso con la preferenza amministrativa delle rotte.</p>
</section>
<section id="verifica">
<h2>18. Esercizi di verifica</h2>
<p>Tutti gli esercizi fanno riferimento alla topologia:</p>
<div data-routing-diagram="network"></div>
<h3>Esercizio 1 — Individuare la rotta mancante</h3>
<p>PC1 invia un pacchetto a PC4.</p>
<p>R1 possiede la rotta <code>192.168.4.0/24 via 10.0.13.2</code>.</p>
<p>R3 conosce soltanto le reti direttamente collegate e non possiede una rotta predefinita.</p>
<ol>
<li>Fino a quale router arriva il pacchetto?</li>
<li>Perché si ferma?</li>
<li>Quale rotta statica bisogna configurare?</li>
</ol>
<h3>Esercizio 2 — La strada di ritorno</h3>
<p>Il pacchetto di PC1 arriva correttamente a PC4.</p>
<p>R4 non possiede alcuna rotta verso la rete di PC1 e non possiede una rotta predefinita.</p>
<ol>
<li>Fino a quale router arriva la risposta?</li>
<li>Qual è la destinazione IP della risposta?</li>
<li>Quali rotte servono per completare il ritorno attraverso R3?</li>
</ol>
<h3>Esercizio 3 — Due rotte per la stessa rete</h3>
<p>Su R1 sono configurate:</p>
<table><thead><tr><th scope="col">Destinazione</th><th scope="col">Next hop</th><th scope="col">Distanza amministrativa</th></tr></thead><tbody>
<tr><td><code>192.168.4.0/24</code></td><td>R3</td><td>1</td></tr>
<tr><td><code>192.168.4.0/24</code></td><td>R2</td><td>10</td></tr>
</tbody></table>
<p>Supponendo un router con il comportamento di preferenza descritto nella lezione:</p>
<ol>
<li>Quale rotta viene normalmente scelta?</li>
<li>Perché il Longest Prefix Match non distingue queste due rotte?</li>
<li>Quale rotta può diventare attiva quando la prima viene rimossa?</li>
<li>Perché PC1 non deve cambiare il proprio gateway?</li>
</ol>
<h3>Esercizio 4 — Guasto del collegamento R3–R4</h3>
<p>Il collegamento R3–R4 si interrompe, ma R1 riesce ancora a raggiungere R3.</p>
<ol>
<li>Perché R1 potrebbe continuare a inoltrare verso R3?</li>
<li>Dove si fermano i pacchetti se R3 non possiede rotte alternative?</li>
<li>Perché una rotta statica di riserva su R1 non è sempre sufficiente?</li>
<li>Come si potrebbe rilevare automaticamente il problema?</li>
</ol>
<h3>Esercizio 5 — Completare il percorso alternativo</h3>
<p>Dopo lo spegnimento di R3, vogliamo utilizzare R2.</p>
<p>Completare la tabella:</p>
<table><thead><tr><th scope="col">Router</th><th scope="col">Destinazione</th><th scope="col">Next hop</th></tr></thead><tbody>
<tr><td>R1</td><td><code>192.168.4.0/24</code></td><td>?</td></tr>
<tr><td>R2</td><td><code>192.168.4.0/24</code></td><td>?</td></tr>
<tr><td>R4</td><td><code>192.168.1.0/24</code></td><td>?</td></tr>
<tr><td>R2</td><td><code>192.168.1.0/24</code></td><td>?</td></tr>
</tbody></table>
<h3>Esercizio 6 — Confrontare i costi</h3>
<p>Consideriamo questi costi:</p>
<table><thead><tr><th scope="col">Collegamento</th><th scope="col">Costo</th></tr></thead><tbody>
<tr><td>R1–R3</td><td>2</td></tr>
<tr><td>R3–R4</td><td>5</td></tr>
<tr><td>R1–R2</td><td>3</td></tr>
<tr><td>R2–R4</td><td>2</td></tr>
</tbody></table>
<ol>
<li>Quanto costa il percorso R1 → R3 → R4?</li>
<li>Quanto costa il percorso R1 → R2 → R4?</li>
<li>Quale percorso ha costo minore?</li>
<li>Se è stato configurato manualmente R3 come next hop di una rotta statica, R1 sceglie automaticamente R2 soltanto perché il suo percorso ha costo inferiore?</li>
</ol>
<details><summary>Soluzioni degli esercizi</summary>
<p><strong>Esercizio 1.</strong> Il pacchetto arriva a R3, che non conosce la LAN di PC4. Occorre configurare <code>192.168.4.0/24 via 10.0.34.2</code> su R3.</p>
<p><strong>Esercizio 2.</strong> La risposta si ferma a R4. La sua destinazione IP è <code>192.168.1.10</code>. Servono una rotta su R4 verso R3 e una su R3 verso R1, entrambe per <code>192.168.1.0/24</code>.</p>
<p><strong>Esercizio 3.</strong> Normalmente viene scelta R3, che ha distanza amministrativa inferiore. I prefissi sono identici, quindi il Longest Prefix Match non li distingue. Se la rotta principale diventa inutilizzabile e viene rimossa, può subentrare R2. PC1 continua a utilizzare R1 come gateway.</p>
<p><strong>Esercizio 4.</strong> R1 può ancora raggiungere R3, perciò la rotta principale può rimanere attiva. I pacchetti si fermano a R3. Una rotta floating non garantisce da sola il rilevamento dei guasti remoti; possono servire monitoraggio del percorso o routing dinamico.</p>
<p><strong>Esercizio 5.</strong></p>
<table><thead><tr><th scope="col">Router</th><th scope="col">Destinazione</th><th scope="col">Next hop</th></tr></thead><tbody>
<tr><td>R1</td><td><code>192.168.4.0/24</code></td><td><code>10.0.12.2</code> (R2)</td></tr>
<tr><td>R2</td><td><code>192.168.4.0/24</code></td><td><code>10.0.24.2</code> (R4)</td></tr>
<tr><td>R4</td><td><code>192.168.1.0/24</code></td><td><code>10.0.24.1</code> (R2)</td></tr>
<tr><td>R2</td><td><code>192.168.1.0/24</code></td><td><code>10.0.12.1</code> (R1)</td></tr>
</tbody></table>
<p><strong>Esercizio 6.</strong> Il percorso tramite R3 costa <code>2 + 5 = 7</code>, mentre quello tramite R2 costa <code>3 + 2 = 5</code>. Il secondo è meno costoso. R1, però, non sostituisce automaticamente una rotta statica configurata via R3 soltanto in base a questi costi ipotetici.</p>
</details>
</section>
<section id="parte-19">
<h2>19. Verso il routing dinamico</h2>
<p>Abbiamo visto come configurare manualmente una rete, facendo comunicare due computer attraverso più router.</p>
<p>Abbiamo anche predisposto un percorso di riserva.</p>
<p>Ma è emerso un limite: il router non conosce automaticamente tutti i cambiamenti che si verificano negli altri collegamenti.</p>
<p>In una rete grande, con numerosi router e percorsi alternativi, aggiornare manualmente tutte le rotte può diventare molto complesso.</p>
<p>Sarebbe utile permettere ai router di scambiarsi informazioni, conoscere i cambiamenti e calcolare il percorso migliore.</p>
<p>È proprio questo l'obiettivo del <strong>routing dinamico</strong>.</p>
<p>Nella <a href="06-5-routing-dinamico.html">lezione 06.5</a> studieremo come si possono confrontare i percorsi attraverso una metrica e come i router aggiornano le rotte dopo un guasto.</p>
</section>`
  },
  {
    file: "06-5-routing-dinamico.html", title: "06.5 · Dal routing statico al routing dinamico",
    lead: "Come fanno i router a conoscere la rete, scegliere i percorsi e aggiornare automaticamente le proprie tabelle?",
    body: '<article class="routing-transition">' + require('node:fs').readFileSync(require('node:path').join(__dirname, 'routing-06-5.html'), 'utf8') + '</article>',
    extra: '<p><a href="07-dinamico-dijkstra.html">07 · Routing dinamico e algoritmo di Dijkstra →</a></p>'
  },
  {
    file: "07-dinamico-dijkstra.html", title: "07 · Routing dinamico e algoritmo di Dijkstra",
    lead: "Come fanno i router a conoscere i cambiamenti della rete e a scegliere automaticamente il percorso migliore?",
    body: `
<p>Nella lezione precedente abbiamo configurato manualmente le rotte necessarie per far comunicare PC1 e PC4.</p>
<p>Abbiamo anche scoperto un problema: quando un collegamento si interrompe, un router potrebbe continuare a utilizzare una strada che non funziona più.</p>
<p>In una rete piccola è possibile intervenire manualmente. Ma in una rete con decine o centinaia di router diventerebbe molto difficile aggiornare tutte le rotte a ogni cambiamento.</p>
<p>Il <strong>routing dinamico</strong> permette ai router di scambiarsi informazioni sulla rete e aggiornare le proprie rotte.</p>
<p>Vedremo inoltre come l'algoritmo di <strong>Dijkstra</strong> permette di calcolare i percorsi a costo minimo.</p>
<section id="sezione-18">
<h2>1. Riprendiamo la rete della lezione precedente</h2>
<p>Consideriamo la stessa topologia utilizzata per il routing statico:</p>
<div data-routing-diagram="network"></div>
<p>PC1 ha indirizzo <code>192.168.1.10</code> e appartiene alla rete <code>192.168.1.0/24</code>.</p>
<p>PC4 ha indirizzo <code>192.168.4.10</code> e appartiene alla rete <code>192.168.4.0/24</code>.</p>
<p>Per raggiungere PC4, R1 può utilizzare due percorsi:</p>
<ul>
<li><strong>Percorso superiore:</strong> R1 → R3 → R4</li>
<li><strong>Percorso inferiore:</strong> R1 → R2 → R4</li>
</ul>
<p>Nella lezione 06 avevamo scelto manualmente R3 e configurato le rotte di andata e ritorno.</p>
<p>Quando si interrompeva il collegamento R3–R4, R1 poteva continuare a inviare i pacchetti a R3, perché il collegamento R1–R3 funzionava ancora.</p>
<p>Con semplici rotte statiche, R1 non riceve automaticamente informazioni su tutti i collegamenti lontani.</p>
<p>Ora vogliamo ottenere un comportamento diverso:</p>
<ol>
<li>I router apprendono quali collegamenti esistono.</li>
<li>Calcolano quali percorsi permettono di raggiungere le varie reti.</li>
<li>Quando un collegamento cambia stato, aggiornano le informazioni.</li>
<li>Ricalcolano i percorsi e modificano le rotte quando necessario.</li>
</ol>
<p>Questo è il principio del routing dinamico.</p>
</section>
<section id="parte-2">
<h2>2. Che cos'è il routing dinamico?</h2>
<p>Nel <strong>routing statico</strong>, l'amministratore inserisce manualmente le rotte.</p>
<p>Per esempio, su R1 avevamo configurato:</p>
<table><thead><tr><th scope="col">Destinazione</th><th scope="col">Next hop</th></tr></thead><tbody>
<tr><td><code>192.168.4.0/24</code></td><td><code>10.0.13.2</code> (R3)</td></tr>
</tbody></table>
<p>R1 utilizzava questa informazione per raggiungere la rete di PC4.</p>
<p>Nel <strong>routing dinamico</strong>, invece, i router utilizzano un protocollo per scambiarsi informazioni e apprendere i percorsi verso le reti remote.</p>
<p>Un protocollo di routing stabilisce quali informazioni vengono scambiate, come vengono elaborate e quando devono essere aggiornate.</p>
<p>Esempi di protocolli di routing dinamico sono RIP, OSPF e IS-IS.</p>
<p>Questi protocolli non funzionano tutti allo stesso modo, ma hanno un obiettivo comune: permettere ai router di adattare le proprie rotte alla struttura della rete.</p>
<h3>Routing statico e dinamico a confronto</h3>
<table><thead><tr><th scope="col">Routing statico</th><th scope="col">Routing dinamico</th></tr></thead><tbody>
<tr><td>Le rotte vengono inserite manualmente.</td><td>Le rotte vengono apprese e aggiornate attraverso un protocollo.</td></tr>
<tr><td>L'amministratore definisce il percorso.</td><td>Il protocollo calcola o seleziona i percorsi secondo le proprie regole.</td></tr>
<tr><td>Non richiede lo scambio di informazioni di routing.</td><td>Richiede comunicazioni fra i router partecipanti.</td></tr>
<tr><td>È semplice da gestire in reti piccole.</td><td>È adatto anche a reti grandi e con percorsi alternativi.</td></tr>
<tr><td>I guasti possono richiedere interventi o meccanismi aggiuntivi.</td><td>Può adattarsi ai guasti mediante i meccanismi del protocollo.</td></tr>
</tbody></table>
<p>Il routing dinamico non elimina la necessità di configurare correttamente i router. È comunque necessario abilitare e configurare il protocollo e stabilire quali reti ne fanno parte.</p>
</section>
<section id="parte-3">
<h2>3. Come fanno i router a conoscere la rete?</h2>
<p>Immaginiamo di voler scegliere il percorso migliore da R1 a R4.</p>
<p>R1 conosce direttamente R2 e R3.</p>
<p>Ma per scegliere correttamente fra i due percorsi deve avere anche informazioni sui collegamenti successivi.</p>
<p>Per esempio, gli sarebbe utile sapere:</p>
<ul>
<li>Che R2 è collegato a R4.</li>
<li>Che R3 è collegato a R4.</li>
<li>Se questi collegamenti sono funzionanti.</li>
<li>Quale costo è associato a ogni collegamento.</li>
</ul>
<p>Uno dei modi per ottenere queste informazioni è utilizzare un protocollo <strong>Link State</strong>, cioè basato sullo stato dei collegamenti.</p>
<h3>Il funzionamento generale dei protocolli Link State</h3>
<p>Consideriamo i quattro router R1, R2, R3 e R4.</p>
<p>R1 conosce i propri collegamenti verso R2 e R3.</p>
<p>R2 conosce i collegamenti verso R1 e R4.</p>
<p>R3 conosce i collegamenti verso R1 e R4.</p>
<p>R4 conosce i collegamenti verso R2 e R3, oltre alla propria LAN.</p>
<p>Ogni router può comunicare agli altri router interessati informazioni sullo stato dei propri collegamenti.</p>
<p>Queste informazioni vengono diffuse attraverso un meccanismo chiamato <strong>flooding</strong>.</p>
<p>Il flooding, in questo contesto, non significa inviare tutti i normali pacchetti IP su ogni collegamento: serve a diffondere le informazioni del protocollo di routing, evitando che restino conosciute soltanto dai router direttamente vicini.</p>
<p>Quando lo scambio è completato, i router della stessa area Link State possono disporre di una rappresentazione coerente della topologia.</p>
<p>Questa rappresentazione viene memorizzata in una base di dati detta <strong>Link State Database (LSDB)</strong>.</p>
<p>Da queste informazioni ciascun router può calcolare i percorsi verso le destinazioni.</p>
<p>Uno dei protocolli che adotta questo principio è OSPF, che verrà approfondito nella lezione successiva.</p>
<h3>Un punto fondamentale</h3>
<p><strong>I router non hanno bisogno di chiedere a un unico router centrale quale percorso utilizzare.</strong></p>
<p>In un protocollo Link State, ogni router calcola i propri percorsi utilizzando le informazioni di topologia apprese.</p>
<p>Per esempio, R1 calcola i percorsi partendo da R1, mentre R4 effettua un proprio calcolo partendo da R4.</p>
</section>
<section id="parte-4">
<h2>4. Che cosa significa scegliere il percorso migliore?</h2>
<p>Sapere quali strade esistono non basta.</p>
<p>Bisogna stabilire quale conviene utilizzare.</p>
<p>Il percorso con meno router non è necessariamente il migliore.</p>
<p>Per confrontare i percorsi, i protocolli di routing utilizzano una <strong>metrica</strong>, cioè un criterio numerico.</p>
<p>Nel nostro esempio utilizzeremo il <strong>costo</strong> associato a ogni collegamento.</p>
<p>Supponiamo di assegnare questi valori:</p>
<table><thead><tr><th scope="col">Collegamento</th><th scope="col">Costo</th></tr></thead><tbody>
<tr><td>R1–R3</td><td>2</td></tr>
<tr><td>R3–R4</td><td>2</td></tr>
<tr><td>R1–R2</td><td>3</td></tr>
<tr><td>R2–R4</td><td>3</td></tr>
</tbody></table>
<p>Per semplicità supponiamo che il costo sia uguale nelle due direzioni del collegamento.</p>
<p>In un protocollo reale, come OSPF, il costo è associato alle interfacce e può anche differire a seconda della direzione.</p>
<h3>Confrontiamo i due percorsi</h3>
<p><strong>Percorso attraverso R3:</strong></p>
<p>R1 → R3 → R4</p>
<p>Costo totale:</p>
<p><code>2 + 2 = 4</code></p>
<p><strong>Percorso attraverso R2:</strong></p>
<p>R1 → R2 → R4</p>
<p>Costo totale:</p>
<p><code>3 + 3 = 6</code></p>
<p>Fra questi due percorsi, quello attraverso R3 ha il costo minore.</p>
<p>Se il nostro criterio consiste nel minimizzare la somma dei costi, la scelta è R3.</p>
<h3>Che cosa rappresenta realmente il costo?</h3>
<p>Il costo non indica necessariamente la lunghezza fisica del collegamento né il tempo impiegato da un pacchetto.</p>
<p>È un valore utilizzato per confrontare i percorsi.</p>
<p>A seconda del protocollo, il costo può essere configurato dall'amministratore oppure derivare da caratteristiche del collegamento, come la capacità dell'interfaccia.</p>
<p>Per esempio, un collegamento veloce potrebbe avere un costo inferiore a un collegamento più lento, secondo le regole utilizzate dal protocollo.</p>
<p>Nel nostro esercizio i costi sono valori assegnati per semplificare il ragionamento.</p>
<p><strong>Un costo pari a 4 non significa quattro millisecondi o quattro chilometri.</strong></p>
</section>
<section id="parte-5">
<h2>5. Il percorso con meno collegamenti non sempre costa meno</h2>
<div data-routing-diagram="triangle"></div>
<p>Consideriamo una piccola rete composta da tre router.</p>
<p>A è collegato direttamente a C con costo 8.</p>
<p>Esiste anche un percorso alternativo che passa per B:</p>
<ul>
<li>A–B ha costo 2.</li>
<li>B–C ha costo 2.</li>
</ul>
<p>Confrontiamo i due percorsi.</p>
<table><thead><tr><th scope="col">Percorso</th><th scope="col">Numero di collegamenti</th><th scope="col">Costo totale</th></tr></thead><tbody>
<tr><td>A → C</td><td>1</td><td>8</td></tr>
<tr><td>A → B → C</td><td>2</td><td>4</td></tr>
</tbody></table>
<p>La strada diretta attraversa un solo collegamento, ma costa 8.</p>
<p>La strada attraverso B attraversa due collegamenti, ma costa soltanto 4.</p>
<p><strong>Se la metrica è il costo complessivo, il percorso migliore è A → B → C.</strong></p>
<p>Questo esempio mostra perché non basta contare il numero di router attraversati.</p>
<p>Nelle reti grandi, però, possono esistere moltissimi percorsi possibili.</p>
<p>Come si trova quello meno costoso senza provarli tutti manualmente?</p>
</section>
<section id="parte-6">
<h2>6. L'algoritmo di Dijkstra</h2>
<p>L'<strong>algoritmo di Dijkstra</strong> permette di individuare i percorsi a costo minimo da un nodo di partenza verso tutti gli altri nodi raggiungibili di un grafo, quando i pesi dei collegamenti non sono negativi.</p>
<p>Un grafo è una rappresentazione composta da:</p>
<ul>
<li><strong>Nodi:</strong> nella nostra rete rappresentano i router.</li>
<li><strong>Archi:</strong> rappresentano i collegamenti.</li>
<li><strong>Pesi:</strong> rappresentano i costi associati ai collegamenti.</li>
</ul>
<p>Dijkstra non è un protocollo di routing.</p>
<p>È un algoritmo matematico utilizzabile da protocolli come OSPF per calcolare i percorsi a costo minimo.</p>
<p>Il suo principio è semplice: <strong>si parte dal nodo iniziale e si costruiscono progressivamente le distanze minime, scegliendo ogni volta il nodo ancora da elaborare con il costo provvisorio più basso.</strong></p>
</section>
<section id="sezione-19">
<h2>7. Un esempio completo con quattro nodi</h2>
<div data-routing-diagram="dijkstra"></div>
<p>Consideriamo una rete con quattro router: A, B, C e D.</p>
<p>I collegamenti hanno questi costi:</p>
<table><thead><tr><th scope="col">Collegamento</th><th scope="col">Costo</th></tr></thead><tbody>
<tr><td>A–B</td><td>2</td></tr>
<tr><td>A–C</td><td>5</td></tr>
<tr><td>B–C</td><td>1</td></tr>
<tr><td>B–D</td><td>4</td></tr>
<tr><td>C–D</td><td>2</td></tr>
</tbody></table>
<p>Vogliamo trovare il percorso a costo minimo per raggiungere D partendo da A.</p>
<p>Prima di utilizzare Dijkstra possiamo confrontare alcuni percorsi.</p>
<table><thead><tr><th scope="col">Percorso</th><th scope="col">Costo</th></tr></thead><tbody>
<tr><td>A → B → D</td><td>2 + 4 = 6</td></tr>
<tr><td>A → C → D</td><td>5 + 2 = 7</td></tr>
<tr><td>A → B → C → D</td><td>2 + 1 + 2 = 5</td></tr>
</tbody></table>
<p>Il percorso meno costoso tra questi è:</p>
<p><strong>A → B → C → D, costo totale 5</strong></p>
<p>Dijkstra permette di ottenere il risultato senza dover elencare ogni possibile percorso.</p>
<p>Vediamo come.</p>
</section>
<section id="parte-8">
<h2>8. Dijkstra passo per passo</h2>
<p>Durante l'esecuzione dell'algoritmo, per ogni nodo manteniamo due informazioni:</p>
<p><strong>Distanza:</strong> il costo minimo attualmente conosciuto per arrivare al nodo partendo da A.</p>
<p><strong>Precedente:</strong> il nodo attraverso il quale è stato ottenuto quel costo.</p>
<p>Le distanze possono essere:</p>
<ul>
<li><strong>Provvisorie:</strong> possono ancora migliorare.</li>
<li><strong>Definitive:</strong> per le regole dell'algoritmo, non possono più essere migliorate.</li>
</ul>
<p>Il simbolo <code>∞</code> (infinito) indica che non abbiamo ancora trovato un percorso verso quel nodo.</p>
<h3>Passo 1 — Inizializzazione</h3>
<p>Partiamo da A.</p>
<p>Per raggiungere A da A il costo è zero.</p>
<p>Non conosciamo ancora i costi per raggiungere gli altri nodi.</p>
<table><thead><tr><th scope="col">Nodo</th><th scope="col">Distanza</th><th scope="col">Precedente</th><th scope="col">Stato</th></tr></thead><tbody>
<tr><td>A</td><td>0</td><td>—</td><td>Provvisoria</td></tr>
<tr><td>B</td><td>∞</td><td>—</td><td>Provvisoria</td></tr>
<tr><td>C</td><td>∞</td><td>—</td><td>Provvisoria</td></tr>
<tr><td>D</td><td>∞</td><td>—</td><td>Provvisoria</td></tr>
</tbody></table>
<p>Il nodo con distanza provvisoria minore è A, quindi iniziamo da lui.</p>
<h3>Passo 2 — Elaboriamo A</h3>
<p>A ha due collegamenti:</p>
<ul>
<li>A–B, costo 2.</li>
<li>A–C, costo 5.</li>
</ul>
<p>Possiamo quindi raggiungere B con costo 2 e C con costo 5.</p>
<p>Aggiorniamo le distanze.</p>
<table><thead><tr><th scope="col">Nodo</th><th scope="col">Distanza</th><th scope="col">Precedente</th><th scope="col">Stato</th></tr></thead><tbody>
<tr><td>A</td><td>0</td><td>—</td><td>Definitiva</td></tr>
<tr><td>B</td><td>2</td><td>A</td><td>Provvisoria</td></tr>
<tr><td>C</td><td>5</td><td>A</td><td>Provvisoria</td></tr>
<tr><td>D</td><td>∞</td><td>—</td><td>Provvisoria</td></tr>
</tbody></table>
<p>D non è direttamente collegato ad A, quindi rimane a distanza infinita.</p>
<h3>Passo 3 — Scegliamo B</h3>
<p>Fra i nodi ancora da elaborare, B ha la distanza provvisoria minore: 2.</p>
<p>Elaboriamo B.</p>
<p>Da B possiamo raggiungere:</p>
<ul>
<li>C, attraverso un collegamento di costo 1.</li>
<li>D, attraverso un collegamento di costo 4.</li>
</ul>
<p><strong>Raggiungere C passando per B</strong></p>
<p>Il costo complessivo è:</p>
<p><code>2 + 1 = 3</code></p>
<p>Prima conoscevamo un percorso verso C con costo 5.</p>
<p>Il nuovo percorso costa 3, quindi è migliore.</p>
<p>Sostituiamo la distanza di C da 5 a 3 e indichiamo B come precedente.</p>
<p><strong>Raggiungere D passando per B</strong></p>
<p>Il costo complessivo è:</p>
<p><code>2 + 4 = 6</code></p>
<p>Non conoscevamo ancora alcun percorso verso D.</p>
<p>Registriamo quindi distanza 6, con precedente B.</p>
<p>La tabella diventa:</p>
<table><thead><tr><th scope="col">Nodo</th><th scope="col">Distanza</th><th scope="col">Precedente</th><th scope="col">Stato</th></tr></thead><tbody>
<tr><td>A</td><td>0</td><td>—</td><td>Definitiva</td></tr>
<tr><td>B</td><td>2</td><td>A</td><td>Definitiva</td></tr>
<tr><td>C</td><td>3</td><td>B</td><td>Provvisoria</td></tr>
<tr><td>D</td><td>6</td><td>B</td><td>Provvisoria</td></tr>
</tbody></table>
<p>Notiamo che la distanza di C è migliorata da 5 a 3.</p>
<p>Questo aggiornamento è una delle operazioni fondamentali di Dijkstra: quando si trova un percorso meno costoso, si sostituisce il costo provvisorio precedente.</p>
<h3>Passo 4 — Scegliamo C</h3>
<p>Fra i nodi non ancora definitivi:</p>
<ul>
<li>C ha costo 3.</li>
<li>D ha costo 6.</li>
</ul>
<p>Scegliamo C perché ha la distanza provvisoria minore.</p>
<p>Da C possiamo raggiungere D attraverso un collegamento di costo 2.</p>
<p>Il costo totale per arrivare a D passando per C è:</p>
<p><code>3 + 2 = 5</code></p>
<p>Prima avevamo registrato costo 6, passando per B.</p>
<p>Il nuovo percorso è migliore.</p>
<p>Sostituiamo:</p>
<ul>
<li>Distanza di D: da 6 a 5.</li>
<li>Precedente di D: da B a C.</li>
</ul>
<p>La tabella diventa:</p>
<table><thead><tr><th scope="col">Nodo</th><th scope="col">Distanza</th><th scope="col">Precedente</th><th scope="col">Stato</th></tr></thead><tbody>
<tr><td>A</td><td>0</td><td>—</td><td>Definitiva</td></tr>
<tr><td>B</td><td>2</td><td>A</td><td>Definitiva</td></tr>
<tr><td>C</td><td>3</td><td>B</td><td>Definitiva</td></tr>
<tr><td>D</td><td>5</td><td>C</td><td>Provvisoria</td></tr>
</tbody></table>
<h3>Passo 5 — Elaboriamo D</h3>
<p>È rimasto soltanto D.</p>
<p>La sua distanza provvisoria è 5.</p>
<p>Lo scegliamo e la rendiamo definitiva.</p>
<table><thead><tr><th scope="col">Nodo</th><th scope="col">Distanza minima</th><th scope="col">Precedente</th></tr></thead><tbody>
<tr><td>A</td><td>0</td><td>—</td></tr>
<tr><td>B</td><td>2</td><td>A</td></tr>
<tr><td>C</td><td>3</td><td>B</td></tr>
<tr><td>D</td><td>5</td><td>C</td></tr>
</tbody></table>
<p>Ora conosciamo i costi minimi da A verso tutti gli altri nodi.</p>
</section>
<section id="parte-9">
<h2>9. Come si ricostruisce il percorso?</h2>
<p>Abbiamo calcolato che la distanza minima da A a D è 5.</p>
<p>Ma quali nodi dobbiamo attraversare?</p>
<p>Per rispondere utilizziamo la colonna <strong>Precedente</strong>.</p>
<p>Partiamo da D.</p>
<p>Il precedente di D è C.</p>
<p>Il precedente di C è B.</p>
<p>Il precedente di B è A.</p>
<p>Seguendo i precedenti otteniamo:</p>
<p><code>D ← C ← B ← A</code></p>
<p>Leggendo il risultato al contrario troviamo il percorso:</p>
<p><strong>A → B → C → D</strong></p>
<p>Il costo totale è:</p>
<p><code>2 + 1 + 2 = 5</code></p>
<p>Dijkstra non ha trovato soltanto il costo minimo: attraverso le informazioni sui nodi precedenti possiamo anche ricostruire il percorso.</p>
<h3>Riassunto dei passaggi</h3>
<table><thead><tr><th scope="col">Nodo elaborato</th><th scope="col">Costo per B</th><th scope="col">Costo per C</th><th scope="col">Costo per D</th></tr></thead><tbody>
<tr><td>Inizializzazione</td><td>∞</td><td>∞</td><td>∞</td></tr>
<tr><td>A</td><td>2</td><td>5</td><td>∞</td></tr>
<tr><td>B</td><td>2</td><td>3</td><td>6</td></tr>
<tr><td>C</td><td>2</td><td>3</td><td><strong>5</strong></td></tr>
<tr><td>D</td><td>2</td><td>3</td><td><strong>5</strong></td></tr>
</tbody></table>
<p>La distanza di D viene prima scoperta con valore 6 e poi migliorata a 5.</p>
<p>Questa è l'idea fondamentale dell'algoritmo: mantenere e migliorare i costi provvisori fino a individuare quelli minimi.</p>
</section>
${visualPanel('dijkstra-quattro-nodi', 'spf-small', 'Osserva le distanze cambiare',
  'Avanza sul grafo a quattro nodi e confronta le distanze con le tabelle appena lette.')}
<section id="parte-10">
<h2>10. Le regole generali di Dijkstra</h2>
<p>L'algoritmo può essere riassunto in cinque operazioni.</p>
<p><strong>1. Inizializzare le distanze.</strong></p>
<p>Il nodo di partenza ha distanza zero. Tutti gli altri hanno distanza infinita.</p>
<p><strong>2. Scegliere il nodo provvisorio con distanza minore.</strong></p>
<p>Il nodo scelto viene elaborato e la sua distanza diventa definitiva.</p>
<p><strong>3. Esaminare i collegamenti del nodo scelto.</strong></p>
<p>Per ogni vicino non ancora definitivo, si calcola il possibile nuovo costo:</p>
<p><code>Nuovo costo = distanza del nodo corrente + costo del collegamento</code></p>
<p><strong>4. Aggiornare le distanze se il nuovo percorso è migliore.</strong></p>
<p>Se il nuovo costo è inferiore alla distanza registrata, quest'ultima viene sostituita. Si aggiorna anche il nodo precedente.</p>
<p><strong>5. Ripetere.</strong></p>
<p>Si continua finché tutti i nodi raggiungibili sono stati elaborati, oppure finché è stato reso definitivo il nodo di destinazione che interessa.</p>
<p>Il risultato permette di costruire un <strong>albero dei percorsi minimi</strong>, chiamato anche <em>Shortest Path Tree</em>.</p>
<p>Un albero dei percorsi minimi rappresenta, a partire dal nodo scelto come origine, i collegamenti attraverso i quali vengono raggiunti gli altri nodi con il costo minimo.</p>
</section>
<section id="parte-11">
<h2>11. Torniamo ai router R1, R2, R3 e R4</h2>
<div data-routing-diagram="network-costs"></div>
<p>Ora applichiamo quanto imparato alla rete della lezione 06.</p>
<p>Ricordiamo i costi dei collegamenti:</p>
<table><thead><tr><th scope="col">Collegamento</th><th scope="col">Costo</th></tr></thead><tbody>
<tr><td>R1–R3</td><td>2</td></tr>
<tr><td>R3–R4</td><td>2</td></tr>
<tr><td>R1–R2</td><td>3</td></tr>
<tr><td>R2–R4</td><td>3</td></tr>
</tbody></table>
<p>Supponiamo che i router utilizzino un protocollo Link State e abbiano già acquisito le informazioni necessarie sulla topologia.</p>
<p>Per semplicità consideriamo un'unica area di routing.</p>
<h3>R1 calcola il percorso verso R4</h3>
<p>R1 parte da distanza zero.</p>
<p>Inizialmente gli altri router hanno distanza infinita.</p>
<p><strong>Prima elaborazione: R1</strong></p>
<p>R1 conosce due vicini:</p>
<ul>
<li>R3, costo 2.</li>
<li>R2, costo 3.</li>
</ul>
<p>Le distanze diventano:</p>
<table><thead><tr><th scope="col">Router</th><th scope="col">Distanza da R1</th></tr></thead><tbody>
<tr><td>R1</td><td>0</td></tr>
<tr><td>R3</td><td>2</td></tr>
<tr><td>R2</td><td>3</td></tr>
<tr><td>R4</td><td>∞</td></tr>
</tbody></table>
<p><strong>Seconda elaborazione: R3</strong></p>
<p>Il nodo provvisorio meno costoso è R3, con distanza 2.</p>
<p>Da R3 si raggiunge R4 attraverso un collegamento di costo 2.</p>
<p>Il costo per raggiungere R4 diventa:</p>
<p><code>2 + 2 = 4</code></p>
<p><strong>Terza elaborazione: R2</strong></p>
<p>R2 ha distanza 3.</p>
<p>Da R2 si può raggiungere R4 con un collegamento di costo 3.</p>
<p>Il costo complessivo sarebbe:</p>
<p><code>3 + 3 = 6</code></p>
<p>Ma abbiamo già trovato un percorso verso R4 con costo 4.</p>
<p>Non aggiorniamo la distanza.</p>
<p><strong>Risultato:</strong></p>
<table><thead><tr><th scope="col">Router</th><th scope="col">Costo minimo da R1</th><th scope="col">Precedente</th></tr></thead><tbody>
<tr><td>R1</td><td>0</td><td>—</td></tr>
<tr><td>R3</td><td>2</td><td>R1</td></tr>
<tr><td>R2</td><td>3</td><td>R1</td></tr>
<tr><td>R4</td><td>4</td><td>R3</td></tr>
</tbody></table>
<p>Il percorso migliore è:</p>
<p><strong>R1 → R3 → R4</strong></p>
<p>Costo totale: <strong>4</strong></p>
</section>
<section id="parte-12">
<h2>12. Come il risultato diventa una rotta?</h2>
<p>Dijkstra ha stabilito che, per raggiungere R4 da R1, il percorso meno costoso passa attraverso R3.</p>
<p>Ma un router non inoltra i pacchetti consultando ogni volta tutti i collegamenti del grafo.</p>
<p>Il risultato del calcolo viene utilizzato per ricavare le rotte verso le reti raggiungibili.</p>
<p>Sappiamo che R4 è collegato alla rete di PC4:</p>
<p><code>192.168.4.0/24</code></p>
<p>Supponiamo che anche questa rete venga annunciata attraverso il protocollo di routing.</p>
<p>R1 può quindi apprendere una rotta di questo tipo:</p>
<table><thead><tr><th scope="col">Destinazione</th><th scope="col">Next hop</th><th scope="col">Interfaccia</th></tr></thead><tbody>
<tr><td><code>192.168.4.0/24</code></td><td><code>10.0.13.2</code> (R3)</td><td>Verso R3</td></tr>
</tbody></table>
<p>Il costo numerico utilizzato nell'esercizio rappresenta quello dei collegamenti fra router. Eventuali costi aggiuntivi per raggiungere la LAN sono stati omessi per semplicità, perché non modificano il confronto fra i due percorsi.</p>
<p>Quando arriva a R1 un pacchetto destinato a <code>192.168.4.10</code>, R1 consulta la tabella di inoltro e lo invia a R3.</p>
<p>R3, a sua volta, consulta la propria tabella e inoltra il pacchetto a R4.</p>
<p>R4 riconosce la rete di PC4 come direttamente collegata e consegna il pacchetto.</p>
<h3>La differenza tra calcolo e inoltro</h3>
<p>È fondamentale distinguere due operazioni.</p>
<p><strong>Calcolo dei percorsi</strong></p>
<p>Il protocollo di routing utilizza le informazioni sulla rete e gli algoritmi necessari per individuare i percorsi.</p>
<p><strong>Inoltro dei pacchetti (forwarding)</strong></p>
<p>Il router utilizza la tabella di inoltro per scegliere il prossimo salto di ogni pacchetto.</p>
<p>Dijkstra non viene eseguito nuovamente per ogni pacchetto ricevuto.</p>
<p>Il calcolo viene effettuato quando necessario, per esempio dopo determinati cambiamenti delle informazioni sulla topologia.</p>
<p>L'inoltro, invece, avviene continuamente mentre il router riceve pacchetti da trasmettere.</p>
</section>
<section id="parte-13">
<h2>13. Si rompe il collegamento R3–R4</h2>
<p>Consideriamo nuovamente il guasto della lezione precedente.</p>
<p>Il collegamento R3–R4 si interrompe, ma R3 continua a funzionare e rimane collegato a R1.</p>
<div data-routing-diagram="network-failed"></div>
<p>Con il routing statico avevamo visto che R1 poteva continuare a inviare i pacchetti a R3.</p>
<p>Che cosa cambia utilizzando un protocollo Link State?</p>
<h3>Passaggio 1 — I router rilevano il guasto</h3>
<p>R3 e R4 rilevano che il collegamento fra loro non è più disponibile.</p>
<p>Il rilevamento può avvenire attraverso lo stato fisico dell'interfaccia oppure attraverso i meccanismi del protocollo che controllano la presenza dei vicini.</p>
<h3>Passaggio 2 — Le informazioni vengono aggiornate</h3>
<p>I router interessati aggiornano le informazioni sullo stato dei collegamenti.</p>
<p>Queste informazioni vengono diffuse agli altri router dell'area attraverso il protocollo.</p>
<p>R1 apprende così che il collegamento R3–R4 non può più essere utilizzato.</p>
<p>È questo il passaggio che mancava nel nostro esempio con le sole rotte statiche.</p>
<h3>Passaggio 3 — R1 ricalcola i percorsi</h3>
<p>R1 utilizza la rappresentazione aggiornata della rete.</p>
<p>Il collegamento R3–R4 non è più disponibile per il calcolo.</p>
<p>Rimane il percorso:</p>
<p><strong>R1 → R2 → R4</strong></p>
<p>Il costo totale è:</p>
<p><code>3 + 3 = 6</code></p>
<p>Dijkstra individua quindi R2 come nuovo prossimo salto verso la rete di PC4.</p>
<h3>Passaggio 4 — La tabella viene aggiornata</h3>
<p>Prima del guasto R1 utilizzava:</p>
<table><thead><tr><th scope="col">Destinazione</th><th scope="col">Next hop</th></tr></thead><tbody>
<tr><td><code>192.168.4.0/24</code></td><td><code>10.0.13.2</code> (R3)</td></tr>
</tbody></table>
<p>Dopo il ricalcolo e l'aggiornamento della tabella, utilizza:</p>
<table><thead><tr><th scope="col">Destinazione</th><th scope="col">Next hop</th></tr></thead><tbody>
<tr><td><code>192.168.4.0/24</code></td><td><code>10.0.12.2</code> (R2)</td></tr>
</tbody></table>
<p>Ora i pacchetti possono seguire:</p>
<p><strong>PC1 → R1 → R2 → R4 → PC4</strong></p>
<p>Non è stato necessario modificare manualmente la rotta statica di R1: il percorso è stato appreso e aggiornato attraverso il protocollo dinamico.</p>
</section>
<section id="parte-14">
<h2>14. Come cambiano le tabelle di tutti i router?</h2>
<div data-routing-diagram="network-rerouted"></div>
<p>Il guasto non modifica soltanto le decisioni di R1.</p>
<p>Anche gli altri router partecipanti al protocollo aggiornano i propri calcoli.</p>
<p>Supponiamo che la rete sia già stabilizzata dopo il guasto e confrontiamo i prossimi salti per raggiungere le due LAN.</p>
<h3>Prima del guasto</h3>
<table><thead><tr><th scope="col">Router</th><th scope="col">Rete di destinazione</th><th scope="col">Next hop</th></tr></thead><tbody>
<tr><td>R1</td><td><code>192.168.1.0/24</code></td><td>Diretta</td></tr>
<tr><td>R1</td><td><code>192.168.4.0/24</code></td><td>R3</td></tr>
<tr><td>R2</td><td><code>192.168.1.0/24</code></td><td>R1</td></tr>
<tr><td>R2</td><td><code>192.168.4.0/24</code></td><td>R4</td></tr>
<tr><td>R3</td><td><code>192.168.1.0/24</code></td><td>R1</td></tr>
<tr><td>R3</td><td><code>192.168.4.0/24</code></td><td>R4</td></tr>
<tr><td>R4</td><td><code>192.168.1.0/24</code></td><td>R3</td></tr>
<tr><td>R4</td><td><code>192.168.4.0/24</code></td><td>Diretta</td></tr>
</tbody></table>
<p>Il percorso di andata da PC1 a PC4 passa per R3.</p>
<p>Anche il ritorno verso PC1 passa per R3.</p>
<h3>Dopo il guasto R3–R4</h3>
<table><thead><tr><th scope="col">Router</th><th scope="col">Rete di destinazione</th><th scope="col">Next hop</th></tr></thead><tbody>
<tr><td>R1</td><td><code>192.168.1.0/24</code></td><td>Diretta</td></tr>
<tr><td>R1</td><td><code>192.168.4.0/24</code></td><td><strong>R2</strong></td></tr>
<tr><td>R2</td><td><code>192.168.1.0/24</code></td><td>R1</td></tr>
<tr><td>R2</td><td><code>192.168.4.0/24</code></td><td>R4</td></tr>
<tr><td>R3</td><td><code>192.168.1.0/24</code></td><td>R1</td></tr>
<tr><td>R3</td><td><code>192.168.4.0/24</code></td><td><strong>R1</strong></td></tr>
<tr><td>R4</td><td><code>192.168.1.0/24</code></td><td><strong>R2</strong></td></tr>
<tr><td>R4</td><td><code>192.168.4.0/24</code></td><td>Diretta</td></tr>
</tbody></table>
<p>Osserviamo le tre modifiche più importanti.</p>
<p><strong>R1 cambia next hop da R3 a R2.</strong></p>
<p>Per raggiungere PC4 sceglie il percorso inferiore.</p>
<p><strong>R4 cambia next hop da R3 a R2.</strong></p>
<p>Anche la risposta diretta verso PC1 può utilizzare il percorso inferiore.</p>
<p><strong>R3 cambia next hop da R4 a R1 per raggiungere PC4.</strong></p>
<p>Anche se il collegamento diretto con R4 è guasto, R3 non è isolato.</p>
<p>Rimane possibile raggiungere PC4 attraversando:</p>
<p><code>R3 → R1 → R2 → R4</code></p>
<p>Il costo di questo percorso, considerando soltanto i collegamenti fra router, è:</p>
<p><code>2 + 3 + 3 = 8</code></p>
<p>Questo dimostra che il routing dinamico può aggiornare le rotte anche sui router che non si trovano direttamente lungo il nuovo percorso principale.</p>
<p>Le tabelle dei computer PC1 e PC4 non devono cambiare: continuano a utilizzare rispettivamente R1 e R4 come gateway.</p>
</section>
<section id="parte-15">
<h2>15. La convergenza della rete</h2>
<p>Il cambiamento delle rotte non avviene necessariamente nello stesso istante su tutti i router.</p>
<p>Quando il collegamento R3–R4 si interrompe, devono verificarsi diverse operazioni:</p>
<ol>
<li>Il guasto viene rilevato.</li>
<li>Le informazioni aggiornate vengono diffuse.</li>
<li>I router interessati aggiornano la propria rappresentazione della topologia.</li>
<li>Vengono ricalcolati i percorsi necessari.</li>
<li>Le tabelle di routing e di inoltro vengono aggiornate.</li>
</ol>
<p>Durante questo processo, alcuni router potrebbero avere già aggiornato le rotte mentre altri utilizzano ancora informazioni precedenti.</p>
<p>Per un breve periodo alcuni pacchetti potrebbero essere persi o seguire percorsi non più validi.</p>
<p>Quando i router hanno elaborato le informazioni aggiornate e le loro decisioni si sono stabilizzate, la rete ha raggiunto la <strong>convergenza</strong>.</p>
<p>Il <strong>tempo di convergenza</strong> è il tempo necessario al sistema di routing per raggiungere questa condizione dopo un cambiamento.</p>
<p>Un buon protocollo deve adattarsi ai guasti in modo affidabile e cercare di ridurre il tempo durante il quale i percorsi non sono ancora corretti.</p>
<p>Non si deve però confondere il routing dinamico con una garanzia di continuità assoluta: durante il cambiamento possono verificarsi interruzioni temporanee.</p>
</section>
<section id="parte-16">
<h2>16. E se un percorso cambia costo senza interrompersi?</h2>
<p>Un collegamento non deve necessariamente guastarsi perché cambi il percorso migliore.</p>
<p>Supponiamo che i costi iniziali siano:</p>
<table><thead><tr><th scope="col">Collegamento</th><th scope="col">Costo</th></tr></thead><tbody>
<tr><td>R1–R3</td><td>2</td></tr>
<tr><td>R3–R4</td><td>2</td></tr>
<tr><td>R1–R2</td><td>3</td></tr>
<tr><td>R2–R4</td><td>3</td></tr>
</tbody></table>
<p>La strada via R3 costa 4.</p>
<p>Quella via R2 costa 6.</p>
<p>Inizialmente viene scelta R3.</p>
<p>Ora immaginiamo che il costo del collegamento R3–R4 venga modificato da 2 a 8 e che la modifica venga comunicata e acquisita dai router.</p>
<p>I nuovi costi saranno:</p>
<p><strong>Via R3:</strong></p>
<p><code>2 + 8 = 10</code></p>
<p><strong>Via R2:</strong></p>
<p><code>3 + 3 = 6</code></p>
<p>Adesso il percorso attraverso R2 è meno costoso.</p>
<p>Il protocollo può quindi aggiornare la rotta verso la rete di PC4, scegliendo R2 anche se tutti i collegamenti sono ancora funzionanti.</p>
<p>Questo esempio mostra che il routing dinamico può reagire sia a cambiamenti della topologia sia a cambiamenti delle metriche utilizzate per calcolare i percorsi.</p>
<h3>E se due percorsi hanno lo stesso costo?</h3>
<p>Supponiamo che entrambi i percorsi costino 6.</p>
<p>Dijkstra può individuare più percorsi ugualmente minimi.</p>
<p>Alcuni protocolli e dispositivi permettono di utilizzare più prossimi salti di pari costo, attraverso una tecnica chiamata <strong>ECMP (Equal-Cost Multi-Path)</strong>.</p>
<p>In questo caso il traffico può essere distribuito fra percorsi equivalenti secondo le regole di inoltro del dispositivo.</p>
<p>Quindi due rotte con lo stesso costo non significano necessariamente che una sia principale e l'altra di riserva.</p>
</section>
<section id="parte-17">
<h2>17. Qual è la differenza fra costo e distanza amministrativa?</h2>
<p>Nella lezione 06 abbiamo utilizzato la distanza amministrativa per assegnare una preferenza a due rotte statiche verso la stessa rete.</p>
<p>Ora abbiamo introdotto il costo dei percorsi.</p>
<p>Sono due concetti diversi.</p>
<table><thead><tr><th scope="col">Distanza amministrativa</th><th scope="col">Costo del percorso</th></tr></thead><tbody>
<tr><td>Esprime la preferenza fra rotte candidate secondo le regole del router.</td><td>Esprime quanto costa raggiungere una destinazione secondo la metrica del protocollo.</td></tr>
<tr><td>Può essere utilizzata per creare una rotta statica di riserva.</td><td>È utilizzato per confrontare percorsi all'interno di un protocollo come OSPF.</td></tr>
<tr><td>Non rappresenta la somma dei collegamenti.</td><td>Nel nostro esempio è la somma dei costi dei collegamenti attraversati.</td></tr>
</tbody></table>
<p>Il valore della distanza amministrativa non deve quindi essere confuso con il costo calcolato da Dijkstra.</p>
<p>Il Longest Prefix Match rimane inoltre la regola con cui vengono preferiti i prefissi di destinazione più specifici durante l'inoltro.</p>
<p>Non si sceglie un prefisso <code>/16</code> al posto di un <code>/24</code> soltanto perché la sua metrica è più bassa: se entrambi corrispondono alla destinazione, il <code>/24</code> è più specifico.</p>
</section>
<section id="parte-18">
<h2>18. Esempio di una rete più grande</h2>
<p>Consideriamo ora una rete con dodici router, identificati dalle lettere da A a L.</p>
<p>Supponiamo di voler raggiungere L partendo da A.</p>
<p>Fra i possibili percorsi troviamo:</p>
<table><thead><tr><th scope="col">Percorso</th><th scope="col">Salti</th><th scope="col">Costo</th></tr></thead><tbody>
<tr><td>A → C → L</td><td>2</td><td>8 + 20 = 28</td></tr>
<tr><td>A → B → E → H → K → L</td><td>5</td><td>2 + 2 + 2 + 2 + 2 = 10</td></tr>
</tbody></table>
<p>Il primo percorso attraversa soltanto due collegamenti, ma costa 28.</p>
<p>Il secondo attraversa cinque collegamenti, ma costa 10.</p>
<p>Fra queste due possibilità è preferibile il secondo percorso.</p>
<p>In una rete reale potrebbero però esistere altre strade, con costi ancora differenti.</p>
<p>Dijkstra permette di confrontare sistematicamente le alternative rappresentate nel grafo e individuare i percorsi a costo minimo.</p>
<h3>Che cosa succede se E–H si interrompe?</h3>
<p>Il percorso A → B → E → H → K → L non può più essere utilizzato così com'è.</p>
<p>I router che rilevano il guasto aggiornano le informazioni sui collegamenti e il cambiamento può essere diffuso agli altri router.</p>
<p>Quando il protocollo dispone della nuova topologia, i percorsi interessati possono essere ricalcolati.</p>
<p>Il percorso risultante dipende dai collegamenti rimasti disponibili e dai loro costi.</p>
<p>La presenza di più percorsi rende la rete potenzialmente più resistente ai guasti, ma soltanto se esistono rotte alternative utilizzabili e i router riescono ad aggiornare correttamente le proprie decisioni.</p>
</section>
<section id="parte-19">
<h2>19. Riepilogo: dalla topologia alla tabella di routing</h2>
<p>Abbiamo visto che il routing dinamico permette ai router di aggiornare le proprie rotte utilizzando informazioni scambiate attraverso un protocollo.</p>
<p>Nel caso dei protocolli Link State, possiamo rappresentare il funzionamento attraverso questa sequenza:</p>
<p><strong>1. Scoperta dei collegamenti</strong></p>
<p>Ogni router identifica i vicini e le informazioni relative ai collegamenti secondo le regole del protocollo.</p>
<p><strong>2. Scambio delle informazioni</strong></p>
<p>I router diffondono le informazioni necessarie affinché venga costruita una rappresentazione della topologia.</p>
<p><strong>3. Calcolo dei percorsi</strong></p>
<p>L'algoritmo di Dijkstra utilizza i costi per trovare i percorsi minimi da ciascun router verso i nodi raggiungibili.</p>
<p><strong>4. Costruzione delle rotte</strong></p>
<p>Il protocollo ricava dai risultati del calcolo le rotte verso le reti di destinazione.</p>
<p><strong>5. Inoltro dei pacchetti</strong></p>
<p>Ogni router utilizza la propria tabella di inoltro per decidere il prossimo salto dei pacchetti ricevuti.</p>
<p><strong>6. Aggiornamento dopo un cambiamento</strong></p>
<p>Quando cambiano i collegamenti o i loro costi, vengono diffuse nuove informazioni e possono essere ricalcolate le rotte.</p>
<p>La distinzione più importante è questa:</p>
<p><strong>Il protocollo di routing costruisce e aggiorna le informazioni sui percorsi. Il forwarding utilizza quelle informazioni per inoltrare i singoli pacchetti.</strong></p>
</section>
<section id="verifica">
<h2>20. Esercizi di verifica</h2>
<h3>Esercizio 1 — Percorsi a costo diverso</h3>
<p>Una rete possiede questi collegamenti:</p>
<table><thead><tr><th scope="col">Collegamento</th><th scope="col">Costo</th></tr></thead><tbody>
<tr><td>A–B</td><td>3</td></tr>
<tr><td>B–D</td><td>4</td></tr>
<tr><td>A–C</td><td>2</td></tr>
<tr><td>C–D</td><td>3</td></tr>
<tr><td>B–C</td><td>1</td></tr>
</tbody></table>
<ol>
<li>Quanto costa il percorso A → B → D?</li>
<li>Quanto costa il percorso A → C → D?</li>
<li>Quanto costa il percorso A → B → C → D?</li>
<li>Qual è il percorso con costo minore fra questi tre?</li>
<li>Il percorso con meno collegamenti è necessariamente quello meno costoso?</li>
</ol>
<h3>Esercizio 2 — Aggiornamento delle distanze</h3>
<p>Utilizziamo il grafo a quattro nodi studiato nella lezione:</p>
<ul>
<li>A–B = 2</li>
<li>A–C = 5</li>
<li>B–C = 1</li>
<li>B–D = 4</li>
<li>C–D = 2</li>
</ul>
<ol>
<li>Quali distanze conosciamo dopo aver elaborato A?</li>
<li>Perché viene elaborato B prima di C?</li>
<li>Perché la distanza di C passa da 5 a 3?</li>
<li>Perché quella di D passa da 6 a 5?</li>
<li>Qual è il percorso minimo da A a D?</li>
</ol>
<h3>Esercizio 3 — Dijkstra e tabelle di routing</h3>
<p>R1 calcola che il percorso a costo minimo verso R4 è:</p>
<p><code>R1 → R3 → R4</code></p>
<p>La rete di PC4 è <code>192.168.4.0/24</code>.</p>
<ol>
<li>Quale rete di destinazione deve comparire nella rotta di R1?</li>
<li>Quale router deve essere indicato come prossimo salto?</li>
<li>R1 esegue Dijkstra per ogni pacchetto inviato da PC1?</li>
<li>Quale tabella viene utilizzata per l'inoltro dei pacchetti?</li>
</ol>
<h3>Esercizio 4 — Guasto e convergenza</h3>
<p>Si interrompe il collegamento R3–R4, ma R1–R3 continua a funzionare.</p>
<ol>
<li>Perché, con le sole rotte statiche, R1 potrebbe continuare a inoltrare verso R3?</li>
<li>Quali router rilevano direttamente il guasto?</li>
<li>Come può R1 venire informato del cambiamento attraverso un protocollo Link State?</li>
<li>Qual è il nuovo percorso a costo minimo da R1 a R4?</li>
<li>Che cosa si intende per convergenza?</li>
</ol>
<h3>Esercizio 5 — Modifica dei costi</h3>
<p>Consideriamo:</p>
<ul>
<li>R1–R3 = 2</li>
<li>R3–R4 = 2</li>
<li>R1–R2 = 3</li>
<li>R2–R4 = 3</li>
</ul>
<ol>
<li>Qual è il costo iniziale dei due percorsi da R1 a R4?</li>
<li>Se il costo R3–R4 aumenta a 5, quale percorso è preferibile?</li>
<li>Se il costo R3–R4 aumenta a 8, quale percorso è preferibile?</li>
<li>Se i due percorsi hanno costo uguale, è obbligatorio utilizzare soltanto uno dei due?</li>
</ol>
<details><summary>Soluzioni degli esercizi</summary>
<p><strong>Esercizio 1.</strong> A → B → D costa 7; A → C → D costa 5; A → B → C → D costa 7. Il secondo è il meno costoso fra i tre. Il numero di collegamenti, da solo, non determina il costo.</p>
<p><strong>Esercizio 2.</strong> Dopo A, B ha distanza 2, C distanza 5 e D distanza infinita. B viene scelto perché ha il costo minore. Passando per B, C costa 2 + 1 = 3. Passando successivamente per C, D costa 3 + 2 = 5. Il percorso minimo è A → B → C → D.</p>
<p><strong>Esercizio 3.</strong> La destinazione è <code>192.168.4.0/24</code>, il next hop è R3 (<code>10.0.13.2</code>). Dijkstra non viene eseguito per ogni pacchetto: il forwarding utilizza la tabella di inoltro.</p>
<p><strong>Esercizio 4.</strong> R1 continua a raggiungere R3, quindi una rotta statica potrebbe rimanere utilizzabile dal suo punto di vista. R3 e R4 rilevano il guasto del proprio collegamento. Le informazioni vengono aggiornate e diffuse ai router interessati. Il nuovo percorso è R1 → R2 → R4, con costo 6. La convergenza è la stabilizzazione delle decisioni di routing dopo il cambiamento.</p>
<p><strong>Esercizio 5.</strong> Inizialmente il percorso via R3 costa 4 e quello via R2 costa 6. Con R3–R4 a costo 5, il percorso via R3 costa 7 e viene preferito R2, che costa 6. Con R3–R4 a costo 8, il percorso via R3 costa 10 e rimane preferibile R2. In caso di parità, alcuni dispositivi possono utilizzare entrambi i percorsi con ECMP.</p>
</details>
</section>
<section id="parte-21">
<h2>21. Verso OSPF</h2>
<p>In questa lezione abbiamo imparato tre concetti fondamentali.</p>
<p>Il primo è che i router possono scambiarsi informazioni sulla rete attraverso protocolli di routing dinamico.</p>
<p>Il secondo è che il costo permette di confrontare i percorsi e che l'algoritmo di Dijkstra individua quelli a costo minimo.</p>
<p>Il terzo è che, quando la topologia cambia, i router possono aggiornare le informazioni, ricalcolare i percorsi e modificare le rotte.</p>
<p>Ma rimangono alcune domande.</p>
<p>Come scopre un router quali altri router utilizzano lo stesso protocollo?</p>
<p>Quali messaggi vengono scambiati per descrivere i collegamenti?</p>
<p>Come vengono diffuse e mantenute aggiornate le informazioni sulla topologia?</p>
<p>Come viene rilevato un router vicino che non risponde più?</p>
<p>Nella <a href="08-ospf.html">prossima lezione</a> vedremo come il protocollo <strong>OSPF (Open Shortest Path First)</strong> realizza concretamente questi meccanismi e utilizza Dijkstra per costruire le proprie rotte.</p>
<p><strong>Dijkstra calcola i percorsi. OSPF organizza lo scambio delle informazioni necessarie per poterli calcolare e aggiornare.</strong></p>
</section>`
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

