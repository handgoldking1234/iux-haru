import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[];
for(const w of [390,1100]){
const pg=await b.newPage({viewport:{width:w,height:820},deviceScaleFactor:w<500?2:1}); pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{ localStorage.setItem('harugongbu-auth',JSON.stringify({email:'a@b.c',kids:[{name:'민왕이',grade:'초5'}]})); });
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1300); await pg.evaluate(()=>document.querySelectorAll('.alm').forEach(x=>x.remove()));
await pg.click('#gnav [data-g=study]'); await pg.waitForTimeout(600); await pg.screenshot({path:`dd1_${w}.png`});
await pg.click('#ddb'); await pg.waitForTimeout(200); await pg.screenshot({path:`dd2_${w}.png`});
await pg.click('#ddm [data-s=eng]'); await pg.waitForTimeout(600);
console.log(w, await pg.$eval('#ddn',e=>e.textContent), await pg.$eval('#ddm',e=>e.hidden), await pg.$$eval('#sw2 button',x=>x.map(b=>b.textContent).join('|')));
await pg.click('#ddb'); await pg.keyboard.press('Escape'); console.log('esc closed', await pg.$eval('#ddm',e=>e.hidden));
}
console.log(errs); await b.close();
