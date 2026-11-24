-- SNS 로그인(Google·카카오·네이버) 대응
-- 1) 이메일을 주지 않는 공급자(카카오·네이버 선택 동의)도 가입이 실패하지 않게 빈 문자열로 받는다.
-- 2) 이메일 가입은 가입 화면에서 필수 약관·법정대리인 동의를 받은 뒤에만 계정이 만들어지므로 바로 동의 일시를 남긴다.
--    SNS 가입은 아직 동의 전이므로 consent_at을 비워 두고, 앱의 동의 단계에서 채운다(본인 행만 수정 가능한 기존 RLS 사용).
create or replace function public.on_signup() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  via text := coalesce(new.raw_app_meta_data->>'provider', 'email');
begin
  insert into public.guardians (id, email, consent_at)
  values (new.id, coalesce(new.email, ''), case when via = 'email' then now() else null end);
  insert into public.settings (guardian_id) values (new.id);
  return new;
end $$;
