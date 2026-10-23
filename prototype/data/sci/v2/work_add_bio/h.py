def I(t, d, k, ex):
    return {"t": t, "d": d, "y": None, "yl": "", "k": k, "ex": ex}


def M(q, p, c, a, e, lv):
    return {"q": q, "p": p, "c": c, "a": a, "e": e, "lv": lv}


def P(h, b):
    return {"h": h, "b": b}


def U(lv, title, era, pre, sum_, pr, items, mc, after):
    return {"lv": lv, "title": title, "tag": "생명", "era": era, "pre": pre,
            "sum": sum_, "pr": pr, "items": items, "mc": mc, "after": after}
