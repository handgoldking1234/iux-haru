'use client';
/* 셸 알림 말풍선 (프로토타입 .hgt · pop) */
import { useEffect, useState } from 'react';

type Item = { id: number; msg: string; coin?: boolean };
let seq = 0;
const subs = new Set<(it: Item) => void>();

export function pop(msg: string, coin?: boolean) {
  const it = { id: ++seq, msg, coin };
  subs.forEach((f) => f(it));
}

export default function Toasts() {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    const f = (it: Item) => {
      // 프로토타입 pop: 최대 3개, 캐시는 1.1초 · 글은 2.6초
      setItems((a) => [...a, it].slice(-3));
      setTimeout(() => setItems((a) => a.filter((x) => x.id !== it.id)), it.coin ? 1100 : 2600);
    };
    subs.add(f);
    return () => void subs.delete(f);
  }, []);
  return (
    <div className="hgt" aria-live="polite">
      {items.map((it) => <div key={it.id} className={it.coin ? 'coin' : undefined}>{it.msg}</div>)}
    </div>
  );
}
