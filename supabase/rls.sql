-- 맛집 권한(RLS). 서버 저장소의 supabase/schema.sql을 먼저 실행한 뒤 이 파일을 실행합니다.
-- schema.sql을 다시 실행하면 anon/authenticated 권한이 회수되므로 이 파일도 다시 실행합니다.
-- 비회원: 조회 / 회원: 등록 + 본인 맛집 수정·삭제 / 관리자: 모든 맛집 수정·삭제
begin;

-- 등록자. 클라이언트가 값을 보낼 수 없고(insert 열 권한 없음) DB가 auth.uid()로 채웁니다.
alter table public.restaurants
  add column if not exists owner_id uuid references public.profiles(id) on delete set null default auth.uid();
create index if not exists foodmap_restaurants_owner on public.restaurants(owner_id);

-- 현재 요청자의 활성 역할('user'|'admin'), 비활성·미가입이면 null.
-- security definer: profiles는 RLS로 막혀 있으므로 정책 안에서 역할을 읽기 위해 필요합니다.
create or replace function public.foodmap_current_role() returns text
language sql stable security definer set search_path='' as $$
  select user_type from public.profiles where id = auth.uid() and is_active
$$;
revoke all on function public.foodmap_current_role() from public, anon;
grant execute on function public.foodmap_current_role() to authenticated;

-- 테이블 권한: 열 단위로 허용해 likes·owner_id·source_submission_id 조작을 막습니다.
grant usage on schema public to anon, authenticated;
grant select on public.restaurants to anon, authenticated;
grant insert (name, category, location, price_range, rating, description, recommended_menu, image)
  on public.restaurants to authenticated;
grant update (name, category, location, price_range, rating, description, recommended_menu, image)
  on public.restaurants to authenticated;
grant delete on public.restaurants to authenticated;
grant usage, select on sequence public.restaurants_id_seq to authenticated;

drop policy if exists restaurants_select_all on public.restaurants;
drop policy if exists restaurants_insert_member on public.restaurants;
drop policy if exists restaurants_update_owner_or_admin on public.restaurants;
drop policy if exists restaurants_delete_owner_or_admin on public.restaurants;

create policy restaurants_select_all on public.restaurants
  for select to anon, authenticated using (true);

create policy restaurants_insert_member on public.restaurants
  for insert to authenticated
  with check (owner_id = (select auth.uid()) and (select public.foodmap_current_role()) is not null);

create policy restaurants_update_owner_or_admin on public.restaurants
  for update to authenticated
  using (
    (select public.foodmap_current_role()) = 'admin'
    or (owner_id = (select auth.uid()) and (select public.foodmap_current_role()) is not null)
  )
  with check (
    (select public.foodmap_current_role()) = 'admin'
    or (owner_id = (select auth.uid()) and (select public.foodmap_current_role()) is not null)
  );

create policy restaurants_delete_owner_or_admin on public.restaurants
  for delete to authenticated
  using (
    (select public.foodmap_current_role()) = 'admin'
    or (owner_id = (select auth.uid()) and (select public.foodmap_current_role()) is not null)
  );

notify pgrst, 'reload schema';
commit;
