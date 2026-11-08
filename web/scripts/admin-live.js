//@@ dash
/* ---------- 대시보드 (실제 데이터 — scripts/admin-app.mjs가 시안의 예시 대시보드 대신 끼운다) ----------
   D.series: 90일 추이(활성·완료율·가입), D.sum: 선택 기간 요약(재방문·코호트·과목·학년·연속 학습) */
const LIVE=['dash','users','sys'];
let D={series:[],sum:{}};
async function loadAll(){ const rows=await env.daily(90); D.series=rows.map(r=>{ const d=new Date(r.day+'T00:00:00'); return {d,dau:r.active,done:r.active?r.done/r.active:0,sign:r.signups,kids:r.kids,solved:r.solved,correct:r.correct}; }); await reloadSum(); }
async function reloadSum(){ D.sum=await env.summary(range); }
const SUBN={math:'연산',gugu:'구구단',hanja:'한자어',eng:'영단어',kor:'국어',sci:'과학',hist:'역사',typ:'타자'};
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

//@@ users
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

//@@ drawer
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

//@@ sys
/* ---------- 관리자·권한 (실제 데이터) ---------- */
let ADM=[], AUD=[];
const ROLE={super:'최고 관리자',ops:'운영',content:'콘텐츠 검수',cs:'고객지원'};
const when=s=>{ if(!s) return '—'; const d=new Date(s); return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; };
async function loadSys(){ [ADM,AUD]=await Promise.all([env.admins(),env.audit(50)]); }
V.sys=()=>`<div class="grid c2"><div class="panel"><div class="ph"><h2>관리자 계정</h2><small>추가·역할 변경은 Supabase에서 해요</small></div><div class="tw"><table><thead><tr><th>이름</th><th>역할</th><th>2단계 인증</th><th>최근 접속</th></tr></thead><tbody>${ADM.map(r=>`<tr><td><b>${esc(r.name)}</b></td><td>${ROLE[r.role]||r.role}</td><td><span class="tag good">필수</span></td><td class="num">${when(r.last_login)}</td></tr>`).join('')}</tbody></table></div></div>
  <div class="panel"><div class="ph"><h2>역할별 권한</h2></div><div class="tw"><table><thead><tr><th>메뉴</th><th style="text-align:center">최고</th><th style="text-align:center">운영</th><th style="text-align:center">검수</th><th style="text-align:center">CS</th></tr></thead><tbody>${[['대시보드','●●●●'],['회원 조회(가린 정보)','●●●●'],['이메일 보기·재설정 메일','●○○●'],['캐시 보정·계정 정지','●●○○'],['탈퇴 처리','●○○○']].map(r=>`<tr><td>${r[0]}</td>${[...r[1]].map(c=>`<td style="text-align:center;color:${c==='●'?'var(--good)':'var(--mute)'}">${c==='●'?'허용':'—'}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div></div>
  <div class="panel"><div class="ph"><h2>감사 로그</h2><small>누가 · 언제 · 무엇을 · 최근 50건</small></div><div class="tw"><table><thead><tr><th>시각</th><th>관리자</th><th>작업</th><th>대상</th></tr></thead><tbody>${AUD.map(r=>`<tr><td class="num">${when(r.at)}</td><td>${esc(r.admin_name||'—')}</td><td>${esc(r.action)}</td><td>${esc(r.target||'—')}</td></tr>`).join('')||'<tr><td colspan="4"><div class="empty">기록이 없어요</div></td></tr>'}</tbody></table></div></div>`;

//@@ login
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
