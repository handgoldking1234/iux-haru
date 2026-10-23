'use client';
/* 실제 학생 랭킹 — Supabase leaderboard 함수(닉네임·캐릭터·점수만). 키가 없으면(로컬 모드) 예시 친구로 대신한다 */
import { useEffect, useState } from 'react';
import { dayNumber, weekNumber, type Equip } from '../rewards/rewards';
import { hasSupabase, supabase } from '../supabase';
import type { RankMode } from './data';

export interface BoardRow { name: string; eq: Partial<Equip>; v: number; xp: number; me: boolean }

const cache = new Map<string, { at: number; rows: BoardRow[] }>();
const subs = new Set<() => void>();
const TTL = 60_000;

export async function fetchBoard(mode: RankMode, kidId: string): Promise<BoardRow[]> {
  const k = `${kidId}|${mode}`, c = cache.get(k);
  if (c && Date.now() - c.at < TTL) return c.rows;
  const { data, error } = await supabase().rpc('leaderboard', { mode, wk: weekNumber(dayNumber(new Date())), me: kidId });
  if (error) throw error;
  const rows = (data ?? []).map((r: { nickname: string; eq: Partial<Equip>; val: number; xp: number; mine: boolean }) => ({ name: r.nickname, eq: r.eq, v: r.val, xp: r.xp, me: r.mine }));
  cache.set(k, { at: Date.now(), rows });
  subs.forEach((f) => f());
  return rows;
}

/** 순위표 (null = 아직 불러오는 중 · 로컬 모드) */
export function useBoard(mode: RankMode, kidId?: string): BoardRow[] | null {
  const [, bump] = useState(0);
  useEffect(() => {
    const f = () => bump((x) => x + 1);
    subs.add(f);
    if (hasSupabase && kidId) fetchBoard(mode, kidId).catch(() => {});
    return () => void subs.delete(f);
  }, [mode, kidId]);
  return hasSupabase && kidId ? cache.get(`${kidId}|${mode}`)?.rows ?? null : null;
}

/** 내 순위 (순위표 밖이면 null) */
export const rankIn = (rows: BoardRow[] | null) => {
  if (!rows) return null;
  const i = rows.findIndex((r) => r.me);
  return i >= 0 ? i + 1 : null;
};

/** 내 순위 — 서버 순위표에 내 최신 기록(아직 안 올라간 것까지)을 넣어 센다 */
export const rankWith = (rows: BoardRow[], myV: number) => 1 + rows.filter((r) => !r.me && r.v > myV).length;
