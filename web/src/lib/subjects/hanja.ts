/* 한자 — 학교 필수 · 급수별 · 천자문. 데이터·문제·카드는 hanjaCore.js(app.js 그대로), 여기서는 공통 화면에 맞춰 잇기만 한다 */
import { pick } from '../engine/choices';
import { EXAM_CAP, EXAM_PASS_N, RULES } from '../engine/rules';
import { LI } from '../protoIcons';
import { chips, type Face } from '../slide';
import { createHanjaCore } from './hanjaCore';
import { PIC } from './hanjaPics';
import { DEFAULT_UI } from './ui';
import type { PQ, SStage, SubjectDef, Track } from './types';

// hanjaCore.js는 프로토타입 코드 그대로라 타입이 없다
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Core = any;
type RawStage = { kind: 'rad' | 'char' | 'exam'; area: string; g: string; n?: number; theme?: string; name: string; chars: string[]; ph?: number[]; cjm?: boolean; title?: string; lvI: number; id: string };

/** 획순 데이터 (처음 쓰기 문제가 나올 때 불러옴) */
let SK: Record<string, { strokes: string[] }> | null = null;
let skLoading: Promise<void> | null = null;
export function loadStrokes() {
  return (skLoading ??= fetch('/content/strokes.json').then((r) => r.json()).then((d) => { SK = d; }));
}
export const strokeData = () => SK;

/** 쓰기 문제 넣기 설정 (마이 > 설정의 '한자 쓰기 문제 넣기'와 같은 값) */
let writeGet: () => boolean = () => true;
let writeSet: (on: boolean) => void = () => {};
export function bindHanjaWrite(get: () => boolean, set: (on: boolean) => void) { writeGet = get; writeSet = set; }

let core: Core | null = null;
let coreData: unknown = null;
const C = (data: unknown) => {
  if (!core || coreData !== data) {
    core = createHanjaCore(data, { SK: () => SK, writeOn: () => writeGet(), setWrite: (on: boolean) => writeSet(on), LI, PIC });
    coreData = data;
  }
  return core;
};
let maxLv = 0;
const raw = (s: SStage) => s.raw as unknown as RawStage;

function setup(data: unknown, tr: string): Track {
  const H = C(data);
  H.buildTrack(tr);
  const items: Record<string, { t: string }> = {};
  const stages: SStage[] = H.STAGES.map((r: RawStage) => {
    r.chars.forEach((c) => (items[c] = { t: c }));
    (r.ph || []).forEach((i) => (items['P' + i] = { t: H.PH[i].p }));
    return { id: r.id, kind: r.kind === 'exam' ? 'exam' : 'unit', area: r.area, g: r.g, n: r.n, lvI: r.lvI ?? 0, name: r.name, title: r.title, items: r.chars, raw: r as unknown as Record<string, unknown> };
  });
  const stof: Record<string, string> = { ...H.STOF, ...H.RSTOF };
  return { key: H.TRK, stages, items, all: Object.keys(items), stof };
}

/** 프로토타입 resolve의 유형 고르기 */
function pickQtype(src: 'new' | 'review' | 'exam', d: number, rng: () => number, h: string | undefined, _T: Track, s?: SStage): string {
  const H = core!;
  if (src === 'exam') return s && s.area === '부수' ? pick(['rh', 'rs', 'rc'], rng) : pick(['e', 'e', 'w', 'h', 'r'], rng);
  if (s && raw(s).kind === 'rad') return d < 3 ? 'rh' : d < 6 ? 'rs' : pick(['rc', 'rc', 'rh', 'rs'], rng);
  if (h && H.writeOn() && H.canWrite(h) && d >= 3 && rng() < (src === 'new' ? 0.22 : 0.15)) return src === 'new' && d < 6 ? 'wrt' : 'wr';
  return src === 'new' ? (d < 3 ? 'he' : d < 6 ? 'e' : pick(['w', 'h', 'e', 'w', 'r'], rng)) : pick(['e', 'e', 'w', 'h', 'r'], rng);
}

/** 천자문 단원은 45%로 구절 문제 */
function altItem(_T: Track, src: 'new' | 'review' | 'exam', s: SStage, d: number, rng: () => number) {
  const ph = raw(s).ph;
  if (!ph || !ph.length || rng() >= 0.45) return null;
  const i = pick(ph, rng);
  const t = src === 'exam' ? pick(['pm', 'pb', 'pn', 'pr'], rng) : d < 3 ? 'pm' : d < 6 ? pick(['pm', 'pr', 'pb'], rng) : pick(['pb', 'pn', 'pm', 'pr'], rng);
  return { item: 'P' + i, qtype: t };
}

