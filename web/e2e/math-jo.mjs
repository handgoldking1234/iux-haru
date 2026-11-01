/* 연산 조안호식 확인: 한 판 10문제를 빨리 다 맞히면 100점 → 지난 학년 단계는 1번이면 통과
   · 학년보다 위 단계는 잠기고 '학년 다지기'가 나오는지 · 390/1024 스크린샷 · 콘솔 에러
   실행: (서버 3123) OUT=폴더 node e2e/math-jo.mjs */
import { chromium } from '@playwright/test';
const BASE = process.env.BASE ?? 'http://localhost:3123';
const OUT = process.env.OUT ?? '.';
const KID = '조안테스트';
const AUTH = { email: 'parent@example.com', via: 'email', kids: [{ name: KID, grade: '초3' }], kid: 0 };
const PKEY = `harugongbu-prog-${KID}-math-v7`;
const prof = (o) => ({ offset: 0, active: 'me', profiles: { me: { id: 'me', name: KID, age: '초3', color: '#0FA37F', stage: 0, streak: 0, grad: 0, read: {}, passed: {}, sst: {}, stat: {}, hist: {}, cards: [], bp: {}, ...o } } });

const log = [], errs = [];
const b = await chromium.launch();
async function page(w, state) {
  const p = await b.newPage({ viewport: { width: w, height: 780 } });
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.addInitScript(([a, k, s]) => { localStorage.setItem('harugongbu-auth', JSON.stringify(a)); if (!sessionStorage.getItem('seeded')) { localStorage.setItem(k, JSON.stringify(s)); sessionStorage.setItem('seeded', '1'); } }, [AUTH, PKEY, state]);
  await p.goto(`${BASE}/study/math`); await p.waitForTimeout(1500);
  await p.evaluate(() => document.querySelectorAll('.alm').forEach((x) => x.remove()));
  return p;
}
const calc = (q) => Function(`return (${q.replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/')})`)();

// 1) 지난 학년(초1) 단계: 어려운 문제까지 올라온 상태에서 10문제를 빨리 다 맞히면 100점 1번으로 통과
{
  const p = await page(390, prof({ stage: 1, read: { n2: true }, bp: { n2: 99 }, passed: { n1: { due: 99999, k: 0 } } }));
  await p.screenshot({ path: `${OUT}/jo-home-390.png`, fullPage: true });
  log.push('홈 지금 단계: ' + (await p.locator('.nowrow').innerText()).replace(/\s+/g, ' '));
  await p.click('#goNew'); await p.waitForTimeout(500);
  await p.screenshot({ path: `${OUT}/jo-play-390.png` });
  log.push('문제 표시: ' + (await p.locator('.ptag').innerText()).replace(/\s+/g, ' '));
  for (let i = 0; i < 10; i++) {
    if (!(await p.locator('#board .q').count())) { log.push('판 중간에 끝남: ' + i + ' ' + JSON.stringify(await p.evaluate((k) => { const m = JSON.parse(localStorage.getItem(k)).profiles.me; return { st: m.stage, read: m.read, wr: m.wr, bp: m.bp, h: m.hist }; }, PKEY))); await p.screenshot({ path: `${OUT}/jo-break.png` }); break; }
    const q = (await p.locator('#board .q').innerText()).trim();
    await p.keyboard.type(String(calc(q)));
    await p.waitForTimeout(450);
  }
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${OUT}/jo-result-390.png`, fullPage: true });
  log.push('결과: ' + (await p.locator('.res').innerText().catch(() => '(결과 화면 없음)')).replace(/\s+/g, ' ').slice(0, 260));
  const st = await p.evaluate((k) => JSON.parse(localStorage.getItem(k)).profiles.me, PKEY);
  log.push(`진도: stage ${st.stage} · n2 통과 ${!!st.passed.n2}`);
  await p.close();
}
// 2) 학년(초3)보다 위(초4) 단계 차례 → 잠기고 학년 다지기
for (const w of [390, 1024]) {
  const passed = Object.fromEntries(['n1', 'n2', 'n22', 'n23', 'n24', 'n26', 'n27', 'n28', 'f1'].map((id) => [id, { due: 99999, k: 1 }]));
  const p = await page(w, prof({ stage: 40, passed, read: {} }));
  await p.screenshot({ path: `${OUT}/jo-hold-${w}.png`, fullPage: true });
  log.push(`${w} 잠김 홈: ` + (await p.locator('.paycard .mixline').innerText()) + ' / ' + (await p.locator('.sec .note').first().innerText().catch(() => '')).slice(0, 80));
  await p.click('#go'); await p.waitForTimeout(500);
  log.push(`${w} 잠김 풀이: ` + (await p.locator('.ptag').innerText()).replace(/\s+/g, ' '));
  await p.screenshot({ path: `${OUT}/jo-holdplay-${w}.png` });
  await p.close();
}
await b.close();
console.log(log.join('\n')); console.log(errs.length ? '콘솔 에러:\n' + errs.join('\n') : '콘솔 에러 0');
