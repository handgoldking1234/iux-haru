/* 게임 진행(스피드 게임·대결방)과 검색 화면을 프로토타입과 같은 크기로 찍는다 (오늘 할 일을 끝낸 상태로 게임을 연다)
   실행: node e2e/compare-extra.mjs [출력 폴더]  (서버 3123 실행 중) */
import { chromium } from '@playwright/test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const OUT = process.argv[2] ?? 'e2e/compare';
const PROTO = pathToFileURL(path.resolve('../prototype/dist/index.html')).href;
const AUTH = { email: 'a@b.c', via: 'email', kids: [{ name: '민왕이', grade: '초5' }], kid: 0 };
const errs = [];
const b = await chromium.launch();
const vis = async (p) => { for (const x of p.frames()) { if (x === p.mainFrame()) continue; if (await (await x.frameElement()).isVisible()) return x; } return p; };
for (const tag of ['proto', 'new']) {
  const p = await b.newPage({ viewport: { width: 390, height: 780 } });
  p.on('pageerror', (e) => errs.push(tag + ' ' + e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(tag + ' ' + m.text()));
  await p.addInitScript((a) => { localStorage.setItem('harugongbu-auth', JSON.stringify(a)); localStorage.setItem('harugongbu-subject', 'play'); }, AUTH);
  const clean = () => p.evaluate(() => document.querySelectorAll('.alm,.bstamp').forEach((e) => e.remove()));
  if (tag === 'proto') { await p.goto(PROTO); await p.waitForTimeout(1500); await p.click('#gnav [data-g="home"]'); await p.waitForTimeout(700); const f = await vis(p); await f.click('#demoDone'); await p.waitForTimeout(500); await p.click('#gnav [data-g="game"]'); }
  else { await p.goto('http://localhost:3123/home'); await p.waitForTimeout(900); await p.click('text=시연: 오늘 할 일 모두 끝낸 것으로 하기'); await p.waitForTimeout(600); await p.goto('http://localhost:3123/game'); }
  await p.waitForTimeout(1400); await clean();
  await p.screenshot({ path: `${OUT}/x-game-${tag}.png` });
  let f = tag === 'proto' ? await vis(p) : p;
  await f.click('#speed'); await p.waitForTimeout(1200); await clean();
  await p.screenshot({ path: `${OUT}/x-speed-${tag}.png` });
  f = tag === 'proto' ? await vis(p) : p;
  await f.click('.opts button >> nth=0').catch(() => {}); await p.waitForTimeout(400);
  await p.screenshot({ path: `${OUT}/x-speed2-${tag}.png` });
  // 검색
  if (tag === 'proto') { await p.evaluate(() => window.goSubject('eng')); await p.waitForTimeout(800); await p.click('#sSrch'); }
  else { await p.goto('http://localhost:3123/study/eng'); await p.waitForTimeout(1200); await p.click('[aria-label="학습 검색"]'); }
  await p.waitForTimeout(800); await p.fill('#srq', 'happy'); await p.waitForTimeout(600); await clean();
  await p.screenshot({ path: `${OUT}/x-search-${tag}.png` });
  await p.close();
}
await b.close(); console.log(errs.join('\n') || '콘솔 에러 0');
