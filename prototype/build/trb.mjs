import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[]; const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2}); pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{ localStorage.setItem('harugongbu-auth',JSON.stringify({email:'a@b.c',kids:[{name:'민왕이',grade:'초5'}]})); });
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1300); await pg.evaluate(()=>document.querySelectorAll('.alm').forEach(x=>x.remove()));
let P; for(const f of pg.frames().slice(1)) if((await f.title())==='홈') P=f;
await P.evaluate(()=>{ const d=HG.day(); HG.tasks().forEach(t=>d.by[t.k]=t.goal); d.bonus=true; HG.st.backGate=false; HG.save(); });
await pg.click('#gnav [data-g=game]'); await pg.waitForTimeout(300);
await P.click('[data-ms=tko]'); await P.click('#mkRoom'); await pg.waitForTimeout(3000); await P.click('#go'); await pg.waitForTimeout(4500);
for(let i=0;i<6;i++){ const w=await P.evaluate(()=>{ const d=document.querySelector('.rain .drop:not(.pop):not(.hit)'); return d&&d.textContent; }); if(w){ await P.fill('#tin',w); await P.dispatchEvent('#tin','input'); } await pg.waitForTimeout(1500); }
await pg.screenshot({path:'rb1.png'});
await P.evaluate(()=>{ RM.rain && (RM.n=1); }); await pg.waitForTimeout(200);
const w=await P.evaluate(()=>{ const d=document.querySelector('.rain .drop:not(.pop):not(.hit)'); return d&&d.textContent; }); if(w){ await P.fill('#tin',w); await P.dispatchEvent('#tin','input'); }
await pg.waitForTimeout(2500); await pg.screenshot({path:'rb2.png'}); console.log('typCpm', await P.evaluate(()=>S().typCpm));
console.log(errs); await b.close();
