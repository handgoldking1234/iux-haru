/**
 * 타자(타자하루)를 프로토타입에서 그대로 가져온다 — prototype/build/typ.js + head.html 화면 뼈대(build.py app('typ.js')).
 *   → src/lib/subjects/typApp.js  (mountTyp(root, env))
 * 바뀌는 곳: 저장, 보상 신호(HG), 효과음·타자 속도 랭킹·닉네임(셸 HGS), 셸 헤더 연동(NAVHOOK)만 env로 받는다.
 * 실행: npm run typ-app
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const B = path.resolve(here, '../../prototype/build');
const head = fs.readFileSync(path.join(B, 'head.html'), 'utf8');
let skeleton = head.slice(head.indexOf('<div class="app">')).trim()
  .replace('</span>연산학습</button>', '</span>연습</button>')
  .replace('<i data-lucide="house"></i></span>연습', '<i data-lucide="keyboard"></i></span>연습')
  .replace('<i data-lucide="notebook-pen"></i></span>오답노트', '<i data-lucide="gamepad-2"></i></span>게임')
  .replace('<i data-lucide="chart-pie"></i></span>학습결과', '<i data-lucide="trophy"></i></span>기록');
let js = fs.readFileSync(path.join(B, 'typ.js'), 'utf8');
const lucide = fs.readFileSync(path.join(B, 'lucide.js'), 'utf8');

const rep = (a, b) => {
  if (!js.includes(a)) throw new Error('찾지 못함: ' + a.slice(0, 70));
  js = js.split(a).join(b);
};
rep('const TD=__DATA__;', 'const TD=env.data; const HG=e=>env.hg(e);');
rep('__LUCIDE__', lucide);
rep("function load(){ try{ return JSON.parse(localStorage.getItem(KEY)); }catch(e){ return null; } }", 'function load(){ return env.load(); }');
rep("function save(){ try{ localStorage.setItem(KEY,JSON.stringify(S)); }catch(e){} }", 'function save(){ env.save(S); }');
rep("const sfx=k=>{ try{ parent!==window&&parent.hgSfx&&parent.hgSfx(k); }catch(e){} };", 'const sfx=k=>env.sfx(k);');
rep("function pushCpm(c){ try{ const H=parent!==window&&parent.HGS; if(H&&c>(H.st.typCpm||0)){ H.st.typCpm=c; H.save(); } }catch(e){} }", 'function pushCpm(c){ env.pushCpm(c); }');
rep("const myNick=()=>{ try{ if(parent!==window&&parent.HGS&&parent.HGS.st.name) return parent.HGS.st.name; }catch(e){} return '나'; };", "const myNick=()=>env.nick||'나';");
rep("const bar=document.getElementById('bar'), screen=document.getElementById('screen'), tabs=document.getElementById('tabs');", "const bar=root.querySelector('#bar'), screen=root.querySelector('#screen'), tabs=root.querySelector('#tabs');");
rep("new MutationObserver(()=>{ if(!iconQ&&document.querySelector('i[data-lucide]')){ iconQ=true; requestAnimationFrame(drawIcons); } }).observe(document.querySelector('.app'),{childList:true,subtree:true});",
  "const MO=new MutationObserver(()=>{ if(!iconQ&&root.querySelector('i[data-lucide]')){ iconQ=true; requestAnimationFrame(drawIcons); } }); MO.observe(root.querySelector('.app'),{childList:true,subtree:true});");
rep('document.querySelectorAll("i[data-lucide]")', 'root.querySelectorAll("i[data-lucide]")');

const navhook = `
{ let lastBack=false, off=false;
  const sync=()=>{ bar.hidden=!(lastBack||off);
    const list=[...tabs.querySelectorAll('button')].map(b=>{ const d=b.querySelector('.dot'); return {key:b.dataset.tab,label:[...b.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim(),n:d?+d.textContent:0,on:b.classList.contains('on')}; });
    env.onSub(off, list); };
  const s0=setBar; setBar=function(t,o){ s0.apply(this,arguments); lastBack=typeof o==='function'||!!(o&&typeof o==='object'&&o.back); sync(); };
  const t0=showTabs; showTabs=function(on){ t0.apply(this,arguments); off=!on; sync(); };
  const r0=render; render=function(){ r0.apply(this,arguments); sync(); };
}
`;
rep('render(); drawIcons();', navhook + 'render(); drawIcons();');

/* 사용자 요청: 낱말·짧은 글 연습 소리 (한글·영문 공통)
   🔊 지금 낱말·문장 듣기 · 🔁 켜면 다 읽고 2초 쉬고 다시 읽기(다음 낱말로 이어짐) · 가/A 글자 소리 켜고 끄기
   글자 소리: 낱말 연습은 낱말을 다 쳤을 때 한 번(한글·영문), 짧은 글은 한글 글자 완성마다·영문 낱말마다 */