function makeQ(_T: Track, item: string, qtype: string, _rng: () => number, extra?: Record<string, unknown>): PQ {
  const H = core!;
  const write = qtype === 'wr' || qtype === 'wrt';
  const spec = write ? { ch: item, t: 'wr', trace: qtype === 'wrt' } : { ch: item, t: qtype, w: extra?.w, x: extra?.x };
  let q = H.makeQ(spec, maxLv);
  if (write && !q.write) q = H.makeQ({ ch: item, t: 'e' }, maxLv);
  const lab = q.lab === H.radLab ? (v: string) => H.radLab(v) : q.lab ? (v: string) => String(v) : undefined;
  const ex: Record<string, unknown> = {};
  if (q.w) ex.w = q.w;
  if (q.x != null) ex.x = q.x;
  return {
    item, qtype: q.write ? (q.trace ? 'wrt' : 'wr') : q.t, ask: q.ask, q: q.q, qc: q.qc, hint: q.hint || '',
    choices: q.choices, answer: q.ans, lab, write: q.write ? { trace: !!q.trace } : undefined, extra: Object.keys(ex).length ? ex : undefined,
  };
}

function cardLine(T: Track, h: string, c?: { qtype: string; extra?: Record<string, unknown> }) {
  const H = core!, t = c?.qtype ?? '', x = c?.extra?.x as string | undefined, w = c?.extra?.w as string | undefined;
  if (String(h)[0] === 'P' && H.PH.length) { const p = H.PH[+h.slice(1)]; return `<span class="hz">${p.p}</span> <span class="ansv">${p.r} · ${p.m}</span>`; }
  if (t === 'rh' || t === 'rs') return `<span class="hz">${h}</span> <span class="ansv">${H.radHun(h)}</span>`;
  if (t === 'rc' && x) return `<span class="hz">${x}</span> 부수 <span class="ansv"><span class="hz">${h}</span> ${H.radHun(h)}</span>`;
  if (t === 'r') return `<span class="hz">${h}</span> 부수 <span class="ansv"><span class="hz">${H.CH[h].rad}</span> ${H.radHun(H.CH[h].rad)}</span>`;
  const ww = t === 'w' && w ? H.wordsOf(h).find((y: { w: string }) => y.w === w) : null;
  return ww ? `<span class="hz">${ww.w}</span> <span class="ansv">${ww.r}</span>` : `<span class="hz">${h}</span> <span class="ansv">${H.hunum(h)}</span>`;
}

