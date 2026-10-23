import sys,os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import json,os
B=os.path.dirname(os.path.abspath(__file__))+'/'
COL={'math':('#2563EB','#E8F0FE'),'hanja':('#C2410C','#FDEDE4'),'eng':('#7C3AED','#F1EAFE'),'hist':('#8B5A2B','#F5ECE2'),'kor':('#0B8A5F','#E2F5EE'),'sci':('#4F46E5','#ECEBFE'),'typ':('#0E7490','#E0F2F6')}
def theme(k):
    c,s=COL[k]
    return f'<style>/* 과목 주색 */:root{{--y:{c};--y2:{c};--y-soft:{s};--bg:#F4F5F7;--hi:#E8EBF0;--line:#E1E4EA}}body{{background:#fff!important;padding-top:6px!important}}@media (max-width:520px){{body{{padding-top:0!important}}}}/* 과목 탭은 상단 알약으로 (하단은 셸 공통 메뉴) */#bar{{order:0}}nav#tabs{{order:1}}#screen{{order:2}}nav#tabs{{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:10px 16px 12px;background:var(--paper);border-top:0;border-bottom:1px solid var(--line)}}nav#tabs::-webkit-scrollbar{{display:none}}nav#tabs[hidden]{{display:none}}nav#tabs button{{flex:none;flex-direction:row;gap:6px;border:1.5px solid var(--line);border-radius:99px;padding:7px 15px;font-size:15px;font-weight:800;color:var(--fg);background:var(--paper)}}nav#tabs .tb{{display:none}}nav#tabs button.on{{background:#1E2421;border-color:#1E2421;color:#fff;font-weight:800}}nav#tabs .dot{{position:static;height:auto;min-width:20px;border-radius:99px;background:#FF4F1F;font-size:12px;line-height:1;padding:3px 7px}}@media (min-width:700px){{nav#tabs{{padding:10px 24px 14px}}}}</style>'
def app(js_file,css_file,data_file,title,tab):
    head=open(B+'head.html').read()
    head=head.replace('<title>셈하루 (Copy)</title>',f'<title>{title}</title>')
    head=head.replace('family=Noto+Sans+KR:wght@400;500;700;900&display=swap','family=Noto+Sans+KR:wght@400;500;700;900&family=Noto+Serif+KR:wght@500;700&display=swap')
    head=head.replace('</span>연산학습</button>',f'</span>{tab}</button>')
    head=head.replace('/* 레이아웃: 당근색 앱바',f'/* {title} — 레이아웃: 앱바')
    k=head.rindex('</style>'); head=head[:k]+open(B+css_file).read().replace('.hanja-note{}\n','')+head[k:]
    sk={'app.js':'hanja','eng.js':'eng','hist.js':'hist','kor.js':'kor','sci.js':'sci','typ.js':'typ'}[js_file]
    js=f"/* 하루공부 보상 연동 */\nconst HG=e=>{{ try{{ if(parent!==window) parent.postMessage({{hg:e,s:'{sk}'}},'*'); }}catch(_){{}} }};\n"+open(B+js_file).read().replace('__DATA__',open(B+data_file).read()).replace('__LUCIDE__',open(B+'lucide.js').read())
    if js_file=='app.js' and os.path.exists(B+'pics.js'): js=open(B+'pics.js').read()+'\n'+js
    if js_file=='app.js' and os.path.exists(B+'strokes.js'): js=open(B+'strokes.js').read()+'\n'+js
    return head+'<script>\n'+js+'\n</script>\n\n</body></html>\n'
_CJ=os.path.dirname(os.path.abspath(__file__))+'/../data/cjm/cjm.json'
_hd='data.json'
if os.path.exists(_CJ):
    _dd=json.load(open(B+'data.json')); _dd['CJM']=json.load(open(_CJ)); json.dump(_dd,open(B+'data_hj.json','w'),ensure_ascii=False,separators=(',',':')); _hd='data_hj.json'
