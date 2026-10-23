/* 용어 문제 공통 — prototype/build/hist.js·kor.js·sci.js의 mates·makeQ (같은 코드를 복제해 쓰던 부분) */
import { shuffle } from '../engine/choices';
import type { PQ, Track } from './types';

export const esc = (s: unknown) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** 용어 항목 공통 모양 */
export interface TItem { t: string; d: string; k: string; y: number | null; yl: string; id: string; ui: number; unit: { lv: number; title: string }; mc?: boolean; w?: string[] }
export const TI = (T: Track, id: string) => T.items[id] as unknown as TItem;
const IT = TI;

/* dt=설명 보고 용어 · td=용어 보고 설명 · ord=시대 순서 · yr=언제? · ox=OX */
/** 용어 문제 공통 (역사·국어·과학): ord·yr·ox·td·dt. qsub = 순서 문제 안내 문구 */
export function termQ(T: Track, id: string, t0: string, rng: () => number, qsub = '시대 순서를 떠올려요'): PQ {
  const x = IT(T, id);
  let t = t0;
  const mates = (n: number, f: (y: string) => unknown, filter?: (y: string) => boolean) => {
    const out: string[] = [], seen = new Set([f(id)]);
    const same = shuffle(T.all.filter((y) => IT(T, y).ui === x.ui && y !== id), rng);
    const lvSame = shuffle(T.all.filter((y) => IT(T, y).unit.lv === x.unit.lv && IT(T, y).ui !== x.ui), rng);
    for (const y of [...same, ...lvSame]) {
      if (out.length >= n) break;
      if (filter && !filter(y)) continue;
      const v = f(y);
      if (!seen.has(v)) { seen.add(v); out.push(y); }
    }
    return out;
  };
  const base = { item: id };
  const yOf = (y: string) => IT(T, y).y;
  if (t === 'ord') {
    if (x.y == null) t = 'dt';
    else {
      const early = rng() < 0.5;
      let others = mates(3, yOf, (y) => yOf(y) != null && (early ? yOf(y)! > x.y! : yOf(y)! < x.y!));
      if (others.length < 3) {
        others = mates(3, yOf, (y) => yOf(y) != null && (!early ? yOf(y)! > x.y! : yOf(y)! < x.y!));
        if (others.length < 3) t = 'dt';
        else return { ...base, qtype: t, ask: '가장 나중에 일어난(등장한) 것은?', q: `<span class="qsub">${qsub}</span>`, qc: 'txt', hint: '', choices: shuffle([x.t, ...others.map((y) => IT(T, y).t)], rng), answer: x.t, long: false };
      } else return { ...base, qtype: t, ask: early ? '가장 먼저 일어난(등장한) 것은?' : '가장 나중에 일어난(등장한) 것은?', q: `<span class="qsub">${qsub}</span>`, qc: 'txt', hint: '', choices: shuffle([x.t, ...others.map((y) => IT(T, y).t)], rng), answer: x.t, long: false };
    }
  }
  if (t === 'yr') {
    if (x.y == null) t = 'td';
    else {
      const others = mates(3, (y) => IT(T, y).yl, (y) => yOf(y) != null && Math.abs(yOf(y)! - x.y!) >= 5);
      if (others.length < 3) t = 'td';
      else return { ...base, qtype: t, ask: '언제의 일일까요?', q: esc(x.t), qc: 'term', hint: `<span class="hint">${esc(x.d)}</span>`, choices: shuffle([x.yl, ...others.map((y) => IT(T, y).yl)], rng), answer: x.yl, long: false };
    }
  }
  if (t === 'ox') {
    const trueQ = rng() < 0.5, o = trueQ ? null : mates(1, (y) => IT(T, y).d, (y) => IT(T, y).ui === x.ui && !IT(T, y).d.includes(x.t))[0];
    const d = o ? IT(T, o).d : x.d;
    return { ...base, qtype: t, ask: '설명이 맞으면 O, 틀리면 X', q: `<span class="oxq"><b>${esc(x.t)}</b> — ${esc(d)}</span>`, qc: 'txt', hint: '', choices: ['O', 'X'], answer: o ? 'X' : 'O', long: false, ox: true };
  }
  if (t === 'td') return { ...base, qtype: t, ask: '이 용어에 맞는 설명은?', q: esc(x.t), qc: 'term', hint: `<span class="hint">${esc(x.yl)}</span>`, choices: shuffle([x.d, ...mates(3, (y) => IT(T, y).d, (y) => !IT(T, y).d.includes(x.t)).map((y) => IT(T, y).d)], rng), answer: x.d, long: true };
  return { ...base, qtype: 'dt', ask: '설명에 알맞은 것은?', q: `<span class="dq">${esc(x.d)}</span>`, qc: 'txt', hint: `<span class="hint">${esc(x.unit.title)}</span>`, choices: shuffle([x.t, ...mates(3, (y) => IT(T, y).t, (y) => !x.d.includes(IT(T, y).t) && !IT(T, y).d.includes(x.t)).map((y) => IT(T, y).t)], rng), answer: x.t, long: false };
}

