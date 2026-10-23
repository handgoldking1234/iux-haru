import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage({viewport:{width:400,height:860}});
const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/history.html'); await pg.waitForTimeout(600);
for(const tr of ['ko','wo']){
console.log((await pg.evaluate((tr)=>{ setupTrack(tr); S=seed(); S.active='hajun'; const out=[]; const p=P(); let q=0;
  for(let sess=0;sess<200;sess++){ start('new','x'); let guard=0;
    while(G&&guard++<300){ if(!G.cur){ p.read[curSt(p).id]=true; advance(); continue; } const c=G.cur; q++; const wrong=(q%37===0);
      choose(wrong?c.choices.findIndex(v=>v!==c.ans):c.choices.indexOf(c.ans)); clearTimeout(G&&G.timer); if(G) next(); }
    if(p.stage>=STAGES.length-1) break; }
  out.push(tr+' END '+curSt(p).name+' passed='+Object.keys(p.passed).length+'/'+STAGES.length+' exams='+STAGES.filter(s=>s.kind==='exam'&&p.passed[s.id]).length);
  return out; },tr)).join('\n'));
}
console.log(errs); await b.close();
