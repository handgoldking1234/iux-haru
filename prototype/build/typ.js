/* =========================================================
   타자하루 — 한글(2벌식) · 영문 타자 연습
   - 자리 연습: 기본 자리 → 윗줄 → 아랫줄 → Shift → 전체. 다음 칠 키와 손가락을 화면 자판에 표시
     한 판 30타, 틀림 상한 5개에 닿으면 처음부터. 통과하면 다음 단계가 열림
   - 낱말 연습(10개) · 짧은 글(5문장): 다 맞게 치면 자동으로 다음. 타수(분당 타)와 정확도
   - 산성비 게임: 떨어지는 낱말을 쳐서 없애기. 5개 놓치면 끝. 10개마다 빨라짐
   ========================================================= */
const TD=__DATA__;
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- 자판 ---------- */
const ROWS=[['KeyQ','KeyW','KeyE','KeyR','KeyT','KeyY','KeyU','KeyI','KeyO','KeyP'],['KeyA','KeyS','KeyD','KeyF','KeyG','KeyH','KeyJ','KeyK','KeyL','Semicolon'],['KeyZ','KeyX','KeyC','KeyV','KeyB','KeyN','KeyM','Comma','Period','Slash']];
const KO={KeyQ:['ㅂ','ㅃ'],KeyW:['ㅈ','ㅉ'],KeyE:['ㄷ','ㄸ'],KeyR:['ㄱ','ㄲ'],KeyT:['ㅅ','ㅆ'],KeyY:['ㅛ'],KeyU:['ㅕ'],KeyI:['ㅑ'],KeyO:['ㅐ','ㅒ'],KeyP:['ㅔ','ㅖ'],
  KeyA:['ㅁ'],KeyS:['ㄴ'],KeyD:['ㅇ'],KeyF:['ㄹ'],KeyG:['ㅎ'],KeyH:['ㅗ'],KeyJ:['ㅓ'],KeyK:['ㅏ'],KeyL:['ㅣ'],KeyZ:['ㅋ'],KeyX:['ㅌ'],KeyC:['ㅊ'],KeyV:['ㅍ'],KeyB:['ㅠ'],KeyN:['ㅜ'],KeyM:['ㅡ']};
const PUN={Semicolon:[';',':'],Comma:[',','<'],Period:['.','>'],Slash:['/','?'],Quote:["'",'"'],Digit1:['1','!']};
const FINGER={KeyQ:0,KeyA:0,KeyZ:0,KeyW:1,KeyS:1,KeyX:1,KeyE:2,KeyD:2,KeyC:2,KeyR:3,KeyF:3,KeyV:3,KeyT:3,KeyG:3,KeyB:3,KeyY:4,KeyH:4,KeyN:4,KeyU:4,KeyJ:4,KeyM:4,KeyI:5,KeyK:5,Comma:5,KeyO:6,KeyL:6,Period:6,KeyP:7,Semicolon:7,Slash:7,Quote:7,Space:8};
const FNAME=['왼손 새끼','왼손 약지','왼손 중지','왼손 검지','오른손 검지','오른손 중지','오른손 약지','오른손 새끼','엄지'];
const KEYOF={}; /* 글자(자모·영문) → [code, shift] */
Object.entries(KO).forEach(([c,[a,b]])=>{ KEYOF[a]=[c,false]; if(b) KEYOF[b]=[c,true]; });
ROWS.flat().forEach(c=>{ if(/^Key/.test(c)){ const l=c.slice(3).toLowerCase(); KEYOF[l]=[c,false]; KEYOF[l.toUpperCase()]=[c,true]; } });
Object.entries(PUN).forEach(([c,[a,b]])=>{ KEYOF[a]=[c,false]; KEYOF[b]=[c,true]; });
KEYOF[' ']=['Space',false];
const labelOf=(code,lang)=> lang==='ko'&&KO[code]?KO[code]:(/^Key/.test(code)?[code.slice(3)]:PUN[code]||[code]);

