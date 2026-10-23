import json,collections,sys
d=json.load(open(sys.argv[1]))
U=d['units']; print('units',len(U))
names=["지구 시스템과 에너지 흐름","판 구조론의 발달","맨틀 대류와 플룸","변동대와 마그마","지질 구조와 퇴적 구조","지층의 대비와 상대 연령","절대 연령과 방사성 동위 원소","지질 시대와 대멸종","온대 저기압과 태풍","해수의 성질과 순환","대기와 해양의 상호작용, 엘니뇨","기후 변화의 요인","별의 물리량과 H-R도","별의 진화와 핵융합","외계 행성계와 생명 가능 지대","우주 팽창과 빅뱅, 암흑 물질"]
assert [u['title'] for u in U]==names
A=collections.Counter(); allt=collections.Counter()
for u in U:
  t=u['title']
  assert u['lv']==2 and u['tag']=='지구'
  ns=u['sum'].count('다.')
  if not 4<=ns<=6: print('sum sentences',t,ns)
  assert 2<=len(u['pr'])<=3
  assert len(u['items'])==10, t
  ts=[i['t'] for i in u['items']]; ds=[i['d'] for i in u['items']]
  assert len(set(ts))==10 and len(set(ds))==10, t
  for i in u['items']:
    allt[i['t']]+=1
    if not 2<=len(i['t'])<=12: print('tlen',t,i['t'],len(i['t']))
    if len(i['d'])>60: print('dlen',t,i['t'],len(i['d']))
    for j in ts:
      if j in i['d']: print('term in def',t,i['t'],'<-',j) if j==i['t'] else None
    assert i['k'] in "개념|원리|법칙|현상|실험|구조|단위|관측".split('|'),i
    assert i['y'] is None and i['yl']==''
  assert len(u['mc'])==8
  c=collections.Counter(m['lv'] for m in u['mc']); assert c=={1:3,2:3,3:2},(t,c)
  for m in u['mc']:
    assert len(m['c'])==4 and len(set(m['c']))==4, m['q']
    assert m['a'] in range(4); A[m['a']]+=1
print('a dist',A)
print('dup terms across units',[k for k,v in allt.items() if v>1])
