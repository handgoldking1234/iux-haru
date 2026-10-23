import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage({viewport:{width:400,height:860},deviceScaleFactor:2});
const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/hanja.html'); await pg.waitForTimeout(600);
await pg.evaluate(()=>{S.active='hajun';P().read['s0']=true;start('new','부수 1단원'); G.cur=makeQ({ch:'水',t:'rc',x:'活'},0); G.cur.src='new'; drawPlay();}); await pg.waitForTimeout(200);
await pg.screenshot({path:'w1.png',clip:{x:0,y:330,width:400,height:260}});
await pg.evaluate(()=>{choose(G.cur.choices.indexOf('水'));screen.scrollTop=1500;}); await pg.waitForTimeout(200); await pg.screenshot({path:'w2.png'});
console.log(errs); await b.close();
