-- 이메일 하나에 계정 하나: 카카오로 가입한 이메일로 네이버·Google·이메일 가입을 또 하면 막는다.
-- Supabase는 공급자가 '인증된 이메일'을 줄 때만 같은 계정에 자동으로 묶고, 아니면 새 계정을 만든다.
-- 새 계정이 만들어지는 순간(트리거)에 같은 이메일의 다른 계정이 있으면 가입을 취소한다.
-- 앱(/auth/callback)은 이 오류를 "이미 다른 방법으로 가입한 이메일이에요"로 보여 준다.
-- auth.users.email에는 이미 고유 규칙이 있지만, 공급자가 '인증 안 된 이메일'을 주면 Supabase는 email 칸을 비우고
-- 회원 정보(raw_user_meta_data.email)에만 넣는다. 그래서 두 곳을 모두 비교한다.
-- 이메일을 주지 않는 공급자(빈 이메일)는 비교하지 않는다.
create or replace function public.on_signup() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  via text := coalesce(new.raw_app_meta_data->>'provider', 'email');
  mail text := lower(nullif(coalesce(nullif(new.email, ''), new.raw_user_meta_data->>'email'), ''));
begin
  if mail is not null and exists (
    select 1 from auth.users u
    where u.id <> new.id
      and mail in (lower(nullif(u.email, '')), lower(nullif(u.raw_user_meta_data->>'email', '')))
  ) then
    raise exception 'EMAIL_ALREADY_REGISTERED' using errcode = 'unique_violation';
  end if;
  insert into public.guardians (id, email, consent_at)
  values (new.id, coalesce(mail, ''), case when via = 'email' then now() else null end);
  insert into public.settings (guardian_id) values (new.id);
  return new;
end $$;
