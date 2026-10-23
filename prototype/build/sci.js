/* =========================================================
   과학하루 — 물리 · 화학 · 생명 · 지구 (초등 → 중등 → 고등)
   - 통합: 네 영역 단원을 학교급 순서로 섞어서. 영역별로도 따로 진도
   - 단원 첫 장: 개념 정리 + 핵심 원리(pr) 카드
   - 국사/세계사는 진도를 따로 저장. 홈 위쪽에서 바꿈
   - 단원 = 주제 하나(개념 정리 + 핵심 용어 10개). 새 단원은 개념 정리·용어 카드를 끝까지 넘겨야 문제가 열림
   - 문제: 설명 보고 용어 고르기 → 용어 보고 설명 고르기 → 시대 순서·연도·OX
   - 맞히면 난이도 상승, 틀리면 내림 + 3문제 뒤 다시 + 오답노트(1·3·5일)
   - 어려움 단계에서 연속 10문제 정답 → 단원 통과. 통과 단원은 3단원 뒤 → 5단원 뒤 복습
   - 틀림 상한(초등 5 · 중등 6 · 고등 7개)에 닿으면 그 단원을 처음부터
   - 학교급 끝 승급 평가 20문제, 16개 이상 통과(5개 틀리면 종료)
   ========================================================= */
const GOAL=10, SET=20, CARD_GAP=[1,3,5], REV_GAP=[3,5], EXAM_N=20, EXAM_PASS=0.8, REV_Q=4;
const CAPS={'초등':5,'중등':6,'고등':7};
const CAP=s=>CAPS[s.area]||5, EXAM_CAP=EXAM_N-Math.ceil(EXAM_N*EXAM_PASS)+1;
const WR=(p,id)=>((p.wr||{})[id]||0);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

const HD=__DATA__;
const LV=['초등','중등','고등']; let AREAS=LV;
const TRN={mix:'통합',phy:'물리',chem:'화학',bio:'생명',earth:'지구'};
let TR='mix', IT={}, ALL=[], STAGES=[], IDX={}, STOF={}, KEY='', S=null;
/* 통합 트랙은 실행할 때 만듦: 학교급마다 물리→화학→생명→지구를 한 단원씩 번갈아 (데이터 중복 없이) */
if(!HD.mix){ const A=['phy','chem','bio','earth'].filter(k=>HD[k]); const mu=[];
  [0,1,2].forEach(lv=>{ const cols=A.map(k=>HD[k].units.filter(u=>u.lv===lv)); let k=0; const mx=Math.max(0,...cols.map(c=>c.length));
    for(let i=0;i<mx;i++) cols.forEach(c=>{ if(c[i]){ k++; mu.push({...c[i],n:k}); } }); });
  HD.mix={units:mu}; }
function setupTrack(tr){
  TR=HD[tr]&&TRN[tr]?tr:'mix'; try{ localStorage.setItem('sci-track',TR); }catch(e){}
  IT={}; STAGES=[];
  const units=HD[TR].units;
  units.forEach((u,ui)=>{
    const ids=u.items.map((x,k)=>{ const id=`${TR}${ui}_${k}`; IT[id]={...x,id,ui,unit:u}; return id; });
    /* 객관식(문제 은행형): 단원마다 lv1 쉬움 2 · lv2 보통 2 · lv3 어려움 1 */
    const mids=(u.mc||[]).map((m,k)=>{ const id=`${TR}${ui}_m${k}`; IT[id]={...m,id,ui,unit:u,mc:true,t:m.q,yl:'',k:'객관식',d:m.e}; return id; });
    STAGES.push({kind:'unit',lvI:u.lv,area:LV[u.lv],g:LV[u.lv],n:u.n,title:u.title,tag:u.tag,era:u.era,sum:u.sum,pr:u.pr||[],pre:u.pre||'',name:`${LV[u.lv]} ${u.n}단원`,chars:ids,mcs:mids});
    const nx=units[ui+1]; if(!nx||nx.lv!==u.lv) STAGES.push({kind:'exam',lvI:u.lv,area:LV[u.lv],g:LV[u.lv],name:`과학 ${LV[u.lv]} 승급 평가`,chars:[]});
  });
  STAGES.forEach((s,i)=>{ s.id='s'+i; if(s.kind==='exam'){ const us=STAGES.filter(x=>x.kind==='unit'&&x.lvI===s.lvI); s.chars=us.flatMap(x=>x.chars); s.mcs=us.flatMap(x=>x.mcs||[]); } });
  IDX=Object.fromEntries(STAGES.map((s,i)=>[s.id,i]));
  STOF={}; STAGES.forEach(s=>{ if(s.kind==='unit') [...s.chars,...(s.mcs||[])].forEach(c=>STOF[c]=s.id); });
  ALL=Object.keys(IT).filter(k=>!IT[k].mc);
  KEY=`sci-${TR}-v2`;
  AREAS=LV.filter(a=>STAGES.some(s=>s.area===a));
  S=load()||seed();
}
const LV_=(id,p)=>{ const k=((p.bp||{})[id]||0); return k<3?'쉬움':k<6?'보통':'어려움'; };

/* ---------- 용어 카드 (소개 · 틀린 뒤 공통) ---------- */
/* 연표 정렬 키: 연도가 있으면 연도, '18세기'·'기원전 5세기'처럼 세기만 있으면 세기 중간값, 그 밖은 맨 뒤 */
function skey(x){ if(x.y!=null) return x.y; const m=String(x.yl).match(/(기원전\s*)?(\d+)\s*세기/); if(m){ const c=+m[2]; return m[1]?-(c-1)*100-50:(c-1)*100+50; } const m2=String(x.yl).match(/(기원전\s*)?(\d{3,4})\s*년/); if(m2) return m2[1]?-m2[2]:+m2[2]; return 1e9; }
function timeline(u,hl){ const xs=u.items.map((x,k)=>({...x,id:`${TR}${HD[TR].units.indexOf(u)}_${k}`})).sort((a,b)=>skey(a)-skey(b));
  return `<ol class="tl">${xs.map(x=>`<li class="${x.id===hl?'on':''}"><span class="yl">${esc(x.yl)}</span><b>${esc(x.t)}</b></li>`).join('')}</ol>`; }
const mcPass=x=>x.p?`<span class="mcp">${esc(x.p).replace(/\[\[(.+?)\]\]/g,'<u>$1</u>')}</span>`:'';
function infoHTML(id){
  const x=IT[id], u=x.unit, mates=u.items.filter(y=>y.t!==x.t).slice(0,9);
  if(x.mc) return `<div class="info"><div class="ihun"><span class="lk">${esc(u.title)} · 객관식 ${['','쉬움','보통','어려움'][x.lv]||''}</span><b class="mcqt">${esc(x.q)}</b>${mcPass(x)}</div>
    <div class="org"><span class="ok">정답</span><p><b>${esc(x.c[x.a])}</b></p><small class="exl">${esc(x.e)}</small></div></div>`;
  return `<div class="info">
    <div class="ihun"><span class="lk">${esc(u.title)}</span><b class="term">${esc(x.t)}</b>
      <div class="meta"><span>${x.k}</span><span>${LV[u.lv]}</span>${u.tag?`<span>${u.tag}</span>`:''}</div></div>
    <div class="org"><span class="ok">뜻 · 원리</span><p>${esc(x.d)}</p>${x.ex?`<small class="exl">예) ${esc(x.ex)}</small>`:''}</div>
    ${x.w&&x.w.length?`<div class="wl"><span class="lk">이렇게 쓰면 틀려요</span><div class="ders">${x.w.map(v=>`<span class="xw">✕ ${esc(v)}</span>`).join('')}<span class="ow">○ ${esc(x.t)}</span></div></div>`:''}
    <div class="wl"><span class="lk">같은 단원에서 함께 익힐 용어</span><div class="ders">${mates.map(y=>`<span>${esc(y.t)}</span>`).join('')}</div></div>
  </div>`;
}
function timeline(){ return ''; }

/* ---------- 문제 만들기 ----------
   dt=설명 보고 용어 · td=용어 보고 설명 · ord=시대 순서 · yr=언제? · ox=OX */
