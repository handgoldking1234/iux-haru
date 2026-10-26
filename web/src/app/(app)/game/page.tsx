'use client';
/* 게임 — 스피드 게임·대결방(실시간)·산성비까지 프로토타입 play.js를 그대로 옮긴 playApp.js를 띄운다 */
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useKid } from '@/components/Kid';
import { openSheet, showNav } from '@/components/Shell';
import { pop } from '@/components/Toast';
import { logout } from '@/lib/account';
import { sfx } from '@/lib/feedback';
import { hgsFor } from '@/lib/play/hgs';
import { roomRT } from '@/lib/play/room';
import { hasSupabase } from '@/lib/supabase';
import { mountPlay } from '@/lib/play/playApp';

let PLAY_DATA: { ICONS: Record<string, string>; PLAY: unknown; LV?: unknown } | null = null;

function Game() {
  const router = useRouter();
  const sp = useSearchParams();
  const { kid } = useKid();
  const root = useRef<HTMLDivElement>(null);
  const [data, setData] = useState(PLAY_DATA);

  useEffect(() => {
    if (PLAY_DATA) return;
    // 게임 문제 + 게임 수준(초1~고3)별 문제 묶음
    Promise.all([fetch('/content/play.json').then((r) => r.json()), fetch('/content/play-lv.json').then((r) => r.json()).catch(() => null)])
      .then(([d, lv]) => { PLAY_DATA = { ...d, LV: lv }; setData(PLAY_DATA); });
  }, []);

  useEffect(() => {
    if (!data || !root.current) return;
    const HGS = hgsFor(kid.name);
    const app = mountPlay(root.current, {
      icons: data.ICONS, pd: data.PLAY, HGS, start: 'game', sub: sp.get('f') || undefined,
      // 실시간 대결방 (Supabase 로그인 학생만)
      rt: hasSupabase && kid.id ? roomRT(kid.id) : null,
      lv: data.LV, grade: kid.grade,
      hgNav: (on: boolean) => showNav(on),
      hgNavSel: (t: string) => { if (t !== 'game') router.push(`/${t === 'shop' ? 'my?f=shop' : t}`); },
      hgNavBadge: () => {},
      hgSheet: (k: 'noti' | 'menu') => openSheet(k),
      goSubject: (k: string) => router.push(`/study/${k}`),
      goStudy: () => router.push('/study'),
      hgLogout: async () => { await logout(); router.replace('/login'); },
      hgSfx: (k: 'ok' | 'no' | 'win') => sfx(k, HGS.st),
      fireAlarm: (a: { label?: string }) => pop(`${a.label || '공부할 시간'} — 알림 미리 보기`),
    });
    return () => { app.destroy(); showNav(true); };
  }, [data, kid.name, kid.id, kid.grade, router, sp]);

  return (
    <div className="frames">
      <div className="pg pg-play" ref={root} />
    </div>
  );
}

export default function GamePage() {
  return <Suspense><Game /></Suspense>;
}
