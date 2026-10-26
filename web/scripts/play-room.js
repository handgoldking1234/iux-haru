/* ---------- 대결방 (실시간: Supabase Realtime) ----------
   scripts/play-app.mjs가 프로토타입의 '대결방(시연: 가상 친구)' 부분을 이 코드로 바꿔 끼운다.
   방은 6자리 코드. 참가자 목록은 접속 상태(presence), 채팅·설정·시작·답·다음 문제는 방송으로 주고받는다.
   방장이 문제를 만들고 진행(다음 문제 · 정답 공개 · 끝)을 정해서, 모두 같은 문제를 같은 순서로 푼다.
   학생 id 대신 접속할 때마다 새 임시 id를 쓰고, 서로에게 보이는 건 닉네임·캐릭터뿐이다. */
let RM=null; const TM=[];
const later=(f,ms)=>{ const t=setTimeout(()=>{ const i=TM.indexOf(t); if(i>=0) TM.splice(i,1); f(); },ms); TM.push(t); return t; };
const clearT=()=>{ while(TM.length) clearTimeout(TM.pop()); if(RM&&RM.iv){ clearInterval(RM.iv); RM.iv=null; } if(RM&&RM.rain){ cancelAnimationFrame(RM.rain.raf); RM.rain.dead=true; } };
const RT=env.rt||null;
const MID=()=>RT?RT.me.id:'me';
const isMe=id=>id===MID();
const amHost=()=>!!RM&&RM.hostId===MID();
const meP=()=>({id:MID(),name:myName(),eq:S().eq,ready:false});
const pName=p=>isMe(p.id)?(S().name?S().name+' (나)':'나'):p.name;
const myMeta=()=>({id:MID(),name:myName(),eq:S().eq,ready:!!(RM&&RM.ready),host:amHost(),at:RM?RM.at:Date.now(),lv:RM?RM.lv:gLv()});
function send(ev,p){ if(RM&&RM.ch) RM.ch.send(ev,p||{}); }
function say(p,txt,remote){ if(!RM) return; RM.chat.push({id:p.id,name:p.name,txt}); RM.chat=RM.chat.slice(-40); drawChat(); if(!remote) send('chat',{id:p.id,name:p.name,txt}); }
function sys(txt){ if(!RM) return; RM.chat.push({sys:true,txt}); drawChat(); }

/* 공개 방 목록 — 지금 열린 진짜 방만 (방장이 2분 안에 신호를 보낸 방) */
function loadPubs(gb){
  const box=screen.querySelector('#pubs'); if(!box) return;
  if(!RT){ box.innerHTML='<p class="note" style="margin:0">로그인하면 공개 방을 볼 수 있어요.</p>'; return; }
  RT.list().then(rows=>{ const b=screen.querySelector('#pubs'); if(!b) return;
    if(!rows.length){ b.innerHTML='<p class="note" style="margin:0">지금 열린 공개 방이 없어요. 방을 만들어 친구를 불러 봐요!</p>'; return; }
    b.innerHTML=rows.map(r=>`<button class="pubr" data-pub="${esc(r.code)}" ${gb?'disabled':''}>${avatar(r.eq||{},40)}<span><b>${esc(r.host_name)}님의 방</b><small>${(SUBJ[r.subject]||['?'])[0]} · ${r.n}문제 · ${r.cur}/${r.max_n}명</small></span>${LI('chevron-right')}</button>`).join('');
    b.querySelectorAll('[data-pub]').forEach(x=>x.onclick=()=>{ const bl=HG.block(); if(bl){ toast(bl.msg); return; } joinRoom(x.dataset.pub); });
  }).catch(()=>{ const b=screen.querySelector('#pubs'); if(b) b.innerHTML='<p class="note" style="margin:0">공개 방을 불러오지 못했어요.</p>'; });
}

