/* 역사 — prototype/build/hist.js의 갈래·문제·카드 부분을 그대로 옮김 */
import { pick } from '../engine/choices';
import { esc, termQ } from './termq';
import { EXAM_CAP, EXAM_PASS_N, RULES } from '../engine/rules';
import type { PQ, SStage, SubjectDef, Track } from './types';

const LV = ['초등', '중등', '고등'];
const TRN: Record<string, string> = { ko: '국사', wo: '세계사' };

interface HItem { t: string; d: string; k: string; y: number | null; yl: string; id: string; ui: number; unit: HUnit }
interface HUnit { lv: number; n: number; title: string; era: string; sum: string; items: Omit<HItem, 'id' | 'ui' | 'unit'>[] }
type HData = Record<string, { units: HUnit[] }> & { TL?: unknown[] };

const IT = (T: Track, id: string) => T.items[id] as unknown as HItem;

function setup(data: unknown, tr: string): Track {
  const HD = data as HData;
  const TR = tr === 'ko' || tr === 'wo' ? tr : 'ko';
  const items: Record<string, HItem> = {}, stages: SStage[] = [];
  const units = HD[TR].units;
  units.forEach((u, ui) => {
    const ids = u.items.map((x, k) => { const id = `${TR}${ui}_${k}`; items[id] = { ...x, id, ui, unit: u }; return id; });
    stages.push({ id: '', kind: 'unit', lvI: u.lv, area: LV[u.lv], g: LV[u.lv], n: u.n, title: u.title, era: u.era, sum: u.sum, name: `${LV[u.lv]} ${u.n}단원`, items: ids });
    const nx = units[ui + 1];
    if (!nx || nx.lv !== u.lv) stages.push({ id: '', kind: 'exam', lvI: u.lv, area: LV[u.lv], g: LV[u.lv], name: `${TRN[TR]} ${LV[u.lv]} 승급 평가`, items: [] });
  });
  stages.forEach((s, i) => { s.id = 's' + i; if (s.kind === 'exam') s.items = stages.filter((x) => x.kind === 'unit' && x.lvI === s.lvI).flatMap((x) => x.items); });
  const stof: Record<string, string> = {};
  stages.forEach((s) => { if (s.kind === 'unit') s.items.forEach((c) => (stof[c] = s.id)); });
  return { key: TR, stages, items: items as unknown as Track['items'], all: Object.keys(items), stof };
}

/* 연표 정렬 키: 연도가 있으면 연도, '18세기'·'기원전 5세기'처럼 세기만 있으면 세기 중간값, 그 밖은 맨 뒤 */
function skey(x: HItem) {
  if (x.y != null) return x.y;
  const m = String(x.yl).match(/(기원전\s*)?(\d+)\s*세기/);
  if (m) { const c = +m[2]; return m[1] ? -(c - 1) * 100 - 50 : (c - 1) * 100 + 50; }
  const m2 = String(x.yl).match(/(기원전\s*)?(\d{3,4})\s*년/);
  if (m2) return m2[1] ? -m2[2] : +m2[2];
  return 1e9;
}
function timeline(T: Track, ui: number, hl: string | null) {
  const xs = T.all.filter((id) => IT(T, id).ui === ui).map((id) => IT(T, id)).sort((a, b) => skey(a) - skey(b));
  return `<ol class="tl">${xs.map((x) => `<li class="${x.id === hl ? 'on' : ''}"><span class="yl">${esc(x.yl)}</span><b>${esc(x.t)}</b></li>`).join('')}</ol>`;
}

function infoHTML(T: Track, id: string) {
  const x = IT(T, id), u = x.unit;
  return `<div class="info">
    <div class="ihun"><span class="lk">${esc(u.title)}</span><b class="term">${esc(x.t)}</b>
      <div class="meta"><span>${esc(x.yl)}</span><span>${x.k}</span><span>${LV[u.lv]}</span></div></div>
    <div class="org"><span class="ok">설명</span><p>${esc(x.d)}</p></div>
    <div class="wl"><span class="lk">같은 단원 연표</span>${timeline(T, x.ui, id)}</div>
  </div>`;
}

