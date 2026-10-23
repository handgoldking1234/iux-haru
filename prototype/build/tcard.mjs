import { chromium } from 'playwright';
const SP=process.cwd()+'/shots/';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[]; const pg=await b.newPage({viewport:{width:390,height:780},deviceScaleFactor:2}); pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{ localStorage.setItem('harugongbu-auth',JSON.stringify({email:'a@b.c',kids:[{name:'민왕이',grade:'초5'}]})); });
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1300); await pg.evaluate(()=>document.querySelectorAll('.alm').forEach(x=>x.remove()));
await pg.click('#gnav [data-g=study]'); await pg.waitForTimeout(700);
const T={hanja:'한자씨앗',eng:'영단어하루',kor:'국어하루',sci:'과학하루',hist:'역사하루'};
for(const s of ['eng','hanja','kor','sci','hist']){
  await pg.click('#ddb'); await pg.click(`#ddm [data-s=${s}]`); await pg.waitForTimeout(800);
  let M; for(const f of pg.frames().slice(1)) if((await f.title())===T[s]) M=f;
  if(s==='hanja'){ await M.click('[data-trk="school"]').catch(()=>{}); await pg.waitForTimeout(300); }
  await M.click('.slbtn:not(.wb)'); await pg.waitForTimeout(500); if(await M.$('[data-m=view][aria-pressed=false]')) await M.click('[data-m=view]');
  await M.click('[data-a=next]'); await M.click('[data-a=next]'); await pg.waitForTimeout(400); if(s==='hanja'){ for(let k=0;k<4;k++){ await M.click('[data-a=next]'); await pg.waitForTimeout(150); console.log(' hanja card',k,await M.$eval('.slp-main',e=>e.scrollHeight>e.clientHeight+2), !!(await M.$('.sc-fig'))); } }
  const of=await M.$eval('.slp-main',e=>e.scrollHeight>e.clientHeight+2); console.log(s,'overflow',of);
  await pg.screenshot({path:SP+`c_${s}.png`});
  await M.click('[data-a=close]'); await pg.waitForTimeout(300);
}
// cjm
await pg.click('#ddb'); await pg.click('#ddm [data-s=hanja]'); await pg.waitForTimeout(600);
let M; for(const f of pg.frames().slice(1)) if((await f.title())==='한자씨앗') M=f;
await M.click('[data-trk="cjm"]'); await pg.waitForTimeout(400); await M.click('.slbtn:not(.wb)'); await pg.waitForTimeout(500);
console.log('cjm overflow',await M.$eval('.slp-main',e=>e.scrollHeight>e.clientHeight+2)); await pg.screenshot({path:SP+'c_cjm.png'});
console.log(errs); await b.close();
