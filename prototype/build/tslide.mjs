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
  if(!M){ console.log(s,'frame?'); continue; }
  const has=await M.$('.slbtn'); console.log(s,'btn',!!has);
  if(s==='hanja') await pg.screenshot({path:SP+'sl_home.png'});
  await M.click('.slbtn'); await pg.waitForTimeout(600);
  const info=await M.evaluate(()=>({cnt:document.querySelector('.slp-cnt').textContent,f:(document.querySelector('.slp-f')||{}).textContent}));
  console.log(s,JSON.stringify(info));
  await pg.screenshot({path:SP+`sl_${s}_listen.png`});
  await M.click('[data-m=dict]'); await pg.waitForTimeout(300);
  await pg.screenshot({path:SP+`sl_${s}_dict.png`});
  // answer: pick wrong or type wrong to test addCard
  const pick=await M.$('.slp-ch button'); if(pick){ await M.evaluate(()=>{ const bs=[...document.querySelectorAll('.slp-ch button')]; bs[0].click(); }); }
  else { await M.fill('.slp-in input','zzz'); await M.click('[data-a=submit]'); }
  await pg.waitForTimeout(300); console.log(s,'fb',await M.$eval('.slp-fb',e=>e.textContent));
  await M.click('[data-a=opts]'); await pg.waitForTimeout(200); if(s==='eng') await pg.screenshot({path:SP+'sl_opts.png'});
  await M.click('[data-a=shclose]'); await M.click('[data-a=close]'); await pg.waitForTimeout(300);
}
console.log(errs); await b.close();
