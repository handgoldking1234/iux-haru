import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[]; const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2}); pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/typing.html'); await pg.waitForTimeout(600);
await pg.evaluate(()=>{ addChars('ko',1234); rankBest('ko',310,95); setTab('report'); });
await pg.waitForTimeout(200); await pg.evaluate(()=>document.querySelector('#screen').scrollTop=500); await pg.screenshot({path:'r1.png'});
await pg.evaluate(()=>document.querySelector('[data-rk=vol]').click()); await pg.waitForTimeout(200); await pg.evaluate(()=>document.querySelector('#screen').scrollTop=500); await pg.screenshot({path:'r2.png'});
console.log(errs); await b.close();
