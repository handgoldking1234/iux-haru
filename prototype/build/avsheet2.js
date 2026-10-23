const fs=require('fs'),{chromium}=require('playwright');
const s=fs.readFileSync(__dirname+'/play.js','utf8');
const a=s.indexOf("/* ---------- 아바타 '하루'"), b=s.indexOf("const gradeChip=");
new Function(s.replace('__ICONS__','{}').replace('__PLAY__','{}').replace(/makeHGS\(\)/,'({st:{eq:{}}})')+'\n;return 1;'); // parse check only (not executed)
const sec=s.slice(a,b);
const api=new Function('S',sec+';return {AVI,CATS,avatar};')(()=>({eq:{}}));
const {AVI,CATS,avatar}=api; const base={body:'cream',hat:'sprout',face:'basic',outfit:'none',bg:'none'};
let tot=0, ids=new Set(), html='<html><body style="font:11px sans-serif;margin:8px;background:#fff">';
const errs=[];
for(const [cat,l] of CATS.filter(x=>process.argv[2].split(',').includes(x[0]))){ const it=AVI[cat]; tot+=it.length;
  const z=it.filter(i=>i.p===0).length, dup=new Set(it.map(i=>i.id)).size!==it.length; if(dup) errs.push('dup '+cat);
  html+=`<h3 style="margin:6px 0">${cat} ${l} (${it.length}, p0=${z})</h3><div style="display:flex;flex-wrap:wrap;gap:4px">`;
  for(const i of it){ const eq={...base,[cat]:i.id}; html+=`<div style="width:154px;text-align:center">${avatar(eq,150)}<br>${i.name} ${i.p}${i.g?' g'+i.g:''}</div>`; }
  html+='</div>'; }
html+=`<h3>combos</h3>${avatar({body:'rainbow',hat:'bunny',face:'wink',outfit:'hanbok',hold:'trophy',bg:'space'},96)}${avatar({body:'choco',hat:'cat',face:'goggle',outfit:'backpack',hold:'umbrella',bg:'park'},96)}${avatar({body:'galaxy',hat:'gradcap',face:'monocle',outfit:'medal',hold:'globe',bg:'library'},96)}${avatar({body:'cream'},96)}</body></html>`;
console.log('total',tot, CATS.map(([c])=>c+':'+AVI[c].length).join(' '), errs, 'locked', Object.values(AVI).flat().filter(i=>i.g).length);
(async()=>{ const br=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'}); const pg=await br.newPage({viewport:{width:1300,height:800}});
 await pg.setContent(html); await pg.screenshot({path:__dirname+'/../avsheet_'+process.argv[2]+'.png',fullPage:true}); await br.close(); })();
