def I(t, d, k, ex):
    return {"t": t, "d": d, "y": None, "yl": "", "k": k, "ex": ex}

def M(q, c, a, e, lv, p=""):
    return {"q": q, "p": p, "c": c, "a": a, "e": e, "lv": lv}

def U(title, era, pre, sum_, pr, items, mc):
    return {"lv": 0, "title": title, "tag": "지구", "era": era, "pre": pre, "sum": sum_,
            "pr": [{"h": h, "b": b} for h, b in pr], "items": items, "mc": mc}
