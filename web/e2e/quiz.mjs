/* 퀴즈풀기 확인: 과목 홈 안내 카드 → 퀴즈 탭(범위·유형) → 고르기·입력·문장 빈칸 풀이 → 결과(캐시) · 390/1024 · 콘솔 에러
   실행: (로컬 모드 서버) BASE=… OUT=폴더 node e2e/quiz.mjs */
import { chromium } from '@playwright/test';
const BASE = process.env.BASE ?? 'http://localhost:3124';
const OUT = process.env.OUT ?? '.';
const KID = '퀴즈테스트';
const AUTH = { email: 'parent@example.com', via: 'email', kids: [{ name: KID, grade: '초5' }], kid: 0 };
const WORDS = ['man', 'people', 'life', 'name', 'father', 'guy', 'friend', 'boy', 'family', 'baby', 'brother', 'wife'];

const log = [], errs = [];
const b = await chromium.launch();
for (const w of [390, 1024]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.addInitScript(([a, kid, words]) => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    localStorage.setItem('harugongbu-auth', JSON.stringify(a));
    const t = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 864e5);
    const seen = Object.fromEntries(words.map((x) => [x, t - 1]));
    localStorage.setItem(`harugongbu-prog-${kid}-eng-all`, JSON.stringify({ p: { stage: 2, np: 2, streak: 0, bp: {}, wr: {}, read: { s0: true, s1: true }, passed: { s0: { box: 0, due: 3 }, s1: { box: 0, due: 4 } }, cards: [], grad: 0 }, hist: {}, stat: {}, sst: {}, offset: 0, seen }));
  }, [AUTH, KID, WORDS]);
  await p.goto(`${BASE}/study/eng`); await p.waitForTimeout(1800);
  await p.evaluate(() => document.querySelectorAll('.alm').forEach((x) => x.remove()));
  log.push(`${w} 홈 안내: ` + (await p.locator('.qzpromo').innerText()).replace(/\s+/g, ' '));
  await p.screenshot({ path: `${OUT}/qz-home-${w}.png` });
  await p.locator('.qzpromo').click(); await p.waitForTimeout(500);
  await p.screenshot({ path: `${OUT}/qz-pick-${w}.png`, fullPage: true });
  log.push(`${w} 범위: ` + (await p.locator('.qzrange').innerText()).replace(/\s+/g, ' ') + ' | 유형: ' + (await p.locator('.qztypes').innerText()).replace(/\s+/g, ' '));
  if (w === 390) {
    // 한글 뜻 맞히기: 보기 1번을 계속 고름
    await p.getByRole('button', { name: /한글 뜻 맞히기/ }).click(); await p.waitForTimeout(400);
    await p.screenshot({ path: `${OUT}/qz-play-pick.png` });
    for (let k = 0; k < 30 && (await p.locator('.np.qz').count()); k++) { await p.locator('#ch button').first().click(); await p.waitForTimeout(150); await p.locator('.qzbtns .btn.y').click(); await p.waitForTimeout(150); }
    await p.waitForTimeout(600);
    await p.screenshot({ path: `${OUT}/qz-result.png`, fullPage: true });
    log.push('결과: ' + (await p.locator('.qzres').innerText()).replace(/\s+/g, ' '));
    // 한글 뜻 입력: 첫 문제는 정답(단어 뜻), 나머지는 건너뛰기
    await p.getByRole('button', { name: '다른 퀴즈' }).click(); await p.waitForTimeout(300);
    await p.getByRole('button', { name: /한글 뜻 입력/ }).click(); await p.waitForTimeout(400);
    await p.locator('.qzin input').fill('사람'); await p.screenshot({ path: `${OUT}/qz-play-input.png` });
    await p.getByRole('button', { name: '제출하기' }).click(); await p.waitForTimeout(300);
    log.push('입력 채점(사람): ' + (await p.locator('#fb').innerText()) + ' / 문제 ' + (await p.locator('.board .q').innerText()));
    await p.getByRole('button', { name: /다음 문제|결과 보기/ }).click(); await p.waitForTimeout(200);
    await p.getByRole('button', { name: '다른 퀴즈' }).count();
    await p.locator('.qzbtns .btn.line').click().catch(() => {}); await p.waitForTimeout(200);
    // 문장 빈칸
    await p.goto(`${BASE}/study/eng?tab=quiz`); await p.waitForTimeout(1500);
    await p.evaluate(() => document.querySelectorAll('.alm').forEach((x) => x.remove()));
    await p.getByRole('button', { name: /문장 빈칸 입력/ }).click(); await p.waitForTimeout(400);
    await p.screenshot({ path: `${OUT}/qz-play-sent.png` });
    log.push('문장 빈칸: ' + (await p.locator('.qzko').innerText()) + ' / ' + (await p.locator('.qzsent').innerText()));
    const cash = await p.evaluate(() => { for (const k of Object.keys(localStorage)) if (/play|reward/.test(k)) { try { const v = JSON.parse(localStorage.getItem(k)); if (v && v.day) return { k, cash: v.cash, quiz: v.day.quiz, n: v.quizN }; } catch {} } return null; });
    log.push('보상 상태: ' + JSON.stringify(cash));
  }
  await p.close();
}
await b.close();
console.log(log.join('\n')); console.log(errs.length ? '콘솔 에러:\n' + errs.join('\n') : '콘솔 에러 0');
