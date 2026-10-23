import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[]; const pg=await b.newPage({viewport:{width:900,height:900},deviceScaleFactor:1.5}); pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1200);
let P; for(const f of pg.frames().slice(1)) if((await f.title())==='홈') P=f;
await pg.evaluate(()=>{ const t=HGS.dayN(); const st=HGS.st; st.since=t-20; st.hist={}; for(let k=t-20;k<t;k++){ if(k%3===0) continue; st.hist[k]={ok:60,no:k%2?2:12,done:k%4!==1}; } HGS.save(); });
// complete today via real message path
await pg.evaluate(()=>{ const f=[...document.querySelectorAll('iframe')][0]; const ts=HGS.tasks(); ts.forEach(t=>{ for(let i=t.n;i<t.goal;i++) window.postMessage({hg:'ok',s:t.k},'*'); }); });
await pg.waitForTimeout(300); await pg.screenshot({path:'st0.png'});
await P.evaluate(()=>setTab('my')); await pg.waitForTimeout(3000); await P.evaluate(()=>{ const el=[...document.querySelectorAll('.sh')].find(x=>x.textContent.includes('학습 기록')); el.scrollIntoView(); }); await pg.waitForTimeout(200); await pg.screenshot({path:'st1.png'});
console.log(errs); await b.close();
