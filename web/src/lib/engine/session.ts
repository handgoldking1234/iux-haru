import { avoidLastPosition, pick, reshuffleForRetry, shuffle } from './choices';
import {
  addWrongCard, answerCard, applyReview, dueCards, dueStages, nextBp, passUnit, planDay,
} from './progress';
import { EXAM_CAP, EXAM_PASS_N, RULES, wrongCap } from './rules';
import type { Card, Env, LastPosStore, PlayQuestion, Progress, Stage, SubjectPlugin } from './types';

export type Mode = 'today' | 'cards' | 'new' | 'stage';

type QItem =
  | { src: 'card'; card: Card }
  | { src: 'review'; stage: string; free?: boolean }
  | { src: 'new' }
  | { src: 'exam'; stage: string }
  | { src: 'retry'; q: PlayQuestion };

/** 셸(보상)에 알리는 사건 — 프로토타입 postMessage({hg}) */
export type RewardEvent = 'ok' | 'no' | 'pass' | 'grad';

export type Step =
  | { kind: 'intro'; stage: Stage }
  | { kind: 'question'; q: PlayQuestion; index: number; total: number }
  | { kind: 'done' };

export interface AnswerLog {
  item: string;
  qtype: string;
  answer: string;
  chosen: string;
  ok: boolean;
  src: PlayQuestion['src'];
  stage: string;
  ms?: number;
}

export interface AnswerResult {
  ok: boolean;
  events: RewardEvent[];
  graduated: boolean;
  /** 단원 통과: 통과한 칸과 다음 칸 */
  passed?: { from: Stage; to: Stage };
  /** 틀림 상한에 닿아 그 단원을 소개부터 다시 */
  restart?: { stage: Stage; cap: number };
  /** 승급 평가에서 5개 틀려 평가가 끝남 */
  examStopped?: boolean;
  /** 같은 문제가 3문제 뒤 다시 나오는지 */
  retryQueued: boolean;
}

export interface SessionResult {
  log: AnswerLog[];
  passedNow: Stage[];
  reviews: { stage: string; n: number; wrong: number; outcome: ReturnType<typeof applyReview> }[];
  exam?: { stage: Stage; correct: number; n: number; score: number; pass: boolean; stopped: boolean };
  /** 단원별 이번 점수(%) — 학습결과 '최근 평균' */
  stageScores: Record<string, number>;
  restarts: number;
}

export interface SessionOptions {
  progress: Progress;
  stages: Stage[];
  plugin: SubjectPlugin;
  env: Env;
  lastPos: LastPosStore;
  mode: Mode;
  /** mode 'stage'일 때 단원 id */
  stageId?: string;
  /** 지워진 항목의 오답 카드를 거르기 위해 */
  known?: (item: string) => boolean;
}

const reviewItems = (ids: string[]): QItem[] =>
  ids.flatMap((stage) => Array.from({ length: RULES.REV_Q }, () => ({ src: 'review' as const, stage })));

/**
 * 한 번의 학습(오늘 학습·오답만·진도만·단원 연습) — 프로토타입 G 객체.
 * 진도(progress)는 이 객체가 직접 고친다. 저장은 부르는 쪽이 한다.
 */
export class StudySession {
  readonly p: Progress;
  readonly stages: Stage[];
  private readonly idx: Record<string, number>;
  private readonly o: SessionOptions;
  private q: QItem[];
  private i = 0;
  private cur: PlayQuestion | null = null;
  private answered = false;
  private recent: string[] = [];
  private recentAlt: string[] = [];
  private pool: string[] = [];
  private examStage: string | null = null;
  private examStopped = false;
  private reviewed: Record<string, { n: number; w: number; free: boolean }> = {};
  readonly log: AnswerLog[] = [];
  readonly passedNow: Stage[] = [];
  private restarts = 0;

  constructor(o: SessionOptions) {
    this.o = o;
    this.p = o.progress;
    this.stages = o.stages;
    this.idx = Object.fromEntries(o.stages.map((s, i) => [s.id, i]));
    this.q = this.buildQueue(o.mode, o.stageId);
  }

  get length() {
    return this.q.length;
  }
  get index() {
    return this.i;
  }
  private get today() {
    return this.o.env.today();
  }
  private curStage(): Stage {
    return this.stages[this.p.stage];
  }
  stageById(id: string): Stage | undefined {
    return this.stages[this.idx[id]];
  }

  private progressItems(n: number): QItem[] {
    const cs = this.curStage();
    return cs.kind === 'exam'
      ? Array.from({ length: RULES.EXAM_N }, () => ({ src: 'exam' as const, stage: cs.id }))
      : Array.from({ length: n }, () => ({ src: 'new' as const }));
  }

