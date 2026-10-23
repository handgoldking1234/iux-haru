import json, collections
titles = ["입자의 운동: 확산과 증발","기체의 압력과 보일 법칙","기체의 온도와 샤를 법칙","물질의 상태와 입자 배열","상태 변화와 열에너지","원소와 원소 기호","원자와 분자","이온과 앙금 생성 반응","순물질과 혼합물, 녹는점·끓는점","밀도와 용해도","혼합물의 분리: 증류·재결정·크로마토그래피","물리 변화와 화학 변화","화학 반응식","질량 보존·일정 성분비 법칙","기체 반응 법칙","화학 반응과 에너지 출입"]
d = json.load(open('/tmp/claude-0/-home-claude/c7c64cc0-5c20-56de-8853-021269d6df9c/scratchpad/data/sci/v2/chem_1.json', encoding='utf-8'))
U = d["units"]; err=[]
assert len(U)==16
allA = collections.Counter()
for i,u in enumerate(U):
    if u["title"]!=titles[i]: err.append(f"title {i}")
    if u["lv"]!=1 or u["tag"]!="화학": err.append(f"lv/tag {i}")
    if not (2<=len(u["pr"])<=3): err.append(f"pr {i}")
    ns = u["sum"].count(".")
    if not (4<=ns<=7): err.append(f"sum sentences {i}: {ns}")
    it=u["items"]; 
    if len(it)!=10: err.append(f"items {i}")
    ts=[x["t"] for x in it]; ds=[x["d"] for x in it]
    if len(set(ts))!=10 or len(set(ds))!=10: err.append(f"dup {i}")
    for x in it:
        if not (2<=len(x["t"])<=12): err.append(f"tlen {i} {x['t']}")
        if len(x["d"])>60: err.append(f"dlen {i} {x['t']} {len(x['d'])}")
        if x["k"] not in "개념|원리|법칙|현상|실험|구조|단위|관측".split("|"): err.append(f"k {i}")
        if x["y"] is not None or x["yl"]!="": err.append("y")
        for t in ts:
            if t in x["d"] and (t==x["t"]): err.append(f"self {i} {t}")
    mc=u["mc"]
    if len(mc)!=8: err.append(f"mc {i}")
    c=collections.Counter(m["lv"] for m in mc)
    if c!={1:3,2:3,3:2}: err.append(f"mclv {i} {c}")
    for m in mc:
        if len(m["c"])!=4 or len(set(m["c"]))!=4: err.append(f"choices {i} {m['q']}")
        if m["a"] not in (0,1,2,3): err.append("a")
        allA[m["a"]]+=1
    print(i+1, [m["a"] for m in mc])
print(allA)
print("ERR", err)
