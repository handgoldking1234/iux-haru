/* eslint-disable */
// @ts-nocheck
/**
 * 놀이터 게임 — prototype/build/play.js를 그대로 옮김 (자동 생성: scripts/play-app.mjs, 직접 고치지 않기)
 * env: { icons, pd, HGS, start, sub, hgNav(on), hgNavSel(t), hgNavBadge(o), hgSheet(k), goSubject(k), goStudy(), hgLogout(), hgSfx(k), fireAlarm(a, test) }
 */
export const PLAY_SKELETON = "<div class=\"app\">\n  <header id=\"bar\"></header>\n  <main id=\"screen\"></main>\n  <nav id=\"tabs\" aria-label=\"메뉴\">\n    <button data-tab=\"home\" aria-selected=\"true\">홈</button>\n    <button data-tab=\"study\" aria-selected=\"false\">공부</button>\n    <button data-tab=\"game\" aria-selected=\"false\">게임</button>\n    <button data-tab=\"rank\" aria-selected=\"false\">랭킹</button>\n    <button data-tab=\"my\" aria-selected=\"false\">마이</button>\n  </nav>\n</div>";

export function mountPlay(root, env) {
root.innerHTML = PLAY_SKELETON;
/* =========================================================
   놀이터 — 하루공부 동기부여 (프로토타입)
   나(아바타·등급·캐시) · 게임(스피드 게임·대결방) · 랭킹
   대결방은 시연용: 친구는 가상 참가자이고, 실제 버전은 서버 실시간 연결(Supabase Realtime)로 바꿈
   아동 안전: 닉네임만 노출, 채팅은 정해진 문구·이모지만, 방은 코드로만 입장, 캐시 현금 판매 없음
   ========================================================= */
const ICONS=env.icons;
const PD=env.pd;
const LI=(n,c)=>`<svg class="ic${c?' '+c:''}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]||''}</svg>`;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };

/* 저장소: 셸(하루공부) 안이면 셸 것을 같이 씀, 단독 실행이면 자체 저장소 */
let HG=env.HGS;
const S=()=>HG.st;

/* ---------- 아바타 '하루' (직접 그린 동그란 캐릭터) ---------- */
const AVI={
 body:[{id:'cream',name:'크림',c:'#FFE3A3',p:0},{id:'mint',name:'민트',c:'#8FE0BF',p:0},{id:'sky',name:'하늘',c:'#9CCFFF',p:30},{id:'peach',name:'복숭아',c:'#FFB9A8',p:30},{id:'lav',name:'라벤더',c:'#CDBBFF',p:60},{id:'gold',name:'황금',c:'#FFD34D',p:200,g:5},
  {id:'cloud',name:'회색 구름',c:'#D5DAE1',p:30},{id:'lemon',name:'레몬',c:'#FFF07A',p:40},{id:'lime',name:'라임',c:'#C5F27A',p:40},{id:'sea',name:'바다',c:'#5EC8D8',p:60},{id:'cherry',name:'체리',c:'#FF8A98',p:60},{id:'choco',name:'초코',c:'#C49470',p:80},{id:'galaxy',name:'밤하늘 보라',c:'#9F8CF2',p:150,g:2},{id:'rainbow',name:'무지개',c:'#FFD9A0',p:400,g:6}],
 hat:[{id:'sprout',name:'새싹',p:0},{id:'cap',name:'야구모자',p:40},{id:'ribbon',name:'리본',p:40},{id:'beanie',name:'털모자',p:60},{id:'wizard',name:'마법사 모자',p:150,g:3},{id:'crown',name:'왕관',p:250,g:4},
  {id:'headband',name:'헤어밴드',p:30},{id:'starpin',name:'별 머리핀',p:50},{id:'cat',name:'고양이 귀',p:80},{id:'bunny',name:'토끼 귀',p:80},{id:'flowers',name:'꽃 화관',p:100},{id:'helmet',name:'자전거 헬멧',p:100,g:1},{id:'chef',name:'요리사 모자',p:120},{id:'explorer',name:'탐험가 모자',p:120},{id:'mushroom',name:'버섯 모자',p:150},{id:'pirate',name:'해적 모자',p:180},{id:'santa',name:'산타 모자',p:200,g:3},{id:'gradcap',name:'졸업 모자',p:300,g:5}],
 face:[{id:'basic',name:'기본',p:0},{id:'glasses',name:'동그란 안경',p:50},{id:'sun',name:'선글라스',p:80},{id:'star',name:'별 안경',p:150,g:5},
  {id:'freckle',name:'주근깨',p:20},{id:'hsticker',name:'하트 볼 스티커',p:30},{id:'mustache',name:'장난 수염',p:40},{id:'wink',name:'윙크 눈',p:50},{id:'hglass',name:'하트 안경',p:60},{id:'starblush',name:'별 볼터치',p:60},{id:'patch',name:'해적 안대',p:80},{id:'goggle',name:'물안경',p:100},{id:'sparkle',name:'반짝 눈',p:120,g:1},{id:'monocle',name:'모노클',p:250,g:3}],
 outfit:[{id:'none',name:'없음',p:0},{id:'scarf',name:'목도리',p:40},{id:'bow',name:'나비넥타이',p:50},{id:'cape',name:'망토',p:200,g:4},
  {id:'tie',name:'넥타이',p:40},{id:'apron',name:'앞치마',p:50},{id:'suspend',name:'멜빵바지',p:60},{id:'vest',name:'조끼',p:80},{id:'sport',name:'줄무늬 운동복',p:80},{id:'necklace',name:'구슬 목걸이',p:100},{id:'backpack',name:'배낭',p:100},{id:'lifevest',name:'구명조끼',p:120},{id:'capered',name:'빨간 망토',p:150},{id:'capeblue',name:'파란 망토',p:150},{id:'hanbok',name:'한복 저고리',p:200,g:3},{id:'medal',name:'금메달',p:200,g:2}],
 bg:[{id:'none',name:'기본',p:0},{id:'dots',name:'물방울',p:30},{id:'sunset',name:'노을',p:80},{id:'night',name:'밤하늘',p:250,g:6},
  {id:'board',name:'교실 칠판',p:40},{id:'sea',name:'바다',p:60},{id:'forest',name:'숲',p:60},{id:'desert',name:'사막',p:80},{id:'library',name:'도서관',p:80},{id:'sakura',name:'벚꽃',p:100},{id:'snow',name:'눈 오는 밤',p:120},{id:'park',name:'놀이공원',p:250,g:3},{id:'space',name:'우주',p:300,g:4},{id:'rainbow',name:'무지개',p:350,g:5}],
 hold:[{id:'none',name:'없음',p:0},{id:'pencil',name:'연필',p:20},{id:'book',name:'책',p:30},{id:'lolli',name:'막대사탕',p:40},{id:'flower',name:'꽃 한 송이',p:40},{id:'balloon',name:'풍선',p:50},{id:'icecream',name:'아이스크림',p:50},{id:'flag',name:'깃발',p:60},{id:'umbrella',name:'우산',p:80},{id:'ball',name:'축구공',p:80},{id:'magnifier',name:'돋보기',p:100},{id:'globe',name:'지구본',p:180,g:2},{id:'wand',name:'요술봉',p:250,g:4},{id:'trophy',name:'트로피',p:400,g:6}]
};

/* ---------- 꾸미기 아이템 대량 추가: 기본 그림 + 색 바꾸기(변형) ----------
   변형 아이템은 {base, rc}를 가짐 → avatar()가 기본 그림을 그린 뒤 색만 바꿔 칠함 */
const hx=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)), toHx=a=>'#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('').toUpperCase();
const shade=(h,t)=>{ const a=hx(h); return toHx(a.map(v=>t<0?v*(1+t):v+(255-v)*t)); };
const PAL=[['red','빨강','#E5484D'],['orange','주황','#F97316'],['yellow','노랑','#FACC15'],['green','초록','#22C55E'],['mint','민트','#14B8A6'],['sky','하늘','#38BDF8'],['blue','파랑','#2563EB'],['navy','남색','#3730A3'],['purple','보라','#8B5CF6'],['pink','분홍','#EC4899'],['black','검정','#2B2F36'],['brown','갈색','#8B5E3C'],['gold','금색','#E8B400']];
const role=(r,m)=>r==='m'?m:r==='d'?shade(m,-.22):r==='a'?m+'55':r==='l'?shade(m,.86):r==='l2'?shade(m,.62):r==='l3'?shade(m,.35):m;
const VARY={
  hat:[['cap',[['#E5484D','m'],['#C9303A','d']]],['beanie',[['#0EA5E9','m'],['#0369A1','d']]],['ribbon',[['#F472B6','m'],['#DB2777','d']]],['headband',[['#F472B6','m'],['#DB2777','d']]],['wizard',[['#4338CA','m'],['#3730A3','d']]],['helmet',[['#22C55E','m'],['#15803D','d']]],['mushroom',[['#EF4444','m']]],['party',[['#8B5CF6','m'],['#6D28D9','d']]],['phones',[['#2563EB','m'],['#1D4ED8','d']]],['bucket',[['#F59E0B','m'],['#D97706','d']]]],
  face:[['glasses',[['#3B3F46','m']]],['sun',[['#1F2328','m']]],['hglass',[['#F472B655','a'],['#DB2777','d']]],['goggle',[['#7DD3FC66','a'],['#1E40AF','d'],['#2563EB','m']]],['hsticker',[['#F43F5E','m']]],['starblush',[['#FF8FA3','m'],['#F06A85','d']]],['mask',[['#F472B6','m'],['#DB2777','d']]]],
  outfit:[['scarf',[['#E5484D','m'],['#C9303A','d']]],['bow',[['#2563EB','m'],['#1D4ED8','d']]],['tie',[['#E5484D','m'],['#B91C1C','d']]],['sport',[['#2563EB','m'],['#1E3A8A','d']]],['suspend',[['#3B82F6','m'],['#2563EB','d']]],['vest',[['#B7791F','m'],['#975A16','d']]],['hanbok',[['#F9A8D4','m'],['#F472B6','d']]],['cape',[['#7C3AED','m'],['#6D28D9','d']]],['backpack',[['#F97316','m'],['#EA580C','d'],['#C2410C','d']]],['hoodie',[['#64748B','m'],['#475569','d']]]],
  hold:[['balloon',[['#F87171','m'],['#E5484D','d']]],['lolli',[['#F472B6','m']]],['flower',[['#F472B6','m']]],['umbrella',[['#38BDF8','m'],['#0EA5E9','d']]],['flag',[['#22C55E','m']]],['icecream',[['#F9A8D4','m']]],['book',[['#2563EB','m'],['#1D4ED8','d']]],['pencil',[['#FACC15','m'],['#EAB308','d']]],['kite',[['#EF4444','m'],['#B91C1C','d']]]],
  bg:[['dots',[['#DDF0FF','l']]],['stripe',[['#E0F2FE','l'],['#BAE6FD','l2']]],['check',[['#E0F2FE','l'],['#BAE6FD','l2']]],['hearts',[['#FCE7F3','l'],['#F9A8D4','l3']]],['stars',[['#EDE9FE','l'],['#C4B5FD','l3']]],['confetti',[['#FEF9C3','l']]]]
};
/* 새 기본 그림 아이템 */
AVI.hat.push({id:'party',name:'고깔모자',p:40},{id:'phones',name:'헤드폰',p:90},{id:'bucket',name:'벙거지',p:60});
AVI.face.push({id:'mask',name:'가면무도회 가면',p:90});
AVI.outfit.push({id:'hoodie',name:'후드티',p:70});
AVI.hold.push({id:'kite',name:'연',p:70});
AVI.bg.push({id:'stripe',name:'줄무늬',p:30},{id:'check',name:'체크',p:30},{id:'hearts',name:'하트',p:40},{id:'stars',name:'별',p:40},{id:'confetti',name:'색종이',p:50});
Object.entries(VARY).forEach(([cat,list])=>list.forEach(([base,map])=>{ const b=AVI[cat].find(x=>x.id===base); if(!b) return;
  PAL.forEach(([pk,pn,ph],i)=>{ const rc=map.map(([o,r])=>[o,role(r,ph)]); if(rc.some(([o,n])=>o.toUpperCase()===n.toUpperCase())) return;
    AVI[cat].push({id:base+'_'+pk,name:`${b.name} ${pn}`,p:Math.max(20,b.p)+(i%3)*10,g:b.g,base,rc}); }); }));
