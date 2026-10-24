'use client';
/**
 * 과목 화면 공통 틀 — 프로토타입 과목 JS(hist.js·kor.js·sci.js·app.js·eng.js는 같은 구조)의
 * renderHome · renderCards · renderReport · concept · drawPlay · choose · finish 마크업을 그대로 옮겼다.
 * 과목마다 다른 문구·모양은 def.ui, 문제는 def.makeQ. 진도·오답·복습·승급 계산은 lib/engine(StudySession).
 */
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import StudyTop from '@/components/StudyTop';
import { useKid } from '@/components/Kid';
import { dueCards, dueStages, planDay } from '@/lib/engine/progress';
import { EXAM_CAP, LEVEL_NAME, levelOf, RULES, wrongCap } from '@/lib/engine/rules';
import { StudySession, type AnswerResult, type Mode, type SessionResult } from '@/lib/engine/session';
import type { PlayQuestion, Stage } from '@/lib/engine/types';
import { report } from '@/lib/feedback';
import { dayNumber } from '@/lib/rewards/rewards';
import { createSlide, SIC, termCard, termFace } from '@/lib/slide';
import { freshSave, lastPosStore, loadSave, loadTrack, storeSave, storeTrack, type SubjectSave } from '@/lib/subjectStore';
import type { PQ, SStage, SubjectDef, SubjectUI, Track } from '@/lib/subjects/types';
import { DEFAULT_UI } from '@/lib/subjects/ui';
import L, { H } from './L';
import Timeline from './Timeline';
import { InkModal, IntroInk, SpellInput, SpellPen } from './Ink';
import { IntroTrace, TraceModal, WritePad } from './Writer';

const { GOAL, SET, REV_Q, EXAM_N, EXAM_PASS } = RULES;
const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const dlabel = (d: number) => { const t = new Date(d * 864e5); return `${t.getUTCMonth() + 1}/${t.getUTCDate()}(${DOW[t.getUTCDay()]})`; };
const mmS = (ms: number) => { const m = Math.round((ms || 0) / 60000); return m < 60 ? `${m}분` : `${Math.floor(m / 60)}시간 ${m % 60}분`; };
const mmss = (ms: number) => { const s = Math.round(ms / 1000); return s < 60 ? `${s}초` : `${Math.floor(s / 60)}분 ${s % 60}초`; };
const SRC: Record<string, string> = { card: '오답 다시', review: '단원 복습', new: '새 진도', retry: '방금 틀린 문제', exam: '승급 평가' };
const AUTO_OK = 600, AUTO_LONG = 3800;

type Tab = 'home' | 'cards' | 'report';
type Done = { q: PQ; you: string; ok: boolean; src: string; stage: string };
type View =
  | null
  | { k: 'concept'; id: string; gate: boolean; at?: string; back: () => void; practice?: () => void }
  | { k: 'play' }
  | { k: 'result'; res: SessionResult; done: Done[]; title: string; time: string; examStop: boolean; restarts: number }
  | { k: 'tl' };

interface PlayState {
  q: PlayQuestion & { view: PQ };
  answered: boolean;
  chosen: number | null;
  res: AnswerResult | null;
  toast: string;
  stopped: boolean;
  /** 철자 문제를 키보드로 쓰기로 바꿈 */
  kbd?: boolean;
}

function ring(pct: number, big: string, sub: string, col?: string) {
  const r = 52, C = 2 * Math.PI * r, d = Math.max(0, Math.min(1, pct)) * C;
  return `<svg viewBox="0 0 140 140" class="ring" role="img" aria-label="${big} ${sub}"><circle cx="70" cy="70" r="${r}" fill="none" stroke="var(--hi)" stroke-width="12"/><circle cx="70" cy="70" r="${r}" fill="none" stroke="${col || 'var(--y)'}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${d} ${C}" transform="rotate(-90 70 70)"/><text x="70" y="72" text-anchor="middle" font-size="30" font-weight="900" fill="var(--k)">${big}</text><text x="70" y="94" text-anchor="middle" font-size="11.5" fill="var(--sub)">${sub}</text></svg>`;
}

/** 틀림 옆 안내 아이콘: 누르면 틀린 개수·개념 보기 안내를 팝업으로 (사용자 요청 — 문제 아래 칸 대신) */
function WrongTip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);
  return (
    <span className="wtip">
      <button type="button" className="wtb" aria-label="틀린 개수 안내" aria-expanded={open} onClick={(e) => { e.stopPropagation(); setOpen(!open); }}><L n="info" /></button>
      {open && <span className="wpop" role="dialog" onClick={(e) => e.stopPropagation()}>{children}</span>}
    </span>
  );
}

