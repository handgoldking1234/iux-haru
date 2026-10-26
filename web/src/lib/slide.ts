'use client';
/**
 * 슬라이드 학습(보기 · 받아쓰기)과 나만의 단어장 — prototype/build/slide.js를 그대로 옮겼다.
 * 프로토타입은 과목 화면의 전역 값(P·IT·CH·WD…)을 읽었는데, 여기서는 SlideCtx로 받는다.
 * 화면(.slp)은 프로토타입처럼 DOM을 직접 그린다(CSS는 sub.css의 slide.css 부분).
 */

import { saveLocal } from './sync';
import { vScore } from './voice';

export interface Face {
  id: string;
  /** 앞면 · 앞면 읽기 · 앞면 언어 */
  f: string; fs: string; fl: string;
  sub: string;
  /** 뜻 · 뜻 읽기 */
  b: string; bs: string;
  cls: string;
  /** 받아쓰기로 불러 주는 말 · 언어 · 정답 */
  dq: string; dl: string; ans: string;
}

export interface SlideCtx {
  /** 'eng' | 'han' | 'it' — 받아쓰기 안내 문구가 달라진다 */
  kind: 'eng' | 'han' | 'it';
  /** 설정·단어장 저장 키에 쓰는 이름 (프로토타입 document.title) */
  title: string;
  /** 학생 (단어장은 학생별) */
  kid: string;
  face(id: string): Face | null;
  /** 카드 안쪽 HTML (☆ 버튼 제외) */
  card(id: string): string;
  /** 오늘 할 일 범위의 카드: 오늘 오답, 지금 단원 항목 */
  wrongIds(): string[];
  unitIds(): string[];
  /** 슬라이드·단어장을 열고 닫을 때 (셸 헤더 숨기기 · 화면 다시 그리기) */
  onOpen(): void;
  onClose(): void;
}

