/* =========================================================
   하루공부 공통 보상 저장소 (셸과 놀이터가 함께 씀)
   - 캐시 = 맞힌 문제 − 틀린 문제 (정답 +1, 오답 −1, 캐시는 0 밑으로 안 내려감) · 공부 캐시 하루 최대 150
   - XP(등급)는 맞힌 문제 수로만 쌓임 (내려가지 않음)
   - 5문제 연속 +3 · 오답 졸업 +5 · 단원 통과 +20
   - 오늘 할 일(과목별 맞힐 문제 수, 보호자가 정함)을 모두 끝내야 꾸미기·게임(스피드·대결)이 열림
   - 하루 3판(보호자 1/3/5) · 할 일을 끝낸 뒤 20문제 더 맞히면 +1판 · 할 일 완료 +20
   - 밀린 공부: 지난 7일 동안 못 끝낸 할 일을 쌓아 두고, 오늘 할 일을 넘긴 정답으로 오래된 것부터 갚음 (하루치 다 갚으면 +5)
     보호자 설정 '밀린 공부도 끝내야 열기'(기본 켬)
   - 알림: 정해 둔 시간에 앱 안 알림 + 브라우저 알림(허용했을 때)
   - 게임 캐시 하루 최대 30 · 밤 9시 이후 잠금(선택) · 캐시는 현금으로 살 수 없음
   ========================================================= */
