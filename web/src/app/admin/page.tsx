'use client';
/* 관리자 페이지 /admin — 시안(prototype/admin/index.html)을 그대로 옮긴 adminApp.js를 띄우고, 로그인·데이터는 lib/admin/api로 잇는다 */
import { useEffect, useRef } from 'react';
import '@/styles/proto/admin.css';
import * as api from '@/lib/admin/api';
import { mountAdmin } from '@/lib/admin/adminApp';
import { hasSupabase } from '@/lib/supabase';

export default function AdminPage() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    document.title = '하루공부 관리자';
    if (!hasSupabase || !root.current) return;
    const app = mountAdmin(root.current, api);
    return () => app.destroy();
  }, []);
  if (!hasSupabase) return <p style={{ padding: 24 }}>Supabase 연결이 필요해요.</p>;
  return <div className="pg pg-admin" ref={root} />;
}
