-- Secure wheel prizes and server-side spinning
-- Apply this migration in Supabase SQL Editor before using the user wheel.

CREATE TABLE IF NOT EXISTS public.wheel_prizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label VARCHAR(255) NOT NULL,
  points BIGINT NOT NULL CHECK (points > 0),
  probability NUMERIC(8,4) NOT NULL CHECK (probability >= 0 AND probability <= 100),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wheel_prizes_active
  ON public.wheel_prizes(is_active);

ALTER TABLE public.wheel_prizes ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_wheel_prize_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_wheel_prizes_updated_at ON public.wheel_prizes;
CREATE TRIGGER trigger_wheel_prizes_updated_at
  BEFORE UPDATE ON public.wheel_prizes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_wheel_prize_updated_at();

CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE auth_user_id = auth.uid()
      AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.get_admin_wheel_prizes()
RETURNS SETOF public.wheel_prizes
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.wheel_prizes
  WHERE public.is_active_admin()
  ORDER BY created_at ASC, id ASC;
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

  IF trim(COALESCE(p_label, '')) = '' THEN
    RAISE EXCEPTION 'Prize label is required';
  END IF;

  IF p_points <= 0 THEN
    RAISE EXCEPTION 'Prize points must be greater than zero';
  END IF;

  IF p_probability < 0 OR p_probability > 100 THEN
    RAISE EXCEPTION 'Probability must be between 0 and 100';
  END IF;

  INSERT INTO public.wheel_prizes(label, points, probability)
  VALUES (trim(p_label), p_points, p_probability)
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

  IF trim(COALESCE(p_label, '')) = '' THEN
    RAISE EXCEPTION 'Prize label is required';
  END IF;

  IF p_points <= 0 THEN
    RAISE EXCEPTION 'Prize points must be greater than zero';
  END IF;

  IF p_probability < 0 OR p_probability > 100 THEN
    RAISE EXCEPTION 'Probability must be between 0 and 100';
  END IF;

  UPDATE public.wheel_prizes
  SET label = trim(p_label),
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

CREATE OR REPLACE FUNCTION public.update_admin_wheel_prize_status(
  p_prize_id UUID,
  p_is_active BOOLEAN
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

  UPDATE public.wheel_prizes
  SET is_active = p_is_active
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

  -- Serialize spins for this user so two simultaneous requests cannot both win.
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

  SELECT label, points
    INTO v_prize_label, v_prize_points
  FROM (
    SELECT
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

  IF v_prize_label IS NULL THEN
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
  VALUES (v_public_user_id, v_prize_label, v_prize_points);

  INSERT INTO public.point_transactions(
    user_id, amount, type, description, source, metadata
  )
  VALUES (
    v_public_user_id,
    v_prize_points,
    'earn',
    'Wheel reward',
    'wheel',
    jsonb_build_object('prize_label', v_prize_label)
  );

  RETURN jsonb_build_object(
    'success', true,
    'prize_points', v_prize_points,
    'prize_label', v_prize_label,
    'new_balance', v_new_balance
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_wheel_prizes() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_admin_wheel_prize(TEXT, BIGINT, NUMERIC) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_admin_wheel_prize(UUID, TEXT, BIGINT, NUMERIC) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_admin_wheel_prize_status(UUID, BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.spin_wheel(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_admin_wheel_prizes() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_admin_wheel_prize(TEXT, BIGINT, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_admin_wheel_prize(UUID, TEXT, BIGINT, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_admin_wheel_prize_status(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.spin_wheel(UUID) TO authenticated;
