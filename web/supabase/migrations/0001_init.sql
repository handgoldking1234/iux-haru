-- 하루공부 초기 스키마 — docs/08_roadmap.md 'DB 초안'
-- 계정 주인은 보호자(auth.users). 자녀는 닉네임·학년만 저장한다(만 14세 미만, 법정대리인 동의).
-- 규칙 계산(진도·오답 간격·보상)은 web/src/lib/engine · rewards 한 곳에서만 한다.

-- ───────── 계정 ─────────
create table public.guardians (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  consent_at timestamptz,               -- 법정대리인 동의 일시
  created_at timestamptz not null default now()
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references public.guardians(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 12),
  grade text not null,                  -- 초1 … 고3
  avatar jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index on public.students (guardian_id);

-- 보호자 설정: 오늘 할 일 분량, 게임 1/3/5판, 밤 9시 잠금, 밀린 공부 잠금, 알림 시간
create table public.settings (
  guardian_id uuid primary key references public.guardians(id) on delete cascade,
  plan jsonb not null default '{"math":20,"hanja":10,"eng":10,"kor":10,"hist":0,"sci":0,"typ":0}'::jsonb,
  game_limit smallint not null default 3 check (game_limit in (1, 3, 5)),
  curfew boolean not null default false,
  back_gate boolean not null default true,
  alarms jsonb not null default '[{"t":"16:00","on":true,"label":"공부할 시간"},{"t":"20:00","on":true,"label":"오늘 할 일 확인"}]'::jsonb,
  sound boolean not null default true
);

-- ───────── 콘텐츠 (모두 읽기 전용, 관리자가 수정) ─────────
create table public.subjects (
  key text primary key,                 -- math·hanja·eng·kor·sci·hist·typ
  name text not null,
  color text not null
);

create table public.tracks (
  subject text not null references public.subjects(key),
  key text not null,                    -- school·grade·cjm·vc·kr·phy…
  name text not null,
  ord smallint not null,
  primary key (subject, key)
);

create table public.units (
  id text primary key,                  -- 예: hist.ko.12
  subject text not null,
  track text not null,
  ord int not null,
  kind text not null default 'unit' check (kind in ('unit', 'exam')),
  level smallint,                       -- 학교급 0·1·2 / 급수 idx
  area text not null,                   -- 틀림 상한 구분(초등·8급…)
  n int,
  title text not null,
  era text,
  sum text,
  pr jsonb,                             -- 과학 핵심 원리
  pre text,                             -- 앞 단원
  foreign key (subject, track) references public.tracks(subject, key)
);
create index on public.units (subject, track, ord);

create table public.items (
  id text primary key,
  unit_id text references public.units(id),
  type text not null check (type in ('char', 'word', 'term', 'phrase', 'mc')),
  payload jsonb not null,
  search_text text not null default ''
);
create index on public.items (unit_id);
create index items_search_idx on public.items using gin (to_tsvector('simple', search_text));

-- ───────── 학습 기록 ─────────
create table public.progress (
  student_id uuid not null references public.students(id) on delete cascade,
  subject text not null,
  track text not null,
  stage int not null default 0,
  np int not null default 0,
  streak int not null default 0,
  bp jsonb not null default '{}'::jsonb,
  wr jsonb not null default '{}'::jsonb,
  read jsonb not null default '{}'::jsonb,
  grad int not null default 0,
  all_done boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (student_id, subject, track)
);

create table public.passed_units (
  student_id uuid not null references public.students(id) on delete cascade,
  subject text not null,
  track text not null,
  stage_id text not null,
  box smallint not null default 0,
  due_unit int,                         -- np 기준 다음 복습 차례
  exam_score smallint,
  primary key (student_id, subject, track, stage_id)
);

create table public.wrong_cards (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  subject text not null,
  track text not null,
  item_id text not null,
  qtype text not null,
  stage_id text not null,
  box smallint not null default 0,
  due_day int not null,                 -- 로컬 날짜 일 번호
  wrong_count int not null default 1,
  unique (student_id, subject, track, item_id, qtype)
);
create index on public.wrong_cards (student_id, due_day);

create table public.attempts (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.students(id) on delete cascade,
  subject text not null,
  item_id text not null,
  qtype text not null,
  src text not null,                    -- card·review·new·retry·exam
  ok boolean not null,
  ms int,
  created_at timestamptz not null default now()
);
create index on public.attempts (student_id, created_at);

-- 하루 기록: 오늘 할 일·캐시·게임 횟수 (보상 규칙의 DayState)
create table public.daily (
  student_id uuid not null references public.students(id) on delete cascade,
  day int not null,
  ok int not null default 0,
  no int not null default 0,
  cash int not null default 0 check (cash between 0 and 150),
  game_cash int not null default 0 check (game_cash between 0 and 30),
  plays int not null default 0,
  bonus boolean not null default false,
  more boolean not null default false,
  by_subject jsonb not null default '{}'::jsonb,
  paid jsonb not null default '{}'::jsonb,
  plan jsonb not null,
  primary key (student_id, day)
);

-- 캐시는 현금으로 사고팔 수 없다. 결제 테이블과 연결하지 않는다.
create table public.wallet (
  student_id uuid primary key references public.students(id) on delete cascade,
  cash int not null default 30 check (cash >= 0),
  xp int not null default 0 check (xp >= 0),
  owned jsonb not null default '[]'::jsonb,
  equipped jsonb not null default '{}'::jsonb
);

create table public.wordbook_cats (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  subject text not null,
  name text not null,
  ord int not null default 0
);
create table public.wordbook_items (
  cat_id uuid not null references public.wordbook_cats(id) on delete cascade,
  item_id text not null,
  added_at timestamptz not null default now(),
  primary key (cat_id, item_id)
);

-- ───────── 대결방 (닉네임만, 정해진 문구 채팅, 코드로만 입장) ─────────
create table public.rooms (
  code char(6) primary key,
  public boolean not null default true,
  host uuid not null references public.students(id) on delete cascade,
  subject text not null,
  state text not null default 'wait' check (state in ('wait', 'play', 'end')),
  created_at timestamptz not null default now()
);
create table public.room_members (
  code char(6) not null references public.rooms(code) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  score int not null default 0,
  primary key (code, student_id)
);

-- ───────── 보안: 보호자는 자기 자녀 것만 ─────────
create or replace function public.is_my_student(sid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.students s where s.id = sid and s.guardian_id = auth.uid());
$$;

alter table public.guardians enable row level security;
alter table public.students enable row level security;
alter table public.settings enable row level security;
create policy own on public.guardians for all using (id = auth.uid()) with check (id = auth.uid());
create policy own on public.students for all using (guardian_id = auth.uid()) with check (guardian_id = auth.uid());
create policy own on public.settings for all using (guardian_id = auth.uid()) with check (guardian_id = auth.uid());

do $$
declare t text;
begin
  foreach t in array array['progress','passed_units','wrong_cards','attempts','daily','wallet','wordbook_cats'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy own on public.%I for all using (public.is_my_student(student_id)) with check (public.is_my_student(student_id))', t);
  end loop;
end $$;

alter table public.wordbook_items enable row level security;
create policy own on public.wordbook_items for all
  using (exists (select 1 from public.wordbook_cats c where c.id = cat_id and public.is_my_student(c.student_id)))
  with check (exists (select 1 from public.wordbook_cats c where c.id = cat_id and public.is_my_student(c.student_id)));

-- 콘텐츠는 로그인한 누구나 읽기만
do $$
declare t text;
begin
  foreach t in array array['subjects','tracks','units','items'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy read on public.%I for select to authenticated using (true)', t);
  end loop;
end $$;

-- 대결방: 공개 방 목록은 보이고, 비공개 방은 코드를 아는 참가자만
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
create policy read on public.rooms for select to authenticated
  using (public or exists (select 1 from public.room_members m where m.code = rooms.code and public.is_my_student(m.student_id)));
create policy host on public.rooms for insert to authenticated with check (public.is_my_student(host));
create policy members on public.room_members for all to authenticated
  using (public.is_my_student(student_id)) with check (public.is_my_student(student_id));

-- 가입하면 보호자 행과 기본 설정을 만든다
create or replace function public.on_signup() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.guardians (id, email, consent_at) values (new.id, new.email, now());
  insert into public.settings (guardian_id) values (new.id);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.on_signup();

insert into public.subjects (key, name, color) values
  ('math', '연산', '#2563EB'), ('hanja', '한자', '#C2410C'), ('eng', '영단어', '#7C3AED'),
  ('kor', '국어', '#0B8A5F'), ('sci', '과학', '#4F46E5'), ('hist', '역사', '#8B5A2B'), ('typ', '타자', '#0E7490');
