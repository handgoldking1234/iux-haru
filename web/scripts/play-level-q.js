/* ---------- 게임 수준(초1~고3) — scripts/play-app.mjs가 genQ 앞에 끼워 넣는다 (사용자 요청) ----------
   한자·영단어·과학·역사·국어는 play-lv.json(학년별 문제 묶음, env.lv)에서 뽑고, 연산은 학년에 맞게 새로 만든다.
   스피드 게임은 내가 고른 수준, 대결방은 방장이 고른 수준(LVNOW)을 쓴다 */
const LVG=['초1','초2','초3','초4','초5','초6','중1','중2','중3','고1','고2','고3'];
let LVNOW=null;
const gLv=()=>{ const st=S(); if(typeof st.gLv==='number') return st.gLv; const i=LVG.indexOf(env.grade); return i<0?2:i; };
const curLv=()=>LVNOW!=null?LVNOW:gLv();
const lvPool=k=>{ const P=env.lv&&env.lv[k]; if(!P) return null; const ids=P.g[curLv()]; return ids&&ids.length>=8?ids.map(i=>P.it[i]):null; };
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
function numQ(q,a,hint){ const set=new Set([a]); shuffle([a+1,a-1,a+2,a-2,a+10,a-10,a*2,a+3,a-3,-a]).forEach(v=>{ if(set.size<4&&Number.isFinite(v)&&(a<0||v>=0)) set.add(v); });
  return {q,ans:String(a),c:shuffle([...set].map(String)),kind:'num',hint:hint||'계산해요'}; }
function strQ(q,a,wrong,hint){ const set=new Set([a]); shuffle(wrong).forEach(v=>{ if(set.size<4&&v!==a) set.add(v); }); return {q,ans:a,c:shuffle([...set]),kind:'num',hint:hint||'계산해요'}; }
function mathLv(g){
  const t=R(0,2);
  if(g===0){ if(t){ const x=R(1,9),y=R(1,9); return numQ(`${x} + ${y}`,x+y); } const x=R(5,18),y=R(1,Math.min(9,x)); return numQ(`${x} − ${y}`,x-y); }
  if(g===1){ if(t===0){ const x=R(2,9),y=R(2,9); return numQ(`${x} × ${y}`,x*y); } if(t===1){ const x=R(11,89),y=R(11,99-x); return numQ(`${x} + ${y}`,x+y); } const x=R(30,99),y=R(11,x-1); return numQ(`${x} − ${y}`,x-y); }
  if(g===2){ if(t===0){ const x=R(100,599),y=R(100,399); return numQ(`${x} + ${y}`,x+y); } if(t===1){ const x=R(12,49),y=R(2,9); return numQ(`${x} × ${y}`,x*y); } const y=R(2,9),z=R(3,12); return numQ(`${y*z} ÷ ${y}`,z); }
  if(g===3){ if(t===0){ const x=R(21,99),y=R(11,29); return numQ(`${x} × ${y}`,x*y); } if(t===1){ const y=R(3,9),z=R(21,99); return numQ(`${y*z} ÷ ${y}`,z); } const d=R(5,12),a=R(1,d-2),b=R(1,d-1-a); return strQ(`${a}/${d} + ${b}/${d}`,`${a+b}/${d}`,[`${a+b}/${d*2}`,`${a+b+1}/${d}`,`${Math.abs(a+b-1)}/${d}`,`${a*b}/${d}`],'분수 계산'); }
  if(g===4){ if(t===0){ const x=R(12,48),y=R(12,48),k=R(2,6); return numQ(`${x*k}와 ${y*k}의 최대공약수`,gcd(x*k,y*k),'최대공약수'); } if(t===1){ const a=R(11,99)/10,b=R(11,99)/10; const s=Math.round((a+b)*10)/10; return strQ(`${a} + ${b}`,String(s),[String(Math.round((s+0.1)*10)/10),String(Math.round((s-0.1)*10)/10),String(Math.round((s+1)*10)/10)]); }
    const a=R(2,5),b=R(a+1,8); const n=a*b/gcd(a,b); return numQ(`${a}와 ${b}의 최소공배수`,n,'최소공배수'); }
  if(g===5){ if(t===0){ const p=pick([10,20,25,50]),y=pick([40,60,80,120,200]); return numQ(`${y}의 ${p}%`,y*p/100,'비율'); } if(t===1){ const a=R(2,9),b=R(a+1,12); return numQ(`${a}/${b} ÷ 1/${b}`,a,'분수의 나눗셈'); }
    const x=R(12,95)/10,y=R(2,9); return strQ(`${x} × ${y}`,String(Math.round(x*y*10)/10),[String(Math.round(x*y*10)/10+1),String(Math.round((x*y-0.1)*10)/10),String(Math.round(x*y*100)/10)]); }
  if(g===6){ if(t===0){ const a=R(-9,9),b=R(-9,-1),c=R(2,5); return numQ(`${a} + (${b}) × ${c}`,a+b*c,'정수 계산'); } const x=R(-6,9),k=R(2,7),m=R(-9,9); return numQ(`${k}x ${m<0?'−':'+'} ${Math.abs(m)} = ${k*x+m} 일 때 x`,x,'일차방정식'); }
  if(g===7){ if(t===0){ const a=R(2,3),m=R(2,5),n=R(1,3); return numQ(`${a}^${m} × ${a}^${n} = ${a}^□`,m+n,'지수법칙'); } const k=R(-4,5),b=R(-9,9),x=R(-5,6); return numQ(`y = ${k}x ${b<0?'−':'+'} ${Math.abs(b)} 에서 x = ${x} 일 때 y`,k*x+b,'일차함수'); }
  if(g===8){ if(t===0){ const n=R(4,20); return numQ(`√${n*n}`,n,'제곱근'); } const p=R(1,7),q=R(p+1,9); return numQ(`x² − ${p+q}x + ${p*q} = 0 의 작은 근`,p,'이차방정식'); }
  if(g===9){ if(t===0){ const p=R(-6,6),q=R(-6,6); return numQ(`x² ${-(p+q)<0?'−':'+'} ${Math.abs(p+q)}x ${p*q<0?'−':'+'} ${Math.abs(p*q)} = 0 의 두 근의 합`,p+q,'근과 계수'); } const a=R(1,4),b=R(-5,5),k=R(-3,3); return numQ(`f(x) = ${a}x² ${b<0?'−':'+'} ${Math.abs(b)}x + 1 일 때 f(${k})`,a*k*k+b*k+1,'다항식의 값'); }
  if(g===10){ if(t===0){ const b=pick([2,3]),n=R(2,b===2?7:4); return numQ(`log${b===2?'₂':'₃'} ${b**n}`,n,'로그'); } const a=R(1,9),d=R(2,6),n=R(5,12); return numQ(`첫째항 ${a}, 공차 ${d}인 등차수열의 제${n}항`,a+(n-1)*d,'등차수열'); }
  if(t===0){ const c=R(1,4),x=R(1,4); return numQ(`f(x) = ${c}x³ 일 때 f'(${x})`,3*c*x*x,'미분계수'); } const k=R(1,4),b=R(1,4); return numQ(`∫₀^${b} ${2*k}x dx`,k*b*b,'정적분');
}
