import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const pg=await b.newPage({viewport:{width:1100,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/study.html'); await pg.waitForTimeout(1200);
let P; for(const f of pg.frames().slice(1)) if((await f.title())==='홈') P=f;
const html=await P.evaluate(()=>{ const pick=c=>AVI[c].filter((x,i)=>i%7===3).slice(0,8).map(x=>({[c]:x.id})); const L=[...pick('hat'),...pick('face'),...pick('outfit'),...pick('hold'),...pick('bg'),...pick('body')]; return L.map(e=>avatar({body:'cream',hat:'none',face:'basic',outfit:'none',hold:'none',bg:'none',...e},100)).join(''); });
await pg.setContent(`<body style="margin:0;display:flex;flex-wrap:wrap;gap:4px;width:1100px">${html}</body>`); await pg.screenshot({path:'tv.png'}); console.log(errs); await b.close();
