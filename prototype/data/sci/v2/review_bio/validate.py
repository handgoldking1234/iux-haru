import json,sys,re
K=set("개념 원리 법칙 현상 실험 구조 단위 관측".split())
allt={}
for f in ['bio_0','bio_1','bio_2']:
  d=json.load(open(f+'.json')); err=[]
  for ui,u in enumerate(d['units']):
    T=f"{f}[{ui}]{u['title']}"
    if len(u['items'])!=10: err.append((T,'items'))
    if len(u['mc'])!=8: err.append((T,'mc'))
    if not 2<=len(u['pr'])<=3: err.append((T,'pr'))
    if sorted(m['lv'] for m in u['mc'])!=[1,1,1,2,2,2,3,3]: err.append((T,'lv'))
    ts=[i['t'] for i in u['items']]; ds=[i['d'] for i in u['items']]
    if len(set(ts))!=10 or len(set(ds))!=10: err.append((T,'dup'))
    for i in u['items']:
      if not 2<=len(i['t'])<=12: err.append((T,'tlen',i['t']))
      if len(i['d'])>60: err.append((T,'dlen',i['t'],len(i['d'])))
      if i['k'] not in K: err.append((T,'k'))
      if i['t'].replace(' ','') in i['d'].replace(' ',''): err.append((T,'term in def',i['t']))
      if set(i)!={'t','d','y','yl','k','ex'}: err.append((T,'keys'))
      allt.setdefault(i['t'],[]).append((f,ui,i['d']))
    for m in u['mc']:
      if len(m['c'])!=4 or len(set(m['c']))!=4: err.append((T,'choices',m['q']))
      if m['a'] not in range(4): err.append((T,'a'))
  print(f, len(d['units']), err if err else 'OK')
if len(sys.argv)>1:
  for t,v in allt.items():
    if len(v)>1:
      print('REPEAT',t); [print('   ',x) for x in v]
