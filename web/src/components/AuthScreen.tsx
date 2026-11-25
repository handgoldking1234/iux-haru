'use client';
/* 로그인 · 회원가입 · 비밀번호 찾기 · 초대 코드 · 학생 고르기 — 프로토타입 shell.html #auth 마크업 그대로 */
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Mail } from 'lucide-react';
import { addKid, cancelSocial, giveConsent, GRADES, login, okEmail, okKidName, okNewPw, selectKid, signup, startSocial } from '@/lib/account';
import type { LocalAuth } from '@/lib/store';
import { useAuth } from '@/lib/store';
import { pop } from './Toast';
import Logo from './Logo';

type View = 'login' | 'signup' | 'find' | 'code' | 'kids' | 'consent';
type Way = 'email' | 'kakao' | 'naver' | 'google';

// 마지막으로 쓴 로그인 방법 ("최근 로그인" 표시용). 기존 저장 키 접두어를 따른다.
const LAST_KEY = 'harugongbu-lastLogin';
const readLast = (): Way | null => {
  try { return (localStorage.getItem(LAST_KEY) as Way | null) ?? null; } catch { return null; }
};
const saveLast = (w: Way) => {
  try { localStorage.setItem(LAST_KEY, w); } catch { /* 저장 못 해도 로그인은 계속 */ }
};

const SNS = [
  { id: 'kakao', name: '카카오', img: '/sns/kakao.png' },
  { id: 'naver', name: '네이버', img: '/sns/naver-n.png' },
  { id: 'google', name: 'Google', img: '/sns/google-sm.png' },
] as const;


const Back = ({ go }: { go: () => void }) => (
  <button type="button" className="aback" onClick={go} aria-label="뒤로">←</button>
);

