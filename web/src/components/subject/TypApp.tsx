'use client';
/* 타자 화면 — 프로토타입 typ.js를 그대로 옮긴 typApp.js를 화면 틀에 띄우고, 셸 헤더(탭2)·보상·저장·타자 속도 랭킹을 잇는다 */
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import StudyTop from '@/components/StudyTop';
import { useKid } from '@/components/Kid';
import { saveLocal } from '@/lib/sync';
import { report, sfx } from '@/lib/feedback';
import { typLeftMs } from '@/lib/rewards/rewards';
import { updateRewards } from '@/lib/store';
import { mountTyp } from '@/lib/subjects/typApp';

type Tab = { key: string; label: string; n: number; on: boolean };
const key = (kid: string) => `harugongbu-prog-${kid}-typ-v1`;

export default function TypApp({ data }: { data: unknown }) {
  const { kid, rewards, today } = useKid();
  const root = useRef<HTMLDivElement>(null);
  const app = useRef<ReturnType<typeof mountTyp> | null>(null);
  const live = useRef(rewards);
  live.current = rewards;
  const [off, setOff] = useState(false);
  const [tabs, setTabs] = useState<Tab[]>([{ key: 'home', label: '연습', n: 0, on: true }, { key: 'cards', label: '게임', n: 0, on: false }, { key: 'report', label: '기록', n: 0, on: false }]);

  useEffect(() => {
    app.current = mountTyp(root.current!, {
      data,
      hg: (e: 'ok' | 'no' | 'pass' | 'grad') => report(kid.name, e, 'typ'),
      load: () => { try { return JSON.parse(localStorage.getItem(key(kid.name)) || 'null'); } catch { return null; } },
      save: (S: unknown) => saveLocal(key(kid.name), S),
      sfx: (k: 'ok' | 'no' | 'win') => sfx(k, live.current),
      // 하루공부 랭킹 '타자 속도'
      pushCpm: (c: number) => updateRewards(kid.name, (st) => { if (c > (st.typCpm ?? 0)) st.typCpm = c; }),
      nick: kid.name,
      onSub: (o: boolean, list: Tab[]) => { setOff(o); setTabs(list); },
    });
    return () => { app.current?.destroy(); app.current = null; };
  }, [data, kid.name]);

  // 하루 사용 시간: 키를 누른 뒤 15초 안의 시간만 센다(화면만 켜 둔 시간은 빼고), 10초마다 저장
  const lastKey = useRef(0), acc = useRef(0);
  const locked = typLeftMs(rewards, today) <= 0;
  useEffect(() => {
    if (locked) return;
    const hit = () => { lastKey.current = Date.now(); };
    const flush = () => { if (!acc.current) return; const ms = acc.current; acc.current = 0; updateRewards(kid.name, (st) => { st.typMs ??= {}; st.typMs[today] = (st.typMs[today] ?? 0) + ms; }); };
    let n = 0;
    const tick = setInterval(() => {
      if (document.visibilityState === 'visible' && Date.now() - lastKey.current < 15000) acc.current += 1000;
      if (++n % 10 === 0 || typLeftMs(live.current, today) - acc.current <= 0) flush();
    }, 1000);
    window.addEventListener('keydown', hit); window.addEventListener('pointerdown', hit);
    return () => { clearInterval(tick); flush(); window.removeEventListener('keydown', hit); window.removeEventListener('pointerdown', hit); };
  }, [kid.name, today, locked]);

  const cur = tabs.find((t) => t.on)?.key ?? 'home';
  return (
    <>
      <StudyTop subject="typ" tab={cur} onTab={(k) => app.current?.subTab(k)} hidden={off}
        tabs={tabs.map((t) => ({ key: t.key, name: t.label, n: t.n }))} />
      <div className="frames">
        <div className="pg pg-sub s-typ" ref={root} />
        {locked && (
          <div className="pg pg-sub s-typ typlock">
            <section className="sec center">
              <h2>오늘 타자 연습 시간을 다 썼어요</h2>
              <p className="note">하루 {rewards.typLimit}분까지 할 수 있어요. 손목도 쉬어야 해요. 내일 또 만나요!</p>
              <Link className="btn y" href="/home">홈으로 가기</Link>
            </section>
          </div>
        )}
      </div>
    </>
  );
}
