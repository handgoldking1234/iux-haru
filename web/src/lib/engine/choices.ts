import type { LastPosStore, Question } from './types';

export const pick = <T>(a: readonly T[], rng: () => number): T => a[Math.floor(rng() * a.length)];

export function shuffle<T>(a: readonly T[], rng: () => number): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

const fixed = (q: Question) => q.ox || q.write || q.choices.length < 3;
export const posKey = (q: Pick<Question, 'item' | 'qtype'>) => `${q.item}:${q.qtype}`;

/**
 * 새로 만든 문제의 정답 위치가 이 문제를 지난번에 냈을 때와 같으면 다른 자리로 옮긴다.
 * (CLAUDE.md 규칙 5 · 프로토타입 NAVHOOK fixPos)
 */
export function avoidLastPosition(q: Question, store: LastPosStore, rng: () => number): Question {
  if (fixed(q)) return q;
  const cs = [...q.choices];
  let i = cs.indexOf(q.answer);
  if (i < 0) return q;
  const key = posKey(q);
  if (store.get(key) === i) {
    const j = (i + 1 + Math.floor(rng() * (cs.length - 1))) % cs.length;
    [cs[i], cs[j]] = [cs[j], cs[i]];
    i = j;
  }
  store.set(key, i);
  return { ...q, choices: cs };
}

/** 방금 틀린 문제를 다시 낼 때: 보기를 섞되 정답 위치는 반드시 바뀐다 (프로토타입 hgReshuf) */
export function reshuffleForRetry(q: Question, store: LastPosStore, rng: () => number): Question {
  if (fixed(q)) return q;
  const i0 = q.choices.indexOf(q.answer);
  let cs = [...q.choices];
  for (let n = 0; n < 20; n++) {
    cs = shuffle(q.choices, rng);
    if (cs.indexOf(q.answer) !== i0) break;
  }
  if (cs.indexOf(q.answer) === i0) {
    const j = (i0 + 1) % cs.length;
    [cs[i0], cs[j]] = [cs[j], cs[i0]];
  }
  store.set(posKey(q), cs.indexOf(q.answer));
  return { ...q, choices: cs };
}

export const memoryLastPos = (): LastPosStore => {
  const m = new Map<string, number>();
  return { get: (k) => m.get(k), set: (k, v) => void m.set(k, v) };
};
