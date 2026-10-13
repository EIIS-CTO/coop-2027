(function(){
  const { avatar, icon, SKIN, HAIRC, OUTFIT, HAIRS } = window.CL;
  const R = window.CLRooms;
  const root = document.getElementById('game');
  if (!root) return;

  const PEOPLE = { Maria:'imgs/maria.jpg', Paola:'imgs/paola.jpg', Luca:'imgs/luca.jpg', Roberto:'imgs/roberto.jpg' };
  const METERS = [
    { k:'energia', name:'Energia', ico:'bolt', col:'#E9B44C' },
    { k:'acqua', name:'Acqua', ico:'drop', col:'#5F9BBE' },
    { k:'rifiuti', name:'Rifiuti', ico:'recycle', col:'#7FA37A' },
    { k:'spesa', name:'Spesa', ico:'cart', col:'#D9734E' }
  ];
  const QUESTS = {
    living: [
      { id:'tv', ico:'tv', t:'Guarda la video lezione' },
      { id:'libreria', ico:'book', t:'Sfoglia una dispensa' },
      { id:'ciabatta', ico:'plug', t:'Caccia allo stand-by' },
      { id:'lampadina', ico:'sun', t:'Scegli la lampadina giusta' },
      { id:'termostato', ico:'thermo', t:'Regola il termostato' },
      { id:'cestino', ico:'recycle', t:'Il bidone giusto' }
    ],
    kitchen: [
      { id:'frigo', ico:'leaf', t:'Svuota-frigo con Paola' },
      { id:'dispensa', ico:'cart', t:'La spesa consapevole' }
    ]
  };
  const UNLOCK_AT = 4;

  const S = {
    name:'', skin:1, hair:'corti', hairColor:1, outfit:0,
    room:'living', pos:[4.2, 7.0], facing:1,
    meters:{ energia:30, acqua:35, rifiuti:25, spesa:30 },
    points:0, done:{}, lamp:'inc', temp:23, doorOpen:false, badges:[], busy:false, finished:false
  };

  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const iconAt = (name, x, y, size, sw = 2.4) =>
    icon(name, sw).replace('<svg ', `<svg x="${x}" y="${y}" width="${size}" height="${size}" `);

  function startScreen(){
    root.innerHTML = '';
    root.append(h(`<div class="start"><div>
      <h3>Casa Sostenibile</h3>
      <p>Demo di concept · circa 5 minuti</p>
      <button class="gbtn" id="gStart">${icon('play')} Inizia</button></div></div>`));
    root.querySelector('#gStart').onclick = creator;
  }

  function creator(){
    root.innerHTML = '';
    const el = h(`<div class="creator">
      <div class="cr-title">Crea il tuo personaggio</div>
      <div class="cr-prev">
        <svg viewBox="-110 -215 220 275" id="crSvg"></svg>
        <div class="cr-name" id="crName">&nbsp;</div>
      </div>
      <div class="cr-panel">
        <h3>Chi abita qui?</h3>
        <p>Cinque scelte e sei pronto a entrare.</p>
        <div class="cr-row"><label>Carnagione</label><div class="sw" data-k="skin"></div></div>
        <div class="cr-row"><label>Capelli</label><div class="sw txt" data-k="hair"></div></div>
        <div class="cr-row"><label>Colore dei capelli</label><div class="sw" data-k="hairColor"></div></div>
        <div class="cr-row"><label>Colore dei vestiti</label><div class="sw" data-k="outfit"></div></div>
        <div class="cr-row"><label>Nome</label><input id="crIn" maxlength="14" placeholder="Come ti chiami?" autocomplete="off"></div>
        <button class="gbtn" id="crGo" disabled>Entra in casa ${icon('door')}</button>
      </div></div>`);
    root.append(el);
    const opts = { skin:SKIN, hairColor:HAIRC, outfit:OUTFIT };
    el.querySelectorAll('.sw').forEach(sw => {
      const k = sw.dataset.k;
      if (k === 'hair') sw.innerHTML = HAIRS.map(v => `<button data-v="${v}">${v}</button>`).join('');
      else sw.innerHTML = opts[k].map((c, i) => `<button data-v="${i}" style="background:${c}" aria-label="${k} ${i + 1}"></button>`).join('');
      sw.onclick = e => {
        const b = e.target.closest('button'); if (!b) return;
        S[k] = k === 'hair' ? b.dataset.v : +b.dataset.v;
        paint();
      };
    });
    const input = el.querySelector('#crIn'), go = el.querySelector('#crGo');
    input.oninput = () => { S.name = input.value.trim(); paint(); };
    input.onkeydown = e => { if (e.key === 'Enter' && S.name) enterHouse(); };
    go.onclick = enterHouse;
    function paint(){
      el.querySelectorAll('.sw').forEach(sw => sw.querySelectorAll('button').forEach(b =>
        b.classList.toggle('on', String(S[sw.dataset.k]) === b.dataset.v)));
      el.querySelector('#crSvg').innerHTML =
        `<polygon points="0,-30 95,18 0,66 -95,18" transform="translate(0,-18)" fill="#E3B98A" stroke="#C99A6A" stroke-width="2"/>
         <g class="av" transform="translate(0,4) scale(1.55)">${avatar(S)}</g>`;
      el.querySelector('#crName').textContent = S.name || ' ';
      go.disabled = !S.name;
    }
    paint();
    setTimeout(() => input.focus({ preventScroll:true }), 50);
  }

  let stage, sceneG, avG, mkG, room;

  function enterHouse(){
    if (!S.name) return;
    root.innerHTML = '';
    root.append(h(`<svg class="stage" viewBox="${R.VIEW}" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9CC5D9"/><stop offset="1" stop-color="#E7F1EC"/></linearGradient>
        <linearGradient id="scrIdle" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3D5A6C"/><stop offset="1" stop-color="#22303A"/></linearGradient>
        <linearGradient id="scrDone" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7FA37A"/><stop offset="1" stop-color="#4E7349"/></linearGradient>
        <radialGradient id="gInc"><stop offset="0" stop-color="#FFB347" stop-opacity=".75"/><stop offset="1" stop-color="#FFB347" stop-opacity="0"/></radialGradient>
        <radialGradient id="gLed"><stop offset="0" stop-color="#FFF6DD" stop-opacity=".8"/><stop offset="1" stop-color="#FFF6DD" stop-opacity="0"/></radialGradient>
      </defs>
      <g id="sceneG"></g><g id="avG"></g><g id="mkG"></g></svg>`));
    root.append(h(`<div class="hud">
      <div class="who"><div class="face" id="hFace"></div><div><b id="hName"></b><small id="hLvl"></small></div></div>
      <div class="room-name" id="hRoom"></div>
      <div class="meters" id="hMeters"></div></div>`));
    root.append(h(`<div class="quests" id="hQuests"></div>`));
    root.append(h(`<div class="msgs" id="hMsgs"></div>`));
    root.append(h(`<div class="fade" id="hFade"></div>`));
    stage = root.querySelector('.stage');
    sceneG = stage.querySelector('#sceneG'); avG = stage.querySelector('#avG'); mkG = stage.querySelector('#mkG');
    stage.addEventListener('click', onStageClick);
    root.querySelector('#hQuests').addEventListener('click', e => {
      const li = e.target.closest('li[data-id]'); if (li) activate(li.dataset.id);
    });
    S.room = 'living';
    renderRoom(true);
    renderHud();
    setTimeout(() => msg('Maria', `Ciao ${esc(S.name)}, eccoti a casa! Clicca sugli oggetti che brillano: ognuno nasconde un piccolo gesto che fa bene alla casa e al portafoglio.`), 700);
    setTimeout(() => msg('Roberto', 'Comincia dalla TV: c\'è la prima lezione. Dura meno di un caffè.'), 7000);
  }

  function renderRoom(placeAtSpawn){
    room = S.room === 'living' ? R.living(S) : R.kitchen(S);
    sceneG.innerHTML = room.svg;
    if (placeAtSpawn) S.pos = room.spawn.slice();
    drawAvatar();
    drawMarkers();
    root.querySelector('#hRoom').textContent = S.room === 'living' ? 'Salotto' : 'Cucina';
    renderQuests();
  }

  function drawAvatar(walking){
    const [x, y] = R.P(S.pos[0], S.pos[1], 0);
    avG.innerHTML = `<g class="av${walking ? ' walking' : ''}" transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${S.facing},1)">${avatar(S)}</g>`;
  }

  function drawMarkers(){
    mkG.innerHTML = room.markers.map(m => {
      const [x, y] = m.p;
      let col = '#D9734E', ic = m.ico, cls = '';
      if (m.door){
        const open = S.room === 'kitchen' || S.doorOpen;
        col = open ? '#E9B44C' : '#9A8676'; ic = open ? 'door' : 'lock';
      } else if (S.done[m.id]){ col = '#5E8459'; ic = 'check'; cls = ' done'; }
      const lw = m.label.length * 7.4 + 22;
      return `<g class="marker${cls}" data-mk="${m.id}" transform="translate(${x.toFixed(1)},${y.toFixed(1)})">
        <g class="mk">
          <path d="M-7 13 L0 22 L7 13 Z" fill="${col}"/>
          <circle r="${cls ? 13 : 17}" fill="${col}" stroke="#fff" stroke-width="3"/>
          ${iconAt(ic, cls ? -8 : -10, cls ? -8 : -10, cls ? 16 : 20)}
          <g class="ml"><rect x="${-lw / 2}" y="-48" width="${lw}" height="24" rx="12" fill="#2B211C"/>
          <text x="0" y="-31" text-anchor="middle" font-family="Nunito" font-weight="800" font-size="13" fill="#fff">${m.label}</text></g>
        </g></g>`;
    }).join('');
    mkG.querySelectorAll('.marker svg').forEach(s => s.style.color = '#fff');
  }

  function onStageClick(e){
    const mk = e.target.closest('[data-mk]');
    const hot = e.target.closest('[data-hot]');
    const id = mk ? mk.dataset.mk : hot ? hot.dataset.hot : null;
    if (id) activate(id);
  }

  function activate(id){
    if (S.busy || root.querySelector('.mback')) return;
    if (id === 'door') return useDoor();
    const fn = window.CLGames && window.CLGames[id];
    if (fn) fn(API);
  }

  function useDoor(){
    if (S.room === 'living' && !S.doorOpen){
      const left = UNLOCK_AT - countDone('living');
      msg('Maria', `La cucina è ancora chiusa. Completa ${left} ${left === 1 ? 'missione' : 'missioni'} del salotto per aprirla.`);
      return;
    }
    S.busy = true;
    walk(room.toDoor, () => {
      const fade = root.querySelector('#hFade');
      fade.classList.add('on');
      setTimeout(() => {
        const prev = S.room;
        S.room = prev === 'living' ? 'kitchen' : 'living';
        room = S.room === 'living' ? R.living(S) : R.kitchen(S);
        S.pos = room.fromDoor[0].slice();
        renderRoom(false);
        fade.classList.remove('on');
        walk(room.fromDoor, () => {
          S.busy = false;
          if (S.room === 'kitchen' && !S.done._kitchenHi){
            S.done._kitchenHi = true;
            msg('Paola', `Eccoti in cucina, ${esc(S.name)}! Apriamo il frigo e vediamo cosa possiamo salvare per stasera.`);
          }
        });
      }, 480);
    });
  }

  function walk(path, done){
    const speed = 3.2; // floor units per second
    let i = 0, from = path[0].slice(), t0 = null;
    S.pos = from.slice();
    const seg = () => {
      const a = path[i], b = path[i + 1];
      return { a, b, len: Math.hypot(b[0] - a[0], b[1] - a[1]) };
    };
    let cur = seg();
    const step = ts => {
      if (t0 === null) t0 = ts;
      const k = Math.min(1, (ts - t0) / 1000 * speed / Math.max(cur.len, .001));
      S.pos = [cur.a[0] + (cur.b[0] - cur.a[0]) * k, cur.a[1] + (cur.b[1] - cur.a[1]) * k];
      const sa = R.P(cur.a[0], cur.a[1]), sb = R.P(cur.b[0], cur.b[1]);
      if (Math.abs(sb[0] - sa[0]) > 1) S.facing = sb[0] > sa[0] ? 1 : -1;
      drawAvatar(true);
      if (k >= 1){
        i++;
        if (i >= path.length - 1){ drawAvatar(false); done && done(); return; }
        cur = seg(); t0 = ts;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function renderHud(){
    root.querySelector('#hFace').innerHTML = `<svg viewBox="-24 -134 48 48">${avatar(S)}</svg>`;
    root.querySelector('#hName').textContent = S.name;
    const lvl = 1 + Math.floor(S.points / 120);
    root.querySelector('#hLvl').textContent = `Livello ${lvl} · ${S.points} eco-punti`;
    const box = root.querySelector('#hMeters');
    if (!box.children.length){
      box.innerHTML = METERS.map(m => `<div class="meter" data-m="${m.k}">
        <div class="mi" style="color:${m.col}">${icon(m.ico, 2.4)}<span style="color:var(--ink-2)">${m.name}</span></div>
        <div class="bar"><i style="background:${m.col};width:0"></i></div></div>`).join('');
    }
    requestAnimationFrame(() => METERS.forEach(m =>
      box.querySelector(`[data-m="${m.k}"] i`).style.width = S.meters[m.k] + '%'));
  }

  function renderQuests(){
    const list = QUESTS[S.room];
    const n = list.filter(q => S.done[q.id]).length;
    const sub = S.room === 'living'
      ? (S.doorOpen ? 'Cucina sbloccata! Clicca sulla porta.' : `Completane ${UNLOCK_AT} per aprire la cucina`)
      : 'Due sfide per chiudere la demo';
    root.querySelector('#hQuests').innerHTML = `
      <h4>Missioni ${S.room === 'living' ? 'del salotto' : 'della cucina'}</h4>
      <div class="qsub">${sub}</div>
      <ul>${list.map(q => `<li data-id="${q.id}" class="${S.done[q.id] ? 'done' : ''}">
        <span class="qi">${icon(S.done[q.id] ? 'check' : q.ico, 2.4)}</span>${q.t}</li>`).join('')}</ul>
      <div class="qbar"><i style="width:${n / list.length * 100}%"></i></div>`;
  }

  const countDone = r => QUESTS[r].filter(q => S.done[q.id]).length;

  function msg(who, text){
    const box = root.querySelector('#hMsgs'); if (!box) return;
    while (box.children.length >= 2) box.firstElementChild.remove();
    const el = h(`<div class="msg"><img src="${PEOPLE[who]}" alt="${who}"><div><b>${who}</b><p>${text}</p></div></div>`);
    const kill = () => { el.classList.add('out'); setTimeout(() => el.remove(), 350); };
    el.onclick = kill;
    box.append(el);
    setTimeout(kill, 9000);
  }

  function toast(title, sub, ico, col){
    const el = h(`<div class="toast"><div class="tb" style="background:${col}">${icon(ico, 2.4)}</div><div><b>${title}</b><small>${sub}</small></div></div>`);
    root.append(el);
    setTimeout(() => el.remove(), 3300);
  }

  function modal({ title, sub = '', ico = 'star', col = '#D9734E', body = '', foot = '', onMount, onClose }){
    closeModal(true);
    const el = h(`<div class="mback"><div class="modal" role="dialog" aria-label="${title}">
      <div class="m-head"><div class="m-ico" style="background:${col}">${icon(ico, 2.4)}</div>
        <div><small>${sub}</small><h3>${title}</h3></div>
        <button class="m-x" aria-label="Chiudi">${icon('x', 2.6)}</button></div>
      <div class="m-body">${body}</div>
      ${foot ? `<div class="m-foot">${foot}</div>` : ''}</div></div>`);
    el._onClose = onClose;
    el.querySelector('.m-x').onclick = () => closeModal();
    el.addEventListener('click', e => { if (e.target === el) closeModal(); });
    root.append(el);
    onMount && onMount(el);
    return el;
  }
  function closeModal(silent){
    const el = root.querySelector('.mback'); if (!el) return;
    const cb = el._onClose; el.remove();
    document.querySelectorAll('body > .item.drag').forEach(n => n.remove());
    if (!silent && cb) cb();
    if (!silent) afterClose();
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  const pending = [];
  function complete(id, { meters = {}, points = 20, badge, who, say } = {}){
    if (S.done[id]) return false;
    S.done[id] = true;
    S.points += points;
    Object.entries(meters).forEach(([k, v]) => {
      S.meters[k] = Math.max(0, Math.min(100, S.meters[k] + v));
      const m = root.querySelector(`[data-m="${k}"]`);
      if (m){ m.classList.remove('pulse'); void m.offsetWidth; m.classList.add('pulse'); }
    });
    if (badge){ S.badges.push(badge); toast(badge.t, `Badge sbloccato · +${points} eco-punti`, badge.ico, badge.col); }
    renderHud();
    sceneG.innerHTML = (room = S.room === 'living' ? R.living(S) : R.kitchen(S)).svg;
    drawMarkers(); renderQuests();
    if (who && say) pending.push([who, say]);
    if (S.room === 'living' && !S.doorOpen && countDone('living') >= UNLOCK_AT){
      S.doorOpen = true;
      pending.push(['Maria', 'Bravissimo lavoro! La porta della cucina è aperta: Paola ti aspetta di là.']);
      pending.push(['_toast']);
    }
    if (countDone('kitchen') === QUESTS.kitchen.length && !S.finished){ S.finished = true; pending.push(['_final']); }
    return true;
  }

  function afterClose(){
    let delay = 300;
    while (pending.length){
      const [who, text] = pending.shift();
      if (who === '_toast') setTimeout(() => { refresh(); toast('Nuova stanza sbloccata', 'La cucina ti aspetta', 'door', '#E9B44C'); }, delay);
      else if (who === '_final') setTimeout(finalScreen, delay + 900);
      else setTimeout(() => msg(who, text), delay);
      delay += 1400;
    }
  }

  function refresh(){
    room = S.room === 'living' ? R.living(S) : R.kitchen(S);
    sceneG.innerHTML = room.svg; drawMarkers(); renderQuests();
  }

  function finalScreen(){
    modal({
      title:'Demo completata', sub:`Casa di ${esc(S.name)}`, ico:'star', col:'#E9B44C',
      body:`<div class="final">
        <div class="big">${S.points} eco-punti · Livello ${1 + Math.floor(S.points / 120)}</div>
        <p style="color:var(--ink-2)">Hai sistemato il salotto e la cucina. Nel gioco completo la casa continua a crescere:</p>
        <div class="next-rooms">
          <span>${icon('drop')} Bagno · Acqua</span><span>${icon('recycle')} Balcone · Rifiuti</span>
          <span>${icon('washer')} Lavanderia · Elettrodomestici</span><span>${icon('sprout')} Orto · Stagioni</span></div>
        <div class="badges-row">${S.badges.map(b => `<div style="background:${b.col}" title="${b.t}">${icon(b.ico, 2.4)}</div>`).join('')}</div>
        <p class="small-note">I punteggi della demo sono indicativi.</p></div>`,
      foot:`<button class="gbtn sec" id="fAgain">Rigioca</button><button class="gbtn" id="fBack">Torna alla proposta</button>`,
      onMount: el => {
        el.querySelector('#fAgain').onclick = () => { reset(); };
        el.querySelector('#fBack').onclick = () => { closeModal(true); document.getElementById('moduli').scrollIntoView({ behavior:'smooth' }); };
      }
    });
  }

  function reset(){
    Object.assign(S, { room:'living', meters:{ energia:30, acqua:35, rifiuti:25, spesa:30 }, points:0, done:{}, lamp:'inc', temp:23, doorOpen:false, badges:[], busy:false, finished:false });
    pending.length = 0;
    creator();
  }

  function esc(s){ return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }

  const API = { S, modal, closeModal, complete, msg, toast, refresh, icon, esc, PEOPLE };
  window.CLGame = API;
  startScreen();
})();