const TNAME = { dt: '용어 고르기', td: '설명 고르기', ord: '시대 순서', yr: '연도 맞히기', ox: 'OX 퀴즈' };
const makeQ = (T: Track, id: string, t: string, rng: () => number): PQ => termQ(T, id, t, rng);

export const HIST: SubjectDef = {
  key: 'hist',
  tracks: TRN,
  defaultTrack: 'ko',
  areas: LV,
  tname: TNAME,
  setup,
  pickQtype: (src, bp, rng) =>
    src === 'new' ? (bp < 3 ? 'dt' : bp < 6 ? 'td' : pick(['ord', 'yr', 'ox', 'dt', 'td'], rng))
      : src === 'exam' ? pick(['dt', 'td', 'ord', 'yr', 'dt', 'ox'], rng) : pick(['dt', 'td', 'ord', 'yr'], rng),
  makeQ,
  infoHTML,
  cardLine: (T, id) => `${esc(IT(T, id).t)} <span class="ansv">${esc(IT(T, id).yl)}</span>`,
  worstLine: (T, id) => `<b>${esc(IT(T, id).t)}</b> ${esc(IT(T, id).yl)}`,
  worstTitle: '많이 틀리는 용어',
  conceptIntro: (T, s, trName) => `<span class="lk">${trName} ${s.g} · ${s.n}단원 · ${esc(s.era)}</span><h2>${esc(s.title)}</h2><p class="sum">${esc(s.sum)}</p>
      <div class="wl"><span class="lk">핵심 용어 연표</span>${timeline(T, IT(T, s.items[0]).ui, null)}</div>`,
  conceptEnd: (s, gate, cap) => `<span class="lk">기억할 점</span><h2>흐름으로 기억해요</h2><p>사건을 따로 외우기보다 "왜 일어났고 → 어떻게 진행됐고 → 무엇이 바뀌었는지" 순서로 이어 보면 오래 기억돼요. 연표에서 앞뒤 사건을 함께 떠올려 보세요.</p><p class="soft">${gate ? `이 단원은 ${cap}개를 틀리면 처음부터 다시 해요. 이제 문제를 풀어요. 설명 보고 용어 고르기부터, 잘 맞히면 용어 보고 설명 고르기 → 시대 순서·연도·OX로 올라가요. 어려운 단계에서 연속 ${RULES.GOAL}문제를 맞히면 다음 단원이에요.` : '통과한 단원은 3단원 뒤, 5단원 뒤에 다시 복습해요. 틀린 문제는 오답노트에서 1·3·5일 뒤 다시 나와요.'}</p>`,
  examIntro: (s, trName) => `<span class="lk">${trName} ${s.area} · 용어 ${s.items.length}개</span><h2>${s.name}</h2>
      <p>${trName} ${s.area} 단원의 핵심 용어 ${s.items.length}개 가운데 ${RULES.EXAM_N}문제가 무작위로 나와요. 용어·설명 고르기, 시대 순서, 연도, OX가 섞여 있어요.</p>
      <p class="soft">${EXAM_PASS_N}개 이상 맞히면 다음 학교급이 열려요. ${EXAM_CAP}개를 틀리면 평가가 끝나고, 틀린 용어를 오답노트로 복습한 뒤 다시 도전해요.</p>`,
  homeNote: "국사와 세계사는 진도를 따로 저장해요. 한 단원에서 정해진 개수(초등 5 · 중등 6 · 고등 7개)를 틀리면 그 단원을 처음부터 다시 해요. 통과한 단원은 3단원 뒤, 5단원 뒤에 다시 복습해요. 잠긴 단원도 '개념'으로 미리 볼 수 있어요.",
  listSub: (tr) => `${tr} · 초등 → 중등 → 고등`,
  conceptName: '개념 정리',
  appName: '역사하루',
  tabName: '역사',
};
