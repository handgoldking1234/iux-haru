import json,os
D=os.path.dirname(os.path.abspath(__file__))+'/../data/kor/'
B=os.path.dirname(os.path.abspath(__file__))+'/'
LV={'초등':0,'중등':1,'고등':2}
MC={}
for f in ['kr_1_mc.json','kr_2_mc.json','kr_3_mc.json','kr_vocab_mc.json','kr_top.json','kr_vocab_mid2.json','mc2_1.json','mc2_2.json','mc2_3.json']:
    if os.path.exists(D+f):
        for m in json.load(open(D+f,encoding='utf8'))['mc']:
            MC.setdefault(m['unit'].strip(),[]).append({'q':m['q'],'p':m.get('p',''),'c':m['c'],'a':m['a'],'e':m['e'],'lv':m.get('lv',2)})
def conv(units,lv,tag):
    out=[]
    for u in units:
        items=[]
        for x in u['items']:
            it={'t':x['t'],'d':x['d'],'y':None,'yl':'','k':(f"자주 틀리는 {x['rank']}위" if x.get('rank') else x.get('k','개념'))}
            if x.get('w'): it['w']=[w for w in x['w'] if w!=x['t']][:3]
            if x.get('ex'): it['ex']=x['ex']
            items.append(it)
        out.append(dict(lv=lv,title=u['title'],tag=tag,era=u.get('era',''),sum=u['sum'],items=items,mc=MC.get(u['title'].strip(),[])))
    return out
kr=[]
for n in (1,2,3):
    d=json.load(open(D+f'kr_{n}.json',encoding='utf8')); kr+=conv(d['units'],LV[d['level']],'수업')
top=[]
if os.path.exists(D+'kr_top.json'):
    for u in json.load(open(D+'kr_top.json',encoding='utf8'))['units']: top+=conv([u],LV[u['level']],'맞춤법')
kr=[]+[u for u in top]+kr
kr.sort(key=lambda u:u['lv'])
vc=[]
if os.path.exists(D+'kr_vocab_elem.json'):
    vc+=conv(json.load(open(D+'kr_vocab_elem.json',encoding='utf8'))['units'],0,'어휘')
v=json.load(open(D+'kr_vocab.json',encoding='utf8'))['levels']
mid2=json.load(open(D+'kr_vocab_mid2.json',encoding='utf8'))['units'] if os.path.exists(D+'kr_vocab_mid2.json') else []
vc+=conv(v['중등']+mid2,1,'어휘')+conv(v['고등'],2,'어휘')
def number(us):
    us=[dict(u) for u in us]; c={}
    for u in us: c[u['lv']]=c.get(u['lv'],0)+1; u['n']=c[u['lv']]
    return us
mix=[]
for lv in range(3):
    mix+=[u for u in top if u['lv']==lv]
    a=[u for u in vc if u['lv']==lv]; b=[u for u in kr if u['lv']==lv and u['tag']!='맞춤법']
    while a or b:
        if a: mix.append(a.pop(0))
        if b: mix.append(b.pop(0))
out={'mix':{'units':number(mix)},'vc':{'units':number(vc)},'kr':{'units':number(kr)}}
nmc=sum(len(u['mc']) for u in kr+vc)
print('kr',len(kr),'vc',len(vc),'mix',len(mix),'mc',nmc,'units w/o mc',[u['title'] for u in kr+vc if not u['mc']][:6])
open(B+'kor.json','w').write(json.dumps(out,ensure_ascii=False,separators=(',',':')))
