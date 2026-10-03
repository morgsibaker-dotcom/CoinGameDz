-- Wheel blank outcomes and public wheel configuration
-- Apply after 015_wheel_secure_spin.sql

ALTER TABLE public.wheel_prizes
  DROP CONSTRAINT IF EXISTS wheel_prizes_points_check;

ALTER TABLE public.wheel_prizes
  ADD CONSTRAINT wheel_prizes_points_check CHECK (points >= 0);

DROP FUNCTION IF EXISTS public.get_wheel_prizes();
DROP FUNCTION IF EXISTS public.create_admin_wheel_prize(TEXT, BIGINT, NUMERIC);
DROP FUNCTION IF EXISTS public.update_admin_wheel_prize(UUID, TEXT, BIGINT, NUMERIC);
DROP FUNCTION IF EXISTS public.spin_wheel(UUID);

CREATE OR REPLACE FUNCTION public.get_wheel_prizes()
RETURNS TABLE (
  id UUID,
  label VARCHAR(255),
  points BIGINT,
  probability NUMERIC,
  is_active BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT wp.id, wp.label, wp.points, wp.probability, wp.is_active
  FROM public.wheel_prizes wp
  WHERE wp.is_active = true
    AND wp.probability > 0
  ORDER BY wp.created_at ASC, wp.id ASC;
$$;

CREATE OR REPLACE FUNCTION public.create_admin_wheel_prize(
  p_label TEXT,
  p_points BIGINT,
  p_probability NUMERIC
)
RETURNS public.wheel_prizes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prize public.wheel_prizes;
BEGIN
  IF NOT public.is_active_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  IF p_points IS NULL OR p_points < 0 THEN
    RAISE EXCEPTION 'Prize points must be zero or greater';
  END IF;

  IF p_points > 0 AND trim(COALESCE(p_label, '')) = '' THEN
    RAISE EXCEPTION 'Prize label is required for a reward';
  END IF;

  IF p_probability IS NULL OR p_probability < 0 OR p_probability > 100 THEN
    RAISE EXCEPTION 'Probability must be between 0 and 100';
  END IF;

  INSERT INTO public.wheel_prizes(label, points, probability)
  VALUES (COALESCE(trim(p_label), ''), p_points, p_probability)
  RETURNING * INTO v_prize;

  RETURN v_prize;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_admin_wheel_prize(
  p_prize_id UUID,
  p_label TEXT,
  p_points BIGINT,
  p_probability NUMERIC
)
RETURNS public.wheel_prizes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prize public.wheel_prizes;
BEGIN
  IF NOT public.is_active_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  IF p_points IS NULL OR p_points < 0 THEN
    RAISE EXCEPTION 'Prize points must be zero or greater';
  END IF;

  IF p_points > 0 AND trim(COALESCE(p_label, '')) = '' THEN
    RAISE EXCEPTION 'Prize label is required for a reward';
  END IF;

  IF p_probability IS NULL OR p_probability < 0 OR p_probability > 100 THEN
    RAISE EXCEPTION 'Probability must be between 0 and 100';
  END IF;

  UPDATE public.wheel_prizes
  SET label = COALESCE(trim(p_label), ''),
      points = p_points,
      probability = p_probability
  WHERE id = p_prize_id
  RETURNING * INTO v_prize;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prize not found';
  END IF;

  RETURN v_prize;
END;
$$;

CREATE OR REPLACE FUNCTION public.spin_wheel(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_public_user_id UUID;
  v_last_spin TIMESTAMPTZ;
  v_total_probability NUMERIC;
  v_pick NUMERIC;
  v_prize_id UUID;
  v_prize_points BIGINT;
  v_prize_label TEXT;
  v_new_balance BIGINT;
  v_points_per_usd NUMERIC;
BEGIN
  SELECT id
    INTO v_public_user_id
  FROM public.users
  WHERE id = p_user_id
    AND auth_user_id = auth.uid()
    AND is_active = true;

  IF v_public_user_id IS NULL THEN
    RAISE EXCEPTION 'User is not authorized to spin this wheel';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(v_public_user_id::TEXT, 0));

  SELECT spun_at
    INTO v_last_spin
  FROM public.wheel_spins
  WHERE user_id = v_public_user_id
  ORDER BY spun_at DESC
  LIMIT 1;

  IF v_last_spin IS NOT NULL AND v_last_spin > CURRENT_TIMESTAMP - INTERVAL '24 hours' THEN
    RAISE EXCEPTION 'You can spin again after 24 hours';
  END IF;

  SELECT COALESCE(SUM(probability), 0)
    INTO v_total_probability
  FROM public.wheel_prizes
  WHERE is_active = true
    AND probability > 0;

  IF v_total_probability <= 0 THEN
    RAISE EXCEPTION 'Wheel is not configured';
  END IF;

  v_pick := random() * v_total_probability;

  SELECT id, label, points
    INTO v_prize_id, v_prize_label, v_prize_points
  FROM (
    SELECT
      id,
      label,
      points,
      SUM(probability) OVER (ORDER BY created_at, id) AS cumulative_probability
    FROM public.wheel_prizes
    WHERE is_active = true
      AND probability > 0
  ) prizes
  WHERE cumulative_probability >= v_pick
  ORDER BY cumulative_probability
  LIMIT 1;

  IF v_prize_id IS NULL THEN
    RAISE EXCEPTION 'Unable to select a wheel prize';
  END IF;

  SELECT COALESCE(
    (SELECT (value->>'value')::NUMERIC
     FROM public.app_settings
     WHERE key = 'points_per_usd'),
    1000
  )
  INTO v_points_per_usd;

  IF v_points_per_usd <= 0 THEN
    v_points_per_usd := 1000;
  END IF;

  UPDATE public.users
  SET points_balance = points_balance + v_prize_points,
      usd_equivalent = (points_balance + v_prize_points) / v_points_per_usd
  WHERE id = v_public_user_id
  RETURNING points_balance INTO v_new_balance;

  INSERT INTO public.wheel_spins(user_id, reward_type, points_won)
  VALUES (
    v_public_user_id,
    CASE WHEN v_prize_points = 0 THEN 'blank' ELSE v_prize_label END,
    v_prize_points
  );

  IF v_prize_points > 0 THEN
    INSERT INTO public.point_transactions(
      user_id, amount, type, description, source, metadata
    )
    VALUES (
      v_public_user_id,
      v_prize_points,
      'earn',
      'Wheel reward',
      'wheel',
      jsonb_build_object(
        'prize_id', v_prize_id,
        'prize_label', v_prize_label
      )
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'prize_id', v_prize_id,
    'prize_points', v_prize_points,
    'prize_label', v_prize_label,
    'new_balance', v_new_balance
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_wheel_prizes() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_admin_wheel_prize(TEXT, BIGINT, NUMERIC) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_admin_wheel_prize(UUID, TEXT, BIGINT, NUMERIC) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.spin_wheel(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_wheel_prizes() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_admin_wheel_prize(TEXT, BIGINT, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_admin_wheel_prize(UUID, TEXT, BIGINT, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.spin_wheel(UUID) TO authenticated;
