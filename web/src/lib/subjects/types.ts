/* 과목 화면 플러그인 — 프로토타입 과목 JS(hist.js 등)에서 과목마다 다른 부분만 모은다.
   화면 틀·진도·오답·복습은 공통(components/subject, lib/engine)이 맡는다. */
import type { Stage } from '../engine/types';
import type { SubjectKey } from '../subjects';

/** 학습 길의 칸 + 화면에 쓰는 정보 */
export interface SStage extends Stage {
  lvI: number;
  /** 학교급·급수 이름 */
  g: string;
  n?: number;
  title?: string;
  era?: string;
  sum?: string;
  tag?: string;
  /** 객관식 문항 id (국어·과학) */
  mcs?: string[];
  /** 과학 핵심 원리 */
  pr?: { h: string; b: string }[];
  pre?: string;
  /** 과학 통합: 영역 이름 */
  ar?: string;
  /** 과목 원래 단원 정보 (한자: kind·theme·ph·cjm) */
  raw?: Record<string, unknown>;
}

export interface Track<I = Record<string, unknown>> {
  key: string;
  stages: SStage[];
  items: Record<string, I>;
  all: string[];
  /** 항목 → 단원 id */
  stof: Record<string, string>;
}

/** 프로토타입 makeQ가 돌려주던 문제 (HTML 조각은 프로토타입과 같은 문자열) */
export interface PQ {
  item: string;
  qtype: string;
  ask: string;
  q: string;
  qc: string;
  hint: string;
  choices: string[];
  answer: string;
  long?: boolean;
  ox?: boolean;
  /** 보기 글자 표시 (한자: 한자 글꼴·부수 변형) */
  lab?: (v: string) => string;
  /** 쓰기 문제 (한자 획순) */
  write?: { trace: boolean };
  /** 철자 쓰기 (영단어: 키보드 또는 펜) */
  spell?: boolean;
  /** 보기 묶음 · 보기 글자 클래스 (영단어 enc·en, 한자 hzc·hz) */
  cc?: string;
  sc?: string;
  /** 문제가 나오면 읽어 줄 말 (듣고 고르기) */
  auto?: string;
  /** 다시 낼 때 필요한 정보 (오답 카드에 저장) */
  extra?: Record<string, unknown>;
}

export interface SubjectDef {
  key: SubjectKey;
  /** 갈래 이름 (국사·세계사 등) */
  tracks: Record<string, string>;
  defaultTrack: string;
  /** 학교급 순서 (단원 목록 칩) */
  areas: string[];
  /** 문제 유형 이름 */
  tname: Record<string, string>;
  setup(data: unknown, tr: string): Track;
  pickQtype(src: 'new' | 'review' | 'exam', bp: number, rng: () => number, item: string | undefined, T: Track, stage?: SStage): string;
  altItem?(T: Track, src: 'new' | 'review' | 'exam', stage: SStage, bp: number, rng: () => number, recent: string[]): { item: string; qtype: string } | null;
  examPool?(stage: SStage): string[];
  /** 탭2 첫 칸 이름 (프로토타입 nav#tabs) */
  tabName: string;
  /** 슬라이드 카드 (없으면 용어 카드) */
  slideKind?: 'eng' | 'han' | 'it';
  slideFace?(T: Track, id: string): import('../slide').Face | null;
  slideCard?(T: Track, id: string): string;
  /** 슬라이드 '지금 단원' 카드 (없으면 단원 항목) */
  slideUnit?(s: SStage): string[];
  /** 오답 카드 한 줄 (카드 유형·추가 정보까지 볼 때) */
  cardLineFull?(T: Track, item: string, c: { qtype: string; extra?: Record<string, unknown> }): string;
  /** 갈래 라인 탭 클래스 (국어·과학은 'trk tl3') */
  trkClass?: string;
  makeQ(T: Track, item: string, qtype: string, rng: () => number, extra?: Record<string, unknown>): PQ;
  /** 학습을 시작할 때 (한자: 지금 단계 급수로 보기 범위를 정함) */
  prepare?(T: Track, cur: SStage): void;
  /** 발음 듣기 버튼(data-say)을 눌렀을 때 */
  speak?(text: string): void;
  /** 화면 문구·모양 (없으면 국어·과학·역사 기본) */
  ui?: SubjectUI;
  infoHTML(T: Track, item: string): string;
  /** 오답노트·결과 목록 한 줄 */
  cardLine(T: Track, item: string): string;
  /** 학습결과 '많이 틀리는' 한 줄 */
  worstLine(T: Track, item: string): string;
  worstTitle: string;
  /** 개념 정리 첫 장 / 마지막 장 (gate = 처음 들어가는 단원) */
  conceptIntro(T: Track, s: SStage, trName: string): string;
  conceptEnd(s: SStage, gate: boolean, cap: number): string;
  examIntro(s: SStage, trName: string): string;
  /** 단원 목록 아래 설명 */
  homeNote: string;
  /** 단원 목록 제목 옆 */
  listSub(trName: string): string;
  /** 바로가기 '개념 정리' 이름 */
  conceptName: string;
  /** 오늘 학습 줄 "○○의 국사 학습" */
  appName: string;
}