/* 몸 색: 단색 + 두 가지 색 그라데이션 */
[['coral','코랄','#FF9E80'],['apricot','살구','#FFC9A3'],['butter','버터','#FFE8A3'],['olive','올리브','#C9D67A'],['matcha','말차','#A8D5A2'],['teal','청록','#7FD1C7'],['ice','얼음','#CDEBFF'],['denim','청바지','#8FB3E8'],['lilac','라일락','#E0C8FF'],['rose','장미','#FFB3C7'],['plum','자두','#D9A3E0'],['ivory','아이보리','#FFF6E0'],['sand','모래','#E8D2A6'],['caramel','캐러멜','#E0A970'],['silver','은색','#D9DEE6'],['berry','블루베리','#A8A8F0'],['melon','멜론','#BEEFA0'],['tomato','토마토','#FF8A70'],['grape','포도','#B49AE8'],['sora','소라','#A6E3E9']].forEach(([id,n,c],i)=>AVI.body.push({id,name:n,c,p:30+(i%4)*10}));
[['peachy','복숭아 노을',['#FFD1A8','#FF9EB5']],['oceang','바다 그라데이션',['#9CE8FF','#7C9CFF']],['forestg','숲 그라데이션',['#D4F7A8','#6FD6A0']],['candy','솜사탕',['#FFC2E2','#B8D8FF']],['sunrise','해돋이',['#FFF08A','#FF9E80']],['aurora','오로라',['#A8F0D8','#C8B0FF']],['lemonade','레모네이드',['#FFF6A8','#B8F0A8']],['dusk','저녁 하늘',['#C8B0FF','#FF9EB5']],['mintc','민트초코',['#A8F0D8','#C49470']],['icey','빙하',['#FFFFFF','#9CCFFF']],['flame','불꽃',['#FFE08A','#FF7A5C'],3],['cosmos','은하수',['#9F8CF2','#5EC8D8'],4]].forEach(([id,n,gr,g],i)=>AVI.body.push({id,name:n,c:gr[0],gr,p:g?250:80+(i%3)*20,g}));
const CATS=[['body','몸 색'],['hat','머리'],['face','얼굴'],['outfit','옷'],['hold','소품'],['bg','배경']];
try{ const e=S()&&S().eq; if(e&&!e.hold) e.hold='none'; }catch(_){}
let uid=0;
const AV_STAR=[[0,-9],[2.6,-2.8],[9,-2.8],[3.8,1.4],[5.8,8],[0,4],[-5.8,8],[-3.8,1.4],[-9,-2.8],[-2.6,-2.8]];
const star=(x,y,s=1,f='#FFD34D',sc='#C99700')=>`<path d="M${AV_STAR.map(([a,b])=>`${+(x+a*s).toFixed(1)} ${+(y+b*s).toFixed(1)}`).join(' L')} Z" fill="${f}" stroke="${sc}" stroke-width="${+(1.2*Math.min(1,s+.3)).toFixed(1)}" stroke-linejoin="round"/>`;
const heart=(x,y,s,f,sc,w)=>`<path d="M${x} ${y+7*s}C${x-12*s} ${y-s} ${x-7*s} ${y-10*s} ${x} ${y-4*s}C${x+7*s} ${y-10*s} ${x+12*s} ${y-s} ${x} ${y+7*s}Z" fill="${f}"${sc?` stroke="${sc}" stroke-width="${w}"`:''}/>`;
const flw=(x,y,col,s)=>[[0,-1],[.95,-.31],[.59,.81],[-.59,.81],[-.95,-.31]].map(([a,b])=>`<circle cx="${+(x+a*s).toFixed(1)}" cy="${+(y+b*s).toFixed(1)}" r="${+(s*.85).toFixed(1)}" fill="${col}"/>`).join('')+`<circle cx="${x}" cy="${y}" r="${+(s*.6).toFixed(1)}" fill="#FDE68A"/>`;
const spk=(x,y,s,f)=>`<path d="M${x} ${y-s}Q${x} ${y} ${x+s} ${y}Q${x} ${y} ${x} ${y+s}Q${x} ${y} ${x-s} ${y}Q${x} ${y} ${x} ${y-s}Z" fill="${f||'#FFD34D'}"/>`;
function avatar(eq,size){
  eq={...(eq||{})}; const RC={};
  ['bg','hat','face','outfit','hold'].forEach(ct=>{ const it=AVI[ct].find(x=>x.id===eq[ct]); if(it&&it.base){ RC[ct]=it.rc; eq[ct]=it.base; } });
  const rcol=(ct,str)=>{ if(!RC[ct]||!str) return str; RC[ct].forEach(([o,n])=>{ str=str.split(o).join('\u0000'+n); }); return str.split('\u0000').join(''); };
  const k=++uid, B=AVI.body.find(b=>b.id===eq.body)||AVI.body[0], rb=B.id==='rainbow'||!!B.gr, c=rb?`url(#r${k})`:B.c;
  const rbDef=rb?`<linearGradient id="r${k}" gradientUnits="userSpaceOnUse" x1="26" y1="44" x2="94" y2="104">${(B.gr||['#FF9AA2','#FFC48A','#FFF08A','#A8F0A0','#9AD8FF','#C8B0FF']).map((s,i,a)=>`<stop offset="${i/(a.length-1)}" stop-color="${s}"/>`).join('')}</linearGradient>`:'';
  const W=`<rect width="120" height="120" fill=`, ST=(pts,r,f)=>pts.map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="${typeof r==='number'?r:r(i)}" fill="${f}"/>`).join('');
  const cols=['#E5484D','#2563EB','#F59E0B','#0FA37F','#8B5CF6','#EC4899'];
  const books=(x0,yb)=>{ let x=x0; return [5,4,6,4,5].map((w,i)=>{ const h=[20,16,22,18,15][(i+yb)%5], r=`<rect x="${x}" y="${yb-h}" width="${w}" height="${h}" rx="1" fill="${cols[(i+yb)%6]}"/>`; x+=w+.6; return r; }).join('')+`<rect x="${x0-2}" y="${yb}" width="30" height="4" fill="#8B5E3C"/>`; };
  const tree=x=>`<rect x="${x-3}" y="86" width="6" height="14" fill="#8B5E3C"/><path d="M${x} 40 L${x-12} 68 H${x+12}Z M${x} 54 L${x-14} 88 H${x+14}Z" fill="#3E9B5B"/>`;
  const bg={none:`${W}"#F1F2F5"/>`,
    dots:`${W}"#DDF0FF"/>${[[18,22],[95,18],[30,95],[100,90],[62,14],[12,60],[108,55]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" fill="#fff"/>`).join('')}`,
    sunset:`<defs><linearGradient id="g${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDBA74"/><stop offset="1" stop-color="#F472B6"/></linearGradient></defs><rect width="120" height="120" fill="url(#g${k})"/><circle cx="92" cy="30" r="12" fill="#FFF3C4"/>`,
    night:`<rect width="120" height="120" fill="#27235E"/>${[[16,20],[40,12],[98,24],[86,52],[14,70],[104,96],[22,104]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="${i%2?1.6:2.4}" fill="#FFE9A8"/>`).join('')}<path d="M92 14a10 10 0 1 0 8 16a8 8 0 1 1-8-16z" fill="#FFE9A8"/>`,
    board:`${W}"#F3E9D2"/><rect x="4" y="8" width="112" height="70" rx="3" fill="#9A6B43"/><rect x="8" y="12" width="104" height="62" fill="#2F5D50"/><path d="M16 26 H30 M23 19 V33" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="99" cy="25" r="7" fill="none" stroke="#FDE68A" stroke-width="2.2"/><path d="M14 58 q6 -9 12 0 t12 0 M86 58 l6 -8 l6 8 l6 -8" stroke="#ffffffcc" stroke-width="2" fill="none" stroke-linecap="round"/><rect x="4" y="78" width="112" height="5" fill="#7A5232"/><rect x="88" y="75" width="10" height="3" rx="1.5" fill="#fff"/>`,
    sea:`${W}"#BDE7FF"/><circle cx="96" cy="24" r="9" fill="#FFE38A"/><path d="M12 26 q4 -4 8 0 q4 -4 8 0" stroke="#5B6B7C" stroke-width="1.6" fill="none"/><rect y="72" width="120" height="48" fill="#3BA7E0"/><path d="M0 72 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 V78 H0Z" fill="#7CCBF0"/><path d="M19 66 V44 L32 64Z" fill="#F87171"/><path d="M6 66 H32 L27 73 H11Z" fill="#fff"/><path d="M84 96 q6 -4 12 0 M94 108 q6 -4 12 0 M8 100 q6 -4 12 0" stroke="#A5DDF5" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    forest:`${W}"#E2F5DC"/><path d="M0 98 Q60 88 120 98 V120 H0Z" fill="#8BD17C"/>${tree(12)}${tree(108)}<circle cx="30" cy="104" r="3" fill="#F472B6"/><circle cx="92" cy="106" r="3" fill="#FDE047"/>`,
    desert:`${W}"#FFE6B3"/><circle cx="94" cy="24" r="10" fill="#FDBA4D"/><path d="M0 90 Q30 78 60 88 T120 84 V120 H0Z" fill="#EDBE72"/><path d="M0 104 Q40 96 80 104 T120 102 V120 H0Z" fill="#E0A955"/><rect x="102" y="60" width="8" height="34" rx="4" fill="#4CAF6A"/><path d="M102 78 H97 V69 M110 73 H115 V65" stroke="#4CAF6A" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><rect x="12" y="76" width="6" height="18" rx="3" fill="#4CAF6A"/><path d="M12 84 H8 V79" stroke="#4CAF6A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
    library:`${W}"#F5EBDD"/>${books(2,34)+books(2,66)+books(2,98)+books(93,34)+books(93,66)+books(93,98)}`,
    sakura:`${W}"#FFEAF2"/><path d="M-2 18 Q22 24 40 10 M18 21 Q24 32 14 42 M122 34 Q102 34 90 22" stroke="#8B5E3C" stroke-width="3.5" fill="none" stroke-linecap="round"/>${[[8,15],[24,18],[38,10],[14,40],[22,30],[110,32],[97,28],[89,20]].map(([x,y],i)=>flw(x,y,i%2?'#F9A8D4':'#FBCFE8',3.4)).join('')}${[[12,70,20],[104,64,-30],[18,100,40],[100,102,10],[90,86,-50],[28,84,60]].map(([x,y,a])=>`<ellipse cx="${x}" cy="${y}" rx="3" ry="1.8" transform="rotate(${a} ${x} ${y})" fill="#F9A8D4"/>`).join('')}`,
    snow:`${W}"#2B3A67"/><path d="M0 98 Q60 90 120 98 V120 H0Z" fill="#EEF4FF"/><rect x="6" y="82" width="18" height="14" fill="#C2410C"/><path d="M3 83 L15 72 L27 83Z" fill="#fff"/><rect x="12" y="86" width="6" height="5" fill="#FDE68A"/>${ST([[14,16],[34,30],[56,10],[84,18],[104,34],[20,52],[100,60],[110,14],[28,70],[94,82],[110,88],[44,20],[72,24]],i=>i%3?1.6:2.4,'#fff')}`,
    park:`${W}"#D6F3FF"/><path d="M0 100 Q60 94 120 100 V120 H0Z" fill="#9BDB8A"/><path d="M20 52 L10 100 M20 52 L30 100" stroke="#9CA3AF" stroke-width="3"/><circle cx="20" cy="52" r="17" fill="none" stroke="#F472B6" stroke-width="3"/><path d="M3 52 H37 M20 35 V69 M8 40 L32 64 M32 40 L8 64" stroke="#F9A8D4" stroke-width="1.5"/>${ST([[20,35],[37,52],[20,69],[3,52],[32,40],[8,64],[32,64],[8,40]],3.2,'#60A5FA')}<path d="M0 8 Q60 22 120 8" stroke="#9CA3AF" stroke-width="1" fill="none"/>${[[12,10.6,'#E5484D'],[30,14.2,'#FACC15'],[48,15.9,'#22C55E'],[66,15.9,'#3B82F6'],[84,14.4,'#EC4899'],[102,11.2,'#F59E0B']].map(([x,y,f])=>`<path d="M${x-5} ${y} H${x+5} L${x} ${y+8}Z" fill="${f}"/>`).join('')}<path d="M92 80 L106 66 L120 80Z" fill="#EF4444"/><rect x="92" y="80" width="28" height="20" fill="#FEE2E2"/><path d="M100 100 V88 Q106 83 112 88 V100Z" fill="#B91C1C"/>`,
    space:`${W}"#141B3D"/>${ST([[12,14],[36,10],[60,6],[110,52],[8,46],[104,82],[30,108],[78,112],[52,20],[114,104],[18,72]],i=>i%2?1:1.7,'#fff')}<circle cx="96" cy="26" r="10" fill="#F59E0B"/><ellipse cx="96" cy="26" rx="17" ry="4.5" transform="rotate(-20 96 26)" fill="none" stroke="#FDE68A" stroke-width="2.2"/><circle cx="18" cy="94" r="8" fill="#60A5FA"/><circle cx="15" cy="91" r="2.4" fill="#93C5FD"/><circle cx="24" cy="26" r="3.5" fill="#F472B6"/>`,
    stripe:`${W}"#E0F2FE"/>${[0,1,2,3,4,5,6,7].map(i=>`<rect x="${i*16-4}" y="0" width="8" height="120" fill="#BAE6FD" transform="rotate(20 60 60)"/>`).join('')}`,
    check:`${W}"#E0F2FE"/>${[0,1,2,3,4,5].map(i=>`<rect x="${i*20+5}" width="10" height="120" fill="#BAE6FD" opacity=".7"/><rect y="${i*20+5}" width="120" height="10" fill="#BAE6FD" opacity=".7"/>`).join('')}`,
    hearts:`${W}"#FCE7F3"/>${[[14,16],[50,10],[96,18],[10,56],[106,52],[22,98],[98,100],[60,108]].map(([x,y])=>heart(x,y,.7,'#F9A8D4')).join('')}`,
    stars:`${W}"#EDE9FE"/>${[[14,16],[50,10],[100,18],[10,56],[108,54],[20,100],[100,102],[62,110]].map(([x,y])=>star(x,y,.6,'#C4B5FD','#C4B5FD')).join('')}`,
    confetti:`${W}"#FEF9C3"/>${[[12,14,'#F87171',20],[40,8,'#60A5FA',-30],[86,12,'#34D399',45],[108,30,'#F472B6',10],[8,48,'#FBBF24',-40],[110,64,'#A78BFA',30],[14,86,'#34D399',60],[30,108,'#F87171',-20],[96,96,'#60A5FA',15],[66,112,'#FBBF24',50]].map(([x,y,f,a])=>`<rect x="${x-4}" y="${y-2}" width="8" height="4" rx="1" fill="${f}" transform="rotate(${a} ${x} ${y})"/>`).join('')}`,
    rainbow:`${W}"#E6F6FF"/>${['#F87171','#FDBA74','#FDE047','#86EFAC','#7DD3FC','#A78BFA'].map((s,i)=>{ const r=56-i*5; return `<path d="M${60-r} 88 A${r} ${r} 0 0 1 ${60+r} 88" stroke="${s}" stroke-width="5" fill="none"/>`; }).join('')}${ST([[4,88],[12,84],[20,90],[100,90],[108,84],[116,88]],7,'#fff')}`}[eq.bg]||''; const bgR=rcol('bg',bg);
  const capeC={cape:['#7C3AED','#6D28D9'],capered:['#E5484D','#C9303A'],capeblue:['#2563EB','#1D4ED8']}[eq.outfit];
  const back=rcol('outfit',(capeC?`<path d="M34 78 L22 112 H98 L86 78 Z" fill="${capeC[0]}"/><path d="M34 78 L28 112 H40 Z" fill="${capeC[1]}"/>`:'')
    +(eq.outfit==='backpack'?`<rect x="21" y="64" width="78" height="38" rx="13" fill="#F97316"/><rect x="18" y="80" width="10" height="16" rx="4" fill="#EA580C"/><rect x="92" y="80" width="10" height="16" rx="4" fill="#EA580C"/>`:''))
    +({cat:`<path d="M31 64 L33 28 L58 48Z M89 64 L87 28 L62 48Z" fill="${c}" stroke="#00000022" stroke-width="1.5" stroke-linejoin="round"/><path d="M36 50 L37 36 L48 45Z M84 50 L83 36 L72 45Z" fill="#FF8FA3" opacity=".7"/>`,
      bunny:`<ellipse cx="46" cy="30" rx="7.5" ry="21" transform="rotate(-10 46 30)" fill="${c}" stroke="#00000022" stroke-width="1.5"/><ellipse cx="74" cy="30" rx="7.5" ry="21" transform="rotate(10 74 30)" fill="${c}" stroke="#00000022" stroke-width="1.5"/><ellipse cx="46" cy="28" rx="3.4" ry="14" transform="rotate(-10 46 28)" fill="#FF8FA3" opacity=".7"/><ellipse cx="74" cy="28" rx="3.4" ry="14" transform="rotate(10 74 28)" fill="#FF8FA3" opacity=".7"/>`}[eq.hat]||'');
  const body=`<ellipse cx="45" cy="104" rx="9" ry="5" fill="${c}" stroke="#00000022"/><ellipse cx="75" cy="104" rx="9" ry="5" fill="${c}" stroke="#00000022"/>
    <ellipse cx="60" cy="74" rx="34" ry="31" fill="${c}"/><ellipse cx="60" cy="82" rx="34" ry="23" fill="#00000010"/><ellipse cx="60" cy="72" rx="31" ry="27" fill="${c}"/>
    <ellipse cx="50" cy="56" rx="9" ry="5" fill="#ffffff55"/>`;
  const outfit={scarf:`<path d="M30 88 Q60 100 90 88 L90 96 Q60 108 30 96 Z" fill="#E5484D"/><rect x="70" y="94" width="9" height="14" rx="3" fill="#C9303A"/>`,
    bow:`<path d="M60 92 L47 85 L47 99 Z M60 92 L73 85 L73 99 Z" fill="#2563EB"/><circle cx="60" cy="92" r="3.6" fill="#1D4ED8"/>`,cape:`<path d="M40 86 Q60 94 80 86" stroke="#6D28D9" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    capered:`<path d="M40 86 Q60 94 80 86" stroke="#C9303A" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="60" cy="90" r="3.4" fill="#FACC15"/>`,
    capeblue:`<path d="M40 86 Q60 94 80 86" stroke="#1D4ED8" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="60" cy="90" r="3.4" fill="#FACC15"/>`,
    tie:`<path d="M49 86 L60 89 L54 95Z M71 86 L60 89 L66 95Z" fill="#fff" stroke="#C8CDD6" stroke-linejoin="round"/><path d="M57 89 H63 L62 93 H58Z" fill="#B91C1C"/><path d="M58 93 H62 L65 103 L60 107 L55 103Z" fill="#E5484D"/>`,
    medal:`<path d="M47 84 H53 L60 94 L67 84 H73 L63 98 H57Z" fill="#3B82F6"/><path d="M53 84 L60 94 L67 84" stroke="#E5484D" stroke-width="2" fill="none"/><circle cx="60" cy="98" r="6.5" fill="#FFC83D" stroke="#C99700" stroke-width="1.5"/>${star(60,98.4,.42,'#FFF3C4','#C99700')}`,
    necklace:[0,1,2,3,4,5,6,7,8,9,10].filter(i=>i!==5).map(i=>{ const t=i/10, x=40*(1-t)**2+120*t*(1-t)+80*t*t, y=86*(1-t)**2+208*t*(1-t)+86*t*t; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.1" fill="#fff" stroke="#B9C0CC" stroke-width=".8"/>`; }).join('')+heart(60,97,.42,'#F472B6','#DB2777',1)};
  const outfitC={hoodie:`<path d="M20 84 Q60 94 100 84 V120 H20Z" fill="#64748B"/><path d="M40 84 Q60 98 80 84" stroke="#475569" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M54 92 V104 M66 92 V104" stroke="#F1F5F9" stroke-width="1.8" stroke-linecap="round"/><rect x="46" y="106" width="28" height="10" rx="4" fill="#475569"/>`,
    suspend:`<rect x="20" y="93" width="80" height="22" fill="#3B82F6"/><path d="M20 93 H100" stroke="#2563EB" stroke-width="2"/><rect x="43" y="84" width="6" height="11" fill="#3B82F6"/><rect x="71" y="84" width="6" height="11" fill="#3B82F6"/><circle cx="46" cy="90" r="2" fill="#FACC15"/><circle cx="74" cy="90" r="2" fill="#FACC15"/>`,
    apron:`<path d="M30 89 Q36 91 42 89 M78 89 Q84 91 90 89" stroke="#F9A8D4" stroke-width="2" fill="none"/><path d="M42 87 H78 V104 Q60 110 42 104Z" fill="#fff" stroke="#F9A8D4" stroke-width="2"/><rect x="53" y="94" width="14" height="7" rx="2" fill="none" stroke="#F9A8D4" stroke-width="1.6"/>`,
    vest:`<path d="M20 83 Q40 90 51 86 L57 106 V120 H20Z M100 83 Q80 90 69 86 L63 106 V120 H100Z" fill="#B7791F"/><path d="M51 86 L57 106 M69 86 L63 106" stroke="#975A16" stroke-width="1.6"/><circle cx="53" cy="96" r="1.6" fill="#7B4A12"/><circle cx="67" cy="96" r="1.6" fill="#7B4A12"/>`,
    sport:`<path d="M20 86 Q60 95 100 86 V120 H20Z" fill="#2563EB"/><path d="M40 92 V120 M43.5 92 V120 M76.5 92 V120 M80 92 V120" stroke="#fff" stroke-width="2"/><path d="M60 92 V120" stroke="#1E3A8A" stroke-width="1.6"/><path d="M51 89.5 L60 95 L69 89.5" stroke="#fff" stroke-width="2.2" fill="none" stroke-linejoin="round"/>`,
    hanbok:`<path d="M20 84 Q60 93 100 84 V120 H20Z" fill="#F9A8D4"/><path d="M45 86 L62 102" stroke="#3B4A8C" stroke-width="6" stroke-linecap="round"/><path d="M46 84.6 L61 98.6" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M77 86 L62 100" stroke="#F472B6" stroke-width="2"/><path d="M62 99 Q71 102 70 116 M62 99 Q57 107 60 117" stroke="#E5484D" stroke-width="3.4" fill="none" stroke-linecap="round"/><circle cx="62" cy="99" r="3" fill="#C9303A"/><path d="M20 98 H34 M20 103 H34" stroke="#FDE047" stroke-width="3"/><path d="M100 98 H86 M100 103 H86" stroke="#86EFAC" stroke-width="3"/>`,
    backpack:`<path d="M37 82 Q39 94 44 106 M83 82 Q81 94 76 106" stroke="#EA580C" stroke-width="5" fill="none"/><path d="M40 94 H80" stroke="#C2410C" stroke-width="2.4"/><rect x="56" y="91" width="8" height="6" rx="1.5" fill="#FDBA74"/>`,
    lifevest:`<path d="M20 83 Q38 90 50 86 L53 120 H20Z M100 83 Q82 90 70 86 L67 120 H100Z" fill="#F97316"/><path d="M20 96 H52 M68 96 H100" stroke="#F3F4F6" stroke-width="3.4"/><path d="M51 92 H69" stroke="#1F2328" stroke-width="3"/><rect x="57" y="89" width="6" height="6" rx="1" fill="#9CA3AF"/>`}[eq.outfit];
  const hold={pencil:`<g transform="translate(95 90) rotate(20)"><rect x="-3.5" y="-30" width="7" height="34" fill="#FACC15"/><path d="M0 -30 V4" stroke="#EAB308" stroke-width="1.2"/><rect x="-3.5" y="4" width="7" height="6" rx="1.5" fill="#F9A8D4"/><rect x="-3.5" y="3" width="7" height="2.4" fill="#CBD5E1"/><path d="M-3.5 -30 L3.5 -30 L0 -40Z" fill="#F5D7A1"/><path d="M-1.2 -36.6 L1.2 -36.6 L0 -40Z" fill="#2B2F36"/></g>`,
    book:`<g transform="translate(99 79) rotate(-8)"><rect x="-10" y="-13" width="20" height="26" rx="2" fill="#2563EB"/><rect x="-10" y="-13" width="4" height="26" rx="1.5" fill="#1D4ED8"/><rect x="8" y="-11" width="2.2" height="22" fill="#fff"/>${star(2,-1,.5,'#FDE68A','#EAB308')}</g>`,
    lolli:`<path d="M93 88 L100 62" stroke="#D6D3D1" stroke-width="3" stroke-linecap="round"/><circle cx="101" cy="54" r="11" fill="#F472B6"/><path d="M101 54 m-7 0 a7 7 0 1 1 7 7 a5 5 0 1 1 -5 -5 a3 3 0 1 1 3 3" stroke="#fff" stroke-width="2" fill="none"/>`,
    flower:`<path d="M93 88 Q98 72 100 58" stroke="#3E9B5B" stroke-width="2.5" fill="none"/><ellipse cx="102" cy="72" rx="5" ry="2.4" transform="rotate(-30 102 72)" fill="#5BC27A"/>${flw(100,52,'#F472B6',4.6)}`,
    balloon:`<path d="M93 88 Q100 72 102 56" stroke="#6B7280" stroke-width="1.3" fill="none"/><ellipse cx="102" cy="42" rx="11" ry="13" fill="#F87171"/><path d="M99.5 56 H104.5 L102 53Z" fill="#E5484D"/><ellipse cx="98" cy="37" rx="3" ry="4.5" fill="#fff" opacity=".6"/>`,
    icecream:`<g transform="translate(96 90) rotate(15)"><path d="M-7 -22 H7 L0 0Z" fill="#E8B26A"/><path d="M-4 -16 L3 -9 M2 -20 L-3 -15 M4 -15 L-1 -7" stroke="#C98B3E" stroke-width="1"/><circle cx="0" cy="-27" r="8" fill="#F9A8D4"/><circle cx="0" cy="-35" r="6.5" fill="#FEF3C7"/><circle cx="1" cy="-42" r="2.6" fill="#E5484D"/></g>`,
    flag:`<path d="M95 98 V38" stroke="#8B5E3C" stroke-width="2.4" stroke-linecap="round"/><path d="M96 40 Q104 36 112 41 Q110 47 112 54 Q104 49 96 53Z" fill="#22C55E"/><circle cx="95" cy="37" r="2.2" fill="#FACC15"/>`,
    umbrella:`<path d="M96 36 V92 q0 4 -4 4" stroke="#4B5563" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M80 52 A16 15 0 0 1 112 52 Q108 48 104 52 Q100 48 96 52 Q92 48 88 52 Q84 48 80 52Z" fill="#38BDF8"/><path d="M96 37 Q90 42 88 52 M96 37 Q102 42 104 52" stroke="#0EA5E9" stroke-width="1.2" fill="none"/>`,
    ball:`<circle cx="102" cy="90" r="9.6" fill="#fff" stroke="#3B3F46" stroke-width="1.6"/><path d="M102 86.5 L105.8 89.3 L104.4 93.7 L99.6 93.7 L98.2 89.3Z" fill="#2B2F36"/><path d="M102 86.5 V81.5 M105.8 89.3 L110.5 88 M104.4 93.7 L107 98 M99.6 93.7 L97 98 M98.2 89.3 L93.5 88" stroke="#3B3F46" stroke-width="1.2"/>`,
    magnifier:`<path d="M93 90 L101 79" stroke="#8B5E3C" stroke-width="4" stroke-linecap="round"/><circle cx="106" cy="71" r="9" fill="#BAE6FD" fill-opacity=".6" stroke="#6B7280" stroke-width="3"/><path d="M101 68 Q103 65 106 65" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
    globe:`<path d="M103 82 V88" stroke="#8B5E3C" stroke-width="3"/><ellipse cx="103" cy="89" rx="8" ry="2.6" fill="#8B5E3C"/><circle cx="103" cy="70" r="11" fill="#60A5FA"/><path d="M97 64 q4 -3 7 1 q-1 4 -5 4 q-3 0 -2 -5Z M104 74 q5 -2 7 2 q-2 5 -6 4Z M95 73 q3 0 3 3 q-2 1 -3 -3Z" fill="#4ADE80"/><path d="M90 66 A13.5 13.5 0 0 0 109 82" stroke="#9CA3AF" stroke-width="2" fill="none"/>`,
    wand:`<path d="M93 88 L103 62" stroke="#3B3F46" stroke-width="3" stroke-linecap="round"/>${star(105,55,.85,'#FDE68A','#EAB308')}${spk(114,44,3.5)}${spk(94,46,2.8,'#F9A8D4')}${spk(114,66,2.6,'#A5F3FC')}`,
    kite:`<path d="M93 88 Q96 70 104 54" stroke="#6B7280" stroke-width="1.2" fill="none"/><path d="M106 26 L118 42 L106 58 L94 42Z" fill="#EF4444"/><path d="M106 26 V58 M94 42 H118" stroke="#B91C1C" stroke-width="1.4"/><path d="M106 58 q-3 5 0 9 q3 5 0 9" stroke="#B91C1C" stroke-width="1.4" fill="none"/>`,
    trophy:`<path d="M94 65 Q88 65 89 71 Q90 76 96 75 M112 65 Q118 65 117 71 Q116 76 110 75" stroke="#C99700" stroke-width="2" fill="none"/><path d="M94 62 H112 V68 Q112 80 103 82 Q94 80 94 68Z" fill="#FFC83D" stroke="#C99700" stroke-width="1.5"/><rect x="101" y="82" width="4" height="6" fill="#C99700"/><rect x="96" y="88" width="14" height="5" rx="1.5" fill="#8B5E3C"/>${star(103,70,.45,'#FFF3C4','#C99700')}`}[eq.hold]||'';
  const hand=hold?`<ellipse cx="92" cy="88" rx="5.5" ry="4.5" fill="${c}" stroke="#00000026"/>`:'';
  const eyes=`<circle cx="49" cy="72" r="4" fill="#2B2F36"/><circle cx="71" cy="72" r="4" fill="#2B2F36"/><circle cx="50.3" cy="70.6" r="1.3" fill="#fff"/><circle cx="72.3" cy="70.6" r="1.3" fill="#fff"/>
    <ellipse cx="41" cy="80" rx="5" ry="3" fill="#FF8FA3" opacity=".55"/><ellipse cx="79" cy="80" rx="5" ry="3" fill="#FF8FA3" opacity=".55"/><path d="M55 81 Q60 86 65 81" stroke="#2B2F36" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  const cheek=f=>`<ellipse cx="41" cy="80" rx="6" ry="4" fill="${c}"/><ellipse cx="79" cy="80" rx="6" ry="4" fill="${c}"/>`+f;
  const face={glasses:`<circle cx="49" cy="72" r="8.5" fill="none" stroke="#3B3F46" stroke-width="2.4"/><circle cx="71" cy="72" r="8.5" fill="none" stroke="#3B3F46" stroke-width="2.4"/><path d="M57.5 72 H62.5" stroke="#3B3F46" stroke-width="2.4"/>`,
    sun:`<rect x="39" y="65" width="19" height="13" rx="5" fill="#1F2328"/><rect x="62" y="65" width="19" height="13" rx="5" fill="#1F2328"/><path d="M58 70 H62" stroke="#1F2328" stroke-width="2.6"/><path d="M42 68 L47 68" stroke="#ffffff66" stroke-width="2" stroke-linecap="round"/>`,
    star:star(49,72)+star(71,72),
    hglass:heart(49,72.5,1.05,'#F472B655','#DB2777',2.2)+heart(71,72.5,1.05,'#F472B655','#DB2777',2.2)+`<path d="M58 69 Q60 67.5 62 69" stroke="#DB2777" stroke-width="2" fill="none"/>`,
    goggle:`<path d="M26 70 H94" stroke="#2563EB" stroke-width="5"/><rect x="39" y="63.5" width="20" height="17" rx="7.5" fill="#7DD3FC66" stroke="#1E40AF" stroke-width="2.8"/><rect x="61" y="63.5" width="20" height="17" rx="7.5" fill="#7DD3FC66" stroke="#1E40AF" stroke-width="2.8"/><path d="M42 67 L46 67" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><path d="M64 67 L68 67" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>`,
    hsticker:cheek(heart(41,80,.5,'#F43F5E')+heart(79,80,.5,'#F43F5E')),
    freckle:ST([[37,78],[41,80.5],[44,77.5],[39,83],[76,77.5],[79,80.5],[83,78],[81,83]],1.1,'#B7795A'),
    mustache:`<path d="M60 78.5 Q55 74 49 77 Q45 79.5 41.5 76 Q43 82.5 50 81.5 Q56 81 60 79.5 Q64 81 70 81.5 Q77 82.5 78.5 76 Q75 79.5 71 77 Q65 74 60 78.5Z" fill="#5B3A29"/>`,
    wink:`<circle cx="71" cy="72" r="5.6" fill="${c}"/><path d="M65.5 73 Q71 66.5 76.5 73" stroke="#2B2F36" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
    sparkle:`<circle cx="49" cy="72" r="5.6" fill="#2B2F36"/><circle cx="71" cy="72" r="5.6" fill="#2B2F36"/><circle cx="50.8" cy="70" r="2.1" fill="#fff"/><circle cx="72.8" cy="70" r="2.1" fill="#fff"/><circle cx="47.4" cy="74.2" r="1" fill="#fff"/><circle cx="69.4" cy="74.2" r="1" fill="#fff"/>${spk(36,62,5,'#FFB020')}${spk(85,61,4,'#FFB020')}${spk(31,71,2.6,'#FFB020')}`,
    patch:`<path d="M28 59.5 L92 74.5" stroke="#1F2328" stroke-width="2.2"/><ellipse cx="71" cy="72" rx="7.5" ry="7" fill="#1F2328"/>`,
    monocle:`<circle cx="71" cy="72" r="9" fill="#ffffff40" stroke="#C99700" stroke-width="2.6"/><path d="M79 76 Q85 88 79 99" stroke="#C99700" stroke-width="1.4" fill="none"/>`,
    mask:`<path d="M36 66 Q48 60 58 68 Q60 70 62 68 Q72 60 84 66 Q86 76 76 80 Q66 82 62 74 Q60 72 58 74 Q54 82 44 80 Q34 76 36 66Z" fill="#F472B6" stroke="#DB2777" stroke-width="1.6"/><ellipse cx="49" cy="71" rx="5" ry="3.6" fill="#2B2F36"/><ellipse cx="71" cy="71" rx="5" ry="3.6" fill="#2B2F36"/>${spk(86,62,3.2,'#FDE047')}`,
    starblush:cheek(star(41,80,.48,'#FF8FA3','#F06A85')+star(79,80,.48,'#FF8FA3','#F06A85'))}[eq.face]||'';
  const hat={sprout:`<path d="M60 47 V36" stroke="#3E9B5B" stroke-width="3" stroke-linecap="round"/><path d="M60 38 Q48 26 40 34 Q50 44 60 38Z" fill="#5BC27A"/><path d="M60 36 Q72 22 82 30 Q71 42 60 36Z" fill="#6FD68C"/>`,
    cap:`<path d="M30 56 Q30 30 60 30 Q90 30 90 56 Z" fill="#E5484D"/><path d="M84 54 Q104 52 106 60 Q94 62 82 59Z" fill="#C9303A"/><circle cx="60" cy="31" r="3" fill="#C9303A"/>`,
    ribbon:`<path d="M78 46 L64 36 L66 54 Z M78 46 L94 38 L90 56 Z" fill="#F472B6"/><circle cx="78" cy="46" r="5" fill="#DB2777"/>`,
    beanie:`<path d="M29 58 Q29 26 60 26 Q91 26 91 58 Z" fill="#0EA5E9"/><rect x="27" y="52" width="66" height="10" rx="5" fill="#0369A1"/><circle cx="60" cy="24" r="7" fill="#fff"/>`,
    wizard:`<path d="M60 4 L86 52 H34 Z" fill="#4338CA"/><rect x="28" y="49" width="64" height="8" rx="4" fill="#3730A3"/>${star(58,30).replace(/fill="#FFD34D"/,'fill="#FDE68A"')}`,
    crown:`<path d="M36 52 L38 26 L50 40 L60 22 L70 40 L82 26 L84 52 Z" fill="#FFC83D" stroke="#C99700" stroke-width="2" stroke-linejoin="round"/><circle cx="60" cy="42" r="3.4" fill="#E5484D"/><circle cx="46" cy="45" r="2.6" fill="#2563EB"/><circle cx="74" cy="45" r="2.6" fill="#0FA37F"/>`,
    headband:`<path d="M33.2 60 A31 28 0 0 1 86.8 60" stroke="#F472B6" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M78 51 L70 45 L71 56Z M78 51 L87 46 L85 57Z" fill="#F472B6"/><circle cx="78" cy="51" r="3.2" fill="#DB2777"/>`,
    starpin:star(80,51,.8)+star(67,46,.55,'#F9A8D4','#DB2777'),
    flowers:`<path d="M33.2 60 A31 28 0 0 1 86.8 60" stroke="#4CAF50" stroke-width="3" fill="none"/>${[[33,60,'#F472B6'],[39,51.5,'#FDE047'],[48.5,46.3,'#FB923C'],[60,44.5,'#F472B6'],[71.5,46.3,'#A78BFA'],[81,51.5,'#FDE047'],[87,60,'#FB923C']].map(([x,y,f])=>flw(x,y,f,3.2)).join('')}`,
    helmet:`<path d="M27 62 Q26 26 60 26 Q94 26 93 62 Q60 52 27 62Z" fill="#22C55E"/><path d="M27 62 Q60 52 93 62" stroke="#15803D" stroke-width="3" fill="none"/><path d="M47 31 Q45 40 46 50 M60 28 V49 M73 31 Q75 40 74 50" stroke="#15803D" stroke-width="3.5" stroke-linecap="round" fill="none"/><path d="M38 40 Q50 34 52 30" stroke="#ffffff66" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
    chef:`<circle cx="44" cy="34" r="10" fill="#fff" stroke="#D5D9E0" stroke-width="1.5"/><circle cx="76" cy="34" r="10" fill="#fff" stroke="#D5D9E0" stroke-width="1.5"/><circle cx="60" cy="26" r="13" fill="#fff" stroke="#D5D9E0" stroke-width="1.5"/><rect x="40" y="30" width="40" height="16" fill="#fff"/><rect x="38" y="44" width="44" height="12" rx="3" fill="#fff" stroke="#D5D9E0" stroke-width="1.5"/>`,
    explorer:`<ellipse cx="60" cy="53" rx="38" ry="7" fill="#B8935A"/><path d="M36 53 Q36 26 60 26 Q84 26 84 53Z" fill="#D4B483"/><rect x="37" y="44" width="46" height="5" fill="#7C5A2E"/>`,
    mushroom:`<path d="M20 60 Q18 20 60 20 Q102 20 100 60 Q60 50 20 60Z" fill="#EF4444"/><path d="M24 58 Q60 50 96 58" stroke="#FDE7C7" stroke-width="2.4" fill="none"/>${ST([[44,33],[69,28],[83,44],[32,48],[58,43]],i=>[6,4.5,5,3.5,3.5][i],'#fff')}`,
    pirate:`<path d="M24 58 Q26 36 44 34 Q60 22 76 34 Q94 36 96 58 Q60 48 24 58Z" fill="#2B2F36"/><path d="M27 54 Q60 45 93 54" stroke="#E0B341" stroke-width="2.4" fill="none"/><circle cx="60" cy="37" r="4.5" fill="#fff"/><path d="M55 44 L65 48 M65 44 L55 48" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`,
    santa:`<path d="M30 54 Q40 18 80 20 Q100 24 98 46 Q90 32 78 34 Q88 44 90 54Z" fill="#E5484D"/><rect x="27" y="50" width="66" height="11" rx="5.5" fill="#fff" stroke="#E2E4E9"/><circle cx="98" cy="47" r="6.5" fill="#fff" stroke="#E2E4E9"/>`,
    party:`<path d="M60 8 L78 50 H42Z" fill="#8B5CF6"/><path d="M51 30 L69 30 M47 40 L73 40" stroke="#FDE047" stroke-width="3"/><path d="M42 50 H78" stroke="#6D28D9" stroke-width="3" stroke-linecap="round"/><circle cx="60" cy="8" r="5" fill="#FDE047"/>`,
    phones:`<path d="M30 66 Q30 30 60 30 Q90 30 90 66" stroke="#1D4ED8" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="21" y="58" width="13" height="20" rx="6" fill="#2563EB"/><rect x="86" y="58" width="13" height="20" rx="6" fill="#2563EB"/><rect x="25" y="62" width="5" height="12" rx="2.5" fill="#1D4ED8"/><rect x="90" y="62" width="5" height="12" rx="2.5" fill="#1D4ED8"/>`,
    bucket:`<path d="M38 50 Q40 28 60 28 Q80 28 82 50Z" fill="#F59E0B"/><path d="M26 56 Q60 42 94 56 Q90 62 60 54 Q30 62 26 56Z" fill="#D97706"/><path d="M39 46 H81" stroke="#D97706" stroke-width="2" stroke-dasharray="3 2"/>`,
    gradcap:`<path d="M38 38 V52 Q60 60 82 52 V38Z" fill="#2B2F36"/><path d="M60 22 L98 34 L60 46 L22 34Z" fill="#1F2328"/><circle cx="60" cy="34" r="2.4" fill="#FACC15"/><path d="M60 34 L90 40 V54" stroke="#FACC15" stroke-width="2" fill="none"/><rect x="87.5" y="52" width="5" height="9" rx="2" fill="#FACC15"/>`}[eq.hat]||'';
  return `<svg class="av" width="${size}" height="${size}" viewBox="0 0 120 120" role="img" aria-label="내 캐릭터 하루"><defs><clipPath id="c${k}"><circle cx="60" cy="60" r="60"/></clipPath>${outfitC?`<clipPath id="b${k}"><ellipse cx="60" cy="74" rx="34" ry="31"/></clipPath>`:''}${rbDef}</defs><g clip-path="url(#c${k})">${bgR}${back}${body}${rcol('outfit',outfit[eq.outfit]||'')}${outfitC?`<g clip-path="url(#b${k})">${rcol('outfit',outfitC)}</g>`:''}${rcol('hold',hold)}${hand}${eyes}${rcol('face',face)}${rcol('hat',hat)}</g></svg>`;
}
const gradeChip=x=>{ const g=HG.GRADES[HG.gradeOf(x)]; return `<span class="grade">${LI(g.ic)}${g.n}</span>`; };
const myName=()=>S().name||'나';
const sfx=k=>{ try{ env.hgSfx&&env.hgSfx(k); }catch(e){} };

/* ---------- 친구(예시) ---------- */
const FRIENDS=[
 {id:'f1',name:'별빛토끼',eq:{body:'peach',hat:'ribbon',face:'basic',outfit:'none',bg:'sunset'},skill:.86,spd:[2.2,5.5],seed:41},
 {id:'f2',name:'구구단마스터',eq:{body:'sky',hat:'cap',face:'glasses',outfit:'bow',bg:'dots'},skill:.9,spd:[1.8,4.5],seed:73},
 {id:'f3',name:'한자왕콩이',eq:{body:'mint',hat:'beanie',face:'basic',outfit:'scarf',bg:'none'},skill:.78,spd:[2.6,6],seed:19},
 {id:'f4',name:'영어고래',eq:{body:'lav',hat:'sprout',face:'sun',outfit:'none',bg:'dots'},skill:.72,spd:[3,6.5],seed:58},
 {id:'f5',name:'역사탐험가',eq:{body:'cream',hat:'wizard',face:'basic',outfit:'cape',bg:'night'},skill:.82,spd:[2.4,6],seed:90},
 {id:'f6',name:'맞춤법요정',eq:{body:'peach',hat:'sprout',face:'glasses',outfit:'scarf',bg:'none'},skill:.66,spd:[3.2,7],seed:27},
 {id:'f7',name:'키보드고양이',eq:{body:'cream',hat:'sprout',face:'sun',outfit:'bow',bg:'dots'},skill:.8,spd:[2.4,5.8],seed:64},
 {id:'f8',name:'초록거북',eq:{body:'mint',hat:'cap',face:'basic',outfit:'none',bg:'none'},skill:.62,spd:[3.4,7.5],seed:35},
 {id:'f9',name:'하늘다람쥐',eq:{body:'sky',hat:'beanie',face:'basic',outfit:'scarf',bg:'sunset'},skill:.76,spd:[2.6,6.2],seed:52},
 {id:'f10',name:'달빛여우',eq:{body:'peach',hat:'ribbon',face:'glasses',outfit:'none',bg:'night'},skill:.88,spd:[2,5],seed:81}
];
const SUBJ={mix:['종합','#DB2777'],math:['연산','#22A55B'],gugu:['구구단','#22A55B'],hanja:['한자','#C2410C'],eng:['영단어','#7C3AED'],hist:['역사','#8B5A2B'],kor:['국어','#0B8A5F'],sci:['과학','#4F46E5'],spell:['맞춤법','#0B8A5F'],tko:['한글 타자','#2563EB'],ten:['영문 타자','#2563EB']};
const SNAME={math:'연산',hanja:'한자',eng:'영단어',hist:'역사',kor:'국어',sci:'과학',typ:'타자'};
const SCOL={math:'#22A55B',hanja:'#C2410C',eng:'#7C3AED',hist:'#8B5A2B',kor:'#0B8A5F',sci:'#4F46E5',typ:'#2563EB'};
const QUICK=['안녕! 👋','잘 부탁해 🙂','준비됐어 ✋','잘하자 💪','좋아! 👍','와 빠르다 ⚡','아깝다 😅','한 판 더? 🔁','수고했어 👏','고마워 😊'];
const BOT_SAY={join:['안녕! 👋','잘 부탁해 🙂','준비됐어 ✋'],good:['좋아! 👍','와 빠르다 ⚡'],end:['수고했어 👏','한 판 더? 🔁','아깝다 😅']};

/* ---------- 문제 (게임용: 기초 위주, 4지선다) ---------- */
/* 구구단: 단 고르기(0=전체), 기본 60% · 빈칸 25% · 거꾸로(나눗셈) 15%, 오답 보기는 옆 단·옆 수의 답 */
const DANS=[[0,'전체'],[2,'2단'],[3,'3단'],[4,'4단'],[5,'5단'],[6,'6단'],[7,'7단'],[8,'8단'],[9,'9단']];
const danName=d=>d?`${d}단`:'전체';
function guguQ(dan){
  const a=dan||R(2,9), b=R(1,9), t=Math.random(), key=`${a}×${b}`;
  if(t<.6){ const ans=a*b, set=new Set([ans]); shuffle([(a+1)*b,(a-1)*b,a*(b+1),a*(b-1),ans+1,ans-1,ans+10,ans-10]).forEach(v=>{ if(set.size<4&&v>0) set.add(v); });
    return {q:`${a} × ${b}`,ans:String(ans),c:shuffle([...set].map(String)),kind:'num',hint:`${a}단`,key}; }
  const set=new Set([b]); shuffle([b+1,b-1,b+2,b-2,b+3]).forEach(v=>{ if(set.size<4&&v>0&&v<=12) set.add(v); });
  const c=shuffle([...set].map(String));
  if(t<.85) return {q:`${a} × □ = ${a*b}`,ans:String(b),c,kind:'num',hint:'□에 들어갈 수는?',key};
  return {q:`${a*b} ÷ ${a}`,ans:String(b),c,kind:'num',hint:'구구단 거꾸로',key};
}
function missAdd(c){ if(!c||!c.key) return; const st=S(); st.guMiss=st.guMiss||{}; st.guMiss[c.key]=(st.guMiss[c.key]||0)+1; }
const bestKey=(sub,dan)=>sub==='gugu'?'gugu'+(dan||0):sub;
/* 종합: 타자를 뺀 과목을 골고루(주머니에서 하나씩 꺼내듯 섞어서) */
const MIX_SUBS=['math','gugu','hanja','eng','hist','kor','sci','spell']; let mixBag=[];
function mixQ(){ if(!mixBag.length) mixBag=shuffle([...MIX_SUBS]); const k=mixBag.pop(); const q=genQ(k,0); q.hint=`${SUBJ[k][0]} · ${q.hint}`; q.from=k; delete q.key; return q; }
/* ---------- 게임 수준(초1~고3) — scripts/play-app.mjs가 genQ 앞에 끼워 넣는다 (사용자 요청) ----------
   한자·영단어·과학·역사·국어는 play-lv.json(학년별 문제 묶음, env.lv)에서 뽑고, 연산은 학년에 맞게 새로 만든다.
   스피드 게임은 내가 고른 수준, 대결방은 방장이 고른 수준(LVNOW)을 쓴다 */
const LVG=['초1','초2','초3','초4','초5','초6','중1','중2','중3','고1','고2','고3'];
let LVNOW=null;
const gLv=()=>{ const st=S(); if(typeof st.gLv==='number') return st.gLv; const i=LVG.indexOf(env.grade); return i<0?2:i; };
const curLv=()=>LVNOW!=null?LVNOW:gLv();
const lvPool=k=>{ const P=env.lv&&env.lv[k]; if(!P) return null; const ids=P.g[curLv()]; return ids&&ids.length>=8?ids.map(i=>P.it[i]):null; };
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
function numQ(q,a,hint){ const set=new Set([a]); shuffle([a+1,a-1,a+2,a-2,a+10,a-10,a*2,a+3,a-3,-a]).forEach(v=>{ if(set.size<4&&Number.isFinite(v)&&(a<0||v>=0)) set.add(v); });
  return {q,ans:String(a),c:shuffle([...set].map(String)),kind:'num',hint:hint||'계산해요'}; }
function strQ(q,a,wrong,hint){ const set=new Set([a]); shuffle(wrong).forEach(v=>{ if(set.size<4&&v!==a) set.add(v); }); return {q,ans:a,c:shuffle([...set]),kind:'num',hint:hint||'계산해요'}; }
function mathLv(g){
  const t=R(0,2);
  if(g===0){ if(t){ const x=R(1,9),y=R(1,9); return numQ(`${x} + ${y}`,x+y); } const x=R(5,18),y=R(1,Math.min(9,x)); return numQ(`${x} − ${y}`,x-y); }
  if(g===1){ if(t===0){ const x=R(2,9),y=R(2,9); return numQ(`${x} × ${y}`,x*y); } if(t===1){ const x=R(11,89),y=R(11,99-x); return numQ(`${x} + ${y}`,x+y); } const x=R(30,99),y=R(11,x-1); return numQ(`${x} − ${y}`,x-y); }
  if(g===2){ if(t===0){ const x=R(100,599),y=R(100,399); return numQ(`${x} + ${y}`,x+y); } if(t===1){ const x=R(12,49),y=R(2,9); return numQ(`${x} × ${y}`,x*y); } const y=R(2,9),z=R(3,12); return numQ(`${y*z} ÷ ${y}`,z); }
  if(g===3){ if(t===0){ const x=R(21,99),y=R(11,29); return numQ(`${x} × ${y}`,x*y); } if(t===1){ const y=R(3,9),z=R(21,99); return numQ(`${y*z} ÷ ${y}`,z); } const d=R(5,12),a=R(1,d-2),b=R(1,d-1-a); return strQ(`${a}/${d} + ${b}/${d}`,`${a+b}/${d}`,[`${a+b}/${d*2}`,`${a+b+1}/${d}`,`${Math.abs(a+b-1)}/${d}`,`${a*b}/${d}`],'분수 계산'); }
  if(g===4){ if(t===0){ const x=R(12,48),y=R(12,48),k=R(2,6); return numQ(`${x*k}와 ${y*k}의 최대공약수`,gcd(x*k,y*k),'최대공약수'); } if(t===1){ const a=R(11,99)/10,b=R(11,99)/10; const s=Math.round((a+b)*10)/10; return strQ(`${a} + ${b}`,String(s),[String(Math.round((s+0.1)*10)/10),String(Math.round((s-0.1)*10)/10),String(Math.round((s+1)*10)/10)]); }
    const a=R(2,5),b=R(a+1,8); const n=a*b/gcd(a,b); return numQ(`${a}와 ${b}의 최소공배수`,n,'최소공배수'); }
  if(g===5){ if(t===0){ const p=pick([10,20,25,50]),y=pick([40,60,80,120,200]); return numQ(`${y}의 ${p}%`,y*p/100,'비율'); } if(t===1){ const a=R(2,9),b=R(a+1,12); return numQ(`${a}/${b} ÷ 1/${b}`,a,'분수의 나눗셈'); }
    const x=R(12,95)/10,y=R(2,9); return strQ(`${x} × ${y}`,String(Math.round(x*y*10)/10),[String(Math.round(x*y*10)/10+1),String(Math.round((x*y-0.1)*10)/10),String(Math.round(x*y*100)/10)]); }
  if(g===6){ if(t===0){ const a=R(-9,9),b=R(-9,-1),c=R(2,5); return numQ(`${a} + (${b}) × ${c}`,a+b*c,'정수 계산'); } const x=R(-6,9),k=R(2,7),m=R(-9,9); return numQ(`${k}x ${m<0?'−':'+'} ${Math.abs(m)} = ${k*x+m} 일 때 x`,x,'일차방정식'); }
  if(g===7){ if(t===0){ const a=R(2,3),m=R(2,5),n=R(1,3); return numQ(`${a}^${m} × ${a}^${n} = ${a}^□`,m+n,'지수법칙'); } const k=R(-4,5),b=R(-9,9),x=R(-5,6); return numQ(`y = ${k}x ${b<0?'−':'+'} ${Math.abs(b)} 에서 x = ${x} 일 때 y`,k*x+b,'일차함수'); }
  if(g===8){ if(t===0){ const n=R(4,20); return numQ(`√${n*n}`,n,'제곱근'); } const p=R(1,7),q=R(p+1,9); return numQ(`x² − ${p+q}x + ${p*q} = 0 의 작은 근`,p,'이차방정식'); }
  if(g===9){ if(t===0){ const p=R(-6,6),q=R(-6,6); return numQ(`x² ${-(p+q)<0?'−':'+'} ${Math.abs(p+q)}x ${p*q<0?'−':'+'} ${Math.abs(p*q)} = 0 의 두 근의 합`,p+q,'근과 계수'); } const a=R(1,4),b=R(-5,5),k=R(-3,3); return numQ(`f(x) = ${a}x² ${b<0?'−':'+'} ${Math.abs(b)}x + 1 일 때 f(${k})`,a*k*k+b*k+1,'다항식의 값'); }
  if(g===10){ if(t===0){ const b=pick([2,3]),n=R(2,b===2?7:4); return numQ(`log${b===2?'₂':'₃'} ${b**n}`,n,'로그'); } const a=R(1,9),d=R(2,6),n=R(5,12); return numQ(`첫째항 ${a}, 공차 ${d}인 등차수열의 제${n}항`,a+(n-1)*d,'등차수열'); }
  if(t===0){ const c=R(1,4),x=R(1,4); return numQ(`f(x) = ${c}x³ 일 때 f'(${x})`,3*c*x*x,'미분계수'); } const k=R(1,4),b=R(1,4); return numQ(`∫₀^${b} ${2*k}x dx`,k*b*b,'정적분');
}
function genQ(sub,dan){
  if(sub==='mix') return mixQ();
  if(sub==='tko'||sub==='ten'){ const w=pick(sub==='tko'?PD.tko:PD.ten); return {q:w,ans:w,c:[],kind:'type',hint:'똑같이 쳐요',lang:sub==='tko'?'ko':'en'}; }
  if(sub==='gugu') return guguQ(dan);
  if(sub==='hist'||sub==='kor'||sub==='sci'){ const P=lvPool(sub)||(sub==='hist'?PD.hist:sub==='sci'?PD.sci:PD.kor), x=pick(P), pool=P.filter(y=>y[2]===x[2]&&y[0]!==x[0]), set=new Set([x[0]]);
    shuffle(pool.length>=3?pool:P).forEach(y=>{ if(set.size<4&&y[0]!==x[0]) set.add(y[0]); });
    return {q:x[1],ans:x[0],c:shuffle([...set]),kind:'desc',hint:sub==='hist'?'설명에 맞는 것은?':sub==='sci'?'설명에 맞는 과학 용어는?':'뜻에 맞는 말은?'}; }
  if(sub==='math') return mathLv(curLv());
  if(sub==='math-old'){
    const t=R(0,4); let q,a;
    if(t===0){ const x=R(2,9),y=R(2,9); q=`${x} + ${y}`; a=x+y; }
    else if(t===1){ const x=R(11,18),y=R(2,9); q=`${x} − ${y}`; a=x-y; }
    else if(t===2){ const x=R(2,9),y=R(2,9); q=`${x} × ${y}`; a=x*y; }
    else if(t===3){ const y=R(2,9),z=R(2,9); q=`${y*z} ÷ ${y}`; a=z; }
    else { const x=R(11,79),y=R(2,9); if(Math.random()<.5){ q=`${x} + ${y}`; a=x+y; } else { q=`${x+y} − ${y}`; a=x; } }
    const set=new Set([a]); shuffle([a+1,a-1,a+2,a-2,a+10,a-10,a+3,a-3]).forEach(v=>{ if(set.size<4&&v>=0) set.add(v); });
    return {q,ans:String(a),c:shuffle([...set].map(String)),kind:'num',hint:'계산해요'};
  }
  if(sub==='hanja'){
    const HP=lvPool('han')||PD.han, x=pick(HP), ans=`${x[1]} ${x[2]}`, set=new Set([ans]);
    shuffle(HP).forEach(y=>{ if(set.size<4&&y[2]!==x[2]) set.add(`${y[1]} ${y[2]}`); });
    return {q:x[0],ans,c:shuffle([...set]),kind:'han',hint:'훈과 음은?'};
  }
  if(sub==='eng'){
    const EP=lvPool('eng')||PD.eng, x=pick(EP), set=new Set([x[1]]);
    shuffle(EP).forEach(y=>{ if(set.size<4&&y[1]!==x[1]) set.add(y[1]); });
    return {q:x[0],ans:x[1],c:shuffle([...set]),kind:'en',hint:'뜻은?'};
  }
  const x=pick(PD.sp);
  return {q:'바르게 쓴 것은?',ans:x[0],c:shuffle([x[0],...x[1].slice(0,3)]),kind:'long',hint:'맞춤법'};
}

/* ---------- 화면 틀 ---------- */
const screen=root.querySelector('#screen'), bar=root.querySelector('#bar'), tabsEl=root.querySelector('#tabs');
let tab='home', view=null, mySub='info';
bar.innerHTML='<div class="b1"></div><div class="b2" role="tablist"></div>';
const bar1=bar.querySelector('.b1'), bar2=bar.querySelector('.b2');
function setBar(title,back){
  bar1.innerHTML=`${back?`<button class="bb" id="bBack" aria-label="뒤로">${LI('arrow-left')}</button>`:''}<h1>${title}</h1>${back?'':`<button class="hb" id="hNoti" aria-label="알림">${LI('bell')}${HG.done()?'':'<i class="hdot"></i>'}</button><button class="hb" id="hMenu" aria-label="전체보기">${LI('menu')}</button>`}`;
  const hn=bar1.querySelector('#hNoti'), hm=bar1.querySelector('#hMenu');
  if(hn) hn.onclick=()=>{ try{ env.hgSheet('noti'); }catch(e){} };
  if(hm) hm.onclick=()=>{ try{ env.hgSheet('menu'); }catch(e){} };
  if(back){ bar1.querySelector('#bBack').onclick=back; bar2.hidden=true; }
}
/* ---------- 상단 탭(알약) + 하단 숫자 ---------- */
let FIL={game:'all'};
const nb=n=>n>0?`<em class="nb">${n>999?'999+':n}</em>`:'';
function myRank(mode){ const st=S(), wk=(st.wk||{})[HG.wkN(HG.dayN())]||0, me=mode==='week'?wk:mode==='total'?st.xp:mode==='typ'?(st.typCpm||0):(st.wins||0);
  return 1+FRIENDS.filter(f=>friendVal(f,mode)>me).length; }
function studyLeft(){ return HG.tasks().reduce((a,t)=>a+Math.max(0,t.goal-t.n),0)+HG.backTotal(); }
function navBadges(){ const study=studyLeft(), rank=myRank('week'); try{ if(env.hgNavBadge) env.hgNavBadge({study,rank}); }catch(e){} const set=(k,n)=>{ const b=tabsEl.querySelector(`[data-tab="${k}"]`); if(!b) return; b.querySelectorAll('.nb').forEach(x=>x.remove()); if(n>0) b.insertAdjacentHTML('beforeend',nb(n)); };
  set('study',study); set('rank',rank); }
function pillsFor(t){
  if(t==='home') return null;
  if(t==='game') return {cur:FIL.game,set:k=>FIL.game=k,list:[['all','전체'],['room','대결방'],['speed','스피드 게임'],['set','설정']]};
  if(t==='rank') return {cur:rankMode,set:k=>rankMode=k,list:[['week','이번 주',myRank('week')],['total','전체 등급',myRank('total')],['wins','대결 승리',myRank('wins')],['typ','타자 속도',myRank('typ')]],rank:true};
  if(t==='my') return {cur:mySub,set:k=>mySub=k,list:[['info','내 정보'],['stats','통계'],['shop','꾸미기'],['set','설정']]};
}
const GROUP={home:[['오늘 할 일','todo'],['밀린 공부','back'],['오늘 기록','rec'],['캐시','cash']],
  game:[['오늘 게임','*'],['대결방','room'],['스피드','speed'],['보호자','set']],
  my:[['통계','stats'],['계정','acct'],['소리','set'],['보호자','set'],['알림','set'],['쓰기','set'],['설정','set']]};
function deco(){
  navBadges(); if(view) return;
  const P=pillsFor(tab); bar2.hidden=false;
  if(!P){ bar2.innerHTML=''; screen.classList.remove('filtering'); screen.querySelectorAll('section.sec[hidden]').forEach(x=>x.hidden=false); return; }
  bar2.innerHTML=P.list.map(([k,l,n])=>`<button role="tab" data-pill="${k}" class="pill ${P.cur===k?'on':''}" aria-selected="${P.cur===k}">${l}${n>0?`<em>${n}${P.rank?'위':''}</em>`:''}</button>`).join('');
  bar2.querySelectorAll('[data-pill]').forEach(b=>b.onclick=()=>{ if(P.cur===b.dataset.pill) return; P.set(b.dataset.pill); render(); });
  const on=bar2.querySelector('.on'); if(on) on.scrollIntoView({block:'nearest',inline:'nearest'});
  const cur=tab==='game'?FIL[tab]:tab==='my'&&mySub!=='shop'?mySub:null;
  screen.classList.toggle('filtering',!!cur&&cur!=='all');
  if(!cur) return;
  screen.querySelectorAll('section.sec').forEach(sec=>{ const h=(sec.querySelector('.sh')||{}).textContent||'';
    let g=tab==='my'?'info':'all'; (GROUP[tab]||[]).some(([w,k])=>{ if(h.includes(w)){ g=k; return true; } });
    sec.hidden=!(cur==='all'||g==='*'||g===cur||(g==='acct'&&(cur==='info'||cur==='set'))); });
}
const EMB=true;
if(EMB) tabsEl.remove();
function showTabs(on){ if(EMB){ try{ env.hgNav(on); }catch(e){} } else tabsEl.hidden=!on; }
/* 셸의 하단 메뉴에서 부름 */
window.navGo=(t,sub)=>{ leaveRoom(true); if(t==='my') mySub=sub||'info'; if(FIL[t]) FIL[t]=sub||'all'; setTab(t); };
function toast(m){ const app=root.querySelector('.app'); app.querySelectorAll('.toast').forEach(t=>t.remove()); const t=document.createElement('div'); t.className='toast'; t.textContent=m; app.appendChild(t); setTimeout(()=>t.remove(),2200); }
function setTab(t){ if(t==='shop'){ t='my'; mySub='shop'; } tab=t; view=null; if(EMB){ try{ env.hgNavSel(t); }catch(e){} } tabsEl.querySelectorAll('button').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===t)); render(); }
tabsEl.querySelectorAll('button').forEach(b=>b.onclick=()=>{ if(b.dataset.tab==='study'){ try{ env.goStudy(); }catch(e){} return; } leaveRoom(true); if(b.dataset.tab==='my') mySub='info'; if(FIL[b.dataset.tab]) FIL[b.dataset.tab]='all'; setTab(b.dataset.tab); });
function render(){ if(view) return; showTabs(true); screen.scrollTop=0; ({home:renderHome,game:renderGame,rank:renderRank,my:()=>mySub==='shop'?renderShop():renderMy()})[tab](); deco(); }
HG.on(()=>{ if(!view&&tab==='my'&&mySub==='shop'){ renderShop(true); navBadges(); } else if(view) navBadges(); else if(!view&&(tab==='home'||tab==='game'||tab==='my')){ const y=screen.scrollTop; render(); screen.scrollTop=y; } });

/* ---------- 오늘 (대시보드: 오늘 할 일) ---------- */
const notiState=()=>{ try{ return ('Notification' in window)?Notification.permission:'none'; }catch(e){ return 'none'; } };
let editName=false, editPlan=false, myEdit=false;
const goSub=k=>{ try{ if(env.goSubject){ env.goSubject(k); return; } }catch(e){} toast(`${SNAME[k]} 탭에서 공부해요`); };
function renderHome(){
  const st=S(), d=HG.day(), gk=HG.gradeOf(st.xp), nx=HG.GRADES[gk+1], ts=HG.tasks(), fin=ts.filter(t=>t.n>=t.goal).length, done=HG.done();
  const wd=['일','월','화','수','목','금','토'][new Date().getDay()], bl=HG.backlog();
  setBar('홈');
  screen.innerHTML=`
  <div class="cols2"><div>
  <section class="sec"><div class="mini" id="toMy" role="button" tabindex="0" aria-label="마이페이지">
    <div class="miniav">${avatar(st.eq,64)}</div>
    <div class="minitx">${editName?`<form class="codein" id="nmF"><input id="nmI" maxlength="8" value="${esc(st.name)}" placeholder="닉네임 2~8자" aria-label="닉네임" style="letter-spacing:0;font-size:15px;height:40px"><button class="btn y" type="submit" style="min-height:40px">저장</button></form>`
      :`<div class="nm">${esc(myName())}<button id="nmE" aria-label="마이로 가기">${LI('user-round')}</button><span class="nmr">${gradeChip(st.xp)}<span class="cash">${LI('coins')}${st.cash}</span></span></div>`}
      <div class="tr thin"><i style="width:${nx?Math.round((st.xp-HG.GRADES[gk].x)/(nx.x-HG.GRADES[gk].x)*100):100}%"></i></div>
      <small class="sub">${nx?`'${nx.n}' 등급까지 ${nx.x-st.xp}문제`:'최고 등급이에요!'}</small></div>
  </div></section>
  <section class="sec"><h3 class="sh">${LI('list-checks')}오늘 할 일 <small>${new Date().getMonth()+1}월 ${new Date().getDate()}일 (${wd})</small></h3>
    <div class="donebar ${done?'ok':''}"><b>${fin} / ${ts.length}</b><div class="tr"><i style="width:${ts.length?fin/ts.length*100:100}%"></i></div>${HG.todayDone()?`<span class="todaystamp">${stampSVG(stampKind({ok:d.ok,no:d.no,done:true}),64)}</span>`:''}</div>
    <ul class="tasks">${ts.map(t=>{ const ok=t.n>=t.goal; return `<li class="${ok?'ok':''}" style="--c:${SCOL[t.k]}">
      <span class="tk">${ok?LI('check'):`<i>${esc(t.name[0])}</i>`}</span>
      <span class="tt"><b>${t.name} ${t.goal}${t.k==='typ'?'개 치기':'문제 맞히기'}</b><span class="tr"><i style="width:${t.n/t.goal*100}%"></i></span><small class="tl">${ok?'다 했어요':t.n?`${t.goal-t.n}${t.k==='typ'?'개':'문제'} 남음`:'아직 시작 전'}</small></span>
      ${ok?`<span class="tn">${LI('check')}완료</span>`:`<button class="btn line go" data-go="${t.k}"><b>${t.n}</b><small>/${t.goal}</small>${LI('chevron-right')}</button>`}</li>`; }).join('')}</ul>
    <p class="gblock ${done?'open':''}">${LI(done?'gift':'lock')}${done?'오늘 할 일 끝! 꾸미기와 게임(스피드·대결)이 열렸어요':'오늘 할 일을 모두 끝내면 꾸미기와 게임(스피드·대결)이 열려요'}</p>
    ${done?`<div class="row" style="margin-top:10px"><button class="btn y" id="goShop">${LI('shirt')}꾸미기</button><button class="btn k" id="goGame">${LI('swords')}게임·대결</button></div>`
      :`<button class="btn line full" id="demoDone" style="margin-top:10px">시연: 오늘 할 일 모두 끝낸 것으로 하기</button>`}
  </section>
  <section class="sec"><h3 class="sh">${LI('history')}밀린 공부 <small>지난 7일</small></h3>
    ${bl.length?`<ul class="tasks">${bl.map(b=>{ const dt=new Date(b.d*864e5); return `<li style="--c:${SCOL[b.k]}"><span class="tk"><i>${esc(b.name[0])}</i></span>
      <span class="tt"><b>${dt.getUTCMonth()+1}/${dt.getUTCDate()} (${'일월화수목금토'[dt.getUTCDay()]}) ${b.name} ${b.rem}문제 남음</b><span class="tr"><i style="width:${(b.goal-b.rem)/b.goal*100}%"></i></span></span>
      <button class="btn line go" data-go="${b.k}">하기${LI('chevron-right')}</button></li>`; }).join('')}</ul>
      <p class="note">오늘 할 일을 채운 뒤 더 맞힌 문제로 오래된 것부터 갚아요. 하루치를 다 갚으면 +5캐시.${st.backGate?' 밀린 공부까지 끝내야 꾸미기·게임이 열려요.':''}</p>`
      :`<p class="note" style="margin:0">밀린 공부가 없어요. 잘하고 있어요! 👍</p>`}
  </section></div><div>
  <section class="sec"><h3 class="sh">${LI('flame')}오늘 기록</h3>
    <div class="stat3"><div><small>맞힘</small><b>${d.ok}</b></div><div><small>틀림</small><b style="color:var(--no)">${d.no}</b></div><div><small>점수 (맞힘−틀림)</small><b>${d.ok-d.no}</b></div></div>
    <p class="note">오늘 받은 캐시 ${d.cash+d.game} · 게임 남은 판 ${done?HG.left():'잠김'}</p>
    ${Object.keys(d.by).length?`<div class="subj">${Object.entries(d.by).map(([k,v])=>`<span style="--c:${SCOL[k]||'#555'}">${SNAME[k]||k} ${v}</span>`).join('')}</div>`:''}
    ${done&&!d.more?`<p class="note">할 일을 끝낸 뒤 ${HG.MORE}문제 더 맞히면 게임 +1판 (${Math.max(0,d.ok-(d.doneAt||d.ok))}/${HG.MORE})</p>`:''}
  </section>
  <section class="sec"><h3 class="sh">${LI('coins')}캐시 모으는 법</h3>
    <ul class="earn"><li><span>정답 1개 (모든 과목)</span><b>+1</b></li><li><span>오답 1개</span><b style="color:var(--no)">−1</b></li><li><span>5문제 연속 정답</span><b>+3</b></li><li><span>오답 졸업 (3번 연속 맞힘)</span><b>+5</b></li><li><span>오늘 할 일 완료</span><b>+20</b></li><li><span>단원·단계 통과</span><b>+20</b></li><li><span>스피드 게임·대결 (맞힘−틀림 점수만큼)</span><b>하루 ${HG.GAME_CAP}까지</b></li></ul>
    <p class="note">기본 캐시는 맞힌 문제 − 틀린 문제예요. 공부 캐시는 하루 ${HG.STUDY_CAP}까지, 0 밑으로는 안 내려가요. 등급(XP)은 맞힌 문제로만 올라가요. 캐시는 꾸미기에만 쓰고, 돈으로 살 수 없어요.</p>
  </section>
  </div></div>`;
  const q=x=>screen.querySelector(x);
  if(q('#toMy')) q('#toMy').onclick=e=>{ if(e.target.closest('#nmE,#nmF')) return; setTab('my'); };
  screen.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>goSub(b.dataset.go));
  if(q('#goShop')) q('#goShop').onclick=()=>setTab('shop');
  if(q('#goGame')) q('#goGame').onclick=()=>setTab('game');
  if(q('#demoDone')) q('#demoDone').onclick=()=>{ HG.tasks().forEach(t=>{ for(let i=t.n;i<t.goal;i++) HG.event('ok',t.k); }); toast('시연: 오늘 할 일을 모두 끝낸 것으로 바꿨어요'); };
  const e=q('#nmE'); if(e) e.onclick=ev=>{ ev.stopPropagation(); myEdit=true; mySub='info'; setTab('my'); setTimeout(()=>{ const i=screen.querySelector('#myI'); if(i){ i.focus(); i.select(); } },30); };
  const f=q('#nmF'); if(f) f.onsubmit=ev=>{ ev.preventDefault(); const v=q('#nmI').value.trim();
    if(!/^[가-힣a-zA-Z0-9]{2,8}$/.test(v)){ toast('닉네임은 한글·영문·숫자 2~8자예요'); return; }
    st.name=v; editName=false; HG.save(); toast('닉네임을 바꿨어요'); };
}

/* ---------- 보호자 설정 (마이 탭) ---------- */
function settingsH(st){ const ts=HG.tasks();
  return `  <section class="sec"><h3 class="sh">${LI('shield-check')}보호자: 오늘 할 일 정하기 ${editPlan?'':`<small><button class="btn line" id="pe" style="min-height:34px;padding:4px 12px">바꾸기</button></small>`}</h3>
    ${editPlan?Object.keys(HG.PNAME).map(k=>`<div class="setrow"><span>${HG.PNAME[k]}</span>${segH('pl-'+k,[[0,'끄기'],[5,'5'],[10,'10'],[20,'20']],st.plan[k]||0).replace(/data-pl-(\w+)="/g,'data-pk="$1" data-pv="')}</div>`).join('')+`<button class="btn y full" id="pd" style="margin-top:8px">저장</button>`
      :`<p class="note" style="margin:0">${ts.map(t=>`${t.name} ${t.goal}`).join(' · ')||'할 일이 없어요'} — 매일 같은 할 일이 새로 시작돼요. 맞힌 문제만 세요.</p>`}
    <div class="setrow"><span>영단어 펜으로 쓰기 (철자 문제·따라 쓰기)</span><button class="sw" id="ewOn" role="switch" aria-checked="${st.engWrite!==false}" aria-label="영단어 펜으로 쓰기"></button></div>
    <div class="setrow"><span>한자 쓰기 문제 넣기 (펜·손가락)</span><button class="sw" id="hwOn" role="switch" aria-checked="${st.hanjaWrite!==false}" aria-label="한자 쓰기 문제 넣기"></button></div>
    <div class="setrow"><span>밀린 공부도 끝내야 꾸미기·게임 열기</span><button class="sw" id="bg" role="switch" aria-checked="${!!st.backGate}" aria-label="밀린 공부도 끝내야 열기"></button></div>
    <p class="note">출시 버전에서는 보호자 비밀번호를 넣어야 바꿀 수 있어요.</p>
  </section>
  <section class="sec"><h3 class="sh">${LI('bell')}알림 시간</h3>
    ${st.alarms.map((a,i)=>`<div class="alrow"><input type="time" value="${a.t}" data-at="${i}" aria-label="알림 시간 ${i+1}"><input type="text" value="${esc(a.label)}" maxlength="12" data-al="${i}" aria-label="알림 이름"><button class="sw" role="switch" aria-checked="${!!a.on}" data-ao="${i}" aria-label="알림 켜기"></button><button class="bb" data-ad="${i}" aria-label="알림 지우기">${LI('trash-2')}</button></div>`).join('')}
    <div class="row" style="margin-top:8px">${st.alarms.length<5?`<button class="btn line" id="aAdd">${LI('plus')}알림 추가</button>`:''}<button class="btn line" id="aTest">${LI('bell-ring')}미리 보기</button></div>
    <div class="setrow" style="margin-top:6px"><span>휴대폰·PC 알림</span><button class="btn ${notiState()==='granted'?'line':'y'}" id="aPerm" style="min-height:38px;padding:4px 12px" ${notiState()==='granted'||notiState()==='none'?'disabled':''}>${({granted:'허용됨',denied:'차단됨 (브라우저 설정에서 풀기)',none:'이 화면에선 안 돼요'})[notiState()]||'알림 허용하기'}</button></div>
    <p class="note">앱이 열려 있으면 정해진 시간에 화면에 알림이 떠요. 앱을 닫아 둬도 오는 알림(푸시)은 앱 출시 때 붙여요.</p>
  </section>
  <section class="sec"><h3 class="sh">${LI('bell')}소리 설정</h3>
    <div class="setrow"><span>맞힘·틀림 효과음<small class="sub" style="display:block">문제를 맞히거나 틀리면 짧은 소리가 나요</small></span><button class="sw" id="sfxOn" role="switch" aria-checked="${st.sfx!==false}" aria-label="효과음"></button></div>
  </section>
  <section class="sec"><h3 class="sh">${LI('user-round')}계정</h3>
    <div class="setrow"><span>보호자 계정<small class="sub" style="display:block">parent@example.com</small></span></div>
    <button class="btn line full" id="logout" style="margin-top:6px">${LI('log-out')}로그아웃</button>
    <button class="linkbtn" id="delAcc">${LI('user-x')}계정 삭제(탈퇴)</button>
  </section>
`; }
/* 확인 창 (로그아웃·탈퇴) — 시안용: 실제 로그인 연결은 개발 단계 */
function confirmBox(title,msg,okLabel,danger,onOk){
  document.querySelectorAll('.cfm').forEach(x=>x.remove());
  const o=document.createElement('div'); o.className='cfm'; o.setAttribute('role','alertdialog'); o.setAttribute('aria-modal','true');
  o.innerHTML=`<div class="cbox"><b></b><p></p><div class="row"><button class="btn line" data-c>취소</button><button class="btn ${danger?'danger':'k'}" data-o></button></div></div>`;
  o.querySelector('b').textContent=title; o.querySelector('p').textContent=msg; o.querySelector('[data-o]').textContent=okLabel;
  o.querySelector('[data-c]').onclick=()=>o.remove(); o.onclick=e=>{ if(e.target===o) o.remove(); };
  o.querySelector('[data-o]').onclick=()=>{ o.remove(); onOk(); };
  root.querySelector('.app').appendChild(o); setTimeout(()=>o.querySelector('[data-c]').focus(),20);
}
function loggedOut(){ try{ env.hgLogout(); }catch(e){ toast('로그아웃했어요'); } }

function bindSettings(q,st,rr){
  if(q('#sfxOn')) q('#sfxOn').onclick=()=>{ st.sfx=st.sfx===false; HG.save(); q('#sfxOn').setAttribute('aria-checked',st.sfx!==false); if(st.sfx!==false) sfx('ok'); };
  if(q('#logout')) q('#logout').onclick=()=>confirmBox('로그아웃할까요?','이 기기에서 보호자 계정이 로그아웃돼요. 공부 기록은 계정에 남아 있어요.','로그아웃',false,loggedOut);
  if(q('#delAcc')) q('#delAcc').onclick=()=>confirmBox('계정을 삭제할까요?','공부 기록, 꾸미기 아이템, 결제 정보가 모두 지워지고 되돌릴 수 없어요.','삭제하기',true,()=>toast('시연에서는 실제로 삭제하지 않아요'));
  if(q('#pe')) q('#pe').onclick=()=>{ editPlan=true; rr(); };
  if(q('#bg')) q('#bg').onclick=()=>{ st.backGate=!st.backGate; HG.save(); };
  if(q('#hwOn')) q('#hwOn').onclick=()=>{ st.hanjaWrite=st.hanjaWrite===false; HG.save(); };
  if(q('#ewOn')) q('#ewOn').onclick=()=>{ st.engWrite=st.engWrite===false; HG.save(); };
  screen.querySelectorAll('[data-at]').forEach(i=>i.onchange=()=>{ st.alarms[+i.dataset.at].t=i.value||'16:00'; HG.save(); });
  screen.querySelectorAll('[data-al]').forEach(i=>i.onchange=()=>{ st.alarms[+i.dataset.al].label=i.value.trim().slice(0,12)||'공부할 시간'; HG.save(); });
  screen.querySelectorAll('[data-ao]').forEach(b=>b.onclick=()=>{ const a=st.alarms[+b.dataset.ao]; a.on=!a.on; HG.save(); });
  screen.querySelectorAll('[data-ad]').forEach(b=>b.onclick=()=>{ st.alarms.splice(+b.dataset.ad,1); HG.save(); });
  if(q('#aAdd')) q('#aAdd').onclick=()=>{ st.alarms.push({t:'18:00',on:true,label:'공부할 시간'}); HG.save(); };
  if(q('#aTest')) q('#aTest').onclick=()=>{ try{ if(env.fireAlarm){ env.fireAlarm(st.alarms[0]||{label:'공부할 시간',t:''},true); return; } }catch(e){} toast('알림 미리 보기는 하루공부 화면에서 돼요'); };
  if(q('#aPerm')) q('#aPerm').onclick=()=>{ try{ Notification.requestPermission().then(()=>rr()); }catch(e){ toast('이 화면에서는 알림을 켤 수 없어요'); } };
  screen.querySelectorAll('[data-pk]').forEach(b=>b.onclick=()=>{ st.plan[b.dataset.pk]=+b.dataset.pv; if(!Object.values(st.plan).some(v=>v>0)) st.plan.math=10; editPlan=true; HG.save(); });
  if(q('#pd')) q('#pd').onclick=()=>{ editPlan=false; HG.save(); toast('오늘 할 일을 정했어요'); };
}




/* ---------- 도장: 할 일 완료 = '참 잘했어요'(빨강), 완료 + 정답률 90% 이상 = '최고예요'(금색) ---------- */
function stampSVG(kind,size){ const gold=kind==='best', c=gold?'#C98A00':'#D1352B', t1=gold?'최고':'참', t2=gold?'예요':'잘했어요';
  return `<svg class="stamp" width="${size}" height="${size}" viewBox="0 0 100 100" role="img" aria-label="${gold?'최고예요':'참 잘했어요'} 도장"><g transform="rotate(-14 50 50)" fill="none" stroke="${c}"><circle cx="50" cy="50" r="44" stroke-width="5"/><circle cx="50" cy="50" r="36" stroke-width="2"/>
    <path d="M22 56 Q50 62 78 56" stroke-width="2"/></g><g transform="rotate(-14 50 50)" fill="${c}" font-family="'Noto Sans KR',sans-serif" font-weight="900" text-anchor="middle"><text x="50" y="${gold?50:52}" font-size="${gold?24:30}">${t1}</text><text x="50" y="74" font-size="${gold?18:14}">${t2}</text>
    ${gold?'<path d="M50 14 l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" stroke="none"/>':''}</g></svg>`; }
const stampKind=r=> r&&r.done?((r.ok+(r.no||0))>0&&r.ok/(r.ok+(r.no||0))>=.9?'best':'good'):null;

/* ---------- 마이 (프로필·등급 길·학습 기록·게임 기록·보유 아이템·설정) ---------- */
function myStats(){ const st=S(), d=HG.day(), t=HG.dayN(), H=st.hist||{};
  const rec=k=> k===t?{ok:d.ok,no:d.no,done:!!d.bonus}:(H[k]||(st.log[k]?{ok:Object.values(st.log[k].by||{}).reduce((a,b)=>a+b,0),no:st.log[k].no||0,done:!!st.log[k].done}:null));
  let days=0; Object.values(H).forEach(r=>{ if(r.ok>0) days++; }); if(d.ok>0&&!H[t]) days++;
  let streak=0; for(let k=t;;k--){ const r=rec(k); if(r&&r.done){ streak++; continue; } if(k===t) continue; break; }
  const wk=HG.wkN(t), by={}; for(let k=t-6;k<=t;k++){ if(HG.wkN(k)!==wk) continue; const b=k===t?d.by:((st.log[k]||{}).by||{}); Object.entries(b).forEach(([s,v])=>by[s]=(by[s]||0)+v); }
  const stamps={good:0,best:0}; const ks=new Set([...Object.keys(H).map(Number),...Object.keys(st.log).map(Number),t]); ks.forEach(k=>{ const sk=stampKind(rec(k)); if(sk){ stamps.good++; if(sk==='best') stamps.best++; } });
  return {rec,days,streak,by,stamps}; }

/* ---------- 마이 > 통계 (최근 14일·7일·4주) ---------- */
const C_OK='#4A72B8', C_NO='#DB2777';
function dayRec(k){ const st=S(), t=HG.dayN();
  if(k===t){ const d=HG.day(); return {ok:d.ok,no:d.no,by:d.by||{},byNo:d.by_no||{},done:!!d.bonus}; }
  const L=st.log[k], H0=(st.hist||{})[k];
  if(L){ const ok=Object.values(L.by||{}).reduce((a,b)=>a+b,0); return {ok:H0?H0.ok:ok,no:L.no||(H0?H0.no:0)||0,by:L.by||{},byNo:L.byNo||{},done:!!L.done}; }
  if(H0) return {ok:H0.ok||0,no:H0.no||0,by:{},byNo:{},done:!!H0.done};
  return {ok:0,no:0,by:{},byNo:{},done:false}; }
const md=k=>{ const d=new Date(k*864e5); return `${d.getUTCMonth()+1}/${d.getUTCDate()}`; };
const pct=(a,b)=>b?Math.round(a/b*100):null;
function statsH(){
  const t=HG.dayN(), days=Array.from({length:14},(_,i)=>t-13+i), R=days.map(dayRec);
  const sum=(arr,f)=>arr.reduce((a,x)=>a+f(x),0);
  const thisW=[],lastW=[]; const wk=HG.wkN(t); for(let k=t-13;k<=t;k++){ const w=HG.wkN(k); if(w===wk) thisW.push(dayRec(k)); else if(w===wk-1) lastW.push(dayRec(k)); }
  const twOk=sum(thisW,r=>r.ok), twNo=sum(thisW,r=>r.no), lwOk=sum(lastW,r=>r.ok), lwNo=sum(lastW,r=>r.no);
  const twAcc=pct(twOk,twOk+twNo), lwAcc=pct(lwOk,lwOk+lwNo);
  const studied=R.filter(r=>r.ok>0), avg=studied.length?Math.round(sum(studied,r=>r.ok)/studied.length):0, doneN=R.filter(r=>r.done).length;
  const delta=(a,b,u)=>b==null||a==null?'<small class="dl">지난주 기록 없음</small>':a===b?'<small class="dl">지난주와 같아요</small>':`<small class="dl ${a>b?'up':'down'}">${a>b?'▲':'▼'} ${Math.abs(a-b)}${u} 지난주보다</small>`;
  // A. 핵심 숫자
  const tiles=`<div class="kpis">
    <div><small>이번 주 맞힌 문제</small><b>${twOk}</b>${delta(twOk,lastW.length?lwOk:null,'문제')}</div>
    <div><small>이번 주 정답률</small><b>${twAcc==null?'–':twAcc+'%'}</b>${delta(twAcc,lwAcc,'%p')}</div>
    <div><small>하루 평균 (공부한 날)</small><b>${avg}</b><small class="dl">최근 14일 중 ${studied.length}일 공부</small></div>
    <div><small>할 일 완료율</small><b>${Math.round(doneN/14*100)}%</b><small class="dl">14일 중 ${doneN}일 도장</small></div></div>`;
  // B. 14일 맞힘·틀림 막대
  const W=560,Hh=170,pl=30,pb=22,pt=8, iw=W-pl-6, ih=Hh-pb-pt, mx=Math.max(10,...R.map(r=>r.ok+r.no)); const top=Math.ceil(mx/10)*10, bw=iw/14;
  const y=v=>pt+ih-(v/top)*ih;
  const grid=[0,top/2,top].map(v=>`<line x1="${pl}" x2="${W-6}" y1="${y(v)}" y2="${y(v)}" class="gl"/><text x="${pl-6}" y="${y(v)+4}" class="ax" text-anchor="end">${v}</text>`).join('');
  const bars=R.map((r,i)=>{ const x=pl+i*bw+bw*.18, w=bw*.64, hOk=r.ok/top*ih, hNo=r.no/top*ih, base=pt+ih;
    const okR=r.ok?`<path d="M${x} ${base} v${-Math.max(0,hOk-3)} q0 -3 3 -3 h${w-6} q3 0 3 3 v${Math.max(0,hOk-3)} z" fill="${C_OK}"/>`:'';
    const noR=r.no?`<rect x="${x}" y="${base-hOk-hNo-(r.ok?2:0)}" width="${w}" height="${Math.max(1.5,hNo)}" rx="2" fill="${C_NO}"/>`:'';
    const lab=(i%2===1||i===13)?`<text x="${x+w/2}" y="${Hh-6}" class="ax${i===13?' now':''}" text-anchor="middle">${i===13?'오늘':md(days[i])}</text>`:'';
    return `<g class="hv" data-tip="${md(days[i])}${i===13?' (오늘)':''} · 맞힘 ${r.ok} · 틀림 ${r.no}${r.ok+r.no?` · 정답률 ${pct(r.ok,r.ok+r.no)}%`:''}${r.done?' · 도장':''}"><rect x="${pl+i*bw}" y="${pt}" width="${bw}" height="${ih}" fill="transparent"/>${okR}${noR}${lab}</g>`; }).join('');
  const chartB=`<figure class="chart"><figcaption>최근 14일 맞힌 문제와 틀린 문제</figcaption><div class="lgd"><span><i style="background:${C_OK}"></i>맞힘</span><span><i style="background:${C_NO}"></i>틀림</span></div>
    <svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="최근 14일 맞힘·틀림 막대그래프">${grid}${bars}</svg></figure>`;
  // C. 정답률 추이
  const acc=R.map(r=>pct(r.ok,r.ok+r.no)), H2=150, ih2=H2-pb-pt, y2=v=>pt+ih2-((v-50)/50)*ih2, cx=i=>pl+i*bw+bw/2;
  const pts=acc.map((v,i)=>v==null?null:[cx(i),y2(Math.max(50,v)),v,i]).filter(Boolean);
  const seg=[]; let cur=[]; acc.forEach((v,i)=>{ if(v==null){ if(cur.length) seg.push(cur); cur=[]; } else cur.push(`${cx(i)},${y2(Math.max(50,v))}`); }); if(cur.length) seg.push(cur);
  const chartC=`<figure class="chart"><figcaption>정답률 추이 <small>점선 = '최고예요' 도장 기준 90%</small></figcaption>
    <svg viewBox="0 0 ${W} ${H2}" role="img" aria-label="최근 14일 정답률 선그래프">${[50,75,100].map(v=>`<line x1="${pl}" x2="${W-6}" y1="${y2(v)}" y2="${y2(v)}" class="gl"/><text x="${pl-6}" y="${y2(v)+4}" class="ax" text-anchor="end">${v}</text>`).join('')}
    <line x1="${pl}" x2="${W-6}" y1="${y2(90)}" y2="${y2(90)}" class="ref"/>
    ${seg.map(s=>`<polyline points="${s.join(' ')}" fill="none" stroke="${C_OK}" stroke-width="2" stroke-linejoin="round"/>`).join('')}
    ${pts.map(([x,yy,v,i])=>`<g class="hv" data-tip="${md(days[i])} · 정답률 ${v}% (맞힘 ${R[i].ok} · 틀림 ${R[i].no})"><circle cx="${x}" cy="${yy}" r="12" fill="transparent"/><circle cx="${x}" cy="${yy}" r="4.5" fill="${C_OK}" stroke="#fff" stroke-width="2"/></g>`).join('')}
    ${pts.length?`<text x="${pts[pts.length-1][0]}" y="${pts[pts.length-1][1]-10}" class="vl" text-anchor="middle">${pts[pts.length-1][2]}%</text>`:''}
    ${R.map((r,i)=>(i%2===1||i===13)?`<text x="${cx(i)}" y="${H2-6}" class="ax${i===13?' now':''}" text-anchor="middle">${i===13?'오늘':md(days[i])}</text>`:'').join('')}</svg>
    ${pts.length?'':'<p class="note">아직 정답률 기록이 없어요.</p>'}</figure>`;
  // D. 과목별 최근 7일
  const by={},bn={}; for(let k=t-6;k<=t;k++){ const r=dayRec(k); Object.entries(r.by).forEach(([s,v])=>by[s]=(by[s]||0)+v); Object.entries(r.byNo).forEach(([s,v])=>bn[s]=(bn[s]||0)+v); }
  const rows=Object.keys(SNAME).map(k=>({k,ok:by[k]||0,no:bn[k]||0})).map(x=>({...x,acc:pct(x.ok,x.ok+x.no)}));
  const weak=rows.filter(x=>x.ok+x.no>=10&&x.acc!=null).sort((a,b)=>a.acc-b.acc)[0];
  const chartD=`<figure class="chart"><figcaption>과목별 최근 7일</figcaption>
    <div class="subst">${rows.map(x=>`<div class="hv" data-tip="${SNAME[x.k]} · 맞힘 ${x.ok} · 틀림 ${x.no}${x.acc!=null?` · 정답률 ${x.acc}%`:''}"><span class="sn"><i style="background:${SCOL[x.k]}"></i>${SNAME[x.k]}</span>
      <span class="sb"><i style="width:${x.acc||0}%;background:${SCOL[x.k]}"></i></span><b>${x.acc==null?'–':x.acc+'%'}</b><small>${x.ok}/${x.ok+x.no}</small></div>`).join('')}</div>
    <p class="note">${weak?`가장 약한 과목은 <b>${SNAME[weak.k]}</b>(정답률 ${weak.acc}%)이에요. 오답노트부터 풀어 보세요.`:'과목마다 10문제 이상 풀면 약한 과목을 알려 줘요.'} 막대 = 정답률, 오른쪽 = 맞힘/푼 문제</p></figure>`;
  // E. 요일별 평균 (최근 4주)
  const dow=Array(7).fill(0), cnt=Array(7).fill(0); for(let k=t-27;k<=t;k++){ const i=(k+3)%7; dow[i]+=dayRec(k).ok; cnt[i]++; }
  const da=dow.map((v,i)=>Math.round(v/(cnt[i]||1))), dmx=Math.max(5,...da), best=da.indexOf(Math.max(...da)), H3=130, ih3=H3-pb-pt-12, bw3=iw/7;
  const chartE=`<figure class="chart"><figcaption>요일별 평균 맞힌 문제 <small>최근 4주</small></figcaption>
    <svg viewBox="0 0 ${W} ${H3}" role="img" aria-label="요일별 평균 막대그래프">${da.map((v,i)=>{ const h=v/dmx*ih3, x=pl+i*bw3+bw3*.25, w=bw3*.5, base=pt+12+ih3;
      return `<g class="hv" data-tip="${'월화수목금토일'[i]}요일 평균 ${v}문제"><rect x="${pl+i*bw3}" y="${pt}" width="${bw3}" height="${ih3+12}" fill="transparent"/>${v?`<path d="M${x} ${base} v${-Math.max(0,h-3)} q0 -3 3 -3 h${w-6} q3 0 3 3 v${Math.max(0,h-3)} z" fill="${C_OK}" opacity="${i===best?1:.55}"/>`:''}<text x="${x+w/2}" y="${base-h-5}" class="vl" text-anchor="middle">${v}</text><text x="${x+w/2}" y="${H3-6}" class="ax" text-anchor="middle">${'월화수목금토일'[i]}</text></g>`; }).join('')}</svg>
    ${Math.max(...da)?`<p class="note">${'월화수목금토일'[best]}요일에 가장 많이 공부해요.</p>`:''}</figure>`;
  return `<section class="sec"><h3 class="sh">${LI('flame')}통계</h3>${tiles}${chartB}${chartC}${chartD}${chartE}<div class="ctip" id="ctip" role="status"></div></section>`;
}
function bindTips(){ const tip=screen.querySelector('#ctip'); if(!tip) return; const sec=tip.parentElement;
  screen.querySelectorAll('.hv').forEach(g=>{ const show=e=>{ const r=sec.getBoundingClientRect(), x=(e.touches?e.touches[0].clientX:e.clientX)-r.left, y=(e.touches?e.touches[0].clientY:e.clientY)-r.top; tip.textContent=g.dataset.tip; tip.style.display='block'; const tw=tip.offsetWidth; tip.style.left=Math.max(4,Math.min(r.width-tw-4,x-tw/2))+'px'; tip.style.top=(y-46)+'px'; g.classList.add('on'); };
    g.onmousemove=show; g.onclick=show; g.onmouseleave=()=>{ tip.style.display='none'; g.classList.remove('on'); }; }); }

function renderMy(){
  const st=S(), gk=HG.gradeOf(st.xp), nx=HG.GRADES[gk+1], m=myStats(), t=HG.dayN();
  setBar('마이');
  const cal=[]; const start=t-27-((t+3)%7); for(let k=start;k<=t;k++){ const r=m.rec(k); const sk=stampKind(r), dd=new Date(k*864e5); cal.push(`<i class="${k===t?'today ':''}${sk?'done':r&&r.ok>0?'part':''}" title="${dd.getUTCMonth()+1}/${dd.getUTCDate()}${sk?(sk==='best'?' 최고예요':' 참 잘했어요'):''}"><span class="dn">${dd.getUTCDate()}</span>${sk?stampSVG(sk,40):''}</i>`); }
  const maxBy=Math.max(1,...Object.values(m.by));
  const owned=c=>AVI[c].filter(it=>it.p===0||st.owned.includes(c+':'+it.id)).length, allN=CATS.reduce((a,[c])=>a+AVI[c].length,0), ownN=CATS.reduce((a,[c])=>a+owned(c),0);
  const bestRows=Object.entries(SUBJ).filter(([k])=>k!=='gugu').map(([k,v])=>[v[0],(st.best||{})[k]||0]).concat([['구구단 전체',(st.best||{}).gugu0||0]]);
  const wr=st.battles?Math.round((st.wins||0)/st.battles*100):0;
  screen.innerHTML=`
  <div class="cols2"><div>
  <section class="sec"><div class="me">
    <div class="avbig">${avatar(st.eq,130)}</div>
    ${myEdit?`<form class="nmedit" id="myF"><input id="myI" maxlength="8" value="${esc(st.name)}" placeholder="닉네임 2~8자" aria-label="닉네임"><button class="btn y" type="submit">저장</button><button class="btn line" type="button" id="myX">취소</button></form>`
      :`<div class="nm">${esc(myName())}<button id="myNm" aria-label="닉네임 바꾸기">${LI('pencil')}</button></div>`}
    <div class="row" style="justify-content:center">${gradeChip(st.xp)}<span class="cash">${LI('coins')}${st.cash}</span></div>
    <div class="gbar"><div class="tr"><i style="width:${nx?Math.round((st.xp-HG.GRADES[gk].x)/(nx.x-HG.GRADES[gk].x)*100):100}%"></i></div><small>${nx?`'${nx.n}' 등급까지 ${nx.x-st.xp} XP`:'최고 등급이에요!'} · 누적 XP ${st.xp.toLocaleString()}</small></div>
  </div></section>
  <section class="sec"><h3 class="sh">${LI('trophy')}등급 길</h3>
    <ol class="road">${HG.GRADES.map((g,i)=>{ const items=CATS.flatMap(([c])=>AVI[c].filter(it=>it.g===i).map(it=>it.name)); return `<li class="${i<gk?'past':i===gk?'now':''}"><span class="gi">${LI(g.ic)}</span><div><b>${g.n}</b><small>${g.x.toLocaleString()} XP${items.length?` · ${items.slice(0,4).join(', ')}${items.length>4?` 외 ${items.length-4}개`:''} 열림`:''}</small></div>${i===gk?'<span class="nowtag">지금</span>':''}</li>`; }).join('')}</ol>
  </section>
  <section class="sec"><h3 class="sh">${LI('shirt')}보유 아이템 <small>${ownN} / ${allN}</small></h3>
    <div class="own">${CATS.map(([c,l])=>`<div><small>${l}</small><b>${owned(c)}<i>/${AVI[c].length}</i></b></div>`).join('')}</div>
    <button class="btn line full" id="toShop" style="margin-top:10px">${LI('shirt')}꾸미기 열기</button>
  </section></div><div>
  <section class="sec"><h3 class="sh">${LI('flame')}학습 기록</h3>
    <div class="stat3"><div><small>맞힌 문제</small><b>${(st.total||0).toLocaleString()}</b></div><div><small>공부한 날</small><b>${m.days}일</b></div><div><small>연속 완료</small><b>${m.streak}일</b></div></div>
    <div class="stampn">${stampSVG('good',34)}<span>모은 도장 <b>${m.stamps.good}</b>개</span>${stampSVG('best',34)}<span>최고예요 <b>${m.stamps.best}</b>개</span></div>
    <div class="cal" aria-label="최근 4주 학습 달력"><div class="calh">${'월화수목금토일'.split('').map(x=>`<span>${x}</span>`).join('')}</div><div class="calg">${cal.join('')}</div>
      <p class="note stl">${stampSVG('good',22)} 참 잘했어요(할 일 완료) ${stampSVG('best',22)} 최고예요(정답률 90% 이상) <i class="lg part"></i>조금 공부</p></div>
  </section>
  ${statsH()}
  <section class="sec"><h3 class="sh">${LI('swords')}게임 기록</h3>
    <div class="stat3"><div><small>대결</small><b>${st.battles||0}판</b></div><div><small>우승</small><b>${st.wins||0}번</b></div><div><small>우승률</small><b>${wr}%</b></div></div>
    <small class="sub" style="display:block;margin-top:10px">스피드 게임 최고 점수</small>
    <div class="bestg">${bestRows.map(([n,v])=>`<span>${n} <b>${v}</b></span>`).join('')}</div>
  </section>
  ${settingsH(st)}
  </div></div>`;
  const q=x=>screen.querySelector(x);
  q('#toShop').onclick=()=>{ mySub='shop'; render(); };
  if(q('#myNm')) q('#myNm').onclick=()=>{ myEdit=true; const y=screen.scrollTop; render(); screen.scrollTop=y; setTimeout(()=>{ const i=q('#myI'); if(i){ i.focus(); i.select(); } },30); };
  if(q('#myX')) q('#myX').onclick=()=>{ myEdit=false; const y=screen.scrollTop; render(); screen.scrollTop=y; };
  if(q('#myF')) q('#myF').onsubmit=ev=>{ ev.preventDefault(); const v=q('#myI').value.trim();
    if(!/^[가-힣a-zA-Z0-9]{2,8}$/.test(v)){ toast('닉네임은 한글·영문·숫자 2~8자예요'); return; }
    st.name=v; myEdit=false; HG.save(); toast('닉네임을 바꿨어요'); };
  bindSettings(q,st,renderMy); bindTips();
}

/* ---------- 꾸미기 ---------- */
let shopCat='body', shopSel=null;
function renderShop(keep){
  const st=S(), gk=HG.gradeOf(st.xp), items=AVI[shopCat], sel=shopSel&&shopSel.cat===shopCat?items.find(i=>i.id===shopSel.id):null;
  const own=it=>it.p===0||st.owned.includes(shopCat+':'+it.id);
  const preview={...st.eq}; if(sel) preview[shopCat]=sel.id;
  const locked=!HG.done();
  let act=`<button class="btn full" disabled>아이템을 골라 미리 입혀 보세요</button>`;
  if(sel&&locked) act=`<button class="btn full" disabled>${LI('lock')}오늘 할 일을 끝내면 사고 입을 수 있어요</button>`;
  else if(sel){
    if(st.eq[shopCat]===sel.id) act=`<button class="btn full" disabled>${LI('check')}착용 중</button>`;
    else if(own(sel)) act=`<button class="btn y full" id="wear">${LI('shirt')}착용하기</button>`;
    else if(sel.g&&gk<sel.g) act=`<button class="btn full" disabled>${LI('lock')}'${HG.GRADES[sel.g].n}' 등급부터 살 수 있어요</button>`;
    else if(st.cash<sel.p) act=`<button class="btn full" disabled>캐시가 ${sel.p-st.cash} 부족해요</button>`;
    else act=`<button class="btn y full" id="buy">${LI('coins')}${sel.p}캐시로 사고 착용하기</button>`;
  }
  const y=screen.scrollTop;
  setBar('마이');
  screen.innerHTML=`
  <section class="sec center"><div class="me"><div class="avbig">${avatar(preview,150)}</div><div class="row" style="justify-content:center">${gradeChip(st.xp)}<span class="cash">${LI('coins')}${st.cash}</span></div></div></section>
  <section class="sec">
    ${locked?`<p class="gblock" style="margin:0 0 12px">${LI('lock')}미리 입혀 보기만 돼요. 오늘 할 일을 모두 끝내면 사고 입을 수 있어요</p>`:''}
    <div class="chips" role="tablist">${CATS.map(([k,l])=>`<button class="chip ${k===shopCat?'on':''}" data-cat="${k}" role="tab" aria-selected="${k===shopCat}">${l}</button>`).join('')}</div>
    <div class="itemgrid">${items.map(it=>{ const e={...st.eq,[shopCat]:it.id}, mine=own(it), lock=it.g&&gk<it.g;
      return `<button class="item ${sel&&sel.id===it.id?'sel':''} ${st.eq[shopCat]===it.id?'on':''} ${lock&&!mine?'lock':''}" data-it="${it.id}" aria-label="${it.name}">${avatar(e,64)}<b>${it.name}</b>
        <small>${mine?'가지고 있음':lock?`${LI('lock')}${HG.GRADES[it.g].n} 등급`:`${LI('coins')}${it.p}`}</small></button>`; }).join('')}</div>
    <div class="shopact">${act}</div>
    <p class="note">왕관·망토·별 안경·황금 몸·밤하늘은 등급을 올려야 살 수 있어요. 뽑기나 현금 결제는 없어요.</p>
  </section>`;
  if(keep) screen.scrollTop=y;
  screen.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{ shopCat=b.dataset.cat; shopSel=null; renderShop(); });
  screen.querySelectorAll('[data-it]').forEach(b=>b.onclick=()=>{ shopSel={cat:shopCat,id:b.dataset.it}; renderShop(true); });
  const w=screen.querySelector('#wear'); if(w) w.onclick=()=>{ st.eq[shopCat]=sel.id; HG.save(); toast(`${sel.name} 착용!`); };
  const bu=screen.querySelector('#buy'); if(bu) bu.onclick=()=>{ st.cash-=sel.p; st.owned.push(shopCat+':'+sel.id); st.eq[shopCat]=sel.id; HG.save(); toast(`${sel.name}을(를) 샀어요!`); };
}

/* ---------- 게임 ---------- */
let gSub='math', gDan=0, mk={sub:'math',n:10,max:4,dan:0,priv:true};
const chipH=(name,opts,cur)=>`<div class="chips subj" role="group">${opts.map(([v,l])=>`<button data-${name}="${v}" class="chip ${String(cur)===String(v)?'on':''}">${l}</button>`).join('')}</div>`;
const segH=(name,opts,cur)=>`<div class="seg" role="group">${opts.map(([v,l])=>`<button data-${name}="${v}" class="${String(cur)===String(v)?'on':''}">${l}</button>`).join('')}</div>`;
function ticketsH(){ const lim=HG.limit(), left=HG.left(); return `<div class="tickets" aria-label="오늘 남은 판 ${left}개">${Array.from({length:lim},(_,i)=>LI('ticket',i<left?'on':'')).join('')}<small>오늘 남은 판 ${left} / ${lim}</small></div>`; }
function guMissH(st){ const m=Object.entries(st.guMiss||{}).sort((a,b)=>b[1]-a[1]).slice(0,6);
  if(!m.length) return `<p class="note">틀린 곱셈이 생기면 여기에 모아 보여 줘요.</p>`;
  const dan={}; Object.entries(st.guMiss).forEach(([k,v])=>{ const d=k.split('×')[0]; dan[d]=(dan[d]||0)+v; }); const weak=Object.entries(dan).sort((a,b)=>b[1]-a[1])[0][0];
  return `<div class="miss"><small>많이 틀린 곱셈</small><div>${m.map(([k,v])=>`<span>${k.replace('×',' × ')} <b>${v}번</b></span>`).join('')}</div>
    <p class="note">가장 약한 단은 <b>${weak}단</b>이에요. 연산 탭의 곱셈구구 단계로 다시 연습해요.</p><button class="btn line full" id="guMath">연산에서 연습하기</button></div>`; }
function renderGame(){
  const st=S(), gb=HG.block();
  setBar('게임');
  screen.innerHTML=`
  <section class="sec"><h3 class="sh">${LI('ticket')}오늘 게임 <small>스피드 게임·대결 합쳐서</small></h3>
    ${ticketsH()}
    <div class="lvrow"><small class="sub">게임 수준 · 스피드 게임과 내가 만드는 대결방 문제</small>${chipH('gv',LVG.map((n,i)=>[i,n]),gLv())}</div>
    ${gb?`<p class="gblock">${LI(gb.k==='study'?'book-open':gb.k==='night'?'moon':'clock')}${gb.msg}</p>`:''}
    ${gb&&gb.k==='study'?`<button class="btn line full" id="demoDay" style="margin-top:10px">${LI('list-checks')}오늘 할 일 보러 가기</button>`:''}
  </section>
  <section class="sec"><h3 class="sh">${LI('swords')}대결방</h3>
    <div class="gcard"><h4>${LI('door-open')}방 만들기 (방장)</h4>
      <p>방장이 과목과 문제 수를 정하고, 방 코드로 친구를 초대해요. 모두 같은 문제를 풀고, 점수는 <b>맞힌 문제 − 틀린 문제</b>예요. 모르면 안 고르는 게 나아요. 점수가 같으면 빨리 푼 사람이 이겨요.</p>
      ${chipH('ms',Object.entries(SUBJ).map(([k,v])=>[k,v[0]]),mk.sub)}
      ${mk.sub==='gugu'?`<div class="chips dan">${DANS.map(([d,l])=>`<button class="chip ${mk.dan===d?'on':''}" data-md="${d}">${l}</button>`).join('')}</div>`:''}
      <small class="sub">문제 수</small>${segH('mn',[[5,'5'],[10,'10'],[15,'15'],[20,'20문제']],mk.n)}<small class="sub">최대 인원</small>${segH('mx',[[2,'2'],[3,'3'],[4,'4'],[6,'6'],[8,'8명']],mk.max)}
      <small class="sub">공개 범위</small>${segH('mp',[['pub','공개'],['priv','비공개']],mk.priv?'priv':'pub')}
      <p class="note" style="margin:6px 0 0">${mk.priv?`${LI('lock','inl')}비공개: 방 코드가 생겨요. 코드를 받은 친구만 들어올 수 있어요.`:`${LI('users','inl')}공개: 공개 방 목록에 올라가서 누구나 들어올 수 있어요. 코드는 필요 없어요.`}</p>
      <button class="btn y full" id="mkRoom" ${gb?'disabled':''}>${LI('plus')}방 만들기</button></div>
    <div class="gcard"><h4>${LI('users')}공개 방 들어가기</h4>
      <div class="pubs" id="pubs"><p class="note" style="margin:0">공개 방을 찾는 중…</p></div></div>
    <div class="gcard"><h4>${LI('log-in')}코드로 참가 <small class="sub" style="font-weight:600">비공개 방</small></h4>
      <p>친구에게 받은 6자리 방 코드를 넣어요.</p>
      <form class="codein" id="joinF"><input id="code" inputmode="numeric" maxlength="6" placeholder="000000" aria-label="방 코드 6자리"><button class="btn k" type="submit" ${gb?'disabled':''}>참가</button></form></div>
    <p class="note">친구와 실시간으로 대결해요. 보이는 건 닉네임과 캐릭터뿐이고, 채팅은 정해진 문구와 이모지만 쓸 수 있어요.</p>
  </section>
  <section class="sec"><h3 class="sh">${LI('zap')}스피드 게임 <small>60초 · 점수 = 맞힘 − 틀림</small></h3>
    ${chipH('gs',Object.entries(SUBJ).map(([k,v])=>[k,v[0]]),gSub)}
    ${gSub==='gugu'?`<div class="chips dan" style="margin-top:10px">${DANS.map(([d,l])=>`<button class="chip ${gDan===d?'on':''}" data-gd="${d}">${l}</button>`).join('')}</div>
      <div class="stat3"><div><small>${danName(gDan)} 최고</small><b>${(st.best||{})[bestKey('gugu',gDan)]||0}</b></div><div><small>전체 최고</small><b>${(st.best||{}).gugu0||0}</b></div><div><small>틀린 곱셈</small><b>${Object.values(st.guMiss||{}).reduce((a,b)=>a+b,0)}</b></div></div>
      ${guMissH(st)}`
     :`<div class="stat3" style="margin-top:10px">${(gSub==='mix'?['mix','math','hanja']:['math','hanja','eng']).map(k=>`<div><small>${SUBJ[k][0]} 최고</small><b>${(st.best||{})[k]||0}</b></div>`).join('')}</div>`}
    <button class="btn y full" id="speed" style="margin-top:10px" ${gb?'disabled':''}>${LI(gb?'lock':'timer')}${gb?'잠겨 있어요':'60초 도전'}</button>
  </section>
  <section class="sec"><h3 class="sh">${LI('shield-check')}보호자 설정</h3>
    <div class="setrow"><span>하루 게임 판 수</span>${segH('gl',[[1,'1판'],[3,'3판'],[5,'5판']],st.gameLimit)}</div>
    <div class="setrow"><span>밤 9시 이후 게임 잠금</span><button class="sw" id="curfew" role="switch" aria-checked="${!!st.curfew}" aria-label="밤 9시 이후 게임 잠금"></button></div>
    <p class="note">게임으로 받는 캐시는 하루 ${HG.GAME_CAP}까지예요. 출시 버전에서는 보호자 비밀번호를 넣어야 바꿀 수 있어요.</p>
  </section>`;
  const q=s=>screen.querySelector(s);
  screen.querySelectorAll('[data-ms]').forEach(b=>b.onclick=()=>{ mk.sub=b.dataset.ms; renderGame(); });
  screen.querySelectorAll('[data-mn]').forEach(b=>b.onclick=()=>{ mk.n=+b.dataset.mn; renderGame(); });
  screen.querySelectorAll('[data-mx]').forEach(b=>b.onclick=()=>{ mk.max=+b.dataset.mx; renderGame(); });
  screen.querySelectorAll('[data-mp]').forEach(b=>b.onclick=()=>{ mk.priv=b.dataset.mp==='priv'; renderGame(); });
  loadPubs(gb);
  screen.querySelectorAll('[data-gs]').forEach(b=>b.onclick=()=>{ gSub=b.dataset.gs; renderGame(); });
  screen.querySelectorAll('[data-gv]').forEach(b=>b.onclick=()=>{ st.gLv=+b.dataset.gv; HG.save(); renderGame(); });
  screen.querySelectorAll('[data-gd]').forEach(b=>b.onclick=()=>{ gDan=+b.dataset.gd; renderGame(); });
  screen.querySelectorAll('[data-md]').forEach(b=>b.onclick=()=>{ mk.dan=+b.dataset.md; renderGame(); });
  const gm=q('#guMath'); if(gm) gm.onclick=()=>goSub('math');
  screen.querySelectorAll('[data-gl]').forEach(b=>b.onclick=()=>{ st.gameLimit=+b.dataset.gl; HG.save(); });
  q('#curfew').onclick=()=>{ st.curfew=!st.curfew; HG.save(); };
  const dd=q('#demoDay'); if(dd) dd.onclick=()=>navGo(env.start||'game', env.sub);
  q('#mkRoom').onclick=()=>{ const b=HG.block(); if(b){ toast(b.msg); return; } makeRoom(); };
  q('#joinF').onsubmit=ev=>{ ev.preventDefault(); const b=HG.block(); if(b){ toast(b.msg); return; } const c=q('#code').value.trim(); if(!/^\d{6}$/.test(c)){ toast('방 코드는 숫자 6자리예요'); return; } joinRoom(c); };
  q('#speed').onclick=()=>{ if(!HG.useTicket()){ const b=HG.block(); toast(b?b.msg:'지금은 할 수 없어요'); return; } startSpeed(gSub,gDan); };
}

/* ---------- 스피드 게임 (60초) ---------- */
let SP=null;
function startSpeed(sub,dan){
  view='speed'; showTabs(false);
  SP={sub,dan:dan||0,ok:0,n:0,end:performance.now()+60000,cur:null,lock:false,tm:null,gain:0};
  nextSpeed(); SP.tm=setInterval(()=>{ if(!SP) return; const left=SP.end-performance.now(); const t=screen.querySelector('#tbar'); if(t) t.style.transform=`scaleX(${Math.max(0,left/60000)})`; const s=screen.querySelector('#tsec'); if(s) s.textContent=Math.ceil(Math.max(0,left)/1000)+'초'; if(left<=0) endSpeed(); },100);
}
function nextSpeed(){ SP.cur=genQ(SP.sub,SP.dan); SP.lock=false; drawSpeed(); }
function qBoxH(c){ return `<div class="qbox"><small>${c.hint}</small><div class="q ${c.kind==='han'?'han':c.kind==='long'||c.kind==='desc'?'sm':''}">${esc(c.q)}</div></div>`; }
function optsH(c){ if(c.kind==='type') return `<form class="tform" id="tform"><input id="tin" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" lang="${c.lang}" aria-label="여기에 입력" placeholder="${c.lang==='ko'?'여기에 한글로 쳐요':'Type here'}"><button class="btn k" type="submit">입력</button></form>`; return `<div class="opts ${c.kind==='long'||c.kind==='desc'&&c.c.some(x=>x.length>8)||c.kind==='en'&&c.c.some(x=>x.length>9)||c.kind==='han'&&c.c.some(x=>x.length>7)?'long':''}">${c.c.map((x,i)=>`<button data-o="${i}">${esc(x)}</button>`).join('')}</div>`; }
function drawSpeed(){
  setBar(`스피드 게임 · ${SUBJ[SP.sub][0]}${SP.sub==='gugu'?' '+danName(SP.dan):''}`,()=>{ endSpeed(true); });
  const left=SP.end-performance.now();
  screen.innerHTML=`<div class="play">
    <div class="qtop"><span>점수 <b style="color:var(--fg);font-size:18px">${SP.ok-(SP.n-SP.ok)}</b> · 맞힘 ${SP.ok} · 틀림 ${SP.n-SP.ok}</span><span id="tsec">${Math.ceil(left/1000)}초</span></div>
    <div class="timer"><i id="tbar" style="transform:scaleX(${left/60000})"></i></div>
    ${qBoxH(SP.cur)}${optsH(SP.cur)}<div class="fbk" id="fb"></div></div>`;
  const spAns=(you,b)=>{
    if(!SP||SP.lock) return; SP.lock=true; const ok=you===SP.cur.ans; SP.n++; sfx(ok?'ok':'no'); if(!ok) missAdd(SP.cur);
    if(ok) SP.ok++; if(b) b.classList.add(ok?'ok':'no'); const ti=screen.querySelector('#tin'); if(ti){ ti.disabled=true; ti.classList.add(ok?'ok':'no'); }
    if(!ok) screen.querySelectorAll('[data-o]').forEach(x=>{ if(SP.cur.c[+x.dataset.o]===SP.cur.ans) x.classList.add('ok'); });
    const f=screen.querySelector('#fb'); f.className='fbk '+(ok?'ok':'no'); f.textContent=ok?'정답! +1':'틀렸어요 −1 · 다음 문제'; if(!ok&&SP.cur.kind==='type') f.textContent=`틀렸어요 −1 · 정답: ${SP.cur.ans}`;
    setTimeout(()=>{ if(SP&&!SP.done) nextSpeed(); },ok?260:650);
  };
  screen.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>spAns(SP.cur.c[+b.dataset.o],b));
  bindType(SP.cur,v=>spAns(v));
}
/* 타자 문제: 똑같이 치면 바로 정답, 다르게 치고 입력(Enter)하면 오답 */
function bindType(c,fn){ if(c.kind!=='type') return; const f=screen.querySelector('#tform'), i=screen.querySelector('#tin'); if(!f) return;
  i.oninput=()=>{ if(i.value.trim()===c.ans) fn(c.ans); };
  f.onsubmit=e=>{ e.preventDefault(); const v=i.value.trim(); if(!v) return; fn(v); };
  setTimeout(()=>{ try{ i.focus(); }catch(e){} },30); }
function endSpeed(quit){
  if(!SP||SP.done) return; SP.done=true; clearInterval(SP.tm);
  const st=S(), sp=SP; st.best=st.best||{}; sp.sc=sp.ok-(sp.n-sp.ok); const bk=bestKey(sp.sub,sp.dan), rec=!quit&&sp.sc>(st.best[bk]||0);
  if(!quit) sp.gain+=HG.gEarn(Math.max(0,sp.sc));
  if(rec){ st.best[bk]=sp.sc; sp.gain+=HG.gEarn(5); }
  HG.save(); SP=null;
  setBar('스피드 게임 결과',()=>{ view=null; render(); });
  screen.innerHTML=`<section class="sec center"><div class="me">
    <div class="avbig">${avatar(st.eq,120)}</div>
    <div style="font-size:15px;color:var(--sub);font-weight:700">${SUBJ[sp.sub][0]} · 60초</div>
    <div style="font-size:44px;font-weight:900;line-height:1.1">${sp.sc}<small style="font-size:16px;color:var(--sub)">점</small></div><p class="note" style="margin:0">맞힘 ${sp.ok} − 틀림 ${sp.n-sp.ok} = ${sp.sc}점 · 점수만큼 캐시(기록 갱신 +5)</p>
    ${rec?`<div class="grade">${LI('trophy')}새 최고 기록!</div>`:`<p class="note">내 최고 기록 ${st.best[bk]||0}</p>`}
    <span class="reward">${LI('coins')}+${sp.gain}</span>
    ${quit?'<p class="note">중간에 그만둬서 기록은 남지 않아요.</p>':''}
    <p class="note">${ticketsH()}</p>
    <button class="btn y full" id="again" ${HG.block()?'disabled':''}>${LI('repeat')}한 판 더 (티켓 1장)</button>
    <button class="btn line full" id="back">게임 목록으로</button></div></section>`;
  screen.querySelector('#again').onclick=()=>{ if(!HG.useTicket()){ toast((HG.block()||{}).msg||'남은 판이 없어요'); return; } startSpeed(sp.sub,sp.dan); };
  screen.querySelector('#back').onclick=()=>{ view=null; render(); };
}

/* ---------- 대결방 (실시간: Supabase Realtime) ----------
   scripts/play-app.mjs가 프로토타입의 '대결방(시연: 가상 친구)' 부분을 이 코드로 바꿔 끼운다.
   방은 6자리 코드. 참가자 목록은 접속 상태(presence), 채팅·설정·시작·답·다음 문제는 방송으로 주고받는다.
   방장이 문제를 만들고 진행(다음 문제 · 정답 공개 · 끝)을 정해서, 모두 같은 문제를 같은 순서로 푼다.
   학생 id 대신 접속할 때마다 새 임시 id를 쓰고, 서로에게 보이는 건 닉네임·캐릭터뿐이다. */
let RM=null; const TM=[];
const later=(f,ms)=>{ const t=setTimeout(()=>{ const i=TM.indexOf(t); if(i>=0) TM.splice(i,1); f(); },ms); TM.push(t); return t; };
const clearT=()=>{ while(TM.length) clearTimeout(TM.pop()); if(RM&&RM.iv){ clearInterval(RM.iv); RM.iv=null; } if(RM&&RM.rain){ cancelAnimationFrame(RM.rain.raf); RM.rain.dead=true; } };
const RT=env.rt||null;
const MID=()=>RT?RT.me.id:'me';
const isMe=id=>id===MID();
const amHost=()=>!!RM&&RM.hostId===MID();
const meP=()=>({id:MID(),name:myName(),eq:S().eq,ready:false});
const pName=p=>isMe(p.id)?(S().name?S().name+' (나)':'나'):p.name;
const myMeta=()=>({id:MID(),name:myName(),eq:S().eq,ready:!!(RM&&RM.ready),host:amHost(),at:RM?RM.at:Date.now(),lv:RM?RM.lv:gLv()});
function send(ev,p){ if(RM&&RM.ch) RM.ch.send(ev,p||{}); }
function say(p,txt,remote){ if(!RM) return; RM.chat.push({id:p.id,name:p.name,txt}); RM.chat=RM.chat.slice(-40); drawChat(); if(!remote) send('chat',{id:p.id,name:p.name,txt}); }
function sys(txt){ if(!RM) return; RM.chat.push({sys:true,txt}); drawChat(); }

/* 공개 방 목록 — 지금 열린 진짜 방만 (방장이 2분 안에 신호를 보낸 방) */
function loadPubs(gb){
  const box=screen.querySelector('#pubs'); if(!box) return;
  if(!RT){ box.innerHTML='<p class="note" style="margin:0">로그인하면 공개 방을 볼 수 있어요.</p>'; return; }
  RT.list().then(rows=>{ const b=screen.querySelector('#pubs'); if(!b) return;
    if(!rows.length){ b.innerHTML='<p class="note" style="margin:0">지금 열린 공개 방이 없어요. 방을 만들어 친구를 불러 봐요!</p>'; return; }
    b.innerHTML=rows.map(r=>`<button class="pubr" data-pub="${esc(r.code)}" ${gb?'disabled':''}>${avatar(r.eq||{},40)}<span><b>${esc(r.host_name)}님의 방</b><small>${(SUBJ[r.subject]||['?'])[0]} · ${r.n}문제 · ${r.cur}/${r.max_n}명</small></span>${LI('chevron-right')}</button>`).join('');
    b.querySelectorAll('[data-pub]').forEach(x=>x.onclick=()=>{ const bl=HG.block(); if(bl){ toast(bl.msg); return; } joinRoom(x.dataset.pub); });
  }).catch(()=>{ const b=screen.querySelector('#pubs'); if(b) b.innerHTML='<p class="note" style="margin:0">공개 방을 불러오지 못했어요.</p>'; });
}

async function makeRoom(){
  if(!RT){ toast('로그인하면 친구와 대결할 수 있어요'); return; }
  try{ const code=await RT.create({public:!mk.priv,sub:mk.sub,n:mk.n,max:mk.max,dan:mk.dan});
    enterRoom({code,public:!mk.priv,host_name:myName(),subject:mk.sub,dan:mk.dan,n:mk.n,max_n:mk.max},true); }
  catch(e){ toast('방을 만들지 못했어요. 잠시 뒤 다시 해 봐요'); }
}
async function joinRoom(code){
  if(!RT){ toast('로그인하면 친구와 대결할 수 있어요'); return; }
  const row=await RT.find(code).catch(()=>null);
  if(!row){ toast('방을 찾을 수 없어요. 코드를 다시 확인해요'); return; }
  if(row.state!=='wait'){ toast('이미 대결 중인 방이에요'); return; }
  if(row.cur>=row.max_n){ toast('방이 꽉 찼어요'); return; }
  enterRoom(row,false);
}
function enterRoom(row,host){
  clearT(); leaveCh();
  RM={code:row.code,priv:!row.public,hostId:host?MID():null,hostName:row.host_name,sub:row.subject,dan:row.dan||0,n:row.n,max:row.max_n,
    players:[meP()],chat:[],phase:'wait',ready:false,at:Date.now(),known:{},synced:false,ban:[],lv:host?gLv():null}; // 문제 수준은 방장이 고른 게임 수준
  sys(host?(RM.priv?'비공개 방을 만들었어요. 코드를 친구에게 알려 주세요':'공개 방을 만들었어요. 공개 방 목록에서 누구나 들어올 수 있어요'):`${row.host_name}님의 방에 들어왔어요`);
  view='room'; drawRoom(); screen.scrollTop=0;
  RM.ch=RT.join(row.code,myMeta(),{presence:onPresence,event:onEvent});
  if(host) RM.hb=setInterval(()=>{ if(RM&&amHost()) RT.update(RM.code,{cur:RM.players.length}); },30000);
  else later(()=>{ if(RM&&!RM.seenHost){ toast('방장이 없어서 들어갈 수 없어요'); leaveRoom(); } },6000); // 방장이 창을 닫은 방
}
/* 방장이 창을 닫거나 다른 곳으로 가면 방을 바로 지운다 */
window.addEventListener('pagehide',()=>{ if(RM&&amHost()&&RT){ send('closed',{}); RT.remove(RM.code); } });
function leaveCh(){ if(!RM) return; if(RM.hb){ clearInterval(RM.hb); RM.hb=null; } if(RM.ch){ try{ RM.ch.leave(); }catch(e){} RM.ch=null; } }
function leaveRoom(silent){
  if(!RM) return;
  if(amHost()){ send('closed',{}); if(RT) RT.remove(RM.code); }
  const r=RM; clearT(); setTimeout(()=>{ RM=r; leaveCh(); RM=null; },150); RM=null;
  if(!silent){ view=null; render(); } else view=null;
}

/* 참가자 목록이 바뀔 때 (들어옴 · 나감 · 준비) */
function onPresence(list){
  if(!RM) return;
  const ps=list.filter(Boolean).sort((a,b)=>((b.host?1:0)-(a.host?1:0))||(a.at-b.at));
  const host=ps.find(p=>p.host);
  if(host){ RM.hostId=host.id; RM.seenHost=true; if(typeof host.lv==='number') RM.lv=host.lv; }
  else if(RM.seenHost&&!amHost()){ toast('방장이 나가서 방이 닫혔어요'); leaveRoom(); return; }
  const ids=new Set(ps.map(p=>p.id));
  if(RM.synced){
    ps.forEach(p=>{ if(!RM.known[p.id]&&!isMe(p.id)&&!p.host) sys(`${p.name}님이 들어왔어요`); });
    Object.keys(RM.known).forEach(id=>{ if(!ids.has(id)&&!isMe(id)) sys(`${RM.known[id]}님이 나갔어요`); });
  }
  RM.synced=true; RM.known={}; ps.forEach(p=>{ RM.known[p.id]=p.name; });
  if(amHost()) ps.forEach(p=>{ if(RM.ban.includes(p.id)) send('kick',{id:p.id}); });
  if(ps.findIndex(p=>isMe(p.id))>=RM.max&&!amHost()){ toast('방이 꽉 찼어요'); leaveRoom(); return; }
  if(RM.phase!=='wait') return; // 대결 중에는 시작할 때의 참가자 그대로 (나간 사람은 점수판에 남는다)
  RM.players=ps.slice(0,RM.max).map(p=>({id:p.id,name:p.name,eq:p.eq||{},ready:!!p.ready}));
  if(!RM.players.some(p=>isMe(p.id))) RM.players.push(meP());
  if(amHost()) RT.update(RM.code,{cur:RM.players.length});
  if(view==='room') drawRoom();
}
/* 방송 받기 */
function onEvent(ev,p){
  if(!RM) return;
  if(ev==='chat') return say(p,p.txt,true);
  if(ev==='kick'){ if(isMe(p.id)){ toast('방장이 방에서 내보냈어요'); leaveRoom(); } return; }
  if(ev==='closed'){ if(!amHost()){ toast('방장이 방을 닫았어요'); leaveRoom(); } return; }
  if(ev==='cfg'){ RM.sub=p.sub; RM.dan=p.dan; RM.priv=p.priv; if(p.msg) sys(p.msg); if(view==='room'&&RM.phase!=='play') drawRoom(); return; }
  if(ev==='start'){ if(!HG.useTicket()){ toast((HG.block()||{}).msg||'남은 판이 없어요'); leaveRoom(); return; } startMatch(p); return; }
  if(ev==='rd'){ const pl=RM.players.find(x=>x.id===p.id); if(pl){ pl.ready=!!p.ready; if(view==='room'&&RM.phase==='wait') drawRoom(); } return; }
  if(ev==='q') return showQ(p.qi);
  if(ev==='ans') return gotAns(p);
  if(ev==='rev') return revealQ();
  if(ev==='end') return endMatch();
  if(ev==='rp'&&RM.rain){ RM.rain.pops[p.id]=p.pops; RM.rain.miss[p.id]=p.miss; RM.rain.redraw(); if(p.win) RM.rain.win(p.id); }
}

function chatH(){ return `<div class="chat" id="chat" aria-live="polite"></div><div class="quick" role="group" aria-label="빠른 채팅">${QUICK.map((q,i)=>`<button data-q="${i}">${q}</button>`).join('')}</div>`; }
function drawChat(){ const c=screen.querySelector('#chat'); if(!c||!RM) return;
  c.innerHTML=RM.chat.map(m=>m.sys?`<div class="msg sys">${esc(m.txt)}</div>`:`<div class="msg ${isMe(m.id)?'mine':''}">${isMe(m.id)?'':`<span class="who">${esc(m.name)}</span>`}<span class="bub">${esc(m.txt)}</span></div>`).join('');
  c.scrollTop=c.scrollHeight; }
function bindChat(){ screen.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{ if(!RM) return; const now=Date.now(); if(RM.lastSay&&now-RM.lastSay<1200){ toast('조금 천천히 보내요'); return; } RM.lastSay=now; say({id:MID(),name:myName()},QUICK[+b.dataset.q]); }); }

function hostStart(){
  if(!RM||!amHost()) return;
  if(RM.players.length<2){ toast('친구가 들어오면 시작할 수 있어요'); return; }
  if(!HG.useTicket()){ toast((HG.block()||{}).msg||'남은 판이 없어요'); return; }
  const rain=RM.sub==='tko'||RM.sub==='ten';
  LVNOW=RM.lv; let qs; try{ qs=rain?[]:Array.from({length:RM.n},()=>genQ(RM.sub,RM.dan)); } finally{ LVNOW=null; }
  const p={sub:RM.sub,dan:RM.dan,n:RM.n,lv:RM.lv,qs,seq:rain?shuffle(RM.sub==='tko'?PD.tko:PD.ten):null};
  send('start',p); RT.update(RM.code,{state:'play'}); startMatch(p);
}
function drawRoom(){
  if(!RM) return; view='room'; showTabs(false);
  const host=amHost(), me=RM.players.find(p=>isMe(p.id))||meP(), canStart=RM.players.length>=2;
  const hostP=RM.players.find(p=>p.id===RM.hostId);
  setBar('대결방',()=>{ leaveRoom(); toast('방에서 나왔어요'); });
  screen.innerHTML=`
  <section class="sec">
    ${RM.priv?`<div class="roomcode"><div><small>${LI('lock','inl')}비공개 방 · 방 코드</small><b>${RM.code}</b></div>${host?`<button class="btn line" id="copy">${LI('copy')}코드 복사</button>`:`<span class="grade">${LI('users')}참가자</span>`}</div>`
      :`<div class="roomcode pub"><div><small>${LI('users','inl')}공개 방 · 방 코드 ${RM.code}</small><b class="pubt">누구나 들어올 수 있어요</b></div>${host?`<button class="btn line" id="toPriv">${LI('lock')}비공개로</button>`:`<span class="grade">${LI('users')}참가자</span>`}</div>`}
    <div class="roomopt">${SUBJ[RM.sub][0]}${RM.sub==='gugu'?' '+danName(RM.dan):''}${RM.lv!=null&&!['gugu','tko','ten','spell'].includes(RM.sub)?' · '+LVG[RM.lv]+' 수준':''} · ${RM.n}문제 · 최대 ${RM.max}명 · 방장 ${esc(hostP?pName(hostP):RM.hostName||'')}</div>
  </section>
  <section class="sec"><h3 class="sh">${LI('users')}참가자 <small>${RM.players.length} / ${RM.max}</small></h3>
    <div class="players">${Array.from({length:RM.max},(_,i)=>{ const p=RM.players[i]; if(!p) return `<div class="pl empty">${LI('user-plus')}${RM.priv?'코드로 초대':'들어오길 기다려요'}</div>`;
      return `<div class="pl">${p.id===RM.hostId?`<span class="host" aria-label="방장">${LI('crown')}</span>`:''}${host&&!isMe(p.id)?`<button class="kick" data-kick="${esc(p.id)}" aria-label="${esc(p.name)} 내보내기">${LI('x')}</button>`:''}${avatar(p.eq,56)}<b>${esc(pName(p))}</b>${p.id!==RM.hostId?`<span class="rd">${p.ready?'준비 완료':''}</span>`:''}</div>`; }).join('')}</div>
    ${host?`<div style="margin-top:12px">${chipH('rs',Object.entries(SUBJ).map(([k,v])=>[k,v[0]]),RM.sub)}</div>
      <button class="btn y full" id="go" style="margin-top:10px" ${canStart?'':'disabled'}>${LI('swords')}${canStart?'대결 시작 (티켓 1장)':'친구가 들어오면 시작할 수 있어요'}</button>`
      :`<button class="btn ${me.ready?'line':'y'} full" id="ready" style="margin-top:12px">${me.ready?'준비 취소':'준비 완료'}</button><p class="note">방장이 시작하면 대결이 시작돼요. 시작할 때 티켓 1장을 써요.</p>`}
  </section>
  <section class="sec"><h3 class="sh">${LI('message-circle')}채팅 <small>정해진 문구만</small></h3>${chatH()}</section>`;
  drawChat(); bindChat();
  const tp=screen.querySelector('#toPriv'); if(tp) tp.onclick=()=>{ RM.priv=true; RT.update(RM.code,{public:false}); const msg=`비공개로 바꿨어요. 방 코드는 ${RM.code}예요`; send('cfg',{sub:RM.sub,dan:RM.dan,priv:true,msg}); sys(msg); drawRoom(); };
  const cp=screen.querySelector('#copy'); if(cp) cp.onclick=()=>{ try{ navigator.clipboard.writeText(RM.code).then(()=>toast('코드를 복사했어요'),()=>toast(`방 코드: ${RM.code}`)); }catch(e){ toast(`방 코드: ${RM.code}`); } };
  screen.querySelectorAll('[data-kick]').forEach(b=>b.onclick=()=>{ const p=RM.players.find(x=>x.id===b.dataset.kick); if(!p) return; RM.ban.push(p.id); send('kick',{id:p.id}); sys(`${p.name}님을 내보냈어요`); });
  screen.querySelectorAll('[data-rs]').forEach(b=>b.onclick=()=>{ RM.sub=b.dataset.rs; RT.update(RM.code,{subject:RM.sub}); const msg=`과목을 ${SUBJ[RM.sub][0]}(으)로 바꿨어요`; send('cfg',{sub:RM.sub,dan:RM.dan,priv:RM.priv,msg}); sys(msg); drawRoom(); });
  const go=screen.querySelector('#go'); if(go) go.onclick=hostStart;
  const rd=screen.querySelector('#ready'); if(rd) rd.onclick=()=>{ RM.ready=!RM.ready; if(RM.ch) RM.ch.track(myMeta()); send('rd',{id:MID(),ready:RM.ready}); me.ready=RM.ready; drawRoom(); }; // 접속 상태 동기화는 느려서 방송으로도 바로 알린다
}

const QT=10;
function startMatch(p){
  clearT(); RM.first=null; RM.rain=null; RM.spd=null; RM.phase='play'; RM.sub=p.sub; RM.dan=p.dan; RM.n=p.n; if(typeof p.lv==='number') RM.lv=p.lv; RM.qs=p.qs||[]; RM.seq=p.seq; RM.qi=-1;
  RM.score={}; RM.right={}; RM.wrong={}; RM.time={}; RM.players.forEach(pl=>{ RM.score[pl.id]=0; RM.right[pl.id]=0; RM.wrong[pl.id]=0; RM.time[pl.id]=0; });
  view='match'; showTabs(false); setBar(`대결 · ${SUBJ[RM.sub][0]}${RM.sub==='gugu'?' '+danName(RM.dan):''}`,()=>{ leaveRoom(); toast('대결을 그만뒀어요'); });
  let n=3; const app=root.querySelector('.app'); const ov=document.createElement('div'); ov.className='count'; ov.textContent=n; app.appendChild(ov);
  const tick=()=>{ n--; if(!RM){ ov.remove(); return; } if(n<=0){ ov.remove(); if(RM.seq) startRain(); else if(amHost()) hostNext(); } else { ov.textContent=n; later(tick,800); } }; later(tick,800);
}

/* ---------- 타자 대결: 산성비 먼저 깨기 ----------
   모두에게 같은 낱말 비가 내림(방장이 순서를 정해 보냄). 떨어지는 낱말을 똑같이 치면 깨짐(+1). 땅에 닿거나 틀리게 치면 −1.
   목표 개수(방 설정 문제 수)를 가장 먼저 깨면 우승. 최대 120초. 점수 = 깬 수 − 놓친·틀린 수. 서로의 진행은 방송으로 받는다 */
function rainScoreH(){ const r=RM.rain; return `<div class="score">${RM.players.map(p=>`<div class="${isMe(p.id)?'mine':''}">${RM.first===p.id?`<span class="done">${LI('crown')}</span>`:''}${avatar(p.eq,30)}<span>${esc(isMe(p.id)?'나':p.name)}</span><b>${r.pops[p.id]||0}<small style="font-size:11px;color:var(--sub)">/${RM.n}</small></b><span class="rbar"><i style="width:${Math.min(100,(r.pops[p.id]||0)/RM.n*100)}%"></i></span></div>`).join('')}</div>`; }
/* 타수(한글은 자모 단위) */
const K_CHO='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ', K_JUNG='ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ', K_JONG=['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'], K_TWO='ㅘㅙㅚㅝㅞㅟㅢㄳㄵㄶㄺㄻㄼㄽㄾㄿㅀㅄ';
function strokes(w){ let n=0; for(const ch of w){ const o=ch.charCodeAt(0)-0xAC00; if(o>=0&&o<11172){ const j=K_JUNG[Math.floor((o%588)/28)], g=K_JONG[o%28]; n+=1+(K_TWO.includes(j)?2:1)+(g?(K_TWO.includes(g)?2:1):0); } else n++; } return n; }
/* 타자 속도 기록(랭킹용): 산성비·타자 연습에서 낸 평균 속도 중 최고 */
function typCpm(c){ const st=S(); if(c>(st.typCpm||0)){ st.typCpm=c; HG.save(); } }
function startRain(){
  const me=MID(), lang=RM.sub==='tko'?'ko':'en', seq=RM.seq||shuffle(lang==='ko'?PD.tko:PD.ten);
  const r=RM.rain={seq,si:0,words:[],t0:performance.now(),lastSpawn:0,pops:{},miss:{},raf:0,dead:false,keys:0,top:0};
  const cpm=()=>Math.round(r.keys/Math.max((performance.now()-r.t0)/60000,1/60));
  RM.players.forEach(p=>{ r.pops[p.id]=0; r.miss[p.id]=0; });
  screen.innerHTML=`<div class="play"><div id="sc">${rainScoreH()}</div><div class="qtop"><span>먼저 ${RM.n}개 깨기 · 놓치거나 틀리면 −1</span><span class="rspd">속도 <b id="rsp">0</b>타/분</span><span id="tsec">120초</span></div>
    <div class="rain" id="rain"><div class="ground"></div></div>
    <form class="tform" id="tform"><input id="tin" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" lang="${lang}" aria-label="떨어지는 낱말 입력" placeholder="${lang==='ko'?'떨어지는 낱말을 쳐요':'Type the falling word'}"><button class="btn k" type="submit">입력</button></form><div class="fbk" id="fb"></div></div>`;
  const box=screen.querySelector('#rain'), inp=screen.querySelector('#tin'), fb=screen.querySelector('#fb'), H=()=>box.clientHeight;
  setTimeout(()=>{ try{ inp.focus(); }catch(e){} },30);
  const flash=(t,ok)=>{ fb.className='fbk '+(ok?'ok':'no'); fb.textContent=t; };
  r.redraw=()=>{ const sc=screen.querySelector('#sc'); if(sc) sc.innerHTML=rainScoreH(); };
  const tell=win=>send('rp',{id:me,pops:r.pops[me],miss:r.miss[me],win:!!win});
  const pop=w=>{ w.el.classList.add('pop'); setTimeout(()=>w.el.remove(),200); r.words=r.words.filter(x=>x!==w); };
  const check=()=>{ if(r.dead) return; const v=inp.value.trim(); const w=r.words.find(x=>x.t===v); if(w){ sfx('ok'); pop(w); r.pops[me]++; r.keys+=strokes(v)+1; const c=cpm(); if(r.pops[me]>=3) r.top=Math.max(r.top,c); const rs=screen.querySelector('#rsp'); if(rs) rs.textContent=c; inp.value=''; flash('깼어요! +1',true); r.redraw(); const won=r.pops[me]>=RM.n&&!RM.first; tell(won); if(won) r.win(me); } };
  inp.oninput=check;
  screen.querySelector('#tform').onsubmit=e=>{ e.preventDefault(); if(r.dead) return; const v=inp.value.trim(); if(!v) return; if(!r.words.some(x=>x.t===v)){ sfx('no'); r.miss[me]++; inp.value=''; flash(`틀렸어요 −1`,false); missAdd({key:null}); r.redraw(); tell(); } else check(); };
  const spawn=()=>{ const t=r.seq[r.si++%r.seq.length], el=document.createElement('span'); el.className='drop'; el.textContent=t; el.style.left=(4+Math.random()*62)+'%'; box.appendChild(el); r.words.push({t,el,y:-30}); };
  const step=()=>{ if(r.dead||!RM) return; const now=performance.now(), el=(now-r.t0)/1000, left=120-el; const dt=Math.min(.05,(now-(r.prev||now))/1000); r.prev=now;
    const lv=Math.floor(r.pops[me]/5), gap=Math.max(900,1900-lv*180), sp=38+lv*7;
    if(now-r.lastSpawn>gap||!r.words.length){ spawn(); r.lastSpawn=now; }
    r.words.slice().forEach(w=>{ w.y+=sp*dt; w.el.style.transform=`translateY(${w.y}px)`; if(w.y>H()-28){ w.el.classList.add('hit'); setTimeout(()=>w.el.remove(),250); r.words=r.words.filter(x=>x!==w); r.miss[me]++; sfx('no'); flash(`'${w.t}' 놓쳤어요 −1`,false); r.redraw(); tell(); } });
    const s=screen.querySelector('#tsec'); if(s) s.textContent=Math.ceil(Math.max(0,left))+'초'; if(!r.tick||now-r.tick>500){ r.tick=now; const rs=screen.querySelector('#rsp'); if(rs) rs.textContent=cpm(); }
    if(left<=0) return finish(null);
    r.raf=requestAnimationFrame(step); };
  r.raf=requestAnimationFrame(step);
  r.win=id=>{ if(RM.first||r.dead) return; RM.first=id; finish(id); };
  function finish(id){ if(r.dead) return; r.dead=true; cancelAnimationFrame(r.raf); const el=(performance.now()-r.t0)/1000;
    RM.spd={avg:cpm(),top:r.top||cpm(),keys:r.keys}; typCpm(RM.spd.avg); RM.qs=[]; RM.players.forEach(p=>{ RM.right[p.id]=r.pops[p.id]||0; RM.wrong[p.id]=r.miss[p.id]||0; RM.score[p.id]=(r.pops[p.id]||0)-(r.miss[p.id]||0); RM.time[p.id]=p.id===id?el:120; });
    const who=id&&RM.players.find(p=>p.id===id);
    flash(isMe(id)?'먼저 다 깼어요! 우승!':who?`${who.name}님이 먼저 다 깼어요`:'시간이 끝났어요',isMe(id)); inp.disabled=true;
    later(endMatch,1400); }
}

/* ---------- 문제 대결: 방장이 다음 문제·정답 공개를 정한다 ---------- */
function scoreH(){ return `<div class="score">${RM.players.map(p=>`<div class="${isMe(p.id)?'mine':''}">${RM.ans&&RM.ans[p.id]!==undefined?`<span class="done">${LI('check')}</span>`:''}${avatar(p.eq,36)}<span>${esc(isMe(p.id)?'나':p.name)}</span><b>${RM.score[p.id]||0}</b></div>`).join('')}</div>`; }
function hostNext(){
  if(!RM||!amHost()||RM.phase!=='play') return;
  const qi=RM.qi+1;
  if(qi>=RM.qs.length){ send('end',{}); RT.update(RM.code,{state:'wait'}); return endMatch(); }
  send('q',{qi}); showQ(qi);
}
function showQ(qi){
  if(!RM||RM.phase!=='play') return; const c=RM.qs[qi]; if(!c) return;
  if(RM.iv){ clearInterval(RM.iv); RM.iv=null; }
  RM.qi=qi; RM.ans={}; RM.t0=performance.now(); RM.reveal=false;
  screen.innerHTML=`<div class="play"><div id="sc">${scoreH()}</div>
    <div class="qtop"><span>${qi+1} / ${RM.qs.length}</span><span id="tsec">${QT}초</span></div><div class="timer"><i id="tbar"></i></div>
    ${qBoxH(c)}${optsH(c)}<div class="fbk" id="fb"></div></div>`;
  screen.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>answerQ(c.c[+b.dataset.o],b));
  bindType(c,v=>answerQ(v,null));
  RM.iv=setInterval(()=>{ if(!RM) return; const left=QT*1000-(performance.now()-RM.t0); const t=screen.querySelector('#tbar'); if(t) t.style.transform=`scaleX(${Math.max(0,left/(QT*1000))})`; const s=screen.querySelector('#tsec'); if(s) s.textContent=Math.ceil(Math.max(0,left)/1000)+'초';
    if(left<=0){ if(amHost()) hostReveal(); else { clearInterval(RM.iv); RM.iv=null; } } },100);
}
function record(id,pts,t){ RM.ans[id]=pts; RM.score[id]=(RM.score[id]||0)+pts; if(pts>0){ RM.right[id]=(RM.right[id]||0)+1; RM.time[id]=(RM.time[id]||0)+t; } else if(pts<0) RM.wrong[id]=(RM.wrong[id]||0)+1;
  const sc=screen.querySelector('#sc'); if(sc) sc.innerHTML=scoreH();
  if(amHost()&&RM.players.every(p=>RM.ans[p.id]!==undefined)) later(hostReveal,350); }
