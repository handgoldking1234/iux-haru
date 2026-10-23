import json,collections
exp={0:18,1:17,2:16}
for n in [0,1,2]:
  d=json.load(open(f'earth_{n}.json'));U=d['units']
  assert len(U)==exp[n]
  A=collections.Counter()
  for i,u in enumerate(U):
    t=f'{n}/{i}'
    assert len(u['items'])==10,t; assert len(u['mc'])==8,t
    assert sorted(m['lv'] for m in u['mc'])==[1,1,1,2,2,2,3,3],t
    ts=[it['t'] for it in u['items']]; ds=[it['d'] for it in u['items']]
    assert len(set(ts))==10 and len(set(ds))==10,t
    for it in u['items']:
      if it['t'] in it['d']: print('TERM IN DEF',t,it['t'])
      if len(it['d'])>60: print('LONG',t,it['t'],len(it['d']))
      if not 2<=len(it['t'])<=12: print('TLEN',t,it['t'])
    for m in u['mc']:
      assert len(m['c'])==4 and len(set(m['c']))==4,t
      assert m['a'] in range(4),t
      A[m['a']]+=1
  print(n,'ok',dict(A))
