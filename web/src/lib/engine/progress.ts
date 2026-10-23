import { RULES } from './rules';
import type { Card, Progress, Stage } from './types';

export const newProgress = (): Progress => ({
  stage: 0, np: 0, streak: 0, bp: {}, wr: {}, read: {}, passed: {}, cards: [], grad: 0,
});

/** 오늘(또는 지난) 날짜의 오답 카드. 밀린 것부터, 같으면 많이 틀린 것부터 */
export function dueCards(p: Progress, today: number, known?: (item: string) => boolean): Card[] {
  return p.cards
    .filter((c) => c.due <= today && (!known || known(c.item)))
    .sort((a, b) => a.due - b.due || b.wrong - a.wrong);
}

/** 복습 차례가 된 통과 단원 id (평가 제외, 두 번 다 끝낸 단원 제외) */
export function dueStages(p: Progress): string[] {
  return Object.entries(p.passed)
    .flatMap(([id, v]) => (!v.exam && v.box < 2 && v.due <= p.np ? [{ id, due: v.due }] : []))
    .sort((a, b) => a.due - b.due)
    .map((x) => x.id);
}

export interface DayPlan {
  cards: Card[];
  reviews: string[];
  exam: boolean;
  /** 새 진도(또는 평가) 문제 수 */
  n: number;
  /** 날짜가 지난 오답 수 */
  late: number;
  total: number;
}

/** 오늘 학습 구성: 오답(최대 8) → 복습(최대 3단원 × 4) → 새 진도(나머지, 최소 4) · 평가면 20 */
export function planDay(p: Progress, stages: Stage[], today: number, known?: (item: string) => boolean): DayPlan {
  const cards = dueCards(p, today, known).slice(0, RULES.SET_MAX_CARDS);
  const reviews = dueStages(p).slice(0, RULES.SET_MAX_REVIEW_UNITS);
  const exam = stages[p.stage]?.kind === 'exam';
  const n = exam
    ? RULES.EXAM_N
    : Math.max(RULES.SET_MIN_NEW, RULES.SET - cards.length - reviews.length * RULES.REV_Q);
  return {
    cards, reviews, exam, n,
    late: p.cards.filter((c) => c.due < today).length,
    total: cards.length + reviews.length * RULES.REV_Q + n,
  };
}

/**
 * 틀린 문제를 오답 카드로 담는다.
 * 같은 항목·같은 유형을 또 틀리면 새 카드를 만들지 않고 1일로 되돌리고 틀린 횟수만 더한다.
 */
export function addWrongCard(p: Progress, q: { item: string; qtype: string; stage: string; extra?: Record<string, unknown> }, today: number, id: string) {
  const ex = p.cards.find((c) => c.item === q.item && c.qtype === q.qtype);
  if (ex) {
    ex.box = 0;
    ex.due = today + RULES.CARD_GAP[0];
    ex.wrong++;
    return ex;
  }
  const c: Card = { id, item: q.item, qtype: q.qtype, stage: q.stage, box: 0, due: today + RULES.CARD_GAP[0], wrong: 1 };
  if (q.extra) c.extra = q.extra;
  p.cards.push(c);
  return c;
}

/** 오답 카드를 다시 풀었을 때. 졸업하면 true */
export function answerCard(p: Progress, card: Card, ok: boolean, today: number): boolean {
  if (!ok) {
    card.box = 0;
    card.due = today + RULES.CARD_GAP[0];
    card.wrong++;
    return false;
  }
  card.box++;
  if (card.box >= RULES.CARD_GAP.length) {
    p.cards = p.cards.filter((x) => x !== card);
    p.grad++;
    return true;
  }
  card.due = today + RULES.CARD_GAP[card.box];
  return false;
}

/** 새 진도 난이도 위치: 맞히면 +1(연속 2개 이상 맞힌 중이면 +2), 틀리면 −2 */
export function nextBp(bp: number, ok: boolean, streak: number): number {
  return ok ? Math.min(RULES.BP_MAX, bp + (streak >= 2 ? 2 : 1)) : Math.max(0, bp - 2);
}

/** 단원 통과 처리 — 3단원 뒤 첫 복습을 잡고 다음 칸으로 */
export function passUnit(p: Progress, stage: Stage) {
  delete p.wr[stage.id];
  p.np++;
  p.passed[stage.id] = { box: 0, due: p.np + RULES.REV_GAP[0] };
  p.stage++;
  p.streak = 0;
}

/** 복습 결과 반영: 다 맞히면 다음 복습(5단원 뒤) 또는 완성, 틀리면 3단원 뒤 다시 */
export function applyReview(p: Progress, stageId: string, wrong: number): 'done' | 'again' | 'reset' | null {
  const ps = p.passed[stageId];
  if (!ps || ps.exam) return null;
  if (wrong === 0) {
    ps.box = Math.min(2, ps.box + 1);
    if (ps.box < 2) ps.due = p.np + RULES.REV_GAP[ps.box];
    return ps.box >= 2 ? 'done' : 'again';
  }
  ps.box = 0;
  ps.due = p.np + RULES.REV_GAP[0];
  return 'reset';
}
