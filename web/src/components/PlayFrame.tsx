'use client';
/* 놀이터 화면 틀 — 프로토타입 play.tpl.html의 .app > #bar(.b1 · .b2) + #screen. iframe 대신 .pg-play로 CSS 범위를 나눔 */
import { useEffect, useRef } from 'react';
import { allDone } from '@/lib/rewards/rewards';
import Ic from './Ic';
import { useKid } from './Kid';
import { openSheet } from './Shell';

export interface Pill<T extends string> {
  key: T;
  name: string;
  /** 알약 숫자 (랭킹은 '위'를 붙임) */
  n?: number;
}

export default function PlayFrame<T extends string>({ title, back, pills, cur, onPill, rank, logo, children }: {
  title: string;
  /** 홈: 제목 대신 하루공부 로고(심볼 + 글자) */
  logo?: boolean;
  back?: () => void;
  pills?: Pill<T>[];
  cur?: T;
  onPill?: (k: T) => void;
  rank?: boolean;
  children: React.ReactNode;
}) {
  const { rewards, today } = useKid();
  const b2 = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLElement>(null);

  useEffect(() => {
    b2.current?.querySelector('.on')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [cur]);
  useEffect(() => {
    screen.current?.scrollTo(0, 0);
  }, [title, cur]);

  return (
    <div className="frames">
      <div className="pg pg-play">
        <div className="app">
          <header id="bar">
            <div className="b1">
              {back && <button className="bb" onClick={back} aria-label="뒤로"><Ic n="arrow-left" /></button>}
              {logo ? <h1 className="brand">하루5분</h1> : <h1>{title}</h1>}
              {!back && (
                <>
                  <button className="hb" aria-label="알림" onClick={() => openSheet('noti')}><Ic n="bell" />{!allDone(rewards, today) && <i className="hdot" />}</button>
                  <button className="hb" aria-label="전체보기" onClick={() => openSheet('menu')}><Ic n="menu" /></button>
                </>
              )}
            </div>
            <div className="b2" role="tablist" ref={b2} hidden={!!back || !pills}>
              {!back && pills?.map((p) => (
                <button key={p.key} role="tab" className={`pill ${cur === p.key ? 'on' : ''}`} aria-selected={cur === p.key}
                  onClick={() => cur !== p.key && onPill?.(p.key)}>
                  {p.name}{p.n && p.n > 0 ? <em>{p.n}{rank ? '위' : ''}</em> : null}
                </button>
              ))}
            </div>
          </header>
          <main id="screen" ref={screen} className={cur && cur !== 'all' ? 'filtering' : undefined}>{children}</main>
        </div>
      </div>
    </div>
  );
}
