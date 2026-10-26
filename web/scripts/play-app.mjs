/**
 * 놀이터 게임(스피드 게임·대결방·산성비)을 프로토타입에서 그대로 가져온다.
 *   prototype/build/play.js            → src/lib/play/playApp.js  (mountPlay(root, env))
 *   prototype/dist/index.html 안의 ICONS·PLAY → public/content/play.json (build.py가 만든 게임 문제 모음·아이콘)
 * 바뀌는 곳: 공통 보상 저장소(parent.HGS)와 셸 기능(parent.hgNav·hgSheet·goSubject…)만 env로 받는다.
 * 실행: npm run play-app
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '../..');
const dist = fs.readFileSync(path.join(ROOT, 'prototype/dist/index.html'), 'utf8');
const m = dist.match(/play:("(?:[^"\\]|\\.)*")/);
if (!m) throw new Error('dist에서 놀이터 화면을 찾지 못함');
const playHtml = JSON.parse(m[1]);
const icons = playHtml.match(/const ICONS=(\{.*?\});\n/s)[1];
const pd = playHtml.match(/const PD=(\{.*?\});\n/s)[1];
fs.writeFileSync(path.join(ROOT, 'web/public/content/play.json'), JSON.stringify({ ICONS: JSON.parse(icons), PLAY: JSON.parse(pd) }));

let js = fs.readFileSync(path.join(ROOT, 'prototype/build/play.js'), 'utf8');
const rep = (a, b) => {
  if (!js.includes(a)) throw new Error('찾지 못함: ' + a.slice(0, 70));
  js = js.split(a).join(b);
};
rep('const ICONS=__ICONS__;', 'const ICONS=env.icons;');
rep('const PD=__PLAY__;', 'const PD=env.pd;');
// 사용자 요청: 연산 주색을 그린으로 (파랑 #2563EB → #22A55B)
rep("math:['연산','#2563EB'],gugu:['구구단','#2563EB']", "math:['연산','#22A55B'],gugu:['구구단','#22A55B']");
rep("math:'#2563EB'", "math:'#22A55B'");
// 사용자 요청: 타자 주색을 파랑으로 (#0E7490 → #2563EB)
js = js.split("'#0E7490'").join("'#2563EB'");
rep("let HG=null; try{ if(parent!==window&&parent.HGS) HG=parent.HGS; }catch(e){}\nif(!HG) HG=makeHGS();", 'let HG=env.HGS;');
rep("const screen=document.getElementById('screen'), bar=document.getElementById('bar'), tabsEl=document.getElementById('tabs');", "const screen=root.querySelector('#screen'), bar=root.querySelector('#bar'), tabsEl=root.querySelector('#tabs');");
rep("const EMB=(()=>{ try{ return parent!==window&&!!parent.hgNav; }catch(e){ return false; } })();", 'const EMB=true;');
js = js.replace(/parent!==window&&/g, '');
js = js.replace(/parent\./g, 'env.');
js = js.replace(/document\.querySelector\('\.app'\)/g, "root.querySelector('.app')");
rep('setTab(\'home\');', 'navGo(env.start||\'game\', env.sub);');

/* 사용자 요청: 게임 수준(초1~고3) — 학년별 문제 묶음(env.lv)과 학년별 연산 (scripts/play-level-q.js) */
rep('function genQ(sub,dan){', fs.readFileSync(path.join(here, 'play-level-q.js'), 'utf8') + 'function genQ(sub,dan){');
rep("const P=sub==='hist'?PD.hist:sub==='sci'?PD.sci:PD.kor, x=pick(P),", "const P=lvPool(sub)||(sub==='hist'?PD.hist:sub==='sci'?PD.sci:PD.kor), x=pick(P),");
rep("    const x=pick(PD.han), ans=`${x[1]} ${x[2]}`, set=new Set([ans]);\n    shuffle(PD.han).forEach(", "    const HP=lvPool('han')||PD.han, x=pick(HP), ans=`${x[1]} ${x[2]}`, set=new Set([ans]);\n    shuffle(HP).forEach(");
rep("    const x=pick(PD.eng), set=new Set([x[1]]);\n    shuffle(PD.eng).forEach(", "    const EP=lvPool('eng')||PD.eng, x=pick(EP), set=new Set([x[1]]);\n    shuffle(EP).forEach(");
rep("  if(sub==='math'){\n    const t=R(0,4); let q,a;", "  if(sub==='math') return mathLv(curLv());\n  if(sub==='math-old'){\n    const t=R(0,4); let q,a;");
rep('    ${ticketsH()}\n', '    ${ticketsH()}\n    <div class="lvrow"><small class="sub">게임 수준 · 스피드 게임과 내가 만드는 대결방 문제</small>${chipH(\'gv\',LVG.map((n,i)=>[i,n]),gLv())}</div>\n');
rep("  screen.querySelectorAll('[data-gs]').forEach(b=>b.onclick=()=>{ gSub=b.dataset.gs; renderGame(); });", "  screen.querySelectorAll('[data-gs]').forEach(b=>b.onclick=()=>{ gSub=b.dataset.gs; renderGame(); });\n  screen.querySelectorAll('[data-gv]').forEach(b=>b.onclick=()=>{ st.gLv=+b.dataset.gv; HG.save(); renderGame(); });");

