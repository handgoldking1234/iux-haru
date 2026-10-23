'use client';
/* 게임 — 스피드 게임·대결방(가상 친구)·산성비까지 프로토타입 play.js를 그대로 옮긴 playApp.js를 띄운다 */
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useKid } from '@/components/Kid';
import { openSheet, showNav } from '@/components/Shell';
import { pop } from '@/components/Toast';
import { logout } from '@/lib/account';
import { sfx } from '@/lib/feedback';
import { hgsFor } from '@/lib/play/hgs';
import { mountPlay } from '@/lib/play/playApp';

let PLAY_DATA: { ICONS: Record<string, string>; PLAY: unknown } | null = null;

function Game() {
  const router = useRouter();
  const sp = useSearchParams();
  const { kid } = useKid();
  const root = useRef<HTMLDivElement>(null);
  const [data, setData] = useState(PLAY_DATA);

  useEffect(() => {
    if (PLAY_DATA) return;
    fetch('/content/play.json').then((r) => r.json()).then((d) => { PLAY_DATA = d; setData(d); });
  }, []);

  useEffect(() => {
    if (!data || !root.current) return;
    const HGS = hgsFor(kid.name);
    const app = mountPlay(root.current, {
      icons: data.ICONS, pd: data.PLAY, HGS, start: 'game', sub: sp.get('f') || undefined,
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
  }, [data, kid.name, router, sp]);

  return (
    <div className="frames">
      <div className="pg pg-play" ref={root} />
    </div>
  );
}

export default function GamePage() {
  return <Suspense><Game /></Suspense>;
}