/* ---------- 한글 → 타건(자모) 분해 ---------- */
const CHO='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ', JUNG='ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ', JONG=['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const SPLIT={'ㅘ':'ㅗㅏ','ㅙ':'ㅗㅐ','ㅚ':'ㅗㅣ','ㅝ':'ㅜㅓ','ㅞ':'ㅜㅔ','ㅟ':'ㅜㅣ','ㅢ':'ㅡㅣ','ㄳ':'ㄱㅅ','ㄵ':'ㄴㅈ','ㄶ':'ㄴㅎ','ㄺ':'ㄹㄱ','ㄻ':'ㄹㅁ','ㄼ':'ㄹㅂ','ㄽ':'ㄹㅅ','ㄾ':'ㄹㅌ','ㄿ':'ㄹㅍ','ㅀ':'ㄹㅎ','ㅄ':'ㅂㅅ'};
const sp=j=>SPLIT[j]?[...SPLIT[j]]:[j];
function keys(str){ const out=[]; for(const ch of str){ const o=ch.charCodeAt(0)-0xAC00;
  if(o>=0&&o<11172){ out.push(CHO[Math.floor(o/588)],...sp(JUNG[Math.floor((o%588)/28)])); const jg=JONG[o%28]; if(jg) out.push(...sp(jg)); }
  else out.push(...sp(ch)); } return out; }

/* ---------- 상태 ---------- */
const KEY='typing-haru-v1';
function load(){ try{ return JSON.parse(localStorage.getItem(KEY)); }catch(e){ return null; } }
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(S)); }catch(e){} }
let S=load()||{lang:'ko',open:{ko:1,en:1},best:{ko:{},en:{}},log:[]};
const CAP_DRILL=5, CAP_WORD=5, CAP_SENT=8, LIVES=5;
/* 타자 순위: 속도(낱말·짧은 글 최고 타수, 정확도 90% 이상만) · 연습량(이번 주 정확하게 친 글자 수, 월요일 초기화) */
const RANK_ACC=90;
const weekNo=()=>{ const d=new Date(); return Math.floor((Math.floor((d.getTime()-d.getTimezoneOffset()*60000)/864e5)+3)/7); };
function addChars(lg,n){ const w=weekNo(); if(!S.wk||S.wk.w!==w) S.wk={w,ko:0,en:0}; S.wk[lg]=(S.wk[lg]||0)+n; save(); }
/* 하루공부 랭킹에 타자 속도 올리기 */
const sfx=k=>{ try{ parent!==window&&parent.hgSfx&&parent.hgSfx(k); }catch(e){} };
function pushCpm(c){ try{ const H=parent!==window&&parent.HGS; if(H&&c>(H.st.typCpm||0)){ H.st.typCpm=c; H.save(); } }catch(e){} }
function rankBest(lg,cpm,acc){ if(acc<RANK_ACC) return; pushCpm(cpm); const b=S.best[lg].rank; if(!b||cpm>b.cpm){ S.best[lg].rank={cpm,acc}; save(); } }
const myNick=()=>{ try{ if(parent!==window&&parent.HGS&&parent.HGS.st.name) return parent.HGS.st.name; }catch(e){} return '나'; };
const RUSERS=['번개손가락','별빛토끼','구구단마스터','한자왕콩이','영어고래','역사탐험가','맞춤법요정','키보드고양이','초록거북','하늘다람쥐','달빛여우','콩콩이'];
const rval=(i,lg,mode)=>{ const s=(i*37+11)%97; if(mode==='speed') return lg==='ko'?150+s*4:90+s*3; const d=(weekNo()*7)%7; return Math.round((lg==='ko'?400:300)+s*55*(0.6+((s+d)%5)/10)); };
let rkMode='speed';
const DRILLS={
  ko:[{n:'기본 자리',d:'ㅁㄴㅇㄹㅎ ㅗㅓㅏㅣ — 왼손 검지는 ㄹ, 오른손 검지는 ㅓ 위에(돌기 있는 키)',k:['KeyA','KeyS','KeyD','KeyF','KeyG','KeyH','KeyJ','KeyK','KeyL']},
      {n:'윗줄',d:'ㅂㅈㄷㄱㅅ ㅛㅕㅑㅐㅔ — 기본 자리에서 손가락을 위로 뻗어요',k:['KeyQ','KeyW','KeyE','KeyR','KeyT','KeyY','KeyU','KeyI','KeyO','KeyP']},
      {n:'아랫줄',d:'ㅋㅌㅊㅍ ㅠㅜㅡ — 손가락을 아래로 굽혀요',k:['KeyZ','KeyX','KeyC','KeyV','KeyB','KeyN','KeyM']},
      {n:'쌍자음·ㅒㅖ (Shift)',d:'ㅃㅉㄸㄲㅆ ㅒㅖ — 반대쪽 손 새끼손가락으로 Shift를 눌러요',sh:['ㅃ','ㅉ','ㄸ','ㄲ','ㅆ','ㅒ','ㅖ']},
      {n:'전체 섞기',d:'모든 자음·모음을 섞어서 쳐요',all:true}],
  en:[{n:'기본 자리',d:'a s d f g h j k l ; — 왼손 검지는 F, 오른손 검지는 J 위에(돌기 있는 키)',k:['KeyA','KeyS','KeyD','KeyF','KeyG','KeyH','KeyJ','KeyK','KeyL','Semicolon']},
      {n:'윗줄',d:'q w e r t y u i o p — 기본 자리에서 손가락을 위로 뻗어요',k:['KeyQ','KeyW','KeyE','KeyR','KeyT','KeyY','KeyU','KeyI','KeyO','KeyP']},
      {n:'아랫줄',d:'z x c v b n m , . — 손가락을 아래로 굽혀요',k:['KeyZ','KeyX','KeyC','KeyV','KeyB','KeyN','KeyM','Comma','Period']},
      {n:'대문자 (Shift)',d:'A~Z 대문자 — 반대쪽 손 새끼손가락으로 Shift를 눌러요',up:true},
      {n:'전체 섞기',d:'소문자·대문자·문장부호를 섞어서 쳐요',all:true}]};
