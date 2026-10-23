import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[]; const pg=await b.newPage({viewport:{width:1100,height:860}}); pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1200);
await pg.click('#gnav [data-g=study]'); await pg.click('#sw [data-s=hanja]'); await pg.waitForTimeout(800); await pg.screenshot({path:'l_hanja.png'});
await pg.click('#gnav [data-g=my]'); await pg.waitForTimeout(400); await pg.screenshot({path:'l_my.png'});
console.log(errs); await b.close();
