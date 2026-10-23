/* =========================================================
   한자씨앗 — 부수 60자 → 한국어문회 8급 ~ 1급 (3,500자)
   학습 길:  부수 6단원 → 부수 확인 평가 → 8급 단원들 → 8급 승급 평가 → 7급Ⅱ … → 1급 승급 평가
   - 새 단원은 소개(뜻·음·생성원리·관련 단어)를 끝까지 넘겨야 문제가 열림
   - 맞히면 난이도 상승(쉬움 → 보통 → 어려움), 틀리면 난이도 내림 + 3문제 뒤 다시 + 오답노트(1·3·5일)
   - 어려움 단계에서 연속 10문제 정답 → 단원 통과 → 다음 단원
   - 통과한 단원은 3단원 뒤 → 5단원 뒤 두 번 복습(진도 간격 반복). 두 번 다 맞히면 '완성'
     복습할 단원이 있으면 새 진도보다 먼저 나옴
   - 급수 마지막엔 승급 평가 20문제, 16개(80%) 이상 맞혀야 다음 급수
   ========================================================= */
const GOAL=10, SET=20, CARD_GAP=[1,3,5], REV_GAP=[3,5], EXAM_N=20, EXAM_PASS=0.8, REV_Q=4;
/* 틀림 상한(레벨별): 한 단원에서 이만큼 틀리면 그 단원을 처음부터(소개부터) 다시 */
const CAPS={'초등':5,'중등':6,'고등':7,'부수':5,'8급':5,'7급Ⅱ':5,'7급':5,'6급Ⅱ':6,'6급':6,'5급Ⅱ':6,'5급':6,'4급Ⅱ':7,'4급':7,'3급Ⅱ':7,'3급':7,'2급':8,'1급':8};
const CAP=s=>CAPS[s.area]||5, EXAM_CAP=EXAM_N-Math.ceil(EXAM_N*EXAM_PASS)+1;
const WR=(p,id)=>((p.wr||{})[id]||0);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};

const D=__DATA__;
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
  TRK=trk==='grade'?'grade':trk==='cjm'&&CJ?'cjm':'school'; try{ localStorage.setItem('hanja-track',TRK); }catch(e){}
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
  S=load()||seed();
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
  S=load()||seed();
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
const PICS=(typeof PIC!=='undefined')?PIC:{};
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
const canWrite=h=>typeof SK!=='undefined'&&!!SK[h]&&typeof HanziWriter!=='undefined';
function writeOn(){ try{ if(parent!==window&&parent.HGS) return parent.HGS.st.hanjaWrite!==false; }catch(e){} try{ return localStorage.getItem('hanja-write')!=='off'; }catch(e){ return true; } }
function setWrite(on){ try{ if(parent!==window&&parent.HGS){ parent.HGS.st.hanjaWrite=on; parent.HGS.save(); } }catch(e){} try{ localStorage.setItem('hanja-write',on?'on':'off'); }catch(e){} }
const skLoad=(c,onLoad)=>onLoad(SK[c]);
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

/* ---------- 날짜 · 진도 시계 ---------- */
const REAL=Math.floor((Date.now()+9*3600e3)/864e5);
function load(){ try{ return JSON.parse(localStorage.getItem(KEY)); }catch(e){ return null; } }
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(S)); }catch(e){} }
const today=()=>REAL+S.offset;
const DOW=['일','월','화','수','목','금','토'];
function dlabel(d){ const t=new Date(d*864e5); return `${t.getUTCMonth()+1}/${t.getUTCDate()}(${DOW[t.getUTCDay()]})`; }
function rel(d){ const k=d-today(); return k<=0?(k<0?`${-k}일 밀림`:'오늘'):k===1?'내일':`${k}일 뒤`; }
/* 진도 간격: np = 지금까지 통과한 단원 수. 통과 시 due=np+3 → 복습 통과 시 due=np+5 → 통과하면 완성 */
function revText(ps,p){ if(ps.exam) return `통과 · ${ps.score||100}점`; if(ps.box>=2) return '완성 · 두 번 복습 끝';
  const k=ps.due-p.np; return k<=0?'지금 복습할 차례':`${k}단원 뒤 ${ps.box+1}차 복습`; }

/* ---------- 예시 데이터 ---------- */
function seed(){
  const t=REAL; let rs=20261020; const rnd=()=>{rs=(rs*16807)%2147483647;return rs/2147483647;}; const ri=(a,b)=>a+Math.floor(rnd()*(b-a+1));
  const mk=(id,curName,name,age,color,grad,cardSpec,skip,days)=>{
    const cur=Math.max(0,findSt(curName)), passed={}, read={}, sst={}, stat={};
    STAGES.slice(0,cur).forEach((s,i)=>{ read[s.id]=true; const at=i+1;
      if(s.kind==='exam'){ passed[s.id]={exam:true,box:2,score:ri(80,100)}; return; }
      let box=0,due=at+REV_GAP[0]; if(cur>due){box=1;due=due+REV_GAP[1];} if(cur>due){box=2;}
      passed[s.id]={box,due}; sst[s.id]=[ri(70,95),ri(75,100),ri(80,100)];
      const ar=s.area, n=ri(20,40); stat[ar]=stat[ar]||{n:0,c:0}; stat[ar].n+=n; stat[ar].c+=Math.round(n*(0.8+rnd()*0.17)); });
    const hist={};
    for(let d=0;d<days;d++){ if(skip.includes(d%7)&&rnd()<.8) continue; const n=ri(20,26); hist[t-days+d]={n,c:Math.round(n*(0.72+rnd()*0.22)),ms:n*ri(10,22)*1000}; }
    const cards=cardSpec.filter(([sn])=>findSt(sn)>=0).map(([sn,k,tt,box,due,w])=>{ const s=STAGES[findSt(sn)]; const h=s.chars[k%s.chars.length]; return {id:h+tt+k,ch:h,t:tt,st:s.id,box,due:t+due,wrong:w}; });
    return {id,name,age,color,stage:cur,np:cur,streak:0,grad,read,passed,sst,stat,hist,cards,bp:{}};
  };
  const sc=TRK==='school';
  return {offset:0,active:'hajun',profiles:{
    hajun:mk('hajun','부수 1단원','하준','초1','#BFE8D9',0,[],[0,1,2,3,4,5,6],0),
    minwang:mk('minwang',sc?'초등 필수 18단원':'6급Ⅱ 3단원','민왕','초5','#0FA37F',41,[['6급Ⅱ 2단원',2,'e',0,-2,3],['6급Ⅱ 1단원',5,'he',0,-1,2],['7급 5단원',1,'w',1,0,2],['7급 3단원',3,'e',0,0,1],['부수 5단원',4,'rc',2,0,2],['7급 4단원',6,'h',1,1,1],['7급Ⅱ 4단원',7,'r',0,2,1],['부수 3단원',0,'rh',1,3,4]],[2,5],29),
    seoyun:mk('seoyun',sc?'초등 필수 4단원':'8급 4단원','서윤','초3','#7FD6B9',17,[['8급 3단원',3,'e',0,-1,3],['8급 2단원',2,'he',1,0,2],['부수 4단원',5,'rs',0,0,2],['부수 2단원',1,'rh',2,0,1],['8급 1단원',4,'e',0,1,1],['부수 6단원',6,'rc',1,4,1]],[1,4],21)
  }};
}
let S=null;
const P=()=>S.profiles[S.active];
const avg=id=>{ const a=P().sst[id]; return a&&a.length ? (a.reduce((x,y)=>x+y,0)/a.length).toFixed(1) : '0.0'; };
const curSt=p=>STAGES[p.stage];

/* ---------- 세트 구성 ---------- */
function dueCards(p){ return p.cards.filter(c=>c.due<=today()).sort((a,b)=>(a.due-b.due)||(b.wrong-a.wrong)); }
function dueStages(p){ return Object.entries(p.passed).filter(([,v])=>!v.exam&&v.box<2&&v.due<=p.np).sort((a,b)=>a[1].due-b[1].due).map(([id])=>id); }
function plan(p){ const cards=dueCards(p).slice(0,8), rv=dueStages(p).slice(0,3), exam=curSt(p).kind==='exam';
  return {cards,rv,exam,n:exam?EXAM_N:Math.max(4,SET-cards.length-rv.length*REV_Q),late:p.cards.filter(c=>c.due<today()).length}; }