  private buildQueue(mode: Mode, stageId?: string): QItem[] {
    const p = this.p, t = this.today, known = this.o.known;
    if (mode === 'today') {
      const pl = planDay(p, this.stages, t, known);
      return [
        ...pl.cards.map((card) => ({ src: 'card' as const, card })),
        ...reviewItems(pl.reviews),
        ...this.progressItems(pl.n),
      ];
    }
    if (mode === 'cards') {
      const later = p.cards.filter((c) => c.due > t && (!known || known(c.item)));
      return [...dueCards(p, t, known), ...later]
        .slice(0, RULES.CARDS_ONLY_MAX)
        .map((card) => ({ src: 'card' as const, card }));
    }
    if (mode === 'new') {
      return [...reviewItems(dueStages(p).slice(0, RULES.SET_MAX_REVIEW_UNITS)), ...this.progressItems(RULES.NEW_ONLY_N)];
    }
    if (!stageId) return [];
    return Array.from({ length: RULES.NEW_ONLY_N }, () => ({ src: 'review' as const, stage: stageId, free: true }));
  }

  /** 단원 안에서 최근에 낸 항목을 피해 고른다 */
  private pickItem(s: Stage): string {
    const rng = this.o.env.rng;
    const c = s.items.filter((x) => !this.recent.includes(x));
    const h = pick(c.length ? c : s.items, rng);
    this.recent = [h, ...this.recent].slice(0, Math.min(4, s.items.length - 1));
    return h;
  }

  private resolve(it: QItem): PlayQuestion {
    const { plugin, env, lastPos } = this.o;
    const make = (item: string, qtype: string, extra?: Record<string, unknown>) => avoidLastPosition(plugin.makeQuestion(item, qtype, env.rng, extra), lastPos, env.rng);
    if (it.src === 'retry') return it.q;
    if (it.src === 'card') {
      return { ...make(it.card.item, it.card.qtype, it.card.extra), src: 'card', stage: it.card.stage, card: it.card };
    }
    if (it.src === 'exam') {
      const s = this.stageById(it.stage)!;
      const alt = plugin.altItem?.('exam', s, RULES.BP_MAX, env.rng, this.recentAlt);
      if (alt) return { ...make(alt.item, alt.qtype), src: 'exam', stage: s.id };
      if (!this.pool.length) this.pool = shuffle(plugin.examPool?.(s) ?? s.items, env.rng);
      const item = this.pool.pop()!;
      return { ...make(item, plugin.pickQtype('exam', RULES.BP_MAX, env.rng, item, s)), src: 'exam', stage: s.id };
    }
    const s = it.src === 'new' ? this.curStage() : this.stageById(it.stage)!;
    const bp = it.src === 'new' ? this.p.bp[s.id] ?? 0 : 7;
    const alt = plugin.altItem?.(it.src, s, bp, env.rng, this.recentAlt);
    if (alt) {
      this.recentAlt = [alt.item, ...this.recentAlt].slice(0, 6);
      return { ...make(alt.item, alt.qtype), src: it.src, stage: s.id };
    }
    const item = this.pickItem(s);
    return { ...make(item, plugin.pickQtype(it.src, bp, env.rng, item, s)), src: it.src, stage: s.id };
  }

  /** 지금 보여 줄 것: 단원 소개 / 문제 / 끝 */
  step(): Step {
    if (this.i >= this.q.length) return { kind: 'done' };
    if (this.cur) return { kind: 'question', q: this.cur, index: this.i, total: this.q.length };
    const it = this.q[this.i], cs = this.curStage();
    if (it.src === 'new' && cs.kind === 'exam') {
      this.q.splice(this.i, this.q.length - this.i, ...this.progressItems(0));
      return this.step();
    }
    if (it.src === 'new' && !this.p.read[cs.id]) return { kind: 'intro', stage: cs };
    this.cur = this.resolve(it);
    this.answered = false;
    return { kind: 'question', q: this.cur, index: this.i, total: this.q.length };
  }

  /** 소개 카드를 끝까지 넘겼을 때 */
  markRead(stageId: string) {
    this.p.read[stageId] = true;
  }

