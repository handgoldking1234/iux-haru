'use client';
/* 공부 — 셸 헤더(.top) + 과목 화면. 과목은 프로토타입 마크업 그대로 옮긴 것부터 차례로 연결한다 */
import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import StudyTop from '@/components/StudyTop';
import MathApp from '@/components/subject/MathApp';
import SubjectApp from '@/components/subject/SubjectApp';
import TypApp from '@/components/subject/TypApp';
import { isSubjectKey, LAST_SUBJECT, SUBJECTS, type SubjectKey } from '@/lib/subjects';
import { bindHanjaWrite, HANJA, loadStrokes } from '@/lib/subjects/hanja';
import { bindEngPen, ENG } from '@/lib/subjects/eng';
import { HIST } from '@/lib/subjects/hist';
import { updateRewards } from '@/lib/store';
import { useKid } from '@/components/Kid';
import { KOR } from '@/lib/subjects/kor';
import { SCI } from '@/lib/subjects/sci';
import type { SubjectDef } from '@/lib/subjects/types';

const DEFS: Partial<Record<SubjectKey, SubjectDef>> = { hanja: HANJA, eng: ENG, hist: HIST, kor: KOR, sci: SCI };
const cache: Record<string, unknown> = {};

export default function SubjectPage() {
  const { subject } = useParams<{ subject: string }>();
  const ok = isSubjectKey(subject);
  const def = ok ? DEFS[subject] : undefined;
  const [data, setData] = useState<unknown>(() => (ok ? cache[subject] : undefined));
  const { kid, rewards } = useKid();
  // 한자 쓰기 문제 넣기 = 마이 > 설정과 같은 값 (프로토타입 HGS.st.hanjaWrite)
  bindHanjaWrite(() => rewards.hanjaWrite !== false, (on) => updateRewards(kid.name, (st) => { st.hanjaWrite = on; }));
  bindEngPen(() => rewards.engWrite !== false, (on) => updateRewards(kid.name, (st) => { st.engWrite = on; }));

  useEffect(() => {
    if (!ok) return;
    try {
      localStorage.setItem(LAST_SUBJECT, subject);
      localStorage.setItem('harugongbu-study', subject);
    } catch {}
    if (subject === 'hanja') loadStrokes();
    if ((!def && subject !== 'typ') || cache[subject]) return;
    fetch(`/content/${subject}.json`).then((r) => r.json()).then((d) => { cache[subject] = d; setData(d); });
  }, [ok, subject, def]);

  if (!ok) notFound();
  if (subject === 'math') return <MathApp />;
  if (def && data) return <SubjectApp def={def} data={data} />;
  if (subject === 'typ' && data) return <TypApp data={data} />;
  return <Pending subject={subject} />;
}

/** 과목 데이터를 불러오는 중 */
function Pending({ subject }: { subject: SubjectKey }) {
  const info = SUBJECTS[subject];
  const [tab, setTab] = useState<'home' | 'cards' | 'report'>('home');
  return (
    <>
      <StudyTop subject={subject} tab={tab} onTab={setTab}
        tabs={[{ key: 'home', name: `${info.name}${subject === 'typ' ? '연습' : '학습'}` }, { key: 'cards', name: '오답노트' }, { key: 'report', name: '학습결과' }]} />
      <div className="frames">
        <div className={`pg pg-sub s-${subject}`}><div className="app"><div id="screen">
          <section className="sec"><p className="note">불러오는 중…</p></section>
        </div></div></div>
      </div>
    </>
  );
}
