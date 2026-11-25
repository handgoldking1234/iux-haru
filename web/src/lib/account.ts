'use client';
/**
 * 보호자 계정 — 로그인·가입·학생 추가·로그아웃 (프로토타입 shell.html 로그인 흐름과 같은 규칙).
 * 화면은 늘 브라우저의 LocalAuth를 읽고, Supabase가 있으면 서버 결과로 그것을 채운다.
 */
import { enabledProviders, hasSupabase, supabase } from './supabase';
import { setAuth, type Kid, type LocalAuth } from './store';

export const GRADES = ['초1', '초2', '초3', '초4', '초5', '초6', '중1', '중2', '중3', '고1', '고2', '고3'];

export const okEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const okKidName = (v: string) => /^[가-힣a-zA-Z0-9]{2,8}$/.test(v);
export const okNewPw = (v: string) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(v);

async function loadKids(): Promise<Kid[]> {
  const { data, error } = await supabase().from('students').select('id, nickname, grade').order('created_at');
  if (error) throw error;
  return (data ?? []).map((r) => ({ id: r.id, name: r.nickname, grade: r.grade }));
}

async function insertKid(kid: Kid): Promise<Kid> {
  const { data } = await supabase().auth.getUser();
  const { data: row, error } = await supabase().from('students').insert({ guardian_id: data.user?.id, nickname: kid.name, grade: kid.grade }).select('id').single();
  if (error) throw new Error('학생을 추가하지 못했어요');
  return { ...kid, id: row.id };
}

export async function login(email: string, pw: string, prev: LocalAuth | null): Promise<LocalAuth> {
  if (hasSupabase) {
    const { error } = await supabase().auth.signInWithPassword({ email, password: pw });
    if (error) throw new Error('이메일이나 비밀번호가 맞지 않아요');
    const a = { email, via: 'email', kids: await loadKids() };
    setAuth(a);
    return a;
  }
  const a = { email, via: 'email', kids: prev?.kids ?? [] };
  setAuth(a);
  return a;
}

/** 보호자 가입 + 첫 학생. 필수 약관(법정대리인 동의 포함)을 확인한 뒤에만 부른다 */
export async function signup(email: string, pw: string, kid: Kid, code: string | null): Promise<LocalAuth> {
  if (hasSupabase) {
    const { error } = await supabase().auth.signUp({ email, password: pw });
    if (error) throw new Error('가입하지 못했어요. 잠시 뒤 다시 해 주세요');
    kid = await insertKid(kid);
  }
  const a = { email, via: 'email', kids: [kid], code };
  setAuth(a);
  return a;
}

export async function addKid(a: LocalAuth, kid: Kid): Promise<LocalAuth> {
  if (hasSupabase) kid = await insertKid(kid);
  const next = { ...a, kids: [...a.kids, kid] };
  setAuth(next);
  return next;
}

export function selectKid(a: LocalAuth, i: number) {
  setAuth({ ...a, kid: i });
}

export async function logout() {
  if (hasSupabase) await supabase().auth.signOut();
  setAuth(null);
}

/* ───────── SNS 로그인 (Google·카카오는 Supabase 기본, 네이버는 사용자 정의 공급자 custom:naver) ───────── */
export type Social = 'google' | 'kakao' | 'naver';
const PENDING_KEY = 'harugongbu-socialPending';
const PROVIDER: Record<Social, string> = { google: 'google', kakao: 'kakao', naver: 'custom:naver' };
const NAME: Record<Social, string> = { google: 'Google', kakao: '카카오', naver: '네이버' };

/** 공급자 로그인 화면으로 보낸다. 돌아오는 곳은 /auth/callback */
export async function startSocial(way: Social) {
  if (!hasSupabase) throw new Error('지금은 이메일로만 로그인할 수 있어요');
  // Supabase에서 아직 켜지 않은 공급자면 오류 화면(JSON)으로 넘기지 않고 안내만 한다
  const on = await enabledProviders();
  if (on) {
    const ready = way === 'naver' ? Object.entries(on).some(([k, v]) => v && k.includes('naver')) : on[way] === true;
    if (!ready) throw new Error(`${NAME[way]} 로그인은 준비 중이에요`);
  }
  try { localStorage.setItem(PENDING_KEY, way); } catch { /* 표시용이라 없어도 된다 */ }
  const { error } = await supabase().auth.signInWithOAuth({
    // 네이버는 Supabase 대시보드에 만든 사용자 정의 공급자 이름을 쓴다
    provider: PROVIDER[way] as 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) throw new Error('로그인 화면을 열지 못했어요. 잠시 뒤 다시 해 주세요');
}

export interface SocialResult {
  auth: LocalAuth;
  /** 처음 온 SNS 보호자: 약관·법정대리인 동의를 아직 받지 않았다 */
  needConsent: boolean;
  way: Social | null;
}

/** /auth/callback에서 부른다. 브라우저 클라이언트가 주소의 code를 세션으로 바꾼 뒤 결과를 읽는다 */
export async function finishSocial(): Promise<SocialResult> {
  const { data, error } = await supabase().auth.getSession();
  const user = data.session?.user;
  if (error || !user) throw new Error('로그인하지 못했어요. 다시 해 주세요');
  let way: Social | null = null;
  try { way = localStorage.getItem(PENDING_KEY) as Social | null; localStorage.removeItem(PENDING_KEY); } catch { /* 없음 */ }
  const meta = user.user_metadata ?? {};
  const email = user.email || meta.email || meta.name || meta.nickname || '보호자';
  const { data: g } = await supabase().from('guardians').select('consent_at').eq('id', user.id).maybeSingle();
  const auth: LocalAuth = { email, via: way ?? String(user.app_metadata?.provider ?? 'sns'), kids: await loadKids() };
  return { auth, needConsent: !g?.consent_at, way };
}

/** 첫 SNS 로그인 동의 저장 (필수 약관 3개를 확인한 뒤에만 부른다) */
export async function giveConsent(a: LocalAuth): Promise<LocalAuth> {
  const { data } = await supabase().auth.getUser();
  const { error } = await supabase().from('guardians').update({ consent_at: new Date().toISOString() }).eq('id', data.user?.id);
  if (error) throw new Error('동의를 저장하지 못했어요. 다시 해 주세요');
  setAuth(a);
  return a;
}

/** 동의 없이 나가면 계정 연결을 끊는다 */
export async function cancelSocial() {
  await supabase().auth.signOut();
  setAuth(null);
}
