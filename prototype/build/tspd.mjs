import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[]; const pg=await b.newPage({viewport:{width:390,height:780}}); pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{ localStorage.setItem('harugongbu-auth',JSON.stringify({email:'a@b.c',kids:[{name:'민왕이',grade:'초5'}]})); });
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1300); await pg.evaluate(()=>document.querySelectorAll('.alm').forEach(x=>x.remove()));
await pg.click('#gnav [data-g=study]'); await pg.waitForTimeout(700);
await pg.click('#ddb'); await pg.click('#ddm [data-s=eng]'); await pg.waitForTimeout(800);
let M; for(const f of pg.frames().slice(1)) if((await f.title())==='영단어하루') M=f;
await M.click('.slbtn:not(.wb)'); await pg.waitForTimeout(300);
const seq=[]; for(let i=0;i<9;i++){ seq.push(await M.$eval('.slp-spdb',e=>e.textContent)); await M.click('.slp-spdb'); }
console.log(seq.join(' > ')); await M.click('[data-a=opts]'); console.log(await M.$$eval('[data-k=rate]',l=>l.map(x=>x.textContent).join(' ')));
console.log(errs); await b.close();
