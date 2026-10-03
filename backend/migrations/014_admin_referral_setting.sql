-- DzCoinEren admin referral reward setting

create or replace function public.get_admin_settings(p_admin_auth_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
begin
  if not exists (
    select 1 from public.admin_users
    where auth_user_id=p_admin_auth_user_id and is_active=true
  ) then
    raise exception 'Admin authorization required';
  end if;

  return jsonb_build_object(
    'withdrawal_min_points',coalesce((select (value->>'value')::numeric from public.app_settings where key='withdrawal_min_points'),10000),
    'points_per_usd',coalesce((select (value->>'value')::numeric from public.app_settings where key='points_per_usd'),1000),
    'usd_to_dzd',coalesce((select (value->>'value')::numeric from public.app_settings where key='usd_to_dzd'),130),
    'tap_limit_per_minute',coalesce((select (value->>'value')::numeric from public.app_settings where key='tap_limit_per_minute'),60),
    'daily_ad_limit',coalesce((select (value->>'value')::numeric from public.app_settings where key='daily_ad_limit'),10),
    'ad_reward_points',coalesce((select (value->>'value')::numeric from public.app_settings where key='ad_reward_points'),100),
    'referral_reward_points',coalesce((select (value->>'value')::numeric from public.app_settings where key='referral_reward_points'),50)
  );
end;
$$;

create or replace function public.admin_save_settings(
  p_admin_auth_user_id uuid,
  p_withdrawal_min_points bigint,
  p_points_per_usd numeric,
  p_usd_to_dzd numeric,
  p_tap_limit_per_minute integer,
  p_daily_ad_limit integer,
  p_ad_reward_points bigint,
  p_referral_reward_points bigint
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
begin
  if not exists (
    select 1 from public.admin_users
    where auth_user_id=p_admin_auth_user_id and is_active=true
  ) then
    raise exception 'Admin authorization required';
  end if;

  if p_withdrawal_min_points < 1
     or p_points_per_usd <= 0
     or p_usd_to_dzd <= 0
     or p_tap_limit_per_minute < 1
     or p_daily_ad_limit < 0
     or p_ad_reward_points < 0
     or p_referral_reward_points < 0 then
    raise exception 'Invalid settings values';
  end if;

  insert into public.app_settings(key,value,updated_at) values
    ('withdrawal_min_points',jsonb_build_object('value',p_withdrawal_min_points),now()),
    ('points_per_usd',jsonb_build_object('value',p_points_per_usd),now()),
    ('usd_to_dzd',jsonb_build_object('value',p_usd_to_dzd),now()),
    ('tap_limit_per_minute',jsonb_build_object('value',p_tap_limit_per_minute),now()),
    ('daily_ad_limit',jsonb_build_object('value',p_daily_ad_limit),now()),
    ('ad_reward_points',jsonb_build_object('value',p_ad_reward_points),now()),
    ('referral_reward_points',jsonb_build_object('value',p_referral_reward_points),now())
  on conflict(key) do update
    set value=excluded.value, updated_at=now();

  return jsonb_build_object('success',true);
end;
$$;

revoke all on function public.admin_save_settings(uuid,bigint,numeric,numeric,integer,integer,bigint) from public,anon,authenticated;
revoke all on function public.admin_save_settings(uuid,bigint,numeric,numeric,integer,integer,bigint,bigint) from public,anon,authenticated;
grant execute on function public.get_admin_settings(uuid) to authenticated;
grant execute on function public.admin_save_settings(uuid,bigint,numeric,numeric,integer,integer,bigint,bigint) to authenticated;
