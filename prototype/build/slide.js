/* 슬라이드 학습: 보기(크게 보고·듣고·설명 읽기) · 받아쓰기(소리만 불러 주고 직접 쓰기) */
(function(){
if(typeof P!=='function'||typeof curSt!=='function'||typeof render!=='function') return;
const KIND=typeof WD!=='undefined'?'eng':typeof CH!=='undefined'?'han':'it';
const SV=p=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const IC={
  play:SV('<polygon points="7 4 20 12 7 20 7 4" fill="currentColor"/>'),
  pause:SV('<rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/>'),
  prev:SV('<polyline points="15 18 9 12 15 6"/>'),
  next:SV('<polyline points="9 18 15 12 9 6"/>'),
  x:SV('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  set:SV('<line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="17" x2="20" y2="17"/><circle cx="9" cy="7" r="2.5" fill="#fff"/><circle cx="15" cy="17" r="2.5" fill="#fff"/>'),
  vol:SV('<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/>'),
  slide:SV('<rect x="3" y="5" width="18" height="14" rx="2"/><polygon points="10 9 15 12 10 15 10 9" fill="currentColor"/>'),
  star:SV('<polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3 12 2"/>'),
  starF:SV('<polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3 12 2" fill="currentColor"/>'),
  book:SV('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5V21h16"/>'),
  trash:SV('<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/>'),
  plus:SV('<path d="M12 5v14"/><path d="M5 12h14"/>'),
  eye:SV('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>')
};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const OK_KEY='hg-slide2-'+document.title;
let O={mode:'view',rate:0.95,rep:2,gap1:2,gap2:4,wgap:6,order:'seq',scope:'today',vko:'',ven:''};
try{ Object.assign(O,JSON.parse(localStorage.getItem(OK_KEY)||'{}')); }catch(e){}
if(O.mode!=='view'&&O.mode!=='dict') O.mode='view';
const saveO=()=>{ try{ localStorage.setItem(OK_KEY,JSON.stringify(O)); }catch(e){} };

/* ---------- 음성: 기기에서 가장 자연스러운 목소리 고르기 ---------- */
const canTTS=(()=>{ try{ return 'speechSynthesis' in window&&typeof SpeechSynthesisUtterance!=='undefined'; }catch(e){ return false; } })();
let VOICES=[];
const loadV=()=>{ try{ VOICES=speechSynthesis.getVoices()||[]; }catch(e){ VOICES=[]; } };
if(canTTS){ loadV(); try{ speechSynthesis.addEventListener('voiceschanged',loadV); }catch(e){} }
const GOOD=/natural|neural|online|premium|enhanced|siri|google/i, NAMES=/yuna|sora|sunhi|injoon|hyunsu|seoyeon|jimin|samantha|aria|jenny|ava|allison|guy|davis|libby|sonia/i, BAD=/compact|espeak|robot|novelty|whisper|zarvox|bells|bad news|jester|trinoids/i;
const vScore=v=>(GOOD.test(v.name)?50:0)+(NAMES.test(v.name)?25:0)+(v.localService===false?8:0)-(BAD.test(v.name)?80:0);
function voicesFor(lang){ const L=lang.slice(0,2).toLowerCase(); return VOICES.filter(v=>String(v.lang).slice(0,2).toLowerCase()===L).sort((a,b)=>vScore(b)-vScore(a)||(String(b.lang).replace('_','-').toLowerCase()===lang.toLowerCase())-(String(a.lang).replace('_','-').toLowerCase()===lang.toLowerCase())); }
function pickVoice(lang){ if(!VOICES.length) loadV(); const want=lang.startsWith('en')?O.ven:O.vko, vs=voicesFor(lang); return (want&&vs.find(v=>v.name===want))||vs[0]||null; }
let token=0;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function say(text,lang){ return new Promise(res=>{
  if(!text){ res(); return; }
  if(!canTTS){ setTimeout(res,500+String(text).length*120); return; }
  try{ speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(String(text)); u.lang=lang; u.rate=O.rate; u.pitch=1; u.volume=1;
    const v=pickVoice(lang); if(v){ u.voice=v; u.lang=v.lang; }
    let done=false; const fin=()=>{ if(!done){ done=true; res(); } }; u.onend=fin; u.onerror=fin; setTimeout(fin,2500+String(text).length*280/O.rate);
    speechSynthesis.speak(u); }catch(e){ res(); } }); }
const hush=()=>{ token++; cdStop(); try{ canTTS&&speechSynthesis.cancel(); }catch(e){} };

/* ---------- 카드 ---------- */
function face(id){
  if(KIND==='eng'){ const w=WD[id]; if(!w) return null;
    return {id,f:w.w,fs:w.w,fl:'en-US',sub:w.ipa?'/'+w.ipa.replace(/^\/|\/$/g,'')+'/':'',b:w.ko,bs:w.ko,cls:'en',dq:w.w,dl:'en-US',ans:w.w}; }
  if(KIND==='han'){
    if(String(id)[0]==='P'){ if(typeof PH==='undefined'||!PH.length) return null; const x=PH[+String(id).slice(1)]; if(!x) return null;
      return {id,f:x.p,fs:x.r,fl:'ko-KR',sub:x.r,b:x.m,bs:x.m,cls:'hz ph',dq:x.r,dl:'ko-KR',ans:x.p}; }
    const c=CH[id]; const hn=c?`${c.hun} ${c.eum}`:(typeof radHun==='function'?radHun(id):'');
    if(!hn) return null;
    return {id,f:id,fs:hn,fl:'ko-KR',sub:'',b:hn,bs:'',cls:'hz',dq:hn,dl:'ko-KR',ans:id}; }
  const it=IT[id]; if(!it||it.mc) return null;
  return {id,f:it.t,fs:it.t,fl:'ko-KR',sub:it.k||'',b:(it.d||'')+(it.yl?` (${it.yl})`:''),bs:it.d||'',cls:it.t.length>8?'long':'',dq:it.t,dl:'ko-KR',ans:it.t};
}
function detail(id){ try{
  if(KIND==='han'){ if(String(id)[0]==='P') return typeof phInfoHTML==='function'?phInfoHTML(id):''; if(CH[id]) return infoHTML(id); if(typeof RADI!=='undefined'&&RADI[id]) return radInfoHTML(id); return ''; }
  return infoHTML(id); }catch(e){ return ''; } }
/* ---------- 나만의 단어장 (과목·학생별) ---------- */
const WBK=()=>'hg-wb-'+document.title+'-'+((typeof S!=='undefined'&&S&&S.active)||'');
function wbLoad(){ try{ const v=JSON.parse(localStorage.getItem(WBK())||'null'); if(v&&Array.isArray(v.cats)&&v.cats.length) return v; }catch(e){} return {cats:[{id:'c0',name:'기본',items:[]}],cur:'c0'}; }
function wbSave(w){ try{ localStorage.setItem(WBK(),JSON.stringify(w)); }catch(e){} }
const inWB=id=>wbLoad().cats.some(c=>c.items.includes(id));
const wbCount=()=>{ const s=new Set(); wbLoad().cats.forEach(c=>c.items.forEach(x=>{ if(face(x)) s.add(x); })); return s.size; };
const chips=(lab,arr)=>arr&&arr.length?`<div class="sc-r"><em>${lab}</em><span>${arr.join(' · ')}</span></div>`:'';
function card(id){ const f=face(id); let h='';
  try{
  if(KIND==='eng'){ const x=WD[id], E=(typeof ETY!=='undefined'&&ETY[id])||{}, pr=a=>(a||[]).slice(0,3).map(([e,k])=>`<b>${esc(e)}</b> ${esc(k)}`);
    const sa=[...(E.syn||[]).slice(0,2).map(([e,k])=>`<b>${esc(e)}</b> ${esc(k)}`),...(E.ant||[]).slice(0,1).map(([e,k])=>`↔ <b>${esc(e)}</b> ${esc(k)}`)];
    h=`<div class="sc-top"><button class="sc-w en" data-a="sayf">${esc(x.w)}</button><div class="sc-tag">${x.ipa?`<span>/${esc(x.ipa)}/</span>`:''}<span>${esc(x.pos)}</span><span>${esc(LV[x.lv])}</span></div><div class="sc-m">${esc(x.ko)}</div></div>
      ${E.et?`<div class="sc-bx"><i>어원</i><p class="c3">${esc(E.et)}</p>${E.pt?`<small>${esc(E.pt)}</small>`:''}</div>`:''}
      ${x.ex?`<div class="sc-bx"><i>예문</i><p class="c2 en">${esc(x.ex)}</p><small class="c1">${esc(x.exko)}</small></div>`:''}
      <div class="sc-rs">${chips('같은 뿌리',pr(E.fam))}${chips('비슷·반대',sa)}${chips('표현',(E.ph||[]).slice(0,1).map(([e,k])=>`<b>${esc(e)}</b> ${esc(k)}`))}</div>`; }
  else if(KIND==='han'&&String(id)[0]==='P'){ const x=PH[+String(id).slice(1)];
    h=`<div class="sc-top"><button class="sc-w hz ph" data-a="sayf">${esc(x.p)}</button><div class="sc-tag"><span>${esc(x.r)}</span></div><div class="sc-m">${esc(x.m)}</div></div>
      ${x.x?`<div class="sc-bx"><i>풀이</i><p class="c4">${esc(x.x)}</p></div>`:''}
      <div class="sc-hg">${Array.from(x.p).map((c,k)=>`<span><b class="hz">${c}</b><small>${esc(x.h[k]||'')}</small></span>`).join('')}</div>`; }
  else if(KIND==='han'){ const c=CH[id];
    if(!c){ const R=RADI[id]; h=`<div class="sc-top"><button class="sc-w hz" data-a="sayf">${id}</button><div class="sc-tag"><span>부수</span>${R&&R.nick?`<span>${esc(R.nick)}</span>`:''}</div><div class="sc-m">${esc(f.b)}</div></div>${(()=>{ try{ const g=figHTML(id); return g?`<div class="sc-fig">${g}</div>`:''; }catch(e){ return ''; } })()}${R&&R.desc?`<div class="sc-bx"><i>만들어진 원리</i><p class="c4">${esc(R.desc)}</p></div>`:''}${chips('이 부수의 한자',((typeof BYRAD!=='undefined'&&BYRAD[id])||[]).slice(0,5).map(z=>`<b class="hz">${z}</b>`))}`; }
    else { const o=origin(id), ws=wordsOf(id).slice(0,3);
      h=`<div class="sc-top"><button class="sc-w hz" data-a="sayf">${id}</button><div class="sc-tag">${c.cj?'<span>천자문</span>':`<span>${LV[c.lv]}</span><span>부수 <b class="hz">${c.rad}</b></span><span>${c.st}획</span>`}</div><div class="sc-m">${esc(c.hun)} <em>${esc(c.eum)}</em></div></div>
        ${(()=>{ try{ const g=figHTML(id); return g?`<div class="sc-fig">${g}</div>`:''; }catch(e){ return ''; } })()}
        <div class="sc-bx"><i>${o.k}</i><p class="c3">${o.t}</p></div>
        ${ws.length?`<div class="sc-ws">${ws.map(w=>`<span><b class="hz">${w.cs.map(z=>z===id?`<u>${z}</u>`:z).join('')}</b>${esc(w.r)}<small>${esc(gloss(w))}</small></span>`).join('')}</div>`:''}`; } }
  else { const x=IT[id], u=x.unit, mates=u.items.filter(y=>y.t!==x.t).slice(0,4).map(y=>`<b>${esc(y.t)}</b>`);
    h=`<div class="sc-top"><div class="sc-kicker">${esc(u.title)}</div><button class="sc-w ${x.t.length>7?'lg':''}" data-a="sayf">${esc(x.t)}</button><div class="sc-tag"><span>${esc(x.k||'')}</span>${x.yl?`<span>${esc(x.yl)}</span>`:''}<span>${esc(LV[u.lv])}</span></div></div>
      <div class="sc-bx"><i>뜻</i><p class="c4">${esc(x.d)}</p></div>
      ${x.ex?`<div class="sc-bx"><i>예</i><p class="c2">${esc(x.ex)}</p></div>`:''}
      ${chips('함께 익힐 말',mates)}`; }
  }catch(e){ h=`<div class="sc-top"><div class="sc-w">${esc(f.f)}</div><div class="sc-m">${esc(f.b)}</div></div>`; }
  const on=inWB(id); return `<div class="sc"><button class="sc-star ${on?'on':''}" data-a="star" aria-label="${on?'단어장에 담김':'단어장에 담기'}">${on?IC.starF:IC.star}</button>${h}</div>`; }
function stageWithItems(p){
  const ok=s=>s&&((s.chars&&s.chars.length)||(s.ph&&s.ph.length));
  let s=curSt(p); if(ok(s)) return s;
  for(let i=Math.min((p.stage||0),STAGES.length-1);i>=0;i--) if(ok(STAGES[i])) return STAGES[i];
  return null; }
function build(){
  const p=P(), ids=[], add=x=>{ if(x!=null&&!ids.includes(x)&&face(x)) ids.push(x); };
  const wrong=dueCards(p).map(c=>c.ch);
  if(O.scope!=='unit') wrong.forEach(add);
  if(O.scope!=='wrong'){ const s=stageWithItems(p); if(s){ (s.ph||[]).forEach(i=>add('P'+i)); (s.chars||[]).forEach(add); } }
  let list=ids.slice(0,40);
  if(O.order==='rand'){ for(let i=list.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [list[i],list[j]]=[list[j],list[i]]; } }
  else if(O.order==='wrong'){ const w=list.filter(x=>wrong.includes(x)); list=w.concat(list.filter(x=>!wrong.includes(x))); }
  return list; }

/* ---------- 화면 ---------- */
let D0=[], idx=0, auto=false, root=null, shown=new Set(), seen=new Set();
const el=s=>root.querySelector(s);
function mount(){
  if(root) return;
  root=document.createElement('div'); root.className='slp'; root.hidden=true; root.setAttribute('role','dialog'); root.setAttribute('aria-label','슬라이드 학습');
  root.innerHTML=`<div class="slp-top"><button class="slp-ib" data-a="close" aria-label="닫기">${IC.x}</button><div class="slp-bar"><i></i></div><span class="slp-cnt"></span><button class="slp-ib" data-a="opts" aria-label="설정">${IC.set}</button></div>
  <div class="slp-seg" role="group" aria-label="모드"><button data-m="view">보기</button><button data-m="dict">받아쓰기</button></div>
  <div class="slp-main"></div>
  <div class="slp-cdw"><div class="slp-cd" aria-live="off" hidden></div></div><div class="slp-ctl"><button class="slp-ib" data-a="prev" aria-label="이전">${IC.prev}</button><button class="slp-ib slp-play" data-a="play" aria-label="자동 넘김">${IC.play}</button><button class="slp-ib" data-a="next" aria-label="다음">${IC.next}</button><button class="slp-spdb" data-a="spd" aria-label="말하기 속도"></button></div>
  <div class="slp-sheet" hidden><div class="slp-sh"></div></div>`;
  (document.querySelector('.app')||document.body).appendChild(root);
  root.addEventListener('click',onClick);
  let sx=null; root.addEventListener('touchstart',e=>{ if(e.target.closest('.slp-sheet')) return; sx=e.touches[0].clientX; },{passive:true});
  root.addEventListener('touchend',e=>{ if(sx==null) return; const dx=e.changedTouches[0].clientX-sx; sx=null; if(Math.abs(dx)>60) go(dx<0?1:-1); },{passive:true});
  document.addEventListener('keydown',e=>{ if(e.target&&e.target.matches&&e.target.matches('input')){ if(e.key==='Enter'&&e.target.matches('.wbin')){ const b=e.target.parentNode.querySelector('button'); b&&b.click(); } return; } if(!root||root.hidden) return; if(e.key==='ArrowRight') go(1); else if(e.key==='ArrowLeft') go(-1); else if(e.key==='Escape') close(); });
}
let CUST=null;
function open(deck,start,mode){
  CUST=Array.isArray(deck)?deck.filter(x=>face(x)):null; if(mode==='view'||mode==='dict'){ O.mode=mode; saveO(); }
  mount(); D0=CUST||build(); idx=Math.max(0,Math.min((start|0),D0.length-1)); auto=false; shown=new Set(); seen=new Set();
  root.hidden=false; try{ parent.hgSub&&parent.hgSub(window,true); }catch(e){}
  show(true);
}
function close(){ hush(); auto=false; if(root) root.hidden=true; if(CUST&&wb){ wb.hidden=false; wbPaint(); return; } render(); }
function chrome(){
  const n=D0.length;
  el('.slp-bar i').style.width=n?((Math.min(idx,n-1)+1)/n*100)+'%':'0';
  el('.slp-cnt').textContent=n?`${Math.min(idx,n-1)+1} / ${n}`:'';
  root.querySelectorAll('[data-m]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.m===O.mode)));
  root.querySelectorAll('[data-r]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.r===O.rate)));
  const pl=el('[data-a="play"]'); pl.innerHTML=auto?IC.pause:IC.play; pl.setAttribute('aria-label',auto?'자동 넘김 멈추기':'자동 넘김 시작');
  el('.slp-ctl').style.display=n?'':'none'; const sb=el('.slp-spdb'); sb.textContent=O.rate===0.95?'보통':O.rate+'×';
  root.querySelectorAll('.slp-sayic').forEach(()=>{});
}
function paint(){
  chrome(); const m=el('.slp-main'); m.scrollTop=0;
  if(!D0.length){ m.innerHTML=`<div class="slp-empty">${O.scope==='wrong'?'다시 볼 오답이 없어요.<br>설정에서 범위를 바꿔 보세요.':'볼 카드가 없어요.'}</div>`; return; }
  const f=face(D0[idx]);
  if(O.mode==='view'){
    m.innerHTML=card(D0[idx]);
  } else {
    const open=shown.has(idx);
    m.innerHTML=`<div class="slp-dq"><div class="slp-no">${idx+1}<small>번</small></div>
      <button class="slp-spk" data-a="say" aria-label="다시 불러 주기">${IC.vol}</button>
      <div class="slp-ask">${KIND==='eng'?'단어를 듣고 공책에 철자를 써 보세요':KIND==='han'?(String(D0[idx])[0]==='P'?'읽는 소리를 듣고 구절을 한자로 써 보세요':'훈과 음을 듣고 한자를 써 보세요'):'불러 주는 말을 듣고 공책에 써 보세요'}</div>
      <div class="slp-ans ${open?'':'hid'}"><b class="${f.cls.includes('hz')?'hz':f.cls==='en'?'en':''}">${esc(f.ans)}</b><small>${esc(f.b)}</small></div>
      <button class="slp-chip" data-a="peek">${IC.eye}${open?'정답 가리기':'정답 보기'}</button></div>`;
  }
}
async function show(first){
  paint(); const my=++token; seen.add(idx);
  if(!D0.length) return;
  const f=face(D0[idx]);
  if(O.mode==='view'){
    for(let r=0;r<(auto?O.rep:1);r++){ await say(f.fs,f.fl); if(my!==token) return; if(f.bs){ await wait(O.gap1*500); if(my!==token) return; await say(f.bs,'ko-KR'); if(my!==token) return; } if(r<O.rep-1&&auto) await wait(700); }
    if(!auto) return; await countdown(O.gap2*1000,my); if(my!==token) return; next();
  } else {
    for(let r=0;r<O.rep;r++){ await say(f.dq,f.dl); if(my!==token) return; if(r<O.rep-1) await wait(Math.max(1500,O.wgap*400)); if(my!==token) return; }
    if(!auto) return; await countdown(O.wgap*1000,my); if(my!==token) return; next();
  }
}
function next(){ if(idx<D0.length-1){ idx++; show(); } else finish(); }
/* 다음 카드까지 남은 시간: 재생 버튼 둘레 링 + 숫자 */
let cdT=null;
function cdStop(){ clearInterval(cdT); cdT=null; if(!root) return; const c=root.querySelector('.slp-cd'); if(c) c.hidden=true; const p=root.querySelector('.slp-play'); if(p){ p.classList.remove('cd'); p.style.removeProperty('--cd'); } }
function countdown(ms,my){ return new Promise(res=>{ const t0=Date.now(), lab=el('.slp-cd'), pl=el('.slp-play'); lab.hidden=false; pl.classList.add('cd');
  const tick=()=>{ if(my!==token){ cdStop(); res(); return; } const left=Math.max(0,ms-(Date.now()-t0)); pl.style.setProperty('--cd',(1-left/ms).toFixed(3));
    lab.innerHTML=`<i style="width:${((1-left/ms)*100).toFixed(1)}%"></i><span>${O.mode==='dict'?'쓰는 시간':'다음 카드까지'} <b>${Math.ceil(left/1000)}</b>초</span>`;
    if(left<=0){ cdStop(); res(); } };
  clearInterval(cdT); tick(); cdT=setInterval(tick,100); }); }
function go(d){ if(!D0.length) return; hush(); if(d>0&&idx>=D0.length-1){ finish(); return; } idx=Math.max(0,Math.min(D0.length-1,idx+d)); show(); }
function finish(){
  hush(); auto=false; chrome(); el('.slp-ctl').style.display='none'; el('.slp-bar i').style.width='100%';
  const dict=O.mode==='dict', m=el('.slp-main'); m.scrollTop=0;
  m.innerHTML=`<div class="slp-done"><h2>${dict?'받아쓰기 끝! 정답을 맞춰 보세요':'한 덱을 다 봤어요'}</h2>
    ${dict?`<ol class="slp-key">${D0.map(id=>{ const f=face(id); return `<li><b class="${f.cls.includes('hz')?'hz':f.cls==='en'?'en':''}">${esc(f.ans)}</b><span>${esc(f.b)}</span><button class="slp-ib sm" data-sayid="${esc(id)}" aria-label="${esc(f.ans)} 듣기">${IC.vol}</button></li>`; }).join('')}</ol>`:`<p class="slp-ex">${D0.length}개 카드를 봤어요. 이제 받아쓰기로 확인해 볼까요?</p>`}
    <div class="slp-acts">${dict?'<button class="slp-btn ghost" data-a="again">처음부터 다시</button><button class="slp-btn ghost" data-a="toview">보기로</button>':'<button class="slp-btn ghost" data-a="again">처음부터 다시</button><button class="slp-btn ghost" data-a="todict">받아쓰기 하기</button>'}<button class="slp-btn" data-a="close">닫기</button></div></div>`;
}
function paintStar(){ const b=root.querySelector('.sc-star'); if(!b) return; const on=inWB(D0[idx]); b.classList.toggle('on',on); b.innerHTML=on?IC.starF:IC.star; }
function starSheet(id){ const w=wbLoad(), f=face(id);
  el('.slp-sheet').hidden=false;
  el('.slp-sh').innerHTML=`<h3>단어장에 담기<button class="slp-ib" data-a="shclose" aria-label="닫기">${IC.x}</button></h3>
    <p class="slp-note"><b>${esc(f.f)}</b> · 담을 카테고리를 골라요. 여러 곳에 담을 수 있어요.</p>
    <div class="slp-row"><div>${w.cats.map(c=>`<button class="slp-chip" data-a="wbt" data-c="${c.id}" data-id="${esc(id)}" aria-pressed="${c.items.includes(id)}">${c.items.includes(id)?'✓ ':''}${esc(c.name)} <small>&nbsp;${c.items.length}</small></button>`).join('')}</div></div>
    <div class="slp-row"><b>새 카테고리 만들고 담기</b><div class="wbnew"><input class="wbin" maxlength="20" placeholder="예: 헷갈리는 단어, 시험 범위" aria-label="새 카테고리 이름"><button class="slp-btn" data-a="wbnew" data-id="${esc(id)}">만들기</button></div></div>`; }
function sheet(){
  const g=(k,vals,lab)=>`<div class="slp-row"><b>${lab}</b><div>${vals.map(([v,t])=>`<button class="slp-chip" data-k="${k}" data-v="${v}" aria-pressed="${String(O[k])===String(v)}">${t}</button>`).join('')}</div></div>`;
  const vsel=(k,lang,lab)=>{ const vs=voicesFor(lang); if(!vs.length) return `<div class="slp-row"><b>${lab}</b><p class="slp-note">이 기기에는 ${lang.startsWith('en')?'영어':'한국어'} 목소리가 없어요.</p></div>`; const cur=(pickVoice(lang)||{}).name;
    return `<div class="slp-row"><b>${lab}</b><select class="slp-sel" data-vk="${k}" aria-label="${lab}">${vs.map(v=>`<option value="${esc(v.name)}" ${v.name===cur?'selected':''}>${esc(v.name.replace(/^(Microsoft|Google)\s*/,'').replace(/\s*-\s*.*$/,''))}${GOOD.test(v.name)?' · 자연스러운 목소리':''}</option>`).join('')}</select><button class="slp-chip" data-a="test" data-tl="${lang}">들어 보기</button></div>`; };
  el('.slp-sheet').hidden=false;
  el('.slp-sh').innerHTML=`<h3>슬라이드 설정<button class="slp-ib" data-a="shclose" aria-label="닫기">${IC.x}</button></h3>
    ${g('scope',[['today','오늘 할 일'],['wrong','오답만'],['unit','지금 단원']],'범위')}
    ${g('order',[['seq','차례대로'],['rand','무작위'],['wrong','오답 먼저']],'순서')}
    ${g('rep',[[1,'1번'],[2,'2번'],[3,'3번']],'카드마다 읽어 주는 횟수')}
    ${g('gap2',[[3,'3초'],[4,'4초'],[6,'6초'],[10,'10초']],'보기: 다음 카드까지 (자동 넘김)')}
    ${g('wgap',[[4,'4초'],[6,'6초'],[8,'8초'],[12,'12초']],'받아쓰기: 쓰는 시간 (자동 넘김)')}
    ${g('rate',[[0.5,'0.5×'],[0.75,'0.75×'],[0.95,'보통'],[1.25,'1.25×'],[1.5,'1.5×'],[2,'2×'],[3,'3×'],[4,'4×']],'말하기 속도')}
    ${KIND==='eng'?vsel('ven','en-US','영어 목소리'):''}${vsel('vko','ko-KR','한국어 목소리')}`;
  el('.slp-sh').querySelectorAll('.slp-sel').forEach(s=>s.onchange=()=>{ O[s.dataset.vk]=s.value; saveO(); say(s.dataset.vk==='ven'?'Hello, nice to meet you.':'안녕하세요, 함께 공부해요.',s.dataset.vk==='ven'?'en-US':'ko-KR'); });
}
function onClick(e){
  if(e.target===el('.slp-sheet')){ el('.slp-sheet').hidden=true; return; }
  const t=e.target.closest('button,[data-a]'); if(!t||t.tagName==='SELECT') return;
  if(t.dataset.say!=null&&!t.dataset.a){ e.stopPropagation(); say(t.dataset.say,KIND==='eng'?'en-US':'ko-KR'); return; }
  if(t.dataset.sayid!=null){ const f=face(t.dataset.sayid); if(f) say(f.dq,f.dl); return; }
  if(t.dataset.m){ if(O.mode!==t.dataset.m){ O.mode=t.dataset.m; saveO(); hush(); auto=false; idx=0; shown=new Set(); show(); } return; }
  if(t.dataset.r){ O.rate=+t.dataset.r; saveO(); chrome(); return; }
  if(t.dataset.k){ const k=t.dataset.k, v=t.dataset.v; O[k]=['rep','gap1','gap2','wgap','rate'].includes(k)?+v:v; saveO(); sheet();
    if(k==='scope'||k==='order'){ hush(); auto=false; D0=build(); idx=0; shown=new Set(); paint(); } return; }
  const a=t.dataset.a; if(!a) return;
  if(a==='close') close();
  else if(a==='opts') sheet();
  else if(a==='shclose') el('.slp-sheet').hidden=true;
  else if(a==='test'){ const l=t.dataset.tl; say(l.startsWith('en')?'Hello, nice to meet you.':'안녕하세요, 함께 공부해요.',l); }
  else if(a==='play'){ auto=!auto; chrome(); if(auto) show(); else hush(); }
  else if(a==='spd'){ const R=[0.5,0.75,0.95,1.25,1.5,2,3,4]; O.rate=R[(R.indexOf(O.rate)+1)%R.length]||0.95; saveO(); chrome(); }
  else if(a==='star') starSheet(D0[idx]);
  else if(a==='wbt'){ const w=wbLoad(), c=w.cats.find(c=>c.id===t.dataset.c), id=t.dataset.id; if(c){ const i=c.items.indexOf(id); if(i>=0) c.items.splice(i,1); else c.items.unshift(id); wbSave(w); } starSheet(id); paintStar(); }
  else if(a==='wbnew'){ const inp=root.querySelector('.slp-sh .wbin'), nm=(inp&&inp.value||'').trim(); if(!nm) return; const w=wbLoad(), c={id:'c'+Date.now().toString(36),name:nm.slice(0,20),items:[t.dataset.id]}; w.cats.push(c); wbSave(w); starSheet(t.dataset.id); paintStar(); }
  else if(a==='prev') go(-1);
  else if(a==='next') go(1);
  else if(a==='sayf'){ const f=face(D0[idx]); hush(); (async()=>{ await say(f.fs,f.fl); if(f.bs) await say(f.bs,'ko-KR'); })(); }
  else if(a==='say'){ const f=face(D0[idx]); hush(); say(f.dq,f.dl); }
  else if(a==='peek'){ if(shown.has(idx)) shown.delete(idx); else shown.add(idx); paint(); }
  else if(a==='again'){ D0=CUST||build(); idx=0; shown=new Set(); auto=false; show(); }
  else if(a==='todict'){ O.mode='dict'; saveO(); idx=0; shown=new Set(); auto=false; show(); }
  else if(a==='toview'){ O.mode='view'; saveO(); idx=0; auto=false; show(); }
}
window.hgSlide=open;

/* ---------- 나만의 단어장 화면 ---------- */
let wb=null, wbEdit=false;
function wbOpen(){
  if(!wb){ wb=document.createElement('div'); wb.className='slp wbp'; wb.setAttribute('role','dialog'); wb.setAttribute('aria-label','나의 단어장');
    (document.querySelector('.app')||document.body).appendChild(wb);
    wb.addEventListener('click',wbClick);
    wb.addEventListener('keydown',e=>{ if(e.key==='Enter'&&e.target.matches('.wbin')){ e.preventDefault(); const b=e.target.parentNode.querySelector('button'); b&&b.click(); } }); }
  wb.hidden=false; wbEdit=false; try{ parent.hgSub&&parent.hgSub(window,true); }catch(e){} wbPaint(); }
function wbClose(){ if(wb) wb.hidden=true; render(); }
function wbPaint(){
  const w=wbLoad(); let c=w.cats.find(x=>x.id===w.cur)||w.cats[0]; w.cur=c.id;
  const items=c.items.filter(x=>face(x));
  wb.innerHTML=`<div class="slp-top"><button class="slp-ib" data-w="close" aria-label="닫기">${IC.x}</button><h2 class="wb-h">나의 단어장</h2><button class="slp-ib" data-w="edit" aria-label="카테고리 관리">${IC.set}</button></div>
    <div class="wb-cats" role="tablist">${w.cats.map(x=>`<button role="tab" aria-selected="${x.id===c.id}" data-w="cat" data-c="${x.id}">${esc(x.name)}<small>${x.items.filter(y=>face(y)).length}</small></button>`).join('')}<button class="wb-add" data-w="newcat" aria-label="새 카테고리">${IC.plus}</button></div>
    ${wbEdit?`<div class="wb-edit"><div class="wbnew"><input class="wbin" maxlength="20" value="${esc(c.name)}" aria-label="카테고리 이름"><button class="slp-btn" data-w="rename">이름 바꾸기</button></div>${w.cats.length>1?`<button class="wb-del" data-w="delcat">${IC.trash}'${esc(c.name)}' 카테고리 지우기</button>`:''}</div>`:''}
    <div class="wb-acts"><button class="slp-btn" data-w="view" ${items.length?'':'disabled'}>${IC.slide}슬라이드로 복습</button><button class="slp-btn ghost" data-w="dict" ${items.length?'':'disabled'}>받아쓰기</button></div>
    <div class="slp-main wb-list">${items.length?`<ol>${items.map((id,i)=>{ const f=face(id); return `<li><button class="wb-it" data-w="go" data-i="${i}"><b class="${f.cls.includes('hz')?'hz':f.cls==='en'?'en':''}">${esc(f.f)}</b><span>${esc(f.b)}</span></button><button class="slp-ib sm" data-w="say" data-id="${esc(id)}" aria-label="듣기">${IC.vol}</button><button class="slp-ib sm" data-w="rm" data-id="${esc(id)}" aria-label="빼기">${IC.x}</button></li>`; }).join('')}</ol>`:`<div class="slp-empty">아직 담은 단어가 없어요.<br>슬라이드 카드 오른쪽 위 <b>☆</b>을 눌러<br>이 카테고리에 담아 보세요.</div>`}</div>
    <div class="slp-sheet" hidden><div class="slp-sh"></div></div>`;
  wbSave(w); }
function wbClick(e){
  const sh=wb.querySelector('.slp-sheet'); if(e.target===sh){ sh.hidden=true; return; }
  const t=e.target.closest('[data-w]'); if(!t) return; const a=t.dataset.w, w=wbLoad(), c=w.cats.find(x=>x.id===w.cur)||w.cats[0];
  const items=c.items.filter(x=>face(x));
  if(a==='close') wbClose();
  else if(a==='cat'){ w.cur=t.dataset.c; wbSave(w); wbEdit=false; wbPaint(); }
  else if(a==='edit'){ wbEdit=!wbEdit; wbPaint(); }
  else if(a==='newcat'){ sh.hidden=false; sh.querySelector('.slp-sh').innerHTML=`<h3>새 카테고리<button class="slp-ib" data-w="shx" aria-label="닫기">${IC.x}</button></h3><div class="slp-row"><div class="wbnew"><input class="wbin" maxlength="20" placeholder="예: 시험 범위, 헷갈리는 단어" aria-label="새 카테고리 이름"><button class="slp-btn" data-w="mkcat">만들기</button></div></div>`; const i=sh.querySelector('.wbin'); i&&i.focus(); }
  else if(a==='shx') sh.hidden=true;
  else if(a==='mkcat'){ const nm=(sh.querySelector('.wbin').value||'').trim(); if(!nm) return; const id='c'+Date.now().toString(36); w.cats.push({id,name:nm.slice(0,20),items:[]}); w.cur=id; wbSave(w); wbPaint(); }
  else if(a==='rename'){ const nm=(wb.querySelector('.wb-edit .wbin').value||'').trim(); if(!nm) return; c.name=nm.slice(0,20); wbSave(w); wbEdit=false; wbPaint(); }
  else if(a==='delcat'){ if(w.cats.length<2) return; if(!t.dataset.sure){ t.dataset.sure='1'; t.innerHTML=`${IC.trash}한 번 더 누르면 지워져요 (담긴 ${c.items.length}개)`; return; } w.cats=w.cats.filter(x=>x!==c); w.cur=w.cats[0].id; wbSave(w); wbEdit=false; wbPaint(); }
  else if(a==='rm'){ c.items=c.items.filter(x=>x!==t.dataset.id); wbSave(w); wbPaint(); }
  else if(a==='say'){ const f=face(t.dataset.id); if(f){ hush(); (async()=>{ await say(f.fs,f.fl); if(f.bs) await say(f.bs,'ko-KR'); })(); } }
  else if(a==='view'||a==='dict'||a==='go'){ wb.hidden=true; open(items,a==='go'?+t.dataset.i:0,a==='dict'?'dict':'view'); }
}
window.hgWordbook=wbOpen;


/* 홈 TODAY 줄 오른쪽에 버튼 */
const r0=render; render=function(){ r0.apply(this,arguments);
  try{ const row=[...document.querySelectorAll('#screen .hrow')].find(r=>/TODAY/.test(r.textContent)); if(row&&!row.querySelector('.slbtn')) { const n=wbCount(); row.insertAdjacentHTML('beforeend',`<span class="slbtns"><button class="slbtn wb" type="button" onclick="hgWordbook()">${IC.book}단어장${n?`<em>${n}</em>`:''}</button><button class="slbtn" type="button" onclick="hgSlide()">${IC.slide}슬라이드</button></span>`); } }catch(e){} };
render();
})();