function makeHGS(){
  const RKEY='harugongbu-play-v1', STUDY_CAP=150, GAME_CAP=30, MORE=20;
  const PLAN0={math:20,hanja:10,eng:10,kor:10,hist:0,sci:0,typ:0};
  const PNAME={math:'연산',hanja:'한자',eng:'영단어',kor:'국어',hist:'역사',sci:'과학',typ:'타자'};
  const GRADES=[{n:'씨앗',x:0,ic:'circle-dot'},{n:'새싹',x:150,ic:'sprout'},{n:'잎새',x:400,ic:'leaf'},{n:'꽃',x:800,ic:'flower-2'},{n:'나무',x:1300,ic:'tree-deciduous'},{n:'숲',x:2000,ic:'trees'},{n:'별',x:3000,ic:'star'}];
  const dayN=()=>{ const d=new Date(); return Math.floor((d.getTime()-d.getTimezoneOffset()*60000)/864e5); };
  const wkN=d=>Math.floor((d+3)/7);
  const fresh=()=>({name:'',xp:0,cash:30,total:0,wk:{},owned:[],eq:{body:'cream',hat:'sprout',face:'basic',outfit:'none',bg:'none',hold:'none'},gameLimit:3,curfew:false,best:{},wins:0,battles:0,plan:{...PLAN0},since:dayN(),log:{},backGate:true,alarms:[{t:'16:00',on:true,label:'공부할 시간'},{t:'20:00',on:true,label:'오늘 할 일 확인'}],fired:{}});
  let st=null; try{ st=JSON.parse(localStorage.getItem(RKEY)); }catch(e){}
  if(!st||typeof st!=='object') st=fresh();
  if(!st.plan) st.plan={...PLAN0};
  const F=fresh(); ['since','log','backGate','alarms','fired'].forEach(k=>{ if(st[k]===undefined) st[k]=F[k]; });
  const subs=[];
  const H={
    GRADES,MORE,GAME_CAP,STUDY_CAP,PNAME,dayN,wkN,
    get st(){ return st; },
    save(){ try{ localStorage.setItem(RKEY,JSON.stringify(st)); }catch(e){} subs.forEach(f=>{ try{ f(); }catch(e){} }); },
    on(f){ subs.push(f); },
    off(f){ const i=subs.indexOf(f); if(i>=0) subs.splice(i,1); },
    day(){ const t=dayN(); if(!st.day||st.day.d!==t){
        if(st.day){ const o=st.day; st.log[o.d]={by:o.by,byNo:o.by_no||{},no:o.no||0,plan:o.plan||{...st.plan},paid:{},done:!!o.bonus}; st.hist=st.hist||{}; st.hist[o.d]={ok:o.ok,no:o.no||0,done:!!o.bonus}; }
        Object.keys(st.log).forEach(k=>{ if(+k<t-8) delete st.log[k]; });
        st.day={d:t,cash:0,ok:0,no:0,by:{},streak:0,game:0,played:0,bonus:false,more:false,plan:{...st.plan}}; }
      return st.day; },
    backlog(){ const t=dayN(), out=[]; H.day();
      for(let d=Math.max(t-7,st.since);d<t;d++){ const L=st.log[d]||(st.log[d]={by:{},plan:{...st.plan},paid:{}}); L.paid=L.paid||{};
        Object.keys(PNAME).forEach(k=>{ const g=(L.plan||{})[k]||0; if(!g) return; const rem=g-Math.min(g,(L.by||{})[k]||0)-(L.paid[k]||0); if(rem>0) out.push({d,k,name:PNAME[k],rem,goal:g}); }); }
      return out; },
    backTotal(){ return H.backlog().reduce((a,b)=>a+b.rem,0); },
    gradeOf(x){ let k=0; GRADES.forEach((g,i)=>{ if(x>=g.x) k=i; }); return k; },
    earn(n){ const d=H.day(), v=Math.max(0,Math.min(n,STUDY_CAP-d.cash)); d.cash+=v; st.cash+=v; return v; },
    lose(n){ const d=H.day(), v=Math.min(n,st.cash); d.cash-=v; st.cash-=v; return -v; },
    gEarn(n){ const d=H.day(), v=Math.max(0,Math.min(n,GAME_CAP-d.game)); d.game+=v; st.cash+=v; return v; },
    addXP(n){ const b=H.gradeOf(st.xp); st.xp+=n; const k=wkN(dayN()); st.wk[k]=(st.wk[k]||0)+n; const a=H.gradeOf(st.xp); return a>b?GRADES[a]:null; },
    limit(){ return st.gameLimit+(H.day().more?1:0); },
    left(){ return Math.max(0,H.limit()-H.day().played); },
    tasks(){ const d=H.day(); return Object.keys(PNAME).filter(k=>(st.plan[k]||0)>0).map(k=>({k,name:PNAME[k],goal:st.plan[k],n:Math.min(d.by[k]||0,st.plan[k])})); },
    planTotal(){ return H.tasks().reduce((a,t)=>a+t.goal,0); },
    todayDone(){ return H.tasks().every(t=>t.n>=t.goal); },
    done(){ return H.todayDone()&&(!st.backGate||H.backTotal()===0); },
    block(){ const d=H.day(), ts=H.tasks();
      if(!H.todayDone()) return {k:'study',msg:`오늘 할 일을 모두 끝내면 열려요 (${ts.filter(t=>t.n>=t.goal).length}/${ts.length} 완료)`};
      if(!H.done()) return {k:'study',msg:`밀린 공부 ${H.backTotal()}문제를 끝내면 열려요`};
      if(st.curfew&&new Date().getHours()>=21) return {k:'night',msg:'밤 9시가 지나면 게임은 쉬어요. 내일 만나요'};
      if(H.left()<=0) return {k:'used',msg:'오늘 게임을 다 했어요. 내일 다시 열려요'};
      return null; },
    useTicket(){ if(H.block()) return false; H.day().played++; H.save(); return true; },
    event(e,s){
      const d=H.day(), out={gain:0,msg:[]};
      if(e==='ok'){
        d.ok++; d.by[s]=(d.by[s]||0)+1; st.total=(st.total||0)+1; d.streak++;
        out.gain+=H.earn(1); if(d.streak%5===0) out.gain+=H.earn(3);
        const up=H.addXP(1); if(up) out.msg.push(`'${up.n}' 등급이 됐어요!`);
        const g=st.plan[s]||0; if(g>0&&d.by[s]===g&&!H.done()) out.msg.push(`${PNAME[s]} 할 일 완료!`);
        if(d.by[s]>g){ const b=H.backlog().find(x=>x.k===s); if(b){ const L=st.log[b.d]; L.paid[s]=(L.paid[s]||0)+1;
          if(!H.backlog().some(x=>x.d===b.d)){ out.gain+=H.earn(5); const dt=new Date(b.d*864e5); out.msg.push(`${dt.getUTCMonth()+1}/${dt.getUTCDate()} 밀린 공부 완료 +5`); } } }
        if(H.done()&&!d.bonus){ d.bonus=true; d.doneAt=d.ok; out.gain+=H.earn(20); out.msg.push('오늘 할 일 완료! 꾸미기·게임이 열렸어요 +20'); }
        if(d.bonus&&!d.more&&d.ok>=(d.doneAt||0)+MORE){ d.more=true; out.msg.push(`${MORE}문제 더 맞혔어요! 게임 +1판`); }
      } else if(e==='no'){ d.no++; d.by_no=d.by_no||{}; d.by_no[s]=(d.by_no[s]||0)+1; d.streak=0; out.gain+=H.lose(1); }
      else if(e==='pass'){ out.gain+=H.earn(20); out.msg.push('단원 통과! +20캐시'); }
      else if(e==='grad'){ out.gain+=H.earn(5); }
      H.save(); return out;
    }
  };
  return H;
}
