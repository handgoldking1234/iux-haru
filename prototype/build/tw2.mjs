import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[]; const pg=await b.newPage({viewport:{width:1600,height:900}}); pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1200); await pg.screenshot({path:'w_home.png'});
await pg.click('#gnav [data-g=study]'); await pg.waitForTimeout(800); await pg.screenshot({path:'w_study.png'});
console.log(errs); await b.close();
