/**
 * 프로토타입 콘텐츠(prototype/build · prototype/data) → web/public/content/*.json
 * 합치는 규칙은 prototype/build/build.py와 같다.
 *   한자   data.json + data/cjm/cjm.json(천자문)          → hanja.json
 *   영단어 eng.json + data/eng_ety/out1~6.json(어원)        → eng.json
 *   과학   data/sci/v2/{영역}_{0,1,2}.json + add_{영역}.json → sci.json (보강 단원은 after 자리에, 단원 번호 다시 매김)
 *   국어·역사·타자 build/*.json 그대로
 * 연산 문제은행은 math.html 코드 안에 있어 과목 이식 단계에서 옮긴다.
 * 실행: npm run content
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '../..');
const B = path.join(ROOT, 'prototype/build');
const D = path.join(ROOT, 'prototype/data');
const OUT = path.resolve(here, '../public/content');

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const exists = (p) => fs.existsSync(p);
fs.mkdirSync(OUT, { recursive: true });

const manifest = { source: 'prototype v62', subjects: {} };
function write(name, data, counts) {
  const s = JSON.stringify(data);
  fs.writeFileSync(path.join(OUT, `${name}.json`), s);
  manifest.subjects[name] = { file: `${name}.json`, bytes: Buffer.byteLength(s), ...counts };
  console.log(`${name}.json`.padEnd(12), `${(Buffer.byteLength(s) / 1024).toFixed(0)}KB`, JSON.stringify(counts));
}

// 한자 + 천자문
const hanja = read(path.join(B, 'data.json'));
hanja.CJM = read(path.join(D, 'cjm/cjm.json'));
write('hanja', hanja, { chars: hanja.CH.length, units: hanja.ST.length, phrases: hanja.CJM.ph.length });

// 영단어 + 어원
const eng = read(path.join(B, 'eng.json'));
eng.ETY = {};
for (let i = 1; i <= 6; i++) {
  const f = path.join(D, `eng_ety/out${i}.json`);
  if (exists(f)) Object.assign(eng.ETY, read(f));
}
write('eng', eng, { words: eng.W.length, units: eng.ST.length, ety: Object.keys(eng.ETY).length });

// 과학: 영역별로 학교급 파일 3개를 잇고 보강 단원을 끼워 넣음
const SV = path.join(D, 'sci/v2');
function sciArea(a) {
  const lvs = [0, 1, 2].map((lv) => read(path.join(SV, `${a}_${lv}.json`)).units);
  const add = path.join(SV, `add_${a}.json`);
  if (exists(add)) {
    for (const u of read(add).units) {
      const L = lvs[u.lv];
      const after = u.after ?? '^';
      delete u.after;
      if (after === '^') L.unshift(u);
      else {
        const ix = L.findIndex((x) => x.title === after);
        if (ix < 0) {
          console.warn('!! after not found', a, after);
          L.push(u);
        } else L.splice(ix + 1, 0, u);
      }
    }
  }
  const us = lvs.flat();
  const cnt = {};
  for (const u of us) u.n = cnt[u.lv] = (cnt[u.lv] ?? 0) + 1;
  return us;
}
const sci = Object.fromEntries(['phy', 'chem', 'bio', 'earth'].map((a) => [a, { units: sciArea(a) }]));
const unitCount = (o) => Object.values(o).reduce((n, t) => n + (t.units?.length ?? 0), 0);
const itemCount = (o) => Object.values(o).reduce((n, t) => n + (t.units ?? []).reduce((m, u) => m + u.items.length, 0), 0);
const mcCount = (o) => Object.values(o).reduce((n, t) => n + (t.units ?? []).reduce((m, u) => m + (u.mc?.length ?? 0), 0), 0);
write('sci', sci, { units: unitCount(sci), items: itemCount(sci), mc: mcCount(sci) });

// 국어 · 역사 · 타자
const kor = read(path.join(B, 'kor.json'));
// mix(섞어서)는 vc·kr을 합쳐 둔 갈래라 개수에서 뺀다
const korBase = { vc: kor.vc, kr: kor.kr };
write('kor', kor, { units: unitCount(korBase), items: itemCount(korBase), mc: mcCount(korBase) });
const hist = read(path.join(B, 'hist.json'));
write('hist', hist, { units: unitCount(hist), items: itemCount(hist), timeline: hist.TL?.length ?? 0 });
const typ = read(path.join(B, 'typ.json'));
write('typ', typ, { koW: typ.koW.length, koS: typ.koS.length, enW: typ.enW.length, enS: typ.enS.length });

fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('→', path.relative(ROOT, OUT));
