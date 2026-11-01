'use client';
/* 관리자 페이지 데이터 — Supabase Auth(이메일·비밀번호 + TOTP 2단계 인증) + 0005_admin.sql의 관리자 함수.
   관리자 함수는 서버에서 '관리자 + 2단계 인증(aal2)'을 다시 확인하므로, 여기서 막는 것은 화면 편의일 뿐이다 */
import { supabase } from '../supabase';

export type Step = { ok: true; next: 'verify' | 'enroll' | 'in'; qr?: string; secret?: string } | { ok: false; err: string };

const sb = () => supabase();

/** 1단계: 이메일·비밀번호. 관리자가 아니면 바로 막는다 */
export async function signIn(email: string, pw: string): Promise<Step> {
  const { error } = await sb().auth.signInWithPassword({ email, password: pw });
  if (error) return { ok: false, err: '이메일이나 비밀번호가 맞지 않아요.' };
  return afterPassword();
}

/** 비밀번호를 통과한 세션: 관리자인지 → 2단계 인증 등록·확인 */
export async function afterPassword(quiet = false): Promise<Step> {
  const { data: u } = await sb().auth.getUser();
  if (!u.user) return { ok: false, err: '로그인이 풀렸어요. 다시 로그인해 주세요.' };
  const { data: me } = await sb().from('admins').select('role').eq('user_id', u.user.id).maybeSingle();
  if (!me) { if (!quiet) await sb().auth.signOut(); return { ok: false, err: '관리자로 등록된 계정이 아니에요.' }; }
  const { data: aal } = await sb().auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel === 'aal2') return { ok: true, next: 'in' };
  const { data: fs } = await sb().auth.mfa.listFactors();
  const totp = fs?.totp?.find((f) => f.status === 'verified');
  if (totp) return { ok: true, next: 'verify' };
  if (quiet) return { ok: false, err: '' };
  // 처음: 인증 앱 등록 (확인 안 된 이전 등록은 지우고 새로)
  for (const f of fs?.all ?? []) if (f.status !== 'verified') await sb().auth.mfa.unenroll({ factorId: f.id });
  const { data: en, error } = await sb().auth.mfa.enroll({ factorType: 'totp', friendlyName: '하루공부 관리자' });
  if (error || !en) return { ok: false, err: '2단계 인증을 준비하지 못했어요. 잠시 뒤 다시 해 주세요.' };
  // qr_code는 따옴표가 든 SVG 원문(data:image/svg+xml;utf-8,<svg …>)이라 img src에 넣기 전에 인코딩한다
  const svg = en.totp.qr_code.slice(en.totp.qr_code.indexOf('<svg'));
  return { ok: true, next: 'enroll', qr: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg), secret: en.totp.secret };
}

/** 페이지를 열 때: 이미 관리자 2단계 인증까지 마친 세션이면 바로 들어간다 (보호자 세션은 건드리지 않음) */
export async function session(): Promise<Step> {
  const { data } = await sb().auth.getSession();
  if (!data.session) return { ok: false, err: '' };
  return afterPassword(true);
}

/** 2단계: 인증 앱 6자리 */
export async function verify(code: string): Promise<boolean> {
  const { data: fs } = await sb().auth.mfa.listFactors();
  const f = fs?.totp?.find((x) => x.status === 'verified') ?? fs?.all?.find((x) => x.factor_type === 'totp');
  if (!f) return false;
  const { data: ch, error: e1 } = await sb().auth.mfa.challenge({ factorId: f.id });
  if (e1 || !ch) return false;
  const { error } = await sb().auth.mfa.verify({ factorId: f.id, challengeId: ch.id, code });
  return !error;
}

export async function signOut() { await sb().auth.signOut(); }
export async function resetMail(email: string) {
  return sb().auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/login` });
}

async function rpc<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await sb().rpc(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}

export type Me = { name: string; role: string; last: string | null; prev: string | null; email: string };
export async function me(): Promise<Me> {
  const t = await rpc<{ name: string; role: string; last: string | null; prev: string | null }>('admin_touch');
  const { data: u } = await sb().auth.getUser();
  return { ...t, email: u.user?.email ?? '' };
}
export const daily = (n: number) => rpc<{ day: string; active: number; done: number; solved: number; correct: number; signups: number; kids: number }[]>('admin_daily', { n });
export const summary = (n: number) => rpc<Record<string, unknown>>('admin_summary', { n });
export const members = () => rpc<{ gid: string; email: string; created_at: string; status: string; consent_at: string | null; kids: { n: string; g: string }[]; last_day: string | null }[]>('admin_members');
export const member = (g: string) => rpc<Record<string, unknown>>('admin_member', { g });
export const reveal = (g: string) => rpc<string>('admin_reveal', { g });
export const cash = (s: string, delta: number, reason: string) => rpc<number>('admin_cash', { s, delta, reason });
export const setStatus = (g: string, st: string, reason: string) => rpc<void>('admin_status', { g, st, reason });
export const admins = () => rpc<{ name: string; role: string; last_login: string | null }[]>('admin_admins');
export const audit = (lim = 50) => rpc<{ at: string; admin_name: string; action: string; target: string | null }[]>('admin_audit', { lim });
