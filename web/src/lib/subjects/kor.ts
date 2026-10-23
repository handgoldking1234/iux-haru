/* 국어 — prototype/build/kor.js의 갈래·문제·카드 부분을 그대로 옮김.
   어휘(vc)·수업(kr)·섞어서(mix). 맞춤법 낱말은 '바른 표기 고르기', 단원마다 객관식 문항이 섞인다 */
import { pick, shuffle } from '../engine/choices';
import { EXAM_CAP, EXAM_PASS_N, RULES } from '../engine/rules';
import { esc, termQ } from './termq';
import type { PQ, SStage, SubjectDef, Track } from './types';

const LV = ['초등', '중등', '고등'];
const TRN: Record<string, string> = { mix: '섞어서 (추천)', vc: '어휘', kr: '수업' };
const MCLV = ['', '쉬움', '보통', '어려움'];

interface KMc { q: string; p?: string; c: string[]; a: number; e: string; lv: number }
interface KUnit { lv: number; n: number; title: string; tag?: string; era: string; sum: string; pr?: { h: string; b: string }[]; pre?: string; items: { t: string; d: string; k: string; ex?: string; w?: string[]; y: null; yl: string }[]; mc?: KMc[] }
type KItem = { id: string; ui: number; unit: KUnit; mc?: boolean; t: string; d: string; k: string; ex?: string; w?: string[]; yl: string; y: null } & Partial<KMc>;
const IT = (T: Track, id: string) => T.items[id] as unknown as KItem;

/** 섞어서·영역 갈래 공통: 단원 목록 → 학습 길 (lv가 바뀌는 곳에 승급 평가) */
export function setupTerms(units: KUnit[], TR: string, examName: (lv: string) => string, extra?: (u: KUnit, s: SStage) => void): Track {
  const items: Record<string, KItem> = {}, stages: SStage[] = [];
  units.forEach((u, ui) => {
    const ids = u.items.map((x, k) => { const id = `${TR}${ui}_${k}`; items[id] = { ...x, id, ui, unit: u }; return id; });
    /* 객관식(문제 은행형): 단원마다 lv1 쉬움 2 · lv2 보통 2 · lv3 어려움 1 */
    const mids = (u.mc || []).map((m, k) => { const id = `${TR}${ui}_m${k}`; items[id] = { ...m, id, ui, unit: u, mc: true, t: m.q, yl: '', k: '객관식', d: m.e, y: null }; return id; });
    const s: SStage = { id: '', kind: 'unit', lvI: u.lv, area: LV[u.lv], g: LV[u.lv], n: u.n, title: u.title, tag: u.tag, era: u.era, sum: u.sum, name: `${LV[u.lv]} ${u.n}단원`, items: ids, mcs: mids };
    extra?.(u, s);
    stages.push(s);
    const nx = units[ui + 1];
    if (!nx || nx.lv !== u.lv) stages.push({ id: '', kind: 'exam', lvI: u.lv, area: LV[u.lv], g: LV[u.lv], name: examName(LV[u.lv]), items: [] });
  });
  stages.forEach((s, i) => {
    s.id = 's' + i;
    if (s.kind === 'exam') { const us = stages.filter((x) => x.kind === 'unit' && x.lvI === s.lvI); s.items = us.flatMap((x) => x.items); s.mcs = us.flatMap((x) => x.mcs || []); }
  });
  const stof: Record<string, string> = {};
  stages.forEach((s) => { if (s.kind === 'unit') [...s.items, ...(s.mcs || [])].forEach((c) => (stof[c] = s.id)); });
  return { key: TR, stages, items: items as unknown as Track['items'], all: Object.keys(items).filter((k) => !items[k].mc), stof };
}

export const mcPass = (x: { p?: string }) => (x.p ? `<span class="mcp">${esc(x.p).replace(/\[\[(.+?)\]\]/g, '<u>$1</u>')}</span>` : '');

/** 객관식 문제 */
export function mcQ(T: Track, id: string, rng: () => number): PQ {
  const x = IT(T, id);
  return { item: id, qtype: 'mc', ask: `객관식 · ${MCLV[x.lv!] || ''}`, q: `<span class="dq">${esc(x.q)}</span>${mcPass(x)}`, qc: 'txt', hint: '', choices: shuffle(x.c!, rng), answer: x.c![x.a!], long: x.c!.some((v) => v.length > 9) };
}

