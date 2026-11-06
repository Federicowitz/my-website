# Dalle reti alle applicazioni distribuite

**Informatica · Classe quinta · Liceo Scientifico, opzione Scienze Applicate · Novembre 2026**

## Il percorso: dalle reti già studiate ai servizi e alla protezione dei dati

I livelli ISO/OSI e TCP/IP spiegano **come** un messaggio viene trasferito tra dispositivi. Resta da comprendere **quali comunicazioni autorizzare**, **come i programmi scambiano e interpretano dati**, **come funzionano le applicazioni Web**, **dove si esegue il software** e **come vengono conservate e protette le informazioni**.

Il percorso segue il filo dei problemi tecnici, non l'ordine cronologico con cui le tecnologie sono nate.

| Lezione | Argomento e problema principale |
| --- | --- |
| 1 | Sicurezza delle reti: comunicare non significa comunicare in sicurezza |
| 2 | IPv4: perché gli indirizzi pubblici sono una risorsa scarsa |
| 3 | Gateway, NAT, PAT e CGNAT: condividere un indirizzo pubblico |
| 4 | VLAN, subnet, firewall e ACL: separare e controllare le comunicazioni |
| 5 | Proxy e DMZ: rendere pubblici alcuni servizi, non tutta la rete |
| 6 | Internet senza Web: reti, IP, TCP, UDP, porte e DNS |
| 7 | Socket TCP: due programmi scambiano un flusso di byte |
| 8 | HTTP: dare una struttura condivisa alle richieste e alle risposte |
| 9 | Browser: HTML, CSS, rendering, JavaScript, interpretazione e compilazione |
| 10 | Web API: scambio di dati tra componenti applicativi |
| 11 | Server Web e applicativi: tecnologie diverse, stesso ruolo |
| 12 | Architetture distribuite: client-server, livelli logici e tier |
| 13 | Persistenza: file, database e DBMS |
| 14 | Processi, container, host fisici e cloud: dove gira il software |
| 15 | Intranet, extranet, Web partecipativo e servizi cloud |
| 16 | Crittografia, hash, TLS, certificati e HTTPS |
| 17 | Firma digitale e Posta Elettronica Certificata (PEC) |
| 18 | Analisi integrata di una piattaforma e domande di verifica |

## Conoscenze iniziali

Classificazione e topologie delle reti; dispositivi e mezzi trasmissivi; modello ISO/OSI; famiglia TCP/IP; incapsulamento; indirizzi MAC e IP; trasferimento dei pacchetti.

## Competenze da sviluppare

Al termine del percorso diventano possibili spiegazioni fondate su causa ed effetto: perché un determinato traffico va filtrato; perché più dispositivi condividono un IPv4 pubblico; perché TCP non definisce il significato dei byte; perché il browser genera richieste ed esegue codice JavaScript; perché le API non dipendono dal linguaggio; perché un DBMS gestisce problemi che un file isolato non risolve automaticamente; perché tre container non significano tre computer fisici; come crittografia e firme affrontano esigenze diverse.

## Lettura degli esempi

Gli esempi rappresentano situazioni tecniche semplificate, non configurazioni utilizzabili direttamente in produzione. I brevi frammenti di codice servono a **osservare concetti**, non a studiare un framework specifico. Le sezioni **Analisi di un caso** e **Verifica** contengono problemi applicativi e domande di ragionamento.

`127.0.0.1` indica l'host locale. Gli indirizzi `192.0.2.0/24`, `198.51.100.0/24` e `203.0.113.0/24` appartengono a intervalli riservati alla documentazione e non identificano server reali degli esempi. Il glossario conclusivo riassume gli acronimi.

---

# Lezione 1 — Dalla comunicazione alla sicurezza delle reti

**Domanda iniziale:** *«Abbiamo visto come un messaggio arriva a destinazione. È sufficiente sapere che arriva?»*

## 1. Il problema prima della soluzione

Immaginiamo una scuola. In una stessa infrastruttura circolano pagine Web, registri elettronici, file didattici, dati amministrativi, messaggi personali. La rete ha assolto correttamente il suo compito tecnico se ha trasferito i dati. Ma questa osservazione non dice **chi** ha potuto accedervi, **se** sono stati alterati, né **se** il servizio era accessibile a chi ne aveva bisogno.

La sicurezza delle reti nasce da questa separazione: **comunicare** e **comunicare in modo controllato** sono due problemi distinti. Ogni dispositivo collegato offre possibilità di comunicazione; alcune sono desiderate, altre non autorizzate. Un server pubblicamente raggiungibile è utile, ma la sua esposizione non dovrebbe rendere raggiungibili anche i computer della segreteria.

**Caso concreto.** Un dispositivo connesso al Wi-Fi ospiti può consultare il sito pubblico della scuola, ma non dovrebbe poter raggiungere una cartella riservata della contabilità. Non basta dichiarare «accesso vietato»: occorre definire *quale dispositivo può comunicare con quale servizio*, individuare il punto in cui controllare il traffico e applicare effettivamente la regola.

## 2. Che cosa vogliamo proteggere?

Tre obiettivi fondamentali formano la triade **CIA**, dalle parole inglesi *Confidentiality, Integrity, Availability*:

| Obiettivo | Significato | Esempio scolastico |
| --- | --- | --- |
| **Riservatezza** (*confidentiality*) | Solo soggetti autorizzati leggono il contenuto | I voti non sono visibili a studenti estranei |
| **Integrità** (*integrity*) | I dati non vengono modificati senza autorizzazione | Un voto registrato non viene alterato da terzi |
| **Disponibilità** (*availability*) | Sistemi e dati sono fruibili quando servono | Il registro resta utilizzabile durante le lezioni |

Aggiungiamo poi **autenticazione** (accertare chi si presenta), **autorizzazione** (stabilire che cosa può fare), **tracciabilità** (registrare eventi significativi) e **responsabilità**. Sono termini differenti: conoscere una password può autenticare una persona, ma non significa autorizzarla a leggere tutti i dati.

Un sistema può essere cifrato e tuttavia non essere disponibile; può essere disponibile e tuttavia mostrare informazioni a persone sbagliate. Non esiste un singolo prodotto capace di garantire tutte le proprietà.

## 3. Come descrivere un rischio senza parlare subito di «hacker»

Chiamiamo **risorsa** (*asset*) ciò che ha valore: dati, server, credenziali, servizi. Una **vulnerabilità** è una debolezza sfruttabile, una **minaccia** è una possibile causa di danno, un **rischio** dipende dalla probabilità e dall'impatto del danno.

Esempio guidato:

- Risorsa: banca dati della segreteria.
- Vulnerabilità: servizio amministrativo accessibile a chiunque dalla rete ospiti.
- Minaccia: tentativi di accesso non autorizzato.
- Conseguenza possibile: divulgazione o alterazione dei dati.
- Contromisure: separazione delle reti, regole di accesso, autenticazione, aggiornamenti, copie di sicurezza.

Un altro caso è l'attacco **DoS** (*Denial of Service*, negazione del servizio): il bersaglio diventa indisponibile. Se il traffico proviene da molte sorgenti coordinate si parla di **DDoS**, *Distributed Denial of Service*. L'obiettivo colpito è soprattutto la disponibilità, non necessariamente la riservatezza.

La **difesa in profondità** usa più misure: segmentazione, regole di rete, aggiornamenti, identità, cifratura e backup. Il motivo è semplice: se una barriera fallisce, un'altra può ancora limitare il danno.

## 4. Le prime tre domande di sicurezza

Ogni comunicazione può essere analizzata chiedendo:

1. **Chi** desidera comunicare? Esempio: un computer degli ospiti.
2. **Con chi e per quale servizio?** Esempio: un server Web sulla porta TCP 443.
3. **È permesso?** Esempio: navigazione Web sì, accesso al database interno no.

Questa logica prepara i temi successivi: indirizzi IP e porte identificano gli interlocutori e i servizi; firewall e liste di controllo degli accessi applicano delle regole; le VLAN separano porzioni della rete; la crittografia protegge il *contenuto* del messaggio. Le tecnologie svolgono compiti complementari, non intercambiabili.

### Un esempio a livello intuitivo

```text
Internet  ---->  sito pubblico della scuola          CONSENTITO
Internet  ---->  computer amministrativo interno    BLOCCATO
Ospiti    ---->  Internet                          CONSENTITO
Ospiti    ---->  archivio riservato                 BLOCCATO
Segreteria ----> archivio riservato                 CONSENTITO, con login
```

Queste frasi descrivono una **politica di accesso**, non ancora una configurazione tecnica. Per tradurle in regole servono indirizzi IP, porte e la distinzione fra reti private e pubbliche.

## 5. Distinguere la sicurezza della rete da quella del software

Un firewall può impedire connessioni indesiderate verso un servizio. Non garantisce però che il codice di un'applicazione esposta sia corretto: un sito accessibile legittimamente può contenere una vulnerabilità; un utente autenticato può avere permessi configurati male. La sicurezza riguarda quindi **rete, sistemi, applicazioni, dati e persone**.

**Attenzione:** «internet è pericoloso, perciò metto un firewall» è una spiegazione incompleta. La domanda giusta è «quale traffico voglio permettere e con quale scopo?».

## 6. Analisi di un caso: quattro richieste, quattro rischi diversi

Una scuola dispone di un sito pubblico, di un gestionale amministrativo accessibile solo al personale, di stampanti interne e di computer di laboratorio. Si considerino quattro richieste:

| Richiesta | Decisione motivata | Controllo necessario |
| --- | --- | --- |
| Un visitatore esterno consulta gli orari pubblici | Consentire l'accesso al sito pubblico | Esporre soltanto il servizio Web necessario; non la rete interna |
| Un addetto della segreteria lavora da casa sulle fatture | Consentire **solo dopo** verifica di identità e autorizzazione | Accesso remoto protetto e permessi limitati alle funzioni richieste |
| Un ospite vuole stampare sulla stampante riservata | Negare: il dispositivo non appartiene all'area autorizzata | Separazione della rete ospiti e filtro verso la rete amministrativa |
| Un PC del laboratorio scarica aggiornamenti attendibili | Consentire secondo la politica della rete | Uscita verso i servizi necessari, controllo degli aggiornamenti e monitoraggio |

**Perché non basta conoscere l'indirizzo IP?** L'indirizzo può distinguere il percorso di rete, ma non sempre prova l'identità della persona. Inoltre la stessa macchina può ospitare servizi differenti. Si devono quindi distinguere **controllo della rete**, **autenticazione dell'utente** e **autorizzazione del servizio**.

### Verifica ragionata

1. Un portale sempre disponibile, ma consultabile da chiunque, soddisfa quale obiettivo della sicurezza e ne viola potenzialmente quale? *Disponibilità sì; riservatezza potenzialmente no.*
2. Un account riconosciuto dal sistema può leggere automaticamente tutti i documenti? *No: autenticazione e autorizzazione sono passaggi distinti.*
3. Perché il firewall non sostituisce la cifratura? *Il filtraggio dei flussi non rende automaticamente il contenuto illeggibile a chi lo intercetta.*
4. Se il sito pubblico è compromesso, quale altro controllo potrebbe ridurre il danno? *Segmentare la rete, limitare i permessi del server e impedire accessi non necessari ai servizi interni.*

**Collegamento alla lezione 2:** per descrivere le regole di comunicazione serve individuare i dispositivi: ecco perché dobbiamo capire meglio gli indirizzi IPv4.

---

# Lezione 2 — IPv4: indirizzi pubblici, privati ed esaurimento

**Domanda iniziale:** *«Se il mio telefono, il portatile e la console sono collegati a Internet, perché il router di casa spesso usa un solo indirizzo IPv4 pubblico?»*

## 1. Un indirizzo per comunicare in rete

**IP** significa *Internet Protocol*, protocollo Internet. Un indirizzo IP serve a identificare un'interfaccia di rete nel contesto dell'instradamento dei pacchetti. In **IPv4** (*Internet Protocol version 4*) un indirizzo è lungo **32 bit**, cioè 4 gruppi di 8 bit (*ottetti*). Lo rappresentiamo spesso in **notazione decimale puntata**: `192.168.1.24`.

```text
11000000 . 10101000 . 00000001 . 00011000
   192   .    168   .      1   .      24
```

Ogni ottetto va da 0 a 255. Esistono teoricamente `2^32 = 4.294.967.296` combinazioni; **non tutte sono assegnabili come indirizzi pubblici di dispositivi**: diversi blocchi sono riservati a impieghi speciali.

Nell'incapsulamento studiato prima, il pacchetto IP contiene indirizzo sorgente e destinazione e viene inoltrato dai router. Un indirizzo IP non coincide con l'indirizzo **MAC** (*Media Access Control*), tipicamente usato per la consegna del frame su un singolo collegamento locale.

## 2. Perché sono «finiti» gli IPv4?

Quando fu progettato IPv4, uno spazio a 32 bit sembrava enorme. La diffusione di computer, telefoni, router, data center e dispositivi connessi ha fatto crescere la domanda di **indirizzi globalmente univoci**.

Due date precise aiutano a non trasformare una frase giornalistica in un'affermazione scorretta:

- **3 febbraio 2011:** la **IANA** (*Internet Assigned Numbers Authority*) ha esaurito il suo insieme centrale di blocchi IPv4 ancora disponibili per l'assegnazione ai registri regionali.
- **25 novembre 2019:** **RIPE NCC** (*Réseaux IP Européens Network Coordination Centre*), registro regionale per Europa e altre aree, ha esaurito il suo pool ordinario di indirizzi IPv4 mai assegnati e applica procedure di lista d'attesa e recupero.

Questo **non** significa che IPv4 abbia smesso di funzionare, né che non esista più alcun indirizzo liberabile. Gli indirizzi già assegnati continuano a essere usati; alcuni vengono trasferiti, recuperati e riassegnati. Significa che la risorsa «nuovi indirizzi pubblici IPv4 disponibili liberamente» è diventata scarsa e soggetta a politiche di gestione. Fonte: RIPE NCC e IANA, link nelle fonti finali.

## 3. Chi assegna gli indirizzi?

Una sintesi della catena organizzativa:

```text
IANA: gestione globale dello spazio IP
    ↓
RIR: registri Internet regionali (es. RIPE NCC)
    ↓
Operatori / organizzazioni / registri locali
    ↓
Reti e utenti finali
```

Un **ISP** (*Internet Service Provider*, fornitore di connettività Internet) può attribuire all'utente un IPv4 pubblico, oppure gestire diversamente la condivisione degli indirizzi. *Assegnare un indirizzo* non significa rendere automaticamente ogni servizio raggiungibile dall'esterno: contano routing, firewall e configurazioni.

## 4. Indirizzi pubblici e privati