const revItems=ids=>ids.flatMap(id=>Array.from({length:REV_Q},()=>({src:'review',st:id})));
const progItems=(p,n)=> curSt(p).kind==='exam'?Array.from({length:EXAM_N},()=>({src:'exam',st:curSt(p).id})):Array.from({length:n},()=>({src:'new'}));
function buildQueue(p,mode,arg){
  if(mode==='today'){ const pl=plan(p); return [...pl.cards.map(c=>({src:'card',card:c})),...revItems(pl.rv),...progItems(p,pl.n)]; }
  if(mode==='cards') return [...dueCards(p),...p.cards.filter(c=>c.due>today())].slice(0,15).map(c=>({src:'card',card:c}));
  if(mode==='new') return [...revItems(dueStages(p).slice(0,3)),...progItems(p,10)];
  if(mode==='stage') return Array.from({length:10},()=>({src:'review',st:arg,free:true}));
}
function pickChar(s,g){ const c=s.chars.filter(x=>!g.recent.includes(x)); const h=pick(c.length?c:s.chars); g.recent=[h,...g.recent].slice(0,Math.min(4,s.chars.length-1)); return h; }
function resolve(it,p,g){
  const maxLv=curSt(p).kind==='rad'?0:curSt(p).lvI;
  if(it.src==='card') return {...makeQ({ch:it.card.ch,t:it.card.t,w:it.card.w,x:it.card.x},maxLv),card:it.card};
  if(it.src==='retry') return it.qq;
  if(it.src==='exam'){ const s=STAGES[IDX[it.st]]; if(s.ph&&Math.random()<.45){ const i=pick(s.ph); return {...makeQ({ch:'P'+i,t:pick(['pm','pb','pn','pr'])}),exam:s.id}; } g.pool=g.pool&&g.pool.length?g.pool:shuffle(s.chars); const h=g.pool.pop();
    const t=s.area==='부수'?pick(['rh','rs','rc']):pick(['e','e','w','h','r']); return {...makeQ({ch:h,t},s.lvI),exam:s.id}; }
  const s=it.src==='new'?curSt(p):STAGES[IDX[it.st]], h=pickChar(s,g), d=it.src==='new'?((p.bp||{})[s.id]||0):7;
  if(s.kind==='rad') return makeQ({ch:h,t:d<3?'rh':d<6?'rs':pick(['rc','rc','rh','rs'])},0);
  if(s.ph&&Math.random()<.45){ const i=pick(s.ph); return makeQ({ch:'P'+i,t:d<3?'pm':d<6?pick(['pm','pr','pb']):pick(['pb','pn','pm','pr'])}); }
  if(writeOn()&&canWrite(h)&&d>=3&&Math.random()<(it.src==='new'?.22:.15)) return makeQ({ch:h,t:'wr',trace:it.src==='new'&&d<6},Math.max(maxLv,s.lvI));
  const t=it.src==='new'?(d<3?'he':d<6?'e':pick(['w','h','e','w','r'])):pick(['e','e','w','h','r']);
  return makeQ({ch:h,t},Math.max(maxLv,s.lvI));
}
function addCard(p,q){
  const ex=p.cards.find(c=>c.ch===q.ch&&c.t===q.t); if(ex){ex.box=0;ex.due=today()+1;ex.wrong++;return;}
  p.cards.push({id:Math.random().toString(36).slice(2,8),ch:q.ch,t:q.t,w:q.w,x:q.x,st:q.st,box:0,due:today()+1,wrong:1});
}

/* ---------- 틀 ---------- */
const bar=document.getElementById('bar'), screen=document.getElementById('screen'), tabs=document.getElementById('tabs');
let tab='home', G=null, areaF=null;
const LI=(n,c)=>`<i data-lucide="${n}"${c?` class="${c}"`:''}></i>`;
const IC={list:LI('list-checks'),clock:LI('clock'),check:LI('circle-check-big')};
function mmS(ms){ const m=Math.round((ms||0)/60000); return m<60?`${m}분`:`${Math.floor(m/60)}시간 ${m%60}분`; }
function ring(pct,big,sub,col){ const r=52,C=2*Math.PI*r,d=Math.max(0,Math.min(1,pct))*C;
  return `<svg viewBox="0 0 140 140" class="ring" role="img" aria-label="${big} ${sub}"><circle cx="70" cy="70" r="${r}" fill="none" stroke="var(--hi)" stroke-width="12"/><circle cx="70" cy="70" r="${r}" fill="none" stroke="${col||'var(--y)'}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${d} ${C}" transform="rotate(-90 70 70)"/><text x="70" y="72" text-anchor="middle" font-size="30" font-weight="900" fill="var(--k)">${big}</text><text x="70" y="94" text-anchor="middle" font-size="11.5" fill="var(--sub)">${sub}</text></svg>`; }
const Q_ICON='<span class="pillq">소개</span>';
function setBar(title,{back,help}={}){
  const p=P();
  bar.innerHTML=`${back?`<button class="bb" id="bBack" aria-label="뒤로">${LI('arrow-left')}</button>`
    :`<button class="bb who" id="bWho" aria-label="학생 바꾸기">${LI('user-round')}${p.name}<small>${p.age}</small>${LI('chevrons-up-down','sm')}</button>`}
    <h1>${title}</h1>${help?`<button class="bb" id="bHelp" aria-label="단원 소개 보기">${LI('circle-help')}</button>`:'<span class="bb"></span>'}`;
  if(back) bar.querySelector('#bBack').onclick=back;
  else bar.querySelector('#bWho').onclick=()=>{ const ids=Object.keys(S.profiles); S.active=ids[(ids.indexOf(S.active)+1)%ids.length]; areaF=null; save(); render(); };
  if(help) bar.querySelector('#bHelp').onclick=help;
}
function showTabs(on){
  tabs.hidden=!on;
  if(!on) return;
  tabs.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.tab===tab));
  const n=dueCards(P()).length, b=tabs.querySelector('[data-tab="cards"]');
  b.querySelector('.dot')?.remove(); if(n) b.insertAdjacentHTML('beforeend',`<span class="dot">${n}</span>`);
}
function setTab(t){ tab=t; G=null; document.onkeydown=null; render(); screen.scrollTop=0; }
function render(){ showTabs(true); ({home:renderHome,cards:renderCards,report:renderReport})[tab](); }
const unitTitle=s=> s.kind==='exam'?`${s.name}`:s.kind==='rad'?`${s.n}단원 ${s.theme} <span class="hz pv">${s.chars.join('')}</span>`:`${s.n}단원 <span class="hz pv">${s.chars.join('')}</span>`;

