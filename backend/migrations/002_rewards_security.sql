-- DzCoinEren security and withdrawal foundation
alter table public.users add column if not exists auth_user_id uuid unique;
alter table public.users alter column username drop not null;
alter table public.users drop constraint if exists users_username_key;
create unique index if not exists users_username_unique on public.users(username) where username is not null;

create table if not exists public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  method text not null check (method in ('BaridiMob','USDT TON')),
  destination text not null,
  amount_points bigint not null check (amount_points > 0),
  amount_usd numeric(18,6) not null default 0,
  status text not null default 'pending' check (status in ('pending','approved','rejected','paid')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists withdrawal_requests_user_idx on public.withdrawal_requests(user_id,created_at desc);

create table if not exists public.ad_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  provider text not null,
  reward_points integer not null default 0,
  provider_event_id text,
  status text not null default 'pending' check (status in ('pending','verified','rejected')),
  created_at timestamptz not null default now(),
  unique(provider,provider_event_id)
);
create index if not exists ad_events_user_idx on public.ad_events(user_id,created_at desc);

alter table public.withdrawal_requests enable row level security;
alter table public.ad_events enable row level security;


alter table public.referrals add column if not exists reward_points bigint not null default 0;
alter table public.referrals add column if not exists rewarded_at timestamptz;
create unique index if not exists referrals_referred_user_unique on public.referrals(referred_user_id);


create or replace function public.process_referral_by_code(p_referral_code text, p_referred_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_referrer public.users%rowtype; v_reward bigint := 500;
begin
  if exists(select 1 from public.referrals where referred_user_id=p_referred_id) then return jsonb_build_object('success',false,'reason','already_referred'); end if;
  select * into v_referrer from public.users where referral_code=p_referral_code limit 1;
  if v_referrer.id is null or v_referrer.id=p_referred_id then return jsonb_build_object('success',false,'reason','invalid_code'); end if;
  insert into public.referrals(referrer_id,referred_user_id,referral_code,reward_points,rewarded_at)
  values(v_referrer.id,p_referred_id,p_referral_code,v_reward,now());
  update public.users set points_balance=coalesce(points_balance,0)+v_reward, usd_equivalent=(coalesce(points_balance,0)+v_reward)/1000, referral_count=coalesce(referral_count,0)+1 where id=v_referrer.id;
  update public.users set points_balance=coalesce(points_balance,0)+v_reward, usd_equivalent=(coalesce(points_balance,0)+v_reward)/1000 where id=p_referred_id;
  insert into public.point_transactions(user_id,amount,type,description,source,metadata) values(v_referrer.id,v_reward,'earn','Referral reward','referral',jsonb_build_object('referred_user_id',p_referred_id));
  insert into public.point_transactions(user_id,amount,type,description,source,metadata) values(p_referred_id,v_reward,'earn','Welcome referral reward','referral',jsonb_build_object('referrer_id',v_referrer.id));
  return jsonb_build_object('success',true,'reward_points',v_reward);
end; $$;
