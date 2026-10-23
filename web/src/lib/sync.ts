'use client';
/**
 * 학습 기록 서버 맞추기 — 화면은 브라우저 저장소(localStorage)로 바로 반응하고, 뒤에서 Supabase student_state와 맞춘다.
 *   올리기: saveLocal()로 저장하면 0.8초 모아서 올림 (같은 이름표는 마지막 것만)
 *   내려받기: 학생을 고르고 들어올 때 pull() — 서버가 더 최근이면 브라우저 것을 바꾸고, 서버에 없는 것은 올림
 * 충돌은 '나중에 저장한 쪽'이 이긴다. Supabase 키가 없으면(로컬 모드) 저장만 한다.
 */
import { hasSupabase, supabase } from './supabase';

/** 지금 들어와 있는 학생 */
let cur: { name: string; id: string } | null = null;
export const setSyncKid = (k: { name: string; id?: string } | null) => { cur = k && k.id ? { name: k.name, id: k.id } : null; };

/** 브라우저 저장 키 → 서버 이름표 (학생 이름이 들어간 부분을 뺀다). 해당 없으면 null */
export function remoteKey(local: string, kid: string): string | null {
  if (local === `harugongbu-rewards-${kid}`) return 'rewards';
  const pp = `harugongbu-prog-${kid}-`;
  if (local.startsWith(pp)) return 'prog:' + local.slice(pp.length).replace('-', ':');
  const wb = /^hg-wb-(.+)-(.+)$/.exec(local);
  if (wb && wb[2] === kid) return `wb:${wb[1]}`;
  return null;
}
export function localKey(remote: string, kid: string): string | null {
  if (remote === 'rewards') return `harugongbu-rewards-${kid}`;
  if (remote.startsWith('prog:')) return `harugongbu-prog-${kid}-` + remote.slice(5).replace(':', '-');
  if (remote.startsWith('wb:')) return `hg-wb-${remote.slice(3)}-${kid}`;
  return null;
}

const stampKey = (local: string) => `harugongbu-sync-ts:${local}`;
const pending = new Map<string, { student: string; key: string; data: unknown; at: string }>();
let timer: ReturnType<typeof setTimeout> | null = null;
let failed = 0;

async function flush() {
  timer = null;
  if (!pending.size) return;
  const rows = [...pending.values()].map((r) => ({ student_id: r.student, key: r.key, data: r.data, updated_at: r.at }));
  pending.clear();
  const { error } = await supabase().from('student_state').upsert(rows);
  if (error) {
    // 잠시 뒤 다시 (오프라인 등) — 더 새로 저장된 것이 있으면 그것이 이긴다
    failed++;
    rows.forEach((r) => { const k = `${r.student_id}|${r.key}`; if (!pending.has(k)) pending.set(k, { student: r.student_id, key: r.key, data: r.data, at: r.updated_at }); });
    if (failed < 6) timer = setTimeout(flush, 3000 * failed);
  } else failed = 0;
}

/** 브라우저에 저장하고, 서버에도 올릴 차례에 넣는다 */
export function saveLocal(local: string, data: unknown) {
  const at = new Date().toISOString();
  try {
    localStorage.setItem(local, JSON.stringify(data));
    localStorage.setItem(stampKey(local), at);
  } catch { /* 저장이 막힌 브라우저 */ }
  if (!hasSupabase || !cur) return;
  const key = remoteKey(local, cur.name);
  if (!key) return;
  pending.set(`${cur.id}|${key}`, { student: cur.id, key, data, at });
  if (timer) clearTimeout(timer);
  timer = setTimeout(flush, 800);
}

/** 화면을 닫기 전에 남은 것을 바로 올린다 */
export function flushNow() {
  if (timer) { clearTimeout(timer); flush(); }
}
if (typeof window !== 'undefined') window.addEventListener('pagehide', flushNow);

/**
 * 학생 기록 내려받기. 서버가 더 최근이면 브라우저 것을 바꾸고, 브라우저에만 있는 기록은 올린다.
 * 바뀐 것이 있으면 true.
 */
export async function pull(kid: { name: string; id: string }): Promise<boolean> {
  if (!hasSupabase) return false;
  const { data, error } = await supabase().from('student_state').select('key, data, updated_at').eq('student_id', kid.id);
  if (error) throw error;
  let changed = false;
  const seen = new Set<string>();
  for (const r of data ?? []) {
    const local = localKey(r.key, kid.name);
    if (!local) continue;
    seen.add(local);
    let mine: string | null = null;
    try { mine = localStorage.getItem(stampKey(local)); } catch { /* 무시 */ }
    if (!mine || new Date(r.updated_at) > new Date(mine)) {
      try {
        localStorage.setItem(local, JSON.stringify(r.data));
        localStorage.setItem(stampKey(local), r.updated_at);
      } catch { /* 무시 */ }
      changed = true;
    } else if (new Date(mine) > new Date(r.updated_at)) {
      // 이 기기가 더 최근 — 올린다
      try { pending.set(`${kid.id}|${r.key}`, { student: kid.id, key: r.key, data: JSON.parse(localStorage.getItem(local) || 'null'), at: mine }); } catch { /* 무시 */ }
    }
  }
  // 이 기기에만 있는 기록 (Supabase 연결 전에 쌓인 것 포함) → 올린다
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const local = localStorage.key(i)!;
      if (seen.has(local)) continue;
      const key = remoteKey(local, kid.name);
      if (!key) continue;
      const at = localStorage.getItem(stampKey(local)) || new Date().toISOString();
      pending.set(`${kid.id}|${key}`, { student: kid.id, key, data: JSON.parse(localStorage.getItem(local) || 'null'), at });
    }
  } catch { /* 무시 */ }
  if (pending.size) { if (timer) clearTimeout(timer); timer = setTimeout(flush, 300); }
  return changed;
}
