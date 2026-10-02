-- DzCoinEren task system
alter table public.tasks enable row level security;

create index if not exists task_completions_created_at_idx
  on public.task_completions(created_at desc);

create or replace function public.get_active_tasks()
returns table(
  id uuid,
  title text,
  description text,
  category text,
  reward_points bigint,
  max_completions_per_user integer,
  completed boolean
)
language sql
security definer
set search_path=public
as $$
  select
    t.id,
    t.title::text,
    t.description::text,
    t.category::text,
    t.reward_points,
    t.max_completions_per_user,
    exists(
      select 1
      from public.task_completions c
      join public.users u on u.id=c.user_id
      where c.task_id=t.id
        and u.auth_user_id=auth.uid()
    ) as completed
  from public.tasks t
  where t.is_active=true
  order by t.created_at desc;
$$;

create or replace function public.complete_task(p_task_id uuid)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_user public.users%rowtype;
  v_task public.tasks%rowtype;
  v_count integer;
  v_new_balance bigint;
begin
  select * into v_user
  from public.users
  where auth_user_id=auth.uid() and is_active=true
  for update;

  if v_user.id is null then
    raise exception 'User profile not found';
  end if;

  select * into v_task
  from public.tasks
  where id=p_task_id and is_active=true
  for update;

  if v_task.id is null then
    raise exception 'Task not found or inactive';
  end if;

  select count(*)::integer into v_count
  from public.task_completions
  where user_id=v_user.id and task_id=v_task.id;

  if v_task.max_completions_per_user is not null
     and v_count >= v_task.max_completions_per_user then
    raise exception 'Task completion limit reached';
  end if;

  insert into public.task_completions(user_id,task_id,points_awarded)
  values(v_user.id,v_task.id,v_task.reward_points);

  v_new_balance := coalesce(v_user.points_balance,0)+v_task.reward_points;

  insert into public.point_transactions(
    user_id,amount,type,description,source,metadata
  )
  values(
    v_user.id,
    v_task.reward_points,
    'earn',
    'Task reward: ' || v_task.title,
    'task',
    jsonb_build_object('task_id',v_task.id,'server_verified',true)
  );

  update public.users
  set points_balance=v_new_balance,
      usd_equivalent=v_new_balance/1000
  where id=v_user.id;

  return jsonb_build_object(
    'success',true,
    'task_id',v_task.id,
    'points_awarded',v_task.reward_points,
    'points_balance',v_new_balance
  );
exception
  when unique_violation then
    raise exception 'Task already completed';
end;
$$;

create or replace function public.admin_list_tasks(p_admin_auth_user_id uuid)
returns table(
  id uuid,
  title text,
  description text,
  category text,
  reward_points bigint,
  is_active boolean,
  max_completions_per_user integer,
  created_at timestamptz
)
language plpgsql
security definer
set search_path=public
as $$
begin
  if not exists(
    select 1 from public.admin_users
    where auth_user_id=p_admin_auth_user_id and is_active=true
  ) then
    raise exception 'Admin authorization required';
  end if;

  return query
  select t.id,t.title::text,t.description::text,t.category::text,
         t.reward_points,t.is_active,t.max_completions_per_user,t.created_at
  from public.tasks t
  order by t.created_at desc;
end;
$$;

create or replace function public.admin_upsert_task(
  p_admin_auth_user_id uuid,
  p_task_id uuid,
  p_title text,
  p_description text,
  p_category text,
  p_reward_points bigint,
  p_max_completions_per_user integer,
  p_is_active boolean
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare v_id uuid;
begin
  if not exists(
    select 1 from public.admin_users
    where auth_user_id=p_admin_auth_user_id and is_active=true
  ) then
    raise exception 'Admin authorization required';
  end if;

  if nullif(trim(coalesce(p_title,'')),'') is null then
    raise exception 'Task title is required';
  end if;
  if nullif(trim(coalesce(p_description,'')),'') is null then
    raise exception 'Task description is required';
  end if;
  if p_category not in ('watch','click','survey','game') then
    raise exception 'Invalid task category';
  end if;
  if coalesce(p_reward_points,0) <= 0 then
    raise exception 'Reward must be greater than zero';
  end if;
  if p_max_completions_per_user is not null
     and p_max_completions_per_user <= 0 then
    raise exception 'Completion limit must be greater than zero';
  end if;

  if p_task_id is null then
    insert into public.tasks(
      title,description,category,reward_points,
      is_active,max_completions_per_user
    )
    values(
      trim(p_title),trim(p_description),p_category,p_reward_points,
      coalesce(p_is_active,true),p_max_completions_per_user
    )
    returning id into v_id;
  else
    update public.tasks
    set title=trim(p_title),
        description=trim(p_description),
        category=p_category,
        reward_points=p_reward_points,
        is_active=coalesce(p_is_active,true),
        max_completions_per_user=p_max_completions_per_user
    where id=p_task_id
    returning id into v_id;

    if v_id is null then
      raise exception 'Task not found';
    end if;
  end if;

  return jsonb_build_object('success',true,'id',v_id);
end;
$$;

create or replace function public.admin_set_task_active(
  p_admin_auth_user_id uuid,
  p_task_id uuid,
  p_is_active boolean
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
begin
  if not exists(
    select 1 from public.admin_users
    where auth_user_id=p_admin_auth_user_id and is_active=true
  ) then
    raise exception 'Admin authorization required';
  end if;

  update public.tasks
  set is_active=p_is_active
  where id=p_task_id;

  if not found then
    raise exception 'Task not found';
  end if;

  return jsonb_build_object('success',true);
end;
$$;

revoke all on function public.get_active_tasks() from public;
revoke all on function public.complete_task(uuid) from public;
grant execute on function public.get_active_tasks() to anon,authenticated;
grant execute on function public.complete_task(uuid) to authenticated;
revoke all on function public.admin_list_tasks(uuid) from public,anon,authenticated;
revoke all on function public.admin_upsert_task(uuid,uuid,text,text,text,bigint,integer,boolean) from public,anon,authenticated;
revoke all on function public.admin_set_task_active(uuid,uuid,boolean) from public,anon,authenticated;
