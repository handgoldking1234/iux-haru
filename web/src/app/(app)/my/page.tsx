'use client';
/* 마이 — 프로토타입 play.js renderMy · settingsH · renderShop 마크업 그대로 */
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import Ic, { Svg } from '@/components/Ic';
import { useHop } from '@/components/Buddy';
import { useKid } from '@/components/Kid';
import PlayFrame from '@/components/PlayFrame';
import { pop } from '@/components/Toast';
import { logout } from '@/lib/account';
import { AVI, CATS, avatar, stampKind, stampSVG } from '@/lib/play/avatar';
import { GSUBJ } from '@/lib/play/data';
import { bindTips, myStats, statsInner } from '@/lib/play/stats';
import { gateOpen, GRADES, gradeOf, tasks, TYP_LIMITS, type Equip, type RewardState } from '@/lib/rewards/rewards';
import { updateRewards, useAuth } from '@/lib/store';
import { SUBJECT_KEYS, SUBJECTS } from '@/lib/subjects';

type Sub = 'info' | 'stats' | 'shop' | 'set';
type Item = { id: string; name: string; p: number; g?: number };
type Cat = keyof Equip;
const ITEMS = AVI as Record<Cat, Item[]>;
const CATL = CATS as [Cat, string][];

/** 섹션 제목으로 알약 묶음을 정한다 (프로토타입 GROUP.my) */
const GROUP: [string, Sub | 'acct'][] = [['통계', 'stats'], ['계정', 'acct'], ['소리', 'set'], ['보호자', 'set'], ['알림', 'set'], ['쓰기', 'set'], ['설정', 'set']];
function groupOf(title: string): Sub | 'acct' {
  return GROUP.find(([w]) => title.includes(w))?.[1] ?? 'info';
}

function Confirm({ title, msg, ok, danger, onOk, onClose }: { title: string; msg: string; ok: string; danger?: boolean; onOk: () => void; onClose: () => void }) {
  const c = useRef<HTMLButtonElement>(null);
  useEffect(() => { setTimeout(() => c.current?.focus(), 20); }, []);
  return (
    <div className="cfm" role="alertdialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cbox"><b>{title}</b><p>{msg}</p>
        <div className="row"><button className="btn line" ref={c} onClick={onClose}>취소</button><button className={`btn ${danger ? 'danger' : 'k'}`} onClick={() => { onClose(); onOk(); }}>{ok}</button></div>
      </div>
    </div>
  );
}

