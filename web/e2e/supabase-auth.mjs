/* Supabase 연결 확인: 보호자 가입 → 자녀 추가 → 로그아웃 → 다시 로그인 → 자녀가 서버에서 불러와지는지
   실행: node e2e/supabase-auth.mjs  (서버 3123, .env.local에 Supabase 키) */
import { chromium } from '@playwright/test';
const BASE = 'http://localhost:3123';
const email = `test.harugongbu+${Date.now()}@example.com`, pw = 'haru2026test';
const log = [], errs = [];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 780 } });
p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await p.goto(`${BASE}/login`);
await p.click('text=회원가입');
await p.fill('input[autocomplete="email"]', email);
await p.fill('input[autocomplete="new-password"]', pw);
await p.fill('input[placeholder="민왕이"]', '테스트');
await p.click('.achk.all');
await p.click('text=가입하고 시작하기');
await p.waitForTimeout(4000);
log.push('가입 후 화면: ' + (await p.locator('h2').first().textContent().catch(() => '?')) + ' / 오류: ' + ((await p.locator('.aerr').first().textContent().catch(() => '')) || '없음'));
const kids1 = await p.locator('.kid b').allTextContents(); log.push('자녀(가입 직후): ' + kids1.join(','));
// 로그아웃 상태로 만들고 다시 로그인
await p.evaluate(() => { localStorage.removeItem('harugongbu-auth'); Object.keys(localStorage).filter((k) => k.startsWith('sb-')).forEach((k) => localStorage.removeItem(k)); });
await p.goto(`${BASE}/login`);
await p.fill('input[autocomplete="email"]', email);
await p.fill('input[autocomplete="current-password"]', pw);
await p.click('.abtn.k');
await p.waitForTimeout(4000);
const kids2 = await p.locator('.kid b').allTextContents(); log.push('자녀(다시 로그인, 서버에서): ' + kids2.join(',') + ' / 오류: ' + ((await p.locator('.aerr').first().textContent().catch(() => '')) || '없음'));
if (kids2.length) { await p.click('.kid'); await p.waitForURL('**/home', { timeout: 8000 }).catch(() => {}); log.push('홈 이동: ' + p.url()); }
await b.close();
console.log(log.join('\n')); console.log('계정:', email); console.log(errs.length ? '콘솔 에러:\n' + errs.join('\n') : '콘솔 에러 0');