  answer(chosen: string, ms?: number): AnswerResult {
    const c = this.cur;
    if (!c || this.answered) throw new Error('답할 문제가 없어요');
    this.answered = true;
    const p = this.p, t = this.today, ok = chosen === c.answer;
    const res: AnswerResult = { ok, events: [ok ? 'ok' : 'no'], graduated: false, retryQueued: false };
    const cardId = () => Math.floor(this.o.env.rng() * 36 ** 6).toString(36);
    this.log.push({ item: c.item, qtype: c.qtype, answer: c.answer, chosen, ok, src: c.src, stage: c.stage, ms });

    if (c.src === 'card' && c.card) {
      if (answerCard(p, c.card, ok, t)) {
        res.graduated = true;
        res.events.push('grad');
      }
    }
    if (c.src === 'review') {
      const it = this.q[this.i] as Extract<QItem, { src: 'review' }>;
      const r = (this.reviewed[it.stage] ??= { n: 0, w: 0, free: !!it.free });
      r.n++;
      if (!ok) {
        r.w++;
        addWrongCard(p, c, t, cardId());
      }
    }
    if (c.src === 'exam') {
      this.examStage = c.stage;
      if (!ok) {
        addWrongCard(p, c, t, cardId());
        const w = this.log.filter((r) => r.src === 'exam' && !r.ok).length;
        if (w >= EXAM_CAP) {
          this.q = this.q.filter((it, j) => j <= this.i || it.src !== 'exam');
          this.examStopped = res.examStopped = true;
        }
      }
    }
    if (c.src === 'new') {
      const cs = this.curStage();
      p.bp[cs.id] = nextBp(p.bp[cs.id] ?? 0, ok, p.streak);
      if (ok) {
        p.streak++;
        if (p.streak >= RULES.GOAL && p.bp[cs.id] >= RULES.BP_HARD && p.stage < this.stages.length - 1) {
          passUnit(p, cs);
          this.passedNow.push(cs);
          res.events.push('pass');
          const nx = this.curStage();
          res.passed = { from: cs, to: nx };
          const due = dueStages(p);
          this.q.splice(this.i + 1);
          this.q.push(
            ...reviewItems(due.slice(0, 2)),
            ...this.progressItems(Math.max(4, RULES.NEW_ONLY_N - due.length * RULES.REV_Q))
              .slice(0, nx.kind === 'exam' ? RULES.EXAM_N : RULES.NEW_ONLY_N),
          );
        }
      } else {
        p.streak = 0;
        addWrongCard(p, c, t, cardId());
        p.wr[cs.id] = (p.wr[cs.id] ?? 0) + 1;
        const cap = wrongCap(cs.area);
        if (p.wr[cs.id] >= cap) {
          p.wr[cs.id] = 0;
          p.bp[cs.id] = 0;
          p.read[cs.id] = false;
          this.restarts++;
          res.restart = { stage: cs, cap };
        }
      }
    }
    if (!ok && c.src !== 'retry' && c.src !== 'exam') {
      const again = reshuffleForRetry(c, this.o.lastPos, this.o.env.rng);
      this.q.splice(Math.min(this.i + 1 + RULES.RETRY_AFTER, this.q.length), 0, {
        src: 'retry',
        q: { ...c, ...again, src: 'retry', card: undefined },
      });
      res.retryQueued = true;
    }
    return res;
  }

  /** 다음 문제로 */
  next() {
    this.cur = null;
    this.answered = false;
    this.i++;
  }

  /** 지금 단원 틀린 수 / 상한 (문제 화면 'O' 표시) */
  wrongCount(): { wrong: number; cap: number } {
    const s = this.curStage();
    if (s.kind === 'exam') return { wrong: this.log.filter((r) => r.src === 'exam' && !r.ok).length, cap: EXAM_CAP };
    return { wrong: this.p.wr[s.id] ?? 0, cap: wrongCap(s.area) };
  }

  /** 학습을 마칠 때: 복습 간격·승급 평가 결과를 진도에 반영 */
  finish(): SessionResult {
    const p = this.p;
    const reviews = Object.entries(this.reviewed).map(([stage, r]) => ({
      stage, n: r.n, wrong: r.w, outcome: r.free ? null : applyReview(p, stage, r.w),
    }));
    let exam: SessionResult['exam'];
    if (this.examStage) {
      const ex = this.log.filter((r) => r.src === 'exam');
      const correct = ex.filter((r) => r.ok).length;
      const s = this.stageById(this.examStage)!;
      const pass = ex.length >= RULES.EXAM_N && correct >= EXAM_PASS_N;
      exam = { stage: s, correct, n: ex.length, score: Math.round((correct / ex.length) * 100), pass, stopped: this.examStopped };
      if (pass && this.curStage().id === s.id) {
        p.np++;
        p.passed[s.id] = { exam: true, box: 2, score: exam.score };
        if (p.stage < this.stages.length - 1) p.stage++;
        else p.allDone = true;
        p.streak = 0;
      }
    }
    const per: Record<string, { n: number; c: number }> = {};
    for (const r of this.log) {
      if (r.src !== 'new' && r.src !== 'review') continue;
      const o = (per[r.stage] ??= { n: 0, c: 0 });
      o.n++;
      if (r.ok) o.c++;
    }
    const stageScores = Object.fromEntries(Object.entries(per).map(([id, o]) => [id, Math.round((o.c / o.n) * 100)]));
    return { log: this.log, passedNow: this.passedNow, reviews, exam, stageScores, restarts: this.restarts };
  }
}
