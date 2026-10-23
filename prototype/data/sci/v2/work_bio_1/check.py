import json, re, collections
P = "/tmp/claude-0/-home-claude/c7c64cc0-5c20-56de-8853-021269d6df9c/scratchpad/data/sci/v2/bio_1.json"
d = json.load(open(P, encoding="utf-8"))
U = d["units"]
titles = ["생물 다양성과 변이","생물의 분류 체계","생물 다양성 보전","생물의 구성 단계와 세포","광합성","식물의 호흡과 양분 이동","소화","순환","호흡","배설과 기관계의 통합","감각 기관","신경계","호르몬과 항상성","세포 분열: 체세포 분열과 감수 분열","수정과 발생","멘델의 유전 원리","사람의 유전"]
err = []
assert len(U) == 17
allA = collections.Counter()
for i, u in enumerate(U):
    t = u["title"]
    if t != titles[i]: err.append(("title", i, t))
    if u["lv"] != 1 or u["tag"] != "생명": err.append(("lv/tag", t))
    for k in ["era","pre","sum","pr","items","mc"]:
        if k not in u: err.append(("missing", t, k))
    if not (2 <= len(u["pr"]) <= 3): err.append(("pr", t))
    ns = len([s for s in re.split(r"(?<=다)\.\s", u["sum"]) if s.strip()])
    if not (4 <= ns <= 6): err.append(("sum sentences", t, ns))
    it = u["items"]
    if len(it) != 10: err.append(("items", t, len(it)))
    ts = [x["t"] for x in it]; ds = [x["d"] for x in it]
    if len(set(ts)) != 10 or len(set(ds)) != 10: err.append(("dup", t))
    for x in it:
        base = re.sub(r"\(.*?\)", "", x["t"]).strip()
        if not (2 <= len(x["t"]) <= 12) and len(x["t"])<2 or len(x["t"])>12: err.append(("tlen", t, x["t"]))
        if base in x["d"]: err.append(("term in def", t, x["t"]))
        for y in it:
            if y is not x and len(re.sub(r"\(.*?\)","",y["t"]).strip())>=2 and re.sub(r"\(.*?\)","",y["t"]).strip() == base: pass
        if len(x["d"]) > 60: err.append(("dlen", t, x["t"], len(x["d"])))
        if x["k"] not in "개념|원리|법칙|현상|실험|구조|단위|관측".split("|"): err.append(("k", t, x["t"]))
        if x["y"] is not None or x["yl"] != "": err.append(("y", t))
    mc = u["mc"]
    if len(mc) != 8: err.append(("mc", t))
    lv = collections.Counter(m["lv"] for m in mc)
    if lv != {1:3,2:3,3:2}: err.append(("mclv", t, lv))
    ac = collections.Counter(m["a"] for m in mc)
    for m in mc:
        if len(m["c"]) != 4 or len(set(m["c"])) != 4: err.append(("choices", t, m["q"]))
        if m["a"] not in range(4): err.append(("a", t))
        allA[m["a"]] += 1
    print(i+1, t, dict(sorted(ac.items())))
print("A dist", allA)
print("ERRORS", len(err))
for e in err: print(e)