h=app('app.js','extra.css',_hd,'한자씨앗','한자학습')
open(B+'hanja.html','w').write(h)
subs=[('math','math.html'),('hanja','hanja.html')]
if os.path.exists(B+'eng.js'):
    _ef='eng.json'
    _ED=B+'../data/eng_ety/'
    if any(os.path.exists(_ED+f'out{i}.json') for i in range(1,7)):
        _e=json.load(open(B+'eng.json')); _e['ETY']={}
        for i in range(1,7):
            try: _e['ETY'].update(json.load(open(_ED+f'out{i}.json')))
            except Exception: pass
        json.dump(_e,open(B+'eng_x.json','w'),ensure_ascii=False,separators=(',',':')); _ef='eng_x.json'
    open(B+'english.html','w').write(app('eng.js','extra.css',_ef,'영단어하루','영단어')); subs.append(('eng','english.html'))
if os.path.exists(B+'hist.js') and os.path.exists(B+'hist.json'):
    open(B+'history.html','w').write(app('hist.js','extra.css','hist.json','역사하루','역사')); subs.append(('hist','history.html'))
if os.path.exists(B+'kor.js') and os.path.exists(B+'kor.json'):
    open(B+'korean.html','w').write(app('kor.js','extra.css','kor.json','국어하루','국어')); subs.append(('kor','korean.html'))
# ---- 과학: 영역별 데이터 합치기 (통합 = 학교급별로 네 영역을 번갈아) ----
SD=os.path.dirname(os.path.abspath(__file__))+'/../data/sci/'
SV=SD+'v2/'
def sci_area(a):
    parts=[SV+f'{a}_{lv}.json' for lv in (0,1,2)]
    if all(os.path.exists(x) for x in parts):
        lvs=[json.load(open(x))['units'] for x in parts]
        if os.path.exists(SV+f'add_{a}.json'):
            for u in json.load(open(SV+f'add_{a}.json'))['units']:
                L=lvs[u['lv']]; af=u.pop('after','^')
                if af=='^': L.insert(0,u)
                else:
                    ix=[i for i,x in enumerate(L) if x['title']==af]
                    if not ix: print('!! after not found',a,af); L.append(u)
                    else: L.insert(ix[0]+1,u)
        us=[u for L in lvs for u in L]
    elif os.path.exists(SD+a+'.json'): us=json.load(open(SD+a+'.json'))['units']
    else: return None
    cnt={}
    for u in us: cnt[u['lv']]=cnt.get(u['lv'],0)+1; u['n']=cnt[u['lv']]
    return us
SA=[a for a in ['phy','chem','bio','earth'] if sci_area(a)]
if os.path.exists(B+'sci.js') and SA:
    SCI={a:{'units':sci_area(a)} for a in SA}
    json.dump(SCI,open(B+'sci.json','w'),ensure_ascii=False,separators=(',',':'))
    open(B+'science.html','w').write(app('sci.js','extra.css','sci.json','과학하루','과학')); subs.append(('sci','science.html'))
if os.path.exists(B+'typ.js'):
    t2=app('typ.js','extra.css','typ.json','타자하루','연습')
    t2=t2.replace('<i data-lucide="house"></i></span>연습','<i data-lucide="keyboard"></i></span>연습').replace('<i data-lucide="notebook-pen"></i></span>오답노트','<i data-lucide="gamepad-2"></i></span>게임').replace('<i data-lucide="chart-pie"></i></span>학습결과','<i data-lucide="trophy"></i></span>기록')
    open(B+'typing.html','w').write(t2); subs.append(('typ','typing.html'))

# ---- 오늘·놀이터 (보상·꾸미기·게임·대결·랭킹) ----
import re as _re
ICN={}
for n in ['list-checks','shirt','swords','trophy','coins','arrow-left','pencil','check','chevron-right','lock','gift','flame','shield-check','ticket','book-open','moon','clock','door-open','plus','log-in','zap','timer','repeat','copy','users','user-plus','crown','x','message-circle','gamepad-2','circle-dot','sprout','leaf','flower-2','tree-deciduous','trees','star','history','bell','bell-ring','trash-2','user-round','house','menu','log-out','user-x']:
    sv=open(B+f'node_modules/lucide-static/icons/{n}.svg').read()
    ICN[n]=_re.sub(r'\s+',' ',sv[sv.index('>',sv.index('<svg'))+1:sv.rindex('</svg>')]).strip()
_d=json.load(open(B+'data.json')); _e=json.load(open(B+'eng.json'))
han=[[r[0],r[1],r[2]] for r in _d['CH'] if r[4]<=4]
eng=[]
for w in _e['W']:
    if w[1]==0:
        m=w[3].split(',')[0].split(';')[0].strip()
        if m and len(m)<=10: eng.append([w[0],m])
