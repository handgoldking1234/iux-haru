/* 영단어 — prototype/build/eng.js의 단어·단원·문제·카드 부분을 그대로 옮김.
   m=뜻 고르기 · k=단어 고르기 · b=예문 빈칸 · s=철자 쓰기 · l=듣고 뜻 고르기 */
import { pick, shuffle } from '../engine/choices';
import { EXAM_CAP, EXAM_PASS_N, RULES } from '../engine/rules';
import { LI } from '../protoIcons';
import { chips, type Face } from '../slide';
import { DEFAULT_UI } from './ui';
import type { PQ, SStage, SubjectDef, Track } from './types';

const esc = (s: unknown) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
interface W { w: string; lv: number; pos: string; ko: string; ex: string; exko: string; th: string; alt: string; der: string; ipa: string }
type Ety = { et?: string; pt?: string; fam?: [string, string][]; syn?: [string, string][]; ant?: [string, string][]; ph?: [string, string][] };
interface ED { LV: string[]; W: string[][]; ST: [number, number, string, string, number][]; ETY?: Record<string, Ety> }

let LV: string[] = [], WD: Record<string, W> = {}, ALL: string[] = [], ETY: Record<string, Ety> = {}, STOF: Record<string, string> = {}, STAGES: SStage[] = [];
const ko1 = (w: string) => WD[w].ko.split(/,\s*/)[0];

