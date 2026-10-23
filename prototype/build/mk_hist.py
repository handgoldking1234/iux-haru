import json,os
D=os.path.dirname(os.path.abspath(__file__))+'/../data/hist/'
B=os.path.dirname(os.path.abspath(__file__))+'/'
LV={'초등':0,'중등':1,'고등':2}
out={}
for tr in ['ko','wo']:
    units=[]
    for n in (1,2,3):
        p=D+f'{tr}_{n}.json'
        if not os.path.exists(p): print('missing',p); continue
        d=json.load(open(p,encoding='utf8'))
        for i,u in enumerate(d['units']):
            items=[{k:x[k] for k in ('t','d','y','yl','k')} for x in u['items']]
            units.append(dict(lv=LV[d['level']],n=i+1,title=u['title'],era=u.get('era',''),sum=u['sum'],items=items))
    import glob
    for p in sorted(glob.glob(D+f'{tr}_add_*.json')):
        for u in json.load(open(p,encoding='utf8'))['units']:
            lv=LV[u['level']]; items=[{k:x[k] for k in ('t','d','y','yl','k')} for x in u['items']]
            nu=dict(lv=lv,n=0,title=u['title'],era=u.get('era',''),sum=u['sum'],items=items)
            idx=[i for i,v in enumerate(units) if v['lv']==lv and v['title']==u.get('after')]
            if not idx: idx=[max(i for i,v in enumerate(units) if v['lv']==lv)]; print('after not found -> end',u['title'])
            units.insert(idx[0]+1,nu)
    c={}
    for v in units: c[v['lv']]=c.get(v['lv'],0)+1; v['n']=c[v['lv']]
    out[tr]=dict(units=units)
    print(tr,len(units),'units',sum(len(u['items']) for u in units),'items')
# ---- 연표: 표준 연표(backbone) + 단원 용어 중 연도 있는 것 ----
import re,sys
sys.path.insert(0,B); from tl_backbone import KO,WO
def skey(x):
    if x['y'] is not None: return x['y']
    yl=str(x['yl'])
    mm=re.search(r'(\d+)\s*만\s*년\s*전',yl)
    if mm: return -int(mm.group(1))*10000
    mm=re.search(r'(기원전\s*)?(\d+)\s*세기',yl)
    if mm: c=int(mm.group(2)); return -(c-1)*100-50 if mm.group(1) else (c-1)*100+50
    mm=re.search(r'(기원전\s*)?(\d{3,5})\s*년',yl)
    if mm: return -int(mm.group(2)) if mm.group(1) else int(mm.group(2))
    return None
def fmt(y):
    if y<=-10000: return f'약 {-y//10000}만 년 전'
    return f'기원전 {-y}년' if y<0 else f'{y}년'
core=lambda s: re.sub(r'[\s·,()『』「」—-]','',s)
TL=[]
for y,tr,t,lv,yl in KO+WO: TL.append([y,tr,t,lv,yl or fmt(y),''])
for tr in ['ko','wo']:
    best={}
    for u in out[tr]['units']:
        for x in u['items']:
            k=skey(x)
            if k is None or x['k'] in ('개념','인물'): continue
            if x['t'] in best and best[x['t']][3]<=u['lv']: continue
            best[x['t']]=[k,tr,x['t'],u['lv'],x['yl'],x['d']]
    for t,row in best.items():
        hit=[b for b in TL if b[1]==tr and abs(b[0]-row[0])<=2 and (core(t) in core(b[2]) or core(b[2])[:4] in core(t))]
        if hit:
            if not hit[0][5]: hit[0][5]=row[5]
            continue
        TL.append(row)
TL.sort(key=lambda r:(r[0],r[1]))
out['TL']=TL
print('timeline rows',len(TL),'ko',sum(1 for r in TL if r[1]=='ko'),'wo',sum(1 for r in TL if r[1]=='wo'))
s=json.dumps(out,ensure_ascii=False,separators=(',',':'))
open(B+'hist.json','w').write(s); print('size',len(s.encode()))