async function makeRoom(){
  if(!RT){ toast('로그인하면 친구와 대결할 수 있어요'); return; }
  try{ const code=await RT.create({public:!mk.priv,sub:mk.sub,n:mk.n,max:mk.max,dan:mk.dan});
    enterRoom({code,public:!mk.priv,host_name:myName(),subject:mk.sub,dan:mk.dan,n:mk.n,max_n:mk.max},true); }
  catch(e){ toast('방을 만들지 못했어요. 잠시 뒤 다시 해 봐요'); }
}
async function joinRoom(code){
  if(!RT){ toast('로그인하면 친구와 대결할 수 있어요'); return; }
  const row=await RT.find(code).catch(()=>null);
  if(!row){ toast('방을 찾을 수 없어요. 코드를 다시 확인해요'); return; }
  if(row.state!=='wait'){ toast('이미 대결 중인 방이에요'); return; }
  if(row.cur>=row.max_n){ toast('방이 꽉 찼어요'); return; }
  enterRoom(row,false);
}
function enterRoom(row,host){
  clearT(); leaveCh();
  RM={code:row.code,priv:!row.public,hostId:host?MID():null,hostName:row.host_name,sub:row.subject,dan:row.dan||0,n:row.n,max:row.max_n,
    players:[meP()],real:[meP()],bots:[],hi:{},chat:[],phase:'wait',ready:false,at:Date.now(),known:{},synced:false,ban:[],lv:host?gLv():null}; // 문제 수준은 방장이 고른 게임 수준
  sys(host?(RM.priv?'비공개 방을 만들었어요. 코드를 친구에게 알려 주세요':'공개 방을 만들었어요. 공개 방 목록에서 누구나 들어올 수 있어요'):`${row.host_name}님의 방에 들어왔어요`);
  view='room'; drawRoom(); screen.scrollTop=0;
  // 접속 상태 동기화는 몇 초 늦을 수 있어서, 들어오자마자 '들어왔어요'(hi)를 방송해 서로 바로 보이게 한다
  RM.ch=RT.join(row.code,myMeta(),{presence:onPresence,event:onEvent,ready:()=>send('hi',myMeta())});
  if(host&&!RM.priv) addBots();
  if(host) RM.hb=setInterval(()=>{ if(RM&&amHost()) RT.update(RM.code,{cur:RM.players.length}); },30000);
  else later(()=>{ if(RM&&!RM.seenHost){ toast('방장이 없어서 들어갈 수 없어요'); leaveRoom(); } },6000); // 방장이 창을 닫은 방
}
/* 방장이 창을 닫거나 다른 곳으로 가면 방을 바로 지운다 */
window.addEventListener('pagehide',()=>{ if(RM&&amHost()&&RT){ send('closed',{}); RT.remove(RM.code); } });
function leaveCh(){ if(!RM) return; if(RM.hb){ clearInterval(RM.hb); RM.hb=null; } if(RM.ch){ try{ RM.ch.leave(); }catch(e){} RM.ch=null; } }
function leaveRoom(silent){
  if(!RM) return;
  send('bye',{id:MID()});
  if(amHost()){ send('closed',{}); if(RT) RT.remove(RM.code); }
  const r=RM; clearT(); setTimeout(()=>{ RM=r; leaveCh(); RM=null; },150); RM=null;
  if(!silent){ view=null; render(); } else view=null;
}

/* 공개 방 AI 친구 — 아직 접속한 학생이 적어서, 공개 방에는 가상 친구가 몇 명 들어와 같이 한다(사용자 요청).
   방장 기기가 움직이고 다른 참가자에게 방송한다. 진짜 친구가 들어와 자리가 모자라면 비켜 준다 */
function addBots(){ const n=R(1,Math.min(3,RM.max-1)); shuffle(FRIENDS).slice(0,n).forEach((f,i)=>later(()=>botJoin(f),1500+i*1800+R(0,800))); }
function botJoin(f){ if(!RM||!amHost()||RM.phase!=='wait'||RM.players.length>=RM.max||RM.bots.some(b=>b.id===f.id)) return;
  RM.bots.push({id:f.id,name:f.name,eq:f.eq,ready:true,bot:true,skill:f.skill,spd:f.spd}); sys(`${f.name}님이 들어왔어요`); send('bots',{list:RM.bots}); syncPlayers();
  later(()=>{ const b=RM&&RM.bots.find(x=>x.id===f.id); if(b) say(b,pick(BOT_SAY.join)); },800+R(0,900)); }
