import json, sys, collections
sys.path.insert(0, '.')
from a import A
from b import B
from c import C
units = A + B + C
titles = ["세포의 구조와 기능","세포막과 물질 이동","효소와 물질대사","세포 호흡과 ATP","DNA·유전자와 단백질 합성","흥분의 전도와 전달","근수축과 신경계","호르몬과 항상성 조절","우리 몸의 방어 작용, 면역","염색체와 세포 주기","사람의 유전: 가계도·복대립·다인자","돌연변이","생태계의 구성과 상호 작용","에너지 흐름과 물질 순환","진화와 생물 다양성"]
out = '../bio_2.json'
json.dump({"units": units}, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
d = json.load(open(out, encoding='utf-8'))
U = d['units']; err = []
assert [u['title'] for u in U] == titles, [u['title'] for u in U]
allterms = collections.Counter()
for u in U:
    T = u['title']
    if len(u['items']) != 10: err.append((T, 'items'))
    if len(u['mc']) != 8: err.append((T, 'mc'))
    if not 2 <= len(u['pr']) <= 3: err.append((T, 'pr'))
    if sorted(collections.Counter(m['lv'] for m in u['mc']).items()) != [(1,3),(2,3),(3,2)]: err.append((T,'lv'))
    ac = collections.Counter(m['a'] for m in u['mc'])
    if max(ac.values()) > 3: err.append((T, 'a-dist', ac))
    ts = [i['t'] for i in u['items']]; ds = [i['d'] for i in u['items']]
    if len(set(ts)) != 10 or len(set(ds)) != 10: err.append((T, 'dup'))
    for i in u['items']:
        allterms[i['t']] += 1
        if i['t'] in i['d']: err.append((T, 'self', i['t']))
        if len(i['d']) > 60: err.append((T, 'dlen', i['t'], len(i['d'])))
        if not 2 <= len(i['t']) <= 12: err.append((T, 'tlen', i['t']))
        if i['k'] not in "개념|원리|법칙|현상|실험|구조|단위|관측".split('|'): err.append((T,'k',i['t']))
    for m in u['mc']:
        if len(m['c']) != 4 or len(set(m['c'])) != 4: err.append((T, 'choices', m['q']))
        if m['a'] not in range(4): err.append((T, 'a', m['q']))
print([t for t,c in allterms.items() if c>1])
print(len(U), err)