/* 개념(단원 소개) 첫 장 · 마지막 장 — app.js concept() 그대로 */
function conceptIntro(_T: Track, s: SStage) {
  const H = core!, r = raw(s), isRad = r.kind === 'rad', n = s.items.length;
  const lab = (c: string) => (isRad ? H.radHun(c) : H.hunum(c));
  const grid = `<div class="grid10">${s.items.map((c, k) => `<button data-j="${k + 1}"><b class="hz">${c}</b><small>${lab(c)}</small></button>`).join('')}</div>`;
  if (r.cjm) return `<span class="lk">천자문 ${s.g} · ${H.esc0(r.title)} · ${s.n}단원</span><h2>이번에 배울 구절 ${r.ph!.length}개 · 한자 ${n}자</h2><p class="soft">네 글자씩 한 구절이에요. 구절의 뜻을 먼저 알고, 한 글자씩 넘기며 뜻과 음을 익혀요. 소리 내어 읽으면 더 잘 외워져요.</p>
      <div class="cjlist">${r.ph!.map((k) => `<div class="cjone"><b class="hz">${H.PH[k].p}</b><span class="cjr">${H.PH[k].r}</span><small>${H.PH[k].m}</small>${H.PH[k].x ? `<em>${H.PH[k].x}</em>` : ''}</div>`).join('')}</div>
      ${grid}`;
  return `<span class="lk">${s.g} · ${s.n}단원${isRad ? ' · ' + r.theme : ''}</span><h2>이번에 배울 ${isRad ? '부수' : '한자'} ${n}자</h2><p class="soft">${isRad ? '부수는 한자를 이루는 부품이에요. 부수를 알면 처음 보는 한자도 뜻을 짐작할 수 있어요. 모양, 이름, 바뀐 모양(변형)과 이 부수가 들어간 한자를 익혀요.' : '한 글자씩 넘기며 뜻과 음, 글자가 만들어진 원리, 자주 쓰는 단어를 익혀요.'}</p>
      ${grid}`;
}
function conceptEnd(s: SStage, gate: boolean, cap: number) {
  const H = core!, isRad = raw(s).kind === 'rad', G = RULES.GOAL;
  return isRad
    ? `<span class="lk">기억할 점</span><h2>부수는 뜻의 갈래를 알려 줘요</h2><p>氵가 있으면 물, 木이 있으면 나무, 言이 있으면 말과 관련 있는 글자예요. 바뀐 모양(변형)도 함께 기억해요.</p><p class="soft">${gate ? `이 단원은 ${cap}개를 틀리면 처음부터 다시 해요. 이제 문제를 풀어요. 부수 이름 맞히기 → 부수 모양 고르기 → 한자 속 부수 찾기로 올라가요. 연속 ${G}문제를 맞히면 다음 단원, 부수 6단원을 마치면 부수 확인 평가가 열려요.` : '통과한 단원은 3단원 뒤, 5단원 뒤에 다시 복습해요.'}</p>`
    : `<span class="lk">기억할 점</span><h2>뜻과 음을 함께 소리 내어 읽어요</h2><p>"${s.items.slice(0, 3).map(H.hunum).join(', ')}…"처럼 뜻과 음을 붙여 읽으면 시험의 훈음 문제와 독음 문제를 한 번에 준비할 수 있어요.</p><p class="soft">${gate ? `이 단원은 ${cap}개를 틀리면 처음부터 다시 해요. 이제 문제를 풀어요. 뜻 힌트가 있는 음 맞히기부터, 잘 맞히면 힌트 없는 음 맞히기 → 한자어 읽기·한자 고르기·부수 찾기로 올라가요. 어려운 단계에서 연속 ${G}문제를 맞히면 다음 단원으로 넘어가요. 통과한 단원은 3단원 뒤, 5단원 뒤에 다시 복습해요.` : '통과한 단원은 3단원 뒤, 5단원 뒤에 다시 복습해요. 틀린 문제는 오답노트에서 1·3·5일 뒤 다시 나와요.'}</p>`;
}
function examIntro(s: SStage) {
  const r = raw(s), radA = s.area === '부수';
  return `<span class="lk">${radA ? '부수 60자' : r.cjm ? '천자문 ' + s.area + ' · 구절 ' + r.ph!.length + '개 · ' + s.items.length + '자' : s.area + ' ' + s.items.length + '자'}</span><h2>${s.name}</h2>
      <p>${radA ? '부수 6단원에서 배운 60개 부수' : `${s.area}의 한자 ${s.items.length}자`} 가운데 ${RULES.EXAM_N}문제가 무작위로 나와요.</p>
      <p class="soft">${EXAM_PASS_N}개 이상 맞히면 ${radA ? '8급 1단원' : '다음 급수'}이 열려요. 못 미치면 틀린 문제를 오답노트로 복습하고 다시 도전해요.</p>`;
}

