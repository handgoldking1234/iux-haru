import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage({viewport:{width:400,height:860},deviceScaleFactor:2});
const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1200);
const hz=pg.frames()[1];
// hanja: answer wrong 5 times on new
const r1=await hz.evaluate(()=>{ const p=P(); p.read[curSt(p).id]=true; start('new','t'); const out=[]; let w=0,guard=0;
  while(G&&guard++<60){ if(!G.cur){ out.push('GATE at w='+w); break; } const c=G.cur; const isNew=c.src==='new'; const k=isNew?c.choices.findIndex(v=>v!==c.ans):c.choices.indexOf(c.ans); choose(k); if(isNew){w++; out.push('wrong'+w+' wr='+WR(p,curSt(p).id)+' read='+p.read[curSt(p).id]);} if(w===5) { out.push(document.querySelector('#after .toast.warn')?.textContent||'no toast'); } next(); }
  return out; });
console.log(r1.join('\n'));
await pg.screenshot({path:'y1.png'});
// exam early stop
const r2=await hz.evaluate(()=>{ G=null; S.active='seoyun'; const p=P(); p.stage=findSt('8급 승급 평가'); start('new','평가'); let n=0; while(G&&G.cur&&n<40){ choose(G.cur.choices.findIndex(v=>v!==G.cur.ans)); n++; next(); } return [n, document.querySelector('.exres')?.textContent]; });
console.log(r2);
await pg.click('[data-s=math]'); await pg.waitForTimeout(1200);
const mf=pg.frames().find(f=>f!==hz&&f!==pg.mainFrame());
const r3=await mf.evaluate(()=>{ const p=P(); p.read[STAGES[p.stage].id]=true; start('new','t'); const out=[]; let w=0,g2=0; while(G&&g2++<40){ if(!G.cur){out.push('GATE w='+w);break;} const c=G.cur; if(c.src==='new'){ G.input='99999'; check(); w++; out.push('w'+w+' wr='+WR(p,STAGES[p.stage].id)+' read='+p.read[STAGES[p.stage].id]); if(w==CAP(STAGES[p.stage])||w==7) out.push(document.querySelector('#tip').textContent); nextAfterWrong(); } else { G.input=c.a.replace('−','-'); check(); G.lock=false; G.i++; if(G.i>=G.q.length){finish();break;} advance(); } } return out; });
console.log(r3.join('\n'));
await pg.screenshot({path:'y2.png'});
console.log('errs',errs); await b.close();