function Settings({ st, save, email }: { st: RewardState; save: (f: (s: RewardState) => void) => void; email: string }) {
  const router = useRouter();
  const [editPlan, setEditPlan] = useState(false);
  const [cfm, setCfm] = useState<null | 'out' | 'del'>(null);
  const { today, kid } = useKid();
  const kidsN = useAuth()?.kids.length ?? 1;
  const ts = tasks(st, today);
  const notiState = typeof Notification === 'undefined' ? 'none' : Notification.permission;

  return (
    <>
      <section className="sec">
        <h3 className="sh"><Ic n="shield-check" />보호자: 오늘 할 일 정하기 {!editPlan && <small><button className="btn line" style={{ minHeight: 34, padding: '4px 12px' }} onClick={() => setEditPlan(true)}>바꾸기</button></small>}</h3>
        {editPlan ? (
          <>
            {SUBJECT_KEYS.map((k) => (
              <div key={k} className="setrow"><span>{SUBJECTS[k].name}</span>
                <div className="seg" role="group">
                  {([[0, '끄기'], [5, '5'], [10, '10'], [20, '20']] as [number, string][]).map(([v, l]) => (
                    <button key={v} className={(st.plan[k] || 0) === v ? 'on' : ''} onClick={() => save((s) => {
                      s.plan[k] = v;
                      if (!Object.values(s.plan).some((x) => x > 0)) s.plan.math = 10;
                      if (s.day) s.day.plan = { ...s.plan };
                    })}>{l}</button>
                  ))}
                </div>
              </div>
            ))}
            <button className="btn y full" style={{ marginTop: 8 }} onClick={() => { setEditPlan(false); pop('오늘 할 일을 정했어요'); }}>저장</button>
          </>
        ) : (
          <p className="note" style={{ margin: 0 }}>{ts.map((t) => `${t.name} ${t.goal}`).join(' · ') || '할 일이 없어요'} — 매일 같은 할 일이 새로 시작돼요. 맞힌 문제만 세요.</p>
        )}
        <div className="setrow"><span>영단어 펜으로 쓰기 (철자 문제·따라 쓰기)</span><button className="sw" role="switch" aria-checked={st.engWrite !== false} aria-label="영단어 펜으로 쓰기" onClick={() => save((s) => { s.engWrite = s.engWrite === false; })} /></div>
        <div className="setrow"><span>한자 쓰기 문제 넣기 (펜·손가락)</span><button className="sw" role="switch" aria-checked={st.hanjaWrite !== false} aria-label="한자 쓰기 문제 넣기" onClick={() => save((s) => { s.hanjaWrite = s.hanjaWrite === false; })} /></div>
        <div className="setrow"><span>밀린 공부도 끝내야 꾸미기·게임 열기</span><button className="sw" role="switch" aria-checked={!!st.backGate} aria-label="밀린 공부도 끝내야 열기" onClick={() => save((s) => { s.backGate = !s.backGate; })} /></div>
        <div className="setrow"><span>타자 하루 최대 시간<small className="sub" style={{ display: 'block' }}>다 쓰면 그날은 타자 연습이 닫혀요</small></span>
          <div className="seg" role="group">
            {TYP_LIMITS.map((v) => <button key={v} className={(st.typLimit ?? 30) === v ? 'on' : ''} onClick={() => save((s) => { s.typLimit = v; })}>{v ? `${v}분` : '무제한'}</button>)}
          </div>
        </div>
        <p className="note">출시 버전에서는 보호자 비밀번호를 넣어야 바꿀 수 있어요.</p>
      </section>
      <section className="sec">
        <h3 className="sh"><Ic n="bell" />알림 시간</h3>
        {st.alarms.map((a, i) => (
          <div key={i} className="alrow">
            <input type="time" defaultValue={a.t} aria-label={`알림 시간 ${i + 1}`} onChange={(e) => save((s) => { s.alarms[i].t = e.target.value || '16:00'; })} />
            <input type="text" defaultValue={a.label} maxLength={12} aria-label="알림 이름" onBlur={(e) => save((s) => { s.alarms[i].label = e.target.value.trim().slice(0, 12) || '공부할 시간'; })} />
            <button className="sw" role="switch" aria-checked={!!a.on} aria-label="알림 켜기" onClick={() => save((s) => { s.alarms[i].on = !s.alarms[i].on; })} />
            <button className="bb" aria-label="알림 지우기" onClick={() => save((s) => { s.alarms.splice(i, 1); })}><Ic n="trash-2" /></button>
          </div>
        ))}
        <div className="row" style={{ marginTop: 8 }}>
          {st.alarms.length < 5 && <button className="btn line" onClick={() => save((s) => { s.alarms.push({ t: '18:00', on: true, label: '공부할 시간' }); })}><Ic n="plus" />알림 추가</button>}
          <button className="btn line" onClick={() => pop(`${st.alarms[0]?.label ?? '공부할 시간'} — 알림 미리 보기`)}><Ic n="bell-ring" />미리 보기</button>
        </div>
        <div className="setrow" style={{ marginTop: 6 }}><span>휴대폰·PC 알림</span>
          <button className={`btn ${notiState === 'granted' ? 'line' : 'y'}`} style={{ minHeight: 38, padding: '4px 12px' }} disabled={notiState === 'granted' || notiState === 'none'}
            onClick={() => { try { Notification.requestPermission().then(() => router.refresh()); } catch { pop('이 화면에서는 알림을 켤 수 없어요'); } }}>
            {({ granted: '허용됨', denied: '차단됨 (브라우저 설정에서 풀기)', none: '이 화면에선 안 돼요' } as Record<string, string>)[notiState] || '알림 허용하기'}
          </button>
        </div>
        <p className="note">앱이 열려 있으면 정해진 시간에 화면에 알림이 떠요. 앱을 닫아 둬도 오는 알림(푸시)은 앱 출시 때 붙여요.</p>
      </section>
      <section className="sec">
        <h3 className="sh"><Ic n="bell" />소리 설정</h3>
        <div className="setrow"><span>맞힘·틀림 효과음<small className="sub" style={{ display: 'block' }}>문제를 맞히거나 틀리면 짧은 소리가 나요</small></span>
          <button className="sw" role="switch" aria-checked={st.sfx !== false} aria-label="효과음" onClick={() => save((s) => { s.sfx = s.sfx === false; })} />
        </div>
      </section>
      <section className="sec">
        <h3 className="sh"><Ic n="user-round" />계정</h3>
        <div className="setrow"><span>보호자 계정<small className="sub" style={{ display: 'block' }}>{email}</small></span></div>
        <div className="setrow"><span>지금 공부하는 학생<small className="sub" style={{ display: 'block' }}>{kid.name}{kidsN > 1 ? ` · 학생 ${kidsN}명` : ''}</small></span>
          <button className="btn line" style={{ minHeight: 34, padding: '4px 12px' }} onClick={() => router.push('/kids')}><Ic n="users" />학생 바꾸기</button>
        </div>
        <button className="btn line full" style={{ marginTop: 6 }} onClick={() => setCfm('out')}><Ic n="log-out" />로그아웃</button>
        <button className="linkbtn" onClick={() => setCfm('del')}><Ic n="user-x" />계정 삭제(탈퇴)</button>
      </section>
      {cfm === 'out' && <Confirm title="로그아웃할까요?" msg="이 기기에서 보호자 계정이 로그아웃돼요. 공부 기록은 계정에 남아 있어요." ok="로그아웃" onClose={() => setCfm(null)} onOk={async () => { await logout(); router.replace('/login'); }} />}
      {cfm === 'del' && <Confirm title="계정을 삭제할까요?" msg="공부 기록, 꾸미기 아이템, 결제 정보가 모두 지워지고 되돌릴 수 없어요." ok="삭제하기" danger onClose={() => setCfm(null)} onOk={() => pop('계정 삭제는 아직 준비 중이에요')} />}
    </>
  );
}