export default function SubjectApp({ def, data }: { def: SubjectDef; data: unknown }) {
  const { kid } = useKid();
  const ui: SubjectUI = def.ui ?? DEFAULT_UI;
  const Q_ICON = <span className="pillq">{ui.qIcon}</span>;
  const [tr, setTr] = useState(() => {
    const t = loadTrack(def.key, def.defaultTrack);
    return def.tracks[t] ? t : def.defaultTrack;
  });
  const T: Track = useMemo(() => def.setup(data, tr), [def, data, tr]);
  const [S, setS] = useState<SubjectSave>(() => loadSave(kid.name, def.key, tr));
  const [tab, setTab] = useState<Tab>('home');
  const [view, setView] = useState<View>(null);
  const [areaF, setAreaF] = useState<string | null>(null);
  const [ps, setPs] = useState<PlayState | null>(null);
  const [slideOpen, setSlideOpen] = useState(false);
  const [wbN, setWbN] = useState(0);
  const [trace, setTrace] = useState<{ ch: string; kind: 'hanzi' | 'ink' } | null>(null);
  const [, bump] = useState(0);
  const slideHost = useRef<HTMLDivElement>(null);
  const slide = useRef<ReturnType<typeof createSlide> | null>(null);
  const sess = useRef<StudySession | null>(null);
  const doneQ = useRef<Done[]>([]);
  const meta = useRef({ title: '', began: 0, away: 0, t0: 0 });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const screen = useRef<HTMLDivElement>(null);
  const lastPos = useMemo(() => lastPosStore(def.appName), [def.appName]);
  const trName = def.tracks[tr];
  const p = S.p;
  const today = dayNumber(new Date()) + S.offset;
  const stages = T.stages;
  const IDX = useMemo(() => Object.fromEntries(stages.map((s, i) => [s.id, i])), [stages]);
  const curSt = stages[p.stage];
  const areas = def.areas.filter((a) => stages.some((s) => s.area === a));
  const known = useCallback((id: string) => !!T.items[id], [T]);
  const autoNo = ui.autoNo;

  useEffect(() => { setS(loadSave(kid.name, def.key, tr)); setAreaF(null); }, [kid.name, def.key, tr]);
  const persist = useCallback((s: SubjectSave) => { storeSave(kid.name, def.key, tr, s); setS({ ...s }); }, [kid.name, def.key, tr]);
  const toTop = () => screen.current?.scrollTo(0, 0);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  /* 슬라이드 · 단어장 (프로토타입 slide.js) */
  const live = useRef({ S, today, stages });
  live.current = { S, today, stages };
  useEffect(() => {
    if (!slideHost.current) return;
    const face = (id: string) => (def.slideFace ? def.slideFace(T, id) : termFace(T.items[id] as never, id));
    const sl = createSlide({
      kind: def.slideKind ?? 'it', title: def.appName, kid: kid.name, face,
      card: (id) => (def.slideCard ? def.slideCard(T, id) : termCard(T.items[id] as never, def.areas)),
      wrongIds: () => dueCards(live.current.S.p, live.current.today, (x) => !!T.items[x]).map((c) => c.item),
      unitIds: () => {
        // 지금 단원(평가 차례면 그 앞 단원)의 항목
        const { S: s0, stages: st } = live.current;
        for (let i = Math.min(s0.p.stage, st.length - 1); i >= 0; i--) if (st[i].kind === 'unit' && st[i].items.length) return def.slideUnit ? def.slideUnit(st[i]) : st[i].items;
        return [];
      },
      onOpen: () => setSlideOpen(true),
      onClose: () => { setSlideOpen(false); setWbN(sl.wbCount()); },
    }, slideHost.current);
    slide.current = sl;
    setWbN(sl.wbCount());
    return () => { sl.destroy(); slide.current = null; };
  }, [def, T, kid.name]);

  // 정보 카드의 '따라 쓰기'(data-trace 한자 · data-etrace 영단어)와 발음 듣기(data-say)
  useEffect(() => {
    const el = screen.current;
    if (!el) return;
    const f = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const b = t.closest<HTMLElement>('[data-trace]'), eb = t.closest<HTMLElement>('[data-etrace]'), sb = t.closest<HTMLElement>('[data-say]');
      if (b) { e.preventDefault(); setTrace({ ch: b.dataset.trace!, kind: 'hanzi' }); }
      else if (eb) { e.preventDefault(); setTrace({ ch: eb.dataset.etrace!, kind: 'ink' }); }
      else if (sb && def.speak) { e.stopPropagation(); def.speak(sb.dataset.say!); }
    };
    el.addEventListener('click', f);
    return () => el.removeEventListener('click', f);
  }, [def]);

  const go = (t: Tab) => { setTab(t); setView(null); sess.current = null; setPs(null); toTop(); };
  const cardLine = (item: string, c: { qtype: string; extra?: Record<string, unknown> }) => (def.cardLineFull ? def.cardLineFull(T, item, c) : def.cardLine(T, item));

  /* ---------- 풀이 ---------- */
  const plugin = useMemo(() => ({
    key: def.key,
    pickQtype: (src: 'new' | 'review' | 'exam', bp: number, rng: () => number, item?: string, st?: Stage) => def.pickQtype(src, bp, rng, item, T, st as SStage),
    altItem: def.altItem ? (src: 'new' | 'review' | 'exam', st: Stage, bp: number, rng: () => number, recent: string[]) => def.altItem!(T, src, st as SStage, bp, rng, recent) : undefined,
    examPool: def.examPool ? (st: Stage) => def.examPool!(st as SStage) : undefined,
    makeQuestion: (item: string, qtype: string, rng: () => number, extra?: Record<string, unknown>) => {
      const pq = def.makeQ(T, item, qtype, rng, extra);
      return { item, qtype: pq.qtype, choices: pq.choices, answer: pq.answer, ox: pq.ox, write: !!pq.write, extra: pq.extra, view: pq };
    },
  }), [def, T]);

  function advance(toast = '') {
    const s = sess.current!;
    const st = s.step();
    if (st.kind === 'done') return finish();
    if (st.kind === 'intro') {
      const t0 = performance.now();
      setPs(null);
      setView({
        k: 'concept', id: st.stage.id, gate: true,
        back: () => { sess.current = null; setView(null); },
        practice: () => { s.markRead(st.stage.id); persist(S); meta.current.away += performance.now() - t0; setView({ k: 'play' }); advance(toast); },
      });
      return;
    }
    meta.current.t0 = performance.now();
    setPs({ q: st.q as PlayState['q'], answered: false, chosen: null, res: null, toast, stopped: false });
    setView({ k: 'play' });
    toTop();
  }

  function start(mode: Mode, title: string, stageId?: string) {
    def.prepare?.(T, curSt);
    const s = new StudySession({ progress: S.p, stages, plugin, lastPos, mode, stageId, known, env: { rng: Math.random, today: () => today } });
    if (!s.length) return;
    sess.current = s;
    doneQ.current = [];
    meta.current = { title, began: performance.now(), away: 0, t0: 0 };
    advance();
  }

  function next(toast = '') {
    if (timer.current) clearTimeout(timer.current);
    const s = sess.current;
    if (!s) return;
    s.next();
    advance(toast);
  }

  // 문제를 보여 줄 때 (듣고 고르기는 자동으로 읽어 줌)
  const shownQ = useRef<unknown>(null);
  useEffect(() => {
    if (ps && !ps.answered && shownQ.current !== ps.q) { shownQ.current = ps.q; ui.onShow?.(ps.q.view); }
  });

  const choose = (k: number) => answerWith(ps!.q.choices[k], k);
  function answerWith(you0: string, k: number | null) {
    const s = sess.current;
    if (!s || !ps || ps.answered) return;
    const q = ps.q, ms = Math.min(performance.now() - meta.current.t0, 60000);
    // 철자 문제는 대소문자를 가리지 않음
    const you = q.view.spell && you0.toLowerCase() === q.answer.toLowerCase() ? q.answer : you0;
    const st = stages[IDX[q.stage]] ?? curSt;
    const res = s.answer(you, ms);
    res.events.forEach((e) => report(kid.name, e, def.key));
    doneQ.current.push({ q: { ...q.view, choices: q.choices, extra: q.extra }, you, ok: res.ok, src: q.src, stage: q.stage });
    // 날짜별·영역별 기록
    const ok = res.ok, ar = ui.statArea ? ui.statArea(T, q.view, st) : (stages[IDX[T.stof[q.item]]] ?? st).area;
    S.stat[ar] = S.stat[ar] || { n: 0, c: 0 };
    S.stat[ar].n++; if (ok) S.stat[ar].c++;
    const h = (S.hist[today] = S.hist[today] || { n: 0, c: 0, ms: 0 });
    h.n++; if (ok) h.c++; h.ms = (h.ms || 0) + ms;
    persist(S);
    setPs({ ...ps, answered: true, chosen: k, res, toast: '' });
    ui.onAnswer?.(q.view, ok);
    const toast = res.graduated ? '오답 졸업!' : '';
    if (ok && !res.passed && !res.restart) { timer.current = setTimeout(() => next(toast), ui.okDelay ?? AUTO_OK); return; }
    timer.current = setTimeout(() => next(toast), res.passed || res.restart || res.examStopped ? AUTO_LONG : autoNo);
  }

  function finish() {
    const s = sess.current!;
    const res = s.finish();
    Object.entries(res.stageScores).forEach(([id, sc]) => { const a = (S.sst[id] = S.sst[id] || []); a.push(sc); if (a.length > 3) a.shift(); });
    persist(S);
    const time = mmss(performance.now() - meta.current.began - meta.current.away);
    sess.current = null;
    setPs(null);
    setTab('home');
    setView({ k: 'result', res, done: doneQ.current, title: meta.current.title, time, examStop: !!res.exam?.stopped, restarts: res.restarts });
    toTop();
  }

  // 1~4 키로 고르기, 답한 뒤 Enter로 다음
  useEffect(() => {
    if (view?.k !== 'play' || !ps) return;
    const f = (e: KeyboardEvent) => {
      if (ps.answered) { if (e.key === 'Enter') { e.preventDefault(); next(); } return; }
      if (!ps.q.view.write && !ps.q.view.spell && /^[1-4]$/.test(e.key) && +e.key <= ps.q.choices.length) choose(+e.key - 1);
    };
    document.addEventListener('keydown', f);
    return () => document.removeEventListener('keydown', f);
  });

  function openConcept(id: string, back: () => void, at?: string) {
    const i = IDX[id], s = stages[i], unlocked = (p.passed[id] || i === p.stage) && s.kind !== 'exam';
    setView({
      k: 'concept', id, gate: false, at, back,
      practice: unlocked ? () => (i === p.stage ? start('new', s.name) : start('stage', `${s.name} 복습`, id)) : undefined,
    });
    toTop();
  }

  function openFromPlay() {
    if (!ps) return;
    if (timer.current) clearTimeout(timer.current);
    const keep = ps, t0 = performance.now(), sid = ps.q.stage;
    setView({
      k: 'concept', id: sid, gate: false, at: ps.q.item,
      back: () => { meta.current.away += performance.now() - t0; if (keep.answered) { setView({ k: 'play' }); next(); } else { setPs(keep); setView({ k: 'play' }); } },
    });
  }

  /* ---------- 화면 ---------- */
  const sub = slideOpen || (!!view && view.k !== 'result');
  const introWord = ui.intro === '단원 소개' ? '소개' : '개념 정리';
  let barTitle = '', barBack: (() => void) | null = null, barHelp: (() => void) | null = null;
  let body: React.ReactNode = null;

  if (view?.k === 'concept') {
    const s = stages[IDX[view.id]];
    barTitle = s.name;
    barBack = view.back;
    body = <Concept key={view.id + (view.at ?? '')} def={def} ui={ui} T={T} s={s} gate={view.gate} at={view.at} trName={trName} isNow={IDX[view.id] === p.stage}
      passedScore={(() => { const x = p.passed[view.id]; return x && x.exam ? x.score : null; })()}
      onClose={view.back} onDone={view.gate ? view.practice! : view.back} onPractice={view.gate ? undefined : view.practice}
      onExamStart={() => start('new', s.name)} />;
  } else if (view?.k === 'tl') {
    barTitle = '한눈에 보는 연표';
    barBack = () => go('home');
    body = <Timeline data={data} initial={tr} />;
  } else if (view?.k === 'play' && ps && sess.current) {
    const s = sess.current, c = ps.q, v = c.view, st = stages[IDX[c.stage]] ?? curSt;
    barTitle = meta.current.title;
    barBack = () => { if (timer.current) clearTimeout(timer.current); sess.current = null; setPs(null); setView(null); };
    barHelp = c.src === 'exam' ? null : openFromPlay;
    const ex = s.log.filter((r) => r.src === 'exam');
    const lv = LEVEL_NAME[levelOf(p.bp[st.id] ?? 0)];
    const wc = s.wrongCount(), sw = s.log.filter((r) => !r.ok).length, cs = curSt;
    const r = ps.res, last = s.index >= s.length - 1;
    const lab = v.lab;
    const passMsg = r?.passed ? `${r.passed.from.name} 통과! ${r.passed.to.kind === 'exam' ? `이제 ${r.passed.to.name}에 도전해요` : `다음 단원은 ${introWord}부터 시작해요`} · 3단원 뒤에 복습해요` : '';
    const restart = r?.restart ? `${r.restart.cap}개를 틀려서 「${r.restart.stage.name}」을 처음부터 다시 시작해요. ${introWord}부터 다시 봐요.` : r?.examStopped ? `${EXAM_CAP}개를 틀려서 평가가 끝났어요. 틀린 ${ui.thing}를 복습하고 다시 도전해요.` : '';
    const fbHtml = !ps.answered ? '' : r!.ok ? '정답!' : (v.long ? '정답은 초록색 설명이에요' : `정답은 ${ui.fbAns ? ui.fbAns({ ...v, answer: c.answer }) : c.answer}`) + (c.src === 'exam' ? ' · 오답노트에 저장' : ' · 3문제 뒤 다시 나와요');
    const cc = v.cc ?? (lab ? 'hzc' : ''), sc = v.sc ?? (lab ? 'hz' : '');
    body = (
      <div className="np">
        <div className="prog"><div className="tr"><i style={{ width: `${(s.index / s.length) * 100}%` }} /></div><span>{s.index + 1} / {s.length}</span></div>
        {ps.toast && <div className="toast">{ps.toast}</div>}
        <div className="ptag">
          {c.src === 'new' ? <span className={`lvl l-${lv}`}>{lv}</span> : <span className="lvl src">{SRC[c.src]}</span>}
          <span>{def.tname[c.qtype]} · {c.src === 'exam' ? `정답 ${ex.filter((x) => x.ok).length}/${ex.length}` : st.name}{c.src === 'new' ? ` · 연속 ${p.streak}/${GOAL}` : ''}
            {ui.ptagWrong && c.src === 'new' && <> · <b className="x">틀림 {p.wr[st.id] ?? 0}/{wrongCap(st.area)}</b></>}
            {ui.ptagWrong && c.src === 'exam' && <> · <b className="x">틀림 {ex.filter((x) => !x.ok).length}/{EXAM_CAP}</b></>}</span>
          <WrongTip key={s.index}>
            <div className={`wcnt ${wc.wrong >= wc.cap - 1 ? 'full' : ''}`} id="wcnt">
              <div className="r1"><b>틀린 개수</b><span className="dots">{Array.from({ length: wc.cap }, (_, i) => <i key={i} className={i < wc.wrong ? 'on' : ''} />)}</span><em>{wc.wrong}/{wc.cap}</em></div>
              <small>{cs.kind === 'exam' ? `${wc.cap}개 틀리면 평가가 끝나요` : `${wc.cap}개 틀리면 「${cs.name}」을 처음부터 다시 해요`} · 이번 학습에서 <b>{sw}개</b> 틀림</small>
            </div>
            <p className="tip">{c.src === 'exam' ? `평가 중에는 ${ui.intro === '단원 소개' ? '소개' : '개념'}를 볼 수 없어요. 차분히 골라요.` : <>모르면 오른쪽 위 <L n="circle-help" c="inl" />로 {ui.intro === '단원 소개' ? '단원 소개' : '단원 개념 정리'}를 볼 수 있어요.</>}</p>
          </WrongTip>
        </div>
        <div className={`${ui.boardCls} ${ps.answered ? (r!.ok ? 'ok' : 'no') : ''}`} id="board">
          <span className={`fb ${ps.answered ? (r!.ok ? 'ok' : 'no') : ''}`} id="fb" dangerouslySetInnerHTML={{ __html: fbHtml }} />
          <p className="ask">{v.ask}</p>
          <H className={`q ${v.qc}`} html={v.q} />
          <H html={v.hint} />
        </div>
        {v.write ? (
          <WritePad key={s.index} ch={c.item} trace={v.write.trace} onDone={(ok) => choose(ok ? 0 : 1)} />
        ) : v.spell && ui.pen?.() && !ps.kbd ? (
          <SpellPen key={s.index} ans={c.answer} onAnswer={(ok) => answerWith(ok ? c.answer : '#', null)} onKeyboard={() => setPs({ ...ps, kbd: true })} />
        ) : v.spell ? (
          <SpellInput key={s.index} ans={c.answer} done={ps.answered} ok={r?.ok ?? null} onAnswer={(x) => answerWith(x, null)} />
        ) : (
          <div className={`choices ${v.long ? 'longc' : ''} ${c.ox ? 'oxc' : ''} ${cc}`} id="ch">
            {c.choices.map((x, k) => (
              <button key={k} disabled={ps.answered} className={ps.answered ? (x === c.answer ? 'ok' : k === ps.chosen ? 'no' : '') : ''} onClick={() => choose(k)}>
                <small>{k + 1}</small>{lab ? <span className={sc} dangerouslySetInnerHTML={{ __html: lab(x) }} /> : <span className={sc || undefined}>{x}</span>}
              </button>
            ))}
          </div>
        )}
        <div id="after">
          {ps.answered && r!.ok && !passMsg && !restart && <p className="okflash">정답! 다음 문제로 넘어가요</p>}
          {ps.answered && !(r!.ok && !passMsg && !restart) && (
            <>
              {passMsg && <div className="toast">{passMsg}</div>}
              {restart && <div className="toast warn">{restart}</div>}
              <div id="autoBox">
                {ps.stopped ? <small className="autonote">멈췄어요. 다 보면 다음 문제를 눌러요.</small> : (
                  <><div className="autobar"><i style={{ animationDuration: `${passMsg || restart ? AUTO_LONG : autoNo}ms` }} /></div>
                    <button className="stopauto" onClick={() => { if (timer.current) clearTimeout(timer.current); setPs({ ...ps, stopped: true }); }}>멈추고 보기</button></>
                )}
              </div>
              <div className="wrongbar">
                {c.src !== 'exam' && <button className="btn" onClick={openFromPlay}><L n="book-open" />{ui.intro}</button>}
                <button className="btn y" onClick={() => next(r!.graduated ? '오답 졸업!' : '')}>{last ? '결과 보기' : '다음 문제'}<L n="arrow-right" /></button>
              </div>
              <p className="lk2">{r!.ok ? ui.okMore : '다시 살펴봐요'}</p>
              <H html={ui.afterInfo ? ui.afterInfo(T, { ...v, extra: c.extra }) : def.infoHTML(T, c.item)} />
            </>
          )}
        </div>
      </div>
    );
  } else if (view?.k === 'result') {
    body = <Result ui={ui} trName={trName} today={today} p={p} curName={curSt.name} v={view} stages={stages} IDX={IDX} tname={def.tname} cardLine={cardLine} qIcon={Q_ICON}
      onHome={() => go('home')} onCards={() => go('cards')} openConcept={(st, ch) => openConcept(st, () => go('cards'), ch)} />;
  } else if (tab === 'cards') {
    const cs = p.cards.filter((c) => known(c.item));
    const due = dueCards(p, today, known);
    const cal = Array.from({ length: 7 }, (_, i) => { const d = today + i; const n = cs.filter((c) => (i === 0 ? c.due <= d : c.due === d)).length; return <div key={i} className={i === 0 && n ? 't' : ''}><span>{i === 0 ? '오늘' : DOW[new Date(d * 864e5).getUTCDay()]}</span><b>{n}</b></div>; });
    const sorted = [...cs].sort((a, b) => a.due - b.due || b.wrong - a.wrong);
    const rel = (d: number) => { const k = d - today; return k <= 0 ? (k < 0 ? `${-k}일 밀림` : '오늘') : k === 1 ? '내일' : `${k}일 뒤`; };
    body = (
      <>
        <section className="card"><div className="todaycard">
          <h2>오늘 다시 풀 오답 <small>틀리면 1일 → 3일 → 5일 뒤</small></h2>
          <div className="cols"><div><small>오늘</small><b className={due.length ? 'red' : ''}>{due.length}건</b></div><div><small>전체 / 졸업</small><b>{cs.length} / {p.grad}</b></div></div>
          <button className="startbtn" disabled={!cs.length} onClick={() => cs.length && start('cards', '오답 다시')}><L n="rotate-ccw" />오답만 풀기</button>
        </div></section>
        <div className="box"><h3>다시 나오는 날</h3><div className="cal">{cal}</div><p className="note">세 번 연속 맞히면 졸업, 중간에 틀리면 1일로 돌아가요.</p></div>
        <ul className="units">
          {sorted.length ? sorted.map((c) => (
            <li key={c.id}>
              <button className="unit" onClick={() => openConcept(c.stage, () => go('cards'), c.item)}>
                <H as="b" className="mq" html={cardLine(c.item, c)} />
                <small><span className="x">✕{c.wrong}</span> · {def.tname[c.qtype]} · {stages[IDX[c.stage]]?.name} · <span className={c.due <= today ? 'x' : ''}>{rel(c.due)}</span> · 졸업까지 {3 - c.box}번</small>
              </button>
              <button className="qbtn" aria-label={ui.qIcon} onClick={() => openConcept(c.stage, () => go('cards'), c.item)}>{Q_ICON}</button>
            </li>
          )) : <li><div className="unit static"><b>오답이 없어요</b><small>전부 졸업했어요</small></div></li>}
        </ul>
      </>
    );
  } else if (tab === 'report') {
    body = <Report def={def} ui={ui} T={T} S={S} trName={trName} today={today} curArea={curSt.area} stages={stages}
      onNextDay={() => persist({ ...S, offset: S.offset + 1 })} onReset={() => persist(freshSave())} />;
  } else {
    // 홈
    const pl = planDay(p, stages, today, known), total = pl.total, done = Math.min(S.hist[today]?.n || 0, total);
    const cur = curSt, af = areaF ?? cur.area;
    const list = stages.map((s, i) => ({ s, i })).filter(({ s }) => s.area === af);
    const due = dueStages(p);
    const avg = (id: string) => { const a = S.sst[id]; return a && a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : '0.0'; };
    const revText = (id: string) => { const x = p.passed[id]; if (x.exam) return `통과 · ${x.score || 100}점`; if (x.box >= 2) return '완성 · 두 번 복습 끝'; const k = x.due - p.np; return k <= 0 ? '지금 복습할 차례' : `${k}단원 뒤 ${x.box + 1}차 복습`; };
    const lvOf = (id: string) => LEVEL_NAME[levelOf(p.bp[id] ?? 0)];
    const wt = ui.writeToggle;
    const writeRow = wt && (
      <div className="wset"><span><L n="pencil" />{wt.label} <small>{wt.small}</small></span>
        <button className="swt" role="switch" aria-checked={wt.get()} aria-label={wt.label} onClick={() => { wt.set(!wt.get()); bump((x) => x + 1); }} /></div>
    );
    body = (
      <>
        {Object.keys(def.tracks).length > 1 && (
          <div className={def.trkClass ?? 'trk'} role="tablist" aria-label={Object.values(def.tracks).join('·')}>
            {Object.entries(def.tracks).map(([k, v]) => <button key={k} role="tab" aria-selected={k === tr} onClick={() => { if (k !== tr) { storeTrack(def.key, k); setTr(k); toTop(); } }}>{v}</button>)}
          </div>
        )}
        {ui.writeToggle && !ui.writeToggle.inSection && writeRow}
        <section className="sec">
          <div className="hrow"><span className="badge">TODAY</span><span className="sub">{dlabel(today)} · {ui.todayText(kid.name, trName)}</span>
            <span className="slbtns">
              <button className="slbtn wb" type="button" onClick={() => slide.current?.openWordbook()}><H as="span" html={SIC.book} />단어장{wbN ? <em>{wbN}</em> : null}</button>
              <button className="slbtn" type="button" onClick={() => slide.current?.open()}><H as="span" html={SIC.slide} />슬라이드</button>
            </span>
          </div>
          {ui.writeToggle?.inSection && writeRow}
          <div className="paycard">
            <div className="pc-top"><span className="pc-logo"><L n="book-open" /></span><b>오늘 학습</b>{pl.late ? <span className="latepill">밀린 오답 {pl.late}건</span> : null}</div>
            <div className="pc-row">
              <div className="pc-amt">{done}<small> / {total}문제</small></div>
              <p className="mixline">오답 다시 <b>{pl.cards.length}</b> · 단원 복습 <b>{pl.reviews.length * REV_Q}</b> · {pl.exam ? '승급 평가' : '새 진도'} <b>{pl.n}</b></p>
            </div>
            <div className="pc-btns">
              <button className="gbtn" onClick={() => p.cards.length && start('cards', '오답 다시')}>오답만</button>
              <button className="gbtn" onClick={() => start('new', cur.name)}>{pl.exam ? '평가만' : '진도만'}</button>
              <button className="kbtn" onClick={() => start('today', '오늘 학습')}><L n="play" />{done ? '이어서' : '시작'}</button>
            </div>
          </div>
        </section>
        <section className="sec">
          {def.key === 'hist' && (
            <button className="tlbtn" onClick={() => { setView({ k: 'tl' }); toTop(); }}><L n="list-checks" /><span><b>한눈에 보는 연표</b><small>구석기부터 현대까지 · 우리나라와 세계를 나란히</small></span><L n="chevron-right" /></button>
          )}
          <h3 className="sh">나의 학습 길 <small>{ui.learned(T, p.stage, trName)}</small></h3>
          <div className="path">
            {areas.map((a, i) => {
              const ss = stages.filter((s) => s.area === a), all = ss.length > 0 && ss.every((s) => p.passed[s.id]), now = cur.area === a;
              return <Fragment key={a}>{i > 0 && <i />}<span className={all ? 'done' : now ? 'now' : ''}>{a}</span></Fragment>;
            })}
          </div>
          <div className="nowrow">
            <span className="lic s-now"><L n={cur.kind === 'exam' ? 'bookmark' : 'pencil'} /></span>
            <div className="nr-body">
              <H html={ui.nowTitle(cur)} />
              <span className="streak">
                {cur.kind === 'exam' ? <em>{ui.examStreak(cur)}</em>
                  : p.read[cur.id] ? <>{Array.from({ length: GOAL }, (_, i) => <i key={i} className={i < p.streak ? 'on' : ''} />)}<em>연속 {p.streak}/{GOAL} · 틀림 {p.wr[cur.id] ?? 0}/{wrongCap(cur.area)}</em></>
                    : <em>{ui.intro === '단원 소개' ? '단원 소개' : '개념 정리'}를 먼저 봐요 · {wrongCap(cur.area)}개 틀리면 처음부터</em>}
              </span>
            </div>
            {cur.kind !== 'exam' && <button className="qbtn" aria-label={`${cur.name} ${ui.qIcon}`} onClick={() => openConcept(cur.id, () => setView(null))}>{Q_ICON}</button>}
          </div>
          {due.length > 0 && <p className="duebox"><L n="repeat" /><span><b>복습할 단원 {due.length}개</b> — {due.map((id) => stages[IDX[id]].name).join(', ')}. 새 진도보다 먼저 나와요.</span></p>}
        </section>
        <section className="sec flush">
          <h3 className="sh pad16">단원 목록 <small>{def.listSub(trName)}</small></h3>
          <div className="areas">
            {areas.map((a) => { const ss = stages.filter((s) => s.area === a), n = ss.filter((s) => p.passed[s.id]).length; return <button key={a} className={`chip ${a === af ? 'on' : ''}`} onClick={() => setAreaF(a)}>{a} <small>{n}/{ss.length}</small></button>; })}
          </div>
          <ul className="units">
            {list.map(({ s, i }) => {
              const pd = p.passed[s.id], now = i === p.stage, lock = !pd && !now, dueNow = pd && !pd.exam && pd.box < 2 && pd.due <= p.np;
              const sub2 = pd ? (s.kind === 'exam' ? revText(s.id) : `최근 평균 ${avg(s.id)} · ${revText(s.id)}`)
                : now ? (s.kind === 'exam' ? `${EXAM_N}문제 · ${Math.round(EXAM_PASS * 100)}% 이상 통과` : `난이도 ${lvOf(s.id)} · 연속 ${p.streak}/${GOAL}`)
                  : s.kind === 'exam' ? ui.examSub(s) : ui.lockedSub(s);
              const li = pd ? (dueNow ? <span className="lic s-due"><L n="repeat" /></span> : <span className="lic s-ok"><L n="check" /></span>)
                : now ? <span className="lic s-now"><L n={s.kind === 'exam' ? 'bookmark' : 'pencil'} /></span> : <span className="lic s-lk"><L n={s.kind === 'exam' ? 'bookmark' : 'lock'} /></span>;
              return (
                <li key={s.id} className={`${now ? 'cur' : ''} ${lock ? 'lock' : ''} ${s.kind === 'exam' ? 'exam' : ''}`}>
                  {li}
                  <button className="unit" disabled={lock} onClick={() => (i === p.stage ? start('new', s.name) : s.kind === 'exam' ? openConcept(s.id, () => setView(null)) : start('stage', `${s.name} 복습`, s.id))}>
                    <b dangerouslySetInnerHTML={{ __html: ui.unitTitle(s) }} /><small dangerouslySetInnerHTML={{ __html: sub2 }} />
                  </button>
                  {s.kind !== 'exam' && <button className="qbtn" aria-label={`${s.name} ${ui.qIcon}`} onClick={() => openConcept(s.id, () => setView(null))}>{Q_ICON}</button>}
                </li>
              );
            })}
          </ul>
        </section>
        {ui.homeAfter && <H html={ui.homeAfter(T)} />}
        <p className="note">{def.homeNote}</p>
      </>
    );
  }

  const dueN = dueCards(p, today, known).length;
  return (
    <>
      <StudyTop<Tab> subject={def.key} tab={tab} onTab={go} hidden={sub}
        tabs={[{ key: 'home', name: def.tabName }, { key: 'cards', name: '오답노트', n: dueN }, { key: 'report', name: '학습결과' }]} />
      <div className="frames">
        <div className={`pg pg-sub s-${def.key}`}>
          <div className="app">
            {sub && barBack && (
              <header id="bar">
                <button className="bb" aria-label="뒤로" onClick={barBack}><L n="arrow-left" /></button>
                <h1>{barTitle}</h1>
                {barHelp ? <button className="bb" aria-label={ui.intro === '단원 소개' ? '단원 소개 보기' : '단원 개념 보기'} onClick={barHelp}><L n="circle-help" /></button> : <span className="bb" />}
              </header>
            )}
            <div id="screen" ref={screen}>{body}</div>
            <div ref={slideHost} style={{ display: 'contents' }} />
            {trace?.kind === 'hanzi' && <TraceModal ch={trace.ch} label={ui.traceLabel?.(trace.ch) ?? trace.ch} onClose={() => setTrace(null)} />}
            {trace?.kind === 'ink' && <InkModal word={trace.ch} label={ui.traceLabel?.(trace.ch) ?? ''} onClose={() => setTrace(null)} />}
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- 단원 개념 정리 · 소개 ---------- */
function Concept({ def, ui, T, s, gate, at, trName, isNow, passedScore, onClose, onDone, onPractice, onExamStart }: {
  def: SubjectDef; ui: SubjectUI; T: Track; s: SStage; gate: boolean; at?: string; trName: string; isNow: boolean; passedScore: number | null;
  onClose: () => void; onDone: () => void; onPractice?: () => void; onExamStart: () => void;
}) {
  const n = s.items.length, total = n + 2;
  const [i, setI] = useState(at ? Math.max(0, s.items.indexOf(at) + 1) : 0);
  const [seen, setSeen] = useState(i);
  const [wrote, setWrote] = useState<Set<string>>(new Set());
  const stp = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setSeen((x) => Math.max(x, i));
    stp.current?.querySelector('.on')?.scrollIntoView({ block: 'nearest', inline: 'center' });
    if (i > 0 && i <= s.items.length) ui.conceptShow?.(s.items[i - 1]);
  }, [i, s, ui]);

  if (s.kind === 'exam') {
    return (
      <div className="cx">
        <div className="lyric"><H html={def.examIntro(s, trName)} />{passedScore != null && <p className="eqa">통과 · {passedScore}점</p>}</div>
        <div className="btns sp"><button className="btn" onClick={onClose}>닫기</button>{isNow && <button className="btn y" onClick={onExamStart}><L n="play" />평가 시작</button>}</div>
      </div>
    );
  }
  const cap = wrongCap(s.area);
  const wch = i >= 1 && i <= n ? s.items[i - 1] : null;
  const canTrace = !!(gate && wch && ui.conceptTrace?.(wch));
  const needW = canTrace && !wrote.has(wch!);
  const item = (id: string) => (ui.conceptItem ? ui.conceptItem(T, s, id) : def.infoHTML(T, id));
  const bodyHtml = i === 0 ? def.conceptIntro(T, s, trName) : i <= n ? `<span class="lk">${i} / ${n}</span>${item(s.items[i - 1])}` : def.conceptEnd(s, gate, cap);
  const last = i === total - 1;
  const label = (c: string) => (ui.stepLabel ? ui.stepLabel(T, c) : String((T.items[c] as { t?: string }).t ?? c));
  const steps: [string | null, string][] = [['lightbulb', ui.stepFirst], ...s.items.map((c) => [null, label(c)] as [null, string]), ['bookmark', '기억']];
  const jump = (j: number) => { if (needW && j > i) return; if (!gate || j <= seen + 1) setI(j); };
  return (
    <div className="cx">
      <div className="steps" id="stp" ref={stp}>
        {steps.map(([ic, t], k) => (
          <span key={k} className={`${k === i ? 'on' : k < i ? 'done' : ''} ${ic || !ui.stepHz ? '' : 'hz'}`} onClick={() => jump(k)}>
            {ic && <L n={k < i ? 'check' : ic} />}{t}
          </span>
        ))}
      </div>
      <div className="lyric" id="ly" onClick={(e) => {
        const b = (e.target as HTMLElement).closest<HTMLElement>('[data-j]');
        if (!b) return;
        if (b.closest('.wgrid')) { ui.conceptGrid?.(s.items[+b.dataset.j! - 1]); b.classList.remove('spk'); void b.offsetWidth; b.classList.add('spk'); }
        jump(+b.dataset.j!);
      }}>
        <H html={bodyHtml} />
        {canTrace && (ui.traceKind === 'ink'
          ? <IntroInk key={wch!} word={wch!} wrote={wrote.has(wch!)} onWrote={() => setWrote((w) => new Set(w).add(wch!))} />
          : <IntroTrace key={wch!} ch={wch!} wrote={wrote.has(wch!)} onWrote={() => setWrote((w) => new Set(w).add(wch!))} />)}
      </div>
      <div className="btns sp">
        <button className="btn" disabled={i === 0} onClick={() => setI(i - 1)}><L n="chevron-left" />이전</button>
        {last ? (gate ? <button className="btn y" onClick={onDone}><L n="circle-check-big" />다 봤어요 · 문제 풀기</button>
          : <>{onPractice && <button className="btn y" onClick={onPractice}><L n="play" />이 단원 문제 풀기</button>}<button className="btn k" onClick={onDone}>닫기</button></>)
          : <button className="btn k" disabled={needW} onClick={() => setI(i + 1)}>다음<L n="chevron-right" /></button>}
      </div>
      {gate && <p className="gate">{last ? '다 보면 문제가 열려요' : `처음 들어가는 단원이에요. 끝까지 넘겨야 문제가 열려요 (${i + 1}/${total})`}</p>}
    </div>
  );
}