function botReply(){ if(!RM||!amHost()||!RM.bots.length||Math.random()>.5) return; const b=pick(RM.bots); later(()=>{ if(RM&&RM.bots.includes(b)) say(b,pick(RM.phase==='end'?BOT_SAY.end:BOT_SAY.good)); },900+R(0,900)); }
/* 참가자 = 접속한 학생(접속 상태 + 방금 '들어왔어요' 신호) + AI 친구 */
function syncPlayers(){
  if(!RM) return; const now=Date.now(), real=RM.real.slice();
  Object.values(RM.hi).forEach(h=>{ if(now-h.at<15000&&!real.some(p=>p.id===h.m.id)) real.push({id:h.m.id,name:h.m.name,eq:h.m.eq||{},ready:!!h.m.ready}); });
  if(!real.some(p=>isMe(p.id))) real.push(meP());
  real.sort((a,b)=>(b.id===RM.hostId)-(a.id===RM.hostId));
  if(amHost()) while(real.length+RM.bots.length>RM.max&&RM.bots.length){ const b=RM.bots.pop(); sys(`${b.name}님이 자리를 비켜 줬어요`); send('bots',{list:RM.bots}); }
  RM.players=[...real,...RM.bots].slice(0,RM.max);
  if(amHost()) RT.update(RM.code,{cur:RM.players.length});
  if(view==='room'&&RM.phase==='wait') drawRoom();
}
/* 참가자 목록이 바뀔 때 (들어옴 · 나감 · 준비) */
function onPresence(list){
  if(!RM) return;
  const ps=list.filter(Boolean).sort((a,b)=>((b.host?1:0)-(a.host?1:0))||(a.at-b.at));
  const host=ps.find(p=>p.host);
  if(host){ RM.hostId=host.id; RM.seenHost=true; if(typeof host.lv==='number') RM.lv=host.lv; }
  else if(RM.seenHost&&!amHost()){ toast('방장이 나가서 방이 닫혔어요'); leaveRoom(); return; }
  const ids=new Set(ps.map(p=>p.id));
  if(RM.synced){
    ps.forEach(p=>{ if(!RM.known[p.id]&&!isMe(p.id)&&!p.host) sys(`${p.name}님이 들어왔어요`); });
    Object.keys(RM.known).forEach(id=>{ if(!ids.has(id)&&!isMe(id)&&!RM.hi[id]) sys(`${RM.known[id]}님이 나갔어요`); });
  }
  RM.synced=true; RM.known={}; ps.forEach(p=>{ RM.known[p.id]=p.name; delete RM.hi[p.id]; }); Object.values(RM.hi).forEach(h=>{ RM.known[h.m.id]=h.m.name; });
  if(amHost()) ps.forEach(p=>{ if(RM.ban.includes(p.id)) send('kick',{id:p.id}); });
  if(ps.findIndex(p=>isMe(p.id))>=RM.max&&!amHost()){ toast('방이 꽉 찼어요'); leaveRoom(); return; }
  if(RM.phase!=='wait') return; // 대결 중에는 시작할 때의 참가자 그대로 (나간 사람은 점수판에 남는다)
  RM.real=ps.map(p=>({id:p.id,name:p.name,eq:p.eq||{},ready:!!p.ready}));
  syncPlayers();
}
/* 방송 받기 */
function onEvent(ev,p){
  if(!RM) return;
  if(ev==='chat'){ say(p,p.txt,true); botReply(); return; }
  if(ev==='hi'||ev==='hi2'){ if(isMe(p.id)) return; const known=!!RM.known[p.id]; RM.hi[p.id]={m:p,at:Date.now()};
    if(p.host){ RM.hostId=p.id; RM.seenHost=true; if(typeof p.lv==='number') RM.lv=p.lv; }
    if(ev==='hi'){ send('hi2',myMeta()); if(amHost()&&RM.bots.length) send('bots',{list:RM.bots}); if(!known&&!p.host&&RM.phase==='wait') sys(`${p.name}님이 들어왔어요`); }
    RM.known[p.id]=p.name; if(RM.phase==='wait') syncPlayers(); return; }
  if(ev==='bye'){ delete RM.hi[p.id]; RM.real=RM.real.filter(x=>x.id!==p.id); if(RM.phase==='wait') syncPlayers(); return; }
  if(ev==='bots'){ RM.bots=p.list||[]; if(RM.phase==='wait') syncPlayers(); return; }
  if(ev==='kick'){ if(isMe(p.id)){ toast('방장이 방에서 내보냈어요'); leaveRoom(); } return; }
  if(ev==='closed'){ if(!amHost()){ toast('방장이 방을 닫았어요'); leaveRoom(); } return; }
  if(ev==='cfg'){ RM.sub=p.sub; RM.dan=p.dan; RM.priv=p.priv; if(p.msg) sys(p.msg); if(view==='room'&&RM.phase!=='play') drawRoom(); return; }
  if(ev==='start'){ if(!HG.useTicket()){ toast((HG.block()||{}).msg||'남은 판이 없어요'); leaveRoom(); return; } startMatch(p); return; }
  if(ev==='rd'){ const pl=RM.players.find(x=>x.id===p.id); if(pl){ pl.ready=!!p.ready; if(view==='room'&&RM.phase==='wait') drawRoom(); } return; }
  if(ev==='q') return showQ(p.qi);
  if(ev==='ans') return gotAns(p);
  if(ev==='rev') return revealQ();
  if(ev==='end') return endMatch();
  if(ev==='rp'&&RM.rain){ RM.rain.pops[p.id]=p.pops; RM.rain.miss[p.id]=p.miss; RM.rain.redraw(); if(p.win) RM.rain.win(p.id); }
}

function chatH(){ return `<div class="chat" id="chat" aria-live="polite"></div><div class="quick" role="group" aria-label="빠른 채팅">${QUICK.map((q,i)=>`<button data-q="${i}">${q}</button>`).join('')}</div>`; }
function drawChat(){ const c=screen.querySelector('#chat'); if(!c||!RM) return;
  c.innerHTML=RM.chat.map(m=>m.sys?`<div class="msg sys">${esc(m.txt)}</div>`:`<div class="msg ${isMe(m.id)?'mine':''}">${isMe(m.id)?'':`<span class="who">${esc(m.name)}</span>`}<span class="bub">${esc(m.txt)}</span></div>`).join('');
  c.scrollTop=c.scrollHeight; }
function bindChat(){ screen.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{ if(!RM) return; const now=Date.now(); if(RM.lastSay&&now-RM.lastSay<1200){ toast('조금 천천히 보내요'); return; } RM.lastSay=now; say({id:MID(),name:myName()},QUICK[+b.dataset.q]); botReply(); }); }