function Shop({ st, save }: { st: RewardState; save: (f: (s: RewardState) => void) => void }) {
  const { today } = useKid();
  const [cat, setCat] = useState<Cat>('body');
  const [selId, setSelId] = useState<string | null>(null);
  // 보관함: 산 아이템만 모아 한 번에 입어 보기 (사용자 요청)
  const [box, setBox] = useState(false);
  const { hop, cls: hopCls } = useHop();
  const bought = st.owned.map((k) => { const [c, id] = k.split(':') as [Cat, string]; const it = ITEMS[c]?.find((x) => x.id === id); return it ? { c, it } : null; }).filter(Boolean) as { c: Cat; it: Item }[];
  const gk = gradeOf(st.xp), items = ITEMS[cat], sel = selId ? items.find((i) => i.id === selId) ?? null : null;
  const own = (it: Item) => it.p === 0 || st.owned.includes(cat + ':' + it.id);
  const preview = { ...st.eq, ...(sel ? { [cat]: sel.id } : {}) };
  const locked = !gateOpen(st, today);
  const g = GRADES[gk];

  let act = <button className="btn full" disabled>아이템을 골라 미리 입혀 보세요</button>;
  if (sel && locked) act = <button className="btn full" disabled><Ic n="lock" />오늘 할 일을 끝내면 사고 입을 수 있어요</button>;
  else if (sel) {
    if (st.eq[cat] === sel.id) act = <button className="btn full" disabled><Ic n="check" />착용 중</button>;
    else if (own(sel)) act = <button className="btn y full" onClick={() => { save((s) => { s.eq[cat] = sel.id; }); pop(`${sel.name} 착용!`); hop(); }}><Ic n="shirt" />착용하기</button>;
    else if (sel.g && gk < sel.g) act = <button className="btn full" disabled><Ic n="lock" />&apos;{GRADES[sel.g].n}&apos; 등급부터 살 수 있어요</button>;
    else if (st.cash < sel.p) act = <button className="btn full" disabled>캐시가 {sel.p - st.cash} 부족해요</button>;
    else act = <button className="btn y full" onClick={() => { save((s) => { s.cash -= sel.p; s.owned.push(cat + ':' + sel.id); s.eq[cat] = sel.id; }); pop(`${sel.name}을(를) 샀어요!`); hop(); }}><Ic n="coins" />{sel.p}캐시로 사고 착용하기</button>;
  }

  return (
    <>
      <section className="sec center"><div className="me"><div className={`avbig ${hopCls}`} onClick={hop}><Svg html={avatar(box ? st.eq : preview, 150)} /></div>
        <div className="row" style={{ justifyContent: 'center' }}><span className="grade"><Ic n={g.icon} />{g.n}</span><span className="cash"><Ic n="coins" />{st.cash}</span></div></div></section>
      <section className="sec">
        {locked && <p className="gblock" style={{ margin: '0 0 12px' }}><Ic n="lock" />미리 입혀 보기만 돼요. 오늘 할 일을 모두 끝내면 사고 입을 수 있어요</p>}
        <div className="chips" role="tablist">
          <button className={`chip ${box ? 'on' : ''}`} role="tab" aria-selected={box} onClick={() => { setBox(true); setSelId(null); }}><Ic n="shirt" />보관함 {bought.length}</button>
          {CATL.map(([k, l]) => <button key={k} className={`chip ${!box && k === cat ? 'on' : ''}`} role="tab" aria-selected={!box && k === cat} onClick={() => { setBox(false); setCat(k); setSelId(null); }}>{l}</button>)}
        </div>
        {box ? (
          <>
            {bought.length ? (
              <div className="itemgrid">
                {bought.map(({ c, it }) => (
                  <button key={c + it.id} className={`item ${st.eq[c] === it.id ? 'on' : ''}`} aria-label={`${it.name} 입기`} disabled={locked}
                    onClick={() => { if (st.eq[c] === it.id) return; save((s) => { s.eq[c] = it.id; }); pop(`${it.name} 착용!`); hop(); }}>
                    <Svg html={avatar({ ...st.eq, [c]: it.id }, 64)} /><b>{it.name}</b>
                    <small>{st.eq[c] === it.id ? <><Ic n="check" />입는 중</> : CATL.find(([k]) => k === c)?.[1]}</small>
                  </button>
                ))}
              </div>
            ) : <p className="note" style={{ margin: '12px 0' }}>아직 산 아이템이 없어요. 아이템을 사면 여기에 모여서 언제든 다시 입을 수 있어요.</p>}
            <p className="note">누르면 바로 입어요. 산 아이템은 없어지지 않아요.</p>
          </>
        ) : (<>
        <div className="itemgrid">
          {items.map((it) => {
            const mine = own(it), lock = !!it.g && gk < it.g;
            return (
              <button key={it.id} className={`item ${sel?.id === it.id ? 'sel' : ''} ${st.eq[cat] === it.id ? 'on' : ''} ${lock && !mine ? 'lock' : ''}`} aria-label={it.name} onClick={() => setSelId(it.id)}>
                <Svg html={avatar({ ...st.eq, [cat]: it.id }, 64)} /><b>{it.name}</b>
                <small>{mine ? '가지고 있음' : lock ? <><Ic n="lock" />{GRADES[it.g!].n} 등급</> : <><Ic n="coins" />{it.p}</>}</small>
              </button>
            );
          })}
        </div>
        <div className="shopact">{act}</div>
        <p className="note">왕관·망토·별 안경·황금 몸·밤하늘은 등급을 올려야 살 수 있어요. 뽑기나 현금 결제는 없어요.</p>
        </>)}
      </section>
    </>
  );
}

