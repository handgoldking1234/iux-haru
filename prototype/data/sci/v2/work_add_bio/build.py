import json, os, sys, collections
sys.path.insert(0, os.path.dirname(__file__))
from ca import UNITS_A
from cb import UNITS_B
from cc import UNITS_C

V2 = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
by = {u["title"]: u for u in UNITS_A + UNITS_B + UNITS_C}
ORDER = ["동물의 분류 기준", "들과 산의 식물과 잎 모양 분류", "생물과 우리 생활, 첨단 생명과학",
         "영양소와 영양소 검출", "혈액의 구성과 혈액형",
         "생물의 특성과 바이러스", "생명과학의 탐구 방법", "대사성 질환과 에너지 균형", "질병과 병원체",
         "혈액형과 항원 항체 반응", "유전자 재조합과 생명 공학", "개체군과 군집, 방형구법",
         "생태계 평형과 기후 변화의 영향"]
assert set(ORDER) == set(by), set(by) ^ set(ORDER)
units = [by[t] for t in ORDER]

existing = {lv: json.load(open(os.path.join(V2, f"bio_{lv}.json")))["units"] for lv in range(3)}
errs = []
KEYS = ["lv", "title", "tag", "era", "pre", "sum", "pr", "items", "mc", "after"]
for u in units:
    T = u["title"]
    if list(u.keys()) != KEYS: errs.append((T, "keys", list(u.keys())))
    if u["tag"] != "생명": errs.append((T, "tag"))
    titles = [x["title"] for x in existing[u["lv"]]] + [x["title"] for x in units if x["lv"] == u["lv"]]
    if u["after"] != "^" and u["after"] not in titles: errs.append((T, "after missing", u["after"]))
    if not (2 <= len(u["pr"]) <= 3): errs.append((T, "pr count"))
    if len(u["items"]) != 10: errs.append((T, "items", len(u["items"])))
    ts = [i["t"] for i in u["items"]]; ds = [i["d"] for i in u["items"]]
    if len(set(ts)) != 10 or len(set(ds)) != 10: errs.append((T, "dup term/def"))
    for i in u["items"]:
        if not (2 <= len(i["t"]) <= 12): errs.append((T, "term len", i["t"], len(i["t"])))
        if len(i["d"]) > 60: errs.append((T, "def len", i["t"], len(i["d"])))
        if i["t"].replace(" ", "") in i["d"].replace(" ", ""):
            errs.append((T, "term in def", i["t"]))
        if set(i) != {"t", "d", "y", "yl", "k", "ex"}: errs.append((T, "item keys"))
        if i["k"] not in "개념|원리|법칙|현상|실험|구조|단위|관측".split("|"): errs.append((T, "k", i["k"]))
        if i["y"] is not None or i["yl"] != "": errs.append((T, "y"))
    mc = u["mc"]
    if len(mc) != 8: errs.append((T, "mc count"))
    if collections.Counter(m["lv"] for m in mc) != {1: 3, 2: 3, 3: 2}: errs.append((T, "mc lv"))
    for m in mc:
        if len(m["c"]) != 4 or len(set(m["c"])) != 4: errs.append((T, "choices", m["q"]))
        if m["a"] not in range(4): errs.append((T, "a", m["q"]))
    ac = collections.Counter(m["a"] for m in mc)
    if max(ac.values()) > 3 or len(ac) < 4: errs.append((T, "a dist", dict(ac)))
    snt = u["sum"].count(". ") + 1
    if not (4 <= snt <= 6): errs.append((T, "sum sentences", snt))

# cross-file term overlap report
ex_terms = {}
for lv in range(3):
    for x in existing[lv]:
        for i in x["items"]:
            ex_terms.setdefault(i["t"], []).append((x["title"], i["d"]))
for u in units:
    for i in u["items"]:
        if i["t"] in ex_terms:
            for (et, ed) in ex_terms[i["t"]]:
                print("OVERLAP", u["title"], "|", i["t"], "| existing:", et, "|", ed, "|| new:", i["d"])
                if ed == i["d"]: errs.append((u["title"], "identical def", i["t"]))
# term overlap among new units
seen = {}
for u in units:
    for i in u["items"]:
        if i["t"] in seen: print("NEW-OVERLAP", i["t"], seen[i["t"]], u["title"])
        seen[i["t"]] = u["title"]

print("ERRORS:", len(errs))
for e in errs: print(e)
if not errs:
    out = os.path.join(V2, "add_bio.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump({"units": units}, f, ensure_ascii=False, indent=1)
    json.load(open(out))
    print("wrote", out, len(units))
