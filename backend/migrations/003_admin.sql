-- DzCoinEren admin foundation
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique,
  role text not null default 'admin' check (role in ('admin','super_admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.app_settings(key,value) values
('withdrawal_min_points','{"value":10000}'),
('points_per_usd','{"value":1000}'),
('tap_limit_per_minute','{"value":60}'),
('daily_ad_limit','{"value":10}'),
('ad_reward_points','{"value":100}'),
('ad_provider','{"value":"AdsGram"}'),
('ad_platform_url','{"value":""}'),
('ad_placement','{"value":""}')
on conflict(key) do nothing;

alter table public.admin_users enable row level security;
alter table public.app_settings enable row level security;

create policy "admins can read own admin record" on public.admin_users for select using (auth.uid()=auth_user_id);
create policy "admins can read settings" on public.app_settings for select using (
  exists(select 1 from public.admin_users a where a.auth_user_id=auth.uid())
);

create table if not exists public.admin_balance_events (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id) on delete cascade, admin_auth_user_id uuid not null, amount_points bigint not null, reason text not null, created_at timestamptz not null default now());
alter table public.admin_balance_events enable row level security;

create unique index if not exists withdrawal_one_pending_per_user on public.withdrawal_requests(user_id) where status='pending';
\ncreate table if not exists public.leaderboard_cache (user_id uuid primary key references public.users(id) on delete cascade, points_balance bigint not null default 0, rank integer not null, updated_at timestamptz not null default now());
create index if not exists leaderboard_rank_idx on public.leaderboard_cache(rank);
create or replace function public.get_top_users(p_limit integer default 100)
returns table(rank bigint,user_id uuid,display_name text,points_balance bigint,level integer,referral_count integer)
language sql security definer set search_path=public as $$
 select row_number() over(order by u.points_balance desc,u.created_at asc) as rank,u.id,coalesce(nullif(u.username,''),nullif(u.first_name,''),'Player') as display_name,coalesce(u.points_balance,0),coalesce(u.level,1),coalesce(u.referral_count,0)
 from public.users u where u.is_active=true order by u.points_balance desc,u.created_at asc limit greatest(1,least(coalesce(p_limit,100),100));
$$;

-- daily bonus security
create unique index if not exists point_transactions_daily_checkin_unique on public.point_transactions(user_id, source, ((created_at at time zone 'UTC')::date)) where source='daily_checkin';
