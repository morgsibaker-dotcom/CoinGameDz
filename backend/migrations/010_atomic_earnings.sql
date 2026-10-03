-- DzCoinEren atomic earning transaction
-- Locks the user row, inserts the earning transaction, and updates the balance
-- in one database transaction so concurrent requests cannot overwrite points.

create or replace function public.award_points_atomic(
  p_user_id uuid,
  p_amount bigint,
  p_source text,
  p_description text,
  p_points_per_usd numeric,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_user public.users%rowtype;
  v_next bigint;
  v_usd numeric;
begin
  if p_amount <= 0 then
    raise exception 'Invalid earning amount';
  end if;

  if p_points_per_usd <= 0 then
    raise exception 'Invalid points conversion rate';
  end if;

  select * into v_user
  from public.users
  where id = p_user_id
  for update;

  if v_user.id is null then
    raise exception 'User not found';
  end if;

  v_next := coalesce(v_user.points_balance, 0) + p_amount;
  v_usd := v_next / p_points_per_usd;

  insert into public.point_transactions(
    user_id, amount, type, description, source, metadata
  )
  values(
    v_user.id,
    p_amount,
    'earn',
    p_description,
    p_source,
    coalesce(p_metadata, '{}'::jsonb)
  );

  update public.users
  set
    points_balance = v_next,
    usd_equivalent = v_usd
  where id = v_user.id;

  return jsonb_build_object(
    'success', true,
    'points_balance', v_next,
    'usd_equivalent', v_usd
  );
end;
$$;

revoke all on function public.award_points_atomic(uuid,bigint,text,text,numeric,jsonb)
  from public, anon, authenticated;

grant execute on function public.award_points_atomic(uuid,bigint,text,text,numeric,jsonb) to service_role;
