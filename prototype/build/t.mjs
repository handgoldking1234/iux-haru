import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'}).catch(async()=>await chromium.launch());
const pg=await b.newPage({viewport:{width:400,height:860},deviceScaleFactor:2});
const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await pg.goto('file://'+process.cwd()+'/hanja.html'); await pg.waitForTimeout(800);
await pg.screenshot({path:'s1-home.png'});
// switch to 서윤 then start new (gate since stage 7 bp, read?)
await pg.click('#goNew'); await pg.waitForTimeout(300);
await pg.screenshot({path:'s2-gate.png'});
for(let i=0;i<20;i++){ const n=await pg.$('#next'); if(!n) break; await n.click(); await pg.waitForTimeout(60); if(i==2) await pg.screenshot({path:'s3-char.png',fullPage:false}); }
await pg.click('#done'); await pg.waitForTimeout(300);
await pg.screenshot({path:'s4-q.png'});
// answer a few
for(let i=0;i<14;i++){ await pg.keyboard.press(String(1+Math.floor(Math.random()*4))); await pg.waitForTimeout(80); if(i==0) await pg.screenshot({path:'s5-ans.png',fullPage:false}); if(i==0){ await pg.evaluate(()=>document.getElementById('screen').scrollTop=400); await pg.screenshot({path:'s5b-ans.png'});} await pg.keyboard.press('Enter'); await pg.waitForTimeout(80); }
await pg.screenshot({path:'s6.png'});
// stress: generate all question types for every char
const r=await pg.evaluate(()=>{ let bad=[]; for(const h of ALL){ for(const t of ['he','e','w','h']){ try{ const q=makeQ({ch:h,t},12); if(new Set(q.choices).size!==q.choices.length||!q.choices.includes(q.ans)||q.choices.length<4) bad.push(h+t+':'+q.choices.join(',')); infoHTML(h);}catch(e){bad.push(h+t+' ERR '+e.message);} } } return {n:ALL.length,stages:STAGES.length,bad:bad.slice(0,15),nb:bad.length}; });
console.log(JSON.stringify(r));
await pg.evaluate(()=>{ concept('s351',false,()=>{},null,'鸞'); }); await pg.waitForTimeout(200); await pg.screenshot({path:'s7-1geup.png'});
await pg.evaluate(()=>{ concept('s20',false,()=>{},null); }); await pg.waitForTimeout(200);
await pg.evaluate(()=>{ setTab('cards'); }); await pg.waitForTimeout(200); await pg.screenshot({path:'s8-cards.png'});
await pg.evaluate(()=>{ setTab('report'); }); await pg.waitForTimeout(200); await pg.screenshot({path:'s9-rep.png',fullPage:true});
console.log('errs',errs);
await b.close();
