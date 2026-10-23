import json, re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import part_a, part_b
from collections import Counter

PAT = [[0,2,1,3,3,1,0,2],[1,3,0,2,2,0,3,1],[2,0,3,1,1,3,2,0],[3,1,2,0,0,2,1,3]]
num = re.compile(r'^(?:약 )?(\d+(?:\.\d+)?)')

out = []
for ui, u in enumerate(part_a.UNITS + part_b.UNITS):
    items = [{"t":t,"d":d,"y":None,"yl":"","k":k,"ex":ex} for (t,k,d,ex) in u["items"]]
    mcs = []
    pat = PAT[ui % 4]
    for qi, (lv,q,p,c,e) in enumerate(u["mc"]):
        correct = c[0]
        ms = [num.match(x) for x in c]
        if all(ms):
            cs = sorted(c, key=lambda x: float(num.match(x).group(1)))
            a = cs.index(correct)
        else:
            others = c[1:]
            a = pat[qi]
            cs = others[:a] + [correct] + others[a:]
        mcs.append({"q":q,"p":p,"c":cs,"a":a,"e":e,"lv":lv})
    out.append({"lv":1,"title":u["title"],"tag":"물리","era":u["era"],"pre":u["pre"],"sum":u["sum"],"pr":u["pr"],"items":items,"mc":mcs})

path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "phy_1.json")
json.dump({"units":out}, open(path,"w",encoding="utf-8"), ensure_ascii=False, indent=1)

# validate
d = json.load(open(path, encoding="utf-8"))
U = d["units"]
titles = ["힘의 표현과 단위","중력과 무게·질량","탄성력","마찰력","부력","빛의 합성과 색","평면거울과 상","볼록·오목 렌즈와 거울의 상","파동의 종류와 요소","소리의 3요소","정전기와 대전","전류·전압·저항과 옴의 법칙","저항의 직렬·병렬 연결","전류의 자기 작용과 전동기","온도·열평형·열의 이동","비열과 열팽창","등속 운동과 자유 낙하 운동","일·위치 에너지·운동 에너지","역학적 에너지 전환과 보존","전자기 유도·전기 에너지와 전력량"]
errs = []
assert [x["title"] for x in U] == titles, "titles"
ac = Counter()
for x in U:
    T = x["title"]
    if len(x["items"]) != 10: errs.append((T,"items"))
    if len(x["mc"]) != 8: errs.append((T,"mc"))
    if Counter(m["lv"] for m in x["mc"]) != Counter({1:3,2:3,3:2}): errs.append((T,"lv"))
    if not 2 <= len(x["pr"]) <= 3: errs.append((T,"pr"))
    ns = x["sum"].count("다.")
    if not 4 <= ns <= 6: errs.append((T,"sum sentences",ns))
    ts = [i["t"] for i in x["items"]]; ds = [i["d"] for i in x["items"]]
    if len(set(ts)) != 10 or len(set(ds)) != 10: errs.append((T,"dup"))
    for i in x["items"]:
        if not 2 <= len(i["t"]) <= 12: errs.append((T,"tlen",i["t"]))
        if len(i["d"]) > 60: errs.append((T,"dlen",i["t"],len(i["d"])))
        if i["k"] not in "개념|원리|법칙|현상|실험|구조|단위|관측".split("|"): errs.append((T,"k",i["t"]))
        for t2 in ts:
            if t2 in i["d"] and t2 == i["t"]: errs.append((T,"self",i["t"]))
    for m in x["mc"]:
        if len(m["c"]) != 4 or len(set(m["c"])) != 4: errs.append((T,"choices",m["q"]))
        if m["a"] not in range(4): errs.append((T,"a"))
        ac[m["a"]] += 1
print("errors:", errs)
print("answer dist:", ac)
for x in U:
    print(x["title"], [m["a"] for m in x["mc"]])
