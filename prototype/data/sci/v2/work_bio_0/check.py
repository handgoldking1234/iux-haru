import json,sys
d=json.load(open('../bio_0.json'))
U=d['units']; err=[]
titles="동물의 한살이|곤충의 완전·불완전 탈바꿈|사는 곳에 따른 동물의 생활|동물의 특징을 이용한 생활 도구|식물의 한살이|사는 곳에 따른 식물의 생활|균류·원생생물·세균|생물과 환경, 생태계|먹이 사슬과 생태계 평형|환경 오염과 생태계 보전|식물의 구조: 뿌리·줄기·잎|광합성과 증산 작용|꽃과 열매, 씨의 퍼짐|뼈와 근육, 소화|호흡·순환·배설|감각 기관과 자극의 전달".split('|')
if [u['title'] for u in U]!=titles: err.append('titles')
K=set("개념 원리 법칙 현상 실험 구조 단위 관측".split())
for u in U:
  T=u['title']
  if len(u['items'])!=10: err.append((T,'items'))
  if len(u['mc'])!=8: err.append((T,'mc'))
  if not 2<=len(u['pr'])<=3: err.append((T,'pr'))
  ns=u['sum'].count('요.'); 
  if not 4<=ns<=6: err.append((T,'sum sentences',ns))
  lv=[m['lv'] for m in u['mc']]
  if sorted(lv)!=[1,1,1,2,2,2,3,3]: err.append((T,'lv'))
  ac=[m['a'] for m in u['mc']]
  if sorted(ac)!=[0,0,1,1,2,2,3,3]: err.append((T,'a',ac))
  ts=[i['t'] for i in u['items']]; ds=[i['d'] for i in u['items']]
  if len(set(ts))!=10 or len(set(ds))!=10: err.append((T,'dup'))
  for i in u['items']:
    if not 2<=len(i['t'])<=12: err.append((T,'tlen',i['t']))
    if len(i['d'])>60: err.append((T,'dlen',i['t'],len(i['d'])))
    if i['k'] not in K: err.append((T,'k'))
    if i['t'] in i['d'] or i['t'].replace(' ','') in i['d'].replace(' ',''): err.append((T,'term in def',i['t']))
  for m in u['mc']:
    if len(m['c'])!=4 or len(set(m['c']))!=4: err.append((T,'choices',m['q']))
    if m['a'] not in range(4): err.append((T,'a'))
print(err if err else 'OK')