function drillSeq(lang,i){ const L=DRILLS[lang][i]; let pool;
  if(L.sh) pool=L.sh.concat(lang==='ko'?['ㅂ','ㅈ','ㄷ','ㄱ','ㅅ']:[]);
  else if(L.up) pool='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  else if(L.all) pool=lang==='ko'?Object.keys(KEYOF).filter(c=>/[ㄱ-ㅣ]/.test(c)):'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ,.;'.split('');
  else { pool=L.k.map(c=>labelOf(c,lang)[0]);
    if(i>0) pool=pool.concat(shuffle(DRILLS[lang][0].k.map(c=>labelOf(c,lang)[0])).slice(0,3)); }
  return Array.from({length:30},()=>pick(pool)); }

/* ---------- 틀 ---------- */
const bar=document.getElementById('bar'), screen=document.getElementById('screen'), tabs=document.getElementById('tabs');
let tab='home', R=null;
const LI=(n,c)=>`<i data-lucide="${n}"${c?` class="${c}"`:''}></i>`;
function setBar(title,back){ bar.innerHTML=`${back?`<button class="bb" id="bBack" aria-label="뒤로">${LI('arrow-left')}</button>`:'<span class="bb"></span>'}<h1>${title}</h1><span class="bb"></span>`; if(back) bar.querySelector('#bBack').onclick=back; }
function showTabs(on){ tabs.hidden=!on; if(on) tabs.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.tab===tab)); }
function stopRun(){ if(R){ R.stop&&R.stop(); R=null; } document.onkeydown=null; document.onkeyup=null; }
function setTab(t){ stopRun(); tab=t; render(); screen.scrollTop=0; }
function render(){ showTabs(true); ({home:renderHome,cards:renderGame,report:renderRec})[tab](); }
const langBar=()=>`<div class="trk" role="tablist" aria-label="언어">${[['ko','한글 (2벌식)'],['en','영문']].map(([k,v])=>`<button role="tab" data-lg="${k}" aria-selected="${S.lang===k}">${v}</button>`).join('')}</div>`;
function bindLang(){ screen.querySelectorAll('[data-lg]').forEach(b=>b.onclick=()=>{ S.lang=b.dataset.lg; save(); render(); }); }
const bestOf=(k)=>S.best[S.lang][k];

/* ---------- 화면 자판 ---------- */
function kbHTML(lang,hi,shift){
  const keyB=c=>{ const lb=labelOf(c,lang), f=FINGER[c]; const on=hi===c;
    return `<button class="k f${f} ${on?'on':''} ${c==='KeyF'||c==='KeyJ'?'bump':''}" data-code="${c}"><span>${esc(lb[0])}</span>${lb[1]?`<small>${esc(lb[1])}</small>`:''}</button>`; };
  return `<div class="kb ${shift?'shifting':''}">${ROWS.map((r,i)=>`<div class="kr r${i}">${i===2?`<span class="k wide sh ${shift==='L'?'on':''}">Shift</span>`:''}${r.map(keyB).join('')}${i===2?`<span class="k wide sh ${shift==='R'?'on':''}">Shift</span>`:''}</div>`).join('')}<div class="kr r3"><button class="k space f8 ${hi==='Space'?'on':''}" data-code="Space">스페이스</button></div></div>`;
}
function hintFor(ch){ const k=KEYOF[ch]; if(!k) return {code:null,shift:null,txt:''}; const [code,sh]=k, f=FINGER[code];
  const shiftSide=sh?(f<4?'R':'L'):null; return {code,shift:shiftSide,txt:`${FNAME[f]}${sh?` + ${shiftSide==='R'?'오른손':'왼손'} Shift`:''}`}; }

