-- USD remains the base currency. The admin controls only the USD -> DZD market reference.
-- USDT is treated as the USD-equivalent payout (1 USD ~= 1 USDT).

create or replace function public.admin_save_settings(
  p_admin_auth_user_id uuid,
  p_withdrawal_min_points bigint,
  p_points_per_usd numeric,
  p_usd_to_dzd numeric,
  p_tap_limit_per_minute integer,
  p_daily_ad_limit integer,
  p_ad_reward_points bigint
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
     or p_ad_reward_points < 0 then
    raise exception 'Invalid settings values';
  end if;

  insert into public.app_settings(key,value,updated_at) values
    ('withdrawal_min_points',jsonb_build_object('value',p_withdrawal_min_points),now()),
    ('points_per_usd',jsonb_build_object('value',p_points_per_usd),now()),
    ('usd_to_dzd',jsonb_build_object('value',p_usd_to_dzd),now()),
    ('tap_limit_per_minute',jsonb_build_object('value',p_tap_limit_per_minute),now()),
    ('daily_ad_limit',jsonb_build_object('value',p_daily_ad_limit),now()),
    ('ad_reward_points',jsonb_build_object('value',p_ad_reward_points),now())
  on conflict(key) do update
    set value=excluded.value, updated_at=now();

  return jsonb_build_object('success',true);
end;
$$;

create or replace function public.get_public_withdrawal_config()
returns jsonb
language sql
security definer
set search_path=public
as $$
select jsonb_build_object(
  'minimum_points',coalesce((select (value->>'value')::numeric from public.app_settings where key='withdrawal_min_points'),10000),
  'points_per_usd',coalesce((select (value->>'value')::numeric from public.app_settings where key='points_per_usd'),1000),
  'usd_to_dzd',coalesce((select (value->>'value')::numeric from public.app_settings where key='usd_to_dzd'),130),
  'usd_to_usdt',1
);
$$;

create or replace function public.create_withdrawal_secure(
  p_auth_user_id uuid,
  p_method text,
  p_destination text
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_user public.users%rowtype;
  v_min numeric;
  v_rate numeric;
  v_dzd_rate numeric;
  v_points bigint;
  v_usd numeric;
  v_dzd numeric;
  v_usdt numeric;
  v_id uuid;
begin
  if p_method not in ('BaridiMob','USDT TON') then
    raise exception 'Invalid withdrawal method';
  end if;

  if length(trim(coalesce(p_destination,''))) < 4 then
    raise exception 'Destination is required';
  end if;

  select * into v_user
  from public.users
  where auth_user_id=p_auth_user_id
  for update;

  if v_user.id is null then raise exception 'User not found'; end if;

  select coalesce((value->>'value')::numeric,10000) into v_min from public.app_settings where key='withdrawal_min_points';
  select coalesce((value->>'value')::numeric,1000) into v_rate from public.app_settings where key='points_per_usd';
  select coalesce((value->>'value')::numeric,130) into v_dzd_rate from public.app_settings where key='usd_to_dzd';

  v_min:=coalesce(v_min,10000);
  v_rate:=coalesce(nullif(v_rate,0),1000);
  v_dzd_rate:=coalesce(nullif(v_dzd_rate,0),130);

  v_points:=coalesce(v_user.points_balance,0);
  if v_points < v_min then raise exception 'Minimum withdrawal not reached'; end if;
  if exists(select 1 from public.withdrawal_requests where user_id=v_user.id and status='pending') then
    raise exception 'A withdrawal is already pending';
  end if;

  v_usd:=v_points/v_rate;
  v_dzd:=v_usd*v_dzd_rate;
  v_usdt:=v_usd;

  insert into public.withdrawal_requests(
    user_id,method,destination,amount_points,amount_usd,amount_dzd,amount_usdt,status
  )
  values(
    v_user.id,p_method,trim(p_destination),v_points,v_usd,v_dzd,v_usdt,'pending'
  )
  returning id into v_id;

  update public.users set points_balance=0,usd_equivalent=0 where id=v_user.id;

  return jsonb_build_object(
    'success',true,'id',v_id,'amount_points',v_points,
    'amount_usd',v_usd,'amount_dzd',v_dzd,'amount_usdt',v_usdt
  );
end;
$$;

revoke all on function public.admin_save_settings(uuid,bigint,numeric,numeric,integer,integer,bigint) from public,anon,authenticated;
revoke all on function public.admin_save_settings(uuid,bigint,numeric,integer,integer,bigint) from public,anon,authenticated;
revoke all on function public.get_public_withdrawal_config() from public;
grant execute on function public.get_public_withdrawal_config() to anon,authenticated;
revoke all on function public.create_withdrawal_secure(uuid,text,text) from public,anon,authenticated;
