-- Secure admin rewards management
create or replace function public.admin_list_rewards(
  p_admin_auth_user_id uuid,
  p_limit integer default 100
)
returns table(
  id uuid,
  title text,
  description text,
  reward_type text,
  points_reward bigint,
  is_active boolean,
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
  select r.id,r.title,r.description,r.reward_type,r.points_reward,
         r.is_active,r.created_at,r.updated_at
  from public.rewards r
  order by r.created_at desc
  limit greatest(1,least(coalesce(p_limit,100),500));
end;
$$;

create or replace function public.admin_upsert_reward(
  p_admin_auth_user_id uuid,
  p_reward_id uuid,
  p_title text,
  p_description text,
  p_reward_type text,
  p_points_reward bigint,
  p_is_active boolean
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare v_id uuid;
begin
  if not exists (
    select 1 from public.admin_users
    where auth_user_id=p_admin_auth_user_id and is_active=true
  ) then
    raise exception 'Admin authorization required';
  end if;

  if trim(coalesce(p_title,''))='' then raise exception 'Reward title is required'; end if;
  if p_reward_type not in ('daily','streak','welcome','gift','achievement') then raise exception 'Invalid reward type'; end if;
  if p_points_reward is null or p_points_reward <= 0 then raise exception 'Reward points must be positive'; end if;

  if p_reward_id is null then
    insert into public.rewards(title,description,reward_type,points_reward,is_active)
    values(trim(p_title),coalesce(trim(p_description),''),p_reward_type,p_points_reward,coalesce(p_is_active,true))
    returning id into v_id;
  else
    update public.rewards
    set title=trim(p_title),
        description=coalesce(trim(p_description),''),
        reward_type=p_reward_type,
        points_reward=p_points_reward,
        is_active=coalesce(p_is_active,true),
        updated_at=now()
    where id=p_reward_id
    returning id into v_id;
    if v_id is null then raise exception 'Reward not found'; end if;
  end if;

  return jsonb_build_object('success',true,'id',v_id);
end;
$$;

create or replace function public.admin_set_reward_active(
  p_admin_auth_user_id uuid,
  p_reward_id uuid,
  p_is_active boolean
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

  update public.rewards
  set is_active=coalesce(p_is_active,false),updated_at=now()
  where id=p_reward_id;

  if not found then raise exception 'Reward not found'; end if;
  return jsonb_build_object('success',true);
end;
$$;

revoke all on function public.admin_list_rewards(uuid,integer) from public,anon,authenticated;
revoke all on function public.admin_upsert_reward(uuid,uuid,text,text,text,bigint,boolean) from public,anon,authenticated;
revoke all on function public.admin_set_reward_active(uuid,uuid,boolean) from public,anon,authenticated;
