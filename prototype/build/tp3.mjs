import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[]; const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1200);
let P; for(const f of pg.frames().slice(1)) if((await f.title())==='홈') P=f;
await P.evaluate(()=>{ document.getElementById('demoDone').click(); setTab('game'); gSub='math'; document.getElementById('speed').click(); });
for(let i=0;i<8;i++){ await P.evaluate(i=>{ const c=SP.cur; const bs=[...document.querySelectorAll('[data-o]')]; const b=i%3===2?bs.find(x=>c.c[+x.dataset.o]!==c.ans):bs.find(x=>c.c[+x.dataset.o]===c.ans); b.click(); },i); await pg.waitForTimeout(750); }
await pg.screenshot({path:'s1.png'});
await P.evaluate(()=>{ SP.end=performance.now()+100; }); await pg.waitForTimeout(600); await pg.screenshot({path:'s2.png'});
await P.evaluate(()=>{ view=null; setTab('game'); mk.n=5; mk.max=3; document.getElementById('mkRoom').click(); }); await pg.waitForTimeout(5000);
await P.evaluate(()=>document.getElementById('go').click());
for(let i=0;i<40;i++){ await pg.waitForTimeout(700); const v=await P.evaluate(()=>{ if(view==='match'&&RM&&!RM.reveal&&RM.ans&&RM.ans.me===undefined){ const c=RM.qs[RM.qi]; const bs=[...document.querySelectorAll('[data-o]')]; const b=RM.qi===2?bs.find(x=>c.c[+x.dataset.o]!==c.ans):bs.find(x=>c.c[+x.dataset.o]===c.ans); if(b) b.click(); } return RM?RM.phase:'none'; }); if(v==='end') break; }
await pg.waitForTimeout(1500); await pg.screenshot({path:'s3.png'});
console.log(errs); await b.close();
