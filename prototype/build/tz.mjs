import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[];
for(const [w,h] of [[390,844],[1100,860]]){
const pg=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:w<500?2:1}); pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1200);
await pg.click('#gnav [data-g=study]'); await pg.waitForTimeout(800); await pg.screenshot({path:`z_math_${w}.png`});
console.log(await pg.$$eval('#sw2 button',x=>x.map(b=>b.textContent+(b.getAttribute('aria-selected')==='true'?'*':''))));
await pg.click('#sw2 [data-t=cards]'); await pg.waitForTimeout(300); await pg.screenshot({path:`z_cards_${w}.png`});
console.log(await pg.$$eval('#sw2 button',x=>x.map(b=>b.textContent+(b.getAttribute('aria-selected')==='true'?'*':''))));
for(const s of ['hanja','eng','hist','kor','typ']){ await pg.click(`#sw [data-s=${s}]`); await pg.waitForTimeout(700); console.log(s, await pg.$$eval('#sw2 button',x=>x.map(b=>b.textContent+(b.getAttribute('aria-selected')==='true'?'*':''))).then(a=>a.join('|'))); }
await pg.screenshot({path:`z_typ_${w}.png`});
await pg.click('#sw [data-s=math]'); await pg.waitForTimeout(300);
let M; for(const f of pg.frames().slice(1)) if((await f.title())==='셈하루') M=f;
await pg.click('#sw2 [data-t=home]'); await pg.waitForTimeout(200); await M.click('#go'); await pg.waitForTimeout(400);
console.log('quiz: sw2 hidden',await pg.$eval('#sw2',e=>e.hidden),'bar shown',await M.$eval('#bar',e=>!e.hidden)); await pg.screenshot({path:`z_quiz_${w}.png`});
}
console.log(errs); await b.close();
