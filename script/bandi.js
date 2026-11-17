/* ════════════════════════════════════════════════════════════════
   BANDI DI RECLUTAMENTO
   ────────────────────────────────────────────────────────────────
   Per aprire un bando nuovo copia un blocco { ... }, cambia i testi
   e le date. Il sito decide da solo se è IN ARRIVO, APERTO o CHIUSO
   guardando le date di apertura e chiusura (formato AAAA-MM-GGTHH:MM).
   Su Discord non serve più scrivere il bando: nel sito c'è il pulsante
   «Copia annuncio per Discord» che lo prepara già formattato.
   ════════════════════════════════════════════════════════════════ */
window.GU_BANDI = [
  {
    id: 'agenti-2026-01',
    numero: 'Bando n. 01/2026',
    titolo: 'Reclutamento Agenti Gang Unit',
    sottotitolo: "Ingresso come Recluta, con percorso verso Agente I",
    apertoA: 'Cittadini di Los Santos, non LSPD',
    apertura: '2026-11-12T18:00',
    chiusura: '2026-11-30T23:59',
    posti: 6,
    esameRichiesto: false,
    descrizione: "La Gang Unit cerca persone motivate da inserire nel reparto come Reclute. I selezionati seguiranno la formazione prevista dall'art. 2.4 del regolamento, sempre affiancati da un Supervisore, fino alla promozione ad Agente I.",
    requisiti: [
      'Non far parte della LSPD',
      'Nessuna sanzione dello staff negli ultimi 30 giorni',
      'Età reale minima di 17 anni, microfono funzionante e Discord attivo',
      'Disponibilità di almeno 8 ore di servizio a settimana',
      'Nessun personaggio legato a gang o organizzazioni criminali (art. 1.4)'
    ],
    preferenziali: [
      'Esperienza in reparti operativi o investigativi',
      'Buona conoscenza dei territori e delle gang di Los Santos',
      'Rapporti scritti chiari e completi'
    ],
    fasi: [
      ['Candidatura', 'Si invia dal sito entro la chiusura del bando.'],
      ['Verifica requisiti', "L'Ufficio del Personale controlla i requisiti e le sanzioni dello staff."],
      ['Colloquio', 'Colloquio orale su Discord con un Tenente II o superiore, con un caso pratico.'],
      ['Esito', "L'esito compare sul sito, nella pagina Bandi, entro 5 giorni dalla chiusura."],
      ['Periodo da Recluta', "Almeno 1 settimana affiancati, 3 valutazioni positive e l'esame d'accademia per diventare Agente I."]
    ],
    note: 'Le candidature incomplete o inviate fuori dal sito non vengono valutate.'
  }
];
