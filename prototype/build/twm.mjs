import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[];
for(const w of [390,1100]){
const pg=await b.newPage({viewport:{width:w,height:820},deviceScaleFactor:w<500?2:1}); pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{ localStorage.setItem('harugongbu-auth',JSON.stringify({email:'a@b.c',kids:[{name:'민왕이',grade:'초5'}]})); });
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1300); await pg.evaluate(()=>document.querySelectorAll('.alm').forEach(x=>x.remove()));
await pg.evaluate(()=>goSubject('hanja')); await pg.waitForTimeout(700);
let H; for(const f of pg.frames().slice(1)) if((await f.title())==='한자씨앗') H=f;
await H.evaluate(()=>openTrace('口')); await pg.waitForTimeout(500); await pg.screenshot({path:`wm_${w}.png`});
await H.click('#wx'); console.log('closed', !(await H.$('.wmodal')));
await pg.evaluate(()=>goSubject('eng')); await pg.waitForTimeout(700);
let E; for(const f of pg.frames().slice(1)) if((await f.title())==='영단어하루') E=f;
await E.evaluate(()=>openEngTrace('apple')); await pg.waitForTimeout(400); await pg.screenshot({path:`wme_${w}.png`});
}
console.log(errs); await b.close();