function answerQ(you,btn){
  const me=MID(); if(!RM||RM.reveal||RM.ans[me]!==undefined) return; const c=RM.qs[RM.qi], ok=you===c.ans, left=Math.max(0,QT-(performance.now()-RM.t0)/1000), pts=ok?1:-1;
  sfx(ok?'ok':'no'); if(!ok) missAdd(c);
  screen.querySelectorAll('[data-o]').forEach(b=>b.disabled=true); const ti=screen.querySelector('#tin'); if(ti){ ti.disabled=true; ti.classList.add(ok?'ok':'no'); } if(btn) btn.classList.add(ok?'ok':'no');
  const f=screen.querySelector('#fb'); f.className='fbk '+(ok?'ok':'no'); f.textContent=ok?'정답! +1':'틀렸어요 −1';
  send('ans',{id:me,qi:RM.qi,pts,t:QT-left}); record(me,pts,QT-left);
}
function gotAns(p){ if(!RM||RM.phase!=='play'||p.qi!==RM.qi||RM.reveal||RM.ans[p.id]!==undefined) return; record(p.id,p.pts,p.t); }
function hostReveal(){ if(!RM||RM.reveal||!amHost()) return; send('rev',{qi:RM.qi}); revealQ(); later(hostNext,1300); }
function revealQ(){
  if(!RM||RM.reveal) return; RM.reveal=true; if(RM.iv){ clearInterval(RM.iv); RM.iv=null; } const c=RM.qs[RM.qi]; if(!c) return;
  RM.players.forEach(p=>{ if(RM.ans[p.id]===undefined) RM.ans[p.id]=0; });
  screen.querySelectorAll('[data-o]').forEach(b=>{ b.disabled=true; if(c.c[+b.dataset.o]===c.ans) b.classList.add('ok'); });
  const f=screen.querySelector('#fb'); if(f&&!f.textContent){ f.className='fbk no'; f.textContent='시간이 끝났어요 · 0점'; }
  const sc=screen.querySelector('#sc'); if(sc) sc.innerHTML=scoreH();
}
function endMatch(){
  if(!RM||RM.phase==='end') return;
  const st=S(), me=MID(); clearT(); RM.phase='end'; view='room';
  const rank=RM.players.slice().sort((a,b)=>((RM.first===b.id)-(RM.first===a.id))||((RM.score[b.id]||0)-(RM.score[a.id]||0))||((RM.time[a.id]||0)-(RM.time[b.id]||0))); const my=rank.findIndex(p=>isMe(p.id))+1;
  const gain=HG.gEarn(Math.max(0,RM.score[me]||0)); st.battles=(st.battles||0)+1; if(my===1) st.wins=(st.wins||0)+1; HG.save();
  setBar('대결 결과',()=>{ leaveRoom(); });
  const pod=[rank[1],rank[0],rank[2]];
  screen.innerHTML=`<section class="sec center">
    <h3 class="sh" style="justify-content:center">${my===1?`${LI('trophy')}우승!`:`${my}등`}</h3>
    <div class="podium">${pod.map((p,i)=>p?`<div class="pod p${[2,1,3][i]}">${avatar(p.eq,i===1?64:52)}<span>${esc(isMe(p.id)?'나':p.name)}</span><small>${RM.score[p.id]||0}점</small><div class="blk">${[2,1,3][i]}</div></div>`:'<div></div>').join('')}</div>
    <ul class="rlist">${rank.map((p,i)=>`<li class="${isMe(p.id)?'mine':''}"><span class="n">${i+1}</span>${avatar(p.eq,36)}<span class="nm">${esc(pName(p))}<small>맞힘 ${RM.right[p.id]||0} · 틀림 ${RM.wrong[p.id]||0} · ${(RM.time[p.id]||0).toFixed(1)}초</small></span><span class="v">${RM.score[p.id]||0}</span></li>`).join('')}</ul>
    ${RM.spd?`<div class="spdres"><div><small>내 평균 속도</small><b>${RM.spd.avg}<i>타/분</i></b></div><div><small>최고 속도</small><b>${RM.spd.top}<i>타/분</i></b></div><div><small>친 타수</small><b>${RM.spd.keys}<i>타</i></b></div></div>`:''}
    <p style="margin:14px 0 4px"><span class="reward">${LI('coins')}+${gain}</span></p>
    <p class="note">점수 = 맞힌 문제 − 틀린 문제 · 같으면 빨리 푼 사람이 위<br>캐시도 내 점수만큼 받아요 (0점 이하면 0, 게임 캐시는 하루 ${HG.GAME_CAP}까지)</p>
  </section>
  <section class="sec"><h3 class="sh">${LI('message-circle')}채팅</h3>${chatH()}</section>
  <section class="sec"><div class="row">${amHost()?`<button class="btn y" id="again">${LI('repeat')}한 판 더</button>`:''}<button class="btn line" id="toRoom">${LI('door-open')}방으로</button><button class="btn line" id="out">나가기</button></div></section>`;
  drawChat(); bindChat();
  if(amHost()) RT.update(RM.code,{state:'wait'});
  const ag=screen.querySelector('#again'); if(ag) ag.onclick=()=>{ RM.phase='wait'; hostStart(); };
  screen.querySelector('#toRoom').onclick=()=>{ RM.phase='wait'; RM.ready=false; if(RM.ch) RM.ch.track(myMeta()); drawRoom(); };
  screen.querySelector('#out').onclick=()=>{ leaveRoom(); };
}

