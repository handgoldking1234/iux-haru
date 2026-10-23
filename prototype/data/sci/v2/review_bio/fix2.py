import json
D={f:json.load(open(f+'.json')) for f in ['bio_1','bio_2']}
def item(f,i,t):
    return next(x for x in D[f]['units'][i]['items'] if x['t']==t)
item('bio_1',9,'콩팥')['d']='겉질·속질·깔때기 부분으로 이루어져 혈액을 걸러 오줌을 만드는 한 쌍의 기관'
item('bio_2',14,'변이')['d']='DNA 변화와 생식 과정의 유전자 조합으로 생기며 자연선택의 재료가 되는 개체 간 형질 차이'
item('bio_2',9,'2가 염색체')['d']='상동 염색체가 접합해 염색 분체 4개가 한 묶음이 된 것으로 감수 1분열 중기에 세포 가운데 배열됨'
for f,d in D.items(): json.dump(d,open(f+'.json','w'),ensure_ascii=False,indent=1)
