import json,re,sys
N={'phy_0':15,'phy_1':20,'phy_2':15}
bad=0
for f,n in N.items():
    d=json.load(open(f+'.json'))
    U=d['units']; assert len(U)==n,(f,len(U))
    for i,u in enumerate(U):
        for k in ['lv','title','tag','era','pre','sum','pr','items','mc']: assert k in u,(f,i,k)
        assert 2<=len(u['pr'])<=3
        it=u['items']; 
        if len(it)!=10: print(f,i,'items',len(it)); bad+=1
        ts=[x['t'] for x in it]; ds=[x['d'] for x in it]
        if len(set(ts))<10 or len(set(ds))<10: print(f,i,'dup t/d'); bad+=1
        for x in it:
            if set(x)!={'t','d','y','yl','k','ex'}: print(f,i,'keys',x['t']); bad+=1
            core=re.sub(r'\(.*?\)','',x['t']).strip()
            if core in x['d']: print(f,i,'term in d',x['t']); bad+=1
            if len(x['d'])>60: print(f,i,'long d',len(x['d']),x['t']); bad+=1
            if not 2<=len(x['t'])<=12: print(f,i,'t len',x['t'])
            if x['k'] not in '개념|원리|법칙|현상|실험|구조|단위|관측'.split('|'): print(f,i,'k',x['k']); bad+=1
        mc=u['mc']
        if len(mc)!=8: print(f,i,'mc',len(mc)); bad+=1
        if sorted(m['lv'] for m in mc)!=[1,1,1,2,2,2,3,3]: print(f,i,'lv dist'); bad+=1
        for m in mc:
            if len(m['c'])!=4 or len(set(m['c']))!=4 or m['a'] not in range(4): print(f,i,'mc bad',m['q']); bad+=1
        print(f,i,'a dist',[m['a'] for m in mc]) if len(set(m['a'] for m in mc))<3 else None
print('bad',bad)
