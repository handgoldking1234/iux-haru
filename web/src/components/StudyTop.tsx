'use client';
/* 공부 헤더 — 프로토타입 shell.html .top 마크업 그대로: 과목 드롭다운 · 검색 · 알림 · 전체보기 + 탭2(.sw2) */
import { Bell, Check, ChevronDown, Menu, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { allDone, tasks } from '@/lib/rewards/rewards';
import { MENU_ORDER, SUBJECTS, type SubjectKey } from '@/lib/subjects';
import { useKid } from './Kid';
import { openSearch } from './Search';
import { openSheet } from './Shell';

/** 드롭다운 글자 표시 (프로토타입 SUBJ 아이콘 글자) */
const MARK: Record<SubjectKey, string> = { math: '+', hanja: '字', eng: 'A', hist: '史', kor: '가', sci: '科', typ: '⌨' };

export interface Tab2<T extends string> {
  key: T;
  name: string;
  n?: number;
}

export default function StudyTop<T extends string>({ subject, tabs, tab, onTab, hidden }: {
  subject: SubjectKey;
  tabs: Tab2<T>[];
  tab: T;
  onTab: (k: T) => void;
  hidden?: boolean;
}) {
  const router = useRouter();
  const { rewards, today } = useKid();
  const [open, setOpen] = useState(false);
  const dd = useRef<HTMLDivElement>(null);
  const ts = tasks(rewards, today);
  const anyLeft = ts.some((t) => t.k !== subject && t.n < t.goal);

  useEffect(() => {
    if (!open) return;
    const f = (e: MouseEvent) => !dd.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('click', f);
    dd.current?.querySelector<HTMLButtonElement>('.ddm [aria-selected="true"]')?.focus();
    return () => document.removeEventListener('click', f);
  }, [open]);

  function onKey(e: React.KeyboardEvent) {
    const bs = [...(dd.current?.querySelectorAll<HTMLButtonElement>('.ddm button') ?? [])], i = bs.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === 'Escape') setOpen(false);
    else if (e.key === 'ArrowDown') { e.preventDefault(); bs[(i + 1) % bs.length]?.focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); bs[(i - 1 + bs.length) % bs.length]?.focus(); }
  }

  return (
    <div className="top" hidden={hidden}>
      <div className="tbox">
        <div className="hd">
          <h1>공부</h1>
          <div className="dd" ref={dd}>
            <button className="ddb" aria-haspopup="listbox" aria-expanded={open} onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
              <span>{SUBJECTS[subject].name}</span><i className="ddd" hidden={!anyLeft} /><ChevronDown className="ddc" size={22} strokeWidth={2.6} aria-hidden />
            </button>
            <div className="ddm" role="listbox" aria-label="과목 고르기" hidden={!open} onKeyDown={onKey}>
              {MENU_ORDER.map((k) => {
                const t = ts.find((x) => x.k === k), left = t ? Math.max(0, t.goal - t.n) : 0;
                return (
                  <button key={k} role="option" aria-selected={k === subject} style={{ '--sc': SUBJECTS[k].color } as React.CSSProperties}
                    onClick={() => { setOpen(false); router.push(`/study/${k}`); }}>
                    <b>{MARK[k]}</b><span>{SUBJECTS[k].name}</span>
                    {t ? (left ? <em>{left}문제 남음</em> : <i>완료</i>) : <small>오늘 할 일 없음</small>}
                    {k === subject && <Check className="ok" aria-hidden />}
                  </button>
                );
              })}
            </div>
          </div>
          <span className="ddsp" />
          <button className="hb" aria-label="학습 검색" onClick={() => openSearch()}><Search aria-hidden /></button>
          <button className="hb" aria-label="알림" onClick={() => openSheet('noti')}><Bell aria-hidden /><i className="hdot" hidden={allDone(rewards, today)} /></button>
          <button className="hb" aria-label="전체보기" onClick={() => openSheet('menu')}><Menu aria-hidden /></button>
        </div>
        <div className="sw2" role="tablist" aria-label="과목 메뉴">
          {tabs.map((t) => (
            <button key={t.key} role="tab" aria-selected={t.key === tab} onClick={() => onTab(t.key)}>
              {t.name}{t.n ? <em>{t.n}</em> : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
