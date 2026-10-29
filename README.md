# Federico · School

Il portfolio originale è mantenuto in `index.html`. La sezione School è autonoma, sotto `/teaching/` (anche `/teaching` viene risolto dal server locale). Non interroga GitHub: il catalogo e tutti i contenuti sono file locali, pronti da versionare.

## Anteprima locale

Serve Node.js, senza installare pacchetti:

```sh
npm run preview
```

Apri http://127.0.0.1:4173/teaching/ oppure la home. Ferma il server con Ctrl+C. Per cambiare porta in PowerShell: `$env:PORT=4180; npm run preview`.

## Aggiungere materiali

1. Inserisci un HTML completo nella cartella del percorso sotto `teaching/materials/`.
2. Usa un `<title>` descrittivo e, se utile, `<meta name="description" content="Breve descrizione">`.
3. Collega il tema condiviso `reader.css` con un percorso relativo corretto (da `materials/node/`: `../../reader.css`). Per rendere copiabili i blocchi di codice, aggiungi anche `../../reader.js`.
4. Indica il tipo con `<meta name="school-kind" content="lesson">`, `exercise`, `lab` oppure `test`. Senza metadati, i nomi che contengono `esercizi`, `soluzioni`, `quiz` o `test` vengono classificati automaticamente.
5. Esegui `npm run catalog`, poi `npm run check` e `npm test`. Il comando catalog aggiorna anche navigazione precedente/successiva, link HTML statici e sitemap.

Per un nuovo argomento aggiungi una cartella in `teaching/materials/` e una voce in `teaching/courses.json`: `id`, `folder`, `title`, `symbol`, `description`, `order` (array dei nomi file in ordine didattico, può essere vuoto). Non occorre modificare il frontend. I capitoli Node sono file indipendenti: eventuali modifiche al manuale completo vanno riportate anche nel capitolo corrispondente.

## Struttura

Il percorso **Crittografia** è in `teaching/materials/crittografia/`: 14 lezioni progressive, una mappa iniziale, un glossario, fonti commentate, 12 esercizi risolti, un laboratorio e una verifica di 20 domande. È integrato nel catalogo, nei capitoli della mappa concettuale, nella navigazione autonoma e nella sitemap. Le lezioni rielaborano le trascrizioni fornite, correggendone le semplificazioni e aggiungendo esempi su AES-GCM, password, TLS e gestione delle chiavi.

Il simulatore di Cesare funziona senza rete. Il laboratorio usa Web Crypto per SHA-256, AES-GCM ed ECDSA P-256: richiede un browser con API disponibili in un contesto sicuro (HTTPS o localhost). Le chiavi rimangono in memoria e si perdono uscendo dalla pagina; i dati non vengono inviati a un backend né salvati dal laboratorio. `npm test` esegue anche verifiche delle operazioni crittografiche effettivamente usate, dei casi di alterazione e dei calcoli RSA/Diffie–Hellman presentati negli esercizi.

- `teaching/school.css`: interfaccia del catalogo e lettore.
- `teaching/reader.css`: tema condiviso di lezioni, esercizi e test.
- `teaching/catalog.js`: catalogo generato, da includere nel commit.
- `teaching/materials/`: lezioni originali, 28 capitoli Node, mappa, laboratorio, ripasso, fonti, manuale completo e tre verifiche.
- `scripts/catalog.cjs`: scansione locale, nessuna API esterna.

Ogni materiale ha un URL HTML reale e una pagina autonoma con titolo, metadati e collegamenti alla pagina precedente/successiva nel proprio percorso, in alto e in basso. I link sono presenti anche senza JavaScript. Dal catalogo School, JavaScript mantiene il lettore fluido e carica solo il materiale selezionato in un iframe: la barra degli indirizzi mostra lo stesso URL della pagina autonoma. Un ricaricamento o un link condiviso apre direttamente la pagina completa. Ricerca e filtri operano sul catalogo senza scaricare tutte le lezioni. I vecchi URL `/teaching/?lesson=...` restano compatibili. In apertura da file locale il lettore usa `#lesson=...`, mentre i link diretti aprono i singoli file HTML. Completamento e risultati dei test sono salvati nel localStorage del browser, senza account o backend. I progressi degli esercizi originali sono conservati dalla loro logica esistente.

## Pubblicazione futura

