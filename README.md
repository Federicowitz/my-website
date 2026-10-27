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
5. Esegui `npm run catalog`, poi `npm run check`.

Per un nuovo argomento aggiungi una cartella in `teaching/materials/` e una voce in `teaching/courses.json`: `id`, `folder`, `title`, `symbol`, `description`, `order` (array dei nomi file in ordine didattico, può essere vuoto). Non occorre modificare il frontend. I capitoli Node sono file indipendenti: eventuali modifiche al manuale completo vanno riportate anche nel capitolo corrispondente.

## Struttura

- `teaching/school.css`: interfaccia del catalogo e lettore.
- `teaching/reader.css`: tema condiviso di lezioni, esercizi e test.
- `teaching/catalog.js`: catalogo generato, da includere nel commit.
- `teaching/materials/`: lezioni originali, 28 capitoli Node, mappa, laboratorio, ripasso, fonti, manuale completo e tre verifiche.
- `scripts/catalog.cjs`: scansione locale, nessuna API esterna.

Il lettore carica solo il materiale selezionato in un iframe. Ricerca e filtri operano sul catalogo, senza scaricare tutte le lezioni. Sono supportati URL condivisibili (`/teaching/?lesson=...`) e la cronologia del browser. Completamento e risultati dei test sono salvati nel localStorage del browser, senza account o backend. I progressi degli esercizi originali sono conservati dalla loro logica esistente.

## Pubblicazione futura

Questa cartella può essere versionata e inviata su GitHub. Non è stata creata una repository né eseguito un push. Su un hosting statico copia tutta la cartella, mantenendo `teaching/index.html`. I collegamenti relativi funzionano dalla radice del dominio e da sottocartelle, compreso un progetto GitHub Pages. Puoi anche aprire `index.html` direttamente dal disco: in quel caso School usa il frammento URL (`#lesson=...`) per la navigazione locale. Il semplice push di una repository non configura da solo il dominio. I font e gli effetti 3D del portfolio originale possono richiedere Internet; School usa font di sistema e materiali locali. Eventuali link a documentazione esterna nei materiali sono mantenuti.
