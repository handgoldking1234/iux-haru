/* eslint-disable */
// @ts-nocheck
/**
 * 관리자 페이지 — prototype/admin/index.html을 그대로 옮김 (자동 생성: scripts/admin-app.mjs, 직접 고치지 않기)
 * env: { session, signIn, verify, signOut, resetMail, me, daily, summary, members, member, reveal, cash, setStatus, admins, audit }
 */
export const ADMIN_SKELETON = "<div class=\"login\" id=\"login\">\n  <div class=\"lbox\">\n    <div class=\"brand\"><span class=\"logo\">하</span><span><b>하루공부</b><small>관리자</small></span></div>\n    <form class=\"lf\" id=\"lf1\" novalidate>\n      <div><h2>관리자 로그인</h2><p>관리자로 등록된 계정만 들어올 수 있어요.</p></div>\n      <label>이메일<input id=\"lEmail\" type=\"email\" autocomplete=\"username\" placeholder=\"name@akiaka.com\"></label>\n      <label>비밀번호<input id=\"lPw\" type=\"password\" autocomplete=\"current-password\" placeholder=\"비밀번호\"></label>\n      <div class=\"err\" id=\"lErr1\" aria-live=\"polite\"></div>\n      <button class=\"btn dark\" type=\"submit\">로그인</button>\n      <div class=\"lfoot\"><span>시안: 아무 비밀번호나 4자 이상</span><button type=\"button\">비밀번호를 잊었어요</button></div>\n    </form>\n    <form class=\"lf\" id=\"lf2\" novalidate hidden>\n      <div><h2>2단계 인증</h2><p>인증 앱에 표시된 6자리 숫자를 넣어 주세요.</p></div>\n      <div class=\"otp\" id=\"otp\"><input inputmode=\"numeric\" maxlength=\"1\" aria-label=\"1번째 숫자\" id=\"o0\"><input inputmode=\"numeric\" maxlength=\"1\" aria-label=\"2번째 숫자\" id=\"o1\"><input inputmode=\"numeric\" maxlength=\"1\" aria-label=\"3번째 숫자\" id=\"o2\"><input inputmode=\"numeric\" maxlength=\"1\" aria-label=\"4번째 숫자\" id=\"o3\"><input inputmode=\"numeric\" maxlength=\"1\" aria-label=\"5번째 숫자\" id=\"o4\"><input inputmode=\"numeric\" maxlength=\"1\" aria-label=\"6번째 숫자\" id=\"o5\"></div>\n      <div class=\"err\" id=\"lErr2\" aria-live=\"polite\"></div>\n      <button class=\"btn dark\" type=\"submit\">인증하고 들어가기</button>\n      <div class=\"lfoot\"><span>시안: 아무 숫자 6자리</span><button type=\"button\" id=\"lBack\">다른 계정으로</button></div>\n    </form>\n  </div>\n</div>\n<div class=\"shell\" id=\"shellEl\" hidden>\n  <aside class=\"side\" id=\"side\" aria-label=\"관리자 메뉴\">\n    <div class=\"brand\"><span class=\"logo\">하</span><span><b>하루공부</b><small>관리자</small></span></div>\n    <nav class=\"nav\" id=\"nav\"></nav>\n    <div class=\"theme\"><span>화면 테마</span><div class=\"seg\" id=\"theme\" role=\"group\" aria-label=\"화면 테마\"><button data-t=\"light\"><svg class=\"ic\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"4\" /> <path d=\"M12 2v2\" /> <path d=\"M12 20v2\" /> <path d=\"m4.93 4.93 1.41 1.41\" /> <path d=\"m17.66 17.66 1.41 1.41\" /> <path d=\"M2 12h2\" /> <path d=\"M20 12h2\" /> <path d=\"m6.34 17.66-1.41 1.41\" /> <path d=\"m19.07 4.93-1.41 1.41\" /></svg>라이트</button><button data-t=\"dark\"><svg class=\"ic\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\" /></svg>다크</button><button data-t=\"system\"><svg class=\"ic\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect width=\"20\" height=\"14\" x=\"2\" y=\"3\" rx=\"2\" /> <line x1=\"8\" x2=\"16\" y1=\"21\" y2=\"21\" /> <line x1=\"12\" x2=\"12\" y1=\"17\" y2=\"21\" /></svg>자동</button></div></div>\n  </aside>\n  <main class=\"main\" id=\"main\">\n    <div class=\"mtop\"><button class=\"ib\" id=\"menuBtn\" aria-label=\"메뉴 열기\"><svg class=\"ic\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><line x1=\"4\" x2=\"20\" y1=\"12\" y2=\"12\" /> <line x1=\"4\" x2=\"20\" y1=\"6\" y2=\"6\" /> <line x1=\"4\" x2=\"20\" y1=\"18\" y2=\"18\" /></svg></button><b>하루공부 관리자</b></div>\n    <div class=\"top\">\n      <h1 id=\"title\">대시보드</h1><span class=\"demo\">예시 데이터</span><span class=\"sp\"></span>\n      <div class=\"pills\" id=\"range\" role=\"group\" aria-label=\"기간\"><button data-r=\"1\">오늘</button><button data-r=\"7\" aria-pressed=\"true\">7일</button><button data-r=\"30\">30일</button><button data-r=\"90\">90일</button></div>\n      <button class=\"btn\"><svg class=\"ic\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\" /> <polyline points=\"7 10 12 15 17 10\" /> <line x1=\"12\" x2=\"12\" y1=\"15\" y2=\"3\" /></svg>내보내기</button>\n      <div class=\"mew\"><button class=\"me\" id=\"meBtn\" aria-haspopup=\"true\" aria-expanded=\"false\" aria-controls=\"mePop\" aria-label=\"내 계정\"><span class=\"av\">금</span><span><b>GOLDKING</b><small>최고 관리자 · 2단계 인증</small></span></button>\n        <div class=\"pop\" id=\"mePop\" hidden role=\"dialog\" aria-label=\"내 계정 정보\">\n          <div class=\"ph2\"><span class=\"av lg\">금</span><span><b>GOLDKING</b><small id=\"meMail\"></small></span></div>\n          <dl class=\"kv\"><dt>역할</dt><dd>최고 관리자</dd><dt>2단계 인증</dt><dd><span class=\"tag good\">켜짐 · 인증 앱</span></dd><dt>이번 로그인</dt><dd class=\"num\" id=\"meNow\">—</dd><dt>지난 로그인</dt><dd class=\"num\">10/30 18:42 · 서울</dd><dt>접속 IP</dt><dd class=\"num\">211.***.***.24</dd></dl>\n          <div class=\"ml\"><button data-me=\"sys\"><svg class=\"ic\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\" /></svg>관리자·권한 보기</button><button data-me=\"pw\"><svg class=\"ic\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\" /> <path d=\"M7 11V7a5 5 0 0 1 10 0v4\" /></svg>비밀번호 바꾸기</button><button class=\"out\" data-me=\"out\"><svg class=\"ic\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\" /> <polyline points=\"16 17 21 12 16 7\" /> <line x1=\"21\" x2=\"9\" y1=\"12\" y2=\"12\" /></svg>로그아웃</button></div>\n        </div></div>\n    </div>\n    <div id=\"view\"></div>\n  </main>\n</div>\n<div class=\"drawer\" id=\"drawer\" hidden><div class=\"dim\" data-close></div><div class=\"dp\" id=\"dp\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"dpT\"></div></div>";