L'idea risolutiva è che molti dispositivi comunicano soprattutto **all'interno di una rete locale** e non hanno bisogno di essere identificati con un indirizzo IPv4 pubblico distinto. Lo standard **RFC 1918** (*Request for Comments 1918*, documento tecnico che definisce l'uso privato) riserva tre intervalli:

| Blocco privato | Da… a… | Esempio |
| --- | --- | --- |
| `10.0.0.0/8` | `10.0.0.0` – `10.255.255.255` | `10.4.2.9` |
| `172.16.0.0/12` | `172.16.0.0` – `172.31.255.255` | `172.20.5.8` |
| `192.168.0.0/16` | `192.168.0.0` – `192.168.255.255` | `192.168.1.24` |

La scrittura `/8`, `/12` o `/16` indica la lunghezza del prefisso di rete in bit, secondo la notazione **CIDR** (*Classless Inter-Domain Routing*). La notazione consente di riconoscere i blocchi privati anche senza calcolare numericamente tutte le possibili sottoreti.

Questi indirizzi possono essere **riutilizzati** in reti private diverse. Il laptop di uno studente a casa può essere `192.168.1.20`, così come una stampante in un'altra abitazione, senza conflitto, purché i due indirizzi non debbano essere univoci nella medesima rete privata collegata. I router dell'Internet pubblico non inoltrano normalmente pacchetti destinati a questi intervalli privati.

**Attenzione a due falsi ragionamenti:**

1. *«Tutti gli indirizzi che non sono privati sono pubblici»*: falso. Esistono indirizzi speciali, ad esempio `127.0.0.1` (loopback: questo stesso computer) e `169.254.x.x` (link-local IPv4, usato in determinate condizioni sulla rete locale).
2. *«Un indirizzo pubblico è sempre raggiungibile da chiunque»*: falso. Raggiungibilità effettiva e permessi di accesso dipendono dalla rete e dai filtri.

## 5. Il ruolo della rete locale e del gateway

In una rete domestica potremmo avere:

```text
Notebook: 192.168.1.10 ──┐
Telefono: 192.168.1.11 ──┼── Router / gateway ─── ISP ─── Internet
Stampante:192.168.1.12 ──┘    LAN 192.168.1.1
```

**LAN** significa *Local Area Network*, rete locale. Il **gateway predefinito** (*default gateway*) è il router a cui un dispositivo invia il traffico che non appartiene alla propria rete direttamente raggiungibile. Il router non è «la destinazione finale»: è il prossimo passaggio lungo il percorso.

Un computer può comunicare con una stampante della stessa LAN senza attraversare Internet. Quando vuole raggiungere un server esterno, inoltra i pacchetti al gateway. A questo punto nasce la difficoltà: un indirizzo privato non può essere usato tale e quale come indirizzo sorgente del normale traffico sull'Internet pubblico. Vedremo la traduzione nella prossima lezione.

## 6. E IPv6? La soluzione strutturale

**IPv6** (*Internet Protocol version 6*) impiega **128 bit** per gli indirizzi, per un numero di combinazioni immensamente superiore a quello di IPv4. Un indirizzo IPv6 usa gruppi esadecimali separati da due punti, per esempio `2001:db8::1` (blocco di documentazione). IPv4 e IPv6 possono convivere mediante **dual stack** (dispositivi che supportano entrambi) e altre tecniche di transizione.

Il nuovo spazio di indirizzamento permette di ridurre il bisogno della condivisione di indirizzi tramite NAT in molti scenari, ma **non elimina la necessità dei firewall**. Anche con IPv6 resta fondamentale stabilire quali connessioni consentire.

**Sintesi:** gli IPv4 non sono «spenti»: è esaurita la disponibilità ordinaria di nuovi blocchi pubblici. NAT e condivisione hanno attenuato la scarsità; IPv6 costituisce la risposta strutturale.

## 7. Analisi: lo stesso indirizzo privato, tre abitazioni

Tre abitazioni non collegate direttamente fra loro utilizzano lo stesso schema interno:

| Abitazione | Indirizzo del portatile | Gateway locale |
| --- | --- | --- |
| A | `192.168.1.10` | `192.168.1.1` |
| B | `192.168.1.10` | `192.168.1.1` |
| C | `192.168.1.10` | `192.168.1.1` |

**Questione 1.** Esiste un conflitto globale? *No: questi indirizzi sono privati e hanno significato nel rispettivo contesto di rete locale. Un indirizzo privato non identifica un destinatario univoco in tutto Internet.*

**Questione 2.** Le tre reti possono utilizzare lo stesso IPv4 pubblico senza ulteriori meccanismi? *Non come indirizzo globale esclusivo di tre interfacce indipendenti nello stesso contesto di instradamento: occorrerebbe un meccanismo di condivisione gestito dall'operatore. Nelle reti locali, invece, NAT/PAT consente a più host di condividere l'indirizzo pubblico assegnato al collegamento.*

**Questione 3.** Un indirizzo `172.25.4.8` è privato? *Sì: rientra nell’intervallo da `172.16.0.0` a `172.31.255.255`.*

**Questione 4.** IPv6 elimina la necessità di controllare gli accessi? *No. Avere molti indirizzi non significa autorizzare qualunque connessione.*

### Verifica

1. Perché `192.168.1.10` può comparire in migliaia di abitazioni? *Il suo ambito di utilizzo è locale alla rete privata.*
2. Che cosa è successo il 3 febbraio 2011? *Si è esaurito il pool centrale IANA di blocchi IPv4 ancora non distribuiti ai registri regionali.*
3. Un host con indirizzo pubblico è automaticamente raggiungibile da chiunque? *No, routing, firewall e configurazione determinano l'accessibilità.*
4. Perché IPv6 costituisce una risposta più generale della sola traduzione NAT? *Aumenta enormemente lo spazio degli indirizzi invece di limitarsi a condividere quello IPv4 esistente.*

**Passaggio alla lezione 3:** i nostri dispositivi hanno indirizzi privati, ma devono parlare con servizi pubblici. Come si collega il mondo interno a quello esterno?

---

# Lezione 3 — Dal privato al pubblico: gateway, NAT, PAT e CGNAT

**Domanda iniziale:** *«Se il server su Internet non può rispondere direttamente all'indirizzo privato `192.168.1.10`, come fa il mio computer a ricevere una risposta?»*

## 1. Il problema della traduzione

Tre dispositivi della LAN hanno indirizzi privati; il router, lato Internet, possiede per esempio l'IPv4 pubblico `203.0.113.7` (indirizzo qui usato solo per documentazione). Il sito remoto è `198.51.100.20`. Il router deve permettere che le comunicazioni interne risultino compatibili con l'indirizzamento pubblico e deve capire a quale dispositivo interno inviare le risposte.

**NAT** significa *Network Address Translation*, traduzione degli indirizzi di rete: un dispositivo modifica gli indirizzi IP presenti nei pacchetti secondo regole di traduzione. Il caso domestico più familiare è il NAT in uscita, in cui viene modificato l'indirizzo sorgente privato. Ma il termine NAT è generale: esistono diverse forme e direzioni di traduzione.

**PAT** significa *Port Address Translation*, traduzione degli indirizzi di porta: nella situazione più comune si traducono **indirizzi e porte**, così connessioni diverse possono condividere lo stesso IPv4 pubblico. Questo meccanismo viene anche chiamato **NAPT** (*Network Address and Port Translation*) o, in molte spiegazioni divulgative, NAT overload.

## 2. Perché non basta sostituire l'indirizzo?

Supponiamo che due computer visitino lo stesso server Web usando la stessa porta remota. Se il router li facesse apparire entrambi con lo stesso IPv4 pubblico senza un modo per differenziare i flussi, non saprebbe sempre a chi consegnare le risposte. Con il PAT utilizza porte esterne differenti.

| Prima del router: sorgente interna | Dopo il router: sorgente pubblica | Destinazione comune |
| --- | --- | --- |
| `192.168.1.10:51001` | `203.0.113.7:40001` | `198.51.100.20:443` |
| `192.168.1.11:51001` | `203.0.113.7:40002` | `198.51.100.20:443` |

La notazione `indirizzo:porta` identifica, nel contesto di TCP o UDP, un indirizzo IP e una porta. La porta `443` è comunemente usata da HTTPS. Le porte `40001` e `40002` sono esempi, non numeri obbligatori. Il router mantiene una **tabella di traduzione** che associa i flussi pubblici ai corrispondenti flussi interni.

```text
Client A 192.168.1.10:51001 ─┐
                              ├─ router con PAT ─ 203.0.113.7:40001 ─┐
Client B 192.168.1.11:51001 ─┘               └─ 203.0.113.7:40002 ───┴─> Server
```

Quando arriva una risposta destinata a `203.0.113.7:40002`, il router consulta la tabella e la riassocia al client B. La mappatura riguarda una comunicazione precisa, non un semplice elenco permanente di computer.

## 3. Che cosa cambia per le connessioni in ingresso?

Il client interno avvia una connessione e il router crea lo stato necessario per la risposta. Se un host sconosciuto su Internet tenta invece di iniziare spontaneamente una nuova connessione verso un computer interno, in assenza di mappature o regole appropriate il router normalmente non sa a quale destinatario inoltrarla e la connessione non viene instaurata.

Per pubblicare un servizio privato si può configurare una forma di inoltro, spesso chiamata **port forwarding**: per esempio una richiesta esterna a una data porta viene inoltrata al server interno. Farlo aumenta però l'esposizione e richiede scelte di sicurezza. Nel caso di un sito pubblico professionale vedremo che è preferibile ragionare su server separati, proxy e DMZ, non esporre casualmente computer della LAN.

**Da non confondere:**

- **NAT/PAT** risolvono problemi di *indirizzamento e condivisione*; non «cifrano» i dati.
- Un **firewall** applica una politica di autorizzazione del traffico.
- Le due funzioni possono convivere nello stesso router, ma rimangono concettualmente distinte.

## 4. Che cosa accade se anche l'operatore condivide gli indirizzi?

Alcuni ISP usano **CGNAT**, *Carrier-Grade Network Address Translation*: la traduzione avviene anche nella rete dell'operatore, dove più clienti condividono un indirizzo IPv4 pubblico. Un router domestico può quindi ricevere sul lato esterno un indirizzo non pubblico e non avere un IPv4 raggiungibile direttamente dall'Internet globale.

**Conseguenza concreta:** «ho aperto la porta sul router ma non riesco ad accedere al servizio da fuori». Potrebbe esserci un'altra traduzione a monte presso l'ISP. Non è necessariamente un errore di programmazione. Questo esempio consente di spiegare perché la progettazione di una rete coinvolga anche le scelte del fornitore di connettività.

## 5. La porta non identifica un computer

La porta indica un punto di comunicazione associato a un servizio o a un processo **su un host**, nel contesto di un protocollo di trasporto. Perciò `192.168.1.10:5000` e `192.168.1.11:5000` sono due destinazioni diverse. La stessa porta numerica può esistere in TCP e in UDP, perché i due protocolli gestiscono spazi di porte distinti.

Alcune porte note permettono di riconoscere servizi frequenti: `80` HTTP, `443` HTTPS, `53` DNS (sia UDP sia TCP in diversi casi). La distinzione fra protocollo, indirizzo e porta verrà ripresa con i socket.

## 6. Verifica

**Problema di ragionamento:** due PC di laboratorio aprono contemporaneamente lo stesso sito. Entrambi usano indirizzi privati. Che cosa deve conservare il router per inviare correttamente le risposte? *Associazioni tra flussi interni e flussi tradotti, comprese le porte.*

**Altre domande:**

1. PAT e NAT sono identici? *PAT è una forma di traduzione che coinvolge anche le porte; NAT è il concetto più ampio.*
2. NAT garantisce la riservatezza delle richieste? *No.*
3. Perché CGNAT può rendere difficile ospitare un server a casa? *L'utente non controlla l'IPv4 pubblico condiviso a monte.*
4. Quale problema resta se tutti i computer si collegano alla stessa LAN, anche con NAT? *Gli accessi laterali tra dispositivi interni: servono segmentazione e controllo.*

**Passaggio alla lezione 4:** il router collega interno ed esterno; ma dentro la stessa scuola come isoliamo segreteria, laboratorio e ospiti?

---

# Lezione 4 — Segmentazione: VLAN, subnet, firewall e ACL

**Domanda iniziale:** *«Si possono usare gli stessi switch e gli stessi cavi senza mettere tutti i dispositivi nella stessa rete logica?»*

## 1. Perché la LAN unica diventa un problema

Una scuola collega allo stesso insieme di switch computer dei laboratori, uffici, stampanti e access point degli ospiti. Se la rete è un unico grande dominio di comunicazione a livello 2, molte comunicazioni locali non richiedono il passaggio attraverso un router, e separare gli usi diventa difficile. Inoltre, il traffico di diffusione locale (*broadcast*) raggiunge un numero elevato di dispositivi.

Il punto non è soltanto ridurre il traffico: **vogliamo creare confini amministrativi e di sicurezza** tra gruppi di utenti che utilizzano la stessa infrastruttura fisica.

## 2. VLAN: reti locali virtuali

**VLAN** significa *Virtual Local Area Network*, rete locale virtuale. Uno switch gestito può associare porte e traffico a VLAN diverse, creando **domini di livello 2 separati** anche utilizzando una sola infrastruttura di switch.

Esempio:

| VLAN | Reparto | Indirizzi privati d'esempio | Politica desiderata |
| --- | --- | --- | --- |
| VLAN 10 | Segreteria | `192.168.10.0/24` | Accesso ai gestionali |
| VLAN 20 | Laboratorio | `192.168.20.0/24` | Accesso alle risorse didattiche |
| VLAN 30 | Ospiti | `192.168.30.0/24` | Solo connettività verso Internet |

`/24` indica qui un prefisso di 24 bit. Non è necessario calcolare tutti gli host disponibili; basta capire che le tre reti IP sono distinte.

```text
PC segreteria ──┐      ┌────────────────────────┐
                ├──────│  Switch con VLAN 10    │
PC laboratorio ─┤      │  VLAN 20 / VLAN 30    │──── Router / firewall
Ospite Wi-Fi ───┘      └────────────────────────┘
```

**Porta access:** una porta di switch normalmente assegnata a una VLAN per collegare un dispositivo finale. **Porta trunk:** collegamento che trasporta traffico di più VLAN, mediante identificazione appropriata (tipicamente standard **IEEE 802.1Q**, *Institute of Electrical and Electronics Engineers*). Basta comprenderne lo scopo; non serve saper configurare switch Cisco.

### VLAN non significa automaticamente subnet

Una **VLAN** è un concetto prevalentemente di **livello 2**, mentre una **subnet IP** è una suddivisione logica dell'indirizzamento di **livello 3**. Spesso si associa una subnet IP a ciascuna VLAN, ma non si tratta della stessa cosa. E «tre VLAN» non significa necessariamente «tre switch»: la separazione è logica.

## 3. Come comunicano due VLAN?

Di norma la comunicazione tra reti IP diverse richiede **routing**: un router o uno **switch di livello 3** decide a quale rete inoltrare i pacchetti. Questo passaggio è utile perché diventa un punto in cui applicare controlli.

```text
VLAN 20 (laboratorio) ──> Router / firewall ──> VLAN 10 (segreteria)
                              ↑
                      applicazione delle regole
```

In assenza di routing tra VLAN, i dispositivi restano separati sul piano IP. **Una VLAN, da sola, non garantisce una protezione completa:** configurazioni errate, controlli mancanti su altri collegamenti o servizi esposti possono vanificare la separazione prevista.

## 4. Firewall: controllo del traffico e livelli ISO/OSI

**Problema.** Due dispositivi possono essere collegati alla stessa infrastruttura senza avere il diritto di accedere agli stessi servizi. Occorre un componente che applichi regole alle comunicazioni: quali richieste possono attraversare il confine tra reti e quali devono essere rifiutate?

Un **firewall** è una funzione hardware, software o virtuale che controlla il traffico secondo una **politica di sicurezza**. Può trovarsi sul singolo computer (*host-based firewall*), al confine della rete, tra VLAN o segmenti interni, oppure davanti a servizi cloud. L'efficacia dipende dalle regole, dalla collocazione e dai flussi che attraversano davvero il controllo.

### 4.1 Tre grandi famiglie storiche, a livelli diversi

La classificazione tradizionale distingue questi meccanismi. I livelli ISO/OSI indicano *quali informazioni vengono considerate*: nella pratica le tecnologie non si collocano sempre rigidamente in un solo livello.

| Famiglia | Livello o informazioni considerate | Che cosa controlla | Limite esemplificativo |
| --- | --- | --- | --- |
| **Packet-filtering firewall**, filtro di pacchetti | Livello 3 (rete) e spesso livello 4 (trasporto) | IP sorgente/destinazione, protocollo e porte TCP/UDP | Non comprende da solo il significato di una richiesta `GET /admin` |
| **Circuit-level gateway**, gateway di circuito | Comunicazione/sessione; nelle classificazioni OSI tradizionali viene associato al livello 5 | Consente o media l'instaurazione di una sessione o di un circuito logico, senza analizzare necessariamente ogni comando applicativo | Sa che esiste una sessione autorizzata, ma può non distinguere le operazioni interne |
| **Application-level gateway**, gateway a livello applicativo | Livello 7 (applicazione) | Interpreta un protocollo applicativo specifico (per esempio HTTP) e può agire da proxy, con filtri più mirati | Richiede conoscenza del protocollo e introduce ulteriori elaborazioni |

**Esempio di packet filtering:** una regola permette da una rete di laboratorio il traffico TCP verso `198.51.100.20` sulla porta `443`, e nega l'accesso TCP alla porta `445` della segreteria. L'apparato può decidere usando intestazioni di rete e trasporto, senza leggere il documento Web richiesto.

**Esempio di gateway di circuito:** un intermediario accetta una connessione da un client autorizzato e stabilisce per suo conto una connessione verso un servizio remoto. Può controllare l'apertura del collegamento, senza riconoscere necessariamente ogni operazione applicativa contenuta nello scambio. Il termine *sessione* qui è concettuale: non implica che i moderni dispositivi TCP implementino letteralmente il livello 5 del modello teorico.

**Esempio di application-level gateway:** un proxy HTTP può riconoscere metodi, destinazioni e altre proprietà della richiesta Web e applicare una politica specifica per quel protocollo. È un controllo più vicino al significato dei dati, non semplicemente alla porta usata.

### 4.2 Filtraggio stateless e stateful: pacchetto isolato o connessione?

Un filtro **stateless** (*senza stato*) valuta ogni pacchetto rispetto alle regole, senza mantenere per quella decisione una tabella dello stato delle comunicazioni. Un firewall **stateful** (*con stato*) tiene traccia dei flussi o delle connessioni autorizzate e può riconoscere le risposte che ne fanno parte.

```text
PC interno: 192.168.20.10:51000  ----TCP---->  Server: 198.51.100.20:443
              richiesta autorizzata
              <----------------------  risposta della stessa connessione
                 (riconosciuta dallo stato)
```

Se è consentita una connessione TCP in uscita, un firewall stateful può accettare il traffico di risposta coerente con lo stato registrato senza aprire in modo indiscriminato tutte le connessioni nuove dall'esterno. Questo controllo **non** significa che il firewall conosca automaticamente la pagina HTML, le credenziali o l'operazione applicativa trasmessa.

### 4.3 Ispezione applicativa, NGFW e WAF

Molti prodotti combinano più meccanismi: non è necessario comprare «un firewall diverso» per ogni livello. Un **NGFW** (*Next-Generation Firewall*, firewall di nuova generazione) può unire filtraggio stateful, riconoscimento delle applicazioni, ispezione approfondita e funzioni aggiuntive di prevenzione delle minacce.

Un **WAF** (*Web Application Firewall*, firewall per applicazioni Web) è un controllo specializzato sul traffico HTTP/HTTPS verso applicazioni Web. Può analizzare richieste e regole relative al comportamento applicativo, per esempio schemi di richieste anomale, ma **non sostituisce il controllo delle autorizzazioni nel backend**.

**Limite della cifratura:** su una connessione HTTPS, un semplice firewall che osserva IP e porte non può leggere il percorso `/admin` o il corpo della richiesta, protetti da TLS (*Transport Layer Security*). Un controllo applicativo può osservare il contenuto **solo dove è disponibile in chiaro**, ad esempio nel componente che termina TLS o mediante un'ispezione configurata che comporta specifiche implicazioni tecniche e di fiducia. Un firewall a livello applicativo non «vede tutto» per magia.

### 4.4 Regole fondamentali

- **Minimo privilegio:** permettere solo il traffico necessario.
- **Default deny** (negazione predefinita): ciò che non è espressamente consentito viene bloccato, dove questa scelta è adeguata alla politica adottata.
- **Controlli in ingresso e in uscita:** filtrare anche le connessioni originate dall'interno, quando serve.
- **Registrazione e verifica:** un filtro è utile solo se le regole corrispondono ai flussi desiderati e vengono mantenute aggiornate.

Un firewall e una VLAN non svolgono lo stesso compito: la VLAN crea una separazione logica di livello 2, il firewall applica una politica di comunicazione ai flussi che lo attraversano.

## 5. ACL: regole di controllo degli accessi

**ACL** significa *Access Control List*, lista di controllo degli accessi. È un insieme ordinato o strutturato di regole che consente o nega determinate azioni. Nelle reti è spesso utilizzata per filtrare traffico in base a IP, protocolli e porte; il termine ACL compare anche nei file system e in altre aree dell'informatica.

Una **ACL non è necessariamente un dispositivo**: è una modalità di esprimere regole. Un firewall può usare ACL, e anche un router o uno switch può applicarle. Non è quindi corretta la contrapposizione «ACL oppure firewall» come se fossero oggetti dello stesso tipo.

### Mini-caso: rete scolastica

| Sorgente | Destinazione | Servizio | Regola |
| --- | --- | --- | --- |
| Ospiti | Internet | Web (HTTP/HTTPS) | Consenti |
| Ospiti | Segreteria | Qualunque servizio | Nega |
| Laboratori | Server didattico | Servizio didattico | Consenti |
| Internet | Database riservato | Qualunque servizio diretto | Nega |
| Server applicativo | Database | Porta del DB definita | Consenti |

La tabella è una **politica concettuale**, non una configurazione pronta all'uso: nelle installazioni vere bisogna verificare il traffico di risposta, la risoluzione DNS, gli aggiornamenti, la registrazione degli accessi e altri flussi necessari.

## 6. Confronto finale dei tre concetti

- **VLAN:** crea gruppi logici di livello 2 usando l'infrastruttura condivisa.
- **Routing tra VLAN:** permette la comunicazione tra reti IP diverse.
- **Firewall/ACL:** consente o blocca comunicazioni secondo criteri e regole.

Una VLAN non cifra il traffico. Un firewall non modifica necessariamente gli indirizzi (è il NAT a farlo). Una ACL non costituisce di per sé un apparecchio separato.

## 7. Analisi applicativa: quali informazioni servono al firewall?

Una rete contiene:

- VLAN 10 — segreteria: `192.168.10.0/24`, con server documenti `192.168.10.20`;
- VLAN 20 — laboratori: `192.168.20.0/24`;
- VLAN 30 — ospiti: `192.168.30.0/24`;
- un sito pubblico di prova: `198.51.100.20`, accessibile tramite HTTPS sulla porta TCP `443`.

Si considerino questi flussi:

| Flusso richiesto | Decisione proposta | Motivazione |
| --- | --- | --- |
| `192.168.30.44` → `192.168.10.20:445/TCP` | **Nega** | Gli ospiti non devono accedere ai servizi di condivisione interna |
| `192.168.20.15` → `198.51.100.20:443/TCP` | **Consenti** | Il laboratorio può visitare il sito pubblico |
| `192.168.30.44` → `198.51.100.20:443/TCP` | **Consenti** | La rete ospiti può consultare siti HTTPS |
| `198.51.100.20:443/TCP` → `192.168.20.15:51000/TCP` | **Consenti soltanto come risposta** | Un firewall stateful la riconosce se appartiene alla connessione autorizzata |

**Problema A — Livelli ISO/OSI.** Quale firewall può decidere usando soltanto IP, protocollo e porte? *Un packet filter a livello rete/trasporto.* Quale controllo può distinguere una richiesta HTTP a `/notizie` da una a `/admin`, se il contenuto è visibile? *Un controllo a livello applicativo, non un semplice filtro IP/porta.*

**Problema B — Il confine della cifratura.** Due richieste HTTPS raggiungono lo stesso indirizzo e la stessa porta, ma una chiede `/notizie` e l'altra `/admin`. Un filtro di pacchetti può distinguerle dal solo IP e dalla porta? *No.* Per proteggere `/admin` serve in ogni caso anche **autorizzazione applicativa**.

**Problema C — Segmentazione e routing.** Se due dispositivi sono in VLAN diverse ma lo switch di livello 3 permette tutto il traffico tra di esse, la numerazione VLAN assicura che l'ufficio amministrativo sia irraggiungibile? *No: il routing consente la comunicazione; occorrono regole coerenti con i permessi desiderati.*

### Verifica

1. Perché un firewall stateful è diverso da un filtro stateless? *Tiene traccia dei flussi e del relativo stato.*
2. Qual è la differenza tra firewall e ACL? *Il firewall è un sistema di controllo; una ACL è una forma di esprimere regole applicabili anche da router e switch.*
3. Un WAF sostituisce il login e la verifica dei permessi? *No.*
4. Un gateway a livello applicativo e un gateway di circuito analizzano necessariamente gli stessi dati? *No: il primo può comprendere il protocollo applicativo; il secondo controlla soprattutto l'instaurazione della comunicazione.*

**Passaggio alla lezione 5:** abbiamo isolato la rete interna. E se vogliamo pubblicare un sito accessibile a tutti senza esporre i dati della segreteria?

---

# Lezione 5 — Proxy e DMZ: pubblicare servizi senza esporre tutta la rete

**Domanda iniziale:** *«Un server deve essere raggiungibile da Internet: dove lo colloco e come limito ciò che può raggiungere?»*

## 1. Il problema del server pubblico

La scuola vuole un sito per orari e avvisi, accessibile a genitori e studenti anche da casa. Se il server pubblico fosse nello stesso segmento e con le stesse possibilità di accesso dei computer amministrativi, un problema su quel server rischierebbe di diventare una via verso risorse interne. Occorre separare **ciò che deve essere pubblico** da **ciò che deve restare riservato**.

Due soluzioni concettuali aiutano: creare un'area di rete dedicata ai servizi esposti (**DMZ**) e introdurre, quando serve, un intermediario (**proxy**).

## 2. DMZ: una zona controllata

**DMZ** è l'abbreviazione di *Demilitarized Zone*, «zona demilitarizzata». Nelle reti è un segmento separato, normalmente posto tra Internet e la LAN più riservata, destinato a ospitare servizi che devono essere esposti all'esterno. L'analogia militare serve solo a ricordare che è una zona di separazione.

```text
                          INTERNET
                             |
                      Router / firewall
                         /        \
                        /          \
                   DMZ              LAN INTERNA
             [Server Web]     [Segreteria] [PC] [DB]
```

L'illustrazione è **logica**: la realizzazione fisica può usare interfacce distinte, VLAN, firewall dedicati o componenti virtuali. Una DMZ non è una «porta magica» che rende sicuro qualunque servizio; servono regole rigorose.

Un esempio di politica:

- Da Internet al server Web nella DMZ: ammettere soltanto le comunicazioni necessarie al servizio pubblico.
- Da Internet alla LAN interna: negare accesso diretto.
- Dalla DMZ alla LAN interna: negare per impostazione predefinita; consentire eventuali flussi strettamente necessari e motivati.
- Dalla LAN verso il server nella DMZ: autorizzare solo le attività di gestione definite.

**Attenzione:** i dati riservati non dovrebbero essere collocati su un server pubblico solo perché «si trova nella DMZ». La DMZ è una misura di contenimento, non un sostituto di aggiornamenti, autenticazione, cifratura e controllo delle autorizzazioni.

## 3. Forward proxy: intermediario del client

**Proxy** significa intermediario. Un **forward proxy** riceve richieste dai client e le inoltra ai server esterni, secondo una politica. Può servire per controllare accessi, registrare richieste, gestire cache o imporre regole organizzative.

```text
Browser dei laboratori ──> PROXY ──> Server esterno
                           |
                   filtro / cache / log
```

**Cache**: memoria temporanea di contenuti o risultati per riutilizzarli quando le regole lo consentono. **Log**: registrazione di eventi, utile per diagnostica e sicurezza, da gestire rispettando privacy e politiche dell'organizzazione.

Attenzione: per le comunicazioni **HTTPS** (*Hypertext Transfer Protocol Secure*), cifrate tramite **TLS** (*Transport Layer Security*), un proxy non legge normalmente tutto il contenuto senza ulteriori meccanismi e configurazioni; filtraggio e ispezione hanno limiti tecnici e implicazioni sulla riservatezza.

## 4. Reverse proxy: intermediario davanti ai server

Un **reverse proxy** è invece posto davanti a uno o più server e riceve le richieste dei client esterni. Può:

- instradare `/notizie` verso un servizio e `/registro` verso un altro;
- terminare una connessione TLS e inoltrare richieste verso servizi interni secondo la configurazione;
- applicare limiti, cache o bilanciamento del carico (*load balancing*, distribuzione delle richieste).

```text
Internet -> Reverse proxy -> Server Web / applicazione A
                          -> Server applicativo B
```

Proxy in uscita e reverse proxy **non sono sinonimi**. Il primo rappresenta, in modo semplificato, i client verso l'esterno; il secondo si presenta davanti ai server esposti.

## 5. Riutilizzare lo stesso caso quando parleremo di architetture

Più avanti, per un servizio di prenotazione della biblioteca, avremo:

- un'interfaccia pubblica (pagina Web);
- un servizio che controlla le richieste e le autorizzazioni;
- un archivio dei libri e dei prestiti.

La DMZ e il reverse proxy riguardano **come il servizio viene esposto**, mentre gli strati di presentazione, logica e dati riguardano **come è progettato il software**. Sono prospettive diverse dello stesso sistema.

## 6. Verifica

**Scenario:** un server pubblico è stato compromesso. Qual è l'utilità della DMZ? *Riduce le possibilità di movimento verso la LAN interna quando sono state stabilite regole di separazione adeguate.*

**Domande:**

1. Il proxy deve sempre essere usato? *No, è una scelta architetturale.*
2. Un reverse proxy è automaticamente un firewall? *No, anche se può integrare controlli sul traffico.*
3. Che cosa non dovrebbe mai essere permesso senza motivo dalla DMZ? *Accesso indiscriminato alle risorse della LAN interna.*
4. NAT, VLAN, firewall, proxy e DMZ risolvono lo stesso problema? *No: traduzione, separazione, controllo e intermediazione svolgono ruoli differenti.*

**Passaggio:** ora sappiamo come organizzare e proteggere le reti. Ma quando due software vogliono comunicare attraverso Internet, che cosa devono conoscere?

---

# Lezione 6 — Internet prima del Web: reti, nomi, trasporto e servizi

**Domanda iniziale:** *«Se spegnessimo tutti i browser, Internet cesserebbe di esistere?»*

## 1. Internet non coincide con il Web

**Internet** è un sistema globale di reti interconnesse che utilizza protocolli condivisi per consentire lo scambio di pacchetti. Il **Web**, o **WWW** (*World Wide Web*), è uno degli insiemi di servizi che vi operano: documenti, applicazioni e risorse raggiungibili tramite tecnologie come **HTTP** (*Hypertext Transfer Protocol*), URL e browser.

La posta elettronica, l'accesso remoto, la comunicazione fra programmi e numerosi altri servizi possono usare Internet senza essere «pagine Web». Un'applicazione che scambia messaggi mediante un protocollo inventato per un esercizio sfrutta Internet (o una rete locale) ma non sta necessariamente usando il Web.

**Collegamento con il modulo precedente:** il modello ISO/OSI descrive le funzioni della comunicazione su livelli, mentre Internet è una rete reale che utilizza una famiglia di protocolli detta **TCP/IP** (*Transmission Control Protocol / Internet Protocol*). Questi nomi non si riferiscono a una singola applicazione.

## 2. Internet è una rete di reti

Un **ISP** (*Internet Service Provider*) offre accesso a Internet. Gli ISP e altre reti autonome si scambiano traffico attraverso collegamenti, punti di interconnessione e infrastrutture ad alta capacità. Il termine **backbone** descrive la dorsale, cioè collegamenti e nodi ad alta capacità che trasportano grandi quantità di traffico fra reti.

Un percorso semplificato:

```text
Laptop ─ Wi-Fi ─ Router domestico ─ ISP A ─ altre reti ─ ISP B ─ Server
```

Non immaginiamo «un unico cavo centrale» né un router che conosca in dettaglio tutti i computer del pianeta. Il traffico viene inoltrato in più passaggi. I percorsi possono cambiare, e l'instradamento è frutto di decisioni dei router e dei protocolli tra reti, non di una singola tabella universale.

## 3. IP consegna pacchetti; TCP e UDP offrono servizi di trasporto

**IP** (*Internet Protocol*) serve all'indirizzamento e all'instradamento dei pacchetti. Non promette da solo la consegna, l'ordine o l'assenza di duplicazioni.

**TCP** (*Transmission Control Protocol*) è un protocollo di trasporto orientato alla connessione. Presenta alle applicazioni un **flusso ordinato di byte** e fornisce meccanismi di conferma, ritrasmissione, controllo del flusso e della congestione. «Affidabile» non vuol dire che la rete non possa interrompersi: significa che TCP rileva e gestisce varie perdite finché la connessione è operativa, oppure segnala un errore.

**UDP** (*User Datagram Protocol*) trasporta datagrammi senza creare una connessione TCP e senza offrire, da solo, garanzie di consegna, ordine o ritrasmissione. Può essere utile quando la semplicità e la latenza contano e l'applicazione o un altro protocollo gestisce ciò che occorre.

| | TCP | UDP |
| --- | --- | --- |
| Unità vista dall'applicazione | Flusso ordinato di byte | Datagrammi distinti |
| Connessione | Sì | No, nel senso di TCP |
| Ordinamento e ritrasmissione del trasporto | Sì | Non garantiti da UDP |
| Esempio | Socket TCP e HTTP/1.1 | DNS spesso; trasporto di QUIC |

**Precisazione:** non è corretto affermare che «il Web usa sempre TCP». **HTTP/1.1** e **HTTP/2** normalmente usano TCP, mentre **HTTP/3** usa **QUIC**, un protocollo che opera sopra UDP e fornisce funzioni di trasporto più evolute. HTTP/1.1 su TCP è particolarmente adatto a comprendere lo scambio di richieste e risposte testuali.

## 4. Indirizzo IP, porta e programma

Sapere l'indirizzo IP del computer non basta: su una stessa macchina possono funzionare un server Web, un server di posta e un'applicazione di laboratorio. La **porta** è un numero usato dai protocolli di trasporto per distinguere i punti di comunicazione dei servizi.

Esempio: `198.51.100.20:443` identifica un indirizzo IP e una porta di destinazione. L'indirizzo individua un'interfaccia nel percorso di rete, la porta contribuisce a indirizzare la comunicazione verso il corretto servizio. Il sistema operativo collega le porte ai socket e ai processi che le utilizzano.

Un client utilizza normalmente anche una **porta locale temporanea** (*effimera*), scelta per la connessione. È la ragione per cui due browser o più schede possono avviare numerose connessioni verso la stessa destinazione.

## 5. I nomi sono più comodi degli indirizzi: DNS

**DNS** significa *Domain Name System*, sistema dei nomi di dominio. Permette di associare nomi come `www.example.org` a informazioni, spesso indirizzi IP. Il nome è utile perché è leggibile e può continuare a essere utilizzato anche se l'infrastruttura server cambia.

Quando un'applicazione deve contattare `www.example.org`, in modo semplificato:

1. Verifica se l'informazione necessaria è già disponibile in una cache locale.
2. Interroga il servizio di risoluzione DNS configurato, se necessario.
3. Ottiene uno o più indirizzi IP associati al nome, per esempio attraverso record **A** (IPv4) o **AAAA** (IPv6).
4. Usa un indirizzo opportuno per tentare la comunicazione.

Il DNS non trasferisce la pagina Web e non «scarica il sito»: risponde a domande sui nomi. Può essere usato anche per servizi non Web. Alcune risposte possono essere memorizzate temporaneamente (*cache*) secondo regole di durata.

## 6. Non è vero che ogni comunicazione è una richiesta Web

Un client può inviare al server la stringa `CIAO` e ricevere `BENVENUTO`, purché i due programmi abbiano stabilito il significato delle sequenze. Non c'è HTTP né HTML: c'è **un protocollo applicativo semplice** concordato dai due programmi.

Questa osservazione è il ponte verso i socket. Si distinguano già tre piani:

- **Rete IP:** come arrivare all'host remoto.
- **Trasporto TCP o UDP:** come applicazioni scambiano un flusso di byte o datagrammi.
- **Protocollo applicativo:** che significato attribuire ai dati ricevuti.

## 7. Attività e controllo

**Caso di analisi:** un programma di supervisione controlla le luci di un edificio tramite una connessione TCP con un server di automazione. È per questo un «sito Web»? *No: TCP da solo non implica HTTP o Web. Per stabilire se si usa il Web bisogna conoscere il protocollo applicativo.*

**Controllo:**

1. Internet e Web sono sinonimi? *No.*
2. Una porta sostituisce un indirizzo IP? *No: servono a scopi diversi.*
3. DNS trasporta l'HTML di un sito? *No: risolve nomi e fornisce altri record.*
4. Perché TCP è adatto all’esempio introduttivo dei socket? *Permette di osservare una connessione tra programmi e un flusso ordinato di byte.*

---

# Lezione 7 — Socket TCP: due programmi si scambiano byte, non pagine Web

**Domanda iniziale:** *«Abbiamo un indirizzo e una porta. Quale strumento usa concretamente un programma per spedire e ricevere dati?»*

## 1. Che cos'è un socket?

Un **socket** è un'interfaccia software tramite la quale un programma utilizza i servizi di comunicazione della rete offerti dal sistema operativo. Non è un protocollo applicativo, né una porta fisica del computer. Nel caso studiato useremo un **socket TCP**, che consente a due processi di scambiare un flusso ordinato di byte.

Se eseguiamo due programmi sullo **stesso computer**, possiamo comunque osservare il modello client-server: il traffico passa per l'interfaccia virtuale di *loopback*. L'indirizzo `127.0.0.1` significa «questo stesso host».

Schema dei ruoli:

```text
SERVER                                  CLIENT
crea socket                             crea socket
associa indirizzo e porta               stabilisce connessione
si mette in ascolto             <------ connect
accetta connessione
riceve byte                     <------ invia byte
invia byte                      ------> riceve byte
chiude la connessione                  chiude la connessione
```

Il server in attesa di connessioni non «spinge» automaticamente una pagina. Rimane disponibile a ricevere contatti; dopo la connessione il comportamento è stabilito dai programmi.

## 2. Dimostrazione essenziale in Python

**Lettura delle operazioni fondamentali:** `listen` abilita l’ascolto delle connessioni, `accept` accetta un client, `recv` legge fino a un numero massimo di byte, `sendall` invia i byte richiesti finché l’operazione riesce o viene segnalato un errore. Il meccanismo è più importante della sintassi Python.

*Programma server — `server_tcp.py`:*

```python
import socket

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server:
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(("127.0.0.1", 50555))
    server.listen(1)
    print("In ascolto...")
    conn, indirizzo = server.accept()
    with conn:
        dati = conn.recv(1024)
        print("Ricevuti:", dati)
        conn.sendall(b"Ciao dal server")
```

*Programma client — `client_tcp.py`:*

```python
import socket

with socket.create_connection(("127.0.0.1", 50555)) as client:
    client.sendall(b"Ciao dal client")
    print("Risposta:", client.recv(1024))
```

**Sequenza di esecuzione:** prima parte il processo server, poi il client. L’output può contenere `b'Ciao dal client'` e `b'Ciao dal server'`: la `b` segnala una sequenza di **byte** in Python. Il contenuto non è automaticamente un oggetto HTTP, una pagina HTML o un oggetto JSON.

**Limiti dell’esempio:** il server ascolta soltanto su `127.0.0.1` e non espone intenzionalmente un servizio sulla rete esterna. Non implementa autenticazione, gestione di più client o completa gestione degli errori: è un esempio per osservare TCP, non un server di produzione.

## 3. Da caratteri a byte: codifica

Quando scriviamo `"Ciao"` pensiamo a caratteri; per trasmettere occorrono byte. Una **codifica dei caratteri** specifica come trasformare il testo in byte e viceversa. Una codifica usatissima è **UTF-8**, *Unicode Transformation Format, 8-bit*.

```python
messaggio = "Città"
dati = messaggio.encode("utf-8")   # caratteri → byte
nuovo_testo = dati.decode("utf-8") # byte → caratteri
```

Queste istruzioni mostrano perché due programmi devono accordarsi sulla codifica. Il trasferimento può funzionare perfettamente anche se il destinatario interpreta male i byte: il problema allora non è la rete, ma il **formato applicativo**.

## 4. Un equivoco importantissimo: TCP non conserva i confini dei messaggi

Nell'esempio abbiamo inviato un breve messaggio e ricevuto una sola volta. **Una chiamata `sendall()` del client non corrisponde necessariamente a una singola `recv()` del server con lo stesso contenuto.** TCP offre un flusso di byte, non pacchetti-messaggio visibili all'applicazione con gli stessi confini delle chiamate di invio.

Se il client invia i byte di `BUONGIORNO`, il server potrebbe ricevere `BUON` e poi `GIORNO`, oppure tutto insieme. Anche due invii distinti potrebbero essere letti in un'unica `recv`. Una chiamata a `recv(1024)` restituisce **fino a** 1024 byte, non obbligatoriamente 1024.

Un protocollo applicativo reale ha quindi bisogno di un criterio per riconoscere i messaggi:

- dimensione annunciata prima del contenuto;
- terminatore concordato, come un carattere di nuova riga;
- struttura del protocollo, come intestazioni con lunghezza del contenuto.

Anche la fine del flusso è significativa: una `recv` che restituisce `b''` segnala normalmente la chiusura ordinata del lato remoto. **Il problema non è il comando utilizzato, ma il fatto che il flusso TCP non conserva automaticamente i confini logici dei messaggi.**

## 5. Il protocollo lo decidono le applicazioni

Si considerino due coppie di programmi:

```text
Programma A: invia "SOMMA 2 3"  → Server A: restituisce "5"
Programma B: invia "ACCENDI"    → Server B: restituisce "OK"
```

Entrambi possono usare esattamente TCP. Cambia soltanto la **regola condivisa** con cui interpretano i byte. Questa regola è un protocollo di livello applicativo. Non tutti i protocolli richiedono il Web; alcuni sono privati, altri standardizzati.

**Ponte verso HTTP:** browser e server Web hanno bisogno di capirsi anche quando sono scritti da persone diverse, in linguaggi differenti e su sistemi operativi differenti. Perciò non possono basarsi su un messaggio inventato per ogni coppia di programmi: utilizzano un protocollo condiviso, HTTP.

## 6. Analisi del flusso e verifica

Un client esegue due invii successivi, contenenti `b"CIAO"` e `b"MONDO"`. Il server chiama `recv(1024)`.

**È garantito che la prima lettura restituisca `b"CIAO"` e la seconda `b"MONDO"`?** No. Il server potrebbe leggere `b"CIAOMONDO"` tutto insieme, oppure byte suddivisi in più letture. TCP conserva l'ordine dei byte, non il confine dei due invii.

**Come si può riconoscere dove finisce un messaggio?** Una convenzione di livello applicativo può aggiungere un delimitatore, per esempio `CIAO\n`, oppure annunciare la lunghezza del contenuto prima dei byte. Sono esempi di *framing*, cioè delimitazione dei messaggi.

**Perché `b"Città"` non è una rappresentazione appropriata direttamente scritta come letterale bytes Python?** Per caratteri non ASCII è necessario applicare una codifica, per esempio `"Città".encode("utf-8")`.

### Verifica

1. Un socket TCP è un browser? *No: è un'interfaccia per usare il servizio di trasporto TCP.*
2. Il server deve conoscere il codice sorgente del client? *No: deve condividere il protocollo applicativo.*
3. `recv(1024)` assicura sempre un messaggio completo? *No: indica un massimo di byte da leggere.*
4. A cosa serve UTF-8? *A codificare i caratteri in byte e a decodificarli.*
5. Client e server possono girare su un solo PC? *Sì, utilizzando l'interfaccia locale di loopback.*

---

# Lezione 8 — Dal socket al Web: protocollo HTTP e prime pagine

**Domanda iniziale:** *«Se TCP trasporta soltanto byte, come fa il browser a sapere che deve visualizzare una pagina?»*

## 1. Il problema della comprensione reciproca

Nel laboratorio Python potevamo decidere che `CIAO` fosse un messaggio valido. Nel Web un browser scritto da una società e un server sviluppato da un'altra devono capirsi usando regole comuni. Entra in gioco **HTTP**, *Hypertext Transfer Protocol*, protocollo per scambiare rappresentazioni di risorse mediante richieste e risposte.

La distinzione che ci interessa:

- **Socket TCP:** consente lo scambio di un flusso di byte tra processi.
- **HTTP/1.1:** definisce il formato e il significato di richieste e risposte applicative trasportate su quel flusso.
- **HTML:** *HyperText Markup Language*, linguaggio di marcatura che può comparire nel contenuto di una risposta HTTP per descrivere la struttura di una pagina.

HTTP non coincide con HTML: una risposta HTTP può contenere HTML, JSON, un'immagine, un PDF o nessun corpo.

## 2. Com'è fatta una richiesta HTTP/1.1?

Un esempio semplificato di richiesta:

```http
GET /orari HTTP/1.1
Host: www.example.org

```

- `GET` è il **metodo**: qui si vuole ottenere una rappresentazione di una risorsa.
- `/orari` è il percorso richiesto.
- `HTTP/1.1` identifica la versione del protocollo mostrata.
- `Host` è un'**intestazione** (*header*) che identifica l'host logico richiesto: più siti possono convivere sulla stessa infrastruttura.
- La riga vuota separa le intestazioni dall'eventuale corpo della richiesta.

**POST** è un altro metodo, comunemente usato per inviare dati da elaborare. Non è vero che «GET è la prima richiesta e POST sono tutte le successive»: una pagina può produrre molti GET, POST e altri metodi in diversi momenti. Il metodo dipende dall'operazione, non da quando viene eseguita.

## 3. Com'è fatta una risposta?

```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 27

<h1>Benvenuti a scuola</h1>
```

Il valore di `Content-Length` indica la dimensione **in byte** del corpo della risposta. In questo semplice esempio il corpo contiene soltanto caratteri ASCII, quindi il numero dei caratteri coincide con il numero dei byte.

`200 OK` indica una risposta riuscita; `Content-Type` dichiara il tipo di contenuto mediante un **MIME type** (*Multipurpose Internet Mail Extensions*, convenzione per indicare tipi di contenuto). Altri codici da conoscere: `301` o `302` reindirizzamento, `404` risorsa non trovata, `500` errore del server. Un errore `404` non implica che «Internet sia rotto».

**URL** significa *Uniform Resource Locator*: un indirizzo di risorsa che include normalmente uno schema, un host, un percorso ed eventualmente porta, query e frammento, ad esempio:

```text
http://127.0.0.1:18080/notizie?anno=2026
│      │         │   │       └── query
│      │         │   └────────── percorso
│      │         └────────────── porta
│      └──────────────────────── host
└─────────────────────────────── schema
```

Il frammento `#sezione` eventualmente presente nell'URL è gestito in molti casi dal browser e non viene normalmente trasmesso nel percorso della richiesta HTTP al server.

## 4. Una dimostrazione potente: HTTP scritto a mano su un socket Python

Un socket non restituisce «una pagina» spontaneamente. **Se un programma costruisce una risposta HTTP valida**, il browser può interpretarne il contenuto. Il seguente server dimostrativo ascolta solo sul computer locale e risponde a ogni connessione con una pagina elementare:

```python
import socket

pagina = "<h1>Il browser ha capito HTTP!</h1>".encode("utf-8")
intestazioni = (
    "HTTP/1.1 200 OK\r\n"
    "Content-Type: text/html; charset=utf-8\r\n"
    f"Content-Length: {len(pagina)}\r\n"
    "Connection: close\r\n\r\n"
).encode("ascii")

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server:
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(("127.0.0.1", 18080))
    server.listen()
    print("Apri http://127.0.0.1:18080")
    while True:
        conn, _ = server.accept()
        with conn:
            richiesta = conn.recv(4096)
            print("Richiesta ricevuta:", richiesta[:200])
            conn.sendall(intestazioni + pagina)
```

**Risultato osservabile:** con il processo server in esecuzione, l’indirizzo `http://127.0.0.1:18080` mostra il titolo nel browser, mentre il terminale stampa l’inizio della **richiesta testuale HTTP**. L’esempio termina con `Ctrl+C`. **Limite tecnico:** il programma non analizza completamente le richieste, non gestisce in modo robusto tutti i casi del flusso TCP e restituisce la stessa risposta per ogni percorso: non è un server di produzione.

**Il punto fondamentale:** lo stesso socket TCP dell’esempio precedente diventa uno strumento per il Web quando i byte sono organizzati secondo il protocollo applicativo HTTP. Il browser comprende il protocollo, non il linguaggio in cui è stato scritto il server.

## 5. Che cosa avviene davvero quando apriamo un URL?

Per il nostro indirizzo locale non occorre una risoluzione DNS esterna. Per un sito pubblico, normalmente si passa dal nome all'indirizzo tramite DNS, poi si stabilisce la comunicazione con il server. In HTTP/1.1 su TCP la richiesta ha una struttura leggibile e il server restituisce una risposta. Il browser determina che cosa fare in base a **tipo di risorsa**, contenuto, sicurezza e contesto.

Una pagina reale contiene spesso altri riferimenti (CSS, JavaScript, immagini). Il browser invia **altre richieste anche senza l'intervento di JavaScript**. Non possiamo quindi dire «il browser fa solo il primo GET e dopo lavora sempre JavaScript». Il funzionamento del browser chiarisce il motivo.

**Precisazione sulle versioni:** HTTP/2 codifica in modo differente i messaggi e normalmente usa TCP; HTTP/3 usa QUIC su UDP. L'esempio testuale vale per **HTTP/1.1**. Il concetto generale di *richiesta, risposta, intestazioni e contenuto* resta utile per comprendere anche le versioni più recenti.

## 6. Distingui server Web e sito Web

Il **server Web** è il software (e spesso, per estensione, il computer) che gestisce richieste HTTP e produce risposte. Il **sito Web** è un insieme organizzato di risorse e funzionalità accessibili dagli utenti. Il server può restituire un file già pronto (*contenuto statico*) o generare una risposta calcolata al momento (*contenuto dinamico*).

Un server può essere realizzato usando diversi linguaggi e tecnologie. Non esiste una dipendenza necessaria tra «essere un server» e «usare Node.js»: nella lezione 11 confronteremo varie possibilità.

## 7. Analisi di una pagina e delle sue richieste

Il browser richiede `/index.html` e riceve:

```html
<link rel="stylesheet" href="stile.css">
<img src="logo.png" alt="Logo">
<script src="app.js" defer></script>
```

**Questione 1.** Quale richiesta ha dato inizio alla navigazione? *La richiesta del documento HTML.*

**Questione 2.** Perché il browser effettua poi richieste per `stile.css`, `logo.png` e `app.js`? *Perché l’analisi del documento rileva collegamenti a ulteriori risorse, anche senza che JavaScript avvii quelle richieste.*

**Questione 3.** Un’eventuale richiesta successiva `GET /api/libri` è necessariamente una nuova navigazione? *No: può essere avviata dal codice dell’applicazione ed elaborata senza sostituire il documento visualizzato.*

**Questione 4.** Se il server restituisce `Content-Type: application/json`, deve sempre mostrare una nuova pagina? *No: il contenuto è costituito da dati, che possono essere elaborati da altri programmi.*

### Verifica

1. TCP crea da solo l’intestazione `HTTP/1.1`? *No, la crea il software che implementa HTTP.*
2. HTTP e HTML sono la stessa cosa? *No: protocollo applicativo e linguaggio di marcatura.*
3. Il metodo HTTP dipende dall’essere la prima richiesta? *No: descrive il tipo di operazione.*
4. Perché un server scritto in Python può rispondere a Chrome? *Perché entrambi utilizzano lo stesso protocollo applicativo.*

---

# Lezione 9 — Il browser è un programma: rete, rendering, interpretazione e compilazione

**Domanda iniziale:** *«Perché la stessa applicazione Web può funzionare su sistemi operativi diversi senza installare ogni volta un programma costruito specificamente per quella macchina?»*

## 1. Il browser non è una semplice finestra sulle pagine

Il **browser** è un programma client complesso che offre un ambiente relativamente standardizzato per navigare, presentare documenti ed eseguire parti delle applicazioni Web. È client perché **avvia richieste e utilizza servizi**, ma non è l'unico tipo di client possibile: lo stesso servizio HTTP può essere chiamato da un'app mobile, da uno script o da un altro server.

La forza del browser è duplice:

1. **Nasconde buona parte della complessità di rete**: la pagina o l'applicazione non deve implementare da zero DNS, gestione delle connessioni, HTTP, certificati, recupero delle risorse e molte altre funzioni.
2. **Offre un ambiente d'esecuzione e presentazione**: i contenuti Web rispettano standard condivisi e possono funzionare su piattaforme diverse, pur con alcune differenze tra browser.

Il browser ha reso possibile distribuire applicazioni attraverso il Web senza obbligare ogni autore a fornire un eseguibile nativo specifico per Windows, macOS, Linux e ogni altro sistema. **Non** significa che il browser cancelli tutte le differenze, o che ogni applicazione Web possa accedere liberamente a tutte le funzioni del computer.

## 2. I componenti concettuali principali

Nel browser possiamo distinguere, senza entrare nei dettagli dei processi interni:

| Parte | Responsabilità |
| --- | --- |
| **Componente di rete** | Esegue richieste, gestisce HTTP, cache, connessioni e aspetti di sicurezza |
| **Parser HTML** | Analizza il linguaggio di marcatura e costruisce una rappresentazione del documento |
| **Motore CSS** | Analizza le regole di stile per determinare l'aspetto degli elementi |
| **Motore di rendering** | Calcola posizioni e dimensioni, disegna gli elementi e li compone a schermo |
| **Motore JavaScript** | Esegue il codice JavaScript, anche mediante interpretazione e compilazione |
| **Web API del browser** | Espone funzioni standard per manipolare il documento, richiedere dati e interagire con funzioni consentite |

Sono **responsabilità**, non necessariamente sei programmi indipendenti. Nei browser reali il lavoro è distribuito fra processi, thread e componenti software, ma la distinzione qui è funzionale.

## 3. Da HTML a pagina visibile

**HTML** (*HyperText Markup Language*) descrive contenuto e struttura tramite elementi. Per esempio, un titolo e un paragrafo non sono «disegnati» dal server: arrivano in una risposta e il browser li analizza.

Il parser produce il **DOM**, *Document Object Model*: una rappresentazione ad albero della struttura del documento in memoria. Una porzione di documento:

```html
<h1>Biblioteca</h1>
<p>Libri disponibili: 12</p>
```

può essere rappresentata concettualmente così:

```text
Documento
  └── corpo
       ├── h1 → «Biblioteca»
       └── p  → «Libri disponibili: 12»
```

Il **CSS** (*Cascading Style Sheets*, fogli di stile a cascata) descrive le regole di presentazione: colori, spazi, dimensioni, layout. Il browser ne costruisce e gestisce una rappresentazione usata dal motore di rendering (spesso indicata come **CSSOM**, *CSS Object Model*). Da struttura e stili deriva ciò che verrà effettivamente rappresentato.

Una semplificazione del processo è:

```text
HTML scaricato ──> parsing ──> DOM ───────────┐
                                               ├─> layout ─> disegno ─> composizione
CSS scaricato  ──> parsing ──> regole di stile ┘               sullo schermo
```

**Layout** significa decidere posizioni e dimensioni; **painting/disegno** produce istruzioni per rappresentare gli elementi; **compositing/composizione** unisce i risultati delle diverse superfici o livelli grafici. I browser moderni possono fare parte di questi passaggi in parallelo o aggiornarli solo dove necessario.

**Precisazione lessicale:** dire che il browser «interpreta HTML e CSS» è una semplificazione accettabile nel linguaggio comune, ma non equivale a dire che **compila HTML e CSS in un programma eseguibile come fa con JavaScript**. HTML e CSS sono analizzati e usati per costruire e rappresentare la pagina; JavaScript è un linguaggio di programmazione eseguito dal motore JavaScript.

## 4. E JavaScript? Un programma che vive dentro il browser

**JavaScript** è un linguaggio di programmazione usato, fra l'altro, per rendere interattive le pagine Web. Può reagire a clic, aggiornare contenuti, validare dati nell'interfaccia e richiedere informazioni a servizi remoti. A differenza di HTML e CSS, definisce **istruzioni**, condizioni, funzioni e oggetti da eseguire.

Per esempio, un pulsante può incrementare un contatore mostrato nella pagina. Non serve che il server ridisegni il contatore a ogni clic: il browser può modificare direttamente il DOM usando le sue API. La possibilità di eseguire programmi nel browser ha trasformato il Web da una raccolta di documenti a una piattaforma per applicazioni interattive.

Ma JavaScript **non coincide con il browser**. Il linguaggio è eseguito da un motore JavaScript; il browser aggiunge funzioni esterne al linguaggio, per esempio `document` e `fetch`, e impone un modello di sicurezza. Il motore JavaScript, da solo, non è responsabile di tutte le richieste di rete o del rendering della pagina.

## 5. V8 «interpreta» o «compila»? Entrambe le cose, con precisione

**V8** è il motore JavaScript usato, per esempio, da **Google Chrome**, da altri browser basati su Chromium e da **Node.js**. Il nome non significa «versione 8 di JavaScript». Esistono motori differenti: **SpiderMonkey** in Firefox e **JavaScriptCore** in Safari.

Le principali fasi di esecuzione del codice JavaScript sono:

1. Il motore analizza il testo JavaScript (*parsing*) e ne riconosce la struttura.
2. Può produrre una rappresentazione intermedia, chiamata **bytecode**.
3. Può eseguire il bytecode attraverso un **interprete**.
4. Può **compilare** alcune parti in istruzioni macchina per migliorare l'esecuzione, anche durante il funzionamento.

**JIT** significa *Just-in-Time compilation*, compilazione effettuata mentre il programma viene utilizzato. Alcuni motori usano più stadi di compilazione e ottimizzazione. V8, per esempio, combina un interprete chiamato Ignition con compilatori, tra cui Sparkplug, Maglev e componenti ottimizzanti. Non è quindi esatto descrivere V8 come «un interprete puro che legge una riga alla volta e basta».

```text
Testo JavaScript
       ↓ parsing
Rappresentazione del programma
       ↓
Bytecode / rappresentazioni intermedie
       ├──> interpretazione
       └──> compilazione in codice macchina e ottimizzazione
                         ↓
                     esecuzione
```

**Concetto centrale:** il browser contiene un motore che esegue JavaScript; durante questa attività il motore può interpretare il bytecode e compilare codice macchina. Chrome usa V8; altri browser possono usare motori differenti.

## 6. Il caricamento della pagina: chi genera le richieste?

Ecco il punto su cui è più facile creare un'idea sbagliata. Consideriamo una pagina HTML che contiene:

```html
<link rel="stylesheet" href="stile.css">
<img src="logo.png" alt="Logo">
<script src="app.js" defer></script>
```

Sequenza didattica semplificata:

1. L'utente digita un **URL** (*Uniform Resource Locator*) o segue un link: il browser avvia una navigazione.
2. Risolve il nome del server, se necessario, e gestisce le connessioni e la richiesta per il documento.
3. Riceve l'HTML e comincia ad analizzarlo, anche prima che il file sia interamente arrivato.
4. Scopre riferimenti a fogli di stile, immagini e script; **il browser stesso** richiede le risorse necessarie, secondo le sue regole di caricamento e cache.
5. Analizza HTML e CSS, esegue gli script quando previsto, costruisce e aggiorna il documento e lo rappresenta.
6. Il codice JavaScript in esecuzione può **a sua volta** avviare altre richieste, anche senza cambiare pagina.

```text
Utente apre URL
      |
      v
Browser GET documento HTML
      |
      +--> Browser richiede CSS, immagini, script (non serve JS per tutte)
      |
      +--> Motore JS esegue il codice della pagina
                |
                +--> JS può usare fetch() e chiedere dati a una Web API
                |
                +--> JS può aggiornare il DOM e la vista
```

Il browser dunque **non fa solo il primo GET**. È sempre il software browser a fornire il servizio di rete richiesto dal contesto, mentre il codice JavaScript può comandare ulteriori operazioni tramite API. Inoltre, il browser può inviare richieste da form HTML anche **senza JavaScript**, e alcune navigazioni possono essere attivate con metodi diversi da GET.

## 7. Perché «unifica» il software client?

La parola corretta è **standardizza l'ambiente**, non «rende tutti i client uguali». Lo sviluppatore crea una pagina o un'applicazione secondo standard come HTML, CSS, JavaScript e HTTP. Il browser implementa questi standard e offre molte funzionalità già pronte. L'applicazione Web può così raggiungere sistemi diversi senza che ogni utente installi un programma compilato appositamente per la propria piattaforma.

Il browser è anche una **sandbox** (ambiente con limitazioni): per proteggere l'utente, il codice JavaScript della pagina non deve poter leggere liberamente i file del computer, controllare altri siti o utilizzare ogni dispositivo senza regole. Tecniche come la **same-origin policy** (politica della stessa origine, che limita alcune interazioni tra risorse provenienti da origini diverse) definiscono confini. **CORS** (*Cross-Origin Resource Sharing*) è un meccanismo del Web che regola alcune richieste e accessi tra origini differenti. Il principio essenziale è che una pagina non ha accesso indiscriminato a dati di ogni altro sito.

## 8. Analisi del funzionamento del browser

Gli strumenti di sviluppo (*Developer Tools*) di Chrome e Firefox permettono di osservare tre aspetti distinti dello stesso programma:

| Strumento | Che cosa si osserva | Che cosa dimostra |
| --- | --- | --- |
| **Network / Rete** | Richieste HTTP, codici di stato, tipi di contenuti | Il browser gestisce molte richieste, non solo la prima navigazione |
| **Elements / Ispettore** | DOM e stili della pagina; una modifica locale al titolo | Il documento visualizzato ha una rappresentazione modificabile in memoria |
| **Console** | Valutazione di un'espressione JavaScript, per esempio `2 + 3` | Il browser dispone di un ambiente capace di eseguire codice |

**Caso A — Titolo modificato nell'Ispettore.** La modifica di `<h1>Biblioteca</h1>` in `<h1>Catalogo</h1>` altera automaticamente il file HTML salvato sul server? *No: viene modificata la rappresentazione locale del DOM. Un nuovo caricamento può recuperare nuovamente il contenuto originale.*

**Caso B — Pagina caricata senza un file JavaScript.** Il browser può richiedere comunque immagini e CSS? *Sì: il caricatore di risorse opera anche in assenza del codice JavaScript della pagina.*

**Caso C — JavaScript eseguito.** Il motore V8 realizza da solo una connessione di rete tramite la sintassi del linguaggio? *No: nell’ambiente browser, funzioni come `fetch()` sono fornite dalle Web API del browser, che gestisce l’operazione di rete.*

## 9. Domande con cui verificare la comprensione

1. Che differenza c'è tra browser e motore JavaScript? *Il browser è l'applicazione complessiva; il motore esegue JavaScript ed è uno dei suoi componenti.*
2. Chi trasforma HTML in un albero del documento? *Il parser HTML del browser, che produce il DOM.*
3. V8 è soltanto un interprete? *No, utilizza anche compilazione e ottimizzazione.*
4. Chi chiede `logo.png` quando compare in un tag `img`? *Il sistema di caricamento del browser, senza richiedere necessariamente una chiamata JavaScript.*
5. Perché il browser è una piattaforma per applicazioni? *Offre un ambiente standardizzato per rete, interfaccia ed esecuzione di JavaScript, con limiti di sicurezza.*
6. JavaScript può creare un file arbitrario nella cartella dei documenti dell'utente senza permesso? *Non con libero accesso: il browser limita e media le operazioni sensibili.*

**Passaggio:** se il browser già sa richiedere e rappresentare pagine, perché a volte un programma JavaScript fa una richiesta supplementare e riceve solo dati? Entra in gioco l'idea di API.

---

# Lezione 10 — API: una pagina può chiedere dati invece di una pagina intera

**Domanda iniziale:** *«Quando un sito mostra il numero dei libri disponibili, da dove prende quel numero e come può aggiornarlo?»*

## 1. Il problema dei servizi riutilizzabili

Una biblioteca scolastica vuole rendere consultabili gli stessi libri dal sito Web, dal software della segreteria e da un’app mobile. Inventare un protocollo diverso per ogni client renderebbe difficile l’integrazione. È più utile esporre **funzioni e dati attraverso un’interfaccia condivisa**.

**API** significa *Application Programming Interface*, interfaccia di programmazione delle applicazioni. È un **contratto** che descrive come un software può usare le funzioni di un altro componente: quali operazioni sono disponibili, come richiederle, quali dati passare e quali risultati aspettarsi. Le API non sono necessariamente su Internet: anche il sistema operativo e le librerie software ne offrono.

Nel Web incontriamo due concetti distinti:

- **API del browser:** funzioni che il browser mette a disposizione al codice eseguito nella pagina, per esempio `fetch` per richiedere risorse e il DOM per modificare il documento.
- **Web API del server:** funzionalità che un'applicazione remota rende accessibili, spesso attraverso richieste e risposte HTTP.

Quando una pagina esegue `fetch('/api/libri')`, **usa una API del browser per chiamare una API esposta dal server**. Sono due interfacce differenti nello stesso percorso.

## 2. Endpoint e operazioni HTTP

Un **endpoint** è un punto di accesso a una funzionalità o risorsa. Ad esempio:

| Richiesta | Significato orientativo |
| --- | --- |
| `GET /api/libri` | Ottieni l'elenco dei libri |
| `GET /api/libri/15` | Ottieni il libro 15 |
| `POST /api/prestiti` | Richiedi la registrazione di un prestito |
| `DELETE /api/prenotazioni/9` | Richiedi l'eliminazione della prenotazione 9 |

Queste convenzioni sono tipiche di molte API HTTP progettate secondo principi **REST** (*Representational State Transfer*, uno stile architetturale per sistemi a risorse). Non tutte le Web API sono REST e non basta usare JSON per renderle tali. La relazione centrale è quella fra **metodo, percorso, dati e risposta**.

## 3. JSON: dati, non una pagina

Un servizio può rispondere con **JSON**, *JavaScript Object Notation*, un formato testuale per rappresentare dati strutturati. Per esempio:

```json
{
  "id": 15,
  "titolo": "Le città invisibili",
  "disponibile": true
}
```

JSON non è una pagina Web da renderizzare come HTML. È una rappresentazione di dati: nomi di proprietà, numeri, stringhe, valori booleani e strutture annidate. Può essere letto da applicazioni scritte in linguaggi diversi da JavaScript.

Il server potrebbe produrre una risposta del tipo:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"titolo":"Le città invisibili","disponibile":true}
```

L'intestazione indica che il contenuto rappresenta JSON. **Non è richiesto che il server sia scritto in JavaScript** solo perché il formato si chiama JavaScript Object Notation.

## 4. La pagina richiede informazioni senza essere ricaricata

La relazione tra JavaScript, API del browser e Web API del server compare in questo esempio minimo:

```javascript
fetch("/api/libri/15")
  .then(risposta => risposta.json())
  .then(libro => console.log(libro.titolo));