/* ---------- 연습 (홈) ---------- */
function renderHome(){
  setBar('타자 연습');
  const lg=S.lang, D=DRILLS[lg];
  screen.innerHTML=`${langBar()}
    <section class="sec"><h3 class="sh">자리 연습 <small>한 판 30타 · ${CAP_DRILL}개 틀리면 처음부터</small></h3>
      <ul class="units in">${D.map((d,i)=>{ const open=i<(S.open[lg]||1), b=bestOf('d'+i);
        return `<li class="${open?'':'lock'}"><span class="lic ${b?'s-ok':open?'s-now':'s-lk'}">${LI(b?'check':open?'keyboard':'lock')}</span><button class="unit" data-dr="${i}" ${open?'':'disabled'}><b>${i+1}단계 ${d.n}</b><small>${b?`최고 ${b.cpm}타 · 정확도 ${b.acc}%`:esc(d.d)}</small></button></li>`; }).join('')}</ul></section>
    <section class="sec"><h3 class="sh">낱말 · 짧은 글</h3>
      <div class="modes">
        <button class="mode" data-md="word"><b>${LI('keyboard')}낱말 연습</b><small>${lg==='ko'?'우리말 낱말':'영단어'} 10개 · ${CAP_WORD}개 틀리면 처음부터</small><em>${bestOf('word')?`최고 ${bestOf('word').cpm}타`:'기록 없음'}</em></button>
        <button class="mode" data-md="sent"><b>${LI('book-open')}짧은 글 연습</b><small>${lg==='ko'?'속담·짧은 문장':'쉬운 영어 문장'} 5개 · ${CAP_SENT}개 틀리면 처음부터</small><em>${bestOf('sent')?`최고 ${bestOf('sent').cpm}타`:'기록 없음'}</em></button>
      </div></section>
    <p class="note">손가락은 기본 자리(${lg==='ko'?'ㄹ·ㅓ':'F·J'} 키 돌기)에 두고, 자판을 보지 말고 화면을 보며 쳐요. 아이패드·컴퓨터는 키보드로, 휴대폰은 화면 자판을 눌러 자리 연습을 할 수 있어요.</p>`;
  bindLang();
  screen.querySelectorAll('[data-dr]').forEach(b=>b.onclick=()=>runDrill(+b.dataset.dr));
  screen.querySelectorAll('[data-md]').forEach(b=>b.onclick=()=>runText(b.dataset.md));
}

/* ---------- 틀린 개수 칸 ---------- */
const wbox=(w,cap,msg)=>`<div class="wcnt ${w>=cap-1?'full':''}" id="wcnt"><div class="r1"><b>틀린 개수</b><span class="dots">${Array.from({length:cap},(_,i)=>`<i class="${i<w?'on':''}"></i>`).join('')}</span><em>${w}/${cap}</em></div><small>${msg}</small></div>`;

/* ---------- 자리 연습 ---------- */
function runDrill(i){
  stopRun(); showTabs(false);
  const lg=S.lang, L=DRILLS[lg][i];
  R={kind:'drill',i,seq:drillSeq(lg,i),pos:0,wrong:0,t0:0,ok:0};
  const draw=(flash)=>{
    const r=R, ch=r.seq[r.pos], h=hintFor(ch);
    setBar(`${i+1}단계 ${L.n}`,()=>{stopRun();render();});
    screen.innerHTML=`<div class="np typ">
      <div class="prog"><div class="tr"><i style="width:${r.pos/r.seq.length*100}%"></i></div><span>${r.pos} / ${r.seq.length}</span></div>
      <p class="tip">${esc(L.d)}</p>
      <div class="drill ${flash||''}">${r.seq.slice(r.pos,r.pos+9).map((c,k)=>`<span class="${k===0?'cur':''}">${esc(c)}</span>`).join('')}</div>
      <p class="finger">${h.txt?`${LI('hand','inl')} ${h.txt}`:''}</p>
      ${wbox(r.wrong,CAP_DRILL,`${CAP_DRILL}개 틀리면 이 단계를 처음부터 다시 해요`)}
      ${kbHTML(lg,h.code,h.shift)}
    </div>`;
    screen.querySelectorAll('.kb [data-code]').forEach(b=>b.onclick=()=>hit(b.dataset.code,false,true));
  };
  const hit=(code,shift,tap)=>{
    const r=R; if(!r||r.kind!=='drill') return;
    if(!r.t0) r.t0=performance.now();
    const want=KEYOF[r.seq[r.pos]]; if(!want) return;
    const okKey=code===want[0]&&(tap||!!shift===want[1]);
    if(okKey){ r.pos++; r.ok++; if(r.pos>=r.seq.length) return doneDrill(); draw(); }
    else { r.wrong++; if(r.wrong>=CAP_DRILL){ R.seq=drillSeq(lg,i); R.pos=0; R.wrong=0; R.t0=0; R.ok=0; draw('restart'); flashMsg(`${CAP_DRILL}개를 틀려서 처음부터 다시 해요`); return; } draw('bad'); }
  };
  const doneDrill=()=>{ HG('ok');
    const r=R, min=(performance.now()-r.t0)/60000, cpm=Math.round(r.seq.length/Math.max(min,1/60)), acc=Math.round(r.seq.length/(r.seq.length+r.wrong)*100);
    const k='d'+i, b=S.best[lg][k]; if(!b||cpm>b.cpm) S.best[lg][k]={cpm,acc};
    S.open[lg]=Math.max(S.open[lg]||1,Math.min(DRILLS[lg].length,i+2));
    S.log.unshift({lang:lg,what:`${i+1}단계 ${L.n}`,cpm,acc,at:Date.now()}); S.log=S.log.slice(0,30); save();
    result(`${i+1}단계 ${L.n}`,cpm,acc,r.wrong,i+1<DRILLS[lg].length?{t:`${i+2}단계 ${DRILLS[lg][i+1].n}`,go:()=>runDrill(i+1)}:null,()=>runDrill(i));
  };
  document.onkeydown=e=>{ if(e.key==='Shift'||e.ctrlKey||e.metaKey||e.altKey) return; if(!(e.code in FINGER)) return; e.preventDefault(); hit(e.code,e.shiftKey,false); };
  draw();
}
function flashMsg(t){ const d=document.createElement('div'); d.className='toast warn floatmsg'; d.textContent=t; screen.prepend(d); setTimeout(()=>d.remove(),1800); }

