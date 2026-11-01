/* 관리자 페이지 확인: 로그인 → 2단계 인증(처음이면 등록, TOTP는 키로 직접 계산) → 대시보드·회원·관리자 화면
   실행: ADMIN_EMAIL=… ADMIN_PW=… [ADMIN_TOTP=등록 키] node e2e/admin.mjs  (서버 3123, 0005_admin.sql 적용, admins에 등록된 계정)
   처음 실행에서 나온 키를 ADMIN_TOTP로 넘기면 다음 실행부터 '확인' 단계로 들어간다 */
import { chromium } from '@playwright/test';
import crypto from 'node:crypto';
const BASE = process.env.BASE ?? 'http://localhost:3123';
const email = process.env.ADMIN_EMAIL, pw = process.env.ADMIN_PW;
let secret = process.env.ADMIN_TOTP ?? '';
const OUT = process.env.OUT ?? '.';

function totp(key) {
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; let bits = '';
  for (const c of key.replace(/=+$/, '').toUpperCase()) bits += A.indexOf(c).toString(2).padStart(5, '0');
  const buf = Buffer.from(bits.match(/.{8}/g).map((b) => parseInt(b, 2)));
  const ctr = Buffer.alloc(8); ctr.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const h = crypto.createHmac('sha1', buf).update(ctr).digest(), o = h[19] & 15;
  return String((h.readUInt32BE(o) & 0x7fffffff) % 1e6).padStart(6, '0');
}

const log = [], errs = [];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +(process.env.VW ?? 1024), height: +(process.env.VH ?? 780) } });
p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await p.goto(`${BASE}/admin`);
await p.fill('#lEmail', email); await p.fill('#lPw', pw); await p.click('#lf1 button[type=submit]');
await p.waitForSelector('#lf2:not([hidden])', { timeout: 10000 });
const key = await p.locator('#enroll b').textContent().catch(() => null);
if (key) { secret = key.trim(); (await import('node:fs')).writeFileSync(`${OUT}/adm-totp.txt`, secret); log.push('처음 등록: QR·키 표시됨'); } else log.push('등록된 인증 앱으로 확인 단계');
await p.screenshot({ path: `${OUT}/adm-otp.png` });
for (const [i, c] of [...totp(secret)].entries()) await p.locator('#otp input').nth(i).fill(c);
await p.waitForSelector('#shellEl:not([hidden])', { timeout: 10000 });
await p.waitForTimeout(2500);
log.push('대시보드: ' + (await p.locator('#view').innerText()).replace(/\s+/g, ' ').slice(0, 300));
await p.screenshot({ path: `${OUT}/adm-dash.png`, fullPage: true });
for (const [k, n] of [['users', '회원'], ['sys', '관리자']]) {
  await p.locator(`[data-v="${k}"]`).first().click();
  await p.waitForTimeout(1500);
  log.push(`${n}: ` + (await p.locator('#view').innerText()).replace(/\s+/g, ' ').slice(0, 300));
  await p.screenshot({ path: `${OUT}/adm-${k}.png`, fullPage: true });
}
await p.locator('[data-v="users"]').first().click(); await p.waitForTimeout(800);
const row = p.locator('#memRows tr').first();
if (await row.count()) { await row.click(); await p.waitForTimeout(2000); log.push('회원 상세: ' + (await p.locator('.drawer').innerText()).replace(/\s+/g, ' ').slice(0, 300)); await p.screenshot({ path: `${OUT}/adm-drawer.png` }); }
await p.keyboard.press('Escape'); await p.locator('[data-v="users"]').first().click(); await p.waitForTimeout(800); await p.mouse.move(600, 400); await p.mouse.wheel(0, 1500); await p.waitForTimeout(500);
log.push('회원 목록 스크롤: ' + await p.evaluate(() => document.querySelector('.pg-admin').scrollTop));
await p.setViewportSize({ width: 390, height: +(process.env.VH ?? 780) }); await p.keyboard.press('Escape');
await p.locator('[data-v="dash"]').first().click({ force: true }).catch(() => {}); await p.waitForTimeout(1000);
await p.screenshot({ path: `${OUT}/adm-dash-390.png`, fullPage: true });
await b.close();
console.log(log.join('\n')); console.log('키:', secret); console.log(errs.length ? '콘솔 에러:\n' + errs.join('\n') : '콘솔 에러 0');
