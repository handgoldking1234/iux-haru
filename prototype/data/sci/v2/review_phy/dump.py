import json,sys
f=sys.argv[1]; d=json.load(open(f))
for i,u in enumerate(d['units']):
    if len(sys.argv)>2 and str(i) not in sys.argv[2].split(','): continue
    print(f"=== [{i}] lv{u['lv']} {u['title']} | {u['era']}")
    print("pre:",u['pre']); print("sum:",u['sum'])
    for p in u['pr']: print(" PR",p['h'],":",p['b'])
    for j,it in enumerate(u['items']): print(f" I{j} {it['t']} [{it['k']}] {it['d']} || {it['ex']}")
    for j,m in enumerate(u['mc']):
        print(f" M{j} lv{m['lv']} Q:{m['q']} P:{m['p']}")
        print("   ", " / ".join(f"{'*' if k==m['a'] else ''}{k}){c}" for k,c in enumerate(m['c'])))
        print("    E:",m['e'])
