'use client';
/* 소리 읽기 공통 — 기기 음성(TTS). 학습 카드의 듣기 · 반복(2초 간격) · 자동(카드를 넘기면 읽기), 타자 연습과 같은 규칙 */

const ok = () => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';

/** 기기 음성 중 AI(뉴럴)·고품질 목소리를 먼저 고른다 — Edge 'Online (Natural)', 크롬 'Google', 애플 '고품질/Premium' 등 */
const GOOD = /natural|neural|online|premium|enhanced|siri|google/i;
const NAMES = /yuna|sora|sunhi|injoon|hyunsu|seoyeon|jimin|samantha|aria|jenny|ava|allison|guy|davis|libby|sonia/i;
const BAD = /compact|espeak|robot|novelty|whisper|zarvox|bells|bad news|jester|trinoids/i;
export const vScore = (v: SpeechSynthesisVoice) => (GOOD.test(v.name) ? 50 : 0) + (NAMES.test(v.name) ? 25 : 0) + (v.localService === false ? 8 : 0) - (BAD.test(v.name) ? 80 : 0);
let VOICES: SpeechSynthesisVoice[] = [];
const loadV = () => { try { VOICES = speechSynthesis.getVoices() || []; } catch { VOICES = []; } };
if (ok()) { loadV(); try { speechSynthesis.addEventListener('voiceschanged', loadV); } catch { /* 무시 */ } }
export function bestVoice(lang: string): SpeechSynthesisVoice | null {
  if (!ok()) return null;
  if (!VOICES.length) loadV();
  const L = lang.slice(0, 2).toLowerCase(), exact = (x: SpeechSynthesisVoice) => (x.lang.replace('_', '-').toLowerCase() === lang.toLowerCase() ? 1 : 0);
  return VOICES.filter((x) => x.lang.slice(0, 2).toLowerCase() === L).sort((a, b) => vScore(b) - vScore(a) || exact(b) - exact(a))[0] ?? null;
}

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
      const v = bestVoice(lang);
      if (v) { u.voice = v; u.lang = v.lang; }
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