/* ---------- 랭킹 ---------- */
let rankMode='week';
function friendVal(f,mode){ const dow=(HG.dayN()+3)%7; const s=f.seed;
  if(mode==='week') return Math.round(s*0.6+(dow+1)*(18+s%23));
  if(mode==='total') return 300+s*31%2900;
  if(mode==='typ') return 110+(s*37)%320;
  return s%13; }
function renderRank(){
  const st=S(); setBar('랭킹');
  const wk=(st.wk||{})[HG.wkN(HG.dayN())]||0;
  const meV=rankMode==='week'?wk:rankMode==='total'?st.xp:rankMode==='typ'?(st.typCpm||0):(st.wins||0);
  const rows=[...FRIENDS.map(f=>({name:f.name,eq:f.eq,v:friendVal(f,rankMode),xp:friendVal(f,'total')})),{name:myName(),eq:st.eq,v:meV,xp:st.xp,me:true}].sort((a,b)=>b.v-a.v||(a.me?-1:1));
  const mi=rows.findIndex(r=>r.me), unit=rankMode==='wins'?'승':rankMode==='week'?'문제':rankMode==='typ'?'타/분':'XP';
  const above=mi>0?rows[mi-1]:null;
  const pod=[rows[1],rows[0],rows[2]];
  screen.innerHTML=`<section class="sec">
    <div class="podium">${pod.map((p,i)=>`<div class="pod p${[2,1,3][i]}">${avatar(p.eq,i===1?64:52)}<span>${esc(p.me?'나':p.name)}</span><small>${p.v}${unit}</small><div class="blk">${[2,1,3][i]}</div></div>`).join('')}</div>
    <ul class="rlist">${rows.map((r,i)=>`<li class="${r.me?'mine':''}"><span class="n">${i+1}</span>${avatar(r.eq,36)}<span class="nm">${esc(r.me?(S().name?S().name+' (나)':'나'):r.name)}<small>${HG.GRADES[HG.gradeOf(r.xp)].n} 등급</small></span><span class="v">${r.v}${unit}</span></li>`).join('')}</ul>
    <div class="gap">${mi===0?'지금 1등이에요!':`${esc(myName())}은(는) 지금 ${mi+1}등 · ${esc(above.name)}까지 ${above.v-meV+1}${unit}`}</div>
    <p class="note">${rankMode==='typ'?'타자 연습(정확도 90% 이상)과 산성비에서 낸 평균 속도 중 가장 빠른 기록이에요. 한글은 자모 하나가 1타예요.':rankMode==='week'?'이번 주 모든 과목에서 맞힌 문제 수예요. 월요일에 새로 시작해요.':rankMode==='total'?'지금까지 쌓은 XP(맞힌 문제 수)예요. 등급은 내려가지 않아요.':'대결방에서 1등 한 횟수예요.'} 친구 6명은 예시 닉네임이에요.</p>
  </section>`;
}

window.navBadges=navBadges;
navGo(env.start||'game', env.sub);

return {
  go(t, sub) { navGo(t, sub); },
  destroy() { try { leaveRoom(true); } catch (e) {} root.innerHTML = ''; },
};
}
