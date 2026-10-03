-- Configure the wheel with box-style outcomes.
-- 30%: boxes containing 15 points.
-- 10%: boxes containing 100 points.
-- 3%: boxes containing 500 points.
-- 2%: boxes containing 1000 points.
-- 55%: empty boxes.
-- Total probability: 100%.
-- Existing wheel prizes are disabled first so the active total remains exactly 100%.

UPDATE public.wheel_prizes
SET is_active = false;

INSERT INTO public.wheel_prizes (label, points, probability, is_active)
VALUES
  ('', 0, 5, true),
  ('', 0, 5, true),
  ('', 0, 5, true),
  ('', 0, 5, true),
  ('', 0, 5, true),
  ('', 0, 5, true),
  ('', 0, 5, true),
  ('', 0, 5, true),
  ('', 0, 5, true),
  ('', 0, 5, true),
  ('', 0, 5, true),
  ('15 نقطة', 15, 5, true),
  ('15 نقطة', 15, 5, true),
  ('15 نقطة', 15, 5, true),
  ('15 نقطة', 15, 5, true),
  ('15 نقطة', 15, 5, true),
  ('15 نقطة', 15, 5, true),
  ('100 نقطة', 100, 10, true),
  ('500 نقطة', 500, 3, true),
  ('1000 نقطة', 1000, 2, true);
