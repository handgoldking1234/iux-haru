/* eslint-disable */
// @ts-nocheck
/**
 * 한자씨앗 데이터·문제 생성 — prototype/build/app.js 16~334줄을 그대로 옮김 (자동 생성: scripts/hanja-core.mjs, 직접 고치지 않기)
 * env: { SK(): 획순 데이터|null, writeOn(): boolean, setWrite(on), LI(name, cls): 아이콘 SVG, PIC: 본뜬 모양 그림 }
 */
export function createHanjaCore(D, env) {
const LI = env.LI;
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};


const LV=D.LV;
const CH={}; D.CH.forEach(r=>{CH[r[0]]={h:r[0],hun:r[1],eum:r[2],alt:r[3],lv:r[4],rad:r[5],st:r[6]};});
const ALL=Object.keys(CH);
const BYRAD={}; ALL.forEach(h=>{(BYRAD[CH[h].rad]=BYRAD[CH[h].rad]||[]).push(h);});
/* ---------- 천자문 (千字文) ---------- */
const CJ=D.CJM||null, PH=CJ?CJ.ph:[], CJMOF={};
if(CJ) PH.forEach((x,i)=>Array.from(x.p).forEach((c,k)=>{ if(!CJMOF[c]) CJMOF[c]=i; if(!CH[c]){ const m=String(x.h[k]).trim().match(/^(.*)\s(\S)$/); CH[c]={h:c,hun:m?m[1]:x.h[k],eum:m?m[2]:x.r[k],alt:'',lv:LV.length-1,rad:'',st:0,cj:true}; } }));
const phTag=i=>`<span class="hz">${PH[i].p}</span>`;
Object.values(BYRAD).forEach(a=>a.sort((x,y)=>CH[x].lv-CH[y].lv||CH[x].st-CH[y].st));

/* ---------- 부수 60자 (3,500자의 약 78%를 덮음) ----------
   [부수, 훈음, 별명, 변형, 만들어진 원리] */
