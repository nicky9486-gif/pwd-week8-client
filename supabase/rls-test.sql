-- RLS 검증. Supabase SQL Editor에서 rls.sql 실행 후 전체를 실행합니다.
-- 임시 사용자 3명(회원 A, 회원 B, 관리자)을 만들어 검사하고 마지막에 rollback하므로 데이터가 남지 않습니다.
-- 성공 시 NOTICE에 'RLS 검증 통과 (8/8)', 실패 시 실패한 단계 이름이 오류로 표시됩니다.
begin;

insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data, raw_app_meta_data)
values
  ('00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-a@test.local', '{"name":"회원A"}', '{"provider":"email"}'),
  ('00000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-b@test.local', '{"name":"회원B"}', '{"provider":"google"}'),
  ('00000000-0000-0000-0000-0000000000ad', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-admin@test.local', '{"name":"관리자"}', '{"provider":"custom:naver"}');
update public.profiles set user_type = 'admin' where id = '00000000-0000-0000-0000-0000000000ad';

create temp table rls_result (step text, ok boolean) on commit drop;
grant all on rls_result to anon, authenticated;

-- 1) 회원 A가 등록 → owner_id가 A로 채워짐
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);
insert into public.restaurants (name, category, location) values ('RLS 테스트 식당', '한식', '아주대');
insert into rls_result select '회원 A 등록, owner_id=A',
  (select owner_id from public.restaurants where name = 'RLS 테스트 식당') = '00000000-0000-0000-0000-00000000000a';

-- 2) 회원 A 본인 수정 허용
with u as (update public.restaurants set description = 'A 수정' where name = 'RLS 테스트 식당' returning 1)
insert into rls_result select '회원 A 본인 수정 허용', count(*) = 1 from u;

-- 3) 회원 B의 수정·삭제 차단 (0행)
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}', true);
with u as (update public.restaurants set description = 'B 수정' where name = 'RLS 테스트 식당' returning 1)
insert into rls_result select '회원 B 수정 차단', count(*) = 0 from u;
with d as (delete from public.restaurants where name = 'RLS 테스트 식당' returning 1)
insert into rls_result select '회원 B 삭제 차단', count(*) = 0 from d;

-- 4) 관리자 수정 허용
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000ad","role":"authenticated"}', true);
with u as (update public.restaurants set description = '관리자 수정' where name = 'RLS 테스트 식당' returning 1)
insert into rls_result select '관리자 수정 허용', count(*) = 1 from u;

-- 5) 비회원(anon) 조회 허용, 등록 차단
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
insert into rls_result select '비회원 조회 허용', count(*) = 1 from public.restaurants where name = 'RLS 테스트 식당';
do $$ begin
  insert into public.restaurants (name, category, location) values ('비회원 등록', '한식', '아주대');
  insert into rls_result values ('비회원 등록 차단', false);
exception when insufficient_privilege then
  insert into rls_result values ('비회원 등록 차단', true);
end $$;

-- 6) 관리자 삭제 허용
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000ad","role":"authenticated"}', true);
with d as (delete from public.restaurants where name = 'RLS 테스트 식당' returning 1)
insert into rls_result select '관리자 삭제 허용', count(*) = 1 from d;

reset role;
do $$ declare failed text;
begin
  select string_agg(step, ', ') into failed from rls_result where not ok;
  if failed is not null or (select count(*) from rls_result) <> 8 then
    raise exception 'RLS 검증 실패: %', coalesce(failed, '검사 수 불일치');
  end if;
  raise notice 'RLS 검증 통과 (8/8)';
end $$;
-- SQL Editor는 마지막 조회 결과만 표시하므로 검사표를 마지막에 조회합니다.
select step as "검사 항목", ok as "통과" from rls_result;
rollback;
