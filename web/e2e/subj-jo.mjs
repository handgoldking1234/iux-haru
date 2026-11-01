/* 공통 과목(영단어) 새 규칙 화면 확인: 지금 단원 '100점 n/2' 표시 · 학년(초3)보다 앞선 중등 단원은 잠기고 '배운 단원 다지기'
   실행: (로컬 모드 서버) BASE=… OUT=폴더 node e2e/subj-jo.mjs */
import { chromium } from '@playwright/test';
const BASE = process.env.BASE ?? 'http://localhost:3124';
const OUT = process.env.OUT ?? '.';
const KID = '조안테스트';
const AUTH = { email: 'parent@example.com', via: 'email', kids: [{ name: KID, grade: '초3' }], kid: 0 };
const KEY = `harugongbu-prog-${KID}-eng-all`;
const save = (p) => ({ p: { stage: 0, np: 0, streak: 0, bp: {}, wr: {}, read: {}, passed: {}, cards: [], grad: 0, ...p }, hist: {}, stat: {}, sst: {}, offset: 0 });

const log = [], errs = [];
const b = await chromium.launch();
async function shot(w, name, st) {
  const pg = await b.newPage({ viewport: { width: w, height: 780 } });
  pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await pg.addInitScript(([a, k, s]) => { localStorage.setItem('harugongbu-auth', JSON.stringify(a)); localStorage.setItem(k, JSON.stringify(s)); }, [AUTH, KEY, st]);
  await pg.goto(`${BASE}/study/eng`); await pg.waitForTimeout(1800);
  await pg.evaluate(() => document.querySelectorAll('.alm').forEach((x) => x.remove()));
  await pg.screenshot({ path: `${OUT}/${name}-${w}.png`, fullPage: true });
  log.push(`${w} ${name}: ` + (await pg.locator('.paycard .mixline').innerText()) + ' | ' + (await pg.locator('.nowrow').innerText()).replace(/\s+/g, ' '));
  if (name === 'eng-hold') { await pg.getByRole('button', { name: /시작|이어서/ }).first().click(); await pg.waitForTimeout(800); log.push(`${w} 다지기 풀이: ` + (await pg.locator('.ptag').innerText()).replace(/\s+/g, ' ')); }
  await pg.close();
}
for (const w of [390, 1024]) {
  await shot(w, 'eng-now', save({ stage: 2, np: 2, read: { s2: true }, bp: { s2: 7 }, streak: 3, mast: { s2: [1] }, passed: { s0: { box: 0, due: 3 }, s1: { box: 0, due: 4 } } }));
  // 초등 85단원 + 승급 평가(s85) 다음 s86이 중등 1단원
  const passed = Object.fromEntries(Array.from({ length: 85 }, (_, i) => [`s${i}`, { box: 2, due: 0, ld: 99999, lb: 0 }]));
  passed.s85 = { exam: true, box: 2, score: 90 };
  await shot(w, 'eng-hold', save({ stage: 86, np: 86, passed }));
}
await b.close();
console.log(log.join('\n')); console.log(errs.length ? '콘솔 에러:\n' + errs.join('\n') : '콘솔 에러 0');
