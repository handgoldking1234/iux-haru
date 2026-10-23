import json,sys
f,lo,hi=sys.argv[1],int(sys.argv[2]),int(sys.argv[3])
d=json.load(open(f))
for i,u in enumerate(d['units'][lo:hi],lo):
    print(f"=== [{i}] {u['title']} | {u['era']}\npre: {u['pre']}\nsum: {u['sum']}")
    for p in u['pr']: print(f"pr: {p['h']}: {p['b']}")
    for j,it in enumerate(u['items']): print(f"I{j} {it['t']} [{it['k']}] {it['d']} || {it['ex']}")
    for j,m in enumerate(u['mc']):
        print(f"M{j} L{m['lv']} Q:{m['q']} P:{m['p']}")
        print("   "+" / ".join(f"{'*' if k==m['a'] else ''}{k}){c}" for k,c in enumerate(m['c'])))
        print("   E:"+m['e'])