const RTHEME=['사람과 몸','자연','식물과 동물','집과 도구','움직임과 말','수와 모양'];
const RADS=[
['人','사람 인','사람인변(亻)','亻','옆에서 본 사람 모양이에요. 글자 왼쪽에 올 때는 亻로 써요.'],
['儿','어진사람 인','걷는사람인발','','사람의 두 다리 모양이에요. 주로 글자 아래에 와요.'],
['女','계집 녀','계집녀변','','두 손을 모으고 무릎 꿇고 앉은 여자 모양이에요.'],
['子','아들 자','아들자변','','포대기에 싸여 두 팔을 내민 아기 모양이에요.'],
['口','입 구','입구변','','벌린 입 모양이에요. 말하기·먹기, 또는 네모난 물건을 나타내요.'],
['目','눈 목','눈목변','','눈을 세워 놓은 모양이에요. 보는 것과 관련 있어요.'],
['耳','귀 이','귀이변','','귀의 모양이에요. 듣는 것과 관련 있어요.'],
['手','손 수','재방변(扌)','扌','다섯 손가락을 편 손 모양이에요. 왼쪽에 올 때는 扌로 써요.'],
['足','발 족','발족변(⻊)','⻊','무릎에서 발끝까지의 모양이에요. 왼쪽에 올 때는 ⻊로 써요.'],
['心','마음 심','심방변(忄)·밑마음심(⺗)','忄','심장 모양이에요. 옛사람은 마음이 심장에 있다고 생각했어요. 왼쪽에선 忄로 써요.'],
['日','날 일','날일변','','둥근 해 모양이에요. 해·날·시간과 관련 있어요.'],
['月','달 월','달월변','','초승달 모양이에요. 달·시간과 관련 있어요. (고기 肉이 변한 月과 구별해요)'],
['水','물 수','삼수변(氵)','氵','흐르는 물줄기 모양이에요. 왼쪽에 올 때는 물방울 셋 氵로 써요.'],
['火','불 화','연화발(灬)','灬','타오르는 불꽃 모양이에요. 글자 아래에선 점 넷 灬로 써요.'],
['木','나무 목','나무목변','','가지와 뿌리가 있는 나무 모양이에요.'],
['土','흙 토','흙토변','','땅 위에 쌓인 흙덩이 모양이에요. 땅·장소와 관련 있어요.'],
['山','메 산','메산','','봉우리 세 개가 솟은 산 모양이에요.'],
['金','쇠 금','쇠금변','','흙 속에 묻힌 광물 모양이에요. 쇠·금속과 관련 있어요.'],
['石','돌 석','돌석변','','언덕(厂) 아래 굴러 있는 돌덩이(口) 모양이에요.'],
['雨','비 우','비우','','하늘에서 빗방울이 떨어지는 모양이에요. 날씨와 관련 있어요.'],
['艸','풀 초','초두머리(艹)','艹','풀 두 포기가 돋은 모양이에요. 글자 위에서는 艹로 써요.'],
['竹','대 죽','대죽머리(⺮)','⺮','대나무 잎 모양이에요. 글자 위에서는 ⺮로 써요. 옛날엔 대나무에 글을 썼어요.'],
['禾','벼 화','벼화변','','이삭이 고개 숙인 벼 모양이에요. 곡식·세금과 관련 있어요.'],
['米','쌀 미','쌀미변','','낟알이 흩어진 모양이에요. 쌀·가루와 관련 있어요.'],
['糸','실 사','실사변(糹)','糹','꼬아 놓은 실타래 모양이에요. 실·천·잇는 것과 관련 있어요.'],
['田','밭 전','밭전','','둑으로 나뉜 밭 모양이에요.'],
['牛','소 우','소우변(牜)','牜','뿔이 난 소 머리 모양이에요.'],
['犬','개 견','개사슴록변(犭)','犭','개 모양이에요. 왼쪽에서는 犭로 쓰고 짐승과 관련 있어요.'],
['貝','조개 패','조개패','','조개 모양이에요. 옛날엔 조개를 돈으로 써서 재물과 관련 있어요.'],
['隹','새 추','새추','','꽁지가 짧은 새 모양이에요.'],
['宀','집 면','갓머리','','지붕이 덮인 집 모양이에요.'],
['广','집 엄','엄호','','벽 한쪽에 지붕을 얹은 집 모양이에요.'],
['門','문 문','문문','','좌우 두 짝으로 된 문 모양이에요.'],
['囗','에워쌀 위','큰입구몸','','사방을 둘러싼 울타리 모양이에요. 口보다 크게 바깥을 감싸요.'],
['尸','주검 시','주검시엄','','몸을 웅크린 사람 모양이에요. 몸·집과 관련 있어요.'],
['刀','칼 도','선칼도방(刂)','刂','칼 모양이에요. 오른쪽에 올 때는 刂로 써요.'],
['弓','활 궁','활궁','','활 모양이에요.'],
['戈','창 과','창과','','긴 자루 끝에 날이 달린 창 모양이에요. 싸움과 관련 있어요.'],
['車','수레 거','수레거','','위에서 내려다본 수레(바퀴와 굴대) 모양이에요.'],
['衣','옷 의','옷의변(衤)','衤','옷깃을 여민 웃옷 모양이에요. 왼쪽에서는 衤로 써요.'],
['言','말씀 언','말씀언변','','입(口)에서 말이 나오는 모양이에요.'],
['辵','쉬엄쉬엄 갈 착','책받침(辶)','辶','길을 가다 멈추다 하는 발 모양이에요. 글자 왼쪽 아래를 받치는 辶로 써요.'],
['彳','조금 걸을 척','두인변','','네거리 길의 왼쪽 반 모양이에요. 가는 것과 관련 있어요.'],
['攴','칠 복','등글월문(攵)','攵','손에 막대를 들고 치는 모양이에요. 오른쪽에서는 攵로 써요.'],
['力','힘 력','힘력','','팔에 힘을 준 모양(또는 쟁기)이에요.'],
['示','보일 시','보일시변(礻)','礻','제물을 올린 제사상 모양이에요. 신·제사와 관련 있고 왼쪽에선 礻로 써요.'],
['頁','머리 혈','머리혈','','머리를 크게 강조한 사람 모양이에요.'],
['邑','고을 읍','우부방(阝·오른쪽)','阝','사람이 모여 사는 고을이에요. 글자 오른쪽의 阝은 고을 읍이에요.'],
['阜','언덕 부','좌부변(阝·왼쪽)','阝','층층이 쌓인 언덕 모양이에요. 글자 왼쪽의 阝은 언덕 부예요.'],
['肉','고기 육','육달월(月)','月','고깃덩이 모양이에요. 몸과 관련 있고, 글자 안에서는 月처럼 써요.'],
['一','한 일','한일','','가로획 하나로 "하나"를 나타냈어요.'],
['十','열 십','열십','','가로·세로가 만나 "열"을 나타냈어요.'],
['八','여덟 팔','여덟팔','','양쪽으로 나뉘는 모양이에요. 나누는 것과 관련 있어요.'],
['大','큰 대','큰대','','팔다리를 크게 벌리고 선 사람 모양이에요.'],
['小','작을 소','작을소','','작은 점 셋으로 "작다"를 나타냈어요.'],
['立','설 립','설립','','땅(一) 위에 사람이 서 있는 모양이에요.'],
['白','흰 백','흰백','','해 위로 빛이 비치는 모양이에요. "희다, 밝다"예요.'],
['見','볼 견','볼견','','눈(目)을 크게 뜬 사람(儿) 모양이에요.'],
['食','밥 식','밥식변(飠)','飠','뚜껑 덮인 그릇에 담긴 밥 모양이에요. 왼쪽에서는 飠로 써요.'],
['玉','구슬 옥','구슬옥변(王)','王','구슬을 끈에 꿴 모양이에요. 글자 왼쪽에서는 점 없이 王으로 써요.']];
const RADI={}; RADS.forEach(([r,hun,nick,vr,desc])=>RADI[r]={r,hun,nick,vr,desc});
const radHun=r=> RADI[r]?RADI[r].hun:CH[r]?`${CH[r].hun} ${CH[r].eum}`:(D.CP[r]||r);
const radLab=r=> `${r}${RADI[r]&&RADI[r].vr&&RADI[r].vr!==r?`<small class="vr">${RADI[r].vr}</small>`:''}`;

/* ---------- 단원 길: 두 갈래 ----------
   school(학교 필수): 부수 → 초등 필수(어문회 8~6급 300자) → 중등 필수(교육용 기초 한자 1,800자 중 5급Ⅱ~4급) → 고등 필수(기초 한자 중 3급Ⅱ~2급)
   grade(급수별): 부수 → 한국어문회 8급 → … → 1급 (3,500자) */