export default function AuthScreen({ start, pending }: { start: View; pending?: LocalAuth }) {
  const router = useRouter();
  const auth = useAuth();
  const [v, setV] = useState<View>(start);
  const [err, setErr] = useState('');
  const [lEmail, setLEmail] = useState('');
  const [lPw, setLPw] = useState('');
  const [keep, setKeep] = useState(true);
  const [s, setS] = useState({ email: '', pw: '', kid: '', grade: '초5', code: '' });
  const [terms, setTerms] = useState([false, false, false, false]);
  const [fEmail, setFEmail] = useState('');
  const [cCode, setCCode] = useState('');
  const [kidForm, setKidForm] = useState<null | { name: string; grade: string; err: string }>(null);
  const root = useRef<HTMLDivElement>(null);
  // SNS 로그인이 열리기 전까지는 이메일 입력칸을 처음부터 펼쳐 둔다
  const [emailOpen, setEmailOpen] = useState(true);
  const [last, setLast] = useState<Way | null>(null);
  useEffect(() => setLast(readLast()), []);

  useEffect(() => {
    if (v === 'kids' && auth === null) setV('login');
    // 학생이 하나도 없으면 바로 추가 칸을 연다
    if (v === 'kids' && auth && auth.kids.length === 0 && !kidForm) setKidForm({ name: '', grade: '초1', err: '' });
  }, [v, auth, kidForm]);

  const go = (x: View) => {
    setErr('');
    setV(x);
    root.current?.scrollTo(0, 0);
  };

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    const em = lEmail.trim();
    if (!okEmail(em)) return setErr('이메일을 확인해 주세요');
    if (lPw.length < 8) return setErr('비밀번호는 8자 이상이에요');
    try {
      await login(em, lPw, auth ?? null);
      saveLast('email');
      go('kids');
    } catch (x) {
      setErr((x as Error).message);
    }
  }

  async function onSign(e: React.FormEvent) {
    e.preventDefault();
    const em = s.email.trim(), kid = s.kid.trim();
    if (!okEmail(em)) return setErr('보호자 이메일을 확인해 주세요');
    if (!okNewPw(s.pw)) return setErr('비밀번호는 영문과 숫자를 섞어 8자 이상이에요');
    if (!okKidName(kid)) return setErr('아이 이름은 한글·영문·숫자 2~8자예요');
    if (terms.slice(0, 3).some((t) => !t)) return setErr('필수 약관에 모두 동의해 주세요');
    try {
      await signup(em, s.pw, { name: kid, grade: s.grade }, s.code.trim().toUpperCase() || null);
      go('kids');
    } catch (x) {
      setErr((x as Error).message);
    }
  }

  function onFind(e: React.FormEvent) {
    e.preventDefault();
    if (!okEmail(fEmail.trim())) return setErr('이메일을 확인해 주세요');
    pop('재설정 링크를 보냈어요');
    go('login');
  }

  function onCode(e: React.FormEvent) {
    e.preventDefault();
    const c = cCode.trim().toUpperCase();
    if (!/^[A-Z0-9]{6,8}$/.test(c)) return setErr('코드는 영문·숫자 6~8자예요');
    setS({ ...s, code: c });
    go('signup');
    pop('코드를 확인했어요. 가입을 마치면 적용돼요');
  }

  async function onKidAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!kidForm || !auth) return;
    const n = kidForm.name.trim();
    if (!okKidName(n)) return setKidForm({ ...kidForm, err: '한글·영문·숫자 2~8자예요' });
    try {
      await addKid(auth, { name: n, grade: kidForm.grade });
      setKidForm(null);
    } catch (x) {
      setKidForm({ ...kidForm, err: (x as Error).message });
    }
  }

  async function onConsent(e: React.FormEvent) {
    e.preventDefault();
    if (!pending) return go('login');
    if (terms.slice(0, 3).some((t) => !t)) return setErr('필수 약관에 모두 동의해 주세요');
    try {
      await giveConsent(pending);
      go('kids');
    } catch (x) {
      setErr((x as Error).message);
    }
  }

  const allTerms = terms.every(Boolean);
  const termList = ['[필수] 이용약관 동의', '[필수] 개인정보 수집·이용 동의', '[필수] 만 14세 미만 아동의 법정대리인(보호자) 동의', '[선택] 공부 알림·소식 받기'];
  const termsBox = (
    <div className="aterms">
      <label className="achk all"><input type="checkbox" checked={allTerms} onChange={(e) => setTerms(terms.map(() => e.target.checked))} /> 모두 동의</label>
      {termList.map((t, i) => (
        <label key={t} className="achk"><input type="checkbox" checked={terms[i]} onChange={(e) => setTerms(terms.map((x, j) => (j === i ? e.target.checked : x)))} /> {t}</label>
      ))}
    </div>
  );

  return (
    <div className="auth" ref={root}>
      <div className="aw">
        {v === 'login' && (
          <section className="as alog" aria-labelledby="aT1">
            <div className="alogo"><span className="amark" aria-hidden="true"><Logo /></span><h1 id="aT1">로그인</h1></div>
            {!emailOpen ? (
              <div className="aemail-wrap">
                {last === 'email' && <span className="alast">최근 로그인</span>}
                <button type="button" className="aemail" onClick={() => setEmailOpen(true)}>
                  <Mail aria-hidden="true" size={22} strokeWidth={1.8} /><span>이메일로 로그인</span>
                </button>
              </div>
            ) : (
              <form className="af" onSubmit={onLogin} noValidate>
                <label className="afl"><span>이메일</span><input type="email" autoComplete="email" placeholder="parent@example.com" value={lEmail} onChange={(e) => setLEmail(e.target.value)} autoFocus /></label>
                <label className="afl"><span>비밀번호</span><input type="password" autoComplete="current-password" placeholder="8자 이상" value={lPw} onChange={(e) => setLPw(e.target.value)} /></label>
                <p className="aerr" role="alert">{err}</p>
                <label className="achk"><input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} /> 로그인 상태 유지</label>
                <button className="abtn k" type="submit">로그인</button>
              </form>
            )}
            <div className="aor"><span>또는</span></div>
            <div className="asns-r">
              {SNS.map((x) => (
                <div key={x.id} className="asns-i">
                  {last === x.id && <span className="alast">최근 로그인</span>}
                  <button type="button" className={`snsr ${x.id}`} aria-label={`${x.name}로 로그인`} onClick={() => startSocial(x.id).catch((e: Error) => pop(e.message))}>
                    <img src={x.img} alt="" width={30} height={30} />
                  </button>
                </div>
              ))}
            </div>
            <div className="ainfo">
              <div><p>처음이신가요?</p><button type="button" onClick={() => go('signup')}>회원가입</button></div>
              <i aria-hidden="true"></i>
              <div><p>초대 코드가 있나요?</p><button type="button" onClick={() => go('code')}>코드 입력</button></div>
            </div>
            <p className="ahelp">로그인에 어려움이 있나요? <button type="button" onClick={() => go('find')}>비밀번호 찾기</button></p>
            <p className="alegal">
              <button type="button" onClick={() => pop('이용약관은 준비 중이에요')}>이용약관</button> · <button type="button" className="b" onClick={() => pop('개인정보처리방침은 준비 중이에요')}>개인정보처리방침</button>
            </p>
          </section>
        )}

        {v === 'signup' && (
          <section className="as" aria-labelledby="aT2">
            <div className="ahd"><Back go={() => go('login')} /><h2 id="aT2">회원가입</h2></div>
            <p className="asub">보호자 계정으로 가입하고, 아이를 학생으로 추가해요.</p>
            <form className="af" onSubmit={onSign} noValidate>
              <label className="afl"><span>보호자 이메일</span><input type="email" autoComplete="email" placeholder="parent@example.com" value={s.email} onChange={(e) => setS({ ...s, email: e.target.value })} /></label>
              <label className="afl"><span>비밀번호</span><input type="password" autoComplete="new-password" placeholder="영문·숫자 8자 이상" value={s.pw} onChange={(e) => setS({ ...s, pw: e.target.value })} /></label>
              <div className="arow2">
                <label className="afl"><span>아이 이름(닉네임)</span><input maxLength={8} placeholder="민왕이" value={s.kid} onChange={(e) => setS({ ...s, kid: e.target.value })} /></label>
                <label className="afl"><span>학년</span><select value={s.grade} onChange={(e) => setS({ ...s, grade: e.target.value })}>{GRADES.map((g) => <option key={g}>{g}</option>)}</select></label>
              </div>
              <label className="afl"><span>초대 코드 <small>(선택)</small></span><input maxLength={8} placeholder="친구에게 받은 코드" style={{ textTransform: 'uppercase' }} value={s.code} onChange={(e) => setS({ ...s, code: e.target.value })} /></label>
              {termsBox}
              <p className="aerr" role="alert">{err}</p>
              <button className="abtn k" type="submit">가입하고 시작하기</button>
            </form>
          </section>
        )}

        {v === 'consent' && pending && (
          <section className="as" aria-labelledby="aT6">
            <div className="ahd"><Back go={() => { cancelSocial().finally(() => go('login')); }} /><h2 id="aT6">처음 오셨네요</h2></div>
            <p className="asub">보호자 계정으로 시작해요. 약관에 동의하면 아이를 학생으로 추가할 수 있어요.</p>
            <form className="af" onSubmit={onConsent} noValidate>
              {termsBox}
              <p className="aerr" role="alert">{err}</p>
              <button className="abtn k" type="submit">동의하고 시작하기</button>
            </form>
          </section>
        )}

        {v === 'find' && (
          <section className="as" aria-labelledby="aT3">
            <div className="ahd"><Back go={() => go('login')} /><h2 id="aT3">비밀번호 찾기</h2></div>
            <p className="asub">가입한 이메일로 비밀번호 재설정 링크를 보내 드려요.</p>
            <form className="af" onSubmit={onFind} noValidate>
              <label className="afl"><span>이메일</span><input type="email" placeholder="parent@example.com" value={fEmail} onChange={(e) => setFEmail(e.target.value)} /></label>
              <p className="aerr" role="alert">{err}</p>
              <button className="abtn k" type="submit">재설정 링크 보내기</button>
            </form>
          </section>
        )}

        {v === 'code' && (
          <section className="as" aria-labelledby="aT4">
            <div className="ahd"><Back go={() => go('login')} /><h2 id="aT4">초대 코드로 시작</h2></div>
            <p className="asub">친구에게 받은 코드를 넣으면 무료로 열리는 과목이 늘어나요.</p>
            <form className="af" onSubmit={onCode} noValidate>
              <label className="afl"><span>초대 코드</span><input maxLength={8} placeholder="예: HARU2026" style={{ textTransform: 'uppercase', letterSpacing: '.12em', fontWeight: 800 }} value={cCode} onChange={(e) => setCCode(e.target.value)} /></label>
              <p className="aerr" role="alert">{err}</p>
              <button className="abtn k" type="submit">코드 확인하고 가입하기</button>
            </form>
          </section>
        )}

        {v === 'kids' && auth && (
          <section className="as" aria-labelledby="aT5">
            <div className="ahd"><h2 id="aT5">누가 공부하나요?</h2></div>
            <p className="asub">학생을 고르면 그 학생의 오늘 할 일로 시작해요.</p>
            <div className="kids">
              {auth.kids.map((k, i) => (
                <button key={i} className="kid" onClick={() => { selectKid(auth, i); router.replace('/home'); pop(`${k.name}, 오늘도 화이팅!`); }}>
                  <span className="kav">{k.name[0]}</span><b>{k.name}</b><small>{k.grade}</small>
                </button>
              ))}
              {kidForm && (
                <form className="af kidf" style={{ gridColumn: '1/-1', marginTop: 6 }} onSubmit={onKidAdd}>
                  <div className="arow2">
                    <label className="afl"><span>학생 이름</span><input maxLength={8} placeholder="2~8자" autoFocus value={kidForm.name} onChange={(e) => setKidForm({ ...kidForm, name: e.target.value })} /></label>
                    <label className="afl"><span>학년</span><select value={kidForm.grade} onChange={(e) => setKidForm({ ...kidForm, grade: e.target.value })}>{GRADES.map((g) => <option key={g}>{g}</option>)}</select></label>
                  </div>
                  <p className="aerr">{kidForm.err}</p>
                  <button className="abtn k" type="submit">추가</button>
                </form>
              )}
            </div>
            <button type="button" className="acode" onClick={() => !kidForm && setKidForm({ name: '', grade: '초1', err: '' })}>+ 학생 추가</button>
          </section>
        )}
      </div>
    </div>
  );
}