const SV = (p: string) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
export const SIC = {
  play: SV('<polygon points="7 4 20 12 7 20 7 4" fill="currentColor"/>'),
  pause: SV('<rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/>'),
  prev: SV('<polyline points="15 18 9 12 15 6"/>'),
  next: SV('<polyline points="9 18 15 12 9 6"/>'),
  x: SV('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  set: SV('<line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="17" x2="20" y2="17"/><circle cx="9" cy="7" r="2.5" fill="#fff"/><circle cx="15" cy="17" r="2.5" fill="#fff"/>'),
  vol: SV('<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/>'),
  slide: SV('<rect x="3" y="5" width="18" height="14" rx="2"/><polygon points="10 9 15 12 10 15 10 9" fill="currentColor"/>'),
  star: SV('<polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3 12 2"/>'),
  starF: SV('<polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3 12 2" fill="currentColor"/>'),
  book: SV('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5V21h16"/>'),
  trash: SV('<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/>'),
  plus: SV('<path d="M12 5v14"/><path d="M5 12h14"/>'),
  eye: SV('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
};
const esc = (s: unknown) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
export const chips = (lab: string, arr: string[] | undefined) => (arr && arr.length ? `<div class="sc-r"><em>${lab}</em><span>${arr.join(' · ')}</span></div>` : '');

/* ---------- 음성: 기기에서 가장 자연스러운 목소리 고르기 ---------- */
type Opt = { mode: 'view' | 'dict'; rate: number; rep: number; gap1: number; gap2: number; wgap: number; order: string; scope: string; vko: string; ven: string };

type Wb = { cats: { id: string; name: string; items: string[] }[]; cur: string };

export function createSlide(ctx: SlideCtx, host: HTMLElement) {
  const { kind } = ctx;
  const OK_KEY = 'hg-slide2-' + ctx.title;
  const O: Opt = { mode: 'view', rate: 0.95, rep: 2, gap1: 2, gap2: 4, wgap: 6, order: 'seq', scope: 'today', vko: '', ven: '' };
  try { Object.assign(O, JSON.parse(localStorage.getItem(OK_KEY) || '{}')); } catch { /* 처음 */ }
  if (O.mode !== 'view' && O.mode !== 'dict') O.mode = 'view';
  const saveO = () => { try { localStorage.setItem(OK_KEY, JSON.stringify(O)); } catch { /* 무시 */ } };

  const canTTS = (() => { try { return 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'; } catch { return false; } })();
  let VOICES: SpeechSynthesisVoice[] = [];
  const loadV = () => { try { VOICES = speechSynthesis.getVoices() || []; } catch { VOICES = []; } };
  if (canTTS) { loadV(); try { speechSynthesis.addEventListener('voiceschanged', loadV); } catch { /* 무시 */ } }
  const voicesFor = (lang: string) => {
    const L = lang.slice(0, 2).toLowerCase();
    const exact = (v: SpeechSynthesisVoice) => (String(v.lang).replace('_', '-').toLowerCase() === lang.toLowerCase() ? 1 : 0);
    return VOICES.filter((v) => String(v.lang).slice(0, 2).toLowerCase() === L).sort((a, b) => vScore(b) - vScore(a) || exact(b) - exact(a));
  };
  const pickVoice = (lang: string) => { if (!VOICES.length) loadV(); const want = lang.startsWith('en') ? O.ven : O.vko, vs = voicesFor(lang); return (want && vs.find((v) => v.name === want)) || vs[0] || null; };
  let token = 0;
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const say = (text: string, lang: string) => new Promise<void>((res) => {
    if (!text) { res(); return; }
    if (!canTTS) { setTimeout(res, 500 + String(text).length * 120); return; }
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text)); u.lang = lang; u.rate = O.rate; u.pitch = 1; u.volume = 1;
      const v = pickVoice(lang); if (v) { u.voice = v; u.lang = v.lang; }
      let done = false; const fin = () => { if (!done) { done = true; res(); } };
      u.onend = fin; u.onerror = fin; setTimeout(fin, 2500 + (String(text).length * 280) / O.rate);
      speechSynthesis.speak(u);
    } catch { res(); }
  });
  const hush = () => { token++; cdStop(); try { if (canTTS) speechSynthesis.cancel(); } catch { /* 무시 */ } };

  /* ---------- 나만의 단어장 (과목·학생별) ---------- */
  const WBK = () => 'hg-wb-' + ctx.title + '-' + ctx.kid;
  const wbLoad = (): Wb => { try { const v = JSON.parse(localStorage.getItem(WBK()) || 'null'); if (v && Array.isArray(v.cats) && v.cats.length) return v; } catch { /* 처음 */ } return { cats: [{ id: 'c0', name: '기본', items: [] }], cur: 'c0' }; };
  const wbSave = (w: Wb) => saveLocal(WBK(), w);
  const inWB = (id: string) => wbLoad().cats.some((c) => c.items.includes(id));
  const wbCount = () => { const s = new Set<string>(); wbLoad().cats.forEach((c) => c.items.forEach((x) => { if (ctx.face(x)) s.add(x); })); return s.size; };
  const card = (id: string) => {
    const f = ctx.face(id)!; let h = '';
    try { h = ctx.card(id); } catch { h = `<div class="sc-top"><div class="sc-w">${esc(f.f)}</div><div class="sc-m">${esc(f.b)}</div></div>`; }
    const on = inWB(id);
    return `<div class="sc"><button class="sc-star ${on ? 'on' : ''}" data-a="star" aria-label="${on ? '단어장에 담김' : '단어장에 담기'}">${on ? SIC.starF : SIC.star}</button>${h}</div>`;
  };
  function build() {
    const ids: string[] = [], add = (x: string) => { if (x != null && !ids.includes(x) && ctx.face(x)) ids.push(x); };
    const wrong = ctx.wrongIds();
    if (O.scope !== 'unit') wrong.forEach(add);
    if (O.scope !== 'wrong') ctx.unitIds().forEach(add);
    let list = ids.slice(0, 40);
    if (O.order === 'rand') { for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; } }
    else if (O.order === 'wrong') { const w = list.filter((x) => wrong.includes(x)); list = w.concat(list.filter((x) => !wrong.includes(x))); }
    return list;
  }

  /* ---------- 화면 ---------- */
  let D0: string[] = [], idx = 0, dir = 0, auto = false, root: HTMLDivElement | null = null, shown = new Set<number>();
  const el = <T extends HTMLElement = HTMLElement>(s: string) => root!.querySelector<T>(s)!;
  const onKey = (e: KeyboardEvent) => {
    const tg = e.target as HTMLElement | null;
    if (tg?.matches?.('input')) { if (e.key === 'Enter' && tg.matches('.wbin')) (tg.parentNode as HTMLElement).querySelector('button')?.click(); return; }
    if (!root || root.hidden) return;
    if (e.key === 'ArrowRight') go(1); else if (e.key === 'ArrowLeft') go(-1); else if (e.key === 'Escape') close();
  };
  function mount() {
    if (root) return;
    root = document.createElement('div'); root.className = 'slp'; root.hidden = true; root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', '슬라이드 학습');
    root.innerHTML = `<div class="slp-top"><button class="slp-ib" data-a="close" aria-label="닫기">${SIC.x}</button><div class="slp-bar"><i></i></div><span class="slp-cnt"></span><button class="slp-ib" data-a="opts" aria-label="설정">${SIC.set}</button></div>
  <div class="slp-seg" role="group" aria-label="모드"><button data-m="view">보기</button><button data-m="dict">받아쓰기</button></div>
  <div class="slp-main"></div>
  <div class="slp-cdw"><div class="slp-cd" aria-live="off" hidden></div></div><div class="slp-ctl"><button class="slp-ib" data-a="prev" aria-label="이전">${SIC.prev}</button><button class="slp-ib slp-play" data-a="play" aria-label="자동 넘김">${SIC.play}</button><button class="slp-ib" data-a="next" aria-label="다음">${SIC.next}</button><button class="slp-spdb" data-a="spd" aria-label="말하기 속도"></button></div>
  <div class="slp-sheet" hidden><div class="slp-sh"></div></div>`;
    host.appendChild(root);
    root.addEventListener('click', onClick);
    let sx: number | null = null;
    root.addEventListener('touchstart', (e) => { if ((e.target as HTMLElement).closest('.slp-sheet')) return; sx = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', (e) => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1); }, { passive: true });
    document.addEventListener('keydown', onKey);
  }
  let CUST: string[] | null = null;
  function open(deck?: string[] | null, start = 0, mode?: 'view' | 'dict') {
    CUST = Array.isArray(deck) ? deck.filter((x) => ctx.face(x)) : null;
    if (mode === 'view' || mode === 'dict') { O.mode = mode; saveO(); }
    mount(); D0 = CUST || build(); idx = Math.max(0, Math.min(start | 0, D0.length - 1)); auto = false; shown = new Set();
    root!.hidden = false; ctx.onOpen();
    show();
  }
  function close() { hush(); auto = false; if (root) root.hidden = true; if (CUST && wb) { wb.hidden = false; wbPaint(); return; } ctx.onClose(); }
  function chrome() {
    const n = D0.length;
    el('.slp-bar i').style.width = n ? ((Math.min(idx, n - 1) + 1) / n) * 100 + '%' : '0';
    el('.slp-cnt').textContent = n ? `${Math.min(idx, n - 1) + 1} / ${n}` : '';
    root!.querySelectorAll<HTMLElement>('[data-m]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.m === O.mode)));
    root!.querySelectorAll<HTMLElement>('[data-r]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.r! === O.rate)));
    const pl = el('[data-a="play"]'); pl.innerHTML = auto ? SIC.pause : SIC.play; pl.setAttribute('aria-label', auto ? '자동 넘김 멈추기' : '자동 넘김 시작');
    el('.slp-ctl').style.display = n ? '' : 'none'; el('.slp-spdb').textContent = O.rate === 0.95 ? '보통' : O.rate + '×';
  }
  function paint() {
    chrome(); const m = el('.slp-main'); m.scrollTop = 0;
    if (!D0.length) { m.innerHTML = `<div class="slp-empty">${O.scope === 'wrong' ? '다시 볼 오답이 없어요.<br>설정에서 범위를 바꿔 보세요.' : '볼 카드가 없어요.'}</div>`; return; }
    const f = ctx.face(D0[idx])!;
    if (O.mode === 'view') m.innerHTML = card(D0[idx]);
    else {
      const op = shown.has(idx);
      m.innerHTML = `<div class="slp-dq"><div class="slp-no">${idx + 1}<small>번</small></div>
      <button class="slp-spk" data-a="say" aria-label="다시 불러 주기">${SIC.vol}</button>
      <div class="slp-ask">${kind === 'eng' ? '단어를 듣고 공책에 철자를 써 보세요' : kind === 'han' ? (String(D0[idx])[0] === 'P' ? '읽는 소리를 듣고 구절을 한자로 써 보세요' : '훈과 음을 듣고 한자를 써 보세요') : '불러 주는 말을 듣고 공책에 써 보세요'}</div>
      <div class="slp-ans ${op ? '' : 'hid'}"><b class="${f.cls.includes('hz') ? 'hz' : f.cls === 'en' ? 'en' : ''}">${esc(f.ans)}</b><small>${esc(f.b)}</small></div>
      <button class="slp-chip" data-a="peek">${SIC.eye}${op ? '정답 가리기' : '정답 보기'}</button></div>`;
    }
    // 카드 넘김: 다음은 오른쪽에서, 이전은 왼쪽에서 밀려 들어온다 (정답 보기 등 같은 카드 다시 그리기는 그대로)
    if (dir) { m.firstElementChild?.classList.add(dir > 0 ? 'sl-in-next' : 'sl-in-prev'); dir = 0; }
  }
  async function show() {
    paint(); const my = ++token;
    if (!D0.length) return;
    const f = ctx.face(D0[idx])!;
    if (O.mode === 'view') {
      for (let r = 0; r < (auto ? O.rep : 1); r++) {
        await say(f.fs, f.fl); if (my !== token) return;
        if (f.bs) { await wait(O.gap1 * 500); if (my !== token) return; await say(f.bs, 'ko-KR'); if (my !== token) return; }
        if (r < O.rep - 1 && auto) await wait(700);
      }
      if (!auto) return; await countdown(O.gap2 * 1000, my); if (my !== token) return; next();
    } else {
      for (let r = 0; r < O.rep; r++) { await say(f.dq, f.dl); if (my !== token) return; if (r < O.rep - 1) await wait(Math.max(1500, O.wgap * 400)); if (my !== token) return; }
      if (!auto) return; await countdown(O.wgap * 1000, my); if (my !== token) return; next();
    }
  }
  function next() { if (idx < D0.length - 1) { idx++; dir = 1; show(); } else finish(); }
  /* 다음 카드까지 남은 시간: 재생 버튼 둘레 링 + 숫자 */
  let cdT: ReturnType<typeof setInterval> | null = null;
  function cdStop() {
    if (cdT) clearInterval(cdT); cdT = null; if (!root) return;
    const c = root.querySelector<HTMLElement>('.slp-cd'); if (c) c.hidden = true;
    const p = root.querySelector<HTMLElement>('.slp-play'); if (p) { p.classList.remove('cd'); p.style.removeProperty('--cd'); }
  }
  function countdown(ms: number, my: number) {
    return new Promise<void>((res) => {
      const t0 = Date.now(), lab = el('.slp-cd'), pl = el('.slp-play'); lab.hidden = false; pl.classList.add('cd');
      const tick = () => {
        if (my !== token) { cdStop(); res(); return; }
        const left = Math.max(0, ms - (Date.now() - t0)); pl.style.setProperty('--cd', (1 - left / ms).toFixed(3));
        lab.innerHTML = `<i style="width:${((1 - left / ms) * 100).toFixed(1)}%"></i><span>${O.mode === 'dict' ? '쓰는 시간' : '다음 카드까지'} <b>${Math.ceil(left / 1000)}</b>초</span>`;
        if (left <= 0) { cdStop(); res(); }
      };
      if (cdT) clearInterval(cdT); tick(); cdT = setInterval(tick, 100);
    });
  }
  function go(d: number) { if (!D0.length) return; hush(); if (d > 0 && idx >= D0.length - 1) { finish(); return; } const ni = Math.max(0, Math.min(D0.length - 1, idx + d)); dir = Math.sign(ni - idx); idx = ni; show(); }
  function finish() {
    hush(); auto = false; chrome(); el('.slp-ctl').style.display = 'none'; el('.slp-bar i').style.width = '100%';
    const dict = O.mode === 'dict', m = el('.slp-main'); m.scrollTop = 0;
    m.innerHTML = `<div class="slp-done"><h2>${dict ? '받아쓰기 끝! 정답을 맞춰 보세요' : '한 덱을 다 봤어요'}</h2>
    ${dict ? `<ol class="slp-key">${D0.map((id) => { const f = ctx.face(id)!; return `<li><b class="${f.cls.includes('hz') ? 'hz' : f.cls === 'en' ? 'en' : ''}">${esc(f.ans)}</b><span>${esc(f.b)}</span><button class="slp-ib sm" data-sayid="${esc(id)}" aria-label="${esc(f.ans)} 듣기">${SIC.vol}</button></li>`; }).join('')}</ol>` : `<p class="slp-ex">${D0.length}개 카드를 봤어요. 이제 받아쓰기로 확인해 볼까요?</p>`}
    <div class="slp-acts">${dict ? '<button class="slp-btn ghost" data-a="again">처음부터 다시</button><button class="slp-btn ghost" data-a="toview">보기로</button>' : '<button class="slp-btn ghost" data-a="again">처음부터 다시</button><button class="slp-btn ghost" data-a="todict">받아쓰기 하기</button>'}<button class="slp-btn" data-a="close">닫기</button></div></div>`;
  }
  function paintStar() { const b = root!.querySelector<HTMLElement>('.sc-star'); if (!b) return; const on = inWB(D0[idx]); b.classList.toggle('on', on); b.innerHTML = on ? SIC.starF : SIC.star; }
  function starSheet(id: string) {
    const w = wbLoad(), f = ctx.face(id)!;
    el('.slp-sheet').hidden = false;
    el('.slp-sh').innerHTML = `<h3>단어장에 담기<button class="slp-ib" data-a="shclose" aria-label="닫기">${SIC.x}</button></h3>
    <p class="slp-note"><b>${esc(f.f)}</b> · 담을 카테고리를 골라요. 여러 곳에 담을 수 있어요.</p>
    <div class="slp-row"><div>${w.cats.map((c) => `<button class="slp-chip" data-a="wbt" data-c="${c.id}" data-id="${esc(id)}" aria-pressed="${c.items.includes(id)}">${c.items.includes(id) ? '✓ ' : ''}${esc(c.name)} <small>&nbsp;${c.items.length}</small></button>`).join('')}</div></div>
    <div class="slp-row"><b>새 카테고리 만들고 담기</b><div class="wbnew"><input class="wbin" maxlength="20" placeholder="예: 헷갈리는 단어, 시험 범위" aria-label="새 카테고리 이름"><button class="slp-btn" data-a="wbnew" data-id="${esc(id)}">만들기</button></div></div>`;
  }
  function sheet() {
    const g = (k: keyof Opt, vals: [string | number, string][], lab: string) => `<div class="slp-row"><b>${lab}</b><div>${vals.map(([v, t]) => `<button class="slp-chip" data-k="${k}" data-v="${v}" aria-pressed="${String(O[k]) === String(v)}">${t}</button>`).join('')}</div></div>`;
    const vsel = (k: 'ven' | 'vko', lang: string, lab: string) => {
      const vs = voicesFor(lang);
      if (!vs.length) return `<div class="slp-row"><b>${lab}</b><p class="slp-note">이 기기에는 ${lang.startsWith('en') ? '영어' : '한국어'} 목소리가 없어요.</p></div>`;
      const cur = (pickVoice(lang) || { name: '' }).name;
      return `<div class="slp-row"><b>${lab}</b><select class="slp-sel" data-vk="${k}" aria-label="${lab}">${vs.map((v) => `<option value="${esc(v.name)}" ${v.name === cur ? 'selected' : ''}>${esc(v.name.replace(/^(Microsoft|Google)\s*/, '').replace(/\s*-\s*.*$/, ''))}${vScore(v) >= 50 ? ' · 자연스러운 목소리' : ''}</option>`).join('')}</select><button class="slp-chip" data-a="test" data-tl="${lang}">들어 보기</button></div>`;
    };
    el('.slp-sheet').hidden = false;
    el('.slp-sh').innerHTML = `<h3>슬라이드 설정<button class="slp-ib" data-a="shclose" aria-label="닫기">${SIC.x}</button></h3>
    ${g('scope', [['today', '오늘 할 일'], ['wrong', '오답만'], ['unit', '지금 단원']], '범위')}
    ${g('order', [['seq', '차례대로'], ['rand', '무작위'], ['wrong', '오답 먼저']], '순서')}
    ${g('rep', [[1, '1번'], [2, '2번'], [3, '3번']], '카드마다 읽어 주는 횟수')}
    ${g('gap2', [[3, '3초'], [4, '4초'], [6, '6초'], [10, '10초']], '보기: 다음 카드까지 (자동 넘김)')}
    ${g('wgap', [[4, '4초'], [6, '6초'], [8, '8초'], [12, '12초']], '받아쓰기: 쓰는 시간 (자동 넘김)')}
    ${g('rate', [[0.5, '0.5×'], [0.75, '0.75×'], [0.95, '보통'], [1.25, '1.25×'], [1.5, '1.5×'], [2, '2×'], [3, '3×'], [4, '4×']], '말하기 속도')}
    ${kind === 'eng' ? vsel('ven', 'en-US', '영어 목소리') : ''}${vsel('vko', 'ko-KR', '한국어 목소리')}`;
    el('.slp-sh').querySelectorAll<HTMLSelectElement>('.slp-sel').forEach((s) => (s.onchange = () => {
      const k = s.dataset.vk as 'ven' | 'vko'; O[k] = s.value; saveO();
      say(k === 'ven' ? 'Hello, nice to meet you.' : '안녕하세요, 함께 공부해요.', k === 'ven' ? 'en-US' : 'ko-KR');
    }));
  }
  function onClick(e: MouseEvent) {
    if (e.target === el('.slp-sheet')) { el('.slp-sheet').hidden = true; return; }
    const t = (e.target as HTMLElement).closest<HTMLElement>('button,[data-a]'); if (!t || t.tagName === 'SELECT') return;
    if (t.dataset.say != null && !t.dataset.a) { e.stopPropagation(); say(t.dataset.say, kind === 'eng' ? 'en-US' : 'ko-KR'); return; }
    if (t.dataset.sayid != null) { const f = ctx.face(t.dataset.sayid); if (f) say(f.dq, f.dl); return; }
    if (t.dataset.m) { if (O.mode !== t.dataset.m) { O.mode = t.dataset.m as Opt['mode']; saveO(); hush(); auto = false; idx = 0; shown = new Set(); show(); } return; }
    if (t.dataset.r) { O.rate = +t.dataset.r; saveO(); chrome(); return; }
    if (t.dataset.k) {
      const k = t.dataset.k as keyof Opt, v = t.dataset.v!;
      (O as Record<string, unknown>)[k] = ['rep', 'gap1', 'gap2', 'wgap', 'rate'].includes(k) ? +v : v; saveO(); sheet();
      if (k === 'scope' || k === 'order') { hush(); auto = false; D0 = build(); idx = 0; shown = new Set(); paint(); }
      return;
    }
    const a = t.dataset.a; if (!a) return;
    if (a === 'close') close();
    else if (a === 'opts') sheet();
    else if (a === 'shclose') el('.slp-sheet').hidden = true;
    else if (a === 'test') { const l = t.dataset.tl!; say(l.startsWith('en') ? 'Hello, nice to meet you.' : '안녕하세요, 함께 공부해요.', l); }
    else if (a === 'play') { auto = !auto; chrome(); if (auto) show(); else hush(); }
    else if (a === 'spd') { const R = [0.5, 0.75, 0.95, 1.25, 1.5, 2, 3, 4]; O.rate = R[(R.indexOf(O.rate) + 1) % R.length] || 0.95; saveO(); chrome(); }
    else if (a === 'star') starSheet(D0[idx]);
    else if (a === 'wbt') { const w = wbLoad(), c = w.cats.find((x) => x.id === t.dataset.c), id = t.dataset.id!; if (c) { const i = c.items.indexOf(id); if (i >= 0) c.items.splice(i, 1); else c.items.unshift(id); wbSave(w); } starSheet(id); paintStar(); }
    else if (a === 'wbnew') { const inp = root!.querySelector<HTMLInputElement>('.slp-sh .wbin'), nm = ((inp && inp.value) || '').trim(); if (!nm) return; const w = wbLoad(); w.cats.push({ id: 'c' + Date.now().toString(36), name: nm.slice(0, 20), items: [t.dataset.id!] }); wbSave(w); starSheet(t.dataset.id!); paintStar(); }
    else if (a === 'prev') go(-1);
    else if (a === 'next') go(1);
    else if (a === 'sayf') { const f = ctx.face(D0[idx])!; hush(); (async () => { await say(f.fs, f.fl); if (f.bs) await say(f.bs, 'ko-KR'); })(); }
    else if (a === 'say') { const f = ctx.face(D0[idx])!; hush(); say(f.dq, f.dl); }
    else if (a === 'peek') { if (shown.has(idx)) shown.delete(idx); else shown.add(idx); paint(); }
    else if (a === 'again') { D0 = CUST || build(); idx = 0; shown = new Set(); auto = false; show(); }
    else if (a === 'todict') { O.mode = 'dict'; saveO(); idx = 0; shown = new Set(); auto = false; show(); }
    else if (a === 'toview') { O.mode = 'view'; saveO(); idx = 0; auto = false; show(); }
  }

  /* ---------- 나만의 단어장 화면 ---------- */
  let wb: HTMLDivElement | null = null, wbEdit = false;
  function wbOpen() {
    if (!wb) {
      wb = document.createElement('div'); wb.className = 'slp wbp'; wb.setAttribute('role', 'dialog'); wb.setAttribute('aria-label', '나의 단어장');
      host.appendChild(wb);
      wb.addEventListener('click', wbClick);
      wb.addEventListener('keydown', (e) => { const tg = e.target as HTMLElement; if (e.key === 'Enter' && tg.matches('.wbin')) { e.preventDefault(); (tg.parentNode as HTMLElement).querySelector('button')?.click(); } });
    }
    wb.hidden = false; wbEdit = false; ctx.onOpen(); wbPaint();
  }
  function wbClose() { if (wb) wb.hidden = true; ctx.onClose(); }
  function wbPaint() {
    const w = wbLoad(); const c = w.cats.find((x) => x.id === w.cur) || w.cats[0]; w.cur = c.id;
    const items = c.items.filter((x) => ctx.face(x));
    wb!.innerHTML = `<div class="slp-top"><button class="slp-ib" data-w="close" aria-label="닫기">${SIC.x}</button><h2 class="wb-h">나의 단어장</h2><button class="slp-ib" data-w="edit" aria-label="카테고리 관리">${SIC.set}</button></div>
    <div class="wb-cats" role="tablist">${w.cats.map((x) => `<button role="tab" aria-selected="${x.id === c.id}" data-w="cat" data-c="${x.id}">${esc(x.name)}<small>${x.items.filter((y) => ctx.face(y)).length}</small></button>`).join('')}<button class="wb-add" data-w="newcat" aria-label="새 카테고리">${SIC.plus}</button></div>
    ${wbEdit ? `<div class="wb-edit"><div class="wbnew"><input class="wbin" maxlength="20" value="${esc(c.name)}" aria-label="카테고리 이름"><button class="slp-btn" data-w="rename">이름 바꾸기</button></div>${w.cats.length > 1 ? `<button class="wb-del" data-w="delcat">${SIC.trash}'${esc(c.name)}' 카테고리 지우기</button>` : ''}</div>` : ''}
    <div class="wb-acts"><button class="slp-btn" data-w="view" ${items.length ? '' : 'disabled'}>${SIC.slide}슬라이드로 복습</button><button class="slp-btn ghost" data-w="dict" ${items.length ? '' : 'disabled'}>받아쓰기</button></div>
    <div class="slp-main wb-list">${items.length ? `<ol>${items.map((id, i) => { const f = ctx.face(id)!; return `<li><button class="wb-it" data-w="go" data-i="${i}"><b class="${f.cls.includes('hz') ? 'hz' : f.cls === 'en' ? 'en' : ''}">${esc(f.f)}</b><span>${esc(f.b)}</span></button><button class="slp-ib sm" data-w="say" data-id="${esc(id)}" aria-label="듣기">${SIC.vol}</button><button class="slp-ib sm" data-w="rm" data-id="${esc(id)}" aria-label="빼기">${SIC.x}</button></li>`; }).join('')}</ol>` : '<div class="slp-empty">아직 담은 단어가 없어요.<br>슬라이드 카드 오른쪽 위 <b>☆</b>을 눌러<br>이 카테고리에 담아 보세요.</div>'}</div>
    <div class="slp-sheet" hidden><div class="slp-sh"></div></div>`;
    wbSave(w);
  }
  function wbClick(e: MouseEvent) {
    const sh = wb!.querySelector<HTMLElement>('.slp-sheet')!; if (e.target === sh) { sh.hidden = true; return; }
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-w]'); if (!t) return;
    const a = t.dataset.w, w = wbLoad(), c = w.cats.find((x) => x.id === w.cur) || w.cats[0];
    const items = c.items.filter((x) => ctx.face(x));
    if (a === 'close') wbClose();
    else if (a === 'cat') { w.cur = t.dataset.c!; wbSave(w); wbEdit = false; wbPaint(); }
    else if (a === 'edit') { wbEdit = !wbEdit; wbPaint(); }
    else if (a === 'newcat') { sh.hidden = false; sh.querySelector('.slp-sh')!.innerHTML = `<h3>새 카테고리<button class="slp-ib" data-w="shx" aria-label="닫기">${SIC.x}</button></h3><div class="slp-row"><div class="wbnew"><input class="wbin" maxlength="20" placeholder="예: 시험 범위, 헷갈리는 단어" aria-label="새 카테고리 이름"><button class="slp-btn" data-w="mkcat">만들기</button></div></div>`; sh.querySelector<HTMLInputElement>('.wbin')?.focus(); }
    else if (a === 'shx') sh.hidden = true;
    else if (a === 'mkcat') { const nm = (sh.querySelector<HTMLInputElement>('.wbin')!.value || '').trim(); if (!nm) return; const id = 'c' + Date.now().toString(36); w.cats.push({ id, name: nm.slice(0, 20), items: [] }); w.cur = id; wbSave(w); wbPaint(); }
    else if (a === 'rename') { const nm = (wb!.querySelector<HTMLInputElement>('.wb-edit .wbin')!.value || '').trim(); if (!nm) return; c.name = nm.slice(0, 20); wbSave(w); wbEdit = false; wbPaint(); }
    else if (a === 'delcat') {
      if (w.cats.length < 2) return;
      if (!t.dataset.sure) { t.dataset.sure = '1'; t.innerHTML = `${SIC.trash}한 번 더 누르면 지워져요 (담긴 ${c.items.length}개)`; return; }
      w.cats = w.cats.filter((x) => x !== c); w.cur = w.cats[0].id; wbSave(w); wbEdit = false; wbPaint();
    }
    else if (a === 'rm') { c.items = c.items.filter((x) => x !== t.dataset.id); wbSave(w); wbPaint(); }
    else if (a === 'say') { const f = ctx.face(t.dataset.id!); if (f) { hush(); (async () => { await say(f.fs, f.fl); if (f.bs) await say(f.bs, 'ko-KR'); })(); } }
    else if (a === 'view' || a === 'dict' || a === 'go') { wb!.hidden = true; open(items, a === 'go' ? +t.dataset.i! : 0, a === 'dict' ? 'dict' : 'view'); }
  }

  return {
    open: () => open(),
    openWordbook: wbOpen,
    wbCount,
    destroy() { hush(); document.removeEventListener('keydown', onKey); root?.remove(); wb?.remove(); },
  };
}

/* ---------- 용어 과목(국어·과학·역사) 카드 ---------- */
type TermItem = { t: string; d?: string; k?: string; yl?: string; ex?: string; mc?: boolean; unit: { title: string; lv: number; items: { t: string }[] } };

export function termFace(it: TermItem | undefined, id: string): Face | null {
  if (!it || it.mc) return null;
  return { id, f: it.t, fs: it.t, fl: 'ko-KR', sub: it.k || '', b: (it.d || '') + (it.yl ? ` (${it.yl})` : ''), bs: it.d || '', cls: it.t.length > 8 ? 'long' : '', dq: it.t, dl: 'ko-KR', ans: it.t };
}

export function termCard(x: TermItem, LV: string[]) {
  const u = x.unit, mates = u.items.filter((y) => y.t !== x.t).slice(0, 4).map((y) => `<b>${esc(y.t)}</b>`);
  return `<div class="sc-top"><div class="sc-kicker">${esc(u.title)}</div><button class="sc-w ${x.t.length > 7 ? 'lg' : ''}" data-a="sayf">${esc(x.t)}</button><div class="sc-tag"><span>${esc(x.k || '')}</span>${x.yl ? `<span>${esc(x.yl)}</span>` : ''}<span>${esc(LV[u.lv])}</span></div></div>
      <div class="sc-bx"><i>뜻</i><p class="c4">${esc(x.d)}</p></div>
      ${x.ex ? `<div class="sc-bx"><i>예</i><p class="c2">${esc(x.ex)}</p></div>` : ''}
      ${chips('함께 익힐 말', mates)}`;
}
