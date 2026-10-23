import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for(const [w,h,n] of [[360,740,'s360'],[1180,820,'s1180']]){
const pg=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:2});
const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(800);
await pg.click('[data-s=hist]'); await pg.waitForTimeout(1500);
await pg.screenshot({path:n+'-hist.png'}); console.log(n,errs); await pg.close(); }
await b.close();
