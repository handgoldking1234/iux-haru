/**
 * 연산(셈하루)을 프로토타입에서 그대로 가져온다 — prototype/build/math.html의 <script>와 화면 뼈대.
 *   → src/lib/subjects/mathApp.js  (mountMath(root, env))
 * 연산은 규칙(날짜 기준 단계 복습·준비 운동)과 화면(숫자 키패드)이 다른 과목과 달라 프로토타입도 따로 만들었다.
 * 바뀌는 곳: 저장(학생별), 보상 신호(HG), 학생 바꾸기, 셸 헤더 연동(build.py NAVHOOK이 하던 일)만 env로 받는다.
 * 실행: npm run math-app
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const B = path.resolve(here, '../../prototype/build');
const html = fs.readFileSync(path.join(B, 'math.html'), 'utf8');
const skeleton = html.slice(html.indexOf('<div class="app">'), html.indexOf('<script>')).trim();
let js = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));

const rep = (a, b) => {
  if (!js.includes(a)) throw new Error('찾지 못함: ' + a.slice(0, 70));
  js = js.split(a).join(b);
};
rep("const HG=e=>{ try{ if(parent!==window) parent.postMessage({hg:e,s:'math'},'*'); }catch(_){} };", 'const HG=e=>env.hg(e);');
rep("function load(){ try{ return JSON.parse(localStorage.getItem(KEY)); }catch(e){ return null; } }", 'function load(){ return env.load(); }');
rep("function save(){ try{ localStorage.setItem(KEY,JSON.stringify(S)); }catch(e){} }", 'function save(){ env.save(S); }');
rep('let S=load()||seed();', 'let S=load()||env.fresh();');
rep('S=seed();', 'S=env.fresh();');
rep("const bar=document.getElementById('bar'), screen=document.getElementById('screen'), tabs=document.getElementById('tabs');", "const bar=root.querySelector('#bar'), screen=root.querySelector('#screen'), tabs=root.querySelector('#tabs');");
rep("else bar.querySelector('#bWho').onclick=()=>{ const ids=Object.keys(S.profiles); S.active=ids[(ids.indexOf(S.active)+1)%ids.length]; areaF=null; save(); render(); };", "else bar.querySelector('#bWho').onclick=()=>env.switchKid();");
rep("document.getElementById('bWho').click()", 'env.switchKid()');
rep("new MutationObserver(()=>{ if(!iconQ&&document.querySelector('i[data-lucide]')){ iconQ=true; requestAnimationFrame(drawIcons); } }).observe(document.querySelector('.app'),{childList:true,subtree:true});",
  "const MO=new MutationObserver(()=>{ if(!iconQ&&root.querySelector('i[data-lucide]')){ iconQ=true; requestAnimationFrame(drawIcons); } }); MO.observe(root.querySelector('.app'),{childList:true,subtree:true});");
rep('document.querySelectorAll("i[data-lucide]")', 'root.querySelectorAll("i[data-lucide]")');

/* build.py NAVHOOK이 하던 일: 과목 안 탭을 셸 탭2로, 뒤로가기 화면에서만 #bar, 오답 수 배지를 바로가기에 복사 */
const navhook = `
{ let lastBack=false, off=false;
  const sync=()=>{ bar.hidden=!(lastBack||off);
    const list=[...tabs.querySelectorAll('button')].map(b=>{ const d=b.querySelector('.dot'); return {key:b.dataset.tab,label:[...b.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim(),n:d?+d.textContent:0,on:b.classList.contains('on')}; });
    env.onSub(off, list); };
  const s0=setBar; setBar=function(t,o){ s0.apply(this,arguments); lastBack=typeof o==='function'||!!(o&&typeof o==='object'&&o.back); sync(); };
  const t0=showTabs; showTabs=function(on){ t0.apply(this,arguments); off=!on; sync(); };
  const r0=render; render=function(){ r0.apply(this,arguments); sync();
    const sc=screen.querySelector('.shortcuts'); if(!sc) return;
    tabs.querySelectorAll('button').forEach(nb=>{ const d=nb.querySelector('.dot'), t=sc.querySelector('[data-sc="'+nb.dataset.tab+'"]'); if(!t) return; t.querySelectorAll('.scn').forEach(x=>x.remove()); if(d) t.insertAdjacentHTML('beforeend','<em class="scn">'+d.textContent+'</em>'); }); };
}
`;
rep('render(); drawIcons();', navhook + 'render(); drawIcons();');

const out = `/* eslint-disable */
// @ts-nocheck
/**
 * 연산(셈하루) — prototype/build/math.html을 그대로 옮김 (자동 생성: scripts/math-app.mjs, 직접 고치지 않기)
 * env: { hg(e), load(), save(S), fresh(), switchKid(), onSub(off, tabs) }
 */
export const MATH_SKELETON = ${JSON.stringify(skeleton)};

export function mountMath(root, env) {
root.innerHTML = MATH_SKELETON;
${js}
return {
  subTab(k) { setTab(k); },
  destroy() { MO.disconnect(); document.onkeydown = null; if (G && G.timer) clearTimeout(G.timer); G = null; root.innerHTML = ''; },
};
}
`;
fs.writeFileSync(path.resolve(here, '../src/lib/subjects/mathApp.js'), out);
console.log('mathApp.js', out.length);