const TNAME={dt:'용어 고르기',td:'설명 고르기',ox:'OX 퀴즈',sp:'바른 표기 고르기',mc:'객관식',ord:'순서',yr:'연도'};
function mates(id,n,f,filter){ const x=IT[id], out=[], seen=new Set([f(id)]);
  const same=shuffle(ALL.filter(y=>IT[y].ui===x.ui&&y!==id)), lvSame=shuffle(ALL.filter(y=>IT[y].unit.lv===x.unit.lv&&IT[y].ui!==x.ui));
  for(const y of [...same,...lvSame]){ if(out.length>=n) break; if(filter&&!filter(y)) continue; const v=f(y); if(!seen.has(v)){ seen.add(v); out.push(y);} }
  return out; }
function makeQ(spec){
  let {ch:id,t}=spec; const x=IT[id];
  const base={ch:id,st:STOF[id]};
  if(x.mc) return {...base,t:'mc',ask:`객관식 · ${['','쉬움','보통','어려움'][x.lv]||''}`,q:`<span class="dq">${esc(x.q)}</span>${mcPass(x)}`,qc:'txt',hint:'',choices:shuffle(x.c),ans:x.c[x.a],long:x.c.some(v=>v.length>9)};
  if(t==='sp'&&!(x.w&&x.w.length)) t='dt';
  if(t==='sp') return {...base,t,ask:'바르게 쓴 것은?',q:`<span class="dq">${esc(x.d)}</span>`,qc:'txt',hint:'',choices:shuffle([x.t,...x.w.slice(0,3)]),ans:x.t,long:x.t.length>12};
  if(t==='ord'||t==='yr') t='dt';
  if(t==='ord'){ if(x.y==null) t='dt'; else {
      const early=Math.random()<.5;
      let others=mates(id,3,y=>IT[y].y,y=>IT[y].y!=null&&(early?IT[y].y>x.y:IT[y].y<x.y));
      if(others.length<3){ others=mates(id,3,y=>IT[y].y,y=>IT[y].y!=null&&(!early?IT[y].y>x.y:IT[y].y<x.y)); if(others.length<3) t='dt'; else return {...base,t,ask:'가장 나중에 일어난(등장한) 것은?',q:'<span class="qsub"></span>',qc:'txt',hint:'',choices:shuffle([x.t,...others.map(y=>IT[y].t)]),ans:x.t,long:false,early:false}; }
      else return {...base,t,ask:early?'가장 먼저 일어난(등장한) 것은?':'가장 나중에 일어난(등장한) 것은?',q:'<span class="qsub"></span>',qc:'txt',hint:'',choices:shuffle([x.t,...others.map(y=>IT[y].t)]),ans:x.t,long:false}; } }
  if(t==='yr'){ if(x.y==null) t='td'; else { const others=mates(id,3,y=>IT[y].yl,y=>IT[y].y!=null&&Math.abs(IT[y].y-x.y)>=5);
      if(others.length<3) t='td'; else return {...base,t,ask:'언제의 일일까요?',q:esc(x.t),qc:'term',hint:`<span class="hint">${esc(x.d)}</span>`,choices:shuffle([x.yl,...others.map(y=>IT[y].yl)]),ans:x.yl,long:false}; } }
  if(t==='ox'){ const trueQ=Math.random()<.5, o=trueQ?null:mates(id,1,y=>IT[y].d,y=>IT[y].ui===x.ui&&!IT[y].d.includes(x.t))[0];
    const d=o?IT[o].d:x.d; return {...base,t,ask:'설명이 맞으면 O, 틀리면 X',q:`<span class="oxq"><b>${esc(x.t)}</b> — ${esc(d)}</span>`,qc:'txt',hint:'',choices:['O','X'],ans:o?'X':'O',long:false,ox:true}; }
  if(t==='td') return {...base,t,ask:'이 용어에 맞는 설명은?',q:esc(x.t),qc:'term',hint:`<span class="hint">${esc(x.yl)}</span>`,choices:shuffle([x.d,...mates(id,3,y=>IT[y].d,y=>!IT[y].d.includes(x.t)).map(y=>IT[y].d)]),ans:x.d,long:true};
  return {...base,t:'dt',ask:'설명에 알맞은 것은?',q:`<span class="dq">${esc(x.d)}</span>`,qc:'txt',hint:`<span class="hint">${esc(x.unit.title)}</span>`,choices:shuffle([x.t,...mates(id,3,y=>IT[y].t,y=>!x.d.includes(IT[y].t)&&!IT[y].d.includes(x.t)).map(y=>IT[y].t)]),ans:x.t,long:false};
}

/* ---------- 날짜 · 진도 ---------- */
const REAL=Math.floor((Date.now()+9*3600e3)/864e5);
function load(){ try{ return JSON.parse(localStorage.getItem(KEY)); }catch(e){ return null; } }
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(S)); }catch(e){} }
const today=()=>REAL+S.offset;
const DOW=['일','월','화','수','목','금','토'];
function dlabel(d){ const t=new Date(d*864e5); return `${t.getUTCMonth()+1}/${t.getUTCDate()}(${DOW[t.getUTCDay()]})`; }
function rel(d){ const k=d-today(); return k<=0?(k<0?`${-k}일 밀림`:'오늘'):k===1?'내일':`${k}일 뒤`; }
function revText(ps,p){ if(ps.exam) return `통과 · ${ps.score||100}점`; if(ps.box>=2) return '완성 · 두 번 복습 끝';
  const k=ps.due-p.np; return k<=0?'지금 복습할 차례':`${k}단원 뒤 ${ps.box+1}차 복습`; }

/* ---------- 예시 데이터 ---------- */
function seed(){
  const t=REAL; let rs=TR==='ko'?20261020:20261021; const rnd=()=>{rs=(rs*16807)%2147483647;return rs/2147483647;}; const ri=(a,b)=>a+Math.floor(rnd()*(b-a+1));
  const mk=(id,cur,name,age,ncards,skip,days)=>{
    cur=Math.min(cur,STAGES.length-1);
    const passed={}, read={}, sst={}, stat={};
    STAGES.slice(0,cur).forEach((s,i)=>{ read[s.id]=true; const at=i+1;
      if(s.kind==='exam'){ passed[s.id]={exam:true,box:2,score:ri(80,100)}; return; }
      let box=0,due=at+REV_GAP[0]; if(cur>due){box=1;due=due+REV_GAP[1];} if(cur>due){box=2;}
      passed[s.id]={box,due}; sst[s.id]=[ri(70,95),ri(75,100),ri(80,100)];
      const ar=s.area, n=ri(20,40); stat[ar]=stat[ar]||{n:0,c:0}; stat[ar].n+=n; stat[ar].c+=Math.round(n*(0.8+rnd()*0.17)); });
    const hist={};
    for(let d=0;d<days;d++){ if(skip.includes(d%7)&&rnd()<.8) continue; const n=ri(20,26); hist[t-days+d]={n,c:Math.round(n*(0.72+rnd()*0.22)),ms:n*ri(10,20)*1000}; }
    const prev=STAGES.slice(0,cur).filter(s=>s.kind==='unit');
    const cards=prev.length?Array.from({length:ncards},(_,k)=>{ const s=prev[prev.length-1-(k%Math.min(prev.length,4))]; const h=s.chars[(k*3)%s.chars.length]; return {id:h+k,ch:h,t:pick(['dt','td']),st:s.id,box:k%3,due:t+(k%4)-1,wrong:1+(k%3)}; }):[];
    return {id,name,age,stage:cur,np:cur,streak:0,grad:ncards*2,read,passed,sst,stat,hist,cards,bp:{}};
  };
  return {offset:0,active:'minwang',profiles:{
    minwang:mk('minwang',6,'민왕','초5',5,[2,5],21),
    seoyun:mk('seoyun',2,'서윤','초3',3,[1,4],10),
    hajun:mk('hajun',0,'하준','초1',0,[0,1,2,3,4,5,6],0)
  }};
}
const P=()=>S.profiles[S.active];
const avg=id=>{ const a=P().sst[id]; return a&&a.length ? (a.reduce((x,y)=>x+y,0)/a.length).toFixed(1) : '0.0'; };
const curSt=p=>STAGES[p.stage];

