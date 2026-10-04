-- CoinGameDz daily login reward
-- Uses the authenticated Supabase identity; no client-supplied user id is trusted.

create or replace function public.claim_daily_login()
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_user public.users%rowtype;
  v_points_per_usd numeric;
  v_reward bigint := 50;
  v_new_balance bigint;
  v_today date := (now() at time zone 'UTC')::date;
begin
  select * into v_user
  from public.users
  where auth_user_id = auth.uid()
    and is_active = true
  for update;

  if v_user.id is null then
    raise exception 'User profile not found';
  end if;

  if exists (
    select 1
    from public.point_transactions
    where user_id = v_user.id
      and source = 'daily_checkin'
      and (created_at at time zone 'UTC')::date = v_today
  ) then
    raise exception 'Daily bonus already claimed';
  end if;

  select coalesce((value->>'value')::numeric, 1000)
  into v_points_per_usd
  from public.app_settings
  where key = 'points_per_usd';

  v_points_per_usd := coalesce(nullif(v_points_per_usd, 0), 1000);
  v_new_balance := coalesce(v_user.points_balance, 0) + v_reward;

  insert into public.point_transactions(
    user_id, amount, type, description, source, metadata
  )
  values(
    v_user.id,
    v_reward,
    'bonus',
    'Daily check-in',
    'daily_checkin',
    jsonb_build_object('server_verified', true)
  );

  update public.users
  set points_balance = v_new_balance,
      usd_equivalent = v_new_balance / v_points_per_usd
  where id = v_user.id;

  return jsonb_build_object(
    'success', true,
    'points_awarded', v_reward,
    'points_balance', v_new_balance,
    'usd_equivalent', v_new_balance / v_points_per_usd
  );
end;
$$;

revoke all on function public.claim_daily_login() from public, anon;
grant execute on function public.claim_daily_login() to authenticated;
