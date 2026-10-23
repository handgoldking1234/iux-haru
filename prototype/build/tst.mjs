import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[];
for(const [w,h] of [[1100,860],[390,844]]){
const pg=await b.newPage({viewport:{width:w,height:h}}); pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1000);
let P; for(const f of pg.frames().slice(1)) if((await f.title())==='홈') P=f;
await pg.screenshot({path:`st_home_${w}.png`});
await P.click('#tabs [data-tab=study]'); await pg.waitForTimeout(700); await pg.screenshot({path:`st_study_${w}.png`});
await pg.click('#sw [data-s=hanja]'); await pg.waitForTimeout(500);
await pg.click('#sw [data-s=play]'); await pg.waitForTimeout(300); console.log(w,'top hidden on home:',await pg.$eval('.top',e=>e.hidden));
await P.click('#tabs [data-tab=study]'); await pg.waitForTimeout(300); console.log('resume:',await pg.$eval('#sw [aria-selected=true]',e=>e.textContent));
}
console.log(errs); await b.close();
