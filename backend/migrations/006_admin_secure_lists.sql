-- Secure admin listings for users and withdrawals
create or replace function public.admin_list_users(
  p_admin_auth_user_id uuid,
  p_limit integer default 100
)
returns table(
  id uuid,
  telegram_id bigint,
  username text,
  first_name text,
  points_balance bigint,
  level integer,
  is_active boolean,
  created_at timestamptz
)
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

  return query
  select u.id,u.telegram_id,u.username,u.first_name,
         coalesce(u.points_balance,0),coalesce(u.level,1),
         u.is_active,u.created_at
  from public.users u
  order by u.created_at desc
  limit greatest(1,least(coalesce(p_limit,100),500));
end;
$$;

create or replace function public.admin_list_withdrawals(
  p_admin_auth_user_id uuid,
  p_limit integer default 100
)
returns table(
  id uuid,
  user_id uuid,
  method text,
  destination text,
  amount_points bigint,
  amount_usd numeric,
  status text,
  admin_note text,
  created_at timestamptz,
  updated_at timestamptz
)
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

  return query
  select w.id,w.user_id,w.method,w.destination,
         w.amount_points,w.amount_usd,w.status,w.admin_note,
         w.created_at,w.updated_at
  from public.withdrawal_requests w
  order by w.created_at desc
  limit greatest(1,least(coalesce(p_limit,100),500));
end;
$$;

revoke all on function public.admin_list_users(uuid,integer) from public,anon,authenticated;
revoke all on function public.admin_list_withdrawals(uuid,integer) from public,anon,authenticated;
