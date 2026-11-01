-- 관리자 페이지 1차 (docs/09_admin.md) — 관리자 계정·역할, 감사 로그, 회원 상태, 대시보드·회원 조회 함수
--   관리자 함수는 모두 security definer이고, 첫 줄에서 '관리자 + 2단계 인증을 마친 세션(aal2)'인지 확인한다.
--   학생은 닉네임·학년만, 보호자 이메일은 가려서 내보낸다. 이메일 보기·캐시 보정·상태 변경은 감사 로그에 남긴다.

-- ───────── 관리자 · 감사 로그 · 회원 상태 ─────────
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null default 'ops' check (role in ('super', 'ops', 'content', 'cs')),
  created_at timestamptz not null default now(),
  last_login timestamptz,
  prev_login timestamptz
);
create table if not exists public.audit_log (
  id bigserial primary key,
  admin_id uuid references auth.users(id) on delete set null,
  admin_name text,
  action text not null,
  target text,
  detail jsonb,
  created_at timestamptz not null default now()
);
alter table public.guardians add column if not exists status text not null default 'active'
  check (status in ('active', 'suspended', 'withdrawn'));

alter table public.admins enable row level security;
alter table public.audit_log enable row level security;
-- 로그인할 때 내 관리자 행만 읽을 수 있다 (나머지는 함수로만)
drop policy if exists me on public.admins;
create policy me on public.admins for select to authenticated using (user_id = auth.uid());

-- 관리자인가 (2단계 인증을 마친 세션만)
create or replace function public.admin_role() returns text
language sql stable security definer set search_path = public as $$
  select a.role from public.admins a
  where a.user_id = auth.uid() and coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
$$;
create or replace function public.admin_need(roles text[]) returns text
language plpgsql stable security definer set search_path = public as $$
declare r text := public.admin_role();
begin
  if r is null then raise exception '관리자만 쓸 수 있어요'; end if;
  if roles is not null and not (r = any(roles)) then raise exception '권한이 없어요'; end if;
  return r;
end $$;
create or replace function public.admin_log(act text, tgt text, det jsonb default null) returns void
language sql security definer set search_path = public as $$
  insert into public.audit_log (admin_id, admin_name, action, target, detail)
  select auth.uid(), (select name from public.admins where user_id = auth.uid()), act, tgt, det
$$;

-- 로그인 기록 (이번·지난 로그인)
create or replace function public.admin_touch() returns jsonb
language plpgsql security definer set search_path = public as $$
declare a public.admins;
begin
  perform public.admin_need(null);
  update public.admins set prev_login = last_login, last_login = now() where user_id = auth.uid() returning * into a;
  perform public.admin_log('로그인', null, null);
  return jsonb_build_object('name', a.name, 'role', a.role, 'last', a.last_login, 'prev', a.prev_login);
end $$;

-- ───────── 학습 기록 → 학생별·날짜별 (rewards.hist 전체 + 오늘 rewards.day) ─────────
--   날짜 번호 d = 1970-01-01부터 센 날(한국 시간), 앱의 dayNumber와 같다
create or replace function public.adm_today() returns int
language sql stable as $$ select ((now() at time zone 'Asia/Seoul')::date - date '1970-01-01') $$;
create or replace function public.adm_act()
returns table (sid uuid, d int, ok int, no int, done boolean)
language sql stable security definer set search_path = public as $$
  select st.student_id, h.key::int, coalesce((h.value ->> 'ok')::int, 0), coalesce((h.value ->> 'no')::int, 0), coalesce((h.value ->> 'done')::boolean, false)
  from public.student_state st, jsonb_each(coalesce(st.data -> 'hist', '{}'::jsonb)) h
  where st.key = 'rewards' and h.key ~ '^\d+$'
  union all
  select st.student_id, (st.data -> 'day' ->> 'd')::int, coalesce((st.data -> 'day' ->> 'ok')::int, 0), coalesce((st.data -> 'day' ->> 'no')::int, 0), coalesce((st.data -> 'day' ->> 'bonus')::boolean, false)
  from public.student_state st
  where st.key = 'rewards' and jsonb_typeof(st.data -> 'day') = 'object'
$$;

-- 날짜별 추이: 활성 학생(문제 1개 이상), 오늘 할 일 완료, 푼 문제·맞힌 문제, 신규 보호자·자녀
create or replace function public.admin_daily(n int default 90)
returns table (day date, active int, done int, solved int, correct int, signups int, kids int)
language plpgsql stable security definer set search_path = public as $$
declare t int := public.adm_today();
begin
  perform public.admin_need(null);
  return query
  with a as (select * from public.adm_act() where ok + no > 0)
  select date '1970-01-01' + g.d,
    (select count(distinct a.sid) from a where a.d = g.d)::int,
    (select count(distinct a.sid) from a where a.d = g.d and a.done)::int,
    (select coalesce(sum(a.ok + a.no), 0) from a where a.d = g.d)::int,
    (select coalesce(sum(a.ok), 0) from a where a.d = g.d)::int,
    (select count(*) from public.guardians gu where (gu.created_at at time zone 'Asia/Seoul')::date = date '1970-01-01' + g.d)::int,
    (select count(*) from public.students s where (s.created_at at time zone 'Asia/Seoul')::date = date '1970-01-01' + g.d)::int
  from generate_series(t - greatest(1, least(n, 365)) + 1, t) as g(d);
