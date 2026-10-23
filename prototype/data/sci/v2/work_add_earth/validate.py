import json,sys,collections
d=json.load(open(sys.argv[1]))
exp=["바닷가 지형과 바닷물","진원·진앙, 규모와 진도","우주 탐사와 인공위성","퇴적 환경과 변성 작용","우리나라의 지질과 지질 명소","악기상과 기상 위성 영상","대기 대순환과 전향력","별의 내부 구조와 에너지 전달","외부 은하의 분류와 특이 은하"]
U=d['units']; assert [u['title'] for u in U]==exp
titles={}
for lv in (0,1,2):
    titles[lv]=[u['title'] for u in json.load(open(f'earth_{lv}.json'))['units']]
existing={}
for lv in (0,1,2):
    for u in json.load(open(f'earth_{lv}.json'))['units']:
        for i in u['items']: existing.setdefault(i['t'],[]).append((u['title'],i['d']))
added_titles={u['title'] for u in U}
allA=collections.Counter()
for u in U:
    keys={'lv','title','tag','era','pre','sum','pr','items','mc','after'}
    assert set(u)==keys,(u['title'],set(u)^keys)
    assert u['tag']=='지구'
    assert u['after'] in titles[u['lv']] or u['after'] in added_titles, u['after']
    assert 2<=len(u['pr'])<=3
    assert len(u['items'])==10, u['title']
    ts=[i['t'] for i in u['items']]; ds=[i['d'] for i in u['items']]
    assert len(set(ts))==10 and len(set(ds))==10
    for i in u['items']:
        assert set(i)=={'t','d','y','yl','k','ex'}
        assert 2<=len(i['t'])<=12 or print('len t',i['t'])
        if len(i['t'])<2: print('WARN short term',i['t'])
        assert len(i['d'])<=60, (i['t'],len(i['d']))
        assert i['t'] not in i['d'], i['t']
        assert i['k'] in '개념|원리|법칙|현상|실험|구조|단위|관측'.split('|')
        assert i['y'] is None and i['yl']==''
        if i['t'] in existing:
            for (ut,ed) in existing[i['t']]:
                print('  reuse',u['title'],':',i['t'],'| old:',ut,ed)
                assert ed!=i['d']
    lvc=collections.Counter(m['lv'] for m in u['mc'])
    assert len(u['mc'])==8 and lvc=={1:3,2:3,3:2}, u['title']
    assert [m['lv'] for m in u['mc']]==[1,1,1,2,2,2,3,3]
    A=collections.Counter()
    for m in u['mc']:
        assert set(m)=={'q','p','c','a','e','lv'}
        assert len(m['c'])==4 and len(set(m['c']))==4
        assert m['a'] in (0,1,2,3); A[m['a']]+=1; allA[m['a']]+=1
    print(u['title'],dict(sorted(A.items())))
print('ALL OK',dict(sorted(allA.items())))
