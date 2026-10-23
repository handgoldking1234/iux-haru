import json,os
B=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p=f"{B}/chem_2.json"; d=json.load(open(p,encoding='utf-8'))
u=d['units'][14]
assert u['mc'][0]['q']=="다음 중 발열 반응은?" and u['mc'][1]['q'].startswith("흡열 반응이 일어날 때")
assert u['mc'][0]['lv']==1 and u['mc'][1]['lv']==1
u['mc'][0].update({"q":"결합 에너지가 뜻하는 것은?","p":"",
 "c":["결합 1몰이 생길 때 흡수하는 에너지","기체 상태에서 결합 1몰을 끊는 데 필요한 에너지","물질 1 g의 온도를 1 °C 높이는 데 필요한 열량","물질 1몰이 완전히 탈 때 내놓는 열"],"a":1,
 "e":"결합 에너지는 기체 상태에서 결합 1몰을 끊는 데 필요한 에너지이고, 결합이 생길 때는 같은 크기의 에너지가 방출된다. 1 g을 1 °C 높이는 열량은 비열이다."})
u['mc'][1].update({"q":"메테인의 연소 엔탈피가 −890 kJ/mol이라는 뜻으로 옳은 것은?","p":"",
 "c":["메테인 1몰이 탈 때 890 kJ을 흡수한다.","메테인 1 g이 탈 때 890 kJ을 방출한다.","메테인 1몰을 만들 때 890 kJ을 방출한다.","메테인 1몰이 완전 연소할 때 890 kJ을 방출한다."],"a":3,
 "e":"연소 엔탈피는 물질 1몰이 완전 연소할 때의 ΔH이며, 음수이므로 열을 방출한다. 기준은 1 g이 아니라 1몰이다."})
json.dump(d,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('ok')