end $$;

-- 요약: 재방문(D1·D7)·가입 주차 코호트, 7일 연속 학습, 과목별 맞힌 수, 학년별 활성, 전체 수
create or replace function public.admin_summary(n int default 7) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare t int := public.adm_today(); r jsonb;
begin
  perform public.admin_need(null);
  with a as (select * from public.adm_act() where ok + no > 0),
  f as (select sid, min(d) f from a group by sid),
  ret as (
    select
      (select avg(case when exists (select 1 from a where a.sid = f.sid and a.d = f.f + 1) then 1.0 else 0 end) from f where f.f <= t - 1) d1,
      (select avg(case when exists (select 1 from a where a.sid = f.sid and a.d = f.f + 7) then 1.0 else 0 end) from f where f.f <= t - 7) d7
  ),
  coh as (
    select (f.f - ((f.f + 3) % 7)) wk, count(*) cnt,
      avg(case when exists (select 1 from a where a.sid = f.sid and a.d = f.f + 1) then 1.0 else 0 end) filter (where f.f <= t - 1) d1,
      avg(case when exists (select 1 from a where a.sid = f.sid and a.d = f.f + 7) then 1.0 else 0 end) filter (where f.f <= t - 7) d7,
      avg(case when exists (select 1 from a where a.sid = f.sid and a.d = f.f + 14) then 1.0 else 0 end) filter (where f.f <= t - 14) d14,
      avg(case when exists (select 1 from a where a.sid = f.sid and a.d = f.f + 30) then 1.0 else 0 end) filter (where f.f <= t - 30) d30
    from f where f.f > t - 56 group by 1 order by 1
  ),
  sub as (
    select k, sum(v::int) v from (
      select l.key::int d, b.key k, b.value v from public.student_state st, jsonb_each(coalesce(st.data -> 'log', '{}'::jsonb)) l, jsonb_each_text(coalesce(l.value -> 'by', '{}'::jsonb)) b
      where st.key = 'rewards' and l.key ~ '^\d+$'
      union all
      select (st.data -> 'day' ->> 'd')::int, b.key, b.value from public.student_state st, jsonb_each_text(coalesce(st.data -> 'day' -> 'by', '{}'::jsonb)) b
      where st.key = 'rewards' and jsonb_typeof(st.data -> 'day') = 'object'
    ) x where d > t - n and v ~ '^\d+$' group by k
  ),
  gr as (select s.grade, count(distinct a.sid) v from a join public.students s on s.id = a.sid where a.d > t - n group by s.grade)
  select jsonb_build_object(
    'd1', (select d1 from ret), 'd7', (select d7 from ret),
    'cohort', coalesce((select jsonb_agg(jsonb_build_object('w', date '1970-01-01' + wk, 'n', cnt, 'd1', d1, 'd7', d7, 'd14', d14, 'd30', d30)) from coh), '[]'::jsonb),
    'streak7', (select count(*) from (select sid from a where a.d > t - 7 group by sid having count(distinct a.d) = 7) s7),
    'mau', (select count(distinct sid) from a where a.d > t - 30),
    'subjects', coalesce((select jsonb_object_agg(k, v) from sub), '{}'::jsonb),
    'grades', coalesce((select jsonb_object_agg(grade, v) from gr), '{}'::jsonb),
    'guardians', (select count(*) from public.guardians),
    'students', (select count(*) from public.students)
  ) into r;
  return r;
end $$;

-- ───────── 회원 ─────────
create or replace function public.adm_mask(e text) returns text
language sql immutable as $$ select left(split_part(e, '@', 1), 2) || '***@' || split_part(e, '@', 2) $$;

create or replace function public.admin_members()
returns table (gid uuid, email text, created_at timestamptz, status text, consent_at timestamptz, kids jsonb, last_day date)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.admin_need(null);
  return query
  with a as (select sid, max(d) d from public.adm_act() where ok + no > 0 group by sid)
  select g.id, public.adm_mask(g.email), g.created_at, g.status, g.consent_at,
    coalesce((select jsonb_agg(jsonb_build_object('n', s.nickname, 'g', s.grade) order by s.created_at) from public.students s where s.guardian_id = g.id), '[]'::jsonb),
    (select date '1970-01-01' + max(a.d) from a join public.students s on s.id = a.sid where s.guardian_id = g.id)
  from public.guardians g order by g.created_at desc limit 500;
