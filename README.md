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
4. Indica il tipo con `<meta name="school-kind" content="lesson">`, `exercise` oppure `test`. Senza metadati, i nomi che contengono `esercizi`, `soluzioni`, `quiz` o `test` vengono classificati automaticamente.
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
