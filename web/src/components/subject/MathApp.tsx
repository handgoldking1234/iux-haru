'use client';
/* 연산 화면 — 프로토타입 math.html을 그대로 옮긴 mathApp.js를 화면 틀에 띄우고, 셸 헤더(탭2)·보상·저장을 잇는다 */
import { useEffect, useRef, useState } from 'react';
import StudyTop from '@/components/StudyTop';
import { useKid } from '@/components/Kid';
import { saveLocal } from '@/lib/sync';
import { dayNumber, weekOkOf, weekOkText } from '@/lib/rewards/rewards';
import { getRewards } from '@/lib/store';
import { report } from '@/lib/feedback';
import { mountMath } from '@/lib/subjects/mathApp';

type Tab = { key: string; label: string; n: number; on: boolean };
const key = (kid: string) => `harugongbu-prog-${kid}-math-v7`;

export default function MathApp() {
  const { kid } = useKid();
  const root = useRef<HTMLDivElement>(null);
  const app = useRef<ReturnType<typeof mountMath> | null>(null);
  const [off, setOff] = useState(false);
  const [tabs, setTabs] = useState<Tab[]>([{ key: 'home', label: '연산학습', n: 0, on: true }, { key: 'cards', label: '오답노트', n: 0, on: false }, { key: 'report', label: '학습결과', n: 0, on: false }]);

  useEffect(() => {
    const el = root.current!;
    app.current = mountMath(el, {
      hg: (e: 'ok' | 'no' | 'pass' | 'grad') => report(kid.name, e, 'math'),
      load: () => { try { return JSON.parse(localStorage.getItem(key(kid.name)) || 'null'); } catch { return null; } },
      save: (S: unknown) => saveLocal(key(kid.name), S),
      // 새 학생: 기초(초1 덧셈)부터
      fresh: () => ({ offset: 0, active: 'me', profiles: { me: { id: 'me', name: kid.name, age: kid.grade, color: '#0FA37F', stage: 0, streak: 0, grad: 0, read: {}, passed: {}, sst: {}, stat: {}, hist: {}, cards: [], bp: {} } } }),
      switchKid: () => { location.href = '/kids'; },
      weekOk: () => weekOkText(weekOkOf(getRewards(kid.name), 'math', dayNumber(new Date())), '연산'),
      onSub: (o: boolean, list: Tab[]) => { setOff(o); setTabs(list); },
    });
    return () => { app.current?.destroy(); app.current = null; };
  }, [kid.name, kid.grade]);

  const cur = tabs.find((t) => t.on)?.key ?? 'home';
  return (
    <>
      <StudyTop subject="math" tab={cur} onTab={(k) => app.current?.subTab(k)} hidden={off}
        tabs={tabs.map((t) => ({ key: t.key, name: t.label, n: t.n }))} />
      <div className="frames">
        <div className="pg pg-math" ref={root} />
      </div>
    </>
  );
}
