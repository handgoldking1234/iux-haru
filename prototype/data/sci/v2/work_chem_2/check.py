import json,collections,sys
d=json.load(open(sys.argv[1]))
U=d['units']; print('units',len(U))
titles=["우주 초기 원소의 생성","원자 구조와 전자 배치","주기율표와 주기적 성질","이온 결합","공유 결합과 분자","전기 음성도·결합의 극성·분자 모양","지각과 생명체를 이루는 물질","몰과 아보가드로수","화학 반응식과 양적 관계","용액의 농도","산과 염기, pH","중화 반응과 양적 관계","산화·환원과 산화수","가역 반응과 동적 평형","발열·흡열 반응과 우리 생활"]
assert [u['title'] for u in U]==titles
K={"개념","원리","법칙","현상","실험","구조","단위","관측"}
err=[];allA=collections.Counter()
for u in U:
    T=u['title']
    for f in ['lv','title','tag','era','pre','sum','pr','items','mc']: assert f in u
    if u['tag']!='화학' or u['lv']!=2: err.append((T,'tag/lv'))
    if not 2<=len(u['pr'])<=3: err.append((T,'pr'))
    ns=u['sum'].count('다.'); 
    if not 4<=ns<=6: err.append((T,'sum sentences',ns))
    it=u['items']
    if len(it)!=10: err.append((T,'items',len(it)))
    ts=[i['t'] for i in it]; ds=[i['d'] for i in it]
    if len(set(ts))!=10 or len(set(ds))!=10: err.append((T,'dup'))
    for i in it:
        if not 2<=len(i['t'])<=12: err.append((T,'tlen',i['t']))
        if len(i['d'])>60: err.append((T,'dlen',i['t'],len(i['d'])))
        if i['t'] in i['d']: err.append((T,'self',i['t']))
        if i['k'] not in K: err.append((T,'k',i['t']))
        if i['y'] is not None or i['yl']!='': err.append((T,'y'))
    mc=u['mc']
    if len(mc)!=8: err.append((T,'mc'))
    c=collections.Counter(m['lv'] for m in mc)
    if c!={1:3,2:3,3:2}: err.append((T,'lv',c))
    for m in mc:
        if len(m['c'])!=4 or len(set(m['c']))!=4: err.append((T,'choices',m['q']))
        if m['a'] not in range(4): err.append((T,'a'))
        allA[m['a']]+=1
print(err or 'PASS'); print(allA)
