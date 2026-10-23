import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[]; const pg=await b.newPage({viewport:{width:375,height:812},deviceScaleFactor:2}); pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1200);
let P; for(const f of pg.frames().slice(1)) if((await f.title())==='홈') P=f;
await P.evaluate(()=>{ document.getElementById('demoDone').click(); startSpeed('tko',0); });
await pg.waitForTimeout(300);
const w=await P.evaluate(()=>SP.cur.ans); await P.focus('#tin'); await pg.keyboard.insertText(w); await pg.waitForTimeout(400);
const w2=await P.evaluate(()=>SP.cur.ans); await P.fill('#tin','틀림'); await P.press('#tin','Enter'); await pg.waitForTimeout(150); await pg.screenshot({path:'k1.png'});
console.log('speed',w,w2,await P.evaluate(()=>SP.ok+'/'+SP.n));
await P.evaluate(()=>{ SP.end=performance.now()+50; }); await pg.waitForTimeout(400);
await P.evaluate(()=>{ view=null; setTab('game'); mk.sub='ten'; mk.n=5; mk.max=2; document.getElementById('mkRoom').click(); }); await pg.waitForTimeout(3500);
await P.evaluate(()=>document.getElementById('go').click());
for(let i=0;i<30;i++){ await pg.waitForTimeout(700); const v=await P.evaluate(()=>{ if(view==='match'&&RM&&!RM.reveal&&RM.ans&&RM.ans.me===undefined&&document.getElementById('tin')){ const i=document.getElementById('tin'); i.value=RM.qs[RM.qi].ans; i.dispatchEvent(new Event('input')); } return RM?RM.phase:'none'; }); if(i===3) await pg.screenshot({path:'k2.png'}); if(v==='end') break; }
console.log('battle',await P.evaluate(()=>RM&&RM.phase+' '+JSON.stringify(RM.score)));
console.log(errs); await b.close();
