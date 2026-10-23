import json,re,collections
occ=collections.defaultdict(list)
for f in ['phy_0','phy_1','phy_2']:
    d=json.load(open(f+'.json'))
    for i,u in enumerate(d['units']):
        for it in u['items']:
            k=re.sub(r'\(.*?\)','',it['t']).replace(' ','')
            occ[k].append((f,i,it['t'],it['d']))
for k,v in occ.items():
    if len(v)>1:
        print('##',k)
        for x in v: print('  ',x)
