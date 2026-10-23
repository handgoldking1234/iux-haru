/* 마이 > 학습 기록 · 통계 — prototype/build/play.js myStats(423~429), dayRec·statsH(431~494) 그대로.
   그래프는 프로토타입처럼 SVG 문자열로 만든다. */
import { ensureDay, weekNumber, type RewardState } from '../rewards/rewards';
import { MENU_ORDER, SUBJECTS } from '../subjects';
import { stampKind } from './avatar';

type Rec = { ok: number; no: number; done: boolean } | null;

export function myStats(st: RewardState, t: number) {
  const d = ensureDay(st, t), H = st.hist || {};
  const rec = (k: number): Rec => k === t
    ? { ok: d.ok, no: d.no, done: !!d.bonus }
    : H[k] || (st.log[k] ? { ok: Object.values(st.log[k].by || {}).reduce((a, b) => a + (b ?? 0), 0), no: st.log[k].no || 0, done: !!st.log[k].done } : null);
  let days = 0;
  Object.values(H).forEach((r) => { if (r.ok > 0) days++; });
  if (d.ok > 0 && !H[t]) days++;
  let streak = 0;
  for (let k = t; ; k--) {
    const r = rec(k);
    if (r && r.done) { streak++; continue; }
    if (k === t) continue;
    break;
  }
  const wk = weekNumber(t), by: Record<string, number> = {};
  for (let k = t - 6; k <= t; k++) {
    if (weekNumber(k) !== wk) continue;
    const b = k === t ? d.by : (st.log[k] || { by: {} }).by || {};
    Object.entries(b).forEach(([s, v]) => (by[s] = (by[s] || 0) + (v ?? 0)));
  }
  const stamps = { good: 0, best: 0 };
  const ks = new Set([...Object.keys(H).map(Number), ...Object.keys(st.log).map(Number), t]);
  ks.forEach((k) => { const sk = stampKind(rec(k)); if (sk) { stamps.good++; if (sk === 'best') stamps.best++; } });
  return { rec, days, streak, by, stamps };
}

