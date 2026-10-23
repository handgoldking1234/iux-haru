import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage({viewport:{width:400,height:860},deviceScaleFactor:2});
await pg.goto('file://'+process.cwd()+'/history.html'); await pg.waitForTimeout(600);
await pg.evaluate(()=>{ setupTrack('wo'); S.active='minwang'; render(); }); await pg.waitForTimeout(200); await pg.screenshot({path:'h6-wo.png'});
await pg.evaluate(()=>{ const p=P(); start('new','진도'); const s=STAGES.find(s=>s.kind==='unit'&&s.lvI===1&&s.n===10); G.cur={...makeQ({ch:s.chars.find(c=>IT[c].y!=null),t:'ord'}),src:'new'}; drawPlay(); }); await pg.waitForTimeout(200); await pg.screenshot({path:'h7-ord.png'});
await b.close();