/* ---------- 세트 구성 ---------- */
function dueCards(p){ return p.cards.filter(c=>c.due<=today()&&IT[c.ch]).sort((a,b)=>(a.due-b.due)||(b.wrong-a.wrong)); }
function dueStages(p){ return Object.entries(p.passed).filter(([,v])=>!v.exam&&v.box<2&&v.due<=p.np).sort((a,b)=>a[1].due-b[1].due).map(([id])=>id); }
function plan(p){ const cards=dueCards(p).slice(0,8), rv=dueStages(p).slice(0,3), exam=curSt(p).kind==='exam';
  return {cards,rv,exam,n:exam?EXAM_N:Math.max(4,SET-cards.length-rv.length*REV_Q),late:p.cards.filter(c=>c.due<today()).length}; }
const revItems=ids=>ids.flatMap(id=>Array.from({length:REV_Q},()=>({src:'review',st:id})));
const progItems=(p,n)=> curSt(p).kind==='exam'?Array.from({length:EXAM_N},()=>({src:'exam',st:curSt(p).id})):Array.from({length:n},()=>({src:'new'}));
function buildQueue(p,mode,arg){
  if(mode==='today'){ const pl=plan(p); return [...pl.cards.map(c=>({src:'card',card:c})),...revItems(pl.rv),...progItems(p,pl.n)]; }
  if(mode==='cards') return [...dueCards(p),...p.cards.filter(c=>c.due>today()&&IT[c.ch])].slice(0,15).map(c=>({src:'card',card:c}));
  if(mode==='new') return [...revItems(dueStages(p).slice(0,3)),...progItems(p,10)];
  if(mode==='stage') return Array.from({length:10},()=>({src:'review',st:arg,free:true}));
}
function pickChar(s,g){ const c=s.chars.filter(x=>!g.recent.includes(x)); const h=pick(c.length?c:s.chars); g.recent=[h,...g.recent].slice(0,Math.min(4,s.chars.length-1)); return h; }
function resolve(it,p,g){
  if(it.src==='card') return {...makeQ({ch:it.card.ch,t:it.card.t}),card:it.card};
  if(it.src==='retry') return it.qq;
  if(it.src==='exam'){ const s=STAGES[IDX[it.st]]; g.pool=g.pool&&g.pool.length?g.pool:shuffle([...s.chars,...(s.mcs||[])]); const h=g.pool.pop();
    return {...makeQ({ch:h,t:IT[h].mc?'mc':IT[h].w?pick(['sp','sp','dt']):pick(['dt','td','dt','ox'])}),exam:s.id}; }
  const s=it.src==='new'?curSt(p):STAGES[IDX[it.st]], d=it.src==='new'?((p.bp||{})[s.id]||0):7;
  const mcOf=(lvs,prob)=>{ const ms=(s.mcs||[]).filter(m=>lvs.includes(IT[m].lv)&&!g.recent.includes(m)); if(!ms.length||Math.random()>=prob) return null; const m=pick(ms); g.recent=[m,...g.recent].slice(0,6); return m; };
  const m=it.src==='new'?(d<3?null:d<6?mcOf([1],.35):mcOf([2,3,1],.55)):mcOf([1,2,3],.4);
  if(m) return makeQ({ch:m,t:'mc'});
  const h=pickChar(s,g);
  const sp=!!IT[h].w;
  const t=it.src==='new'?(d<3?(sp?'sp':'dt'):d<6?(sp?pick(['sp','dt']):'td'):pick(sp?['sp','ox','dt']:['ox','dt','td','td'])):pick(sp?['sp','dt']:['dt','td','ox']);
  return makeQ({ch:h,t});
}
function addCard(p,q){
  const ex=p.cards.find(c=>c.ch===q.ch&&c.t===q.t); if(ex){ex.box=0;ex.due=today()+1;ex.wrong++;return;}
  p.cards.push({id:Math.random().toString(36).slice(2,8),ch:q.ch,t:q.t,st:q.st,box:0,due:today()+1,wrong:1});
}

/* ---------- 틀 ---------- */
const bar=document.getElementById('bar'), screen=document.getElementById('screen'), tabs=document.getElementById('tabs');
let tab='home', G=null, areaF=null;
const LI=(n,c)=>`<i data-lucide="${n}"${c?` class="${c}"`:''}></i>`;
const IC={list:LI('list-checks'),clock:LI('clock'),check:LI('circle-check-big')};
function mmS(ms){ const m=Math.round((ms||0)/60000); return m<60?`${m}분`:`${Math.floor(m/60)}시간 ${m%60}분`; }
function ring(pct,big,sub,col){ const r=52,C=2*Math.PI*r,d=Math.max(0,Math.min(1,pct))*C;
  return `<svg viewBox="0 0 140 140" class="ring" role="img" aria-label="${big} ${sub}"><circle cx="70" cy="70" r="${r}" fill="none" stroke="var(--hi)" stroke-width="12"/><circle cx="70" cy="70" r="${r}" fill="none" stroke="${col||'var(--y)'}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${d} ${C}" transform="rotate(-90 70 70)"/><text x="70" y="72" text-anchor="middle" font-size="30" font-weight="900" fill="var(--k)">${big}</text><text x="70" y="94" text-anchor="middle" font-size="11.5" fill="var(--sub)">${sub}</text></svg>`; }
const Q_ICON='<span class="pillq">개념</span>';
function setBar(title,{back,help}={}){
  const p=P();
  bar.innerHTML=`${back?`<button class="bb" id="bBack" aria-label="뒤로">${LI('arrow-left')}</button>`
    :`<button class="bb who" id="bWho" aria-label="학생 바꾸기">${LI('user-round')}${p.name}<small>${p.age}</small>${LI('chevrons-up-down','sm')}</button>`}
    <h1>${title}</h1>${help?`<button class="bb" id="bHelp" aria-label="단원 개념 보기">${LI('circle-help')}</button>`:'<span class="bb"></span>'}`;
  if(back) bar.querySelector('#bBack').onclick=back;
  else bar.querySelector('#bWho').onclick=()=>{ const ids=Object.keys(S.profiles); S.active=ids[(ids.indexOf(S.active)+1)%ids.length]; areaF=null; save(); render(); };
  if(help) bar.querySelector('#bHelp').onclick=help;
}
function showTabs(on){
  tabs.hidden=!on;
  if(!on) return;
  tabs.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.tab===tab));
  const n=dueCards(P()).length, b=tabs.querySelector('[data-tab="cards"]');
  b.querySelector('.dot')?.remove(); if(n) b.insertAdjacentHTML('beforeend',`<span class="dot">${n}</span>`);
}
function setTab(t){ tab=t; G=null; document.onkeydown=null; render(); screen.scrollTop=0; }
function render(){ showTabs(true); ({home:renderHome,cards:renderCards,report:renderReport})[tab](); }
const unitTitle=s=> s.kind==='exam'?s.name:`${s.n}단원 ${TR==='mix'&&s.tag?`<span class="corebadge">${s.tag}</span>`:''}${esc(s.title)}`;

