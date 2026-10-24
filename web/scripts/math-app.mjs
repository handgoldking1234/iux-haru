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

/* 사용자 요청: 오늘 학습 카드 — 문제 수를 '오늘 학습' 제목 줄 오른쪽으로, 구성(오답 다시·단계 복습·새 진도)은 그 아래 한 줄 */
rep("밀린 학습 ${pl.late}건</span>`:''}</div>\n        <div class=\"pc-amt\">${done}<small> / ${total}문제</small></div>",
  "밀린 학습 ${pl.late}건</span>`:''}<div class=\"pc-amt\">${done}<small> / ${total}문제</small></div></div>");

/* 사용자 요청: 첫 화면 바로가기 줄(오답노트·개념 보기·학습결과·학생 바꾸기) 제거 — 위 탭·지금 단계 '개념'·마이 설정에 같은 기능이 있음 */
rep(`      <div class="shortcuts">
        <button data-sc="cards"><span>\${LI('notebook-pen')}</span>오답노트</button>
        <button data-sc="concept"><span>\${LI('book-open')}</span>개념 보기</button>
        <button data-sc="report"><span>\${LI('chart-pie')}</span>학습결과</button>
        <button data-sc="who"><span>\${LI('users-round')}</span>학생 바꾸기</button>
      </div>
`, '');

/* 사용자 요청: 학습결과 두 그래프(총 문제 개수·총 학습 시간)를 한 줄에 */
rep('    <section class="card center">\n      ${ring(tot.n/goalN', '    <div class="ringrow">\n    <section class="card center">\n      ${ring(tot.n/goalN');
rep('하루 목표 15분`}</p>\n    </section>', '하루 목표 15분`}</p>\n    </section>\n    </div>\n    <section class="card wkme"><h3>이번 주 기록</h3><div class="wkt">${env.weekOk()}</div></section>');

/* 사용자 요청: 학습결과 그래프 가운데 숫자 글자 줄임 (30→24, 굵기 900→800) */
rep('<text x="70" y="72" text-anchor="middle" font-size="30" font-weight="900"', '<text x="70" y="72" text-anchor="middle" font-size="24" font-weight="800"');

/* 사용자 요청: 입력 버튼의 '· 자릿수만큼 넣으면 자동' 문구 제거 */
rep('<button data-k="ok" class="okbtn">입력 <small style="font-weight:500;opacity:.8">· 자릿수만큼 넣으면 자동</small></button>', '<button data-k="ok" class="okbtn">입력</button>');

/* 사용자 요청: 학습 중(오늘 학습 첫 개념·문제 풀기)에는 ← 대신 ✕(그만하기) + 확인 창 — 둘러보는 화면은 ← 그대로 */
rep('"chevron-down":"<path d=\\"m6 9 6 6 6-6\\"/>"', '"x":"<path d=\\"M18 6 6 18\\"/><path d=\\"m6 6 12 12\\"/>","chevron-down":"<path d=\\"m6 9 6 6 6-6\\"/>"');
rep('function setBar(title,{back,help}={}){', 'function setBar(title,{back,help,quit}={}){');
rep('<button class="bb" id="bBack" aria-label="뒤로">${LI(\'arrow-left\')}</button>', '<button class="bb" id="bBack" aria-label="${quit?\'그만하기\':\'뒤로\'}">${LI(quit?\'x\':\'arrow-left\')}</button>');
rep("if(back) bar.querySelector('#bBack').onclick=back;", "if(back) bar.querySelector('#bBack').onclick=quit?()=>askQuit(back):back;");
rep("setBar(`개념 · ${s.name}`,{back:()=>{ if(gate&&G){G=null;document.onkeydown=null;} save(); onClose&&onClose(); }});",
  "setBar(`개념 · ${s.name}`,{quit:!!(gate&&G),back:()=>{ if(gate&&G){G=null;document.onkeydown=null;} save(); onClose&&onClose(); }});");
