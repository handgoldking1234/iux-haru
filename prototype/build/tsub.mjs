import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for(const [w,h] of [[390,844],[1100,860]]){
const pg=await b.newPage({viewport:{width:w,height:h}});
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1000);
for(const s of ['math','hanja','typ']){ await pg.evaluate(s=>goSubject(s),s); await pg.waitForTimeout(700); await pg.screenshot({path:`sub_${s}_${w}.png`}); }
}
await b.close();