```

La sequenza concettuale:

1. Il codice JavaScript è eseguito nel browser.
2. Chiama `fetch`, un'API che il browser fornisce al programma.
3. Il browser gestisce la richiesta HTTP e riceve la risposta.
4. La risposta viene letta come JSON; JavaScript può usare i dati e, se previsto, aggiornare il DOM.

**AJAX** (*Asynchronous JavaScript and XML*) è un nome storico per tecniche che consentono richieste asincrone e aggiornamenti parziali di una pagina. Il termine non indica un protocollo di trasporto differente: il punto centrale rimane lo scambio di dati tramite HTTP e API.

**Attenzione:** la stessa API del server potrebbe essere usata da un'applicazione mobile o da un programma Python. HTTP è l'interfaccia comune; il browser non è un intermediario obbligatorio per tutti i client.

## 5. Le API non danno automaticamente il permesso di fare tutto

Un endpoint è una funzionalità esposta; è il server che deve controllare **autenticazione** e **autorizzazione**. Nascondere un pulsante nella pagina non impedisce a un programma di inviare direttamente una richiesta HTTP. Le regole applicative vanno verificate **lato server**, indipendentemente dall'interfaccia mostrata.

Esempio: `/api/miei-prestiti` dovrebbe restituire soltanto i dati della persona autorizzata. Non basta affidarsi a un numero ID scelto dal browser; il backend deve verificare l'identità e le autorizzazioni.

## 6. Verifica

1. Un'API è necessariamente un sito Web? *No.*
2. Qual è la differenza fra `fetch` e `/api/libri`? *Il primo è un'API del browser; il secondo è un endpoint esposto dal server.*
3. JSON richiede l'utilizzo di Node.js sul server? *No.*
4. È il browser a decidere se uno studente può vedere il prestito di un altro? *Il controllo definitivo deve essere lato server.*

**Passaggio:** che cosa può esserci dietro `/api/libri`? Un programma scritto con tecnologie molto diverse. L'architettura prescinde dal linguaggio.

---

# Lezione 11 — Il server non è un linguaggio: diverse tecnologie, stessa funzione

**Domanda iniziale:** *«Per costruire un server Web bisogna usare Node.js? E un server deve necessariamente restituire una pagina HTML?»*

## 1. Prima la responsabilità, poi la tecnologia

Un **server** è, nel nostro ragionamento, un programma che offre un servizio e risponde alle richieste di altri programmi. La parola può designare per estensione anche il computer che lo esegue. Il suo ruolo **non è legato a un linguaggio di programmazione**: un servizio HTTP può essere scritto in Python, JavaScript/TypeScript, Java, C#, PHP, Go, Rust e molti altri linguaggi, oppure essere gestito da un software server già pronto.

La scelta tecnologica riguarda sviluppo, manutenzione, prestazioni, competenze del team e tipo di servizio. Non cambia i concetti di base: un client formula una richiesta conforme a un protocollo, un server la riceve e produce una risposta.

## 2. Server Web, server applicativo e backend

- **Server Web:** programma che gestisce richieste HTTP, può servire file statici, gestire connessioni sicure o inoltrare richieste. Esempi: **Nginx** e **Apache HTTP Server**.
- **Server applicativo / backend:** programma che contiene la logica dell'applicazione, per esempio controllo dei prestiti, autorizzazioni e calcolo della disponibilità dei libri. Può esporre direttamente HTTP o essere raggiunto tramite un server Web/reverse proxy.
- **Database server:** programma specializzato nella gestione persistente dei dati, per esempio **PostgreSQL** o **MySQL**. Non è un server Web e non dovrebbe essere esposto a tutti soltanto perché altri servizi dell'applicazione sono pubblici.

**Backend** è il nome collettivo delle componenti non visibili all'utente che elaborano richieste, applicano regole e accedono ai dati. **Frontend** è la parte con cui l'utente interagisce, frequentemente eseguita nel browser. Un server Web può svolgere anche attività applicative; la separazione dei ruoli è architetturale, non una legge che obbliga sempre a processi distinti.

## 3. Alcuni modi per realizzare lo stesso endpoint

| Linguaggio / ambiente | Esempi di strumenti | Significato dell’esempio |
| --- | --- | --- |
| **Python** | Flask, Django, FastAPI; modulo `http.server` per demo | Un programma Python può ricevere richieste e rispondere via HTTP |
| **JavaScript / TypeScript** | Node.js con modulo `http` o framework Express; altri runtime come Deno e Bun | JavaScript può funzionare anche fuori dal browser, in un ambiente server |
| **Java** | Spring Boot, Servlet container | Un server applicativo può essere scritto in Java |
| **C# / .NET** | ASP.NET Core | Un servizio HTTP può usare l'ecosistema .NET |
| **PHP** | PHP con server Web e framework come Laravel | Il server può produrre HTML o dati tramite codice eseguito lato server |
| **Go** | libreria standard `net/http` | Lo stesso ruolo applicativo si implementa anche con linguaggi compilati |
| **Software già pronti** | Nginx, Apache HTTP Server | Si possono servire file e inoltrare richieste senza inventare tutto da zero |

I diversi strumenti realizzano lo stesso ruolo generale. La nozione centrale è che **Web e server HTTP non dipendono da Node.js né da uno specifico linguaggio di programmazione**.

## 4. Due esempi minimi di server HTTP ad alto livello

Un server HTTP può essere avviato anche dalla libreria standard di Python, senza scrivere manualmente la struttura delle risposte:

```bash
python -m http.server 8000 --bind 127.0.0.1
```

Il comando, eseguito in una cartella di materiale dimostrativo, avvia un server locale che può servire file su `http://127.0.0.1:8000`. Diversamente dal nostro socket scritto a mano, la libreria implementa la gestione essenziale di HTTP. **Attenzione:** è un server per dimostrazioni e sviluppo, non per pubblicare un sito su Internet senza ulteriori configurazioni e misure.

