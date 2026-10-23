import json, sys
sys.path.insert(0, '.')
import part1, part2, part3
units = part1.UNITS + part2.UNITS + part3.UNITS
out = '/tmp/claude-0/-home-claude/c7c64cc0-5c20-56de-8853-021269d6df9c/scratchpad/data/sci/v2/earth_0.json'
json.dump({"units": units}, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
# balance answer positions: move answer to target index by swapping choices (order-free questions only)
SW=[(1,4,3),(12,6,3),(13,6,3),(16,6,3),(8,1,3),(10,6,3),(11,6,0),(4,2,0)]
for ui,qi,t in SW:
    m=units[ui]['mc'][qi]; a=m['a']
    m['c'][a],m['c'][t]=m['c'][t],m['c'][a]; m['a']=t
json.dump({"units": units}, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
