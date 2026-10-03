-- DzCoinEren task completion hardening
-- Support max_completions_per_user > 1 and unlimited tasks.
-- The original schema created a unique (user, task) index, which made
-- repeatable task limits impossible. Completion state is now count-based.

drop index if exists public.idx_task_completions_unique_per_task;

create index if not exists idx_task_completions_user_task_created_at
  on public.task_completions(user_id, task_id, completed_at desc);

create or replace function public.get_active_tasks()
returns table(
  id uuid,
  title text,
  description text,
  category text,
  reward_points bigint,
  max_completions_per_user integer,
  completion_count integer,
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
    coalesce(c.completion_count, 0)::integer as completion_count,
    case
      when t.max_completions_per_user is null then false
      else coalesce(c.completion_count, 0) >= t.max_completions_per_user
    end as completed
  from public.tasks t
  left join lateral (
    select count(*)::integer as completion_count
    from public.task_completions tc
    where tc.task_id=t.id
      and tc.user_id=(
        select u.id
        from public.users u
        where u.auth_user_id=auth.uid()
          and u.is_active=true
        limit 1
      )
  ) c on true
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
  v_points_per_usd numeric;
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

  select coalesce((value->>'value')::numeric,1000)
  into v_points_per_usd
  from public.app_settings
  where key='points_per_usd';

  v_points_per_usd := coalesce(nullif(v_points_per_usd,0),1000);

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
    jsonb_build_object(
      'task_id',v_task.id,
      'server_verified',true,
      'completion_number',v_count + 1
    )
  );

  update public.users
  set points_balance=v_new_balance,
      usd_equivalent=v_new_balance/v_points_per_usd
  where id=v_user.id;

  return jsonb_build_object(
    'success',true,
    'task_id',v_task.id,
    'points_awarded',v_task.reward_points,
    'points_balance',v_new_balance,
    'usd_equivalent',v_new_balance/v_points_per_usd,
    'completion_count',v_count + 1,
    'max_completions_per_user',v_task.max_completions_per_user
  );
end;
$$;

revoke all on function public.get_active_tasks() from public;
grant execute on function public.get_active_tasks() to anon,authenticated;

revoke all on function public.complete_task(uuid) from public;
grant execute on function public.complete_task(uuid) to authenticated;
