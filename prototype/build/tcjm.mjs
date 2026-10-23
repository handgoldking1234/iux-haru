import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage({viewport:{width:400,height:860},deviceScaleFactor:2});
const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/hanja.html'); await pg.waitForTimeout(600);
for(const tr of ["cjm"]){
console.log((await pg.evaluate((tr)=>{ buildTrack(tr); S=seed(); S.active=Object.keys(S.profiles||{})[0]||S.active; const p=P(); let q=0, mc=0;
  for(let sess=0;sess<1500;sess++){ start('new','x'); let guard=0;
    while(G&&guard++<300){ if(!G.cur){ p.read[curSt(p).id]=true; advance(); continue; } const c=G.cur; q++; if(c.write){ mc++; G.writeDone=true; } const wrong=(q%37===0);
      choose(wrong?c.choices.findIndex(v=>v!==c.ans):c.choices.indexOf(c.ans)); clearTimeout(G&&G.timer); if(G) next(); }
    if(p.allDone) break; }
  return tr+' q='+q+' mc='+mc+' allDone='+!!p.allDone; },tr)));
}
console.log(errs); await b.close();
