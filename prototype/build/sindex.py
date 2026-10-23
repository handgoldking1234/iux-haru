# 통합 검색 색인: [유형, 과목, 제목, 뜻, 메타, 설명, 검색어]
import json, os
def build_index(B):
    D=[]
    def cut(s,n): s=(s or '').strip(); return s if len(s)<=n else s[:n-1]+'…'
    # 영단어
    if os.path.exists(B+'eng.json'):
        e=json.load(open(B+'eng.json')); LV=e['LV']; ETY={}
        ED=B+'../data/eng_ety/'
        for i in range(1,7):
            try: ETY.update(json.load(open(ED+f'out{i}.json')))
            except Exception: pass
        for w in e['W']:
            x=ETY.get(w[0],{}); fam=' '.join(a for a,_ in x.get('fam',[]))
            D.append(['w','eng',w[0],w[3],' · '.join(t for t in [('/'+w[9]+'/') if w[9] else '',w[2],LV[w[1]],w[6]] if t),('어원: '+cut(x.get('et',''),85)) if x.get('et') else cut(w[4],80),fam])
    # 한자 · 천자문
    hj=B+'data_hj.json' if os.path.exists(B+'data_hj.json') else B+'data.json'
    if os.path.exists(hj):
        d=json.load(open(hj)); LV=d['LV']; WD=d.get('WD',{}); CP=d.get('CP',{})
        for c in d['CH']:
            ws=[t for t in (WD.get(c[0],'') or '').split(' ') if t][:4]
            wsr=' · '.join(f'{t[:2]} {t[2:]}' for t in ws)
            D.append(['h','hanja',c[0],f'{c[1]} {c[2]}',f'{LV[c[4]]} · 부수 {c[5]} · {c[6]}획',('관련 단어: '+wsr) if wsr else '',' '.join(t[2:] for t in ws)+' '+c[2]])
        cj=d.get('CJM')
        if cj:
            for i,p in enumerate(cj['ph']):
                D.append(['p','hanja',p['p'],p['m'],f"천자문 {i+1}구절 · {p['r']}",cut(p['x'],160)+'\n'+' · '.join(p['h']),p['r']])
    # 국어 · 과학 · 역사
    for sk,f,TRN in [('kor','kor.json',{'vc':'어휘','kr':'수업'}),('sci','sci.json',{'phy':'물리','chem':'화학','bio':'생명','earth':'지구'}),('hist','hist.json',{'ko':'국사','wo':'세계사'})]:
        if not os.path.exists(B+f): continue
        j=json.load(open(B+f)); LV=['초등','중등','고등']
        for tr,name in TRN.items():
            for u in j.get(tr,{}).get('units',[]):
                pr=' '.join(p.get('h','') for p in u.get('pr',[]) or [])
                D.append(['u',sk,u['title'],cut(u.get('sum',''),70),f"{name} · {LV[u['lv']]} {u.get('n','')}단원"+(f" · {u['era']}" if u.get('era') else ''),cut(u.get('sum',''),170),pr])
                ui=len(D)-1
                for x in u['items']:
                    D.append(['t',sk,x['t'],x.get('d',''),' · '.join(t for t in [x.get('k',''),x.get('yl','')] if t),cut(x.get('ex','') or '',70),'',ui])
    return D
