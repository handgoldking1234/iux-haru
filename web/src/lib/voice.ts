'use client';
/* 소리 읽기 공통 — 기기 음성(TTS). 학습 카드의 듣기 · 반복(2초 간격) · 자동(카드를 넘기면 읽기), 타자 연습과 같은 규칙 */

const ok = () => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';

export const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function stopVoice() {
  if (ok()) try { speechSynthesis.cancel(); } catch { /* 소리를 못 내는 환경 */ }
}

/** 한 번 읽기 — 다 읽거나 멈추면 끝난다 */
export function sayText(text: string, lang = 'ko-KR'): Promise<void> {
  if (!ok() || !text) return Promise.resolve();
  return new Promise((res) => {
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang; u.rate = lang.startsWith('en') ? 0.85 : 0.95;
      const vs = speechSynthesis.getVoices?.() ?? [];
      const v = vs.find((x) => x.lang.replace('_', '-') === lang) || vs.find((x) => x.lang.startsWith(lang.slice(0, 2)));
      if (v) u.voice = v;
      u.onend = u.onerror = () => res();
      speechSynthesis.speak(u);
      setTimeout(res, 4000 + text.length * 300); // 끝 알림이 안 오는 기기 대비
    } catch { res(); }
  });
}

export type VoiceOpt = { rep: boolean; auto: boolean };
const KEY = 'hg-voice';
export function loadVoice(): VoiceOpt {
  try { return { rep: false, auto: true, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return { rep: false, auto: true }; }
}
export function saveVoice(o: VoiceOpt) {
  try { localStorage.setItem(KEY, JSON.stringify(o)); } catch { /* 저장 못 하는 환경 */ }
}