function hostStart(){
  if(!RM||!amHost()) return;
  if(RM.players.length<2){ toast('친구가 들어오면 시작할 수 있어요'); return; }
  if(!HG.useTicket()){ toast((HG.block()||{}).msg||'남은 판이 없어요'); return; }
  const rain=RM.sub==='tko'||RM.sub==='ten';
  LVNOW=RM.lv; let qs; try{ const seen=new Set(); qs=rain?[]:Array.from({length:RM.n},()=>genU(RM.sub,RM.dan,seen)); } finally{ LVNOW=null; }
  const p={sub:RM.sub,dan:RM.dan,n:RM.n,lv:RM.lv,qs,seq:rain?shuffle(RM.sub==='tko'?PD.tko:PD.ten):null};
  send('start',p); RT.update(RM.code,{state:'play'}); startMatch(p);
}
function drawRoom(){
  if(!RM) return; view='room'; showTabs(false);
  const host=amHost(), me=RM.players.find(p=>isMe(p.id))||meP(), canStart=RM.players.length>=2;
  const hostP=RM.players.find(p=>p.id===RM.hostId);
  setBar('대결방',()=>{ leaveRoom(); toast('방에서 나왔어요'); });
  screen.innerHTML=`
  <section class="sec">
    ${RM.priv?`<div class="roomcode"><div><small>${LI('lock','inl')}비공개 방 · 방 코드</small><b>${RM.code}</b></div>${host?`<button class="btn line" id="copy">${LI('copy')}코드 복사</button>`:`<span class="grade">${LI('users')}참가자</span>`}</div>`
      :`<div class="roomcode pub"><div><small>${LI('users','inl')}공개 방 · 방 코드 ${RM.code}</small><b class="pubt">누구나 들어올 수 있어요</b></div>${host?`<button class="btn line" id="toPriv">${LI('lock')}비공개로</button>`:`<span class="grade">${LI('users')}참가자</span>`}</div>`}
    <div class="roomopt">${SUBJ[RM.sub][0]}${RM.sub==='gugu'?' '+danName(RM.dan):''}${RM.lv!=null&&!['gugu','tko','ten','spell'].includes(RM.sub)?' · '+LVG[RM.lv]+' 수준':''} · ${RM.n}문제 · 최대 ${RM.max}명 · 방장 ${esc(hostP?pName(hostP):RM.hostName||'')}</div>
  </section>
  <section class="sec"><h3 class="sh">${LI('users')}참가자 <small>${RM.players.length} / ${RM.max}</small></h3>
    <div class="players">${Array.from({length:RM.max},(_,i)=>{ const p=RM.players[i]; if(!p) return `<div class="pl empty">${LI('user-plus')}${RM.priv?'코드로 초대':'들어오길 기다려요'}</div>`;
      return `<div class="pl">${p.id===RM.hostId?`<span class="host" aria-label="방장">${LI('crown')}</span>`:''}${host&&!isMe(p.id)?`<button class="kick" data-kick="${esc(p.id)}" aria-label="${esc(p.name)} 내보내기">${LI('x')}</button>`:''}${avatar(p.eq,56)}<b>${esc(pName(p))}</b>${p.bot?'<span class="aitag">AI 친구</span>':''}${p.id!==RM.hostId?`<span class="rd">${p.ready?'준비 완료':''}</span>`:''}</div>`; }).join('')}</div>
    ${host?`<div style="margin-top:12px">${chipH('rs',subsFor(RM.lv),RM.sub)}</div>
      <button class="btn y full" id="go" style="margin-top:10px" ${canStart?'':'disabled'}>${LI('swords')}${canStart?'대결 시작 (티켓 1장)':'친구가 들어오면 시작할 수 있어요'}</button>`
      :`<button class="btn ${me.ready?'line':'y'} full" id="ready" style="margin-top:12px">${me.ready?'준비 취소':'준비 완료'}</button><p class="note">방장이 시작하면 대결이 시작돼요. 시작할 때 티켓 1장을 써요.</p>`}
  </section>
  <section class="sec"><h3 class="sh">${LI('message-circle')}채팅 <small>정해진 문구만</small></h3>${chatH()}</section>`;
  drawChat(); bindChat();
  const tp=screen.querySelector('#toPriv'); if(tp) tp.onclick=()=>{ RM.priv=true; RT.update(RM.code,{public:false}); const msg=`비공개로 바꿨어요. 방 코드는 ${RM.code}예요`; send('cfg',{sub:RM.sub,dan:RM.dan,priv:true,msg}); sys(msg); drawRoom(); };
  const cp=screen.querySelector('#copy'); if(cp) cp.onclick=()=>{ try{ navigator.clipboard.writeText(RM.code).then(()=>toast('코드를 복사했어요'),()=>toast(`방 코드: ${RM.code}`)); }catch(e){ toast(`방 코드: ${RM.code}`); } };
  screen.querySelectorAll('[data-kick]').forEach(b=>b.onclick=()=>{ const p=RM.players.find(x=>x.id===b.dataset.kick); if(!p) return; if(p.bot){ RM.bots=RM.bots.filter(x=>x.id!==p.id); send('bots',{list:RM.bots}); sys(`${p.name}님을 내보냈어요`); syncPlayers(); return; } RM.ban.push(p.id); send('kick',{id:p.id}); sys(`${p.name}님을 내보냈어요`); });
  screen.querySelectorAll('[data-rs]').forEach(b=>b.onclick=()=>{ RM.sub=b.dataset.rs; RT.update(RM.code,{subject:RM.sub}); const msg=`과목을 ${SUBJ[RM.sub][0]}(으)로 바꿨어요`; send('cfg',{sub:RM.sub,dan:RM.dan,priv:RM.priv,msg}); sys(msg); drawRoom(); });
  const go=screen.querySelector('#go'); if(go) go.onclick=hostStart;
  const rd=screen.querySelector('#ready'); if(rd) rd.onclick=()=>{ RM.ready=!RM.ready; if(RM.ch) RM.ch.track(myMeta()); send('rd',{id:MID(),ready:RM.ready}); me.ready=RM.ready; drawRoom(); }; // 접속 상태 동기화는 느려서 방송으로도 바로 알린다
}

