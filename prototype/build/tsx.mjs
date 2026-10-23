import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[];
for(const [w,h] of [[921,760],[390,844]]){
const pg=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:w<500?2:1}); pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{ try{ localStorage.setItem('harugongbu-auth',JSON.stringify({email:'a@b.c',kids:[{name:'민왕이',grade:'초5'}]})); }catch(e){} });
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1500); await pg.evaluate(()=>document.querySelectorAll('.alm').forEach(x=>x.remove()));
for(const s of ['hanja','eng','hist','kor','typ']){ await pg.evaluate(s=>goSubject(s),s); await pg.waitForTimeout(600); await pg.screenshot({path:`sx_${s}_${w}.png`}); }
}
console.log(errs); await b.close();
