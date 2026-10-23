'use client';
/**
 * 브라우저 저장소 상태. Supabase를 붙이기 전(로컬 모드)과 오프라인 캐시에 쓴다.
 * 로그인 키는 프로토타입과 같게 둬서 테스트 스크립트를 그대로 쓸 수 있게 한다.
 */
import { useSyncExternalStore } from 'react';
import { dayNumber, ensureDay, freshRewards, upgradeRewards, type RewardState } from './rewards/rewards';
import { saveLocal } from './sync';

export const AUTH_KEY = 'harugongbu-auth';
const rewardsKey = (kid: string) => `harugongbu-rewards-${kid}`;

export interface Kid {
  name: string;
  grade: string;
  /** Supabase 학생 id (로컬 모드에서는 없음) */
  id?: string;
}
/** 프로토타입 harugongbu-auth와 같은 모양 */
export interface LocalAuth {
  email: string;
  via?: string;
  kids: Kid[];
  /** 고른 학생 순번. 없으면 학생 고르기 화면 */
  kid?: number;
  code?: string | null;
}

const subs = new Set<() => void>();
const cache = new Map<string, { raw: string | null; val: unknown }>();
const notify = () => subs.forEach((f) => f());

function readJSON<T>(key: string): T | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return null;
  }
  const c = cache.get(key);
  if (c && c.raw === raw) return c.val as T;
  let val: T | null = null;
  try {
    val = raw ? (JSON.parse(raw) as T) : null;
  } catch {
    val = null;
  }
  cache.set(key, { raw, val });
  return val;
}

function writeJSON(key: string, v: unknown) {
  try {
    if (v == null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* 저장이 막힌 브라우저에서는 이번 화면에서만 유지 */
  }
  notify();
}

function subscribe(f: () => void) {
  subs.add(f);
  const onStorage = () => f();
  window.addEventListener('storage', onStorage);
  return () => {
    subs.delete(f);
    window.removeEventListener('storage', onStorage);
  };
}

/** 서버 렌더에서는 undefined(아직 모름), 브라우저에서는 값 또는 null */
export function useAuth(): LocalAuth | null | undefined {
  return useSyncExternalStore(subscribe, () => readJSON<LocalAuth>(AUTH_KEY), () => undefined);
}

export const setAuth = (a: LocalAuth | null) => writeJSON(AUTH_KEY, a);

export function activeKid(a: LocalAuth | null | undefined): Kid | null {
  if (!a || !a.kids?.length || a.kid == null) return null;
  return a.kids[a.kid] ?? null;
}

export function useRewards(kid: string | undefined): RewardState | null {
  return useSyncExternalStore(
    subscribe,
    () => (kid ? readJSON<RewardState>(rewardsKey(kid)) : null),
    () => null,
  );
}

/** 보상 상태를 꺼내 고치고 저장한다. 처음이면 새로 만든다 */
export function updateRewards(kid: string, f: (st: RewardState, today: number) => void) {
  const today = dayNumber(new Date());
  const saved = readJSON<RewardState>(rewardsKey(kid));
  const st: RewardState = saved ? upgradeRewards(structuredClone(saved), today) : freshRewards(today);
  ensureDay(st, today);
  f(st, today);
  saveLocal(rewardsKey(kid), st);
  notify();
}

/** 보상 상태를 그대로 꺼내기 · 바꾼 것을 저장하기 (놀이터 게임 코드가 쓰는 HGS 연결용) */
export function getRewards(kid: string): RewardState {
  const today = dayNumber(new Date());
  const saved = readJSON<RewardState>(rewardsKey(kid));
  const st = saved ? upgradeRewards(structuredClone(saved), today) : freshRewards(today);
  ensureDay(st, today);
  return st;
}
export function setRewards(kid: string, st: RewardState) {
  saveLocal(rewardsKey(kid), st);
  notify();
}

/** 서버에서 기록을 내려받은 뒤 화면을 다시 그리게 한다 */
export const refreshStore = () => notify();
