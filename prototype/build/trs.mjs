import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[];
for(const [f,sp] of [['science.html',"{ch:Object.keys(IT).find(k=>IT[k].mc)}"],['korean.html',"{ch:Object.keys(IT).find(k=>IT[k].mc)}"],['history.html',"{ch:ALL[3],t:'dt'}"],['hanja.html',"{ch:STAGES[0].chars[0],t:'h'}"],['english.html',"{ch:STAGES[0].chars[0],t:'m'}"]]){
 const pg=await b.newPage(); pg.on('pageerror',e=>errs.push(f+e.message));
 await pg.goto('file://'+process.cwd()+'/'+f); await pg.waitForTimeout(700);
 // emulate NAVHOOK from study: fixPos only present inside study; load study's srcdoc frame instead
 await pg.close();
}
const pg=await b.newPage(); pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{ localStorage.setItem('harugongbu-auth',JSON.stringify({email:'a@b.c',kids:[{name:'민왕이',grade:'초5'}]})); });
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1200);
for(const [s,title,spec] of [['sci','과학하루',"({ch:Object.keys(IT).find(k=>IT[k].mc),t:'mc'})"],['kor','국어하루',"({ch:Object.keys(IT).find(k=>IT[k].mc),t:'mc'})"],['hist','역사하루',"({ch:ALL[3],t:'dt'})"],['hanja','한자씨앗',"({ch:Object.keys(CH)[5],t:'e'})"],['eng','영단어하루',"({ch:STAGES[0].chars[0],t:'m'})"]]){
  await pg.evaluate(s=>goSubject(s),s); await pg.waitForTimeout(700);
  let F; for(const fr of pg.frames().slice(1)) if((await fr.title())===title) F=fr;
  const r=await F.evaluate(sp=>{ const spec=eval(sp); const pos=[]; let same=0; for(let i=0;i<30;i++){ const q=makeQ(spec); const p=q.choices.indexOf(q.ans); if(pos.length&&pos[pos.length-1]===p) same++; pos.push(p); }
    const q=makeQ(spec); const rs=[]; let rsame=0; for(let i=0;i<20;i++){ const c=hgReshuf({...q}); if(c.indexOf(q.ans)===q.choices.indexOf(q.ans)) rsame++; }
    return {pos:pos.join(''),consecutiveSame:same,retrySame:rsame}; },spec).catch(e=>'ERR '+e.message);
  console.log(s, JSON.stringify(r));
}
console.log(errs); await b.close();
