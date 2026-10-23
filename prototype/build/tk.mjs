import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[];
for(const [w,h] of [[390,844],[1100,860]]){
const pg=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:w<500?2:1}); pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1200);
let P; for(const f of pg.frames().slice(1)) if((await f.title())==='홈') P=f;
await P.evaluate(()=>{ for(let i=0;i<7;i++) parent.postMessage({hg:'ok',s:'math'},'*'); }); await pg.waitForTimeout(300);
await pg.screenshot({path:`k_home_${w}.png`});
await pg.click('#gnav [data-g=rank]'); await pg.waitForTimeout(200); await pg.screenshot({path:`k_rank_${w}.png`});
await pg.click('#gnav [data-g=my]'); await P.click('[data-pill=shop]'); await pg.waitForTimeout(200); await pg.screenshot({path:`k_my_${w}.png`});
await pg.click('#gnav [data-g=study]'); await pg.waitForTimeout(700); await pg.screenshot({path:`k_study_${w}.png`});
console.log(w, await pg.$eval('#gnav [aria-current]',e=>e.textContent));
await pg.click('#gnav [data-g=game]'); await pg.waitForTimeout(300); console.log(await pg.$eval('#gnav [aria-current]',e=>e.textContent), await P.$eval('#bar h1',e=>e.textContent), await pg.$eval('.top',e=>e.hidden));
await P.click('#speed').catch(()=>{}); 
}
console.log(errs); await b.close();
