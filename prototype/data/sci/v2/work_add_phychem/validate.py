import json, sys, os, collections
base = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
spec = {
 "add_phy.json": ("물리", ["phy_0", "phy_1", "phy_2"], [
   (0, "에너지의 형태와 전환", "전자석과 전기 안전·절약"),
   (2, "디지털 정보와 센서", "기본량·단위와 측정"),
   (2, "힘의 평형과 돌림힘", "뉴턴 운동 법칙"),
   (2, "핵에너지와 태양 에너지의 근원", "에너지 전환과 신재생 에너지"),
   (2, "전반사와 광통신", "파동의 성질과 간섭"),
   (2, "물질의 이중성과 전자 현미경", "빛의 이중성과 광전 효과"),
   (2, "원자의 에너지 준위와 선 스펙트럼", "물질의 이중성과 전자 현미경")]),
 "add_chem.json": ("화학", ["chem_0", "chem_1", "chem_2"], [
   (2, "금속 결합과 금속의 성질", "공유 결합과 분자"),
   (2, "탄소 화합물의 유용성", "지각과 생명체를 이루는 물질"),
   (2, "평형 이동과 르샤틀리에 원리", "가역 반응과 동적 평형")]),
}
KS = set("개념|원리|법칙|현상|실험|구조|단위|관측".split("|"))
err = []
for fn, (tag, srcs, exp) in spec.items():
    d = json.load(open(os.path.join(base, fn), encoding="utf-8"))
    us = d["units"]
    if len(us) != len(exp): err.append(f"{fn}: count {len(us)}")
    titles = {}
    for s in srcs:
        for u in json.load(open(os.path.join(base, s + ".json"), encoding="utf-8"))["units"]:
            titles.setdefault(u["lv"], set()).add(u["title"])
    newt = {(u["lv"], u["title"]) for u in us}
    existing_defs = set()
    for s in srcs:
        for u in json.load(open(os.path.join(base, s + ".json"), encoding="utf-8"))["units"]:
            for i in u["items"]: existing_defs.add(i["d"])
    for u, (lv, t, af) in zip(us, exp):
        p = f"{fn}:{u['title']}"
        for k in ["lv","title","tag","era","pre","sum","pr","items","mc","after"]:
            if k not in u: err.append(f"{p} missing {k}")
        if u["lv"] != lv or u["title"] != t or u["after"] != af or u["tag"] != tag: err.append(f"{p} meta mismatch")
        if af not in titles.get(lv, set()) and (lv, af) not in newt: err.append(f"{p} after not found")
        if not (2 <= len(u["pr"]) <= 3): err.append(f"{p} pr count")
        ns = u["sum"].count(". ") + 1
        if len(u["items"]) != 10: err.append(f"{p} items {len(u['items'])}")
        ts = [i["t"] for i in u["items"]]; ds = [i["d"] for i in u["items"]]
        if len(set(ts)) != 10 or len(set(ds)) != 10: err.append(f"{p} dup term/def")
        for i in u["items"]:
            if set(i) != {"t","d","y","yl","k","ex"}: err.append(f"{p} item keys {i['t']}")
            if i["t"] in i["d"]: err.append(f"{p} term in def: {i['t']}")
            if not (2 <= len(i["t"]) <= 12): err.append(f"{p} term len {i['t']}")
            if len(i["d"]) > 60: err.append(f"{p} def len {len(i['d'])} {i['t']}")
            if i["k"] not in KS: err.append(f"{p} k {i['k']}")
            if i["d"] in existing_defs: err.append(f"{p} def repeats existing {i['t']}")
            for j in u["items"]:
                if j is not i and j["t"] in i["d"] and len(j["t"])>2: print("  note: other term in def", p, i["t"], "<-", j["t"])
        if len(u["mc"]) != 8: err.append(f"{p} mc {len(u['mc'])}")
        c = collections.Counter(m["lv"] for m in u["mc"])
        if c != {1:3, 2:3, 3:2}: err.append(f"{p} mc lv {c}")
        ac = collections.Counter(m["a"] for m in u["mc"])
        for m in u["mc"]:
            if set(m) != {"q","p","c","a","e","lv"}: err.append(f"{p} mc keys")
            if len(m["c"]) != 4 or len(set(m["c"])) != 4: err.append(f"{p} choices {m['q']}")
            if m["a"] not in range(4): err.append(f"{p} a")
        print(p, "sumlen", len(u["sum"]), "a-dist", dict(sorted(ac.items())))
print("ERRORS:" if err else "ALL OK", *err, sep="\n")