Un secondo esempio usa **Node.js**, un ambiente che permette di eseguire JavaScript fuori dal browser:

```javascript
const http = require("node:http");
http.createServer((richiesta, risposta) => {
  risposta.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
  risposta.end("Risposta dal server");
}).listen(3000, "127.0.0.1");
```

Il servizio risulta raggiungibile all’indirizzo `http://127.0.0.1:3000`. Come nel caso Python, il meccanismo è **server in ascolto → richiesta del client → risposta HTTP**. Il linguaggio e la libreria nascondono molti dettagli del formato dei byte.

## 5. Che cosa cambia fra server statico e dinamico?

**Statico:** per `GET /orari.html`, il server legge un file pronto e lo invia. È un caso molto utile: dimostra che non serve una sofisticata applicazione per pubblicare contenuti Web.

**Dinamico:** per `GET /api/disponibilita?libro=15`, il server esegue un ragionamento: consulta dati, controlla permessi e genera una risposta che può variare. Il contenuto può essere HTML o JSON. La distinzione «statico/dinamico» riguarda **come viene prodotta la risposta**, non il linguaggio di programmazione.

**Esempio intuitivo:** sul sito della scuola, il regolamento è un documento statico; la lista dei prestiti attualmente disponibili deriva da dati che cambiano e richiede logica applicativa.

