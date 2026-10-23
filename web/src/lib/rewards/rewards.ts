/**
 * 보상 규칙 — docs/03_rules.md 5장 (프로토타입 hgs.js).
 * - 캐시: 정답 +1, 오답 −1, 0 밑으로 안 내려감 · 공부 캐시 하루 최대 150
 * - 보너스: 5문제 연속 +3 · 오답 졸업 +5 · 단원 통과 +20 · 오늘 할 일 완료 +20 · 밀린 하루치 다 갚으면 +5
 * - XP는 맞힌 문제 수로만 쌓이고 내려가지 않음
 * - 오늘 할 일을 모두 끝내야 꾸미기·게임이 열림 · 하루 3판(1/3/5) · 할 일 뒤 20문제 더 맞히면 +1판
 * - 게임 캐시 하루 최대 30 · 밤 9시 잠금(선택) · 밀린 공부 7일
 * 상태를 직접 고치고(mutable), 날짜·시각은 밖에서 넣는다.
 */
import { SUBJECT_KEYS, SUBJECTS, type SubjectKey } from '../subjects';

export const STUDY_CAP = 150;
export const GAME_CAP = 30;
export const MORE = 20;
export const STREAK_BONUS = { every: 5, cash: 3 };
export const BONUS = { grad: 5, pass: 20, done: 20, backDay: 5 };
export const BACKLOG_DAYS = 7;
export const CURFEW_HOUR = 21;
export const GAME_LIMITS = [1, 3, 5] as const;

export type Plan = Record<SubjectKey, number>;
export const DEFAULT_PLAN: Plan = { math: 20, hanja: 10, eng: 10, kor: 10, hist: 0, sci: 0, typ: 0 };

export const GRADES = [
  { n: '씨앗', x: 0, icon: 'circle-dot' },
  { n: '새싹', x: 150, icon: 'sprout' },
  { n: '잎새', x: 400, icon: 'leaf' },
  { n: '꽃', x: 800, icon: 'flower-2' },
  { n: '나무', x: 1300, icon: 'tree-deciduous' },
  { n: '숲', x: 2000, icon: 'trees' },
  { n: '별', x: 3000, icon: 'star' },
] as const;

export interface DayState {
  d: number;
  cash: number;
  ok: number;
  no: number;
  by: Partial<Record<SubjectKey, number>>;
  byNo: Partial<Record<SubjectKey, number>>;
  streak: number;
  game: number;
  played: number;
  bonus: boolean;
  doneAt?: number;
  more: boolean;
  plan: Plan;
}

export interface DayLog {
  by: Partial<Record<SubjectKey, number>>;
  byNo?: Partial<Record<SubjectKey, number>>;
  no?: number;
  plan: Plan;
  paid: Partial<Record<SubjectKey, number>>;
  done?: boolean;
}

export interface Alarm {
  t: string;
  on: boolean;
  label: string;
}

/** 꾸미기 슬롯 (프로토타입 st.eq) */
export interface Equip {
  body: string;
  hat: string;
  face: string;
  outfit: string;
  bg: string;
  hold: string;
}
export const DEFAULT_EQ: Equip = { body: 'cream', hat: 'sprout', face: 'basic', outfit: 'none', bg: 'none', hold: 'none' };
export const DEFAULT_ALARMS: Alarm[] = [
  { t: '16:00', on: true, label: '공부할 시간' },
  { t: '20:00', on: true, label: '오늘 할 일 확인' },
];

export interface RewardState {
  xp: number;
  cash: number;
  total: number;
  /** 주 번호별 XP (이번 주 랭킹) */
  wk: Record<number, number>;
  plan: Plan;
  gameLimit: (typeof GAME_LIMITS)[number];
  curfew: boolean;
  backGate: boolean;
  /** 가입한 날 — 밀린 공부는 이날부터 센다 */
  since: number;
  day: DayState | null;
  log: Record<number, DayLog>;
  eq: Equip;
  owned: string[];
  alarms: Alarm[];
  /** 지난날 기록 (마이 통계·도장) */
  hist: Record<number, { ok: number; no: number; done: boolean }>;
  /** 설정 · 게임 기록 (없으면 기본값) */
  sfx?: boolean;
  engWrite?: boolean;
  hanjaWrite?: boolean;
  best?: Record<string, number>;
  wins?: number;
  battles?: number;
  typCpm?: number;
  guMiss?: Record<string, number>;
  /** 놀이터 닉네임 (게임 화면이 읽음) */
  name?: string;
}

