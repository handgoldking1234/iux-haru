/* 테스트용: 고정 난수, 가짜 과목 플러그인, 작은 학습 길 */
import type { Question, Stage, SubjectPlugin } from './types';

export function seeded(seed = 20261023) {
  let s = seed % 2147483647;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** 항목 id가 곧 정답. 보기는 같은 단원 다른 항목 3개 */
export const fakePlugin = (stages: Stage[]): SubjectPlugin => {
  const all = stages.filter((s) => s.kind === 'unit').flatMap((s) => s.items);
  return {
    key: 'fake',
    pickQtype: (src, bp) => (src === 'new' ? (bp < 3 ? 'dt' : bp < 6 ? 'td' : 'hard') : 'mix'),
    makeQuestion(item, qtype, rng): Question {
      const others = all.filter((x) => x !== item);
      const picks: string[] = [];
      while (picks.length < 3) {
        const o = others[Math.floor(rng() * others.length)];
        if (!picks.includes(o)) picks.push(o);
      }
      const choices = [item, ...picks];
      const k = Math.floor(rng() * 4);
      [choices[0], choices[k]] = [choices[k], choices[0]];
      return { item, qtype, choices, answer: item };
    },
  };
};

/** 단원 n개(항목 10개씩) + 끝에 승급 평가 */
export function makeStages(units = 6, area = '초등'): Stage[] {
  const out: Stage[] = [];
  for (let u = 0; u < units; u++) {
    out.push({ id: `s${u}`, kind: 'unit', area, name: `${area} ${u + 1}단원`, items: Array.from({ length: 10 }, (_, k) => `u${u}_${k}`) });
  }
  out.push({ id: `s${units}`, kind: 'exam', area, name: `${area} 승급 평가`, items: out.flatMap((s) => s.items) });
  out.push({ id: `s${units + 1}`, kind: 'unit', area: '중등', name: '중등 1단원', items: Array.from({ length: 10 }, (_, k) => `m0_${k}`) });
  return out;
}
