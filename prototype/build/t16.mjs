import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage({viewport:{width:400,height:860},deviceScaleFactor:2});
const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/history.html'); await pg.waitForTimeout(600);
await pg.screenshot({path:'h1-home.png'});
console.log(await pg.evaluate(()=>{ const r=[]; for(const tr of ['ko','wo']){ setupTrack(tr); let bad=[]; const cnt={};
  for(const id of ALL) for(const t of ['dt','td','ord','yr','ox']){ try{ const q=makeQ({ch:id,t}); cnt[q.t]=(cnt[q.t]||0)+1; if(new Set(q.choices).size!==q.choices.length||!q.choices.includes(q.ans)||(q.choices.length!==4&&!q.ox)) bad.push(id+t+':'+q.choices.join('/')); infoHTML(id);}catch(e){bad.push(id+t+e.message)} }
  r.push([tr,STAGES.length,bad.length,bad.slice(0,3),JSON.stringify(cnt)]); } setupTrack('ko'); return r; }));
await pg.evaluate(()=>{ start('new','x'); }); await pg.waitForTimeout(300); await pg.screenshot({path:'h2-concept.png'});
await pg.evaluate(()=>{ const p=P(); p.read[curSt(p).id]=true; G=null; start('new','t'); G.cur={...G.cur,...makeQ({ch:curSt(p).chars[3],t:'td'}),src:'new'}; drawPlay(); }); await pg.waitForTimeout(200); await pg.screenshot({path:'h3-td.png'});
await pg.evaluate(()=>{ choose(G.cur.choices.findIndex(v=>v!==G.cur.ans)); }); await pg.waitForTimeout(300); await pg.evaluate(()=>screen.scrollTop=500); await pg.screenshot({path:'h4-wrong.png'});
await pg.evaluate(()=>{ next(); G.cur={...makeQ({ch:curSt(P()).chars[5],t:'ord'}),src:'new'}; drawPlay(); }); await pg.waitForTimeout(200); await pg.screenshot({path:'h5-ord.png'});
console.log(errs); await b.close();