/* ---------- 낱말 · 짧은 글 ---------- */
function runText(md){
  stopRun(); showTabs(false);
  const lg=S.lang, isW=md==='word', cap=isW?CAP_WORD:CAP_SENT;
  const src=isW?(lg==='ko'?TD.koW:TD.enW):(lg==='ko'?TD.koS:TD.enS);
  const mk=()=>shuffle(src).slice(0,isW?10:5);
  R={kind:md,list:mk(),i:0,wrong:0,keysOK:0,t0:0,err:false};
  const title=isW?'낱말 연습':'짧은 글 연습';
  const draw=()=>{
    const r=R, target=r.list[r.i];
    setBar(title,()=>{stopRun();render();});
    screen.innerHTML=`<div class="np typ">
      <div class="prog"><div class="tr"><i style="width:${r.i/r.list.length*100}%"></i></div><span>${r.i+1} / ${r.list.length}</span></div>
      <div class="stats"><span>타수 <b id="cpm">0</b></span><span>정확도 <b id="acc">100</b>%</span></div>
      <div class="board tgt"><div class="tline" id="tline"></div><div class="nextl">${r.list[r.i+1]?`다음: ${esc(r.list[r.i+1])}`:'마지막이에요'}</div></div>
      <input id="ti" class="tin" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" lang="${lg==='ko'?'ko':'en'}" aria-label="여기에 입력" placeholder="${lg==='ko'?'여기에 한글로 쳐요':'Type here'}">
      <p class="finger" id="fg"></p>
      ${wbox(r.wrong,cap,`${cap}개 틀리면 처음부터 다시 해요 · 다 맞게 치면 자동으로 다음`)}
      ${kbHTML(lg,null,null)}
    </div>`;
    const inp=screen.querySelector('#ti'); setTimeout(()=>{try{inp.focus();}catch(e){}},30);
    inp.oninput=()=>check(); paint('');
  };
  const paint=(typed)=>{
    const r=R, target=r.list[r.i], tk=keys(target), yk=keys(typed);
    let okLen=0; while(okLen<yk.length&&yk[okLen]===tk[okLen]) okLen++;
    const bad=okLen<yk.length;
    /* 글자 단위 색칠: 확정된 글자는 초록/빨강, 치는 중인 글자는 밑줄 */
    const tc=[...target], yc=[...typed];
    screen.querySelector('#tline').innerHTML=tc.map((c,k)=>{ let cls=''; if(k<yc.length-1||(k<yc.length&&!bad&&keys(yc[k]).join('')===keys(c).join(''))) cls=yc[k]===c?'g':'r'; else if(k===yc.length-1) cls=bad?'r':'cur'; else if(k===yc.length) cls='cur';
      return `<span class="${cls} ${c===' '?'spc':''}">${c===' '?'␣':esc(c)}</span>`; }).join('');
    const nx=bad?null:tk[yk.length]; const h=nx?hintFor(nx):{code:null,shift:null,txt:''};
    screen.querySelector('#fg').innerHTML=bad?'<span class="x">틀렸어요 · 지우고 다시 쳐요</span>':h.txt?`${LI('hand','inl')} 다음 키: <b>${esc(nx===' '?'스페이스':nx)}</b> · ${h.txt}`:'';
    screen.querySelectorAll('.kb .k').forEach(k=>k.classList.toggle('on',!!h.code&&k.dataset.code===h.code));
    screen.querySelectorAll('.kb .sh').forEach((k,j)=>k.classList.toggle('on',(j===0&&h.shift==='L')||(j===1&&h.shift==='R')));
    return {bad,okLen,tk};
  };
  const stat=()=>{ const r=R, min=r.t0?(performance.now()-r.t0)/60000:0, cpm=min?Math.round(r.keysOK/Math.max(min,1/120)):0, acc=(r.keysOK+r.wrong)?Math.round(r.keysOK/(r.keysOK+r.wrong)*100):100;
    const a=screen.querySelector('#cpm'),b=screen.querySelector('#acc'); if(a){a.textContent=cpm;b.textContent=acc;} return {cpm,acc}; };
  const check=()=>{
    const r=R; if(!r) return; const inp=screen.querySelector('#ti'), v=inp.value; if(!r.t0&&v) r.t0=performance.now();
    const {bad,tk}=paint(v);
    if(bad&&!r.err){ r.err=true; r.wrong++; const el=document.getElementById('wcnt'); if(el) el.outerHTML=wbox(r.wrong,cap,`${cap}개 틀리면 처음부터 다시 해요 · 다 맞게 치면 자동으로 다음`);
      if(r.wrong>=cap){ R.list=mk(); R.i=0; R.wrong=0; R.keysOK=0; R.t0=0; R.err=false; draw(); flashMsg(`${cap}개를 틀려서 처음부터 다시 해요`); return; } }
    if(!bad) r.err=false;
    if(v===r.list[r.i]){ HG('ok'); addChars(lg,[...v].length); r.keysOK+=tk.length; stat(); r.i++; if(r.i>=r.list.length) return finishText(); const t=performance.now(); setTimeout(()=>{ if(R===r){ draw(); } },120); }
    else stat();
  };
  const finishText=()=>{
    const {cpm,acc}=stat(), k=md, b=S.best[lg][k]; if(!b||cpm>b.cpm) S.best[lg][k]={cpm,acc}; rankBest(lg,cpm,acc);
    S.log.unshift({lang:lg,what:title,cpm,acc,at:Date.now()}); S.log=S.log.slice(0,30); save();
    result(title,cpm,acc,R.wrong,null,()=>runText(md));
  };
  draw();
}
function result(what,cpm,acc,wrong,nextStep,again){
  stopRun(); showTabs(false); setBar(what+' 결과',()=>render());
  screen.innerHTML=`<div class="res">
    <div class="box center"><small class="note">${S.lang==='ko'?'한글':'영문'} · ${esc(what)}</small><div class="big">${cpm}<small style="font-size:22px">타</small></div><p class="note">분당 타수 · 정확도 ${acc}% · 틀린 개수 ${wrong}</p></div>
    <div class="grid3"><div class="cell"><b>${cpm}</b><span>타수(분)</span></div><div class="cell"><b>${acc}%</b><span>정확도</span></div><div class="cell"><b>${wrong}</b><span>틀린 개수</span></div></div>
    ${nextStep?`<div class="toast">통과! ${esc(nextStep.t)}가 열렸어요</div>`:''}
    <div class="btns sp"><button class="btn" id="again">${LI('rotate-ccw')}다시 하기</button>${nextStep?`<button class="btn y" id="nx">${LI('arrow-right')}다음 단계</button>`:`<button class="btn k" id="hm">${LI('house')}연습으로</button>`}</div>
  </div>`;
  screen.querySelector('#again').onclick=again;
  const nx=screen.querySelector('#nx'); if(nx) nx.onclick=nextStep.go;
  const hm=screen.querySelector('#hm'); if(hm) hm.onclick=()=>setTab('home');
}

