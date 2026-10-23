/* 실제 학생 랭킹 확인: 새 계정으로 랭킹을 열면 다른 집 학생(닉네임만)이 보이고 내 줄이 표시되는지
   실행: BASE=… node e2e/supabase-rank.mjs  (0003_leaderboard.sql 적용) */
import { chromium } from '@playwright/test';
const BASE = process.env.BASE ?? 'http://localhost:3123';
const email = `test.harugongbu+${Date.now()}@example.com`, pw = 'haru2026test';
const errs = [];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 780 } });
p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await p.goto(`${BASE}/login`);
await p.click('text=회원가입');
await p.fill('input[autocomplete="email"]', email);
await p.fill('input[autocomplete="new-password"]', pw);
await p.fill('input[placeholder="민왕이"]', '랭킹');
await p.click('.achk.all');
await p.click('text=가입하고 시작하기');
await p.waitForSelector('.kid'); await p.click('.kid'); await p.waitForURL('**/home');
await p.click('text=시연: 오늘 할 일 모두 끝낸 것으로 하기'); await p.waitForTimeout(2500);
await p.goto(`${BASE}/rank`); await p.waitForTimeout(2500);
const rows = await p.locator('.rlist li .nm').allTextContents();
const note = await p.locator('.sec .note').last().textContent();
const badge = await p.locator('.gnav button:nth-child(4) em').textContent().catch(() => '없음');
await p.screenshot({ path: process.argv[2] ? `${process.argv[2]}/rank-live.png` : 'e2e/rank-live.png' });
await b.close();
console.log('순위:', rows.map((r) => r.replace(/등급$/, '')).join(' | '));
console.log('안내:', note); console.log('하단 랭킹 배지:', badge);
console.log(errs.length ? '콘솔 에러:\n' + errs.join('\n') : '콘솔 에러 0');
