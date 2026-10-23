import json, collections
d = json.load(open('/tmp/claude-0/-home-claude/c7c64cc0-5c20-56de-8853-021269d6df9c/scratchpad/data/sci/v2/phy_2.json', encoding='utf-8'))
T = ["기본량·단위와 측정","속도와 가속도","뉴턴 운동 법칙","중력과 자유 낙하·수평 던짐","운동량과 충격량, 충돌 안전","일과 역학적 에너지 보존","열역학 제1·2법칙과 열기관","전하와 전기력","도체·반도체·절연체와 전기적 성질","전류에 의한 자기장","전자기 유도·발전기·변압기","에너지 전환과 신재생 에너지","파동의 성질과 간섭","전자기파의 종류와 이용","빛의 이중성과 광전 효과"]
U = d['units']; err = []
assert len(U) == 15
K = set("개념|원리|법칙|현상|실험|구조|단위|관측".split('|'))
for i, u in enumerate(U):
    n = u['title']
    if n != T[i]: err.append((n, 'title'))
    if u['lv'] != 2 or u['tag'] != '물리': err.append((n, 'lv/tag'))
    if not (2 <= len(u['pr']) <= 3): err.append((n, 'pr'))
    if len(u['items']) != 10: err.append((n, 'items'))
    if len(u['mc']) != 8: err.append((n, 'mc'))
    ts = [x['t'] for x in u['items']]; ds = [x['d'] for x in u['items']]
    if len(set(ts)) != 10 or len(set(ds)) != 10: err.append((n, 'dup'))
    for x in u['items']:
        if not (2 <= len(x['t']) <= 12): err.append((n, 'tlen', x['t']))
        if len(x['d']) > 60: err.append((n, 'dlen', x['t'], len(x['d'])))
        if x['k'] not in K: err.append((n, 'k', x['t']))
        if x['t'] in x['d'] or x['t'].split('(')[0] in x['d']: err.append((n, 'term in def', x['t']))
        assert x['y'] is None and x['yl'] == '' and x['ex']
    lv = collections.Counter(m['lv'] for m in u['mc'])
    if lv != {1: 3, 2: 3, 3: 2}: err.append((n, 'lv', lv))
    for m in u['mc']:
        if len(m['c']) != 4 or len(set(m['c'])) != 4: err.append((n, 'choices', m['q']))
        if m['a'] not in range(4): err.append((n, 'a'))
    print(i+1, n, sorted(collections.Counter(m['a'] for m in u['mc']).items()))
print('ERR', err)