rep("setBar(g.title,{back:()=>{G=null;document.onkeydown=null;save();render();},help:()=>openFromPlay(s.id)});",
  "setBar(g.title,{quit:true,back:()=>{G=null;document.onkeydown=null;save();render();},help:()=>openFromPlay(s.id)});");
rep('function setBar(title,{back,help,quit}={}){', `function askQuit(fn){ const app=root.querySelector('.app'); app.querySelector('#qdlg')?.remove();
  app.insertAdjacentHTML('beforeend','<div class="dim" id="qdlg"><div class="dialog" role="alertdialog" aria-labelledby="qt"><h3 id="qt">그만할까요?</h3><p>지금까지 푼 문제는 저장돼요. 오늘 학습에서 이어서 할 수 있어요.</p><div class="qrow"><button class="qno" data-q="no">계속하기</button><button data-q="yes">그만하기</button></div></div></div>');
  const d=app.querySelector('#qdlg'); d.onclick=e=>{ const q=e.target.closest('[data-q]')?.dataset.q; if(e.target===d||q==='no') d.remove(); else if(q==='yes'){ d.remove(); fn(); } }; }
function setBar(title,{back,help,quit}={}){`);

/* 사용자 요청: 문제 아래 안내 문구·틀린 개수 칸을 없애고, 틀림 옆 아이콘을 누르면 같은 내용을 팝업으로 */
rep('"chevron-down":"<path d=\\"m6 9 6 6 6-6\\"/>"}', '"chevron-down":"<path d=\\"m6 9 6 6 6-6\\"/>","info":"<circle cx=\\"12\\" cy=\\"12\\" r=\\"10\\"/><path d=\\"M12 16v-4\\"/><path d=\\"M12 8h.01\\"/>"}');
rep("<b class=\"x\">틀림 ${WR(p,s.id)}/${CAP(s)}</b>`:''}</span></div>", "<b class=\"x\">틀림 ${WR(p,s.id)}/${CAP(s)}</b>`:''}</span>${wtip()}</div>");
rep("<p class=\"tip\" id=\"tip\">모르면 오른쪽 위 ${LI('circle-help','inl')}를 눌러 개념을 볼 수 있어요.</p>\n    ${wrongBox()}\n", '<p class="tip" id="tip"></p>\n');
rep("  screen.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>press(b.dataset.k));\n}\nfunction openFromPlay",
  "  screen.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>press(b.dataset.k));\n  bindWtip();\n}\nfunction openFromPlay");
rep("function refreshWrong(){ const el=document.getElementById('wcnt'); if(el) el.outerHTML=wrongBox(); }",
  `function wtip(){ return \`<span class="wtip"><button type="button" class="wtb" aria-label="틀린 개수 안내" aria-expanded="false">\${LI('info')}</button><span class="wpop" id="wpop" role="dialog" hidden>\${wrongBox()}<p class="tip">모르면 오른쪽 위 \${LI('circle-help','inl')}를 눌러 개념을 볼 수 있어요.</p></span></span>\`; }
function bindWtip(){ const w=screen.querySelector('.wtip'); if(!w) return; const b=w.querySelector('.wtb'), pop=w.querySelector('.wpop');
  const set=on=>{ pop.hidden=!on; b.setAttribute('aria-expanded',on); };
  b.onclick=e=>{ e.stopPropagation(); set(pop.hidden); };
  pop.onclick=e=>e.stopPropagation();
  screen.querySelector('.np').addEventListener('click',()=>set(false)); }
function refreshWrong(){ const el=document.getElementById('wcnt'); if(el) el.outerHTML=wrongBox(); }`);

const out = `/* eslint-disable */
// @ts-nocheck
/**
 * 연산(셈하루) — prototype/build/math.html을 그대로 옮김 (자동 생성: scripts/math-app.mjs, 직접 고치지 않기)
 * env: { hg(e), load(), save(S), fresh(), switchKid(), onSub(off, tabs), weekOk() }
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
