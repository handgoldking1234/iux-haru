import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage({viewport:{width:400,height:860}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/math.html'); await pg.waitForTimeout(600);
console.log(await pg.evaluate(()=>{ const p=P(); p.stage=0; p.passed={}; p.cards=[]; p.bp={}; let q=0; const ord=[];
  for(let s=0;s<600&&p.stage<STAGES.length-1;s++){ start('today'); let g=0;
    while(G&&g++<300){ const gg=G; STAGES.forEach(x=>p.read[x.id]=true); if(!gg.cur){ advance(); continue; } q++; gg.input=String(gg.cur.a); check(); gg.lock=false; gg.i++; if(gg.i>=gg.q.length){ finish(); break; } advance(); }
    const id=STAGES[p.stage].id; if(ord[ord.length-1]!==id) ord.push(id); }
  return 'q='+q+' stage='+p.stage+'/'+STAGES.length+' '+STAGES[p.stage].name+' | mixPassed='+STAGES.filter(s=>s.mix&&p.passed[s.id]).length+' | '+ord.slice(0,32).join(','); }));
console.log(errs.slice(0,3)); await b.close();
