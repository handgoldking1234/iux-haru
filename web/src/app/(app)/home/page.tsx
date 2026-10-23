'use client';
/* 홈 (놀이터 대시보드) — 프로토타입 play.js renderHome 마크업 그대로 */
import { useRouter } from 'next/navigation';
import Ic, { Svg } from '@/components/Ic';
import { useKid } from '@/components/Kid';
import PlayFrame from '@/components/PlayFrame';
import { pop } from '@/components/Toast';
import { avatar, stampKind, stampSVG } from '@/lib/play/avatar';
import {
  allDone, backlog, GAME_CAP, gamesLeft, GRADES, gradeOf, MORE, rewardEvent, STUDY_CAP, tasks, todayDone,
} from '@/lib/rewards/rewards';
import { updateRewards } from '@/lib/store';
import { SUBJECTS, type SubjectKey } from '@/lib/subjects';

const WD = ['일', '월', '화', '수', '목', '금', '토'];

export default function HomePage() {
  const router = useRouter();
  const { kid, rewards: st, today } = useKid();
  const d = st.day!;
  const gk = gradeOf(st.xp), g = GRADES[gk], nx = GRADES[gk + 1];
  const ts = tasks(st, today), fin = ts.filter((t) => t.n >= t.goal).length, done = allDone(st, today);
  const bl = backlog(st, today);
  const now = new Date();
  const goSub = (k: SubjectKey) => router.push(`/study/${k}`);
  const scol = (k: string) => SUBJECTS[k as SubjectKey]?.color ?? '#555';

  function demoDone() {
    updateRewards(kid.name, (s, t) => {
      tasks(s, t).forEach((x) => {
        for (let i = x.n; i < x.goal; i++) rewardEvent(s, 'ok', x.k, t);
      });
    });
    pop('시연: 오늘 할 일을 모두 끝낸 것으로 바꿨어요');
  }

  return (
    <PlayFrame title="홈">
      <div className="cols2"><div>
        <section className="sec">
          <div className="mini" role="button" tabIndex={0} aria-label="마이페이지" onClick={() => router.push('/my')}>
            <div className="miniav"><Svg html={avatar(st.eq, 64)} /></div>
            <div className="minitx">
              <div className="nm">{kid.name}
                <button aria-label="마이로 가기" onClick={(e) => { e.stopPropagation(); router.push('/my?edit=1'); }}><Ic n="user-round" /></button>
                <span className="nmr">
                  <span className="grade"><Ic n={g.icon} />{g.n}</span>
                  <span className="cash"><Ic n="coins" />{st.cash}</span>
                </span>
              </div>
              <div className="tr thin"><i style={{ width: `${nx ? Math.round(((st.xp - g.x) / (nx.x - g.x)) * 100) : 100}%` }} /></div>
              <small className="sub">{nx ? `'${nx.n}' 등급까지 ${nx.x - st.xp}문제` : '최고 등급이에요!'}</small>
            </div>
          </div>
        </section>

        <section className="sec">
          <h3 className="sh"><Ic n="list-checks" />오늘 할 일 <small>{now.getMonth() + 1}월 {now.getDate()}일 ({WD[now.getDay()]})</small></h3>
          <div className={`donebar ${done ? 'ok' : ''}`}>
            <b>{fin} / {ts.length}</b>
            <div className="tr"><i style={{ width: `${ts.length ? (fin / ts.length) * 100 : 100}%` }} /></div>
            {todayDone(st, today) && <span className="todaystamp"><Svg html={stampSVG(stampKind({ ok: d.ok, no: d.no, done: true }), 64)} /></span>}
          </div>
          <ul className="tasks">
            {ts.map((t) => {
              const ok = t.n >= t.goal, unit = t.k === 'typ' ? '개' : '문제';
              return (
                <li key={t.k} className={ok ? 'ok' : ''} style={{ '--c': scol(t.k) } as React.CSSProperties}>
                  <span className="tk">{ok ? <Ic n="check" /> : <i>{t.name[0]}</i>}</span>
                  <span className="tt">
                    <b>{t.name} {t.goal}{t.k === 'typ' ? '개 치기' : '문제 맞히기'}</b>
                    <span className="tr"><i style={{ width: `${(t.n / t.goal) * 100}%` }} /></span>
                    <small className="tl">{ok ? '다 했어요' : t.n ? `${t.goal - t.n}${unit} 남음` : '아직 시작 전'}</small>
                  </span>
                  {ok ? (
                    <span className="tn"><Ic n="check" />완료</span>
                  ) : (
                    <button className="btn line go" onClick={() => goSub(t.k)}><b>{t.n}</b><small>/{t.goal}</small><Ic n="chevron-right" /></button>
                  )}
                </li>
              );
            })}
          </ul>
          <p className={`gblock ${done ? 'open' : ''}`}>
            <Ic n={done ? 'gift' : 'lock'} />
            {done ? '오늘 할 일 끝! 꾸미기와 게임(스피드·대결)이 열렸어요' : '오늘 할 일을 모두 끝내면 꾸미기와 게임(스피드·대결)이 열려요'}
          </p>
          {done ? (
            <div className="row" style={{ marginTop: 10 }}>
              <button className="btn y" onClick={() => router.push('/my?f=shop')}><Ic n="shirt" />꾸미기</button>
              <button className="btn k" onClick={() => router.push('/game')}><Ic n="swords" />게임·대결</button>
            </div>
          ) : (
            <button className="btn line full" style={{ marginTop: 10 }} onClick={demoDone}>시연: 오늘 할 일 모두 끝낸 것으로 하기</button>
          )}
        </section>

        <section className="sec">
          <h3 className="sh"><Ic n="history" />밀린 공부 <small>지난 7일</small></h3>
          {bl.length ? (
            <>
              <ul className="tasks">
                {bl.map((b) => {
                  const dt = new Date(b.d * 864e5);
                  return (
                    <li key={`${b.d}${b.k}`} style={{ '--c': scol(b.k) } as React.CSSProperties}>
                      <span className="tk"><i>{SUBJECTS[b.k].name[0]}</i></span>
                      <span className="tt">
                        <b>{dt.getUTCMonth() + 1}/{dt.getUTCDate()} ({WD[dt.getUTCDay()]}) {SUBJECTS[b.k].name} {b.rem}문제 남음</b>
                        <span className="tr"><i style={{ width: `${((b.goal - b.rem) / b.goal) * 100}%` }} /></span>
                      </span>
                      <button className="btn line go" onClick={() => goSub(b.k)}>하기<Ic n="chevron-right" /></button>
                    </li>
                  );
                })}
              </ul>
              <p className="note">오늘 할 일을 채운 뒤 더 맞힌 문제로 오래된 것부터 갚아요. 하루치를 다 갚으면 +5캐시.{st.backGate ? ' 밀린 공부까지 끝내야 꾸미기·게임이 열려요.' : ''}</p>
            </>
          ) : (
            <p className="note" style={{ margin: 0 }}>밀린 공부가 없어요. 잘하고 있어요! 👍</p>
          )}
        </section>
      </div><div>
        <section className="sec">
          <h3 className="sh"><Ic n="flame" />오늘 기록</h3>
          <div className="stat3">
            <div><small>맞힘</small><b>{d.ok}</b></div>
            <div><small>틀림</small><b style={{ color: 'var(--no)' }}>{d.no}</b></div>
            <div><small>점수 (맞힘−틀림)</small><b>{d.ok - d.no}</b></div>
          </div>
          <p className="note">오늘 받은 캐시 {d.cash + d.game} · 게임 남은 판 {done ? gamesLeft(st, today) : '잠김'}</p>
          {Object.keys(d.by).length > 0 && (
            <div className="subj">
              {Object.entries(d.by).map(([k, v]) => <span key={k} style={{ '--c': scol(k) } as React.CSSProperties}>{SUBJECTS[k as SubjectKey]?.name ?? k} {v}</span>)}
            </div>
          )}
          {done && !d.more && <p className="note">할 일을 끝낸 뒤 {MORE}문제 더 맞히면 게임 +1판 ({Math.max(0, d.ok - (d.doneAt ?? d.ok))}/{MORE})</p>}
        </section>
        <section className="sec">
          <h3 className="sh"><Ic n="coins" />캐시 모으는 법</h3>
          <ul className="earn">
            <li><span>정답 1개 (모든 과목)</span><b>+1</b></li>
            <li><span>오답 1개</span><b style={{ color: 'var(--no)' }}>−1</b></li>
            <li><span>5문제 연속 정답</span><b>+3</b></li>
            <li><span>오답 졸업 (3번 연속 맞힘)</span><b>+5</b></li>
            <li><span>오늘 할 일 완료</span><b>+20</b></li>
            <li><span>단원·단계 통과</span><b>+20</b></li>
            <li><span>스피드 게임·대결 (맞힘−틀림 점수만큼)</span><b>하루 {GAME_CAP}까지</b></li>
          </ul>
          <p className="note">기본 캐시는 맞힌 문제 − 틀린 문제예요. 공부 캐시는 하루 {STUDY_CAP}까지, 0 밑으로는 안 내려가요. 등급(XP)은 맞힌 문제로만 올라가요. 캐시는 꾸미기에만 쓰고, 돈으로 살 수 없어요.</p>
        </section>
      </div></div>
    </PlayFrame>
  );
}
