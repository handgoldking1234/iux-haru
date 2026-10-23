import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[]; const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
pg.on('pageerror',e=>errs.push('top:'+e.message)); pg.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1200);
let P; for(const f of pg.frames().slice(1)) if((await f.title())==='홈') P=f;
// study in kor frame via real event
await pg.click('[data-s=kor]'); await pg.waitForTimeout(1200);
let K; for(const f of pg.frames().slice(1)) if((await f.title())==='국어하루') K=f;
await K.evaluate(()=>{ const p=P(); p.read[curSt(p).id]=true; start('new','t'); for(let i=0;i<3;i++){ const c=G.cur; choose(c.choices.indexOf(c.ans)); clearTimeout(G.timer); next(); } });
await pg.waitForTimeout(400); console.log('kor by',await P.evaluate(()=>JSON.stringify(HG.day().by)));
await pg.click('[data-s=play]');
await P.evaluate(()=>{ document.getElementById('demoDone')&&document.getElementById('demoDone').click(); setTab('game'); });
await pg.screenshot({path:'q1.png'});
// join flow, 5 questions faster: set mk n=5 via make
await P.evaluate(()=>{ mk.n=5; mk.max=2; document.getElementById('mkRoom').click(); }); await pg.waitForTimeout(3500);
await P.evaluate(()=>document.getElementById('go').click());
for(let i=0;i<40;i++){ await pg.waitForTimeout(700); const v=await P.evaluate(()=>{ if(view==='match'&&RM&&!RM.reveal&&RM.ans&&RM.ans.me===undefined){ const c=RM.qs[RM.qi]; const b=[...document.querySelectorAll('[data-o]')].find(x=>c.c[+x.dataset.o]===c.ans); if(b) b.click(); } return RM?RM.phase:'none'; }); if(v==='end') break; }
await pg.waitForTimeout(2500); await pg.screenshot({path:'q2.png',fullPage:true});
console.log('battle',await P.evaluate(()=>JSON.stringify({phase:RM&&RM.phase,wins:S().wins,battles:S().battles,left:HG.left(),game:HG.day().game})));
await P.evaluate(()=>document.getElementById('out').click());
await P.evaluate(()=>{ document.getElementById('code').value='123456'; document.querySelector('#joinF button').click(); }); await pg.waitForTimeout(2600);
await P.evaluate(()=>document.getElementById('ready').click()); await pg.waitForTimeout(1500); await pg.screenshot({path:'q3.png'});
await pg.waitForTimeout(2500); console.log('join started',await P.evaluate(()=>view+' '+(RM&&RM.phase)+' left '+HG.left()));
await P.evaluate(()=>leaveRoom(true));
console.log(errs); await b.close();
