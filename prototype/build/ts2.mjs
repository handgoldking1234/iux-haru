import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[]; const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2}); pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1200);
let P; for(const f of pg.frames().slice(1)) if((await f.title())==='홈') P=f;
await P.evaluate(()=>{ HG.tasks().forEach(t=>{ for(let i=t.n;i<t.goal;i++) parent.postMessage({hg:'ok',s:t.k},'*'); }); });
await pg.waitForTimeout(500); await pg.screenshot({path:'st2.png'});
await pg.waitForTimeout(2500); await pg.screenshot({path:'st3.png'});
console.log(errs); await b.close();
