import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[]; const pg=await b.newPage({viewport:{width:1100,height:860}}); pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1200);
let P; for(const f of pg.frames().slice(1)) if((await f.title())==='홈') P=f;
await P.click('#nmE'); await pg.waitForTimeout(200);
console.log(await P.evaluate(()=>tab), !!(await P.$('#myI')), await pg.$eval('#gnav [aria-current]',e=>e.textContent));
console.log(errs); await b.close();
