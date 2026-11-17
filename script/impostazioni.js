/* ════════════════════════════════════════════════════════════════
   IMPOSTAZIONI DEL SITO · si modificano SOLO qui
   ────────────────────────────────────────────────────────────────
   Come collegare il sito a Discord (2 minuti):
   1. Su Discord apri il canale dove vuoi ricevere le candidature
      → Modifica canale → Integrazioni → Webhook → Nuovo webhook
      → «Copia URL del webhook».
   2. Incolla l'indirizzo tra le virgolette di webhookCandidature.
   3. Fai lo stesso con il canale degli esiti degli esami
      (può essere anche lo stesso canale) e incollalo in webhookEsami.
   Se lasci le virgolette vuote il sito funziona lo stesso: invece di
   inviare, mostra il testo pronto da copiare e incollare su Discord.
   ════════════════════════════════════════════════════════════════ */
window.GU_IMPOSTAZIONI = {
  // Indirizzo pubblico del sito (serve per i link nei messaggi Discord)
  indirizzoSito: 'https://gangunit-now.github.io/',

  // Link d'invito al server Discord (facoltativo), es. 'https://discord.gg/abc123'
  invitoDiscord: '',

  // Webhook del canale dove arrivano le candidature ai bandi
  webhookCandidature: '',

  // Webhook del canale dove arrivano gli esiti degli esami
  webhookEsami: '',

  // Webhook del canale dove arrivano gli screen di chi chiede di essere verificato come membro GU (facoltativo)
  webhookVerifiche: '',

  // true = su Discord arrivano anche le verifiche di capitolo, non solo l'esame d'accademia
  inviaEsamiCapitolo: false,

  // Ruolo da avvisare quando arriva una candidatura o un esito (facoltativo).
  // Si scrive così: '<@&ID_DEL_RUOLO>'  (ID: tasto destro sul ruolo → Copia ID)
  menzioneCandidature: '',
  menzioneEsami: '',

  // Alto Comando mostrato in home e nella gerarchia.
  // Foto e nome si aggiornano da soli dal profilo Discord (servono solo gli ID).
  // In «nome» puoi scrivere il nome del personaggio: se resta vuoto si usa il nome Discord.
  // ARCHIVIO ONLINE (Supabase): accende accesso con Discord, verifica dei membri e Area Comando.
  // Si trovano in Supabase → Project Settings → API. Istruzioni nel LEGGIMI.txt, punto 5.
  // Se restano vuoti, il sito è tutto aperto e l'Area Comando resta spenta.
  supabaseUrl: 'https://ualahkrbqqzlqvqrgleh.supabase.co',
  supabaseChiave: 'sb_publishable_71gjjZgx-KwNf0VWO-n3bw_YVxJcniF',

  altoComando: [
    { grado: 'Comandante', discordId: '156804728926240769', nome: '' },
    { grado: 'Vice Comandante', discordId: '1069275006376362195', nome: '' }
  ]
};
