-- 실시간 대결방 — 방 설정 칸 추가, 방장 수정·삭제, 방 찾기·공개 방 목록 함수
--   아동 안전: 밖으로 내보내는 건 방 코드·방장 닉네임·캐릭터 모양·과목·인원뿐 (학생 id·이메일·학년은 안 보냄)
--   참가자·채팅·진행은 DB에 쌓지 않고 Supabase Realtime 채널(room-<코드>)로만 주고받는다
alter table public.rooms add column if not exists n smallint not null default 10;
alter table public.rooms add column if not exists max_n smallint not null default 4;
alter table public.rooms add column if not exists dan smallint not null default 0;
alter table public.rooms add column if not exists cur smallint not null default 1;
alter table public.rooms add column if not exists seen_at timestamptz not null default now();

drop policy if exists host_upd on public.rooms;
create policy host_upd on public.rooms for update to authenticated
  using (public.is_my_student(host)) with check (public.is_my_student(host));
drop policy if exists host_del on public.rooms;
create policy host_del on public.rooms for delete to authenticated using (public.is_my_student(host));

-- 공개 방 목록: 기다리는 중이고 방장이 2분 안에 신호를 보낸 방만
create or replace function public.open_rooms()
returns table (code text, host_name text, eq jsonb, subject text, n int, max_n int, dan int, cur int, state text, public boolean)
language sql stable security definer set search_path = public as $$
  select r.code::text, s.nickname, coalesce(st.data -> 'eq', '{}'::jsonb), r.subject, r.n, r.max_n, r.dan, r.cur, r.state, r.public
  from public.rooms r
  join public.students s on s.id = r.host
  left join public.student_state st on st.student_id = r.host and st.key = 'rewards'
  where r.public and r.state = 'wait' and r.seen_at > now() - interval '2 minutes'
  order by r.created_at desc
  limit 20
$$;

-- 코드로 방 찾기 (비공개 방도 코드를 알면 찾을 수 있다)
create or replace function public.find_room(c text)
returns table (code text, host_name text, eq jsonb, subject text, n int, max_n int, dan int, cur int, state text, public boolean)
language sql stable security definer set search_path = public as $$
  select r.code::text, s.nickname, coalesce(st.data -> 'eq', '{}'::jsonb), r.subject, r.n, r.max_n, r.dan, r.cur, r.state, r.public
  from public.rooms r
  join public.students s on s.id = r.host
  left join public.student_state st on st.student_id = r.host and st.key = 'rewards'
  where r.code = c and r.seen_at > now() - interval '2 minutes'
$$;

revoke all on function public.open_rooms() from public, anon;
revoke all on function public.find_room(text) from public, anon;
grant execute on function public.open_rooms() to authenticated;
grant execute on function public.find_room(text) to authenticated;