/** 과목마다 다른 화면 문구·모양 — 기본은 국어·과학·역사(hist.js)와 같음 */
export interface SubjectUI {
  /** '개념 정리' | '단원 소개' (버튼·안내) */
  intro: string;
  /** 단원 옆 알약 '개념' | '소개' */
  qIcon: string;
  /** 틀린 '용어' | '한자' */
  thing: string;
  /** 틀리면 설명을 보여 주는 시간(ms) · 맞히면 넘어가는 시간 */
  autoNo: number;
  okDelay?: number;
  /** 채점 줄의 정답 표시(HTML) */
  fbAns?(q: PQ): string;
  /** 문제를 보여 줄 때 · 답한 뒤 (영단어 발음) */
  onShow?(q: PQ): void;
  onAnswer?(q: PQ, ok: boolean): void;
  /** 펜으로 쓰기 켜짐 (영단어 철자 문제) */
  pen?(): boolean;
  /** 문제판 클래스 */
  boardCls: string;
  /** 문제 위 태그에 틀린 개수도 표시 */
  ptagWrong: boolean;
  /** 맞힌 뒤 설명 제목 */
  okMore: string;
  /** 결과에서 '내 답'도 표시 */
  showYou: boolean;
  /** 학습결과 정답률 제목 */
  statTitle: string;
  /** TODAY 줄 문구 */
  todayText(kid: string, trName: string): string;
  /** 결과 화면 홈 버튼 */
  homeBtn(trName: string): string;
  /** 학습 길 옆 숫자 */
  learned(T: Track, stage: number, trName: string): string;
  /** 단원 목록 한 줄 제목(HTML) · 지금 단원 제목(HTML) */
  unitTitle(s: SStage): string;
  nowTitle(s: SStage): string;
  /** 잠긴 단원 · 평가 설명 */
  lockedSub(s: SStage): string;
  examSub(s: SStage): string;
  examStreak(s: SStage): string;
  /** 단원 목록 아래 덧붙임(HTML) */
  homeAfter?(T: Track): string;
  /** 틀린 뒤 설명 카드(HTML) */
  afterInfo?(T: Track, q: PQ): string;
  /** 정답률을 모을 영역 */
  statArea?(T: Track, q: PQ, s: SStage): string;
  /** 개념 단계 이름: 첫 장 · 항목 · 한자 글꼴 여부 */
  stepFirst: string;
  stepLabel?(T: Track, id: string): string;
  stepHz: boolean;
  /** 개념 카드 한 장(HTML) — 없으면 infoHTML */
  conceptItem?(T: Track, s: SStage, id: string): string;
  /** 개념 카드에서 따라 써야 넘어가는 글자인지 · 쓰기 방식(한자 획순 / 펜) */
  conceptTrace?(id: string): boolean;
  traceKind?: 'hanzi' | 'ink';
  traceLabel?(id: string): string;
  /** 개념 카드를 볼 때 · 첫 장 단어 칸을 누를 때 (영단어 발음) */
  conceptShow?(id: string): void;
  conceptGrid?(id: string): void;
  /** 홈 맨 위(갈래 탭 아래) 설정 줄 */
  writeToggle?: { get(): boolean; set(on: boolean): void; label: string; small: string; inSection?: boolean };
}
