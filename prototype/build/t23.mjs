import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[];
for(const f of ['hanja.html','english.html']){ const pg=await b.newPage({viewport:{width:400,height:860},deviceScaleFactor:2}); pg.on('pageerror',e=>errs.push(f+e.message));
await pg.goto('file://'+process.cwd()+'/'+f); await pg.waitForTimeout(600);
if(f==='hanja.html'){
  console.log(await pg.evaluate(()=>{ const r=[]; for(const t of ['school','grade']){ buildTrack(t); r.push(t+': '+STAGES.length+' stages; '+AREAS.map(a=>a+'='+STAGES.filter(s=>s.area===a&&s.kind==='char').reduce((x,s)=>x+s.chars.length,0)).join(' ')+' exams:'+STAGES.filter(s=>s.kind==='exam').map(s=>s.name).join('/')); } buildTrack('school'); return r; }));
  console.log(await pg.evaluate(()=>{ S.active='hajun'; const p=P(); let q=0; for(let sess=0;sess<60;sess++){ start('new','x'); let g=0; while(G&&g++<300){ if(!G.cur){ p.read[curSt(p).id]=true; advance(); continue;} q++; choose(G.cur.choices.indexOf(G.cur.ans)); clearTimeout(G&&G.timer); if(G) next(); } if(curSt(p).area==='초등'&&curSt(p).n>=3) break; } return 'school sim → '+curSt(p).name; }));
  await pg.evaluate(()=>{ buildTrack('school'); S.active='minwang'; render(); }); await pg.waitForTimeout(200); await pg.screenshot({path:'hs1.png'});
} else { console.log(await pg.evaluate(()=>STAGES.filter(s=>s.kind==='word').slice(0,3).map(s=>s.name+(s.core?'[핵심]':'')+' '+s.theme+': '+s.chars.slice(0,5).join(',')).join(' | ')+' || 초등 핵심 '+STAGES.filter(s=>s.core&&s.lvI===0).length+'/'+STAGES.filter(s=>s.kind==='word'&&s.lvI===0).length)); await pg.screenshot({path:'es1.png'}); }
await pg.close(); }
console.log(errs); await b.close();