/* ---------- 결과 ---------- */
function Result({ ui, trName, today, p, curName, v, stages, IDX, tname, cardLine, qIcon, onHome, onCards, openConcept }: {
  ui: SubjectUI; trName: string; today: number; p: SubjectSave['p']; curName: string;
  v: Extract<View, { k: 'result' }>; stages: SStage[]; IDX: Record<string, number>; tname: Record<string, string>;
  cardLine: (item: string, c: { qtype: string; extra?: Record<string, unknown> }) => string; qIcon: React.ReactNode;
  onHome: () => void; onCards: () => void; openConcept: (st: string, ch: string) => void;
}) {
  const [dlg, setDlg] = useState(true);
  const g = v.res, n = g.log.length, c = g.log.filter((r) => r.ok).length;
  const wrong = v.done.filter((r) => !r.ok && r.src !== 'retry');
  const ex = g.exam;
  const revMsg = (o: string | null) => (o === 'done' ? '완성!' : o === 'again' ? `${RULES.REV_GAP[1]}단원 뒤 한 번 더` : o === 'reset' ? `${RULES.REV_GAP[0]}단원 뒤 다시` : '');
  return (
    <>
      <div className="res">
        <div className="box center"><small className="note">{dlabel(today)} · 풀이 시간 {v.time}</small><div className="big">{n ? Math.round((c / n) * 100) : 0}점</div><p className="note">{n}문제 중 {c}개 정답 (틀린 문제 다시 풀기 포함)</p></div>
        {ex && (
          <div className={`box center exres ${ex.pass ? 'pass' : ''}`}>
            <h3>{ex.stage.name} {ex.pass ? '통과!' : '다시 도전'}</h3>
            <p className="note">{ex.n}문제 중 {ex.correct}개 정답 (통과 기준 {Math.ceil(RULES.EXAM_N * RULES.EXAM_PASS)}개)</p>
            <p>{ex.pass ? (p.allDone ? <b>모든 과정을 마쳤어요! 이제 복습과 오답으로 실력을 지켜요.</b> : <>다음: <b>{curName}</b></>)
              : v.examStop ? `${EXAM_CAP}개를 틀려서 평가가 일찍 끝났어요. 틀린 ${ui.thing}를 오답노트로 복습하고 다시 도전해요.`
                : ex.n < RULES.EXAM_N ? '평가를 끝까지 풀어야 결과가 나와요.' : `틀린 ${ui.thing}를 오답노트로 복습하고 다시 도전해요.`}</p>
          </div>
        )}
        <div className="grid3"><div className="cell"><b>{wrong.length}</b><span>내일 다시 나올 오답</span></div><div className="cell"><b>{g.passedNow.length}</b><span>통과한 단원</span></div><div className="cell"><b>{p.streak}/{GOAL}</b><span>지금 단원 연속</span></div></div>
        {g.passedNow.length > 0 && <div className="toast">{g.passedNow.map((s) => s.name).join(', ')} 통과 → 지금: {curName}</div>}
        {v.restarts > 0 && <div className="toast warn">틀림 상한에 닿아 「{curName}」을 처음부터 다시 해요</div>}
        {g.reviews.length > 0 && (
          <div className="box"><h3>단원 복습 결과 <small className="note">3단원 뒤 → 5단원 뒤</small></h3>
            <div className="list">{g.reviews.map((r) => <div key={r.stage}><span>{stages[IDX[r.stage]]?.name}</span><span>{r.wrong ? <><span className="x">✕{r.wrong}</span> </> : '다 맞음 '}{r.outcome ? '→ ' + revMsg(r.outcome) : ''}</span></div>)}</div></div>
        )}
        {wrong.length ? (
          <div className="box"><h3>틀린 문제 <small className="note">오답노트에 저장됨</small></h3>
            <ul className="units in">{wrong.slice(0, 8).map((r, i) => (
              <li key={i}><button className="unit" onClick={() => openConcept(r.stage, r.q.item)}><H as="b" className="mq" html={cardLine(r.q.item, r.q)} />
                <small>{tname[r.q.qtype]}{ui.showYou && <> · 내 답 <span className={`x ${r.q.lab ? 'hz' : ''}`} dangerouslySetInnerHTML={{ __html: r.q.lab ? r.q.lab(r.you) : r.you }} /></>}</small></button>
                <button className="qbtn" aria-label={ui.qIcon} onClick={() => openConcept(r.stage, r.q.item)}>{qIcon}</button></li>
            ))}</ul></div>
        ) : <p className="note center">틀린 문제가 없어요.</p>}
        <div className="btns sp"><button className="btn" onClick={onHome}><L n="house" />{ui.homeBtn(trName)}</button><button className="btn k" onClick={onCards}><L n="notebook-pen" />오답노트 보기</button></div>
      </div>
      {dlg && (
        <div className="dim"><div className="dialog" role="dialog" aria-labelledby="dt"><h3 id="dt"><L n="bell" />알림</h3>
          <p>문제풀이가 끝났습니다.<br />문제풀이 시간: <b>{v.time}</b><br />정답: <b>{c} / {n}</b>{ex && <><br />{ex.stage.name}: <b>{ex.pass ? '통과' : '다시 도전'}</b></>}{wrong.length > 0 && <><br />틀린 {wrong.length}문제는 내일 다시 나와요.</>}</p>
          <button onClick={() => setDlg(false)}>확인</button></div></div>
      )}
    </>
  );
}

