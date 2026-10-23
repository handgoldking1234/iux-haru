'use client';
/* 랭킹 — 프로토타입 play.js renderRank 마크업 그대로 (친구 6명은 예시 닉네임) */
import { useState } from 'react';
import { Svg } from '@/components/Ic';
import { useKid } from '@/components/Kid';
import PlayFrame from '@/components/PlayFrame';
import { avatar } from '@/lib/play/avatar';
import { FRIENDS, friendVal, myRank, myVal, type RankMode } from '@/lib/play/data';
import { GRADES, gradeOf } from '@/lib/rewards/rewards';

const NOTE: Record<RankMode, string> = {
  typ: '타자 연습(정확도 90% 이상)과 산성비에서 낸 평균 속도 중 가장 빠른 기록이에요. 한글은 자모 하나가 1타예요.',
  week: '이번 주 모든 과목에서 맞힌 문제 수예요. 월요일에 새로 시작해요.',
  total: '지금까지 쌓은 XP(맞힌 문제 수)예요. 등급은 내려가지 않아요.',
  wins: '대결방에서 1등 한 횟수예요.',
};

export default function RankPage() {
  const { kid, rewards: st, today } = useKid();
  const [mode, setMode] = useState<RankMode>('week');
  const meV = myVal(st, mode, today);
  const rows = [
    ...FRIENDS.map((f) => ({ name: f.name, eq: f.eq, v: friendVal(f, mode, today), xp: friendVal(f, 'total', today), me: false })),
    { name: kid.name, eq: st.eq, v: meV, xp: st.xp, me: true },
  ].sort((a, b) => b.v - a.v || (a.me ? -1 : 1));
  const mi = rows.findIndex((r) => r.me);
  const unit = mode === 'wins' ? '승' : mode === 'week' ? '문제' : mode === 'typ' ? '타/분' : 'XP';
  const above = mi > 0 ? rows[mi - 1] : null;
  const pod = [rows[1], rows[0], rows[2]];

  return (
    <PlayFrame<RankMode> title="랭킹" cur={mode} onPill={setMode} rank
      pills={(['week', 'total', 'wins', 'typ'] as RankMode[]).map((k) => ({
        key: k, name: { week: '이번 주', total: '전체 등급', wins: '대결 승리', typ: '타자 속도' }[k], n: myRank(st, k, today),
      }))}>
      <section className="sec">
        <div className="podium">
          {pod.map((p, i) => (
            <div key={i} className={`pod p${[2, 1, 3][i]}`}>
              <Svg html={avatar(p.eq, i === 1 ? 64 : 52)} />
              <span>{p.me ? '나' : p.name}</span><small>{p.v}{unit}</small>
              <div className="blk">{[2, 1, 3][i]}</div>
            </div>
          ))}
        </div>
        <ul className="rlist">
          {rows.map((r, i) => (
            <li key={r.name + i} className={r.me ? 'mine' : ''}>
              <span className="n">{i + 1}</span>
              <Svg html={avatar(r.eq, 36)} />
              <span className="nm">{r.me ? `${kid.name} (나)` : r.name}<small>{GRADES[gradeOf(r.xp)].n} 등급</small></span>
              <span className="v">{r.v}{unit}</span>
            </li>
          ))}
        </ul>
        <div className="gap">{mi === 0 ? '지금 1등이에요!' : `${kid.name}은(는) 지금 ${mi + 1}등 · ${above!.name}까지 ${above!.v - meV + 1}${unit}`}</div>
        <p className="note">{NOTE[mode]} 친구 6명은 예시 닉네임이에요.</p>
      </section>
    </PlayFrame>
  );
}
