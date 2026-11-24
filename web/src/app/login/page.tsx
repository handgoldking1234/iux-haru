import type { Metadata } from 'next';
import AuthScreen from '@/components/AuthScreen';
import Toasts from '@/components/Toast';

export const metadata: Metadata = { title: '로그인', alternates: { canonical: '/login' } };

export default function LoginPage() {
  return (
    <>
      <AuthScreen start="login" />
      <Toasts />
    </>
  );
}
