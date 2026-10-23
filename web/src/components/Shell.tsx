'use client';
/* 셸 공통: 하단 메뉴(.gnav), 알림·전체보기 시트(.sheet) — 프로토타입 shell.html 그대로 */
import { BookOpen, House, Swords, Trophy, UserRound, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { backlogTotal as backTotal, block, gamesLeft, tasks, todayDone } from '@/lib/rewards/rewards';
import { myRank } from '@/lib/play/data';
import { MENU_ORDER, SUBJECTS } from '@/lib/subjects';
import { useKid } from './Kid';

/* ---------- 시트 ---------- */
type SheetKind = 'noti' | 'menu';
const sheetSubs = new Set<(k: SheetKind) => void>();
export const openSheet = (k: SheetKind) => sheetSubs.forEach((f) => f(k));

export function SheetHost() {
  const router = useRouter();
  const { rewards, today } = useKid();
  const [k, setK] = useState<SheetKind | null>(null);
  const back = useRef<HTMLElement | null>(null);
  const xRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const f = (x: SheetKind) => {
      back.current = document.activeElement as HTMLElement;
      setK(x);
      setTimeout(() => xRef.current?.focus(), 30);
    };
    sheetSubs.add(f);
    return () => void sheetSubs.delete(f);
  }, []);
  useEffect(() => {
    if (!k) return;
    const f = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', f);
    return () => document.removeEventListener('keydown', f);
  });
  if (!k) return null;

  function close() {
    setK(null);
    back.current?.focus?.();
  }
  const to = (href: string) => () => {
    close();
    router.push(href);
  };

  let body: React.ReactNode;
  if (k === 'menu') {
    body = (
      <>
        <div className="sgrp"><div className="sgrid"><button className="big" onClick={to('/home')}>홈 · 오늘 할 일</button></div></div>
        <div className="sgrp"><h3>공부</h3><div className="sgrid">{MENU_ORDER.map((s) => <button key={s} onClick={to(`/study/${s}`)}>{SUBJECTS[s].name}</button>)}</div></div>
        <div className="sgrp"><h3>게임</h3><div className="sgrid"><button onClick={to('/game?f=speed')}>스피드 게임</button><button onClick={to('/game?f=room')}>대결방</button><button onClick={to('/game?f=set')}>게임 설정</button></div></div>
        <div className="sgrp"><h3>랭킹</h3><div className="sgrid"><button onClick={to('/rank')}>랭킹 보기</button></div></div>
        <div className="sgrp"><h3>마이</h3><div className="sgrid"><button onClick={to('/my?f=info')}>내 정보</button><button onClick={to('/my?f=stats')}>통계</button><button onClick={to('/my?f=shop')}>꾸미기</button><button onClick={to('/my?f=set')}>설정·알림</button></div></div>
      </>
    );
  } else {
    const ts = tasks(rewards, today), fin = ts.filter((t) => t.n >= t.goal).length;
    const left = ts.reduce((a, t) => a + Math.max(0, t.goal - t.n), 0), bt = backTotal(rewards, today), gb = block(rewards, new Date());
    const it = (key: string, ic: string, t: string, d: string, go: () => void, nw?: boolean) => (
      <button key={key} className={`nitem ${nw ? 'new' : ''}`} onClick={go}>
        <span className="ni" aria-hidden="true">{ic}</span><span><b>{t}</b><small>{d}</small></span>
      </button>
    );
    const L = [
      todayDone(rewards, today)
        ? it('d', '✅', '오늘 할 일 완료!', '꾸미기와 게임이 열렸어요', to('/home'))
        : it('d', '📚', `오늘 할 일 ${fin}/${ts.length}`, `${left}문제 남았어요. 지금 이어서 해 볼까요?`, to('/study'), true),
      bt ? it('b', '⏰', `밀린 공부 ${bt}문제`, '오늘 할 일을 넘긴 정답으로 오래된 것부터 갚아요', to('/home'), true) : null,
      ...ts.filter((t) => t.n < t.goal).map((t) => it(t.k, '✏️', `${t.name} ${t.goal - t.n}문제 남음`, `${t.n}/${t.goal} 맞혔어요`, to(`/study/${t.k}`))),
      it('g', '🎮', gb ? '게임 잠김' : `게임 ${gamesLeft(rewards, today)}판 남음`, gb ? gb.msg : '스피드 게임이나 대결방에서 쓸 수 있어요', to('/game')),
      ...rewards.alarms.filter((a) => a.on).map((a) => it(`a${a.t}`, '🔔', `${a.t} ${a.label || '공부할 시간'}`, '정해 둔 시간에 알려 줘요 · 바꾸기', to('/my?f=set'))),
    ];
    body = <div className="nlist">{L}</div>;
  }

  return (
    <div className="sheet">
      <div className="sbg" onClick={close} />
      <aside className="spanel" role="dialog" aria-modal="true" aria-labelledby="sTitle">
        <div className="shd"><h2 id="sTitle">{k === 'menu' ? '전체보기' : '알림'}</h2><button className="hb" ref={xRef} onClick={close} aria-label="닫기"><X /></button></div>
        <div className="sbody">{body}</div>
      </aside>
    </div>
  );
}

/* ---------- 하단 메뉴 ---------- */
/** 게임 진행 중에는 하단 메뉴를 숨긴다 (프로토타입 hgNav) */
const navSubs = new Set<(on: boolean) => void>();
export const showNav = (on: boolean) => navSubs.forEach((f) => f(on));

const NAV = [
  { g: 'home', name: '홈', I: House },
  { g: 'study', name: '공부', I: BookOpen },
  { g: 'game', name: '게임', I: Swords },
  { g: 'rank', name: '랭킹', I: Trophy },
  { g: 'my', name: '마이', I: UserRound },
] as const;

export function BottomNav() {
  const path = usePathname();
  const router = useRouter();
  const { rewards, today } = useKid();
  const study = tasks(rewards, today).reduce((a, t) => a + Math.max(0, t.goal - t.n), 0) + backTotal(rewards, today);
  const cur = path.split('/')[1];
  const [on, setOn] = useState(true);
  useEffect(() => { navSubs.add(setOn); return () => void navSubs.delete(setOn); }, []);
  useEffect(() => setOn(true), [path]);
  if (!on) return null;

  return (
    <nav className="gnav" aria-label="메뉴">
      <div className="gbox">
        {NAV.map(({ g, name, I }) => {
          const n = g === 'study' ? study : g === 'rank' ? myRank(rewards, 'week', today) : 0;
          return (
            <button key={g} aria-current={cur === g ? 'page' : undefined} onClick={() => router.push(`/${g}`)}>
              <I aria-hidden /><span>{name}</span>
              {n > 0 && <em>{n > 999 ? '999+' : n}{g === 'rank' && <span className="sr">위</span>}</em>}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
