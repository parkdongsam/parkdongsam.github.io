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

  /* ---- 변형 스위처 ---------------------------------------------------- */
  const params = new URLSearchParams(location.search);
  const THEMES = ['batang', 'gothic', 'poster'];
  const theme = params.get('theme');
  if (THEMES.includes(theme)) document.documentElement.dataset.theme = theme;
  const lab = $('.lab');
  if (lab && params.has('lab')) {
    lab.dataset.show = 'true';
    const cur = document.documentElement.dataset.theme || 'batang';
    for (const b of $$('button', lab)) {
      b.setAttribute('aria-pressed', String(b.dataset.theme === cur));
      b.addEventListener('click', () => {
        document.documentElement.dataset.theme = b.dataset.theme;
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
    node.replaceChildren(...arr.map((t) => el('p', null, t)));
  }
  /* 내용이 없는 섹션은 통째로 숨긴다 */
  for (const node of $$('[data-hide-if-empty]')) {
    const v = get(node.dataset.hideIfEmpty);
    if (!v || (Array.isArray(v) && !v.length)) node.remove();
  }

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
  }

  /* ---- 날짜 표기 ------------------------------------------------------ */
  const D = W.date;
  const big = $('[data-date-big]');
  if (big) big.textContent = `${D.year}.${pad(D.month)}.${pad(D.day)}`;
  const sub = $('[data-date-sub]');
  if (sub) sub.textContent = `${D.weekdayKo} ${D.timeKo}`;
  const time = $('time[data-date-iso]');
  if (time) time.setAttribute('datetime', D.iso);

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
      if (d == null) { c.classList.add('cal__cell--out'); c.setAttribute('aria-hidden', 'true'); }
      else {
        c.textContent = d;
        if (d === D.day) { c.classList.add('cal__cell--day'); c.setAttribute('aria-current', 'date'); }
        else if (i % 7 === 0) c.classList.add('cal__cell--sun');
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
  function tick() {
    const ms = target - Date.now();
    const s = Math.max(0, Math.floor(ms / 1000));
    const dd = Math.floor(s / 86400);
    if (nums.d) nums.d.textContent = dd;
    if (nums.h) nums.h.textContent = pad(Math.floor((s % 86400) / 3600));
    if (nums.m) nums.m.textContent = pad(Math.floor((s % 3600) / 60));
    if (nums.s) nums.s.textContent = pad(s % 60);
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
  for (const [k, href] of Object.entries(V.links || {})) {
    const a = $(`[data-nav="${k}"]`);
    if (a) a.href = href;
  }
  const sketch = $('[data-sketch]');
  if (sketch) {
    if (V.sketch?.src) {
      sketch.src = V.sketch.src;
      // width/height 를 주면 이미지가 늦게 와도 자리가 미리 잡혀 레이아웃이 안 밀린다
      if (V.sketch.w) sketch.width = V.sketch.w;
      if (V.sketch.h) sketch.height = V.sketch.h;
      sketch.loading = 'lazy';
      sketch.decoding = 'async';
    } else {
      sketch.closest('.map')?.remove();
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
    const prev = btn.textContent;
    btn.dataset.done = 'true'; btn.textContent = '복사됨';
    setTimeout(() => { delete btn.dataset.done; btn.textContent = prev; }, 1500);
  };
  const renderAcct = (side) => {
    if (!acctRoot) return;
    acctRoot.replaceChildren(...(W.accounts[side] || []).map((a) => {
      const card = el('div', 'acct__card');
      card.append(el('p', 'acct__holder', a.holder));
      const line = el('p', 'acct__line');
      line.append(el('span', null, a.bank), el('span', 'acct__num', a.number));
      const btn = el('button', 'acct__copy', '복사'); btn.type = 'button';
      btn.addEventListener('click', () => copy(`${a.bank} ${a.number}`, btn));
      line.append(btn);
      card.append(line);
      if (a.kakaopay) { const k = el('a', 'btn btn--ghost', '카카오페이'); k.href = a.kakaopay; k.target = '_blank'; k.rel = 'noopener'; card.append(k); }
      return card;
    }));
    for (const t of tabs) t.setAttribute('aria-selected', String(t.dataset.side === side));
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
  const reveals = $$('[data-reveal]');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    reveals.forEach((r) => r.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    reveals.forEach((r) => io.observe(r));
  }
})();