/** 로컬 날짜 기준 일 번호 (프로토타입 dayN) */
export const dayNumber = (d: Date) => Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 864e5);
export const weekNumber = (day: number) => Math.floor((day + 3) / 7);

export const freshRewards = (today: number): RewardState => ({
  xp: 0, cash: 30, total: 0, wk: {}, plan: { ...DEFAULT_PLAN }, gameLimit: 3,
  curfew: false, backGate: true, since: today, day: null, log: {},
  eq: { ...DEFAULT_EQ }, owned: [], alarms: DEFAULT_ALARMS.map((a) => ({ ...a })), hist: {},
});

/** 예전에 저장한 상태에 새로 생긴 칸을 채운다 */
export function upgradeRewards(st: RewardState, today: number): RewardState {
  const f = freshRewards(today);
  for (const k of Object.keys(f) as (keyof RewardState)[]) {
    if (st[k] === undefined) (st as unknown as Record<string, unknown>)[k] = f[k];
  }
  return st;
}

export const gradeOf = (xp: number) => {
  let k = 0;
  GRADES.forEach((g, i) => {
    if (xp >= g.x) k = i;
  });
  return k;
};

/** 오늘 상태. 날이 바뀌었으면 어제 것을 기록으로 넘기고 새로 만든다 */
export function ensureDay(st: RewardState, today: number): DayState {
  if (st.day && st.day.d === today) return st.day;
  if (st.day) {
    const o = st.day;
    st.log[o.d] = { by: o.by, byNo: o.byNo, no: o.no, plan: o.plan, paid: {}, done: o.bonus };
    (st.hist ??= {})[o.d] = { ok: o.ok, no: o.no, done: o.bonus };
  }
  for (const k of Object.keys(st.log)) if (+k < today - (BACKLOG_DAYS + 1)) delete st.log[+k];
  st.day = { d: today, cash: 0, ok: 0, no: 0, by: {}, byNo: {}, streak: 0, game: 0, played: 0, bonus: false, more: false, plan: { ...st.plan } };
  return st.day;
}

export interface BacklogItem {
  d: number;
  k: SubjectKey;
  rem: number;
  goal: number;
}

/** 지난 7일 동안 못 끝낸 할 일 (오래된 것부터) */
export function backlog(st: RewardState, today: number): BacklogItem[] {
  ensureDay(st, today);
  const out: BacklogItem[] = [];
  for (let d = Math.max(today - BACKLOG_DAYS, st.since); d < today; d++) {
    const L = (st.log[d] ??= { by: {}, plan: { ...st.plan }, paid: {} });
    for (const k of SUBJECT_KEYS) {
      const g = L.plan[k] ?? 0;
      if (!g) continue;
      const rem = g - Math.min(g, L.by[k] ?? 0) - (L.paid[k] ?? 0);
      if (rem > 0) out.push({ d, k, rem, goal: g });
    }
  }
  return out;
}

export const backlogTotal = (st: RewardState, today: number) => backlog(st, today).reduce((a, b) => a + b.rem, 0);

export function tasks(st: RewardState, today: number) {
  const d = ensureDay(st, today);
  return SUBJECT_KEYS.filter((k) => (st.plan[k] ?? 0) > 0).map((k) => ({
    k, name: SUBJECTS[k].name, goal: st.plan[k], n: Math.min(d.by[k] ?? 0, st.plan[k]),
  }));
}

export const todayDone = (st: RewardState, today: number) => tasks(st, today).every((t) => t.n >= t.goal);
export const allDone = (st: RewardState, today: number) =>
  todayDone(st, today) && (!st.backGate || backlogTotal(st, today) === 0);

export const gameLimit = (st: RewardState, today: number) => st.gameLimit + (ensureDay(st, today).more ? 1 : 0);
export const gamesLeft = (st: RewardState, today: number) => Math.max(0, gameLimit(st, today) - ensureDay(st, today).played);

export type Block = { k: 'study' | 'night' | 'used'; msg: string } | null;

