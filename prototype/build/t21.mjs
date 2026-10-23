import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[];
const pg=await b.newPage({viewport:{width:400,height:860},deviceScaleFactor:2}); pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1000);
for(const s of ['math','eng','hist','typ']){ await pg.click(`[data-s=${s}]`); await pg.waitForTimeout(1300); await pg.screenshot({path:'c-'+s+'.png'}); }
// typing tests
let tf; for(const f of pg.frames().slice(1)) if((await f.title())==='타자하루') tf=f;
console.log('keys',await tf.evaluate(()=>[keys('하늘').join(''),keys('닭과').join(''),keys('읽었다').join('')]));
await tf.evaluate(()=>runDrill(0)); await pg.waitForTimeout(200); await pg.screenshot({path:'t-drill.png'});
// press correct keys via keyboard events
const seq=await tf.evaluate(()=>R.seq.map(c=>KEYOF[c]));
for(const [code,sh] of seq){ await tf.evaluate(([code,sh])=>document.onkeydown({code,shiftKey:sh,key:'x',preventDefault(){} }),[code,sh]); }
await pg.waitForTimeout(200); console.log('drill result', await tf.evaluate(()=>document.querySelector('.big')?.textContent+' open='+S.open.ko));
await tf.evaluate(()=>runText('word')); await pg.waitForTimeout(200);
const tgt=await tf.evaluate(()=>R.list[0]); 
await tf.evaluate((t)=>{ const i=document.querySelector('#ti'); i.value=t.slice(0,1); i.oninput(); },tgt); await pg.waitForTimeout(100); await pg.screenshot({path:'t-word.png'});
await tf.evaluate((t)=>{ const i=document.querySelector('#ti'); i.value=t; i.oninput(); },tgt); await pg.waitForTimeout(300);
console.log('word advanced', await tf.evaluate(()=>R.i));
await tf.evaluate(()=>{ S.lang='en'; runGame(); }); await pg.waitForTimeout(3500); await pg.screenshot({path:'t-game.png'});
const w=await tf.evaluate(()=>document.querySelector('.drop')?.textContent);
await tf.evaluate((w)=>{ const i=document.querySelector('#gi'); i.value=w; i.oninput(); },w); await pg.waitForTimeout(200);
console.log('game score', await tf.evaluate(()=>document.querySelector('#gs').textContent));
console.log(errs); await b.close();
