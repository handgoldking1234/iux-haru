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
// 사용자 요청: 연산 주색을 노란색으로 (파랑 #2563EB → #F59F00)
rep("math:['연산','#2563EB'],gugu:['구구단','#2563EB']", "math:['연산','#F59F00'],gugu:['구구단','#F59F00']");
rep("let HG=null; try{ if(parent!==window&&parent.HGS) HG=parent.HGS; }catch(e){}\nif(!HG) HG=makeHGS();", 'let HG=env.HGS;');
rep("const screen=document.getElementById('screen'), bar=document.getElementById('bar'), tabsEl=document.getElementById('tabs');", "const screen=root.querySelector('#screen'), bar=root.querySelector('#bar'), tabsEl=root.querySelector('#tabs');");
rep("const EMB=(()=>{ try{ return parent!==window&&!!parent.hgNav; }catch(e){ return false; } })();", 'const EMB=true;');
js = js.replace(/parent!==window&&/g, '');
js = js.replace(/parent\./g, 'env.');
js = js.replace(/document\.querySelector\('\.app'\)/g, "root.querySelector('.app')");
rep('setTab(\'home\');', 'navGo(env.start||\'game\', env.sub);');

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