/* 사용자 요청: 대결방을 가상 친구(시연) 대신 실시간 연결로 — 대결방 부분을 scripts/play-room.js로 바꿔 끼운다 (env.rt = lib/play/room.ts) */
{
  const a = js.indexOf('/* ---------- 대결방 (시연: 가상 친구) ---------- */'), b = js.indexOf('/* ---------- 랭킹 ---------- */');
  if (a < 0 || b < 0) throw new Error('대결방 부분을 찾지 못함');
  js = js.slice(0, a) + fs.readFileSync(path.join(here, 'play-room.js'), 'utf8') + js.slice(b);
  const before = js;
  js = js.replace(/<div class="pubs">\$\{pubRooms\(\)[\s\S]*?\.join\(''\)\}<\/div>/, '<div class="pubs" id="pubs"><p class="note" style="margin:0">공개 방을 찾는 중…</p></div>');
  if (js === before) throw new Error('공개 방 목록을 찾지 못함');
  rep("  screen.querySelectorAll('[data-pub]').forEach(b=>b.onclick=()=>{ const bl=HG.block(); if(bl){ toast(bl.msg); return; } joinPublic(pubRooms()[+b.dataset.pub]); });", '  loadPubs(gb);');
  rep('시연용이라 친구는 가상 참가자예요. 채팅은 정해진 문구와 이모지만 쓸 수 있어요.', '친구와 실시간으로 대결해요. 보이는 건 닉네임과 캐릭터뿐이고, 채팅은 정해진 문구와 이모지만 쓸 수 있어요.');
}

const tpl = fs.readFileSync(path.join(ROOT, 'prototype/build/play.tpl.html'), 'utf8');
const skeleton = tpl.slice(tpl.indexOf('<div class="app">'), tpl.indexOf('<script>')).trim().replace(/__I_[a-z0-9-]+__/g, '');

const out = `/* eslint-disable */
// @ts-nocheck
/**
 * 놀이터 게임 — prototype/build/play.js를 그대로 옮김 (자동 생성: scripts/play-app.mjs, 직접 고치지 않기)
 * env: { icons, pd, HGS, start, sub, hgNav(on), hgNavSel(t), hgNavBadge(o), hgSheet(k), goSubject(k), goStudy(), hgLogout(), hgSfx(k), fireAlarm(a, test) }
 */
export const PLAY_SKELETON = ${JSON.stringify(skeleton)};

export function mountPlay(root, env) {
root.innerHTML = PLAY_SKELETON;
${js}
return {
  go(t, sub) { navGo(t, sub); },
  destroy() { try { leaveRoom(true); } catch (e) {} root.innerHTML = ''; },
};
}
`;
fs.writeFileSync(path.join(ROOT, 'web/src/lib/play/playApp.js'), out);
console.log('playApp.js', out.length, '· play.json');