## 6. Da qui alle architetture

Dopo aver visto un client che chiede qualcosa e un server che risponde, possiamo porre una domanda più generale: **chi deve svolgere il calcolo?** E **dove conserviamo i dati?** Una risposta non deve necessariamente coinvolgere un unico programma o una sola macchina. Può emergere una struttura con presentazione, logica di business e gestione dei dati.

## 7. Verifica

1. Node.js è indispensabile per creare un server HTTP? *No.*
2. La stessa Web API può essere implementata in Java e Python? *Sì, purché rispetti il contratto con i client.*
3. Un server Web e un database svolgono necessariamente lo stesso ruolo? *No.*
4. Un contenuto generato dinamicamente deve essere per forza HTML? *No, può essere JSON e altro.*

---

# Lezione 12 — Client-server, sistemi distribuiti e architettura a livelli

**Domanda iniziale:** *«Se il browser mostra i dati, il server applica le regole e un archivio conserva le informazioni, stiamo descrivendo tre programmi, tre computer o tre responsabilità?»*

## 1. Perché dividere il lavoro?

Consideriamo un servizio che gestisce i prestiti della biblioteca. Se tutta l'applicazione, tutti i libri e tutte le regole fossero installati autonomamente su ogni computer della scuola, sarebbe difficile mantenere coerenti le informazioni. Se ogni programma aggiorna una sua copia dell'archivio, quale sarebbe quella giusta?

La risposta comune è distribuire i compiti: alcuni componenti si occupano di **interazione**, altri di **regole e controlli**, altri di **archiviazione e accesso ai dati**. La distribuzione può essere logica, fra programmi diversi o su computer differenti.

## 2. Modello client-server

Il **client** chiede un servizio; il **server** lo rende disponibile e risponde. I ruoli riguardano una comunicazione, non per forza l'identità permanente di una macchina. Un programma può essere client rispetto a un database e server rispetto a un browser.

```text
Browser (client) ---- richiesta HTTP ----> Servizio (server)
Browser (client) <--- risposta HTTP ----- Servizio (server)
```

**Vantaggi:** dati e regole possono essere gestiti centralmente; aggiornare una parte del sistema non richiede necessariamente di sostituire tutti i client; è più semplice applicare controlli coerenti. **Criticità:** il servizio centrale può essere un punto di guasto o congestione e richiede corretta progettazione di affidabilità e sicurezza.

L'architettura **peer-to-peer (P2P, «da pari a pari»)** è diversa: i nodi possono fornire e consumare risorse fra loro, senza richiedere sempre un unico server centrale per tutte le funzioni. Non significa che ogni protocollo P2P sia necessariamente privo di qualunque componente centrale: dipende dal sistema.

## 3. Che cos'è un sistema distribuito?

Un **sistema distribuito** è composto da più componenti che collaborano, eseguendo in ambienti computazionali distinti e comunicando per fornire un servizio complessivo. Si può parlare di **più processi o nodi che cooperano**. La separazione fa emergere problemi ulteriori: tempi di rete, guasti parziali, coordinamento, autenticazione tra servizi e coerenza dei dati.

Un browser sul PC e il server su un altro computer formano già una semplice applicazione distribuita. Quando aggiungiamo un database remoto e altri servizi, la struttura diventa più articolata.

**Attenzione:** non basta avere tre classi in un programma per avere un sistema distribuito. La distribuzione richiede componenti che dialogano attraverso confini di esecuzione, tipicamente di processo o di rete.

## 4. Le tre responsabilità logiche: presentation, business logic, data

### Presentation layer (livello di presentazione)

È la parte responsabile della **rappresentazione delle informazioni e dell'interazione** con l'utente. In un'applicazione Web, comprende l'interfaccia HTML/CSS e il comportamento JavaScript nel browser. Può anche comprendere la preparazione dell'interfaccia svolta da un server: ciò che conta è la responsabilità, non il luogo in cui gira tutto il codice.

### Business logic layer (livello di logica applicativa)

È la parte che implementa **le regole del problema**: un libro non può essere prestato se è già impegnato; un utente non può prenotare più di un certo numero di volumi; il sistema verifica permessi e condizioni prima di accettare un'operazione. Il termine *business* non significa soltanto «commercio»: indica le regole del dominio applicativo, anche per una scuola.

### Data layer (livello dei dati)

Gestisce **memorizzazione, recupero e aggiornamento** delle informazioni, oltre alla comunicazione con il sistema di persistenza. Nel caso più comune utilizza un database, ma il concetto di livello dati non obbliga di per sé a usare una specifica tecnologia.

```text
                 PRESENTATION
          (interfaccia e interazione)
                       │
                       ▼
                  BUSINESS LOGIC
            (regole, controlli, calcoli)
                       │
                       ▼
                       DATA
            (accesso e gestione dei dati)
```

**Esempio completo — prenotazione di un libro:**

1. **Presentazione:** l'utente clicca «Prenota» sul sito.
2. **Logica:** controlla se è autenticato, se il libro è disponibile, se non ha superato il limite di prestiti.
3. **Dati:** legge disponibilità e prenotazioni già presenti, registra il nuovo prestito in modo coerente.
4. **Logica:** interpreta il risultato e produce un esito («Prenotazione riuscita»).
5. **Presentazione:** mostra il messaggio.

In questo modo lo studente vede che la divisione in livelli non è semplicemente una tabella: ogni responsabilità risponde a una domanda diversa.

## 5. Layer e tier: due domande diverse

**Layer** significa *strato/livello logico*: **quale responsabilità** ha una parte del software? **Tier** significa *livello o zona di distribuzione/esecuzione*: **dove e in quale ambiente** viene eseguito un componente rispetto agli altri?

In un'**architettura three-layer** distinguiamo per esempio presentazione, logica e dati, anche se l'intera applicazione è un solo programma. In una **architettura three-tier** parliamo di componenti o ambienti di distribuzione separati, spesso client, server applicativo e database. Nella letteratura pratica, i due termini vengono a volte usati con minore rigore: in classe è utile dichiarare sempre se stiamo parlando di **responsabilità** o **collocazione**.

