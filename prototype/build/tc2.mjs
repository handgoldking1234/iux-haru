import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage({viewport:{width:390,height:844}});
await pg.goto('file://'+process.cwd()+'/hanja.html'); await pg.waitForTimeout(700);
await pg.evaluate(()=>{ const p=P(); concept(curSt(p).id,true,()=>{},null); document.getElementById('next').click(); });
await pg.waitForTimeout(400);
console.log(await pg.evaluate(()=>{ const out=[]; let el=document.getElementById('ihw'); while(el&&el.id!=='screen'){ const cs=getComputedStyle(el); out.push(`${el.tagName}.${el.className}#${el.id} h=${el.getBoundingClientRect().height|0} ov=${cs.overflow} max=${cs.maxHeight} disp=${cs.display} flex=${cs.flex}`); el=el.parentElement; } return out.join('\n'); }));
await b.close();
