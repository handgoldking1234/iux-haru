import AuthScreen from '@/components/AuthScreen';
import Toasts from '@/components/Toast';

export default function LoginPage() {
  return (
    <>
      <AuthScreen start="login" />
      <Toasts />
    </>
  );
}
