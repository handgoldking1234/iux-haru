'use client';
/* 한눈에 보는 연표 — 프로토타입 hist.js renderTimeline 그대로.
   표준 연표 + 수준(상식 → 교과서 → 시험, 누적), 전체(우리나라|세계 두 칸) · 국사만 · 세계사만 */
import { useState } from 'react';

const LVN = ['상식', '교과서', '시험'];
const PERIODS: Record<string, [number, number, string, string][]> = {
  ko: [[-1e9, -2333, '선사 시대', '구석기 · 신석기 · 청동기'], [-2333, 918, '고대', '고조선 · 여러 나라 · 삼국 · 남북국'], [918, 1392, '중세', '고려'], [1392, 1876, '근세', '조선'], [1876, 1945, '근대', '개항 · 대한 제국 · 일제 강점기'], [1945, 1e9, '현대', '광복 이후']],
  wo: [[-1e9, -3500, '선사 시대', '인류 등장 · 신석기 혁명'], [-3500, 476, '고대', '4대 문명 · 그리스·로마 · 진·한'], [476, 1453, '중세', '중세 유럽 · 이슬람 · 수·당·송·원'], [1453, 1789, '근세', '신항로 개척 · 종교 개혁 · 절대 왕정 · 명·청'], [1789, 1945, '근대', '시민 혁명 · 산업 혁명 · 제국주의 · 세계 대전'], [1945, 1e9, '현대', '냉전 · 세계화']],
  all: [[-1e9, -3000, '아주 먼 옛날', '인류 등장 ~ 문명 이전'], [-3000, 1, '기원전', '고조선 · 4대 문명 · 그리스·로마 · 진·한'], [1, 1000, '1~10세기', '삼국·남북국 · 로마 멸망 · 이슬람 · 수·당'], [1000, 1500, '11~15세기', '고려·조선 건국 · 십자군 · 몽골 제국 · 명'], [1500, 1800, '16~18세기', '조선 · 신항로 개척 · 종교 개혁 · 시민 혁명'], [1800, 1900, '19세기', '개항 · 산업 혁명 · 제국주의'], [1900, 1945, '20세기 전반', '일제 강점기 · 두 차례 세계 대전'], [1945, 1e9, '1945년 이후', '광복 · 냉전 · 세계화']],
};

type Row = { y: number; tr: string; t: string; lv: number; yl: string; d: string; i: number };

export default function Timeline({ data, initial }: { data: unknown; initial: string }) {
  const [f, setF] = useState({ tr: initial, lv: 1 });
  const [open, setOpen] = useState<number | null>(null);
  const TL = ((data as { TL?: [number, string, string, number, string, string][] }).TL ?? []);
  const rows: Row[] = TL.map((r, i) => ({ y: r[0], tr: r[1], t: r[2], lv: r[3], yl: r[4], d: r[5], i })).filter((r) => r.lv <= f.lv && (f.tr === 'all' || r.tr === f.tr));
  const two = f.tr === 'all';
  const ev = (r: Row) => (
    <button className={`ev ${open === r.i ? 'open' : ''}`} onClick={() => setOpen(open === r.i ? null : r.i)}>
      <b>{r.t}</b><i className={`lvb l${r.lv}`}>{LVN[r.lv]}</i>{open === r.i && r.d && <small>{r.d}</small>}
    </button>
  );
  return (
    <>
      <div className="trk tl3" role="tablist" aria-label="연표 범위">
        {([['all', '전체'], ['ko', '국사'], ['wo', '세계사']] as const).map(([k, v]) => <button key={k} role="tab" aria-selected={f.tr === k} onClick={() => setF({ ...f, tr: k })}>{v}</button>)}
      </div>
      <div className="tlctl"><span>수준</span>{LVN.map((n, k) => <button key={k} className={`chip ${f.lv === k ? 'on' : ''}`} onClick={() => setF({ ...f, lv: k })}>{n}{k ? ' 까지' : ''}</button>)}<em>{rows.length}개</em></div>
      <p className="note pad16">상식은 누구나 아는 사건, 교과서는 중학 교과서 수준, 시험은 고등·수능·한국사 시험에 나오는 사건까지예요. 사건을 누르면 설명이 보여요.</p>
      {two && <div className="tlr two tlhead"><span className="yr">연도</span><div className="c">우리나라</div><div className="c">세계</div></div>}
      <div className="tlx">
        {PERIODS[f.tr].map(([a, b, name, desc]) => {
          const rs = rows.filter((r) => r.y >= a && r.y < b);
          if (!rs.length) return null;
          return (
            <div key={name} className="tlp">
              <div className="tlh"><b>{name}</b><small>{desc}</small></div>
              {rs.map((r) => (
                <div key={r.i} className={`tlr ${two ? 'two' : 'one'}`}>
                  <span className="yr">{r.yl}</span>
                  {two ? (r.tr === 'ko' ? <><div className="c">{ev(r)}</div><div className="c" /></> : <><div className="c" /><div className="c">{ev(r)}</div></>) : <div className="c">{ev(r)}</div>}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}
