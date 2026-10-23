import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[];
async function run(file,setup,ansOK,ansNO){
  const pg=await b.newPage({viewport:{width:400,height:860}}); pg.on('pageerror',e=>errs.push(file+': '+e.message));
  await pg.goto('file://'+process.cwd()+'/'+file); await pg.waitForTimeout(500);
  await pg.evaluate(setup);
  const i0=await pg.evaluate(()=>G.i); await pg.evaluate(ansOK); await pg.waitForTimeout(1100);
  const i1=await pg.evaluate(()=>G.i);
  await pg.evaluate(ansNO); await pg.waitForTimeout(400); const hasBar=await pg.evaluate(()=>!!document.querySelector('.autobar'));
  await pg.screenshot({path:'auto-'+file+'.png'});
  await pg.waitForTimeout(2500); const i2=await pg.evaluate(()=>G.i);
  // stop test
  await pg.evaluate(ansNO); await pg.waitForTimeout(300); await pg.evaluate(()=>document.getElementById('stopAuto').click()); await pg.waitForTimeout(3000); const i3=await pg.evaluate(()=>G.i);
  console.log(file,'correct',i0,'->',i1,'| wrong bar',hasBar,'->',i2,'| stopped stays',i3===i2+0||i3,'(i3='+i3+')');
  await pg.close();
}
await run('hanja.html',()=>{ const p=P(); p.read[curSt(p).id]=true; start('new','t'); },()=>choose(G.cur.choices.indexOf(G.cur.ans)),()=>choose(G.cur.choices.findIndex(v=>v!==G.cur.ans)));
await run('english.html',()=>{ const p=P(); p.read[curSt(p).id]=true; start('new','t'); },()=>{ G.cur.spell?answer(G.cur.ans):choose(G.cur.choices.indexOf(G.cur.ans)); },()=>{ G.cur.spell?answer('zzz'):choose(G.cur.choices.findIndex(v=>v!==G.cur.ans)); });
await run('math.html',()=>{ const p=P(); p.read[STAGES[p.stage].id]=true; start('new','t'); },()=>{ for(const ch of String(G.cur.a)) press(ch); },()=>{ const a=String(G.cur.a); const w=a.replace(/\d/,d=>String((+d+1)%10)); for(const ch of w) press(ch); });
console.log(errs); await b.close();
