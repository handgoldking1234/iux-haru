'use client';
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
// 새 이름(Publishable key, sb_publishable_…)과 예전 이름(anon key) 모두 받는다
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** 키가 없으면 로컬 모드(브라우저 저장)로 동작한다 */
export const hasSupabase = !!(url && key);

let client: SupabaseClient | null = null;
export function supabase(): SupabaseClient {
  if (!hasSupabase) throw new Error('Supabase 키가 없어요 (.env.local)');
  return (client ??= createBrowserClient(url!, key!));
}
