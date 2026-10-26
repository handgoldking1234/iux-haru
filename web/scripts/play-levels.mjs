/**
 * 게임 수준(초1~고3)별 문제 묶음 — 과목 콘텐츠(public/content/*.json)의 학년·급수 정보로 나눈다 (사용자 요청)
 *   → public/content/play-lv.json  { 과목: { it: [문항…], g: [[학년별 문항 번호…] × 12] } }
 *   한자: 급수(초1~2 8급 … 고3 3급, 앞 급수까지 섞음) · 영단어: 초·중·고 단어를 쉬운 것부터 나눔
 *   과학: 단원의 학년(초3~고2) · 역사·국어: 초·중·고 단원. 연산은 게임 코드가 학년별로 새로 만든다
 * 실행: node scripts/play-levels.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const C = path.resolve(here, '../public/content');
const load = (n) => JSON.parse(fs.readFileSync(path.join(C, n + '.json'), 'utf8'));
export const GRADES = ['초1', '초2', '초3', '초4', '초5', '초6', '중1', '중2', '중3', '고1', '고2', '고3'];
const school = (g) => (g < 6 ? 0 : g < 9 ? 1 : 2);

function pack(items, inGrade) {
  return { it: items.map((x) => x.v), g: GRADES.map((_, g) => items.flatMap((x, i) => (inGrade(x, g) ? [i] : []))) };
}

// 한자: 학년 → 급수 번호(LV 순서). 그 급수와 바로 앞 급수를 섞는다
const hj = load('hanja');
const HLV = [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const han = pack(hj.CH.map((c) => ({ v: [c[0], c[1], c[2]], lv: c[4] })), (x, g) => x.lv === HLV[g] || x.lv === Math.max(0, HLV[g] - 1));

// 영단어: 학교급(lv 0·1·2) 안에서 앞쪽(자주 쓰는 단어)부터 학년 구간으로 나눔 (구간끼리 조금 겹침)
const en = load('eng');
const byLv = [0, 1, 2].map((l) => en.W.filter((w) => w[1] === l));
const CUT = [[0, 250], [0, 250], [200, 550], [200, 550], [450, 800], [450, 800], [0, 450], [400, 850], [750, 1200], [0, 400], [300, 700], [600, 1000]];
const engItems = [];
byLv.forEach((ws, l) => ws.forEach((w, i) => engItems.push({ v: [w[0], String(w[3]).split(/,\s*/)[0]], l, i })));
const eng = pack(engItems, (x, g) => x.l === school(g) && x.i >= CUT[g][0] && x.i < CUT[g][1]);

// 과학: 단원 era 앞머리(초3·중1·고1·고1·고2)로 학년. 초1~2는 초3, 고3은 고2 단원
const sc = load('sci');
const sGrades = (era) => {
  const h = String(era || '').split(' ')[0];
  if (/^고1·/.test(h)) return [9, 10, 11];
  const i = GRADES.indexOf(h);
  if (i < 0) return [];
  return i === 2 ? [0, 1, 2] : i === 10 ? [10, 11] : [i];
};
const sciItems = [];
for (const t of Object.values(sc)) for (const u of t.units) { const gs = sGrades(u.era); for (const it of u.items || []) sciItems.push({ v: [it.t, it.d, u.tag || ''], gs }); }
const sci = pack(sciItems, (x, g) => x.gs.includes(g));

// 역사·국어: 단원 lv(0 초 · 1 중 · 2 고)
const hs = load('hist');
const histItems = [];
for (const [k, t] of Object.entries(hs)) if (t.units) for (const u of t.units) for (const it of u.items || []) histItems.push({ v: [it.t, it.d, k], l: u.lv });
const hist = pack(histItems, (x, g) => x.l === school(g));
const ko = load('kor');
const korItems = [];
for (const t of Object.values(ko)) for (const u of t.units) for (const it of u.items || []) korItems.push({ v: [it.t, it.d, u.tag || ''], l: u.lv });
const kor = pack(korItems, (x, g) => x.l === school(g));

const out = { GRADES, han, eng, sci, hist, kor };
fs.writeFileSync(path.join(C, 'play-lv.json'), JSON.stringify(out));
console.log('play-lv.json', Object.fromEntries(Object.entries(out).filter(([k]) => k !== 'GRADES').map(([k, v]) => [k, v.g.map((a) => a.length).join('/')])));
