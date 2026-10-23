import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[]; const pg=await b.newPage({viewport:{width:375,height:812},deviceScaleFactor:2}); pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1200);
let P; for(const f of pg.frames().slice(1)) if((await f.title())==='홈') P=f;
console.log(await P.evaluate(()=>{ const bad=[]; for(const s of Object.keys(SUBJ)) for(const d of [0,7]) for(let i=0;i<300;i++){ const q=genQ(s,d); if(new Set(q.c).size!==q.c.length||!q.c.includes(q.ans)||q.c.length<3) bad.push(s+':'+q.q+':'+q.c.join('/')); if(s==='gugu'&&d===7&&!/7/.test(q.q)) bad.push('dan'+q.q); } return bad.slice(0,5).join(' | ')||'all ok'; }));
await P.evaluate(()=>{ document.getElementById('demoDone')&&document.getElementById('demoDone').click(); setTab('game'); gSub='gugu'; gDan=7; renderGame(); });
await P.evaluate(()=>{ for(let i=0;i<4;i++){} document.querySelector('#screen').scrollTop=900; }); await pg.waitForTimeout(200); await pg.screenshot({path:'g1.png'});
await P.evaluate(()=>document.getElementById('speed').click());
for(let i=0;i<6;i++){ await P.evaluate(i=>{ const c=SP.cur; const bs=[...document.querySelectorAll('[data-o]')]; (i%2?bs.find(x=>c.c[+x.dataset.o]!==c.ans):bs.find(x=>c.c[+x.dataset.o]===c.ans)).click(); },i); await pg.waitForTimeout(800); }
await pg.screenshot({path:'g2.png'});
await P.evaluate(()=>{ SP.end=performance.now()+50; }); await pg.waitForTimeout(500);
await P.evaluate(()=>{ view=null; setTab('game'); gSub='gugu'; renderGame(); document.querySelector('#screen').scrollTop=900; }); await pg.waitForTimeout(200); await pg.screenshot({path:'g3.png'});
await P.evaluate(()=>{ startSpeed('hist',0); }); await pg.waitForTimeout(300); await pg.screenshot({path:'g4.png'});
await P.evaluate(()=>{ SP.end=performance.now()+50; }); await pg.waitForTimeout(400);
await P.evaluate(()=>{ startSpeed('kor',0); }); await pg.waitForTimeout(300); await pg.screenshot({path:'g5.png'});
console.log(errs); await b.close();