/* ---------- 한자학습 (홈) ---------- */
function renderHome(){
  const p=P(), pl=plan(p), total=pl.cards.length+pl.rv.length*REV_Q+pl.n, done=Math.min((p.hist[today()]||{}).n||0,total);
  const cur=curSt(p); if(!areaF) areaF=cur.area;
  setBar('한자학습');
  const list=STAGES.map((s,i)=>({...s,i})).filter(s=>s.area===areaF);
  const th=p.hist[today()]||{n:0,c:0,ms:0};
  const learned=STAGES.slice(0,p.stage).filter(s=>s.kind==='char').reduce((a,s)=>a+s.chars.length,0);
  const radDone=STAGES.slice(0,p.stage).filter(s=>s.kind==='rad').reduce((a,s)=>a+s.chars.length,0);
  const due=dueStages(p);
  const path=AREAS.map(a=>{ const ss=STAGES.filter(s=>s.area===a), all=ss.length>0&&ss.every(s=>p.passed[s.id]), now=cur.area===a; return `<span class="${all?'done':now?'now':''}">${a==='부수'?'부수':a}</span>`; }).join('<i></i>');
  screen.innerHTML=`
    <div class="trk ${CJ?'tl3':''}" role="tablist" aria-label="학습 갈래">${Object.entries(TRKN).map(([k,v])=>`<button role="tab" data-trk="${k}" aria-selected="${k===TRK}">${v}</button>`).join('')}</div>
    <div class="wset"><span>${LI('pencil')}한자 쓰기 문제 넣기 <small>8급~5급 · 펜·손가락으로 획순대로</small></span><button class="swt" id="wOn" role="switch" aria-checked="${writeOn()}" aria-label="한자 쓰기 문제 넣기"></button></div>
    <section class="sec">
      <div class="hrow"><span class="badge">TODAY</span><span class="sub">${dlabel(today())} · ${p.name}의 학습</span></div>
      <div class="paycard">
        <div class="pc-top"><span class="pc-logo">${LI('book-open')}</span><b>오늘 학습</b>${pl.late?`<span class="latepill">밀린 오답 ${pl.late}건</span>`:''}</div>
        <div class="pc-amt">${done}<small> / ${total}문제</small></div>
        <p class="mixline">오답 다시 <b>${pl.cards.length}</b> · 단원 복습 <b>${pl.rv.length*REV_Q}</b> · ${pl.exam?'승급 평가':'새 진도'} <b>${pl.n}</b></p>
        <div class="pc-btns"><button class="gbtn" id="goCards">오답만</button><button class="gbtn" id="goNew">${pl.exam?'평가만':'진도만'}</button><button class="kbtn" id="go">${LI('play')}${done?'이어서':'시작'}</button></div>
      </div>
      <div class="shortcuts">
        <button data-sc="cards"><span>${LI('notebook-pen')}</span>오답노트</button>
        <button data-sc="concept"><span>${LI('book-open')}</span>단원 소개</button>
        <button data-sc="report"><span>${LI('chart-pie')}</span>학습결과</button>
        <button data-sc="who"><span>${LI('users-round')}</span>학생 바꾸기</button>
      </div>
    </section>
    <section class="sec">
      <h3 class="sh">나의 학습 길 <small>${TRK==='cjm'?`구절 ${STAGES.slice(0,p.stage).filter(s=>s.kind==='char').reduce((a,s)=>a+s.ph.length,0)}/250 · 한자 ${learned.toLocaleString()}/1,000자`:`부수 ${radDone}/60 · 한자 ${learned.toLocaleString()}/3,500자`}</small></h3>
      <div class="path">${path}</div>
      <div class="nowrow">
        <span class="lic s-now">${LI(cur.kind==='exam'?'bookmark':'pencil')}</span>
        <div class="nr-body"><b>${cur.kind==='exam'?cur.name:`${cur.name}${cur.kind==='rad'?' '+cur.theme:''}`} ${cur.kind!=='exam'?`<span class="hz pv">${cur.chars.join('')}</span>`:''}</b>
          <span class="streak">${cur.kind==='exam'?`<em>${EXAM_N}문제 중 ${Math.ceil(EXAM_N*EXAM_PASS)}개 이상 맞히면 ${cur.area==='부수'?'8급 시작':'다음 급수'} · ${EXAM_CAP}개 틀리면 종료</em>`:p.read[cur.id]?Array.from({length:GOAL},(_,i)=>`<i class="${i<p.streak?'on':''}"></i>`).join('')+`<em>연속 ${p.streak}/${GOAL} · 틀림 ${WR(p,cur.id)}/${CAP(cur)}</em>`:`<em>단원 소개를 먼저 봐요 · ${CAP(cur)}개 틀리면 처음부터</em>`}</span></div>
        ${cur.kind!=='exam'?`<button class="qbtn" data-q="${cur.id}" aria-label="${cur.name} 소개">${Q_ICON}</button>`:''}
      </div>
      ${due.length?`<p class="duebox">${LI('repeat')}<span><b>복습할 단원 ${due.length}개</b> — ${due.map(id=>STAGES[IDX[id]].name).join(', ')}. 새 진도보다 먼저 나와요.</span></p>`:''}
    </section>
    <section class="sec flush">
      <h3 class="sh pad16">단원 목록 <small>${TRK==="cjm"?"1부 → 5부 · 250구절":TRK==="school"?"초 → 중 → 고":"부수 → 8급 → … → 1급"}</small></h3>
    <div class="areas">${AREAS.map(a=>{const ss=STAGES.filter(s=>s.area===a);const n=ss.filter(s=>p.passed[s.id]).length;return `<button class="chip ${a===areaF?'on':''}" data-af="${a}">${a} <small>${n}/${ss.length}</small></button>`;}).join('')}</div>
    <ul class="units">${list.map(s=>{
      const ps=p.passed[s.id], now=s.i===p.stage, lock=!ps&&!now, dueNow=ps&&!ps.exam&&ps.box<2&&ps.due<=p.np;
      const sub=ps?(s.kind==='exam'?revText(ps,p):`최근 평균 ${avg(s.id)} · ${revText(ps,p)}`):now?(s.kind==='exam'?`${EXAM_N}문제 · ${Math.round(EXAM_PASS*100)}% 이상 통과`:`난이도 ${LV_(s.id,p)} · 연속 ${p.streak}/${GOAL}`):s.kind==='exam'?`${s.chars.length}자에서 ${EXAM_N}문제`:`${s.chars.length}자`;
      const li=ps?(dueNow?`<span class="lic s-due">${LI('repeat')}</span>`:`<span class="lic s-ok">${LI('check')}</span>`):now?`<span class="lic s-now">${LI(s.kind==='exam'?'bookmark':'pencil')}</span>`:`<span class="lic s-lk">${LI(s.kind==='exam'?'bookmark':'lock')}</span>`;
      return `<li class="${now?'cur':''} ${lock?'lock':''} ${s.kind==='exam'?'exam':''}">${li}<button class="unit" data-st="${s.id}" ${lock?'disabled':''}><b>${unitTitle(s)}</b><small>${sub}</small></button>${s.kind!=='exam'?`<button class="qbtn" data-q="${s.id}" aria-label="${s.name} 소개">${Q_ICON}</button>`:''}</li>`;}).join('')}</ul>
    </section>
    ${TRK==='cjm'?`<details class="cjabout"><summary>${LI('book-open')}천자문은 어떤 책일까요?</summary><p>${esc0(CJ.intro)}</p><ol>${CJ.parts.map(x=>`<li><b>${x.name}</b> ${esc0(x.title)} <small>${x.from}~${x.to}구절</small></li>`).join('')}</ol></details>`:''}
    <p class="note">${TRK==='school'?'학교 필수: 초등은 한국어문회 8~6급 300자, 중등·고등은 교육부 한문 교육용 기초 한자 1,800자(중등은 그중 5급Ⅱ~4급, 고등은 3급Ⅱ~2급)예요. ':''}한 단원에서 정해진 개수(부수~7급·초등 5개 · 6급Ⅱ~5급·중등 6개 · 4급Ⅱ~3급·고등 7개 · 2급·1급 8개)를 틀리면 그 단원을 소개부터 처음부터 다시 해요. 승급 평가는 ${EXAM_CAP}개 틀리면 종료돼요. 하준(초1)은 처음 시작하는 학생, 서윤(초3)·민왕(초5)은 예시 기록이에요. 통과한 단원은 3단원 뒤, 5단원 뒤에 다시 복습해요. 틀린 문제는 오답노트에서 1·3·5일 뒤 다시 나와요.</p>`;
  const wo=screen.querySelector('#wOn'); if(wo) wo.onclick=()=>{ setWrite(!writeOn()); wo.setAttribute('aria-checked',writeOn()); };
  screen.querySelectorAll('[data-trk]').forEach(b=>b.onclick=()=>{ if(b.dataset.trk===TRK) return; buildTrack(b.dataset.trk); areaF=null; render(); screen.scrollTop=0; });
  screen.querySelector('#go').onclick=()=>start('today','오늘 학습');
  screen.querySelector('#goCards').onclick=()=>{ if(P().cards.length) start('cards','오답 다시'); };
  screen.querySelector('#goNew').onclick=()=>start('new',curSt(P()).name);
  screen.querySelectorAll('[data-sc]').forEach(b=>b.onclick=()=>{ const k=b.dataset.sc;
    if(k==='cards'||k==='report') setTab(k);
    else if(k==='concept'){ const c=curSt(P()); openConcept(c.kind==='exam'?STAGES[P().stage-1].id:c.id,()=>render()); }
    else document.getElementById('bWho').click(); });
  screen.querySelectorAll('[data-af]').forEach(b=>b.onclick=()=>{areaF=b.dataset.af;renderHome();});
  screen.querySelectorAll('.unit:not(:disabled)').forEach(b=>b.onclick=()=>{
    const id=b.dataset.st, s=STAGES[IDX[id]];
    if(IDX[id]===P().stage) start('new',s.name); else if(s.kind==='exam') openConcept(id,()=>render()); else start('stage',s.name+' 복습',id);
  });
  screen.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>openConcept(b.dataset.q,()=>render()));
}
function openConcept(id,back,at){
  const p=P(), i=IDX[id], s=STAGES[i], unlocked=(p.passed[id]||i===p.stage)&&s.kind!=='exam';
  concept(id,false,back, unlocked?()=>{ if(i===p.stage) start('new',s.name); else start('stage',s.name+' 복습',id); }:null,at);
}