const QT=10;
function startMatch(p){
  clearT(); RM.first=null; RM.rain=null; RM.spd=null; RM.phase='play'; RM.sub=p.sub; RM.dan=p.dan; RM.n=p.n; if(typeof p.lv==='number') RM.lv=p.lv; RM.qs=p.qs||[]; RM.seq=p.seq; RM.qi=-1;
  RM.score={}; RM.right={}; RM.wrong={}; RM.time={}; RM.players.forEach(pl=>{ RM.score[pl.id]=0; RM.right[pl.id]=0; RM.wrong[pl.id]=0; RM.time[pl.id]=0; });
  view='match'; showTabs(false); setBar(`대결 · ${SUBJ[RM.sub][0]}${RM.sub==='gugu'?' '+danName(RM.dan):''}`,()=>{ leaveRoom(); toast('대결을 그만뒀어요'); });
  let n=3; const app=root.querySelector('.app'); const ov=document.createElement('div'); ov.className='count'; ov.textContent=n; app.appendChild(ov);
  const tick=()=>{ n--; if(!RM){ ov.remove(); return; } if(n<=0){ ov.remove(); if(RM.seq) startRain(); else if(amHost()) hostNext(); } else { ov.textContent=n; later(tick,800); } }; later(tick,800);
}

/* ---------- 타자 대결: 산성비 먼저 깨기 ----------
   모두에게 같은 낱말 비가 내림(방장이 순서를 정해 보냄). 떨어지는 낱말을 똑같이 치면 깨짐(+1). 땅에 닿거나 틀리게 치면 −1.
   목표 개수(방 설정 문제 수)를 가장 먼저 깨면 우승. 최대 120초. 점수 = 깬 수 − 놓친·틀린 수. 서로의 진행은 방송으로 받는다 */
