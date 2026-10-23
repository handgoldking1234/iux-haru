import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage({viewport:{width:390,height:844}});
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(800);
for(const s of ['math','hanja','eng','hist','kor','typ']){ await pg.evaluate(s=>goSubject(s),s); await pg.waitForTimeout(600);
 const fr=pg.frames().find(f=>f!==pg.mainFrame()&&f.parentFrame()&&!f.isDetached()&&f.name()===''&&0)||null;
}
const out=[];
for(const f of pg.frames().slice(1)){ out.push([await f.title(), await f.evaluate(()=>{ const n=document.querySelector('nav, .tabbar, [role=tablist]'); const hdr=document.querySelector('header, .topbar, #bar'); return {nav:n?n.outerHTML.slice(0,500):null, navSel:n?(n.tagName+'#'+n.id+'.'+n.className):null, hdr:hdr?(hdr.tagName+'#'+hdr.id+'.'+hdr.className+' '+hdr.textContent.trim().slice(0,60)):null}; })]); }
console.log(JSON.stringify(out,null,1)); await b.close();
