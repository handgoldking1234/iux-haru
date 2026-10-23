import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[]; const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2}); pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1500); await pg.evaluate(()=>document.querySelectorAll('.alm').forEach(x=>x.remove()));
let P; for(const f of pg.frames().slice(1)) if((await f.title())==='홈') P=f;
const cnt=await P.evaluate(()=>{ const c={}; for(let i=0;i<70;i++){ const q=genQ('mix'); c[q.from]=(c[q.from]||0)+1; if(!q.c.includes(q.ans)&&q.kind!=='type') return 'BAD '+JSON.stringify(q); } return c; }); console.log(cnt);
// unlock and play
await P.evaluate(()=>{ const d=HG.day(); HG.tasks().forEach(t=>d.by[t.k]=t.goal); d.bonus=true; HG.st.backGate=false; HG.save(); });
await pg.click('#gnav [data-g=game]'); await pg.waitForTimeout(300);
await P.click('[data-gs=mix]'); await pg.waitForTimeout(200); await pg.screenshot({path:'mx1.png'});
await P.click('#speed'); await pg.waitForTimeout(1500); await pg.screenshot({path:'mx2.png'});
for(let i=0;i<6;i++){ const bt=await P.$('.opts button'); if(bt) await bt.click(); await pg.waitForTimeout(500); }
await pg.screenshot({path:'mx3.png'});
await P.evaluate(()=>endSpeed&&endSpeed(true)).catch(()=>{});
await pg.click('#gnav [data-g=game]').catch(()=>{}); await pg.waitForTimeout(300);
await P.evaluate(()=>{ view=null; render(); });
await P.click('[data-ms=mix]'); await P.click('#mkRoom'); await pg.waitForTimeout(3000);
await P.click('#go'); await pg.waitForTimeout(2500); await pg.screenshot({path:'mx4.png'}); for(let i=0;i<4;i++){ const bt=await P.$('.opts button:not([disabled])'); if(bt) await bt.click().catch(()=>{}); await pg.waitForTimeout(3500); } await pg.screenshot({path:'mx5.png'});
console.log(errs); await b.close();