/* ---------- 오답노트 ---------- */
function cardLine(c){
  const h=c.ch;
  if(String(h)[0]==='P'&&PH.length){ const x=PH[+h.slice(1)]; return `<span class="hz">${x.p}</span> <span class="ansv">${x.r} · ${x.m}</span>`; }
  if(c.t==='rh'||c.t==='rs') return `<span class="hz">${h}</span> <span class="ansv">${radHun(h)}</span>`;
  if(c.t==='rc'&&c.x) return `<span class="hz">${c.x}</span> 부수 <span class="ansv"><span class="hz">${h}</span> ${radHun(h)}</span>`;
  if(c.t==='r') return `<span class="hz">${h}</span> 부수 <span class="ansv"><span class="hz">${CH[h].rad}</span> ${radHun(CH[h].rad)}</span>`;
  const w=c.t==='w'&&c.w?wordsOf(h).find(x=>x.w===c.w):null;
  return w?`<span class="hz">${w.w}</span> <span class="ansv">${w.r}</span>`:`<span class="hz">${h}</span> <span class="ansv">${hunum(h)}</span>`;
}
function renderCards(){
  const p=P(), t=today();
  setBar('오답노트');
  const cal=Array.from({length:7},(_,i)=>{const d=t+i;const n=p.cards.filter(c=>i===0?c.due<=d:c.due===d).length;return `<div class="${i===0&&n?'t':''}"><span>${i===0?'오늘':DOW[new Date(d*864e5).getUTCDay()]}</span><b>${n}</b></div>`;}).join('');
  const sorted=[...p.cards].sort((a,b)=>(a.due-b.due)||(b.wrong-a.wrong));
  screen.innerHTML=`
    <section class="card"><div class="todaycard">
      <h2>오늘 다시 풀 오답 <small>틀리면 1일 → 3일 → 5일 뒤</small></h2>
      <div class="cols"><div><small>오늘</small><b class="${dueCards(p).length?'red':''}">${dueCards(p).length}건</b></div><div><small>전체 / 졸업</small><b>${p.cards.length} / ${p.grad}</b></div></div>
      <button class="startbtn" id="go" ${p.cards.length?'':'disabled'}>${LI('rotate-ccw')}오답만 풀기</button></div></section>
    <div class="box"><h3>다시 나오는 날</h3><div class="cal">${cal}</div><p class="note">세 번 연속 맞히면 졸업, 중간에 틀리면 1일로 돌아가요.</p></div>
    <ul class="units">${sorted.length?sorted.map(c=>`<li><button class="unit" data-ch="${c.ch}" data-st="${c.st}"><b class="mq">${cardLine(c)}</b>
      <small><span class="x">✕${c.wrong}</span> · ${TNAME[c.t]} · ${STAGES[IDX[c.st]].name} · <span class="${c.due<=t?'x':''}">${rel(c.due)}</span> · 졸업까지 ${3-c.box}번</small></button>
      <button class="qbtn" data-ch="${c.ch}" data-st="${c.st}" aria-label="소개">${Q_ICON}</button></li>`).join(''):'<li><div class="unit static"><b>오답이 없어요</b><small>전부 졸업했어요</small></div></li>'}</ul>`;
  screen.querySelector('#go').onclick=()=>{ if(P().cards.length) start('cards','오답 다시'); };
  screen.querySelectorAll('[data-ch]').forEach(b=>b.onclick=()=>openConcept(b.dataset.st,()=>render(),b.dataset.ch));
}

/* ---------- 리포트 ---------- */
let rmode='day', rshift=0;
function renderReport(){
  const p=P(), t=today();
  setBar('학습결과');
  const span=rmode==='day'?1:rmode==='week'?7:30;
  const endD=t-rshift*span, days=Array.from({length:span},(_,i)=>endD-span+1+i);
  const hs=days.map(d=>p.hist[d]||{n:0,c:0,ms:0});
  const tot=hs.reduce((a,h)=>({n:a.n+h.n,c:a.c+h.c,ms:a.ms+(h.ms||0)}),{n:0,c:0,ms:0});
  const att=hs.filter(h=>h.n).length, rate=tot.n?Math.round(tot.c/tot.n*100):0;
  const label=rmode==='day'?dlabel(endD):`${dlabel(days[0])} ~ ${dlabel(endD)}`;
  const goalN=SET*span, goalMs=span*10*60000;
  const by={}; p.cards.forEach(c=>{by[c.ch]=(by[c.ch]||0)+c.wrong;});
  const worst=Object.entries(by).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const mx=Math.max(SET,...hs.map(h=>h.n));
  const shown=AREAS.slice(0,AREAS.indexOf(curSt(p).area)+1);
  const units=STAGES.filter(s=>s.kind!=='exam'), pu=units.filter(s=>p.passed[s.id]);
  const done2=pu.filter(s=>p.passed[s.id].box>=2).length, wait=pu.length-done2;
  screen.innerHTML=`
    <div class="seg">${[['day','일별 보고서'],['week','주간 보고서'],['month','월간 보고서']].map(([k,l])=>`<button data-rm="${k}" class="${k===rmode?'on':''}">${l}</button>`).join('')}</div>
    <div class="datenav"><button id="prevD" aria-label="이전">${LI('chevron-left')}</button><span>${label}</span><button id="nextD" aria-label="다음" ${rshift===0?'disabled':''}>${LI('chevron-right')}</button></div>
    <section class="card center">
      ${ring(tot.n/goalN, tot.n+'개','총 문제 개수')}
      <div class="legend"><span><i style="background:var(--y)"></i>정답 ${tot.c}개</span><span><i style="background:var(--red)"></i>오답 ${tot.n-tot.c}개</span><span>정답률 ${rate}%</span></div>
    </section>
    <section class="card center">
      ${ring(tot.ms/goalMs, mmS(tot.ms),'총 학습 시간','var(--k)')}
      <p class="note">${rmode==='day'?'하루 목표 10분':`${span}일 중 ${att}일 출석 · 하루 목표 10분`}</p>
    </section>
    ${rmode!=='day'?`<section class="card"><h3>하루 푼 문제</h3>
      <div class="week ${rmode}">${hs.map((h,i)=>`<div><small>${rmode==='week'&&h.n?h.n:''}</small><i class="${days[i]===t?'td':''}" style="height:${h.n/mx*100}%"></i></div>`).join('')}</div>
      ${rmode==='week'?`<div class="days">${days.map(d=>`<span>${d===t?'오늘':DOW[new Date(d*864e5).getUTCDay()]}</span>`).join('')}</div>`:''}</section>`:''}
    <section class="card"><h3>단원 복습 현황 <small class="note">3단원 뒤 → 5단원 뒤</small></h3>
      <div class="cols"><div><small>완성 (복습 2번 끝)</small><b>${done2}</b></div><div><small>복습 남음 / 지금 차례</small><b>${wait} / <span class="${dueStages(p).length?'x':''}">${dueStages(p).length}</span></b></div></div></section>
    <section class="card"><h3>급수별 정답률 <small class="note">누적</small></h3>${shown.map(a=>{const s=p.stat[a]||{n:0,c:0};const r=s.n?Math.round(s.c/s.n*100):0;return `<div class="hbar"><span>${a}</span><div class="tr"><i style="width:${r}%"></i></div><span class="v">${s.n?r+'%':'—'}</span></div>`;}).join('')}</section>
    <section class="card"><h3>많이 틀리는 한자</h3><div class="list">${worst.length?worst.map(([h,w])=>`<div><span><b class="hz">${h}</b> ${hunum(h)}</span><span class="x">✕${w}</span></div>`).join(''):'<p class="note">틀린 문제가 없어요.</p>'}</div></section>
    <button class="share" id="share">${LI('message-circle')}카카오톡으로 보고서 보내기</button>
    <p class="note" id="shareNote">공유는 출시 버전에서 동작해요. 지금은 보낼 문구를 복사해요.</p>
    <section class="card"><h3>시연 도구</h3><p class="note">하루를 넘기면 1·3·5일 뒤 오답이 다시 나와요. 단원 복습은 날짜가 아니라 진도(3단원·5단원 뒤)로 나와요.</p>
      <div class="btns"><button class="btn k" id="nextDay">${LI('calendar-plus')}하루 넘기기</button><button class="btn" id="reset">${LI('rotate-ccw')}예시로 되돌리기</button></div></section>`;
  screen.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{rmode=b.dataset.rm;rshift=0;renderReport();});
  screen.querySelector('#prevD').onclick=()=>{rshift++;renderReport();};
  screen.querySelector('#nextD').onclick=()=>{if(rshift>0){rshift--;renderReport();}};
  screen.querySelector('#share').onclick=async()=>{
    const txt=`[한자씨앗] ${p.name} ${label}: ${tot.n}문제, 정답률 ${rate}%, 학습 ${mmS(tot.ms)}. 지금: ${curSt(p).name}. 남은 오답 ${p.cards.length}건.`;
    const n=screen.querySelector('#shareNote'); try{await navigator.clipboard.writeText(txt);n.textContent='복사했어요: '+txt;}catch(e){n.textContent=txt;}
  };
  screen.querySelector('#nextDay').onclick=()=>{S.offset++;save();render();};
  screen.querySelector('#reset').onclick=e=>{ if(e.currentTarget.dataset.c){S=seed();areaF=null;save();render();} else {e.currentTarget.dataset.c=1;e.currentTarget.textContent='한 번 더 누르면 초기화';} };
}

