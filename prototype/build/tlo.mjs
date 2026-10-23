import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[]; const pg=await b.newPage({viewport:{width:390,height:844}}); pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{ localStorage.setItem('harugongbu-auth',JSON.stringify({email:'a@b.c',kids:[{name:'민왕이',grade:'초5'}]})); });
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1500); await pg.evaluate(()=>document.querySelectorAll('.alm').forEach(x=>x.remove()));
let P; for(const f of pg.frames().slice(1)) if((await f.title())==='홈') P=f;
await pg.click('#gnav [data-g=my]'); await pg.waitForTimeout(300);
for(const t of ['info','stats','set']){ await P.click(`[data-pill=${t}]`); await pg.waitForTimeout(150); console.log(t, await P.evaluate(()=>{ const b=document.getElementById('logout'); return !!b && b.closest('section').hidden===false; })); }
await P.click('[data-pill=info]'); await P.evaluate(()=>document.getElementById('logout').scrollIntoView()); await pg.screenshot({path:'lo.png'});
console.log(errs); await b.close();
