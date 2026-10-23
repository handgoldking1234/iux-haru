import AuthScreen from '@/components/AuthScreen';
import Toasts from '@/components/Toast';

export default function KidsPage() {
  return (
    <>
      <AuthScreen start="kids" />
      <Toasts />
    </>
  );
}
