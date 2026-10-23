import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[]; const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2}); pg.on('pageerror',e=>errs.push(e.stack.slice(0,300)));
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1200);
let P; for(const f of pg.frames().slice(1)) if((await f.title())==='홈') P=f;
await P.evaluate(()=>{ document.getElementById('demoDone').click(); setTab('home'); }); await pg.waitForTimeout(200); await pg.screenshot({path:'y0.png'});
await P.evaluate(()=>setTab('my')); await pg.waitForTimeout(300); await pg.screenshot({path:'y1.png'});
await P.evaluate(()=>{ document.querySelector('#screen').scrollTop=900; }); await pg.waitForTimeout(100); await pg.screenshot({path:'y2.png'});
await P.evaluate(()=>{ setTab('game'); mk.sub='tko'; mk.n=5; mk.max=8; document.getElementById('mkRoom').click(); }); await pg.waitForTimeout(14000);
await pg.screenshot({path:'y3.png'});
await P.evaluate(()=>document.getElementById('go').click()); await pg.waitForTimeout(3200);
for(let i=0;i<40;i++){ await pg.waitForTimeout(500); const ph=await P.evaluate(()=>{ if(RM&&RM.rain&&!RM.rain.dead&&RM.rain.words.length){ const i=document.getElementById('tin'); i.value=RM.rain.words[0].t; i.dispatchEvent(new Event('input')); } return RM?RM.phase:'none'; }); if(i===4) await pg.screenshot({path:'y4.png'}); if(ph==='end') break; }
await pg.waitForTimeout(800); await pg.screenshot({path:'y5.png'});
console.log(await P.evaluate(()=>RM&&JSON.stringify({ph:RM.phase,first:RM.first,score:RM.score})));
console.log(errs); await b.close();