/* ---------- 역사 (홈) ---------- */
function renderHome(){
  const p=P(), pl=plan(p), total=pl.cards.length+pl.rv.length*REV_Q+pl.n, done=Math.min((p.hist[today()]||{}).n||0,total);
  const cur=curSt(p); if(!areaF) areaF=cur.area;
  setBar(TRN[TR]);
  const list=STAGES.map((s,i)=>({...s,i})).filter(s=>s.area===areaF);
  const learned=STAGES.slice(0,p.stage).filter(s=>s.kind==='unit').length, totalU=STAGES.filter(s=>s.kind==='unit').length;
  const due=dueStages(p);
  const path=AREAS.map(a=>{ const ss=STAGES.filter(s=>s.area===a), all=ss.length>0&&ss.every(s=>p.passed[s.id]), now=cur.area===a; return `<span class="${all?'done':now?'now':''}">${a}</span>`; }).join('<i></i>');
  screen.innerHTML=`
    <div class="trk tl5" role="tablist" aria-label="과학 영역">${Object.entries(TRN).map(([k,v])=>`<button role="tab" data-tr="${k}" aria-selected="${k===TR}">${v}</button>`).join('')}</div>
    <section class="sec">
      <div class="hrow"><span class="badge">TODAY</span><span class="sub">${dlabel(today())} · ${p.name}의 ${TRN[TR]} 학습</span></div>
      <div class="paycard">
        <div class="pc-top"><span class="pc-logo">${LI('book-open')}</span><b>오늘 학습</b>${pl.late?`<span class="latepill">밀린 오답 ${pl.late}건</span>`:''}</div>
        <div class="pc-amt">${done}<small> / ${total}문제</small></div>
        <p class="mixline">오답 다시 <b>${pl.cards.length}</b> · 단원 복습 <b>${pl.rv.length*REV_Q}</b> · ${pl.exam?'승급 평가':'새 진도'} <b>${pl.n}</b></p>
        <div class="pc-btns"><button class="gbtn" id="goCards">오답만</button><button class="gbtn" id="goNew">${pl.exam?'평가만':'진도만'}</button><button class="kbtn" id="go">${LI('play')}${done?'이어서':'시작'}</button></div>
      </div>
      <div class="shortcuts">
        <button data-sc="cards"><span>${LI('notebook-pen')}</span>오답노트</button>
        <button data-sc="concept"><span>${LI('book-open')}</span>개념 정리</button>
        <button data-sc="report"><span>${LI('chart-pie')}</span>학습결과</button>
        <button data-sc="who"><span>${LI('users-round')}</span>학생 바꾸기</button>
      </div>
    </section>
    <section class="sec">
      <h3 class="sh">나의 학습 길 <small>${TRN[TR]} ${learned}/${totalU}단원</small></h3>
      <div class="path">${path}</div>
      <div class="nowrow">
        <span class="lic s-now">${LI(cur.kind==='exam'?'bookmark':'pencil')}</span>
        <div class="nr-body"><b>${cur.kind==='exam'?cur.name:`${cur.name} ${esc(cur.title)}`}</b>${cur.kind!=='exam'?`<span class="pv">${esc(cur.era)}</span>`:''}
          <span class="streak">${cur.kind==='exam'?`<em>${EXAM_N}문제 중 ${Math.ceil(EXAM_N*EXAM_PASS)}개 이상 맞히면 다음 학교급 · ${EXAM_CAP}개 틀리면 종료</em>`:p.read[cur.id]?Array.from({length:GOAL},(_,i)=>`<i class="${i<p.streak?'on':''}"></i>`).join('')+`<em>연속 ${p.streak}/${GOAL} · 틀림 ${WR(p,cur.id)}/${CAP(cur)}</em>`:`<em>개념 정리를 먼저 봐요 · ${CAP(cur)}개 틀리면 처음부터</em>`}</span></div>
        ${cur.kind!=='exam'?`<button class="qbtn" data-q="${cur.id}" aria-label="${cur.name} 개념">${Q_ICON}</button>`:''}
      </div>
      ${due.length?`<p class="duebox">${LI('repeat')}<span><b>복습할 단원 ${due.length}개</b> — ${due.map(id=>STAGES[IDX[id]].name).join(', ')}. 새 진도보다 먼저 나와요.</span></p>`:''}
    </section>
    <section class="sec flush">
      <h3 class="sh pad16">단원 목록 <small>${TRN[TR]} · 초등 → 중등 → 고등</small></h3>
    <div class="areas">${AREAS.map(a=>{const ss=STAGES.filter(s=>s.area===a);const n=ss.filter(s=>p.passed[s.id]).length;return `<button class="chip ${a===areaF?'on':''}" data-af="${a}">${a} <small>${n}/${ss.length}</small></button>`;}).join('')}</div>
    <ul class="units">${list.map(s=>{
      const ps=p.passed[s.id], now=s.i===p.stage, lock=!ps&&!now, dueNow=ps&&!ps.exam&&ps.box<2&&ps.due<=p.np;
      const sub=ps?(s.kind==='exam'?revText(ps,p):`최근 평균 ${avg(s.id)} · ${revText(ps,p)}`):now?(s.kind==='exam'?`${EXAM_N}문제 · ${Math.round(EXAM_PASS*100)}% 이상 통과`:`난이도 ${LV_(s.id,p)} · 연속 ${p.streak}/${GOAL}`):s.kind==='exam'?`${s.chars.length}개 용어에서 ${EXAM_N}문제`:esc(s.era);
      const li=ps?(dueNow?`<span class="lic s-due">${LI('repeat')}</span>`:`<span class="lic s-ok">${LI('check')}</span>`):now?`<span class="lic s-now">${LI(s.kind==='exam'?'bookmark':'pencil')}</span>`:`<span class="lic s-lk">${LI(s.kind==='exam'?'bookmark':'lock')}</span>`;
      return `<li class="${now?'cur':''} ${lock?'lock':''} ${s.kind==='exam'?'exam':''}">${li}<button class="unit" data-st="${s.id}" ${lock?'disabled':''}><b>${unitTitle(s)}</b><small>${sub}</small></button>${s.kind!=='exam'?`<button class="qbtn" data-q="${s.id}" aria-label="${s.name} 개념">${Q_ICON}</button>`:''}</li>`;}).join('')}</ul>
    </section>
    <p class="note">섞어서(추천)는 학교급마다 어휘 단원과 수업 단원(맞춤법·문법·문학)이 번갈아 나오고, 쉬운 어휘부터 시작해요. 어휘·수업만 따로 공부할 수도 있어요(갈래마다 진도 따로). 단원 안에서는 용어 고르기 → 뜻 고르기·쉬운 객관식 → 시험형 객관식 순으로 올라가요. 한 단원에서 정해진 개수(초등 5 · 중등 6 · 고등 7개)를 틀리면 그 단원을 처음부터 다시 해요. 통과한 단원은 3단원 뒤, 5단원 뒤에 다시 복습해요. 잠긴 단원도 '개념'으로 미리 볼 수 있어요.</p>`;
  screen.querySelectorAll('[data-tr]').forEach(b=>b.onclick=()=>{ if(b.dataset.tr===TR) return; setupTrack(b.dataset.tr); areaF=null; render(); screen.scrollTop=0; });
  screen.querySelector('#go').onclick=()=>start('today','오늘 학습');
  screen.querySelector('#goCards').onclick=()=>{ if(P().cards.length) start('cards','오답 다시'); };
  screen.querySelector('#goNew').onclick=()=>start('new',curSt(P()).name);
  screen.querySelectorAll('[data-sc]').forEach(b=>b.onclick=()=>{ const k=b.dataset.sc;
    if(k==='cards'||k==='report') setTab(k);
    else if(k==='concept'){ const c=curSt(P()); openConcept(c.kind==='exam'?STAGES[P().stage-1].id:c.id,()=>render()); }
    else document.getElementById('bWho').click(); });
  screen.querySelectorAll('[data-af]').forEach(b=>b.onclick=()=>{areaF=b.dataset.af;renderHome();});
  screen.querySelectorAll('.unit:not(:disabled)').forEach(b=>b.onclick=()=>{
    const id=b.dataset.st, s=STAGES[IDX[id]];
    if(IDX[id]===P().stage) start('new',s.name); else if(s.kind==='exam') openConcept(id,()=>render()); else start('stage',s.name+' 복습',id);
  });
  screen.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>openConcept(b.dataset.q,()=>render()));
}
function openConcept(id,back,at){
  const p=P(), i=IDX[id], s=STAGES[i], unlocked=(p.passed[id]||i===p.stage)&&s.kind!=='exam';
  concept(id,false,back, unlocked?()=>{ if(i===p.stage) start('new',s.name); else start('stage',s.name+' 복습',id); }:null,at);
}

