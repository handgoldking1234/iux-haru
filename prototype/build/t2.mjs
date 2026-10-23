import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage({viewport:{width:400,height:860},deviceScaleFactor:2});
const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/hanja.html'); await pg.waitForTimeout(600);
const r=await pg.evaluate(()=>{ let bad=[]; for(const h of ALL){ for(const t of ['he','e','w','h']){ try{ const q=makeQ({ch:h,t},12); if(new Set(q.choices).size!==4||!q.choices.includes(q.ans)) bad.push(h+t+':'+q.choices.join(',')); infoHTML(h);}catch(e){bad.push(h+t+' ERR '+e.message);} } } return bad.length; });
console.log('bad',r);
// play through today's set to check passing logic
await pg.evaluate(()=>{ S.profiles.seoyun.read[STAGES[7].id]=true; S.active='seoyun'; render(); start('new','t'); });
let passed=false;
for(let i=0;i<60;i++){ const st=await pg.evaluate(()=>{ if(!G||!G.cur) return 'x'; const k=G.cur.choices.indexOf(G.cur.ans); choose(k); const t=G.cur.t; next(); return t; }); if(st==='x') break; }
console.log(await pg.evaluate(()=>({stage:P().stage,streak:P().streak,bp:P().bp,passed:Object.keys(P().passed).length})));
await pg.evaluate(()=>{ setTab('home'); start('new','진도'); }); await pg.waitForTimeout(200);
await pg.screenshot({path:'u1.png'});
await pg.evaluate(()=>{ S.profiles.seoyun.read[STAGES[P().stage].id]=true; P().bp[STAGES[P().stage].id]=7; setTab('home'); start('new','진도'); }); await pg.waitForTimeout(200);
for(let i=0;i<6;i++){ const t=await pg.evaluate(()=>G.cur.t); if(t==='w'||t==='h'){ await pg.screenshot({path:'u2-'+t+'.png'}); } await pg.evaluate(()=>{choose(0);}); if(i==1){await pg.evaluate(()=>screen.scrollTop=9999); await pg.screenshot({path:'u3-bottom.png'});} await pg.evaluate(()=>next()); }
await pg.evaluate(()=>{ G=null; concept('s0',false,()=>{},null,'七'); }); await pg.waitForTimeout(200); await pg.screenshot({path:'u4-七.png'});
await pg.evaluate(()=>{ concept('s351',false,()=>{},null,'鸞'); }); await pg.waitForTimeout(200); await pg.screenshot({path:'u5-1geup.png'});
await pg.evaluate(()=>{ setTab('cards'); }); await pg.waitForTimeout(200); await pg.screenshot({path:'u6-cards.png'});
console.log('errs',errs); await b.close();