Non esiste una corrispondenza obbligatoria di una macchina per layer. E non tutti i tre tier richiedono necessariamente tre computer fisici: macchine virtuali e container possono far funzionare componenti separati sulla stessa macchina ospitante. Torneremo su questo tema con Docker nella lezione 14.

## 6. Due tier e tre tier: un confronto utile

**Esempio a due tier:** un'applicazione desktop installata sui computer della biblioteca offre l'interfaccia e svolge parte della logica, collegandosi direttamente al database centrale.

```text
[Programma desktop: interfaccia + parte della logica] <--> [Database]
```

**Esempio a tre tier:** un browser parla con un server applicativo che applica le regole, il quale parla con il database.

```text
[Browser] <--> [Backend / server applicativo] <--> [Database]
```

La seconda configurazione rende più facile centralizzare regole e controlli di accesso, e impedire che ogni browser debba conoscere le credenziali del database. Non garantisce da sola scalabilità o sicurezza: i dettagli dipendono dall'implementazione.

## 7. Thin client e fat client

**Thin client**, «client leggero»: il client svolge soprattutto presentazione e interazione, mentre molte regole e operazioni vengono eseguite sul server. **Fat client** (anche *thick client*), «client ricco»: il client esegue una parte significativa di logica e gestisce più funzionalità in locale.

Gli esempi non coincidono rigidamente con «browser = thin» e «programma installato = fat». Una moderna applicazione Web può eseguire molta logica JavaScript nel browser e quindi avere un frontend *ricco*; un programma installato può invece essere soprattutto un terminale sottile.

| Scelta | Possibile vantaggio | Possibile criticità |
| --- | --- | --- |
| Thin client | Aggiornamenti e regole centralizzati | Dipendenza maggiore dal servizio remoto |
| Fat client | Elaborazioni locali, talvolta utilizzo offline | Aggiornamenti e coerenza più complessi sui client |

## 8. Scalare un'applicazione

**Scalabilità** è la capacità di sostenere carichi crescenti. Possiamo aumentare le risorse disponibili a un componente (*scaling verticale*) oppure aggiungere più istanze di un servizio (*scaling orizzontale*). In entrambi i casi la progettazione dei dati e delle sessioni conta: non basta moltiplicare i server Web se tutti dipendono da un database incapace di gestire il carico.

## 9. Verifica

1. Un programma può essere server e client allo stesso tempo, rispetto a interlocutori diversi? *Sì.*
2. Layer e tier sono sinonimi esatti? *No: responsabilità logiche contro collocazione/distribuzione.*
3. Un browser è sempre un thin client? *No: può eseguire molta logica locale.*
4. Perché il browser non dovrebbe collegarsi direttamente al database di produzione? *È preferibile mediare accesso, regole, autorizzazioni e credenziali tramite un backend.*

**Passaggio alla lezione 13:** abbiamo nominato molte volte il database. Ma perché non conservare semplicemente i dati in un file?

---

# Lezione 13 — Persistenza: perché i dati non possono vivere soltanto nella memoria del programma

**Domanda iniziale:** *«Se chiudo il server della biblioteca e lo riavvio domani, come fa a ricordare tutti i prestiti?»*

## 1. Il problema della memoria temporanea

Quando un programma viene eseguito usa la **RAM** (*Random Access Memory*, memoria ad accesso casuale) per variabili, oggetti e dati temporanei. Se un prestito esiste soltanto in una lista in RAM, normalmente scompare quando il processo termina o si riavvia. Alcune informazioni devono sopravvivere: utenti, prenotazioni, ordini, pagamenti, voti.

Chiamiamo **persistenza dei dati** la capacità di conservarli oltre la vita di una singola esecuzione del programma. Un SSD, un disco o un servizio di archiviazione possono conservare dati in modo durevole. Ma **salvare** e **gestire correttamente** non sono sinonimi: quando più utenti modificano gli stessi dati occorrono regole aggiuntive.

## 2. Perché non salvare tutto in un file `.txt`?

In effetti **si può**. Il sistema potrebbe creare `prestiti.txt`:

```text
Studente;Libro;Data restituzione
Ada;Libro 15;2026-11-20
Marco;Libro 8;2026-11-18
```

Oppure `prestiti.json`:

```json
[
  {"studente": "Ada", "libro": 15, "restituito": false},
  {"studente": "Marco", "libro": 8, "restituito": false}
]
```

Il primo file è testo separato da delimitatori; il secondo è JSON, cioè testo strutturato. In un piccolo esercizio o per un elenco che cambia raramente possono andare benissimo. **I file non diventano inutili con l’introduzione dei database**: archivi, fotografie, configurazioni, esportazioni e documenti continuano a essere conservati in file.

### Un breve accenno alle estensioni

L'**estensione** è la parte del nome dopo l'ultimo punto e normalmente segnala una convenzione di formato o utilizzo. Non modifica magicamente il contenuto del file.

| Estensione | Uso comune | Precisazione |
| --- | --- | --- |
| `.txt` | Testo semplice | Non impone una struttura uniforme |
| `.csv` | *Comma-Separated Values*, dati tabellari delimitati | I delimitatori possono variare secondo il contesto |
| `.json` | Dati strutturati in formato JSON | Rimane un file testuale |
| `.md` | **Markdown**, testo con marcatori per titoli, elenchi, codice | È un formato di documento, non un DB |
| `.html` | Pagina o documento HTML | Contenuto di marcatura per il browser |
| `.db` / `.sqlite` | Spesso file di una base dati SQLite | Il nome non garantisce il tipo reale: conta il formato |

Rinominare `prestiti.txt` in `prestiti.json` **non converte** i dati in JSON: per farlo bisogna trasformarne la struttura. Un software deve saper leggere il formato, non semplicemente riconoscere l'estensione.

## 3. Quando i file cominciano a complicarsi

Supponiamo che l'archivio dei prestiti sia un unico file JSON. Due addetti aprono quasi contemporaneamente il registro e leggono che il libro 15 è disponibile. Entrambi lo prenotano. Il primo salva; il secondo salva la propria versione, magari cancellando inavvertitamente il cambiamento del primo. È un problema di **concorrenza** (*concurrency*): più operazioni cercano di gestire dati condivisi nello stesso intervallo di tempo.

Altri problemi emergono gradualmente:

- **Ricerca:** per trovare tutti i prestiti scaduti si può finire a leggere ogni volta l'intero file.
- **Coerenza:** se uno studente viene eliminato, che cosa succede ai suoi prestiti e ai riferimenti al suo identificativo?
- **Aggiornamenti parziali:** se manca corrente durante il salvataggio, in che stato resta il file?
- **Autorizzazioni:** come permettere al bibliotecario di aggiornare i prestiti e a uno studente di vedere soltanto i propri?
- **Concorrenza e recupero:** come gestire decine di operazioni e come ripristinare dati dopo un errore?

Tutti questi problemi **possono** essere affrontati con codice applicativo e file, ma il costo e la complessità crescono. Qui nasce il ruolo dei software specializzati per la gestione dei dati.

## 4. Database e DBMS: dati e sistema di gestione

Un **database** è una raccolta organizzata di dati persistenti. Il **DBMS**, *Database Management System* (sistema di gestione di basi di dati), è il software che permette di crearli, consultarli, modificarli e gestirli in modo controllato.

Il DBMS offre, secondo la tecnologia e la configurazione, meccanismi per:

- organizzare i dati e ricercarli efficientemente;
- gestire accessi concorrenti;
- applicare vincoli di integrità;
- fornire transazioni;
- verificare autorizzazioni;
- mantenere indici, log di recupero, backup e ripristino.

**Attenzione:** un database non è semplicemente «un file più grosso». Per esempio **SQLite** è un DBMS incorporato direttamente nel programma (*embedded*), normalmente con un file su disco, **senza un processo server database separato**. **PostgreSQL** e **MySQL** sono esempi di DBMS client-server: un processo dedicato riceve e gestisce richieste da altri programmi.

Questa distinzione è perfetta per il tema «fisico vs logico»: il livello dati può utilizzare SQLite sullo stesso host dell'applicazione oppure un database remoto. Cambia la distribuzione, non il bisogno di una strategia di persistenza.

## 5. Un database relazionale, molto brevemente

Un database **relazionale** organizza i dati in tabelle con righe e colonne, collegate mediante chiavi e vincoli. Esempio:

**Tabella Libri**

| id_libro | titolo | autore |
| --- | --- | --- |
| 15 | Le città invisibili | Italo Calvino |
| 8 | Il barone rampante | Italo Calvino |

**Tabella Prestiti**

| id_prestito | id_libro | id_studente | restituito |
| --- | --- | --- | --- |
| 501 | 15 | 32 | no |

`id_libro` nella tabella Prestiti fa riferimento al libro corrispondente. Una **chiave primaria** identifica una riga; una **chiave esterna** collega dati di tabelle diverse. Un vincolo può evitare la registrazione di un prestito riferito a un libro inesistente.

**SQL** (*Structured Query Language*) è un linguaggio largamente usato per interrogare e modificare database relazionali. Una semplice interrogazione SQL è:

```sql
SELECT titolo FROM Libri WHERE id_libro = 15;
```

Il DBMS restituisce il titolo richiesto. Una base dati può naturalmente essere organizzata anche secondo modelli non relazionali: per esempio documenti e strutture chiave-valore; SQL non è l’unico modello possibile di gestione dei dati.

## 6. Transazioni: un'operazione deve riuscire tutta oppure non risultare fatta

Immagina un trasferimento di 10 crediti tra due account. Bisogna sottrarre 10 al primo e aggiungerne 10 al secondo. Se l'applicazione si interrompe dopo la sottrazione, il risultato è incoerente. Una **transazione** permette di raggruppare più modifiche in una singola unità logica: oppure vengono confermate tutte, oppure vengono annullate secondo le regole del DBMS.

Quattro proprietà classiche sono riassunte dall'acronimo **ACID**:

- **Atomicity** (*atomicità*): l'operazione viene considerata un tutto indivisibile.
- **Consistency** (*consistenza*): le operazioni rispettano i vincoli di integrità definiti.
- **Isolation** (*isolamento*): le transazioni concorrenti non devono interferire in modi vietati dal livello di isolamento scelto.
- **Durability** (*durabilità*): dopo la conferma, i dati devono resistere secondo le garanzie di persistenza del sistema.

Le transazioni non eliminano ogni possibile errore dell'applicazione e non sostituiscono i backup: affrontano un insieme ben preciso di problemi di coerenza.

## 7. File, database e backup

Un database può utilizzare file al suo interno: non c'è opposizione fra «database» e «file», come se uno escludesse l'altro. La distinzione centrale è che un **DBMS gestisce strutture, accessi e proprietà operative**. I file rimangono essenziali per documenti, immagini, contenuti statici, configurazioni ed esportazioni.

Un **backup** è una copia utilizzabile per recuperare informazioni dopo cancellazioni, errori o guasti. Non basta poter «salvare su disco»: bisogna anche prevedere il recupero, la disponibilità, i permessi e la protezione dei dati memorizzati.

## 8. Verifica

1. Perché una lista Python in RAM non basta per il registro prestiti? *Scompare quando il processo termina, salvo persistenza esterna.*
2. Posso fare un'applicazione corretta con file JSON? *Sì, per casi semplici; ma concorrenza, ricerche e integrità richiedono soluzioni aggiuntive.*
3. Qual è la differenza fra database e DBMS? *Dati organizzati e software che li gestisce.*
4. SQLite richiede sempre un server separato? *No, è in genere incorporato nel programma e usa un file di database.*
5. A cosa servono le transazioni? *A gestire operazioni come unità coerenti, anche in presenza di errori o concorrenza.*

**Passaggio:** abbiamo tre responsabilità logiche. Su quali macchine girano? Possiamo eseguire tre componenti su un solo server fisico?

---

# Lezione 14 — Logico e fisico: processi, macchine virtuali, container e cloud

**Domanda iniziale:** *«Se frontend, backend e database sono in tre container Docker sullo stesso computer, abbiamo tre livelli oppure tre macchine?»*

## 1. Tre modi diversi di dividere un sistema

Il punto più importante di questa lezione è non usare indistintamente le parole «separare», «livello» e «server».

**Separazione logica:** dividiamo il software in responsabilità, per esempio presentazione, logica applicativa e dati. È una scelta di progettazione.

**Separazione dei processi e degli ambienti di esecuzione:** facciamo girare componenti in processi diversi, magari dentro container separati. È una scelta di organizzazione ed esecuzione del software.

**Separazione fisica:** collochiamo componenti su **computer fisici differenti**, con processori, memoria e dispositivi fisici distinti. È una scelta infrastrutturale.

Queste tre separazioni possono coesistere, ma **non sono equivalenti**.

## 2. Un caso, quattro configurazioni

**Caso A — Tutto in un solo processo.** Un piccolo programma contiene interfaccia, regole e accesso ai dati; in un'app desktop può essere possibile. Possiamo comunque identificare tre **layer logici** anche se non ci sono tre processi.

**Caso B — Più processi sullo stesso computer.** Il server Web, il backend e un DBMS sono processi distinti sullo stesso sistema operativo. Ci sono confini tra processi e comunicazione locale, ma una sola macchina fisica.

**Caso C — Tre container Docker sulla stessa macchina.** Ogni componente gira in un container distinto. La separazione è di **ambienti di esecuzione/container**, non di host fisici.

**Caso D — Tre macchine (o host distinti).** Frontend, backend e database vengono distribuiti su host differenti. La separazione fisica aumenta, con nuove possibilità ma anche nuovi costi e dipendenze di rete.

```text
A) Un processo                B) Processi distinti, stesso host
[UI + Logica + Dati]          [Web] [Backend] [DBMS]

C) Tre container, stesso host fisico
+------------------- HOST FISICO -------------------+
| [Container Web]  [Container Backend] [Container DB]|
|     processi isolati e rete virtuale/container     |
+---------------------------------------------------+

D) Tre host fisici
[Host Web]   <-->   [Host Backend]   <-->   [Host Database]
```

## 3. Che cos'è Docker?

**Docker** è una piattaforma diffusa per costruire, distribuire ed eseguire applicazioni in **container**. Un **container** impacchetta un'applicazione con le dipendenze necessarie e ne esegue i processi in un ambiente isolato secondo i meccanismi del sistema ospitante. Una **image** (immagine container) è un modello da cui si avvia un container; un container è un'istanza in esecuzione.

Un container **non è automaticamente una macchina virtuale completa**. Su Linux, i container normalmente condividono il **kernel** del sistema ospitante e utilizzano forme di isolamento offerte dal sistema operativo. Su altri sistemi, il motore dei container può appoggiarsi a una macchina virtuale: rimane corretta l'idea di isolamento dell'ambiente applicativo, non quella di una macchina fisica per container.

Un esempio plausibile per la biblioteca:

- `web`: software che presenta l'interfaccia o distribuisce risorse statiche;
- `backend`: programma che gestisce la logica dei prestiti e l'API;
- `db`: DBMS, per esempio PostgreSQL, con il volume di dati persistenti.

Tutti e tre possono funzionare sulla **stessa macchina fisica** e comunicare tramite una rete virtuale gestita dal motore container. Il browser dell'utente si collega al servizio esposto; il database non deve essere raggiungibile direttamente da Internet.

## 4. Sono «tre tier» se sono sullo stesso host?

Dipende da **come definiamo «tier» nel contesto**. Nella pratica si parla spesso di *three-tier architecture* anche quando la presentazione, l'applicazione e i dati sono distribuiti in componenti o ambienti separati sullo stesso host. Questa denominazione descrive una separazione delle **zone di esecuzione e delle responsabilità**, non prova che esistano tre computer fisici.

Una formulazione rigorosa è:

> «Abbiamo tre responsabilità logiche e tre componenti eseguiti separatamente. Se usiamo tre container Docker su un solo computer, **non abbiamo tre macchine fisiche**. Possiamo parlare di una distribuzione a tre componenti/tier applicativi, ma la separazione fisica degli host è una sola.»

Questo evita entrambi gli errori: pensare che three-tier richieda sempre tre server fisici; pensare che tre container siano automaticamente tre computer indipendenti.

## 5. Quali vantaggi e limiti porta questa scelta?

**Vantaggi dei container sullo stesso host:** dipendenze organizzate, avvio e aggiornamento dei componenti più separati, ambiente riproducibile, possibilità di cambiare un componente senza necessariamente modificare gli altri, distribuzione facilitata.

**Limiti:** CPU, RAM, disco e guasto fisico dell'host rimangono **condivisi**. Se l'unico host si ferma, si fermano anche i tre componenti. L'isolamento dei container non equivale a separazione fisica e non è una garanzia assoluta di sicurezza. Sono ancora necessari aggiornamenti, permessi, configurazione di rete e backup.

**Persistenza in Docker:** se un DBMS scrive soltanto nello spazio effimero del container, eliminare e ricreare quel container può comportare la perdita dei dati. Per dati che devono sopravvivere è normale usare **volumi persistenti** o altri sistemi di archiviazione adeguati. Questa osservazione collega perfettamente la lezione sui database alla scelta infrastrutturale.

## 6. Una macchina virtuale è diversa da un container

Una **VM**, *Virtual Machine* o macchina virtuale, simula un ambiente di macchina completo gestito da un **hypervisor** (software di virtualizzazione) e normalmente esegue un proprio sistema operativo guest. Un container tende invece a isolare applicazioni e processi, normalmente condividendo il kernel dell'ambiente che lo ospita.

In entrambi i casi, **tre VM sullo stesso server** e **tre container sullo stesso server** non costituiscono tre host fisici indipendenti.

## 7. E il cloud?

Il **cloud computing** consiste nell'utilizzare risorse informatiche e servizi forniti mediante infrastrutture gestite e accessibili in rete, con capacità di provisioning e gestione flessibili secondo il modello di servizio. Un'applicazione nel cloud continua ad avere processi, rete, archiviazione e macchine fisiche da qualche parte: il cloud **non elimina l'hardware**, ne cambia il modo in cui le risorse sono fornite e amministrate.

Si possono utilizzare container su una macchina del laboratorio, su un server aziendale o su infrastruttura cloud. **Docker e cloud non sono sinonimi:** Docker è uno strumento di esecuzione e distribuzione; il cloud è un modello di erogazione delle risorse. Approfondiremo SaaS, PaaS e IaaS nella prossima lezione.

## 8. Analisi comparata delle configurazioni

La stessa applicazione gestisce **presentazione**, **logica applicativa** e **accesso ai dati**. Si considerino quattro scelte di distribuzione:

| Configurazione | Separazione logica | Processi o ambienti distinti | Host fisici indipendenti |
| --- | --- | --- | --- |
| A — Una singola applicazione desktop | Possibile | Un processo principale | Uno |
| B — Web, backend e DBMS come processi distinti sullo stesso computer | Sì | Sì | Uno |
| C — Web, backend e DBMS in tre container Docker sullo stesso computer | Sì | Sì, tre container | Uno |
| D — Web, backend e DBMS su tre computer differenti | Sì | Sì | Tre |

**Problema 1 — Guasto.** Quali configurazioni possono perdere contemporaneamente tutti i componenti a causa del guasto di un singolo host? *A, B e C. In D il guasto di un host può comunque interrompere l'intero servizio, ma gli host fisici non sono tutti lo stesso computer.*

