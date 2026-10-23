import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[]; const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1200);
let P; for(const f of pg.frames().slice(1)) if((await f.title())==='홈') P=f;
console.log(await pg.evaluate(()=>{ const H=HGS, st=H.st, t=H.dayN(); st.since=t-3; st.log[t-1]={by:{math:12,hanja:10,eng:10,kor:4},plan:{math:20,hanja:10,eng:10,kor:10},paid:{}}; st.log[t-2]={by:{math:20,hanja:10,eng:10,kor:10},plan:{math:20,hanja:10,eng:10,kor:10},paid:{}}; H.save();
  const b0=H.backlog().map(x=>x.d-t+':'+x.k+':'+x.rem).join(' ');
  // finish today's math 20 then 8 more math
  const msgs=[]; for(let i=0;i<28;i++) msgs.push(...H.event('ok','math').msg); H.event('no','math');
  return b0+' | after: '+H.backlog().map(x=>x.d-t+':'+x.k+':'+x.rem).join(' ')+' | '+msgs.join(' / ')+' | cash '+st.cash+' no '+H.day().no; }));
await pg.waitForTimeout(300); await pg.screenshot({path:'b1.png',fullPage:false});
await P.evaluate(()=>{ document.querySelector('#screen').scrollTop=700; }); await pg.waitForTimeout(200); await pg.screenshot({path:'b2.png'});
await P.evaluate(()=>document.getElementById('aTest').click()); await pg.waitForTimeout(300); await pg.screenshot({path:'b3.png'});
console.log(errs); await b.close();
