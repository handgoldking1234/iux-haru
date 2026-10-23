import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage({viewport:{width:400,height:860}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/math.html'); await pg.waitForTimeout(600);
console.log(await pg.evaluate(()=>{ const r=STAGES.filter(s=>s.mix).map(s=>[s.id,IDX[s.id],STAGES[IDX[s.id]-1].id,BANK[s.id].length,BANK[s.id].slice(0,3).map(x=>x.q).join(' | '),BANK[s.id].slice(-2).map(x=>x.q).join(' | '),s.gen().q]);
 let big=[]; STAGES.filter(s=>s.area==='자연수').forEach(s=>{ for(let i=0;i<200;i++){ const q=s.gen().q.replace(/<[^>]+>/g,' '); const nums=(q.match(/\d+/g)||[]).map(Number); if(nums.some(n=>n>=100)) {big.push(s.id+':'+q);break;} } (BANK[s.id]||[]).forEach(x=>{ if((x.q.match(/\d+/g)||[]).map(Number).some(n=>n>=100)) big.push('bank '+s.id+':'+x.q); }); });
 return JSON.stringify({n:STAGES.length,r,big:big},null,1); }));
console.log(await pg.evaluate(()=>{ S=seed(); const p=P(); return JSON.stringify(plan(p)); }));
console.log(errs); await b.close();