**Problema 2 — Persistenza.** In C si elimina il container che ospita il database. La presenza di tre container garantisce che i dati sopravvivano? *No: occorre archiviazione persistente, per esempio volumi correttamente gestiti.*

**Problema 3 — Layer e tier.** La distribuzione C modifica necessariamente la separazione tra presentation, business logic e data? *No: sono responsabilità logiche. Cambia l'organizzazione dei componenti in esecuzione.*

**Problema 4 — Isolamento.** Tre container sullo stesso computer costituiscono tre barriere di sicurezza equivalenti a tre host fisici distinti? *No: condividono risorse, kernel o infrastruttura sottostante e dipendono da un unico host fisico.*

### Verifica

1. Tre container significano tre macchine fisiche? *No.*
2. Una VM è identica a un container? *No: cambia il modello di virtualizzazione e isolamento.*
3. Un sistema a tre livelli logici richiede tre server fisici? *No.*
4. Il cloud elimina il bisogno di infrastruttura fisica? *No: ne modifica il modello di gestione.*

---

# Lezione 15 — Intranet, extranet, Web 2.0 e cloud computing

**Domanda iniziale:** *«Lo stesso servizio Web deve essere accessibile a chiunque oppure può essere riservato a un'organizzazione o ai suoi partner?»*

## 1. Internet, intranet ed extranet: che cosa cambia?

Una **intranet** è un insieme di servizi e risorse di rete destinati agli utenti interni di un'organizzazione. Può utilizzare esattamente tecnologie Web come browser, HTTP/HTTPS, server e API, ma l'accesso è riservato. La parola non richiede un'infrastruttura fisica del tutto separata da Internet: l'accesso può essere realizzato tramite reti private, sistemi di autenticazione o connessioni protette.

Una **extranet** estende in modo **controllato** l'accesso a determinate risorse anche a soggetti esterni autorizzati, per esempio fornitori, clienti o consulenti. Non significa «mettere tutta la intranet su Internet»: l'organizzazione espone solo ciò che è necessario.

**Esempio unico:**

- Sito pubblico della scuola: presenta orari, notizie e contatti.
- Intranet: permette a dipendenti autorizzati di consultare procedure e documenti interni.
- Extranet: permette a un fornitore esterno di consultare gli ordini che lo riguardano, senza accedere al resto dell'organizzazione.

Collega immediatamente la distinzione alla prima parte del modulo: firewall, autenticazione, autorizzazioni, DMZ e segmentazione concorrono a limitare **chi raggiunge quali risorse**.

## 2. Web 2.0: partecipazione degli utenti, non un nuovo protocollo

**Web 2.0** è un'espressione storica che descrive l'evoluzione del Web verso contenuti creati dagli utenti, servizi collaborativi e maggiore interattività. Blog, wiki, social network e piattaforme collaborative sono esempi di servizi nei quali gli utenti non si limitano a leggere pagine pubblicate da pochi autori.

**Non** è il successore tecnico di HTTP/1.1, HTTP/2 o HTTP/3. Non esiste un «protocollo Web 2.0» da sostituire a HTTP. È un'etichetta sociotecnologica legata agli usi e ai modelli di partecipazione.

Questo tema consente una riflessione critica: se milioni di utenti producono dati, aumentano i problemi di moderazione, tutela della privacy, qualità delle informazioni e conservazione dei contenuti. È un buon ponte con le competenze di cittadinanza digitale.

## 3. Il problema di gestire tutto in proprio

Un'organizzazione che ospita autonomamente un servizio deve procurarsi macchine, spazio disco, connettività, personale, aggiornamenti, continuità elettrica e backup. Per alcune attività è una scelta ragionevole; per altre conviene utilizzare risorse erogate da un fornitore.

**Cloud computing** indica un modello di accesso a risorse informatiche configurabili e servizi, spesso su richiesta e con capacità di adattamento al carico. Non è semplicemente «i miei file sono su Internet» e non coincide con «uso un sito Web»: un servizio può essere cloud anche quando non è direttamente un sito aperto nel browser.

## 4. Tre modelli di servizio: IaaS, PaaS e SaaS

| Modello | Acronimo e definizione | Chi si occupa di cosa? | Esempio concettuale |
| --- | --- | --- | --- |
| **IaaS** | *Infrastructure as a Service*, infrastruttura come servizio | Il fornitore offre capacità di calcolo, rete, storage; l'utente gestisce gran parte del software | Si affitta una macchina virtuale e si installa il proprio server |
| **PaaS** | *Platform as a Service*, piattaforma come servizio | Il fornitore gestisce buona parte dell'ambiente di esecuzione; l'utente distribuisce il programma | Si carica un'applicazione senza amministrare il sistema operativo sottostante |
| **SaaS** | *Software as a Service*, software come servizio | Il fornitore gestisce l'applicazione utilizzata dal cliente | Si utilizza un servizio di posta o collaborazione già pronto |

La distinzione non stabilisce chi sia automaticamente responsabile di tutta la sicurezza: esiste una **responsabilità condivisa** che cambia a seconda del contratto e del servizio. L'utente continua, per esempio, a gestire credenziali, permessi e corretto uso dei dati.

## 5. Cloud, distribuzione e persistenza

Un database nel cloud resta un sistema che organizza dati su storage fisico. Un'applicazione distribuita può essere eseguita in cloud, localmente o in un ambiente ibrido. I container possono essere usati in ognuno di questi contesti.

**Vantaggi possibili:** disponibilità rapida di risorse, scalabilità, servizi gestiti, riduzione dell'onere di mantenere hardware proprio. **Limiti o criticità:** dipendenza dal fornitore, costi ricorrenti, gestione dei dati personali, vincoli contrattuali, disponibilità della connettività e necessità di progettare ripristino e sicurezza.

## 6. Verifica

1. Una intranet può utilizzare un browser? *Sì.*
2. Un'extranet concede l'intera rete interna ai fornitori? *No, solo risorse autorizzate.*
3. Web 2.0 è una versione di HTTP? *No.*
4. In IaaS l'utente deve di solito amministrare più parti del software rispetto a SaaS? *Sì.*
5. Un'applicazione cloud può conservare dati in un DBMS tradizionale? *Sì.*

**Passaggio:** abbiamo progettato comunicazioni, controlli e servizi. Resta un altro problema: i dati possono attraversare reti che non controlliamo. Come proteggiamo **il loro contenuto**?

---

# Lezione 16 — Proteggere il contenuto: crittografia, hash, certificati e HTTPS

**Domanda iniziale:** *«Abbiamo controllato chi può parlare con chi. E se qualcuno riuscisse comunque a osservare il traffico su una rete che non controlliamo?»*

## 1. Le barriere di rete non proteggono da sole il significato dei dati

Un firewall può stabilire se una comunicazione è permessa; una VLAN separa gruppi di dispositivi; un proxy intermedia richieste. Queste misure **non sostituiscono la protezione dei contenuti**. Se i dati viaggiano in chiaro, un soggetto in grado di intercettare il traffico può, in certe condizioni, osservarne i contenuti. Inoltre, la rete da un browser a un server può attraversare infrastrutture di più soggetti.

La **crittografia** studia tecniche che permettono di proteggere informazioni mediante trasformazioni basate su algoritmi e, normalmente, su **chiavi**. Un algoritmo moderno dovrebbe poter essere pubblico: la sicurezza non dovrebbe dipendere dal fatto che l'aggressore ignori come funziona, ma dalla protezione della chiave e dalla robustezza del sistema.

## 2. Testo in chiaro, testo cifrato, chiave

**Testo in chiaro** (*plaintext*) è il contenuto prima della protezione; **testo cifrato** (*ciphertext*) è il risultato della cifratura. Una **chiave crittografica** è un valore utilizzato dall'algoritmo per trasformare o recuperare il contenuto.

```text
MESSAGGIO LEGGIBILE
      │
      ▼  cifratura + chiave
MESSAGGIO CIFRATO
      │
      ▼  decifratura + chiave appropriata
MESSAGGIO LEGGIBILE
```

Un esempio didattico come lo spostamento delle lettere dell'alfabeto può essere utile per capire l'idea astratta, ma **non è sicuro nella pratica** e non spiega le proprietà dei moderni sistemi. I moderni algoritmi richiedono costruzioni matematiche e verifiche ben più complesse dei cifrari a sostituzione.

## 3. Crittografia simmetrica

Nella **crittografia simmetrica**, mittente e destinatario utilizzano la **stessa chiave segreta**, o chiavi facilmente derivabili fra loro, per cifrare e decifrare. È adatta a proteggere grandi quantità di dati in modo efficiente.

Un problema fondamentale è la **distribuzione della chiave**: come fanno due soggetti che non si sono mai incontrati a condividere una chiave segreta senza esporla proprio durante lo scambio?

Esempio: un programma deve conservare in forma protetta un archivio o cifrare i dati di una sessione. Il sistema può usare un algoritmo simmetrico come **AES**, *Advanced Encryption Standard*. Il nome serve come riferimento, non come materia di esercitazione.

## 4. Crittografia asimmetrica

Nella **crittografia asimmetrica** si usa una **coppia di chiavi correlate**:

- **chiave pubblica:** può essere distribuita;
- **chiave privata:** deve essere tenuta segreta dal titolare.

In alcuni schemi la chiave pubblica del destinatario permette di cifrare un messaggio e la privata di decifrarlo. Altri schemi a chiave pubblica servono alla **firma digitale** o all'**accordo di chiave**. **Non tutti gli algoritmi asimmetrici svolgono indistintamente tutte queste funzioni**.

Vantaggi: offre strumenti per risolvere problemi di distribuzione delle chiavi e di autenticazione. Limiti: le operazioni possono essere più costose; per molti protocolli si usa una soluzione **ibrida**, combinando meccanismi asimmetrici per autenticazione/accordo iniziale e algoritmi simmetrici per proteggere la comunicazione vera e propria.

## 5. Integrità: la funzione hash non è una cifratura

Una **funzione hash crittografica** trasforma un dato di dimensione arbitraria in un'impronta (*digest*) di lunghezza fissa. È progettata perché sia computazionalmente difficile risalire al contenuto originale o trovare collisioni utili in attacchi, secondo le proprietà richieste.

```text
Documento A ──> funzione hash ──> impronta A
Documento A modificato ──> hash ──> impronta molto probabilmente diversa
```

Un hash **non si decifra**: non è un sistema per nascondere un messaggio e poi recuperarlo. Da solo, inoltre, non prova chi ha prodotto il documento: chiunque potrebbe modificare il file e ricalcolarne l'hash. Per autenticazione e integrità affidabile servono meccanismi aggiuntivi, per esempio **MAC** (*Message Authentication Code*, codice di autenticazione del messaggio) con chiave segreta oppure firme digitali.

Per le password, non è corretto dire «le cifriamo così poi le decifriamo per controllarle». In genere si memorizzano **verificatori derivati da password** usando funzioni appropriate per password, con **salt** (valore casuale associato alla password), non cifrature reversibili o semplici hash veloci senza ulteriori difese.

## 6. HTTPS: la versione sicura della comunicazione Web

**HTTPS** significa comunemente *Hypertext Transfer Protocol Secure*: è HTTP utilizzato sopra un canale protetto da **TLS**, *Transport Layer Security*. TLS mira a fornire protezione del traffico **in transito**, inclusi riservatezza e integrità e, nelle forme comuni di uso Web, autenticazione del server.

Per i nostri scopi, il funzionamento può essere raccontato così:

1. Il browser vuole collegarsi a `https://www.example.org`.
2. Browser e server negoziano parametri di sicurezza tramite TLS.
3. Il server presenta normalmente un **certificato digitale**, che contiene informazioni utili a verificarne l'identità e la chiave pubblica.
4. Il browser controlla la validità della catena di certificazione, il nome del server e altre condizioni pertinenti.
5. Mediante appositi meccanismi crittografici le parti stabiliscono **chiavi di sessione** e proteggono i dati scambiati.
6. All'interno del canale sicuro viaggiano le richieste e le risposte HTTP.

È una descrizione **concettuale**: i dettagli delle versioni moderne di TLS includono meccanismi di accordo delle chiavi e verifiche più sofisticati di un semplice «il server cifra con la chiave pubblica e il browser decifra».

## 7. Certificati e autorità di certificazione

Una **CA**, *Certification Authority* (autorità di certificazione), è un soggetto che emette certificati digitali. Il browser dispone di un insieme di autorità considerate attendibili e può verificare le catene di certificazione. Il certificato aiuta a collegare una **chiave pubblica** al **nome del servizio**.

**Attenzione:** il lucchetto/HTTPS indica che la connessione è protetta e che il browser ha effettuato le verifiche richieste, **non** che il contenuto del sito sia vero, moralmente corretto o esente da frodi. Anche un sito di phishing può usare HTTPS. Inoltre HTTPS protegge tipicamente il collegamento fra i due estremi TLS: se un server riceve i dati e li conserva senza protezioni adeguate, la cifratura del trasporto non risolve quel problema.

Confronto utile:

| Tecnologia | Problema principale che affronta |
| --- | --- |
| Firewall / ACL | Autorizzare o bloccare comunicazioni |
| VLAN / DMZ | Separare porzioni e servizi di rete |
| NAT / PAT | Tradurre indirizzi e porte |
| TLS / HTTPS | Proteggere le comunicazioni in transito e autenticare il servizio secondo le verifiche previste |
| Hash | Produrre un'impronta utile per controlli di integrità, se usata correttamente |
| Firma digitale | Collegare un documento al firmatario e verificare integrità e autenticità |

## 8. Verifica e discussione

1. Un firewall sostituisce HTTPS? *No: filtra traffico, non cifra necessariamente i contenuti.*
2. Perché non si usa soltanto la crittografia asimmetrica per tutti i dati di una sessione? *I protocolli tipicamente combinano meccanismi di accordo/autenticazione con cifratura simmetrica efficiente.*
3. Un hash è una cifratura reversibile? *No.*
4. Se appare HTTPS, il sito è certamente affidabile dal punto di vista del contenuto? *No.*
5. La cifratura in transito garantisce che il database non subisca furti? *No: bisogna proteggere anche applicazione, sistemi e dati conservati.*

**Passaggio alla lezione 17:** cifrare un messaggio significa renderne protetto il contenuto. Ma come dimostriamo l'autenticità di un documento firmato o l'avvenuta consegna di una comunicazione ufficiale?

---

# Lezione 17 — Firma digitale e PEC: autenticità, integrità e prova della consegna

**Domanda iniziale:** *«Se ricevo un documento per email, come posso verificare che sia stato sottoscritto dalla persona indicata? E come posso provare che un messaggio è stato consegnato?»*

## 1. Problemi differenti, strumenti differenti

Supponiamo che la scuola invii un contratto a un fornitore. Vorrebbe poter verificare:

1. **Chi** ha sottoscritto quel documento.
2. Se il documento è stato **modificato** dopo la firma.
3. Se il messaggio di invio è stato **accettato e consegnato** alla casella del destinatario.

La **firma digitale** risponde ai primi due problemi e contribuisce al valore probatorio e al **non ripudio**, secondo il quadro tecnico e giuridico previsto. La **PEC** risponde principalmente al terzo: documenta l'accettazione e la consegna della comunicazione. Non sono sinonimi e non si sostituiscono automaticamente.

## 2. Firma elettronica e firma digitale

Una **firma elettronica** è una categoria generale di mezzi elettronici collegati alla sottoscrizione di dati. Nel contesto normativo italiano ed europeo, la **firma digitale** è una particolare forma di firma elettronica qualificata basata su crittografia a chiave pubblica e certificati qualificati. Il quadro giuridico fa riferimento, fra l'altro, al regolamento **eIDAS** (*electronic IDentification, Authentication and trust Services*) e al **CAD**, *Codice dell'Amministrazione Digitale*.

Si distinguono il **meccanismo tecnico della firma** e il **riconoscimento giuridico** di specifiche tipologie di firme e servizi di certificazione.

## 3. Come funziona concettualmente una firma digitale

La firma usa la **chiave privata** del titolare, mentre la verifica impiega la **chiave pubblica** associata, insieme al certificato che permette di collegarla al soggetto.

```text
DOCUMENTO
   │
   ├──> funzione hash → impronta ──> firma con chiave privata
   │                                         │
   └──────────────────────────────────┐      │
                                      ▼      ▼
                              documento + firma + certificato
                                              │
                                              ▼
                                verifica con chiave pubblica
                                              │
                                  esito e controlli di validità
```

La figura è concettuale: gli algoritmi e i formati reali possono trattare l'impronta e la firma secondo schemi specifici. Il verificatore deve controllare **anche** la validità del certificato, i suoi limiti e le condizioni pertinenti. Se il documento viene modificato dopo la firma, la verifica crittografica normalmente non riesce più.

**Non ripudio:** espressione che indica la difficoltà per il firmatario di disconoscere una sottoscrizione valida, nel quadro delle garanzie e delle regole applicabili. Non significa che sia matematicamente impossibile qualunque contestazione: contano anche protezione delle chiavi, identità, revoche, procedure e valutazioni giuridiche.

**Punto chiave:** **firmare non significa cifrare il documento**. Un documento può essere firmato e leggibile da chiunque, perché la firma attesta aspetti di autenticità e integrità; la cifratura è un'operazione distinta che mira alla riservatezza.

## 4. PEC: Posta Elettronica Certificata

**PEC** significa *Posta Elettronica Certificata*. È un sistema di posta elettronica che, nel circuito previsto, rilascia ricevute per documentare l'invio e la consegna del messaggio, con valore opponibile a terzi nei termini previsti dalle regole applicabili.

Sequenza semplificata:

```text
Mittente PEC
    |
    v
Gestore PEC mittente ---> ricevuta di ACCETTAZIONE al mittente
    |
    v
Gestore PEC destinatario ---> ricevuta di AVVENUTA CONSEGNA al mittente
    |
    v
Casella PEC destinataria
```

La **ricevuta di accettazione** indica che il gestore del mittente ha accettato il messaggio. La **ricevuta di avvenuta consegna** attesta la consegna alla casella del destinatario; la consegna non implica la lettura. Esistono anche casi di mancata accettazione o mancata consegna.

In Italia, secondo le condizioni di legge e il funzionamento del circuito certificato, la PEC può avere valore legale equivalente a una raccomandata con avviso di ricevimento. Una normale email non offre automaticamente lo stesso sistema di certificazioni.

## 5. Cosa PEC non fa

È altrettanto importante distinguere ciò che questa tecnologia **non** dimostra:

- non prova necessariamente che una persona abbia **letto** o compreso il messaggio;
- non **firma automaticamente** gli allegati per conto del loro autore;
- non prova da sola la verità delle affermazioni inviate;
- non trasforma un documento non autentico in un documento autenticato;
- non sostituisce la conservazione documentale a lungo termine;
- l'intero ciclo di certificazione della consegna richiede il corretto funzionamento nel circuito PEC previsto.

Esempio decisivo: posso inviare **tramite PEC un documento firmato digitalmente**. In tal caso la **firma** assiste la verifica del documento; la **PEC** documenta il percorso di invio e consegna. Le due garanzie si sommano perché rispondono a domande diverse.

## 6. Riepilogo attraverso tre domande

