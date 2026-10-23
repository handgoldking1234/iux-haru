import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage({viewport:{width:400,height:860},deviceScaleFactor:2});
const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1000);
await pg.click('[data-s=math]'); await pg.waitForTimeout(1200);
let mf; for(const f of pg.frames().slice(1)){ if((await f.title())==='셈하루') mf=f; }
const r=await mf.evaluate(async()=>{ const p=P(); p.read[STAGES[p.stage].id]=true; start('today','오늘 학습'); const out=[];
  // type correct answer digit by digit without ok
  const a=String(G.cur.a); for(const ch of a){ press(ch==='−'?'-':ch); } out.push('auto-correct i='+G.i+' lock='+G.lock+' log='+G.log.length+' ok='+G.log[0].ok);
  await new Promise(r=>setTimeout(r,500)); out.push('after i='+G.i);
  // wrong: type wrong of same length
  const b=String(G.cur.a); const wrong=b.replace(/\d/, d=>String((+d+1)%10)); for(const ch of wrong) press(ch==='−'?'-':ch);
  out.push('wrong logged='+G.log.length+' ok='+G.log[1].ok+' box='+(document.getElementById('wcnt')?.textContent));
  return out; });
console.log(r.join('\n'));
await pg.screenshot({path:'z1.png'});
console.log(errs); await b.close();
