import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage({viewport:{width:400,height:860},deviceScaleFactor:2});
const errs=[]; pg.on('pageerror',e=>errs.push(e.message+' '+e.stack.split('\n')[1]));
await pg.goto('file://'+process.cwd()+'/hanja.html'); await pg.waitForTimeout(600);
console.log(await pg.evaluate(()=>({stages:STAGES.length,exams:STAGES.filter(s=>s.kind==='exam').map(s=>s.name+':'+s.chars.length).join(' '),first:STAGES.slice(0,8).map(s=>s.name).join(','),seedM:S.profiles.minwang.stage+' '+curSt(S.profiles.minwang).name,dueM:dueStages(S.profiles.minwang)})));
// validity of all q types
console.log('bad',await pg.evaluate(()=>{let bad=[];for(const h of ALL)for(const t of ['he','e','w','h','r']){try{const q=makeQ({ch:h,t},12);if(new Set(q.choices).size!==4||!q.choices.includes(q.ans))bad.push(h+t);}catch(e){bad.push(h+t+e.message)}}
 for(const [r] of RADS)for(const t of ['rh','rs','rc']){for(let i=0;i<5;i++){try{const q=makeQ({ch:r,t},0);if(new Set(q.choices).size!==4||!q.choices.includes(q.ans))bad.push(r+t+q.choices);radInfoHTML(r);}catch(e){bad.push(r+t+e.message)}}} return bad.slice(0,10).concat([bad.length]);}));
await pg.evaluate(()=>{S.active='hajun';render();}); await pg.waitForTimeout(200); await pg.screenshot({path:'v1-home.png'});
// simulate hajun: auto-read concepts, answer correctly, but wrong every 7th
const log=await pg.evaluate(()=>{ const out=[]; const p=P(); let q=0;
  for(let sess=0;sess<40;sess++){ start('new','x'); let guard=0;
    while(G&&guard++<200){ if(!G.cur){ p.read[curSt(p).id]=true; advance(); continue; } const c=G.cur; q++; const wrong=(q%29===0); const k=wrong?c.choices.findIndex(v=>v!==c.ans):c.choices.indexOf(c.ans); const src=c.src; choose(k); next(); }
    out.push(`${curSt(p).name}|np${p.np}|due:${dueStages(p).map(id=>STAGES[IDX[id]].name).join('/')}`);
    if(p.stage>=findSt('7급Ⅱ 2단원')) break; }
  return out; });
console.log(log.join('\n'));
console.log(await pg.evaluate(()=>{const p=P();return Object.entries(p.passed).map(([id,v])=>STAGES[IDX[id]].name+':'+(v.exam?'exam '+v.score:'b'+v.box+'@'+v.due)).join(' | ')+' np='+p.np;}));
await pg.evaluate(()=>{setTab('home');}); await pg.waitForTimeout(200); await pg.screenshot({path:'v2-home.png'});
// screenshots of rad question types
await pg.evaluate(()=>{S=seed();S.active='hajun';P().read['s0']=true;P().bp['s0']=0;setTab('home');start('new','부수 1단원');}); await pg.waitForTimeout(200); await pg.screenshot({path:'v3-rh.png'});
await pg.evaluate(()=>{choose(0);}); await pg.waitForTimeout(200); await pg.evaluate(()=>screen.scrollTop=380); await pg.screenshot({path:'v4-rinfo.png'});
await pg.evaluate(()=>{next(); G.cur=makeQ({ch:'水',t:'rc'},0); G.cur.src='new'; G.answered=false; drawPlay();}); await pg.waitForTimeout(200); await pg.screenshot({path:'v5-rc.png'});
await pg.evaluate(()=>{G=null;S.active='minwang';setTab('home');}); await pg.waitForTimeout(200); await pg.screenshot({path:'v6-minwang.png',fullPage:false});
await pg.evaluate(()=>{ areaF='8급'; renderHome(); screen.scrollTop=900;}); await pg.waitForTimeout(200); await pg.screenshot({path:'v7-list.png'});
console.log('errs',errs); await b.close();