/* ---------- 산성비 게임 ---------- */
function renderGame(){
  setBar('산성비 게임');
  const b=bestOf('game');
  screen.innerHTML=`${langBar()}
    <section class="sec center gamecard"><span class="pc-logo big">${LI('gamepad-2')}</span><h3 class="sh">산성비</h3>
      <p class="note">하늘에서 떨어지는 ${S.lang==='ko'?'낱말':'영단어'}을 땅에 닿기 전에 쳐서 없애요. 다 맞게 치면 저절로 사라져요.<br>${LIVES}개를 놓치면 끝, 10개를 없앨 때마다 빨라져요.</p>
      <p class="best">${LI('trophy','inl')} 최고 점수 <b>${b?b.score:0}</b>${b?` · ${b.lv}단계`:''}</p>
      <button class="startbtn" id="play">${LI('play')}게임 시작</button></section>`;
  bindLang();
  screen.querySelector('#play').onclick=runGame;
}
function runGame(){
  stopRun(); showTabs(false);
  const lg=S.lang, pool=lg==='ko'?TD.koW.filter(w=>[...w].length>=2):TD.enW;
  setBar('산성비',()=>{stopRun();render();});
  screen.innerHTML=`<div class="np typ game">
    <div class="ghud"><span>점수 <b id="gs">0</b></span><span>단계 <b id="gl">1</b></span><span class="gspd">속도 <b id="gsp">0</b><small>타/분</small></span><span class="lives" id="lv"></span></div>
    <div class="sky" id="sky"><div class="ground"></div></div>
    <input id="gi" class="tin" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" lang="${lg}" placeholder="${lg==='ko'?'떨어지는 낱말을 쳐요':'Type the falling words'}" aria-label="입력">
  </div>`;
  const sky=screen.querySelector('#sky'), inp=screen.querySelector('#gi');
  const st={score:0,lv:1,lives:LIVES,hit:0,drops:[],next:0,last:performance.now(),over:false,raf:0,keys:0,t0:performance.now(),top:0};
  const cpmNow=()=>Math.round(st.keys/Math.max((performance.now()-st.t0)/60000,1/60));
  R={kind:'game',stop:()=>{ cancelAnimationFrame(st.raf); }};
  const hud=()=>{ screen.querySelector('#gs').textContent=st.score; screen.querySelector('#gl').textContent=st.lv; screen.querySelector('#lv').innerHTML=Array.from({length:LIVES},(_,i)=>`<i class="${i<st.lives?'on':''}">${LI('heart')}</i>`).join(''); };
  const spawn=()=>{ const w=pick(pool); const el=document.createElement('span'); el.className='drop'; el.textContent=w; sky.appendChild(el);
    const W=sky.clientWidth; el.style.left=Math.max(4,Math.random()*(W-el.offsetWidth-8))+'px';
    st.drops.push({w,el,y:-30,v:(28+st.lv*7)}); };
  const pop=(d,good)=>{ d.el.classList.add(good?'pop':'miss'); setTimeout(()=>d.el.remove(),300); st.drops=st.drops.filter(x=>x!==d); };
  const tryHit=()=>{ const v=inp.value.trim(); if(!v) return false; const d=st.drops.find(x=>x.w===v); if(!d) return false;
    sfx('ok'); pop(d,true); st.score+=10*st.lv+[...v].length; st.hit++; st.keys+=keys(v).length+1; const c=cpmNow(); if(st.hit>=3) st.top=Math.max(st.top,c); const gsp=screen.querySelector('#gsp'); if(gsp){ gsp.textContent=c; gsp.parentNode.classList.remove('up'); void gsp.offsetWidth; gsp.parentNode.classList.add('up'); } if(st.hit%10===0){ st.lv++; } inp.value=''; hud(); return true; };
  inp.oninput=()=>tryHit();
  inp.onkeyup=e=>{ if(e.key==='Enter'){ if(!tryHit()) { sfx('no'); inp.value=''; inp.classList.add('shake'); setTimeout(()=>inp.classList.remove('shake'),300); } } };
  const loop=t=>{ const dt=Math.min(0.05,(t-st.last)/1000); st.last=t; const H=sky.clientHeight-34;
    st.next-=dt; if(st.next<=0){ spawn(); st.next=Math.max(0.9,2.6-st.lv*0.2)+Math.random()*0.6; }
    for(const d of [...st.drops]){ d.y+=d.v*dt; d.el.style.transform=`translateY(${d.y}px)`; if(d.y>=H){ sfx('no'); pop(d,false); st.lives--; hud(); if(st.lives<=0) return over(); } }
    if(!st.tick||t-st.tick>500){ st.tick=t; const gsp=screen.querySelector('#gsp'); if(gsp) gsp.textContent=cpmNow(); }
    st.raf=requestAnimationFrame(loop); };
  const over=()=>{ cancelAnimationFrame(st.raf); const b=S.best[lg].game; const nb=!b||st.score>b.score; if(nb) S.best[lg].game={score:st.score,lv:st.lv};
    const avg=cpmNow(); if(!st.top) st.top=avg; if(st.hit>=3) pushCpm(avg); S.log.unshift({lang:lg,what:'산성비',score:st.score,lv:st.lv,cpm:avg,at:Date.now()}); S.log=S.log.slice(0,30); save();
    R=null; showTabs(false); setBar('산성비 결과',()=>render());
    screen.innerHTML=`<div class="res"><div class="box center"><small class="note">${lg==='ko'?'한글':'영문'} 산성비</small><div class="big">${st.score}<small style="font-size:22px">점</small></div><p class="note">${st.lv}단계 · 없앤 낱말 ${st.hit}개${nb?' · 최고 기록!':''}</p>
      <div class="spdres"><div><small>평균 속도</small><b>${avg}<i>타/분</i></b></div><div><small>최고 속도</small><b>${st.top}<i>타/분</i></b></div><div><small>친 타수</small><b>${st.keys}<i>타</i></b></div></div></div>
      <div class="btns sp"><button class="btn" id="hm">${LI('house')}게임 메뉴</button><button class="btn y" id="again">${LI('rotate-ccw')}다시 하기</button></div></div>`;
    screen.querySelector('#hm').onclick=()=>setTab('cards'); screen.querySelector('#again').onclick=runGame; };
  hud(); setTimeout(()=>{try{inp.focus();}catch(e){}},30); st.last=performance.now(); st.raf=requestAnimationFrame(loop);
}

