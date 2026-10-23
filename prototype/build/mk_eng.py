import json,os,collections,re
D=os.path.dirname(os.path.abspath(__file__))+'/../data/'
B=os.path.dirname(os.path.abspath(__file__))+'/'
order=json.load(open(D+'words_ordered.json'))
info={}
for i in range(6):
    p=D+f'vchunks/out_{i}.jsonl'
    if not os.path.exists(p): print('missing',i); continue
    for l in open(p,encoding='utf8'):
        l=l.strip()
        if l: o=json.loads(l); info[o['w']]=o
print('have',len(info),'of',len(order))
import cmudict
cd=cmudict.dict()
A={'AA':'ɑ','AE':'æ','AH':'ʌ','AO':'ɔ','AW':'aʊ','AY':'aɪ','EH':'ɛ','ER':'ər','EY':'eɪ','IH':'ɪ','IY':'i','OW':'oʊ','OY':'ɔɪ','UH':'ʊ','UW':'u',
 'B':'b','CH':'tʃ','D':'d','DH':'ð','F':'f','G':'g','HH':'h','JH':'dʒ','K':'k','L':'l','M':'m','N':'n','NG':'ŋ','P':'p','R':'r','S':'s','SH':'ʃ','T':'t','TH':'θ','V':'v','W':'w','Y':'j','Z':'z','ZH':'ʒ'}
CL={'pl','pr','tr','dr','kl','kr','bl','br','gl','gr','fl','fr','sp','st','sk','sm','sn','sl','sw','kw','tw','θr','ʃr','dw','pj','bj','kj','fj','mj','hj','vj'}
def ipa(w):
    pr=cd.get(w.lower())
    if not pr: return ''
    toks=[]
    for ph in pr[0]:
        m=re.match(r'([A-Z]+)(\d?)',ph); b,s=m.groups()
        sym=A.get(b,'')
        if b=='AH' and s=='0': sym='ə'
        toks.append([sym,s])
    nv=sum(1 for t in toks if t[1]!='')
    out=[]
    for i,(sym,s) in enumerate(toks):
        if s=='1' and nv>1:
            j=len(out)
            k=j
            while k>0 and out[k-1][1]=='' and out[k-1][0]!='ˈ': k-=1
            cons=[t[0] for t in out[k:j]]
            n=0
            if cons:
                n=1
                if len(cons)>=2 and (cons[-2]+cons[-1]) in CL: n=2
                if len(cons)>=3 and cons[-3]=='s' and (cons[-2]+cons[-1]) in CL: n=3
            out.insert(j-n,['ˈ','x'])
        out.append([sym,s])
    return ''.join(t[0] for t in out)
TH=['사람·가족','몸·건강','음식','동물·자연','수·색·모양','집·물건','학교·공부','장소·교통','시간·날씨','감정·성격','동작','상태·성질','소통·생각','사회·일','과학·기술','기능어']
LV=['초등','중등','고등']
W=[]; bad=[]
for o in order:
    x=info.get(o['w'])
    if not x: bad.append(o['w']); continue
    th=x.get('th') if x.get('th') in TH else '상태·성질'
    W.append([o['w'],o['lv'],x.get('pos','').strip(),x.get('ko','').strip(),x.get('ex','').strip(),x.get('exko','').strip(),th,o['alt'],o['der'],ipa(o['w']),o['f']])
print('missing info',len(bad),bad[:10])
ST=[]
for lv in range(3):
    allw=sorted([w for w in W if w[1]==lv],key=lambda w:w[10])
    half=len(allw)//2
    bands=[(1,allw[:half]),(0,allw[half:])]   # 1=필수 핵심(많이 쓰는 앞 절반) 먼저
    for core,ws in bands:
      for th in TH:
        g=sorted([w for w in ws if w[6]==th],key=lambda w:w[10])
        if not g: continue
        chunks=[g[i:i+10] for i in range(0,len(g),10)]
        if len(chunks)>1 and len(chunks[-1])<5:
            last=chunks.pop(); chunks[-1]=chunks[-1]+last
        for ch in chunks: ST.append([lv,th,[w[0] for w in ch],core])
# number units per level
out=[]; cnt=collections.Counter()
for lv,th,ws,core in ST:
    cnt[lv]+=1; out.append([lv,cnt[lv],th,'|'.join(ws),core])
data=dict(LV=LV,W=[w[:10] for w in W],ST=out)
s=json.dumps(data,ensure_ascii=False,separators=(',',':'))
open(B+'eng.json','w').write(s)
print('units',cnt,'size',len(s.encode()))
print(out[:3])