function rainScoreH(){ const r=RM.rain; return `<div class="score">${RM.players.map(p=>`<div class="${isMe(p.id)?'mine':''}">${RM.first===p.id?`<span class="done">${LI('crown')}</span>`:''}${avatar(p.eq,30)}<span>${esc(isMe(p.id)?'나':p.name)}</span><b>${r.pops[p.id]||0}<small style="font-size:11px;color:var(--sub)">/${RM.n}</small></b><span class="rbar"><i style="width:${Math.min(100,(r.pops[p.id]||0)/RM.n*100)}%"></i></span></div>`).join('')}</div>`; }
/* 타수(한글은 자모 단위) */
const K_CHO='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ', K_JUNG='ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ', K_JONG=['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'], K_TWO='ㅘㅙㅚㅝㅞㅟㅢㄳㄵㄶㄺㄻㄼㄽㄾㄿㅀㅄ';
function strokes(w){ let n=0; for(const ch of w){ const o=ch.charCodeAt(0)-0xAC00; if(o>=0&&o<11172){ const j=K_JUNG[Math.floor((o%588)/28)], g=K_JONG[o%28]; n+=1+(K_TWO.includes(j)?2:1)+(g?(K_TWO.includes(g)?2:1):0); } else n++; } return n; }
/* 타자 속도 기록(랭킹용): 산성비·타자 연습에서 낸 평균 속도 중 최고 */
function typCpm(c){ const st=S(); if(c>(st.typCpm||0)){ st.typCpm=c; HG.save(); } }
function startRain(){
  const me=MID(), lang=RM.sub==='tko'?'ko':'en', seq=RM.seq||shuffle(lang==='ko'?PD.tko:PD.ten);
  const r=RM.rain={seq,si:0,words:[],t0:performance.now(),lastSpawn:0,pops:{},miss:{},raf:0,dead:false,keys:0,top:0};
  const cpm=()=>Math.round(r.keys/Math.max((performance.now()-r.t0)/60000,1/60));
  RM.players.forEach(p=>{ r.pops[p.id]=0; r.miss[p.id]=0; });
  screen.innerHTML=`<div class="play"><div id="sc">${rainScoreH()}</div><div class="qtop"><span>먼저 ${RM.n}개 깨기 · 놓치거나 틀리면 −1</span><span class="rspd">속도 <b id="rsp">0</b>타/분</span><span id="tsec">120초</span></div>
    <div class="rain" id="rain"><div class="ground"></div></div>
    <form class="tform" id="tform"><input id="tin" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" lang="${lang}" aria-label="떨어지는 낱말 입력" placeholder="${lang==='ko'?'떨어지는 낱말을 쳐요':'Type the falling word'}"><button class="btn k" type="submit">입력</button></form><div class="fbk" id="fb"></div></div>`;
  const box=screen.querySelector('#rain'), inp=screen.querySelector('#tin'), fb=screen.querySelector('#fb'), H=()=>box.clientHeight;
  setTimeout(()=>{ try{ inp.focus(); }catch(e){} },30);
  const flash=(t,ok)=>{ fb.className='fbk '+(ok?'ok':'no'); fb.textContent=t; };
  r.redraw=()=>{ const sc=screen.querySelector('#sc'); if(sc) sc.innerHTML=rainScoreH(); };
  const tell=win=>send('rp',{id:me,pops:r.pops[me],miss:r.miss[me],win:!!win});
  const pop=w=>{ w.el.classList.add('pop'); setTimeout(()=>w.el.remove(),200); r.words=r.words.filter(x=>x!==w); };
  const check=()=>{ if(r.dead) return; const v=inp.value.trim(); const w=r.words.find(x=>x.t===v); if(w){ sfx('ok'); pop(w); r.pops[me]++; r.keys+=strokes(v)+1; const c=cpm(); if(r.pops[me]>=3) r.top=Math.max(r.top,c); const rs=screen.querySelector('#rsp'); if(rs) rs.textContent=c; inp.value=''; flash('깼어요! +1',true); r.redraw(); const won=r.pops[me]>=RM.n&&!RM.first; tell(won); if(won) r.win(me); } };
  inp.oninput=check;
  screen.querySelector('#tform').onsubmit=e=>{ e.preventDefault(); if(r.dead) return; const v=inp.value.trim(); if(!v) return; if(!r.words.some(x=>x.t===v)){ sfx('no'); r.miss[me]++; inp.value=''; flash(`틀렸어요 −1`,false); missAdd({key:null}); r.redraw(); tell(); } else check(); };
  const spawn=()=>{ const t=r.seq[r.si++%r.seq.length], el=document.createElement('span'); el.className='drop'; el.textContent=t; el.style.left=(4+Math.random()*62)+'%'; box.appendChild(el); r.words.push({t,el,y:-30}); };
  const step=()=>{ if(r.dead||!RM) return; const now=performance.now(), el=(now-r.t0)/1000, left=120-el; const dt=Math.min(.05,(now-(r.prev||now))/1000); r.prev=now;
    const lv=Math.floor(r.pops[me]/5), gap=Math.max(900,1900-lv*180), sp=38+lv*7;
    if(now-r.lastSpawn>gap||!r.words.length){ spawn(); r.lastSpawn=now; }
    r.words.slice().forEach(w=>{ w.y+=sp*dt; w.el.style.transform=`translateY(${w.y}px)`; if(w.y>H()-28){ w.el.classList.add('hit'); setTimeout(()=>w.el.remove(),250); r.words=r.words.filter(x=>x!==w); r.miss[me]++; sfx('no'); flash(`'${w.t}' 놓쳤어요 −1`,false); r.redraw(); tell(); } });
    const s=screen.querySelector('#tsec'); if(s) s.textContent=Math.ceil(Math.max(0,left))+'초'; if(!r.tick||now-r.tick>500){ r.tick=now; const rs=screen.querySelector('#rsp'); if(rs) rs.textContent=cpm(); }
    if(left<=0) return finish(null);
    r.raf=requestAnimationFrame(step); };
  r.raf=requestAnimationFrame(step);
  r.win=id=>{ if(RM.first||r.dead) return; RM.first=id; finish(id); };
  if(amHost()) RM.players.filter(p=>p.bot).forEach(p=>{ const go=()=>{ if(r.dead||!RM) return; const len=[...(r.seq[((r.pops[p.id]||0)+(r.miss[p.id]||0))%r.seq.length]||'abc')].length;
    later(()=>{ if(r.dead||!RM) return; if(Math.random()<p.skill) r.pops[p.id]=(r.pops[p.id]||0)+1; else r.miss[p.id]=(r.miss[p.id]||0)+1; r.redraw();
      const won=r.pops[p.id]>=RM.n&&!RM.first; send('rp',{id:p.id,pops:r.pops[p.id],miss:r.miss[p.id],win:won}); if(won) r.win(p.id); else go(); },(1000+len*(lang==='ko'?520:300))*(1.7-p.skill)*(0.75+Math.random()*0.6)); }; later(go,800+Math.random()*900); });
  function finish(id){ if(r.dead) return; r.dead=true; cancelAnimationFrame(r.raf); const el=(performance.now()-r.t0)/1000;
    RM.spd={avg:cpm(),top:r.top||cpm(),keys:r.keys}; typCpm(RM.spd.avg); RM.qs=[]; RM.players.forEach(p=>{ RM.right[p.id]=r.pops[p.id]||0; RM.wrong[p.id]=r.miss[p.id]||0; RM.score[p.id]=(r.pops[p.id]||0)-(r.miss[p.id]||0); RM.time[p.id]=p.id===id?el:120; });
    const who=id&&RM.players.find(p=>p.id===id);
    flash(isMe(id)?'먼저 다 깼어요! 우승!':who?`${who.name}님이 먼저 다 깼어요`:'시간이 끝났어요',isMe(id)); inp.disabled=true;
    later(endMatch,1400); }
}

