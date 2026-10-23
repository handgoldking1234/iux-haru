import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage({viewport:{width:400,height:860},deviceScaleFactor:2});
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1200);
const hz=pg.frames()[1];
await hz.evaluate(()=>{ const p=P(); p.read[curSt(p).id]=true; p.wr={[curSt(p).id]:3}; start('new','부수 1단원'); });
await pg.waitForTimeout(300); await pg.screenshot({path:'y3.png',clip:{x:0,y:0,width:400,height:330}});
await b.close();