function My() {
  const sp = useSearchParams();
  const auth = useAuth();
  const { kid, rewards: st, today } = useKid();
  const [sub, setSub] = useState<Sub>((sp.get('f') as Sub) || 'info');
  const statsRef = useRef<HTMLElement>(null);
  const meHop = useHop();
  const save = (f: (s: RewardState) => void) => updateRewards(kid.name, f);
  const gk = gradeOf(st.xp), g = GRADES[gk], nx = GRADES[gk + 1], m = myStats(st, today), t = today;

  useEffect(() => bindTips(statsRef.current));

  const show = (title: string) => {
    const gr = groupOf(title);
    return gr === sub || (gr === 'acct' && (sub === 'info' || sub === 'set'));
  };

  const cal: React.ReactNode[] = [];
  const start = t - 27 - ((t + 3) % 7);
  for (let k = start; k <= t; k++) {
    const r = m.rec(k), sk = stampKind(r), dd = new Date(k * 864e5);
    cal.push(
      <i key={k} className={`${k === t ? 'today ' : ''}${sk ? 'done' : r && r.ok > 0 ? 'part' : ''}`} title={`${dd.getUTCMonth() + 1}/${dd.getUTCDate()}${sk ? (sk === 'best' ? ' 최고예요' : ' 참 잘했어요') : ''}`}>
        <span className="dn">{dd.getUTCDate()}</span>{sk && <Svg html={stampSVG(sk, 40)} />}
      </i>,
    );
  }
  const owned = (c: Cat) => ITEMS[c].filter((it) => it.p === 0 || st.owned.includes(c + ':' + it.id)).length;
  const allN = CATL.reduce((a, [c]) => a + ITEMS[c].length, 0), ownN = CATL.reduce((a, [c]) => a + owned(c), 0);
  const best = st.best ?? {};
  const bestRows: [string, number][] = Object.entries(GSUBJ).filter(([k]) => k !== 'gugu').map(([k, v]) => [v[0], best[k] ?? 0] as [string, number]).concat([['구구단 전체', best.gugu0 ?? 0]]);
  const wr = st.battles ? Math.round(((st.wins ?? 0) / st.battles) * 100) : 0;

  return (
    <PlayFrame<Sub> title="마이" cur={sub} onPill={setSub}
      pills={[{ key: 'info', name: '내 정보' }, { key: 'stats', name: '통계' }, { key: 'shop', name: '꾸미기' }, { key: 'set', name: '설정' }]}>
      {sub === 'shop' ? <Shop st={st} save={save} /> : (
        <div className="cols2"><div>
          <section className="sec" hidden={!show('')}>
            <div className="me">
              <div className={`avbig ${meHop.cls}`} onClick={meHop.hop}><Svg html={avatar(st.eq, 130)} /></div>
              <div className="nm">{kid.name}<button aria-label="닉네임 바꾸기" onClick={() => pop('닉네임은 보호자가 학생 정보에서 바꿔요')}><Ic n="pencil" /></button></div>
              <div className="row" style={{ justifyContent: 'center' }}><span className="grade"><Ic n={g.icon} />{g.n}</span><span className="cash"><Ic n="coins" />{st.cash}</span></div>
              <div className="gbar"><div className="tr"><i style={{ width: `${nx ? Math.round(((st.xp - g.x) / (nx.x - g.x)) * 100) : 100}%` }} /></div>
                <small>{nx ? `'${nx.n}' 등급까지 ${nx.x - st.xp} XP` : '최고 등급이에요!'} · 누적 XP {st.xp.toLocaleString()}</small></div>
            </div>
          </section>
          <section className="sec" hidden={!show('등급 길')}>
            <h3 className="sh"><Ic n="trophy" />등급 길</h3>
            <ol className="road">
              {GRADES.map((gr, i) => {
                const its = CATL.flatMap(([c]) => ITEMS[c].filter((it) => it.g === i).map((it) => it.name));
                return (
                  <li key={gr.n} className={i < gk ? 'past' : i === gk ? 'now' : ''}>
                    <span className="gi"><Ic n={gr.icon} /></span>
                    <div><b>{gr.n}</b><small>{gr.x.toLocaleString()} XP{its.length ? ` · ${its.slice(0, 4).join(', ')}${its.length > 4 ? ` 외 ${its.length - 4}개` : ''} 열림` : ''}</small></div>
                    {i === gk && <span className="nowtag">지금</span>}
                  </li>
                );
              })}
            </ol>
          </section>
          <section className="sec" hidden={!show('보유 아이템')}>
            <h3 className="sh"><Ic n="shirt" />보유 아이템 <small>{ownN} / {allN}</small></h3>
            <div className="own">{CATL.map(([c, l]) => <div key={c}><small>{l}</small><b>{owned(c)}<i>/{ITEMS[c].length}</i></b></div>)}</div>
            <button className="btn line full" style={{ marginTop: 10 }} onClick={() => setSub('shop')}><Ic n="shirt" />꾸미기 열기</button>
          </section>
        </div><div>
          <section className="sec" hidden={!show('학습 기록')}>
            <h3 className="sh"><Ic n="flame" />학습 기록</h3>
            <div className="stat3"><div><small>맞힌 문제</small><b>{(st.total || 0).toLocaleString()}</b></div><div><small>공부한 날</small><b>{m.days}일</b></div><div><small>연속 완료</small><b>{m.streak}일</b></div></div>
            <div className="stampn"><Svg html={stampSVG('good', 34)} /><span>모은 도장 <b>{m.stamps.good}</b>개</span><Svg html={stampSVG('best', 34)} /><span>최고예요 <b>{m.stamps.best}</b>개</span></div>
            <div className="cal" aria-label="최근 4주 학습 달력">
              <div className="calh">{'월화수목금토일'.split('').map((x) => <span key={x}>{x}</span>)}</div>
              <div className="calg">{cal}</div>
              <p className="note stl"><Svg html={stampSVG('good', 22)} /> 참 잘했어요(할 일 완료) <Svg html={stampSVG('best', 22)} /> 최고예요(정답률 90% 이상) <i className="lg part" />조금 공부</p>
            </div>
          </section>
          <section className="sec" ref={statsRef} hidden={!show('통계')}>
            <h3 className="sh"><Ic n="flame" />통계</h3>
            <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: statsInner(st, today) }} />
          </section>
          <section className="sec" hidden={!show('게임 기록')}>
            <h3 className="sh"><Ic n="swords" />게임 기록</h3>
            <div className="stat3"><div><small>대결</small><b>{st.battles || 0}판</b></div><div><small>우승</small><b>{st.wins || 0}번</b></div><div><small>우승률</small><b>{wr}%</b></div></div>
            <small className="sub" style={{ display: 'block', marginTop: 10 }}>스피드 게임 최고 점수</small>
            <div className="bestg">{bestRows.map(([n, v]) => <span key={n}>{n} <b>{v}</b></span>)}</div>
          </section>
          {(sub === 'set' || sub === 'info') && <SettingsFiltered sub={sub} st={st} save={save} email={auth?.email ?? ''} />}
        </div></div>
      )}
    </PlayFrame>
  );
}

/** 설정 묶음: '설정' 알약에서는 전부, '내 정보'에서는 계정만 (프로토타입 deco 필터와 같음) */
function SettingsFiltered({ sub, st, save, email }: { sub: Sub; st: RewardState; save: (f: (s: RewardState) => void) => void; email: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelectorAll<HTMLElement>('section.sec').forEach((sec) => {
      const gr = groupOf(sec.querySelector('.sh')?.textContent ?? '');
      sec.hidden = !(gr === sub || (gr === 'acct' && (sub === 'info' || sub === 'set')));
    });
  });
  return <div ref={ref} style={{ display: 'contents' }}><Settings st={st} save={save} email={email} /></div>;
}

export default function MyPage() {
  return <Suspense><My /></Suspense>;
}
