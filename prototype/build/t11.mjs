import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for(const [w,h,n] of [[820,1180,'ipadP'],[1180,820,'ipadL']]){
  const pg=await b.newPage({viewport:{width:w,height:h}});
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1000);
  let hz; for(const f of pg.frames().slice(1)) if((await f.title())==='한자씨앗') hz=f;
  await hz.evaluate(()=>{ S.active='seoyun'; const p=P(); p.read[curSt(p).id]=true; start('new','진도'); });
  await pg.waitForTimeout(300); await pg.screenshot({path:n+'-hanja.png'});
  await hz.evaluate(()=>{ choose(0); }); await pg.waitForTimeout(300); await pg.screenshot({path:n+'-hanja2.png'});
  await pg.click('[data-s=math]'); await pg.waitForTimeout(1200);
  let mf; for(const f of pg.frames().slice(1)) if((await f.title())==='셈하루') mf=f;
  await mf.evaluate(()=>{ const p=P(); p.read[STAGES[p.stage].id]=true; start('new','진도'); });
  await pg.waitForTimeout(300); await pg.screenshot({path:n+'-math.png'});
  console.log(n,errs); await pg.close();
}
await b.close();
