/*
 * H — ARCADE
 * 리눅스가 부팅되고, 내용은 셸 출력으로 읽히고, 화면 아래에서는 두 사람이
 * 계속 달린다. 스크롤을 내리면 세상이 왼쪽으로 흘러가면서 축구공·영화·
 * 게임기·음식이 지나간다. ANTARCTIC ADVENTURE 처럼 카메라는 고정이고
 * 배경이 움직인다.
 *
 * 이 테마일 때만 동작한다. 폰트(약 500KB)도 이때만 받는다.
 */
(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.theme !== 'arcade') return;

  const W = window.WEDDING || {};
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };

  /* ---- 픽셀 폰트는 이 테마에서만 받는다 (한글 픽셀 폰트가 약 500KB) ---- */
  const font = document.createElement('link');
  font.rel = 'stylesheet';
  font.href = 'https://cdn.jsdelivr.net/npm/galmuri@2.40.3/dist/galmuri.css';
  document.head.append(font);

  /* ======================================================================
     스프라이트 — 글자 격자로 그리고 SVG 사각형으로 편다.
     한 글자가 한 픽셀이다. 점(.)은 투명.
     ====================================================================== */
  const PAL = {
    k: '#14131a',   // 외곽선
    s: '#f3c9a6',   // 피부
    h: '#2b2b33',   // 머리
    d: '#2f4f7f',   // 신랑 정장
    w: '#e9f2f7',   // 신부 드레스
    m: '#9fd8c8',   // 민트 드레스
    r: '#d8566b',   // 빨강
    y: '#f2c744',   // 노랑
    g: '#5bbf6a',   // 초록
    b: '#6aa7e0',   // 파랑
    o: '#e08b4a',   // 주황
    l: '#c8c8d4',   // 회색
    W: '#ffffff',
  };

  /* 신랑 — 달리는 두 장면 */
  const GROOM = [[
    '..kkk...',
    '.khhhk..',
    '.kshsk..',
    '..ksk...',
    '.kdddk..',
    'kkdddkk.',
    '..kdk...',
    '..k.k...',
    '.kk.kk..',
  ], [
    '..kkk...',
    '.khhhk..',
    '.kshsk..',
    '..ksk...',
    '.kdddk..',
    'kkdddkk.',
    '..kdk...',
    '.k...k..',
    'kk...kk.',
  ]];

  /* 신부 — 치마가 퍼진다 */
  const BRIDE = [[
    '..kkk...',
    '.khhhk..',
    '.kshsk..',
    '..ksk...',
    '.kmmmk..',
    'kkmmmkk.',
    '.kmmmk..',
    'kmmmmmk.',
    'kk...kk.',
  ], [
    '..kkk...',
    '.khhhk..',
    '.kshsk..',
    '..ksk...',
    '.kmmmk..',
    'kkmmmkk.',
    '.kmmmk..',
    'kmmmmmk.',
    'k.k.k.k.',
  ]];

  /* 지나가는 것들 — 우리가 같이 한 일.
     검은 바탕이라 외곽선을 검정(k)으로 두면 형체가 사라진다. 밝은 회색(l)로
     테두리를 두르고 속을 채워야 실루엣이 읽힌다. */
  const PROPS = {
    ball: { label: '축구', art: [
      '.llll.', 'lWkkWl', 'lkWWkl', 'lWkkWl', 'lWWWWl', '.llll.'] },
    film: { label: '영화', art: [
      'llllll', 'lWkkWl', 'llllll', 'lWkkWl', 'llllll'] },
    pad: { label: '게임', art: [
      '.llllll.', 'lbWbbWbl', 'lbbbbbbl', 'lWbbbbWl', '.llllll.'] },
    food: { label: '맛집', art: [
      '..oooo..', '.oyyyyo.', 'orrrrrro', '.gggggg.', '..oooo..'] },
    heart: { label: '데이트', art: [
      '.rr.rr.', 'rrrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...'] },
    cake: { label: '결혼', art: [
      '...y...', '..WWW..', '.WWWWW.', 'rrrrrrr', 'WWWWWWW', 'rrrrrrr'] },
  };

  const NS = 'http://www.w3.org/2000/svg';
  function toSvg(art, px) {
    const w = art[0].length, h = art.length;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('width', w * px);
    svg.setAttribute('height', h * px);
    svg.setAttribute('shape-rendering', 'crispEdges');
    svg.setAttribute('aria-hidden', 'true');
    art.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        if (ch === '.' || !PAL[ch]) return;
        const r = document.createElementNS(NS, 'rect');
        r.setAttribute('x', x); r.setAttribute('y', y);
        r.setAttribute('width', 1); r.setAttribute('height', 1);
        r.setAttribute('fill', PAL[ch]);
        svg.append(r);
      });
    });
    return svg;
  }

  /* ======================================================================
     아래쪽 무대 — 카메라는 고정, 세상이 흐른다
     ====================================================================== */
  const stage = el('div', 'arc');
  stage.setAttribute('aria-hidden', 'true');
  const world = el('div', 'arc__world');
  const ground = el('div', 'arc__ground');

  // 소품을 일정 간격으로 늘어놓는다
  const ORDER = ['ball', 'heart', 'film', 'pad', 'food', 'cake'];
  ORDER.forEach((key, i) => {
    const p = PROPS[key];
    const box = el('div', 'arc__prop');
    box.style.left = (i + 1) * (100 / (ORDER.length + 1)) + '%';
    box.append(toSvg(p.art, 4));
    box.append(el('span', 'arc__tag', p.label));
    world.append(box);
  });

  const runners = el('div', 'arc__runners');
  const gm = el('div', 'arc__who'); gm.append(toSvg(GROOM[0], 4));
  const br = el('div', 'arc__who'); br.append(toSvg(BRIDE[0], 4));
  runners.append(gm, br);
  stage.append(world, ground, runners);
  document.body.append(stage);

  // 달리는 두 장면을 번갈아 그린다
  let frame = 0;
  if (!REDUCED) {
    setInterval(() => {
      frame ^= 1;
      gm.replaceChildren(toSvg(GROOM[frame], 4));
      br.replaceChildren(toSvg(BRIDE[frame], 4));
    }, 180);
  }

  /* 스크롤이 세상의 x 좌표다.
     translateX 에 % 를 쓰면 '요소 자기 폭' 기준이라 세상 폭의 몇 배로
     움직여 버린다. 실제 픽셀로 재서 세상을 정확히 한 번만 흘려보낸다. */
  let queued = false;
  const move = () => {
    queued = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const t = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    const travel = Math.max(0, world.offsetWidth - window.innerWidth);
    world.style.transform = `translateX(${-t * travel}px)`;
  };
  addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(move);
  }, { passive: true });
  addEventListener('resize', move);
  move();

  /* ======================================================================
     각 장 앞에 셸 프롬프트를 세운다
     ====================================================================== */
  const CMD = {
    'h-inv': 'cat ~/invitation.txt',
    'h-date': 'date -d "2026-10-25 13:40 KST"',
    'h-loc': 'cat /etc/venue.conf',
    'h-info': 'systemctl status ceremony',
    'h-gal': 'ls -lh ~/photos/',
    'h-acct': 'cat ~/.config/accounts',
  };
  for (const [id, cmd] of Object.entries(CMD)) {
    const label = document.getElementById(id);
    if (!label) continue;
    const line = el('p', 'arc__cmd');
    line.append(
      el('span', 'arc__user', 'guest@wedding'),
      el('span', 'arc__path', ':~$ '),
      el('span', 'arc__in', cmd),
    );
    label.parentNode.insertBefore(line, label);
  }

  /* ======================================================================
     부팅 화면 — 한 번만. 급한 사람은 눌러서 건너뛴다.
     ====================================================================== */
  const BOOTED = 'arcade-booted';
  let seen = false;
  try { seen = sessionStorage.getItem(BOOTED) === '1'; } catch { /* 사생활 보호 모드 */ }
  if (seen || REDUCED) return;

  const d = W.date || {};
  const LINES = [
    '[    0.000000] Linux version 6.10.0-wedding (d3@parkdongsam)',
    '[    0.000421] Command line: ro quiet splash bride=김연의 groom=박동삼',
    '[    0.013370] Memory: 2 hearts available',
    '[    0.104857] Calibrating delay loop... 1,095 days since we met',
    '[    0.208912] ACPI: Power button pressed by 박동삼',
    '[    0.331204] systemd[1]: Starting Wedding Day Service...',
    `[    0.402551] mount: /mnt/venue  type ${'오펠리스 웨딩컨벤션'}`,
    `[    0.517339] rtc: setting system clock to ${d.iso || '2026-10-25T13:40:00+09:00'}`,
    '[    0.688210] systemd[1]: Reached target Graphical Interface.',
    '[    0.701994] wedding: [  OK  ] two people joined successfully',
    '',
    'Ubuntu 26.04 LTS  parkdongsam  tty1',
    '',
    'parkdongsam login: guest',
    'Password: ',
    '',
    'Welcome. 저희 결혼합니다.',
  ];

  const boot = el('div', 'boot');
  boot.setAttribute('role', 'status');
  const pre = el('pre', 'boot__out');
  const skip = el('button', 'boot__skip', 'press any key to continue  ▸');
  skip.type = 'button';
  boot.append(pre, skip);
  document.body.append(boot);
  root.classList.add('is-booting');

  let i = 0, killed = false;
  const done = () => {
    if (killed) return;
    killed = true;
    try { sessionStorage.setItem(BOOTED, '1'); } catch { /* 무시 */ }
    boot.classList.add('is-gone');
    root.classList.remove('is-booting');
    setTimeout(() => boot.remove(), 420);
  };
  const step = () => {
    if (killed) return;
    if (i >= LINES.length) { setTimeout(done, 900); return; }
    pre.textContent += LINES[i++] + '\n';
    pre.scrollTop = pre.scrollHeight;
    setTimeout(step, i < 11 ? 85 : 260);
  };
  step();
  boot.addEventListener('click', done);
  addEventListener('keydown', done, { once: true });
})();
