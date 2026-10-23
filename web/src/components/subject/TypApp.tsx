'use client';
/* 타자 화면 — 프로토타입 typ.js를 그대로 옮긴 typApp.js를 화면 틀에 띄우고, 셸 헤더(탭2)·보상·저장·타자 속도 랭킹을 잇는다 */
import { useEffect, useRef, useState } from 'react';
import StudyTop from '@/components/StudyTop';
import { useKid } from '@/components/Kid';
import { saveLocal } from '@/lib/sync';
import { report, sfx } from '@/lib/feedback';
import { updateRewards } from '@/lib/store';
import { mountTyp } from '@/lib/subjects/typApp';

type Tab = { key: string; label: string; n: number; on: boolean };
const key = (kid: string) => `harugongbu-prog-${kid}-typ-v1`;

export default function TypApp({ data }: { data: unknown }) {
  const { kid, rewards } = useKid();
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

  const cur = tabs.find((t) => t.on)?.key ?? 'home';
  return (
    <>
      <StudyTop subject="typ" tab={cur} onTab={(k) => app.current?.subTab(k)} hidden={off}
        tabs={tabs.map((t) => ({ key: t.key, name: t.label, n: t.n }))} />
      <div className="frames">
        <div className="pg pg-sub s-typ" ref={root} />
      </div>
    </>
  );
}