/* ---------- 오답노트 ---------- */
const cardLine=c=>IT[c.ch].mc?`${esc(IT[c.ch].q.length>28?IT[c.ch].q.slice(0,28)+'…':IT[c.ch].q)} <span class="ansv">${esc(IT[c.ch].c[IT[c.ch].a])}</span>`:`${esc(IT[c.ch].t)} <span class="ansv">${esc(IT[c.ch].yl)}</span>`;
function renderCards(){
  const p=P(), t=today();
  setBar(`${TRN[TR]} 오답노트`);
  const cs=p.cards.filter(c=>IT[c.ch]);
  const cal=Array.from({length:7},(_,i)=>{const d=t+i;const n=cs.filter(c=>i===0?c.due<=d:c.due===d).length;return `<div class="${i===0&&n?'t':''}"><span>${i===0?'오늘':DOW[new Date(d*864e5).getUTCDay()]}</span><b>${n}</b></div>`;}).join('');
  const sorted=[...cs].sort((a,b)=>(a.due-b.due)||(b.wrong-a.wrong));
  screen.innerHTML=`
    <section class="card"><div class="todaycard">
      <h2>오늘 다시 풀 오답 <small>틀리면 1일 → 3일 → 5일 뒤</small></h2>
      <div class="cols"><div><small>오늘</small><b class="${dueCards(p).length?'red':''}">${dueCards(p).length}건</b></div><div><small>전체 / 졸업</small><b>${cs.length} / ${p.grad}</b></div></div>
      <button class="startbtn" id="go" ${cs.length?'':'disabled'}>${LI('rotate-ccw')}오답만 풀기</button></div></section>
    <div class="box"><h3>다시 나오는 날</h3><div class="cal">${cal}</div><p class="note">세 번 연속 맞히면 졸업, 중간에 틀리면 1일로 돌아가요.</p></div>
    <ul class="units">${sorted.length?sorted.map(c=>`<li><button class="unit" data-ch="${c.ch}" data-st="${c.st}"><b class="mq">${cardLine(c)}</b>
      <small><span class="x">✕${c.wrong}</span> · ${TNAME[c.t]} · ${STAGES[IDX[c.st]].name} · <span class="${c.due<=t?'x':''}">${rel(c.due)}</span> · 졸업까지 ${3-c.box}번</small></button>
      <button class="qbtn" data-ch="${c.ch}" data-st="${c.st}" aria-label="개념">${Q_ICON}</button></li>`).join(''):'<li><div class="unit static"><b>오답이 없어요</b><small>전부 졸업했어요</small></div></li>'}</ul>`;
  screen.querySelector('#go').onclick=()=>{ if(cs.length) start('cards','오답 다시'); };
  screen.querySelectorAll('[data-ch]').forEach(b=>b.onclick=()=>openConcept(b.dataset.st,()=>render(),b.dataset.ch));
}

/* ---------- 리포트 ---------- */
let rmode='day', rshift=0;
function renderReport(){
  const p=P(), t=today();
  setBar(`${TRN[TR]} 학습결과`);
  const span=rmode==='day'?1:rmode==='week'?7:30;
  const endD=t-rshift*span, days=Array.from({length:span},(_,i)=>endD-span+1+i);
  const hs=days.map(d=>p.hist[d]||{n:0,c:0,ms:0});
  const tot=hs.reduce((a,h)=>({n:a.n+h.n,c:a.c+h.c,ms:a.ms+(h.ms||0)}),{n:0,c:0,ms:0});
  const att=hs.filter(h=>h.n).length, rate=tot.n?Math.round(tot.c/tot.n*100):0;
  const label=rmode==='day'?dlabel(endD):`${dlabel(days[0])} ~ ${dlabel(endD)}`;
  const goalN=SET*span, goalMs=span*10*60000;
  const by={}; p.cards.filter(c=>IT[c.ch]).forEach(c=>{by[c.ch]=(by[c.ch]||0)+c.wrong;});
  const worst=Object.entries(by).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const mx=Math.max(SET,...hs.map(h=>h.n));
  const shown=AREAS.slice(0,AREAS.indexOf(curSt(p).area)+1);
  const units=STAGES.filter(s=>s.kind!=='exam'), pu=units.filter(s=>p.passed[s.id]);
  const done2=pu.filter(s=>p.passed[s.id].box>=2).length, wait=pu.length-done2;
  screen.innerHTML=`
    <div class="seg">${[['day','일별 보고서'],['week','주간 보고서'],['month','월간 보고서']].map(([k,l])=>`<button data-rm="${k}" class="${k===rmode?'on':''}">${l}</button>`).join('')}</div>
    <div class="datenav"><button id="prevD" aria-label="이전">${LI('chevron-left')}</button><span>${label}</span><button id="nextD" aria-label="다음" ${rshift===0?'disabled':''}>${LI('chevron-right')}</button></div>
    <section class="card center">
      ${ring(tot.n/goalN, tot.n+'개','총 문제 개수')}
      <div class="legend"><span><i style="background:var(--y)"></i>정답 ${tot.c}개</span><span><i style="background:var(--red)"></i>오답 ${tot.n-tot.c}개</span><span>정답률 ${rate}%</span></div>
    </section>
    <section class="card center">
      ${ring(tot.ms/goalMs, mmS(tot.ms),'총 학습 시간','var(--k)')}
      <p class="note">${rmode==='day'?'하루 목표 10분':`${span}일 중 ${att}일 출석 · 하루 목표 10분`}</p>
    </section>
    ${rmode!=='day'?`<section class="card"><h3>하루 푼 문제</h3>
      <div class="week ${rmode}">${hs.map((h,i)=>`<div><small>${rmode==='week'&&h.n?h.n:''}</small><i class="${days[i]===t?'td':''}" style="height:${h.n/mx*100}%"></i></div>`).join('')}</div>
      ${rmode==='week'?`<div class="days">${days.map(d=>`<span>${d===t?'오늘':DOW[new Date(d*864e5).getUTCDay()]}</span>`).join('')}</div>`:''}</section>`:''}
    <section class="card"><h3>단원 복습 현황 <small class="note">3단원 뒤 → 5단원 뒤</small></h3>
      <div class="cols"><div><small>완성 (복습 2번 끝)</small><b>${done2}</b></div><div><small>복습 남음 / 지금 차례</small><b>${wait} / <span class="${dueStages(p).length?'x':''}">${dueStages(p).length}</span></b></div></div></section>
    <section class="card"><h3>학교급별 정답률 <small class="note">누적</small></h3>${shown.map(a=>{const s=p.stat[a]||{n:0,c:0};const r=s.n?Math.round(s.c/s.n*100):0;return `<div class="hbar"><span>${a}</span><div class="tr"><i style="width:${r}%"></i></div><span class="v">${s.n?r+'%':'—'}</span></div>`;}).join('')}</section>
    <section class="card"><h3>많이 틀리는 용어</h3><div class="list">${worst.length?worst.map(([h,w])=>`<div><span><b>${esc(IT[h].t)}</b> ${esc(IT[h].yl)}</span><span class="x">✕${w}</span></div>`).join(''):'<p class="note">틀린 문제가 없어요.</p>'}</div></section>
    <button class="share" id="share">${LI('message-circle')}카카오톡으로 보고서 보내기</button>
    <p class="note" id="shareNote">공유는 출시 버전에서 동작해요. 지금은 보낼 문구를 복사해요.</p>
    <section class="card"><h3>시연 도구</h3><p class="note">하루를 넘기면 1·3·5일 뒤 오답이 다시 나와요. 단원 복습은 진도(3단원·5단원 뒤)로 나와요.</p>
      <div class="btns"><button class="btn k" id="nextDay">${LI('calendar-plus')}하루 넘기기</button><button class="btn" id="reset">${LI('rotate-ccw')}예시로 되돌리기</button></div></section>`;
  screen.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{rmode=b.dataset.rm;rshift=0;renderReport();});
  screen.querySelector('#prevD').onclick=()=>{rshift++;renderReport();};
  screen.querySelector('#nextD').onclick=()=>{if(rshift>0){rshift--;renderReport();}};
  screen.querySelector('#share').onclick=async()=>{
    const txt=`[과학하루] ${p.name} ${TRN[TR]} ${label}: ${tot.n}문제, 정답률 ${rate}%, 학습 ${mmS(tot.ms)}. 지금: ${curSt(p).name}. 남은 오답 ${p.cards.length}건.`;
    const n=screen.querySelector('#shareNote'); try{await navigator.clipboard.writeText(txt);n.textContent='복사했어요: '+txt;}catch(e){n.textContent=txt;}
  };
  screen.querySelector('#nextDay').onclick=()=>{S.offset++;save();render();};
  screen.querySelector('#reset').onclick=e=>{ if(e.currentTarget.dataset.c){S=seed();areaF=null;save();render();} else {e.currentTarget.dataset.c=1;e.currentTarget.textContent='한 번 더 누르면 초기화';} };
}

