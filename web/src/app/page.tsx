'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { activeKid, useAuth } from '@/lib/store';

export default function Start() {
  const router = useRouter();
  const auth = useAuth();
  useEffect(() => {
    if (auth === undefined) return;
    router.replace(!auth ? '/login' : activeKid(auth) ? '/home' : '/kids');
  }, [auth, router]);
  return null;
}
