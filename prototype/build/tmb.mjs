import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[];
for(const w of [350,390,600,700]){
const pg=await b.newPage({viewport:{width:w,height:800},deviceScaleFactor:2}); pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{ localStorage.setItem('harugongbu-auth',JSON.stringify({email:'a@b.c',kids:[{name:'민왕이',grade:'초5'}]})); });
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1300); await pg.evaluate(()=>document.querySelectorAll('.alm').forEach(x=>x.remove()));
await pg.evaluate(()=>goSubject('hist')); await pg.waitForTimeout(600);
await pg.screenshot({path:`mb_${w}.png`,clip:{x:0,y:0,width:w,height:200}});
}
console.log(errs); await b.close();
