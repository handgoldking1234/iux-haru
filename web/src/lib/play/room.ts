'use client';
/* 실시간 대결방 연결 — rooms 표(방 만들기·찾기·공개 목록) + Realtime 채널 room-<코드>(참가자·채팅·진행).
   학생 id는 서로에게 보내지 않는다: 접속할 때마다 새 임시 id를 쓰고, 보이는 건 닉네임·캐릭터뿐 */
import { supabase } from '../supabase';

export interface RoomRow { code: string; host_name: string; eq: Record<string, string>; subject: string; n: number; max_n: number; dan: number; cur: number; state: string; public: boolean }
export interface RoomCfg { public: boolean; sub: string; n: number; max: number; dan: number }
type Meta = Record<string, unknown>;

export function roomRT(kidId: string) {
  const me = { id: Math.random().toString(36).slice(2, 10) };
  const sb = supabase();
  return {
    me,
    /** 방 만들기 → 6자리 코드 (겹치면 다시) */
    async create(c: RoomCfg): Promise<string> {
      for (let k = 0; k < 6; k++) {
        const code = String(100000 + Math.floor(Math.random() * 900000));
        const { error } = await sb.from('rooms').insert({ code, public: c.public, host: kidId, subject: c.sub, n: c.n, max_n: c.max, dan: c.dan, cur: 1 });
        if (!error) return code;
        if (error.code !== '23505') throw error;
      }
      throw new Error('방 코드를 만들지 못했어요');
    },
    /** 방장만: 설정·인원·상태 바꾸기 (부를 때마다 '살아 있음' 시각도 갱신) */
    update(code: string, patch: Record<string, unknown> = {}) {
      return sb.from('rooms').update({ ...patch, seen_at: new Date().toISOString() }).eq('code', code).then(() => undefined);
    },
    remove(code: string) {
      return sb.from('rooms').delete().eq('code', code).then(() => undefined);
    },
    async list(): Promise<RoomRow[]> {
      const { data } = await sb.rpc('open_rooms');
      return (data as RoomRow[]) ?? [];
    },
    async find(code: string): Promise<RoomRow | null> {
      const { data } = await sb.rpc('find_room', { c: code });
      return (data as RoomRow[])?.[0] ?? null;
    },
    /** 방 채널에 들어가기: 참가자 목록(presence)과 방송(broadcast)을 받는다 */
    join(code: string, meta: Meta, on: { presence: (list: Meta[]) => void; event: (ev: string, p: Meta) => void; ready?: () => void }) {
      const ch = sb.channel('room-' + code, { config: { presence: { key: me.id }, broadcast: { self: false } } });
      ch.on('presence', { event: 'sync' }, () => on.presence(Object.values(ch.presenceState()).map((a) => (a as unknown as Meta[])[0])));
      ch.on('broadcast', { event: 'm' }, ({ payload }) => on.event(payload.ev, payload.p));
      ch.subscribe(async (s) => { if (s === 'SUBSCRIBED') { await ch.track(meta); on.ready?.(); } });
      return {
        send: (ev: string, p: Meta = {}) => ch.send({ type: 'broadcast', event: 'm', payload: { ev, p } }),
        track: (m: Meta) => ch.track(m),
        leave: () => { try { ch.untrack(); } catch { /* 이미 끊김 */ } sb.removeChannel(ch); },
      };
    },
  };
}
export type RoomRT = ReturnType<typeof roomRT>;
