/* 기기 간 이어짐 확인: 기기 A에서 가입·공부 → 기기 B(빈 브라우저)에서 같은 계정으로 로그인하면 같은 기록이 보이는지
   실행: node e2e/supabase-sync.mjs  (서버 3123, .env.local에 Supabase 키, 0002_student_state.sql 적용) */
import { chromium } from '@playwright/test';
const BASE = 'http://localhost:3123';
const email = `test.harugongbu+${Date.now()}@example.com`, pw = 'haru2026test';
const out = [], errs = [];
const b = await chromium.launch();

// 기기 A: 가입 → 오늘 할 일 끝내기(시연 버튼) → 역사 문제 하나 풀기
const A = await b.newContext({ viewport: { width: 390, height: 780 } });
const a = await A.newPage();
a.on('pageerror', (e) => errs.push('A ' + e.message)); a.on('console', (m) => m.type() === 'error' && errs.push('A ' + m.text()));
await a.goto(`${BASE}/login`);
await a.click('text=회원가입');
await a.fill('input[autocomplete="email"]', email);
await a.fill('input[autocomplete="new-password"]', pw);
await a.fill('input[placeholder="민왕이"]', '이음');
await a.click('.achk.all');
await a.click('text=가입하고 시작하기');
await a.waitForSelector('.kid'); await a.click('.kid');
await a.waitForURL('**/home');
await a.click('text=시연: 오늘 할 일 모두 끝낸 것으로 하기');
await a.waitForTimeout(500);
await a.goto(`${BASE}/study/hist`); await a.waitForSelector('.paycard');
await a.click('.pc-btns .gbtn >> nth=1');
for (let i = 0; i < 12 && await a.$('.cx .btn.k:not([disabled])'); i++) await a.click('.cx .btn.k:not([disabled])');
if (await a.$('.cx .btn.y')) await a.click('.cx .btn.y');
await a.waitForSelector('#ch button'); await a.click('#ch button >> nth=0');
await a.waitForTimeout(800);
await a.goto(`${BASE}/home`); await a.waitForSelector('.cash');
const cashA = await a.locator('.cash').first().textContent();
await a.waitForTimeout(2000); // 서버에 올라갈 시간
out.push(`A 캐시(문제 푼 뒤): ${cashA}`);

// 기기 B: 빈 브라우저에서 로그인
const B = await b.newContext({ viewport: { width: 390, height: 780 } });
const p = await B.newPage();
p.on('pageerror', (e) => errs.push('B ' + e.message)); p.on('console', (m) => m.type() === 'error' && errs.push('B ' + m.text()));
await p.goto(`${BASE}/login`);
await p.fill('input[autocomplete="email"]', email);
await p.fill('input[autocomplete="current-password"]', pw);
await p.click('.abtn.k');
await p.waitForSelector('.kid'); await p.click('.kid');
await p.waitForURL('**/home'); await p.waitForTimeout(800);
const cashB = await p.locator('.cash').first().textContent();
out.push(`B 캐시: ${cashB} → ${cashA === cashB ? '같음 ✅' : '다름 ❌'}`);
await p.goto(`${BASE}/study/hist`); await p.waitForSelector('.paycard');
const doneB = await p.locator('.pc-amt').textContent();
const readB = await p.locator('.nowrow .streak em').textContent();
out.push(`B 역사 오늘 학습: ${doneB} · ${readB}`);
await b.close();
console.log(out.join('\n')); console.log('계정:', email); console.log(errs.length ? '콘솔 에러:\n' + errs.join('\n') : '콘솔 에러 0');
