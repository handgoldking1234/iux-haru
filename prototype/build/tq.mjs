import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[]; const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2}); pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1200);
for(const s of ['math','hanja','eng','hist','kor','typ']){ await pg.evaluate(s=>goSubject(s),s); await pg.waitForTimeout(700);
  const f=pg.frames().find(x=>x.url()==='about:srcdoc'&&false); }
const fr={}; for(const f of pg.frames().slice(1)) fr[await f.title()]=f;
console.log(Object.keys(fr));
const KEY={'셈하루':'math','한자씨앗':'hanja','영단어하루':'eng','역사하루':'hist','국어하루':'kor','타자하루':'typ'};
for(const [t,f] of Object.entries(fr)){ if(t==='홈') continue; await pg.evaluate(s=>goSubject(s),KEY[t]); await pg.waitForTimeout(200);
  const sc=await f.$$eval('.shortcuts button',x=>x.map(b=>b.textContent.trim()));
  await f.click('.shortcuts [data-sc=report]'); await f.waitForTimeout(150);
  const hasBack=!!(await f.$('#bBack')); await f.click('#bBack'); await f.waitForTimeout(150);
  console.log(t, sc.join('|'), 'back:',hasBack, 'home again:', await f.evaluate(()=>tab));
}
await pg.evaluate(()=>goSubject('math')); await pg.waitForTimeout(300); await pg.screenshot({path:'q_math.png'});
await pg.evaluate(()=>goSubject('typ')); await pg.waitForTimeout(300); await pg.screenshot({path:'q_typ.png'});
// shop
await pg.click('#gnav [data-g=my]'); await pg.waitForTimeout(400); const P=fr['홈']; await P.click('[data-pill=shop]'); await pg.waitForTimeout(300);
for(const c of ['body','hat','face','outfit','hold','bg']){ await P.click(`[data-cat=${c}]`); await pg.waitForTimeout(150); console.log(c, await P.$$eval('.item',x=>x.length)); if(c==='hat'||c==='bg') await pg.screenshot({path:`q_shop_${c}.png`}); }
console.log(errs); await b.close();
