/**
 * 통합 검색을 프로토타입에서 그대로 가져온다.
 *   prototype/build/search.js                      → src/lib/searchApp.js (createSearch(env))
 *   prototype/dist/index.html 안의 검색 색인(IDX)  → public/content/search.json (sindex.py가 만든 11,051개)
 * 바뀌는 곳: 결과에서 '공부하러 가기'를 누르면 셸의 show(과목) 대신 env.go(과목)로 이동한다.
 * 실행: npm run search-app
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '../..');
const dist = fs.readFileSync(path.join(ROOT, 'prototype/dist/index.html'), 'utf8');
const at = dist.indexOf('/* 통합 학습 검색');
const i = dist.indexOf('const IDX=', at) + 'const IDX='.length;
const j = dist.indexOf(';\nconst SN=', i);
const IDX = JSON.parse(dist.slice(i, j));
fs.writeFileSync(path.join(ROOT, 'web/public/content/search.json'), JSON.stringify(IDX));

let js = fs.readFileSync(path.join(ROOT, 'prototype/build/search.js'), 'utf8');
const rep = (a, b) => {
  if (!js.includes(a)) throw new Error('찾지 못함: ' + a.slice(0, 70));
  js = js.split(a).join(b);
};
rep('(function(){\nconst IDX=__SIDX__;', 'export function createSearch(env){\nconst IDX=env.idx;');
rep('try{ show(t.dataset.go); }catch(err){}', 'try{ env.go(t.dataset.go); }catch(err){}');
rep('window.hgSearch=open;', '');
rep("const btn=document.getElementById('sSrch'); if(btn) btn.onclick=open;", '');
js = js.replace(/\}\)\(\);\s*$/, 'return { open, close, destroy(){ if(box) box.remove(); } };\n}\n');

fs.writeFileSync(path.join(ROOT, 'web/src/lib/searchApp.js'), `/* eslint-disable */\n// @ts-nocheck\n/* 통합 검색 — prototype/build/search.js 그대로 (자동 생성: scripts/search-app.mjs, 직접 고치지 않기) */\n${js}`);
console.log('searchApp.js · search.json', Array.isArray(IDX) ? IDX.length : Object.keys(IDX).length);