/* ---------- 단원 개념 정리 ---------- */
function concept(id,gate,onClose,onPractice,at){
  showTabs(false);
  const s=STAGES[IDX[id]], p=P();
  if(s.kind==='exam'){
    setBar(s.name,{back:()=>{save();onClose&&onClose();}});
    const ps=p.passed[id], now=IDX[id]===p.stage;
    screen.innerHTML=`<div class="cx"><div class="lyric"><span class="lk">${TRN[TR]} ${s.area} · 용어 ${s.chars.length}개</span><h2>${s.name}</h2>
      <p>${TRN[TR]} ${s.area} 단원의 용어 ${s.chars.length}개와 객관식 ${(s.mcs||[]).length}문제 가운데 ${EXAM_N}문제가 무작위로 나와요.</p>
      <p class="soft">${Math.ceil(EXAM_N*EXAM_PASS)}개 이상 맞히면 다음 학교급이 열려요. ${EXAM_CAP}개를 틀리면 평가가 끝나고, 틀린 용어를 오답노트로 복습한 뒤 다시 도전해요.</p>
      ${ps?`<p class="eqa">통과 · ${ps.score}점</p>`:''}</div>
      <div class="btns sp"><button class="btn" id="cl">닫기</button>${now?`<button class="btn y" id="go">${LI('play')}평가 시작</button>`:''}</div></div>`;
    screen.querySelector('#cl').onclick=()=>onClose&&onClose();
    const g=screen.querySelector('#go'); if(g) g.onclick=()=>start('new',s.name);
    return;
  }
  const n=s.chars.length, total=n+2, u=HD[TR].units[IT[s.chars[0]].ui];
  let i=at?Math.max(0,s.chars.indexOf(at)+1):0, seen=i;
  const draw=()=>{
    seen=Math.max(seen,i);
    setBar(s.name,{back:()=>{ if(gate&&G){G=null;document.onkeydown=null;} save(); onClose&&onClose(); }});
    let body='';
    if(i===0) body=`<span class="lk">${TRN[TR]} ${s.g} · ${s.n}단원 · ${esc(s.era)}</span><h2>${esc(s.title)}</h2>${s.pre?`<p class="pre">${LI('link','inl')}먼저 알면 좋아요: ${esc(s.pre)}</p>`:''}<p class="sum">${esc(s.sum)}</p>
      ${(s.pr||[]).length?`<div class="prs"><span class="lk">핵심 원리</span>${s.pr.map((x,k)=>`<div class="pr"><b><em>${k+1}</em>${esc(x.h)}</b><p>${esc(x.b)}</p></div>`).join('')}</div>`:''}
      <div class="wl"><span class="lk">이번 단원 용어</span><div class="ders">${u.items.map(y=>`<span>${esc(y.t)}</span>`).join('')}</div></div>`;
    else if(i<=n) body=`<span class="lk">${i} / ${n}</span>${infoHTML(s.chars[i-1])}`;
    else body=`<span class="lk">기억할 점</span><h2>원리로 이해하고 예로 기억해요</h2><p>용어만 외우기보다 '왜 그런지' 원리를 먼저 이해하고, 생활 속 예나 실험 장면과 연결하면 오래 기억돼요. 비슷한 개념은 짝을 지어 차이를 비교해 보세요.</p><p class="soft">${gate?`이 단원은 ${CAP(s)}개를 틀리면 처음부터 다시 해요. 이제 문제를 풀어요. 설명 보고 용어 고르기부터, 잘 맞히면 용어 보고 설명 고르기와 쉬운 객관식 → 시험형 객관식(보통·어려움)과 OX로 올라가요. 어려운 단계에서 연속 ${GOAL}문제를 맞히면 다음 단원이에요.`:'통과한 단원은 3단원 뒤, 5단원 뒤에 다시 복습해요. 틀린 문제는 오답노트에서 1·3·5일 뒤 다시 나와요.'}</p>`;
    const last=i===total-1;
    screen.innerHTML=`<div class="cx">
      <div class="steps" id="stp">${[['lightbulb','개념 정리'],...s.chars.map(c=>[null,IT[c].t]),['bookmark','기억']].map(([ic,t],k)=>`<span data-j="${k}" class="${k===i?'on':k<i?'done':''}">${ic?LI(k<i?'check':ic):''}${esc(t)}</span>`).join('')}</div>
      <div class="lyric" id="ly">${body}</div>
      <div class="btns sp">
        <button class="btn" id="prev" ${i===0?'disabled':''}>${LI('chevron-left')}이전</button>
        ${last?(gate?`<button class="btn y" id="done">${LI('circle-check-big')}다 봤어요 · 문제 풀기</button>`:`${onPractice?`<button class="btn y" id="prac">${LI('play')}이 단원 문제 풀기</button>`:''}<button class="btn k" id="done">닫기</button>`)
              :`<button class="btn k" id="next">다음${LI('chevron-right')}</button>`}
      </div>
      ${gate?`<p class="gate">${last?'다 보면 문제가 열려요':`처음 들어가는 단원이에요. 끝까지 넘겨야 문제가 열려요 (${i+1}/${total})`}</p>`:''}
    </div>`;
    const on=screen.querySelector('#stp .on'); if(on) on.scrollIntoView({block:'nearest',inline:'center'});
    screen.querySelector('#prev').onclick=()=>{i--;draw();};
    const nx=screen.querySelector('#next'); if(nx) nx.onclick=()=>{i++;draw();screen.scrollTop=0;};
    screen.querySelectorAll('[data-j]').forEach(b=>b.onclick=()=>{ const j=+b.dataset.j; if(!gate||j<=seen+1){i=j;draw();screen.scrollTop=0;} });
    const dn=screen.querySelector('#done'); if(dn) dn.onclick=()=>{ if(gate){p.read[id]=true;save();} onClose&&onClose(true); };
    const pr=screen.querySelector('#prac'); if(pr) pr.onclick=()=>onPractice();
  };
  draw();
}

/* ---------- 풀이 ---------- */
function start(mode,title,arg){
  const p=P(), q=buildQueue(p,mode,arg); if(!q.length) return;
  G={mode,title,arg,q,i:0,cur:null,t0:0,lock:false,log:[],passedNow:[],reviewed:{},toast:'',began:performance.now(),away:0,answered:false,recent:[],exam:null};
  document.onkeydown=e=>{ if(!G||!G.cur) return; if(G.answered){ if(e.key==='Enter'){e.preventDefault();next();} return; }
    if(/^[1-4]$/.test(e.key)&&+e.key<=G.cur.choices.length) choose(+e.key-1); };
  advance();
}
function advance(){
  const g=G, p=P(), it=g.q[g.i], cs=curSt(p);
  if(it.src==='new'&&cs.kind==='exam'){ g.q.splice(g.i,g.q.length-g.i,...progItems(p,0)); return advance(); }
  if(it.src==='new'&&!p.read[cs.id]){
    g.cur=null; const t0=performance.now();
    return concept(cs.id,true,ok=>{ if(ok&&G===g){ g.away+=performance.now()-t0; advance(); } else { G=null; render(); } });
  }
  g.cur={src:it.src,...resolve(it,p,g)}; g.answered=false; g.t0=performance.now(); drawPlay();
}
const SRC={card:'오답 다시',review:'단원 복습',new:'새 진도',retry:'방금 틀린 문제',exam:'승급 평가'};
function wrongBox(){ const g=G, p=P(); if(!g) return ''; const s=curSt(p), cap=s.kind==='exam'?EXAM_CAP:CAP(s), w=s.kind==='exam'?g.log.filter(r=>r.src==='exam'&&!r.ok).length:WR(p,s.id), sw=g.log.filter(r=>!r.ok).length;
  return `<div class="wcnt ${w>=cap-1?'full':''}" id="wcnt"><div class="r1"><b>틀린 개수</b><span class="dots">${Array.from({length:cap},(_,i)=>`<i class="${i<w?'on':''}"></i>`).join('')}</span><em>${w}/${cap}</em></div><small>${s.kind==='exam'?`${cap}개 틀리면 평가가 끝나요`:`${cap}개 틀리면 「${s.name}」을 처음부터 다시 해요`} · 이번 학습에서 <b>${sw}개</b> 틀림</small></div>`; }