/* ---------- 기록 ---------- */
function rankH(lg){
  const w=weekNo(), myV=rkMode==='speed'?((S.best[lg].rank||{}).cpm||0):((S.wk&&S.wk.w===w&&S.wk[lg])||0), unit=rkMode==='speed'?'타':'자';
  const rows=[...RUSERS.map((n,i)=>({n,v:rval(i,lg,rkMode)})),{n:myNick(),v:myV,me:true}].sort((a,b)=>b.v-a.v||(a.me?-1:1));
  const mi=rows.findIndex(r=>r.me), top=rows.slice(0,10), above=mi>0?rows[mi-1]:null;
  return `<section class="card"><h3>전체 이용자 순위 <small class="note">${lg==='ko'?'한글':'영문'}</small></h3>
    <div class="rkseg" role="group"><button data-rk="speed" class="${rkMode==='speed'?'on':''}">속도</button><button data-rk="vol" class="${rkMode==='vol'?'on':''}">연습량 (이번 주)</button></div>
    <div class="rkme"><span>내 순위</span><b>${mi+1}위</b><span>${myV.toLocaleString()}${unit}</span></div>
    <ol class="rkl">${top.map((r,i)=>`<li class="${r.me?'me':''}"><span class="n">${i+1}</span><span class="nm">${esc(r.n)}${r.me&&r.n!=='나'?' (나)':''}</span><span class="v">${r.v.toLocaleString()}${unit}</span></li>`).join('')}${mi>=10?`<li class="me"><span class="n">${mi+1}</span><span class="nm">${esc(rows[mi].n)}${rows[mi].n!=='나'?' (나)':''}</span><span class="v">${myV.toLocaleString()}${unit}</span></li>`:''}</ol>
    <p class="note">${mi===0?'지금 1위예요!':`${esc(above.n)}까지 ${(above.v-myV+1).toLocaleString()}${unit}`} · ${rkMode==='speed'?`낱말·짧은 글 최고 타수(정확도 ${RANK_ACC}% 이상만)`:'이번 주에 정확하게 친 글자 수, 월요일에 새로 시작'} · 다른 이용자는 예시예요.</p></section>`;
}
function renderRec(){
  setBar('타자 기록');
  const lg=S.lang, D=DRILLS[lg], L=S.log.filter(x=>x.lang===lg).slice(0,12);
  screen.innerHTML=`${langBar()}
    <section class="card"><h3>최고 기록 <small class="note">${lg==='ko'?'한글':'영문'}</small></h3><div class="list">
      ${D.map((d,i)=>{ const b=bestOf('d'+i); return `<div><span>${i+1}단계 ${d.n}</span><span>${b?`${b.cpm}타 · ${b.acc}%`:'—'}</span></div>`; }).join('')}
      <div><span>낱말 연습</span><span>${bestOf('word')?`${bestOf('word').cpm}타 · ${bestOf('word').acc}%`:'—'}</span></div>
      <div><span>짧은 글 연습</span><span>${bestOf('sent')?`${bestOf('sent').cpm}타 · ${bestOf('sent').acc}%`:'—'}</span></div>
      <div><span>산성비</span><span>${bestOf('game')?`${bestOf('game').score}점 · ${bestOf('game').lv}단계`:'—'}</span></div></div></section>
    ${rankH(lg)}
    <section class="card"><h3>최근 연습</h3><div class="list">${L.length?L.map(x=>`<div><span>${esc(x.what)}</span><span>${x.score!=null?`${x.score}점`:`${x.cpm}타 · ${x.acc}%`}</span></div>`).join(''):'<p class="note">아직 기록이 없어요.</p>'}</div></section>
    <p class="note">타수는 1분 동안 누른 키 수예요(한글은 자음·모음 하나가 1타). 처음엔 정확도 95% 이상을 목표로, 익숙해지면 속도를 올려요.</p>
    <section class="card"><div class="btns"><button class="btn" id="reset">${LI('rotate-ccw')}기록 지우기</button></div></section>`;
  bindLang();
  screen.querySelectorAll('[data-rk]').forEach(b=>b.onclick=()=>{ rkMode=b.dataset.rk; renderRec(); });
  screen.querySelector('#reset').onclick=e=>{ if(e.currentTarget.dataset.c){ S={lang:S.lang,open:{ko:1,en:1},best:{ko:{},en:{}},log:[]}; save(); render(); } else { e.currentTarget.dataset.c=1; e.currentTarget.textContent='한 번 더 누르면 지워요'; } };
}