/** 꾸미기·게임이 잠겼으면 이유를 돌려준다 */
export function block(st: RewardState, now: Date): Block {
  const today = dayNumber(now);
  const ts = tasks(st, today);
  if (!todayDone(st, today)) {
    return { k: 'study', msg: `오늘 할 일을 모두 끝내면 열려요 (${ts.filter((t) => t.n >= t.goal).length}/${ts.length} 완료)` };
  }
  if (!allDone(st, today)) return { k: 'study', msg: `밀린 공부 ${backlogTotal(st, today)}문제를 끝내면 열려요` };
  if (st.curfew && now.getHours() >= CURFEW_HOUR) return { k: 'night', msg: '밤 9시가 지나면 게임은 쉬어요. 내일 만나요' };
  if (gamesLeft(st, today) <= 0) return { k: 'used', msg: '오늘 게임을 다 했어요. 내일 다시 열려요' };
  return null;
}

export function takeTicket(st: RewardState, now: Date): boolean {
  if (block(st, now)) return false;
  ensureDay(st, dayNumber(now)).played++;
  return true;
}

function earn(st: RewardState, d: DayState, n: number) {
  const v = Math.max(0, Math.min(n, STUDY_CAP - d.cash));
  d.cash += v;
  st.cash += v;
  return v;
}

function lose(st: RewardState, d: DayState, n: number) {
  const v = Math.min(n, st.cash);
  d.cash -= v;
  st.cash -= v;
  return -v;
}

/** 게임 캐시 (하루 최대 30) */
export function gameEarn(st: RewardState, today: number, n: number) {
  const d = ensureDay(st, today);
  const v = Math.max(0, Math.min(n, GAME_CAP - d.game));
  d.game += v;
  st.cash += v;
  return v;
}

export interface EventOut {
  gain: number;
  msg: string[];
  /** 등급이 오르면 새 등급 순번 */
  gradeUp?: number;
}

const md = (day: number) => {
  const dt = new Date(day * 864e5);
  return `${dt.getUTCMonth() + 1}/${dt.getUTCDate()}`;
};

/** 과목 화면의 결과(ok·no·pass·grad)를 받아 캐시·XP·할 일을 계산한다 (프로토타입 HGS.event) */
export function rewardEvent(st: RewardState, e: 'ok' | 'no' | 'pass' | 'grad', s: SubjectKey, today: number): EventOut {
  const d = ensureDay(st, today);
  const out: EventOut = { gain: 0, msg: [] };
  if (e === 'ok') {
    d.ok++;
    d.by[s] = (d.by[s] ?? 0) + 1;
    st.total++;
    d.streak++;
    out.gain += earn(st, d, 1);
    if (d.streak % STREAK_BONUS.every === 0) out.gain += earn(st, d, STREAK_BONUS.cash);
    const before = gradeOf(st.xp);
    st.xp++;
    const wk = weekNumber(today);
    st.wk[wk] = (st.wk[wk] ?? 0) + 1;
    const after = gradeOf(st.xp);
    if (after > before) {
      out.gradeUp = after;
      out.msg.push(`'${GRADES[after].n}' 등급이 됐어요!`);
    }
    const g = st.plan[s] ?? 0;
    if (g > 0 && d.by[s] === g && !allDone(st, today)) out.msg.push(`${SUBJECTS[s].name} 할 일 완료!`);
    if ((d.by[s] ?? 0) > g) {
      const b = backlog(st, today).find((x) => x.k === s);
      if (b) {
        const L = st.log[b.d];
        L.paid[s] = (L.paid[s] ?? 0) + 1;
        if (!backlog(st, today).some((x) => x.d === b.d)) {
          out.gain += earn(st, d, BONUS.backDay);
          out.msg.push(`${md(b.d)} 밀린 공부 완료 +${BONUS.backDay}`);
        }
      }
    }
    if (allDone(st, today) && !d.bonus) {
      d.bonus = true;
      d.doneAt = d.ok;
      out.gain += earn(st, d, BONUS.done);
      out.msg.push(`오늘 할 일 완료! 꾸미기·게임이 열렸어요 +${BONUS.done}`);
    }
    if (d.bonus && !d.more && d.ok >= (d.doneAt ?? 0) + MORE) {
      d.more = true;
      out.msg.push(`${MORE}문제 더 맞혔어요! 게임 +1판`);
    }
  } else if (e === 'no') {
    d.no++;
    d.byNo[s] = (d.byNo[s] ?? 0) + 1;
    d.streak = 0;
    out.gain += lose(st, d, 1);
  } else if (e === 'pass') {
    out.gain += earn(st, d, BONUS.pass);
    out.msg.push(`단원 통과! +${BONUS.pass}캐시`);
  } else if (e === 'grad') {
    out.gain += earn(st, d, BONUS.grad);
  }
  return out;
}
