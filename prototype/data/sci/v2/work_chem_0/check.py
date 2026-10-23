import json,sys,collections
d=json.load(open(sys.argv[1]));U=d['units'];print('units',len(U))
names="물체와 물질|물질의 성질 비교|고체·액체·기체|공기의 무게와 부피|혼합물과 그 분리|거름·증발·자석으로 분리하기|물이 얼 때와 얼음이 녹을 때|증발과 끓음|응결|용해와 용액|용해에 영향을 주는 조건|용액의 진하기|지시약으로 용액 분류하기|산과 염기의 성질과 이용|산소와 이산화탄소|기체의 압력·온도와 부피|연소의 조건과 소화".split('|')
assert [u['title'] for u in U]==names
A=collections.Counter();K={"개념","원리","법칙","현상","실험","구조","단위","관측"}
for u in U:
  t=u['title'];assert u['lv']==0 and u['tag']=='화학'
  assert 2<=len(u['pr'])<=3
  it=u['items'];assert len(it)==10,t
  ts=[i['t'] for i in it];ds=[i['d'] for i in it]
  assert len(set(ts))==10 and len(set(ds))==10,t
  for i in it:
    if not(2<=len(i['t'])<=12): print('tlen',t,i['t'])
    if len(i['d'])>60: print('dlen',t,i['t'],len(i['d']))
    if i['t'] in i['d']: print('selfdef',t,i['t'])
    if i['t'].replace(' ','') in i['d'].replace(' ',''): print('selfdef2',t,i['t'])
    assert i['k'] in K and i['y'] is None and i['yl']==''
  mc=u['mc'];assert len(mc)==8,t
  c=collections.Counter(m['lv'] for m in mc);assert c=={1:3,2:3,3:2},(t,c)
  for m in mc:
    assert len(m['c'])==4 and len(set(m['c']))==4,(t,m['q'])
    assert m['a'] in (0,1,2,3);A[m['a']]+=1
print('answer dist',A);print('PASS')
