import { describe, expect, it } from 'vitest';
import { avoidLastPosition, memoryLastPos, reshuffleForRetry } from './choices';
import { addWrongCard, answerCard, applyReview, newProgress, nextBp, planDay } from './progress';
import { EXAM_CAP, EXAM_PASS_N, RULES, levelOf, wrongCap } from './rules';
import { StudySession, type AnswerResult, type Mode } from './session';
import { fakePlugin, makeStages, seeded } from './testkit';
import type { Progress } from './types';

const T = 20000;

function session(p: Progress, mode: Mode = 'today', opts: { day?: number; seed?: number } = {}) {
  const stages = makeStages();
  let day = opts.day ?? T;
  const lastPos = memoryLastPos();
  const s = new StudySession({
    progress: p, stages, plugin: fakePlugin(stages), lastPos, mode,
    env: { rng: seeded(opts.seed), today: () => day },
  });
  return { s, stages, lastPos, setDay: (d: number) => (day = d) };
}

/** 소개는 읽고, ok 함수가 정하는 대로 답한다 */
function run(s: StudySession, ok: (i: number) => boolean, max = 200, stop?: (r: AnswerResult) => boolean) {
  const results = [];
  for (let n = 0; n < max; n++) {
    const st = s.step();
    if (st.kind === 'done') break;
    if (st.kind === 'intro') {
      s.markRead(st.stage.id);
      continue;
    }
    const q = st.q;
    const wrong = q.choices.find((c) => c !== q.answer)!;
    const r = s.answer(ok(n) ? q.answer : wrong);
    results.push({ q, r });
    s.next();
    if (stop?.(r)) break;
  }
  return results;
}

describe('규칙 숫자', () => {
  it('03_rules.md 값 그대로', () => {
    expect(RULES.GOAL).toBe(10);
    expect(RULES.SET).toBe(20);
    expect(RULES.CARD_GAP).toEqual([1, 3, 5]);
    expect(RULES.REV_GAP).toEqual([3, 5]);
    expect(EXAM_PASS_N).toBe(16);
    expect(EXAM_CAP).toBe(5);
    expect(wrongCap('초등')).toBe(5);
    expect(wrongCap('6급Ⅱ')).toBe(6);
    expect(wrongCap('고등')).toBe(7);
    expect(wrongCap('1급')).toBe(8);
  });
  it('난이도 구간 0~2 쉬움 · 3~5 보통 · 6~9 어려움', () => {
    expect([0, 2, 3, 5, 6, 9].map(levelOf)).toEqual(['easy', 'easy', 'normal', 'normal', 'hard', 'hard']);
  });
  it('난이도 위치: 맞히면 +1, 연속 2개 이상이면 +2, 틀리면 −2', () => {
    expect(nextBp(0, true, 0)).toBe(1);
    expect(nextBp(1, true, 2)).toBe(3);
    expect(nextBp(9, true, 5)).toBe(9);
    expect(nextBp(1, false, 0)).toBe(0);
    expect(nextBp(5, false, 0)).toBe(3);
  });
});

describe('오답 카드 1·3·5일', () => {
  it('세 번 연속 맞히면 졸업, 중간에 틀리면 1일로', () => {
    const p = newProgress();
    const c = addWrongCard(p, { item: 'a', qtype: 'dt', stage: 's0' }, T, 'c1');
    expect(c.due).toBe(T + 1);
    expect(answerCard(p, c, true, T + 1)).toBe(false);
    expect(c.due).toBe(T + 1 + 3);
    expect(answerCard(p, c, false, T + 4)).toBe(false);
    expect([c.box, c.due, c.wrong]).toEqual([0, T + 5, 2]);
    answerCard(p, c, true, T + 5);
    answerCard(p, c, true, T + 8);
    expect(c.due).toBe(T + 8 + 5);
    expect(answerCard(p, c, true, T + 13)).toBe(true);
    expect(p.cards).toHaveLength(0);
    expect(p.grad).toBe(1);
  });
  it('같은 항목·같은 유형을 또 틀리면 새 카드 없이 1일로 되돌리고 횟수만 더함', () => {
    const p = newProgress();
    addWrongCard(p, { item: 'a', qtype: 'dt', stage: 's0' }, T, 'c1');
    p.cards[0].box = 2;
    addWrongCard(p, { item: 'a', qtype: 'dt', stage: 's0' }, T + 3, 'c2');
    addWrongCard(p, { item: 'a', qtype: 'td', stage: 's0' }, T + 3, 'c3');
    expect(p.cards).toHaveLength(2);
    expect(p.cards[0]).toMatchObject({ box: 0, due: T + 4, wrong: 2 });
  });
});

