/**
 * 학습 규칙 숫자 — docs/03_rules.md 1장. 사용자가 확정한 값이므로 바꾸려면 먼저 사용자에게 묻는다.
 * 프로토타입: GOAL=10, SET=20, CARD_GAP=[1,3,5], REV_GAP=[3,5], EXAM_N=20, EXAM_PASS=0.8, REV_Q=4
 */
export const RULES = {
  /** 어려움 구간에서 연속 정답 몇 개면 단원 통과 */
  GOAL: 10,
  /** 오늘 학습 한 세트 문제 수 */
  SET: 20,
  /** 오답 카드 간격(일): box 0 → 1일, 1 → 3일, 2 → 5일, 3번 연속 맞히면 졸업 */
  CARD_GAP: [1, 3, 5] as const,
  /** 통과 단원 복습 간격(단원 수): 3단원 뒤 → 5단원 뒤 */
  REV_GAP: [3, 5] as const,
  /** 승급 평가 문제 수 / 통과 비율 */
  EXAM_N: 20,
  EXAM_PASS: 0.8,
  /** 복습 1회 문제 수 */
  REV_Q: 4,
  /** 오늘 세트 구성 상한: 오답 카드 최대 8 → 복습 최대 3단원 → 새 진도 최소 4 */
  SET_MAX_CARDS: 8,
  SET_MAX_REVIEW_UNITS: 3,
  SET_MIN_NEW: 4,
  /** 틀린 문제는 3문제 뒤 다시 */
  RETRY_AFTER: 3,
  /** 난이도 위치 bp 0~9. 0~2 쉬움, 3~5 보통, 6~9 어려움 */
  BP_MAX: 9,
  BP_NORMAL: 3,
  BP_HARD: 6,
  /** 오답만 풀기 최대 문제 수 */
  CARDS_ONLY_MAX: 15,
  /** 진도만 풀기 문제 수 */
  NEW_ONLY_N: 10,
} as const;

/** 승급 평가: 통과 기준 개수(16)와, 이만큼 틀리면 평가가 끝나는 개수(5) */
export const EXAM_PASS_N = Math.ceil(RULES.EXAM_N * RULES.EXAM_PASS);
export const EXAM_CAP = RULES.EXAM_N - EXAM_PASS_N + 1;

/** 틀림 상한 — 한 단원에서 이만큼 틀리면 그 단원을 소개부터 다시 (03_rules.md 1-2) */
export const WRONG_CAP: Record<string, number> = {
  초등: 5, 부수: 5, '8급': 5, '7급Ⅱ': 5, '7급': 5,
  중등: 6, '6급Ⅱ': 6, '6급': 6, '5급Ⅱ': 6, '5급': 6,
  고등: 7, '4급Ⅱ': 7, '4급': 7, '3급Ⅱ': 7, '3급': 7,
  '2급': 8, '1급': 8,
};

export const wrongCap = (area: string) => WRONG_CAP[area] ?? 5;

export type Level = 'easy' | 'normal' | 'hard';
export const LEVEL_NAME: Record<Level, string> = { easy: '쉬움', normal: '보통', hard: '어려움' };

export const levelOf = (bp: number): Level =>
  bp < RULES.BP_NORMAL ? 'easy' : bp < RULES.BP_HARD ? 'normal' : 'hard';