end $$;

create or replace function public.admin_member(g uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare t int := public.adm_today(); r jsonb;
begin
  perform public.admin_need(null);
  select jsonb_build_object(
    'gid', gu.id, 'email', public.adm_mask(gu.email), 'created_at', gu.created_at, 'consent_at', gu.consent_at, 'status', gu.status,
    'kids', coalesce((select jsonb_agg(jsonb_build_object(
        'sid', s.id, 'n', s.nickname, 'g', s.grade,
        'cash', coalesce((st.data ->> 'cash')::int, 0), 'xp', coalesce((st.data ->> 'xp')::int, 0),
        'plan', st.data -> 'plan',
        'wk', st.data -> 'wkBy',
        'days', (select coalesce(jsonb_agg(coalesce(x.v, 0) order by x.d), '[]'::jsonb) from (
            select g2.d, (select sum(a.ok + a.no) from public.adm_act() a where a.sid = s.id and a.d = g2.d) v from generate_series(t - 29, t) g2(d)) x)
      ) order by s.created_at)
      from public.students s left join public.student_state st on st.student_id = s.id and st.key = 'rewards'
      where s.guardian_id = gu.id), '[]'::jsonb)
  ) into r from public.guardians gu where gu.id = g;
  perform public.admin_log('회원 상세 조회', left(g::text, 8), null);
  return r;
end $$;

-- 이메일 보기 (최고 관리자 · 고객지원) — 열람 기록
create or replace function public.admin_reveal(g uuid) returns text
language plpgsql security definer set search_path = public as $$
declare e text;
begin
  perform public.admin_need(array['super', 'cs']);
  select email into e from public.guardians where id = g;
  perform public.admin_log('이메일 보기', left(g::text, 8), null);
  return e;
end $$;

-- 캐시 보정 (최고 관리자 · 운영) — 사유 필수
create or replace function public.admin_cash(s uuid, delta int, reason text) returns int
language plpgsql security definer set search_path = public as $$
declare c int;
begin
  perform public.admin_need(array['super', 'ops']);
  if coalesce(trim(reason), '') = '' then raise exception '사유를 적어 주세요'; end if;
  update public.student_state set data = jsonb_set(data, '{cash}', to_jsonb(greatest(0, coalesce((data ->> 'cash')::int, 0) + delta))), updated_at = now()
  where student_id = s and key = 'rewards' returning (data ->> 'cash')::int into c;
  if c is null then raise exception '학습 기록이 없는 학생이에요'; end if;
  perform public.admin_log('캐시 보정 ' || case when delta >= 0 then '+' else '' end || delta, (select nickname from public.students where id = s), jsonb_build_object('reason', reason));
  return c;
end $$;

-- 계정 정지·해제·탈퇴 처리 (정지 = 최고·운영, 탈퇴 = 최고) — 사유 필수
create or replace function public.admin_status(g uuid, st text, reason text) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public.admin_need(case when st = 'withdrawn' then array['super'] else array['super', 'ops'] end);
  if coalesce(trim(reason), '') = '' then raise exception '사유를 적어 주세요'; end if;
  update public.guardians set status = st where id = g;
  perform public.admin_log(case st when 'suspended' then '계정 정지' when 'withdrawn' then '탈퇴 처리' else '정지 해제' end, left(g::text, 8), jsonb_build_object('reason', reason));
end $$;

-- ───────── 관리자 · 감사 로그 보기 ─────────
create or replace function public.admin_admins()
returns table (name text, role text, last_login timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.admin_need(null);
  return query select a.name, a.role, a.last_login from public.admins a order by a.created_at;
end $$;
create or replace function public.admin_audit(lim int default 50)
returns table (at timestamptz, admin_name text, action text, target text)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.admin_need(null);
  return query select l.created_at, l.admin_name, l.action, l.target from public.audit_log l order by l.id desc limit least(lim, 500);
end $$;

-- 관리자 함수는 로그인한 사용자만 부를 수 있다 (안에서 관리자·2단계 인증을 다시 확인)
do $$
declare f text;
begin
  foreach f in array array['admin_role()', 'admin_touch()', 'admin_daily(int)', 'admin_summary(int)', 'admin_members()', 'admin_member(uuid)',
    'admin_reveal(uuid)', 'admin_cash(uuid,int,text)', 'admin_status(uuid,text,text)', 'admin_admins()', 'admin_audit(int)'] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
  foreach f in array array['adm_act()', 'admin_need(text[])', 'admin_log(text,text,jsonb)'] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
  end loop;
end $$;

-- 첫 관리자 등록 (한 번만, 이메일을 바꿔서 실행):
--   insert into public.admins (user_id, name, role) select id, 'GOLDKING', 'super' from auth.users where email = '관리자 이메일';
