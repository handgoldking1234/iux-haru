/* 과목 화면 비교: 프로토타입(시연 데이터)과 새 화면을 같은 크기로 찍고 나란히 붙인다.
   실행: node e2e/compare-sub.mjs <과목키> [출력 폴더]  (서버 3123 실행 중) */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SUB = process.argv[2] ?? 'hist';
const OUT = process.argv[3] ?? 'e2e/compare';
const PROTO = pathToFileURL(path.resolve('../prototype/dist/index.html')).href;
const BASE = 'http://localhost:3123';
fs.mkdirSync(OUT, { recursive: true });
const AUTH = { email: 'parent@example.com', via: 'email', kids: [{ name: '민왕이', grade: '초5' }], kid: 0 };
const errors = [];
const b = await chromium.launch();

async function shots(page, frame, tag, size, steps) {
  for (const [name, act] of steps) {
    if (act) await act();
    await page.waitForTimeout(700);
    await page.evaluate(() => document.querySelectorAll('.alm,.bstamp').forEach((e) => e.remove()));
    await page.screenshot({ path: `${OUT}/${size}-${SUB}-${name}-${tag}.png` });
  }
}

for (const [size, w, h] of [['m', 390, 780], ['d', 1024, 780]]) {
  const pc = await b.newContext({ viewport: { width: w, height: h } });
  const p = await pc.newPage();
  await p.addInitScript((a) => localStorage.setItem('harugongbu-auth', JSON.stringify(a)), AUTH);
  await p.goto(PROTO); await p.waitForTimeout(1200);
  await p.evaluate((s) => window.goSubject(s), SUB); await p.waitForTimeout(1200);
  const fr = () => p.frames().find((f) => f !== p.mainFrame() && f.url() === 'about:srcdoc' && f.name() === '' && f.parentFrame()) ;
  const sub = async () => { for (const f of p.frames()) { if (f === p.mainFrame()) continue; const fe = await f.frameElement(); if (await fe.isVisible()) return f; } };
  await shots(p, null, 'proto', size, [
    ['home', null],
    ['cards', async () => (await sub()).evaluate(() => window.subTab('cards'))],
    ['report', async () => (await sub()).evaluate(() => window.subTab('report'))],
    ['play', async () => { const f = await sub(); await f.evaluate(() => window.subTab('home')); await p.waitForTimeout(300); await f.click('#goNew'); }],
    ['answer', async () => { const f = await sub(); if (await f.$('#ch button')) await f.click('#ch button >> nth=0'); else if (await f.$('.keys button')) { await f.click('.keys button >> nth=0'); } }],
    ['slide', async () => { const f = await sub(); await f.evaluate(() => { window.subTab('home'); }); await p.waitForTimeout(400); await f.evaluate(() => window.hgSlide && window.hgSlide()); }],
    ['wordbook', async () => { const f = await sub(); await f.evaluate(() => { document.querySelectorAll('.slp').forEach((x) => (x.hidden = true)); window.hgWordbook && window.hgWordbook(); }); }],
  ]);
  await pc.close();

  const nc = await b.newContext({ viewport: { width: w, height: h } });
  const n = await nc.newPage();
  n.on('console', (m) => m.type() === 'error' && errors.push(`${size} ${m.text()}`));
  n.on('pageerror', (e) => errors.push(`${size} ${e.message}`));
  await n.addInitScript((a) => localStorage.setItem('harugongbu-auth', JSON.stringify(a)), AUTH);
  await n.goto(`${BASE}/study/${SUB}`); await n.waitForSelector('#screen > *');
  await shots(n, null, 'new', size, [
    ['home', null],
    ['cards', () => n.click('.sw2 button >> nth=1')],
    ['report', () => n.click('.sw2 button >> nth=2')],
    ['play', async () => { await n.click('.sw2 button >> nth=0'); await n.waitForTimeout(300); await n.click('.pc-btns .gbtn >> nth=1'); }],
    ['concept-next', async () => { for (let i = 0; i < 12 && await n.$('.cx .btn.k:not([disabled])'); i++) await n.click('.cx .btn.k:not([disabled])'); }],
    ['answer', async () => { if (await n.$('.cx .btn.y')) await n.click('.cx .btn.y'); await n.waitForTimeout(300); if (await n.$('#ch button')) await n.click('#ch button >> nth=0'); }],
    ['slide', async () => { await n.goto(`${BASE}/study/${SUB}`); await n.waitForSelector('#screen > *'); if (await n.$('.slbtn')) await n.click('.slbtn:not(.wb)'); }],
    ['wordbook', async () => { if (!(await n.$('.slbtn'))) return; await n.click('.slp:not([hidden]) [data-a="close"]'); await n.waitForTimeout(300); await n.click('.slbtn.wb'); }],
  ]);
  if (await n.evaluate(() => document.documentElement.scrollWidth > innerWidth)) errors.push(`${size}: 가로 스크롤`);
  await nc.close();
}
// 나란히 붙이기
const pg = await b.newPage();
for (const size of ['m', 'd']) for (const name of ['home', 'cards', 'report', 'play', 'answer', 'slide', 'wordbook']) {
  const a = `${OUT}/${size}-${SUB}-${name}-proto.png`, c = `${OUT}/${size}-${SUB}-${name}-new.png`;
  if (!fs.existsSync(a) || !fs.existsSync(c)) continue;
  const im = (f) => fs.readFileSync(f).toString('base64');
  await pg.setContent(`<body style="margin:0;display:flex;gap:12px;background:#888"><div><div style="font:bold 20px sans-serif;color:#fff;padding:4px">프로토타입</div><img src="data:image/png;base64,${im(a)}"></div><div><div style="font:bold 20px sans-serif;color:#fff;padding:4px">새 화면</div><img src="data:image/png;base64,${im(c)}"></div></body>`);
  await pg.screenshot({ path: `${OUT}/sbs-${size}-${SUB}-${name}.png`, fullPage: true });
}
await b.close();
console.log(errors.length ? errors.join('\n') : '콘솔 에러 0 · 가로 스크롤 없음');
