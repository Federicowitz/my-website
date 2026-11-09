function visualPanel(id, modes, title, intro, level = 'base') {
  return `<section class="lab-panel" id="${id}" data-routing-visual="${modes}" data-level="${level}">
<h2>${title}</h2><p>${intro}</p>
<noscript>Abilita JavaScript per usare i comandi della simulazione.</noscript>
</section>`;
}

const lessonPanels = {
  '04': visualPanel('esperimento-visuale', 'packet', 'Segui il punto blu',
    'Passiamo dai quattro router dell’esempio a una rete di dodici. A fa da gateway e L consegna al server. Premi Avanti e segui prima l’andata, poi il ritorno.', 'intro'),
  '05': visualPanel('esperimento-visuale', 'prefix', 'Prova una destinazione',
    'Qui vedi un solo router con le sue uscite. Scegli un indirizzo e avanza per vedere quali righe corrispondono e quale uscita viene usata.'),
  '06': visualPanel('rotta-manuale', 'manual', 'Scegli la strada e prova il ritorno',
    'Scegli R2 o R3 e imposta «Manca la rotta di ritorno». Avanza fino a quando la risposta si ferma a R4. Poi torna a «Rete operativa» per ripristinare la rotta e ripeti il viaggio.') +
    visualPanel('esperimento-visuale', 'static', 'Lo stesso problema nella rete grande',
      'Segui il percorso da A a L e osserva cosa succede quando si rompe il collegamento E–H.'),
  '07': visualPanel('esperimento-visuale', 'spf', 'Guarda come Dijkstra aggiorna i costi',
    'Nella rete di dodici router, A cerca il percorso meno costoso verso L. Avanza e osserva quali distanze cambiano. Poi aumenta il costo di E–H e ripeti.'),
  '08': visualPanel('esperimento-visuale', 'ospf', 'Dal guasto alla nuova rotta',
    'Segui la notizia del guasto E–H. Quando la mappa è aggiornata, confronta il vecchio percorso con quello nuovo.'),
  '09': visualPanel('esperimento-visuale', 'rip,spf', 'Confronta i due percorsi',
    'Segui come la distanza da L si propaga ai vicini. Poi passa a Dijkstra e confronta il percorso di costo minimo con quello di due salti.'),
  '10': visualPanel('esperimento-visuale', 'bgp', 'Cambia la preferenza dell’azienda',
    'Qui ogni nodo è un sistema autonomo. L’azienda è 64512 e vuole raggiungere la rete annunciata da 64540. Prova prima con preferenze uguali, poi dai priorità al fornitore 64520.'),
  '11': visualPanel('esperimento-visuale', 'diagnostic', 'Segui il pacchetto fino al guasto',
    'Scegli una rotta mancante, un guasto al collegamento o un ritorno interrotto. Individua il punto di arresto e confrontalo con la tabella della lezione.'),
  '12': visualPanel('esperimento-visuale', 'static,ospf', 'Verifica il laboratorio 3',
    'Avanza con le rotte statiche, poi ripeti con OSPF sullo stesso collegamento guasto.'),
  '13': visualPanel('esperimento-visuale', 'packet,static,ospf,diagnostic', 'Ripercorri lo scenario',
    'Segui il pacchetto a rete integra, poi confronta i due modi di reagire al guasto E–H. Nella diagnostica prova «Manca la rotta di andata» per vedere lo scarto al gateway A.', 'intro')
};

module.exports = { lessonPanels, visualPanel };