/** 객관식 문항을 대신 낼지 (프로토타입 resolve mcOf) */
export function mcAlt(T: Track, src: 'new' | 'review' | 'exam', s: SStage, d: number, rng: () => number, recent: string[]) {
  const mcOf = (lvs: number[], prob: number) => {
    const ms = (s.mcs || []).filter((m) => lvs.includes(IT(T, m).lv!) && !recent.includes(m));
    if (!ms.length || rng() >= prob) return null;
    return pick(ms, rng);
  };
  const m = src === 'new' ? (d < 3 ? null : d < 6 ? mcOf([1], 0.35) : mcOf([2, 3, 1], 0.55)) : mcOf([1, 2, 3], 0.4);
  return m ? { item: m, qtype: 'mc' } : null;
}

function makeQ(T: Track, id: string, t0: string, rng: () => number): PQ {
  const x = IT(T, id);
  if (x.mc) return mcQ(T, id, rng);
  let t = t0;
  if (t === 'sp' && !(x.w && x.w.length)) t = 'dt';
  if (t === 'sp') return { item: id, qtype: t, ask: '바르게 쓴 것은?', q: `<span class="dq">${esc(x.d)}</span>`, qc: 'txt', hint: '', choices: shuffle([x.t, ...x.w!.slice(0, 3)], rng), answer: x.t, long: x.t.length > 12 };
  if (t === 'ord' || t === 'yr') t = 'dt';
  return termQ(T, id, t, rng, '');
}

function infoHTML(T: Track, id: string) {
  const x = IT(T, id), u = x.unit, mates = u.items.filter((y) => y.t !== x.t).slice(0, 9);
  if (x.mc) return `<div class="info"><div class="ihun"><span class="lk">${esc(u.title)} · 객관식 ${MCLV[x.lv!] || ''}</span><b class="mcqt">${esc(x.q)}</b>${mcPass(x)}</div>
    <div class="org"><span class="ok">정답</span><p><b>${esc(x.c![x.a!])}</b></p><small class="exl">${esc(x.e)}</small></div></div>`;
  return `<div class="info">
    <div class="ihun"><span class="lk">${esc(u.title)}</span><b class="term">${esc(x.t)}</b>
      <div class="meta"><span>${x.k}</span><span>${LV[u.lv]}</span>${u.tag ? `<span>${u.tag}</span>` : ''}</div></div>
    <div class="org"><span class="ok">뜻 · 규칙</span><p>${esc(x.d)}</p>${x.ex ? `<small class="exl">예) ${esc(x.ex)}</small>` : ''}</div>
    ${x.w && x.w.length ? `<div class="wl"><span class="lk">이렇게 쓰면 틀려요</span><div class="ders">${x.w.map((v) => `<span class="xw">✕ ${esc(v)}</span>`).join('')}<span class="ow">○ ${esc(x.t)}</span></div></div>` : ''}
    <div class="wl"><span class="lk">같은 단원에서 함께 익힐 말</span><div class="ders">${mates.map((y) => `<span>${esc(y.t)}</span>`).join('')}</div></div>
  </div>`;
}

export const cardLineMc = (T: Track, id: string) => {
  const x = IT(T, id);
  return x.mc ? `${esc(x.q!.length > 28 ? x.q!.slice(0, 28) + '…' : x.q)} <span class="ansv">${esc(x.c![x.a!])}</span>` : `${esc(x.t)} <span class="ansv">${esc(x.yl)}</span>`;
};