describe('오늘 학습 구성', () => {
  it('오답 최대 8 → 복습 최대 3단원×4 → 새 진도 나머지(최소 4)', () => {
    const stages = makeStages();
    const p = newProgress();
    p.stage = 5;
    p.np = 5;
    for (let k = 0; k < 10; k++) addWrongCard(p, { item: `u0_${k}`, qtype: 'dt', stage: 's0' }, T - 2, `c${k}`);
    p.passed = { s0: { box: 0, due: 3 }, s1: { box: 0, due: 4 }, s2: { box: 1, due: 5 }, s3: { box: 0, due: 7 } };
    const pl = planDay(p, stages, T);
    expect(pl.cards).toHaveLength(8);
    expect(pl.reviews).toEqual(['s0', 's1', 's2']);
    expect(pl.n).toBe(4);
    expect(pl.total).toBe(24);
    expect(pl.late).toBe(10);
  });
  it('처음 시작하면 새 진도 20문제', () => {
    const pl = planDay(newProgress(), makeStages(), T);
    expect([pl.cards.length, pl.reviews.length, pl.n]).toEqual([0, 0, 20]);
  });
  it('승급 평가 차례면 평가 20문제', () => {
    const p = newProgress();
    p.stage = 6;
    expect(planDay(p, makeStages(), T)).toMatchObject({ exam: true, n: 20 });
  });
});

describe('단원 안 진행', () => {
  it('새 단원은 소개를 먼저 보여 준다', () => {
    const { s } = session(newProgress());
    const st = s.step();
    expect(st.kind).toBe('intro');
    s.markRead('s0');
    expect(s.step().kind).toBe('question');
  });

  it('어려움 구간에서 연속 10문제 맞히면 통과하고 다음 단원은 소개부터', () => {
    const p = newProgress();
    const { s } = session(p);
    const out = run(s, () => true, 11);
    const passAt = out.findIndex((x) => x.r.passed);
    expect(passAt).toBe(9);
    expect(out[passAt].r.events).toEqual(['ok', 'pass']);
    expect(p.stage).toBe(1);
    expect(p.passed.s0).toEqual({ box: 0, due: 4 });
    expect(p.read.s1).toBeFalsy();
    expect(s.step()).toMatchObject({ kind: 'intro', stage: { id: 's1' } });
  });

  it('난이도가 어려움에 닿기 전에는 연속 10개여도 통과하지 않는다', () => {
    const p = newProgress();
    p.read.s0 = true;
    p.streak = 9;
    p.bp.s0 = 3;
    const { s } = session(p);
    run(s, () => true, 1);
    expect(p.stage).toBe(0);
  });

  it('틀리면 3문제 뒤 다시 나오고 정답 위치가 바뀐다', () => {
    const p = newProgress();
    p.read.s0 = true;
    const { s } = session(p);
    const first = s.step();
    if (first.kind !== 'question') throw new Error();
    const q = first.q;
    const r = s.answer(q.choices.find((c) => c !== q.answer)!);
    expect(r.retryQueued).toBe(true);
    expect(p.cards).toHaveLength(1);
    s.next();
    run(s, () => true, 3);
    const again = s.step();
    if (again.kind !== 'question') throw new Error();
    expect(again.q.src).toBe('retry');
    expect(again.q.item).toBe(q.item);
    expect(again.q.choices.indexOf(again.q.answer)).not.toBe(q.choices.indexOf(q.answer));
  });

  it('틀림 상한(초등 5)에 닿으면 그 단원을 소개부터 다시', () => {
    const p = newProgress();
    p.read.s0 = true;
    p.bp.s0 = 5;
    const { s } = session(p);
    // 사이사이 방금 틀린 문제가 다시 나오므로, 새 진도 오답만 세어 5번째에서 상한
    const out = run(s, () => false, 50, (r) => !!r.restart).filter((x) => x.q.src === 'new').slice(0, 5);
    expect(out).toHaveLength(5);
    expect(out.at(-1)!.r.restart?.cap).toBe(5);
    expect(p.read.s0).toBe(false);
    expect([p.bp.s0, p.wr.s0]).toEqual([0, 0]);
    expect(s.step().kind).toBe('intro');
  });
});

describe('통과 단원 복습 3단원 → 5단원', () => {
  it('다 맞히면 다음 복습, 두 번 끝나면 완성 · 틀리면 3단원 뒤 다시', () => {
    const p = newProgress();
    p.np = 4;
    p.passed.s0 = { box: 0, due: 4 };
    expect(applyReview(p, 's0', 0)).toBe('again');
    expect(p.passed.s0).toEqual({ box: 1, due: 9 });
    expect(applyReview(p, 's0', 1)).toBe('reset');
    expect(p.passed.s0).toEqual({ box: 0, due: 7 });
    applyReview(p, 's0', 0);
    expect(applyReview(p, 's0', 0)).toBe('done');
    expect(p.passed.s0.box).toBe(2);
  });

  it('세션에서 복습을 다 맞히면 마칠 때 반영된다', () => {
    const p = newProgress();
    p.stage = 4;
    p.np = 4;
    p.read.s4 = true;
    p.passed.s0 = { box: 0, due: 4 };
    const { s } = session(p);
    run(s, () => true);
    const res = s.finish();
    // 중간에 단원을 통과하면 복습 차례 단원이 한 번 더 붙는다(프로토타입과 같음)
    expect(res.reviews[0]).toMatchObject({ stage: 's0', wrong: 0, outcome: 'again' });
    expect(res.reviews[0].n % 4).toBe(0);
  });
});

