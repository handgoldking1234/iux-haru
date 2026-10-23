'use client';
/* 한자 쓰기 — 프로토타입 app.js hwOpts · startWrite · openTrace · 소개 카드 따라 쓰기 그대로 (HanziWriter 3.7.2, MIT) */
import HanziWriter from 'hanzi-writer';
import { useEffect, useRef, useState } from 'react';
import { strokeData } from '@/lib/subjects/hanja';
import L from './L';

function hwOpts(trace: boolean, size: number) {
  return {
    width: size, height: size, padding: 12, showOutline: trace, showCharacter: false, strokeColor: '#1E2421', outlineColor: '#D9DDE3',
    drawingColor: '#C2410C', drawingWidth: Math.round(size / 11), highlightColor: '#0FA37F', strokeAnimationSpeed: 1.2, delayBetweenStrokes: 250,
    charDataLoader: ((c: string, onLoad: (d: unknown) => void) => onLoad(strokeData()![c])) as never,
  };
}
type W = ReturnType<typeof HanziWriter.create>;

/** 문제: 획을 다 쓰면 채점. 틀린 획이 max(2, 획수/4) 이하면 정답 */
export function WritePad({ ch, trace, onDone }: { ch: string; trace: boolean; onDone: (ok: boolean) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const wr = useRef<W | null>(null);
  const done = useRef(false);
  const n = strokeData()?.[ch]?.strokes.length ?? 1, limit = Math.max(2, Math.floor(n / 4));
  const [msg, setMsg] = useState(trace ? '흐린 글자 위에 첫 획부터 차례로 그어요' : '틀린 획이 많으면 힌트가 떠요');
  const quiz = () => wr.current?.quiz({
    showHintAfterMisses: trace ? 1 : 3, highlightOnComplete: true,
    onMistake: (s) => setMsg(`${s.strokeNum + 1}번째 획이 달라요 · 틀린 획 ${s.totalMistakes}/${limit}`),
    onComplete: (s) => {
      if (done.current) return;
      done.current = true;
      const ok = s.totalMistakes <= limit;
      setMsg(ok ? `잘 썼어요! (${n}획, 틀린 획 ${s.totalMistakes})` : `틀린 획이 ${s.totalMistakes}개라 다시 연습해요`);
      onDone(ok);
    },
  });
  useEffect(() => {
    const el = box.current!;
    el.innerHTML = '';
    const size = Math.min(300, Math.max(220, el.clientWidth || 260));
    wr.current = HanziWriter.create(el, ch, hwOpts(trace, size));
    done.current = false;
    quiz();
    return () => { el.innerHTML = ''; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ch, trace]);
  return (
    <div className="wpad">
      <div className="wbox" id="hw" ref={box} />
      <div className="wbtns">
        <button className="btn" onClick={() => { const w = wr.current!; w.cancelQuiz(); w.showCharacter(); w.animateCharacter({ onComplete: () => { if (!done.current) { w.hideCharacter(); quiz(); } } }); }}><L n="play" />획순 보기</button>
        <button className="btn" onClick={() => { if (done.current) return; wr.current!.cancelQuiz(); quiz(); }}><L n="rotate-ccw" />다시 쓰기</button>
      </div>
      <p className="note" id="wmsg">{msg}</p>
    </div>
  );
}

/** 소개 카드: 획순대로 따라 써야 다음으로 (처음 들어가는 단원) */
export function IntroTrace({ ch, wrote, onWrote }: { ch: string; wrote: boolean; onWrote: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const q = () => {
    const el = box.current!;
    el.innerHTML = '';
    const sz = Math.min(260, el.clientWidth || 240);
    const w = HanziWriter.create(el, ch, hwOpts(true, sz));
    w.quiz({ showHintAfterMisses: 1, onComplete: () => onWrote() });
    return sz;
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { q(); }, [ch]);
  return (
    <div className="itrace">
      <p className="itp" id="itp">{wrote ? '잘 썼어요! 다음으로 넘어가요' : '획순대로 따라 써야 다음으로 넘어가요'}</p>
      <div className="wbtns">
        <button className="btn" onClick={() => { const el = box.current!; el.innerHTML = ''; const sz = Math.min(260, el.clientWidth || 240); const w = HanziWriter.create(el, ch, hwOpts(true, sz)); w.animateCharacter({ onComplete: () => q() }); }}>획순 보기</button>
        <button className="btn" onClick={q}>다시 쓰기</button>
      </div>
      <div className="wbox" id="ihw" ref={box} />
    </div>
  );
}

/** 소개·정답 카드의 '따라 쓰기' 창 (채점 없음) */
export function TraceModal({ ch, label, onClose }: { ch: string; label: string; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [msg, setMsg] = useState('획순을 먼저 보고 따라 써 보세요');
  const size = () => Math.min(300, box.current!.clientWidth || 280);
  const make = (o: object) => { box.current!.innerHTML = ''; return HanziWriter.create(box.current!, ch, { ...hwOpts(true, size()), ...o }); };
  const q = (trace: boolean) => {
    const w = make(hwOpts(trace, size()));
    w.quiz({ showHintAfterMisses: trace ? 1 : 3, onMistake: (s) => setMsg(`${s.strokeNum + 1}번째 획이 달라요`), onComplete: (s) => setMsg(s.totalMistakes ? `다 썼어요 · 틀린 획 ${s.totalMistakes}개` : '완벽해요! 획순대로 잘 썼어요') });
    setMsg(trace ? '흐린 글자 위에 따라 써요' : '보지 않고 써 봐요');
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { make({ showCharacter: true }); }, [ch]);
  return (
    <div className="wmodal" role="dialog" aria-label={`${ch} 따라 쓰기`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div>
        <div className="wtop"><b className="hz">{ch}</b><span>{label} · {strokeData()?.[ch]?.strokes.length}획</span><button className="wxbtn" aria-label="닫기" onClick={onClose}><L n="x" /></button></div>
        <div className="wbox" id="hwm" ref={box} />
        <div className="wbtns">
          <button className="btn" onClick={() => { const w = make({ showCharacter: false }); w.animateCharacter(); setMsg('획순을 보여 주고 있어요'); }}><L n="play" />획순 보기</button>
          <button className="btn" onClick={() => q(true)}><L n="pencil" />따라 쓰기</button>
          <button className="btn" onClick={() => q(false)}><L n="pencil-line" />보고 쓰기</button>
        </div>
        <p className="note" id="wm">{msg}</p>
      </div>
    </div>
  );
}