_t=json.load(open(os.path.dirname(os.path.abspath(__file__))+'/../data/kor/kr_top.json'))
sp=[[x['t'],x['w']] for u in _t['units'][:4] for x in u['items'] if x.get('w') and len(x['t'])<=22]
_h=json.load(open(B+'hist.json'))
hist=[[x['t'],x['d'],tr] for tr in ['ko','wo'] for u in _h[tr]['units'] if u['lv']<=1 for x in u['items'] if len(x['d'])<=60 and len(x['t'])<=12]
_k=json.load(open(B+'kor.json'))
kor=[[x['t'],x['d'],x.get('k','')] for u in _k['mix']['units'] if u['lv']<=1 and u.get('tag')!='맞춤법' for x in u['items'] if x.get('k') in ('어휘','속담','사자성어','관용어','개념') and not x.get('w') and len(x['t'])<=16 and len(x['d'])<=70]
_ty=json.load(open(B+'typ.json'))
tko=[w for w in _ty['koW'] if 2<=len(w)<=4]
ten=[w for w in _ty['enW'] if 3<=len(w)<=8 and w.isalpha() and w.islower()]
sci=[]
if os.path.exists(B+'sci.json'):
    _s=json.load(open(B+'sci.json'))
    sci=[[x['t'],x['d'],u.get('tag','')] for a in _s for u in _s[a]['units'] if u['lv']<=1 for x in u['items'] if len(x['t'])<=14 and len(x['d'])<=70]
PLAY={'sci':sci,'tko':tko,'ten':ten[:400],'han':han,'eng':eng[:500],'sp':sp,'hist':hist,'kor':kor}
pt=open(B+'play.tpl.html').read()
pt=_re.sub(r'__I_([a-z0-9-]+)__',lambda m:f'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">{ICN[m.group(1)]}</svg>',pt)
pjs=open(B+'play.js').read().replace('__ICONS__',json.dumps(ICN)).replace('__PLAY__',json.dumps(PLAY,ensure_ascii=False))
pt=pt.replace('__CSS__',open(B+'play.css').read()).replace('__HGS__',open(B+'hgs.js').read()).replace('__JS__',pjs)
open(B+'play.html','w').write(pt); subs.insert(0,('play','play.html'))
print('play pools',len(han),len(eng),len(sp),len(hist),len(kor))
def fix(k,h):
    if k=='play': return h
    i=h.rindex('</body>'); return h[:i]+theme(k)+NAVHOOK+(('<style>'+open(B+'slide.css').read()+'</style><script>'+open(B+'slide.js').read()+'</script>') if k in ('hanja','eng','hist','kor','sci') else '')+h[i:]
