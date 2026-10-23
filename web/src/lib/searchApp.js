/* eslint-disable */
// @ts-nocheck
/* 통합 검색 — prototype/build/search.js 그대로 (자동 생성: scripts/search-app.mjs, 직접 고치지 않기) */
/* 통합 학습 검색: 영단어·한자·천자문·국어·과학·역사 (단어·용어·단원) */
export function createSearch(env){
const IDX=env.idx;
const SN={eng:['영단어','#7C3AED'],hanja:['한자','#C2410C'],kor:['국어','#0B8A5F'],sci:['과학','#4F46E5'],hist:['역사','#8B5A2B']};
const TY={w:'단어',h:'한자',p:'천자문',t:'용어',u:'단원'};
const FIL=[['all','전체'],['eng','영단어'],['hanja','한자'],['cjm','천자문'],['kor','국어'],['sci','과학'],['hist','역사'],['unit','단원']];
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SV=p=>`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const IC={search:SV('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),back:SV('<path d="m15 18-6-6 6-6"/>'),x:SV('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),vol:SV('<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/>'),go:SV('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>'),clock:SV('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>')};
/* 초성 검색 */
const CHO='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const cho=s=>Array.from(s).map(c=>{ const k=c.charCodeAt(0)-0xAC00; return k>=0&&k<11172?CHO[Math.floor(k/588)]:c; }).join('');
const norm=s=>String(s||'').toLowerCase().replace(/\s+/g,'');
const isCho=q=>/^[ㄱ-ㅎ]+$/.test(q);
/* 미리 계산 */
const ROWS=IDX.map((r,i)=>({i,ty:r[0],s:r[1],t:r[2],m:r[3],meta:r[4],ext:r[5],kw:r[6]||'',u:r[7],nt:norm(r[2]),nm:norm(r[3]),nk:norm(r[6]||''),ne:norm(r[5]),ct:cho(norm(r[2]))}));
const unitOf=r=>r.u!=null?ROWS[r.u]:null;
function search(q,fil){
  const n=norm(q); if(!n) return [];
  const ch=isCho(n), out=[];
  for(const r of ROWS){
    if(fil!=='all'){ if(fil==='cjm'){ if(r.ty!=='p') continue; } else if(fil==='unit'){ if(r.ty!=='u') continue; } else if(fil==='hanja'){ if(r.s!=='hanja'||r.ty==='p') continue; } else if(r.s!==fil) continue; }
    let sc=0;
    if(ch){ if(r.ct===n) sc=90; else if(r.ct.startsWith(n)) sc=70; else if(r.ct.includes(n)) sc=40; }
    else{
      if(r.nt===n) sc=100; else if(r.nt.startsWith(n)) sc=80; else if(r.nt.includes(n)) sc=62;
      else if(r.nm===n) sc=58; else if(r.nk.includes(n)) sc=50; else if(r.nm.includes(n)) sc=44; else if(n.length>=2&&r.ne.includes(n)) sc=18; }
    if(!sc) continue;
    if(r.ty==='u') sc+=6; sc-=Math.min(10,r.t.length/4);
    out.push([sc,r]); }
  out.sort((a,b)=>b[0]-a[0]); return out.slice(0,120).map(x=>x[1]); }
const hl=(s,q)=>{ const t=esc(s), n=String(q||'').trim(); if(!n||isCho(norm(n))) return t; const i=String(s).toLowerCase().indexOf(n.toLowerCase()); if(i<0) return t; return esc(String(s).slice(0,i))+'<mark>'+esc(String(s).slice(i,i+n.length))+'</mark>'+esc(String(s).slice(i+n.length)); };
/* 최근 검색 */
const RK='harugongbu-recent-search';
const recent=()=>{ try{ return JSON.parse(localStorage.getItem(RK)||'[]'); }catch(e){ return []; } };
const addRecent=q=>{ q=q.trim(); if(!q) return; const r=[q,...recent().filter(x=>x!==q)].slice(0,10); try{ localStorage.setItem(RK,JSON.stringify(r)); }catch(e){} };
const SUGG=['광합성','세종','energy','天地玄黃','자석','임진왜란','山','happy','맞춤법','ㄱㅎㅅ'];
/* 음성 */
function say(t,en){ try{ speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(t); u.lang=en?'en-US':'ko-KR'; u.rate=.95; const vs=speechSynthesis.getVoices().filter(v=>v.lang.slice(0,2)===(en?'en':'ko')); const g=vs.find(v=>/natural|neural|online|premium|enhanced|google|siri/i.test(v.name))||vs[0]; if(g) u.voice=g; speechSynthesis.speak(u); }catch(e){} }

let box=null, Q='', F='all', T=null;
function mount(){
  box=document.createElement('div'); box.className='srch'; box.hidden=true; box.setAttribute('role','dialog'); box.setAttribute('aria-label','학습 검색');
  box.innerHTML=`<div class="srh"><button class="hb" data-x aria-label="닫기">${IC.back}</button><label class="sri">${IC.search}<input type="search" id="srq" placeholder="단어·한자·용어·단원 검색" autocomplete="off" enterkeyhint="search"><button class="src" data-clear aria-label="지우기" hidden>${IC.x}</button></label></div>
    <div class="srf" role="tablist" aria-label="검색 범위">${FIL.map(([k,n])=>`<button role="tab" data-f="${k}" aria-selected="${k==='all'}">${n}</button>`).join('')}</div>
    <div class="srb" id="srb"></div>
    <div class="srd" hidden><div class="srdbg" data-dx></div><div class="srdp" role="dialog" aria-modal="true"></div></div>`;
  document.body.appendChild(box);
  const inp=box.querySelector('#srq');
  inp.addEventListener('input',()=>{ Q=inp.value; box.querySelector('[data-clear]').hidden=!Q; clearTimeout(T); T=setTimeout(paint,110); });
  inp.addEventListener('keydown',e=>{ if(e.key==='Enter'){ addRecent(inp.value); inp.blur(); } if(e.key==='Escape') close(); });
  box.addEventListener('click',onClick);
}
function open(){ if(!box) mount(); box.hidden=false; paint(); setTimeout(()=>{ const i=box.querySelector('#srq'); i&&i.focus(); },50); }
function close(){ if(box){ box.hidden=true; box.querySelector('.srd').hidden=true; } }
function row(r){ const sn=SN[r.s]||['',''], u=unitOf(r);
  const meta=r.ty==='t'&&u?`${r.meta?r.meta+' · ':''}${u.meta.split(' · ').slice(0,2).join(' · ')} · ${u.t}`:r.meta;
  return `<li><button class="srr" data-i="${r.i}"><span class="srt" style="--sc:${sn[1]}">${r.ty==='p'?'천자문':sn[0]}${r.ty==='u'?' 단원':''}</span>
    <span class="srm"><b class="${r.ty==='h'||r.ty==='p'?'hz':''}">${hl(r.t,Q)}</b><span>${hl(r.m,Q)}</span><small>${esc(meta)}</small></span></button></li>`; }
function paint(){
  box.querySelectorAll('[data-f]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.f===F)));
  const b=box.querySelector('#srb');
  if(!Q.trim()){ const rc=recent();
    b.innerHTML=`${rc.length?`<section><h3>최근 검색<button class="srl" data-clr>지우기</button></h3><div class="srchips">${rc.map(q=>`<button data-q="${esc(q)}">${IC.clock}${esc(q)}</button>`).join('')}</div></section>`:''}
      <section><h3>이렇게 찾아보세요</h3><div class="srchips">${SUGG.map(q=>`<button data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>
      <p class="srhelp">영어 단어, 한자(山), 훈음(메 산), 용어·인물(세종), 단원 이름, 뜻 일부로 찾을 수 있어요. 초성(ㄱㅎㅅ)만 써도 돼요.<br>모두 ${ROWS.length.toLocaleString()}개 학습 항목에서 찾아요.</p></section>`; return; }
  const rs=search(Q,F);
  if(!rs.length){ b.innerHTML=`<div class="sre"><b>'${esc(Q)}'</b>에 맞는 학습 내용이 없어요.<br>철자를 확인하거나 짧게 바꿔 보세요.</div>`; return; }
  const cnt={}; rs.forEach(r=>{ const k=r.ty==='p'?'cjm':r.ty==='u'?'unit':r.s; cnt[k]=(cnt[k]||0)+1; });
  b.innerHTML=`<p class="src2">${rs.length>=120?'120개 이상':rs.length+'개'} 찾았어요 ${F==='all'?`<span>${Object.entries(cnt).map(([k,n])=>`${(FIL.find(f=>f[0]===k)||[,k])[1]} ${n}`).join(' · ')}</span>`:''}</p><ul class="srls">${rs.map(row).join('')}</ul>`; }
function detail(r){
  const sn=SN[r.s]||['',''], u=unitOf(r), d=box.querySelector('.srd'), p=box.querySelector('.srdp');
  const en=r.ty==='w', meta=r.ty==='t'&&u?`${r.meta?r.meta+' · ':''}${u.meta}`:r.meta;
  p.innerHTML=`<div class="srdh"><span class="srt" style="--sc:${sn[1]}">${r.ty==='p'?'천자문':sn[0]} · ${TY[r.ty]}</span><button class="hb" data-dx aria-label="닫기">${IC.x}</button></div>
    <div class="srdt"><b class="${r.ty==='h'||r.ty==='p'?'hz':en?'en':''}">${esc(r.t)}</b><button class="srsay" data-say="${r.i}" aria-label="듣기">${IC.vol}</button></div>
    ${r.ty==="u"?"":`<div class="srdm">${esc(r.m)}</div>`}<div class="srdmeta">${esc(meta)}</div>
    ${r.ext?`<div class="srdx">${esc(r.ext).replace(/\n/g,'<br>')}</div>`:''}
    ${u?`<div class="srdu"><small>이 용어가 나오는 단원</small><b>${esc(u.t)}</b><span>${esc(u.meta)}</span></div>`:''}
    <button class="srgo" data-go="${r.s}" style="--sc:${sn[1]}">${sn[0]} 공부하러 가기${IC.go}</button>`;
  d.hidden=false; }
function onClick(e){
  const t=e.target.closest('button,[data-dx]'); if(!t) return;
  if(t.hasAttribute('data-x')) return close();
  if(t.hasAttribute('data-dx')){ box.querySelector('.srd').hidden=true; return; }
  if(t.hasAttribute('data-clear')){ const i=box.querySelector('#srq'); i.value=''; Q=''; t.hidden=true; paint(); i.focus(); return; }
  if(t.hasAttribute('data-clr')){ try{ localStorage.removeItem(RK); }catch(e){} paint(); return; }
  if(t.dataset.f){ F=t.dataset.f; paint(); return; }
  if(t.dataset.q!=null){ const i=box.querySelector('#srq'); i.value=t.dataset.q; Q=t.dataset.q; box.querySelector('[data-clear]').hidden=false; addRecent(Q); paint(); return; }
  if(t.dataset.i!=null){ addRecent(Q); detail(ROWS[+t.dataset.i]); return; }
  if(t.dataset.say!=null){ const r=ROWS[+t.dataset.say]; say(r.ty==='h'?r.m:r.ty==='p'?r.meta.split(' · ').pop():r.t, r.ty==='w'); return; }
  if(t.dataset.go){ close(); try{ env.go(t.dataset.go); }catch(err){} return; }
}


return { open, close, destroy(){ if(box) box.remove(); } };
}
