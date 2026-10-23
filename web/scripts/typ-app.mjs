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
