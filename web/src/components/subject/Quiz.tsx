'use client';
/* 퀴즈풀기 — 내가 공부한 것(어제·최근 7일·전체)을 골라 유형별로 다시 풀기. 강요 없이 하고 싶을 때, 끝내면 맞힌 만큼 캐시 (2026-11 사용자 요청) */
import { useEffect, useMemo, useRef, useState } from 'react';
import { buddy } from '@/components/Buddy';
import { pop } from '@/components/Toast';
import { shuffle } from '@/lib/engine/choices';
import { sfx } from '@/lib/feedback';
import { QUIZ_CAP, QUIZ_PERFECT, quizEarn, quizLeft } from '@/lib/rewards/rewards';
import { getRewards, updateRewards } from '@/lib/store';
import type { SubjectSave } from '@/lib/subjectStore';
import { josa } from '@/lib/subjects/termq';
import type { QuizType, QZ, SStage, SubjectDef, Track } from '@/lib/subjects/types';
import L, { H } from './L';

const MAX_Q = 20;
type Range = 'y' | 'w' | 'a';
const RANGES: [Range, string][] = [['y', '어제'], ['w', '최근 7일'], ['a', '공부한 것 전체']];

/** 범위별 공부한 항목: 어제 푼 것 · 최근 7일(오늘 포함) · 전체(푼 것 + 통과한 단원) */
export function quizPool(S: SubjectSave, T: Track, today: number) {
  const seen = S.seen ?? {}, ok = (id: string) => !!T.items[id];
  const y = Object.keys(seen).filter((id) => seen[id] === today - 1 && ok(id));
  const w = Object.keys(seen).filter((id) => seen[id] >= today - 6 && ok(id));
  const passed = T.stages.filter((s) => s.kind === 'unit' && S.p.passed[s.id]).flatMap((s) => s.items);
  const a = [...new Set([...Object.keys(seen), ...passed])].filter(ok);
  return { y, w, a } as Record<Range, string[]>;
}

const praise = (sc: number) => (sc === 100 ? '완벽해요! 모두 기억하고 있어요' : sc >= 80 ? '아주 잘했어요! 틀린 것만 한 번 더 보면 완벽해요' : sc >= 50 ? '좋아요! 다시 풀수록 더 오래 기억해요' : '괜찮아요. 한 번 더 보면 금방 기억나요');

interface Done { q: QZ; you: string; ok: boolean }

