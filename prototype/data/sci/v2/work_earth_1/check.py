import json,collections
d=json.load(open('/tmp/claude-0/-home-claude/c7c64cc0-5c20-56de-8853-021269d6df9c/scratchpad/data/sci/v2/earth_1.json'))
U=d['units']; print('units',len(U)); assert len(U)==17
allpos=collections.Counter()
for u in U:
    for k in ['lv','title','tag','era','pre','sum','pr','items','mc']: assert k in u,(u['title'],k)
    assert 2<=len(u['pr'])<=3
    it=u['items']; assert len(it)==10,u['title']
    ts=[i['t'] for i in it]; ds=[i['d'] for i in it]
    assert len(set(ts))==10 and len(set(ds))==10,u['title']
    for i in it:
        assert 2<=len(i['t'])<=12,(i['t'])
        if len(i['d'])>60: print('LONG',u['title'],i['t'],len(i['d']))
        if i['t'] in i['d']: print('SELF',u['title'],i['t'])
        assert i['k'] in '개념|원리|법칙|현상|실험|구조|단위|관측'.split('|')
        assert i['y'] is None and i['yl']==''
    mc=u['mc']; assert len(mc)==8
    c=collections.Counter(m['lv'] for m in mc); assert c=={1:3,2:3,3:2},(u['title'],c)
    for m in mc:
        assert len(m['c'])==4 and len(set(m['c']))==4,(m['q'])
        assert m['a'] in range(4); allpos[m['a']]+=1
    print(u['title'], [m['a'] for m in mc], len(u['sum']))
print(allpos)