const C_OK = '#4A72B8', C_NO = '#DB2777';
const md = (k: number) => { const d = new Date(k * 864e5); return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`; };
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : null);

function dayRec(st: RewardState, t: number, k: number) {
  if (k === t) { const d = ensureDay(st, t); return { ok: d.ok, no: d.no, by: d.by || {}, byNo: d.byNo || {}, done: !!d.bonus }; }
  const L = st.log[k], H0 = (st.hist || {})[k];
  if (L) { const ok = Object.values(L.by || {}).reduce((a, b) => a + (b ?? 0), 0); return { ok: H0 ? H0.ok : ok, no: L.no || (H0 ? H0.no : 0) || 0, by: L.by || {}, byNo: L.byNo || {}, done: !!L.done }; }
  if (H0) return { ok: H0.ok || 0, no: H0.no || 0, by: {}, byNo: {}, done: !!H0.done };
  return { ok: 0, no: 0, by: {}, byNo: {}, done: false };
}

/** 통계 섹션 안쪽 HTML (.sh 제목 다음부터) */
export function statsInner(st: RewardState, t: number): string {
  const days = Array.from({ length: 14 }, (_, i) => t - 13 + i), R = days.map((k) => dayRec(st, t, k));
  const sum = <T,>(arr: T[], f: (x: T) => number) => arr.reduce((a, x) => a + f(x), 0);
  const thisW: typeof R = [], lastW: typeof R = [], wk = weekNumber(t);
  for (let k = t - 13; k <= t; k++) { const w = weekNumber(k); if (w === wk) thisW.push(dayRec(st, t, k)); else if (w === wk - 1) lastW.push(dayRec(st, t, k)); }
  const twOk = sum(thisW, (r) => r.ok), twNo = sum(thisW, (r) => r.no), lwOk = sum(lastW, (r) => r.ok), lwNo = sum(lastW, (r) => r.no);
  const twAcc = pct(twOk, twOk + twNo), lwAcc = pct(lwOk, lwOk + lwNo);
  const studied = R.filter((r) => r.ok > 0), avg = studied.length ? Math.round(sum(studied, (r) => r.ok) / studied.length) : 0, doneN = R.filter((r) => r.done).length;
  const delta = (a: number | null, b: number | null, u: string) => b == null || a == null ? '<small class="dl">지난주 기록 없음</small>' : a === b ? '<small class="dl">지난주와 같아요</small>' : `<small class="dl ${a > b ? 'up' : 'down'}">${a > b ? '▲' : '▼'} ${Math.abs(a - b)}${u} 지난주보다</small>`;
  const tiles = `<div class="kpis">
    <div><small>이번 주 맞힌 문제</small><b>${twOk}</b>${delta(twOk, lastW.length ? lwOk : null, '문제')}</div>
    <div><small>이번 주 정답률</small><b>${twAcc == null ? '–' : twAcc + '%'}</b>${delta(twAcc, lwAcc, '%p')}</div>
    <div><small>하루 평균 (공부한 날)</small><b>${avg}</b><small class="dl">최근 14일 중 ${studied.length}일 공부</small></div>
    <div><small>할 일 완료율</small><b>${Math.round((doneN / 14) * 100)}%</b><small class="dl">14일 중 ${doneN}일 도장</small></div></div>`;
  const W = 560, Hh = 170, pl = 30, pb = 22, pt = 8, iw = W - pl - 6, ih = Hh - pb - pt, mx = Math.max(10, ...R.map((r) => r.ok + r.no));
  const top = Math.ceil(mx / 10) * 10, bw = iw / 14;
  const y = (v: number) => pt + ih - (v / top) * ih;
  const grid = [0, top / 2, top].map((v) => `<line x1="${pl}" x2="${W - 6}" y1="${y(v)}" y2="${y(v)}" class="gl"/><text x="${pl - 6}" y="${y(v) + 4}" class="ax" text-anchor="end">${v}</text>`).join('');
  const bars = R.map((r, i) => {
    const x = pl + i * bw + bw * 0.18, w = bw * 0.64, hOk = (r.ok / top) * ih, hNo = (r.no / top) * ih, base = pt + ih;
    const okR = r.ok ? `<path d="M${x} ${base} v${-Math.max(0, hOk - 3)} q0 -3 3 -3 h${w - 6} q3 0 3 3 v${Math.max(0, hOk - 3)} z" fill="${C_OK}"/>` : '';
    const noR = r.no ? `<rect x="${x}" y="${base - hOk - hNo - (r.ok ? 2 : 0)}" width="${w}" height="${Math.max(1.5, hNo)}" rx="2" fill="${C_NO}"/>` : '';
    const lab = i % 2 === 1 || i === 13 ? `<text x="${x + w / 2}" y="${Hh - 6}" class="ax${i === 13 ? ' now' : ''}" text-anchor="middle">${i === 13 ? '오늘' : md(days[i])}</text>` : '';
    return `<g class="hv" data-tip="${md(days[i])}${i === 13 ? ' (오늘)' : ''} · 맞힘 ${r.ok} · 틀림 ${r.no}${r.ok + r.no ? ` · 정답률 ${pct(r.ok, r.ok + r.no)}%` : ''}${r.done ? ' · 도장' : ''}"><rect x="${pl + i * bw}" y="${pt}" width="${bw}" height="${ih}" fill="transparent"/>${okR}${noR}${lab}</g>`;
  }).join('');
  const chartB = `<figure class="chart"><figcaption>최근 14일 맞힌 문제와 틀린 문제</figcaption><div class="lgd"><span><i style="background:${C_OK}"></i>맞힘</span><span><i style="background:${C_NO}"></i>틀림</span></div>
    <svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="최근 14일 맞힘·틀림 막대그래프">${grid}${bars}</svg></figure>`;
  const acc = R.map((r) => pct(r.ok, r.ok + r.no)), H2 = 150, ih2 = H2 - pb - pt, y2 = (v: number) => pt + ih2 - ((v - 50) / 50) * ih2, cx = (i: number) => pl + i * bw + bw / 2;
  const pts = acc.map((v, i) => (v == null ? null : ([cx(i), y2(Math.max(50, v)), v, i] as const))).filter((x): x is readonly [number, number, number, number] => !!x);
  const seg: string[][] = []; let cur: string[] = [];
  acc.forEach((v, i) => { if (v == null) { if (cur.length) seg.push(cur); cur = []; } else cur.push(`${cx(i)},${y2(Math.max(50, v))}`); });
  if (cur.length) seg.push(cur);
  const chartC = `<figure class="chart"><figcaption>정답률 추이 <small>점선 = '최고예요' 도장 기준 90%</small></figcaption>
    <svg viewBox="0 0 ${W} ${H2}" role="img" aria-label="최근 14일 정답률 선그래프">${[50, 75, 100].map((v) => `<line x1="${pl}" x2="${W - 6}" y1="${y2(v)}" y2="${y2(v)}" class="gl"/><text x="${pl - 6}" y="${y2(v) + 4}" class="ax" text-anchor="end">${v}</text>`).join('')}
    <line x1="${pl}" x2="${W - 6}" y1="${y2(90)}" y2="${y2(90)}" class="ref"/>
    ${seg.map((s) => `<polyline points="${s.join(' ')}" fill="none" stroke="${C_OK}" stroke-width="2" stroke-linejoin="round"/>`).join('')}
    ${pts.map(([x, yy, v, i]) => `<g class="hv" data-tip="${md(days[i])} · 정답률 ${v}% (맞힘 ${R[i].ok} · 틀림 ${R[i].no})"><circle cx="${x}" cy="${yy}" r="12" fill="transparent"/><circle cx="${x}" cy="${yy}" r="4.5" fill="${C_OK}" stroke="#fff" stroke-width="2"/></g>`).join('')}
    ${pts.length ? `<text x="${pts[pts.length - 1][0]}" y="${pts[pts.length - 1][1] - 10}" class="vl" text-anchor="middle">${pts[pts.length - 1][2]}%</text>` : ''}
    ${R.map((r, i) => (i % 2 === 1 || i === 13 ? `<text x="${cx(i)}" y="${H2 - 6}" class="ax${i === 13 ? ' now' : ''}" text-anchor="middle">${i === 13 ? '오늘' : md(days[i])}</text>` : '')).join('')}</svg>
    ${pts.length ? '' : '<p class="note">아직 정답률 기록이 없어요.</p>'}</figure>`;
  const by: Record<string, number> = {}, bn: Record<string, number> = {};
  for (let k = t - 6; k <= t; k++) {
    const r = dayRec(st, t, k);
    Object.entries(r.by).forEach(([s, v]) => (by[s] = (by[s] || 0) + (v ?? 0)));
    Object.entries(r.byNo).forEach(([s, v]) => (bn[s] = (bn[s] || 0) + (v ?? 0)));
  }
  const rows = MENU_ORDER.map((k) => ({ k, ok: by[k] || 0, no: bn[k] || 0 })).map((x) => ({ ...x, acc: pct(x.ok, x.ok + x.no) }));
  const weak = rows.filter((x) => x.ok + x.no >= 10 && x.acc != null).sort((a, b) => a.acc! - b.acc!)[0];
  const chartD = `<figure class="chart"><figcaption>과목별 최근 7일</figcaption>
    <div class="subst">${rows.map((x) => `<div class="hv" data-tip="${SUBJECTS[x.k].name} · 맞힘 ${x.ok} · 틀림 ${x.no}${x.acc != null ? ` · 정답률 ${x.acc}%` : ''}"><span class="sn"><i style="background:${SUBJECTS[x.k].color}"></i>${SUBJECTS[x.k].name}</span>
      <span class="sb"><i style="width:${x.acc || 0}%;background:${SUBJECTS[x.k].color}"></i></span><b>${x.acc == null ? '–' : x.acc + '%'}</b><small>${x.ok}/${x.ok + x.no}</small></div>`).join('')}</div>
    <p class="note">${weak ? `가장 약한 과목은 <b>${SUBJECTS[weak.k].name}</b>(정답률 ${weak.acc}%)이에요. 오답노트부터 풀어 보세요.` : '과목마다 10문제 이상 풀면 약한 과목을 알려 줘요.'} 막대 = 정답률, 오른쪽 = 맞힘/푼 문제</p></figure>`;
  const dow = Array(7).fill(0), cnt = Array(7).fill(0);
  for (let k = t - 27; k <= t; k++) { const i = (k + 3) % 7; dow[i] += dayRec(st, t, k).ok; cnt[i]++; }
  const da = dow.map((v, i) => Math.round(v / (cnt[i] || 1))), dmx = Math.max(5, ...da), best = da.indexOf(Math.max(...da)), H3 = 130, ih3 = H3 - pb - pt - 12, bw3 = iw / 7;
  const chartE = `<figure class="chart"><figcaption>요일별 평균 맞힌 문제 <small>최근 4주</small></figcaption>
    <svg viewBox="0 0 ${W} ${H3}" role="img" aria-label="요일별 평균 막대그래프">${da.map((v, i) => {
      const h = (v / dmx) * ih3, x = pl + i * bw3 + bw3 * 0.25, w = bw3 * 0.5, base = pt + 12 + ih3;
      return `<g class="hv" data-tip="${'월화수목금토일'[i]}요일 평균 ${v}문제"><rect x="${pl + i * bw3}" y="${pt}" width="${bw3}" height="${ih3 + 12}" fill="transparent"/>${v ? `<path d="M${x} ${base} v${-Math.max(0, h - 3)} q0 -3 3 -3 h${w - 6} q3 0 3 3 v${Math.max(0, h - 3)} z" fill="${C_OK}" opacity="${i === best ? 1 : 0.55}"/>` : ''}<text x="${x + w / 2}" y="${base - h - 5}" class="vl" text-anchor="middle">${v}</text><text x="${x + w / 2}" y="${H3 - 6}" class="ax" text-anchor="middle">${'월화수목금토일'[i]}</text></g>`;
    }).join('')}</svg>
    ${Math.max(...da) ? `<p class="note">${'월화수목금토일'[best]}요일에 가장 많이 공부해요.</p>` : ''}</figure>`;
  return `${tiles}${chartB}${chartC}${chartD}${chartE}<div class="ctip" id="ctip" role="status"></div>`;
}

/** 그래프 말풍선 (프로토타입 bindTips) */
export function bindTips(sec: HTMLElement | null) {
  if (!sec) return;
  const tip = sec.querySelector<HTMLElement>('#ctip');
  if (!tip) return;
  sec.querySelectorAll<HTMLElement>('.hv').forEach((g) => {
    const show = (e: MouseEvent) => {
      const r = sec.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      tip.textContent = g.dataset.tip ?? '';
      tip.style.display = 'block';
      const tw = tip.offsetWidth;
      tip.style.left = Math.max(4, Math.min(r.width - tw - 4, x - tw / 2)) + 'px';
      tip.style.top = y - 46 + 'px';
      g.classList.add('on');
    };
    g.onmousemove = show;
    g.onclick = show;
    g.onmouseleave = () => { tip.style.display = 'none'; g.classList.remove('on'); };
  });
}
