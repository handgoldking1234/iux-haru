import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[]; const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
pg.on('pageerror',e=>errs.push('top:'+e.message));
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1200);
const fr=async t=>{ for(const f of pg.frames().slice(1)) if((await f.title())===t) return f; };
let P=await fr('오늘·놀이터'); P.on?.('pageerror',e=>errs.push(e.message));
await pg.screenshot({path:'p1.png'});
// answer in math
await pg.click('[data-s=math]'); await pg.waitForTimeout(1200);
const M=await fr('셈하루 (Copy)')||pg.frames()[2];
const r=await M.evaluate(()=>{ const p=P(); start('new','t'); STAGES.forEach(x=>p.read[x.id]=true); if(!G.cur) advance(); for(let i=0;i<5;i++){ G.input=String(G.cur.a); check(); G.lock=false; G.i++; if(G.i>=G.q.length) break; advance(); } return parent.HGS.day(); });
console.log('after math',JSON.stringify(r));
await pg.waitForTimeout(300); await pg.screenshot({path:'p2.png'});
await pg.click('[data-s=play]'); await pg.waitForTimeout(400);
await pg.screenshot({path:'p3.png'});
// shop locked
await P.evaluate(()=>setTab('shop')); await P.evaluate(()=>document.querySelector('[data-it=sky]').click()); await pg.waitForTimeout(200); await pg.screenshot({path:'p4.png'});
// demo done
await P.evaluate(()=>{ setTab('home'); document.getElementById('demoDone').click(); }); await pg.waitForTimeout(300); await pg.screenshot({path:'p5.png'});
await P.evaluate(()=>{ setTab('shop'); document.querySelector('[data-it=sky]').click(); document.getElementById('buy').click(); });
console.log('bought',await P.evaluate(()=>JSON.stringify(S().eq)+S().cash));
// game: battle
await P.evaluate(()=>setTab('game')); await pg.waitForTimeout(200); await pg.screenshot({path:'p6.png',fullPage:true});
await P.evaluate(()=>document.getElementById('mkRoom').click()); await pg.waitForTimeout(6500);
await P.evaluate(()=>document.querySelector('[data-q="0"]').click()); await pg.waitForTimeout(1500);
await pg.screenshot({path:'p7.png'});
await P.evaluate(()=>document.getElementById('go').click()); await pg.waitForTimeout(3300);
for(let i=0;i<10;i++){ await pg.waitForTimeout(800); await P.evaluate(()=>{ if(view!=='match'||!RM||RM.reveal) return; const c=RM.qs[RM.qi]; const bs=[...document.querySelectorAll('[data-o]')]; const b=bs.find(x=>c.c[+x.dataset.o]===c.ans); if(b&&!b.disabled) b.click(); }); if(i===1) await pg.screenshot({path:'p8.png'}); await pg.waitForTimeout(2300); }
await pg.waitForTimeout(3000); await pg.screenshot({path:'p9.png',fullPage:true});
console.log('after battle',await P.evaluate(()=>JSON.stringify({view,phase:RM&&RM.phase,wins:S().wins,battles:S().battles,left:HG.left(),cash:S().cash})));
// speed
await P.evaluate(()=>{ leaveRoom(true); setTab('game'); gSub='hanja'; document.getElementById('speed').click(); }); await pg.waitForTimeout(500); await pg.screenshot({path:'p10.png'});
await P.evaluate(()=>{ SP.end=performance.now()+300; }); await pg.waitForTimeout(800);
await P.evaluate(()=>setTab('rank')); await pg.waitForTimeout(200); await pg.screenshot({path:'p11.png'});
// 320 width
await pg.setViewportSize({width:320,height:700}); await P.evaluate(()=>setTab('home')); await pg.waitForTimeout(300); await pg.screenshot({path:'p12.png'});
console.log('hscroll',await P.evaluate(()=>document.documentElement.scrollWidth>innerWidth||[...document.querySelectorAll('#screen *')].some(e=>e.getBoundingClientRect().right>innerWidth+1)));
console.log(errs); await b.close();
