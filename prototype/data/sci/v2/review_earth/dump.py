import json,sys
f=sys.argv[1]; a=int(sys.argv[2]); b=int(sys.argv[3])
d=json.load(open(f))
for i in range(a,b):
  u=d['units'][i]
  print(f"=== [{i}] {u['title']} | {u['era']}")
  print("PRE:",u['pre']); print("SUM:",u['sum'])
  for p in u['pr']: print(" PR:",p['h'],'::',p['b'])
  for j,it in enumerate(u['items']): print(f" I{j}: {it['t']} [{it['k']}] :: {it['d']} || ex: {it['ex']}")
  for j,m in enumerate(u['mc']):
    print(f" M{j} L{m['lv']} Q: {m['q']}" + (f" P: {m['p']}" if m['p'] else ''))
    print("   C:", ' / '.join(f"{k}{'*' if k==m['a'] else ''}){c}" for k,c in enumerate(m['c'])))
    print("   E:",m['e'])
