import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage({viewport:{width:400,height:860},deviceScaleFactor:2});
const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/korean.html'); await pg.waitForTimeout(600);
console.log(await pg.evaluate(()=>{ const r=[]; for(const tr of ['kr','vc']){ setupTrack(tr); let bad=[]; const cnt={};
  for(const id of ALL) for(const t of ['dt','td','ox','sp']){ try{ const q=makeQ({ch:id,t}); cnt[q.t]=(cnt[q.t]||0)+1; if(new Set(q.choices).size!==q.choices.length||!q.choices.includes(q.ans)||(q.choices.length<2)) bad.push(id+t+':'+q.choices.join('/')); infoHTML(id);}catch(e){bad.push(id+t+e.message)} }
  r.push([tr,STAGES.length,AREAS.join(','),bad.length,bad.slice(0,3),JSON.stringify(cnt)]); } setupTrack('kr'); return r; }));
for(const tr of ['kr','vc']){
console.log((await pg.evaluate((tr)=>{ setupTrack(tr); S=seed(); S.active='hajun'; const p=P(); let q=0;
  for(let sess=0;sess<200;sess++){ start('new','x'); let guard=0;
    while(G&&guard++<300){ if(!G.cur){ p.read[curSt(p).id]=true; advance(); continue; } const c=G.cur; q++; const wrong=(q%37===0);
      choose(wrong?c.choices.findIndex(v=>v!==c.ans):c.choices.indexOf(c.ans)); clearTimeout(G&&G.timer); if(G) next(); }
    if(p.allDone) break; }
  return tr+' END '+curSt(p).name+' allDone='+!!p.allDone; },tr)));
}
await pg.evaluate(()=>{ setupTrack('kr'); S=seed(); S.active='hajun'; render(); }); await pg.waitForTimeout(200); await pg.screenshot({path:'k1.png'});
await pg.evaluate(()=>{ const p=P(); p.read[curSt(p).id]=true; start('new','t'); G.cur={...makeQ({ch:curSt(p).chars[0],t:'sp'}),src:'new'}; drawPlay(); }); await pg.waitForTimeout(200); await pg.screenshot({path:'k2.png'});
await pg.evaluate(()=>{ choose(G.cur.choices.findIndex(v=>v!==G.cur.ans)); }); await pg.waitForTimeout(300); await pg.evaluate(()=>screen.scrollTop=600); await pg.screenshot({path:'k3.png'});
console.log(errs); await b.close();
