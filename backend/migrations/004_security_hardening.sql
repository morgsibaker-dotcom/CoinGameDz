-- DzCoinEren security hardening
alter table public.admin_users add column if not exists username text;
alter table public.admin_users add column if not exists is_active boolean not null default true;

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
  v_min bigint;
  v_rate numeric;
  v_points bigint;
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

  select coalesce((value->>'value')::bigint,10000) into v_min
  from public.app_settings where key='withdrawal_min_points';
  v_min := coalesce(v_min,10000);

  select coalesce((value->>'value')::numeric,1000) into v_rate
  from public.app_settings where key='points_per_usd';
  v_rate := nullif(v_rate,0);
  if v_rate is null then v_rate := 1000; end if;

  v_points := coalesce(v_user.points_balance,0);
  if v_points < v_min then raise exception 'Minimum withdrawal not reached'; end if;

  if exists(select 1 from public.withdrawal_requests where user_id=v_user.id and status='pending') then
    raise exception 'A withdrawal is already pending';
  end if;

  insert into public.withdrawal_requests(user_id,method,destination,amount_points,amount_usd,status)
  values(v_user.id,p_method,trim(p_destination),v_points,v_points/v_rate,'pending')
  returning id into v_id;

  update public.users
  set points_balance=0, usd_equivalent=0
  where id=v_user.id;

  return jsonb_build_object('success',true,'id',v_id,'amount_points',v_points);
end;
$$;

create or replace function public.admin_set_withdrawal_status(
  p_admin_auth_user_id uuid,
  p_withdrawal_id uuid,
  p_status text,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_w public.withdrawal_requests%rowtype;
  v_rate numeric;
begin
  if not exists(select 1 from public.admin_users where auth_user_id=p_admin_auth_user_id and is_active=true) then
    raise exception 'Admin authorization required';
  end if;

  select * into v_w from public.withdrawal_requests where id=p_withdrawal_id for update;
  if v_w.id is null then raise exception 'Withdrawal not found'; end if;

  if p_status not in ('approved','rejected','paid') then raise exception 'Invalid status'; end if;
  if v_w.status='rejected' or v_w.status='paid' then raise exception 'Withdrawal is already finalized'; end if;
  if p_status='paid' and v_w.status<>'approved' then raise exception 'Withdrawal must be approved first'; end if;

  if p_status='rejected' and v_w.status='pending' then
    select coalesce((value->>'value')::numeric,1000) into v_rate from public.app_settings where key='points_per_usd';
    v_rate := nullif(v_rate,0);
    if v_rate is null then v_rate := 1000; end if;
    update public.users
    set points_balance=coalesce(points_balance,0)+v_w.amount_points,
        usd_equivalent=(coalesce(points_balance,0)+v_w.amount_points)/v_rate
    where id=v_w.user_id;
  end if;

  update public.withdrawal_requests
  set status=p_status, admin_note=coalesce(p_note,admin_note), updated_at=now()
  where id=p_withdrawal_id;

  return jsonb_build_object('success',true);
end;
$$;

create or replace function public.admin_adjust_balance(
  p_admin_auth_user_id uuid,
  p_user_id uuid,
  p_delta bigint,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_balance bigint;
  v_rate numeric;
begin
  if not exists(select 1 from public.admin_users where auth_user_id=p_admin_auth_user_id and is_active=true) then
    raise exception 'Admin authorization required';
  end if;
  if p_delta=0 then raise exception 'Amount cannot be zero'; end if;

  select points_balance into v_balance from public.users where id=p_user_id for update;
  if v_balance is null then raise exception 'User not found'; end if;
  if v_balance+p_delta < 0 then raise exception 'Balance cannot be negative'; end if;

  select coalesce((value->>'value')::numeric,1000) into v_rate from public.app_settings where key='points_per_usd';
  v_rate := nullif(v_rate,0);
  if v_rate is null then v_rate := 1000; end if;

  update public.users
  set points_balance=v_balance+p_delta, usd_equivalent=(v_balance+p_delta)/v_rate
  where id=p_user_id;

  insert into public.admin_balance_events(user_id,admin_auth_user_id,amount_points,reason)
  values(p_user_id,p_admin_auth_user_id,p_delta,coalesce(nullif(trim(p_reason),''),'Admin balance adjustment'));

  return jsonb_build_object('success',true,'points_balance',v_balance+p_delta);
end;
$$;

create or replace function public.get_public_ad_config()
returns jsonb
language sql
security definer
set search_path=public
as $$
  select jsonb_build_object(
    'provider',coalesce((select value->>'value' from public.app_settings where key='ad_provider'),'AdsGram'),
    'placement',coalesce((select value->>'value' from public.app_settings where key='ad_placement'),''),
    'reward_points',coalesce((select (value->>'value')::numeric from public.app_settings where key='ad_reward_points'),100),
    'daily_limit',coalesce((select (value->>'value')::numeric from public.app_settings where key='daily_ad_limit'),10)
  );
$$;

create or replace function public.admin_save_ad_settings(
  p_admin_auth_user_id uuid,
  p_provider text,
  p_platform_url text,
  p_placement text
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
begin
  if not exists(select 1 from public.admin_users where auth_user_id=p_admin_auth_user_id and is_active=true) then
    raise exception 'Admin authorization required';
  end if;

  insert into public.app_settings(key,value,updated_at) values
    ('ad_provider',jsonb_build_object('value',coalesce(p_provider,'AdsGram')),now()),
    ('ad_platform_url',jsonb_build_object('value',coalesce(p_platform_url,'')),now()),
    ('ad_placement',jsonb_build_object('value',coalesce(p_placement,'')),now())
  on conflict(key) do update set value=excluded.value,updated_at=now();

  return jsonb_build_object('success',true);
end;
$$;

revoke all on function public.create_withdrawal_secure(uuid,text,text) from public,anon,authenticated;
revoke all on function public.admin_set_withdrawal_status(uuid,uuid,text,text) from public,anon,authenticated;
revoke all on function public.admin_adjust_balance(uuid,uuid,bigint,text) from public,anon,authenticated;
revoke all on function public.admin_save_ad_settings(uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.get_public_ad_config() to anon,authenticated;

create or replace function public.get_public_withdrawal_config()
returns jsonb
language sql
security definer
set search_path=public
as $$
  select jsonb_build_object(
    'minimum_points',coalesce((select (value->>'value')::numeric from public.app_settings where key='withdrawal_min_points'),10000),
    'points_per_usd',coalesce((select (value->>'value')::numeric from public.app_settings where key='points_per_usd'),1000)
  );
$$;
revoke all on function public.get_public_withdrawal_config() from public;
grant execute on function public.get_public_withdrawal_config() to anon,authenticated;
