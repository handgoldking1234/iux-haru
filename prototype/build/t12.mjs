import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for(const [w,h,n] of [[320,640,'p320'],[390,844,'p390']]){
  const pg=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:2});
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1000);
  await pg.screenshot({path:n+'-home.png'});
  await pg.click('[data-s=math]'); await pg.waitForTimeout(1200);
  let mf; for(const f of pg.frames().slice(1)) if((await f.title())==='셈하루') mf=f;
  await mf.evaluate(()=>{ const p=P(); p.read[STAGES[p.stage].id]=true; start('new','진도'); });
  await pg.waitForTimeout(300); await pg.screenshot({path:n+'-math.png'});
  const ov=await mf.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  console.log(n,errs,'hscroll',ov); await pg.close();
}
await b.close();