/* 슬라이드 카드 — slide.js KIND 'han' */
function slideFace(_T: Track, id: string): Face | null {
  const H = core!;
  if (String(id)[0] === 'P') { const x = H.PH[+String(id).slice(1)]; if (!x) return null; return { id, f: x.p, fs: x.r, fl: 'ko-KR', sub: x.r, b: x.m, bs: x.m, cls: 'hz ph', dq: x.r, dl: 'ko-KR', ans: x.p }; }
  const c = H.CH[id]; const hn = c ? `${c.hun} ${c.eum}` : H.radHun(id);
  if (!hn) return null;
  return { id, f: id, fs: hn, fl: 'ko-KR', sub: '', b: hn, bs: '', cls: 'hz', dq: hn, dl: 'ko-KR', ans: id };
}
function slideCard(_T: Track, id: string) {
  const H = core!, esc = H.esc0;
  if (String(id)[0] === 'P') {
    const x = H.PH[+String(id).slice(1)];
    return `<div class="sc-top"><button class="sc-w hz ph" data-a="sayf">${esc(x.p)}</button><div class="sc-tag"><span>${esc(x.r)}</span></div><div class="sc-m">${esc(x.m)}</div></div>
      ${x.x ? `<div class="sc-bx"><i>풀이</i><p class="c4">${esc(x.x)}</p></div>` : ''}
      <div class="sc-hg">${Array.from(x.p as string).map((c, k) => `<span><b class="hz">${c}</b><small>${esc(x.h[k] || '')}</small></span>`).join('')}</div>`;
  }
  const c = H.CH[id], f = slideFace(_T, id)!;
  const fig = () => { try { const g = H.figHTML(id); return g ? `<div class="sc-fig">${g}</div>` : ''; } catch { return ''; } };
  if (!c) {
    const R = H.RADI[id];
    return `<div class="sc-top"><button class="sc-w hz" data-a="sayf">${id}</button><div class="sc-tag"><span>부수</span>${R && R.nick ? `<span>${esc(R.nick)}</span>` : ''}</div><div class="sc-m">${esc(f.b)}</div></div>${fig()}${R && R.desc ? `<div class="sc-bx"><i>만들어진 원리</i><p class="c4">${esc(R.desc)}</p></div>` : ''}${chips('이 부수의 한자', (H.BYRAD[id] || []).slice(0, 5).map((z: string) => `<b class="hz">${z}</b>`))}`;
  }
  const o = H.origin(id), ws = H.wordsOf(id).slice(0, 3);
  return `<div class="sc-top"><button class="sc-w hz" data-a="sayf">${id}</button><div class="sc-tag">${c.cj ? '<span>천자문</span>' : `<span>${H.LV[c.lv]}</span><span>부수 <b class="hz">${c.rad}</b></span><span>${c.st}획</span>`}</div><div class="sc-m">${esc(c.hun)} <em>${esc(c.eum)}</em></div></div>
        ${fig()}
        <div class="sc-bx"><i>${o.k}</i><p class="c3">${o.t}</p></div>
        ${ws.length ? `<div class="sc-ws">${ws.map((w: { cs: string[]; r: string }) => `<span><b class="hz">${w.cs.map((z) => (z === id ? `<u>${z}</u>` : z)).join('')}</b>${esc(w.r)}<small>${esc(H.gloss(w))}</small></span>`).join('')}</div>` : ''}`;
}

