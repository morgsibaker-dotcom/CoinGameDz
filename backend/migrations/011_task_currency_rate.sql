-- Keep task reward USD value aligned with the admin-configured conversion rate.

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
    jsonb_build_object('task_id',v_task.id,'server_verified',true)
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
    'usd_equivalent',v_new_balance/v_points_per_usd
  );
exception
  when unique_violation then
    raise exception 'Task already completed';
end;
$$;

revoke all on function public.complete_task(uuid) from public;
grant execute on function public.complete_task(uuid) to authenticated;
