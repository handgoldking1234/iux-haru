/* 프로토타입과 새 화면을 같은 크기로 찍어 나란히 비교한다.
   실행: node e2e/compare.mjs [출력 폴더]  (서버 3123 실행 중) */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const OUT = process.argv[2] ?? 'e2e/compare';
const PROTO = pathToFileURL(path.resolve('../prototype/dist/index.html')).href;
const BASE = 'http://localhost:3123';
fs.mkdirSync(OUT, { recursive: true });
const AUTH = { email: 'parent@example.com', via: 'email', kids: [{ name: '민왕이', grade: '초5' }], kid: 0 };
const errors = [];
const b = await chromium.launch();

for (const [size, w, h] of [['m', 390, 780], ['d', 1024, 780]]) {
  // 프로토타입
  const pc = await b.newContext({ viewport: { width: w, height: h } });
  const p = await pc.newPage();
  await p.addInitScript((a) => { localStorage.setItem('harugongbu-auth', JSON.stringify(a)); localStorage.setItem('harugongbu-subject', 'play'); }, AUTH);
  await p.goto(PROTO); await p.waitForTimeout(1500);
  const clean = () => p.evaluate(() => document.querySelectorAll('.alm,.bstamp').forEach((e) => e.remove()));
  for (const g of ['home', 'game', 'rank', 'my']) {
    await p.click(`#gnav [data-g="${g}"]`); await p.waitForTimeout(900); await clean();
    await p.screenshot({ path: `${OUT}/${size}-${g}-proto.png` });
  }
  await p.click('#gnav [data-g="home"]'); await p.waitForTimeout(600);
  await p.evaluate(() => window.hgSheet('menu')); await p.waitForTimeout(400); await clean();
  await p.screenshot({ path: `${OUT}/${size}-menu-proto.png` });
  await pc.close();

  // 새 화면
  const nc = await b.newContext({ viewport: { width: w, height: h } });
  const n = await nc.newPage();
  n.on('console', (m) => m.type() === 'error' && errors.push(`${size} ${n.url()} ${m.text()}`));
  n.on('pageerror', (e) => errors.push(`${size} ${n.url()} ${e.message}`));
  await n.addInitScript((a) => localStorage.setItem('harugongbu-auth', JSON.stringify(a)), AUTH);
  for (const g of ['home', 'game', 'rank', 'my']) {
    await n.goto(`${BASE}/${g}`); await n.waitForTimeout(700);
    await n.screenshot({ path: `${OUT}/${size}-${g}-new.png` });
    if (await n.evaluate(() => document.documentElement.scrollWidth > innerWidth)) errors.push(`${size} ${g}: 가로 스크롤`);
  }
  await n.goto(`${BASE}/home`); await n.waitForTimeout(500);
  await n.getByRole('button', { name: '전체보기' }).click(); await n.waitForTimeout(400);
  await n.screenshot({ path: `${OUT}/${size}-menu-new.png` });
  await n.goto(`${BASE}/study/math`); await n.waitForTimeout(600);
  await n.screenshot({ path: `${OUT}/${size}-study-new.png` });
  await nc.close();
}
// 로그인 화면
const lc = await b.newContext({ viewport: { width: 390, height: 780 } });
const l = await lc.newPage();
await l.goto(PROTO); await l.waitForTimeout(1200); await l.screenshot({ path: `${OUT}/m-login-proto.png` });
await l.goto(`${BASE}/login`); await l.waitForTimeout(700); await l.screenshot({ path: `${OUT}/m-login-new.png` });
await b.close();
console.log(errors.length ? errors.join('\n') : '콘솔 에러 0 · 가로 스크롤 없음');