export const HANJA: SubjectDef = {
  key: 'hanja',
  tracks: { school: '학교 필수', grade: '급수별', cjm: '천자문' },
  defaultTrack: 'school',
  get areas() { return core ? core.AREAS : ['부수']; },
  get tname() { return { ...(core?.TNAME ?? {}), wrt: '한자 쓰기' }; },
  setup,
  pickQtype,
  altItem: (T, src, s, d, rng) => altItem(T, src, s, d, rng),
  prepare: (_T, cur) => { maxLv = raw(cur).kind === 'rad' ? 0 : cur.lvI; },
  makeQ,
  infoHTML: (_T, id) => core!.infoOf(id, ''),
  cardLine: (T, id) => cardLine(T, id),
  worstLine: (_T, h) => `<b class="hz">${h}</b> ${core!.hunum(h)}`,
  worstTitle: '많이 틀리는 한자',
  conceptIntro: (T, s) => conceptIntro(T, s),
  conceptEnd,
  examIntro,
  get homeNote() {
    const school = core?.TRK === 'school';
    return `${school ? '학교 필수: 초등은 한국어문회 8~6급 300자, 중등·고등은 교육부 한문 교육용 기초 한자 1,800자(중등은 그중 5급Ⅱ~4급, 고등은 3급Ⅱ~2급)예요. ' : ''}한 단원에서 정해진 개수(부수~7급·초등 5개 · 6급Ⅱ~5급·중등 6개 · 4급Ⅱ~3급·고등 7개 · 2급·1급 8개)를 틀리면 그 단원을 소개부터 처음부터 다시 해요. 승급 평가는 ${EXAM_CAP}개 틀리면 종료돼요. 통과한 단원은 3단원 뒤, 5단원 뒤에 다시 복습해요. 틀린 문제는 오답노트에서 1·3·5일 뒤 다시 나와요.`;
  },
  listSub: () => (core?.TRK === 'cjm' ? '1부 → 5부 · 250구절' : core?.TRK === 'school' ? '초 → 중 → 고' : '부수 → 8급 → … → 1급'),
  conceptName: '단원 소개',
  appName: '한자씨앗',
  tabName: '한자학습',
  trkClass: 'trk tl3',
  slideKind: 'han',
  slideFace,
  slideCard,
  slideUnit: (s) => [...(raw(s).ph || []).map((i) => 'P' + i), ...s.items],
  cardLineFull: (T, id, c) => cardLine(T, id, c),
  ui: {
    ...DEFAULT_UI,
    intro: '단원 소개',
    qIcon: '소개',
    thing: '한자',
    autoNo: 2500,
    boardCls: 'board',
    ptagWrong: true,
    okMore: '정답이에요! 더 알아봐요',
    showYou: true,
    statTitle: '급수별 정답률',
    todayText: (kid) => `${kid}의 학습`,
    homeBtn: () => '한자학습으로',
    learned: (T, stage) => {
      const H = core!, done = T.stages.slice(0, stage);
      const learned = done.filter((s) => raw(s).kind === 'char').reduce((a, s) => a + s.items.length, 0);
      if (H.TRK === 'cjm') return `구절 ${done.filter((s) => raw(s).kind === 'char').reduce((a, s) => a + (raw(s).ph?.length ?? 0), 0)}/250 · 한자 ${learned.toLocaleString()}/1,000자`;
      return `부수 ${done.filter((s) => raw(s).kind === 'rad').reduce((a, s) => a + s.items.length, 0)}/60 · 한자 ${learned.toLocaleString()}/3,500자`;
    },
    unitTitle: (s) => (s.kind === 'exam' ? s.name : raw(s).kind === 'rad' ? `${s.n}단원 ${raw(s).theme} <span class="hz pv">${s.items.join('')}</span>` : `${s.n}단원 <span class="hz pv">${s.items.join('')}</span>`),
    nowTitle: (s) => `<b>${s.kind === 'exam' ? s.name : `${s.name}${raw(s).kind === 'rad' ? ' ' + raw(s).theme : ''}`} ${s.kind !== 'exam' ? `<span class="hz pv">${s.items.join('')}</span>` : ''}</b>`,
    lockedSub: (s) => `${s.items.length}자`,
    examSub: (s) => `${s.items.length}자에서 ${RULES.EXAM_N}문제`,
    examStreak: (s) => `${RULES.EXAM_N}문제 중 ${EXAM_PASS_N}개 이상 맞히면 ${s.area === '부수' ? '8급 시작' : '다음 급수'} · ${EXAM_CAP}개 틀리면 종료`,
    homeAfter: () => {
      const H = core!;
      if (H.TRK !== 'cjm') return '';
      return `<details class="cjabout"><summary>${LI('book-open')}천자문은 어떤 책일까요?</summary><p>${H.esc0(H.CJ.intro)}</p><ol>${H.CJ.parts.map((x: { name: string; title: string; from: number; to: number }) => `<li><b>${x.name}</b> ${H.esc0(x.title)} <small>${x.from}~${x.to}구절</small></li>`).join('')}</ol></details>`;
    },
    afterInfo: (_T, q) => {
      const H = core!, x = q.extra?.x as string | undefined;
      return `${q.qtype === 'rc' && x && H.CH[x] ? H.infoHTML(x) : ''}${H.infoOf(q.item, q.qtype)}`;
    },
    statArea: (_T, q, s) => {
      const H = core!, t = q.qtype;
      if (t === 'rh' || t === 'rs' || t === 'rc') return '부수';
      const st = H.STAGES[H.IDX[H.STOF[q.item]]] as RawStage | undefined;
      if (String(q.item)[0] === 'P' || H.TRK === 'cjm') return st?.area ?? '천자문';
      return H.TRK === 'school' ? st?.area ?? H.LV[H.CH[q.item].lv] : H.LV[H.CH[q.item]?.lv] ?? s.area;
    },
    conceptItem: (_T, s, id) => (raw(s).kind === 'rad' ? core!.radInfoHTML(id) : core!.infoHTML(id)),
    stepFirst: '한눈에',
    stepLabel: (_T, id) => id,
    stepHz: true,
    conceptTrace: (id) => core!.writeOn() && core!.canWrite(id),
    writeToggle: { get: () => writeGet(), set: (on) => writeSet(on), label: '한자 쓰기 문제 넣기', small: '8급~5급 · 펜·손가락으로 획순대로' },
    traceKind: 'hanzi',
    traceLabel: (id) => core!.hunum(id),
    fbAns: (q) => (q.lab ? `<span class="hz">${q.lab(q.answer)}</span>` : q.answer),
  },
};
