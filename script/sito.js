/* ════════════════════════════════════════════════════════════════
   GANG UNIT · NOW V4 — funzionamento del sito
   (testi da cambiare: impostazioni.js, bandi.js, esami.js)
   ════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
  const RIDOTTO = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CFG = Object.assign({ indirizzoSito: '', invitoDiscord: '', webhookCandidature: '', webhookEsami: '', webhookVerifiche: '', inviaEsamiCapitolo: false, menzioneCandidature: '', menzioneEsami: '', supabaseUrl: '', supabaseChiave: '', altoComando: [] }, window.GU_IMPOSTAZIONI || {});
  let BANDI = window.GU_BANDI || [];
  const ESAMI = window.GU_ESAMI || { capitoli: [], finale: null, sogliaCapitolo: .7 };
  const escT = s => String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const dataIt = d => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  const oraIt = d => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const mmss = s => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
  const mescola = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const firma = s => { let h = 2166136261; for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36).toUpperCase().padStart(6, '0').slice(-6); };
  const tronca = (s, n = 1000) => { s = String(s || '').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : (s || '—'); };
  const sitoURL = () => { let u = CFG.indirizzoSito || (/^https?:/.test(location.href) ? location.href.split('#')[0] : ''); if (u && !u.endsWith('/') && !/\.html?$/.test(u)) u += '/'; return u.replace(/index\.html?$/, ''); };
  const SALTA = { behavior: 'instant' };

  let tt;
  function toast(m, tipo = '') { const t = $('#toast'); t.textContent = m; t.className = 'toast vis ' + tipo; clearTimeout(tt); tt = setTimeout(() => { t.className = 'toast ' + tipo; }, 3000); }
  async function copia(testo) {
    try { await navigator.clipboard.writeText(testo); return true; }
    catch { const ta = document.createElement('textarea'); ta.value = testo; ta.style.cssText = 'position:fixed;opacity:0;top:0'; document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch {} ta.remove(); return ok; }
  }
  function chiedi(t, p, si = 'Conferma', no = 'Annulla') {
    const d = $('#dialogo');
    if (!d.showModal) return Promise.resolve(confirm(t + '\n\n' + p));
    $('#dg-t').textContent = t; $('#dg-p').textContent = p; $('#dg-si').textContent = si; $('#dg-no').textContent = no;
    return new Promise(res => { d.returnValue = ''; d.addEventListener('close', () => res(d.returnValue === 'si'), { once: true }); d.showModal(); });
  }

  // Sfumature SVG condivise (fuori dalle viste nascoste, così si vedono ovunque)
  document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <linearGradient id="go" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1b8"/><stop offset=".5" stop-color="#f2b938"/><stop offset="1" stop-color="#a8700f"/></linearGradient>
    <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#c9d1de"/><stop offset="1" stop-color="#6d7a91"/></linearGradient>
    <linearGradient id="g-anello" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b82f6"/><stop offset=".55" stop-color="#8b5cf6"/><stop offset="1" stop-color="#ff4d5e"/></linearGradient>
  </defs></svg>`);

  /* ═════════════ GERARCHIA ILLUSTRATA ═════════════ */
  const ORO = 'url(#go)';
  const chev = (y, f = ORO) => `<path d="M7 ${y + 6}L27 ${y - 6}L47 ${y + 6}V${y + 12}L27 ${y}L7 ${y + 12}Z" fill="${f}" stroke="#2a1a03" stroke-width="1"/>`;
  const rock = y => `<path d="M7 ${y}Q27 ${y + 10} 47 ${y}V${y + 5}Q27 ${y + 15} 7 ${y + 5}Z" fill="${ORO}" stroke="#2a1a03" stroke-width="1"/>`;
  const barra = x => `<rect x="${x}" y="9" width="9" height="36" rx="2" fill="url(#ga)" stroke="#2a3550" stroke-width="1"/>`;
  const stella = (cx, cy, r) => { let p = ''; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * .42 : r; p += `${k ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`; } return `<path d="${p}Z" fill="${ORO}" stroke="#2a1a03" stroke-width="1"/>`; };
  const INS = {
    'Comandante': stella(27, 15, 11) + stella(14, 37, 11) + stella(40, 37, 11),
    'Vice Comandante': stella(15, 27, 12) + stella(39, 27, 12),
    'Capitano': barra(8) + barra(22.5) + barra(37),
    'Tenente II': barra(15) + barra(30),
    'Tenente I': barra(22.5),
    'Sergente II': chev(6) + chev(15) + chev(24) + rock(36) + rock(44),
    'Sergente I': chev(8) + chev(17) + chev(26) + rock(40),
    'Agente III': chev(12) + chev(22) + chev(32),
    'Agente II': chev(17) + chev(27),
    'Agente I': chev(22),
    'Recluta': `<path d="M7 28L27 16L47 28V34L27 22L7 34Z" fill="none" stroke="#f2b938" stroke-width="2" stroke-dasharray="3 2"/>`,
  };
  const FASCE = [
    ['Alto Comando', 'Guida e decisioni finali', [['Comandante', 'CMD', 'Guida l\'unità, approva le operazioni maggiori, decide su promozioni ed espulsioni.'], ['Vice Comandante', 'VCM', 'Sostituisce il Comandante, coordina gli Ufficiali e la disciplina.']]],
    ['Ufficiali', 'Pianificazione e personale', [['Capitano', 'CPT', 'Pianifica e autorizza raid e operazioni, gestisce il personale.'], ['Tenente II', 'TN2', 'Responsabile operativo sul campo, gestisce ferie e candidature.'], ['Tenente I', 'TN1', 'Coordina le squadre in servizio e controlla i rapporti.']]],
    ['Supervisori', 'Capi pattuglia e istruttori', [['Sergente II', 'SG2', 'Capo pattuglia, istruttore d\'accademia, emette richiami.'], ['Sergente I', 'SG1', 'Capo pattuglia, valuta le reclute a fine turno.']]],
    ['Agenti', 'Il cuore operativo', [['Agente III', 'AG3', 'Agente esperto, guida una pattuglia se mancano i Supervisori.'], ['Agente II', 'AG2', 'Agente operativo, partecipa a raid e operazioni.'], ['Agente I', 'AG1', 'Agente operativo in pattuglia.'], ['Recluta', 'REC', 'In formazione, sempre affiancata da un Supervisore o da un Agente III.']]],
  ];
  const svgGrado = n => `<svg viewBox="0 0 54 54" aria-hidden="true">${INS[n]}</svg>`;
  $('#piramide').innerHTML = FASCE.map(([n, d, g]) => `<div class="fascia-g"><h4>${n}<span>${d}</span></h4><div class="gradi">${g.map(([nome, sig, f]) => `<div class="grado">${svgGrado(nome)}<div><b>${nome}</b><code>${sig}</code><p>${f}</p></div></div>`).join('')}</div></div>`).join('');

  /* ═════════════ CODICI RADIO ═════════════ */
  const CODICI = [
    ['10-4', 'Ricevuto', 'stato'], ['10-6', 'Occupato', 'stato'], ['10-7', 'Fuori servizio', 'stato'], ['10-8', 'In servizio', 'stato'],
    ['10-9', 'Ripetere', 'stato'], ['10-20', 'Posizione', 'stato'], ['10-23', 'Arrivato sul posto', 'stato'], ['10-41', 'Inizio turno', 'stato'], ['10-42', 'Fine turno', 'stato'],
    ['10-10', 'Rissa in corso', 'intervento'], ['10-15', 'Soggetto in custodia, in arrivo in centrale', 'intervento'], ['10-28', 'Controllo targa', 'intervento'], ['10-29', 'Controllo precedenti', 'intervento'],
    ['10-38', 'Fermo di un veicolo', 'intervento'], ['10-50', 'Incidente stradale', 'intervento'], ['10-55', 'Traffic stop', 'intervento'], ['10-66', 'Veicolo o persona sospetta', 'intervento'],
    ['10-32', 'Persona armata', 'emergenza'], ['10-71', 'Spari sul posto', 'emergenza'], ['10-80', 'Inseguimento', 'emergenza'], ['10-90', 'Rapina in corso', 'emergenza'], ['10-99', 'Agente in pericolo, tutte le unità', 'emergenza'],
    ['G-1', 'Avvistamento di membri di una gang nota', 'gang'], ['G-2', 'Raduno di gang armate', 'gang'], ['G-3', 'Scontro tra gang in corso', 'gang'],
    ['G-4', 'Covo o laboratorio individuato', 'gang'], ['G-5', 'Operazione GU in corso, unità non GU fuori dall\'area', 'gang'], ['G-6', 'Informatore sul posto, non intervenire', 'gang'],
  ];
  const NOMI_T = { stato: 'Stato', intervento: 'Intervento', emergenza: 'Emergenza', gang: 'Gang Unit' };
  const righeRadio = CODICI.map(([c, s, t]) => `<tr data-t="${t}"><td class="cod">${c}</td><td>${s}</td><td><span class="pill ${t}">${NOMI_T[t]}</span></td></tr>`).join('');
  $('#radio tbody').innerHTML = righeRadio;
  $('#s-radio tbody').innerHTML = righeRadio;
  const radioRadice = el => el.closest('.art, .riquadro');
  function filtraRadio(root) {
    if (!root) return;
    const f = root.dataset.f || 'tutti', v = ($('.radio-ctl input', root)?.value || '').trim().toLowerCase();
    $$('tbody tr', root).forEach(tr => { tr.style.display = (f === 'tutti' || tr.dataset.t === f) && (!v || tr.textContent.toLowerCase().includes(v)) ? '' : 'none'; });
    $$('.filtro', root).forEach(b => b.setAttribute('aria-pressed', b.dataset.f === f));
  }

  /* ═════════════ ARTICOLI: ancore, «letto», verifiche di capitolo ═════════════ */
  const ARTS = $$('.art');
  for (const art of ARTS) {
    const anc = document.createElement('a'); anc.className = 'anc'; anc.href = '#' + art.id; anc.textContent = '# link'; $('h3', art).appendChild(anc);
    const d = document.createElement('div'); d.className = 'leggi'; d.innerHTML = '<button type="button">Segna come letto</button>'; art.appendChild(d);
    art.classList.add('rivela');
  }
  for (const c of ESAMI.capitoli) {
    const sez = document.getElementById(c.id); if (!sez) continue;
    sez.insertAdjacentHTML('beforeend', `<a class="cap-esame rivela" href="#esame-${c.id}" data-esame="${c.id}"><span class="ce-i">🎯</span><span><b>Verifica del capitolo ${c.n}</b><small>${Math.min(c.domande, c.banca.length)} domande · ${c.minuti} minuti · soglia ${Math.round(ESAMI.sogliaCapitolo * 100)}%</small></span><span class="ce-v">Inizia →</span></a>`);
  }

  /* ═════════════ INDICE ═════════════ */
  const toc = $('#toc');
  for (const cap of $$('.capitolo')) {
    const li = document.createElement('li');
    li.innerHTML = `<a href="#${cap.id}"><span class="r">${cap.dataset.r}</span>${cap.dataset.t}</a><div class="bar"><i data-cap="${cap.id}"></i></div><ol></ol>`;
    for (const art of $$('.art', cap)) {
      const ref = $('.ref', art).textContent.replace('ART. ', '');
      $('ol', li).insertAdjacentHTML('beforeend', `<li><a href="#${art.id}" data-art="${art.id}"><span class="r">${ref}</span>${art.dataset.t}</a></li>`);
    }
    toc.appendChild(li);
  }
  toc.insertAdjacentHTML('beforeend', `<li><a href="#esami"><span class="r">★</span>Centro esami</a></li>`);
  const indice = $('#indice'), ib = $('#indice-btn');
  const chiudiIndice = () => { indice.classList.remove('aperto'); ib.setAttribute('aria-expanded', 'false'); };
  ib.addEventListener('click', e => { e.stopPropagation(); const o = indice.classList.toggle('aperto'); ib.setAttribute('aria-expanded', o); });
  toc.addEventListener('click', e => { if (e.target.closest('a')) chiudiIndice(); });
  document.addEventListener('click', e => { if (indice.classList.contains('aperto') && !e.target.closest('#indice')) chiudiIndice(); });

  /* ═════════════ LETTURA ═════════════ */
  const letti = new Set(LS.get('gu-letti', []));
  function aggiornaLetti() {
    for (const art of ARTS) {
      const ok = letti.has(art.id); art.classList.toggle('letto', ok);
      const b = $('.leggi button', art); if (b) b.textContent = ok ? '✓ Letto' : 'Segna come letto';
      const a = $(`#toc a[data-art="${art.id}"]`); if (a) a.classList.toggle('fatto', ok);
    }
    for (const cap of $$('.capitolo')) {
      const a = $$('.art', cap), n = a.filter(x => letti.has(x.id)).length;
      const i = $(`#toc i[data-cap="${cap.id}"]`); if (i) i.style.width = (n / a.length * 100) + '%';
      const card = $(`.cap-a[data-cap="${cap.id}"]`);
      if (card) {
        const ev = esiti()[cap.id], st = $('.stato', card);
        $('.n-art', card).textContent = `${a.length} articoli`;
        $('.barretta i', card).style.width = (n / a.length * 100) + '%';
        st.textContent = n === a.length ? '✓ letto' + (ev ? ` · verifica ${ev.best}%` : '') : n ? `${n}/${a.length} letti` : (ev ? `verifica ${ev.best}%` : 'da leggere');
        st.classList.toggle('ok', n === a.length);
      }
    }
    const n = ARTS.filter(a => letti.has(a.id)).length, p = n / ARTS.length;
    $('#letti-n').textContent = n; $('#letti-t').textContent = `di ${ARTS.length} articoli letti`;
    $('#anello').style.strokeDashoffset = 327 - 327 * p;
    $('#anello2').style.strokeDashoffset = 327 - 327 * p;
    $('#letti-n2').textContent = Math.round(p * 100) + '%';
  }

  /* ═════════════ RICERCA ═════════════ */
  const originali = new Map(ARTS.map(a => [a, a.innerHTML]));
  const q = $('#q'), esito = $('#esito');
  function evidenzia(nodo, re) {
    const w = document.createTreeWalker(nodo, NodeFilter.SHOW_TEXT, { acceptNode: t => t.parentElement.closest('button,.ref,.anc,svg') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    const testi = []; while (w.nextNode()) testi.push(w.currentNode);
    for (const t of testi) {
      re.lastIndex = 0; if (!re.test(t.data)) continue; re.lastIndex = 0;
      const s = document.createElement('span'); s.innerHTML = escT(t.data).replace(re, m => `<mark>${m}</mark>`); t.replaceWith(...s.childNodes);
    }
  }
  let tm;
  q.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(cerca, 140); if (q.value.trim() && vista !== 'regolamento') location.hash = 'regolamento'; });
  function cerca() {
    const v = q.value.trim().toLowerCase(); let n = 0;
    for (const [art, html] of originali) {
      if (art.innerHTML !== html) art.innerHTML = html;
      const ok = !v || art.textContent.toLowerCase().includes(v);
      art.classList.toggle('nascosto', !ok);
      if (ok && v) { n++; evidenzia(art, new RegExp(escT(v).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')); }
    }
    for (const cap of $$('.capitolo')) cap.style.display = $$('.art:not(.nascosto)', cap).length ? '' : 'none';
    $$('.cap-esame').forEach(c => { c.style.display = v ? 'none' : ''; });
    esito.textContent = v ? `${n} art.` : '';
    $('#vuoto').style.display = v && !n ? 'block' : 'none';
    filtraRadio($('#art-5-1')); aggiornaLetti(); minaccia(livello, false); inCarica();
    if (v && vista === 'regolamento') scrollTo({ top: 0, ...SALTA });
  }
  addEventListener('keydown', e => {
    const scrivendo = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if (e.key === '/' && !scrivendo && !prova) { e.preventDefault(); if (innerWidth <= 900) apriMenu(true); q.focus(); }
    if (e.key === 'Escape' && document.activeElement === q) { q.value = ''; cerca(); q.blur(); }
    if (prova && !scrivendo && !$('#dialogo').open) {
      if (e.key === 'ArrowRight') { e.preventDefault(); vaiDomanda(prova.i + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); vaiDomanda(prova.i - 1); }
    }
  });

  /* ═════════════ LIVELLO DI MINACCIA ═════════════ */
  const LIV = ['verde', 'giallo', 'rosso'];
  let livello = LS.get('gu-minaccia', 'verde'); if (!LIV.includes(livello)) livello = 'verde';
  function minaccia(l, salva = true) {
    livello = l; document.body.dataset.minaccia = l;
    const mt = $('#min-t'); if (mt) mt.textContent = l[0].toUpperCase() + l.slice(1);
    $$('.livelli .livello').forEach(b => b.setAttribute('aria-pressed', b.dataset.l === l));
    $$('#nastro .liv').forEach(x => { x.textContent = l.toUpperCase(); });
    if (salva) { LS.set('gu-minaccia', l); toast(`Livello di minaccia ${l.toUpperCase()}`, l === 'rosso' ? 'ko' : ''); }
  }

  /* ═════════════ CLIC GENERALI (delegati: sopravvivono alla ricerca) ═════════════ */
  document.addEventListener('click', async e => {
    const lb = e.target.closest('.leggi button');
    if (lb) { const id = lb.closest('.art').id; letti.has(id) ? letti.delete(id) : letti.add(id); LS.set('gu-letti', [...letti]); aggiornaLetti(); return; }
    const cp = e.target.closest('.copia');
    if (cp && cp.closest('.modulo')) {
      const pre = cp.closest('.modulo').querySelector('pre'), lbl = cp.dataset.l || (cp.dataset.l = cp.textContent);
      const testo = cp.dataset.discord ? pre.dataset.discord || pre.innerText : pre.innerText;
      cp.textContent = (await copia(testo)) ? 'Copiato ✓' : 'Seleziona e copia';
      setTimeout(() => { cp.textContent = lbl; }, 2200); return;
    }
    const mz = e.target.closest('[data-menz]'); if (mz) { toast((await copia(`<@${mz.dataset.menz}>`)) ? 'Menzione copiata: incollala su Discord' : 'Copia non riuscita', 'ok'); return; }
    const f = e.target.closest('.filtro'); if (f) { const root = radioRadice(f); root.dataset.f = f.dataset.f; filtraRadio(root); return; }
    const lv = e.target.closest('.livelli .livello'); if (lv) { minaccia(lv.dataset.l); return; }
    if (e.target.closest('#minaccia')) { minaccia(LIV[(LIV.indexOf(livello) + 1) % 3]); return; }
    const a = e.target.closest('a[href^="#"]');
    if (a && a.getAttribute('href') === (location.hash || '#home') && !document.getElementById(a.getAttribute('href').slice(1))) { e.preventDefault(); chiudiMenu(); scrollTo({ top: 0, behavior: RIDOTTO ? 'instant' : 'smooth' }); }
  });
  document.addEventListener('input', e => { if (e.target.matches('.radio-ctl input')) filtraRadio(radioRadice(e.target)); });
  $('#su').addEventListener('click', e => { e.preventDefault(); scrollTo({ top: 0, behavior: RIDOTTO ? 'instant' : 'smooth' }); });

  /* ═════════════ MENU (telefono) ═════════════ */
  const menu = $('#menu'), mb = $('#menu-btn');
  function apriMenu(o) { menu.classList.toggle('aperto', o); mb.setAttribute('aria-expanded', o); }
  const chiudiMenu = () => { if (document.activeElement !== q) apriMenu(false); };
  mb.addEventListener('click', () => apriMenu(!menu.classList.contains('aperto')));
  $('.nav').addEventListener('click', e => { if (e.target.closest('a')) apriMenu(false); });

  /* ═════════════ BANDI: utilità ═════════════ */
  const statoBando = b => { const now = Date.now(), a = +new Date(b.apertura), c = +new Date(b.chiusura); if (now > c) return 'chiuso'; if (now < a) return 'arrivo'; return 'aperto'; };
  const NOMI_STATO = { aperto: 'Aperto', arrivo: 'In arrivo', chiuso: 'Chiuso' };
  const dataB = s => { const d = new Date(s); return `${dataIt(d)} · ${oraIt(d)}`; };
  function quanto(ms) {
    if (ms <= 0) return '00:00:00';
    const s = Math.floor(ms / 1000), g = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), ss = s % 60;
    return g ? `${g}g ${pad(h)}h ${pad(m)}m` : `${pad(h)}:${pad(m)}:${pad(ss)}`;
  }
  const bandiAperti = () => BANDI.filter(b => statoBando(b) === 'aperto');

  /* ═════════════ NASTRO ═════════════ */
  function nastro() {
    if (!$('#nastro')) return;
    const voci = ['LIVELLO DI MINACCIA <em class="liv">VERDE</em>', '<b>GU-NOW-001</b> · REV. 1.0 IN VIGORE', '<b>10-99</b> AGENTE IN PERICOLO · TUTTE LE UNITÀ', '<b>G-3</b> SCONTRO TRA GANG · NON ENTRARE DA SOLI', 'RAID SOLO CON AUTORIZZAZIONE DEL <b>CAPITANO</b>', 'TIMBRA SEMPRE ENTRATA E USCITA', '<b>CODICE 5</b> AVVICINAMENTO SILENZIOSO', 'NESSUN CONTATTO NON OPERATIVO CON LE GANG', 'LA VITA DELL\'OSTAGGIO VIENE PRIMA DI TUTTO'];
    for (const b of bandiAperti()) voci.splice(1, 0, `<b>BANDO APERTO</b> · ${esc(b.titolo.toUpperCase())} · CANDIDATURE SUL SITO`);
    $('#nastro').innerHTML = [...voci, ...voci].map(v => `<span>${v}</span>`).join('');
  }

  /* ═════════════ VISTE E NAVIGAZIONE ═════════════ */
  const VISTE = { home: $('#v-home'), regolamento: $('#v-regolamento'), strumenti: $('#v-strumenti'), bandi: $('#v-bandi'), esami: $('#v-esami'), comando: $('#v-comando'), bloccato: $('#v-bloccato') };
  let vista = null;
  function risolvi(h) {
    if (!h || h === 'top' || h === 'home') return { v: 'home' };
    if (h === 'regolamento') return { v: 'regolamento' };
    if (/^(cap-|art-|app-)/.test(h)) return { v: 'regolamento', el: h };
    if (h === 'strumenti') return { v: 'strumenti' };
    if (h.startsWith('strumenti-')) return { v: 'strumenti', s: h.slice(10) };
    if (h === 'bandi') return { v: 'bandi' };
    if (h.startsWith('bando-')) return { v: 'bandi', bando: h.slice(6) };
    if (h.startsWith('candidatura-')) return { v: 'bandi', cand: h.slice(12) };
    if (h === 'esami' || h === 'esame') return { v: 'esami' };
    if (h === 'attestato') return { v: 'esami', attestato: true };
    if (h === 'comando') return { v: 'comando' };
    if (h.startsWith('esame-')) return { v: 'esami', esame: h.slice(6) };
    return { v: 'home' };
  }
  function mostraVista(v) {
    const cambia = v !== vista;
    if (cambia) { for (const [k, el] of Object.entries(VISTE)) el.hidden = k !== v; vista = v; document.body.dataset.vista = v; }
    $$('.nav a').forEach(a => a.classList.toggle('on', a.dataset.v === v));
    return cambia;
  }
  function scorriA(id, salta) {
    const el = document.getElementById(id); if (!el) return false;
    requestAnimationFrame(() => el.scrollIntoView({ behavior: salta || RIDOTTO ? 'instant' : 'smooth', block: 'start' }));
    return true;
  }
  let ultimoHash = location.hash;
  async function vai() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (prova) {
      const ok = await chiedi('Abbandonare l\'esame?', 'L\'esame è ancora in corso. Se esci, le risposte date finora andranno perse e il tentativo non verrà registrato.', 'Abbandona', 'Resta');
      if (!ok) { history.replaceState(null, '', prova.hash); return; }
      stopProva();
    }
    ultimoHash = location.hash;
    const r = risolvi(h);
    if (!puoVedere(r.v)) { mostraBloccato(r.v); chiudiMenu(); scrollTo({ top: 0, ...SALTA }); return; }
    const cambia = mostraVista(r.v);
    chiudiMenu();
    let scorso = false;
    if (r.v === 'regolamento' && r.el) scorso = scorriA(r.el, cambia);
    if (r.v === 'strumenti') apriScheda(r.s || scheda);
    if (r.v === 'bandi') {
      renderBandi(r.bando); renderEsiti();
      if (r.cand) { apriCandidatura(r.cand); scorso = scorriA('candidatura', cambia); }
      else { $('#candidatura').hidden = true; if (r.bando) scorso = scorriA('bando-' + r.bando, cambia); }
    }
    if (r.v === 'esami') {
      if (r.esame) introEsame(r.esame);
      else if (r.attestato) mostraAttestato();
      else centroEsami();
      if (r.esame || r.attestato) { scrollTo({ top: 0, ...SALTA }); scorso = true; }
    }
    if (r.v === 'home') aggiornaBandiHome();
    if (r.v === 'comando') areaComando();
    if (!scorso && cambia) scrollTo({ top: 0, ...SALTA });
    rivela(); scorri();
  }
  addEventListener('hashchange', vai);

  /* ═════════════ SCORRIMENTO ═════════════ */
  const mappa = new Map($$('#toc a').map(a => [a.getAttribute('href').slice(1), a]));
  const bersagli = [...$$('.art, .capitolo')];
  const hero = $('.hero'), su = $('#su');
  let inCoda = false, ultimoAttivo = null;
  function scorri() {
    const h = document.documentElement, y = h.scrollTop, p = y / Math.max(1, h.scrollHeight - h.clientHeight);
    $('#avanz').style.width = (p * 100).toFixed(1) + '%';
    su.classList.toggle('vis', y > 700);
    if (vista === 'regolamento') {
      let cur = null; for (const el of bersagli) if (el.offsetParent && el.getBoundingClientRect().top < 150) cur = el.id;
      $$('#toc a.attivo').forEach(a => a.classList.remove('attivo'));
      const a = cur && mappa.get(cur); if (a) a.classList.add('attivo');
      if (a && a !== ultimoAttivo) { ultimoAttivo = a; const r = a.getBoundingClientRect(), ri = indice.getBoundingClientRect(); if (r.top < ri.top + 50 || r.bottom > ri.bottom - 50) indice.scrollTop += r.top - ri.top - ri.height / 2; }
    }
    if (vista === 'home' && !RIDOTTO && y < 900) hero.style.setProperty('--py', (y * .22).toFixed(1) + 'px');
  }
  addEventListener('scroll', () => { if (!inCoda) { inCoda = true; requestAnimationFrame(() => { inCoda = false; scorri(); }); } }, { passive: true });
  $('.hero-bg').style.translate = '0 var(--py, 0px)';

  /* ═════════════ COMPARSA ALLO SCORRIMENTO ═════════════ */
  const io = 'IntersectionObserver' in window && !RIDOTTO ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: .06 }) : null;
  function rivela(root = document) {
    $$('.rivela:not(.vis):not([data-oss])', root).forEach((el, i) => {
      if (!io) { el.classList.add('vis'); return; }
      el.dataset.oss = 1; el.style.setProperty('--rit', ((i % 6) * .06).toFixed(2) + 's'); io.observe(el);
    });
  }

  /* ═════════════ DISTINTIVO 3D ═════════════ */
  const tilt = $('#tilt'), tin = $('.tilt-in');
  if (tilt && !RIDOTTO) {
    let sopra = false;
    tilt.addEventListener('pointermove', e => { sopra = true; const r = tilt.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      tin.style.transform = `rotateY(${(x - .5) * 30}deg) rotateX(${(.5 - y) * 30}deg) scale(1.05)`; tin.style.setProperty('--rx', x * 100 + '%'); tin.style.setProperty('--ry', y * 100 + '%'); });
    tilt.addEventListener('pointerleave', () => { sopra = false; tin.style.transform = ''; });
    const t0 = performance.now();
    (function gira(t) { if (!sopra && vista === 'home') tin.style.transform = `rotateY(${Math.sin((t - t0) / 1600) * 12}deg) rotateX(${Math.cos((t - t0) / 2100) * 5}deg)`; requestAnimationFrame(gira); })(t0);
  }

  /* ═════════════ SCINTILLE NEL BANNER (blu e rosso) ═════════════ */
  const cv = $('#scintille');
  if (cv && !RIDOTTO) {
    const ctx = cv.getContext('2d'); let W, H; const P = [];
    const dim = () => { const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); W = cv.width = Math.max(1, r.width * d); H = cv.height = Math.max(1, r.height * d); };
    dim(); addEventListener('resize', dim);
    const COL = ['110,165,255', '110,165,255', '255,90,110', '255,214,120', '200,220,255'];
    const nuova = y => ({ x: Math.random() * W, y: y ?? H + 10, r: (Math.random() * 1.8 + .6) * (W / 1300), v: Math.random() * .6 + .25, a: Math.random() * .7 + .3, o: Math.random() * 6.28, c: COL[Math.floor(Math.random() * COL.length)] });
    for (let i = 0; i < 80; i++) P.push(nuova(Math.random() * H));
    let vis = true; new IntersectionObserver(v => { vis = v[0].isIntersecting; }).observe(cv);
    (function ciclo(t) {
      requestAnimationFrame(ciclo); if (!vis || document.hidden || vista !== 'home') return;
      if (!W || W < 2) dim();
      ctx.clearRect(0, 0, W, H);
      for (const p of P) {
        p.y -= p.v * (W / 1300) * 1.4; p.x += Math.sin(t / 900 + p.o) * .35; if (p.y < -10) Object.assign(p, nuova());
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5); g.addColorStop(0, `rgba(${p.c},${p.a})`); g.addColorStop(1, `rgba(${p.c},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, 6.29); ctx.fill();
      }
    })(0);
  }

  /* ═════════════ NUMERI CHE CONTANO ═════════════ */
  const totDomande = ESAMI.capitoli.reduce((a, c) => a + c.banca.length, 0);
  $('#n-art').dataset.conta = ARTS.length; $('#n-cod').dataset.conta = CODICI.length; $('#n-dom').dataset.conta = totDomande;
  function conta(el) {
    const fin = +el.dataset.conta; if (RIDOTTO) { el.textContent = fin; return; }
    const t0 = performance.now(); (function c(t) { const k = Math.min(1, (t - t0) / 1300); el.textContent = Math.round(fin * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(c); })(t0);
  }
  if (io) { const oc = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { conta(e.target); oc.unobserve(e.target); } }), { threshold: .4 }); $$('[data-conta]').forEach(el => oc.observe(el)); }
  else $$('[data-conta]').forEach(conta);

  /* ═════════════ STRUMENTI: schede ═════════════ */
  let scheda = 'radio';
  function apriScheda(s) {
    if (!$('#s-' + s)) s = 'radio'; scheda = s;
    $$('.schede [role="tab"]').forEach(b => b.setAttribute('aria-selected', b.dataset.s === s));
    $$('.pannello-s').forEach(p => { p.hidden = p.id !== 's-' + s; });
  }
  $('.schede').addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (b) location.hash = 'strumenti-' + b.dataset.s; });

  /* ── carte di allenamento ── */
  let mazzo = [], sapute = 0, ripasso = 0, giro;
  const carta = $('#flash-carta');
  function mostraCarta() {
    carta.classList.remove('girata');
    if (!mazzo.length) { $('#fc-cod').textContent = '✓'; clearTimeout(giro); giro = setTimeout(() => { $('#fc-sig').textContent = 'Mazzo finito!'; $('#fc-tipo').textContent = `${sapute} sapute al primo colpo`; }, 300); $('#flash-stat').textContent = 'Premi un pulsante per mescolare un mazzo nuovo'; return; }
    const [cod, sig, t] = mazzo[0];
    $('#fc-cod').textContent = cod;
    clearTimeout(giro); giro = setTimeout(() => { $('#fc-sig').textContent = sig; $('#fc-tipo').innerHTML = `<span class="pill ${t}">${NOMI_T[t]}</span>`; }, 320);
    $('#flash-stat').textContent = `Sapute ${sapute} · Da ripassare ${ripasso} · Rimaste ${mazzo.length}`;
  }
  const nuovoMazzo = () => { mazzo = mescola(CODICI); sapute = 0; ripasso = 0; mostraCarta(); };
  carta.addEventListener('click', () => { if (mazzo.length) carta.classList.toggle('girata'); });
  $('#flash').addEventListener('click', e => {
    const b = e.target.closest('[data-fa]'); if (!b) return;
    if (!mazzo.length) return nuovoMazzo();
    if (b.dataset.fa === 'si') { mazzo.shift(); sapute++; } else { mazzo.push(mazzo.shift()); ripasso++; }
    mostraCarta();
  });
  nuovoMazzo();

  /* ── prontuario ── */
  const PRONTUARIO = [
    ['Scontro tra gang · 10-71', 'var(--rosso)', 'art-4-7', ['Prima unità: NON entrare, fermarsi a distanza di sicurezza', 'Comunicare numero di soggetti, armi e via di fuga', 'La centrale alza il livello di minaccia almeno a Giallo', 'Entrare solo con almeno 4 agenti e un responsabile nominato', 'Mettere in sicurezza l\'area e chiamare l\'EMS per i feriti', 'Fermare tutti i presenti armati', 'Repertare bossoli e armi con /arma sequestra']],
    ['Arresto', 'var(--blu)', 'art-4-3', ['Mettere in sicurezza il soggetto e ammanettarlo', 'Comunicare lo stato di arresto e il motivo', 'Leggere i diritti Miranda (fino a tre volte)', 'Prima perquisizione sul posto: armi e oggetti pericolosi', 'Trasporto in centrale e seconda perquisizione con sequestro', 'Rapporto d\'arresto entro la fine del turno']],
    ['Fermo', 'var(--blu-chiaro)', 'art-4-2', ['Comunicare il motivo del fermo', 'Chiedere il documento', 'Accetta la perquisizione: trasporto senza manette', 'Rifiuta: trasporto ammanettato per gli accertamenti', 'Il fermato non va mai in cella', 'Finiti gli accertamenti: rilascio oppure arresto']],
    ['Traffic stop · 10-55', 'var(--giallo)', 'art-4-5', ['Comunicare in radio targa, modello e posizione', 'Fermare il veicolo in un punto sicuro, volante sfalsata', 'Avvicinarsi dal lato guida, collega in copertura lato passeggero', 'Chiedere documenti e motivo del viaggio', 'Controllare il veicolo solo con consenso o fondato sospetto']],
    ['Felony stop', 'var(--arancio)', 'art-4-5', ['Veicolo rubato, legato a sparatorie o con membri armati a bordo', 'Armi puntate da dietro le portiere', 'Ordini dati da un solo agente', 'Soggetti fatti uscire uno alla volta', 'Mani alzate, camminando all\'indietro']],
    ['Inseguimento · 10-80', '#a78bfa', 'art-4-6', ['Massimo 3 unità più l\'unità aerea; le altre sui percorsi', 'Chi guida comunica direzione, strada e velocità; gli altri in silenzio', 'Tre ALT chiari prima di ogni manovra', 'PIT o box solo sotto i 150 km/h e lontano dai pedoni', 'Fuoco alle ruote solo con vite già in pericolo e ok del responsabile']],
    ['Raid e irruzione', '#ff6b6b', 'art-4-8', ['Autorizzazione del Capitano in su o mandato della Procura', 'Briefing: obiettivo, ingressi, ruoli, ritirata, frequenza radio', 'Squadra minima: 4 agenti più il responsabile, niente Reclute', 'Debriefing al rientro', 'Rapporto d\'operazione entro 24 ore']],
    ['Rapina con ostaggi', '#ff8fa0', 'art-4-9', ['La vita dell\'ostaggio viene prima di tutto', 'Tratta un solo agente; gli altri non parlano con i rapinatori', 'Vedere l\'ostaggio prima di concedere qualsiasi richiesta', 'Fuoco solo se sparano o mettono in pericolo immediato ostaggio o agenti']],
    ['Richiesta di supporto', 'var(--verde)', 'art-5-3', ['Identificarsi con la matricola («GU-104 a centrale»)', 'DOVE: la posizione precisa', 'COSA sta succedendo', 'DI COSA c\'è bisogno', 'Confermare gli ordini ricevuti con 10-4']],
    ['Inizio e fine turno', '#22d3ee', 'art-1-4', ['Timbrare l\'entrata con il pannello del bot', 'Controllare il livello di minaccia della città', 'A fine turno: rapporti d\'arresto scritti', 'Valutazione della Recluta affiancata con /valutazione', 'Veicolo in deposito, rifornito e senza danni non segnalati', 'Timbrare l\'uscita']],
  ];
  $('#prontuario').innerHTML = PRONTUARIO.map(([t, c, a, p], i) => `<article class="pron rivela" style="--c:${c}" data-p="${i}"><div class="pron-t"><h3>${esc(t)}</h3><span class="pron-n">0/${p.length}</span></div><ol>${p.map(x => `<li><label><input type="checkbox"><span>${esc(x)}</span></label></li>`).join('')}</ol><div class="pron-p"><a href="#${a}">Leggi l'articolo →</a><button type="button" class="azzera">Azzera</button></div></article>`).join('');
  $('#prontuario').addEventListener('change', e => { const c = e.target.closest('.pron'); if (!c) return; const tot = $$('input', c).length, n = $$('input:checked', c).length; $('.pron-n', c).textContent = `${n}/${tot}`; c.classList.toggle('completa', n === tot); if (n === tot) toast(`«${$('h3', c).textContent}» completato ✓`, 'ok'); });
  $('#prontuario').addEventListener('click', e => { const b = e.target.closest('.azzera'); if (!b) return; const c = b.closest('.pron'); $$('input', c).forEach(i => { i.checked = false; }); $('.pron-n', c).textContent = `0/${$$('input', c).length}`; c.classList.remove('completa'); });

  /* ── moduli compilabili ── */
  const MODULI = $$('#cap-7 .modulo').map(m => ({ titolo: $('.mh b', m).textContent.replace(/^Modulo · /, '').replace(/^./, c => c.toUpperCase()), testo: $('pre', m).textContent, art: m.closest('.art').id }));
  function campiModulo(testo) {
    const righe = testo.split('\n').filter(r => r.trim());
    return { intest: righe[0], campi: righe.slice(1).map((r, i) => {
      const k = r.indexOf(':'), etich = r.slice(0, k).trim(), sugg = r.slice(k + 1).trim();
      let tipo = 'testo', opz = null;
      if (sugg === '/10') tipo = 'voto';
      else if (sugg.includes(' / ')) { tipo = 'scelta'; opz = sugg.split(' / ').map(s => s.trim()); }
      else if (/dinamica|note|membri|attivit|sequestr|squadra|coinvolti|alleanze|reati|oggetti/i.test(etich)) tipo = 'area';
      return { etich, tipo, opz, id: 'mf-' + i };
    }) };
  }
  let modCorrente = 0;
  $('#moduli-sel').innerHTML = MODULI.map((m, i) => `<button type="button" data-m="${i}" aria-pressed="${i === 0}">${esc(m.titolo)}</button>`).join('');
  function renderModulo(i) {
    modCorrente = i; const m = MODULI[i], { intest, campi } = campiModulo(m.testo), ora = new Date();
    $$('#moduli-sel button').forEach(b => b.setAttribute('aria-pressed', +b.dataset.m === i));
    const campo = c => {
      const pre = /^data/i.test(c.etich) ? (/ora/i.test(c.etich) ? `${dataIt(ora)} ${oraIt(ora)}` : dataIt(ora)) : '';
      if (c.tipo === 'scelta') return `<label class="campo"><span>${esc(c.etich)}</span><select data-c="${c.id}"><option value="">—</option>${c.opz.map(o => `<option>${esc(o)}</option>`).join('')}</select></label>`;
      if (c.tipo === 'voto') return `<label class="campo"><span>${esc(c.etich)}</span><select data-c="${c.id}" data-voto><option value="">—</option>${[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(v => `<option>${v}</option>`).join('')}</select></label>`;
      if (c.tipo === 'area') return `<label class="campo"><span>${esc(c.etich)}</span><textarea data-c="${c.id}" rows="3"></textarea></label>`;
      return `<label class="campo"><span>${esc(c.etich)}</span><input type="text" data-c="${c.id}" value="${esc(pre)}"></label>`;
    };
    $('#moduli-area').innerHTML = `<form class="mod-form riquadro" id="mod-form" autocomplete="off"><h3 class="r-tit">${esc(m.titolo)} <small><a href="#${m.art}">art. ${m.art.replace('art-', '').replace('-', '.')}</a></small></h3>${campi.map(campo).join('')}<div style="display:flex;gap:8px;flex-wrap:wrap"><button type="reset" class="btn piccolo">Svuota</button></div></form>
      <div class="mod-anteprima"><div class="modulo"><div class="mh"><b>Anteprima</b><span class="dx"><button class="copia" type="button" data-discord="1">Copia per Discord</button></span></div><pre id="mod-pre"></pre></div></div>`;
    const form = $('#mod-form');
    const agg = () => {
      const vals = campi.map(c => { const el = form.querySelector(`[data-c="${c.id}"]`); let v = el.value.trim(); if (c.tipo === 'voto' && v) v += '/10'; return [c.etich, v]; });
      const pre = $('#mod-pre');
      pre.textContent = [intest, ...vals.map(([e, v]) => `${e}: ${v}`)].join('\n');
      pre.dataset.discord = [`**${intest}**`, ...vals.map(([e, v]) => `**${e}:** ${v.includes('\n') ? '\n' + v : v}`)].join('\n');
    };
    form.addEventListener('input', agg); form.addEventListener('change', agg);
    form.addEventListener('reset', () => setTimeout(agg));
    agg();
  }
  $('#moduli-sel').addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (b) renderModulo(+b.dataset.m); });
  if (MODULI.length) renderModulo(0);

  /* ── carriera ── */
  const PASSI = { 'Recluta': ['1 settimana', 'Esame d\'accademia superato, almeno 3 valutazioni positive'], 'Agente I': ['2 settimane', '15 ore di servizio, nessun richiamo attivo'], 'Agente II': ['3 settimane', '30 ore di servizio, partecipazione ad almeno un raid'], 'Agente III': ['4 settimane', 'Proposta di un Ufficiale, colloquio con l\'Alto Comando'] };
  const percorso = FASCE.flatMap(([fascia, , g]) => g.map(x => [...x, fascia])).reverse();
  $('#carriera').innerHTML = percorso.map(([nome, sig, f, fascia], i) => {
    const pros = percorso[i + 1], req = PASSI[nome] || (pros ? ['A discrezione', 'Decisione dell\'Alto Comando'] : null);
    return `<li class="rivela">${svgGrado(nome)}<div><h4>${nome}<code>${sig}</code><span>${fascia}</span></h4><p>${f}</p>${req ? `<div class="req"><b>Per diventare ${pros[0]}</b><span>⏱ ${req[0]}</span><span>· ${req[1]}</span></div>` : '<div class="req"><b>Vertice della Gang Unit</b></div>'}</div></li>`;
  }).join('');

  /* ── domande frequenti ── */
  const FAQ = [
    ['Come si entra nella Gang Unit?', 'Si risponde a un <a href="#bandi">bando di reclutamento</a> aperto con la candidatura online. Poi ci sono il colloquio e il periodo da Recluta, che si chiude con l\'esame d\'accademia per diventare Agente I (<a href="#art-2-4">art. 2.4</a>).'],
    ['Posso rifare gli esami?', 'Sì: ogni tentativo pesca domande diverse e mescola le risposte. Il miglior risultato e il numero di tentativi restano registrati.'],
    ['Ho dimenticato di timbrare: cosa succede?', 'È una violazione lieve (<a href="#art-6-1">art. 6.1</a>) e le ore di quel turno non contano per le promozioni: un turno non timbrato non esiste (<a href="#art-2-4">art. 2.4</a>).'],
    ['Vado in vacanza per qualche giorno.', 'Chiedi prima le ferie con <kbd>/ferie</kbd> o <kbd>/assenza</kbd>. Chi è in ferie approvate non viene contato per l\'inattività (<a href="#art-6-4">art. 6.4</a>).'],
    ['Posso avere un altro personaggio in una gang?', 'No. Far parte, anche con un altro personaggio, di una gang contrastata dalla GU comporta l\'espulsione immediata (<a href="#art-1-4">art. 1.4</a>).'],
    ['Un superiore mi dà un ordine che mi sembra illegale.', 'Un ordine palesemente illegittimo non va eseguito: lo rifiuti con calma e lo segnali all\'Alto Comando appena possibile (<a href="#art-2-2">art. 2.2</a>).'],
    ['Come segnalo un superiore che si comporta male?', 'Con un ticket <b>Affari Interni</b>: è l\'unico caso in cui si salta la catena di comando (<a href="#art-2-2">art. 2.2</a>).'],
    ['Chi comanda su una scena con più agenti?', 'Il grado più alto presente, oppure chi è stato nominato dalla centrale (<a href="#art-2-2">art. 2.2</a>). Con più reparti il responsabile resta uno solo (<a href="#art-5-4">art. 5.4</a>).'],
    ['Quanto ci vuole per diventare Agente I?', 'Almeno 1 settimana da Recluta, l\'esame d\'accademia superato e almeno 3 valutazioni positive (<a href="#art-2-4">art. 2.4</a>). Guarda tutta la <a href="#strumenti-carriera">carriera</a>.'],
    ['Dove trovo i codici radio durante il turno?', 'Nella sezione <a href="#strumenti-radio">Codici radio</a> oppure su Discord con <kbd>/codici-radio</kbd>.'],
    ['Come scrivo un rapporto velocemente?', 'Vai su <a href="#strumenti-moduli">Moduli</a>, compila i campi e premi «Copia per Discord»: il testo è già formattato per il canale dei rapporti.'],
    ['I miei progressi restano salvati?', 'Articoli letti ed esiti restano salvati nel browser di questo dispositivo. Se cambi telefono o PC ripartono da zero.'],
  ];
  $('#faq').innerHTML = FAQ.map(([d, r]) => `<details class="rivela"><summary>${d}</summary><div class="r"><p>${r}</p></div></details>`).join('');

  /* ═════════════ DISCORD ═════════════ */
  async function inviaDiscord(url, payload) {
    if (!url) return { ok: false, motivo: 'off' };
    try {
      const r = await fetch(url + (url.includes('?') ? '&' : '?') + 'wait=true', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      return r.ok ? { ok: true } : { ok: false, motivo: 'HTTP ' + r.status };
    } catch { return { ok: false, motivo: 'rete' }; }
  }
  const avatar = () => sitoURL() ? sitoURL() + 'immagini/distintivo.jpg' : undefined;
  const menzione = m => m ? { content: m, allowed_mentions: { parse: ['roles', 'users'] } } : {};

  /* ═════════════ BANDI ═════════════ */
  function annuncio(b) {
    const st = statoBando(b), url = sitoURL(), link = url ? `${url}#bando-${b.id}` : '(link al sito)';
    const testa = st === 'aperto' ? '📢 **BANDO APERTO**' : st === 'arrivo' ? '🗓️ **BANDO IN ARRIVO**' : '🔒 **BANDO CHIUSO**';
    const r = [`${testa} · **${b.titolo.toUpperCase()}**`, `${b.numero} · Posti: **${b.posti}** · Aperto a: ${b.apertoA}`, `Candidature dal **${dataB(b.apertura)}** al **${dataB(b.chiusura)}**`, '', b.descrizione, '', '**Requisiti**', ...b.requisiti.map(x => `• ${x}`), '', '**Come candidarsi**', `1. Leggi il bando completo: ${link}`];
    r.push('2. Invia la candidatura dal sito: arriva direttamente all\'Alto Comando');
    r.push('', '_Le candidature scritte qui su Discord non vengono prese in considerazione._');
    return r.join('\n');
  }
  function renderBandi(aperto) {
    const ord = { aperto: 0, arrivo: 1, chiuso: 2 };
    const lista = [...BANDI].sort((a, b) => ord[statoBando(a)] - ord[statoBando(b)]);
    const inviate = LS.get('gu-candidature', {});
    $('#bandi-lista').innerHTML = lista.length ? lista.map(b => {
      const st = statoBando(b), cd = st === 'aperto' ? +new Date(b.chiusura) : st === 'arrivo' ? +new Date(b.apertura) : 0;
      const inv = inviate[b.id];
      return `<article class="bando-card" id="bando-${esc(b.id)}" data-stato="${st}">
        <div class="bc-testa"><span class="stato-pill"><i></i>${NOMI_STATO[st]}</span><span class="bc-num">${esc(b.numero)}</span>${b.interno ? '<span class="chip">Interno</span>' : ''}${inv ? `<span class="chip" style="color:var(--verde)">✓ Candidatura inviata</span>` : ''}</div>
        <h3>${esc(b.titolo)}</h3><p class="bc-sotto">${esc(b.sottotitolo || '')}</p>
        <div class="bc-dati">
          <div><small>Posti</small><b>${b.posti}</b></div>
          <div><small>Aperto a</small><b style="font-size:16px">${esc(b.apertoA)}</b></div>
          <div><small>Apertura</small><b>${dataB(b.apertura)}</b></div>
          <div><small>Chiusura</small><b>${dataB(b.chiusura)}</b></div>
          <div class="cd"><small>${st === 'aperto' ? 'Chiude tra' : st === 'arrivo' ? 'Apre tra' : 'Esito'}</small><b ${cd ? `data-cd="${cd}"` : ''}>${cd ? quanto(cd - Date.now()) : (b.esito ? 'Concluso' : 'Chiuso')}</b></div>
        </div>
        ${b.esito ? `<p class="bc-nota" style="border-color:var(--verde);background:rgba(47,211,138,.06)">${esc(b.esito)}</p>` : ''}
        <details class="bc-dettagli" ${aperto === b.id ? 'open' : ''}><summary>Leggi il bando completo</summary>
          <div class="bc-corpo">
            <div><p>${esc(b.descrizione)}</p><div class="bc-sez"><h4>Requisiti</h4><ul>${b.requisiti.map(r => `<li>${esc(r)}</li>`).join('')}</ul>${b.preferenziali?.length ? `<h4>Titoli preferenziali</h4><ul>${b.preferenziali.map(r => `<li class="pref">${esc(r)}</li>`).join('')}</ul>` : ''}</div></div>
            <div class="bc-sez"><h4>Fasi della selezione</h4><ol class="fasi">${(b.fasi || []).map(([t, d]) => `<li><div><b>${esc(t)}</b><span>${esc(d)}</span></div></li>`).join('')}</ol>${b.note ? `<p class="bc-nota" style="margin-top:14px">${esc(b.note)}</p>` : ''}</div>
          </div>
        </details>
        <div class="bc-azioni">
          ${st === 'aperto' ? `<a class="btn p" href="#candidatura-${esc(b.id)}">${inv ? 'Rivedi la candidatura' : 'Candidati ora'} →</a>` : st === 'arrivo' ? `<button class="btn" type="button" disabled>Candidature dal ${dataIt(new Date(b.apertura))}</button>` : ''}
          <button class="btn ghost" type="button" data-annuncio="${esc(b.id)}">📋 Copia annuncio per Discord</button>
          <button class="btn ghost" type="button" data-link="${esc(b.id)}">🔗 Copia link</button>
        </div>
      </article>`;
    }).join('') : '<div class="vuoto" style="display:block">Al momento non ci sono bandi.</div>';
  }
  $('#bandi-lista').addEventListener('click', async e => {
    const a = e.target.closest('[data-annuncio]'), l = e.target.closest('[data-link]');
    if (a) { const b = BANDI.find(x => x.id === a.dataset.annuncio); toast((await copia(annuncio(b))) ? 'Annuncio copiato: incollalo nel canale Discord' : 'Copia non riuscita', 'ok'); }
    if (l) { const u = sitoURL(); toast((await copia(`${u}#bando-${l.dataset.link}`)) ? 'Link del bando copiato' : 'Copia non riuscita', 'ok'); }
  });
  function aggiornaBandiHome() {
    const ap = bandiAperti(), n = ap.length;
    const nb = $('#nav-bandi'); nb.hidden = !n; nb.textContent = n;
    $('#cta-bandi').textContent = n ? `Bandi aperti (${n})` : 'Bandi';
    const ev = $('#bando-evidenza');
    if (!n) { ev.hidden = true; return; }
    const b = ap[0];
    ev.hidden = false;
    ev.innerHTML = `<div class="be-t"><small>BANDO APERTO · ${esc(b.numero.toUpperCase())}</small><h3>${esc(b.titolo)}</h3><span style="color:var(--tenue)">${b.posti} posti · candidature sul sito, arrivano su Discord</span></div><div class="be-cd"><small>Chiude tra</small><b data-cd="${+new Date(b.chiusura)}">${quanto(+new Date(b.chiusura) - Date.now())}</b></div><a class="btn p" href="#bando-${esc(b.id)}">Leggi e candidati →</a>`;
  }
  setInterval(() => {
    for (const el of $$('[data-cd]')) {
      if (!el.offsetParent) continue;
      const ms = +el.dataset.cd - Date.now(); el.textContent = quanto(ms);
      if (ms <= 0 && !el.dataset.fine) { el.dataset.fine = 1; setTimeout(() => { if (vista === 'bandi') renderBandi(); aggiornaBandiHome(); nastro(); }, 1200); }
    }
  }, 1000);

  /* ── candidatura ── */
  const candidato = () => LS.get('gu-candidato', { nome: '', matricola: '', discord: '' });
  const esiti = () => LS.get('gu-esiti', {});
  function apriCandidatura(id) {
    const box = $('#candidatura'), b = BANDI.find(x => x.id === id);
    if (!b) { box.hidden = true; toast('Bando non trovato', 'ko'); return; }
    const st = statoBando(b); box.hidden = false;
    if (st !== 'aperto') { box.innerHTML = `<div class="cand-testa"><div><small>${esc(b.numero)}</small><h2>Candidature ${st === 'arrivo' ? 'non ancora aperte' : 'chiuse'}</h2></div><a class="btn piccolo" href="#bandi">← Torna ai bandi</a></div><p style="color:var(--tenue)">${st === 'arrivo' ? `Il bando apre il ${dataB(b.apertura)}.` : `Il bando si è chiuso il ${dataB(b.chiusura)}.`}</p>`; return; }
    const c = candidato(), e = esiti().finale, ok = !!(e && e.superato), att = e?.attestato;
    const inv = LS.get('gu-candidature', {})[b.id];
    const blocca = false;
    const statoEsame = b.esameRichiesto ? (ok
      ? `<div class="esame-stato ok"><span class="es-i">✓</span><div><b>Esame d'accademia superato · ${att ? `${att.punti}/${att.tot} (${att.pct}%)` : e.best + '%'}</b><small>${att ? `Codice attestato ${att.codice} · verrà allegato alla candidatura` : 'Il risultato verrà allegato alla candidatura'}</small></div><a class="btn piccolo" href="#attestato">Vedi attestato</a></div>`
      : `<div class="esame-stato ko"><span class="es-i">!</span><div><b>Prima devi superare l'esame d'accademia</b><small>Questo bando richiede almeno il ${Math.round(ESAMI.finale.soglia * 100)}% nell'esame finale. ${e ? `Il tuo miglior risultato finora: ${e.best}%.` : 'Non l\'hai ancora sostenuto.'}</small></div><a class="btn p piccolo" href="#esame-finale">Fai l'esame →</a></div>`) : '';
    const campo = (id, lab, html, req, largo, aiuto) => `<label class="campo${largo ? ' largo' : ''}" data-campo="${id}"><span>${lab}${req ? ' <em>*</em>' : ''}</span>${html}${aiuto ? `<small>${aiuto}</small>` : ''}</label>`;
    box.innerHTML = `<div class="cand-testa"><div><small>${esc(b.numero)} · Candidatura online</small><h2>${esc(b.titolo)}</h2></div><a class="btn piccolo" href="#bando-${esc(b.id)}">← Torna al bando</a></div>
      ${inv ? `<div class="esame-stato ok"><span class="es-i">✓</span><div><b>Hai già inviato una candidatura per questo bando</b><small>Il ${dataIt(new Date(inv.data))} · protocollo ${esc(inv.protocollo)}. Inviala di nuovo solo se te lo chiede l'Alto Comando.</small></div></div>` : ''}
      <form id="cand-form" novalidate><div class="form-griglia">
        ${campo('nome', 'Nome e cognome del personaggio', `<input name="nome" required maxlength="60" value="${esc(c.nome || att?.nome || '')}" placeholder="es. Marco Rossi">`, 1)}
        ${campo('matricola', 'Matricola LSPD', `<input name="matricola" required maxlength="20" value="${esc(c.matricola || att?.matricola || '')}" placeholder="es. LSPD-214">`, 1)}
        ${campo('grado', 'Grado attuale', `<input name="grado" maxlength="40" placeholder="es. Agente II LSPD">`)}
        ${campo('discord', 'Nome Discord', `<input name="discord" required maxlength="40" value="${esc(c.discord || '')}" placeholder="es. @marcorossi">`, 1)}
        ${campo('discordid', 'ID Discord (solo numeri)', `<input name="discordid" required inputmode="numeric" maxlength="20" value="${esc(c.discordId || '')}" placeholder="es. 633339352491229184">`, 1, true, 'Su Discord: Impostazioni → Avanzate → attiva «Modalità sviluppatore», poi tasto destro sul tuo nome → «Copia ID utente». Serve per mostrarti l\'esito qui sul sito.')}
        ${campo('eta', 'Età reale', `<input name="eta" type="number" min="10" max="99" required placeholder="es. 19">`, 1)}
        ${campo('ore', 'Ore di servizio a settimana', `<select name="ore" required><option value="">Scegli…</option><option>Meno di 8 ore</option><option>8–15 ore</option><option>15–25 ore</option><option>Più di 25 ore</option></select>`, 1)}
        ${b.interno ? campo('ufficiale', 'Ufficiale che ti propone', `<input name="ufficiale" required maxlength="60" placeholder="Grado e nome">`, 1, true) : ''}
        <div class="campo largo" data-campo="fasce"><span>In che fasce orarie sei disponibile? <em>*</em></span><div class="scelte">${['Mattina', 'Pomeriggio', 'Sera', 'Notte', 'Weekend'].map(f => `<label><input type="checkbox" name="fasce" value="${f}">${f}</label>`).join('')}</div></div>
        ${campo('esperienze', 'Esperienze precedenti (reparti, ruoli, server)', `<textarea name="esperienze" maxlength="900" rows="3" placeholder="Facoltativo"></textarea>`, 0, true)}
        ${campo('motivazione', 'Perché vuoi entrare nella Gang Unit?', `<textarea name="motivazione" required maxlength="900" rows="4" data-min="150"></textarea><div class="contatore" data-per="motivazione">0 / almeno 150 caratteri</div>`, 1, true)}
        ${campo('caso', 'Caso pratico: arrivi per primo su uno scontro tra gang con 5 soggetti armati e un ferito a terra. Cosa fai, passo per passo?', `<textarea name="caso" required maxlength="900" rows="4" data-min="100"></textarea><div class="contatore" data-per="caso">0 / almeno 100 caratteri</div>`, 1, true, 'Rispondi con parole tue: la commissione valuta come ragioni, non se citi gli articoli a memoria.')}
        <div class="campo largo dichiara" data-campo="dichiara">
          <label><input type="checkbox" name="d1" required>Ho letto e accetto il <a href="#regolamento">Regolamento della Gang Unit</a> (GU-NOW-001).</label>
          <label><input type="checkbox" name="d2" required>Nessun mio personaggio fa parte di gang o organizzazioni criminali.</label>
          <label><input type="checkbox" name="d3" required>Le informazioni che ho scritto sono vere. So che quelle false portano all'esclusione.</label>
        </div>
      </div>
      <div class="cand-invia"><small>${CFG.webhookCandidature || DB_ATTIVO ? 'La candidatura arriva subito all\'Alto Comando.' : 'Il collegamento automatico a Discord non è ancora attivo: dopo l\'invio avrai il testo pronto da copiare nel canale delle candidature.'}</small><button class="btn p" type="submit" ${blocca ? 'disabled title="Prima supera l\'esame d\'accademia"' : ''}>Invia candidatura →</button></div>
      </form>`;
    const form = $('#cand-form');
    form.addEventListener('input', ev => {
      const t = ev.target; t.closest('.campo')?.classList.remove('errore');
      if (t.dataset.min) { const n = t.value.trim().length, k = $(`.contatore[data-per="${t.name}"]`); k.textContent = `${n} / almeno ${t.dataset.min} caratteri`; k.classList.toggle('ok', n >= +t.dataset.min); }
    });
    form.addEventListener('submit', ev => { ev.preventDefault(); inviaCandidatura(b, form); });
  }
  async function inviaCandidatura(b, form) {
    const f = new FormData(form), get = k => String(f.get(k) || '').trim();
    const fasce = f.getAll('fasce');
    const err = [];
    for (const k of ['nome', 'matricola', 'discord', 'eta', 'ore', ...(b.interno ? ['ufficiale'] : [])]) if (!get(k)) err.push(k);
    if (!/^\d{17,20}$/.test(get('discordid'))) err.push('discordid');
    const eta = +get('eta'); if (get('eta') && (eta < 10 || eta > 99)) err.push('eta');
    if (!fasce.length) err.push('fasce');
    if (get('motivazione').length < 150) err.push('motivazione');
    if (get('caso').length < 100) err.push('caso');
    if (!f.get('d1') || !f.get('d2') || !f.get('d3')) err.push('dichiara');
    $$('.campo.errore', form).forEach(x => x.classList.remove('errore'));
    if (err.length) { err.forEach(k => $(`[data-campo="${k}"]`, form)?.classList.add('errore')); $(`[data-campo="${err[0]}"]`, form)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); toast('Controlla i campi evidenziati in rosso', 'ko'); return; }
    const e = esiti().finale, att = e?.attestato;
    const btn = $('button[type="submit"]', form); btn.disabled = true; btn.textContent = 'Invio in corso…';
    const d = { nome: get('nome'), matricola: get('matricola'), grado: get('grado'), discord: get('discord'), discordId: get('discordid'), eta: get('eta'), ore: get('ore'), ufficiale: get('ufficiale'), fasce: fasce.join(', '), esperienze: get('esperienze'), motivazione: get('motivazione'), caso: get('caso') };
    LS.set('gu-candidato', { ...candidato(), nome: d.nome, matricola: d.matricola, discord: d.discord, discordId: d.discordId });
    const protocollo = 'GU-C-' + firma(d.nome + d.matricola + b.id + Date.now()).slice(0, 5);
    const esame = att ? `${att.punti}/${att.tot} (${att.pct}%) · codice ${att.codice}` : e ? `${e.best}% (miglior risultato)` : 'Non sostenuto';
    const testo = [`📨 **CANDIDATURA · ${b.titolo.toUpperCase()}**`, `${b.numero} · Protocollo \`${protocollo}\``, '', `**Personaggio:** ${d.nome}`, `**Matricola LSPD:** ${d.matricola}`, `**Grado attuale:** ${d.grado || '—'}`, `**Discord:** ${d.discord} (ID ${d.discordId})`, `**Età:** ${d.eta}`, `**Ore a settimana:** ${d.ore}`, `**Fasce orarie:** ${d.fasce}`, b.interno ? `**Ufficiale proponente:** ${d.ufficiale}` : null, `**Esame d'accademia:** ${esame}`, '', `**Esperienze:** ${d.esperienze || '—'}`, '', `**Motivazione:**\n${d.motivazione}`, '', `**Caso pratico:**\n${d.caso}`].filter(x => x !== null).join('\n');
    const payload = {
      username: 'Gang Unit · Bandi', avatar_url: avatar(), ...menzione(CFG.menzioneCandidature),
      embeds: [{
        title: `📨 Nuova candidatura · ${b.titolo}`.slice(0, 250), description: `**${b.numero}** · Protocollo \`${protocollo}\``, color: 0x3b82f6,
        fields: [
          { name: 'Personaggio', value: tronca(d.nome, 100), inline: true }, { name: 'Matricola LSPD', value: tronca(d.matricola, 60), inline: true }, { name: 'Grado attuale', value: tronca(d.grado, 60), inline: true },
          { name: 'Discord', value: `<@${d.discordId}> · ${tronca(d.discord, 40)}`, inline: true }, { name: 'Età', value: tronca(d.eta, 10), inline: true }, { name: 'Ore a settimana', value: tronca(d.ore, 40), inline: true },
          { name: 'Fasce orarie', value: tronca(d.fasce, 200), inline: true }, { name: 'Esame d\'accademia', value: tronca(esame, 200), inline: true },
          ...(b.interno ? [{ name: 'Ufficiale proponente', value: tronca(d.ufficiale, 100), inline: true }] : []),
          { name: 'Esperienze', value: tronca(d.esperienze, 1000) }, { name: 'Motivazione', value: tronca(d.motivazione, 1000) }, { name: 'Caso pratico', value: tronca(d.caso, 1000) },
        ],
        footer: { text: 'Inviata dal sito Gang Unit · NOW V4' }, timestamp: new Date().toISOString(),
      }],
    };
    const [r0, rdb] = await Promise.all([inviaDiscord(CFG.webhookCandidature, payload), salvaDB('candidature', { bando_id: b.id, bando_titolo: b.titolo, protocollo, nome: d.nome, matricola: d.matricola, grado: d.grado || null, discord: d.discord, discord_id: d.discordId, eta: +d.eta || null, ore: d.ore, fasce: d.fasce, ufficiale: d.ufficiale || null, esperienze: d.esperienze || null, motivazione: d.motivazione, caso: d.caso, esame })]);
    const r = r0.ok || !rdb.ok ? r0 : { ok: true };
    const inviate = LS.get('gu-candidature', {}); inviate[b.id] = { protocollo, data: Date.now(), discord: r.ok, discordId: d.discordId }; LS.set('gu-candidature', inviate);
    const box = $('#candidatura');
    box.innerHTML = `<div class="inviata"><div class="ok-i">${r.ok ? '✓' : '📋'}</div><h2>${r.ok ? 'Candidatura inviata' : 'Candidatura pronta'}</h2><div class="protocollo">Protocollo ${protocollo}</div>
      <p>${r.ok ? 'La tua candidatura è arrivata all\'Alto Comando. Quando l\'Alto Comando decide, <b>l\'esito compare qui sul sito</b>, nella pagina Bandi. Conserva il codice pratica qui sopra: ti serve per controllarlo da un altro telefono o PC.' : `${r.motivo === 'off' ? 'Il collegamento automatico a Discord non è ancora attivo.' : 'Non è stato possibile inviarla a Discord in automatico.'} Copia il testo qui sotto e incollalo nel canale delle candidature.`}</p>
      <div class="esito-az" style="justify-content:center;margin:14px 0">${r.ok ? '' : `<button class="btn p" type="button" id="cand-copia">📋 Copia candidatura</button>${CFG.invitoDiscord ? `<a class="btn" href="${esc(CFG.invitoDiscord)}" target="_blank" rel="noopener">Apri Discord</a>` : ''}`}<a class="btn ghost" href="#bandi">Torna ai bandi</a></div>
      ${r.ok ? '' : `<div class="modulo"><div class="mh"><b>Testo della candidatura</b></div><pre>${esc(testo)}</pre></div>`}</div>`;
    if (!r.ok) $('#cand-copia').addEventListener('click', async () => toast((await copia(testo)) ? 'Candidatura copiata: incollala su Discord' : 'Copia non riuscita', 'ok'));
    else { toast('Candidatura inviata ✓', 'ok'); coriandoli(); }
    history.replaceState(null, '', '#bando-' + b.id); renderBandi(); renderEsiti();
    box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ═════════════ ESAMI ═════════════ */
  const TIPI = { s: 'Scelta singola', v: 'Vero o falso', m: 'Più risposte giuste', o: 'Metti in ordine' };
  const totFinale = () => Object.values(ESAMI.finale.perCapitolo).reduce((a, b) => a + b, 0);
  function infoEsame(id) {
    if (id === 'finale') { const f = ESAMI.finale; return { id, titolo: f.titolo, sotto: f.sotto, n: totFinale(), minuti: f.minuti, soglia: f.soglia, finale: true }; }
    const c = ESAMI.capitoli.find(x => x.id === id); if (!c) return null;
    return { id, titolo: `Verifica capitolo ${c.n}`, nome: c.titolo, sotto: c.sotto, n: Math.min(c.domande, c.banca.length), minuti: c.minuti, soglia: ESAMI.sogliaCapitolo, cap: c };
  }
  const iniziali = n => (n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0].toUpperCase()).join('') || '?';

  function centroEsami() {
    $('#esami-centro').hidden = false; $('#esami-prova').hidden = true;
    const c = candidato(), E = esiti();
    const cb = $('#candidato');
    const formC = (aperto) => `<form id="cand-dati" ${aperto ? '' : 'hidden'}><label class="campo"><span>Nome e cognome del personaggio</span><input name="nome" value="${esc(c.nome)}" maxlength="60" placeholder="es. Marco Rossi"></label><label class="campo"><span>Matricola</span><input name="matricola" value="${esc(c.matricola)}" maxlength="20" placeholder="es. LSPD-214"></label><label class="campo"><span>Nome Discord</span><input name="discord" value="${esc(c.discord)}" maxlength="40" placeholder="es. @marcorossi"></label><button class="btn p piccolo" style="align-self:end" type="submit">Salva</button></form>`;
    cb.innerHTML = c.nome
      ? `<span class="av">${esc(iniziali(c.nome))}</span><div class="cn"><small>Candidato</small><b>${esc(c.nome)}</b><span style="color:var(--tenue);font-size:14px">${esc(c.matricola || 'Matricola non indicata')}${c.discord ? ' · ' + esc(c.discord) : ''}</span></div><button class="btn piccolo" type="button" id="cand-mod">Modifica</button>${formC(false)}`
      : `<span class="av">?</span><div class="cn"><small>Prima di iniziare</small><b>Chi sta facendo l'esame?</b><span style="color:var(--tenue);font-size:14px">Nome e matricola compaiono nell'esito e nell'attestato.</span></div>${formC(true)}`;
    $('#cand-mod')?.addEventListener('click', () => { $('#cand-dati').hidden = !$('#cand-dati').hidden; });
    $('#cand-dati').addEventListener('submit', ev => { ev.preventDefault(); const f = new FormData(ev.target); LS.set('gu-candidato', { nome: String(f.get('nome')).trim(), matricola: String(f.get('matricola')).trim(), discord: String(f.get('discord')).trim() }); toast('Dati salvati', 'ok'); centroEsami(); });

    const fi = infoEsame('finale'), ef = E.finale;
    $('#finale-card').innerHTML = `<div><small class="eyebrow">★ Esame finale</small><h2>${esc(fi.titolo)}</h2><p>${fi.n} domande pescate da tutti i capitoli, con casi pratici, vero o falso, risposte multiple e procedure da mettere in ordine. Serve per passare da Recluta ad Agente I (art. 2.4): chi lo supera ottiene l'attestato d'idoneità${CFG.webhookEsami || DB_ATTIVO ? ' e l\'esito arriva all\'Alto Comando' : ''}.</p>
      <div class="meta"><span>📝 ${fi.n} domande</span><span>⏱ ${fi.minuti} minuti</span><span>🎯 soglia ${Math.round(fi.soglia * 100)}%</span><span>🔁 tentativi: ${ef?.tentativi || 0}</span></div></div>
      <div class="finale-dx"><div class="medaglia" style="--p:${ef?.best || 0};--c:${ef?.superato ? 'var(--verde)' : 'var(--oro)'}"><div><b>${ef ? ef.best + '%' : '—'}</b><small>${ef ? 'RECORD' : 'DA FARE'}</small></div></div>
      <a class="btn p" href="#esame-finale">${ef ? 'Rifai l\'esame' : 'Inizia l\'esame'} →</a>${ef?.attestato ? '<a class="btn piccolo ghost" href="#attestato">🎖 Vedi attestato</a>' : ''}</div>`;
    let sup = 0;
    $('#esami-griglia').innerHTML = ESAMI.capitoli.map(cap => {
      const i = infoEsame(cap.id), e = E[cap.id]; if (e?.superato) sup++;
      return `<article class="es-card rivela${e?.superato ? ' superato' : ''}">
        <span class="badge ${e ? (e.superato ? 'ok' : 'ko') : 'nuovo'}">${e ? (e.superato ? '✓ SUPERATA' : 'NON SUPERATA') : 'NUOVA'}</span>
        <div class="es-t"><span class="n">${cap.n}</span><div><h3>${esc(cap.titolo)}</h3><div class="es-sotto">${esc(cap.sotto)}</div></div></div>
        <div class="es-info"><span>${i.n} domande · ${i.minuti} min</span><span>${e ? `record ${e.best}%` : `soglia ${Math.round(i.soglia * 100)}%`}</span></div>
        <div class="barra-best" style="--soglia:${Math.round(i.soglia * 100)}%"><i style="width:${e?.best || 0}%"></i></div>
        <a class="btn ${e?.superato ? '' : 'p'}" href="#esame-${cap.id}">${e ? 'Rifai la verifica' : 'Inizia la verifica'} →</a>
      </article>`;
    }).join('');
    $('#cap-superati').textContent = `${sup} di ${ESAMI.capitoli.length} superate`;
    aggiornaCTAEsami();
    rivela($('#v-esami'));
  }
  function aggiornaCTAEsami() {
    const E = esiti();
    const ce = $('#capi-esami'); if (ce) { const sup = ESAMI.capitoli.filter(c => E[c.id]?.superato).length; ce.textContent = E.finale?.superato ? `✓ Accademia superata · ${sup}/${ESAMI.capitoli.length} verifiche` : sup ? `${sup} di ${ESAMI.capitoli.length} verifiche superate` : '7 verifiche e l\'esame finale'; }
    aggiornaLetti();
    $$('.cap-esame').forEach(a => { const e = E[a.dataset.esame]; a.classList.toggle('fatto', !!e?.superato); $('.ce-v', a).textContent = e ? (e.superato ? `✓ Superata · ${e.best}%` : `Record ${e.best}% · Riprova →`) : 'Inizia →'; });
  }

  function introEsame(id) {
    const info = infoEsame(id);
    if (!info) { location.hash = 'esami'; return; }
    $('#esami-centro').hidden = true; const box = $('#esami-prova'); box.hidden = false;
    const c = candidato(), e = esiti()[id];
    const tipi = new Set((info.finale ? ESAMI.capitoli.flatMap(x => x.banca) : info.cap.banca).map(d => d.t));
    box.innerHTML = `<div class="intro-esame">
      <small class="eyebrow">${info.finale ? '★ Esame finale · tutto il regolamento' : `Capitolo ${info.cap.n} · ${esc(info.nome)}`}</small>
      <h2>${esc(info.finale ? info.titolo : info.titolo + ' · ' + info.nome)}</h2>
      <div class="regole"><div><b>${info.n}</b><span>domande</span></div><div><b>${info.minuti}′</b><span>tempo</span></div><div><b>${Math.round(info.soglia * 100)}%</b><span>per superarlo</span></div><div><b>${e?.tentativi || 0}</b><span>tentativi fatti</span></div></div>
      <ul>
        <li>Le domande sono pescate a caso e le risposte vengono mescolate: ogni tentativo è diverso.</li>
        <li>Tipi di domanda: ${[...tipi].map(t => TIPI[t].toLowerCase()).join(', ')}.</li>
        <li>Puoi spostarti tra le domande e <b>contrassegnare</b> quelle in dubbio. Le risposte giuste si vedono solo dopo la consegna.</li>
        <li>Nelle domande a più risposte il punto vale solo se scegli <b>tutte e sole</b> quelle giuste.</li>
        <li>Allo scadere del tempo l'esame si consegna da solo. Le uscite dalla pagina vengono registrate nell'esito.</li>
        ${(info.finale && CFG.webhookEsami) || DB_ATTIVO ? '<li>L\'esito, con punteggio e tempo, viene registrato e lo vede l\'Alto Comando.</li>' : ''}
      </ul>
      <form id="intro-form" class="form-griglia" autocomplete="off">
        <label class="campo" data-campo="nome"><span>Nome e cognome del personaggio${info.finale ? ' <em>*</em>' : ''}</span><input name="nome" maxlength="60" value="${esc(c.nome)}" placeholder="es. Marco Rossi"></label>
        <label class="campo" data-campo="matricola"><span>Matricola${info.finale ? ' <em>*</em>' : ''}</span><input name="matricola" maxlength="20" value="${esc(c.matricola)}" placeholder="es. LSPD-214"></label>
        <div class="az largo"><button class="btn p" type="submit">▶ Inizia ora</button><a class="btn ghost" href="#esami">Torna al centro esami</a>${info.cap ? `<a class="btn ghost" href="#${info.cap.id}">Ripassa il capitolo</a>` : ''}</div>
      </form></div>`;
    $('#intro-form').addEventListener('submit', ev => {
      ev.preventDefault(); const f = new FormData(ev.target), nome = String(f.get('nome')).trim(), matricola = String(f.get('matricola')).trim();
      if (info.finale && (!nome || !matricola)) { if (!nome) $('[data-campo="nome"]').classList.add('errore'); if (!matricola) $('[data-campo="matricola"]').classList.add('errore'); toast('Per l\'esame finale servono nome e matricola', 'ko'); return; }
      if (nome || matricola) LS.set('gu-candidato', { ...candidato(), nome, matricola });
      iniziaProva(info, { ...candidato(), nome, matricola });
    });
  }

  /* ── svolgimento ── */
  let prova = null, timer = null;
  function prepara(d) {
    if (d.t === 'v') return { ...d, opz: ['Vero', 'Falso'], giusta: d.r ? 0 : 1 };
    if (d.t === 's') { const o = mescola(d.o.map((_, i) => i)); return { ...d, opz: o.map(i => d.o[i]), giusta: o.indexOf(d.r) }; }
    if (d.t === 'm') { const o = mescola(d.o.map((_, i) => i)); return { ...d, opz: o.map(i => d.o[i]), giuste: d.r.map(r => o.indexOf(r)).sort((a, b) => a - b) }; }
    let o; do { o = mescola(d.o.map((_, i) => i)); } while (d.o.length > 1 && o.every((v, i) => v === i));
    return { ...d, opz: o.map(i => d.o[i]), pos: o };
  }
  function domandeEsame(info) {
    if (info.finale) return mescola(ESAMI.capitoli.flatMap(c => mescola(c.banca).slice(0, ESAMI.finale.perCapitolo[c.id] || 0).map(d => ({ ...d, cap: c.n })))).map(prepara);
    return mescola(info.cap.banca).slice(0, info.n).map(d => prepara({ ...d, cap: info.cap.n }));
  }
  const giusta = (d, r) => {
    if (r == null) return false;
    if (d.t === 's' || d.t === 'v') return r === d.giusta;
    if (d.t === 'm') return r.length === d.giuste.length && [...r].sort((a, b) => a - b).every((v, i) => v === d.giuste[i]);
    return r.length === d.opz.length && r.every((k, i) => d.pos[k] === i);
  };
  const fatta = (d, r) => d.t === 'm' ? !!(r && r.length) : d.t === 'o' ? !!(r && r.length === d.opz.length) : r != null;

  function iniziaProva(info, cand) {
    const domande = domandeEsame(info);
    prova = { info, cand, domande, risposte: domande.map(() => null), segnate: new Set(), i: 0, inizio: Date.now(), fine: Date.now() + info.minuti * 60000, uscite: 0, hash: location.hash || '#esame-' + info.id };
    const box = $('#esami-prova');
    box.innerHTML = `<div class="prova">
      <div class="prova-testa"><div class="pt-t"><small>${info.finale ? 'Esame finale' : 'Capitolo ' + info.cap.n}${cand.nome ? ' · ' + esc(cand.nome) : ''}</small><b>${esc(info.finale ? info.titolo : info.nome)}</b></div>
        <div class="timer" id="timer"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/></svg><span id="timer-t">${mmss(info.minuti * 60)}</span></div>
        <button class="btn piccolo rosso" type="button" id="consegna-alto">Consegna</button>
        <div class="prova-barra"><i id="prova-barra" style="width:0"></i></div></div>
      <div class="q-punti" id="q-punti" aria-label="Domande"></div>
      <div id="q-area"></div></div>`;
    timer = setInterval(tic, 250); tic();
    addEventListener('beforeunload', bloccaUscita);
    vaiDomanda(0);
    scrollTo({ top: 0, ...SALTA });
  }
  function bloccaUscita(e) { if (prova) { e.preventDefault(); e.returnValue = ''; } }
  function stopProva() { clearInterval(timer); timer = null; prova = null; removeEventListener('beforeunload', bloccaUscita); }
  let ultimoT = -1;
  function tic() {
    if (!prova) return;
    const rest = Math.max(0, Math.ceil((prova.fine - Date.now()) / 1000));
    if (rest !== ultimoT) { ultimoT = rest; const t = $('#timer-t'); if (t) t.textContent = mmss(rest); $('#timer')?.classList.toggle('urgente', rest <= 60); }
    if (rest <= 0) { toast('Tempo scaduto: l\'esame è stato consegnato', 'ko'); if ($('#dialogo').open) $('#dialogo').close('no'); consegna(true); }
  }
  document.addEventListener('visibilitychange', () => {
    if (!prova) return;
    if (document.hidden) prova.uscite++;
    else toast(`Uscita dalla pagina registrata (${prova.uscite})`, 'ko');
  });
  function puntini() {
    const p = prova, n = p.domande.length;
    $('#q-punti').innerHTML = p.domande.map((d, i) => `<button type="button" data-q="${i}" class="${fatta(d, p.risposte[i]) ? 'risp' : ''}${i === p.i ? ' cur' : ''}${p.segnate.has(i) ? ' flag' : ''}" aria-label="Domanda ${i + 1}">${i + 1}</button>`).join('');
    $('#prova-barra').style.width = (p.domande.filter((d, i) => fatta(d, p.risposte[i])).length / n * 100) + '%';
  }
  function vaiDomanda(i) {
    const p = prova; if (!p || i < 0 || i >= p.domande.length) return;
    p.i = i; const d = p.domande[i], r = p.risposte[i], n = p.domande.length;
    let corpo;
    if (d.t === 'o') {
      const messi = r || [], resto = d.opz.map((_, k) => k).filter(k => !messi.includes(k));
      corpo = `<p class="q-aiuto">Tocca gli elementi nell'ordine giusto. Tocca un elemento già messo per toglierlo.</p><div class="q-ordine">
        <div><h5>Da mettere in ordine</h5><div class="lista" data-lista="resto">${resto.length ? resto.map(k => `<button type="button" data-ord="${k}">${esc(d.opz[k])}</button>`).join('') : '<div class="vuota">Tutti messi ✓</div>'}</div></div>
        <div><h5>Il tuo ordine</h5><div class="lista" data-lista="messi">${messi.length ? messi.map((k, j) => `<button type="button" data-tolgo="${j}"><i>${j + 1}</i>${esc(d.opz[k])}</button>`).join('') : '<div class="vuota">Ancora vuoto</div>'}</div>${messi.length ? '<button type="button" class="btn piccolo ghost" data-azzera style="margin-top:8px">Ricomincia</button>' : ''}</div></div>`;
    } else {
      const sel = k => d.t === 'm' ? (r || []).includes(k) : r === k;
      const lettera = k => d.t === 'v' ? (k ? 'F' : 'V') : 'ABCDEFG'[k];
      corpo = `${d.t === 'm' ? '<p class="q-aiuto">Seleziona tutte le risposte giuste (può essere più di una).</p>' : ''}<div class="q-opz" data-t="${d.t}">${d.opz.map((x, k) => `<button type="button" data-k="${k}" class="${sel(k) ? 'sel' : ''}" aria-pressed="${sel(k)}"><span class="l"><span>${lettera(k)}</span></span><span>${esc(x)}</span></button>`).join('')}</div>`;
    }
    $('#q-area').innerHTML = `<div class="q-card"><div class="q-tipo"><span>Domanda ${i + 1} di ${n}</span><span class="t">${TIPI[d.t]}</span><span>Cap. ${d.cap}</span><button type="button" class="segna" aria-pressed="${p.segnate.has(i)}">⚑ ${p.segnate.has(i) ? 'Contrassegnata' : 'Contrassegna'}</button></div><p class="q-dom">${esc(d.d)}</p>${corpo}</div>
      <div class="q-nav"><button class="btn" type="button" data-nav="-1" ${i === 0 ? 'disabled' : ''}>← Precedente</button><span class="sp"></span>${i < n - 1 ? '<button class="btn p" type="button" data-nav="1">Successiva →</button>' : '<button class="btn verde" type="button" data-consegna>Consegna l\'esame ✓</button>'}</div>`;
    puntini();
  }
  $('#esami-prova').addEventListener('click', e => {
    if (!prova) {
      if (e.target.closest('#esito-rifai')) { const id = e.target.closest('#esito-rifai').dataset.id; iniziaProva(infoEsame(id), candidato()); }
      if (e.target.closest('#att-stampa')) { $('#stampa').innerHTML = $('#esami-prova .attestato').outerHTML; print(); }
      return;
    }
    const p = prova, d = p.domande[p.i];
    const t = e.target;
    if (t.closest('[data-q]')) return vaiDomanda(+t.closest('[data-q]').dataset.q);
    if (t.closest('[data-nav]')) return vaiDomanda(p.i + +t.closest('[data-nav]').dataset.nav);
    if (t.closest('[data-consegna]') || t.closest('#consegna-alto')) return consegna(false);
    if (t.closest('.segna')) { p.segnate.has(p.i) ? p.segnate.delete(p.i) : p.segnate.add(p.i); return vaiDomanda(p.i); }
    const k = t.closest('.q-opz [data-k]');
    if (k) {
      const v = +k.dataset.k;
      if (d.t === 'm') { const r = new Set(p.risposte[p.i] || []); r.has(v) ? r.delete(v) : r.add(v); p.risposte[p.i] = [...r]; }
      else p.risposte[p.i] = v;
      return vaiDomanda(p.i);
    }
    const o = t.closest('[data-ord]'); if (o) { p.risposte[p.i] = [...(p.risposte[p.i] || []), +o.dataset.ord]; return vaiDomanda(p.i); }
    const tg = t.closest('[data-tolgo]'); if (tg) { const r = [...(p.risposte[p.i] || [])]; r.splice(+tg.dataset.tolgo, 1); p.risposte[p.i] = r.length ? r : null; return vaiDomanda(p.i); }
    if (t.closest('[data-azzera]')) { p.risposte[p.i] = null; return vaiDomanda(p.i); }
  });

  let consegnando = false;
  async function consegna(auto) {
    if (!prova || (consegnando && !auto)) return;
    if (!auto) {
      const p0 = prova, nr = p0.domande.filter((d, i) => !fatta(d, p0.risposte[i])).length, ns = p0.segnate.size;
      consegnando = true;
      const ok = await chiedi('Consegnare l\'esame?', (nr ? `Hai ${nr} domand${nr === 1 ? 'a' : 'e'} senza risposta: conteranno come sbagliate. ` : 'Hai risposto a tutte le domande. ') + (ns ? `Hai ancora ${ns} domand${ns === 1 ? 'a contrassegnata' : 'e contrassegnate'}. ` : '') + 'Dopo la consegna non potrai più cambiare le risposte.', 'Consegna', 'Continua l\'esame');
      consegnando = false;
      if (!ok || prova !== p0) return;
    }
    const p = prova; stopProva();
    const esatte = p.domande.map((d, i) => giusta(d, p.risposte[i]));
    const punti = esatte.filter(Boolean).length, tot = p.domande.length, pct = Math.round(punti / tot * 100), superato = punti / tot >= p.info.soglia - 1e-9;
    const tempo = Math.min(p.info.minuti * 60, Math.round((Date.now() - p.inizio) / 1000));
    const E = esiti(), e = E[p.info.id] || { best: 0, superato: false, tentativi: 0 };
    e.tentativi++; e.best = Math.max(e.best, pct); e.superato = e.superato || superato; e.ultimo = { punti, tot, pct, data: Date.now(), tempo };
    let codice = null;
    if (p.info.finale && superato) {
      codice = 'GU-' + firma(`${p.cand.nome}|${p.cand.matricola}|${punti}|${Date.now()}`);
      if (!e.attestato || pct >= e.attestato.pct) e.attestato = { nome: p.cand.nome, matricola: p.cand.matricola, punti, tot, pct, data: Date.now(), codice };
    }
    E[p.info.id] = e; LS.set('gu-esiti', E);
    salvaDB('esiti', { esame: p.info.id, titolo: p.info.finale ? p.info.titolo : `${p.info.titolo} · ${p.info.nome}`, nome: p.cand.nome || null, matricola: p.cand.matricola || null, discord: p.cand.discord || null, punti, totale: tot, percentuale: pct, superato, tempo, uscite: p.uscite, tentativo: e.tentativi, codice });
    aggiornaCTAEsami();
    mostraEsito(p, esatte, { punti, tot, pct, superato, tempo, codice, tentativo: e.tentativi });
    if (superato) coriandoli();
    if (CFG.webhookEsami && (p.info.finale || CFG.inviaEsamiCapitolo)) {
      const st = $('#invio-stato'); st.className = 'invio-stato'; st.textContent = '⏳ Invio dell\'esito all\'Alto Comando…';
      const r = await inviaDiscord(CFG.webhookEsami, {
        username: 'Gang Unit · Accademia', avatar_url: avatar(), ...menzione(CFG.menzioneEsami),
        embeds: [{
          title: `${superato ? '✅' : '❌'} ${p.info.finale ? 'Esame d\'accademia' : `Verifica capitolo ${p.info.cap.n} · ${p.info.nome}`} · ${superato ? 'SUPERATO' : 'NON SUPERATO'}`,
          color: superato ? 0x2fd38a : 0xff4d5e,
          fields: [
            { name: 'Candidato', value: tronca(p.cand.nome, 100), inline: true }, { name: 'Matricola', value: tronca(p.cand.matricola, 60), inline: true }, { name: 'Discord', value: tronca(p.cand.discord, 60), inline: true },
            { name: 'Punteggio', value: `**${punti}/${tot}** (${pct}%)`, inline: true }, { name: 'Soglia', value: `${Math.round(p.info.soglia * 100)}%`, inline: true }, { name: 'Tempo', value: `${mmss(tempo)} su ${mmss(p.info.minuti * 60)}`, inline: true },
            { name: 'Uscite dalla pagina', value: String(p.uscite), inline: true }, { name: 'Tentativo n.', value: String(e.tentativi), inline: true },
            ...(codice ? [{ name: 'Codice attestato', value: '`' + codice + '`', inline: true }] : []),
          ],
          footer: { text: 'Sito Gang Unit · NOW V4' }, timestamp: new Date().toISOString(),
        }],
      });
      st.className = 'invio-stato ' + (r.ok ? 'ok' : 'ko');
      st.textContent = r.ok ? '✓ Esito inviato all\'Alto Comando su Discord' : '⚠ Non è stato possibile inviare l\'esito a Discord. Fai uno screenshot di questa pagina.';
    }
  }
  function testoRisposta(d, r) {
    if (r == null || (Array.isArray(r) && !r.length)) return '<em>nessuna risposta</em>';
    if (d.t === 'm') return r.map(k => esc(d.opz[k])).join(' · ');
    if (d.t === 'o') return r.map((k, j) => `${j + 1}. ${esc(d.opz[k])}`).join(' → ');
    return esc(d.opz[r]);
  }
  function testoGiusta(d) {
    if (d.t === 'm') return d.giuste.map(k => esc(d.opz[k])).join(' · ');
    if (d.t === 'o') return d.o.map((x, j) => `${j + 1}. ${esc(x)}`).join(' → ');
    return esc(d.opz[d.giusta]);
  }
  function mostraEsito(p, esatte, x) {
    const info = p.info, box = $('#esami-prova');
    const [tit, txt] = x.superato
      ? (info.finale ? ['Esame d\'accademia superato', 'Hai il requisito d\'esame per passare da Recluta ad Agente I (art. 2.4). Conserva il codice dell\'attestato.'] : x.pct === 100 ? ['Perfetto', 'Nessun errore: conosci questo capitolo alla perfezione.'] : ['Verifica superata', 'Ripassa le domande sbagliate qui sotto prima del prossimo turno.'])
      : ['Non superato', `Serviva almeno il ${Math.round(info.soglia * 100)}%. Rileggi gli articoli indicati nelle risposte sbagliate e riprova.`];
    const ref = id => { const el = document.getElementById(id); return el ? ($('.ref', el)?.textContent || 'regolamento') : 'regolamento'; };
    box.innerHTML = `<div class="prova">
      <div class="esito-card ${x.superato ? 'ok' : 'ko'}">
        <div class="esito-anello" style="--p:${x.pct}"><div><b>${x.pct}%</b><small>${x.punti}/${x.tot} giuste</small></div></div>
        <div><span class="esito-tag">${x.superato ? 'SUPERATO' : 'NON SUPERATO'}</span><h2>${tit}</h2><p>${txt}</p>
          <div class="stat-esito"><span>${esc(info.finale ? info.titolo : info.titolo + ' · ' + info.nome)}</span><span>Tempo <b>${mmss(x.tempo)}</b></span><span>Soglia <b>${Math.round(info.soglia * 100)}%</b></span><span>Uscite dalla pagina <b>${p.uscite}</b></span><span>Tentativo <b>n. ${x.tentativo}</b></span>${x.codice ? `<span>Codice <b>${x.codice}</b></span>` : ''}</div>
          <div class="esito-az">${x.superato && info.finale ? '<a class="btn verde" href="#attestato">🎖 Vedi l\'attestato</a>' : ''}<button class="btn ${x.superato ? '' : 'p'}" type="button" id="esito-rifai" data-id="${info.id}">↻ Rifai</button><a class="btn ghost" href="#esami">Centro esami</a></div>
          <div class="invio-stato" id="invio-stato"></div>
        </div>
      </div>
      <div class="revisione"><h3>Correzione</h3>${p.domande.map((d, i) => `<div class="rv ${esatte[i] ? 'ok' : 'ko'}"><div class="rv-t">${esatte[i] ? '✓' : '✗'} DOMANDA ${i + 1} · ${TIPI[d.t].toUpperCase()}</div><div class="rv-d">${esc(d.d)}</div><div class="rv-r"><span><em>La tua risposta:</em> ${testoRisposta(d, p.risposte[i])}</span>${esatte[i] ? '' : `<span><em>Risposta giusta:</em> ${testoGiusta(d)}</span>`}</div><div class="rv-s">${esc(d.s || '')} <a href="#${d.a}">${esc(ref(d.a))} →</a></div></div>`).join('')}</div>
    </div>`;
    scrollTo({ top: 0, ...SALTA });
  }

  function mostraAttestato() {
    const a = esiti().finale?.attestato;
    if (!a) { toast('L\'attestato si ottiene superando l\'esame d\'accademia', 'ko'); centroEsami(); return; }
    $('#esami-centro').hidden = true; const box = $('#esami-prova'); box.hidden = false;
    box.innerHTML = `<div class="attestato"><div class="att-foglio"><div class="att-filigrana"></div>
      <img src="immagini/distintivo.jpg" alt="">
      <div class="a1">LOS SANTOS POLICE DEPARTMENT · GANG UNIT · ACCADEMIA</div>
      <h2>Attestato di idoneità</h2>
      <div class="a2">Si certifica che</div>
      <div class="nome">${esc(a.nome || '—')}</div>
      <div class="mat">MATRICOLA ${esc(a.matricola || '—')}</div>
      <p class="a3">ha superato l'<b>Esame d'accademia</b> della Gang Unit con <b>${a.punti}/${a.tot}</b> risposte corrette (${a.pct}%), dimostrando la conoscenza del Regolamento GU-NOW-001.</p>
      <div class="att-righe"><div>Data<b>${dataIt(new Date(a.data))}</b></div><div>Codice di verifica<b>${esc(a.codice)}</b></div><div>Per l'Alto Comando<b>Accademia GU</b></div></div>
      <div class="att-sigillo">Gang<br>Unit<br>★</div></div>
      <div class="att-az"><button class="btn p" type="button" id="att-stampa">🖨 Stampa o salva in PDF</button><a class="btn ghost" href="#esami">Centro esami</a></div></div>`;
  }

  /* ═════════════ CORIANDOLI ═════════════ */
  function coriandoli() {
    if (RIDOTTO) return;
    const c = $('#coriandoli'), x = c.getContext('2d'), d = Math.min(devicePixelRatio || 1, 2);
    c.width = innerWidth * d; c.height = innerHeight * d;
    const COL = ['#3b82f6', '#7cb0ff', '#ff4d5e', '#f5b942', '#2fd38a', '#ffffff'];
    const P = Array.from({ length: 160 }, () => ({ x: c.width / 2 + (Math.random() - .5) * c.width * .3, y: c.height * .35, vx: (Math.random() - .5) * 26 * d, vy: (-Math.random() * 22 - 8) * d, r: (Math.random() * 6 + 4) * d, a: Math.random() * 6.28, va: (Math.random() - .5) * .4, col: COL[Math.floor(Math.random() * COL.length)] }));
    const t0 = performance.now();
    (function f(t) {
      const k = (t - t0) / 1000; x.clearRect(0, 0, c.width, c.height);
      for (const p of P) { p.vy += .55 * d; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.a += p.va; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.globalAlpha = Math.max(0, 1 - k / 3.2); x.fillStyle = p.col; x.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); x.restore(); }
      if (k < 3.3) requestAnimationFrame(f); else x.clearRect(0, 0, c.width, c.height);
    })(t0);
  }

  /* ═════════════ ALTO COMANDO (profili Discord) ═════════════ */
  const AC = (CFG.altoComando || []).filter(p => p && p.discordId);
  const INFO_GRADO = Object.fromEntries(FASCE.flatMap(([f, , g]) => g.map(([n, s, d]) => [n, { sigla: s, desc: d, fascia: f }])));
  const RUOLO_BREVE = { 'Comandante': 'Guida l\'unità, approva le operazioni maggiori e decide su promozioni ed espulsioni.', 'Vice Comandante': 'Sostituisce il Comandante, coordina gli Ufficiali e la disciplina.' };
  const avatarBase = id => { try { return `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(id) >> 22n) % 6n)}.png`; } catch { return 'immagini/distintivo.jpg'; } };
  const cdnDc = (tipo, id, h, size) => h ? `https://cdn.discordapp.com/${tipo}/${id}/${h}.${h.startsWith('a_') ? 'gif' : 'png'}?size=${size}` : null;
  const profiliAC = {};
  async function profiloDiscord(id) {
    const k = 'gu-dc-' + id, c = LS.get(k, null);
    if (c && Date.now() - c.t < 6 * 3600e3) return c.p;
    try {
      const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 7000);
      const r = await fetch(`https://japi.rest/discord/v1/user/${encodeURIComponent(id)}`, { signal: ctl.signal }); clearTimeout(to);
      if (!r.ok) throw new Error(r.status);
      const d = (await r.json()).data || {};
      const p = { nome: d.global_name || d.username || '', utente: d.username || '', avatar: cdnDc('avatars', id, d.avatar, 256), banner: cdnDc('banners', id, d.banner, 600), colore: d.banner_color || (typeof d.accent_color === 'number' ? '#' + d.accent_color.toString(16).padStart(6, '0') : null) };
      LS.set(k, { t: Date.now(), p }); return p;
    } catch { return c ? c.p : null; }
  }
  const nomeAC = p => p.nome || profiliAC[p.discordId]?.nome || p.grado;
  const avatarAC = p => profiliAC[p.discordId]?.avatar || avatarBase(p.discordId);
  function cartaAC(p) {
    const pr = profiliAC[p.discordId], g = INFO_GRADO[p.grado] || { sigla: '', fascia: 'Alto Comando', desc: '' };
    return `<article class="ac-card${p.grado === 'Comandante' ? ' oro' : ''}"${pr?.colore ? ` style="--bn:${esc(pr.colore)}"` : ''}>
      <div class="ac-banner">${pr?.banner ? `<img src="${esc(pr.banner)}" alt="" loading="lazy">` : ''}</div>
      <div class="ac-corpo">
        <div class="ac-av"><span class="ac-anello"></span><img src="${esc(avatarAC(p))}" alt="Foto profilo di ${esc(nomeAC(p))}" data-base="${esc(avatarBase(p.discordId))}"><span class="ac-ins">${INS[p.grado] ? svgGrado(p.grado) : '★'}</span></div>
        <small>${esc(g.sigla)}${g.sigla ? ' · ' : ''}${esc(g.fascia)}</small>
        <h4>${esc(p.grado)}</h4>
        <div class="ac-nome">${esc(nomeAC(p))}${pr?.utente ? `<span>@${esc(pr.utente)}</span>` : ''}</div>
        <p class="ac-ruolo">${esc(RUOLO_BREVE[p.grado] || g.desc)}</p>
        <div class="ac-az"><a class="btn piccolo" href="https://discord.com/users/${esc(p.discordId)}" target="_blank" rel="noopener">Profilo Discord ↗</a><button class="btn piccolo ghost" type="button" data-menz="${esc(p.discordId)}">Copia menzione</button></div>
      </div></article>`;
  }
  function inCarica() {
    for (const p of AC) {
      const g = $$('#piramide .grado').find(x => $('b', x)?.textContent === p.grado);
      if (!g || $('.in-carica', g)) continue;
      $('div', g).insertAdjacentHTML('beforeend', `<a class="in-carica" href="https://discord.com/users/${esc(p.discordId)}" target="_blank" rel="noopener"><img src="${esc(avatarAC(p))}" alt="" data-base="${esc(avatarBase(p.discordId))}">In carica: ${esc(nomeAC(p))}</a>`);
    }
  }
  async function renderAC() {
    const lista = $('#ac-lista');
    if (!AC.length || !lista) { $('#alto-comando')?.remove(); return; }
    for (const p of AC) { const c = LS.get('gu-dc-' + p.discordId, null); if (c) profiliAC[p.discordId] = c.p; }
    lista.innerHTML = AC.map(cartaAC).join(''); inCarica();
    const prima = JSON.stringify(AC.map(p => profiliAC[p.discordId] || null));
    const pr = await Promise.all(AC.map(p => profiloDiscord(p.discordId)));
    AC.forEach((p, i) => { if (pr[i]) profiliAC[p.discordId] = pr[i]; });
    if (JSON.stringify(AC.map(p => profiliAC[p.discordId] || null)) !== prima) { lista.innerHTML = AC.map(cartaAC).join(''); $$('#piramide .in-carica').forEach(x => x.remove()); inCarica(); }
  }
  // se una foto Discord non si carica, metto quella predefinita di Discord
  document.addEventListener('error', e => { const i = e.target; if (i.tagName === 'IMG' && i.dataset.base && i.src !== i.dataset.base) i.src = i.dataset.base; }, true);

  /* ═════════════ ARCHIVIO ONLINE (Supabase) ═════════════ */
  const DB_ATTIVO = !!(CFG.supabaseUrl && CFG.supabaseChiave);
  let _sb = null;
  function db() {
    if (!DB_ATTIVO) return Promise.resolve(null);
    if (!_sb) _sb = new Promise(res => {
      const crea = () => { try { res(window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseChiave, { auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true } })); } catch { res(null); } };
      if (window.supabase?.createClient) return crea();
      const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/dist/umd/supabase.js'; s.onload = crea; s.onerror = () => res(null); document.head.appendChild(s);
    });
    return _sb;
  }
  async function salvaDB(tab, riga) { const sb = await db(); if (!sb) return { ok: false }; try { const { error } = await sb.from(tab).insert(riga); return { ok: !error }; } catch { return { ok: false }; } }
  const normBando = b => ({ numero: '', titolo: 'Bando', sottotitolo: '', apertoA: '', posti: 1, descrizione: '', requisiti: [], preferenziali: [], fasi: [], ...b });
  async function caricaBandiDB() {
    const sb = await db(); if (!sb) return;
    try { const { data, error } = await sb.from('bandi').select('*').order('ordine', { ascending: true }); if (error || !Array.isArray(data)) return; BANDI = data.map(r => normBando({ ...(r.dati || {}), id: r.id, ordine: r.ordine })); }
    catch { return; }
    nastro(); aggiornaBandiHome(); if (vista === 'bandi' && $('#candidatura').hidden) renderBandi();
  }

  /* ═════════════ AREA COMANDO (accesso con Discord) ═════════════ */
  const STATI_C = ['Nuova', 'In valutazione', 'Colloquio fissato', 'Accettata', 'Respinta'];
  const COL_STATO = { 'Nuova': 'var(--blu-chiaro)', 'In valutazione': 'var(--giallo)', 'Colloquio fissato': '#a78bfa', 'Accettata': 'var(--verde)', 'Respinta': 'var(--rosso)' };
  const ICO_DC = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .079.009c.12.099.246.198.373.292a.077.077 0 0 1-.007.128 12.3 12.3 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 0 0 .084.029 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.029zM8.02 15.331c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.332-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.332-.946 2.418-2.157 2.418z"/></svg>';
  const LUCCHETTO = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1.6"/></svg>';
  const C = { scheda: 'riepilogo', esiti: [], cand: [], membri: [], utente: null, errore: '', fE: 'tutti', fR: 'tutti', qE: '', fS: 'tutti', qC: '', bando: null };
  const cmdEl = $('#cmd');
  const quando = s => { const d = new Date(s); return isNaN(d) ? '—' : `${dataIt(d)} ${oraIt(d)}`; };
  const nomeEsame = id => { if (id === 'finale') return 'Esame d\'accademia'; const c = ESAMI.capitoli.find(x => x.id === id); return c ? `Cap. ${c.n} · ${c.titolo}` : id; };
  const gradoUtente = id => AC.find(p => p.discordId === id)?.grado || 'Accesso Area Comando';
  const portaCmd = (tit, testo, extra = '') => `<div class="cmd-porta"><div class="cmd-lucchetto">${LUCCHETTO}</div><small>Area Comando · riservata</small><h2>${tit}</h2><p>${testo}</p>${extra}</div>`;
  const ammessi = () => AC.length ? `<div class="cmd-ammessi"><small>Accesso consentito a</small>${AC.map(p => `<span><img src="${esc(avatarAC(p))}" alt="" data-base="${esc(avatarBase(p.discordId))}">${esc(nomeAC(p))}<em>${esc(p.grado)}</em></span>`).join('')}</div>` : '';

  async function areaComando() {
    if (!DB_ATTIVO) { cmdEl.innerHTML = portaCmd('Area Comando', 'Qui il Comandante e il Vice Comandante, dopo l\'accesso con Discord, vedono gli esiti di tutti gli esami, gestiscono le candidature e pubblicano i bandi.<br><b style="color:var(--oro)">Non è ancora attiva:</b> va collegato l\'archivio online, come spiegato nel file LEGGIMI.txt al punto 5.', `<button class="btn dc" type="button" disabled>${ICO_DC} Accedi con Discord</button>${ammessi()}`); return; }
    cmdEl.innerHTML = portaCmd('Controllo l\'accesso…', 'Un attimo.');
    const sb = await db();
    if (!sb) { cmdEl.innerHTML = portaCmd('Archivio non raggiungibile', 'Non riesco a collegarmi. Controlla la connessione e riprova.', '<button class="btn p" type="button" data-cmd="riprova">Riprova</button>'); return; }
    let sess = null; try { sess = (await sb.auth.getSession()).data.session; } catch {}
    if (!sess) { cmdEl.innerHTML = portaCmd('Area Comando', 'Riservata all\'Alto Comando della Gang Unit. Accedi con il tuo account Discord: il sito controlla che il tuo ID sia tra quelli autorizzati.', `<button class="btn dc" type="button" data-cmd="entra">${ICO_DC} Accedi con Discord</button>${ammessi()}`); return; }
    const m = sess.user?.user_metadata || {};
    C.utente = { id: String(m.provider_id || m.sub || ''), nome: m.custom_claims?.global_name || m.full_name || m.name || 'Utente Discord', avatar: m.avatar_url || m.picture || '' };
    let ok = false; try { const r = await sb.rpc('e_comandante'); ok = r.data === true; } catch {}
    if (!ok) { cmdEl.innerHTML = portaCmd('Accesso negato', `Sei entrato come <b>${esc(C.utente.nome)}</b>, ma questo account Discord non fa parte dell'Alto Comando.`, '<button class="btn" type="button" data-cmd="esci">Esci e cambia account</button>'); return; }
    await caricaCmd(sb); renderCmd();
  }
  async function entraDiscord(dest = '') {
    const sb = await db(); if (!sb) return;
    try { sessionStorage.setItem('gu-dopo-login', dest || 'sito'); } catch {}
    const torna = /^https?:/.test(location.href) ? location.origin + location.pathname : sitoURL();
    const { error } = await sb.auth.signInWithOAuth({ provider: 'discord', options: { redirectTo: torna } });
    if (error) toast('Accesso non riuscito: ' + error.message, 'ko');
  }
  async function caricaCmd(sb) {
    sb = sb || await db();
    const [e, c, b, mb] = await Promise.all([
      sb.from('esiti').select('*').order('creato', { ascending: false }).limit(1000),
      sb.from('candidature').select('*').order('creato', { ascending: false }).limit(500),
      sb.from('bandi').select('*').order('ordine', { ascending: true }),
      sb.from('membri').select('*').order('aggiornato', { ascending: false }).limit(500),
    ]);
    C.esiti = e.data || []; C.cand = c.data || []; C.membri = mb.data || [];
    await Promise.all(C.membri.filter(x => x.screen && x.stato !== 'esterno').slice(0, 60).map(async x => { try { const { data } = await sb.storage.from('verifiche').createSignedUrl(x.screen, 3600); x._url = data?.signedUrl || ''; } catch {} }));
    if (Array.isArray(b.data)) BANDI = b.data.map(r => normBando({ ...(r.dati || {}), id: r.id, ordine: r.ordine }));
    C.errore = [e.error, c.error, b.error, mb.error].filter(Boolean).map(x => x.message).join(' · ');
  }
  function renderCmd() {
    const nuove = C.cand.filter(x => (x.stato || 'Nuova') === 'Nuova').length, daVer = C.membri.filter(x => x.stato === 'in_verifica').length;
    cmdEl.innerHTML = `<div class="cmd-testa">
        <div class="cmd-utente"><img src="${esc(C.utente.avatar || avatarBase(C.utente.id || '0'))}" alt="" data-base="${esc(avatarBase(C.utente.id || '0'))}"><div><small>Area Comando · accesso con Discord</small><b>${esc(C.utente.nome)}</b><span>${esc(gradoUtente(C.utente.id))}</span></div></div>
        <div class="cmd-az"><button class="btn piccolo" type="button" data-cmd="aggiorna">↻ Aggiorna</button><button class="btn piccolo ghost" type="button" data-cmd="esci">Esci</button></div>
      </div>
      ${C.errore ? `<p class="bc-nota" style="margin:0 0 14px">Alcuni dati non sono arrivati: ${esc(C.errore)}</p>` : ''}
      <div class="schede cmd-schede" role="tablist">${[['riepilogo', 'Riepilogo'], ['esiti', `Esiti esami <span class="cnt">${C.esiti.length}</span>`], ['candidature', `Candidature${nuove ? ` <span class="cnt nuovo">${nuove} nuove</span>` : ''}`], ['verifiche', `Verifiche membri${daVer ? ` <span class="cnt nuovo">${daVer} da fare</span>` : ''}`], ['bandi', `Bandi <span class="cnt">${BANDI.length}</span>`]].map(([k, t]) => `<button type="button" role="tab" data-cs="${k}" aria-selected="${C.scheda === k}">${t}</button>`).join('')}</div>
      <div id="cmd-corpo"></div>`;
    renderScheda();
  }
  function renderScheda() {
    const el = $('#cmd-corpo'); if (!el) return;
    el.innerHTML = C.scheda === 'esiti' ? schedaEsiti() : C.scheda === 'candidature' ? schedaCandidature() : C.scheda === 'bandi' ? schedaBandi() : C.scheda === 'verifiche' ? schedaVerifiche() : schedaRiepilogo();
  }
  const rigaEsito = e => `<div class="cmd-riga"><span class="pill ${e.superato ? 'si' : 'no'}">${e.superato ? 'Superato' : 'Non sup.'}</span><div><b>${esc(e.nome || '—')}</b><small>${esc(nomeEsame(e.esame))} · ${quando(e.creato)}</small></div><em>${e.percentuale ?? 0}%</em></div>`;
  const rigaCand = c => { const st = c.stato || 'Nuova'; return `<div class="cmd-riga"><span class="pill st" style="--sc:${COL_STATO[st] || 'var(--blu)'}">${esc(st)}</span><div><b>${esc(c.nome || '—')}</b><small>${esc(c.bando_titolo || c.bando_id || '')} · ${quando(c.creato)}</small></div></div>`; };
  function schedaRiepilogo() {
    const fin = C.esiti.filter(e => e.esame === 'finale'), finOk = fin.filter(e => e.superato).length;
    const oggi0 = new Date(); oggi0.setHours(0, 0, 0, 0);
    return `<div class="numeri cmd-num">
        <div><b>${C.esiti.length}</b><span>Esami svolti</span></div>
        <div><b>${C.esiti.filter(e => new Date(e.creato) >= oggi0).length}</b><span>Esami oggi</span></div>
        <div><b>${fin.length ? Math.round(finOk / fin.length * 100) : 0}%</b><span>Promossi accademia</span></div>
        <div><b>${C.cand.filter(x => (x.stato || 'Nuova') === 'Nuova').length}</b><span>Candidature nuove</span></div>
        <div><b>${C.membri.filter(x => x.stato === 'in_verifica').length}</b><span>Screen da verificare</span></div></div>
      <div class="due cmd-due">
        <div class="riquadro"><h3 class="r-tit">Ultimi esiti <small><button class="link" type="button" data-cs="esiti">vedi tutti →</button></small></h3>${C.esiti.slice(0, 6).map(rigaEsito).join('') || '<p class="intro-s">Ancora nessun esame svolto.</p>'}</div>
        <div class="riquadro"><h3 class="r-tit">Ultime candidature <small><button class="link" type="button" data-cs="candidature">vedi tutte →</button></small></h3>${C.cand.slice(0, 6).map(rigaCand).join('') || '<p class="intro-s">Ancora nessuna candidatura.</p>'}</div>
      </div>`;
  }
  function esitiFiltrati() {
    const q = C.qE.trim().toLowerCase();
    return C.esiti.filter(e => (C.fE === 'tutti' || e.esame === C.fE) && (C.fR === 'tutti' || (C.fR === 'si') === !!e.superato) && (!q || [e.nome, e.matricola, e.discord, e.codice].join(' ').toLowerCase().includes(q)));
  }
  function schedaEsiti() {
    const L = esitiFiltrati();
    return `<div class="cmd-filtri">
        <input type="search" data-cf="qE" value="${esc(C.qE)}" placeholder="Cerca nome, matricola, Discord o codice">
        <select data-cf="fE"><option value="tutti">Tutti gli esami</option><option value="finale"${C.fE === 'finale' ? ' selected' : ''}>Esame d'accademia</option>${ESAMI.capitoli.map(c => `<option value="${c.id}"${C.fE === c.id ? ' selected' : ''}>Cap. ${c.n} · ${esc(c.titolo)}</option>`).join('')}</select>
        <select data-cf="fR"><option value="tutti">Tutti gli esiti</option><option value="si"${C.fR === 'si' ? ' selected' : ''}>Superati</option><option value="no"${C.fR === 'no' ? ' selected' : ''}>Non superati</option></select>
        <button class="btn piccolo" type="button" data-cmd="csv">⬇ Esporta in Excel</button>
      </div>
      <div class="tab"><table class="cmd-tab"><thead><tr><th>Data</th><th>Candidato</th><th>Esame</th><th>Punteggio</th><th>Esito</th><th>Tempo</th><th>Uscite</th><th>Codice</th><th></th></tr></thead><tbody>
      ${L.map(e => `<tr><td>${quando(e.creato)}</td><td><b>${esc(e.nome || '—')}</b><small>${esc(e.matricola || '')}${e.discord ? ' · ' + esc(e.discord) : ''}</small></td><td>${esc(nomeEsame(e.esame))}<small>tentativo n. ${esc(e.tentativo ?? '—')}</small></td><td><span class="punt"><i style="width:${+e.percentuale || 0}%"></i></span>${esc(e.punti)}/${esc(e.totale)} · ${esc(e.percentuale)}%</td><td><span class="pill ${e.superato ? 'si' : 'no'}">${e.superato ? 'Superato' : 'Non superato'}</span></td><td>${e.tempo != null ? mmss(+e.tempo) : '—'}</td><td>${e.uscite > 0 ? `<b style="color:var(--giallo)">${esc(e.uscite)}</b>` : '0'}</td><td><code>${esc(e.codice || '—')}</code></td><td><button class="cmd-x" type="button" data-del-esito="${esc(e.id)}" title="Elimina">🗑</button></td></tr>`).join('') || '<tr><td colspan="9" style="text-align:center;padding:30px">Nessun esito con questi filtri.</td></tr>'}
      </tbody></table></div><p class="intro-s" style="margin-top:10px">${L.length} esiti mostrati. «Uscite» = quante volte il candidato ha lasciato la pagina durante l'esame.</p>`;
  }
  function candFiltrate() {
    const q = C.qC.trim().toLowerCase();
    return C.cand.filter(c => (C.fS === 'tutti' || (c.stato || 'Nuova') === C.fS) && (!q || [c.nome, c.matricola, c.discord, c.protocollo, c.bando_titolo].join(' ').toLowerCase().includes(q)));
  }
  function schedaCandidature() {
    const L = candFiltrate();
    return `<div class="cmd-filtri"><input type="search" data-cf="qC" value="${esc(C.qC)}" placeholder="Cerca nome, matricola, Discord o protocollo"><select data-cf="fS"><option value="tutti">Tutti gli stati</option>${STATI_C.map(s => `<option${C.fS === s ? ' selected' : ''}>${s}</option>`).join('')}</select></div>
      <div class="cmd-cand">${L.map(c => { const st = c.stato || 'Nuova'; return `<details class="cmd-c" style="--sc:${COL_STATO[st] || 'var(--blu)'}"><summary><span class="pill st">${esc(st)}</span><div><b>${esc(c.nome || '—')}</b><small>${esc(c.matricola || '')} · ${esc(c.discord || '')} · ${esc(c.bando_titolo || c.bando_id || '')}</small></div><em>${quando(c.creato)}</em></summary>
        <div class="cmd-c-corpo">
          <div class="cmd-dati">${[['Protocollo', c.protocollo], ['ID Discord', c.discord_id], ['Grado attuale', c.grado], ['Età', c.eta], ['Ore a settimana', c.ore], ['Fasce orarie', c.fasce], ['Esame d\'accademia', c.esame], ...(c.ufficiale ? [['Ufficiale proponente', c.ufficiale]] : [])].map(([k, v]) => `<div><small>${k}</small><b>${esc(v ?? '—') || '—'}</b></div>`).join('')}</div>
          ${[['Esperienze', c.esperienze], ['Motivazione', c.motivazione], ['Caso pratico', c.caso]].map(([k, v]) => `<div class="cmd-testo"><small>${k}</small><p>${esc(v || '—')}</p></div>`).join('')}
          <form class="cmd-gestisci" data-cid="${esc(c.id)}"><label class="campo"><span>Stato</span><select name="stato">${STATI_C.map(s => `<option${st === s ? ' selected' : ''}>${s}</option>`).join('')}</select></label><label class="campo"><span>Messaggio per il candidato</span><input name="messaggio" value="${esc(c.messaggio || '')}" maxlength="500" placeholder="Lo vede lui sul sito, es. Colloquio venerdì alle 21"></label><label class="campo"><span>Nota interna</span><input name="nota" value="${esc(c.nota || '')}" maxlength="300" placeholder="La vede solo l'Alto Comando"></label><div class="cmd-gest-az"><button class="btn p piccolo" type="submit">Salva</button><button class="btn piccolo ghost" type="button" data-copia-cand="${esc(c.id)}">📋 Copia</button><button class="btn piccolo ghost" type="button" data-del-cand="${esc(c.id)}">🗑</button></div></form>
        </div></details>`; }).join('') || '<p class="intro-s">Nessuna candidatura con questi filtri.</p>'}</div>`;
  }
  function schedaVerifiche() {
    const ord = { in_verifica: 0, rifiutato: 1, approvato: 2, esterno: 3 };
    const NOMI = { in_verifica: 'Da verificare', rifiutato: 'Rifiutato', approvato: 'Membro', esterno: 'Esterno' };
    const COL = { in_verifica: 'var(--giallo)', rifiutato: 'var(--rosso)', approvato: 'var(--verde)', esterno: '#8a96b6' };
    const L = [...C.membri].sort((a, b) => (ord[a.stato] ?? 9) - (ord[b.stato] ?? 9));
    return `<p class="intro-s">Chi entra con Discord dice se fa parte della Gang Unit e manda uno screen. Se approvi, gli si apre tutto il sito; gli esterni e chi è in attesa vedono solo Bandi e Regolamento.</p>
      <div class="cmd-ver">${L.map(x => `<article class="cmd-v" style="--sc:${COL[x.stato] || 'var(--blu)'}">
        <div class="cmd-v-t"><img src="${esc(x.avatar || avatarBase(x.discord_id || '0'))}" alt="" data-base="${esc(avatarBase(x.discord_id || '0'))}"><div><b>${esc(x.nome || x.discord_nome || '—')}</b><small>${esc(x.discord_nome || '')}${x.discord_id ? ` · <a href="https://discord.com/users/${esc(x.discord_id)}" target="_blank" rel="noopener">profilo Discord</a>` : ''}</small></div><span class="pill st">${esc(NOMI[x.stato] || x.stato)}</span></div>
        <div class="cmd-v-g">${x.grado ? `Grado dichiarato: <b>${esc(x.grado)}</b> · ` : ''}${quando(x.aggiornato || x.creato)}${x.verificato_da ? ` · verificato da ${esc(x.verificato_da)}` : ''}</div>
        ${x._url ? `<a class="cmd-v-img" href="${esc(x._url)}" target="_blank" rel="noopener"><img src="${esc(x._url)}" alt="Screen di verifica" loading="lazy"><span>Apri lo screen ↗</span></a>` : x.stato !== 'esterno' ? '<div class="cmd-v-noimg">Nessuno screen</div>' : ''}
        ${x.stato !== 'esterno' ? `<form class="cmd-v-az" data-uid="${esc(x.user_id)}"><input name="nota" maxlength="200" value="${esc(x.nota || '')}" placeholder="Nota (es. motivo del rifiuto)"><button class="btn verde piccolo" type="submit" value="approvato">✓ Approva</button><button class="btn rosso piccolo" type="submit" value="rifiutato">✗ Rifiuta</button></form>` : ''}
      </article>`).join('') || '<p class="intro-s">Nessuno ha ancora fatto l\'accesso con Discord.</p>'}</div>`;
  }
  function schedaBandi() {
    if (C.bando) return editorBando(C.bando === 'nuovo' ? null : BANDI.find(b => b.id === C.bando));
    return `<div class="cmd-filtri"><button class="btn p" type="button" data-cmd="nuovo-bando">+ Nuovo bando</button><span class="intro-s" style="margin:0">Quello che salvi qui compare subito sul sito, senza toccare i file.</span></div>
      <div class="cmd-bandi">${BANDI.map(b => { const st = statoBando(b); return `<div class="cmd-b"><span class="stato-pill" style="--c:${st === 'aperto' ? 'var(--verde)' : st === 'arrivo' ? 'var(--giallo)' : '#5d6886'}"><i></i>${NOMI_STATO[st]}</span><div class="cmd-b-t"><b>${esc(b.titolo)}</b><small>${esc(b.numero)} · ${dataB(b.apertura)} → ${dataB(b.chiusura)} · ${esc(b.posti)} posti</small></div><div class="cmd-b-az"><button class="btn piccolo" type="button" data-bmod="${esc(b.id)}">Modifica</button><button class="btn piccolo ghost" type="button" data-annuncio="${esc(b.id)}">📋 Annuncio</button><button class="btn piccolo ghost" type="button" data-del-bando="${esc(b.id)}">🗑</button></div></div>`; }).join('') || '<p class="intro-s">Nessun bando. Creane uno nuovo.</p>'}</div>`;
  }
  function editorBando(b) {
    const v = b || { numero: '', titolo: '', sottotitolo: '', apertoA: 'Agenti LSPD in servizio', apertura: '', chiusura: '', posti: 1, esameRichiesto: true, interno: false, descrizione: '', requisiti: [], preferenziali: [], fasi: [], note: '', esito: '', ordine: BANDI.length };
    const t = (n, lab, val, extra = '') => `<label class="campo"><span>${lab}</span><input name="${n}" value="${esc(val ?? '')}" ${extra}></label>`;
    const a = (n, lab, val, aiuto = '') => `<label class="campo largo"><span>${lab}</span><textarea name="${n}" rows="4">${esc(val)}</textarea>${aiuto ? `<small>${aiuto}</small>` : ''}</label>`;
    return `<form class="riquadro cmd-editor" id="cmd-bando" novalidate><h3 class="r-tit">${b ? 'Modifica bando' : 'Nuovo bando'}</h3><div class="form-griglia">
      ${t('titolo', 'Titolo <em>*</em>', v.titolo, 'maxlength="90" placeholder="es. Reclutamento Agenti Gang Unit"')}${t('numero', 'Numero del bando', v.numero, 'placeholder="es. Bando n. 02/2026"')}
      ${t('sottotitolo', 'Sottotitolo', v.sottotitolo)}${t('apertoA', 'Aperto a', v.apertoA)}
      ${t('apertura', 'Apertura <em>*</em>', v.apertura, 'type="datetime-local"')}${t('chiusura', 'Chiusura <em>*</em>', v.chiusura, 'type="datetime-local"')}
      ${t('posti', 'Posti', v.posti, 'type="number" min="1" max="99"')}${t('ordine', 'Posizione in elenco', v.ordine ?? 0, 'type="number"')}
      <div class="campo largo dichiara"><label><input type="checkbox" name="esameRichiesto" ${v.esameRichiesto ? 'checked' : ''}>Per candidarsi serve l'esame d'accademia superato</label><label><input type="checkbox" name="interno" ${v.interno ? 'checked' : ''}>Bando interno (solo per chi è già nella Gang Unit)</label></div>
      ${a('descrizione', 'Descrizione', v.descrizione)}
      ${a('requisiti', 'Requisiti', (v.requisiti || []).join('\n'), 'Uno per riga.')}
      ${a('preferenziali', 'Titoli preferenziali', (v.preferenziali || []).join('\n'), 'Uno per riga (facoltativo).')}
      ${a('fasi', 'Fasi della selezione', (v.fasi || []).map(f => f.join(' | ')).join('\n'), 'Una per riga, così: Titolo | descrizione')}
      ${t('note', 'Nota in fondo al bando', v.note)}${t('esito', 'Esito (per i bandi chiusi)', v.esito)}
      </div><div class="cand-invia"><small>${b ? `Codice del bando: <code>${esc(b.id)}</code>` : 'Il codice del bando viene creato dal titolo.'}</small><button class="btn ghost" type="button" data-cmd="annulla-bando">Annulla</button><button class="btn p" type="submit">Salva bando</button></div></form>`;
  }
  async function salvaBando(form) {
    const f = new FormData(form), g = k => String(f.get(k) || '').trim(), righe = k => g(k).split('\n').map(x => x.trim()).filter(Boolean);
    if (!g('titolo') || !g('apertura') || !g('chiusura')) { toast('Titolo, apertura e chiusura sono obbligatori', 'ko'); return; }
    if (new Date(g('chiusura')) <= new Date(g('apertura'))) { toast('La chiusura deve venire dopo l\'apertura', 'ko'); return; }
    const vecchio = C.bando !== 'nuovo' ? BANDI.find(b => b.id === C.bando) : null;
    const id = vecchio?.id || (g('titolo').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) + '-' + Date.now().toString(36).slice(-4));
    const dati = { numero: g('numero'), titolo: g('titolo'), sottotitolo: g('sottotitolo'), apertoA: g('apertoA'), apertura: g('apertura'), chiusura: g('chiusura'), posti: +g('posti') || 1, esameRichiesto: !!f.get('esameRichiesto'), interno: !!f.get('interno'), descrizione: g('descrizione'), requisiti: righe('requisiti'), preferenziali: righe('preferenziali'), fasi: righe('fasi').map(r => { const [x, ...d] = r.split('|'); return [x.trim(), d.join('|').trim()]; }), note: g('note'), esito: g('esito') };
    const sb = await db(); const { error } = await sb.from('bandi').upsert({ id, dati, ordine: +g('ordine') || 0, aggiornato: new Date().toISOString() });
    if (error) { toast('Salvataggio non riuscito: ' + error.message, 'ko'); return; }
    toast('Bando salvato ✓ È già visibile sul sito', 'ok'); C.bando = null; await caricaCmd(sb); nastro(); aggiornaBandiHome(); renderCmd();
  }
  function esportaCSV() {
    const L = esitiFiltrati(), q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = ['Data;Nome;Matricola;Discord;Esame;Punti;Totale;Percentuale;Esito;Tempo;Uscite dalla pagina;Tentativo;Codice', ...L.map(e => [quando(e.creato), e.nome, e.matricola, e.discord, nomeEsame(e.esame), e.punti, e.totale, e.percentuale, e.superato ? 'Superato' : 'Non superato', e.tempo != null ? mmss(+e.tempo) : '', e.uscite, e.tentativo, e.codice].map(q).join(';'))].join('\r\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })); a.download = `esiti-esami-${dataIt(new Date()).replace(/\//g, '-')}.csv`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  }
  const testoCand = c => [`📨 **CANDIDATURA · ${(c.bando_titolo || '').toUpperCase()}**`, `Protocollo \`${c.protocollo || '—'}\` · Stato: **${c.stato || 'Nuova'}**`, '', `**Personaggio:** ${c.nome}`, `**Matricola LSPD:** ${c.matricola}`, `**Grado attuale:** ${c.grado || '—'}`, `**Discord:** ${c.discord}${c.discord_id ? ` (<@${c.discord_id}>)` : ''}`, `**Età:** ${c.eta ?? '—'}`, `**Ore a settimana:** ${c.ore || '—'}`, `**Fasce orarie:** ${c.fasce || '—'}`, c.ufficiale ? `**Ufficiale proponente:** ${c.ufficiale}` : null, `**Esame d'accademia:** ${c.esame || '—'}`, '', `**Motivazione:**\n${c.motivazione || '—'}`, '', `**Caso pratico:**\n${c.caso || '—'}`].filter(x => x !== null).join('\n');
  async function elimina(tab, id, cosa) {
    if (!(await chiedi(`Eliminare ${cosa}?`, 'L\'eliminazione è definitiva: non si può annullare.', 'Elimina', 'Annulla'))) return;
    const sb = await db(); const { error } = await sb.from(tab).delete().eq('id', id);
    if (error) { toast('Eliminazione non riuscita: ' + error.message, 'ko'); return; }
    toast('Eliminato', 'ok'); await caricaCmd(sb); nastro(); aggiornaBandiHome(); renderCmd();
  }
  cmdEl.addEventListener('click', async e => {
    const t = e.target;
    const cs = t.closest('[data-cs]'); if (cs) { C.scheda = cs.dataset.cs; C.bando = null; renderCmd(); return; }
    const c = t.closest('[data-cmd]')?.dataset.cmd;
    if (c === 'entra') return entraDiscord('comando');
    if (c === 'esci') { const sb = await db(); try { await sb?.auth.signOut(); } catch {} C.utente = null; toast('Sei uscito dall\'Area Comando'); return areaComando(); }
    if (c === 'riprova') { _sb = null; return areaComando(); }
    if (c === 'aggiorna') { await caricaCmd(); renderCmd(); toast('Dati aggiornati', 'ok'); return; }
    if (c === 'csv') return esportaCSV();
    if (c === 'nuovo-bando') { C.bando = 'nuovo'; return renderScheda(); }
    if (c === 'annulla-bando') { C.bando = null; return renderScheda(); }
    const bm = t.closest('[data-bmod]'); if (bm) { C.bando = bm.dataset.bmod; return renderScheda(); }
    const an = t.closest('[data-annuncio]'); if (an) { const b = BANDI.find(x => x.id === an.dataset.annuncio); toast((await copia(annuncio(b))) ? 'Annuncio copiato: incollalo su Discord' : 'Copia non riuscita', 'ok'); return; }
    const cc = t.closest('[data-copia-cand]'); if (cc) { const x = C.cand.find(y => String(y.id) === cc.dataset.copiaCand); toast((await copia(testoCand(x))) ? 'Candidatura copiata' : 'Copia non riuscita', 'ok'); return; }
    const d1 = t.closest('[data-del-esito]'); if (d1) return elimina('esiti', d1.dataset.delEsito, 'questo esito');
    const d2 = t.closest('[data-del-cand]'); if (d2) return elimina('candidature', d2.dataset.delCand, 'questa candidatura');
    const d3 = t.closest('[data-del-bando]'); if (d3) return elimina('bandi', d3.dataset.delBando, 'questo bando');
  });
  const filtroCmd = el => { C[el.dataset.cf] = el.value; const testo = el.tagName === 'INPUT', pos = testo ? el.selectionStart : 0; renderScheda(); if (testo) { const n = $(`[data-cf="${el.dataset.cf}"]`, cmdEl); n.focus(); n.setSelectionRange(pos, pos); } };
  cmdEl.addEventListener('input', e => { if (e.target.matches('input[data-cf]')) filtroCmd(e.target); });
  cmdEl.addEventListener('change', e => { if (e.target.matches('select[data-cf]')) filtroCmd(e.target); });
  cmdEl.addEventListener('submit', async e => {
    e.preventDefault();
    if (e.target.id === 'cmd-bando') return salvaBando(e.target);
    const fv = e.target.closest('.cmd-v-az');
    if (fv) {
      const stato = e.submitter?.value, nota = String(new FormData(fv).get('nota') || '').trim(), sb = await db();
      if (!['approvato', 'rifiutato'].includes(stato)) return;
      const { error } = await sb.from('membri').update({ stato, nota: nota || null, verificato_da: C.utente?.nome || null }).eq('user_id', fv.dataset.uid);
      if (error) { toast('Salvataggio non riuscito: ' + error.message, 'ko'); return; }
      const x = C.membri.find(y => y.user_id === fv.dataset.uid); if (x) { x.stato = stato; x.nota = nota; }
      toast(stato === 'approvato' ? 'Membro approvato ✓ Ora vede tutto il sito' : 'Verifica rifiutata', stato === 'approvato' ? 'ok' : 'ko'); renderCmd(); return;
    }
    const fg = e.target.closest('.cmd-gestisci');
    if (fg) {
      const f = new FormData(fg), sb = await db();
      const { error } = await sb.from('candidature').update({ stato: String(f.get('stato')), nota: String(f.get('nota') || '').trim() || null, messaggio: String(f.get('messaggio') || '').trim() || null }).eq('id', fg.dataset.cid);
      if (error) { toast('Salvataggio non riuscito: ' + error.message, 'ko'); return; }
      const x = C.cand.find(y => String(y.id) === fg.dataset.cid); if (x) { x.stato = String(f.get('stato')); x.nota = String(f.get('nota') || '').trim(); x.messaggio = String(f.get('messaggio') || '').trim(); }
      toast('Candidatura aggiornata ✓ Il candidato vede l\'esito sul sito', 'ok'); renderCmd();
    }
  });
  if (DB_ATTIVO) db().then(sb => {
    if (!sb) return;
    sb.auth.onAuthStateChange((ev, s) => {
      if (!s || (ev !== 'SIGNED_IN' && ev !== 'INITIAL_SESSION')) return;
      let dopo = null; try { dopo = sessionStorage.getItem('gu-dopo-login'); sessionStorage.removeItem('gu-dopo-login'); } catch {}
      if (dopo) setTimeout(() => { controllaAccesso(); if (dopo === 'comando') { if (location.hash !== '#comando') location.hash = 'comando'; else areaComando(); } }, 0);
    });
    caricaBandiDB(); controllaAccesso();
  });

  /* ═════════════ ACCESSO AL SITO (Discord + verifica con screen) ═════════════ */
  // Chi non è verificato come membro della Gang Unit vede solo queste sezioni:
  const VISTE_LIBERE = ['home', 'regolamento', 'bandi', 'comando', 'bloccato'];
  const ACC = { stato: DB_ATTIVO ? (LS.get('gu-acc', null)?.stato || 'ospite') : 'aperto', utente: null, riga: null };
  const accessoPieno = () => ['aperto', 'membro', 'comandante'].includes(ACC.stato);
  const puoVedere = v => accessoPieno() || VISTE_LIBERE.includes(v);
  const ETICH = { ospite: ['Ospite', '#8a96b6'], esterno: ['Esterno', '#8a96b6'], in_verifica: ['In verifica', 'var(--giallo)'], rifiutato: ['Non verificato', 'var(--rosso)'], membro: ['Membro GU', 'var(--verde)'], comandante: ['Area Comando', 'var(--oro)'] };
  const GRADI_LISTA = FASCE.flatMap(([, , g]) => g.map(x => x[0])).reverse();
  const porta = $('#porta'), pbox = $('#porta-box'), chip = $('#account');
  let fileScreen = null;

  function renderChip() {
    if (ACC.stato === 'aperto') { chip.hidden = true; return; }
    chip.hidden = false;
    if (!ACC.utente) { chip.className = 'account dc'; chip.innerHTML = `${ICO_DC}<span>Accedi</span>`; chip.title = 'Accedi con Discord'; return; }
    const [t, c] = ETICH[ACC.stato] || ETICH.ospite;
    chip.className = 'account'; chip.style.setProperty('--sc', c); chip.title = 'Il tuo accesso';
    chip.innerHTML = `<img src="${esc(ACC.utente.avatar || avatarBase(ACC.utente.id || '0'))}" alt="" data-base="${esc(avatarBase(ACC.utente.id || '0'))}"><span>${esc(t)}</span><i></i>`;
  }
  function applicaAccesso() {
    document.body.dataset.accesso = ACC.stato;
    $$('.nav a[data-v]').forEach(a => a.classList.toggle('chiuso', !puoVedere(a.dataset.v)));
    $$('a.cat, a.cap-a.esa').forEach(c => c.classList.toggle('chiuso', !puoVedere(risolvi(c.getAttribute('href').slice(1)).v)));
    const nc = $('.nav-cmd'); if (nc) nc.hidden = !(ACC.stato === 'comandante' || ACC.stato === 'aperto');
    renderChip();
    if (DB_ATTIVO) LS.set('gu-acc', { stato: ACC.stato });
    if (vista && !puoVedere(vista)) vai();
    else if (vista === 'bloccato') vai();
  }
  function mostraBloccato(v) {
    mostraVista('bloccato');
    const nome = { strumenti: 'Strumenti', esami: 'Esami' }[v] || 'Sezione riservata';
    const [t, c] = ETICH[ACC.stato] || ETICH.ospite;
    const testo = ACC.stato === 'in_verifica' ? 'Il tuo screen è in verifica: appena l\'Alto Comando lo approva, questa sezione si apre da sola.'
      : ACC.stato === 'rifiutato' ? `La verifica non è stata approvata${ACC.riga?.nota ? ` (${esc(ACC.riga.nota)})` : ''}. Puoi mandare un nuovo screen.`
      : ACC.stato === 'esterno' ? 'Hai indicato di non far parte della Gang Unit: puoi vedere Bandi e Regolamento. Se invece ne fai parte, manda uno screen.'
      : ACC.utente ? 'Dicci se fai parte della Gang Unit: se sì, basta uno screen per la verifica.'
      : 'Questa sezione è solo per i membri della Gang Unit. Accedi con Discord e dimostra con uno screen che ne fai parte. Senza accesso puoi vedere Bandi e Regolamento.';
    const az = !ACC.utente ? `<button class="btn dc" type="button" data-pt="entra">${ICO_DC} Accedi con Discord</button>`
      : ACC.stato === 'in_verifica' ? '' : ACC.stato === 'ospite' ? '<button class="btn p" type="button" data-pt="scelta">Rispondi ora</button>' : '<button class="btn p" type="button" data-pt="screen">📷 Invia lo screen</button>';
    $('#bloccato').innerHTML = `<div class="cmd-porta blocco"><div class="cmd-lucchetto">${LUCCHETTO}</div><small>Riservato ai membri della Gang Unit</small><h2>${nome}</h2><p>${testo}</p>
      <div class="esito-az" style="justify-content:center">${az}<a class="btn ghost" href="#bandi">Bandi</a><a class="btn ghost" href="#regolamento">Regolamento</a></div>
      <div class="cmd-ammessi"><small>Il tuo accesso</small><span class="st-acc" style="--sc:${c}"><i class="pallino"></i>${esc(t)}</span></div></div>`;
  }

  /* ── la porta d'ingresso animata ── */
  function chiudiPorta() { porta.classList.remove('aperta'); document.documentElement.classList.remove('porta-su'); setTimeout(() => { if (!porta.classList.contains('aperta')) porta.hidden = true; }, 450); }
  function apriPorta(passo) {
    porta.hidden = false; document.documentElement.classList.add('porta-su');
    requestAnimationFrame(() => requestAnimationFrame(() => porta.classList.add('aperta')));
    const u = ACC.utente;
    const saluto = u ? `<div class="pt-utente"><img src="${esc(u.avatar || avatarBase(u.id || '0'))}" alt="" data-base="${esc(avatarBase(u.id || '0'))}"><span>Accesso come <b>${esc(u.nome)}</b></span></div>` : '';
    const logo = '<div class="pt-logo"><span class="pt-radar"></span><span class="pt-radar r2"></span><span class="pt-anello"></span><img src="immagini/distintivo.jpg" alt=""></div>';
    let h = '';
    if (passo === 'benvenuto') h = `${logo}<small class="pt-cod"><span class="pt-scrivi">LSPD · GANG UNIT · ACCESSO RISERVATO</span></small><h2>Identificati, agente</h2><p>Accedi con Discord: il sito si ricorda se fai parte della Gang Unit. Chi non ne fa parte può vedere solo <b>Bandi</b> e <b>Regolamento</b>.</p><button class="btn dc grande" type="button" data-pt="entra">${ICO_DC} Accedi con Discord</button><button class="link pt-ospite" type="button" data-pt="ospite">Continua come ospite · solo bandi e regolamento</button>`;
    else if (passo === 'scelta') h = `${logo}${saluto}<h2>Fai parte della Gang Unit?</h2><p>Rispondi una volta sola: il sito se lo ricorda.</p><div class="pt-scelte"><button type="button" data-pt="si"><b>Sì, sono nella GU</b><span>Lo dimostri con uno screen. Dopo la verifica dell'Alto Comando vedi tutto il sito.</span></button><button type="button" data-pt="no"><b>No, sono esterno</b><span>Vedi Bandi e Regolamento e puoi candidarti ai bandi aperti.</span></button></div>`;
    else if (passo === 'screen') h = `${saluto}<h2>Verifica con uno screen</h2><p>Carica uno screen in cui si vede che fai parte della Gang Unit: il tuo ruolo GU su Discord oppure il tablet in gioco con il tuo grado.</p>
      <form id="pt-form" class="pt-form" novalidate><div class="form-griglia">
        <label class="campo"><span>Nome del personaggio <em>*</em></span><input name="nome" maxlength="60" value="${esc(ACC.riga?.nome || candidato().nome || '')}" placeholder="es. Marco Rossi"></label>
        <label class="campo"><span>Grado nella GU <em>*</em></span><select name="grado"><option value="">Scegli…</option>${GRADI_LISTA.map(g => `<option${ACC.riga?.grado === g ? ' selected' : ''}>${g}</option>`).join('')}</select></label></div>
        <label class="pt-drop" id="pt-drop"><input type="file" name="screen" accept="image/png,image/jpeg,image/webp" hidden><span class="pt-drop-t"><span class="pt-drop-i">📷</span><b>Tocca per scegliere lo screen</b><small>oppure trascinalo qui o incollalo con Ctrl+V · PNG o JPG, massimo 6 MB</small></span><img id="pt-anteprima" alt="Anteprima dello screen" hidden></label>
        <div class="pt-az"><button class="btn ghost" type="button" data-pt="${ACC.riga ? 'chiudi' : 'scelta'}">${ACC.riga ? 'Annulla' : '← Indietro'}</button><button class="btn p" type="submit">Invia per la verifica</button></div></form>`;
    else if (passo === 'attesa') h = `<div class="pt-attesa"><span class="pt-scan"></span><span class="pt-clessidra">⏳</span></div><h2>Verifica in corso</h2><p>L'Alto Comando controllerà il tuo screen. Quando lo approva, al prossimo accesso vedi tutto il sito. Nel frattempo puoi vedere <b>Bandi</b> e <b>Regolamento</b>.</p><button class="btn p" type="button" data-pt="chiudi">Entra nel sito →</button>`;
    else if (passo === 'ok') h = `<div class="pt-ok">✓</div><h2>Accesso confermato</h2><p>Benvenuto nella Gang Unit${ACC.riga?.nome ? ', <b>' + esc(ACC.riga.nome) + '</b>' : ''}. La verifica è stata approvata: ora vedi tutto il sito.</p><button class="btn verde grande" type="button" data-pt="chiudi">Entra →</button>`;
    else if (passo === 'stato') {
      const [t, c] = ETICH[ACC.stato] || ETICH.ospite;
      const spieg = { ospite: 'Non hai ancora detto se fai parte della Gang Unit.', esterno: 'Hai indicato di non far parte della Gang Unit: vedi Bandi e Regolamento.', in_verifica: 'Il tuo screen è in attesa di verifica da parte dell\'Alto Comando.', rifiutato: `La verifica non è stata approvata.${ACC.riga?.nota ? ' Nota: ' + esc(ACC.riga.nota) : ''}`, membro: 'Sei verificato come membro della Gang Unit: hai accesso a tutto.', comandante: 'Fai parte dell\'Alto Comando: hai accesso a tutto, compresa l\'Area Comando.' }[ACC.stato] || '';
      h = `${saluto}<h2>Il tuo accesso</h2><div class="pt-stato" style="--sc:${c}"><i></i><b>${esc(t)}</b></div><p>${spieg}</p><div class="pt-az">${['esterno', 'rifiutato'].includes(ACC.stato) ? '<button class="btn p" type="button" data-pt="screen">📷 Sono nella GU: invia lo screen</button>' : ''}${ACC.stato === 'ospite' ? '<button class="btn p" type="button" data-pt="scelta">Rispondi ora</button>' : ''}${ACC.stato === 'comandante' ? '<a class="btn p" href="#comando" data-pt="chiudi">Area Comando</a>' : ''}<button class="btn ghost" type="button" data-pt="esci">Esci da Discord</button><button class="btn ghost" type="button" data-pt="chiudi">Chiudi</button></div>`;
    }
    pbox.dataset.passo = passo;
    pbox.innerHTML = (['benvenuto', 'scelta'].includes(passo) ? '' : '<button class="pt-x" type="button" data-pt="chiudi" aria-label="Chiudi">✕</button>') + `<div class="pt-passo">${h}</div>`;
  }

  async function controllaAccesso() {
    if (!DB_ATTIVO) { ACC.stato = 'aperto'; applicaAccesso(); return; }
    const sb = await db(); if (!sb) { applicaAccesso(); return; }
    let s = null; try { s = (await sb.auth.getSession()).data.session; } catch {}
    if (!s) {
      ACC.utente = null; ACC.riga = null; ACC.stato = 'ospite'; applicaAccesso();
      if (!LS.get('gu-ospite', false) && porta.hidden) apriPorta('benvenuto');
      return;
    }
    const m = s.user.user_metadata || {};
    ACC.utente = { uid: s.user.id, id: String(m.provider_id || ''), nome: m.custom_claims?.global_name || m.full_name || m.name || 'Utente Discord', avatar: m.avatar_url || m.picture || '' };
    let com = false, riga = null;
    try { com = (await sb.rpc('e_comandante')).data === true; } catch {}
    try { riga = (await sb.from('membri').select('*').eq('user_id', s.user.id).maybeSingle()).data || null; } catch {}
    const prima = LS.get('gu-acc', null)?.stato;
    ACC.riga = riga;
    ACC.stato = com ? 'comandante' : !riga ? 'ospite' : riga.stato === 'approvato' ? 'membro' : riga.stato;
    applicaAccesso();
    if (!com && !riga) apriPorta('scelta');
    else if (ACC.stato === 'membro' && prima && !['membro', 'comandante'].includes(prima)) apriPorta('ok');
    else if (!porta.hidden && ['benvenuto', 'scelta'].includes(pbox.dataset.passo)) chiudiPorta();
  }
  async function sceltaEsterno() {
    const sb = await db(); if (!sb || !ACC.utente) return;
    const { error } = await sb.from('membri').upsert({ user_id: ACC.utente.uid, discord_nome: ACC.utente.nome, avatar: ACC.utente.avatar, stato: 'esterno' });
    if (error) { toast('Non riesco a salvare la scelta: ' + error.message, 'ko'); return; }
    ACC.riga = { ...(ACC.riga || {}), stato: 'esterno' }; ACC.stato = 'esterno'; applicaAccesso(); chiudiPorta();
    toast('Fatto: puoi vedere Bandi e Regolamento', 'ok');
  }
  function leggiScreen(f) {
    if (!f) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(f.type)) { toast('Serve un\'immagine PNG, JPG o WEBP', 'ko'); return; }
    if (f.size > 6 * 1024 * 1024) { toast('Lo screen supera i 6 MB', 'ko'); return; }
    fileScreen = f;
    const img = $('#pt-anteprima'); if (!img) return;
    img.src = URL.createObjectURL(f); img.hidden = false; $('#pt-drop').classList.add('pieno');
  }
  async function inviaScreen(form) {
    const f = new FormData(form), nome = String(f.get('nome') || '').trim(), grado = String(f.get('grado') || '');
    if (!nome || !grado) { toast('Scrivi il nome del personaggio e scegli il grado', 'ko'); return; }
    if (!fileScreen) { toast('Carica lo screen per la verifica', 'ko'); $('#pt-drop').classList.add('errore'); return; }
    const btn = $('button[type="submit"]', form); btn.disabled = true; btn.textContent = 'Invio in corso…';
    const fine = msg => { toast(msg, 'ko'); btn.disabled = false; btn.textContent = 'Invia per la verifica'; };
    const sb = await db(); if (!sb || !ACC.utente) return fine('Archivio non raggiungibile');
    const ext = fileScreen.type === 'image/jpeg' ? 'jpg' : fileScreen.type.split('/')[1];
    const path = `${ACC.utente.uid}/${Date.now()}.${ext}`;
    const up = await sb.storage.from('verifiche').upload(path, fileScreen, { contentType: fileScreen.type, upsert: false });
    if (up.error) return fine('Caricamento non riuscito: ' + up.error.message);
    const riga = { user_id: ACC.utente.uid, discord_nome: ACC.utente.nome, avatar: ACC.utente.avatar, nome, grado, stato: 'in_verifica', screen: path };
    const { error } = await sb.from('membri').upsert(riga);
    if (error) return fine('Invio non riuscito: ' + error.message);
    if (CFG.webhookVerifiche) {
      const fd = new FormData();
      fd.append('payload_json', JSON.stringify({ username: 'Gang Unit · Verifiche', avatar_url: avatar(), ...menzione(CFG.menzioneCandidature), embeds: [{ title: '📷 Nuova richiesta di verifica', color: 0xffc94a, description: `${ACC.utente.id ? `<@${ACC.utente.id}> ` : ''}chiede l'accesso come membro della Gang Unit.\nApprova o rifiuta dall'Area Comando del sito.`, fields: [{ name: 'Personaggio', value: tronca(nome, 100), inline: true }, { name: 'Grado dichiarato', value: grado, inline: true }, { name: 'Discord', value: tronca(ACC.utente.nome, 100), inline: true }], image: { url: `attachment://screen.${ext}` }, timestamp: new Date().toISOString() }] }));
      fd.append('files[0]', fileScreen, `screen.${ext}`);
      fetch(CFG.webhookVerifiche, { method: 'POST', body: fd }).catch(() => {});
    }
    fileScreen = null;
    ACC.riga = { ...(ACC.riga || {}), ...riga }; ACC.stato = 'in_verifica'; applicaAccesso(); apriPorta('attesa');
  }
  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-pt]'); if (!b) return;
    const a = b.dataset.pt;
    if (a === 'entra') { LS.set('gu-ospite', false); return entraDiscord(); }
    if (a === 'ospite') { LS.set('gu-ospite', true); chiudiPorta(); toast('Sei entrato come ospite: puoi vedere Bandi e Regolamento'); return; }
    if (a === 'chiudi') return chiudiPorta();
    if (a === 'scelta') return apriPorta('scelta');
    if (a === 'si' || a === 'screen') return apriPorta(ACC.utente ? 'screen' : 'benvenuto');
    if (a === 'no') return sceltaEsterno();
    if (a === 'esci') { const sb = await db(); try { await sb?.auth.signOut(); } catch {} ACC.utente = null; ACC.riga = null; ACC.stato = 'ospite'; LS.set('gu-ospite', true); applicaAccesso(); chiudiPorta(); toast('Sei uscito da Discord'); }
  });
  chip.addEventListener('click', () => apriPorta(ACC.utente ? 'stato' : 'benvenuto'));
  porta.addEventListener('change', e => { if (e.target.name === 'screen') leggiScreen(e.target.files[0]); });
  porta.addEventListener('dragover', e => { const d = e.target.closest('#pt-drop'); if (d) { e.preventDefault(); d.classList.add('sopra'); } });
  porta.addEventListener('dragleave', e => { e.target.closest('#pt-drop')?.classList.remove('sopra'); });
  porta.addEventListener('drop', e => { const d = e.target.closest('#pt-drop'); if (!d) return; e.preventDefault(); d.classList.remove('sopra'); leggiScreen(e.dataTransfer.files[0]); });
  porta.addEventListener('submit', e => { if (e.target.id === 'pt-form') { e.preventDefault(); inviaScreen(e.target); } });
  document.addEventListener('paste', e => { if (porta.hidden || pbox.dataset.passo !== 'screen') return; const f = [...(e.clipboardData?.files || [])].find(x => x.type.startsWith('image/')); if (f) { e.preventDefault(); leggiScreen(f); } });

  /* ═════════════ ESITO DELLA CANDIDATURA (lo vede il candidato sul sito) ═════════════ */
  const ICO_STATO = { 'Nuova': '📨', 'In valutazione': '🔎', 'Colloquio fissato': '📅', 'Accettata': '✅', 'Respinta': '✖' };
  const SPIEG_STATO = { 'Nuova': 'La candidatura è arrivata: l\'Alto Comando non l\'ha ancora aperta.', 'In valutazione': 'L\'Alto Comando sta valutando la tua candidatura.', 'Colloquio fissato': 'Sei stato chiamato per il colloquio: leggi il messaggio qui sotto.', 'Accettata': 'Complimenti! Sei stato preso nella Gang Unit.', 'Respinta': 'Questa volta la candidatura non è stata accettata. Potrai riprovare al prossimo bando.' };
  async function chiediEsito(protocollo, discordId) {
    const sb = await db(); if (!sb) return null;
    try { const { data, error } = await sb.rpc('esito_candidatura', { p_protocollo: protocollo, p_discord: discordId }); if (error) return null; return Array.isArray(data) ? (data[0] || null) : data; } catch { return null; }
  }
  const cartaEsito = (e, prot) => { const st = e.stato || 'Nuova'; return `<div class="esito-cand" style="--sc:${COL_STATO[st] || 'var(--blu)'}"><span class="ec-i">${ICO_STATO[st] || '📨'}</span><div class="ec-t"><small>${esc(e.bando_titolo || 'Candidatura')} · Codice pratica ${esc(prot)}</small><b>${esc(st)}</b><p>${SPIEG_STATO[st] || ''}</p>${e.messaggio ? `<blockquote><small>Messaggio dall'Alto Comando</small>${esc(e.messaggio)}</blockquote>` : ''}</div></div>`; };
  async function controllaEsiti() {
    const mie = Object.entries(LS.get('gu-candidature', {})).filter(([, v]) => v && v.protocollo && v.discordId);
    const ris = await Promise.all(mie.map(async ([bid, v]) => ({ bid, v, e: await chiediEsito(v.protocollo, v.discordId) })));
    return ris.filter(x => x.e);
  }
  async function renderEsiti() {
    const box = $('#esiti-cand'); if (!box) return;
    if (!DB_ATTIVO) { box.hidden = true; return; }
    const ris = await controllaEsiti();
    const visti = LS.get('gu-esiti-visti', {}); let festa = false;
    for (const { v, e } of ris) { if (e.stato === 'Accettata' && visti[v.protocollo] !== 'Accettata') festa = true; visti[v.protocollo] = e.stato; }
    LS.set('gu-esiti-visti', visti);
    const c = candidato();
    box.hidden = false;
    box.innerHTML = `${ris.length ? `<div class="esiti-testa"><small>Le tue candidature</small><h3>Esito della candidatura</h3></div>${ris.map(({ v, e }) => cartaEsito(e, v.protocollo)).join('')}` : ''}
      <details class="controlla"${ris.length ? '' : ''}><summary>${ris.length ? 'Controlla un\'altra candidatura' : 'Hai già inviato una candidatura? Controlla l\'esito'}</summary>
        <form id="form-esito" class="form-griglia" novalidate><label class="campo"><span>Codice pratica</span><input name="prot" maxlength="12" placeholder="es. GU-C-8K2PQ" autocapitalize="characters"></label><label class="campo"><span>ID Discord</span><input name="did" inputmode="numeric" maxlength="20" value="${esc(c.discordId || '')}" placeholder="es. 633339352491229184"></label><div class="largo"><button class="btn p piccolo" type="submit">Controlla l'esito</button></div></form>
        <div id="esito-manuale"></div></details>`;
    if (festa && vista === 'bandi') coriandoli();
  }
  document.addEventListener('submit', async e => {
    if (e.target.id !== 'form-esito') return;
    e.preventDefault();
    const f = new FormData(e.target), prot = String(f.get('prot') || '').trim().toUpperCase(), did = String(f.get('did') || '').trim();
    if (!/^GU-C-[A-Z0-9]{3,8}$/.test(prot) || !/^\d{17,20}$/.test(did)) { toast('Controlla codice pratica e ID Discord', 'ko'); return; }
    const out = $('#esito-manuale'); out.innerHTML = '<p class="intro-s">Controllo…</p>';
    const ris = await chiediEsito(prot, did);
    if (!ris) { out.innerHTML = '<p class="intro-s">Nessuna candidatura con questi dati. Controlla che codice e ID siano scritti giusti.</p>'; return; }
    const tutte = LS.get('gu-candidature', {}); tutte[ris.bando_id || prot] = { ...(tutte[ris.bando_id || prot] || {}), protocollo: prot, discordId: did, data: Date.now() }; LS.set('gu-candidature', tutte);
    LS.set('gu-candidato', { ...candidato(), discordId: did });
    renderEsiti();
  });
  // al caricamento: se l'esito è cambiato dall'ultima volta, avviso
  if (DB_ATTIVO) setTimeout(async () => {
    const ris = await controllaEsiti(), visti = LS.get('gu-esiti-visti', {});
    const nuovi = ris.filter(({ v, e }) => visti[v.protocollo] && visti[v.protocollo] !== e.stato);
    if (nuovi.length && vista !== 'bandi') toast(`Novità sulla tua candidatura: ${nuovi[0].e.stato}. Apri la pagina Bandi`, 'ok');
  }, 2500);

  /* ═════════════ AVVIO ═════════════ */
  nastro(); filtraRadio($('#art-5-1')); filtraRadio($('#s-radio .riquadro')); aggiornaLetti(); minaccia(livello, false); aggiornaBandiHome(); aggiornaCTAEsami();
  applicaAccesso(); renderAC();
  vai();
})();
