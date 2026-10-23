'use client';
/* 과목 갈래별 진도 저장 (학생·과목·갈래마다). Supabase를 붙이면 progress·passed_units·wrong_cards로 옮긴다 */
import { newProgress } from './engine/progress';
import type { LastPosStore, Progress } from './engine/types';
import { saveLocal } from './sync';

export interface SubjectSave {
  p: Progress;
  /** 날짜별 푼 문제·정답·시간 */
  hist: Record<number, { n: number; c: number; ms: number }>;
  /** 학교급(영역)별 누적 */
  stat: Record<string, { n: number; c: number }>;
  /** 단원별 최근 점수 3개 */
  sst: Record<string, number[]>;
  /** 시연 도구 '하루 넘기기' */
  offset: number;
}

const key = (kid: string, subject: string, track: string) => `harugongbu-prog-${kid}-${subject}-${track}`;

export const freshSave = (): SubjectSave => ({ p: newProgress(), hist: {}, stat: {}, sst: {}, offset: 0 });

export function loadSave(kid: string, subject: string, track: string): SubjectSave {
  try {
    const v = JSON.parse(localStorage.getItem(key(kid, subject, track)) || 'null');
    if (v && v.p) return { ...freshSave(), ...v };
  } catch { /* 처음 */ }
  return freshSave();
}

export function storeSave(kid: string, subject: string, track: string, s: SubjectSave) {
  saveLocal(key(kid, subject, track), s);
}

export function loadTrack(subject: string, def: string) {
  try {
    return localStorage.getItem(`${subject}-track`) || def;
  } catch {
    return def;
  }
}
export function storeTrack(subject: string, tr: string) {
  try {
    localStorage.setItem(`${subject}-track`, tr);
  } catch { /* 무시 */ }
}

/** 문제별 직전 정답 위치 (프로토타입 hg-lastpos-<제목>, 최대 3,000개) */
export function lastPosStore(name: string): LastPosStore {
  const k = `hg-lastpos-${name}`;
  let LP: Record<string, number> = {};
  try { LP = JSON.parse(localStorage.getItem(k) || '{}'); } catch { /* 처음 */ }
  return {
    get: (q) => LP[q],
    set: (q, v) => {
      LP[q] = v;
      const ks = Object.keys(LP);
      if (ks.length > 3000) ks.slice(0, ks.length - 3000).forEach((x) => delete LP[x]);
      try { localStorage.setItem(k, JSON.stringify(LP)); } catch { /* 무시 */ }
    },
  };
}