export default function Quiz({ def, T, S, today, kid, thing, stages, curSt, onHome }: {
  def: SubjectDef; T: Track; S: SubjectSave; today: number; kid: string; thing: string; stages: SStage[]; curSt: SStage; onHome: () => void;
}) {
  const quiz = def.quiz!;
  const pool = useMemo(() => quizPool(S, T, today), [S, T, today]);
  const [range, setRange] = useState<Range>(() => (pool.y.length ? 'y' : pool.w.length ? 'w' : 'a'));
  const [phase, setPhase] = useState<'pick' | 'play' | 'done'>('pick');
  const [type, setType] = useState<QuizType | null>(null);
  const [qs, setQs] = useState<QZ[]>([]);
  const [i, setI] = useState(0);
  const [ans, setAns] = useState<{ you: string; ok: boolean } | null>(null);
  const [inp, setInp] = useState('');
  const [rule, setRule] = useState(false);
  const done = useRef<Done[]>([]);
  const [res, setRes] = useState<ReturnType<typeof quizEarn> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inRef = useRef<HTMLInputElement>(null);
  const types = quiz.types(T);
  const left = quizLeft(getRewards(kid), today);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => { if (phase === 'play' && qs[i] && !qs[i].choices) setTimeout(() => inRef.current?.focus(), 60); }, [phase, i, qs]);

  const usable = (t: QuizType, ids: string[]) => ids.filter((id) => quiz.can(T, id, t.key));

  function make(t: QuizType, id: string): QZ | null {
    try {
      if (t.qt) {
        const pq = def.makeQ(T, id, t.qt, Math.random);
        if (!pq.choices?.length || pq.qtype !== t.qt) return null;
        return { item: id, ask: pq.ask, q: pq.q, qc: pq.qc, hint: pq.hint, choices: pq.choices, answer: pq.answer, view: pq, say: def.key === 'eng' && /en/.test(pq.qc) ? id : undefined };
      }
      return quiz.make!(T, id, t.key, Math.random);
    } catch { return null; }
  }

  function begin(t: QuizType, ids?: string[]) {
    def.prepare?.(T, curSt);
    const list = shuffle(ids ?? usable(t, pool[range]), Math.random).slice(0, MAX_Q).map((id) => make(t, id)).filter((x): x is QZ => !!x);
    if (!list.length) { pop(`이 유형으로 낼 ${josa(thing, '이', '가')} 없어요. 다른 유형을 골라 보세요`); return; }
    setType(t); setQs(list); setI(0); setAns(null); setInp(''); setRes(null); done.current = []; setPhase('play');
  }

  function answer(you: string) {
    if (ans) return;
    const q = qs[i], ok = !!you && (q.accept ? q.accept(you) : you === q.answer);
    setAns({ you, ok });
    done.current.push({ q, you, ok });
    const st = getRewards(kid);
    sfx(ok ? 'ok' : 'no', st);
    buddy(ok ? 'ok' : 'no');
    if (ok && def.speak && q.say && def.key === 'eng') def.speak(q.say);
    timer.current = setTimeout(next, ok ? 900 : 2200);
  }

  function next() {
    if (timer.current) clearTimeout(timer.current);
    if (i + 1 < qs.length) { setI(i + 1); setAns(null); setInp(''); setRule(false); return; }
    const c = done.current.filter((d) => d.ok).length, n = done.current.length;
    let out: ReturnType<typeof quizEarn> | null = null;
    updateRewards(kid, (r, t) => { out = quizEarn(r, t, `${def.key}:${T.key}:${type!.key}`, c, n); });
    setRes(out);
    setPhase('done');
    sfx('win', getRewards(kid));
    buddy('win');
    const o = out as ReturnType<typeof quizEarn> | null;
    if (o?.mark) setTimeout(() => pop(`퀴즈 ${o.n}번 달성! 꾸준히 복습하는 멋진 습관이에요`), 900);
  }

  const say = (text: string) => def.speak?.(text);

  /* ---------- 범위·유형 고르기 ---------- */
  if (phase === 'pick') {
    const ids = pool[range];
    if (!pool.a.length) {
      return (
        <section className="sec qz">
          <div className="qzhero"><span className="qzhi"><L n="sparkles" /></span><div><b>퀴즈로 복습해요</b><small>공부한 {josa(thing, '을', '를')} 다시 풀고 맞힌 만큼 캐시를 받아요</small></div></div>
          <div className="qzempty"><L n="book-open" /><p>아직 공부한 {josa(thing, '이', '가')} 없어요.<br />오늘 학습을 하면 여기서 다시 풀 수 있어요.</p><button className="btn y" onClick={onHome}><L n="play" />오늘 학습 하러 가기</button></div>
        </section>
      );
    }
    return (
      <section className="sec qz">
        <div className="qzhero"><span className="qzhi"><L n="sparkles" /></span><div><b>퀴즈로 복습해요</b><small>하고 싶을 때만 풀어요 · 맞힌 만큼 캐시 · 100점이면 +{QUIZ_PERFECT}</small></div>
          <span className={`qzleft ${left ? '' : 'off'}`}><L n="coins" />{left ? `오늘 ${left}캐시 남음` : '오늘 캐시 다 받음'}</span></div>
        <h3 className="sh">범위 <small>내가 공부한 {thing}만 나와요</small></h3>
        <div className="qzrange" role="radiogroup" aria-label="퀴즈 범위">
          {RANGES.map(([k, n]) => (
            <button key={k} role="radio" aria-checked={range === k} className={range === k ? 'on' : ''} disabled={!pool[k].length} onClick={() => setRange(k)}>
              {n}<small>{pool[k].length}개</small>
            </button>
          ))}
        </div>
        <h3 className="sh">테스트 유형 <small>최대 {MAX_Q}문제</small></h3>
        <div className="qztypes">
          {types.map((t) => {
            const n = usable(t, ids).length;
            return (
              <button key={t.key} className="qzt" disabled={!n} onClick={() => begin(t)}>
                <span className="qzic"><em>{t.badge}</em><L n={t.input ? 'keyboard' : 'mouse-pointer-click'} /></span>
                <b>{t.label}</b>
                <small>{n ? `${Math.min(n, MAX_Q)}문제` : `낼 ${josa(thing, '이', '가')} 없어요`}{t.beta ? ' · 베타' : ''}</small>
              </button>
            );
          })}
        </div>
        <p className="note">입력 문제는 직접 써서 풀어요. 틀려도 캐시가 줄지 않아요. 하루 최대 {QUIZ_CAP}캐시까지 받아요.</p>
      </section>
    );
  }

  /* ---------- 결과 ---------- */
  if (phase === 'done') {
    const all = done.current, c = all.filter((d) => d.ok).length, sc = all.length ? Math.round((c / all.length) * 100) : 0, wrong = all.filter((d) => !d.ok);
    const diff = res?.prevLast != null ? sc - res.prevLast : null;
    return (
      <div className="res qz">
        <div className="box center qzres">
          <small className="note">{type!.label} · {RANGES.find(([k]) => k === range)![1]}</small>
          <div className="big">{sc}점</div>
          <p className="qzpraise">{praise(sc)}</p>
          <p className="note">{all.length}문제 중 {c}개 정답{res?.newBest ? ' · 최고 기록!' : diff != null && diff !== 0 ? ` · 지난번보다 ${diff > 0 ? '+' : ''}${diff}점` : ''}</p>
          <div className="qzgain"><L n="coins" />{res && res.gain ? <b>+{res.gain} 캐시</b> : <span>오늘 퀴즈 캐시({QUIZ_CAP})를 다 받았어요</span>}{res?.perfect && res.gain ? <em>100점 보너스 포함</em> : null}</div>
        </div>
        {wrong.length > 0 && (
          <div className="box"><h3>틀린 {thing} <small className="note">다시 보면 오래 기억해요</small></h3>
            <ul className="qzwrong">{wrong.map((d, k) => (
              <li key={k}><span><H as="span" html={d.q.before != null ? `${d.q.before}<b>${d.q.answer}</b>${d.q.after}` : d.q.q || d.q.item} /></span>
                <span className="qza">{d.q.view?.lab ? <H as="span" html={d.q.view.lab(d.q.answer)} /> : d.q.shown ?? d.q.answer}{d.you ? <small className="x"> · 내 답 {d.you}</small> : <small className="x"> · 건너뜀</small>}</span>
                {d.q.say && def.speak && <button className="qzsay sm" aria-label="발음 듣기" onClick={() => say(d.q.say!)}><L n="volume-2" /></button>}</li>
            ))}</ul></div>
        )}
        <div className="btns sp">
          {wrong.length > 0 && <button className="btn y" onClick={() => begin(type!, wrong.map((d) => d.q.item))}><L n="rotate-ccw" />틀린 것만 다시</button>}
          <button className="btn" onClick={() => setPhase('pick')}><L n="list-checks" />다른 퀴즈</button>
          <button className="btn k" onClick={onHome}><L n="house" />{stages.length ? '학습으로' : '처음으로'}</button>
        </div>
      </div>
    );
  }

  /* ---------- 풀이 ---------- */
  const q = qs[i], v = q.view, lab = v?.lab, cc = v?.cc ?? (lab ? 'hzc' : ''), sc = v?.sc ?? (lab ? 'hz' : '');
  const fb = ans ? (ans.ok ? '정답!' : `정답은 ${lab ? '' : q.shown ?? q.answer}`) : '';
  return (
    <div className="np qz">
      <div className="qzhead">
        <span className="qzn"><b>{i + 1}</b>/{qs.length}</span>
        <span className="qztl">{type!.label}</span>
        {q.say && def.speak ? <button className="qzsay" onClick={() => say(q.say!)}><L n="volume-2" />발음 듣기</button> : <span />}
      </div>
      <div className="prog"><div className="tr"><i style={{ width: `${(i / qs.length) * 100}%` }} /></div></div>
      <div className={`board ${ans ? (ans.ok ? 'ok' : 'no') : ''}`} id="board">
        <span className={`fb ${ans ? (ans.ok ? 'ok' : 'no') : ''}`} id="fb">{fb}{ans && !ans.ok && lab && <H as="span" className={sc} html={lab(q.answer)} />}</span>
        <p className="ask">{q.ask}{q.rule && <button className="qzrule" aria-label="정답 기준" aria-expanded={rule} onClick={() => setRule(!rule)}><L n="circle-help" /></button>}</p>
        {rule && q.rule && <p className="qzrulebox">{q.rule}</p>}
        {q.before != null ? (
          <>
            <p className="qzko">{q.ko}</p>
            <p className="qzsent en">{q.before}<input ref={inRef} className={ans ? (ans.ok ? 'ok' : 'no') : ''} value={inp} disabled={!!ans} aria-label="빈칸 입력"
              autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} size={Math.max(4, q.answer.length)}
              onChange={(e) => setInp(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && inp.trim()) answer(inp.trim()); }} />{q.after}</p>
          </>
        ) : <H className={`q ${q.qc ?? ''}`} html={q.q} />}
        {q.hint && <H html={q.hint} />}
      </div>
      {q.choices ? (
        <div className={`choices ${v?.long ? 'longc' : ''} ${cc}`} id="ch">
          {q.choices.map((x, k) => (
            <button key={k} disabled={!!ans} className={ans ? (x === q.answer ? 'ok' : x === ans.you ? 'no' : '') : ''} onClick={() => answer(x)}>
              <small>{k + 1}</small>{lab ? <span className={sc} dangerouslySetInnerHTML={{ __html: lab(x) }} /> : <span className={sc || undefined}>{x}</span>}
            </button>
          ))}
        </div>
      ) : q.before == null && (
        <div className="qzin">
          <input ref={inRef} type="text" lang={q.lang} value={inp} disabled={!!ans} className={ans ? (ans.ok ? 'ok' : 'no') : ''}
            {...(q.lang === 'en' ? { autoCapitalize: 'off', autoCorrect: 'off', spellCheck: false } : {})} autoComplete="off"
            placeholder={q.lang === 'en' ? '영어로 써요' : '한글로 써요'} aria-label="답 입력"
            onChange={(e) => setInp(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && inp.trim()) answer(inp.trim()); }} />
        </div>
      )}
      <div className="qzbtns">
        {!ans ? (
          <>
            <button className="btn line" onClick={() => answer('')}>건너뛰기<L n="chevron-right" /></button>
            {!q.choices && <button className="btn y" disabled={!inp.trim()} onClick={() => answer(inp.trim())}>제출하기</button>}
          </>
        ) : (
          <button className="btn y" onClick={next}>{i + 1 < qs.length ? '다음 문제' : '결과 보기'}<L n="arrow-right" /></button>
        )}
      </div>
      <p className="note center">다음 문제로 넘어가면 다시 고칠 수 없어요</p>
    </div>
  );
}
