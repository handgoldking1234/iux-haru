/** 학습 길의 한 칸: 단원 또는 승급 평가 */
export interface Stage {
  id: string;
  kind: 'unit' | 'exam';
  /** 틀림 상한을 정하는 구분(초등·중등·고등, 부수·8급…) */
  area: string;
  name: string;
  /** 이 칸에서 출제하는 항목 id. 평가는 해당 학교급·급수 단원 항목 전체 */
  items: string[];
}

/** 오답 카드 — 같은 항목·같은 유형은 카드 하나 */
export interface Card {
  id: string;
  item: string;
  qtype: string;
  stage: string;
  /** 연속으로 맞힌 횟수 0~2. 3이 되면 졸업 */
  box: number;
  /** 다시 나올 날(일 번호) */
  due: number;
  wrong: number;
  /** 같은 문제를 다시 내기 위한 과목별 정보 (예: 한자어, 예시 한자) */
  extra?: Record<string, unknown>;
}

export type Passed =
  | { exam?: false; box: number; due: number }
  | { exam: true; box: 2; score: number };

/** 학생 한 명의 한 갈래 진도 (DB: progress + passed_units + wrong_cards) */
export interface Progress {
  /** 현재 칸 순번 */
  stage: number;
  /** 지금까지 통과한 칸 수 — 단원 복습 간격의 기준 */
  np: number;
  /** 새 진도 연속 정답 */
  streak: number;
  /** 단원별 난이도 위치 0~9 */
  bp: Record<string, number>;
  /** 단원별 틀린 수(틀림 상한용) */
  wr: Record<string, number>;
  /** 단원 소개를 끝까지 읽었는지 */
  read: Record<string, boolean>;
  passed: Record<string, Passed>;
  cards: Card[];
  /** 졸업한 오답 수 */
  grad: number;
  allDone?: boolean;
}

export type QuestionSource = 'card' | 'review' | 'new' | 'retry' | 'exam';

export interface Question {
  item: string;
  qtype: string;
  /** 보기. 쓰기 문제는 비어 있을 수 있음 */
  choices: string[];
  answer: string;
  /** OX·쓰기는 보기 위치를 섞지 않는다 */
  ox?: boolean;
  write?: boolean;
  /** 다시 낼 때 makeQuestion에 넘길 정보 → 오답 카드에 저장 */
  extra?: Record<string, unknown>;
  /** 과목별 화면이 쓰는 나머지 정보 */
  view?: unknown;
}

export interface PlayQuestion extends Question {
  src: QuestionSource;
  stage: string;
  card?: Card;
}

/** 무작위·날짜를 밖에서 넣어 테스트에서 같은 결과를 내게 한다 */
export interface Env {
  rng: () => number;
  today: () => number;
}

/** 과목별 문제 생성기 — 공통 엔진에 꽂는 플러그인 */
export interface SubjectPlugin {
  key: string;
  /** 새 진도: 난이도 위치에 맞는 유형. 복습·평가: 섞인 유형. item을 보고 유형을 바꿀 수 있다 */
  pickQtype(src: 'new' | 'review' | 'exam', bp: number, rng: () => number, item?: string, stage?: Stage): string;
  makeQuestion(item: string, qtype: string, rng: () => number, extra?: Record<string, unknown>): Question;
  /** 단원 용어 대신 다른 문항(예: 국어·과학 객관식)을 낼 때. recent는 최근에 낸 그 문항들 */
  altItem?(src: 'new' | 'review' | 'exam', stage: Stage, bp: number, rng: () => number, recent: string[]): { item: string; qtype: string } | null;
  /** 승급 평가에서 뽑을 항목 (기본: stage.items) */
  examPool?(stage: Stage): string[];
}

/** 직전 정답 위치 기억 (프로토타입 hg-lastpos-*) */
export interface LastPosStore {
  get(key: string): number | undefined;
  set(key: string, pos: number): void;
}