/* 발음 (브라우저 음성) */
const canSpeak = () => { try { return 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'; } catch { return false; } };
export function speak(text: string, rate?: number) {
  if (!canSpeak()) return;
  try {
    speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = rate || 0.85;
    const v = speechSynthesis.getVoices().find((x) => /^en(-|_)US/i.test(x.lang)) || speechSynthesis.getVoices().find((x) => /^en/i.test(x.lang));
    if (v) u.voice = v; speechSynthesis.speak(u);
  } catch { /* 소리를 못 내는 환경 */ }
}
const sayBtn = (text: string, label?: string) => `<button class="say" data-say="${esc(text)}" aria-label="${label || '발음 듣기'}">${LI('volume-2')}${label ? `<span>${label}</span>` : ''}</button>`;

/** 펜으로 쓰기 설정 (마이 > 설정의 '영단어 펜으로 쓰기'와 같은 값) */
let penGet: () => boolean = () => true;
let penSet: (on: boolean) => void = () => {};
export function bindEngPen(get: () => boolean, set: (on: boolean) => void) { penGet = get; penSet = set; }
const penOn = () => penGet();

function exHTML(x: W, hide?: boolean) {
  const re = new RegExp(`\\b(${x.w.replace(/[-]/g, '\\-')}[a-z]*)\\b`, 'i');
  return esc(x.ex).replace(re, hide ? '<b class="blank">_____</b>' : '<b class="hl">$1</b>');
}
const relB = (lab: string, arr?: [string, string][]) => (arr && arr.length ? `<div class="wl rel"><span class="lk">${lab}</span><div class="ders">${arr.map(([e, k]) => `<span>${esc(e)} <small>${esc(k)}</small></span>`).join('')}</div></div>` : '');
function infoHTML(_T: Track, w: string) {
  const x = WD[w], E = ETY[w] || {}, fam = (E.fam || []).map((r) => r[0]), der = (x.der || '').split(/,\s*/).filter((d) => d && !fam.includes(d));
  return `<div class="info">
    <div class="itop"><span class="ich en">${esc(x.w)}</span>${sayBtn(x.w)}${penOn() ? `<button class="btn wtr" data-etrace="${esc(x.w)}">${LI('pencil')}따라 쓰기</button>` : ''}</div>
    <div class="ihun"><b>${esc(x.ko)}</b>${x.ipa ? `<small class="ipa">/${esc(x.ipa)}/</small>` : ''}
      <div class="meta"><span>${x.pos}</span><span>${LV[x.lv]}</span><span>${x.th}</span>${x.alt ? `<span>다른 형태 ${esc(x.alt)}</span>` : ''}</div></div>
    ${E.et ? `<div class="org ety"><span class="ok">어원</span><p>${esc(E.et)}</p>${E.pt ? `<small class="pt">${esc(E.pt)}</small>` : ''}</div>` : ''}
    <div class="org"><span class="ok">예문</span><p class="exen">${exHTML(x)} ${sayBtn(x.ex, '')}</p><small>${esc(x.exko)}</small></div>
    ${relB('같은 뿌리 단어', E.fam)}${relB('비슷한 말', E.syn)}${relB('반대말', E.ant)}${relB('자주 쓰는 표현', E.ph)}
    ${der.length ? `<div class="wl"><span class="lk">함께 익힐 단어</span><div class="ders">${der.map((d) => `<span>${esc(d)}${WD[d] ? ` <small>${esc(ko1(d))}</small>` : ''}</span>`).join('')}</div></div>` : ''}
  </div>`;
}

function near(w: string, n: number, f: (y: string) => string, rng: () => number) {
  const x = WD[w], out: string[] = [], seen = new Set([w]);
  const pool = shuffle(ALL.filter((y) => WD[y].lv === x.lv && y !== w && ko1(y) !== ko1(w)), rng);
  for (const y of pool.filter((y) => WD[y].pos.split('·')[0] === x.pos.split('·')[0])) { if (out.length >= n) break; if (!seen.has(f(y)) && f(y) !== f(w)) { seen.add(f(y)); out.push(y); } }
  for (const y of pool) { if (out.length >= n) break; if (!out.includes(y) && !seen.has(f(y)) && f(y) !== f(w)) { seen.add(f(y)); out.push(y); } }
  return out;
}
const blankOK = (w: string) => new RegExp(`\\b${WD[w].w.replace(/[-]/g, '\\-')}[a-z]*\\b`, 'i').test(WD[w].ex);
/* 철자 쓰기(키보드 입력)는 중등 61단원부터: 초등·중등 앞부분은 고르기 문제만 */
const SPELL_FROM = { lv: 1, n: 61 };
const spellOK = (w: string) => { const s = STAGES.find((x) => x.id === STOF[w]); return !!s && (s.lvI > SPELL_FROM.lv || (s.lvI === SPELL_FROM.lv && (s.n ?? 0) >= SPELL_FROM.n)); };

function makeQ(_T: Track, w: string, t0: string, rng: () => number): PQ {
  const x = WD[w];
  let t = t0;
  if (t === 's' && !spellOK(w)) t = blankOK(w) ? 'b' : 'k';
  if (t === 'l' && !canSpeak()) t = 'm';
  if (t === 'b' && !blankOK(w)) t = 'k';
  const base = { item: w, qtype: t };
  const en = { cc: 'enc', sc: 'en' };
  if (t === 'm') return { ...base, ask: '이 단어의 뜻은?', q: `<span class="en">${esc(x.w)}</span>`, qc: 'enq', hint: sayBtn(x.w, '발음'), choices: shuffle([x.ko, ...near(w, 3, (y) => WD[y].ko, rng).map((y) => WD[y].ko)], rng), answer: x.ko };
  if (t === 'l') return { ...base, ask: '듣고 뜻을 골라요', q: `<button class="bigsay" data-say="${esc(x.w)}">${LI('volume-2')}<span>다시 듣기</span></button>`, qc: 'lis', hint: '', choices: shuffle([x.ko, ...near(w, 3, (y) => WD[y].ko, rng).map((y) => WD[y].ko)], rng), answer: x.ko, auto: x.w };
  if (t === 'k') return { ...base, ask: '이 뜻의 영어 단어는?', q: `${esc(x.ko)}`, qc: 'koq', hint: `<span class="hint">${x.pos}</span>`, choices: shuffle([x.w, ...near(w, 3, (y) => y.toLowerCase(), rng)], rng), answer: x.w, ...en };
  if (t === 'b') return { ...base, ask: '빈칸에 알맞은 단어는?', q: `<span class="exq">${exHTML(x, true)}</span>`, qc: 'exb', hint: `<span class="hint">${esc(x.exko)}</span>`, choices: shuffle([x.w, ...near(w, 3, (y) => y.toLowerCase(), rng)], rng), answer: x.w, ...en };
  /* s */ return { ...base, ask: '뜻을 보고 철자를 써요', q: `${esc(x.ko)}`, qc: 'koq', hint: `<span class="hint">${x.pos} · ${x.w.length}글자 · ${esc(x.w[0])}로 시작</span>`, choices: [], answer: x.w, spell: true, ...en };
}

const preview = (s: SStage) => s.items.slice(0, 6).join(' · ') + (s.items.length > 6 ? ' …' : '');
const theme = (s: SStage) => (s.raw?.theme as string) ?? '';

/* 슬라이드 카드 — slide.js KIND 'eng' */
function slideFace(_T: Track, id: string): Face | null {
  const w = WD[id]; if (!w) return null;
  return { id, f: w.w, fs: w.w, fl: 'en-US', sub: w.ipa ? '/' + w.ipa.replace(/^\/|\/$/g, '') + '/' : '', b: w.ko, bs: w.ko, cls: 'en', dq: w.w, dl: 'en-US', ans: w.w };
}
function slideCard(_T: Track, id: string) {
  const x = WD[id], E = ETY[id] || {}, pr = (a?: [string, string][]) => (a || []).slice(0, 3).map(([e, k]) => `<b>${esc(e)}</b> ${esc(k)}`);
  const sa = [...(E.syn || []).slice(0, 2).map(([e, k]) => `<b>${esc(e)}</b> ${esc(k)}`), ...(E.ant || []).slice(0, 1).map(([e, k]) => `↔ <b>${esc(e)}</b> ${esc(k)}`)];
  return `<div class="sc-top"><button class="sc-w en" data-a="sayf">${esc(x.w)}</button><div class="sc-tag">${x.ipa ? `<span>/${esc(x.ipa)}/</span>` : ''}<span>${esc(x.pos)}</span><span>${esc(LV[x.lv])}</span></div><div class="sc-m">${esc(x.ko)}</div></div>
      ${E.et ? `<div class="sc-bx"><i>어원</i><p class="c3">${esc(E.et)}</p>${E.pt ? `<small>${esc(E.pt)}</small>` : ''}</div>` : ''}
      ${x.ex ? `<div class="sc-bx"><i>예문</i><p class="c2 en">${esc(x.ex)}</p><small class="c1">${esc(x.exko)}</small></div>` : ''}
      <div class="sc-rs">${chips('같은 뿌리', pr(E.fam))}${chips('비슷·반대', sa)}${chips('표현', (E.ph || []).slice(0, 1).map(([e, k]) => `<b>${esc(e)}</b> ${esc(k)}`))}</div>`;
}

export const ENG: SubjectDef = {
  key: 'eng',
  tracks: { all: '영단어' },
  defaultTrack: 'all',
  get areas() { return LV; },
  tname: { m: '뜻 고르기', k: '단어 고르기', b: '예문 빈칸', s: '철자 쓰기', l: '듣고 뜻 고르기' },
  setup: (data) => {
    const D = data as ED;
    LV = D.LV; ETY = D.ETY || {}; WD = {};
    D.W.forEach((r) => { WD[r[0]] = { w: r[0], lv: +r[1], pos: r[2], ko: r[3], ex: r[4], exko: r[5], th: r[6], alt: r[7], der: r[8], ipa: r[9] }; });
    ALL = Object.keys(WD);
    STAGES = [];
    D.ST.forEach(([lv, n, th, ws, core], k) => {
      STAGES.push({ id: '', kind: 'unit', lvI: lv, area: LV[lv], g: LV[lv], n, name: `${LV[lv]} ${n}단원`, items: ws.split('|'), raw: { theme: th, core: !!core } });
      const nx = D.ST[k + 1];
      if (!nx || nx[0] !== lv) STAGES.push({ id: '', kind: 'exam', lvI: lv, area: LV[lv], g: LV[lv], name: `${LV[lv]} 승급 평가`, items: ALL.filter((w) => WD[w].lv === lv) });
    });
    STAGES.forEach((s, i) => (s.id = 's' + i));
    STOF = {};
    STAGES.forEach((s) => { if (s.kind === 'unit') s.items.forEach((c) => (STOF[c] = s.id)); });
    const items = Object.fromEntries(ALL.map((w) => [w, { t: w }]));
    return { key: 'all', stages: STAGES, items, all: ALL, stof: STOF };
  },
  /* 프로토타입 resolve */
  pickQtype: (src, d, rng, _item, _T, s) => {
    if (src === 'exam') return pick(['m', 'k', 'k', 'b', 's', 'm'], rng);
    if (src === 'new') { const hard = s && spellOK(s.items[0]) ? ['b', 's', 'l', 'b'] : ['b', 'l', 'k', 'b']; return d < 3 ? 'm' : d < 6 ? 'k' : pick(hard, rng); }
    return pick(['m', 'k', 'b', 's'], rng);
  },
  makeQ,
  infoHTML,
  cardLine: (_T, w) => `<span class="en">${esc(w)}</span> <span class="ansv">${esc(WD[w].ko)}</span>`,
  worstLine: (_T, h) => `<b class="en">${esc(h)}</b> ${esc(WD[h].ko)}`,
  worstTitle: '많이 틀리는 단어',
  conceptIntro: (_T, s) => `<span class="lk">${s.g} · ${s.n}단원 · ${theme(s)}</span><h2>이번에 배울 단어 ${s.items.length}개</h2><p class="soft">한 단어씩 넘기며 뜻, 발음, 예문, 함께 익힐 단어를 봐요. ${LI('volume-2', 'inl')}를 누르면 발음을 들을 수 있어요.</p>
      <div class="wgrid">${s.items.map((c, k) => `<button data-j="${k + 1}" aria-label="${esc(c)} 발음 듣기"><b class="en">${esc(c)}</b><small>${esc(ko1(c))}</small></button>`).join('')}</div>`,
  conceptEnd: (s, gate, cap) => `<span class="lk">기억할 점</span><h2>소리 내어 읽고, 예문으로 기억해요</h2><p>단어만 외우기보다 발음을 듣고 따라 읽고, 예문 속에서 어떻게 쓰이는지 함께 보면 오래 기억돼요.</p><p class="soft">${gate ? `이 단원은 ${cap}개를 틀리면 처음부터 다시 해요. 이제 문제를 풀어요. 뜻 고르기부터, 잘 맞히면 단어 고르기 → 예문 빈칸·듣고 고르기로 올라가요${spellOK(s.items[0]) ? '(철자 쓰기도 나와요)' : ''}. 어려운 단계에서 연속 ${RULES.GOAL}문제를 맞히면 다음 단원이에요. 통과한 단원은 3단원 뒤, 5단원 뒤에 다시 복습해요.` : '통과한 단원은 3단원 뒤, 5단원 뒤에 다시 복습해요. 틀린 문제는 오답노트에서 1·3·5일 뒤 다시 나와요.'}</p>`,
  examIntro: (s) => `<span class="lk">${s.area} ${s.items.length}단어</span><h2>${s.name}</h2>
      <p>${s.area} 단어 ${s.items.length}개 가운데 ${RULES.EXAM_N}문제가 무작위로 나와요. 뜻 고르기, 단어 고르기, 예문 빈칸${s.lvI >= 1 ? ', 철자 쓰기(중등 후반 단어)' : ''}가 섞여 있어요.</p>
      <p class="soft">${EXAM_PASS_N}개 이상 맞히면 다음 단계가 열려요. ${EXAM_CAP}개를 틀리면 평가가 끝나고, 틀린 단어를 오답노트로 복습한 뒤 다시 도전해요.</p>`,
  homeNote: '교육부 2022 개정 영어과 교육과정 기본 어휘 3,000개(초등 800 · 중등 1,200 · 고등 1,000)를 주제별 10단어씩 묶었어요. 단계마다 가장 많이 쓰는 절반(필수 핵심)을 먼저 배우고, 나머지를 이어서 배워요. 철자 쓰기(키보드 입력)는 중등 61단원부터 나와요. 한 단원에서 정해진 개수(초등 5 · 중등 6 · 고등 7개)를 틀리면 그 단원을 처음부터 다시 해요. 통과한 단원은 3단원 뒤, 5단원 뒤에 다시 복습해요.',
  listSub: () => '교육과정 기본 어휘 · 초등 → 중등 → 고등',
  conceptName: '단원 소개',
  appName: '영단어하루',
  tabName: '영단어',
  slideKind: 'eng',
  slideFace,
  slideCard,
  speak: (t) => speak(t),
  ui: {
    ...DEFAULT_UI,
    intro: '단원 소개',
    qIcon: '소개',
    thing: '단어',
    autoNo: 2500,
    okDelay: 900,
    boardCls: 'board',
    okMore: '정답이에요! 더 알아봐요',
    showYou: true,
    statTitle: '단계별 정답률',
    todayText: (kid) => `${kid}의 학습`,
    homeBtn: () => '영단어로',
    learned: (T, stage) => `익힌 단어 ${T.stages.slice(0, stage).filter((s) => s.kind === 'unit').reduce((a, s) => a + s.items.length, 0).toLocaleString()} / 3,000개`,
    unitTitle: (s) => (s.kind === 'exam' ? s.name : `${s.n}단원 ${s.raw?.core ? '<span class="corebadge">필수 핵심</span>' : ''}${theme(s)} <span class="pv en">${esc(preview(s))}</span>`),
    nowTitle: (s) => (s.kind === 'exam' ? `<b>${s.name}</b>` : `<b>${s.name} ${theme(s)}</b><span class="pv en">${esc(preview(s))}</span>`),
    lockedSub: (s) => `${s.items.length}단어`,
    examSub: (s) => `${s.items.length}단어에서 ${RULES.EXAM_N}문제`,
    examStreak: () => `${RULES.EXAM_N}문제 중 ${EXAM_PASS_N}개 이상 맞히면 다음 단계 · ${EXAM_CAP}개 틀리면 종료`,
    fbAns: (q) => `<b class="${q.sc === 'en' ? 'en' : ''}">${esc(q.answer)}</b>`,
    onShow: (q) => { if (q.auto) setTimeout(() => speak(q.auto!), 250); },
    onAnswer: (q, ok) => { if (ok) speak(WD[q.item].w); },
    stepFirst: '한눈에',
    stepLabel: (_T, id) => id,
    stepHz: false,
    conceptShow: (id) => speak(id),
    conceptGrid: (id) => speak(id),
    conceptTrace: () => penOn(),
    traceKind: 'ink',
    writeToggle: { get: () => penGet(), set: (on) => penSet(on), label: '펜으로 쓰기', small: '철자 문제를 손으로 쓰고 확인 · 단어 따라 쓰기', inSection: true },
    pen: () => penOn(),
    traceLabel: (id) => WD[id]?.ko ?? '',
  },
};
