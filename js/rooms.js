(function(){
  const { makeIso, shade } = window.CL;
  const iso = makeIso(44);
  const { box, pts, P, onX, onY, onZ } = iso;

  // deterministic pseudo-random (stable book colours, etc.)
  let seed = 7;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;

  const hot = (id, inner, hit = '') =>
    `<g class="hot" data-hot="${id}">${inner}${!hit ? '' : hit[0] === '<' ? hit : `<polygon class="hit" points="${hit}"/>`}</g>`;
  const hitCircle = (x, y, z, r) => { const [cx, cy] = P(x, y, z); return `<circle class="hit" cx="${cx}" cy="${cy}" r="${r}"/>`; };
  const at = (x, y, z) => P(x, y, z).map(n => n.toFixed(1));

  const textOnY = (x, z, str, size, col, extra = '') => { const [sx, sy] = P(x, 0, z);
    return `<text transform="matrix(.866,.5,0,1,${sx},${sy})" font-family="Fredoka,Nunito,sans-serif" font-weight="600" font-size="${size}" fill="${col}" ${extra}>${str}</text>`; };
  const textOnX = (y, z, str, size, col) => { const [sx, sy] = P(0, y, z);
    return `<text transform="matrix(.866,-.5,0,1,${sx},${sy})" font-family="Fredoka,Nunito,sans-serif" font-weight="600" font-size="${size}" fill="${col}">${str}</text>`; };

  function shell(W, D, H, o){
    let s = '';
    s += `<polygon points="${pts([[-.3,D,-.45],[W,D,-.45],[W,D,0],[-.3,D,0]])}" fill="${o.slabL}"/>`;
    s += `<polygon points="${pts([[W,-.3,-.45],[W,D,-.45],[W,D,0],[W,-.3,0]])}" fill="${o.slabR}"/>`;
    s += o.floor;
    s += `<polygon points="${onX(0, 0, 0, D, H)}" fill="${o.wallL}"/>`;
    if (o.stripes) for (let y = 0.4; y < D; y += 0.9) s += `<polygon points="${onX(0, y, 0.22, y + 0.14, H)}" fill="#fff" opacity=".16"/>`;
    s += `<polygon points="${onY(0, 0, 0, W, H)}" fill="${o.wallR}"/>`;
    s += `<polygon points="${onX(0, 0, 0, D, 0.22)}" fill="${o.base}"/><polygon points="${onY(0, 0, 0, W, 0.22)}" fill="${o.base}"/>`;
    s += `<polygon points="${pts([[-.3,-.3,H],[0,-.3,H],[0,D,H],[-.3,D,H]])}" fill="#6B4E3D"/>`;
    s += `<polygon points="${pts([[-.3,-.3,H],[W,-.3,H],[W,0,H],[-.3,0,H]])}" fill="#6B4E3D"/>`;
    s += `<polygon points="${pts([[-.3,D,0],[0,D,0],[0,D,H],[-.3,D,H]])}" fill="${shade(o.wallL, -0.12)}"/>`;
    s += `<polygon points="${pts([[W,-.3,0],[W,0,0],[W,0,H],[W,-.3,H]])}" fill="${shade(o.wallR, -0.2)}"/>`;
    return s;
  }

  function windowY(x1, x2, z1, z2, curtain){
    const xm = (x1 + x2) / 2, zm = (z1 + z2) / 2;
    let s = `<polygon points="${onY(0, x1 - .1, z1 - .1, x2 + .1, z2 + .1)}" fill="#FFFFFF" stroke="#D9C8B3" stroke-width=".8"/>`;
    s += `<polygon points="${onY(0, x1 + .05, z1 + .05, x2 - .05, z2 - .05)}" fill="url(#sky)"/>`;
    s += `<polygon class="cloud" points="${onY(0, x1 + .4, zm + .3, x1 + 1.1, zm + .55)}" fill="#fff" opacity=".8"/>`;
    s += `<polygon points="${onY(0, xm - .05, z1, xm + .05, z2)}" fill="#fff"/><polygon points="${onY(0, x1, zm - .05, x2, zm + .05)}" fill="#fff"/>`;
    s += box(x1 - .25, 0, z1 - .2, x2 - x1 + .5, .28, .1, '#FFFFFF');
    if (curtain){
      s += `<polygon points="${onY(.02, x1 - .55, 0.9, x1 - .1, z2 + .35)}" fill="${curtain}"/>`;
      s += `<polygon points="${onY(.02, x2 + .1, 0.9, x2 + .55, z2 + .35)}" fill="${curtain}"/>`;
      s += `<polygon points="${onY(.02, x1 - .7, z2 + .3, x2 + .7, z2 + .42)}" fill="#8A5A3C"/>`;
    }
    return s;
  }

  function plant(x, y, sc = 1, pot = '#C0704A'){
    let s = box(x, y, 0, .6 * sc, .6 * sc, .62 * sc, pot);
    const [cx, cy] = P(x + .3 * sc, y + .3 * sc, .62 * sc);
    const leaves = [[-14,-22,9,20,-25],[12,-24,9,20,25],[0,-34,8,22,0],[-20,-8,8,16,-55],[20,-10,8,16,55],[-6,-18,7,15,-10],[8,-16,7,15,15]];
    s += `<g class="sway" style="transform-origin:${cx}px ${cy}px">` + leaves.map(([dx, dy, rx, ry, r], i) =>
      `<ellipse cx="${cx + dx * sc}" cy="${cy + dy * sc}" rx="${rx * sc}" ry="${ry * sc}" transform="rotate(${r} ${cx + dx * sc} ${cy + dy * sc})" fill="${['#5E8459','#7FA37A','#4E7349'][i % 3]}"/>`).join('') + `</g>`;
    return s;
  }

  function living(st){
    seed = 7;
    const W = 9, D = 8, H = 4.6;
    let s = '';
    let floor = `<polygon points="${onZ(0, 0, 0, W, D)}" fill="#DDB283"/>`;
    for (let i = 1; i < W; i++) floor += `<line x1="${at(i,0,0)[0]}" y1="${at(i,0,0)[1]}" x2="${at(i,D,0)[0]}" y2="${at(i,D,0)[1]}" stroke="#A9764A" stroke-opacity=".28" stroke-width="1"/>`;
    for (let i = 0; i < W; i++) for (let j = (i % 2) * 1.5 + 1; j < D; j += 3){
      const a = at(i, j, 0), b = at(i + 1, j, 0);
      floor += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#A9764A" stroke-opacity=".22"/>`;
    }
    s += shell(W, D, H, { floor, wallL:'#EBCFAE', wallR:'#F6E5CC', base:'#D8BC98', slabL:'#A57B55', slabR:'#8C6544', stripes:true });

    s += `<polygon points="${onX(.01, 1.3, 2.3, 2.7, 3.55)}" fill="#fff" stroke="#8A5A3C" stroke-width="2"/>`;
    s += `<polygon points="${pts([[.02,1.45,2.45],[.02,2.0,3.1],[.02,2.3,2.75],[.02,2.55,3.2],[.02,2.55,2.45]])}" fill="#7FA37A"/>`;
    s += `<circle cx="${at(.02,1.85,3.25)[0]}" cy="${at(.02,1.85,3.25)[1]}" r="6" fill="#E9B44C"/>`;

    s += windowY(4.9, 7.3, 1.75, 3.85, '#9DBB7E');
    s += box(5.1, .02, .35, 2.0, .22, .95, '#FBFBF8');
    for (let x = 5.25; x < 7.1; x += .22) s += `<polygon points="${onY(.245, x, .42, x + .07, 1.22)}" fill="#E4E1DA"/>`;

    s += hot('door', doorY(7.6, 8.7, st.doorOpen), '');

    s += `<polygon points="${onZ(.01, 2.2, 2.6, 6.9, 6.6)}" fill="#E9B44C"/>`;
    s += `<polygon points="${onZ(.012, 2.45, 2.85, 6.65, 6.35)}" fill="none" stroke="#F7DC98" stroke-width="3"/>`;
    s += `<polygon class="sunpatch" points="${pts([[4.6,.3,0],[7.1,.3,0],[8.8,3.6,0],[6.3,3.6,0]])}" fill="#FFF4C9" opacity=".33"/>`;

    const led = st.lamp === 'led';
    const [lx, ly] = P(.8, .8, 3.05);
    s += hot('lampadina',
      box(.55, .55, 0, .5, .5, .08, '#4A4A50') + box(.76, .76, .08, .08, .08, 2.9, '#4A4A50') +
      `<circle class="glow" cx="${lx}" cy="${ly + 6}" r="${led ? 52 : 64}" fill="url(#${led ? 'gLed' : 'gInc'})"/>` +
      box(.45, .45, 2.95, .7, .7, .62, led ? '#FFF8EA' : '#FFE2B0'),
      pts([[.4,.4,0],[1.2,.4,0],[1.2,1.2,0],[1.2,1.2,3.7],[.4,1.2,3.7],[.4,.4,3.7]]));

    let shelf = box(1.4, .02, 0, 2.8, .85, 4.0, '#9B6B47');
    const bookCols = ['#D9734E','#5F9BBE','#E9B44C','#7FA37A','#A66BA6','#F3E6D3','#C0563A','#3E4A5C'];
    for (let k = 0; k < 4; k++){
      const z0 = .25 + k * .95;
      shelf += `<polygon points="${onY(.872, 1.55, z0, 4.05, z0 + .78)}" fill="#6E4A31"/>`;
      let x = 1.6;
      while (x < 3.9){
        const w = .1 + rnd() * .13, h = .45 + rnd() * .3;
        if (rnd() < .12){ x += .18; continue; }
        shelf += `<polygon points="${onY(.873, x, z0, Math.min(x + w, 4.0), z0 + h)}" fill="${bookCols[Math.floor(rnd() * bookCols.length)]}"/>`;
        x += w + .015;
      }
    }
    shelf += `<polygon points="${onY(.874, 2.5, 2.15, 3.3, 2.75)}" fill="#E2001A"/>` + textOnY(2.56, 2.36, 'PDF', 13, '#fff');
    s += hot('libreria', shelf);

    s += hot('cestino',
      box(4.3, .15, 0, .55, .55, .72, '#7FA37A') + box(4.27, .12, .72, .61, .61, .07, '#5E8459') +
      box(4.45, .3, .79, .22, .05, .18, '#F7F2E6'), '');

    const watched = st.done.tv;
    let tv = box(.05, 2.9, 0, .95, 3.2, .95, '#8A5A3C');
    tv += `<polygon points="${onX(1.001, 3.05, .12, 4.45, .82)}" fill="none" stroke="#6E4A31" stroke-width="1.2"/>`;
    tv += `<polygon points="${onX(1.001, 4.55, .12, 5.95, .82)}" fill="none" stroke="#6E4A31" stroke-width="1.2"/>`;
    tv += box(.4, 4.3, .95, .12, .4, .14, '#2E2C34');
    tv += box(.25, 3.15, 1.09, .18, 2.7, 1.62, '#2E2C34');
    tv += `<polygon class="screen" points="${onX(.432, 3.27, 1.18, 5.73, 2.62)}" fill="${watched ? 'url(#scrDone)' : 'url(#scrIdle)'}"/>`;
    const [px, py] = P(.43, 4.5, 1.9);
    tv += watched
      ? `<path d="M${px - 10} ${py} l7 7 13-14" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`
      : `<path d="M${px - 6} ${py - 10} l14 8 -14 8z" fill="#fff" opacity=".9"/>`;
    tv += box(.2, 5.4, .95, .6, .5, .14, '#3A3A40');
    s += hot('tv', tv);

    const standby = !st.done.ciabatta;
    const [ledX, ledY] = P(1.29, 5.12, .1);
    s += hot('ciabatta',
      `<path d="M${at(1.29,5.0,.05).join(' ')} Q ${at(1.1,4.9,.2).join(' ')} ${at(1.0,4.6,.35).join(' ')}" fill="none" stroke="#333" stroke-width="2"/>` +
      box(1.15, 5.0, 0, .28, 1.0, .1, '#F2F2EE') +
      `<circle cx="${ledX}" cy="${ledY}" r="3.6" fill="${standby ? '#FF3B30' : '#9AA39A'}" class="${standby ? 'blink' : ''}"/>`,
      hitCircle(1.29, 5.5, .05, 30));

    const tset = st.temp;
    s += hot('termostato',
      `<polygon points="${onX(.01, 7.0, 2.15, 7.55, 2.8)}" fill="#fff" stroke="#BFAF9C" stroke-width="1"/>` +
      `<polygon points="${onX(.012, 7.08, 2.38, 7.47, 2.66)}" fill="${st.done.termostato ? '#2F5D3A' : '#5A2E2E'}"/>` +
      textOnX(7.43, 2.44, tset + '°', 11, '#fff'),
      hitCircle(0, 7.27, 2.5, 26));

    s += plant(.35, 6.6, 1.15);
    s += box(2.9, 3.7, 0, 1.3, 1.6, .48, '#B98256');
    s += box(3.25, 4.15, .48, .22, .22, .22, '#FFFFFF') + box(3.6, 4.6, .48, .55, .4, .07, '#5F9BBE');
    s += box(5.4, 2.9, 0, 1.5, 3.3, .7, '#D9734E');
    s += box(5.4, 2.9, .7, 1.05, .35, .45, '#C9603C');
    s += box(5.45, 3.25, .7, 1.0, 1.25, .17, '#E58A64') + box(5.45, 4.55, .7, 1.0, 1.25, .17, '#E58A64');
    s += box(6.2, 3.35, .87, .22, .62, .55, '#E9B44C');
    s += box(6.45, 2.9, .7, .5, 3.3, 1.0, '#C9603C');
    s += box(5.4, 5.85, .7, 1.05, .35, .45, '#C9603C');

    return {
      svg: s,
      markers: [
        { id:'tv', p:P(.35, 4.5, 3.2), ico:'tv', label:'Video lezione' },
        { id:'libreria', p:P(2.8, .45, 4.45), ico:'book', label:'Dispense' },
        { id:'lampadina', p:P(.8, .8, 4.05), ico:'sun', label:'Luce' },
        { id:'ciabatta', p:P(1.29, 5.5, .95), ico:'plug', label:'Stand-by' },
        { id:'termostato', p:P(0, 7.27, 3.3), ico:'thermo', label:'Termostato' },
        { id:'cestino', p:P(4.58, .42, 1.55), ico:'recycle', label:'Rifiuti' },
        { id:'door', p:P(8.15, 0, 4.0), ico:'door', label:'Cucina', door:true }
      ],
      spawn:[4.2, 7.0],
      toDoor:[[4.2,7.0],[7.95,7.0],[8.15,1.1],[8.15,.35]],
      fromDoor:[[8.15,.35],[8.15,1.4],[6.0,7.0]]
    };
  }

  function doorY(x1, x2, open){
    let s = `<polygon points="${onY(0, x1 - .1, 0, x2 + .1, 3.4)}" fill="#B98256"/>`;
    if (open){
      s += `<polygon points="${onY(.001, x1, 0, x2, 3.28)}" fill="#FFE9B8"/>`;
      s += `<polygon points="${pts([[x1,0,0],[x1 + .55,.75,0],[x1 + .55,.75,3.28],[x1,0,3.28]])}" fill="#8A5A3C" stroke="#6E4A31"/>`;
      s += `<polygon class="doorglow" points="${onY(.002, x1, 0, x2, 3.28)}" fill="none" stroke="#E9B44C" stroke-width="3"/>`;
    } else {
      s += `<polygon points="${onY(.001, x1, 0, x2, 3.28)}" fill="#8A5A3C"/>`;
      s += `<polygon points="${onY(.002, x1 + .15, 1.9, x2 - .15, 3.05)}" fill="none" stroke="#6E4A31" stroke-width="1.2"/>`;
      s += `<polygon points="${onY(.002, x1 + .15, .2, x2 - .15, 1.6)}" fill="none" stroke="#6E4A31" stroke-width="1.2"/>`;
      const [hx, hy] = P(x2 - .2, 0, 1.6);
      s += `<circle cx="${hx}" cy="${hy}" r="3" fill="#E9B44C"/>`;
    }
    s += `<polygon points="${onY(.001, x1 + .05, 3.5, x2 - .05, 3.95)}" fill="#fff" stroke="#D9C8B3"/>`;
    s += textOnY(x1 + .14, 3.62, 'Cucina', 12, '#8A5A3C');
    return s;
  }

  function kitchen(st){
    seed = 21;
    const W = 8, D = 7, H = 4.6;
    let s = '';
    let floor = '';
    for (let i = 0; i < W; i++) for (let j = 0; j < D; j++)
      floor += `<polygon points="${onZ(0, i, j, i + 1, j + 1)}" fill="${(i + j) % 2 ? '#E7D6BC' : '#F3E8D6'}"/>`;
    s += shell(W, D, H, { floor, wallL:'#E6D8C2', wallR:'#F4EBDC', base:'#D2C1A8', slabL:'#A57B55', slabR:'#8C6544' });

    s += `<polygon points="${onY(0, 1.6, 1.08, 6.4, 2.2)}" fill="#D6E6EA"/>`;
    for (let x = 1.6; x <= 6.41; x += .4) s += `<polygon points="${onY(.001, x, 1.08, x + .012, 2.2)}" fill="#fff"/>`;
    for (let z = 1.08; z <= 2.21; z += .37) s += `<polygon points="${onY(.001, 1.6, z, 6.4, z + .012)}" fill="#fff"/>`;
    s += windowY(3.1, 4.7, 2.35, 3.95, null);
    s += box(1.6, .02, 2.4, 1.3, .6, 1.3, '#F7F0E3') + box(5.0, .02, 2.4, 1.4, .6, 1.3, '#F7F0E3');

    s += box(1.6, .02, 0, 4.8, .95, 1.0, '#F2EBDD');
    for (let x = 1.75; x < 6.3; x += 1.2) s += `<polygon points="${onY(.971, x, .12, x + 1.05, .88)}" fill="none" stroke="#CDBFAC" stroke-width="1.2"/>`;
    s += box(1.55, 0, 1.0, 4.9, 1.0, .08, '#9C8A78');
    s += `<polygon points="${onZ(1.081, 3.35, .2, 4.45, .75)}" fill="#C3CED4" stroke="#9AA8AF"/>`;
    s += box(3.85, .05, 1.08, .08, .08, .45, '#A9B4BA');
    s += `<polygon points="${onZ(1.081, 5.0, .18, 6.2, .82)}" fill="#3A3A40"/>`;
    [[5.3,.35],[5.85,.35],[5.3,.65],[5.85,.65]].forEach(([x, y]) => { const [cx, cy] = P(x, y, 1.082); s += `<ellipse cx="${cx}" cy="${cy}" rx="9" ry="5" fill="none" stroke="#777"/>`; });
    s += box(5.15, .2, 1.08, .45, .45, .35, '#D9734E');

    let fr = box(.05, .9, 0, 1.0, 1.3, 3.4, '#E8EEF0');
    fr += `<polygon points="${onX(1.051, .9, 2.28, 2.2, 2.31)}" fill="#B9C4C9"/>`;
    fr += box(1.05, 1.95, 2.45, .06, .06, .55, '#A9B4BA') + box(1.05, 1.95, 1.2, .06, .06, .7, '#A9B4BA');
    fr += `<polygon points="${onX(1.052, 1.15, 2.6, 1.6, 3.05)}" fill="#FFF7D6"/>`;
    fr += `<circle cx="${at(1.053,1.75,3.0)[0]}" cy="${at(1.053,1.75,3.0)[1]}" r="4" fill="#E2001A"/>`;
    fr += `<circle cx="${at(1.053,1.3,1.6)[0]}" cy="${at(1.053,1.3,1.6)[1]}" r="4" fill="#7FA37A"/>`;
    s += hot('frigo', fr);

    let pa = box(.05, 3.3, 0, .8, 2.2, 3.0, '#B98256');
    const prod = ['#E2001A','#7FA37A','#E9B44C','#F3E6D3','#5F9BBE','#D9734E'];
    for (let k = 0; k < 3; k++){
      const z0 = .3 + k * .9;
      pa += `<polygon points="${onX(.851, 3.42, z0, 5.38, z0 + .72)}" fill="#7A5236"/>`;
      for (let y = 3.5; y < 5.2; y += .32){
        const h = .35 + rnd() * .3;
        pa += `<polygon points="${onX(.852, y, z0, y + .24, z0 + h)}" fill="${prod[Math.floor(rnd() * prod.length)]}"/>`;
      }
    }
    pa += box(1.15, 4.75, 0, .7, .32, .8, '#F3EBDD');
    const [bx, by] = P(1.22, 5.071, .62);
    pa += `<image href="imgs/logo_coop.png" x="0" y="0" width="1280" height="498" transform="matrix(${.866 * .042},${.5 * .042},0,.042,${bx},${by})"/>`;
    const [vx, vy] = P(1.5, 4.9, .95);
    pa += `<circle cx="${vx - 6}" cy="${vy}" r="7" fill="#7FA37A"/><circle cx="${vx + 6}" cy="${vy - 3}" r="6" fill="#E9B44C"/><ellipse cx="${vx}" cy="${vy - 8}" rx="3" ry="9" fill="#5E8459"/>`;
    s += hot('dispensa', pa);

    s += hot('door', doorX(5.8, 6.9));

    s += box(3.0, 3.75, 0, .45, .55, .5, '#9B6B47') + box(3.0, 3.75, .5, .1, .55, .65, '#9B6B47');
    s += box(3.4, 3.4, 0, 1.8, 1.4, .82, '#B98256');
    const [fx, fy] = P(4.3, 4.1, .83);
    s += `<ellipse cx="${fx}" cy="${fy}" rx="20" ry="9" fill="#F3EBDD"/><circle cx="${fx - 7}" cy="${fy - 5}" r="6" fill="#E9B44C"/><circle cx="${fx + 6}" cy="${fy - 6}" r="6" fill="#D9734E"/><circle cx="${fx}" cy="${fy - 10}" r="5.5" fill="#7FA37A"/>`;
    s += box(5.35, 3.8, 0, .45, .55, .5, '#9B6B47') + box(5.7, 3.8, .5, .1, .55, .65, '#9B6B47');
    s += plant(6.9, 5.9, .9);

    return {
      svg: s,
      markers: [
        { id:'frigo', p:P(.55, 1.55, 4.05), ico:'leaf', label:'Svuota-frigo' },
        { id:'dispensa', p:P(.45, 4.4, 3.6), ico:'cart', label:'La spesa' },
        { id:'door', p:P(0, 6.35, 4.0), ico:'door', label:'Salotto', door:true }
      ],
      spawn:[3.9, 6.4],
      toDoor:[[3.9,6.4],[.6,6.35],[.25,6.35]],
      fromDoor:[[.25,6.35],[1.0,6.35],[3.9,6.4]]
    };
  }

  function doorX(y1, y2){
    let s = `<polygon points="${onX(0, y1 - .1, 0, y2 + .1, 3.4)}" fill="#B98256"/>`;
    s += `<polygon points="${onX(.001, y1, 0, y2, 3.28)}" fill="#FFE9B8"/>`;
    s += `<polygon points="${pts([[0,y2,0],[.6,y2 - .5,0],[.6,y2 - .5,3.28],[0,y2,3.28]])}" fill="#8A5A3C" stroke="#6E4A31"/>`;
    s += `<polygon points="${onX(.001, y1 + .05, 3.5, y2 - .05, 3.95)}" fill="#fff" stroke="#D9C8B3"/>`;
    s += textOnX(y2 - .12, 3.62, 'Salotto', 12, '#8A5A3C');
    return s;
  }

  window.CLRooms = { living, kitchen, P, VIEW:'-360 -250 740 680' };
})();
