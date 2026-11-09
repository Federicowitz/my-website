const { visualPanel } = require('./routing-visual-content.cjs');

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
    lead: 'Parti dall’indirizzo di destinazione e individua l’uscita giusta.',
    body: `
<section id="sezione-12"><h2>Una tabella indica dove mandare il pacchetto</h2>
<table><thead><tr><th scope="col">Destinazione</th><th scope="col">Azione del router</th></tr></thead><tbody>
<tr><td>192.168.1.0/24</td><td>Consegna direttamente sulla rete collegata</td></tr>
<tr><td>192.168.4.0/24</td><td>Passa il pacchetto a R3</td></tr>
<tr><td>0.0.0.0/0</td><td>Usa il router verso Internet</td></tr></tbody></table>
<p>192.168.1.25 appartiene alla prima rete, mentre 192.168.4.25 appartiene alla seconda. Se la destinazione è proprio un indirizzo del router, per esempio 192.168.1.1, il router riceve il pacchetto localmente.</p>
<h3>Come entrano le rotte nella tabella?</h3>
<ul><li><strong>Rete direttamente collegata.</strong> Se R1 ha un’interfaccia attiva con indirizzo 192.168.1.1/24, conosce la rete 192.168.1.0/24 e può consegnare direttamente ai dispositivi che vi appartengono.</li>
<li><strong>Rotta inserita a mano.</strong> Un amministratore può indicare a R1 che per 192.168.4.0/24 deve inviare a R3. Vedrai come nella lezione 06.</li>
<li><strong>Rotta appresa.</strong> Un protocollo dinamico permette ai router di scambiarsi informazioni e ricavare rotte. Partiremo dal problema che risolve nella lezione 07.</li></ul>
<p>La tabella raccoglie le destinazioni che il router conosce in questi modi. Può anche contenere una rotta predefinita, inserita a mano o appresa, che copre le destinazioni prive di una corrispondenza più specifica.</p></section>
<section id="sezione-13"><h2>Quando due righe corrispondono</h2>
<p>Considera 10.1.2.35. Appartiene sia a 10.1.0.0/16 sia a 10.1.2.0/24. La seconda rete è più specifica perché richiede 24 bit in comune invece di 16. Fra le rotte compatibili, il router sceglie il prefisso più lungo. Questa regola si chiama <strong>Longest Prefix Match</strong>.</p>
<p>Immagina una tabella con 192.168.1.0/24, 10.1.0.0/16 e 10.1.2.0/24. Prova a elencare le corrispondenze prima di scegliere.</p>
<details><summary>192.168.1.25 · Una sola corrispondenza</summary><p>Corrisponde soltanto a 192.168.1.0/24. R1 usa la rete direttamente collegata.</p></details>
<details><summary>10.1.2.35 · Due prefissi compatibili</summary><p>Corrispondono 10.1.0.0/16 e 10.1.2.0/24. Vince la /24.</p></details>
<details><summary>8.8.8.8 · Nessuna rete specifica</summary><p>Nessuna riga corrisponde. Se aggiungi 0.0.0.0/0, sarà l’unica corrispondenza.</p></details></section>
<section id="sezione-14"><h2>La tabella decide la prossima tappa</h2><p>Se la riga scelta indica R4, il router passa il pacchetto a R4. Da quel punto la decisione spetta a R4 e alla sua tabella.</p></section>
<section id="sezione-15"><h2>Se nessuna rete specifica corrisponde</h2>
<p>A R1 arriva un pacchetto per 8.8.8.8. Supponi che la tabella contenga solo le due reti 192.168.1.0/24 e 192.168.4.0/24. Nessuna corrisponde, quindi R1 scarta il pacchetto. Inviarlo a tutti i vicini non è una regola di inoltro.</p>
<p>Con una <strong>rotta predefinita</strong> (default) verso R2, R1 ha invece un’uscita. Il prefisso 0.0.0.0/0 richiede zero bit in comune, quindi corrisponde a qualunque destinazione IPv4. È il prefisso più corto. Se aggiungi 8.8.8.0/24 verso R3, per 8.8.8.8 vince quella riga e l’uscita cambia.</p>
<details><summary>Verifica · Quale riga vince per 10.1.2.35?</summary><p>Fra /16, /24 e /0 compatibili vince la /24. Una rotta /32 per 10.1.2.34 riguarda un altro indirizzo e quindi non entra nel confronto.</p></details></section>
${visualPanel('rotta-predefinita', 'default', 'Un pacchetto per 8.8.8.8 arriva a R1',
  'Cambia le rotte disponibili. Premi Avanti per vedere prima le corrispondenze, poi la decisione di R1.')}
<section><h2>Gateway del computer e rotta predefinita del router</h2>
<p>PC1 usa R1 come <strong>gateway predefinito</strong>. Quando la destinazione è fuori dalla rete locale, PC1 consegna il primo frame a R1. R1 fa una nuova ricerca nella propria tabella. Se nessuna rotta più specifica corrisponde, può usare la sua <strong>rotta predefinita</strong> e consegnare il pacchetto a R2.</p>
<p>R2 deve ancora decidere come proseguire. Se si ferma per una rotta mancante o un guasto, la scelta di R1 è avvenuta correttamente ma il pacchetto non arriva. Per uno scambio completo serve anche una strada di ritorno.</p></section>`
  },
  {
    file: '06-statico.html', title: '06 · Routing statico e strada di ritorno',
    lead: 'Costruisci un percorso a mano, poi osserva come reagisce a un guasto.',
    body: `
<section id="sezione-16"><h2>Che cosa manca a R1?</h2>
<p>R1 conosce la rete di PC1 perché è collegata direttamente. Per raggiungere la rete di PC4 possiamo inserire una <strong>rotta statica</strong>, cioè una rotta impostata dall’amministratore. Ogni router intermedio ha bisogno della propria indicazione.</p>
<h3>Le tre informazioni di una rotta statica</h3>
<ol><li><strong>Destinazione.</strong> La rete a cui è diretto il pacchetto, qui 192.168.4.0/24.</li>
<li><strong>Prossimo router.</strong> Il vicino al quale passarlo, qui R3 per R1.</li>
<li><strong>Interfaccia d’uscita.</strong> Il punto da cui parte il frame successivo. R1 può ricavarla dal collegamento attraverso cui raggiunge R3.</li></ol>
<table><thead><tr><th scope="col">Router</th><th scope="col">Destinazione</th><th scope="col">Prossimo passo</th></tr></thead><tbody>
<tr><td>R1</td><td>192.168.4.0/24</td><td>R3, sul collegamento R1–R3</td></tr>
<tr><td>R3</td><td>192.168.4.0/24</td><td>R4, sul collegamento R3–R4</td></tr>
<tr><td>R4</td><td>192.168.4.0/24</td><td>Rete direttamente collegata. Consegna a PC4.</td></tr></tbody></table>
<p>R1 configura solo la propria decisione. Se R3 non ha una rotta per quella rete, il pacchetto si ferma lì anche se R1 ha scelto correttamente.</p>
<h3>Andata e ritorno sono due ricerche</h3>
<table><thead><tr><th scope="col">Verso</th><th scope="col">Decisioni sul percorso via R3</th></tr></thead><tbody>
<tr><td>Andata verso 192.168.4.0/24</td><td>R1 invia a R3, R3 invia a R4, R4 consegna a PC4.</td></tr>
<tr><td>Ritorno verso 192.168.1.0/24</td><td>R4 invia a R3, R3 invia a R1, R1 consegna a PC1.</td></tr></tbody></table>
<p>Quando PC4 risponde, il pacchetto è diretto alla rete di PC1. R4 cerca quindi una destinazione diversa nella propria tabella. Se manca quella rotta, scarta la risposta. Aggiungendo la riga per 192.168.1.0/24 via R3 e mantenendo il resto del percorso funzionante, la risposta può tornare.</p>
<p>Per passare da R2, cambia il prossimo router su R1 e R4 e assicurati che R2 conosca entrambe le reti.</p>
<details><summary>Verifica · Il server riceve la richiesta, ma PC1 non riceve nulla. Da dove parti?</summary><p>Controlla la rotta di R4 verso la rete di PC1, poi verifica il ritorno un router alla volta. L’arrivo della richiesta dimostra soltanto che l’andata ha funzionato.</p></details></section>
<section id="sezione-17"><h2>Il percorso può rompersi più avanti</h2><p>Se a R1 manca la rotta, R1 scarta subito. Se invece cade il collegamento R3–R4, R1 può ancora raggiungere R3 e continuare a inviare lì i pacchetti. Il problema si manifesta più avanti, quando R3 non riesce a passare il pacchetto a R4.</p>
<p>La presenza fisica della via per R2 non modifica la rotta configurata. Per usarla servono decisioni coerenti sui router coinvolti. Nel simulatore grande vedrai lo stesso problema sul collegamento E–H. La prossima lezione spiega come i router possono aggiornare le rotte in risposta al guasto.</p></section>`
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

