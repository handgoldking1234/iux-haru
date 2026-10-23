-- 랭킹 — 모든 학생의 순위를 닉네임·캐릭터 모양·점수만으로 돌려준다 (아동 안전: 이메일·학년·학생 id는 내보내지 않음)
--   mode: week(이번 주 맞힌 문제) · total(누적 XP) · wins(대결 1등 횟수) · typ(타자 최고 속도)
--   wk: 주 번호 (앱의 weekNumber), me: 지금 학생 id — 내 줄 표시에만 쓰고 돌려주지 않는다
create or replace function public.leaderboard(mode text, wk int, me uuid)
returns table (nickname text, eq jsonb, val int, xp int, mine boolean)
language sql stable security definer set search_path = public as $$
  select s.nickname,
         coalesce(st.data -> 'eq', '{}'::jsonb),
         case mode
           when 'week' then coalesce((st.data -> 'wk' ->> wk::text)::int, 0)
           when 'total' then coalesce((st.data ->> 'xp')::int, 0)
           when 'typ' then coalesce((st.data ->> 'typCpm')::int, 0)
           else coalesce((st.data ->> 'wins')::int, 0)
         end as val,
         coalesce((st.data ->> 'xp')::int, 0),
         s.id = me
  from public.students s
  join public.student_state st on st.student_id = s.id and st.key = 'rewards'
  order by val desc, s.created_at
  limit 50
$$;

-- 로그인한 보호자 계정만 부를 수 있다
revoke all on function public.leaderboard(text, int, uuid) from public, anon;
grant execute on function public.leaderboard(text, int, uuid) to authenticated;
