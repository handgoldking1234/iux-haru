import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage({viewport:{width:390,height:800}});
await pg.addInitScript(()=>{ localStorage.setItem('harugongbu-auth',JSON.stringify({email:'a@b.c',kids:[{name:'민왕이',grade:'초5'}]})); });
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1300); await pg.evaluate(()=>goSubject('hist')); await pg.waitForTimeout(400);
console.log(await pg.evaluate(()=>{ const sw=document.getElementById('sw'), hd=document.querySelector('.hd'); const cs=getComputedStyle(hd);
 return {hd:hd.clientWidth, pad:cs.paddingLeft+'/'+cs.paddingRight, gap:cs.gap, sw:sw.clientWidth, swScroll:sw.scrollWidth, swPad:getComputedStyle(sw).padding, btns:[...sw.children].map(x=>Math.round(x.getBoundingClientRect().width)+':'+getComputedStyle(x).padding), hb:[...document.querySelectorAll('.hd .hb')].map(x=>x.getBoundingClientRect().width)}; }));
await b.close();
