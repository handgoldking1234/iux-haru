import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[];
for(const [w,h] of [[390,844],[1100,860]]){
const pg=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:w<500?2:1}); pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1500); await pg.evaluate(()=>document.querySelectorAll('.alm').forEach(x=>x.remove()));
await pg.screenshot({path:`au_login_${w}.png`});
await pg.click('#fLogin [type=submit]'); console.log('err:',await pg.$eval('#lErr',e=>e.textContent));
await pg.click('[data-go=signup]'); await pg.waitForTimeout(150); await pg.screenshot({path:`au_sign_${w}.png`,fullPage:true});
await pg.click('.as[data-v=signup] [data-go=login]');
await pg.fill('#lEmail','mom@test.com'); await pg.fill('#lPw','abcd1234'); console.log(await pg.evaluate(()=>[lEmail.value,lPw.value,document.activeElement.id])); await pg.click('#fLogin [type=submit]'); await pg.waitForTimeout(200); console.log('lerr2',await pg.$eval('#lErr',e=>e.textContent), await pg.$$eval('.as',x=>x.map(s=>s.dataset.v+(s.hidden?'':'*')).join(',')));
await pg.click('#kidAdd'); await pg.fill('#kN','하준'); await pg.click('.kidf [type=submit]'); await pg.waitForTimeout(150);
await pg.screenshot({path:`au_kids_${w}.png`});
await pg.click('.kid[data-k="1"]'); await pg.waitForTimeout(400);
console.log('auth hidden', await pg.$eval('#auth',e=>e.hidden));
let P; for(const f of pg.frames().slice(1)) if((await f.title())==='홈') P=f;
console.log('name', await P.$eval('.minitx .nm',e=>e.textContent.trim()));
await pg.click('#gnav [data-g=my]'); await P.click('[data-pill=set]'); await pg.waitForTimeout(200);
await P.click('#logout'); await pg.waitForTimeout(150); await pg.screenshot({path:`au_cfm_${w}.png`});
await P.click('.cfm [data-o]'); await pg.waitForTimeout(300); console.log('logged out shows login', await pg.$eval('#auth',e=>!e.hidden));
await pg.reload(); await pg.waitForTimeout(1200); console.log('after reload login', await pg.$eval('#auth',e=>!e.hidden));
}
console.log(errs); await b.close();
