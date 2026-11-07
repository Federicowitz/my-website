/* Home-only translations. School is a separate, Italian-only document. */
(function () {
  'use strict';
  const english = {
    'Alberi genealogici interattivi, con gestione collaborativa.': 'Interactive family trees with collaborative editing.',
    'Applicazione per costruire ed esplorare alberi genealogici: organizza persone e nuclei familiari, dispone automaticamente le generazioni e permette di seguire i legami di parentela. La versione cloud è ancora per uso familiare, per costruire e aggiornare insieme la storia della famiglia.': 'An app for building and exploring family trees: organize people and family units, automatically arrange generations and follow family relationships. The cloud version is still for family use, to build and update the family’s history together.',
    'Una mappa della famiglia da costruire insieme: aggiungi persone, collega genitori, figli e partner e segui i rami per scoprire come siete imparentati.': 'Build a family map together: add people, connect parents, children and partners, and follow the branches to discover how you are related.',
    'Apri genealogy3': 'Open genealogy3',
    'Federico Lelli — Ingegnere, sviluppo software, musicista': 'Federico Lelli — Engineer, software developer, musician',
    'Portfolio di Federico Lelli, ingegnere e docente a Milano: software full stack, sistemi, hardware embedded e automazione.': 'Portfolio of Federico Lelli, engineer and teacher in Milan: full-stack software, systems, embedded hardware and automation.',
    'Progetti: software, sistemi, hardware e automazione.': 'Projects: software, systems, hardware and automation.',
    'Ingegnere e sviluppatore software': 'Engineer and software developer',
    'Progetti': 'Projects',
    'In produzione': 'Live projects',
    'Finanza & automazione': 'Finance & automation',
    'Giochi': 'Games',
    'Hardware & bio': 'Hardware & bio',
    'Lezioni, esercizi e test': 'Lessons, exercises and tests',
    'Informatica, Web, C++ e Node.js': 'Computer science, Web, C++ and Node.js',
    'Altro': 'More',
    'Cosa sto facendo ora': 'What I’m working on',
    'un diario aggiornato di tanto in tanto': 'a journal updated from time to time',
    'Ti serve una mano? · Collaboriamo?': 'Need a hand? · Let’s collaborate',
    'apre il modulo contatti': 'opens the contact form',
    'Novembre 2026': 'November 2026',
    'World maker: costruire il mondo di gioco': 'World maker: building the game world',
    'Sto creando il world maker per il gioco: un editor per gestire sprite, NPC e generazione del mondo. Uno spazio in cui costruire e organizzare gli elementi che daranno vita al gioco.': 'I’m building the world maker for the game: an editor for managing sprites, NPCs and world generation. A place to create and organize the elements that will bring the game to life.',
    'Settembre 2026': 'September 2026',
    'Dungeon procedurali quasi stabili': 'Procedural dungeons are almost stable',
    'Il generatore di dungeon per il gioco open world regge il carico di più client contemporanei senza desync evidenti. Prossimo passo: bilanciare il combat system.': 'The dungeon generator for the open-world game handles multiple concurrent clients without noticeable desync. Next up: balancing the combat system.',
    'Agosto 2026': 'August 2026',
    'Datafalco, nuovo parser SDI': 'Datafalco: a new SDI parser',
    'Aggiornato il parser XML per gestire alcune varianti di fattura che prima andavano controllate a mano. Meno eccezioni, meno notifiche notturne.': 'Updated the XML parser to handle invoice variations that previously needed manual checks. Fewer exceptions, fewer late-night notifications.',
    'Luglio 2026': 'July 2026',
    'WriteX, entità personalizzate': 'WriteX: custom entities',
    'Aggiunta la possibilità di creare tipi di nodo su misura nel grafo di scrittura, non solo personaggi e luoghi predefiniti.': 'Added custom node types to the writing graph, beyond the preset characters and locations.',
    'Maggio 2026': 'May 2026',
    'Datafalco live': 'Datafalco is live',
    'Aggiornato il parser XML per gestire alcune varianti di fattura che prima andavano controllate a mano. Meno eccezioni.': 'Updated the XML parser to handle invoice variations that previously needed manual checks. Fewer exceptions.',
    'Scrivimi': 'Get in touch',
    'Compila il modulo: si aprirà la tua app di posta con il messaggio pronto.': 'Fill out the form to open your email app with the message ready to send.',
    'Mi serve una mano': 'I need a hand',
    'Vorrei collaborare': 'I’d like to collaborate',
    'Nome': 'Name',
    'Messaggio': 'Message',
    'Invia': 'Send',
    'Ingegnere, docente, sviluppo software, musicista.': 'Engineer, teacher, software developer, musician.',
    'creo cose.': 'I make things.',
    'progetti': 'projects',
    'roba fatta': 'stuff I’ve made',
    'Cose che funzionano già': 'Things that already work',
    'Full Stack - web app di Business Intelligence': 'Full-stack business intelligence web app',
    'Piattaforma SaaS in produzione: integrazione bidirezionale con le API di Fatture in Cloud, parser XML fatturazione elettronica Ospitata su Supabase e Render.': 'Production SaaS platform: two-way integration with the Fatture in Cloud APIs and an XML parser for electronic invoices. Hosted on Supabase and Render.',
    'Un programma che controlla prezzi e volumi dalle fatture al posto tuo: le legge, le controlla e ti dice dove guadagni e perdi.': 'A program that checks prices and volumes in your invoices for you: it reads them, checks them and shows where you make or lose money.',
    'Trasferimento file peer-to-peer, senza server intermedio.': 'Peer-to-peer file transfers, with no server in between.',
    'Infrastruttura di trasferimento P2P crittografata senza relay cloud: scrittura diretta su disco via stream, con controllo del backpressure per non saturare la RAM su file di grandi dimensioni. Basata su WebRTC DataChannels.': 'Encrypted P2P transfers without cloud relays: streams write directly to disk, with backpressure control to avoid exhausting RAM on large files. Built on WebRTC DataChannels.',
    "Manda file enormi da un computer all'altro, senza passare da internet o da un server di mezzo.": 'Send huge files from one computer to another, without going through the internet or a server in between.',
    'Base di conoscenza personale, locale e a schema libero.': 'A local, personal knowledge base with flexible schemas.',
    'Personal knowledge base ad architettura locale: definizione dinamica degli schemi a runtime, importazione da liste testuali non strutturate, sincronizzazione deterministica via merge JSON.': 'A local-first personal knowledge base: dynamic schema definitions at runtime, imports from unstructured text lists and deterministic synchronization through JSON merging.',
    "Un'agenda personale che si adatta a come vuoi organizzare le tue cose, non il contrario.": 'A personal organizer that adapts to the way you want to arrange your stuff, rather than the other way around.',
    'Pagina locale per il versioning della scrittura, con opzione cloud.': 'A local writing workspace with version history and optional cloud sync.',
    'Ambiente di scrittura e versioning non lineare a grafo, con creazione di grafi ed entità personalizzate, storage locale via IndexedDB e sincronizzazione cloud opzionale. Espone un bridge runtime per la co-scrittura programmatica con agenti IA.': 'A graph-based workspace for writing and nonlinear versioning, with custom graphs and entities, local IndexedDB storage and optional cloud sync. Includes a runtime bridge for programmatic co-writing with AI agents.',
    'Un posto per scrivere storie dove puoi creare personaggi e collegamenti come una mappa, e tornare indietro nel tempo a qualsiasi versione.': 'A place to write stories, map out characters and connections, and go back to any previous version.',
    "Estensione VS Code, ponte tra l'albero file e la clipboard di sistema.": 'A VS Code extension connecting the file tree to the system clipboard.',
    "Estensione che elimina l'attrito tra il file tree di VS Code e il file manager del sistema operativo: copia e incolla bidirezionale di file e cartelle tramite le API native dell'OS.": 'An extension that connects the VS Code file tree with your operating system’s file manager: copy and paste files and folders in both directions using native OS APIs.',
    "Un trucco per programmatori: rende più veloce copiare e spostare file dentro e fuori dall'editor di codice.": 'A handy tool for programmers: copy and move files into and out of your code editor faster.',
    'Robot per i soldi e le scartoffie': 'Robots for money and paperwork',
    'Motore a vincoli per generare orari scolastici.': 'A constraint-based engine for generating school timetables.',
    'Risolutore a programmazione vincolata (Google OR-Tools, CP-SAT): minimizza i buchi in orario, gestisce compresenze di laboratorio, vincoli a blocchi consecutivi e il congelamento di assegnazioni parziali.': 'A constraint programming solver (Google OR-Tools, CP-SAT): minimizes timetable gaps, handles shared lab teaching and consecutive-block constraints, and locks partial assignments.',
    'Fa gli orari scolastici al posto delle segreterie, senza buchi e senza litigate tra docenti.': 'Builds school timetables for the admin office, without gaps or arguments between teachers.',
    'Agente di trading multi-LLM': 'Multi-LLM trading agent',
    'Daemon multi-LLM che orchestra un flusso di trading.': 'A multi-LLM daemon orchestrating a trading workflow.',
    'Architettura a micro-agenti con scheduler ciclico e memoria incrementale tra cicli: integra modelli locali (Ollama) e cloud (Gemini, Claude, Groq), orchestrando chiamate a broker e ricerca news.': 'A micro-agent architecture with a recurring scheduler and memory carried across cycles: combines local models (Ollama) and cloud models (Gemini, Claude, Groq), coordinating broker calls and news research.',
    'Un robot che segue i mercati finanziari giorno e notte e decide da solo cosa fare.': 'A robot that watches financial markets day and night and decides what to do on its own.',
    'Riconciliazione scadenziari': 'Payment schedule reconciliation',
    'Normalizza partitari ed export contabili, riconcilia gli scadenziari.': 'Normalizes ledgers and accounting exports, and reconciles payment schedules.',
    'Tool client-side ad alta sicurezza per normalizzare partitari contabili ed export massivi XLS, riconciliare i crediti a scadere ed emettere scadenziari PDF pronti per la direzione.': 'A security-focused client-side tool for normalizing accounting ledgers and bulk XLS exports, reconciling outstanding receivables and producing management-ready PDF payment schedules.',
    'Controlla automaticamente chi deve pagare cosa e quando, senza spulciare fogli Excel a mano.': 'Automatically checks who owes what and when, without going through spreadsheets by hand.',
    'Automazione ordini GDO': 'Retail order automation',
    'Pipeline che trasforma ordini PDF della GDO in tracciati per il magazzino.': 'A pipeline turning retail PDF orders into warehouse import files.',
    'Pipeline di document ingestion per il settore agroalimentare: parsing di ordini fornitura PDF vettoriali, instradamento multi-stabilimento e compilazione automatica dei fogli di carico.': 'A document ingestion pipeline for the food industry: parses vector PDF purchase orders, routes them across production sites and automatically fills out loading sheets.',
    'Legge gli ordini dei supermercati e prepara tutto per il magazzino, senza che nessuno li ricopi a mano.': 'Reads supermarket orders and gets everything ready for the warehouse, without anyone copying them by hand.',
    'Monitoraggio prezzi di mercato': 'Market price monitoring',
    'App desktop per leggere i bollettini di mercato e calcolarne gli scostamenti.': 'A desktop app for reading market reports and calculating price changes.',
    "Applicazione drag & drop per l'acquisizione dei bollettini settimanali di mercato (CUN Parma e Libero Mercato): normalizza le voci merceologiche e calcola i delta storici per aggiornare i listini.": 'A drag-and-drop app for importing weekly market reports (CUN Parma and Libero Mercato): normalizes product categories and calculates historical changes to update price lists.',
    "Tiene d'occhio i prezzi del mercato ogni settimana e avvisa quando qualcosa cambia.": 'Keeps an eye on market prices every week and lets you know when something changes.',
    'Scraper e valutazione immobiliare': 'Real estate scraping & valuation',
    'Scraper e motore di valutazione per il mercato immobiliare.': 'A scraper and valuation engine for the real estate market.',
    'Pipeline di scraping anti-detection e motore di analisi comparativa: confronta un immobile con le transazioni di zona su una matrice pesata (locali, accessori, ascensore), stimando il margine di guadagno.': 'An anti-detection scraping pipeline and comparative analysis engine: compares a property against local transactions using weighted criteria (rooms, amenities, elevator) to estimate potential profit.',
    'Guarda le case in vendita in una zona e ti dice se conviene comprarle.': 'Looks at homes for sale in an area and tells you whether they’re worth buying.',
    'Il mio parco giochi personale: giochi ed esperimenti interattivi.': 'My personal playground: games and interactive experiments.',
    'Uno spazio indipendente dove pubblico giochi, prototipi e idee nate per divertimento. Un posto dove sperimentare e aggiungere cose nuove, un gioco alla volta.': 'An independent space where I share games, prototypes and ideas made for fun. A place to experiment and add new things, one game at a time.',
    'Il mio parco giochi personale: pubblico giochi, provo idee e costruisco cose per il gusto di farlo. Vieni a fare un giro.': 'My personal playground: I share games, try out ideas and build things for the fun of it. Come take a look around.',
    'Dungeon open world, PvP/PvE': 'Open-world dungeons, PvP/PvE',
    'Dungeon procedurali, multiplayer PvP/PvE, in sviluppo.': 'Procedural dungeons with PvP/PvE multiplayer, in development.',
    'Architettura multiplayer in tempo reale su server headless Debian (VPS Oracle): stato autoritativo, pacchetti UDP compressi, tick rate dedicato e sincronizzazione del combat system. Ancora in collaudo attivo.': 'Real-time multiplayer architecture on a headless Debian server (Oracle VPS): authoritative state, compressed UDP packets, a dedicated tick rate and combat system synchronization. Still undergoing active testing.',
    'Un videogioco online dove tanti giocatori esplorano insieme dungeon generati al momento. Ancora in cantiere.': 'An online game where players explore freshly generated dungeons together. Still a work in progress.',
    'Gioco mobile multiplayer, rete P2P': 'Multiplayer mobile game, P2P networking',
    'Gioco mobile multiplayer su rete P2P locale.': 'A multiplayer mobile game over a local P2P network.',
    'I client sincronizzano entità dinamiche e collisioni su rete mesh decentralizzata, senza un server di matchmaking centrale — pensato per minimizzare overhead e consumo dati su mobile.': 'Clients synchronize dynamic entities and collisions over a decentralized mesh network, without a central matchmaking server — designed to minimize overhead and mobile data usage.',
    'Un gioco per telefono dove i giocatori si collegano tra loro direttamente, senza passare da un server centrale.': 'A phone game where players connect directly to each other, without going through a central server.',
    'Cose che si toccano': 'Things you can touch',
    'Sistema embedded, plug and play, di sensing gestuale controllo MIDI costruito da zero.': 'A plug-and-play embedded system for gesture sensing and MIDI control, built from scratch.',
    'Prototipo cyber-fisico completo per la tesi di laurea: progettazione e saldatura manuale del circuito, modellazione e stampa 3D dello chassis, firmware embedded in tempo reale e interfaccia grafica di telemetria. Tesi, Politecnico di Milano.': 'A complete cyber-physical prototype for my degree thesis: circuit design and hand soldering, chassis modeling and 3D printing, real-time embedded firmware and a graphical telemetry interface. Thesis, Politecnico di Milano.',
    'Un aggeggio costruito a mano, saldato pezzo per pezzo, che modifica i suoni in base alla posizione delle mani.': 'A handmade gadget, soldered piece by piece, that changes sounds based on where you place your hands.',
    'Telemetria EEG (Muse)': 'EEG telemetry (Muse)',
    'Acquisizione ed elaborazione di segnali elettroencefalografici.': 'Electroencephalographic signal acquisition and processing.',
    "Pipeline per l'acquisizione dei segnali Muse EEG: normalizzazione delle bande d'onda, asimmetria frontale Alpha, monitoraggio posturale e generazione automatica di report.": 'A Muse EEG signal acquisition pipeline: wave-band normalization, frontal alpha asymmetry, posture monitoring and automatic report generation.',
    'Legge le onde del cervello con una fascia e le trasforma in numeri comprensibili.': 'Reads your brainwaves through a headband and turns them into understandable numbers.',
    'App sul telefono': 'Apps on your phone',
    'Wallet Solana con firma isolata': 'Solana wallet with isolated signing',
    'Wallet decentralizzato con firma isolata sul mobile, con web app semplificata.': 'A decentralized wallet with isolated mobile signing and a simplified web app.',
    'Infrastruttura con isolamento crittografico: interfaccia web disaccoppiata per comporre le istruzioni on-chain, firma privata confinata rigorosamente nel client mobile nativo.': 'An architecture with cryptographic isolation: a separate web interface composes on-chain instructions, while private signing is strictly confined to the native mobile client.',
    'Un portafoglio di criptovalute dove la chiave segreta resta sempre sul telefono, mai online.': 'A crypto wallet where your secret key always stays on your phone, never online.',
    'App per organizzare documenti': 'Document organizer app',
    "App mobile per organizzare documenti d'ufficio.": 'A mobile app for organizing office documents.',
    'Ordina e ritrova rapidamente PDF, Word, Excel, PowerPoint e file di testo. Costruita con Gemini.': 'Quickly organize and find PDFs, Word documents, Excel spreadsheets, PowerPoint presentations and text files. Built with Gemini.',
    'Mette in ordine da sola i tuoi documenti — PDF, Word, Excel — e li ritrova in un attimo.': 'Automatically sorts your documents — PDF, Word, Excel — and finds them in a flash.',
    'App per organizzare il file system': 'File system organizer app',
    "App mobile per organizzare l'intero file system.": 'A mobile app for organizing the entire file system.',
    "Gemella della precedente, applicata all'intero file system del telefono anziché ai soli documenti d'ufficio. Costruita con Gemini.": 'A companion to the document organizer, covering the phone’s entire file system rather than just office documents. Built with Gemini.',
    'Come sopra, ma per tutti i file del telefono, non solo i documenti.': 'Same idea, but for every file on your phone, not just documents.',
    'Strumenti': 'Tools',
    'Linguaggi': 'Languages',
    'Sistemi & server': 'Systems & servers',
    'IA & agenti': 'AI & agents',
    'Milano': 'Milan',
    'Cerca un progetto…': 'Search projects…',
    'Apri School': 'Open School',
    'Apri Playground, il mio parco giochi personale': 'Open Playground, my personal playground',
    'Playground · il mio parco giochi': 'Playground · my personal playground',
    'Chiudi': 'Close',
    'Indietro': 'Back',
    'Apri Datafalco': 'Open Datafalco',
    'Apri SimpleShare': 'Open SimpleShare',
    'Apri Remandio': 'Open Remandio',
    'Apri Scribyx': 'Open Scribyx',
    'Apri File Stager sul Visual Studio Marketplace': 'Open File Stager on Visual Studio Marketplace',
    'Apri Timetable solver su GitHub': 'Open Timetable solver on GitHub',
    'Apri Playground': 'Open Playground',
    'Apri su GitHub': 'Open on GitHub',
    'Leggi la tesi': 'Read the thesis',
    'Lingua': 'Language',
    'Privacy e dati': 'Privacy & data',
    ' — da ': ' — from ',
    'Nessun progetto corrisponde a "': 'No projects match "'
  };

  let language = 'it';
  const normalize = value => value.trim().replace(/\s+/g, ' ');
  const hasTranslation = value => Object.prototype.hasOwnProperty.call(english, value);
  const textNodes = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement.closest('script, style, [data-language]')) continue;
    const key = normalize(node.nodeValue);
    if (hasTranslation(key)) textNodes.push({ node, original: node.nodeValue, key });
  }
  const attributes = [];
  document.querySelectorAll('[aria-label], [title], [placeholder], meta[name="description"], meta[property="og:title"], meta[property="og:description"]').forEach(element => {
    ['aria-label', 'title', 'placeholder', 'content'].forEach(name => {
      const original = element.getAttribute(name);
      if (original && hasTranslation(original)) attributes.push({ element, name, original });
    });
  });
  const originalTitle = document.title;
  const locale = document.querySelector('meta[property="og:locale"]');
  const person = document.querySelector('script[type="application/ld+json"]');
  const originalPerson = person.textContent;
  const links = document.querySelectorAll('[data-language]');
  window.homeText = value => language === 'en' && hasTranslation(value) ? english[value] : value;

  function applyLanguage(next) {
    language = next === 'en' ? 'en' : 'it';
    document.documentElement.lang = language;
    textNodes.forEach(({ node, original, key }) => {
      node.nodeValue = language === 'en' ? original.replace(original.trim(), english[key]) : original;
    });
    attributes.forEach(({ element, name, original }) => element.setAttribute(name, window.homeText(original)));
    document.title = window.homeText(originalTitle);
    document.getElementById('privacyLink').href = './privacy.html?lang=' + language;
    locale.content = language === 'en' ? 'en_GB' : 'it_IT';
    const data = JSON.parse(originalPerson);
    data.jobTitle = window.homeText(data.jobTitle);
    data.address.addressLocality = window.homeText(data.address.addressLocality);
    person.textContent = JSON.stringify(data);
    links.forEach(link => {
      const next = language === 'it' ? 'en' : 'it';
      const url = new URL(location.href);
      url.searchParams.set('lang', next);
      link.href = url.href;
      link.dataset.language = next;
      link.textContent = language.toUpperCase();
      link.setAttribute('lang', language);
      link.setAttribute('hreflang', next);
      const label = language === 'it' ? 'Passa all’inglese' : 'Switch to Italian';
      link.setAttribute('aria-label', label);
      link.setAttribute('title', label);
    });
    try { localStorage.setItem('portfolio-language', language); } catch (_) { /* Storage may be disabled. */ }
    document.getElementById('searchInput').dispatchEvent(new Event('input'));
  }

  function requestedLanguage(fallback) {
    const requested = new URL(location.href).searchParams.get('lang');
    if (requested === 'it' || requested === 'en') return requested;
    if (fallback) return fallback;
    try { return localStorage.getItem('portfolio-language') === 'en' ? 'en' : 'it'; } catch (_) { return 'it'; }
  }
  links.forEach(link => link.addEventListener('click', event => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (location.protocol !== 'file:') history.pushState({}, '', link.href);
    applyLanguage(link.dataset.language);
  }));
  const initialLanguage = requestedLanguage();
  window.addEventListener('popstate', () => applyLanguage(requestedLanguage(initialLanguage)));
  applyLanguage(initialLanguage);
})();
