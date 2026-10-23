import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage({viewport:{width:1100,height:780},deviceScaleFactor:1.5});
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1200);
let P; for(const f of pg.frames().slice(1)) if((await f.title())==='홈') P=f;
await P.evaluate(()=>{ for(let i=0;i<12;i++) parent.postMessage({hg:'ok',s:'math'},'*'); for(let i=0;i<3;i++) parent.postMessage({hg:'ok',s:'eng'},'*'); });
await pg.waitForTimeout(600); await pg.screenshot({path:'pb1.png'}); await b.close();