tabs.querySelectorAll('button').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
let iconQ=false;
/* 루시드 아이콘 (lucide 0.469.0, ISC) — 쓰는 것만 인라인 */
__LUCIDE__
Object.assign(LUCIDE,{
 'keyboard':'<path d="M10 8h.01"/><path d="M12 12h.01"/><path d="M14 8h.01"/><path d="M16 12h.01"/><path d="M18 8h.01"/><path d="M6 8h.01"/><path d="M7 16h10"/><path d="M8 12h.01"/><rect width="20" height="16" x="2" y="4" rx="2"/>',
 'gamepad-2':'<line x1="6" x2="10" y1="11" y2="11"/><line x1="8" x2="8" y1="9" y2="13"/><line x1="15" x2="15.01" y1="12" y2="12"/><line x1="18" x2="18.01" y1="10" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/>',
 'heart':'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
 'trophy':'<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
 'hand':'<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>'
});
function drawIcons(){ document.querySelectorAll("i[data-lucide]").forEach(el=>{ const n=el.dataset.lucide, b=LUCIDE[n]; if(!b) return; const t=document.createElement("span"); t.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${n} ${el.className||""}" aria-hidden="true">${b}</svg>`; el.replaceWith(t.firstChild); }); iconQ=false; }
new MutationObserver(()=>{ if(!iconQ&&document.querySelector('i[data-lucide]')){ iconQ=true; requestAnimationFrame(drawIcons); } }).observe(document.querySelector('.app'),{childList:true,subtree:true});
render(); drawIcons();