const BASIC=new Set(Array.from(D.BASIC||''));
const SCH=[['초등',c=>CH[c].lv<=4],['중등',c=>CH[c].lv>=5&&CH[c].lv<=8&&BASIC.has(c)],['고등',c=>CH[c].lv>=9&&BASIC.has(c)]];
let TRK='school', STAGES=[], IDX={}, STOF={}, RSTOF={}, AREAS=[], KEY='';
function buildTrack(trk){
  TRK=trk==='grade'?'grade':trk==='cjm'&&CJ?'cjm':'school'; 
  STAGES=[];
  if(TRK==='cjm') return buildCjm();
  RTHEME.forEach((t,i)=>STAGES.push({kind:'rad',area:'부수',g:'부수',n:i+1,theme:t,name:`부수 ${i+1}단원`,chars:RADS.slice(i*10,i*10+10).map(x=>x[0])}));
  STAGES.push({kind:'exam',area:'부수',g:'부수',name:'부수 확인 평가',chars:RADS.map(x=>x[0])});
  if(TRK==='grade'){
    D.ST.forEach(([lv,n,cs],k)=>{
      STAGES.push({kind:'char',lvI:lv,area:LV[lv],g:LV[lv],n,name:`${LV[lv]} ${n}단원`,chars:Array.from(cs)});
      const nx=D.ST[k+1]; if(!nx||nx[0]!==lv) STAGES.push({kind:'exam',lvI:lv,area:LV[lv],g:LV[lv],name:`${LV[lv]} 승급 평가`,chars:ALL.filter(h=>CH[h].lv===lv)});
    });
  } else {
    const order=D.ST.flatMap(([lv,n,cs])=>Array.from(cs));
    SCH.forEach(([a,f])=>{ const cs=order.filter(f), lvI=Math.max(...cs.map(c=>CH[c].lv)); const groups=[];
      for(let i=0;i<cs.length;i+=10) groups.push(cs.slice(i,i+10));
      if(groups.length>1&&groups[groups.length-1].length<5){ const last=groups.pop(); groups[groups.length-1]=groups[groups.length-1].concat(last); }
      groups.forEach((g,n)=>STAGES.push({kind:'char',lvI,area:a,g:a,n:n+1,name:`${a} 필수 ${n+1}단원`,chars:g}));
      STAGES.push({kind:'exam',lvI,area:a,g:a,name:`${a} 필수 승급 평가`,chars:cs}); });
  }
  STAGES.forEach((s,i)=>{s.id='s'+i; if(s.lvI===undefined) s.lvI=0;});
  IDX=Object.fromEntries(STAGES.map((s,i)=>[s.id,i]));
  STOF={}; RSTOF={}; STAGES.forEach(s=>{ if(s.kind==='char') s.chars.forEach(c=>STOF[c]=s.id); if(s.kind==='rad') s.chars.forEach(c=>RSTOF[c]=s.id); });
  AREAS=TRK==='grade'?['부수',...LV]:['부수','초등','중등','고등'];
  KEY=TRK==='grade'?'hanja-ssiat-v3':'hanja-school-v1';
}
const TRKN=CJ?{school:'학교 필수',grade:'급수별',cjm:'천자문'}:{school:'학교 필수 (초·중·고)',grade:'급수별 (8급~1급)'};
/* 천자문: 50구절씩 5부, 한 단원 = 4구절(16자) */
function buildCjm(){
  const top=LV.length-1;
  CJ.parts.forEach(pt=>{ let n=0;
    for(let a=pt.from-1;a<pt.to;a+=4){ const ids=[]; for(let i=a;i<Math.min(a+4,pt.to);i++) ids.push(i); n++;
      STAGES.push({kind:'char',cjm:true,lvI:top,area:pt.name,g:pt.name,n,name:`천자문 ${pt.name} ${n}단원`,title:pt.title,ph:ids,chars:ids.flatMap(i=>Array.from(PH[i].p))}); }
    const all=[]; for(let i=pt.from-1;i<pt.to;i++) all.push(i);
    STAGES.push({kind:'exam',cjm:true,lvI:top,area:pt.name,g:pt.name,name:`천자문 ${pt.name} 평가`,ph:all,chars:all.flatMap(i=>Array.from(PH[i].p))}); });
  STAGES.forEach((s,i)=>{s.id='s'+i;});
  IDX=Object.fromEntries(STAGES.map((s,i)=>[s.id,i]));
  STOF={}; RSTOF={}; STAGES.forEach(s=>{ if(s.kind==='char'){ s.chars.forEach(c=>STOF[c]=s.id); s.ph.forEach(i=>STOF['P'+i]=s.id); } });
  AREAS=CJ.parts.map(x=>x.name); KEY='hanja-cjm-v1';
}
function phInfoHTML(id){
  const i=+id.slice(1), x=PH[i], prv=PH[i-1], nxt=PH[i+1];
  return `<div class="info cjinfo"><div class="cjp"><span class="lk">천자문 ${i+1}번째 구절</span>
    <div class="cjrow">${Array.from(x.p).map((c,k)=>`<div><b class="hz">${c}</b><small>${x.h[k]}</small></div>`).join('')}</div>
    <p class="cjr">${x.r}</p><p class="cjm">${x.m}</p>${x.x?`<p class="cjx">${x.x}</p>`:''}</div>
    <div class="wl"><span class="lk">앞뒤 구절</span>${prv?`<div><span class="w hz">${prv.p}</span><span class="r">${prv.r}</span><small>${prv.m}</small></div>`:''}${nxt?`<div><span class="w hz">${nxt.p}</span><span class="r">${nxt.r}</span><small>${nxt.m}</small></div>`:''}</div></div>`;
}
function phOpts(i,n,f){ const s=STAGES[IDX[STOF['P'+i]]]||{}, near=shuffle((s.ph||[]).filter(j=>j!==i)), far=shuffle(PH.map((_,j)=>j).filter(j=>j!==i&&!near.includes(j)));
  const out=[], seen=new Set([f(i)]); for(const j of [...near,...far]){ const v=f(j); if(!seen.has(v)){ seen.add(v); out.push(v); } if(out.length>=n) break; } return out; }