/* ---------- 단원 소개 ---------- */
function concept(id,gate,onClose,onPractice,at){
  showTabs(false);
  const s=STAGES[IDX[id]], p=P(), isRad=s.kind==='rad';
  if(s.kind==='exam'){
    setBar(s.name,{back:()=>{save();onClose&&onClose();}});
    const ps=p.passed[id], now=IDX[id]===p.stage;
    screen.innerHTML=`<div class="cx"><div class="lyric"><span class="lk">${s.area==='부수'?'부수 60자':s.cjm?'천자문 '+s.area+' · 구절 '+s.ph.length+'개 · '+s.chars.length+'자':s.area+' '+s.chars.length+'자'}</span><h2>${s.name}</h2>
      <p>${s.area==='부수'?'부수 6단원에서 배운 60개 부수':`${s.area}의 한자 ${s.chars.length}자`} 가운데 ${EXAM_N}문제가 무작위로 나와요.</p>
      <p class="soft">${Math.ceil(EXAM_N*EXAM_PASS)}개 이상 맞히면 ${s.area==='부수'?'8급 1단원':'다음 급수'}이 열려요. 못 미치면 틀린 문제를 오답노트로 복습하고 다시 도전해요.</p>
      ${ps?`<p class="eqa">통과 · ${ps.score}점</p>`:''}</div>
      <div class="btns sp"><button class="btn" id="cl">닫기</button>${now?`<button class="btn y" id="go">${LI('play')}평가 시작</button>`:''}</div></div>`;
    screen.querySelector('#cl').onclick=()=>onClose&&onClose();
    const g=screen.querySelector('#go'); if(g) g.onclick=()=>start('new',s.name);
    return;
  }
  const n=s.chars.length, total=n+2;
  let i=at?Math.max(0,s.chars.indexOf(at)+1):0, seen=i;
  const wrote=new Set();
  const lab=c=> isRad?radHun(c):hunum(c);
  const draw=()=>{
    seen=Math.max(seen,i);
    setBar(s.name,{back:()=>{ if(gate&&G){G=null;document.onkeydown=null;} save(); onClose&&onClose(); }});
    let body='';
    const wch=i>=1&&i<=n?s.chars[i-1]:null, needW=gate&&wch&&writeOn()&&canWrite(wch)&&!wrote.has(wch);
    if(i===0&&s.cjm) body=`<span class="lk">천자문 ${s.g} · ${esc0(s.title)} · ${s.n}단원</span><h2>이번에 배울 구절 ${s.ph.length}개 · 한자 ${n}자</h2><p class="soft">네 글자씩 한 구절이에요. 구절의 뜻을 먼저 알고, 한 글자씩 넘기며 뜻과 음을 익혀요. 소리 내어 읽으면 더 잘 외워져요.</p>
      <div class="cjlist">${s.ph.map(k=>`<div class="cjone"><b class="hz">${PH[k].p}</b><span class="cjr">${PH[k].r}</span><small>${PH[k].m}</small>${PH[k].x?`<em>${PH[k].x}</em>`:''}</div>`).join('')}</div>
      <div class="grid10">${s.chars.map((c,k)=>`<button data-j="${k+1}"><b class="hz">${c}</b><small>${lab(c)}</small></button>`).join('')}</div>`;
    else if(i===0) body=`<span class="lk">${s.g} · ${s.n}단원${isRad?' · '+s.theme:''}</span><h2>이번에 배울 ${isRad?'부수':'한자'} ${n}자</h2><p class="soft">${isRad?'부수는 한자를 이루는 부품이에요. 부수를 알면 처음 보는 한자도 뜻을 짐작할 수 있어요. 모양, 이름, 바뀐 모양(변형)과 이 부수가 들어간 한자를 익혀요.':'한 글자씩 넘기며 뜻과 음, 글자가 만들어진 원리, 자주 쓰는 단어를 익혀요.'}</p>
      <div class="grid10">${s.chars.map((c,k)=>`<button data-j="${k+1}"><b class="hz">${c}</b><small>${lab(c)}</small></button>`).join('')}</div>`;
    else if(i<=n) body=`<span class="lk">${i} / ${n}</span>${isRad?radInfoHTML(s.chars[i-1]):infoHTML(s.chars[i-1])}${gate&&wch&&writeOn()&&canWrite(wch)?`<div class="itrace"><p class="itp" id="itp">${wrote.has(wch)?'잘 썼어요! 다음으로 넘어가요':'획순대로 따라 써야 다음으로 넘어가요'}</p><div class="wbtns"><button class="btn" id="iShow">획순 보기</button><button class="btn" id="iRe">다시 쓰기</button></div><div class="wbox" id="ihw"></div></div>`:''}`;
    else body=isRad?`<span class="lk">기억할 점</span><h2>부수는 뜻의 갈래를 알려 줘요</h2><p>氵가 있으면 물, 木이 있으면 나무, 言이 있으면 말과 관련 있는 글자예요. 바뀐 모양(변형)도 함께 기억해요.</p><p class="soft">${gate?`이 단원은 ${CAP(s)}개를 틀리면 처음부터 다시 해요. 이제 문제를 풀어요. 부수 이름 맞히기 → 부수 모양 고르기 → 한자 속 부수 찾기로 올라가요. 연속 ${GOAL}문제를 맞히면 다음 단원, 부수 6단원을 마치면 부수 확인 평가가 열려요.`:'통과한 단원은 3단원 뒤, 5단원 뒤에 다시 복습해요.'}</p>`
      :`<span class="lk">기억할 점</span><h2>뜻과 음을 함께 소리 내어 읽어요</h2><p>"${s.chars.slice(0,3).map(hunum).join(', ')}…"처럼 뜻과 음을 붙여 읽으면 시험의 훈음 문제와 독음 문제를 한 번에 준비할 수 있어요.</p><p class="soft">${gate?`이 단원은 ${CAP(s)}개를 틀리면 처음부터 다시 해요. 이제 문제를 풀어요. 뜻 힌트가 있는 음 맞히기부터, 잘 맞히면 힌트 없는 음 맞히기 → 한자어 읽기·한자 고르기·부수 찾기로 올라가요. 어려운 단계에서 연속 ${GOAL}문제를 맞히면 다음 단원으로 넘어가요. 통과한 단원은 3단원 뒤, 5단원 뒤에 다시 복습해요.`:'통과한 단원은 3단원 뒤, 5단원 뒤에 다시 복습해요. 틀린 문제는 오답노트에서 1·3·5일 뒤 다시 나와요.'}</p>`;
    const last=i===total-1;
    screen.innerHTML=`<div class="cx">
      <div class="steps" id="stp">${[['lightbulb','한눈에'],...s.chars.map(c=>[null,c]),['bookmark','기억']].map(([ic,t],k)=>`<span data-j="${k}" class="${k===i?'on':k<i?'done':''} ${ic?'':'hz'}">${ic?LI(k<i?'check':ic):''}${t}</span>`).join('')}</div>
      <div class="lyric" id="ly">${body}</div>
      <div class="btns sp">
        <button class="btn" id="prev" ${i===0?'disabled':''}>${LI('chevron-left')}이전</button>
        ${last?(gate?`<button class="btn y" id="done">${LI('circle-check-big')}다 봤어요 · 문제 풀기</button>`:`${onPractice?`<button class="btn y" id="prac">${LI('play')}이 단원 문제 풀기</button>`:''}<button class="btn k" id="done">닫기</button>`)
              :`<button class="btn k" id="next">다음${LI('chevron-right')}</button>`}
      </div>
      ${gate?`<p class="gate">${last?'다 보면 문제가 열려요':`처음 들어가는 단원이에요. 끝까지 넘겨야 문제가 열려요 (${i+1}/${total})`}</p>`:''}
    </div>`;
    const on=screen.querySelector('#stp .on'); if(on) on.scrollIntoView({block:'nearest',inline:'center'});
    screen.querySelector('#prev').onclick=()=>{i--;draw();};
    const nx=screen.querySelector('#next'); if(nx){ if(needW) nx.disabled=true; nx.onclick=()=>{i++;draw();screen.scrollTop=0;}; }
    const ihw=screen.querySelector('#ihw'); if(ihw&&wch){ const sz=Math.min(260,ihw.clientWidth||240); let wr; const unlock=()=>{ wrote.add(wch); const t=screen.querySelector('#itp'); if(t) t.textContent='잘 썼어요! 다음으로 넘어가요'; const n2=screen.querySelector('#next'); if(n2) n2.disabled=false; const dn=screen.querySelector('#done'); if(dn) dn.disabled=false; };
      const q=()=>{ ihw.innerHTML=''; wr=HanziWriter.create(ihw,wch,hwOpts(true,sz)); wr.quiz({showHintAfterMisses:1,onComplete:()=>unlock()}); }; q();
      screen.querySelector('#iShow').onclick=()=>{ ihw.innerHTML=''; wr=HanziWriter.create(ihw,wch,hwOpts(true,sz)); wr.animateCharacter({onComplete:()=>q()}); };
      screen.querySelector('#iRe').onclick=()=>q(); }
    screen.querySelectorAll('[data-j]').forEach(b=>b.onclick=()=>{ const j=+b.dataset.j; if(needW&&j>i) return; if(!gate||j<=seen+1){i=j;draw();screen.scrollTop=0;} });
    const dn=screen.querySelector('#done'); if(dn) dn.onclick=()=>{ if(gate){p.read[id]=true;save();} onClose&&onClose(true); };
    const pr=screen.querySelector('#prac'); if(pr) pr.onclick=()=>onPractice();
  };
  draw();
}

