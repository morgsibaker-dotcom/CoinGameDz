-- DzCoinEren referral hardening
-- USD remains the base currency; referral rewards are points.

alter table public.users
  add column if not exists referral_count integer not null default 0 check (referral_count >= 0);

alter table public.users
  alter column referral_code set default ('DZE-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)));

update public.users
set referral_code = 'DZE-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
where referral_code is null or btrim(referral_code) = '';

update public.users u
set referral_count = (
  select count(*)::integer
  from public.referrals r
  where r.referrer_id = u.id
);

insert into public.app_settings(key,value)
values ('referral_reward_points','{"value":50}')
on conflict(key) do nothing;

create or replace function public.process_referral_by_code(
  p_referral_code text,
  p_referred_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_referrer public.users%rowtype;
  v_referred public.users%rowtype;
  v_reward bigint;
  v_points_per_usd numeric;
  v_referrer_balance bigint;
  v_referred_balance bigint;
begin
  if p_referred_id is null or not exists (
    select 1 from public.users where id=p_referred_id and is_active=true
  ) then
    return jsonb_build_object('success',false,'reason','invalid_user');
  end if;

  if exists (
    select 1 from public.referrals
    where referred_user_id=p_referred_id
  ) then
    return jsonb_build_object('success',false,'reason','already_referred');
  end if;

  select * into v_referrer
  from public.users
  where upper(referral_code)=upper(trim(p_referral_code))
    and is_active=true
  for update;

  if v_referrer.id is null or v_referrer.id=p_referred_id then
    return jsonb_build_object('success',false,'reason','invalid_code');
  end if;

  select * into v_referred
  from public.users
  where id=p_referred_id
  for update;

  select coalesce((value->>'value')::numeric,50)::bigint
  into v_reward
  from public.app_settings
  where key='referral_reward_points';

  select coalesce((value->>'value')::numeric,1000)
  into v_points_per_usd
  from public.app_settings
  where key='points_per_usd';

  if v_reward <= 0 or v_points_per_usd <= 0 then
    raise exception 'Invalid referral settings';
  end if;

  insert into public.referrals(
    referrer_id,
    referred_user_id,
    referral_code,
    commission_rate,
    total_commission,
    reward_points,
    rewarded_at
  )
  values(
    v_referrer.id,
    v_referred.id,
    v_referrer.referral_code,
    0,
    v_reward,
    v_reward,
    now()
  );

  v_referrer_balance := coalesce(v_referrer.points_balance,0) + v_reward;
  v_referred_balance := coalesce(v_referred.points_balance,0) + v_reward;

  update public.users
  set points_balance=v_referrer_balance,
      usd_equivalent=v_referrer_balance/v_points_per_usd,
      referral_count=coalesce(referral_count,0)+1
  where id=v_referrer.id;

  update public.users
  set points_balance=v_referred_balance,
      usd_equivalent=v_referred_balance/v_points_per_usd
  where id=v_referred.id;

  insert into public.point_transactions(
    user_id,amount,type,description,source,metadata
  )
  values
  (
    v_referrer.id,v_reward,'referral','Referral reward','referral',
    jsonb_build_object('referred_user_id',v_referred.id,'reward_points',v_reward)
  ),
  (
    v_referred.id,v_reward,'referral','Welcome referral reward','referral',
    jsonb_build_object('referrer_id',v_referrer.id,'reward_points',v_reward)
  );

  return jsonb_build_object(
    'success',true,
    'reward_points',v_reward,
    'referrer_id',v_referrer.id,
    'referred_user_id',v_referred.id
  );
exception
  when unique_violation then
    return jsonb_build_object('success',false,'reason','already_referred');
end;
$$;

create or replace function public.get_referral_stats()
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_user_id uuid;
  v_count integer;
  v_earned bigint;
begin
  select id into v_user_id
  from public.users
  where auth_user_id=auth.uid() and is_active=true;

  if v_user_id is null then
    raise exception 'User profile not found';
  end if;

  select count(*)::integer, coalesce(sum(reward_points),0)::bigint
  into v_count, v_earned
  from public.referrals
  where referrer_id=v_user_id;

  return jsonb_build_object(
    'success',true,
    'referral_count',v_count,
    'referral_earnings',v_earned
  );
end;
$$;

revoke all on function public.process_referral_by_code(text,uuid) from public,anon,authenticated;
grant execute on function public.process_referral_by_code(text,uuid) to service_role;

revoke all on function public.get_referral_stats() from public,anon;
grant execute on function public.get_referral_stats() to authenticated;