const voice = `
const VO=()=>S.voice||(S.voice={echo:true,rep:false});
let voT=null, voK=0;
function vSpeak(t,lang){ if(env.say) return env.say(t,lang==='ko'?'ko-KR':'en-US'); try{ const ss=window.speechSynthesis; if(!ss||!t) return Promise.resolve(); ss.cancel();
  return new Promise(res=>{ const u=new SpeechSynthesisUtterance(t); u.lang=lang==='ko'?'ko-KR':'en-US'; u.rate=lang==='ko'?0.95:0.9; u.onend=u.onerror=()=>res(); ss.speak(u); setTimeout(res,3000+t.length*300); }); }catch(e){ return Promise.resolve(); } }
function vStop(){ voK++; clearTimeout(voT); voT=null; try{ window.speechSynthesis&&window.speechSynthesis.cancel(); }catch(e){} }
function vLoop(){ const k=++voK; clearTimeout(voT);
  const go=()=>{ if(k!==voK||!VO().rep||!R||!R.list) return; vSpeak(R.list[R.i],S.lang).then(()=>{ if(k===voK&&VO().rep) voT=setTimeout(go,2000); }); }; go(); }
function vEcho(r,v,bad){ const yc=[...v], n=yc.length, pl=r.pl||0, tgt=r.list[r.i], whole=v===tgt; r.pl=n;
  if(n<(r.sp||0)) r.sp=n; if(VO().echo===false||bad||(n<=pl&&!whole)) return;
  if(r.kind==='word'){ if(whole&&!r.said){ r.said=true; vSpeak(tgt,S.lang); } return; } // 낱말 연습: 다 쳤을 때 낱말 전체를 한 번만 (한글·영문)
  if(S.lang==='ko'){ const d=whole?n:n-1, sp=Math.min(r.sp||0,d); r.sp=d; const seg=yc.slice(sp,d).join(''); if(d>sp&&tgt.startsWith(yc.slice(0,d).join(''))&&seg.trim()) vSpeak(seg.replace(/s+/g,''),'ko'); }
  else if(yc[n-1]===' '||whole){ const w=v.trim().split(/\\s+/).pop(); if(w) vSpeak(w,'en'); } }
function vBind(inp){ const b=screen.querySelector('.tvo'); if(!b) return; R.pl=0; R.sp=0; R.said=false;
  b.querySelectorAll('button').forEach(x=>x.onmousedown=e=>e.preventDefault());
  b.querySelector('#vSay').onclick=()=>{ vSpeak(R.list[R.i],S.lang); inp.focus(); };
  b.querySelector('#vRep').onclick=e=>{ const o=VO(); o.rep=!o.rep; save(); e.currentTarget.setAttribute('aria-pressed',o.rep); if(o.rep) vLoop(); else vStop(); inp.focus(); };
  b.querySelector('#vEcho').onclick=e=>{ const o=VO(); o.echo=o.echo===false; save(); e.currentTarget.setAttribute('aria-pressed',o.echo); inp.focus(); };
  if(VO().rep&&!R.voOn){ R.voOn=true; vLoop(); } }
`;
rep('function stopRun(){ if(R){', voice + 'function stopRun(){ vStop(); if(R){');
// 아이콘 표(LUCIDE)가 만들어진 뒤에 소리 아이콘을 더한다
rep('function drawIcons(){', "LUCIDE['type']='<polyline points=\"4 7 4 4 20 4 20 7\"/><line x1=\"9\" x2=\"15\" y1=\"20\" y2=\"20\"/><line x1=\"12\" x2=\"12\" y1=\"4\" y2=\"20\"/>';\nLUCIDE['volume-2']='<path d=\"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z\"/><path d=\"M16 9a5 5 0 0 1 0 6\"/><path d=\"M19.364 18.364a9 9 0 0 0 0-12.728\"/>';\n" + 'function drawIcons(){');
rep('<div class="stats"><span>타수 <b id="cpm">0</b></span><span>정확도 <b id="acc">100</b>%</span></div>',
  '<div class="stats"><span>타수 <b id="cpm">0</b></span><span>정확도 <b id="acc">100</b>%</span><span class="tvo"><button id="vSay" class="tvb" aria-label="소리 듣기">${LI(\'volume-2\')}</button><button id="vRep" class="tvb" aria-pressed="${!!VO().rep}" aria-label="2초마다 반복해서 듣기">${LI(\'repeat\')}</button><button id="vEcho" class="tvb" aria-pressed="${VO().echo!==false}" aria-label="글자 소리">${LI(\'type\')}</button></span></div>');
rep("inp.oninput=()=>check(); paint('');", "inp.oninput=()=>check(); paint(''); vBind(inp);");
rep('const {bad,tk}=paint(v);', 'const {bad,tk}=paint(v); vEcho(r,v,bad);');

const out = `/* eslint-disable */
// @ts-nocheck
/**
 * 타자(타자하루) — prototype/build/typ.js를 그대로 옮김 (자동 생성: scripts/typ-app.mjs, 직접 고치지 않기)
 * env: { data, hg(e), load(), save(S), sfx(k), pushCpm(cpm), nick, onSub(off, tabs) }
 */
export const TYP_SKELETON = ${JSON.stringify(skeleton)};

export function mountTyp(root, env) {
root.innerHTML = TYP_SKELETON;
${js}
return {
  subTab(k) { if (typeof stopRun === 'function') { try { stopRun(); } catch (e) {} } setTab(k); },
  destroy() { MO.disconnect(); try { stopRun(); } catch (e) {} document.onkeydown = null; root.innerHTML = ''; },
};
}
`;
fs.writeFileSync(path.resolve(here, '../src/lib/subjects/typApp.js'), out);
console.log('typApp.js', out.length);
