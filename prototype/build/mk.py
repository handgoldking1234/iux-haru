import os
import csv, ast, json, re, sys, collections
D=os.path.dirname(os.path.abspath(__file__))+'/../data/'
LV=['8급','7급Ⅱ','7급','6급Ⅱ','6급','5급Ⅱ','5급','4급Ⅱ','4급','3급Ⅱ','3급','2급','1급']
import unicodedata
rows=[r for r in csv.DictReader(open(D+'hgd/hanja.csv')) if r['level'] in LV]
ncompat=sum(1 for r in rows if unicodedata.normalize('NFC',r['hanja'])!=r['hanja'])
for r in rows: r['hanja']=unicodedata.normalize('NFC',r['hanja']); r['radical']=unicodedata.normalize('NFC',r['radical'])
print('compat normalized',ncompat, len({r['hanja'] for r in rows}))
print('rows',len(rows))
# libhangul single chars + words
single=collections.defaultdict(list); words=collections.defaultdict(list)
for line in open(D+'hanja.txt',encoding='utf8'):
    if line.startswith('#'): continue
    p=line.rstrip('\n').split(':')
    if len(p)<3: continue
    h,c,cm=p[0],p[1],p[2]
    if len(c)==1 and len(h)==1:
        if cm: single[c].append(cm)
    elif len(c)==2 and len(h)==2:
        words[h].append(c)
freq={}
for i,l in enumerate(open(D+'ko50k.txt',encoding='utf8')):
    w=l.split()[0]
    if w not in freq: freq[w]=i
ids={}
for l in open(D+'ids.txt',encoding='utf8'):
    if l.startswith('#'): continue
    p=l.rstrip('\n').split('\t')
    if len(p)>=3: ids[p[1]]=re.sub(r'\[.*?\]','',p[2])
CH={}
order=[]
for r in rows:
    m=ast.literal_eval(r['meaning'])
    rd=[(' '.join(x[0]) if False else x[0][0], x[1][0]) for x in m]
    hun,eum=rd[0]
    alt=' / '.join(f'{a} {b}' for a,b in rd[1:])
    CH[r['hanja']]=dict(h=r['hanja'],hun=hun,eum=eum,alt=alt,lv=LV.index(r['level']),rad=r['radical'],st=int(r['total_strokes']),allE={b for a,b in rd})
    order.append(r['hanja'])
