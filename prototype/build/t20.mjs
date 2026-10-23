import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/english.html'); await pg.waitForTimeout(500);
console.log(await pg.evaluate(()=>{ const r={}; for(const s of STAGES.filter(s=>s.kind==='word')){ const key=s.lvI+':'+(s.n>=61?'61+':'<61'); r[key]=r[key]||0; for(const w of s.chars){ if(makeQ({ch:w,t:'s'}).spell) r[key]++; } } 
  const p=P(); const g={recent:[]}; let sp=0; for(let i=0;i<300;i++){ const q=resolve({src:'exam',st:STAGES.find(s=>s.kind==='exam').id},p,g); if(q.spell) sp++; } r.exam초등spell=sp; return r; }));
console.log(errs); await b.close();
