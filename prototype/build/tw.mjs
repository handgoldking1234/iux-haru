import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[]; const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2}); pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/hanja.html'); await pg.waitForTimeout(700);
await pg.evaluate(()=>{ const p=P(); p.read[curSt(p).id]=true; start('new','t'); G.cur={...makeQ({ch:'木',t:'wr',trace:true},0),src:'new'}; drawPlay(); });
await pg.waitForTimeout(600); await pg.screenshot({path:'w1.png'});
// draw strokes along medians
const box=await pg.$('#hw svg'); const bb=await box.boundingBox();
const meds=await pg.evaluate(()=>SK['木'].medians);
const sc=(bb.width-24)/1024;
for(const m of meds){ const pts=m.map(([x,y])=>[bb.x+12+x*sc, bb.y+12+(900-y)*sc]); await pg.mouse.move(...pts[0]); await pg.mouse.down(); for(const p of pts.slice(1)) await pg.mouse.move(...p,{steps:4}); await pg.mouse.up(); await pg.waitForTimeout(250); }
await pg.waitForTimeout(800); await pg.screenshot({path:'w2.png'});
console.log('answered',await pg.evaluate(()=>G&&G.answered),'log',await pg.evaluate(()=>JSON.stringify(G&&G.log.slice(-1))));
await pg.evaluate(()=>{ G=null; document.getElementById('screen').innerHTML=infoHTML('校'); }); await pg.waitForTimeout(200);
await pg.click('[data-trace]'); await pg.waitForTimeout(400); await pg.click('#wa'); await pg.waitForTimeout(1500); await pg.screenshot({path:'w3.png'});
console.log(errs); await b.close();