| Domanda | Tecnologia da prendere in considerazione |
| --- | --- |
| «Chi può entrare nel gestionale?» | Autenticazione e autorizzazione, insieme a misure di rete |
| «La comunicazione Web è protetta durante il trasporto?» | TLS / HTTPS |
| «Il documento è autentico e non modificato?» | Firma digitale e verifica valida |
| «L'invio è stato accettato e consegnato?» | PEC e relative ricevute |

**Caso di analisi:** «Ho inviato il contratto tramite PEC, quindi il contratto allegato è automaticamente firmato». L’affermazione è **falsa**: la PEC documenta accettazione e consegna secondo le regole del servizio, mentre la firma digitale riguarda l’autenticità e l’integrità del documento sottoscritto.

## 7. Verifica

1. Che cosa verifica una firma digitale? *Integrità e legame con il firmatario nell'ambito della verifica della firma e dei certificati.*
2. Firmare un file lo rende illeggibile agli altri? *No: non è automaticamente cifratura.*
3. La ricevuta PEC di consegna dimostra la lettura? *No.*
4. Perché firma digitale e PEC possono essere usate insieme? *Certificano aspetti differenti: documento e trasmissione.*

---

# Lezione 18 — Caso conclusivo: progettare una piattaforma scolastica e spiegare le scelte

**Problema finale:** una scuola vuole offrire un portale che mostri orari e comunicazioni pubbliche, permetta agli studenti di prenotare libri e consenta alla segreteria di gestire dati riservati.

## 1. Prima i requisiti, poi le tecnologie

**Scenario da analizzare:**

> Il portale deve essere raggiungibile da casa e dalla rete scolastica. La sezione «Notizie» è pubblica. La prenotazione dei libri richiede accesso personale. La segreteria gestisce utenti e prestiti. Il sistema deve conservare le informazioni dopo lo spegnimento del server. Un guasto o un accesso non autorizzato non deve consentire di leggere indiscriminatamente i dati amministrativi.

Una corretta analisi separa **requisiti funzionali** (che cosa deve fare il sistema) e **requisiti non funzionali** (sicurezza, affidabilità, disponibilità, integrità e protezione dei dati).

## 2. Un'architettura possibile, non l'unica

```text
                         INTERNET
                             |
                   [Router / firewall]
                             |
                    [Reverse proxy Web]
                    sito + accesso HTTPS
                             |
                         [Backend]
                 API + business logic
                             |
                       [Database]
            utenti, libri, prestiti, vincoli

Rete scolastica (separata in VLAN):
  VLAN 10 → Segreteria → gestionali autorizzati
  VLAN 20 → Laboratori → risorse didattiche
  VLAN 30 → Ospiti → Internet, non segreteria
```

Lo schema è **logico** e deve essere accompagnato da un ragionamento di rete. Il reverse proxy può essere collocato in una **DMZ**. Il database non è esposto direttamente a Internet e i flussi backend/database sono limitati a quelli necessari. Il front-end potrebbe essere servito dal reverse proxy o da un servizio apposito; non occorre che ogni rettangolo coincida con una macchina fisica.

## 3. Percorso di una prenotazione: dal clic al dato persistente

### Passo 1 — Il browser mostra l'interfaccia

L'utente apre un URL HTTPS. Il browser risolve il nome tramite DNS se necessario, avvia la connessione sicura e riceve l'HTML. Il browser analizza HTML e CSS, carica le risorse e avvia l'eventuale JavaScript. È il **programma client** che rende visibile l'interfaccia.

### Passo 2 — Il software client chiede un'operazione

Quando lo studente seleziona un libro, la pagina potrebbe usare un form o JavaScript con `fetch()` per inviare una richiesta HTTP a un endpoint della Web API, per esempio `POST /api/prenotazioni`. In entrambi i casi il browser gestisce le comunicazioni secondo gli standard del Web.

### Passo 3 — Il backend applica le regole

La logica applicativa verifica che l'utente sia autenticato e autorizzato, controlla i limiti di prenotazione e la disponibilità del libro. **Il browser non è la fonte definitiva delle autorizzazioni**: un utente potrebbe inviare una richiesta senza utilizzare l'interfaccia prevista.

### Passo 4 — Il database salva

Il sistema usa un DBMS, ad esempio PostgreSQL oppure SQLite per una soluzione piccola, secondo i requisiti. La prenotazione deve essere salvata in modo persistente e coerente, eventualmente tramite transazione. Se due studenti prenotano lo stesso ultimo libro nello stesso istante, la logica e la gestione transazionale devono evitare risultati incompatibili.

### Passo 5 — La risposta torna al client

Il backend restituisce un esito, spesso in JSON. Il browser può aggiornare la schermata. Un errore può essere segnalato con un codice HTTP opportuno e un messaggio applicativo; non è necessario ricaricare l'intera pagina in ogni caso.

## 4. Sicurezza della piattaforma: sette controlli complementari

La protezione della piattaforma richiede controlli differenti, che si completano a vicenda:

1. «Le VLAN separano laboratori, ospiti e segreteria sul livello della rete locale.»
2. «Il firewall e le regole ACL controllano i flussi consentiti fra segmenti e verso Internet.»
3. «NAT/PAT permettono la condivisione degli indirizzi IPv4 pubblici, ma non sostituiscono i controlli di accesso.»
4. «Il servizio Web esposto può stare in un segmento dedicato, come una DMZ, con un reverse proxy.»
5. «Il database deve essere raggiungibile soltanto dai componenti autorizzati.»
6. «HTTPS/TLS protegge il traffico in transito; l'autenticazione e le regole del backend proteggono l'uso del servizio.»
7. «Backup, aggiornamenti e persistenza sono necessari anche quando la comunicazione è cifrata.»

## 5. Tre possibili distribuzioni dello stesso sistema

**Distribuzione 1 — Un server fisico:** web, backend e DBMS sono processi distinti sul medesimo computer; i layer logici rimangono separati nel progetto.

**Distribuzione 2 — Un server fisico con container:** web, backend e DBMS sono tre container Docker, con una rete virtuale privata tra servizi e storage persistente per i dati. **Sono tre ambienti di esecuzione, non tre computer fisici.**

**Distribuzione 3 — Host separati:** l'interfaccia può essere servita da un host, il backend da un secondo e il database da un terzo; oppure alcuni servizi possono essere gestiti in cloud. Aumentano possibilità di distribuzione e isolamento fisico, ma anche complessità di rete, gestione e costi.

**Quale configurazione è sicura?** Il numero delle macchine non è sufficiente a stabilirlo: ogni configurazione può essere progettata bene o male, con vincoli e rischi diversi.

## 6. Traccia di verifica: 10 domande ragionate

1. Spiega perché la sicurezza di una rete non può essere valutata soltanto verificando che i pacchetti arrivino.
2. Perché la disponibilità di nuovi IPv4 pubblici è scarsa? Distingui l'esaurimento delle assegnazioni dall'idea sbagliata che IPv4 non funzioni più.
3. In che modo PAT permette a più dispositivi di uscire con lo stesso indirizzo IPv4 pubblico?
4. Perché una scuola potrebbe usare tre VLAN, e che cosa servirebbe per controllare il traffico tra esse?
5. Un programma invia `b"CIAO"` attraverso un socket TCP. Che cosa capisce automaticamente TCP del contenuto? Perché occorre un protocollo applicativo?
6. Spiega perché un browser può richiedere file CSS e immagini senza che il codice JavaScript della pagina chiami `fetch()`.
7. Che cosa fanno HTML, CSS e JavaScript nel browser? Che cosa significa che il motore JavaScript può interpretare e compilare?
8. Qual è la differenza tra una API del browser e una Web API esposta dal server?
9. Spiega la differenza fra presentation, business logic e data e distingui layer, tier, container e macchina fisica.
10. Perché usare un database invece di un file JSON per un registro con molti utenti? Distingui infine le funzioni di HTTPS, firma digitale e PEC.

### Caratteristiche di una risposta completa

| Dimensione | Risposta adeguata |
| --- | --- |
| Accuratezza tecnica | Distingue NAT/firewall, TCP/HTTP, browser/motore JavaScript, layer/tier, cifratura/firma |
| Collegamenti causali | Parte dal problema concreto e giustifica la scelta della tecnologia |
| Analisi dei rischi | Identifica risorse esposte, accessi da limitare e dati da proteggere |
| Linguaggio tecnico | Scioglie gli acronimi essenziali e distingue termini simili |

## 7. Casi di approfondimento: richieste Web, container e accessi

### Caso A — Una pagina Web genera più richieste

Il caricamento di `/index.html` produce richieste per `/stile.css`, `/logo.png` e `/app.js`. Dopo un clic su un pulsante compare anche `/api/prenotazioni`.

**Analisi.** Le richieste per CSS, immagine e script possono nascere dal caricamento delle risorse riconosciute dal browser. L'ultima richiesta potrebbe invece essere partita dal JavaScript della pagina tramite una Web API come `fetch()`. **Non esiste una regola secondo cui solo il primo GET viene eseguito dal browser e tutto il resto è eseguito direttamente dal motore JavaScript:** rete e API del browser restano coinvolte.

**Domande di approfondimento:** Che cosa accade se JavaScript è disabilitato? *Le risorse necessarie alla visualizzazione possono essere comunque scaricate; certe funzioni interattive potrebbero non essere disponibili.* Un form HTML può inviare dati anche senza JavaScript? *Sì.*

### Caso B — Tre container, un solo computer

```text
Host fisico
  ├── container «web»
  ├── container «backend»
  └── container «database» ─── volume persistente
```

**Analisi.** I tre componenti sono separati nell'esecuzione, ma condividono lo stesso host fisico. Un guasto dell'host può interrompere l'intero sistema; il volume evita che il ciclo di vita effimero del container determini automaticamente la perdita dei dati, ma non sostituisce backup e ripristino.

**Domande di approfondimento:** Se il database viene spostato su un secondo host, il numero di layer logici cambia? *No.* Aumenta l'indipendenza rispetto al guasto del primo host? *Sì, sul piano della collocazione del database, ma il servizio complessivo può comunque dipendere dal backend.*

### Caso C — Un servizio Web esposto e un database riservato

Il servizio pubblico ascolta su HTTPS/TCP 443. Un database è disponibile soltanto per i processi applicativi autorizzati. Una richiesta `GET /admin` raggiunge il sito da un utente non autenticato.

**Analisi.** Un firewall che lascia passare HTTPS non verifica automaticamente se l'utente è autorizzato a usare `/admin`. Occorrono controlli applicativi sul server; un WAF può aggiungere filtri sulle richieste, ma non sostituisce il controllo degli accessi. Il database non deve essere esposto direttamente ai client Internet solo perché il sito è pubblico.

**Domande di approfondimento:** Che cosa deve poter attraversare il firewall? *Solo i flussi realmente necessari.* Il fatto che il traffico sia cifrato da TLS basta a renderlo lecito? *No: cifratura e autorizzazione risolvono problemi diversi.*

---

# Appendice — Glossario, collegamenti e fonti di riferimento

## A. Glossario essenziale in ordine tematico

| Termine | Significato / funzione |
| --- | --- |
| **ISO/OSI** | *International Organization for Standardization / Open Systems Interconnection*: modello di riferimento a livelli per le funzioni di rete |
| **LAN** | *Local Area Network*: rete locale |
| **IP / IPv4 / IPv6** | *Internet Protocol*, versioni 4 (32 bit) e 6 (128 bit) per indirizzamento e instradamento |
| **MAC** | *Media Access Control*: riferimento agli indirizzi di livello collegamento per la rete locale |
| **IANA** | *Internet Assigned Numbers Authority*: funzioni globali di coordinamento di numeri e identificatori Internet |
| **RIPE NCC** | *Réseaux IP Européens Network Coordination Centre*: registro Internet regionale per Europa e aree limitrofe |
| **RIR** | *Regional Internet Registry*: registro regionale degli indirizzi Internet |
| **CIDR** | *Classless Inter-Domain Routing*: notazione con lunghezza del prefisso, per esempio `/24` |
| **ISP** | *Internet Service Provider*: fornitore di connettività Internet |
| **NAT** | *Network Address Translation*: traduzione di indirizzi IP |
| **PAT** | *Port Address Translation*: traduzione anche delle porte, spesso per condividere un IPv4 pubblico |
| **CGNAT** | *Carrier-Grade NAT*: NAT gestito anche nell'infrastruttura dell'operatore |
| **VLAN** | *Virtual Local Area Network*: separazione logica di rete a livello 2 |
| **ACL** | *Access Control List*: insieme di regole per consentire o negare accessi/traffico |
| **DMZ** | *Demilitarized Zone*: segmento separato per servizi esposti all'esterno |
| **TCP** | *Transmission Control Protocol*: protocollo di trasporto che offre un flusso affidabile e ordinato di byte |
| **UDP** | *User Datagram Protocol*: protocollo di trasporto a datagrammi, senza le garanzie offerte da TCP |
| **DNS** | *Domain Name System*: sistema di risoluzione e gestione dei nomi di dominio |
| **WWW** | *World Wide Web*: insieme di risorse e servizi Web accessibili attraverso tecnologie e protocolli condivisi |
| **HTTP** | *Hypertext Transfer Protocol*: protocollo di richieste e risposte del Web |
| **HTTPS / TLS** | HTTP protetto mediante *Transport Layer Security* |
| **URL** | *Uniform Resource Locator*: indirizzo di una risorsa |
| **HTML** | *HyperText Markup Language*: linguaggio di marcatura dei documenti Web |
| **CSS** | *Cascading Style Sheets*: linguaggio per definire la presentazione delle pagine |
| **DOM** | *Document Object Model*: rappresentazione strutturata e programmabile del documento |
| **CSSOM** | *CSS Object Model*: rappresentazione delle regole e proprietà di stile del documento |
| **JIT** | *Just-in-Time*: compilazione durante l'esecuzione del programma |
| **API** | *Application Programming Interface*: interfaccia per usare funzioni o dati di un altro componente |
| **REST** | *Representational State Transfer*: stile architetturale per applicazioni a risorse |
| **JSON** | *JavaScript Object Notation*: formato testuale per dati strutturati |
| **P2P** | *Peer-to-Peer*: modello di comunicazione fra nodi che possono agire da pari |
| **DB / DBMS** | *Database* / *Database Management System*: dati organizzati / software che li gestisce |
| **SQL** | *Structured Query Language*: linguaggio per database relazionali |
| **ACID** | *Atomicity, Consistency, Isolation, Durability*: proprietà classiche delle transazioni |
| **VM** | *Virtual Machine*: macchina virtuale gestita mediante virtualizzazione |
| **IaaS / PaaS / SaaS** | *Infrastructure / Platform / Software as a Service*: modelli di servizio cloud |
| **CA** | *Certification Authority*: soggetto che emette certificati digitali |
| **PEC** | *Posta Elettronica Certificata*: sistema di posta con attestazioni di invio e consegna |
| **CAD** | *Codice dell'Amministrazione Digitale*: normativa italiana di riferimento |
| **eIDAS** | Regolamento europeo su *electronic IDentification, Authentication and trust Services* |

## B. Sei distinzioni da ripassare prima della verifica

1. **Internet ≠ Web:** l'infrastruttura globale non coincide con uno dei servizi che vi funzionano.
2. **TCP ≠ HTTP:** flusso di byte e protocollo applicativo non sono la stessa cosa; non tutto HTTP moderno viaggia su TCP.
3. **Browser ≠ motore JavaScript:** il browser contiene rete, parsing, rendering, motore JS e API.
4. **NAT ≠ firewall:** traduzione di indirizzi/porte e filtro dei permessi hanno scopi diversi.
5. **Layer ≠ host fisico:** tre responsabilità logiche o tre container non implicano tre computer.
6. **HTTPS ≠ firma digitale ≠ PEC:** protezione del trasporto, sottoscrizione del documento e attestazione della consegna sono problemi differenti.

## C. Fonti e riferimenti tecnici

I riferimenti **ufficiali o tecnici** permettono di approfondire le nozioni e chiarire le semplificazioni più frequenti. Il testo è una rielaborazione didattica e non riproduce integralmente le fonti.

**Indirizzamento e IPv4**

- IANA, *Private-use IP addresses*: <https://www.iana.org/help/private-addresses>
- IETF, *RFC 1918 — Address Allocation for Private Internets*: <https://datatracker.ietf.org/doc/html/rfc1918>
- RIPE NCC, *IPv4 Run Out*: <https://www.ripe.net/manage-ips-and-asns/ipv4/ipv4-run-out/>
- RIPE NCC, *IPv4 exhaustion del pool IANA, 3 febbraio 2011*: <https://www.ripe.net/about-us/news/ipv4-exhaustion-ripe-ncc-update/>

**Firewall e sicurezza delle reti**

- NIST SP 800-41 Rev. 1, *Guidelines on Firewalls and Firewall Policy*: <https://www.nist.gov/publications/guidelines-firewalls-and-firewall-policy?pub_id=901083>
- RFC 2979, *Behavior of and Requirements for Internet Firewalls*: <https://www.rfc-editor.org/rfc/rfc2979.html>
- RFC 7754, *Technical Considerations for Internet Service Blocking and Filtering*: <https://www.rfc-editor.org/rfc/rfc7754.html>

**Browser, JavaScript e HTTP**

- MDN, *How browsers load websites*: <https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_browsers_load_websites>
- MDN, *Populating the page: how browsers work*: <https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work>
- V8, *Tiering and the Interrupt Budget*: <https://chromium.googlesource.com/v8/v8/+/main/docs/runtime/tiering.md>
- V8, *Maglev — optimizing JIT*: <https://v8.dev/blog/maglev>
- MDN, *QUIC*: <https://developer.mozilla.org/en-US/docs/Glossary/QUIC>
- MDN, *CORS* (solo per eventuali chiarimenti, non per una lezione autonoma): <https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS>

**Dati, cloud e firme**

- SQLite, *Appropriate Uses For SQLite*: <https://sqlite.org/whentouse.html>
- NIST, *The NIST Definition of Cloud Computing*, SP 800-145: <https://csrc.nist.gov/pubs/sp/800/145/final>
- AgID, *Servizi fiduciari qualificati e firma digitale*: <https://www.agid.gov.it/index.php/it/piattaforme/firma-elettronica-qualificata.html>
- AgID, *Posta elettronica certificata*: <https://www.agid.gov.it/it/piattaforme/posta-elettronica-certificata>

**Collocazione nel programma:** il modulo «Struttura di Internet e servizi» comprende Intranet, Extranet, cloud computing, siti Web, sicurezza delle reti, crittografia, firma digitale e PEC. Il percorso collega questi contenuti a IPv4/NAT, segmentazione, socket, browser, API, architetture distribuite e persistenza.

## D. Distinzioni concettuali fondamentali

- **Capire il problema:** ogni tecnologia nasce per una necessità concreta (indirizzamento, controllo degli accessi, comunicazione, interpretazione, persistenza o protezione).
- **Capire le responsabilità:** socket non significa HTTP; browser non significa soltanto motore JavaScript; database non significa necessariamente server fisico separato.
- **Capire la distribuzione:** una divisione in layer logici non implica un numero preciso di processi, container, macchine o fornitori cloud.
- **Capire la sicurezza:** firewall, VLAN, NAT, TLS, autenticazione, firma e PEC affrontano problemi differenti e possono essere impiegati insieme.
- **Capire le applicazioni:** un protocollo condiviso e un’interfaccia API permettono a software scritti in linguaggi diversi di collaborare.

---
