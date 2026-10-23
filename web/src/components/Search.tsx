'use client';
/* 통합 검색 창 — 프로토타입 search.js 그대로 (색인은 처음 열 때 불러옴) */
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createSearch } from '@/lib/searchApp';

let inst: ReturnType<typeof createSearch> | null = null;
let go: (k: string) => void = () => {};
let loading: Promise<void> | null = null;

export async function openSearch() {
  if (!inst) {
    await (loading ??= fetch('/content/search.json').then((r) => r.json()).then((idx) => { inst = createSearch({ idx, go: (k: string) => go(k) }); }));
  }
  inst!.open();
}

/** 결과에서 '공부하러 가기'를 누르면 그 과목으로 */
export default function SearchHost() {
  const router = useRouter();
  useEffect(() => {
    go = (k) => router.push(`/study/${k}`);
    return () => inst?.close();
  }, [router]);
  return null;
}
