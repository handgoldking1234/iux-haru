import { describe, expect, it } from 'vitest';
import {
  backlogTotal, block, ensureDay, freshRewards, gameEarn, gradeOf, rewardEvent, takeTicket,
} from './rewards';

const T = 20000;
const at = (h: number, day = T) => {
  // 로컬 기준 day번째 날 h시
  const d = new Date(day * 864e5);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), h);
};

describe('캐시', () => {
  it('정답 +1, 5연속 +3, 오답 −1, 0 밑으로 안 내려감', () => {
    const st = freshRewards(T);
    st.cash = 0;
    for (let i = 0; i < 5; i++) rewardEvent(st, 'ok', 'hist', T);
    expect(st.cash).toBe(8);
    for (let i = 0; i < 10; i++) rewardEvent(st, 'no', 'hist', T);
    expect(st.cash).toBe(0);
    expect(st.xp).toBe(5);
  });
  it('공부 캐시는 하루 최대 150', () => {
    const st = freshRewards(T);
    st.plan = { math: 0, hanja: 0, eng: 0, kor: 0, hist: 0, sci: 0, typ: 0 };
    for (let i = 0; i < 200; i++) rewardEvent(st, 'ok', 'hist', T);
    expect(ensureDay(st, T).cash).toBe(150);
    // 다음 날: 정답 +1, 할 일이 없으니 첫 정답에 오늘 할 일 완료 +20
    rewardEvent(st, 'ok', 'hist', T + 1);
    expect(ensureDay(st, T + 1).cash).toBe(21);
  });
  it('게임 캐시는 하루 최대 30', () => {
    const st = freshRewards(T);
    expect(gameEarn(st, T, 25) + gameEarn(st, T, 25)).toBe(30);
  });
  it('보너스: 졸업 +5, 단원 통과 +20', () => {
    const st = freshRewards(T);
    expect(rewardEvent(st, 'grad', 'hanja', T).gain).toBe(5);
    expect(rewardEvent(st, 'pass', 'hanja', T).gain).toBe(20);
  });
});

describe('등급', () => {
  it('씨앗 0 → 새싹 150 → … → 별 3000, 내려가지 않음', () => {
    expect([0, 149, 150, 400, 800, 1300, 2000, 3000].map(gradeOf)).toEqual([0, 0, 1, 2, 3, 4, 5, 6]);
  });
});

describe('오늘 할 일과 잠금', () => {
  it('할 일을 모두 끝내야 열리고 +20, 20문제 더 맞히면 +1판', () => {
    const st = freshRewards(T);
    st.plan = { math: 2, hanja: 1, eng: 0, kor: 0, hist: 0, sci: 0, typ: 0 };
    expect(block(st, at(15))?.msg).toBe('오늘 할 일을 모두 끝내면 열려요 (0/2 완료)');
    rewardEvent(st, 'ok', 'math', T);
    rewardEvent(st, 'ok', 'math', T);
    const out = rewardEvent(st, 'ok', 'hanja', T);
    expect(out.msg).toContain('오늘 할 일 완료! 꾸미기·게임이 열렸어요 +20');
    expect(block(st, at(15))).toBeNull();
    for (let i = 0; i < 3; i++) expect(takeTicket(st, at(15))).toBe(true);
    expect(block(st, at(15))?.k).toBe('used');
    for (let i = 0; i < 20; i++) rewardEvent(st, 'ok', 'math', T);
    expect(block(st, at(15))).toBeNull();
  });
  it('밤 9시 잠금(선택)', () => {
    const st = freshRewards(T);
    st.plan = { math: 0, hanja: 0, eng: 0, kor: 0, hist: 0, sci: 0, typ: 0 };
    st.curfew = true;
    expect(block(st, at(20))).toBeNull();
    expect(block(st, at(21))?.k).toBe('night');
  });
  it('밀린 공부: 못 끝낸 하루치를 오늘 할 일을 넘긴 정답으로 갚고, 다 갚으면 +5', () => {
    const st = freshRewards(T);
    st.plan = { math: 2, hanja: 0, eng: 0, kor: 0, hist: 0, sci: 0, typ: 0 };
    rewardEvent(st, 'ok', 'math', T);
    expect(backlogTotal(st, T + 1)).toBe(1);
    rewardEvent(st, 'ok', 'math', T + 1);
    rewardEvent(st, 'ok', 'math', T + 1);
    expect(block(st, at(15, T + 1))?.msg).toBe('밀린 공부 1문제를 끝내면 열려요');
    const out = rewardEvent(st, 'ok', 'math', T + 1);
    expect(out.msg.some((m) => m.includes('밀린 공부 완료 +5'))).toBe(true);
    expect(block(st, at(15, T + 1))).toBeNull();
  });
});
