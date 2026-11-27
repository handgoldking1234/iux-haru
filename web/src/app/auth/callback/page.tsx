'use client';
/* SNS 로그인에서 돌아오는 곳: 세션을 읽고, 처음이면 동의 단계, 아니면 학생 고르기로 보낸다 */
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AuthScreen from '@/components/AuthScreen';
import Toasts from '@/components/Toast';
import { finishSocial, type SocialResult } from '@/lib/account';
import { setAuth } from '@/lib/store';

export default function AuthCallback() {
  const router = useRouter();
  const [res, setRes] = useState<SocialResult | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    // 공급자·Supabase 오류는 주소의 ?…나 #… 뒤에 붙어 온다
    const q = new URLSearchParams(window.location.search + '&' + window.location.hash.replace(/^#/, ''));
    if (q.get('error')) {
      const d = (q.get('error_description') || '') + (q.get('error_code') || '');
      // 0007 트리거: 같은 이메일로 다른 방법을 써서 이미 가입한 경우
      setErr(/EMAIL_ALREADY_REGISTERED|saving new user|already/i.test(d)
        ? '이미 다른 방법으로 가입한 이메일이에요. 처음 가입한 방법으로 로그인해 주세요'
        : '로그인을 취소했거나 실패했어요. 다시 해 주세요');
      return;
    }
    finishSocial()
      .then((r) => {
        try { if (r.way) localStorage.setItem('harugongbu-lastLogin', r.way); } catch { /* 표시용 */ }
        if (r.needConsent) setRes(r);
        else {
          setAuth(r.auth);
          router.replace('/kids');
        }
      })
      .catch((e: Error) => setErr(e.message));
  }, [router]);

  if (res) return (<><AuthScreen start="consent" pending={res.auth} /><Toasts /></>);
  return (
    <div className="auth"><div className="aw"><section className="as" style={{ textAlign: 'center' }}>
      {err ? (<><p className="aerr" role="alert">{err}</p><button type="button" className="abtn k" onClick={() => router.replace('/login')}>로그인 화면으로</button></>)
        : <p className="asub">로그인하는 중이에요…</p>}
    </section></div></div>
  );
}
