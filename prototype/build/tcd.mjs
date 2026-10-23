import { chromium } from 'playwright';
const SP=process.cwd()+'/shots/';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[]; const pg=await b.newPage({viewport:{width:390,height:780},deviceScaleFactor:2}); pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{ localStorage.setItem('harugongbu-auth',JSON.stringify({email:'a@b.c',kids:[{name:'민왕이',grade:'초5'}]})); });
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1300); await pg.evaluate(()=>document.querySelectorAll('.alm').forEach(x=>x.remove()));
await pg.click('#gnav [data-g=study]'); await pg.waitForTimeout(700);
await pg.click('#ddb'); await pg.click('#ddm [data-s=hanja]'); await pg.waitForTimeout(800);
let M; for(const f of pg.frames().slice(1)) if((await f.title())==='한자씨앗') M=f;
await M.click('.slbtn:not(.wb)'); await pg.waitForTimeout(300); if(await M.$('[data-m=view][aria-pressed=false]')) await M.click('[data-m=view]');
await M.click('[data-a=play]');
let seen=false; for(let i=0;i<120;i++){ await pg.waitForTimeout(100); if(await M.$eval('.slp-cd',e=>!e.hidden)){ seen=true; break; } }
await pg.waitForTimeout(1200); console.log('cd visible',seen, await M.$eval('.slp-cd',e=>e.textContent), await M.$eval('.slp-cnt',e=>e.textContent));
await pg.screenshot({path:SP+'cd1.png'});
for(let i=0;i<80;i++){ await pg.waitForTimeout(100); if(await M.$eval('.slp-cnt',e=>e.textContent.startsWith('2'))) break; }
console.log('advanced to', await M.$eval('.slp-cnt',e=>e.textContent));
await M.click('[data-a=play]'); await pg.waitForTimeout(200); console.log('stopped cd hidden', await M.$eval('.slp-cd',e=>e.hidden));
console.log(errs); await b.close();