Questa cartella può essere versionata e inviata su GitHub. È presente una repository Git locale. La versione precedente al refactor è salvata nel commit `8ef65b1` e nel tag `school-before-standalone-refactor`. Non è stato eseguito alcun push. Su un hosting statico copia tutta la cartella, mantenendo `teaching/index.html`. I collegamenti relativi funzionano dalla radice del dominio e da sottocartelle, compreso un progetto GitHub Pages. Puoi anche aprire `index.html` direttamente dal disco: in quel caso School usa il frammento URL (`#lesson=...`) per la navigazione locale. Il semplice push di una repository non configura da solo il dominio. I font e gli effetti 3D del portfolio originale possono richiedere Internet; School usa font di sistema e materiali locali. Eventuali link a documentazione esterna nei materiali sono mantenuti.

## Refactor delle lezioni autonome

`npm run catalog` esegue prima `scripts/catalog.cjs`, poi `scripts/lesson-pages.cjs`. La navigazione segue l’ordine di `courses.json`, rimane nello stesso percorso e non ricomincia dall’inizio quando raggiunge l’ultima pagina. Il generatore usa blocchi `<!-- SCHOOL:... -->` per header, footer e metadati: modifica i contenuti didattici fuori da questi blocchi. Il comando è ripetibile senza duplicare la navigazione. La home del portfolio non è stata modificata dal refactor.

Il catalogo contiene link diretti già nell’HTML. I capitoli Node hanno testo statico; slide, quiz ed esercizi conservano gli script necessari alle loro interazioni. I materiali sono indicati come curati e rielaborati, mantenendo i riferimenti presenti.

`npm test` verifica tutte le pagine: ordine didattico, link reciproci, confini dei percorsi, ritorno al catalogo in sottocartelle e da file, metadati unici e stabilità della rigenerazione.

## Laboratori

Laboratori è una categoria trasversale ai percorsi, accanto a Lezioni, Esercizi e Test. Usa `<meta name="school-kind" content="lab">` per aggiungerne uno. Il filtro rimane attivo passando da un percorso all’altro e si può condividere con `teaching/index.html?course=node&kind=lab`. Il laboratorio di crittografia esistente è classificato nella stessa categoria.

I laboratori Node sono tre, da affrontare in più incontri:

- `laboratorio-http.html`: nove tappe con GET e URL, una pausa sugli status code, HTML incorporato, link e form GET, lettura di HTML dal disco e immagini PNG/JPEG. Il frontend non usa CSS né JavaScript; è disponibile una PNG locale pronta da scaricare.
- `laboratorio-metodi.html`: POST senza dati, lettura di un form, PUT e DELETE separati, una nota in memoria e infine due frontend fetch essenziali (prima con then, poi con async/await).
- `laboratorio-express.html`: tre piccoli esempi con Express 5, dalla prima GET alle risposte HTML/testo/JSON e a un form POST.

Ogni versione di `server.cjs` è completa e usa `IP` e `PORT` anche nel log di `listen`. I laboratori restano separati dalla sequenza delle lezioni. Ogni tappa include obiettivo, comandi, risultati attesi e una piccola estensione. `npm test` esegue gli esempi Node estratti dalle pagine su porte temporanee e chiude sempre i server. Per verificare anche Express installalo in una cartella di test esterna e imposta `NODE_LAB_EXPRESS_DIR` al suo percorso: il sito statico non dipende da Express.

## C++: dalle struct al gioco a turni

Il percorso comprende 16 capitoli. Dopo i 12 capitoli di base, i capitoli 13–16 introducono struct, classi e oggetti, ereditarietà e polimorfismo. Ciascuno ha un laboratorio separato, per un totale di 31 programmi completi tra spiegazioni e pratica. Gli esempi usano `using namespace std;` nei piccoli file didattici e includono input, riferimenti, regole della vita, mana, cure, composizione, dispatch virtuale e cicli di gioco con eroi, nemici e boss. Le vittorie e le sconfitte sono deterministiche, senza dipendenze o motori di gioco.

`scripts/test-cpp-labs.cjs` estrae i programmi e le uscite attese dalle pagine. Con `g++` o `clang++` nel PATH, oppure `CPP_COMPILER` configurato (supporta anche `zig c++`), compila in C++17, esegue i programmi e verifica anche due scenari di sconfitta e tre errori di compilazione intenzionali. Senza compilatore controlla struttura e presenza degli esempi, dichiarando esplicitamente che la compilazione non è stata eseguita. I file di prova sono temporanei.

Le pagine Fonti dei percorsi Node.js e crittografia contengono una sezione Crediti che cita rispettivamente i corsi YouTube di Edoardo Midali e Roberto Rossi come riferimenti degli appunti teorici, distinguendoli dai laboratori e dalle integrazioni originali. Introduzioni e catalogo rimandano alla sezione, senza attribuzioni generali ai corsi video.
