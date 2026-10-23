import json, sys
sys.path.insert(0, '.')
from part1 import U as U1
from part2 import U as U2
U = U1 + U2
keys = ["lv","title","tag","era","pre","sum","pr","items","mc"]
SW = [(1,0,3),(3,3,3),(4,6,3),(5,0,3),(7,4,3),(10,3,3),(11,0,3),(15,4,3),(16,4,3),(6,4,0),(9,3,0),(11,3,0),(12,3,0),(14,7,0)]
for un,mi,np_ in SW:
    m = U[un-1]["mc"][mi]; a = m["a"]; assert a==1, (un,mi)
    m["c"][a], m["c"][np_] = m["c"][np_], m["c"][a]; m["a"] = np_
U = [{k:u[k] for k in keys} for u in U]
out = '/tmp/claude-0/-home-claude/c7c64cc0-5c20-56de-8853-021269d6df9c/scratchpad/data/sci/v2/chem_1.json'
json.dump({"units":U}, open(out,'w',encoding='utf-8'), ensure_ascii=False, indent=1)
