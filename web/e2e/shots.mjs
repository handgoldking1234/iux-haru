/* 화면 확인: 모바일 390×780 · 데스크톱 1024 스크린샷 + 콘솔 에러 수
   실행: npm run build && npx next start -p 3123 → node e2e/shots.mjs [출력 폴더] */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:3123';
const OUT = process.argv[2] ?? 'e2e/shots';
fs.mkdirSync(OUT, { recursive: true });
const errors = [];
const b = await chromium.launch();

for (const [size, w, h] of [['m', 390, 780], ['d', 1024, 780]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  p.on('console', (m) => m.type() === 'error' && errors.push(`${size} ${p.url()} ${m.text()}`));
  p.on('pageerror', (e) => errors.push(`${size} ${p.url()} ${e.message}`));
  const shot = async (name) => {
    await p.waitForTimeout(400);
    await p.screenshot({ path: `${OUT}/${size}-${name}.png` });
    const sx = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (sx) errors.push(`${size} ${name}: 가로 스크롤 생김`);
  };

  await p.goto(`${BASE}/`);
  await p.waitForURL('**/login');
  await shot('login');
  await p.getByRole('button', { name: '보호자 가입' }).click();
  await p.fill('input[type=email]', 'parent@example.com');
  await p.fill('input[type=password]', 'secret12');
  await p.getByLabel('모두 동의해요').check();
  await shot('signup');
  await p.getByRole('button', { name: '가입하기' }).click();
  await p.waitForURL('**/kids');
  await p.fill('input[placeholder="예: 민왕이"]', '민왕이');
  await p.selectOption('select', '초5');
  await shot('kids');
  await p.getByRole('button', { name: '추가하고 시작하기' }).click();
  await p.waitForURL('**/home');
  await shot('home');
  await p.getByRole('link', { name: /공부/ }).first().click();
  await p.waitForURL('**/study/math');
  await shot('study-math');
  await p.getByRole('button', { name: /연산/ }).first().click();
  await shot('study-dd');
  await p.goto(`${BASE}/study/hanja`);
  await shot('study-hanja');
  await p.getByRole('button', { name: '알림' }).click();
  await shot('noti');
  await p.keyboard.press('Escape');
  await p.goto(`${BASE}/game`);
  await shot('game');
  await p.goto(`${BASE}/my`);
  await p.getByRole('tab', { name: '설정' }).click();
  await shot('my-set');
  await ctx.close();
}
await b.close();
console.log(errors.length ? errors.join('\n') : '콘솔 에러 0 · 가로 스크롤 없음');