describe('승급 평가', () => {
  const atExam = () => {
    const p = newProgress();
    p.stage = 6;
    p.np = 6;
    return p;
  };
  it('20문제 중 16개 이상이면 다음 학교급', () => {
    const p = atExam();
    const { s } = session(p);
    run(s, (i) => i % 5 !== 0);
    const res = s.finish();
    expect(res.exam).toMatchObject({ n: 20, correct: 16, pass: true });
    expect(p.stage).toBe(7);
    expect(p.passed.s6).toMatchObject({ exam: true, score: 80 });
  });
  it('5개 틀리면 그 자리에서 끝나고 틀린 문제는 오답노트로', () => {
    const p = atExam();
    const { s } = session(p);
    const out = run(s, (i) => i >= 5);
    expect(out).toHaveLength(5);
    expect(out[4].r.examStopped).toBe(true);
    const res = s.finish();
    expect(res.exam).toMatchObject({ pass: false, stopped: true });
    expect(p.stage).toBe(6);
    expect(p.cards).toHaveLength(5);
  });
});

describe('보기 위치 섞기', () => {
  it('지난번과 같은 위치에 정답이 오면 옮긴다', () => {
    const store = memoryLastPos();
    const rng = seeded(1);
    const q = { item: 'a', qtype: 'dt', choices: ['a', 'b', 'c', 'd'], answer: 'a' };
    store.set('a:dt', 0);
    expect(avoidLastPosition(q, store, rng).choices.indexOf('a')).not.toBe(0);
  });
  it('OX·쓰기는 섞지 않는다', () => {
    const store = memoryLastPos();
    const ox = { item: 'a', qtype: 'ox', choices: ['O', 'X'], answer: 'O', ox: true };
    expect(reshuffleForRetry(ox, store, seeded()).choices).toEqual(['O', 'X']);
  });
  it('다시 낼 때는 1000번 해도 정답 위치가 겹치지 않는다', () => {
    const store = memoryLastPos();
    const rng = seeded(7);
    for (let n = 0; n < 1000; n++) {
      const q = { item: 'a', qtype: 'dt', choices: ['a', 'b', 'c', 'd'], answer: 'a' };
      expect(reshuffleForRetry(q, store, rng).choices.indexOf('a')).not.toBe(0);
    }
  });
});

describe('끝까지 진행', () => {
  it('계속 맞히면 모든 단원과 평가를 지나 마지막 칸에 닿는다', () => {
    const p = newProgress();
    const stages = makeStages();
    for (let day = 0; day < 30 && p.stage < stages.length - 1; day++) {
      const { s } = session(p, 'today', { day: T + day, seed: day + 1 });
      run(s, (i) => i % 13 !== 12);
      s.finish();
    }
    expect(p.stage).toBe(stages.length - 1);
    expect(p.passed.s6).toMatchObject({ exam: true });
  });
});

describe('과목별 확장 (국어·과학 객관식)', () => {
  it('altItem이 문항을 주면 그 문항을 내고, 평가는 examPool에서 뽑는다', () => {
    const stages = makeStages();
    const base = fakePlugin(stages);
    const plugin = {
      ...base,
      makeQuestion: (item: string, qtype: string, rng: () => number) =>
        item.startsWith('mc') ? { item, qtype, choices: ['a', 'b', 'c', item], answer: item } : base.makeQuestion(item, qtype, rng),
      altItem: (src: string, _s: unknown, _bp: number, _r: unknown, recent: string[]) => (src !== 'exam' && recent.length < 2 ? { item: `mc${recent.length}`, qtype: 'mc' } : null),
      examPool: () => ['mcX'],
    };
    const p = newProgress();
    p.read.s0 = true;
    const s = new StudySession({ progress: p, stages, plugin, lastPos: memoryLastPos(), mode: 'today', env: { rng: seeded(), today: () => T } });
    const items: string[] = [];
    for (let i = 0; i < 3; i++) { const st = s.step(); if (st.kind === 'question') { items.push(st.q.item); s.answer(st.q.answer); s.next(); } }
    expect(items.slice(0, 2)).toEqual(['mc0', 'mc1']);
    expect(items[2]).toMatch(/^u0_/);
    const pe = newProgress(); pe.stage = 6;
    const se = new StudySession({ progress: pe, stages, plugin, lastPos: memoryLastPos(), mode: 'today', env: { rng: seeded(), today: () => T } });
    const st = se.step();
    expect(st.kind === 'question' && st.q.item).toBe('mcX');
  });
});