# 과목 안 탭(오답노트·학습결과)은 셸 탭2로, 여백·폭 맞춤, 갈래 탭은 라인 탭
NAVHOOK='<style>.wset>span>svg{width:16px;height:16px;vertical-align:-3px;margin:0 5px 0 0}.wset{margin:0 0 8px!important;border-radius:0!important;padding:14px 16px!important}@media (min-width:700px){.wset{padding:14px 24px!important}}body{padding:0!important}.app{max-width:1024px!important;margin:0 auto!important;border:0!important;border-radius:0!important}@media (min-width:521px){body{padding-bottom:0!important}.app{border-bottom-left-radius:0!important;border-bottom-right-radius:0!important;border-bottom:0!important}}nav#tabs{display:none!important}.trk{margin:0!important;padding:0 16px!important;gap:0!important;background:var(--paper)!important;border:0!important;border-radius:0!important;box-shadow:inset 0 -1px 0 var(--line)}.trk button{border-radius:0!important;background:none!important;color:#8A9099!important;font-weight:800!important;padding:13px 0 12px!important;box-shadow:inset 0 -2px 0 transparent}.trk button[aria-selected="true"]{color:#1E2421!important;font-weight:900!important;box-shadow:inset 0 -2.5px 0 #1E2421}@media (min-width:700px){.trk{padding:0 24px!important}}#bar[hidden]{display:none!important}.shortcuts button{position:relative}.shortcuts em.scn{font-style:normal;position:absolute;top:-2px;left:calc(50% + 10px);min-width:20px;border-radius:99px;background:#FF4F1F;color:#fff;font-size:11.5px;font-weight:900;line-height:1;padding:3px 6px;border:2px solid var(--paper)}</style>\n<script>(function(){ if(typeof render!==\'function\'||typeof showTabs!==\'function\') return;\nconst bar=document.getElementById(\'bar\'), nav=document.getElementById(\'tabs\'); let lastBack=false, off=false;\nconst sync=()=>{ if(bar) bar.hidden=!(lastBack||off); try{ parent.hgSub&&parent.hgSub(window,off); }catch(e){} };\nif(typeof setBar===\'function\'){ const s0=setBar; setBar=function(t,o){ s0.apply(this,arguments); lastBack=typeof o===\'function\'||!!(o&&typeof o===\'object\'&&o.back); sync(); }; }\nconst t0=showTabs; showTabs=function(on){ t0.apply(this,arguments); off=!on; sync(); };\nconst r0=render; render=function(){ r0.apply(this,arguments); sync();\n  const sc=document.querySelector(\'#screen .shortcuts\'); if(!sc||!nav) return;\n  nav.querySelectorAll(\'button\').forEach(nb=>{ const d=nb.querySelector(\'.dot\'), t=sc.querySelector(\'[data-sc="\'+nb.dataset.tab+\'"]\'); if(!t) return; t.querySelectorAll(\'.scn\').forEach(x=>x.remove()); if(d) t.insertAdjacentHTML(\'beforeend\',\'<em class="scn">\'+d.textContent+\'</em>\'); }); };\n/* 다시 풀 때(오답·복습·방금 틀린 문제) 정답 자리가 지난번과 겹치지 않게 보기를 섞음 */\nconst LPK=\'hg-lastpos-\'+document.title; let LP={}; try{ LP=JSON.parse(localStorage.getItem(LPK)||\'{}\'); }catch(e){}\nconst lpSave=()=>{ try{ const ks=Object.keys(LP); if(ks.length>3000) ks.slice(0,ks.length-3000).forEach(k=>delete LP[k]); localStorage.setItem(LPK,JSON.stringify(LP)); }catch(e){} };\nconst fixPos=(q,key)=>{ if(!q||!Array.isArray(q.choices)||q.choices.length<3||q.ox||q.write||q.spell) return q; const cs=q.choices.slice(); let i=cs.indexOf(q.ans); if(i<0) return q;\n  if(LP[key]===i){ const j=(i+1+Math.floor(Math.random()*(cs.length-1)))%cs.length; [cs[i],cs[j]]=[cs[j],cs[i]]; i=j; } LP[key]=i; lpSave(); q.choices=cs; return q; };\nif(typeof makeQ===\'function\'){ const m0=makeQ; makeQ=function(spec){ const q=m0.apply(this,arguments); try{ fixPos(q,(spec&&spec.ch||q.ch)+\':\'+(q.t||spec&&spec.t)); }catch(e){} return q; }; }\nwindow.hgReshuf=c=>{ if(!c.choices||c.ox||c.write||c.choices.length<3) return c.choices; const cs=c.choices.slice(), i0=cs.indexOf(c.ans);\n  for(let n=0;n<20;n++){ for(let i=cs.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [cs[i],cs[j]]=[cs[j],cs[i]]; } if(cs.indexOf(c.ans)!==i0) break; }\n  try{ LP[(c.ch)+\':\'+(c.t)]=cs.indexOf(c.ans); lpSave(); }catch(e){} return cs; };\nwindow.subTab=k=>{ if(typeof stopRun===\'function\'){ try{stopRun();}catch(e){} } setTab(k); };\nrender(); })();</script>'
q=lambda s: json.dumps(s,ensure_ascii=False).replace('</','<\\/')
st=open(B+'shell.html',encoding='utf8').read().replace('__HGS__',open(B+'hgs.js').read()).replace('__SRC__','{'+','.join(f'{k}:'+q(fix(k,open(B+f).read())) for k,f in subs)+'}')
from sindex import build_index as _bi
_SJ=open(B+'search.js').read().replace('__SIDX__',json.dumps(_bi(B),ensure_ascii=False,separators=(',',':')).replace('</','<\\/'))
_k=st.rindex('</body>'); st=st[:_k]+'<style>'+open(B+'search.css').read()+'</style><script>'+_SJ+'</script>'+st[_k:]
open(B+'study.html','w',encoding='utf8').write(st); print('built',[k for k,_ in subs],len(st.encode()))