/* ---------- 문제 대결: 방장이 다음 문제·정답 공개를 정한다 ---------- */
function scoreH(){ return `<div class="score">${RM.players.map(p=>`<div class="${isMe(p.id)?'mine':''}">${RM.ans&&RM.ans[p.id]!==undefined?`<span class="done">${LI('check')}</span>`:''}${avatar(p.eq,36)}<span>${esc(isMe(p.id)?'나':p.name)}</span><b>${RM.score[p.id]||0}</b></div>`).join('')}</div>`; }
function hostNext(){
  if(!RM||!amHost()||RM.phase!=='play') return;
  const qi=RM.qi+1;
  if(qi>=RM.qs.length){ send('end',{}); RT.update(RM.code,{state:'wait'}); return endMatch(); }
  send('q',{qi}); showQ(qi);
}
function showQ(qi){
  if(!RM||RM.phase!=='play') return; const c=RM.qs[qi]; if(!c) return;
  if(RM.iv){ clearInterval(RM.iv); RM.iv=null; }
  RM.qi=qi; RM.ans={}; RM.t0=performance.now(); RM.reveal=false;
  screen.innerHTML=`<div class="play"><div id="sc">${scoreH()}</div>
    <div class="qtop"><span>${qi+1} / ${RM.qs.length}</span><span id="tsec">${QT}초</span></div><div class="timer"><i id="tbar"></i></div>
    ${qBoxH(c)}${optsH(c)}<div class="fbk" id="fb"></div></div>`;
  screen.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>answerQ(c.c[+b.dataset.o],b));
  bindType(c,v=>answerQ(v,null));
  RM.iv=setInterval(()=>{ if(!RM) return; const left=QT*1000-(performance.now()-RM.t0); const t=screen.querySelector('#tbar'); if(t) t.style.transform=`scaleX(${Math.max(0,left/(QT*1000))})`; const s=screen.querySelector('#tsec'); if(s) s.textContent=Math.ceil(Math.max(0,left)/1000)+'초';
    if(left<=0){ if(amHost()) hostReveal(); else { clearInterval(RM.iv); RM.iv=null; } } },100);
  if(amHost()) RM.players.filter(p=>p.bot).forEach(p=>{ const t=c.kind==='type'?(900+[...c.ans].length*(c.lang==='ko'?420:260)*(1.6-p.skill)*(0.8+Math.random()*0.5)):(p.spd[0]+Math.random()*(p.spd[1]-p.spd[0]))*1000*(c.kind==='long'||c.kind==='desc'?1.4:1);
    if(t<QT*1000) later(()=>{ if(!RM||RM.reveal||RM.qi!==qi) return; const pts=Math.random()<p.skill?1:-1; send('ans',{id:p.id,qi,pts,t:t/1000}); record(p.id,pts,t/1000); },t); });
}
function record(id,pts,t){ RM.ans[id]=pts; RM.score[id]=(RM.score[id]||0)+pts; if(pts>0){ RM.right[id]=(RM.right[id]||0)+1; RM.time[id]=(RM.time[id]||0)+t; } else if(pts<0) RM.wrong[id]=(RM.wrong[id]||0)+1;
  const sc=screen.querySelector('#sc'); if(sc) sc.innerHTML=scoreH();
  if(amHost()&&RM.players.every(p=>RM.ans[p.id]!==undefined)) later(hostReveal,350); }
