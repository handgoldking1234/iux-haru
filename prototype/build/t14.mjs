import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage({viewport:{width:400,height:860}});
const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/english.html'); await pg.waitForTimeout(600);
console.log((await pg.evaluate(()=>{ const out=[]; const p=P(); let q=0;
  for(let sess=0;sess<120;sess++){ start('new','x'); let guard=0;
    while(G&&guard++<300){ if(!G.cur){ p.read[curSt(p).id]=true; advance(); continue; } const c=G.cur; q++; const wrong=(q%31===0);
      if(c.spell) answer(wrong?'zzz':c.ans); else choose(wrong?c.choices.findIndex(v=>v!==c.ans):c.choices.indexOf(c.ans)); next(); }
    if(sess%10==0) out.push(`${curSt(p).name}|np${p.np}|due:${dueStages(p).length}|cards:${p.cards.length}`);
    if(curSt(p).area==='중등'&&curSt(p).n>=2) break; }
  out.push('END '+curSt(p).name+' exam:'+JSON.stringify(p.passed[STAGES[findSt('초등 승급 평가')].id]));
  return out; })).join('\n'));
await pg.evaluate(()=>{ S=seed(); const p=P(); p.read[curSt(p).id]=true; start('new','t'); let w=0;
  while(G&&G.cur&&w<5){ const c=G.cur; if(c.src==='new'){ if(c.spell) answer('zzz'); else choose(c.choices.findIndex(v=>v!==c.ans)); w++; } else { if(c.spell) answer(c.ans); else choose(c.choices.indexOf(c.ans)); } if(w<5) next(); } });
console.log('cap:',await pg.evaluate(()=>document.querySelector('.toast.warn')?.textContent+' read='+P().read[curSt(P()).id]));
console.log(errs);
const pg2=await b.newPage({viewport:{width:820,height:1180}});
await pg2.goto('file://'+process.cwd()+'/study.html'); await pg2.waitForTimeout(800);
await pg2.click('[data-s=eng]'); await pg2.waitForTimeout(1500);
let ef; for(const f of pg2.frames().slice(1)) if((await f.title())==='영단어하루') ef=f;
await ef.evaluate(()=>{ const p=P(); p.read[curSt(p).id]=true; start('new','초등 1단원'); });
await pg2.waitForTimeout(300); await pg2.screenshot({path:'e7-ipad.png'});
await b.close();
