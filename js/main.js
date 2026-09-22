/*
 * 렌더링. 내용은 전부 window.WEDDING (js/data.js) 에서 온다.
 * 의존성 없음. 빌드 없음.
 */
(function () {
  'use strict';
  const W = window.WEDDING;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };
  const pad = (n) => String(n).padStart(2, '0');

  /* ---- 모션 --------------------------------------------------------------
   * .js 가 붙어야 css/motion.css 가 요소를 숨기기 시작한다. 스크립트가
   * 여기까지 못 오면 아무것도 숨겨지지 않고 청첩장은 그대로 다 읽힌다.
   * ------------------------------------------------------------------- */
  const MOTION = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  /* ---- 확대 차단 ----------------------------------------------------------
   * 사진에 pointer-events:none 을 걸어도 그건 사진만 막는다. 브라우저의
   * 핀치 줌은 페이지 전체를 키우기 때문에 결과적으로 사진이 확대돼 보인다.
   * iOS 사파리는 접근성을 이유로 user-scalable=no 를 무시하므로, 확대를
   * 실제로 막으려면 제스처 이벤트를 직접 취소해야 한다.
   *
   * 참고: 확대를 막으면 시력이 낮은 사람이 글자를 키울 수 없다. 본문을
   * 16px 이상으로 두고 명도 대비를 확보해 둔 것은 그 때문이다.
   * ------------------------------------------------------------------- */
  const noZoom = (e) => e.preventDefault();
  // 사파리 전용 제스처 이벤트 — 핀치를 시작하는 순간 취소된다
  for (const t of ['gesturestart', 'gesturechange', 'gestureend']) {
    document.addEventListener(t, noZoom, { passive: false });
  }
  // 손가락 두 개 이상이면 확대 시도로 본다
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });
  /* 더블탭 확대. 그냥 두 번째 탭을 삼키면 버튼을 연달아 누를 때 두 번째가
     먹히지 않는다. 같은 자리를 빠르게 두 번 두드린 경우에만, 그것도
     누를 것이 없는 빈 곳에서만 막는다. */
  let tapAt = 0, tapX = 0, tapY = 0;
  document.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    if (!t) return;
    const now = Date.now();
    const samePlace = Math.abs(t.clientX - tapX) < 32 && Math.abs(t.clientY - tapY) < 32;
    const onControl = e.target.closest('a, button, input, textarea, select, [role="tab"]');
    if (!onControl && samePlace && now - tapAt < 300) e.preventDefault();
    tapAt = now; tapX = t.clientX; tapY = t.clientY;
  }, { passive: false });

  /* 자식마다 --i 를 매겨 차례로 나오게 한다 */
  const stagger = (nodes) =>
    nodes.forEach((n, i) => n.style.setProperty('--i', i));

  /* 한 줄을 창(.rv-l) + 올라오는 알맹이(span) 로 감싼다.
     창이 넘치는 부분을 잘라내므로 글자가 '아래에서' 올라오는 것처럼 보인다. */
  const maskLine = (text) => {
    const p = el('p', 'rv-l');
    p.append(el('span', null, text));
    return p;
  };

  /* 이미 마크업에 있는 요소의 내용을 같은 방식으로 감싼다 (제목, 날짜) */
  const maskify = (node) => {
    const inner = el('span');
    inner.append(...node.childNodes);
    const win = el('span', 'rv-l');
    win.append(inner);
    node.append(win);
  };

  /* ---- 변형 스위처 ---------------------------------------------------- */
  const params = new URLSearchParams(location.search);
  const THEMES = ['batang', 'gothic', 'poster', 'bleed', 'midnight', 'margin'];
  const theme = params.get('theme');
  if (THEMES.includes(theme)) document.documentElement.dataset.theme = theme;

  /* 브라우저 상단 바 색을 지면 색에 맞춘다. 어두운 변형에서 흰 띠가
     남으면 화면 위쪽만 잘린 것처럼 보인다. */
  const syncBarColour = () => {
    const m = $('meta[name="theme-color"]');
    if (m) m.content = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim() || '#ffffff';
  };
  syncBarColour();
  const lab = $('.lab');
  if (lab && params.has('lab')) {
    lab.dataset.show = 'true';
    const cur = document.documentElement.dataset.theme || 'batang';
    for (const b of $$('button', lab)) {
      b.setAttribute('aria-pressed', String(b.dataset.theme === cur));
      b.addEventListener('click', () => {
        document.documentElement.dataset.theme = b.dataset.theme;
        syncBarColour();
        for (const x of $$('button', lab)) x.setAttribute('aria-pressed', String(x === b));
        const u = new URL(location.href);
        u.searchParams.set('theme', b.dataset.theme);
        history.replaceState(null, '', u);
      });
    }
  }

  /* ---- 텍스트 바인딩: data-bind="a.b.c" ----------------------------- */
  const get = (path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), W);
  for (const node of $$('[data-bind]')) {
    const v = get(node.dataset.bind);
    // data-optional: 값이 비어 있으면 요소 자체를 없앤다 (빈 슬롯이 여백으로 남지 않게)
    if (!v && node.hasAttribute('data-optional')) { node.remove(); continue; }
    if (v != null) node.textContent = v;
  }
  /* 줄 배열 → <p> 여러 개 */
  for (const node of $$('[data-lines]')) {
    const arr = get(node.dataset.lines);
    if (!Array.isArray(arr)) continue;
    if (!arr.length && node.hasAttribute('data-optional')) { node.remove(); continue; }
    node.replaceChildren(...arr.map(maskLine));
    stagger($$('.rv-l', node));
  }
  /* 내용이 없는 섹션은 통째로 숨긴다 */
  for (const node of $$('[data-hide-if-empty]')) {
    const v = get(node.dataset.hideIfEmpty);
    if (!v || (Array.isArray(v) && !v.length)) node.remove();
  }

  /* 사진 경로를 CSS 변수로 올린다. 마크업은 하나로 두고도 변형이
     사진을 배경으로 깔 수 있다. */
  /* 절대 경로여야 한다. CSS 변수 안의 상대 경로는 그 변수를 '쓰는'
     스타일시트 기준으로 풀려서, css/variants.css 가 쓰면
     css/images/... 를 찾다가 404 가 난다. */
  (W.gallery || []).forEach((src, i) => {
    const abs = new URL(src, location.href).href;
    document.documentElement.style.setProperty(`--photo-${i + 1}`, `url("${abs}")`);
  });

  /* ---- 이름 · 혼주 ---------------------------------------------------- */
  const namesRoot = $('[data-names]');
  if (namesRoot) {
    for (const who of [W.groom, W.bride]) {
      const row = el('div', 'names__row');
      const parents = el('span', 'names__parents');
      parents.append(
        document.createTextNode(who.parents[0]),
        el('span', 'names__dot', ' · '),
        document.createTextNode(who.parents[1]),
      );
      // 혼주 + 관계는 한 덩어리, 이름은 별도 — poster 변형에서 두 줄로 쌓인다
      const meta = el('span', 'names__meta');
      meta.append(parents, el('span', 'names__of', '의'), el('span', 'names__rel', who.relation));
      row.append(meta, el('span', 'names__name', who.name));
      namesRoot.append(row);
    }
    stagger($$('.names__row', namesRoot));
  }

  /* ---- 날짜 표기 ------------------------------------------------------ */
  const D = W.date;
  // 날짜는 달력 섹션과 푸터 두 군데에 있다. $ 로 잡으면 앞의 하나만 채워진다.
  for (const n of $$('[data-date-big]')) n.textContent = `${D.year}.${pad(D.month)}.${pad(D.day)}`;
  const sub = $('[data-date-sub]');
  if (sub) sub.textContent = `${D.weekdayKo} ${D.timeKo}`;
  const time = $('time[data-date-iso]');
  if (time) time.setAttribute('datetime', D.iso);

  /* 예식일 하트. 배경 이미지가 아니라 인라인 SVG 여야 획을 그릴 수 있다.
     --len 에 실제 경로 길이를 넣어 dasharray 로 한 번에 그려낸다. */
  const NS = 'http://www.w3.org/2000/svg';
  function heart() {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'cal__heart');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', 'M12 20.5s-7.5-4.6-7.5-10A4 4 0 0 1 12 8.2a4 4 0 0 1 7.5 2.3c0 5.4-7.5 10-7.5 10z');
    svg.append(path);
    // getTotalLength() 는 문서에 붙은 뒤라야 정확하다
    requestAnimationFrame(() => {
      const len = Math.ceil(path.getTotalLength()) || 60;
      path.style.setProperty('--len', len);
    });
    return svg;
  }

  /* ---- 달력 ---------------------------------------------------------- */
  const grid = $('[data-cal]');
  if (grid) {
    const first = new Date(Date.UTC(D.year, D.month - 1, 1));
    const start = first.getUTCDay();
    const days = new Date(Date.UTC(D.year, D.month, 0)).getUTCDate();
    const cells = [];
    for (let i = 0; i < start; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(d);
    while (cells.length % 7) cells.push(null);
    cells.forEach((d, i) => {
      const c = el('span', 'cal__cell');
      c.style.setProperty('--i', i);
      if (d == null) { c.classList.add('cal__cell--out'); c.setAttribute('aria-hidden', 'true'); }
      else {
        c.textContent = d;
        if (d === D.day) {
          c.classList.add('cal__cell--day');
          c.setAttribute('aria-current', 'date');
          c.prepend(heart());
        } else if (i % 7 === 0) c.classList.add('cal__cell--sun');
      }
      grid.append(c);
    });
  }

  /* ---- 카운트다운 ---------------------------------------------------- */
  const target = Date.parse(D.iso);
  const nums = {
    d: $('[data-count="d"]'), h: $('[data-count="h"]'),
    m: $('[data-count="m"]'), s: $('[data-count="s"]'),
  };
  const dday = $('[data-dday]');

  /* 값이 실제로 바뀐 자리만 움직인다. 매초 네 자리가 다 흔들리면 읽을 수 없다. */
  const roll = (node, v) => {
    if (!node) return;
    const next = String(v);
    if (node.textContent === next) return;
    node.textContent = next;
    if (!MOTION || !node.animate) return;
    node.animate(
      [{ transform: 'translateY(-0.3em)', opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: 320, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    );
  };

  function tick() {
    const ms = target - Date.now();
    const s = Math.max(0, Math.floor(ms / 1000));
    const dd = Math.floor(s / 86400);
    roll(nums.d, dd);
    roll(nums.h, pad(Math.floor((s % 86400) / 3600)));
    roll(nums.m, pad(Math.floor((s % 3600) / 60)));
    roll(nums.s, pad(s % 60));
    if (dday) {
      // 달력상 남은 '일' — 자정 기준으로 올림
      const daysLeft = Math.ceil(ms / 86400000);
      dday.replaceChildren();
      if (ms <= 0) dday.textContent = `${W.bride.short}, ${W.groom.short}의 결혼식 당일입니다.`;
      else {
        dday.append(
          document.createTextNode(`${W.bride.short}, ${W.groom.short}의 결혼식이 `),
          el('b', null, `${daysLeft}일`),
          document.createTextNode(' 남았습니다.'),
        );
      }
    }
    setTimeout(tick, 1000 - (Date.now() % 1000));
  }
  tick();

  /* ---- 장소 · 내비 ----------------------------------------------------- */
  const V = W.venue;
  const venueName = $('[data-venue-name]');
  if (venueName) venueName.textContent = `${V.name}, ${V.floor}`;
  /* 티맵은 웹 주소가 없고 앱 스킴뿐이다. 앱이 없으면 눌러도 아무 일이
     없으므로, 잠깐 기다려 보고 화면이 그대로면 스토어로 보낸다.
     앱이 열렸다면 이 페이지는 뒤로 밀려 document.hidden 이 true 가 된다. */
  const tmapBtn = $('[data-nav="tmap"]');
  const TM = V.links?.tmap;            // T 는 아래 transit 이 쓴다
  if (tmapBtn && TM) {
    const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const scheme = (ios ? TM.ios : TM.android) + encodeURIComponent(TM.query || V.query || '');
    tmapBtn.href = scheme;                // JS 가 죽어도 앱이 있으면 열린다
    tmapBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const store = (V.links.tmapStore || {})[ios ? 'ios' : 'android'];
      /* 앱이 열리면 이 페이지가 뒤로 밀려 document.hidden 이 true 가 된다.
         그대로면 앱이 없는 것이므로 스토어로 보낸다. */
      const t = setTimeout(() => { if (!document.hidden && store) location.href = store; }, 1500);
      document.addEventListener('visibilitychange',
        () => { if (document.hidden) clearTimeout(t); }, { once: true });
      location.href = scheme;
    });
  }

  for (const [k, href] of Object.entries(V.links || {})) {
    if (k === 'tmap' || k === 'tmapStore') continue;   // 위에서 따로 처리한다
    const a = $(`[data-nav="${k}"]`);
    if (a) a.href = href;
  }
  /* 지도들. 첫 장은 index.html 에 정적으로 적혀 있으므로 그 <img> 를 그대로 쓴다 —
     새로 만들면 이미 받아 둔 이미지를 버리고 다시 받게 된다. */
  const mapsRoot = $('[data-maps]');
  if (mapsRoot) {
    const list = V.maps || [];
    if (!list.length) mapsRoot.remove();
    else {
      const existing = $('img', mapsRoot);
      const figures = list.map((m, i) => {
        const fig = el('figure', 'map');
        fig.dataset.reveal = 'map';
        const img = (i === 0 && existing) ? existing : el('img');
        img.src = m.src;
        // width/height 를 주면 이미지가 늦게 와도 자리가 미리 잡혀 레이아웃이 안 밀린다
        if (m.w) img.width = m.w;
        if (m.h) img.height = m.h;
        img.alt = m.alt || '';
        img.decoding = 'async';
        if (i > 0) img.loading = 'lazy';   // 첫 장은 바로 받는다
        if (m.link && V.links?.naver) {
          const a = el('a', 'map__link');
          a.href = V.links.naver;
          a.target = '_blank';
          a.rel = 'noopener';
          a.append(img);
          fig.append(a);
        } else {
          fig.append(img);
        }
        if (m.caption) fig.append(el('figcaption', 'map__cap', m.caption));
        return fig;
      });
      mapsRoot.replaceChildren(...figures);
    }
  }

  /* ---- 교통 ---------------------------------------------------------- */
  const T = W.transit;
  const sub_ = $('[data-subway]');
  if (sub_) sub_.replaceChildren(...T.subway.map((s) => {
    const li = el('li'); li.append(el('span', 'transit__tag', s.line), el('span', null, s.text)); return li;
  }));
  const subNote = $('[data-subway-note]');
  if (subNote) subNote.textContent = T.subwayNote || '';
  const bus = $('[data-bus]');
  if (bus) bus.replaceChildren(...T.bus.map((b) => {
    const li = el('li'); li.append(el('span', 'transit__tag', b.kind), el('span', null, b.text)); return li;
  }));
  const shuttle = $('[data-shuttle]');
  if (shuttle) shuttle.replaceChildren(...(T.shuttle || []).map((t) => el('p', null, t)));
  const car = $('[data-car]');
  if (car) car.replaceChildren(...(T.car || []).map((c) => {
    const li = el('li'); li.append(el('span', 'transit__tag', c.kind), el('span', null, c.text)); return li;
  }));

  /* ---- 안내사항 -------------------------------------------------------- */
  const info = $('[data-info]');
  if (info) info.replaceChildren(...W.info.map((c) => {
    const card = el('article', 'info__card');
    if (c.image) { const im = el('div', 'info__img'); const img = el('img'); img.src = c.image; img.alt = ''; im.append(img); card.append(im); }
    card.append(el('h3', 'info__title', c.title));
    const body = el('div', 'info__body'); body.append(...c.body.map((t) => el('p', null, t)));
    card.append(body);
    return card;
  }));

  /* ---- 갤러리: 확대 불가 슬라이드 ----------------------------------- */
  const track = $('[data-gal-track]');
  const thumbs = $('[data-gal-thumbs]');
  const count = $('[data-gal-count]');
  if (track) {
    const n = W.gallery.length;
    track.replaceChildren(...W.gallery.map((src, i) => {
      const item = el('div', 'gal__item');
      const img = el('img'); img.src = src; img.alt = `웨딩 사진 ${i + 1}`; img.loading = i === 0 ? 'eager' : 'lazy'; img.draggable = false;
      item.append(img); return item;
    }));
    if (thumbs) thumbs.replaceChildren(...W.gallery.map((src, i) => {
      const b = el('button', 'gal__thumb'); b.type = 'button'; b.setAttribute('aria-label', `${i + 1}번 사진`);
      const img = el('img'); img.src = src; img.alt = ''; img.loading = 'lazy'; b.append(img);
      b.addEventListener('click', () => go(i));
      return b;
    }));
    let idx = 0;
    const setActive = (i) => {
      idx = i;
      if (thumbs) $$('.gal__thumb', thumbs).forEach((t, k) => t.setAttribute('aria-current', String(k === i)));
      if (count) count.textContent = `${pad(i + 1)} / ${pad(n)}`;
    };
    const go = (i) => {
      const k = (i + n) % n;
      track.scrollTo({ left: k * track.clientWidth, behavior: 'smooth' });
      setActive(k);
    };
    $('[data-gal-prev]')?.addEventListener('click', () => go(idx - 1));
    $('[data-gal-next]')?.addEventListener('click', () => go(idx + 1));
    let raf = 0;
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const i = Math.round(track.scrollLeft / track.clientWidth);
        if (i !== idx) setActive(i);
      });
    }, { passive: true });
    setActive(0);
  }

  /* ---- 계좌 ---------------------------------------------------------- */
  const acctRoot = $('[data-acct]');
  const tabs = $$('[data-side]');
  const copy = async (text, btn) => {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = el('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
      document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    /* 글자만 바꾸면 버튼 폭이 줄었다 늘었다 한다. 바꾸기 전 폭을 재서
       고정해 두면 글자만 갈리고 버튼은 제자리에 있는다. */
    if (!btn.dataset.w) {
      btn.dataset.w = '1';
      btn.style.minWidth = btn.getBoundingClientRect().width + 'px';
    }
    const prev = btn.textContent;
    btn.dataset.done = 'true'; btn.textContent = '복사됨';
    setTimeout(() => { delete btn.dataset.done; btn.textContent = prev; }, 1500);
  };
  const renderAcct = (side) => {
    if (!acctRoot) return;
    acctRoot.replaceChildren(...(W.accounts[side] || []).map((a) => {
      const card = el('div', 'acct__card');
      // 이름 세 개가 나란히 있으면 누가 누군지 모른다. 관계를 먼저 쓴다.
      const who = el('p', 'acct__who');
      if (a.rel) who.append(el('span', 'acct__rel', a.rel));
      who.append(el('span', 'acct__holder', a.holder));
      card.append(who);
      const line = el('p', 'acct__line');
      line.append(el('span', 'acct__bank', a.bank), el('span', 'acct__num', a.number));
      const btn = el('button', 'acct__copy', '복사'); btn.type = 'button';
      // 은행 이름까지 복사하면 뱅킹 앱 입력칸에 그대로 못 붙인다. 번호만 준다.
      btn.addEventListener('click', () => copy(a.number, btn));
      line.append(btn);
      card.append(line);
      if (a.kakaopay) { const k = el('a', 'btn btn--ghost', '카카오페이'); k.href = a.kakaopay; k.target = '_blank'; k.rel = 'noopener'; card.append(k); }
      return card;
    }));
    for (const t of tabs) t.setAttribute('aria-selected', String(t.dataset.side === side));
    if (!MOTION) return;
    for (const card of acctRoot.children) {
      if (card.animate) {
        card.animate(
          [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }],
          { duration: 420, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
        );
      }
    }
  };
  for (const t of tabs) t.addEventListener('click', () => renderAcct(t.dataset.side));
  renderAcct('groom');

  /* ---- 공유 ---------------------------------------------------------- */
  $('[data-share]')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const url = location.origin + location.pathname;
    if (navigator.share) { try { await navigator.share({ title: document.title, url }); return; } catch { /* 취소 */ } }
    await copy(url, btn);
  });

  /* ---- 스크롤 진입 ----------------------------------------------------- */
  /* 바인딩이 끝난 지금 감싼다. 먼저 감싸면 textContent 가 창을 지워 버린다. */
  $$('[data-reveal="mask"]').forEach(maskify);

  const reveals = $$('[data-reveal]');

  /* 첫 화면은 관측이 아니라 순서다 — 문장, 이름이 차례로 들어오며 시작한다. */
  const hero = $$('.hero [data-reveal]');
  hero.forEach((n, i) => n.style.setProperty('--m-delay', 220 + i * 260 + 'ms'));

  if (!MOTION) {
    reveals.forEach((r) => r.classList.add('is-in'));
  } else {
    /* IntersectionObserver 를 쓰지 않는다. 목차를 눌러 한 번에 아래로 뛰면
       건너뛴 요소는 교차 상태가 바뀌지 않아 영영 안 보인 채로 남는다.
       화면 위로 이미 지나간 것도 '보여준 것'으로 쳐야 한다 —
       기준은 하나: 위쪽 모서리가 화면 88% 선보다 위에 있으면 보여준다. */
    const pending = new Set(reveals);
    let queued = false;
    const sweep = () => {
      queued = false;
      const line = window.innerHeight * 0.88;
      for (const n of pending) {
        if (n.getBoundingClientRect().top < line) {
          n.classList.add('is-in');
          pending.delete(n);
        }
      }
      if (!pending.size) {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      }
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(sweep);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }
})();