/* ---------- 풀이 ---------- */
function start(mode,title,arg){
  const p=P(), q=buildQueue(p,mode,arg); if(!q.length) return;
  G={mode,title,arg,q,i:0,cur:null,t0:0,lock:false,log:[],passedNow:[],reviewed:{},toast:'',began:performance.now(),away:0,answered:false,recent:[],exam:null};
  document.onkeydown=e=>{ if(!G||!G.cur) return; if(G.answered){ if(e.key==='Enter'||e.key===' '){e.preventDefault();next();} return; }
    if(/^[1-4]$/.test(e.key)) choose(+e.key-1); };
  advance();
}
function advance(){
  const g=G, p=P(), it=g.q[g.i], cs=curSt(p);
  if(it.src==='new'&&cs.kind==='exam'){ g.q.splice(g.i,g.q.length-g.i,...progItems(p,0)); return advance(); }
  if(it.src==='new'&&!p.read[cs.id]){
    g.cur=null; const t0=performance.now();
    return concept(cs.id,true,ok=>{ if(ok&&G===g){ g.away+=performance.now()-t0; advance(); } else { G=null; render(); } });
  }
  g.cur={src:it.src,...resolve(it,p,g)}; g.answered=false; g.t0=performance.now(); drawPlay();
}
const SRC={card:'오답 다시',review:'단원 복습',new:'새 진도',retry:'방금 틀린 문제',exam:'승급 평가'};
function drawPlay(){
  showTabs(false);
  const g=G,p=P(),c=g.cur,s=STAGES[IDX[c.st]]||curSt(p), lab=c.lab||(v=>v);
  setBar(g.title,{back:()=>{G=null;document.onkeydown=null;save();render();},help:c.src==='exam'?null:()=>openFromPlay(s.id,c.ch)});
  const ex=c.src==='exam'?g.log.filter(r=>r.src==='exam'):null;
  screen.innerHTML=`<div class="np">
    <div class="prog"><div class="tr"><i style="width:${g.i/g.q.length*100}%"></i></div><span>${g.i+1} / ${g.q.length}</span></div>
    ${g.toast?`<div class="toast">${g.toast}</div>`:''}
    <div class="ptag">${c.src==='new'?`<span class="lvl l-${LV_(s.id,p)}">${LV_(s.id,p)}</span>`:`<span class="lvl src">${SRC[c.src]}</span>`}<span>${TNAME[c.t]} · ${c.src==='exam'?`정답 ${ex.filter(r=>r.ok).length}/${ex.length}`:s.name}${c.src==='new'?` · 연속 ${p.streak}/${GOAL} · <b class="x">틀림 ${WR(p,s.id)}/${CAP(s)}</b>`:c.src==='exam'?` · <b class="x">틀림 ${ex.filter(r=>!r.ok).length}/${EXAM_CAP}</b>`:''}</span></div>
    <div class="board" id="board"><span class="fb" id="fb"></span><p class="ask">${c.ask}</p><div class="q ${c.qc}">${c.q}</div>${c.hint}</div>
    ${c.write?`<div class="wpad"><div class="wbox" id="hw"></div><div class="wbtns"><button class="btn" id="wShow">${LI('play')}획순 보기</button><button class="btn" id="wRe">${LI('rotate-ccw')}다시 쓰기</button></div><p class="note" id="wmsg">${c.trace?'흐린 글자 위에 첫 획부터 차례로 그어요':'틀린 획이 많으면 힌트가 떠요'}</p></div>`
      :`<div class="choices ${c.lab?'hzc':''}" id="ch">${c.choices.map((v,k)=>`<button data-c="${k}"><small>${k+1}</small><span class="${c.lab?'hz':''}">${lab(v)}</span></button>`).join('')}</div>`}
    ${wrongBox()}
    <div id="after"><p class="tip">${c.src==='exam'?'평가 중에는 소개를 볼 수 없어요. 차분히 골라요.':`모르면 오른쪽 위 ${LI('circle-help','inl')}로 단원 소개를 볼 수 있어요.`}</p></div>
  </div>`;
  g.toast='';
  screen.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>choose(+b.dataset.c));
  if(c.write) startWrite(g,c);
}
function hwOpts(trace,size){ return {width:size,height:size,padding:12,showOutline:trace,showCharacter:false,strokeColor:'#1E2421',outlineColor:'#D9DDE3',drawingColor:'#C2410C',drawingWidth:Math.round(size/11),highlightColor:'#0FA37F',strokeAnimationSpeed:1.2,delayBetweenStrokes:250,charDataLoader:skLoad}; }
function startWrite(g,c){
  const box=screen.querySelector('#hw'); if(!box) return; const size=Math.min(300,Math.max(220,box.clientWidth||260));
  const n=SK[c.ch].strokes.length, limit=Math.max(2,Math.floor(n/4));
  const wr=HanziWriter.create(box,c.ch,hwOpts(c.trace,size)); g.writer=wr; g.writeDone=false; g.wMiss=0;
  const quiz=()=>wr.quiz({showHintAfterMisses:c.trace?1:3,highlightOnComplete:true,
    onMistake:s=>{ g.wMiss=s.totalMistakes; const m=screen.querySelector('#wmsg'); if(m) m.textContent=`${s.strokeNum+1}번째 획이 달라요 · 틀린 획 ${s.totalMistakes}/${limit}`; },
    onComplete:s=>{ if(G!==g||g.cur!==c) return; g.writeDone=true; const ok=s.totalMistakes<=limit; choose(ok?0:1);
      const m=screen.querySelector('#wmsg'); if(m) m.textContent=ok?`잘 썼어요! (${n}획, 틀린 획 ${s.totalMistakes})`:`틀린 획이 ${s.totalMistakes}개라 다시 연습해요`; }});
  quiz();
  const sh=screen.querySelector('#wShow'); if(sh) sh.onclick=()=>{ wr.cancelQuiz(); wr.showCharacter(); wr.animateCharacter({onComplete:()=>{ if(!g.writeDone){ wr.hideCharacter(); quiz(); } }}); };
  const re=screen.querySelector('#wRe'); if(re) re.onclick=()=>{ if(g.writeDone) return; wr.cancelQuiz(); quiz(); };
}
/* 소개·정답 카드의 '따라 쓰기' (채점 없음) */
function openTrace(h){
  if(!canWrite(h)) return; const o=document.createElement('div'); o.className='wmodal'; o.setAttribute('role','dialog'); o.setAttribute('aria-label',h+' 따라 쓰기');
  o.innerHTML=`<div><div class="wtop"><b class="hz">${h}</b><span>${hunum(h)} · ${SK[h].strokes.length}획</span><button class="wxbtn" id="wx" aria-label="닫기">${LI('x')}</button></div><div class="wbox" id="hwm"></div>
    <div class="wbtns"><button class="btn" id="wa">${LI('play')}획순 보기</button><button class="btn" id="wt">${LI('pencil')}따라 쓰기</button><button class="btn" id="wf">${LI('pencil-line')}보고 쓰기</button></div><p class="note" id="wm">획순을 먼저 보고 따라 써 보세요</p></div>`;
  (document.querySelector('.app')||document.body).appendChild(o);
  const box=o.querySelector('#hwm'), size=Math.min(300,box.clientWidth||280); let wr=HanziWriter.create(box,h,{...hwOpts(true,size),showCharacter:true});
  const msg=t=>o.querySelector('#wm').textContent=t;
  const q=trace=>{ box.innerHTML=''; wr=HanziWriter.create(box,h,hwOpts(trace,size)); wr.quiz({showHintAfterMisses:trace?1:3,onMistake:s=>msg(`${s.strokeNum+1}번째 획이 달라요`),onComplete:s=>msg(s.totalMistakes?`다 썼어요 · 틀린 획 ${s.totalMistakes}개`:'완벽해요! 획순대로 잘 썼어요')}); msg(trace?'흐린 글자 위에 따라 써요':'보지 않고 써 봐요'); };
  o.querySelector('#wa').onclick=()=>{ box.innerHTML=''; wr=HanziWriter.create(box,h,{...hwOpts(true,size),showCharacter:false}); wr.animateCharacter(); msg('획순을 보여 주고 있어요'); };
  o.querySelector('#wt').onclick=()=>q(true); o.querySelector('#wf').onclick=()=>q(false);
  o.querySelector('#wx').onclick=()=>o.remove(); o.onclick=e=>{ if(e.target===o) o.remove(); };
}
document.addEventListener('click',e=>{ const b=e.target.closest&&e.target.closest('[data-trace]'); if(b){ e.preventDefault(); openTrace(b.dataset.trace); } });
function openFromPlay(id,ch){
  const g=G; if(!g) return; clearTimeout(g.timer); const keep=g.cur, was=g.answered, t0=performance.now(); g.cur=null;
  concept(id,false,()=>{ if(G!==g) return; g.away+=performance.now()-t0; g.cur=keep; if(was) return next(); drawPlay(); },null,ch);
}

