'use client';
/* 캐릭터 반응 — 맞히면 통통, 틀리면 갸웃, 통과·완료면 크게 점프. 공부·게임 중 화면 아래에 잠깐 나타난다 (사용자 요청) */
import { useEffect, useState } from 'react';
import { avatar } from '@/lib/play/avatar';
import { Svg } from './Ic';
import { useKid } from './Kid';

export type BuddyKind = 'ok' | 'no' | 'win';
const subs = new Set<(k: BuddyKind) => void>();

export function buddy(k: BuddyKind) {
  subs.forEach((f) => f(k));
}

/** 누르면 통통 튀는 캐릭터 그림 (홈·마이) */
export function useHop() {
  const [n, setN] = useState(0);
  return { hop: () => setN((x) => x + 1), cls: n ? `hop${n % 2}` : '' };
}

export default function Buddy() {
  const { rewards } = useKid();
  const [ev, setEv] = useState<{ k: BuddyKind; id: number } | null>(null);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const f = (k: BuddyKind) => {
      setEv({ k, id: Date.now() });
      clearTimeout(t);
      t = setTimeout(() => setEv(null), k === 'win' ? 1700 : 1150);
    };
    subs.add(f);
    return () => { subs.delete(f); clearTimeout(t); };
  }, []);
  if (!ev) return null;
  return <div key={ev.id} className={`buddy b-${ev.k}`} aria-hidden="true"><Svg html={avatar(rewards.eq, 64)} /></div>;
}