/* ---------- 학습결과 ---------- */
function Report({ def, ui, T, S, trName, today, curArea, stages, onNextDay, onReset }: {
  def: SubjectDef; ui: SubjectUI; T: Track; S: SubjectSave; trName: string; today: number; curArea: string; stages: SStage[];
  onNextDay: () => void; onReset: () => void;
}) {
  const [rmode, setRmode] = useState<'day' | 'week' | 'month'>('day');
  const [rshift, setRshift] = useState(0);
  const [resetArm, setResetArm] = useState(false);
  const [shareNote, setShareNote] = useState('공유는 출시 버전에서 동작해요. 지금은 보낼 문구를 복사해요.');
  const p = S.p, t = today;
  const span = rmode === 'day' ? 1 : rmode === 'week' ? 7 : 30;
  const endD = t - rshift * span, days = Array.from({ length: span }, (_, i) => endD - span + 1 + i);
  const hs = days.map((d) => S.hist[d] || { n: 0, c: 0, ms: 0 });
  const tot = hs.reduce((a, h) => ({ n: a.n + h.n, c: a.c + h.c, ms: a.ms + (h.ms || 0) }), { n: 0, c: 0, ms: 0 });
  const att = hs.filter((h) => h.n).length, rate = tot.n ? Math.round((tot.c / tot.n) * 100) : 0;
  const label = rmode === 'day' ? dlabel(endD) : `${dlabel(days[0])} ~ ${dlabel(endD)}`;
  const goalN = SET * span, goalMs = span * 10 * 60000;
  const by: Record<string, number> = {};
  p.cards.filter((c) => T.items[c.item]).forEach((c) => { by[c.item] = (by[c.item] || 0) + c.wrong; });
  const worst = Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const mx = Math.max(SET, ...hs.map((h) => h.n));
  const areas = def.areas.filter((a) => stages.some((s) => s.area === a));
  const shown = areas.slice(0, areas.indexOf(curArea) + 1);
  const units = stages.filter((s) => s.kind !== 'exam'), pu = units.filter((s) => p.passed[s.id]);
  const done2 = pu.filter((s) => p.passed[s.id].box >= 2).length, wait = pu.length - done2, dueN = dueStages(p).length;
  return (
    <>
      <div className="seg">{([['day', '일별 보고서'], ['week', '주간 보고서'], ['month', '월간 보고서']] as const).map(([k, l]) => <button key={k} className={k === rmode ? 'on' : ''} onClick={() => { setRmode(k); setRshift(0); }}>{l}</button>)}</div>
      <div className="datenav"><button aria-label="이전" onClick={() => setRshift(rshift + 1)}><L n="chevron-left" /></button><span>{label}</span><button aria-label="다음" disabled={rshift === 0} onClick={() => rshift > 0 && setRshift(rshift - 1)}><L n="chevron-right" /></button></div>
      <section className="card center">
        <H html={ring(tot.n / goalN, tot.n + '개', '총 문제 개수')} />
        <div className="legend"><span><i style={{ background: 'var(--y)' }} />정답 {tot.c}개</span><span><i style={{ background: 'var(--red)' }} />오답 {tot.n - tot.c}개</span><span>정답률 {rate}%</span></div>
      </section>
      <section className="card center">
        <H html={ring(tot.ms / goalMs, mmS(tot.ms), '총 학습 시간', 'var(--k)')} />
        <p className="note">{rmode === 'day' ? '하루 목표 10분' : `${span}일 중 ${att}일 출석 · 하루 목표 10분`}</p>
      </section>
      {rmode !== 'day' && (
        <section className="card"><h3>하루 푼 문제</h3>
          <div className={`week ${rmode}`}>{hs.map((h, i) => <div key={i}><small>{rmode === 'week' && h.n ? h.n : ''}</small><i className={days[i] === t ? 'td' : ''} style={{ height: `${(h.n / mx) * 100}%` }} /></div>)}</div>
          {rmode === 'week' && <div className="days">{days.map((d) => <span key={d}>{d === t ? '오늘' : DOW[new Date(d * 864e5).getUTCDay()]}</span>)}</div>}
        </section>
      )}
      <section className="card"><h3>단원 복습 현황 <small className="note">3단원 뒤 → 5단원 뒤</small></h3>
        <div className="cols"><div><small>완성 (복습 2번 끝)</small><b>{done2}</b></div><div><small>복습 남음 / 지금 차례</small><b>{wait} / <span className={dueN ? 'x' : ''}>{dueN}</span></b></div></div></section>
      <section className="card"><h3>{ui.statTitle} <small className="note">누적</small></h3>
        {shown.map((a) => { const s = S.stat[a] || { n: 0, c: 0 }; const r = s.n ? Math.round((s.c / s.n) * 100) : 0; return <div key={a} className="hbar"><span>{a}</span><div className="tr"><i style={{ width: `${r}%` }} /></div><span className="v">{s.n ? r + '%' : '—'}</span></div>; })}
      </section>
      <section className="card"><h3>{def.worstTitle}</h3><div className="list">{worst.length ? worst.map(([h, w]) => <div key={h}><span dangerouslySetInnerHTML={{ __html: def.worstLine(T, h) }} /><span className="x">✕{w}</span></div>) : <p className="note">틀린 문제가 없어요.</p>}</div></section>
      <button className="share" onClick={async () => {
        const txt = `[${def.appName}] ${trName} ${label}: ${tot.n}문제, 정답률 ${rate}%, 학습 ${mmS(tot.ms)}. 남은 오답 ${p.cards.length}건.`;
        try { await navigator.clipboard.writeText(txt); setShareNote('복사했어요: ' + txt); } catch { setShareNote(txt); }
      }}><L n="message-circle" />카카오톡으로 보고서 보내기</button>
      <p className="note">{shareNote}</p>
      <section className="card"><h3>시연 도구</h3><p className="note">하루를 넘기면 1·3·5일 뒤 오답이 다시 나와요. 단원 복습은 진도(3단원·5단원 뒤)로 나와요.</p>
        <div className="btns"><button className="btn k" onClick={onNextDay}><L n="calendar-plus" />하루 넘기기</button>
          <button className="btn" onClick={() => { if (resetArm) { onReset(); setResetArm(false); } else setResetArm(true); }}>{resetArm ? '한 번 더 누르면 초기화' : <><L n="rotate-ccw" />처음으로 되돌리기</>}</button></div></section>
    </>
  );
}
