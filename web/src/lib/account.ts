'use client';
/**
 * 보호자 계정 — 로그인·가입·학생 추가·로그아웃 (프로토타입 shell.html 로그인 흐름과 같은 규칙).
 * 화면은 늘 브라우저의 LocalAuth를 읽고, Supabase가 있으면 서버 결과로 그것을 채운다.
 */
import { hasSupabase, supabase } from './supabase';
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
