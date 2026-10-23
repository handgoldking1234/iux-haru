import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage({viewport:{width:400,height:860},deviceScaleFactor:2}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/korean.html'); await pg.waitForTimeout(500);
await pg.evaluate(()=>{ setupTrack('kr'); S=seed(); S.active='hajun'; const p=P(); p.read[curSt(p).id]=true; start('new','t'); const ids=Object.keys(IT).filter(k=>IT[k].mc).sort((a,b)=>(IT[b].p||'').length-(IT[a].p||'').length); const id=ids[0]; console.log(IT[id].p); G.cur={...makeQ({ch:id,t:'mc'}),src:'new'}; drawPlay(); });
await pg.waitForTimeout(200); await pg.screenshot({path:'m4.png'}); console.log(errs); await b.close();
