/**
 * 관리자 페이지를 시안(prototype/admin/index.html)에서 그대로 가져온다.
 *   <style>  → src/styles/proto/admin.css   (.pg-admin 범위 — 학생 화면 CSS와 섞이지 않게)
 *   마크업·<script> → src/lib/admin/adminApp.js  (mountAdmin(root, env))
 * 1차 범위(로그인·대시보드·회원·관리자 권한)는 scripts/admin-live.js의 실제 데이터 화면으로 바꿔 끼운다.
 * 나머지 메뉴(유입·학습·게임·콘텐츠·고객지원·보상·결제)는 시안의 예시 데이터 그대로이고 '예시 데이터' 표시가 붙는다.
 * 실행: node scripts/admin-app.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import prefixer from 'postcss-prefix-selector';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '../..');
const html = fs.readFileSync(path.join(ROOT, 'prototype/admin/index.html'), 'utf8');

/* CSS: :root·html·body는 범위 요소 자신 */
// 과목 주색은 학생 앱과 같게 (연산 초록 · 타자 파랑, docs/05_ui_guide.md)
const css = html.slice(html.indexOf('<style>') + 7, html.indexOf('</style>'))
  .replace('--c-math:#2563EB', '--c-math:#22A55B').replace('--c-typ:#0E7490', '--c-typ:#2563EB');
const scoped = postcss([prefixer({
  prefix: '.pg-admin',
  transform(prefix, sel, prefixed) {
    if (/^(html|body|:root)$/.test(sel)) return prefix;
    const m = sel.match(/^(html|body|:root)([\s>:.[].*)$/);
    return m ? prefix + m[2] : prefixed;
  },
})]).process(css, { from: undefined }).css;
fs.writeFileSync(path.resolve(here, '../src/styles/proto/admin.css'),
  '/* 자동 생성 — scripts/admin-app.mjs. 직접 고치지 말고 prototype/admin/index.html 기준으로 다시 만든다 */\n' + scoped);

/* 마크업 */
// 시안에 미리 넣어 둔 관리자 이메일은 공개 페이지에 드러나지 않게 지운다
const skeleton = html.slice(html.indexOf('</style>') + 8, html.indexOf('<script>')).trim()
  .replace(/ value="[^"]*@[^"]*"/, '').replace(/(<small id="meMail">)[^<]*/, '$1');
let js = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));
const rep = (a, b) => { if (!js.includes(a)) throw new Error('찾지 못함: ' + a.slice(0, 70)); js = js.split(a).join(b); };
const cut = (from, to, by) => { const a = js.indexOf(from), b = js.indexOf(to, a + 1); if (a < 0 || b < 0) throw new Error('구간을 찾지 못함: ' + from.slice(0, 40)); js = js.slice(0, a) + by + js.slice(b); };

/* 실제 데이터 화면 */
const live = Object.fromEntries(fs.readFileSync(path.join(here, 'admin-live.js'), 'utf8').split(/^\/\/@@ /m).filter(Boolean).map((s) => { const i = s.indexOf('\n'); return [s.slice(0, i).trim(), s.slice(i + 1)]; }));
cut('V.dash=()=>{', '\nconst CH=[', live.dash);
cut('const NAMES=', '\nV.learn=', live.users);
cut('V.sys=()=>', '\nconst TITLE=', live.sys);
cut("drawer.addEventListener('click',e=>{", "document.addEventListener('keydown',e=>{ if(e.key==='Escape')", live.drawer);
cut('/* 로그인 (시안', '/* 오른쪽 위 내 계정 */', live.login);
// 마지막 줄: 세션 확인 → 바로 들어가기 / 로그인 화면
cut("let au=false;", '\n', "env.session().then(r=>{ if(r&&r.ok&&r.next==='in') enter(); else showLogin(); });");
// 기간을 바꾸면 요약을 다시 불러온다 · 실제 데이터 메뉴는 '예시 데이터' 표시를 숨긴다
rep('range=+b.dataset.r;', "range=+b.dataset.r; if(LIVE.includes(cur)) reloadSum().then(render);");
rep('function render(){ nav.innerHTML=navHTML();', "function render(){ const dm=root.querySelector('.demo'); if(dm) dm.hidden=LIVE.includes(cur); nav.innerHTML=navHTML();");

/* 문서 전체 대신 이 화면 안에서만: getElementById·querySelector → root, 테마 → root, 전역 이벤트는 정리 가능하게 */
js = js.replace(/document\.getElementById\('([^']+)'\)/g, "root.querySelector('#$1')");
rep("document.getElementById('pv_'+k)", "root.querySelector('#pv_'+k)");
js = js.replace(/document\.querySelector(All)?\(/g, 'root.querySelector$1(');
js = js.replace(/document\.documentElement/g, 'root');
js = js.replace(/document\.addEventListener\(/g, '_on(document,');
rep("addEventListener('resize',", "_on(window,'resize',");
// 시안의 모든 링크·로그인 상태 저장(sessionStorage)은 쓰지 않는다
js = js.replace(/try\{ sessionStorage\.[^}]*\}catch\(e\)\{\}/g, '');

const out = `/* eslint-disable */
// @ts-nocheck
/**
 * 관리자 페이지 — prototype/admin/index.html을 그대로 옮김 (자동 생성: scripts/admin-app.mjs, 직접 고치지 않기)
 * env: { session, signIn, verify, signOut, resetMail, me, daily, summary, members, member, reveal, cash, setStatus, admins, audit }
 */
export const ADMIN_SKELETON = ${JSON.stringify(skeleton)};

export function mountAdmin(root, env) {
root.innerHTML = ADMIN_SKELETON;
const AC = new AbortController();
const _on = (t, ev, f) => t.addEventListener(ev, f, { signal: AC.signal });
${js}
return { destroy() { AC.abort(); root.innerHTML = ''; } };
}
`;
fs.mkdirSync(path.resolve(here, '../src/lib/admin'), { recursive: true });
fs.writeFileSync(path.resolve(here, '../src/lib/admin/adminApp.js'), out);
console.log('admin.css · adminApp.js', out.length);