export const KOR: SubjectDef = {
  key: 'kor',
  tracks: TRN,
  defaultTrack: 'mix',
  areas: LV,
  tname: { dt: '낱말 고르기', td: '뜻 고르기', ox: 'OX 퀴즈', sp: '바른 표기 고르기', mc: '객관식', ord: '순서', yr: '연도' },
  setup: (data, tr) => {
    const HD = data as Record<string, { units: KUnit[] }>;
    const TR = HD[tr] && TRN[tr] ? tr : 'mix';
    return setupTerms(HD[TR].units, TR, (lv) => `국어 ${lv} 승급 평가`);
  },
  /* 프로토타입 resolve: 맞춤법 낱말(w가 있음)은 바른 표기 고르기 위주 */
  pickQtype: (src, d, rng, item, T) => {
    const x = item ? IT(T, item) : null;
    if (x?.mc) return 'mc';
    const sp = !!x?.w;
    if (src === 'exam') return x?.w ? pick(['sp', 'sp', 'dt'], rng) : pick(['dt', 'td', 'dt', 'ox'], rng);
    if (src === 'new') return d < 3 ? (sp ? 'sp' : 'dt') : d < 6 ? (sp ? pick(['sp', 'dt'], rng) : 'td') : pick(sp ? ['sp', 'ox', 'dt'] : ['ox', 'dt', 'td', 'td'], rng);
    return pick(sp ? ['sp', 'dt'] : ['dt', 'td', 'ox'], rng);
  },
  altItem: (T, src, s, d, rng, recent) => (src === 'exam' ? null : mcAlt(T, src, s, d, rng, recent)),
  examPool: (s) => [...s.items, ...(s.mcs || [])],
  makeQ,
  infoHTML,
  cardLine: cardLineMc,
  worstLine: (T, id) => `<b>${esc(IT(T, id).t)}</b> ${esc(IT(T, id).yl)}`,
  worstTitle: '많이 틀리는 용어',
  conceptIntro: (T, s, trName) => {
    const u = IT(T, s.items[0]).unit;
    return `<span class="lk">${trName} ${s.g} · ${s.n}단원 · ${esc(s.era)}</span><h2>${esc(s.title)}</h2><p class="sum">${esc(s.sum)}</p>
      <div class="wl"><span class="lk">이번 단원 낱말</span><div class="ders">${u.items.map((y) => `<span>${esc(y.t)}</span>`).join('')}</div></div>`;
  },
  conceptEnd: (s, gate, cap) => `<span class="lk">기억할 점</span><h2>규칙과 예문으로 기억해요</h2><p>규칙을 먼저 이해하고, 예문 속에서 직접 써 보면 오래 기억돼요. 헷갈리는 말은 짝을 지어 비교해 보세요.</p><p class="soft">${gate ? `이 단원은 ${cap}개를 틀리면 처음부터 다시 해요. 이제 문제를 풀어요. 뜻 보고 낱말 고르기(맞춤법은 바른 표기 고르기)부터, 잘 맞히면 낱말 보고 뜻 고르기와 쉬운 객관식 → 시험형 객관식(보통·어려움)과 OX로 올라가요. 어려운 단계에서 연속 ${RULES.GOAL}문제를 맞히면 다음 단원이에요.` : '통과한 단원은 3단원 뒤, 5단원 뒤에 다시 복습해요. 틀린 문제는 오답노트에서 1·3·5일 뒤 다시 나와요.'}</p>`,
  examIntro: (s, trName) => `<span class="lk">${trName} ${s.area} · 용어 ${s.items.length}개</span><h2>${s.name}</h2>
      <p>${trName} ${s.area} 단원의 낱말 ${s.items.length}개와 객관식 ${(s.mcs || []).length}문제 가운데 ${RULES.EXAM_N}문제가 무작위로 나와요.</p>
      <p class="soft">${EXAM_PASS_N}개 이상 맞히면 다음 학교급이 열려요. ${EXAM_CAP}개를 틀리면 평가가 끝나고, 틀린 용어를 오답노트로 복습한 뒤 다시 도전해요.</p>`,
  homeNote: "섞어서(추천)는 학교급마다 어휘 단원과 수업 단원(맞춤법·문법·문학)이 번갈아 나오고, 쉬운 어휘부터 시작해요. 어휘·수업만 따로 공부할 수도 있어요(갈래마다 진도 따로). 단원 안에서는 낱말 고르기 → 뜻 고르기·쉬운 객관식 → 시험형 객관식 순으로 올라가요. 한 단원에서 정해진 개수(초등 5 · 중등 6 · 고등 7개)를 틀리면 그 단원을 처음부터 다시 해요. 통과한 단원은 3단원 뒤, 5단원 뒤에 다시 복습해요. 잠긴 단원도 '개념'으로 미리 볼 수 있어요.",
  listSub: (tr) => `${tr} · 초등 → 중등 → 고등`,
  conceptName: '개념 정리',
  appName: '국어하루',
  tabName: '국어',
  trkClass: 'trk tl3',
};
