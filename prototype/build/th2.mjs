import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[];
for(const [w,h] of [[1100,860],[390,844]]){
const pg=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:w<500?2:1}); pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{ try{ const k='harugongbu-play-v1'; const s=JSON.parse(localStorage.getItem(k)||'null'); }catch(e){} }); await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1600); await pg.evaluate(()=>document.querySelectorAll('.alm').forEach(x=>x.remove()));
let P; for(const f of pg.frames().slice(1)) if((await f.title())==='홈') P=f;
await pg.screenshot({path:`h_${w}.png`});
await P.click('#hNoti'); await pg.waitForTimeout(300); await pg.screenshot({path:`h_noti_${w}.png`});
await pg.click('.nitem[data-st]'); await pg.waitForTimeout(500); console.log('after noti:', await pg.$eval('#sw [aria-selected=true]',e=>e.textContent));
await pg.click('#sMenu'); await pg.waitForTimeout(300); await pg.screenshot({path:`h_menu_${w}.png`});
await pg.click('.sgrid [data-sub=stats]'); await pg.waitForTimeout(400); console.log('menu->', await P.evaluate(()=>tab+'/'+mySub), await pg.$eval('#gnav [aria-current]',e=>e.textContent));
await pg.click('#gnav [data-g=study]'); await pg.waitForTimeout(400); await pg.screenshot({path:`h_study_${w}.png`});
}
console.log(errs); await b.close();
