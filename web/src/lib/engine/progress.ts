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

/** 복습 차례가 된 통과 단원 id (평가 제외) — 3·5단원 뒤 복습, 그리고 today를 주면 완성 뒤 장기 복습(30·90일…)도 */
export function dueStages(p: Progress, today?: number): string[] {
  const short = Object.entries(p.passed)
    .flatMap(([id, v]) => (!v.exam && v.box < 2 && v.due <= p.np ? [{ id, due: v.due }] : []))
    .sort((a, b) => a.due - b.due)
    .map((x) => x.id);
  if (today == null) return short;
  const long = Object.entries(p.passed)
    .flatMap(([id, v]) => (!v.exam && v.box >= 2 && v.ld != null && v.ld <= today ? [{ id, ld: v.ld }] : []))
    .sort((a, b) => a.ld - b.ld)
    .map((x) => x.id);
  return [...short, ...long];
}

/** 학년보다 앞선 학교급이라 새 진도가 잠겼는지 (locked를 안 주면 안 잠김) */
export const isHeld = (p: Progress, stages: Stage[], locked?: (s: Stage) => boolean) =>
  !!(locked && stages[p.stage] && locked(stages[p.stage]));

export interface DayPlan {
  cards: Card[];
  reviews: string[];
  exam: boolean;
  /** 새 진도(또는 평가) 문제 수 · hold면 배운 단원 다지기 문제 수 */
  n: number;
  /** 학년보다 앞선 학교급이라 새 진도 대신 다지기 */
  hold?: boolean;
  /** 날짜가 지난 오답 수 */
  late: number;
  total: number;
}

/** 오늘 학습 구성: 오답(최대 8) → 복습(최대 3단원 × 4) → 새 진도(나머지, 최소 4) · 평가면 20 */
export function planDay(p: Progress, stages: Stage[], today: number, known?: (item: string) => boolean, locked?: (s: Stage) => boolean): DayPlan {
  const cards = dueCards(p, today, known).slice(0, RULES.SET_MAX_CARDS);
  const reviews = dueStages(p, today).slice(0, RULES.SET_MAX_REVIEW_UNITS);
  const hold = isHeld(p, stages, locked);
  const exam = !hold && stages[p.stage]?.kind === 'exam';
  const n = hold
    ? (holdUnits(p).length ? RULES.HOLD_N : 0)
    : exam
      ? RULES.EXAM_N
      : Math.max(RULES.SET_MIN_NEW, RULES.SET - cards.length - reviews.length * RULES.REV_Q);
  return {
    cards, reviews, exam, n, hold,
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

/** 다지기에 쓸 단원: 통과한 단원(평가 제외) */
export const holdUnits = (p: Progress) => Object.entries(p.passed).filter(([, v]) => !v.exam).map(([id]) => id);

/** 새 진도 난이도 위치: 맞히면 +1(연속 2개 이상 맞힌 중이면 +2), 틀리면 −2 */
export function nextBp(bp: number, ok: boolean, streak: number): number {
  return ok ? Math.min(RULES.BP_MAX, bp + (streak >= 2 ? 2 : 1)) : Math.max(0, bp - 2);
}

/** 100점 한 판을 낸 날을 적는다. 같은 날 두 번은 한 번으로 센다. 서로 다른 날 MASTER_N번이 되면 true */
export function markPerfect(p: Progress, stageId: string, today: number): { n: number; sameDay: boolean; done: boolean } {
  const m = ((p.mast ??= {})[stageId] ??= []);
  const sameDay = m.includes(today);
  if (!sameDay) m.push(today);
  return { n: m.length, sameDay, done: m.length >= RULES.MASTER_N };
}

/** 단원 통과 처리 — 3단원 뒤 첫 복습을 잡고 다음 칸으로 */
export function passUnit(p: Progress, stage: Stage) {
  delete p.wr[stage.id];
  if (p.mast) delete p.mast[stage.id];
  p.np++;
  p.passed[stage.id] = { box: 0, due: p.np + RULES.REV_GAP[0] };
  p.stage++;
  p.streak = 0;
}

/** 복습 결과 반영: 다 맞히면 다음 복습(5단원 뒤) 또는 완성(→ 30일 뒤 장기 복습), 틀리면 3단원 뒤 다시.
 *  완성한 단원의 장기 복습: 다 맞히면 30 → 90 → 180일마다, 틀리면 7일 뒤 다시 */
export function applyReview(p: Progress, stageId: string, wrong: number, today?: number): 'done' | 'again' | 'reset' | 'long' | 'longAgain' | null {
  const ps = p.passed[stageId];
  if (!ps || ps.exam) return null;
  if (ps.box >= 2 && today != null && ps.ld != null && ps.ld <= today) {
    if (wrong) { ps.ld = today + RULES.LONG_RETRY; return 'longAgain'; }
    ps.lb = Math.min((ps.lb ?? 0) + 1, RULES.LONG_GAP.length - 1);
    ps.ld = today + RULES.LONG_GAP[ps.lb];
    return 'long';
  }
  if (wrong === 0) {
    ps.box = Math.min(2, ps.box + 1);
    if (ps.box < 2) ps.due = p.np + RULES.REV_GAP[ps.box];
    else if (today != null) { ps.lb = 0; ps.ld = today + RULES.LONG_GAP[0]; }
    return ps.box >= 2 ? 'done' : 'again';
  }
  ps.box = 0;
  ps.due = p.np + RULES.REV_GAP[0];
  return 'reset';
}
