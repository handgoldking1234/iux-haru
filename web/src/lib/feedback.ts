'use client';
/* 과목 → 셸 보상 연결 (프로토타입 shell.html message 처리 · sfx · bigStamp) */
import { pop } from '@/components/Toast';
import { rewardEvent, type RewardState } from './rewards/rewards';
import { updateRewards } from './store';
import type { SubjectKey } from './subjects';

let AC: AudioContext | null = null;

/** 효과음: 파일 없이 브라우저에서 바로 만듦 (마이 > 설정에서 끄기) */
export function sfx(k: 'ok' | 'no' | 'win', st?: RewardState | null) {
  if (st?.sfx === false) return;
  try {
    const W = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
    AC = AC || new (W.AudioContext || W.webkitAudioContext)!();
    if (AC.state === 'suspended') AC.resume();
    const ac = AC, t = ac.currentTime + 0.01;
    const tone = (f: number, s: number, d: number, type: OscillatorType = 'triangle', v = 0.2) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f, t + s);
      g.gain.setValueAtTime(0.0001, t + s);
      g.gain.exponentialRampToValueAtTime(v, t + s + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + s + d);
      o.connect(g);
      g.connect(ac.destination);
      o.start(t + s);
      o.stop(t + s + d + 0.03);
    };
    if (k === 'ok') { tone(784, 0, 0.11); tone(1175, 0.08, 0.2); }
    else if (k === 'no') { tone(196, 0, 0.16, 'sawtooth', 0.07); tone(147, 0.11, 0.24, 'sawtooth', 0.07); }
    else [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.085, 0.22));
  } catch { /* 소리를 못 내는 환경 */ }
}

/** 오늘 할 일 완료 도장 */
function bigStamp(best: boolean) {
  const o = document.createElement('div');
  o.className = 'bstamp';
  const c = best ? '#C98A00' : '#D1352B';
  o.innerHTML = `<div><svg width="180" height="180" viewBox="0 0 100 100"><g transform="rotate(-14 50 50)" fill="none" stroke="${c}"><circle cx="50" cy="50" r="44" stroke-width="5"/><circle cx="50" cy="50" r="36" stroke-width="2"/><path d="M22 56 Q50 62 78 56" stroke-width="2"/></g><g transform="rotate(-14 50 50)" fill="${c}" font-family="'Noto Sans KR',sans-serif" font-weight="900" text-anchor="middle"><text x="50" y="${best ? 50 : 52}" font-size="${best ? 24 : 30}">${best ? '최고' : '참'}</text><text x="50" y="74" font-size="${best ? 18 : 14}">${best ? '예요' : '잘했어요'}</text></g></svg><b>오늘 할 일 완료!</b><small>꾸미기·게임이 열렸어요</small></div>`;
  document.body.appendChild(o);
  o.onclick = () => o.remove();
  setTimeout(() => o.remove(), 2600);
}

/** 과목 화면의 결과(ok·no·pass·grad)를 보상에 반영하고 소리·말풍선을 낸다 */
export function report(kid: string, e: 'ok' | 'no' | 'pass' | 'grad', s: SubjectKey) {
  let msg: string[] = [], gain = 0, best = false, st: RewardState | null = null;
  updateRewards(kid, (r, today) => {
    st = r;
    const out = rewardEvent(r, e, s, today);
    msg = out.msg;
    gain = out.gain;
    const d = r.day!;
    best = d.ok / (d.ok + d.no || 1) >= 0.9;
  });
  if (s !== 'typ') {
    if (e === 'ok') sfx('ok', st);
    else if (e === 'no') sfx('no', st);
    else if (e === 'pass') sfx('win', st);
  }
  if (msg.some((x) => x.includes('오늘 할 일 완료'))) bigStamp(best);
  if (gain) pop(`${gain > 0 ? '+' : '−'}${Math.abs(gain)} 캐시`, true);
  msg.forEach((x) => pop(x));
}
