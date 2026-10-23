import { chromium } from 'playwright';
const SP=process.cwd()+'/shots/';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[]; const pg=await b.newPage({viewport:{width:390,height:780},deviceScaleFactor:2}); pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{ localStorage.setItem('harugongbu-auth',JSON.stringify({email:'a@b.c',kids:[{name:'민왕이',grade:'초5'}]})); });
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1500); await pg.evaluate(()=>document.querySelectorAll('.alm').forEach(x=>x.remove()));
await pg.click('#gnav [data-g=study]'); await pg.waitForTimeout(700);
await pg.screenshot({path:SP+'s_hdr.png'});
await pg.click('#sSrch'); await pg.waitForTimeout(300); await pg.screenshot({path:SP+'s_empty.png'});
for(const q of ['광합성','happy','山','메 산','세종','ㄱㅎㅅ','天地','자석','임진왜란','photo']){
  await pg.fill('#srq',q); await pg.waitForTimeout(250);
  const r=await pg.$$eval('.srr',l=>l.slice(0,4).map(x=>x.querySelector('.srm b').textContent+'('+x.querySelector('.srt').textContent+')'));
  console.log(q,'→',await pg.$eval('.src2',e=>e.textContent).catch(()=>'none'),'|',r.join(', '));
}
await pg.fill('#srq','광합성'); await pg.waitForTimeout(250); await pg.screenshot({path:SP+'s_res.png'});
await pg.click('.srr'); await pg.waitForTimeout(250); await pg.screenshot({path:SP+'s_det.png'});
await pg.click('.srgo'); await pg.waitForTimeout(600); console.log('after go, search hidden', await pg.$eval('.srch',e=>e.hidden), 'ddn', await pg.$eval('#ddn',e=>e.textContent));
console.log(errs); await b.close();
