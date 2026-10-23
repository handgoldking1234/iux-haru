import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[]; const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2}); pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{ localStorage.setItem('harugongbu-auth',JSON.stringify({email:'a@b.c',kids:[{name:'민왕이',grade:'초5'}]})); });
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1300); await pg.evaluate(()=>document.querySelectorAll('.alm').forEach(x=>x.remove()));
await pg.evaluate(()=>goSubject('typ')); await pg.waitForTimeout(700);
let T; for(const f of pg.frames().slice(1)) if((await f.title())==='타자하루') T=f;
await T.evaluate(()=>{ setTab('cards'); }); await pg.waitForTimeout(200); await T.click('#play'); await pg.waitForTimeout(500);
for(let i=0;i<8;i++){ await pg.waitForTimeout(1600); const w=await T.evaluate(()=>{ const d=document.querySelector('.drop:not(.pop):not(.miss)'); return d&&d.textContent; }); if(w){ await T.fill('#gi',w); await T.dispatchEvent('#gi','input'); } }
await pg.screenshot({path:'rn1.png'});
await T.evaluate(()=>{ R&&R.stop(); }); 
// force game over by lives
console.log('hud', await T.$eval('#gsp',e=>e.textContent));
const P=pg.frames().slice(1).find(f=>f.url()&&0)||null;
let H; for(const f of pg.frames().slice(1)) if((await f.title())==='홈') H=f;
await H.evaluate(()=>{ S().typCpm=0; });
await T.evaluate(()=>{ pushCpm(213); });
await pg.click('#gnav [data-g=rank]'); await pg.waitForTimeout(300); await H.click('[data-pill=typ]'); await pg.waitForTimeout(200); await pg.screenshot({path:'rn2.png'});
console.log(errs); await b.close();
