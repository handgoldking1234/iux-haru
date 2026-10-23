'use client';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { dayNumber, ensureDay, freshRewards, upgradeRewards, type RewardState } from '@/lib/rewards/rewards';
import { activeKid, refreshStore, setAuth, useAuth, useRewards, type Kid } from '@/lib/store';
import { hasSupabase, supabase } from '@/lib/supabase';
import { pull, setSyncKid } from '@/lib/sync';

interface KidCtx {
  kid: Kid;
  rewards: RewardState;
  today: number;
}

const Ctx = createContext<KidCtx | null>(null);

export const useKid = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('KidProvider 안에서 써야 해요');
  return v;
};

/** 로그인·자녀 선택을 확인하고, 서버에서 그 자녀의 기록을 내려받은 뒤 보상 상태를 내려 준다 */
export function KidProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const auth = useAuth();
  const kid = activeKid(auth);
  const stored = useRewards(kid?.name);
  const [ready, setReady] = useState<string | null>(null);

  useEffect(() => {
    if (auth === null) router.replace('/login');
    else if (auth && !kid) router.replace('/kids');
  }, [auth, kid, router]);

  // 학생이 바뀌면: 서버 기록 내려받기 (Supabase가 없으면 바로)
  const kidKey = kid ? `${kid.name}|${kid.id ?? ''}` : null;
  useEffect(() => {
    if (!kid || !kidKey) return;
    setSyncKid(kid);
    if (!hasSupabase) { setReady(kidKey); return; }
    let done = false;
    const finish = () => { if (!done) { done = true; setReady(kidKey); } };
    const giveUp = setTimeout(finish, 5000); // 서버가 늦으면 이 기기 기록으로 먼저 시작
    (async () => {
      const { data } = await supabase().auth.getSession();
      // 로그인이 풀렸거나, Supabase 연결 전에 만든 학생이면 다시 로그인
      if (!data.session || !kid.id) { setAuth(null); return; }
      try { if (await pull({ name: kid.name, id: kid.id })) refreshStore(); } catch { /* 오프라인: 이 기기 기록으로 */ }
      finish();
    })();
    return () => { done = true; clearTimeout(giveUp); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kidKey]);

  const today = dayNumber(new Date());
  // 저장된 게 없거나 날이 바뀌었으면 보기용으로 오늘 상태를 만든다 (저장은 문제를 풀 때)
  const rewards = useMemo(() => {
    const r = stored ? upgradeRewards(structuredClone(stored), today) : freshRewards(today);
    ensureDay(r, today);
    return r;
  }, [stored, today]);

  if (!kid || ready !== kidKey) return null;
  return <Ctx.Provider value={{ kid, rewards, today }}>{children}</Ctx.Provider>;
}
