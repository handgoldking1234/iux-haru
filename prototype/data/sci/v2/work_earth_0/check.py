import json, collections
P='/tmp/claude-0/-home-claude/c7c64cc0-5c20-56de-8853-021269d6df9c/scratchpad/data/sci/v2/earth_0.json'
d=json.load(open(P,encoding='utf-8'))
titles="지구와 달의 모습|흙의 생성과 보존|흐르는 물의 작용|지층|화석|화산과 화성암|지진과 대처|물의 순환|태양계의 행성|별과 별자리, 북극성 찾기|습도와 이슬·안개·구름|기압과 바람|계절별 날씨와 공기 덩어리|지구의 자전과 낮·밤|지구의 공전과 계절별 별자리|달의 위상 변화|계절의 변화와 태양 고도|기후 변화와 우리 생활".split('|')
U=d['units']; err=[]
assert len(U)==18
K={"개념","원리","법칙","현상","실험","구조","단위","관측"}
tot=collections.Counter()
for i,u in enumerate(U):
    n=u['title']
    if n!=titles[i]: err.append((n,'title'))
    for f in ['lv','title','tag','era','pre','sum','pr','items','mc']:
        if f not in u: err.append((n,'missing',f))
    if u['lv']!=0 or u['tag']!='지구': err.append((n,'lv/tag'))
    if not 2<=len(u['pr'])<=3: err.append((n,'pr'))
    ns=u['sum'].count('요.')
    if len(u['items'])!=10: err.append((n,'items'))
    ts=[x['t'] for x in u['items']]; ds=[x['d'] for x in u['items']]
    if len(set(ts))!=10 or len(set(ds))!=10: err.append((n,'dup'))
    for x in u['items']:
        if not 2<=len(x['t'])<=12: err.append((n,'tlen',x['t']))
        if len(x['d'])>60: err.append((n,'dlen',x['t'],len(x['d'])))
        if x['t'] in x['d']: err.append((n,'self',x['t']))
        if x['k'] not in K: err.append((n,'k',x['t']))
        if x['y'] is not None or x['yl']!='': err.append((n,'y'))
        for t2 in ts:
            pass
    if len(u['mc'])!=8: err.append((n,'mc'))
    c=collections.Counter(m['lv'] for m in u['mc'])
    if c!={1:3,2:3,3:2}: err.append((n,'mclv',c))
    for m in u['mc']:
        if len(m['c'])!=4 or len(set(m['c']))!=4: err.append((n,'choices',m['q']))
        if m['a'] not in range(4): err.append((n,'a'))
        tot[m['a']]+=1
    print(i+1,n,[m['a'] for m in u['mc']], 'sum sentences~',ns)
print('answer dist',tot)
print('ERR',err)
