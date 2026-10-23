'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { isSubjectKey, LAST_SUBJECT } from '@/lib/subjects';


/** 하단 '공부'를 누르면 마지막으로 공부한 과목으로 */
export default function StudyIndex() {
  const router = useRouter();
  useEffect(() => {
    let k = 'math';
    try {
      const v = localStorage.getItem(LAST_SUBJECT);
      if (v && isSubjectKey(v)) k = v;
    } catch {}
    router.replace(`/study/${k}`);
  }, [router]);
  return null;
}