export function mountAdmin(root, env) {
root.innerHTML = ADMIN_SKELETON;
const AC = new AbortController();
const _on = (t, ev, f) => t.addEventListener(ev, f, { signal: AC.signal });

const ICON={"ban": "<circle cx=\"12\" cy=\"12\" r=\"10\" /> <path d=\"m4.9 4.9 14.2 14.2\" />", "bell": "<path d=\"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9\" /> <path d=\"M10.3 21a1.94 1.94 0 0 0 3.4 0\" />", "calendar": "<path d=\"M8 2v4\" /> <path d=\"M16 2v4\" /> <rect width=\"18\" height=\"18\" x=\"3\" y=\"4\" rx=\"2\" /> <path d=\"M3 10h18\" />", "check": "<path d=\"M20 6 9 17l-5-5\" />", "chevron-right": "<path d=\"m9 18 6-6-6-6\" />", "clock": "<circle cx=\"12\" cy=\"12\" r=\"10\" /> <polyline points=\"12 6 12 12 16 14\" />", "coins": "<circle cx=\"8\" cy=\"8\" r=\"6\" /> <path d=\"M18.09 10.37A6 6 0 1 1 10.34 18\" /> <path d=\"M7 6h1v4\" /> <path d=\"m16.71 13.88.7.71-2.82 2.82\" />", "credit-card": "<rect width=\"20\" height=\"14\" x=\"2\" y=\"5\" rx=\"2\" /> <line x1=\"2\" x2=\"22\" y1=\"10\" y2=\"10\" />", "download": "<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\" /> <polyline points=\"7 10 12 15 17 10\" /> <line x1=\"12\" x2=\"12\" y1=\"15\" y2=\"3\" />", "eye": "<path d=\"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0\" /> <circle cx=\"12\" cy=\"12\" r=\"3\" />", "file-pen-line": "<path d=\"m18 5-2.414-2.414A2 2 0 0 0 14.172 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2\" /> <path d=\"M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z\" /> <path d=\"M8 18h1\" />", "flag": "<path d=\"M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z\" /> <line x1=\"4\" x2=\"4\" y1=\"22\" y2=\"15\" />", "gamepad-2": "<line x1=\"6\" x2=\"10\" y1=\"11\" y2=\"11\" /> <line x1=\"8\" x2=\"8\" y1=\"9\" y2=\"13\" /> <line x1=\"15\" x2=\"15.01\" y1=\"12\" y2=\"12\" /> <line x1=\"18\" x2=\"18.01\" y1=\"10\" y2=\"10\" /> <path d=\"M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z\" />", "gift": "<rect x=\"3\" y=\"8\" width=\"18\" height=\"4\" rx=\"1\" /> <path d=\"M12 8v13\" /> <path d=\"M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7\" /> <path d=\"M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5\" />", "graduation-cap": "<path d=\"M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z\" /> <path d=\"M22 10v6\" /> <path d=\"M6 12.5V16a6 3 0 0 0 12 0v-3.5\" />", "headset": "<path d=\"M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z\" /> <path d=\"M21 16v2a4 4 0 0 1-4 4h-5\" />", "keyboard": "<path d=\"M10 8h.01\" /> <path d=\"M12 12h.01\" /> <path d=\"M14 8h.01\" /> <path d=\"M16 12h.01\" /> <path d=\"M18 8h.01\" /> <path d=\"M6 8h.01\" /> <path d=\"M7 16h10\" /> <path d=\"M8 12h.01\" /> <rect width=\"20\" height=\"16\" x=\"2\" y=\"4\" rx=\"2\" />", "layout-dashboard": "<rect width=\"7\" height=\"9\" x=\"3\" y=\"3\" rx=\"1\" /> <rect width=\"7\" height=\"5\" x=\"14\" y=\"3\" rx=\"1\" /> <rect width=\"7\" height=\"9\" x=\"14\" y=\"12\" rx=\"1\" /> <rect width=\"7\" height=\"5\" x=\"3\" y=\"16\" rx=\"1\" />", "lock": "<rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\" /> <path d=\"M7 11V7a5 5 0 0 1 10 0v4\" />", "log-out": "<path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\" /> <polyline points=\"16 17 21 12 16 7\" /> <line x1=\"21\" x2=\"9\" y1=\"12\" y2=\"12\" />", "mail": "<rect width=\"20\" height=\"16\" x=\"2\" y=\"4\" rx=\"2\" /> <path d=\"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7\" />", "menu": "<line x1=\"4\" x2=\"20\" y1=\"12\" y2=\"12\" /> <line x1=\"4\" x2=\"20\" y1=\"6\" y2=\"6\" /> <line x1=\"4\" x2=\"20\" y1=\"18\" y2=\"18\" />", "message-square": "<path d=\"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z\" />", "monitor": "<rect width=\"20\" height=\"14\" x=\"2\" y=\"3\" rx=\"2\" /> <line x1=\"8\" x2=\"16\" y1=\"21\" y2=\"21\" /> <line x1=\"12\" x2=\"12\" y1=\"17\" y2=\"21\" />", "moon": "<path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\" />", "pencil": "<path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\" /> <path d=\"m15 5 4 4\" />", "rotate-ccw": "<path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\" /> <path d=\"M3 3v5h5\" />", "save": "<path d=\"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z\" /> <path d=\"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7\" /> <path d=\"M7 3v4a1 1 0 0 0 1 1h7\" />", "search": "<circle cx=\"11\" cy=\"11\" r=\"8\" /> <path d=\"m21 21-4.3-4.3\" />", "shield": "<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\" />", "sun": "<circle cx=\"12\" cy=\"12\" r=\"4\" /> <path d=\"M12 2v2\" /> <path d=\"M12 20v2\" /> <path d=\"m4.93 4.93 1.41 1.41\" /> <path d=\"m17.66 17.66 1.41 1.41\" /> <path d=\"M2 12h2\" /> <path d=\"M20 12h2\" /> <path d=\"m6.34 17.66-1.41 1.41\" /> <path d=\"m19.07 4.93-1.41 1.41\" />", "swords": "<polyline points=\"14.5 17.5 3 6 3 3 6 3 17.5 14.5\" /> <line x1=\"13\" x2=\"19\" y1=\"19\" y2=\"13\" /> <line x1=\"16\" x2=\"20\" y1=\"16\" y2=\"20\" /> <line x1=\"19\" x2=\"21\" y1=\"21\" y2=\"19\" /> <polyline points=\"14.5 6.5 18 3 21 3 21 6 17.5 9.5\" /> <line x1=\"5\" x2=\"9\" y1=\"14\" y2=\"18\" /> <line x1=\"7\" x2=\"4\" y1=\"17\" y2=\"20\" /> <line x1=\"3\" x2=\"5\" y1=\"19\" y2=\"21\" />", "trending-up": "<polyline points=\"22 7 13.5 15.5 8.5 10.5 2 17\" /> <polyline points=\"16 7 22 7 22 13\" />", "triangle-alert": "<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\" /> <path d=\"M12 9v4\" /> <path d=\"M12 17h.01\" />", "user-plus": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\" /> <circle cx=\"9\" cy=\"7\" r=\"4\" /> <line x1=\"19\" x2=\"19\" y1=\"8\" y2=\"14\" /> <line x1=\"22\" x2=\"16\" y1=\"11\" y2=\"11\" />", "user-x": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\" /> <circle cx=\"9\" cy=\"7\" r=\"4\" /> <line x1=\"17\" x2=\"22\" y1=\"8\" y2=\"13\" /> <line x1=\"22\" x2=\"17\" y1=\"8\" y2=\"13\" />", "users": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\" /> <circle cx=\"9\" cy=\"7\" r=\"4\" /> <path d=\"M22 21v-2a4 4 0 0 0-3-3.87\" /> <path d=\"M16 3.13a4 4 0 0 1 0 7.75\" />", "x": "<path d=\"M18 6 6 18\" /> <path d=\"m6 6 12 12\" />", "zap": "<path d=\"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z\" />"};
const I=(n,c)=>`<svg class="ic${c?' '+c:''}" viewBox="0 0 24 24" aria-hidden="true">${ICON[n]||''}</svg>`;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=n=>Number(n).toLocaleString('ko-KR');
const pct=(n,d=1)=>(n*100).toFixed(d)+'%';
/* 예시 데이터: 고정 시드로 늘 같은 값 */
let seed=7; const rnd=()=>{ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; };
const SUBJ=[['math','연산'],['hanja','한자'],['eng','영단어'],['kor','국어'],['sci','과학'],['hist','역사'],['typ','타자']];
const COL=k=>`var(--c-${k})`;

/* 90일 추이 */
const DAYS=90, today=new Date(2026,9,24);
const series=Array.from({length:DAYS},(_,i)=>{ const t=i/DAYS, d=new Date(today); d.setDate(d.getDate()-(DAYS-1-i)); const wk=d.getDay(); const base=180+470*t; const dau=Math.round(base*(wk===0?0.72:wk===6?0.8:1)*(0.93+rnd()*0.14)); const done=Math.min(0.72,0.42+0.16*t+(rnd()-0.5)*0.06-(wk===0||wk===6?0.05:0)); const sign=Math.round((8+18*t)*(0.7+rnd()*0.6)); return {d,dau,done,sign}; });
const last=series.at(-1), prev=series.at(-2);

const NAV=[
  ['grp','운영 현황'],['dash','대시보드','layout-dashboard'],['acq','유입 분석','trending-up'],['users','회원','users'],['learn','학습 분석','graduation-cap'],['game','게임 이용','gamepad-2'],
  ['grp','관리'],['cms','콘텐츠','file-pen-line',7],['cs','고객지원','headset',3],['reward','보상·게임','gift'],['pay','결제·구독','credit-card'],
  ['grp','설정'],['sys','관리자·권한','shield']
];
let cur='dash', range=7;
function navHTML(){ return NAV.map(n=>n[0]==='grp'?`<div class="grp">${n[1]}</div>`:`<button data-v="${n[0]}" ${n[0]===cur?'aria-current="page"':''}>${I(n[2])}${n[1]}${n[3]?`<em>${n[3]}</em>`:''}</button>`).join(''); }

/* ---------- 차트 (모두 데이터에서 계산해 그림) ---------- */
function spark(vals,color){ const w=120,h=28,mx=Math.max(...vals),mn=Math.min(...vals); const p=vals.map((v,i)=>`${(i/(vals.length-1)*w).toFixed(1)},${(h-2-(v-mn)/((mx-mn)||1)*(h-4)).toFixed(1)}`).join(' ');
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${p}" fill="none" stroke="${color}" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`; }
/* 일별 값을 주 단위로 묶어 둥근 막대로 그림 (최근 주 = 진한 강조색, 지난 주들 = 연한 색) */
function lineChart(rows,key,{h=NARROW()?210:180,fmtY=v=>fmt(Math.round(v)),color='var(--accent)',ref=null,label=''}={}){
  const wk=[]; for(let e=rows.length;e>0;e-=7){ const g=rows.slice(Math.max(0,e-7),e); if(g.length<4) break; wk.unshift({d:g[0].d,v:g.reduce((a,r)=>a+r[key],0)/g.length}); }
  const W=NARROW()?400:760,L=40,R=12,T=22,B=26,iw=W-L-R,ih=h-T-B; const vals=wk.map(w=>w.v); let mx=Math.max(...vals,ref?ref.v:0);
  const step=niceStep(mx/4); mx=Math.ceil(mx/step)*step; const ticks=[]; for(let v=0;v<=mx+1e-9;v+=step) ticks.push(v);
  const n=wk.length, slot=iw/n, bw=Math.min(34,slot*0.62), X=i=>L+i*slot+(slot-bw)/2, Y=v=>T+ih-v/mx*ih, rr=Math.min(8,bw/2);
  const bar=(x,y,w,hh)=>{ const r=Math.min(rr,hh); return `M${x},${y+hh} V${y+r} Q${x},${y} ${x+r},${y} H${x+w-r} Q${x+w},${y} ${x+w},${y+r} V${y+hh} Z`; };
  const every=NARROW()?3:2;
  return `<svg class="chart" viewBox="0 0 ${W} ${h}" role="img" aria-label="${esc(label)} (주 평균)">
    ${ticks.map(v=>`<line x1="${L}" x2="${W-R}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)"/><text x="${L-8}" y="${Y(v)+4}" text-anchor="end">${fmtY(v)}</text>`).join('')}
    ${wk.map((w,i)=>{ const last=i===n-1, y=Y(w.v), hh=T+ih-y; return `<path class="gy" style="--i:${i}" d="${bar(X(i),y,bw,hh)}" fill="${color}" opacity="${last?1:0.28}"><title>${w.d.getMonth()+1}/${w.d.getDate()} 주 평균 ${fmtY(w.v)}</title></path>${last?`<text x="${X(i)+bw/2}" y="${y-7}" text-anchor="middle" style="fill:var(--ink);font-weight:800;font-size:12px">${fmtY(w.v)}</text>`:''}${(n-1-i)%every===0?`<text x="${X(i)+bw/2}" y="${h-6}" text-anchor="middle">${w.d.getMonth()+1}/${w.d.getDate()}</text>`:''}`; }).join('')}
    ${ref!=null?`<line x1="${L}" x2="${W-R}" y1="${Y(ref.v)}" y2="${Y(ref.v)}" stroke="var(--ink)" stroke-opacity=".55" stroke-dasharray="5 4"/><text x="${L+6}" y="${Y(ref.v)-6}" style="fill:var(--sub);font-weight:700">${ref.t}</text>`:''}
    </svg>`; }
const NARROW=()=>innerWidth<700;
function niceStep(x){ const p=Math.pow(10,Math.floor(Math.log10(x||1))), f=x/p; return (f<=1?1:f<=2?2:f<=5?5:10)*p; }
function hBars(rows,{max,unit='',lw=64}={}){ const mx=max||Math.max(...rows.map(r=>r.v)); return `<div style="display:flex;flex-direction:column;gap:9px">${rows.map((r,ri)=>`<div style="display:grid;grid-template-columns:${lw}px 1fr 72px;gap:10px;align-items:center;font-size:13px"><span style="font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.n}</span><span style="height:10px;border-radius:99px;background:var(--chip);overflow:hidden"><i class="gx" style="--i:${ri};display:block;height:100%;width:${(r.v/mx*100).toFixed(1)}%;background:${r.c||'var(--accent)'};border-radius:99px"></i></span><span class="num" style="text-align:right;font-weight:800">${fmt(r.v)}${unit}</span></div>`).join('')}</div>`; }
function hourBars(){ const W=NARROW()?400:760,h=NARROW()?190:150,L=34,B=24,T=12,iw=W-L-10,ih=h-T-B; const v=Array.from({length:24},(_,i)=>{ const b=i<7?2:i<9?18:i<13?10:i<15?22:i<17?78:i<19?64:i<21?92:i<22?40:8; return Math.round(b*(0.85+rnd()*0.3)); }); const mx=Math.max(...v); const bw=iw/24;
  return `<svg class="chart" viewBox="0 0 ${W} ${h}" role="img" aria-label="시간대별 학습 시작 분포">${[0,mx/2,mx].map(t=>`<line x1="${L}" x2="${W-10}" y1="${T+ih-t/mx*ih}" y2="${T+ih-t/mx*ih}" stroke="var(--line)"/><text x="${L-6}" y="${T+ih-t/mx*ih+4}" text-anchor="end">${Math.round(t)}</text>`).join('')}
    ${v.map((x,i)=>`<rect class="gy" style="--i:${i/2}" x="${L+i*bw+2}" y="${T+ih-x/mx*ih}" width="${bw-4}" height="${x/mx*ih}" rx="3" fill="${i===16||i===20?'var(--accent)':'var(--mute)'}" opacity="${i===16||i===20?1:.45}"><title>${i}시 ${x}명</title></rect>`).join('')}
    ${(NARROW()?[0,8,16,20]:[0,6,12,16,20,23]).map(i=>`<text x="${L+i*bw+bw/2}" y="${h-6}" text-anchor="middle">${i}시</text>`).join('')}
    <text x="${L+16*bw+bw/2}" y="${T+ih-v[16]/mx*ih-6}" text-anchor="middle" style="fill:var(--accent);font-weight:800">알림</text><text x="${L+20*bw+bw/2}" y="${T+ih-v[20]/mx*ih-6}" text-anchor="middle" style="fill:var(--accent);font-weight:800">알림</text></svg>`; }

/* ---------- 화면 ---------- */
const V={};
/* ---------- 대시보드 (실제 데이터 — scripts/admin-app.mjs가 시안의 예시 대시보드 대신 끼운다) ----------
   D.series: 90일 추이(활성·완료율·가입), D.sum: 선택 기간 요약(재방문·코호트·과목·학년·연속 학습) */
const LIVE=['dash','users','sys'];
let D={series:[],sum:{}};
async function loadAll(){ const rows=await env.daily(90); D.series=rows.map(r=>{ const d=new Date(r.day+'T00:00:00'); return {d,dau:r.active,done:r.active?r.done/r.active:0,sign:r.signups,kids:r.kids,solved:r.solved,correct:r.correct}; }); await reloadSum(); }
async function reloadSum(){ D.sum=await env.summary(range); }
const SUBN={math:'연산',gugu:'구구단',hanja:'한자',eng:'영단어',kor:'국어',sci:'과학',hist:'역사',typ:'타자'};
const GRADE_ORDER=['초1','초2','초3','초4','초5','초6','중1','중2','중3','고1','고2','고3'];
const emptyChart=t=>`<div class="empty">${t}</div>`;
V.dash=()=>{ const S0=D.series, r=S0.slice(-range), pr=S0.slice(-range*2,-range), sm=D.sum||{};
  const avg=(a,k)=>a.length?a.reduce((s,x)=>s+x[k],0)/a.length:0, sum=(a,k)=>a.reduce((s,x)=>s+x[k],0);
  const sign=sum(r,'sign'), signP=sum(pr,'sign'), kids=sum(r,'kids'), dau=Math.round(avg(r,'dau')), dauP=Math.round(avg(pr,'dau'));
  const actDays=sum(r,'dau'), doneN=r.reduce((s,x)=>s+x.done*x.dau,0), done=actDays?doneN/actDays:0, prAct=sum(pr,'dau'), doneP=prAct?pr.reduce((s,x)=>s+x.done*x.dau,0)/prAct:0;
  const solved=sum(r,'solved'), correct=sum(r,'correct');
  const d=(a,b,p)=>{ if(!b&&!p) return '<span class="mute">직전 기록 없음</span>'; const x=p?(a-b)*100:(a-b)/b*100; return `<span class="${x>=0?'up':'down'}">${x>=0?'▲':'▼'} ${Math.abs(x).toFixed(1)}${p?'%p':'%'}</span>`; };
  const today=S0.at(-1)||{dau:0}, mau=sm.mau||0;
  const any=S0.some(x=>x.dau>0);
  let ci=0; const cell=v=>v==null?'<td class="h" style="color:var(--mute)">—</td>':`<td class="h num" style="--i:${ci++};background:color-mix(in srgb,var(--accent) ${Math.round(v*120)}%,var(--panel));color:${v>0.4?'#fff':'var(--ink)'}">${pct(v,0)}</td>`;
  const coh=(sm.cohort||[]).slice(-8).map(c=>{ const w=new Date(c.w+'T00:00:00'); return {w:`${w.getMonth()+1}월 ${w.getDate()}일 주`,n:c.n,d1:c.d1,d7:c.d7,d14:c.d14,d30:c.d30}; });
  const subj=Object.entries(sm.subjects||{}).map(([k,v])=>({n:SUBN[k]||k,c:COL(k==='gugu'?'math':k),v})).sort((a,b)=>b.v-a.v);
  const grade=GRADE_ORDER.filter(g=>(sm.grades||{})[g]).map(n=>({n,v:sm.grades[n]}));
  return `<div class="grid k8">
    <div class="panel kpi hero"><span class="lab">${I('check')}오늘 할 일 완료율</span><span class="val num">${pct(done)}</span><span class="dl">직전 대비 ${d(done,doneP,true)}</span>${spark(r.map(x=>x.done),'var(--accent)')}</div>
    <div class="panel kpi"><span class="lab">${I('users')}활성 학생 (일 평균)</span><span class="val num">${fmt(dau)}<small>명</small></span><span class="dl">${d(dau,dauP)} · DAU/MAU ${mau?pct(today.dau/mau,0):'—'}</span>${spark(r.map(x=>x.dau),'var(--accent)')}</div>
    <div class="panel kpi"><span class="lab">${I('user-plus')}신규 보호자</span><span class="val num">${fmt(sign)}<small>명</small></span><span class="dl">${d(sign,signP)} · 자녀 ${fmt(kids)}명</span>${spark(r.map(x=>x.sign),'var(--accent)')}</div>
    <div class="panel kpi"><span class="lab">${I('rotate-ccw')}D7 재방문율</span><span class="val num">${sm.d7!=null?pct(sm.d7):'—'}</span><span class="dl">D1 ${sm.d1!=null?pct(sm.d1):'—'}</span></div>
    <div class="panel kpi"><span class="lab">${I('pencil')}1인당 푼 문제</span><span class="val num">${actDays?Math.round(solved/actDays):0}<small>문제</small></span><span class="dl">정답률 ${solved?pct(correct/solved):'—'} · 하루 기준</span></div>
    <div class="panel kpi"><span class="lab">${I('calendar')}7일 이상 연속 학습</span><span class="val num">${fmt(sm.streak7||0)}<small>명</small></span><span class="dl">최근 30일 활성 ${fmt(mau)}명</span></div>
    <div class="panel kpi"><span class="lab">${I('flag')}오류 신고 (미처리)</span><span class="val num">—</span><span class="dl">신고 기능 준비 중</span></div>
    <div class="panel kpi"><span class="lab">${I('credit-card')}유료 가족</span><span class="val num">—</span><span class="dl">결제 오픈 전</span></div>
  </div>
  <div class="grid c2">
    <div class="panel"><div class="ph"><h2>활성 학생 수</h2><small>하루에 1문제 이상 푼 학생 · 주 평균 · 최근 13주</small></div>${any?lineChart(S0,'dau',{label:'일별 활성 학생 수'}):emptyChart('아직 학습 기록이 없어요')}
      <div class="ph" style="margin-top:14px"><h2>오늘 할 일 완료율</h2><small>완료 학생 ÷ 활성 학생 · 주 평균 · 점선은 목표 60%</small></div>${any?lineChart(S0,'done',{h:150,fmtY:v=>Math.round(v*100)+'%',ref:{v:0.6,t:'목표 60%'},label:'오늘 할 일 완료율'}):emptyChart('아직 학습 기록이 없어요')}</div>
    <div class="panel"><div class="ph"><h2>확인이 필요해요</h2><small>자동 감지</small></div><div class="alerts">
      <div class="al">${I('check')}<div><b>지금 확인할 것이 없어요</b><span>문항별 정답률·오류 신고·캐시 이상치는 문항 기록(attempts)과 신고 기능을 연결하면 여기에 떠요.</span></div></div>
    </div></div>
  </div>
  <div class="grid c2">
    <div class="panel"><div class="ph"><h2>가입 주차별 재방문</h2><small>첫 학습일 기준 n일째 활성 비율 · 최근 8주</small></div>${coh.length?`<div class="tw"><table class="coh"><thead><tr><th>첫 학습 주</th><th class="r">학생</th><th style="text-align:center">D1</th><th style="text-align:center">D7</th><th style="text-align:center">D14</th><th style="text-align:center">D30</th></tr></thead><tbody>${coh.map(c=>`<tr><td>${c.w}</td><td class="r num">${c.n}</td>${cell(c.d1)}${cell(c.d7)}${cell(c.d14)}${cell(c.d30)}</tr>`).join('')}</tbody></table></div>`:emptyChart('아직 첫 학습 기록이 없어요')}</div>
    <div class="panel"><div class="ph"><h2>과목별 맞힌 문제</h2><small>최근 ${Math.min(range,7)}일${range>7?' (과목별 기록은 최근 7일만 남아요)':''}</small></div>${subj.length?hBars(subj):emptyChart('기간 안에 푼 문제가 없어요')}</div>
  </div>
  <div class="grid c2">
    <div class="panel"><div class="ph"><h2>시간대별 학습 시작</h2><small>16시·20시는 알림 시간</small></div>${emptyChart('학습 시작 시각은 아직 모으지 않아요. 이벤트 기록(session_start)을 연결하면 보여요.')}</div>
    <div class="panel"><div class="ph"><h2>학년별 활성 학생</h2><small>최근 ${range}일</small></div>${grade.length?hBars(grade,{unit:'명'}):emptyChart('기간 안에 활성 학생이 없어요')}</div>
  </div>`; };


const CH=[
  {n:'맘카페·학부모 커뮤니티',v:4820,s:612,f:540,t:401,d7:236,c:'—'},{n:'지인 추천(초대 코드)',v:1310,s:402,f:388,t:319,d7:214,c:'—'},{n:'네이버 검색',v:5210,s:388,f:322,t:210,d7:118,c:'₩412,000'},
  {n:'블로그',v:2950,s:241,f:201,t:139,d7:71,c:'—'},{n:'인스타그램',v:3880,s:176,f:132,t:74,d7:33,c:'₩300,000'},{n:'유튜브',v:1420,s:98,f:84,t:57,d7:30,c:'—'},{n:'직접 방문',v:2100,s:154,f:139,t:98,d7:52,c:'—'}];
V.acq=()=>{ const tot=CH.reduce((a,c)=>({v:a.v+c.v,s:a.s+c.s,f:a.f+c.f,t:a.t+c.t,d7:a.d7+c.d7}),{v:0,s:0,f:0,t:0,d7:0});
  const steps=[['방문',tot.v],['가입',tot.s],['첫 문제',tot.f],['오늘 할 일 첫 완료',tot.t],['D7 재방문',tot.d7]];
  return `<div class="grid c2"><div class="panel"><div class="ph"><h2>가입 퍼널</h2><small>최근 30일 · 전체 채널</small></div><div class="funnel">${steps.map(([n,v],i)=>`<div class="fr"><span style="font-weight:700">${n}</span><span><i class="fb gx ${i?'':'l'}" style="--i:${i};display:block;width:${Math.max(2,v/steps[i?1:0][1]*100)}%"></i></span><span class="num" style="text-align:right"><b>${fmt(v)}</b> <small>${i?pct(v/steps[i-1][1],0):''}</small></span></div>`).join('')}</div><p class="note">방문은 막대 비율에서 빼고(옅은 막대), 가입 이후 단계를 가입 수 기준으로 그렸어요.</p></div>
    <div class="panel"><div class="ph"><h2>추천 코드 상위</h2><small>코드별 가입</small></div><div class="tw"><table><thead><tr><th>코드</th><th>주인(보호자)</th><th class="r">가입</th><th class="r">D7 유지</th></tr></thead><tbody>${[['HARU-7K2P','ki***@naver.com',23,'61%'],['HARU-M9QX','pa***@gmail.com',18,'72%'],['HARU-2BTA','so***@daum.net',14,'50%'],['HARU-X4LE','ye***@gmail.com',11,'64%'],['HARU-Q8NR','ch***@kakao.com',9,'56%']].map(r=>`<tr><td class="num"><b>${r[0]}</b></td><td>${r[1]}</td><td class="r num">${r[2]}</td><td class="r num">${r[3]}</td></tr>`).join('')}</tbody></table></div></div></div>
  <div class="panel"><div class="ph"><h2>채널별 성과</h2><small>첫 접점 기준 · 최근 30일 · 비용은 직접 입력</small><span class="sp"></span><div class="pills"><button aria-pressed="true">첫 접점</button><button>마지막 접점</button></div></div>
    <div class="tw"><table><thead><tr><th>채널</th><th class="r">방문</th><th class="r">가입</th><th class="r">가입률</th><th class="r">첫 문제</th><th class="r">할 일 첫 완료</th><th class="r">D7 재방문</th><th class="r">D7 유지율</th><th class="r">비용</th><th class="r">가입당 비용</th></tr></thead>
    <tbody>${CH.map(c=>{ const cost=c.c==='—'?null:Number(c.c.replace(/[^\d]/g,'')); return `<tr><td><b>${c.n}</b></td><td class="r num">${fmt(c.v)}</td><td class="r num">${fmt(c.s)}</td><td class="r num">${pct(c.s/c.v)}</td><td class="r num">${fmt(c.f)}</td><td class="r num">${fmt(c.t)}</td><td class="r num">${fmt(c.d7)}</td><td class="r num"><span class="bar gx" style="width:${Math.round(c.d7/c.s*60)}px"></span> ${pct(c.d7/c.s,0)}</td><td class="r num">${c.c}</td><td class="r num">${cost?'₩'+fmt(Math.round(cost/c.s)):'—'}</td></tr>`; }).join('')}</tbody></table></div>
    <p class="note">수집 값: utm_source · utm_medium · utm_campaign · utm_content, 이전 페이지 주소, 랜딩 페이지, 추천 코드. 첫 방문 때 30일 쿠키에 담아 가입 시 계정에 붙여요.</p></div>
  <div class="grid c11"><div class="panel"><div class="ph"><h2>기기</h2></div>${hBars([{n:'iPhone',v:812},{n:'Android',v:744},{n:'iPad',v:312},{n:'PC',v:203}],{unit:'명'})}</div><div class="panel"><div class="ph"><h2>지역 (시·도)</h2></div>${hBars([{n:'경기',v:702},{n:'서울',v:588},{n:'인천',v:164},{n:'부산',v:132},{n:'대구',v:96}],{unit:'명'})}</div></div>`; };

/* ---------- 회원 (실제 데이터) ---------- */
let MEM=[];
const STL={active:'정상',suspended:'정지',withdrawn:'탈퇴 예정'};
const ymd=s=>{ const d=new Date(s); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const ago=s=>{ if(!s) return '기록 없음'; const n=Math.round((new Date(new Date().toDateString())-new Date(s+'T00:00:00'))/864e5); return n<=0?'오늘':n===1?'어제':`${n}일 전`; };
async function loadMembers(){ const rows=await env.members(); MEM=rows.map(m=>({id:'G'+m.gid.slice(0,6).toUpperCase(),gid:m.gid,email:m.email,join:ymd(m.created_at),consent:m.consent_at,src:'—',kids:(m.kids||[]).map(k=>k.n),kg:m.kids||[],sub:'무료',last:ago(m.last_day),st:STL[m.status]||m.status})); }
V.users=()=>`<div class="panel"><div class="filters"><label class="sch">${I('search')}<input id="q" placeholder="이메일, 자녀 닉네임, 회원번호" aria-label="회원 검색"></label>
    <span style="flex:1"></span><span class="note">보호자 ${fmt(MEM.length)}명 · 학생 ${fmt(MEM.reduce((a,m)=>a+m.kids.length,0))}명</span></div>
  <div class="tw"><table><thead><tr><th>회원번호</th><th>이메일</th><th>가입일</th><th>가입 경로</th><th>자녀</th><th>구독</th><th>최근 학습</th><th>상태</th><th></th></tr></thead><tbody id="memRows">${memRows(MEM)}</tbody></table></div>
  <p class="note">이메일은 가려서 보여요. 상세에서 '보기'를 누르면 열람 기록이 남아요. 자녀는 닉네임과 학년만 저장해요. 가입 경로는 유입 값 수집을 연결하면 채워져요.</p></div>`;
function memRows(rows){ return rows.map(m=>`<tr class="click" data-m="${m.id}" tabindex="0"><td class="num">${m.id}</td><td>${esc(m.email)}</td><td class="num">${m.join}</td><td>${m.src}</td><td>${esc(m.kids.join(', '))||'—'}</td><td><span class="tag mute">${m.sub}</span></td><td>${m.last}</td><td><span class="tag ${m.st==='정상'?'good':m.st==='정지'?'bad':'warn'}">${m.st}</span></td><td>${I('chevron-right')}</td></tr>`).join('') || `<tr><td colspan="9"><div class="empty">찾는 회원이 없어요. 이메일 앞글자나 자녀 닉네임으로 다시 찾아보세요.</div></td></tr>`; }
const GR=[[0,'씨앗'],[150,'새싹'],[400,'잎새'],[800,'꽃'],[1300,'나무'],[2000,'숲'],[3000,'별']];
const gradeOf=xp=>GR.filter(g=>xp>=g[0]).at(-1)[1];
let DM=null; // 열린 회원 상세
async function memberDrawer(id){ const m=MEM.find(x=>x.id===id); if(!m) return;
  dp.innerHTML=`<div class="dh"><h3 id="dpT">${esc(m.email)}</h3><span class="sp"></span><button class="ib" data-close aria-label="닫기">${I('x')}</button></div><div class="empty">불러오는 중…</div>`; drawer.hidden=false;
  let x; try{ x=await env.member(m.gid); }catch(e){ dp.innerHTML+=`<p class="err">${esc(e.message)}</p>`; return; }
  DM={m,x};
  const wk=Math.floor((Math.floor((Date.now()-new Date().getTimezoneOffset()*60000)/864e5)+3)/7);
  const kid=k=>{ const by=(k.wk||{})[wk]||{}; const prog=SUBJ.map(([s,n])=>({k:s,s:n,v:by[s]||0})).filter(p=>p.v); const mx=Math.max(1,...prog.map(p=>p.v));
    return `<div class="kid"><h4>${esc(k.n)} <span class="tag mute">${esc(k.g)}</span><span style="flex:1"></span><span class="note">캐시 ${fmt(k.cash)} · 등급 ${gradeOf(k.xp)}</span></h4>
    <div class="note" style="margin-bottom:2px">이번 주 과목별 맞힌 문제</div>
    ${prog.length?prog.map((p,i)=>`<div class="prog"><span style="font-weight:700">${p.s}</span><i><b class="gx" style="--i:${i};width:${(p.v/mx*100).toFixed(0)}%;background:${COL(p.k)}"></b></i><span class="note num">${p.v}문제</span></div>`).join(''):'<div class="note">이번 주에는 아직 푼 문제가 없어요</div>'}
    <div><div class="note" style="margin-bottom:6px">최근 30일 학습</div><div class="cal">${(k.days||[]).map(v=>`<span class="${v>=20?'l3':v>=10?'l2':v>0?'l1':''}" title="${v}문제"></span>`).join('')}</div></div>
    <div class="acts"><button class="btn" data-act="cash" data-sid="${k.sid}" data-n="${esc(k.n)}">${I('coins')}캐시 보정</button></div></div>`; };
  dp.innerHTML=`<div class="dh"><h3 id="dpT">${esc(m.email)}</h3><span class="tag ${m.st==='정상'?'good':'warn'}">${m.st}</span><span class="sp"></span><button class="ib" data-close aria-label="닫기">${I('x')}</button></div>
    <dl class="kv"><dt>회원번호</dt><dd class="num">${m.id}</dd><dt>이메일</dt><dd><span id="mailTx">${esc(m.email)} </span><button class="btn" style="height:28px;padding:0 10px;font-size:12px" id="reveal">${I('eye')}보기</button></dd><dt>가입일</dt><dd class="num">${m.join}</dd><dt>가입 경로</dt><dd>— (유입 값 수집 전)</dd><dt>법정대리인 동의</dt><dd class="num">${m.consent?new Date(m.consent).toLocaleString('ko-KR'):'기록 없음'} · 가입 시 동의</dd><dt>구독</dt><dd>${m.sub}</dd></dl>
    ${(x.kids||[]).map(kid).join('')||'<p class="note">등록된 자녀가 없어요</p>'}
    <div class="acts"><button class="btn" data-act="mail">${I('mail')}비밀번호 재설정 메일</button>${m.st==='정지'?`<button class="btn" data-act="unban">${I('rotate-ccw')}정지 해제</button>`:`<button class="btn bad" data-act="ban">${I('ban')}계정 정지</button>`}<button class="btn bad" data-act="del">${I('user-x')}탈퇴 처리</button></div>
    <div id="actBox"></div>
    <p class="note">모든 조회·조치는 감사 로그에 남아요.</p>`;
  dp.querySelector('[data-close]').focus(); }


V.learn=()=>{ seed=99; const units=['받아올림 있는 덧셈','받아내림 있는 뺄셈','구구단 7·8·9단','분수의 덧셈(분모 같음)','분수의 덧셈(분모 다름)','소수의 곱셈','약분과 통분','나눗셈(두 자리)'].map((n,i)=>({n,e:Math.round(900-i*85+rnd()*40),p:0.55+rnd()*0.4,day:(2+rnd()*6).toFixed(1),re:0.04+rnd()*0.24}));
  const items=[['열의 이동 #3','과학','객관식',0.18,[0.71,0.08,0.18,0.03]],['되/돼 구분 #2','국어','맞춤법',0.41,[0.41,0.52,0.07,0]],['통분하기 #5','연산','빈칸',0.47,[0.47,0.31,0.14,0.08]],['孝 훈음','한자','객관식',0.52,[0.52,0.22,0.16,0.10]],['although 뜻','영단어','객관식',0.55,[0.55,0.25,0.12,0.08]]];
  return `<div class="pills" style="margin-bottom:14px">${SUBJ.map(([k,n],i)=>`<button ${i===0?'aria-pressed="true"':''}>${n}</button>`).join('')}</div>
  <div class="panel"><div class="ph"><h2>단원별 진행</h2><small>연산 · 최근 30일 · 재시작 = 틀림 상한에 닿아 처음부터 다시 한 비율</small></div><div class="tw"><table><thead><tr><th>단원</th><th class="r">진입 학생</th><th>통과율</th><th class="r">평균 통과</th><th>재시작</th><th></th></tr></thead><tbody>${units.map(u=>`<tr><td><b>${u.n}</b></td><td class="r num">${fmt(u.e)}</td><td class="num"><span class="bar gx" style="width:${Math.round(u.p*90)}px"></span> ${pct(u.p,0)}</td><td class="r num">${u.day}일</td><td class="num"><span class="bar gx ${u.re>0.18?'':'g'}" style="width:${Math.round(u.re*200)}px;${u.re>0.18?'background:var(--bad)':''}"></span> ${pct(u.re,0)}</td><td>${u.re>0.18?'<span class="tag bad">이탈 구간</span>':''}</td></tr>`).join('')}</tbody></table></div></div>
  <div class="grid c2"><div class="panel"><div class="ph"><h2>정답률 낮은 문항</h2><small>오답 보기 분포: 진한 칸 = 정답</small></div><div class="tw"><table><thead><tr><th>문항</th><th>과목</th><th>유형</th><th class="r">정답률</th><th>보기 분포</th></tr></thead><tbody>${items.map(it=>`<tr><td><b>${it[0]}</b></td><td>${it[1]}</td><td>${it[2]}</td><td class="r num" style="color:${it[3]<0.3?'var(--bad)':'inherit'};font-weight:800">${pct(it[3],0)}</td><td><span class="dist">${it[4].map((v,j)=>`<i style="width:${v*100}%;background:${j===0?'var(--good)':'var(--mute)'};opacity:${j===0?1:0.3+0.2*j}"></i>`).join('')}</span></td></tr>`).join('')}</tbody></table></div></div>
  <div class="panel"><div class="ph"><h2>학습 도구 사용</h2><small>최근 30일</small></div>${hBars([{n:'슬라이드',v:4210},{n:'받아쓰기',v:1380},{n:'단어장 담기',v:2960},{n:'검색',v:5120}],{unit:'회'})}
    <div class="ph" style="margin-top:16px"><h2>오답 카드 졸업률</h2></div>${hBars([{n:'1일 뒤',v:78,c:'var(--good)'},{n:'3일 뒤',v:71,c:'var(--good)'},{n:'5일 뒤',v:83,c:'var(--good)'}],{max:100,unit:'%'})}</div></div>`; };

const REP=[
  {id:'R-2081',t:'노결위상',s:'한자 · 천자문 47구절',why:'읽기가 책이랑 달라요 (로결위상)',n:4,acc:'62%',d:'이슬이 맺혀 서리가 된다',ex:'露結爲霜 — 두음법칙에 따라 노결위상으로 읽어요.'},
  {id:'R-2079',t:'열의 이동 #3',s:'과학 · 중1 열과 우리 생활',why:'정답이 두 개인 것 같아요',n:2,acc:'18%',d:'금속 숟가락의 손잡이가 뜨거워지는 까닭으로 알맞은 것은?',ex:'전도: 물체를 따라 열이 이동하는 현상'},
  {id:'R-2074',t:'although',s:'영단어 · 중등 34단원',why:'예문 해석이 어색해요',n:1,acc:'55%',d:'비록 ~이지만',ex:'Although it was cold, we went out.'},
];
let repSel=REP[0].id;
V.cms=()=>{ const r=REP.find(x=>x.id===repSel);
  return `<div class="grid c3" style="grid-template-columns:minmax(0,.9fr) minmax(0,1.2fr) minmax(0,1fr)">
    <div class="panel"><div class="ph"><h2>오류 신고</h2><small>미처리 7건</small></div><div class="queue">${REP.map(x=>`<button class="qi" data-rep="${x.id}" aria-selected="${x.id===repSel}"><b>${x.t} <span class="tag ${x.n>2?'bad':'warn'}">신고 ${x.n}</span></b><small>${x.s}</small><small>"${x.why}"</small></button>`).join('')}</div></div>
    <div class="panel"><div class="ph"><h2>항목 수정</h2><small class="num">${r.id} · 정답률 ${r.acc}</small><span class="sp"></span><select aria-label="검수 상태"><option>검수 중</option><option>승인</option><option>초안</option></select></div>
      <form class="form" id="cmsForm"><label>제목(정답)<input id="f_t" value="${esc(r.t)}"></label><label>설명·뜻<textarea id="f_d">${esc(r.d)}</textarea></label><label>예문·풀이<textarea id="f_x">${esc(r.ex)}</textarea></label>
      <div class="acts"><button class="btn dark" type="submit">${I('save')}수정 저장</button><button class="btn" type="button">${I('message-square')}신고자에게 답변</button><button class="btn" type="button">반려</button></div><p class="ok" id="saved" hidden>저장했어요. 음성 파일과 검색 색인을 다시 만들어요.</p></form>
      <p class="note" style="margin-top:12px">변경 이력: 10/21 AI 작성 → 10/22 GOLDKING 검수 중</p></div>
    <div class="panel"><div class="ph"><h2>학생 화면 미리보기</h2></div><div class="card"><div class="w" id="pv_t">${esc(r.t)}</div><div class="m" id="pv_d">${esc(r.d)}</div><div class="bx" id="pv_x">${esc(r.ex)}</div></div><p class="note" style="text-align:center;margin-top:10px">슬라이드 카드와 같은 모양으로 보여요.</p></div>
  </div>`; };

V.cs=()=>`<div class="panel"><div class="ph"><h2>문의함</h2><small>미답변 3건</small><span class="sp"></span><div class="pills"><button aria-pressed="true">전체</button><button>로그인</button><button>결제</button><button>콘텐츠 오류</button></div></div><div class="tw"><table><thead><tr><th>접수</th><th>분류</th><th>보호자</th><th>내용</th><th>담당</th><th>상태</th></tr></thead><tbody>${[['10/24 09:12','로그인','ki***@naver.com','아이 계정이 두 개로 보여요','—','미답변'],['10/24 08:40','콘텐츠 오류','pa***@gmail.com','구구단 문제 정답이 틀려요','콘텐츠','미답변'],['10/23 21:05','기타','so***@daum.net','게임을 하루 5판으로 늘리고 싶어요','—','미답변'],['10/23 17:30','로그인','ye***@gmail.com','비밀번호를 잊었어요','CS','답변 완료']].map(r=>`<tr class="click"><td class="num">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td><span class="tag ${r[5]==='미답변'?'warn':'good'}">${r[5]}</span></td></tr>`).join('')}</tbody></table></div></div>
  <div class="grid c11"><div class="panel"><div class="ph"><h2>공지·푸시 보내기</h2><small>보호자에게만 보내요</small></div><form class="form" onsubmit="event.preventDefault();this.querySelector('.ok').hidden=false"><label>대상<select><option>전체 보호자</option><option>7일 이상 학습 안 한 자녀의 보호자</option><option>초등 저학년 자녀 보호자</option></select></label><label>제목<input value="이번 주 새 단원이 열렸어요"></label><label>내용<textarea>과학 '지구와 달' 단원이 추가됐어요. 오늘 할 일에서 확인해 보세요.</textarea></label><div class="acts"><button class="btn dark">${I('bell')}예약 보내기</button></div><p class="ok" hidden>10월 25일 오후 4시에 보내도록 예약했어요.</p></form></div>
  <div class="panel"><div class="ph"><h2>최근 발송</h2></div>${hBars([{n:'10/20',v:61},{n:'10/16',v:48},{n:'10/12',v:55}],{max:100,unit:'% 열람'})}</div></div>`;

V.reward=()=>`<div class="grid c2"><div class="panel"><div class="ph"><h2>꾸미기 아이템</h2><small>660개</small><span class="sp"></span><button class="btn">${I('pencil')}아이템 추가</button></div><div class="tw"><table><thead><tr><th>이름</th><th>슬롯</th><th class="r">가격</th><th class="r">보유 학생</th><th>노출</th></tr></thead><tbody>${[['새싹 모자','모자',30,812,'상시'],['우주복','옷',220,143,'상시'],['할로윈 호박','손',120,0,'10/25~11/1'],['별빛 배경','배경',300,96,'상시'],['안경','얼굴',40,604,'상시']].map(r=>`<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td class="r num">${r[2]}</td><td class="r num">${fmt(r[3])}</td><td><span class="tag ${r[4]==='상시'?'mute':'good'}">${r[4]}</span></td></tr>`).join('')}</tbody></table></div></div>
  <div class="panel"><div class="ph"><h2>캐시 지급·회수</h2></div><form class="form" onsubmit="event.preventDefault();this.querySelector('.ok').hidden=false"><label>대상<input placeholder="회원번호 또는 자녀 닉네임" value="G10421 · 민왕"></label><label>캐시 (회수는 음수)<input type="number" value="50"></label><label>사유 (필수)<input value="오류 문항으로 잃은 캐시 보상"></label><div class="acts"><button class="btn dark">${I('coins')}지급하기</button></div><p class="ok" hidden>50캐시를 지급하고 감사 로그에 남겼어요.</p></form></div></div>
  <div class="panel"><div class="ph"><h2>규칙 값</h2><small>보기 전용 · 바꾸려면 기획 결정과 배포가 필요해요</small></div><div class="tw"><table><tbody>${[['공부 캐시 하루 상한','150'],['게임 캐시 하루 상한','30'],['게임 기본 판 수','3판 (보호자 1·3·5)'],['연속 정답 보너스','5문제마다 +3'],['오늘 할 일 완료','+20'],['단원 통과','+20']].map(r=>`<tr><td>${r[0]}</td><td class="r num"><b>${r[1]}</b></td></tr>`).join('')}</tbody></table></div></div>`;

V.game=()=>{ seed=31; const k=range/7;
  const days=series.map(x=>({d:x.d,plays:Math.round(x.dau*x.done*0.78*(2.3+rnd()*0.4))}));
  const modes=[
    {n:'스피드 게임',i:'zap',p:5240,u:612,sc:'84점',t:'1분 52초',acc:0.86,re:0.41},
    {n:'대결방 (1:1·다인)',i:'swords',p:2310,u:388,sc:'승률 50%',t:'3분 10초',acc:0.82,re:0.33},
    {n:'종합 대결',i:'gamepad-2',p:1180,u:241,sc:'71점',t:'2분 40초',acc:0.78,re:0.27},
    {n:'산성비 타자',i:'keyboard',p:1960,u:302,sc:'평균 148타/분',t:'2분 05초',acc:0.93,re:0.52}].map(m=>({...m,p:Math.round(m.p*k),u:Math.round(m.u*Math.min(1,0.6+k*0.4))}));
  const tot=modes.reduce((a,m)=>a+m.p,0);
  const subj=[['연산','math',2480],['영단어','eng',1320],['한자','hanja',910],['국어','kor',420],['과학','sci',330],['역사','hist',240]].map(([n,c,v])=>({n,c:COL(c),v:Math.round(v*k)}));
  const lock=[{n:'할 일 미완료',v:Math.round(3120*k),c:'var(--warn)'},{n:'오늘 횟수 소진',v:Math.round(1480*k),c:'var(--mute)'},{n:'밤 9시 잠금',v:Math.round(410*k),c:'var(--mute)'},{n:'밀린 공부 잠금',v:Math.round(690*k),c:'var(--warn)'}];
  return `<div class="grid k8">
    <div class="panel kpi hero"><span class="lab">${I('gamepad-2')}게임한 학생</span><span class="val num">63.4%</span><span class="dl">게임이 열린 학생 중 · <span class="up">▲ 3.2%p</span></span></div>
    <div class="panel kpi"><span class="lab">${I('zap')}게임 판 수</span><span class="val num">${fmt(tot)}<small>판</small></span><span class="dl">1인당 하루 2.4판</span>${spark(days.slice(-Math.max(range,7)).map(x=>x.plays),'var(--accent)')}</div>
    <div class="panel kpi"><span class="lab">${I('lock')}게임 열린 학생</span><span class="val num">55.7%</span><span class="dl">오늘 할 일을 끝낸 학생 (활성 대비)</span></div>
    <div class="panel kpi"><span class="lab">${I('pencil')}+1판 받으려고 더 푼 학생</span><span class="val num">18.9%</span><span class="dl">할 일 뒤 20문제 더 맞힘</span></div>
    <div class="panel kpi"><span class="lab">${I('swords')}만든 대결방</span><span class="val num">${fmt(Math.round(840*k))}<small>개</small></span><span class="dl">평균 2.7명 · 비공개 64%</span></div>
    <div class="panel kpi"><span class="lab">${I('coins')}게임 캐시 지급</span><span class="val num">${fmt(Math.round(41200*k))}</span><span class="dl">하루 상한(30) 도달 12%</span></div>
    <div class="panel kpi"><span class="lab">${I('clock')}1인당 게임 시간</span><span class="val num">6.1<small>분/일</small></span><span class="dl">학습 시간의 34%</span></div>
    <div class="panel kpi"><span class="lab">${I('triangle-alert')}이상 기록</span><span class="val num">3<small>건</small></span><span class="dl"><span class="tag warn">승률·속도 이상치</span></span></div>
  </div>
  <div class="grid c2">
    <div class="panel"><div class="ph"><h2>게임 판 수</h2><small>하루 평균 · 주 단위 · 모든 게임 합계</small></div>${lineChart(days,'plays',{label:'일별 게임 판 수'})}<div class="ph" style="margin-top:14px"><h2>게임한 학생 비율</h2><small>게임이 열린 학생 중 실제로 게임한 비율</small></div>${lineChart(days.map((x,i)=>({d:x.d,r:Math.min(0.8,0.48+i/days.length*0.16+(rnd()-0.5)*0.06)})),'r',{h:150,fmtY:v=>Math.round(v*100)+'%',area:false,label:'일별 게임한 학생 비율'})}</div>
    <div class="panel"><div class="ph"><h2>게임별 판 수</h2><small>최근 ${range}일</small></div>${hBars(modes.map(m=>({n:m.n.replace(/ \(.*\)/,''),v:m.p})),{lw:84})}
      <div class="ph" style="margin-top:16px"><h2>스피드 게임 과목</h2></div>${hBars(subj)}</div>
  </div>
  <div class="panel"><div class="ph"><h2>게임별 이용</h2><small>최근 ${range}일 · 재도전 = 같은 날 같은 게임을 다시 한 비율</small></div><div class="tw"><table><thead><tr><th>게임</th><th class="r">판 수</th><th class="r">플레이 학생</th><th class="r">1인당 판</th><th>평균 기록</th><th class="r">평균 시간</th><th>정답률</th><th>재도전</th></tr></thead><tbody>${modes.map(m=>`<tr><td><b style="display:inline-flex;gap:6px;align-items:center">${I(m.i)}${m.n}</b></td><td class="r num">${fmt(m.p)}</td><td class="r num">${fmt(m.u)}</td><td class="r num">${(m.p/m.u).toFixed(1)}</td><td>${m.sc}</td><td class="r num">${m.t}</td><td class="num"><span class="bar gx" style="width:${Math.round(m.acc*70)}px"></span> ${pct(m.acc,0)}</td><td class="num">${pct(m.re,0)}</td></tr>`).join('')}</tbody></table></div></div>
  <div class="grid c2">
    <div class="panel"><div class="ph"><h2>게임을 한 학생과 안 한 학생</h2><small>최근 30일 · 함께 나타나는 차이이며 원인이라고 단정할 수 없어요</small></div><div class="tw"><table><thead><tr><th>지표</th><th class="r">게임한 학생</th><th class="r">안 한 학생</th></tr></thead><tbody>${[['오늘 할 일 완료율','78%','41%'],['1인당 하루 푼 문제','39','27'],['D7 재방문율','52%','29%'],['7일 이상 연속 학습','41%','18%']].map(r=>`<tr><td>${r[0]}</td><td class="r num"><b>${r[1]}</b></td><td class="r num">${r[2]}</td></tr>`).join('')}</tbody></table></div></div>
    <div class="panel"><div class="ph"><h2>게임 잠금 화면을 본 횟수</h2><small>게임 탭에 들어왔지만 막힌 까닭</small></div>${hBars(lock,{unit:'회',lw:100})}
      <div class="ph" style="margin-top:16px"><h2>보호자 게임 설정</h2></div>${hBars([{n:'하루 1판',v:14,c:'var(--mute)'},{n:'하루 3판',v:71},{n:'하루 5판',v:15,c:'var(--mute)'},{n:'밤 9시 잠금',v:38,c:'var(--mute)'}],{max:100,unit:'%',lw:100})}</div>
  </div>
  <div class="grid c2">
    <div class="panel"><div class="ph"><h2>타자 속도 순위</h2><small>산성비 · 이번 주</small></div><div class="tw"><table><thead><tr><th>순위</th><th>닉네임</th><th>학년</th><th class="r">최고 타/분</th><th class="r">정확도</th></tr></thead><tbody>${[['1','하준','초6',412,'97%'],['2','서아','중1',388,'95%'],['3','민왕','초5',351,'96%'],['4','지우','초6',333,'94%'],['5','도윤','초4',298,'97%']].map(r=>`<tr><td class="num"><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td class="r num">${r[3]}</td><td class="r num">${r[4]}</td></tr>`).join('')}</tbody></table></div></div>
    <div class="panel"><div class="ph"><h2>확인이 필요한 기록</h2><small>자동 감지</small></div><div class="alerts">
      <div class="al warn">${I('swords')}<div><b>대결 승률 100% · 42판 연속</b><span>G10199 · 지안 — 상대가 같은 계정 2개로 반복돼요 (같은 보호자 자녀)</span></div></div>
      <div class="al warn">${I('keyboard')}<div><b>산성비 타자 980타/분</b><span>G10051 · 은우 — 붙여넣기 의심, 랭킹에서 잠시 숨김</span></div></div>
      <div class="al">${I('zap')}<div><b>스피드 게임 평균 풀이 0.9초</b><span>G10236 · 시우 — 정답률 31%, 찍기 의심</span></div></div>
    </div></div>
  </div>`; };
V.pay=()=>`<div class="panel"><div class="empty"><b>결제는 아직 열지 않았어요</b><br>결제를 열면 이 화면에서 아래를 관리해요.</div><ul class="plain" style="margin-top:14px"><li>유료 가족 수, 체험→유료 전환율, 월 반복 매출(MRR), 해지율</li><li>구독·결제·환불 목록, 영수증 다시 보내기</li><li>쿠폰, 초대 코드 보상, 학원 라이선스 좌석</li></ul></div>`;

/* ---------- 관리자·권한 (실제 데이터) ---------- */
let ADM=[], AUD=[];
const ROLE={super:'최고 관리자',ops:'운영',content:'콘텐츠 검수',cs:'고객지원'};
const when=s=>{ if(!s) return '—'; const d=new Date(s); return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; };
async function loadSys(){ [ADM,AUD]=await Promise.all([env.admins(),env.audit(50)]); }
V.sys=()=>`<div class="grid c2"><div class="panel"><div class="ph"><h2>관리자 계정</h2><small>추가·역할 변경은 Supabase에서 해요</small></div><div class="tw"><table><thead><tr><th>이름</th><th>역할</th><th>2단계 인증</th><th>최근 접속</th></tr></thead><tbody>${ADM.map(r=>`<tr><td><b>${esc(r.name)}</b></td><td>${ROLE[r.role]||r.role}</td><td><span class="tag good">필수</span></td><td class="num">${when(r.last_login)}</td></tr>`).join('')}</tbody></table></div></div>
  <div class="panel"><div class="ph"><h2>역할별 권한</h2></div><div class="tw"><table><thead><tr><th>메뉴</th><th style="text-align:center">최고</th><th style="text-align:center">운영</th><th style="text-align:center">검수</th><th style="text-align:center">CS</th></tr></thead><tbody>${[['대시보드','●●●●'],['회원 조회(가린 정보)','●●●●'],['이메일 보기·재설정 메일','●○○●'],['캐시 보정·계정 정지','●●○○'],['탈퇴 처리','●○○○']].map(r=>`<tr><td>${r[0]}</td>${[...r[1]].map(c=>`<td style="text-align:center;color:${c==='●'?'var(--good)':'var(--mute)'}">${c==='●'?'허용':'—'}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div></div>
  <div class="panel"><div class="ph"><h2>감사 로그</h2><small>누가 · 언제 · 무엇을 · 최근 50건</small></div><div class="tw"><table><thead><tr><th>시각</th><th>관리자</th><th>작업</th><th>대상</th></tr></thead><tbody>${AUD.map(r=>`<tr><td class="num">${when(r.at)}</td><td>${esc(r.admin_name||'—')}</td><td>${esc(r.action)}</td><td>${esc(r.target||'—')}</td></tr>`).join('')||'<tr><td colspan="4"><div class="empty">기록이 없어요</div></td></tr>'}</tbody></table></div></div>`;


const TITLE={game:'게임 이용',dash:'대시보드',acq:'유입 분석',users:'회원',learn:'학습 분석',cms:'콘텐츠',cs:'고객지원',reward:'보상·게임',pay:'결제·구독',sys:'관리자·권한'};
const nav=root.querySelector('#nav'), view=root.querySelector('#view'), drawer=root.querySelector('#drawer'), dp=root.querySelector('#dp'), side=root.querySelector('#side');
function countUp(root){ if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  root.querySelectorAll('.kpi .val').forEach(el=>{ const t=el.firstChild; if(!t||t.nodeType!==3) return; const raw=t.nodeValue, m=raw.match(/^([\d,]+(?:\.\d+)?)(.*)$/); if(!m) return;
    const target=parseFloat(m[1].replace(/,/g,'')), dec=(m[1].split('.')[1]||'').length, comma=m[1].includes(','), rest=m[2], t0=performance.now(), dur=900;
    const f=v=>{ let x=v.toFixed(dec); if(comma||target>=1000) x=Number(x).toLocaleString('ko-KR',{minimumFractionDigits:dec,maximumFractionDigits:dec}); return x+rest; };
    const step=now=>{ const k=Math.min(1,(now-t0)/dur), e=1-Math.pow(1-k,3); t.nodeValue=f(target*e); if(k<1) requestAnimationFrame(step); else t.nodeValue=raw; }; t.nodeValue=f(0); requestAnimationFrame(step); }); }
function render(){ const dm=root.querySelector('.demo'); if(dm) dm.hidden=LIVE.includes(cur); nav.innerHTML=navHTML(); root.querySelector('#title').textContent=TITLE[cur]; seed=7+cur.length; view.innerHTML=`<div class="grid" style="gap:14px">${V[cur]()}</div>`; countUp(view);
  root.querySelector('#range').style.visibility=['dash','acq','learn','game'].includes(cur)?'visible':'hidden';
  try{ localStorage.setItem('hg-admin-view',cur); }catch(e){} }
nav.addEventListener('click',e=>{ const b=e.target.closest('[data-v]'); if(!b) return; cur=b.dataset.v; side.classList.remove('open'); render(); window.scrollTo(0,0); });
root.querySelector('#menuBtn').onclick=()=>side.classList.add('open');
side.addEventListener('click',e=>{ if(e.target===side) side.classList.remove('open'); });
root.querySelector('#range').addEventListener('click',e=>{ const b=e.target.closest('[data-r]'); if(!b) return; range=+b.dataset.r; if(LIVE.includes(cur)) reloadSum().then(render); root.querySelectorAll('#range button').forEach(x=>x.setAttribute('aria-pressed',String(x===b))); render(); });
view.addEventListener('click',e=>{ const tr=e.target.closest('[data-m]'); if(tr){ memberDrawer(tr.dataset.m); return; }
  const q=e.target.closest('[data-rep]'); if(q){ repSel=q.dataset.rep; render(); return; }
  const pb=e.target.closest('.pills button'); if(pb&&!pb.closest('#range')){ pb.parentNode.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===pb))); } });
view.addEventListener('keydown',e=>{ if(e.key==='Enter'){ const tr=e.target.closest('[data-m]'); if(tr) memberDrawer(tr.dataset.m); } });
view.addEventListener('input',e=>{ if(e.target.id==='q'){ const s=e.target.value.trim().toLowerCase(); root.querySelector('#memRows').innerHTML=memRows(MEM.filter(m=>!s||m.email.includes(s)||m.kids.join(' ').toLowerCase().includes(s)||m.id.toLowerCase().includes(s))); }
  if(e.target.id&&e.target.id.startsWith('f_')){ const k=e.target.id.slice(2); const el=root.querySelector('#pv_'+k); if(el) el.textContent=e.target.value; } });
view.addEventListener('submit',e=>{ if(e.target.id==='cmsForm'){ e.preventDefault(); root.querySelector('#saved').hidden=false; } });
drawer.addEventListener('click',async e=>{ if(e.target.closest('[data-close]')){ drawer.hidden=true; return; }
  const box=()=>root.querySelector('#actBox');
  if(e.target.closest('#reveal')){ const b=e.target.closest('#reveal'); try{ const em=await env.reveal(DM.m.gid); root.querySelector('#mailTx').textContent=em+' '; b.outerHTML='<span class="tag warn">열람 기록됨</span>'; }catch(er){ box().innerHTML=`<p class="err">${esc(er.message)}</p>`; } return; }
  const a=e.target.closest('[data-act]');
  if(a){ const k=a.dataset.act;
    if(k==='mail'){ try{ const em=await env.reveal(DM.m.gid); await env.resetMail(em); box().innerHTML='<p class="ok">비밀번호 재설정 메일을 보냈어요. 감사 로그에 남겼어요.</p>'; }catch(er){ box().innerHTML=`<p class="err">${esc(er.message)}</p>`; } return; }
    const t={cash:['캐시 보정',`${esc(a.dataset.n||'')} 학생의 캐시를 보정해요. 늘리면 +, 줄이면 −로 적어 주세요.`,'보정하기'],ban:['계정 정지','정지하면 보호자와 자녀 모두 로그인할 수 없어요. 사유를 적어 주세요.','정지하기'],unban:['정지 해제','정지를 풀면 다시 로그인할 수 있어요. 사유를 적어 주세요.','해제하기'],del:['탈퇴 처리','탈퇴 처리하면 계정을 바로 비활성화해요. 사유를 적어 주세요.','탈퇴 처리']}[k];
    box().innerHTML=`<div class="confirm" data-k="${k}" data-sid="${a.dataset.sid||''}"><b>${t[0]}</b><span>${t[1]}</span>${k==='cash'?'<input type="number" id="cashN" placeholder="예: 50 또는 -30" aria-label="보정할 캐시">':''}<textarea aria-label="사유" placeholder="사유 (필수)"></textarea><div class="acts"><button class="btn bad" data-done>${t[2]}</button><button class="btn" data-cancel>취소</button></div></div>`; return; }
  if(e.target.closest('[data-cancel]')){ box().innerHTML=''; return; }
  if(e.target.closest('[data-done]')){ const c=root.querySelector('#actBox .confirm'), ta=c.querySelector('textarea'), k=c.dataset.k;
    if(!ta.value.trim()){ ta.placeholder='사유를 적어야 진행할 수 있어요'; ta.focus(); return; }
    try{
      if(k==='cash'){ const n=parseInt(c.querySelector('#cashN').value,10); if(!n){ c.querySelector('#cashN').focus(); return; } const left=await env.cash(c.dataset.sid,n,ta.value.trim()); box().innerHTML=`<p class="ok">캐시를 ${n>0?'+':''}${n} 보정했어요 (지금 ${fmt(left)}). 감사 로그에 남겼어요.</p>`; }
      else { await env.setStatus(DM.m.gid,k==='ban'?'suspended':k==='del'?'withdrawn':'active',ta.value.trim()); await loadMembers(); box().innerHTML='<p class="ok">처리했어요. 감사 로그에 남겼어요.</p>'; if(cur==='users') render(); }
    }catch(er){ box().innerHTML=`<p class="err">${esc(er.message)}</p>`; } } });

_on(document,'keydown',e=>{ if(e.key==='Escape'){ drawer.hidden=true; side.classList.remove('open'); mePop.hidden=true; meBtn.setAttribute('aria-expanded','false'); } });
let wasN=NARROW(); _on(window,'resize',()=>{ if(NARROW()!==wasN){ wasN=NARROW(); render(); } });
/* 로그인: Supabase Auth 이메일·비밀번호 → 관리자 역할 확인 → TOTP 2단계 인증(처음이면 인증 앱 등록) */
const loginEl=root.querySelector('#login'), shellEl=root.querySelector('#shellEl'), lf1=root.querySelector('#lf1'), lf2=root.querySelector('#lf2'), otps=[...root.querySelectorAll('#otp input')];
let ME=null;
function showLogin(){ shellEl.hidden=true; loginEl.hidden=false; lf2.hidden=true; lf1.hidden=false; }
async function enter(){
  try{ ME=await env.me(); }catch(e){ showLogin(); root.querySelector('#lErr1').textContent='관리자 확인에 실패했어요. 다시 로그인해 주세요.'; return; }
  loginEl.hidden=true; shellEl.hidden=false;
  const ini=(ME.name||'관')[0];
  root.querySelectorAll('.av').forEach(x=>x.textContent=ini);
  root.querySelector('.me b').textContent=ME.name; root.querySelector('.me small').textContent=`${ROLE[ME.role]||ME.role} · 2단계 인증`;
  root.querySelector('.pop .ph2 b').textContent=ME.name; root.querySelector('#meMail').textContent=ME.email;
  const dd=root.querySelectorAll('.pop dl.kv dd'); if(dd[0]) dd[0].textContent=ROLE[ME.role]||ME.role; root.querySelector('#meNow').textContent=when(ME.last); if(dd[3]) dd[3].textContent=when(ME.prev);
  if(dd[4]) dd[4].textContent='—';
  view.innerHTML='<div class="empty">불러오는 중…</div>';
  try{ await Promise.all([loadAll(),loadMembers(),loadSys()]); }catch(e){ view.innerHTML=`<div class="empty">데이터를 불러오지 못했어요: ${esc(e.message)}</div>`; return; }
  render(); }
async function logout(){ mePop.hidden=true; meBtn.setAttribute('aria-expanded','false'); await env.signOut(); showLogin(); root.querySelector('#lPw').value=''; root.querySelector('#lPw').focus(); }
function toStep(r){ const er=root.querySelector('#lErr1');
  if(!r.ok){ er.textContent=r.err; showLogin(); return; }
  er.textContent=''; if(r.next==='in'){ enter(); return; }
  lf1.hidden=true; lf2.hidden=false; otps.forEach(o=>o.value='');
  const q=root.querySelector('#enroll'); if(q) q.remove();
  const p=lf2.querySelector('p');
  if(r.next==='enroll'){ p.textContent='처음 들어오면 인증 앱(Google Authenticator 등)에 등록해요. QR을 찍고 앱에 나온 6자리를 넣어 주세요.';
    p.insertAdjacentHTML('afterend',`<div id="enroll" style="display:flex;gap:12px;align-items:center"><img src="${r.qr}" alt="인증 앱 등록 QR" width="132" height="132" style="background:#fff;border-radius:8px;padding:6px"><small class="note" style="word-break:break-all">QR을 못 찍으면 이 키를 앱에 직접 넣어요<br><b class="num">${esc(r.secret||'')}</b></small></div>`); }
  else p.textContent='인증 앱에 표시된 6자리 숫자를 넣어 주세요.';
  otps[0].focus(); }
lf1.addEventListener('submit',async e=>{ e.preventDefault(); const em=root.querySelector('#lEmail').value.trim(), pw=root.querySelector('#lPw').value, er=root.querySelector('#lErr1');
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){ er.textContent='이메일 주소를 확인해 주세요.'; return; }
  if(pw.length<6){ er.textContent='비밀번호를 확인해 주세요.'; return; }
  er.textContent='확인하는 중…'; toStep(await env.signIn(em,pw)); });
otps.forEach((o,i)=>{ o.addEventListener('input',()=>{ o.value=o.value.replace(/\D/g,'').slice(-1); if(o.value&&i<5) otps[i+1].focus(); if(otps.every(x=>x.value)) lf2.requestSubmit(); });
  o.addEventListener('keydown',e=>{ if(e.key==='Backspace'&&!o.value&&i>0) otps[i-1].focus(); });
  o.addEventListener('paste',e=>{ const t=(e.clipboardData.getData('text')||'').replace(/\D/g,'').slice(0,6); if(t.length){ e.preventDefault(); t.split('').forEach((c,j)=>otps[j].value=c); otps[Math.min(5,t.length)].focus(); if(t.length===6) lf2.requestSubmit(); } }); });
let verifying=false;
lf2.addEventListener('submit',async e=>{ e.preventDefault(); if(verifying) return; const code=otps.map(o=>o.value).join(''), er=root.querySelector('#lErr2'); if(code.length<6){ er.textContent='6자리를 모두 넣어 주세요.'; return; }
  verifying=true; er.textContent='확인하는 중…'; const ok=await env.verify(code); verifying=false;
  if(!ok){ er.textContent='숫자가 맞지 않아요. 인증 앱의 새 숫자를 넣어 주세요.'; otps.forEach(o=>o.value=''); otps[0].focus(); return; }
  er.textContent=''; enter(); });
root.querySelector('#lBack').onclick=async()=>{ await env.signOut(); showLogin(); };
const lf1foot=lf1.querySelector('.lfoot span'); if(lf1foot) lf1foot.textContent='2단계 인증을 써요';
const lf2foot=lf2.querySelector('.lfoot span'); if(lf2foot) lf2foot.textContent='숫자는 30초마다 바뀌어요';
lf1.querySelector('.lfoot button').onclick=async()=>{ const em=root.querySelector('#lEmail').value.trim(), er=root.querySelector('#lErr1'); if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){ er.textContent='이메일을 먼저 넣어 주세요.'; return; } await env.resetMail(em); er.textContent='비밀번호 재설정 메일을 보냈어요.'; };
/* 오른쪽 위 내 계정 */
const meBtn=root.querySelector('#meBtn'), mePop=root.querySelector('#mePop');
meBtn.addEventListener('click',e=>{ e.stopPropagation(); const o=mePop.hidden; mePop.hidden=!o; meBtn.setAttribute('aria-expanded',String(o)); });
_on(document,'click',e=>{ if(!mePop.hidden&&!e.target.closest('.mew')){ mePop.hidden=true; meBtn.setAttribute('aria-expanded','false'); } });
mePop.addEventListener('click',e=>{ const b=e.target.closest('[data-me]'); if(!b) return; const a=b.dataset.me; mePop.hidden=true; meBtn.setAttribute('aria-expanded','false');
  if(a==='out') logout(); else if(a==='sys'){ cur='sys'; render(); } else if(a==='pw'){ cur='sys'; render(); } });
const thEl=root.querySelector('#theme');
function setTheme(t){ if(t==='system') root.removeAttribute('data-theme'); else root.setAttribute('data-theme',t);
  thEl.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.t===t))); try{ localStorage.setItem('hg-admin-theme',t); }catch(e){} }
thEl.addEventListener('click',e=>{ const b=e.target.closest('[data-t]'); if(b) setTheme(b.dataset.t); });
let th0='system'; try{ th0=localStorage.getItem('hg-admin-theme')||'system'; }catch(e){} setTheme(th0);
try{ const v=localStorage.getItem('hg-admin-view'); if(v&&TITLE[v]) cur=v; }catch(e){}
env.session().then(r=>{ if(r&&r.ok&&r.next==='in') enter(); else showLogin(); });

return { destroy() { AC.abort(); root.innerHTML = ''; } };
}