function refreshWrong(){ const el=document.getElementById('wcnt'); if(el) el.outerHTML=wrongBox(); }
function drawPlay(){
  showTabs(false);
  const g=G,p=P(),c=g.cur,s=STAGES[IDX[c.st]]||curSt(p);
  setBar(g.title,{back:()=>{G=null;document.onkeydown=null;save();render();},help:c.src==='exam'?null:()=>openFromPlay(s.id,c.ch)});
  const ex=g.log.filter(r=>r.src==='exam');
  screen.innerHTML=`<div class="np">
    <div class="prog"><div class="tr"><i style="width:${g.i/g.q.length*100}%"></i></div><span>${g.i+1} / ${g.q.length}</span></div>
    ${g.toast?`<div class="toast">${g.toast}</div>`:''}
    <div class="ptag">${c.src==='new'?`<span class="lvl l-${LV_(s.id,p)}">${LV_(s.id,p)}</span>`:`<span class="lvl src">${SRC[c.src]}</span>`}<span>${TNAME[c.t]} · ${c.src==='exam'?`정답 ${ex.filter(r=>r.ok).length}/${ex.length}`:s.name}${c.src==='new'?` · 연속 ${p.streak}/${GOAL}`:''}</span></div>
    <div class="board hb" id="board"><span class="fb" id="fb"></span><p class="ask">${c.ask}</p><div class="q ${c.qc}">${c.q}</div>${c.hint}</div>
    <div class="choices ${c.long?'longc':''} ${c.ox?'oxc':''}" id="ch">${c.choices.map((v,k)=>`<button data-c="${k}"><small>${k+1}</small><span>${esc(v)}</span></button>`).join('')}</div>
    ${wrongBox()}
    <div id="after"><p class="tip">${c.src==='exam'?'평가 중에는 개념을 볼 수 없어요. 차분히 골라요.':`모르면 오른쪽 위 ${LI('circle-help','inl')}로 단원 개념 정리를 볼 수 있어요.`}</p></div>
  </div>`;
  g.toast='';
  screen.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>choose(+b.dataset.c));
}
function openFromPlay(id,ch){
  const g=G; if(!g) return; clearTimeout(g.timer); const keep=g.cur, was=g.answered, t0=performance.now(); g.cur=null;
  concept(id,false,()=>{ if(G!==g) return; g.away+=performance.now()-t0; g.cur=keep; if(was) return next(); drawPlay(); },null,ch);
}
/* 답하면 자동으로 다음 문제: 맞히면 0.6초, 틀리면 설명을 보여 주고 넘어감(멈추고 보기 가능) */
const AUTO_OK=600, AUTO_NO=3000, AUTO_LONG=3800;
function autoGo(ms,go){ const g=G; if(!g) return; clearTimeout(g.timer); const host=document.getElementById('autoBox');
  if(host) host.innerHTML=`<div class="autobar"><i style="animation-duration:${ms}ms"></i></div><button class="stopauto" id="stopAuto">멈추고 보기</button>`;
  g.timer=setTimeout(()=>{ if(G===g&&g.answered) go(); },ms);
  const st=document.getElementById('stopAuto'); if(st) st.onclick=()=>{ clearTimeout(g.timer); host.innerHTML='<small class="autonote">멈췄어요. 다 보면 다음 문제를 눌러요.</small>'; };
}
function next(){ const g=G; if(!g) return; clearTimeout(g.timer); g.answered=false; g.lock=false; g.i++; if(g.i>=g.q.length) return finish(); advance(); screen.scrollTop=0; }
function passUnit(p,s,g){ if(p.wr) delete p.wr[s.id]; p.np++; p.passed[s.id]={box:0,due:p.np+REV_GAP[0]}; g.passedNow.push(s.name); HG('pass'); p.stage++; p.streak=0; areaF=null; }
function choose(k){
  const g=G; if(!g||g.lock||!g.cur||g.answered) return;
  const p=P(),c=g.cur,t=today(),s=STAGES[IDX[c.st]]||curSt(p), you=c.choices[k], ok=you===c.ans, ar=LV[IT[c.ch].unit.lv];
  g.answered=true; HG(ok?'ok':'no');
  p.stat[ar]=p.stat[ar]||{n:0,c:0}; p.stat[ar].n++; if(ok)p.stat[ar].c++;
  const h=p.hist[t]=p.hist[t]||{n:0,c:0,ms:0}; h.n++; if(ok)h.c++; h.ms=(h.ms||0)+Math.min(performance.now()-g.t0,60000);
  g.log.push({ch:c.ch,t:c.t,ans:c.ans,you,ok,src:c.src,st:c.st});
  if(c.src==='card'){ const cd=c.card;
    if(ok){ cd.box++; if(cd.box>=3){ p.cards=p.cards.filter(x=>x!==cd); p.grad++; HG('grad'); g.toast='오답 졸업!'; } else cd.due=t+CARD_GAP[cd.box]; }
    else { cd.box=0; cd.due=t+1; cd.wrong++; } }
  if(c.src==='review'){ const id=g.q[g.i].st; const r=g.reviewed[id]=g.reviewed[id]||{n:0,w:0,free:!!g.q[g.i].free}; r.n++; if(!ok){r.w++; addCard(p,c);} }
  let restart='', passMsg='';
  if(c.src==='exam'){ g.exam=c.exam; if(!ok){ addCard(p,c); const w=g.log.filter(r=>r.src==='exam'&&!r.ok).length; if(w>=EXAM_CAP){ g.q=g.q.filter((it,j)=>j<=g.i||it.src!=='exam'); g.examStop=true; restart=`${EXAM_CAP}개를 틀려서 평가가 끝났어요. 틀린 용어를 복습하고 다시 도전해요.`; } } }
  if(c.src==='new'){ const cs=curSt(p);
    p.bp=p.bp||{}; const pos=p.bp[cs.id]||0;
    p.bp[cs.id]=ok?Math.min(9,pos+(p.streak>=2?2:1)):Math.max(0,pos-2);
    if(ok){ p.streak++; if(p.streak>=GOAL&&p.bp[cs.id]>=6&&p.stage<STAGES.length-1){ passUnit(p,cs,g); const nx=curSt(p);
        passMsg=g.toast=`${cs.name} 통과! ${nx.kind==='exam'?`이제 ${nx.name}에 도전해요`:'다음 단원은 개념 정리부터 시작해요'} · 3단원 뒤에 복습해요`;
        g.q.splice(g.i+1); g.q.push(...revItems(dueStages(p).slice(0,2)),...progItems(p,Math.max(4,10-dueStages(p).length*REV_Q)).slice(0,nx.kind==='exam'?EXAM_N:10)); } }
    else { p.streak=0; addCard(p,c); p.wr=p.wr||{}; p.wr[cs.id]=(p.wr[cs.id]||0)+1;
      if(p.wr[cs.id]>=CAP(cs)){ p.wr[cs.id]=0; p.bp[cs.id]=0; p.read[cs.id]=false; g.restarts=(g.restarts||0)+1; restart=`${CAP(cs)}개를 틀려서 「${cs.name}」을 처음부터 다시 시작해요. 개념 정리부터 다시 봐요.`; } } }
  if(!ok&&c.src!=='retry'&&c.src!=='exam') g.q.splice(Math.min(g.i+4,g.q.length),0,{src:'retry',qq:{...c,src:'retry',choices:(window.hgReshuf?hgReshuf(c):(c.choices&&!c.ox?shuffle(c.choices):c.choices))}});
  save(); refreshWrong();
  screen.querySelectorAll('#ch button').forEach((b,j)=>{ b.disabled=true; const v=c.choices[j]; if(v===c.ans) b.classList.add('ok'); else if(j===k) b.classList.add('no'); });
  const b=screen.querySelector('#board'),fb=screen.querySelector('#fb'); b.classList.add(ok?'ok':'no');
  fb.className='fb '+(ok?'ok':'no'); fb.textContent=ok?'정답!':(c.long?'정답은 초록색 설명이에요':`정답은 ${c.ans}`)+(ok?'':(c.src==='exam'?' · 오답노트에 저장':' · 3문제 뒤 다시 나와요'));
  const last=g.i>=g.q.length-1;
  if(ok&&!passMsg&&!restart){ screen.querySelector('#after').innerHTML='<p class="okflash">정답! 다음 문제로 넘어가요</p>'; g.timer=setTimeout(()=>{ if(G===g&&g.answered) next(); },AUTO_OK); return; }
  screen.querySelector('#after').innerHTML=`
    ${passMsg?`<div class="toast">${passMsg}</div>`:''}${restart?`<div class="toast warn">${restart}</div>`:''}
    <div id="autoBox"></div>
    <div class="wrongbar">${c.src==='exam'?'':`<button class="btn" id="seeCx">${LI('book-open')}개념 정리</button>`}<button class="btn y" id="goOn">${last?'결과 보기':'다음 문제'}${LI('arrow-right')}</button></div>
    <p class="lk2">${ok?'정답이에요!':'다시 살펴봐요'}</p>
    ${infoHTML(c.ch)}`;
  if(passMsg) g.toast='';
  const sc=screen.querySelector('#seeCx'); if(sc) sc.onclick=()=>openFromPlay(s.id,c.ch);
  screen.querySelector('#goOn').onclick=()=>next();
  autoGo(passMsg||restart?AUTO_LONG:AUTO_NO,next);
}
function mmss(ms){ const s=Math.round(ms/1000); return s<60?`${s}초`:`${Math.floor(s/60)}분 ${s%60}초`; }
function finish(){
  const g=G,p=P(),t=today(); G=null; document.onkeydown=null;
  const revRes=Object.entries(g.reviewed).map(([id,r])=>{ const ps=p.passed[id]; if(!ps||ps.exam||r.free) return [id,r,null];
    if(r.w===0){ ps.box=Math.min(2,ps.box+1); if(ps.box<2) ps.due=p.np+REV_GAP[ps.box]; return [id,r,ps.box>=2?'완성!':`${REV_GAP[1]}단원 뒤 한 번 더`]; }
    ps.box=0; ps.due=p.np+REV_GAP[0]; return [id,r,`${REV_GAP[0]}단원 뒤 다시`]; });
  let examRes=null;
  if(g.exam){ const ex=g.log.filter(r=>r.src==='exam'), c=ex.filter(r=>r.ok).length, sc=Math.round(c/ex.length*100), s=STAGES[IDX[g.exam]];
    const pass=ex.length>=EXAM_N&&c>=Math.ceil(EXAM_N*EXAM_PASS);
    examRes={s,c,n:ex.length,sc,pass};
    if(pass&&curSt(p).id===s.id){ p.np++; p.passed[s.id]={exam:true,box:2,score:sc}; if(p.stage<STAGES.length-1) p.stage++; else p.allDone=true; p.streak=0; areaF=null; } }
  const per={}; g.log.filter(r=>r.src==='new'||r.src==='review').forEach(r=>{ const o=per[r.st]=per[r.st]||{n:0,c:0}; o.n++; if(r.ok)o.c++; });
  Object.entries(per).forEach(([id,o])=>{ if(!STAGES[IDX[id]]) return; const a=p.sst[id]=p.sst[id]||[]; a.push(Math.round(o.c/o.n*100)); if(a.length>3)a.shift(); });
  save(); tab='home'; showTabs(true);
  const n=g.log.length,c=g.log.filter(r=>r.ok).length, wrong=g.log.filter(r=>!r.ok&&r.src!=='retry');
  const time=mmss(performance.now()-g.began-g.away);
  setBar(g.title+' 결과');
  screen.innerHTML=`<div class="res">
    <div class="box center"><small class="note">${dlabel(t)} · 풀이 시간 ${time}</small><div class="big">${n?Math.round(c/n*100):0}점</div><p class="note">${n}문제 중 ${c}개 정답 (틀린 문제 다시 풀기 포함)</p></div>
    ${examRes?`<div class="box center exres ${examRes.pass?'pass':''}"><h3>${examRes.s.name} ${examRes.pass?'통과!':'다시 도전'}</h3><p class="note">${examRes.n}문제 중 ${examRes.c}개 정답 (통과 기준 ${Math.ceil(EXAM_N*EXAM_PASS)}개)</p><p>${examRes.pass?(p.allDone?'<b>모든 과정을 마쳤어요! 이제 복습과 오답으로 실력을 지켜요.</b>':`다음: <b>${curSt(p).name}</b>`):g.examStop?`${EXAM_CAP}개를 틀려서 평가가 일찍 끝났어요. 틀린 용어를 오답노트로 복습하고 다시 도전해요.`:examRes.n<EXAM_N?'평가를 끝까지 풀어야 결과가 나와요.':'틀린 용어를 오답노트로 복습하고 다시 도전해요.'}</p></div>`:''}
    <div class="grid3"><div class="cell"><b>${wrong.length}</b><span>내일 다시 나올 오답</span></div><div class="cell"><b>${g.passedNow.length}</b><span>통과한 단원</span></div><div class="cell"><b>${p.streak}/${GOAL}</b><span>지금 단원 연속</span></div></div>
    ${g.passedNow.length?`<div class="toast">${g.passedNow.join(', ')} 통과 → 지금: ${curSt(p).name}</div>`:''}${g.restarts?`<div class="toast warn">틀림 상한에 닿아 「${curSt(p).name}」을 처음부터 다시 해요</div>`:''}
    ${revRes.length?`<div class="box"><h3>단원 복습 결과 <small class="note">3단원 뒤 → 5단원 뒤</small></h3><div class="list">${revRes.map(([id,r,m])=>`<div><span>${STAGES[IDX[id]].name}</span><span>${r.w?`<span class="x">✕${r.w}</span> `:'다 맞음 '}${m?'→ '+m:''}</span></div>`).join('')}</div></div>`:''}
    ${wrong.length?`<div class="box"><h3>틀린 문제 <small class="note">오답노트에 저장됨</small></h3><ul class="units in">${wrong.slice(0,8).map(r=>`<li><button class="unit" data-ch="${r.ch}" data-st="${r.st}"><b class="mq">${cardLine(r)}</b><small>${TNAME[r.t]}</small></button><button class="qbtn" data-ch="${r.ch}" data-st="${r.st}" aria-label="개념">${Q_ICON}</button></li>`).join('')}</ul></div>`:'<p class="note center">틀린 문제가 없어요.</p>'}
    <div class="btns sp"><button class="btn" id="home">${LI('house')}${TRN[TR]}로</button><button class="btn k" id="cards">${LI('notebook-pen')}오답노트 보기</button></div>
  </div>
  <div class="dim" id="dlg"><div class="dialog" role="dialog" aria-labelledby="dt"><h3 id="dt">${LI('bell')}알림</h3><p>문제풀이가 끝났습니다.<br>문제풀이 시간: <b>${time}</b><br>정답: <b>${c} / ${n}</b>${examRes?`<br>${examRes.s.name}: <b>${examRes.pass?'통과':'다시 도전'}</b>`:''}${wrong.length?`<br>틀린 ${wrong.length}문제는 내일 다시 나와요.`:''}</p><button id="dok">확인</button></div></div>`;
  screen.querySelector('#dok').onclick=()=>screen.querySelector('#dlg').remove();
  screen.querySelector('#home').onclick=()=>setTab('home');
  screen.querySelector('#cards').onclick=()=>setTab('cards');
  screen.querySelectorAll('[data-ch]').forEach(b=>b.onclick=()=>openConcept(b.dataset.st,()=>setTab('cards'),b.dataset.ch));
}

let tr0='mix'; try{ tr0=localStorage.getItem('sci-track')||'mix'; }catch(e){}
setupTrack(tr0);
tabs.querySelectorAll('button').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
let iconQ=false;
/* 루시드 아이콘 (lucide 0.469.0, ISC) — 쓰는 것만 인라인 */
__LUCIDE__
function drawIcons(){ document.querySelectorAll("i[data-lucide]").forEach(el=>{ const n=el.dataset.lucide, b=LUCIDE[n]; if(!b) return; const t=document.createElement("span"); t.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${n} ${el.className||""}" aria-hidden="true">${b}</svg>`; el.replaceWith(t.firstChild); }); iconQ=false; }
new MutationObserver(()=>{ if(!iconQ&&document.querySelector('i[data-lucide]')){ iconQ=true; requestAnimationFrame(drawIcons); } }).observe(document.querySelector('.app'),{childList:true,subtree:true});
render(); drawIcons();
