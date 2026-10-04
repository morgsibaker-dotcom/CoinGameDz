-- CoinGameDz authenticated read helpers
-- Keep browser reads behind auth.uid() because public users.id is not auth.uid().

create or replace function public.get_my_profile()
returns public.users
language sql
security definer
stable
set search_path=public
as $$
  select u.*
  from public.users u
  where u.auth_user_id = auth.uid()
    and u.is_active = true
  limit 1;
$$;

create or replace function public.get_my_transactions(p_limit integer default 100)
returns setof public.point_transactions
language sql
security definer
stable
set search_path=public
as $$
  select pt.*
  from public.point_transactions pt
  join public.users u on u.id = pt.user_id
  where u.auth_user_id = auth.uid()
    and u.is_active = true
  order by pt.created_at desc
  limit greatest(1, least(coalesce(p_limit, 100), 100));
$$;

create or replace function public.get_public_wheel_prizes()
returns setof public.wheel_prizes
language sql
security definer
stable
set search_path=public
as $$
  select *
  from public.wheel_prizes
  where is_active = true
    and probability > 0
  order by created_at asc, id asc;
$$;

revoke all on function public.get_my_profile() from public, anon;
grant execute on function public.get_my_profile() to authenticated;

revoke all on function public.get_my_transactions(integer) from public, anon;
grant execute on function public.get_my_transactions(integer) to authenticated;

revoke all on function public.get_public_wheel_prizes() from public;
grant execute on function public.get_public_wheel_prizes() to anon, authenticated;