function phraseQ(spec){
  const i=+String(spec.ch).slice(1), x=PH[i]; let t=spec.t; const base={ch:spec.ch,t,st:STOF[spec.ch]};
  if(t==='pn'){ const j=i+1<PH.length?i+1:i-1, prev=j<i;
    return {...base,ask:prev?'이 구절 바로 앞에 오는 구절은?':'이 구절 다음에 오는 구절은?',q:`<span class="hz">${x.p}</span>`,qc:'hz2',hint:`<span class="hint">${x.r} · ${x.m}</span>`,choices:shuffle([PH[j].p,...phOpts(j,3,k=>PH[k].p).filter(v=>v!==x.p).slice(0,3)]),ans:PH[j].p,lab:v=>v}; }
  if(t==='pb'){ const k=spec.x!=null?spec.x:Math.floor(Math.random()*4), c=x.p[k], shown=Array.from(x.p).map((y,m)=>m===k?'<span class="cjb">?</span>':y).join('');
    const pool=shuffle(PH.flatMap((y,j)=>j===i?[]:Array.from(y.p)).filter(y=>y!==c)); const opts=[...new Set(pool)].slice(0,3);
    return {...base,x:k,ask:'빈칸에 들어갈 한자는?',q:`<span class="hz">${shown}</span>`,qc:'hz2',hint:`<span class="hint">${x.m}</span>`,choices:shuffle([c,...opts]),ans:c,lab:v=>v}; }
  if(t==='pr'){ const sy=Array.from(x.r), opts=new Set(); for(let tries=0;tries<40&&opts.size<3;tries++){ const k=Math.floor(Math.random()*4), ch=x.p[k], e=CH[ch]&&!CH[ch].cj?pick(eumOpts(ch,4)):pick(PH[Math.floor(Math.random()*PH.length)].r.split(''));
      const a=[...sy]; a[k]=e; const v=a.join(''); if(v!==x.r) opts.add(v); }
    return {...base,ask:'이 구절은 어떻게 읽을까요?',q:`<span class="hz">${x.p}</span>`,qc:'hz2',hint:'',choices:shuffle([x.r,...opts]),ans:x.r,lab:null}; }
  return {...base,t:'pm',ask:'이 구절의 뜻은?',q:`<span class="hz">${x.p}</span>`,qc:'hz2',hint:`<span class="hint">${x.r}</span>`,choices:shuffle([x.m,...phOpts(i,3,k=>PH[k].m)]),ans:x.m,lab:null};
}
const readings=h=>[CH[h].eum,...(CH[h].alt?CH[h].alt.split(' / ').map(x=>x.trim().split(' ').pop()):[])];
const esc0=v=>String(v==null?'':v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const hunum=h=>CH[h]?`${CH[h].hun} ${CH[h].eum}`:radHun(h);
const LV_=(id,p)=>{ const k=((p.bp||{})[id]||0); return k<3?'쉬움':k<6?'보통':'어려움'; };
const findSt=name=>STAGES.findIndex(s=>s.name===name);

/* ---------- 관련 단어 ---------- */
const WC={};
function wordsOf(h){ if(WC[h]) return WC[h];
  return WC[h]=(D.WD[h]||'').split(' ').filter(Boolean).map(t=>{const a=Array.from(t);return {w:a.slice(0,2).join(''),r:a.slice(2).join(''),cs:a.slice(0,2)};}); }
const wlv=w=>Math.max(...w.cs.map(c=>CH[c]?CH[c].lv:99));
const gloss=w=>w.cs.map(c=>CH[c]?CH[c].hun:c).join(' + ');

/* ---------- 생성원리 ---------- */
const MAN={
'一':['지사','가로획 하나로 수 "하나"를 나타냈어요.'],
'二':['지사','가로획 둘로 "둘"을 나타냈어요.'],
'三':['지사','가로획 셋으로 "셋"을 나타냈어요.'],
'四':['가차','처음엔 가로획 넷(亖)으로 썼는데, 三과 헷갈려서 숨 쉬는 입 모양 글자를 빌려 "넷"으로 쓰게 됐어요.'],
'五':['지사','하늘(一)과 땅(一) 사이에서 두 기운이 엇갈리는 모양으로 "다섯"을 나타냈어요.'],
'六':['가차','지붕이 있는 집 모양 글자를 빌려 숫자 "여섯"으로 썼어요.'],
'七':['가차','가로획을 세로로 자르는 모양으로, 본래 "자르다"는 뜻이었는데 숫자 "일곱"으로 빌려 썼어요.'],
'八':['지사','물건이 양쪽으로 갈라지는 모양이에요. "나누다"에서 숫자 "여덟"으로 빌려 썼어요.'],
'九':['가차','굽은 팔꿈치 모양을 빌려 숫자 "아홉"으로 썼어요.'],
'十':['지사','세로 막대 하나로 열 묶음을 나타냈고, 뒤에 가운데 점이 가로획이 됐어요.'],
'人':['상형','옆에서 본 사람이 허리를 굽히고 서 있는 모양이에요.'],
'土':['상형','땅 위에 흙덩이가 쌓여 있는 모양이에요.'],
'大':['상형','사람이 두 팔과 두 다리를 크게 벌리고 선 모양이에요.'],
'女':['상형','두 손을 모으고 무릎 꿇고 앉아 있는 여자의 모양이에요.'],
'寸':['지사','손(又) 아래 손목 맥을 짚는 자리에 점을 찍었어요. 손바닥에서 그곳까지가 한 "마디"예요.'],
'小':['상형','작은 점 세 개로 "작다"를 나타냈어요.'],
'山':['상형','봉우리 세 개가 솟은 산 모양이에요.'],
'中':['지사','네모(口)의 한가운데를 세로선이 꿰뚫어 "가운데"를 나타냈어요. 가운데 꽂은 깃발 모양으로 보기도 해요.'],
'日':['상형','둥근 해 가운데 점이 있는 모양이에요.'],
'月':['상형','이지러진 초승달 모양이에요.'],
'木':['상형','위로 뻗은 가지와 아래로 내린 뿌리가 있는 나무 모양이에요.'],
'水':['상형','가운데 큰 물줄기 옆으로 작은 물방울이 흐르는 모양이에요.'],
'火':['상형','불꽃이 위로 타오르는 모양이에요.'],
'父':['상형','손에 돌도끼(회초리)를 든 모양이에요. 집안을 이끄는 아버지를 뜻해요.'],
'王':['상형','큰 도끼 모양이에요. 도끼는 힘과 권위를 뜻해 "임금"이 됐어요. 하늘·땅·사람(三)을 하나로 꿰는(丨) 사람으로 풀기도 해요.'],
'兄':['회의','입(口) 아래 사람(儿) — 앞장서서 말하고 이끄는 사람, "형"이에요.'],
'北':['회의','두 사람(人·匕)이 서로 등을 지고 있는 모양이에요. "등지다"에서 해를 등지는 쪽 "북녘"이 됐어요.'],
'外':['회의','저녁(夕)에 점(卜)을 치는 것은 보통 때가 아닌 예외라서 "바깥"이 됐어요.'],
'母':['상형','여자(女)의 가슴에 두 점(젖)을 더해 아이를 기르는 "어머니"를 나타냈어요.'],
'民':['상형','옛 글자는 한쪽 눈을 가린 사람 모양으로, 다스림을 받는 사람들인 "백성"을 뜻했어요.'],
'生':['상형','땅(土) 위로 새싹이 돋아나는 모양이에요. "나다, 살다"를 뜻해요.'],
'白':['상형','해(日) 위로 빛이 비치는 모양으로 "희다, 밝다"를 나타냈어요.'],
'先':['회의','발(止) 모양이 사람(儿)보다 앞서 있어 "먼저"를 뜻해요.'],
'年':['회의','사람(人)이 잘 익은 벼(禾)를 지고 가는 모양이에요. 벼는 한 해에 한 번 거두니 "해"가 됐어요.'],
'西':['상형','새 둥지 모양이에요. 해가 서쪽으로 질 때 새가 둥지로 돌아오니 "서녘"이 됐어요.'],
'弟':['상형','막대에 끈을 차례차례 감은 모양이에요. "차례"에서 형 다음인 "아우"가 됐어요.'],
'東':['가차','양 끝을 묶은 자루 모양인데 "동녘"으로 빌려 썼어요. 해(日)가 나무(木) 사이로 떠오르는 모습으로 외우면 쉬워요.'],
'長':['상형','머리카락이 길게 자란 노인이 지팡이를 짚은 모양이에요. "길다, 어른"을 뜻해요.'],
'門':['상형','좌우 두 짝으로 된 문 모양이에요.'],
'靑':['형성','싹(生)과 우물 속 광물 빛(丹)이 합쳐져 맑은 "푸른" 빛을 나타냈어요.'],
'金':['형성','흙(土) 속에 묻힌 광물 알갱이(점 두 개)에 소리 부분 今(이제 금)이 더해졌어요.'],
'南':['가차','매달아 치는 악기(종) 모양인데 "남녘"으로 빌려 썼어요.'],
'室':['회의','집(宀) 안에 이르러(至) 머무는 곳, "방·집"이에요.'],
'軍':['회의','수레(車)를 둘러싼(冖) 모양 — 전차를 둘러싸고 진을 친 "군사"예요.'],
'校':['형성','뜻 부분 木(나무 목) + 소리 부분 交(사귈 교). 나무로 울타리를 친 배움터예요.'],
'國':['회의','경계(囗) 안에서 창(戈)을 들고 땅과 사람(口·一)을 지키는 "나라"예요. 或이 소리 역할도 해요.'],
'敎':['회의','회초리를 든 손(攵)으로 아이(子)에게 셈가지(爻)를 "가르치는" 모양이에요.'],
'萬':['가차','전갈 모양 글자를 빌려 아주 큰 수 "일만"으로 썼어요.'],
'學':['회의','두 손(臼)으로 셈가지(爻)를 잡고, 집(冖)에서 아이(子)가 "배우는" 모양이에요.'],
'韓':['형성','뜻 부분 韋(가죽 위) + 소리 부분 倝(해 돋을 간). 우리나라 이름 "한국"을 뜻해요.']
};
const KIND={'상형':'사물의 모양을 본뜬 글자','지사':'점·선 같은 기호로 뜻을 나타낸 글자','회의':'뜻이 있는 글자 둘 이상을 합친 글자','형성':'뜻 부분과 소리 부분을 합친 글자','가차':'뜻과 상관없이 소리나 모양을 빌려 쓴 글자'};
const cp=c=> CH[c]?`<b class="hz">${c}</b>(${hunum(c)})`:(D.CP[c]?`<b class="hz">${c}</b>(${D.CP[c]})`:`<b class="hz">${c}</b>`);
const eumC=c=> CH[c]?CH[c].eum:(D.CP[c]?D.CP[c].split(' ').pop():'');
function origin(h){
  if(MAN[h]) return {k:MAN[h][0]+'자',d:KIND[MAN[h][0]],t:MAN[h][1]};
  const o=(D.OR[h]||'P').split('|'), c=CH[h];
  if(o[0]==='F'){ const m=Array.from(o[1]); const se=eumC(o[2]);
    return {k:'형성자',d:KIND['형성'],t:`뜻 부분 ${m.map(cp).join(' + ')} + 소리 부분 ${cp(o[2])}. 뜻은 ${m.map(x=>`<b class="hz">${x}</b>`).join('·')}에서, 소리 '${c.eum}'은(는) <b class="hz">${o[2]}</b>${se&&se!==c.eum?`의 '${se}'`:''}에서 왔어요.`}; }
  if(o[0]==='H') return {k:'글자 구성',d:'두 부분 이상이 모여 된 글자',t:`${Array.from(o[1]).map(cp).join(' + ')}. 각 부분의 뜻을 이어 붙여 이야기로 만들면 오래 기억돼요.`};
  if(o[0]==='R') return {k:'부수 + 다른 부분',d:'부수가 뜻의 갈래를 알려 주는 글자',t:`부수 ${cp(o[1])}에 <b class="hz">${o[2]}</b>이(가) 더해진 글자예요. 부수 <b class="hz">${o[1]}</b>을(를) 보면 어떤 뜻과 관련 있는지 짐작할 수 있어요.`};
  if(o[0]==='S') return {k:'기본 글자',d:'더 나눌 수 없는 글자',t:`더 나눌 수 없는 기본 글자예요. 대부분 사물의 모양을 본뜬 상형자나 점·선으로 뜻을 나타낸 지사자이고, 다른 글자의 부품(부수)으로도 자주 쓰여요.`};
  return {k:'부수로 보기',d:'모양이 많이 바뀐 글자',t:`부수는 ${cp(c.rad)}예요. 오랜 세월 모양이 바뀌어 지금 글자에서는 부분을 나누어 보기 어려워요.`};
}


/* ---------- 만들어진 원리 그림: 상형은 '사물 그림 → 글자', 합친 글자는 '부분 + 부분 → 글자' ---------- */
const PICS=env.PIC||{};
const partLab=c=> CH[c]?hunum(c):(D.CP[c]||radHun(c)||'');
function partH(c,tag){ return `<span class="fpart">${tag?`<i class="ftag">${tag}</i>`:''}<b class="hz">${c}</b><small>${String(partLab(c)||'').replace(/[<>&]/g,'')}</small></span>`; }
function figHTML(h){
  if(PICS[h]) return `<div class="ofig" aria-hidden="true"><span class="fpic"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${PICS[h]}</svg><small>본뜬 모양</small></span><span class="farr">→</span><span class="fres hz">${h}</span></div>`;
  const o=(D.OR[h]||'').split('|'); let parts=null;
  if(o[0]==='F') parts=[...Array.from(o[1]).map(x=>partH(x,'뜻')),partH(o[2],'소리')];
  else if(o[0]==='H') parts=Array.from(o[1]).map(x=>partH(x));
  else if(o[0]==='R') parts=[partH(o[1],'부수'),partH(o[2])];
  if(!parts||parts.length<2) return '';
  return `<div class="ofig comp" aria-hidden="true">${parts.join('<span class="fplus">+</span>')}<span class="farr">→</span><span class="fres hz">${h}</span></div>`;
}

/* ---------- 정보 카드 (소개 · 정답 뒤 공통) ---------- */
function infoHTML(h){
  const c=CH[h], o=origin(h), ws=wordsOf(h).slice(0,5);
  return `<div class="info">
    <div class="itop"><span class="ich hz">${h}</span><div class="ihun"><b>${c.hun} <em>${c.eum}</em></b>${c.alt?`<small>또는 ${c.alt}</small>`:''}
      <div class="meta">${c.cj?'<span>천자문 글자</span>':`<span>${LV[c.lv]}</span><span>부수 <b class="hz">${c.rad}</b> ${radHun(c.rad)}</span><span>${c.st}획</span>`}</div>${canWrite(h)?`<button class="btn wtr" data-trace="${h}">${LI('pencil')}따라 쓰기</button>`:''}</div></div>
    ${TRK==='cjm'&&CJMOF[h]!=null?`<div class="cjin"><span class="lk">천자문 구절</span><b class="hz">${Array.from(PH[CJMOF[h]].p).map(x=>x===h?`<u>${x}</u>`:x).join('')}</b><small>${PH[CJMOF[h]].r} · ${PH[CJMOF[h]].m}</small></div>`:''}
    <div class="org">${figHTML(h)}<span class="ok">${o.k}</span><small>${o.d}</small><p>${o.t}</p></div>
    ${ws.length?`<div class="wl"><span class="lk">관련 단어</span>${ws.map(w=>`<div><span class="w hz">${w.cs.map(x=>x===h?`<u>${x}</u>`:x).join('')}</span><span class="r">${w.r}</span><small>${gloss(w)}</small></div>`).join('')}</div>`:`<p class="note">자주 쓰는 단어가 적은 글자예요. 뜻과 음을 먼저 익혀요.</p>`}
  </div>`;
}
function radInfoHTML(r){
  const R=RADI[r], ex=(BYRAD[r]||[]).slice(0,8), n=(BYRAD[r]||[]).length;
  const [hun,eum]=[R.hun.split(' ').slice(0,-1).join(' '),R.hun.split(' ').pop()];
  return `<div class="info">
    <div class="itop"><span class="ich hz">${r}</span><div class="ihun"><b>${hun} <em>${eum}</em></b><small>부수 이름: ${R.nick}</small>
      <div class="meta"><span>부수</span>${R.vr&&R.vr!==r?`<span>변형 <b class="hz">${R.vr}</b></span>`:''}<span>3,500자 중 ${n}자</span></div>${canWrite(r)?`<button class="btn wtr" data-trace="${r}">${LI('pencil')}따라 쓰기</button>`:''}</div></div>
    <div class="org">${figHTML(r)}<span class="ok">만들어진 원리</span><p>${R.desc}</p></div>
    ${ex.length?`<div class="wl"><span class="lk">이 부수가 들어간 한자</span><div class="exg">${ex.map(x=>`<span><b class="hz">${x}</b><small>${hunum(x)}</small></span>`).join('')}</div></div>`:''}
  </div>`;
}
const infoOf=(h,t)=> String(h)[0]==='P'&&PH.length?phInfoHTML(h):t&&t[0]==='r'&&t!=='r'&&RADI[h]?radInfoHTML(h):infoHTML(h);

/* ---------- 문제 만들기 ----------
   한자: he=음 맞히기(뜻 힌트) · e=음 맞히기 · w=한자어 읽기 · h=한자 고르기 · r=이 한자의 부수는?
   부수: rh=부수 이름 맞히기 · rs=부수 모양 고르기 · rc=이 한자의 부수는? */
const TNAME={pm:'구절 뜻',pn:'다음 구절',pb:'빈칸 한자',pr:'구절 읽기',he:'음 맞히기 · 뜻 힌트',e:'음 맞히기',w:'한자어 읽기',h:'한자 고르기',r:'부수 찾기',rh:'부수 이름 맞히기',rs:'부수 모양 고르기',rc:'부수 찾기',wr:'한자 쓰기'};
function eumOpts(h,n){
  const bad=new Set(readings(h)), lv=CH[h].lv, out=new Set();
  for(const x of shuffle(ALL.filter(x=>Math.abs(CH[x].lv-lv)<=2))){ const e=CH[x].eum; if(!bad.has(e)) out.add(e); if(out.size>=n) break; }
  return [...out];
}
function hanjaOpts(h,n,maxLv){
  const out=[]; const ok=x=>x!==h&&!out.includes(x)&&CH[x].lv<=Math.max(maxLv,CH[h].lv)+1&&!readings(x).includes(CH[h].eum);
  out.push(...shuffle((BYRAD[CH[h].rad]||[]).filter(ok)).slice(0,2));
  for(const x of shuffle(ALL.filter(x=>Math.abs(CH[x].lv-CH[h].lv)<=1&&ok(x)))){ if(out.length>=n) break; out.push(x); }
  return out.slice(0,n);
}
function radOpts(ans,n,avoid=''){
  const bad=new Set([ans,...Array.from(avoid)]); RADS.forEach(([r,,,vr])=>{ if(vr&&avoid.includes(vr)) bad.add(r); });
  return shuffle(RADS.map(x=>x[0]).filter(r=>!bad.has(r))).slice(0,n);
}
function pickWord(h,maxLv){ const ws=wordsOf(h).filter(w=>w.r.length===2&&wlv(w)<=maxLv); return ws.length?pick(ws.slice(0,4)):null; }
/* ---------- 한자 쓰기 (획순 데이터가 있는 8급~5급 + 부수) ----------
   설정 '쓰기 문제 넣기'(기본 켬) · 처음 보는 단계(보통)는 따라 쓰기(흐린 글자 위에), 어려움·복습은 보고 쓰기
   채점: 획을 다 쓰면 끝. 틀린 획이 max(2, 획수/4) 이하면 정답 */
const canWrite=h=>{ const SK=env.SK(); return !!SK&&!!SK[h]; };
const writeOn=()=>env.writeOn();
const setWrite=on=>env.setWrite(on);
const skLoad=(c,onLoad)=>onLoad(env.SK()[c]);
function makeQ(spec,maxLv){
  if(String(spec.ch)[0]==='P'&&PH.length) return phraseQ(spec);
  if(spec.t==='wr'&&canWrite(spec.ch)){ const b=makeQ({ch:spec.ch,t:'e'},maxLv), c=CH[spec.ch], R0=RADI[spec.ch];
    const hun=c?`${c.hun} <em>${c.eum}</em>`:(R0?R0.hun.replace(/ (\S+)$/,' <em>$1</em>'):spec.ch);
    return {...b,t:'wr',ask:spec.trace?'흐린 글자 위에 획순대로 따라 써 보세요':'뜻과 음을 보고 한자를 써 보세요',q:hun,qc:'hun',hint:'',choices:['O','X'],ans:'O',write:true,trace:!!spec.trace}; }
  let {ch:h,t,w,x}=spec;
  if(t==='rh'||t==='rs'||t==='rc'){
    const Rr=RADI[h], base={ch:h,t,st:RSTOF[h]};
    if(t==='rh') return {...base,ask:'이 부수의 이름(뜻과 음)은?',q:`<span class="hz">${h}</span>`,qc:'hz1',hint:Rr.vr&&Rr.vr!==h?`<span class="hint">모양이 바뀌면 <b class="hz">${Rr.vr}</b></span>`:'',choices:shuffle([Rr.hun,...radOpts(h,3).map(r=>RADI[r].hun)]),ans:Rr.hun,lab:null};
    if(t==='rs') return {...base,ask:'이 이름의 부수는 어느 것일까요?',q:Rr.hun.replace(/ (\S+)$/,' <em>$1</em>'),qc:'hun',hint:'',choices:shuffle([h,...radOpts(h,3)]),ans:h,lab:radLab};
    const exs=(BYRAD[h]||[]).filter(c=>c!==h&&CH[c].lv<=8).slice(0,10); x=x&&exs.includes(x)?x:(exs.length?pick(exs):h);
    return {...base,x,ask:'이 한자의 부수는 어느 것일까요?',q:`<span class="hz">${x}</span>`,qc:'hz1',hint:`<span class="hint">${hunum(x)}</span>`,choices:shuffle([h,...radOpts(h,3,(D.OR[x]||'')+x)]),ans:h,lab:radLab};
  }
  const c=CH[h];
  if(t==='r'&&!c.rad) t='e';
  if(t==='r'){ const ans=c.rad; return {ch:h,t,st:STOF[h],ask:'이 한자의 부수는 어느 것일까요?',q:`<span class="hz">${h}</span>`,qc:'hz1',hint:`<span class="hint">${hunum(h)}</span>`,choices:shuffle([ans,...radOpts(ans,3,(D.OR[h]||'')+h)]),ans,lab:radLab}; }
  if(t==='w'){ const ww=w?wordsOf(h).find(x=>x.w===w):pickWord(h,maxLv); if(!ww) t='e'; else w=ww.w; }
  const base={ch:h,t,w,st:STOF[h]};
  if(t==='he'||t==='e') return {...base,ask:'이 한자의 음(소리)은?',q:`<span class="hz">${h}</span>`,qc:'hz1',hint:t==='he'?`<span class="hint">뜻: ${c.hun}</span>`:'',choices:shuffle([c.eum,...eumOpts(h,3)]),ans:c.eum,lab:null};
  if(t==='w'){ const ww=wordsOf(h).find(x=>x.w===w), k=ww.cs.indexOf(h), sy=Array.from(ww.r);
    const opts=new Set(); for(const e of eumOpts(h,8)){ const a=[...sy]; a[k]=e; const s=a.join(''); if(s!==ww.r) opts.add(s); if(opts.size>=3) break; }
    return {...base,ask:'이 한자어는 어떻게 읽을까요?',q:ww.cs.map(x=>x===h?`<span class="hz tg">${x}</span>`:`<span class="hz">${x}</span>`).join(''),qc:'hz2',hint:`<span class="hint">밑줄 글자 뜻: ${c.hun}</span>`,choices:shuffle([ww.r,...opts]),ans:ww.r,lab:null}; }
  return {...base,ask:'뜻과 음에 맞는 한자는?',q:`${c.hun} <em>${c.eum}</em>`,qc:'hun',hint:'',choices:shuffle([h,...hanjaOpts(h,3,maxLv)]),ans:h,lab:x=>x};
}
return {
  D, LV, CH, ALL, BYRAD, CJ, PH, CJMOF, RADS, RADI, RTHEME, BASIC, TRKN, MAN, KIND,
  radHun, radLab, buildTrack, phInfoHTML, phraseQ, hunum, wordsOf, wlv, gloss, origin, figHTML, infoHTML, radInfoHTML, infoOf,
  TNAME, makeQ, canWrite, writeOn, setWrite, eumOpts, readings, esc0,
  get TRK() { return TRK; }, get STAGES() { return STAGES; }, get IDX() { return IDX; }, get STOF() { return STOF; },
  get RSTOF() { return RSTOF; }, get AREAS() { return AREAS; },
};
}