print('chars',len(CH))
def jamo(s):
    o=ord(s)-0xAC00
    if o<0 or o>11171: return None
    return (o//588,(o%588)//28,o%28)
# words: libhangul freq-hanjaeo score
def dueum(e):
    j=jamo(e) if len(e)==1 else None
    if not j: return {e}
    o={e}
    if j[0]==5: o.add(chr(0xAC00+2*588+j[1]*28+j[2])); o.add(chr(0xAC00+11*588+j[1]*28+j[2]))
    if j[0]==2: o.add(chr(0xAC00+11*588+j[1]*28+j[2]))
    # ㄹ/ㄴ + ㅕ,ㅖ,ㅛ,ㅠ,ㅣ,ㅑ → ㅇ (yes covered); 렬/률 → 열/율 covered
    return o
def okread(c,h):
    if len(h)!=2: return False
    for x,y in zip(c,h):
        if x not in CH: return False
        al=set()
        for e in CH[x]['allE']: al|=dueum(e)
        if y not in al: return False
    return True
IV={2,6,12,17,20}  # ㅑ ㅕ ㅛ ㅠ ㅣ (+ㅖ=7)
IV.add(7)
def pen(h):
    a,b=jamo(h[0]),jamo(h[1]); p=0
    if a and a[0]==5: p+=2                       # 첫소리 ㄹ
    if a and a[0]==2 and a[1] in IV: p+=2        # 첫소리 녀/뇨/뉴/니
    if b and b[0]==5 and b[1]==6 and b[2]==8 and a and (a[2]==0 or a[2]==4): p+=2  # 렬 after 모음/ㄴ
    if b and b[0]==5 and b[1]==17 and b[2]==8 and a and (a[2]==0 or a[2]==4): p+=2 # 률 after 모음/ㄴ
    return p
rd={}
for h,lst in words.items():
    for c in lst:
        if okread(c,h) and (c not in rd or (pen(h),freq.get(h,99999))<(pen(rd[c]),freq.get(rd[c],99999))): rd[c]=h
sc={}
for l in open(D+'lh/data/hanja/freq-hanjaeo.txt',encoding='utf8'):
    if l.startswith('#'): continue
    p=l.rstrip().split(':')
    if len(p)==2 and len(p[0])==2 and p[0] in rd:
        v=int(p[1])%1000000
        if v>=300 and all(x in CH for x in p[0]): sc[p[0]]=max(v,sc.get(p[0],0))
W={c:(rd[c],v) for c,v in sc.items()}
print('words',len(W))
byc=collections.defaultdict(list)
for c,(h,v) in W.items():
    for x in set(c): byc[x].append((-v,c,h))
# components
VAR={'青':'靑','⻘':'靑','争':'爭','𠂉':'人','氵':'水','扌':'手','忄':'心','亻':'人','艹':'艸','⺿':'艸','礻':'示','衤':'衣','犭':'犬','灬':'火','刂':'刀','辶':'辵','⻌':'辵','⻍':'辵','攵':'攴','罒':'网','⺮':'竹','𥫗':'竹','糹':'糸','纟':'糸','訁':'言','飠':'食','釒':'金','⺼':'肉','𧾷':'足','⻊':'足','王':'玉','⺗':'心','㣺':'心','⺌':'小','⺍':'小','爫':'爪','⺈':'刀','⺁':'厂','尣':'尢','⺧':'牛','牜':'牛','⺩':'玉','⺤':'爪','⻏':'邑','⻖':'阜','冫':'冫','𠆢':'人','⺊':'卜'}
COMPN={'水':'물 수','手':'손 수','心':'마음 심','人':'사람 인','艸':'풀 초','示':'보일 시','衣':'옷 의','犬':'개 견','火':'불 화','刀':'칼 도','辵':'쉬엄쉬엄 갈 착','攴':'칠 복','网':'그물 망','竹':'대 죽','糸':'실 사','言':'말씀 언','食':'밥 식','金':'쇠 금','肉':'고기 육','足':'발 족','玉':'구슬 옥','小':'작을 소','爪':'손톱 조','厂':'언덕 엄','尢':'절름발이 왕','牛':'소 우','邑':'고을 읍','阜':'언덕 부','冫':'얼음 빙','卜':'점 복','宀':'집 면','冖':'덮을 멱','广':'집 엄','疒':'병들 녁','彳':'조금 걸을 척','尸':'주검 시','囗':'에워쌀 위','亠':'돼지해머리 두','儿':'어진사람 인','廾':'받들 공','彡':'터럭 삼','夂':'뒤져올 치','匚':'상자 방','勹':'쌀 포','冂':'멀 경','几':'안석 궤','丶':'점 주','丿':'삐침 별','乙':'새 을','亅':'갈고리 궐','匕':'비수 비','厶':'사사 사','又':'또 우','口':'입 구','土':'흙 토','夕':'저녁 석','大':'큰 대','女':'계집 녀','子':'아들 자','寸':'마디 촌','山':'메 산','巛':'내 천','川':'내 천','工':'장인 공','己':'몸 기','巾':'수건 건','干':'방패 간','幺':'작을 요','弓':'활 궁','戈':'창 과','戶':'지게 호','支':'지탱할 지','文':'글월 문','斗':'말 두','斤':'도끼 근','方':'모 방','日':'날 일','曰':'가로 왈','月':'달 월','木':'나무 목','欠':'하품 흠','止':'그칠 지','歹':'뼈앙상할 알','殳':'몽둥이 수','毋':'말 무','比':'견줄 비','毛':'털 모','氏':'성씨 씨','气':'기운 기','父':'아비 부','片':'조각 편','牙':'어금니 아','玄':'검을 현','瓦':'기와 와','甘':'달 감','生':'날 생','用':'쓸 용','田':'밭 전','疋':'발 소','癶':'필발머리 발','白':'흰 백','皮':'가죽 피','皿':'그릇 명','目':'눈 목','矛':'창 모','矢':'화살 시','石':'돌 석','禸':'짐승발자국 유','禾':'벼 화','穴':'구멍 혈','立':'설 립','米':'쌀 미','缶':'장군 부','羊':'양 양','羽':'깃 우','老':'늙을 로','而':'말이을 이','耒':'가래 뢰','耳':'귀 이','聿':'붓 율','臣':'신하 신','自':'스스로 자','至':'이를 지','臼':'절구 구','舌':'혀 설','舟':'배 주','艮':'괘이름 간','色':'빛 색','虍':'범의문채 호','虫':'벌레 훼','血':'피 혈','行':'다닐 행','襾':'덮을 아','見':'볼 견','角':'뿔 각','谷':'골 곡','豆':'콩 두','豕':'돼지 시','豸':'발없는벌레 치','貝':'조개 패','赤':'붉을 적','走':'달릴 주','身':'몸 신','車':'수레 거','辛':'매울 신','辰':'별 진','酉':'닭 유','釆':'분별할 변','里':'마을 리','長':'긴 장','門':'문 문','隶':'미칠 이','隹':'새 추','雨':'비 우','靑':'푸를 청','非':'아닐 비','面':'낯 면','革':'가죽 혁','韋':'가죽 위','音':'소리 음','頁':'머리 혈','風':'바람 풍','飛':'날 비','首':'머리 수','香':'향기 향','馬':'말 마','骨':'뼈 골','高':'높을 고','髟':'터럭 표','鬥':'싸울 투','鬼':'귀신 귀','魚':'물고기 어','鳥':'새 조','鹿':'사슴 록','麥':'보리 맥','麻':'삼 마','黃':'누를 황','黍':'기장 서','黑':'검을 흑','鼓':'북 고','鼠':'쥐 서','鼻':'코 비','齒':'이 치','龍':'용 룡','一':'한 일','丨':'뚫을 곤','二':'두 이','八':'여덟 팔','十':'열 십','力':'힘 력','入':'들 입','凵':'위튼입구 감','卩':'병부 절','厂':'언덕 엄','夊':'천천히걸을 쇠','弋':'주살 익','彐':'튼가로왈 계','爻':'점괘 효','爿':'나뭇조각 장','犬':'개 견','瓜':'오이 과','示':'보일 시','肉':'고기 육','艸':'풀 초'}
def norm(c): return VAR.get(c,c)
def info(c):
    c=norm(c)
    if c in CH: return f"{CH[c]['hun']} {CH[c]['eum']}"
    if c in COMPN: return COMPN[c]
    if single.get(c): return single[c][0]
    return None
def eumof(c):
    c=norm(c)
    if c in CH: return CH[c]['allE']
    s=info(c)
    if not s: return set()
    e=s.split()[-1]
    return {e} if len(e)==1 else set()
def dec(h):
    s=h
    return [ch for ch in jamo_split(h)]
def jamo(s):
    o=ord(s)-0xAC00
    if o<0 or o>11171: return None
    return (o//588,(o%588)//28,o%28)
def match(a,b):
    if a==b: return 1
    if len(a)!=1 or len(b)!=1: return 0
    ja,jb=jamo(a),jamo(b)
    if not ja or not jb: return 0
    # 두음법칙 ㄴ/ㄹ/ㅇ 초성 동일 취급
    g=lambda x: 11 if x in (2,5,11) else x
    if g(ja[0])==g(jb[0]) and ja[1]==jb[1] and ja[2]==jb[2]: return 1
    if ja[1]==jb[1] and ja[2]==jb[2]: return 2
    if g(ja[0])==g(jb[0]) and ja[2]==jb[2]: return 2
    return 0
OPS=set('⿰⿱⿲⿳⿴⿵⿶⿷⿸⿹⿺⿻')
def topcomps(c):
    s=ids.get(c)
    if not s or s==c or s[0] not in OPS: return None
    # parse prefix tree; return top-level children
    pos=[0]
    def parse():
        ch=s[pos[0]]; pos[0]+=1
        if ch in OPS:
            n=3 if ch in '⿲⿳' else 2
            kids=[parse() for _ in range(n)]
            return ''.join(kids) if False else ('#'+ch, kids)
        return ch
    try: t=parse()
    except Exception: return None
    def flat(n):
        return n if isinstance(n,str) else None
    kids=t[1]
    out=[]
    for k in kids:
        if isinstance(k,str): out.append(k)
        else:
            # use the whole sub-tree's char if exists? find a char with this IDS
            out.append(None)
    return out
# reverse IDS to recover subtree chars
rev={}
for k,v in ids.items():
    if len(k)==1 and v and v[0] in OPS: rev.setdefault(v,k)
def topcomps2(c):
    s=ids.get(c)
    if not s or s[0] not in OPS: return None
    pos=[0]
    def parse():
        st=pos[0]; ch=s[pos[0]]; pos[0]+=1
        if ch in OPS:
            n=3 if ch in '⿲⿳' else 2
            for _ in range(n): parse()
        return s[st:pos[0]]
    try:
        pos[0]=1; n=3 if s[0] in '⿲⿳' else 2
        parts=[parse() for _ in range(n)]
    except Exception: return None
    res=[]
    for p in parts:
        if len(p)==1: res.append(p)
        elif p in rev: res.append(rev[p])
        else: return None
    if any(ord(x)>=0xF0000 or not info(x) for x in res): return None
    return res
OR={}; stats=collections.Counter()
for h,c in CH.items():
    comps=topcomps2(h)
    if not comps:
        sid=ids.get(h)
        if not sid or sid==h or sid[0] not in OPS: OR[h]=['S']; stats['S']+=1; continue
        # top-level raw parts
        pos=[1]
        def pr():
            st=pos[0]; ch=sid[pos[0]]; pos[0]+=1
            if ch in OPS:
                for _ in range(3 if ch in '⿲⿳' else 2): pr()
            return sid[st:pos[0]]
        try: parts=[pr() for _ in range(3 if sid[0] in '⿲⿳' else 2)]
        except Exception: parts=[]
        rad=norm(c['rad'])
        rp=[p for p in parts if len(p)==1 and norm(p)==rad and info(p)]
        if rp:
            rest=''.join(x for p in parts if p!=rp[0] for x in (rev.get(p,p) if len(p)>1 else p) if x not in OPS and ord(x)<0xF0000 and not ('①'<=x<='⑳'))
            OR[h]=['R',rp[0],rest]; stats['R']+=1
        else: OR[h]=['P']; stats['P']+=1
        continue
    rad=norm(c['rad'])
    best=None
    for x in comps:
        if norm(x)==rad: continue
        for e in eumof(x):
            for me in [m for m in c['allE'] if len(m)==1]:
                m=match(me,e)
                if m and (best is None or m<best[0]): best=(m,x)
    radc=[x for x in comps if norm(x)==rad]
    if best and (best[0]==1 or radc):
        mean=[x for x in comps if x!=best[1]]
        OR[h]=['F',''.join(mean),best[1]]; stats['F']+=1
    else:
        OR[h]=['H',''.join(comps)]; stats['H']+=1
print(stats)
for t in '家好明語校情信休男江河問聞淸請持特':
    if t in OR: print(t,OR[t],CH[t]['eum'])
COMP={}
for h,c in CH.items():
    r=c['rad']
    if r not in CH and info(r): COMP[r]=info(r)
for h,o in OR.items():
    for x in ''.join(o[1:]):
        if x not in CH and info(x): COMP[x]=info(x)
# stages
out_ch=[]; stages=[]
for li,lv in enumerate(LV):
    cs=[h for h in order if CH[h]['lv']==li]
    if li==0:
        pref=list('一二三四五六七八九十')
        cs=pref+sorted([x for x in cs if x not in pref],key=lambda x:(CH[x]['st'],x))
    else: cs=sorted(cs,key=lambda x:(CH[x]['st'],CH[x]['eum']))
    groups=[cs[i:i+10] for i in range(0,len(cs),10)]
    if len(groups)>1 and len(groups[-1])<5:
        last=groups.pop(); groups[-1]=groups[-1]+last
    for gi,g in enumerate(groups): stages.append([li,gi+1,''.join(g)])
CHA=[[h,c['hun'],c['eum'],c['alt'],c['lv'],c['rad'],c['st']] for h,c in CH.items()]
WD={}
for h in CH:
    l=sorted(byc[h])[:6]
    if l: WD[h]=' '.join(f"{c}{hh}" for f,c,hh in l)
print('chars w/ words',len(WD))
import unicodedata as _u
BASIC=''.join(_u.normalize('NFC',x) for x in json.load(open(D+'hanja-graph/crawlers/naver/data/basic_hanjas.json')))
data=dict(LV=LV,CH=CHA,ST=stages,WD=WD,OR={h:'|'.join(o) for h,o in OR.items()},CP=COMP,BASIC=BASIC)
s=json.dumps(data,ensure_ascii=False,separators=(',',':'))
open(os.path.dirname(os.path.abspath(__file__))+'/data.json','w').write(s)
print('size',len(s.encode()),'stages',len(stages))
print([ (k,WD.get(k)) for k in '和女六樂北率料' ])
