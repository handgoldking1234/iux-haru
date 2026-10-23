-- 학생별 학습 기록 — 앱이 쓰는 기록(과목 진도·오답·복습, 캐시·XP·꾸미기·오늘 할 일, 단어장)을 이름표(key)별 JSON으로 그대로 저장한다.
-- 기기마다 같은 기록을 이어 쓰기 위한 것. 보호자 리포트·랭킹용으로는 0001의 표(progress·attempts·daily…)를 따로 채운다.
--   key 예: rewards · prog:hist:ko · prog:hanja:school · prog:math:v7 · prog:typ:v1 · wb:역사하루
create table public.student_state (
  student_id uuid not null references public.students(id) on delete cascade,
  key text not null check (char_length(key) between 1 and 80),
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (student_id, key)
);

-- 보호자는 자기 자녀 기록만
alter table public.student_state enable row level security;
create policy own on public.student_state for all
  using (public.is_my_student(student_id)) with check (public.is_my_student(student_id));