function answerQ(you,btn){
  const me=MID(); if(!RM||RM.reveal||RM.ans[me]!==undefined) return; const c=RM.qs[RM.qi], ok=you===c.ans, left=Math.max(0,QT-(performance.now()-RM.t0)/1000), pts=ok?1:-1;
  sfx(ok?'ok':'no'); if(!ok) missAdd(c);
  screen.querySelectorAll('[data-o]').forEach(b=>b.disabled=true); const ti=screen.querySelector('#tin'); if(ti){ ti.disabled=true; ti.classList.add(ok?'ok':'no'); } if(btn) btn.classList.add(ok?'ok':'no');
  const f=screen.querySelector('#fb'); f.className='fbk '+(ok?'ok':'no'); f.textContent=ok?'정답! +1':'틀렸어요 −1';
  send('ans',{id:me,qi:RM.qi,pts,t:QT-left}); record(me,pts,QT-left);
}
function gotAns(p){ if(!RM||RM.phase!=='play'||p.qi!==RM.qi||RM.reveal||RM.ans[p.id]!==undefined) return; record(p.id,p.pts,p.t); }
function hostReveal(){ if(!RM||RM.reveal||!amHost()) return; send('rev',{qi:RM.qi}); revealQ(); later(hostNext,1300); }
function revealQ(){
  if(!RM||RM.reveal) return; RM.reveal=true; if(RM.iv){ clearInterval(RM.iv); RM.iv=null; } const c=RM.qs[RM.qi]; if(!c) return;
  RM.players.forEach(p=>{ if(RM.ans[p.id]===undefined) RM.ans[p.id]=0; });
  screen.querySelectorAll('[data-o]').forEach(b=>{ b.disabled=true; if(c.c[+b.dataset.o]===c.ans) b.classList.add('ok'); });
  const f=screen.querySelector('#fb'); if(f&&!f.textContent){ f.className='fbk no'; f.textContent='시간이 끝났어요 · 0점'; }
  const sc=screen.querySelector('#sc'); if(sc) sc.innerHTML=scoreH();
}
function endMatch(){
  if(!RM||RM.phase==='end') return;
  const st=S(), me=MID(); clearT(); RM.phase='end'; view='room';
  const rank=RM.players.slice().sort((a,b)=>((RM.first===b.id)-(RM.first===a.id))||((RM.score[b.id]||0)-(RM.score[a.id]||0))||((RM.time[a.id]||0)-(RM.time[b.id]||0))); const my=rank.findIndex(p=>isMe(p.id))+1;
  const gain=HG.gEarn(Math.max(0,RM.score[me]||0)); st.battles=(st.battles||0)+1; if(my===1) st.wins=(st.wins||0)+1; HG.save();
  setBar('대결 결과',()=>{ leaveRoom(); });
  const pod=[rank[1],rank[0],rank[2]];
  screen.innerHTML=`<section class="sec center">
    <h3 class="sh" style="justify-content:center">${my===1?`${LI('trophy')}우승!`:`${my}등`}</h3>
    <div class="podium">${pod.map((p,i)=>p?`<div class="pod p${[2,1,3][i]}">${avatar(p.eq,i===1?64:52)}<span>${esc(isMe(p.id)?'나':p.name)}</span><small>${RM.score[p.id]||0}점</small><div class="blk">${[2,1,3][i]}</div></div>`:'<div></div>').join('')}</div>
    <ul class="rlist">${rank.map((p,i)=>`<li class="${isMe(p.id)?'mine':''}"><span class="n">${i+1}</span>${avatar(p.eq,36)}<span class="nm">${esc(pName(p))}<small>맞힘 ${RM.right[p.id]||0} · 틀림 ${RM.wrong[p.id]||0} · ${(RM.time[p.id]||0).toFixed(1)}초</small></span><span class="v">${RM.score[p.id]||0}</span></li>`).join('')}</ul>
    ${RM.spd?`<div class="spdres"><div><small>내 평균 속도</small><b>${RM.spd.avg}<i>타/분</i></b></div><div><small>최고 속도</small><b>${RM.spd.top}<i>타/분</i></b></div><div><small>친 타수</small><b>${RM.spd.keys}<i>타</i></b></div></div>`:''}
    <p style="margin:14px 0 4px"><span class="reward">${LI('coins')}+${gain}</span></p>
    <p class="note">점수 = 맞힌 문제 − 틀린 문제 · 같으면 빨리 푼 사람이 위<br>캐시도 내 점수만큼 받아요 (0점 이하면 0, 게임 캐시는 하루 ${HG.GAME_CAP}까지)</p>
  </section>
  <section class="sec"><h3 class="sh">${LI('message-circle')}채팅</h3>${chatH()}</section>
  <section class="sec"><div class="row">${amHost()?`<button class="btn y" id="again">${LI('repeat')}한 판 더</button>`:''}<button class="btn line" id="toRoom">${LI('door-open')}방으로</button><button class="btn line" id="out">나가기</button></div></section>`;
  drawChat(); bindChat();
  if(amHost()){ RT.update(RM.code,{state:'wait'}); RM.players.filter(p=>p.bot).forEach(p=>later(()=>say(p,pick(BOT_SAY.end)),800+R(0,1600))); }
  const ag=screen.querySelector('#again'); if(ag) ag.onclick=()=>{ RM.phase='wait'; hostStart(); };
  screen.querySelector('#toRoom').onclick=()=>{ RM.phase='wait'; RM.ready=false; if(RM.ch) RM.ch.track(myMeta()); syncPlayers(); drawRoom(); };
  screen.querySelector('#out').onclick=()=>{ leaveRoom(); };
}

