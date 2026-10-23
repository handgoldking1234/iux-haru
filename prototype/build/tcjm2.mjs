import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage({viewport:{width:400,height:860},deviceScaleFactor:2});
const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/hanja.html'); await pg.waitForTimeout(600);
await pg.evaluate(()=>document.querySelectorAll('.alm').forEach(e=>e.remove()));
await pg.click('[data-trk="cjm"]'); await pg.waitForTimeout(400);
await pg.screenshot({path:'./cj_home.png',fullPage:false});
const tally=await pg.evaluate(()=>{ const t={}; for(let i=0;i<400;i++){ const ids=PH.map((_,k)=>'P'+k); const tt=['pm','pn','pb','pr'][i%4]; const q=makeQ({ch:ids[i%ids.length],t:tt}); const ok=q&&q.choices&&q.choices.includes(q.ans)&&new Set(q.choices).size===q.choices.length; const k=tt+(ok?'':'_BAD'); t[k]=(t[k]||0)+1;} return t; }).catch(e=>'err '+e.message);
console.log(JSON.stringify(tally));
await pg.evaluate(()=>{ start('new','x'); }); await pg.waitForTimeout(400);
await pg.screenshot({path:'./cj_s1.png'});
for(let i=0;i<6;i++){ const has=await pg.evaluate(()=>!!(G&&G.cur)); if(has) break; await pg.evaluate(()=>{ const p=P(); p.read[curSt(p).id]=true; advance(); }); await pg.waitForTimeout(200);}
await pg.screenshot({path:'./cj_q.png'});
console.log(errs); await b.close();
