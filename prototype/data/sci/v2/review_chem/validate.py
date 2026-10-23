import json,sys
B=sys.argv[1]
allterms={}
for f in ['chem_0','chem_1','chem_2']:
  d=json.load(open(f"{B}/{f}.json"))
  for ui,u in enumerate(d['units']):
    tag=f"{f}[{ui}]"
    assert len(u['items'])==10, tag
    assert len(u['mc'])==8, tag
    assert sorted(m['lv'] for m in u['mc'])==[1,1,1,2,2,2,3,3], tag
    assert 2<=len(u['pr'])<=3, tag
    ts=[i['t'] for i in u['items']]; ds=[i['d'] for i in u['items']]
    assert len(set(ts))==10 and len(set(ds))==10, tag
    for it in u['items']:
      assert 2<=len(it['t'])<=12, (tag,it['t'])
      if len(it['d'])>60: print('long d',tag,it['t'],len(it['d']))
      assert it['t'] not in it['d'], (tag,it['t'])
      for o in ts:
        if o!=it['t'] and len(o)>=2 and o in it['d']: print('other term in d',tag,it['t'],'<-',o)
      assert set(it)=={'t','d','y','yl','k','ex'}, tag
      prev=allterms.get(it['t'])
      if prev and prev[1]==it['d']: print('same def repeated',tag,it['t'],prev[0])
      allterms[it['t']]=(tag,it['d'])
    for m in u['mc']:
      assert len(m['c'])==4 and len(set(m['c']))==4 and m['a'] in range(4), tag
print('valid')
