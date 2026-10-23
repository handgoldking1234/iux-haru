import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage({viewport:{width:400,height:860},deviceScaleFactor:2});
const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1200);
await pg.screenshot({path:'x1.png'});
await pg.click('[data-s=math]'); await pg.waitForTimeout(1200); await pg.screenshot({path:'x2.png'});
const f=pg.frames().find(f=>f!==pg.mainFrame()&&f.url().includes('srcdoc')&&0)||pg.frames()[2]||pg.frames()[1];
const mf=pg.frames().slice(1); for(const fr of mf){ try{ console.log(await fr.evaluate(()=>document.title+' | '+document.querySelector('#bar h1')?.textContent)); }catch(e){console.log('fe',e.message)} }
// play one math question
const m=mf.find(async x=>true);
await pg.click('[data-s=hanja]'); await pg.waitForTimeout(300);
await pg.click('[data-s=math]'); await pg.waitForTimeout(300);
console.log('errs',errs); await b.close();
