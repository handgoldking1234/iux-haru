/**
 * 한자 데이터·문제 생성 코드를 프로토타입에서 그대로 가져온다 (손으로 다시 쓰지 않음).
 *   prototype/build/app.js 16~334줄  → src/lib/subjects/hanjaCore.js  (createHanjaCore(D, env))
 *   prototype/build/pics.js          → src/lib/subjects/hanjaPics.js  (본뜬 모양 그림)
 *   prototype/build/strokes.js의 SK  → public/content/strokes.json    (획순, hanzi-writer-data · Arphic Public License)
 * 바뀌는 곳: 저장소·셸 접근(로그인 진도, 쓰기 설정)과 획순 데이터·아이콘은 env로 받는다.
 * 실행: npm run hanja-core
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const B = path.resolve(here, '../../prototype/build');
const SRC = path.resolve(here, '../src/lib/subjects');
const PUB = path.resolve(here, '../public/content');

const lines = fs.readFileSync(path.join(B, 'app.js'), 'utf8').split('\n');
let body = lines.slice(15, 334).join('\n');
const rep = (a, b) => {
  if (!body.includes(a)) throw new Error('찾지 못함: ' + a.slice(0, 60));
  body = body.split(a).join(b);
};
rep('const D=__DATA__;', '');
rep("try{ localStorage.setItem('hanja-track',TRK); }catch(e){}", '');
rep('  S=load()||seed();\n', '');
rep("const PICS=(typeof PIC!=='undefined')?PIC:{};", 'const PICS=env.PIC||{};');
rep("const canWrite=h=>typeof SK!=='undefined'&&!!SK[h]&&typeof HanziWriter!=='undefined';", 'const canWrite=h=>{ const SK=env.SK(); return !!SK&&!!SK[h]; };');
body = body.replace(/function writeOn\(\)\{.*\n/, 'const writeOn=()=>env.writeOn();\n');
body = body.replace(/function setWrite\(on\)\{.*\n/, 'const setWrite=on=>env.setWrite(on);\n');
rep('const skLoad=(c,onLoad)=>onLoad(SK[c]);', 'const skLoad=(c,onLoad)=>onLoad(env.SK()[c]);');

const out = `/* eslint-disable */
// @ts-nocheck
/**
 * 한자씨앗 데이터·문제 생성 — prototype/build/app.js 16~334줄을 그대로 옮김 (자동 생성: scripts/hanja-core.mjs, 직접 고치지 않기)
 * env: { SK(): 획순 데이터|null, writeOn(): boolean, setWrite(on), LI(name, cls): 아이콘 SVG, PIC: 본뜬 모양 그림 }
 */
export function createHanjaCore(D, env) {
const LI = env.LI;
${body}
return {
  D, LV, CH, ALL, BYRAD, CJ, PH, CJMOF, RADS, RADI, RTHEME, BASIC, TRKN, MAN, KIND,
  radHun, radLab, buildTrack, phInfoHTML, phraseQ, hunum, wordsOf, wlv, gloss, origin, figHTML, infoHTML, radInfoHTML, infoOf,
  TNAME, makeQ, canWrite, writeOn, setWrite, eumOpts, readings, esc0,
  get TRK() { return TRK; }, get STAGES() { return STAGES; }, get IDX() { return IDX; }, get STOF() { return STOF; },
  get RSTOF() { return RSTOF; }, get AREAS() { return AREAS; },
};
}
`;
fs.writeFileSync(path.join(SRC, 'hanjaCore.js'), out);

const pics = fs.readFileSync(path.join(B, 'pics.js'), 'utf8');
fs.writeFileSync(path.join(SRC, 'hanjaPics.js'), `/* eslint-disable */\n// @ts-nocheck\n/* 본뜬 모양 그림 — prototype/build/pics.js 그대로 (직접 그림) */\n${pics}\nexport { PIC };\n`);

const st = fs.readFileSync(path.join(B, 'strokes.js'), 'utf8');
const i = st.indexOf('const SK=') + 'const SK='.length;
// SK 객체 끝: 중괄호 짝 맞추기
let depth = 0, j = i;
for (; j < st.length; j++) { const c = st[j]; if (c === '{') depth++; else if (c === '}') { depth--; if (depth === 0) { j++; break; } } else if (c === '"') { j++; while (st[j] !== '"') { if (st[j] === '\\') j++; j++; } } }
const SK = JSON.parse(st.slice(i, j));
fs.writeFileSync(path.join(PUB, 'strokes.json'), JSON.stringify(SK));
console.log('hanjaCore.js', body.length, '· strokes', Object.keys(SK).length, '자');
