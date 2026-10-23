import { chromium } from 'playwright';
const SP=process.cwd()+'/shots/';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[]; const pg=await b.newPage({viewport:{width:420,height:860},deviceScaleFactor:2}); pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{ localStorage.setItem('harugongbu-auth',JSON.stringify({email:'a@b.c',kids:[{name:'민왕이',grade:'초5'}]})); });
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1300); await pg.evaluate(()=>document.querySelectorAll('.alm').forEach(x=>x.remove()));
await pg.click('#gnav [data-g=study]'); await pg.waitForTimeout(700);
const T={hanja:'한자씨앗',eng:'영단어하루',kor:'국어하루',sci:'과학하루',hist:'역사하루'};
for(const s of ['hanja','eng','kor','sci','hist']){
  await pg.click('#ddb'); await pg.click(`#ddm [data-s=${s}]`); await pg.waitForTimeout(800);
  let M; for(const f of pg.frames().slice(1)) if((await f.title())===T[s]) M=f;
  await M.click('.slbtn'); await pg.waitForTimeout(700);
  if(await M.$('[data-m=view][aria-pressed=false]')) await M.click('[data-m=view]');
  await pg.waitForTimeout(400);
  console.log(s, await M.$eval('.slp-cnt',e=>e.textContent), (await M.$eval('.slp-det',e=>e.innerText)).slice(0,80).replace(/\n/g,' | '));
  await pg.screenshot({path:SP+`v_${s}.png`});
  await M.click('[data-a=next]'); await pg.waitForTimeout(200);
  await M.click('[data-m=dict]'); await pg.waitForTimeout(300);
  if(s==='hanja'||s==='eng') await pg.screenshot({path:SP+`d_${s}.png`});
  for(let i=0;i<60;i++){ const done=await M.$('.slp-done'); if(done) break; await M.click('[data-a=next]'); }
  if(s==='eng') await pg.screenshot({path:SP+`k_${s}.png`});
  await M.click('.slp-done [data-a=close]'); await pg.waitForTimeout(300);
}
console.log(errs); await b.close();
