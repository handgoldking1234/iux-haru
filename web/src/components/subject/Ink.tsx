'use client';
/* 펜으로 쓰기 — 프로토타입 eng.js inkPad · openEngTrace · 소개 카드 따라 쓰기 그대로 (4선 노트 캔버스) */
import { useEffect, useRef, useState } from 'react';
import L from './L';

export function inkPad(cv: HTMLCanvasElement, guide: string, onLen?: (len: number) => void) {
  const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  const x = cv.getContext('2d')!; x.scale(dpr, dpr);
  const bg = () => {
    x.clearRect(0, 0, W, H); const top = H * 0.18, bot = H * 0.82, gap = (bot - top) / 3; x.lineWidth = 1;
    for (let i = 0; i < 4; i++) { x.strokeStyle = i === 2 ? '#E5484D55' : '#C9D1DB'; x.setLineDash(i === 1 ? [5, 5] : []); x.beginPath(); x.moveTo(8, top + gap * i); x.lineTo(W - 8, top + gap * i); x.stroke(); }
    x.setLineDash([]);
    if (guide) {
      let fs = gap * 2.05; x.font = `500 ${fs}px "Comic Sans MS","Noto Sans KR",sans-serif`;
      while (x.measureText(guide).width > W - 24 && fs > 14) { fs -= 2; x.font = `500 ${fs}px "Comic Sans MS","Noto Sans KR",sans-serif`; }
      x.fillStyle = '#D5DAE1'; x.textBaseline = 'alphabetic'; x.fillText(guide, (W - x.measureText(guide).width) / 2, top + gap * 2);
    }
  };
  bg();
  let down = false, last: [number, number] | null = null, inkLen = 0; x.lineCap = 'round'; x.lineJoin = 'round';
  const pos = (e: PointerEvent): [number, number] => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.onpointerdown = (e) => { down = true; last = pos(e); cv.setPointerCapture(e.pointerId); e.preventDefault(); };
  cv.onpointermove = (e) => {
    if (!down || !last) return; const p = pos(e), q0 = last;
    x.strokeStyle = '#1E2421'; x.lineWidth = e.pointerType === 'pen' ? Math.max(2, 4 * (e.pressure || 0.5)) : 3.5;
    x.beginPath(); x.moveTo(...last); x.lineTo(...p); x.stroke(); last = p; cv.dataset.ink = '1'; inkLen += Math.hypot(p[0] - q0[0], p[1] - q0[1]);
  };
  cv.onpointerup = cv.onpointercancel = () => { down = false; onLen?.(inkLen); };
  return { clear: () => { bg(); delete cv.dataset.ink; } };
}

/** 철자 문제를 펜으로: 쓰고 '다 썼어요' → 정답과 비교해 스스로 맞음/틀림 */
export function SpellPen({ ans, onAnswer, onKeyboard }: { ans: string; onAnswer: (ok: boolean) => void; onKeyboard: () => void }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const pad = useRef<ReturnType<typeof inkPad> | null>(null);
  const [check, setCheck] = useState(false);
  const [kbdText, setKbdText] = useState('키보드로 쓸래요');
  useEffect(() => { pad.current = inkPad(cv.current!, ''); }, []);
  return (
    <div className="epad" id="chp">
      <canvas className="ecv" id="ecv" ref={cv} />
      <div className="wbtns" id="ebt">
        {check ? (
          <><p className="echk">정답 <b className="en">{ans}</b> · 똑같이 썼나요?</p><button className="btn" onClick={() => onAnswer(false)}>틀렸어요</button><button className="btn y" onClick={() => onAnswer(true)}>맞았어요</button></>
        ) : (
          <><button className="btn" onClick={() => pad.current?.clear()}><L n="rotate-ccw" />지우기</button>
            <button className="btn y" onClick={() => { if (!cv.current!.dataset.ink) { setKbdText('먼저 철자를 써 보세요 · 키보드로 쓸래요'); return; } setCheck(true); }}>다 썼어요</button></>
        )}
      </div>
      <button className="lnk" id="eKbd" onClick={onKeyboard}>{kbdText}</button>
    </div>
  );
}

/** 철자 문제를 키보드로: 글자 수만큼 쓰면 바로 채점 */
export function SpellInput({ ans, done, ok, onAnswer }: { ans: string; done: boolean; ok: boolean | null; onAnswer: (v: string) => void }) {
  const [v, setV] = useState('');
  const inp = useRef<HTMLInputElement>(null);
  useEffect(() => { const t = setTimeout(() => inp.current?.focus(), 50); return () => clearTimeout(t); }, []);
  return (
    <div className="spell" id="ch">
      <input ref={inp} id="sp" type="text" {...({ inputMode: 'latin' } as Record<string, string>)} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} maxLength={ans.length + 4}
        placeholder={'_ '.repeat(ans.length).trim()} aria-label="철자 입력" disabled={done} className={done ? (ok ? 'ok' : 'no') : ''} value={v}
        onChange={(e) => { setV(e.target.value); if (!done && e.target.value.trim().length >= ans.length) onAnswer(e.target.value.trim()); }}
        onKeyDown={(e) => { if (e.key === 'Enter' && v.trim() && !done) onAnswer(v.trim()); }} />
      <button className="btn y" id="spOk" disabled={done} onClick={() => v.trim() && onAnswer(v.trim())}>확인</button>
      <small>글자 수만큼 쓰면 바로 채점돼요</small>
    </div>
  );
}

/** 소개 카드: 흐린 글자 위에 충분히 따라 써야 다음으로 */
export function IntroInk({ word, wrote, onWrote }: { word: string; wrote: boolean; onWrote: () => void }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const pad = useRef<ReturnType<typeof inkPad> | null>(null);
  useEffect(() => {
    const need = Math.max(60, word.length * 28);
    pad.current = inkPad(cv.current!, word, (len) => { if (len >= need) onWrote(); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word]);
  return (
    <div className="itrace">
      <p className="itp" id="itp">{wrote ? '잘 썼어요! 다음으로 넘어가요' : '흐린 글자 위에 따라 써야 다음으로 넘어가요'}</p>
      <div className="wbtns"><button className="btn" onClick={() => pad.current?.clear()}>지우기</button></div>
      <canvas className="ecv" id="icv" ref={cv} />
    </div>
  );
}

/** 정보 카드의 '따라 쓰기' 창 */
export function InkModal({ word, label, onClose }: { word: string; label: string; onClose: () => void }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const pad = useRef<ReturnType<typeof inkPad> | null>(null);
  const [guide, setGuide] = useState(true);
  useEffect(() => { pad.current = inkPad(cv.current!, guide ? word : ''); }, [guide, word]);
  return (
    <div className="wmodal" role="dialog" aria-label={`${word} 따라 쓰기`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div>
        <div className="wtop"><b className="en">{word}</b><span>{label}</span><button className="wxbtn" aria-label="닫기" onClick={onClose}><L n="x" /></button></div>
        <canvas className="ecv" id="ecv" ref={cv} />
        <div className="wbtns"><button className="btn" onClick={() => setGuide(!guide)}>흐린 글자 켜기/끄기</button><button className="btn" onClick={() => pad.current?.clear()}>지우기</button></div>
        <p className="note">흐린 글자 위에 따라 쓰고, 익숙해지면 글자를 끄고 써 봐요.</p>
      </div>
    </div>
  );
}