/* 틀린 개수 칸: 지금 단계에서 틀린 개수(상한 대비) + 이번 학습에서 틀린 개수 */
function wrongBox(){ const g=G, p=P(); if(!g) return ''; const s=curSt(p), cap=s.kind==='exam'?EXAM_CAP:CAP(s), w=s.kind==='exam'?g.log.filter(r=>r.src==='exam'&&!r.ok).length:WR(p,s.id), sw=g.log.filter(r=>!r.ok).length;
  return `<div class="wcnt ${w>=cap-1?'full':''}" id="wcnt"><div class="r1"><b>틀린 개수</b><span class="dots">${Array.from({length:cap},(_,i)=>`<i class="${i<w?'on':''}"></i>`).join('')}</span><em>${w}/${cap}</em></div><small>${s.kind==='exam'?`${cap}개 틀리면 평가가 끝나요`:`${cap}개 틀리면 「${s.name}」을 처음부터 다시 해요`} · 이번 학습에서 <b>${sw}개</b> 틀림</small></div>`; }
function refreshWrong(){ const el=document.getElementById('wcnt'); if(el) el.outerHTML=wrongBox(); }

/* 답하면 자동으로 다음 문제: 맞히면 0.6초, 틀리면 설명을 2.5초 보여 주고 넘어감(멈추고 보기 가능) */
const AUTO_OK=600, AUTO_NO=2500, AUTO_LONG=3800;
function autoGo(ms,go){ const g=G; if(!g) return; clearTimeout(g.timer); const host=document.getElementById('autoBox');
  if(host) host.innerHTML=`<div class="autobar"><i style="animation-duration:${ms}ms"></i></div><button class="stopauto" id="stopAuto">멈추고 보기</button>`;
  g.timer=setTimeout(()=>{ if(G===g&&(g.answered||g.wrongWait)) go(); },ms);
  const st=document.getElementById('stopAuto'); if(st) st.onclick=()=>{ clearTimeout(g.timer); host.innerHTML='<small class="autonote">멈췄어요. 다 보면 다음 문제를 눌러요.</small>'; };
}
function next(){ const g=G; if(!g) return; clearTimeout(g.timer); g.answered=false; g.lock=false; g.i++; if(g.i>=g.q.length) return finish(); advance(); screen.scrollTop=0; }
function passUnit(p,s,g,t){ if(p.wr) delete p.wr[s.id]; p.np++; p.passed[s.id]={box:0,due:p.np+REV_GAP[0]}; g.passedNow.push(s.name); HG('pass'); p.stage++; p.streak=0; areaF=null; }
function choose(k){
  const g=G; if(!g||g.lock||!g.cur||g.answered) return; if(g.cur.write&&!g.writeDone) return;
  const p=P(),c=g.cur,t=today(),s=STAGES[IDX[c.st]]||curSt(p), you=c.choices[k], ok=you===c.ans;
  const ar=(c.t==='rh'||c.t==='rs'||c.t==='rc')?'부수':String(c.ch)[0]==='P'||TRK==='cjm'?((STAGES[IDX[STOF[c.ch]]]||{}).area||'천자문'):(TRK==='school'?((STAGES[IDX[STOF[c.ch]]]||{}).area||LV[CH[c.ch].lv]):LV[CH[c.ch].lv]);
  g.answered=true; HG(ok?'ok':'no');
  p.stat[ar]=p.stat[ar]||{n:0,c:0}; p.stat[ar].n++; if(ok)p.stat[ar].c++;
  const h=p.hist[t]=p.hist[t]||{n:0,c:0,ms:0}; h.n++; if(ok)h.c++; h.ms=(h.ms||0)+Math.min(performance.now()-g.t0,60000);
  g.log.push({ch:c.ch,t:c.t,w:c.w,x:c.x,ans:c.ans,you,ok,src:c.src,st:c.st,lab:c.lab});
  if(c.src==='card'){ const cd=c.card;
    if(ok){ cd.box++; if(cd.box>=3){ p.cards=p.cards.filter(x=>x!==cd); p.grad++; HG('grad'); g.toast='오답 졸업!'; } else cd.due=t+CARD_GAP[cd.box]; }
    else { cd.box=0; cd.due=t+1; cd.wrong++; } }
  if(c.src==='review'){ const id=g.q[g.i].st; const r=g.reviewed[id]=g.reviewed[id]||{n:0,w:0,free:!!g.q[g.i].free}; r.n++; if(!ok){r.w++; addCard(p,c);} }
  let restart='';
  if(c.src==='exam'){ g.exam=c.exam; if(!ok){ addCard(p,c); const w=g.log.filter(r=>r.src==='exam'&&!r.ok).length; if(w>=EXAM_CAP){ g.q=g.q.filter((it,j)=>j<=g.i||it.src!=='exam'); g.examStop=true; restart=`${EXAM_CAP}개를 틀려서 평가가 끝났어요. 틀린 한자를 복습하고 다시 도전해요.`; } } }
  let passMsg='';
  if(c.src==='new'){ const cs=curSt(p);
    p.bp=p.bp||{}; const pos=p.bp[cs.id]||0;
    p.bp[cs.id]=ok?Math.min(9,pos+(p.streak>=2?2:1)):Math.max(0,pos-2);
    if(ok){ p.streak++; if(p.streak>=GOAL&&p.bp[cs.id]>=6&&p.stage<STAGES.length-1){ passUnit(p,cs,g,t); const nx=curSt(p);
        passMsg=g.toast=`${cs.name} 통과! ${nx.kind==='exam'?`이제 ${nx.name}에 도전해요`:'다음 단원은 소개부터 시작해요'} · 3단원 뒤에 복습해요`;
        g.q.splice(g.i+1); g.q.push(...revItems(dueStages(p).slice(0,2)),...progItems(p,Math.max(4,10-dueStages(p).length*REV_Q)).slice(0,nx.kind==='exam'?EXAM_N:10)); } }
    else { const cs=curSt(p); p.streak=0; addCard(p,c); p.wr=p.wr||{}; p.wr[cs.id]=(p.wr[cs.id]||0)+1;
      if(p.wr[cs.id]>=CAP(cs)){ p.wr[cs.id]=0; p.bp[cs.id]=0; p.read[cs.id]=false; g.restarts=(g.restarts||0)+1; restart=`${CAP(cs)}개를 틀려서 「${cs.name}」을 처음부터 다시 시작해요. 소개부터 다시 봐요.`; } } }
  if(!ok&&c.src!=='retry'&&c.src!=='exam') g.q.splice(Math.min(g.i+4,g.q.length),0,{src:'retry',qq:{...c,src:'retry',choices:(window.hgReshuf?hgReshuf(c):(c.choices&&!c.ox?shuffle(c.choices):c.choices))}});
  save(); refreshWrong();
  screen.querySelectorAll('#ch button').forEach((b,j)=>{ b.disabled=true; const v=c.choices[j]; if(v===c.ans) b.classList.add('ok'); else if(j===k) b.classList.add('no'); });
  const b=screen.querySelector('#board'),fb=screen.querySelector('#fb'); b.classList.add(ok?'ok':'no');
  const lab=c.lab||(v=>v);
  fb.className='fb '+(ok?'ok':'no'); fb.innerHTML=ok?'정답!':`정답은 <span class="${c.lab?'hz':''}">${lab(c.ans)}</span>${c.src==='exam'?' · 오답노트에 저장':' · 3문제 뒤 다시 나와요'}`;
  if(restart&&!ok) g.q.splice(g.i+1,0); const last=g.i>=g.q.length-1;
  const infoCh=c.t==='r'?c.ch:(c.t==='rc'?c.ch:c.ch);
  if(ok&&!passMsg&&!restart){ screen.querySelector('#after').innerHTML='<p class="okflash">정답! 다음 문제로 넘어가요</p>'; g.timer=setTimeout(()=>{ if(G===g&&g.answered) next(); },AUTO_OK); return; }
  screen.querySelector('#after').innerHTML=`
    ${passMsg?`<div class="toast">${passMsg}</div>`:''}${restart?`<div class="toast warn">${restart}</div>`:''}
    <div id="autoBox"></div>
    <div class="wrongbar">${c.src==='exam'?'':`<button class="btn" id="seeCx">${LI('book-open')}단원 소개</button>`}<button class="btn y" id="goOn">${last?'결과 보기':'다음 문제'}${LI('arrow-right')}</button></div>
    <p class="lk2">${ok?'정답이에요! 더 알아봐요':'다시 살펴봐요'}</p>
    ${c.t==='rc'&&c.x&&CH[c.x]?infoHTML(c.x):''}${infoOf(infoCh,c.t)}`;
  if(passMsg) g.toast='';
  const sc=screen.querySelector('#seeCx'); if(sc) sc.onclick=()=>openFromPlay(s.id,c.ch);
  screen.querySelector('#goOn').onclick=()=>next();
  autoGo(passMsg||restart?AUTO_LONG:AUTO_NO,next);
}
function mmss(ms){ const s=Math.round(ms/1000); return s<60?`${s}초`:`${Math.floor(s/60)}분 ${s%60}초`; }
function finish(){
  const g=G,p=P(),t=today(); G=null; document.onkeydown=null;
  const revRes=Object.entries(g.reviewed).map(([id,r])=>{ const ps=p.passed[id]; if(!ps||ps.exam||r.free) return [id,r,null];
    if(r.w===0){ ps.box=Math.min(2,ps.box+1); if(ps.box<2) ps.due=p.np+REV_GAP[ps.box]; return [id,r,ps.box>=2?'완성!':`${REV_GAP[1]}단원 뒤 한 번 더`]; }
    ps.box=0; ps.due=p.np+REV_GAP[0]; return [id,r,`${REV_GAP[0]}단원 뒤 다시`]; });
  let examRes=null;
  if(g.exam){ const ex=g.log.filter(r=>r.src==='exam'), c=ex.filter(r=>r.ok).length, sc=Math.round(c/ex.length*100), s=STAGES[IDX[g.exam]];
    const pass=ex.length>=EXAM_N&&c>=Math.ceil(EXAM_N*EXAM_PASS);
    examRes={s,c,n:ex.length,sc,pass};
    if(pass&&curSt(p).id===s.id){ p.np++; p.passed[s.id]={exam:true,box:2,score:sc}; if(p.stage<STAGES.length-1) p.stage++; else p.allDone=true; p.streak=0; areaF=null; } }
  const per={}; g.log.filter(r=>r.src==='new'||r.src==='review').forEach(r=>{ const o=per[r.st]=per[r.st]||{n:0,c:0}; o.n++; if(r.ok)o.c++; });
  Object.entries(per).forEach(([id,o])=>{ if(!STAGES[IDX[id]]) return; const a=p.sst[id]=p.sst[id]||[]; a.push(Math.round(o.c/o.n*100)); if(a.length>3)a.shift(); });
  save(); tab='home'; showTabs(true);
  const n=g.log.length,c=g.log.filter(r=>r.ok).length, wrong=g.log.filter(r=>!r.ok&&r.src!=='retry');
  const time=mmss(performance.now()-g.began-g.away);
  setBar(g.title+' 결과');
  screen.innerHTML=`<div class="res">
    <div class="box center"><small class="note">${dlabel(t)} · 풀이 시간 ${time}</small><div class="big">${n?Math.round(c/n*100):0}점</div><p class="note">${n}문제 중 ${c}개 정답 (틀린 문제 다시 풀기 포함)</p></div>
    ${examRes?`<div class="box center exres ${examRes.pass?'pass':''}"><h3>${examRes.s.name} ${examRes.pass?'통과!':'다시 도전'}</h3><p class="note">${examRes.n}문제 중 ${examRes.c}개 정답 (통과 기준 ${Math.ceil(EXAM_N*EXAM_PASS)}개)</p><p>${examRes.pass?(p.allDone?'<b>모든 과정을 마쳤어요! 이제 복습과 오답으로 실력을 지켜요.</b>':`다음: <b>${curSt(p).name}</b>`):g.examStop?`${EXAM_CAP}개를 틀려서 평가가 일찍 끝났어요. 틀린 한자를 오답노트로 복습하고 다시 도전해요.`:examRes.n<EXAM_N?'평가를 끝까지 풀어야 결과가 나와요.':'틀린 한자를 오답노트로 복습하고 다시 도전해요.'}</p></div>`:''}
    <div class="grid3"><div class="cell"><b>${wrong.length}</b><span>내일 다시 나올 오답</span></div><div class="cell"><b>${g.passedNow.length}</b><span>통과한 단원</span></div><div class="cell"><b>${p.streak}/${GOAL}</b><span>지금 단원 연속</span></div></div>
    ${g.passedNow.length?`<div class="toast">${g.passedNow.join(', ')} 통과 → 지금: ${curSt(p).name}</div>`:''}${g.restarts?`<div class="toast warn">틀림 상한에 닿아 「${curSt(p).name}」을 처음부터 다시 해요</div>`:''}
    ${revRes.length?`<div class="box"><h3>단원 복습 결과 <small class="note">3단원 뒤 → 5단원 뒤</small></h3><div class="list">${revRes.map(([id,r,m])=>`<div><span>${STAGES[IDX[id]].name}</span><span>${r.w?`<span class="x">✕${r.w}</span> `:'다 맞음 '}${m?'→ '+m:''}</span></div>`).join('')}</div></div>`:''}
    ${wrong.length?`<div class="box"><h3>틀린 문제 <small class="note">오답노트에 저장됨</small></h3><ul class="units in">${wrong.slice(0,8).map(r=>`<li><button class="unit" data-ch="${r.ch}" data-st="${r.st}"><b class="mq">${cardLine(r)}</b><small>${TNAME[r.t]} · 내 답 <span class="x ${r.lab?'hz':''}">${r.lab?r.lab(r.you):r.you}</span></small></button><button class="qbtn" data-ch="${r.ch}" data-st="${r.st}" aria-label="소개">${Q_ICON}</button></li>`).join('')}</ul></div>`:'<p class="note center">틀린 문제가 없어요.</p>'}
    <div class="btns sp"><button class="btn" id="home">${LI('house')}한자학습으로</button><button class="btn k" id="cards">${LI('notebook-pen')}오답노트 보기</button></div>
  </div>
  <div class="dim" id="dlg"><div class="dialog" role="dialog" aria-labelledby="dt"><h3 id="dt">${LI('bell')}알림</h3><p>문제풀이가 끝났습니다.<br>문제풀이 시간: <b>${time}</b><br>정답: <b>${c} / ${n}</b>${examRes?`<br>${examRes.s.name}: <b>${examRes.pass?'통과':'다시 도전'}</b>`:''}${wrong.length?`<br>틀린 ${wrong.length}문제는 내일 다시 나와요.`:''}</p><button id="dok">확인</button></div></div>`;
  screen.querySelector('#dok').onclick=()=>screen.querySelector('#dlg').remove();
  screen.querySelector('#home').onclick=()=>setTab('home');
  screen.querySelector('#cards').onclick=()=>setTab('cards');
  screen.querySelectorAll('[data-ch]').forEach(b=>b.onclick=()=>openConcept(b.dataset.st,()=>setTab('cards'),b.dataset.ch));
}

let trk0='school'; try{ trk0=localStorage.getItem('hanja-track')||'school'; }catch(e){}
buildTrack(trk0);
tabs.querySelectorAll('button').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
let iconQ=false;
/* 루시드 아이콘 (lucide 0.469.0, ISC) — 쓰는 것만 인라인 */
__LUCIDE__
function drawIcons(){ document.querySelectorAll("i[data-lucide]").forEach(el=>{ const n=el.dataset.lucide, b=LUCIDE[n]; if(!b) return; const t=document.createElement("span"); t.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${n} ${el.className||""}" aria-hidden="true">${b}</svg>`; el.replaceWith(t.firstChild); }); iconQ=false; }
new MutationObserver(()=>{ if(!iconQ&&document.querySelector('i[data-lucide]')){ iconQ=true; requestAnimationFrame(drawIcons); } }).observe(document.querySelector('.app'),{childList:true,subtree:true});
render(); drawIcons();
