-- Configure the wheel with 17 blank slots and 3 reward slots.
-- Rewards: 1000 points 2%, 500 points 3%, 100 points 10%, blanks 85%.
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
  ('', 0, 5, true),
  ('', 0, 5, true),
  ('', 0, 5, true),
  ('', 0, 5, true),
  ('', 0, 5, true),
  ('', 0, 5, true),
  ('100 نقطة', 100, 10, true),
  ('500 نقطة', 500, 3, true),
  ('1000 نقطة', 1000, 2, true);
