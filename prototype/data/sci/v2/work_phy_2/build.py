import json, sys
sys.path.insert(0, '.')
from p1 import UNITS as a
from p2 import UNITS as b
from p3 import UNITS as c
units = a + b + c
out = '/tmp/claude-0/-home-claude/c7c64cc0-5c20-56de-8853-021269d6df9c/scratchpad/data/sci/v2/phy_2.json'
json.dump({"units": units}, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
