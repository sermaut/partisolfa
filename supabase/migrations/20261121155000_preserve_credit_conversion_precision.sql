-- Preserve the exact 150 Kz per credit conversion for services priced at 250 Kz.
-- Existing balances and records are retained; only decimal precision is increased.
ALTER TABLE public.profiles
  ALTER COLUMN credits TYPE NUMERIC(14, 10)
  USING credits::NUMERIC(14, 10);

ALTER TABLE public.tasks
  ALTER COLUMN credits_used TYPE NUMERIC(14, 10)
  USING credits_used::NUMERIC(14, 10);

ALTER TABLE public.deposits
  ALTER COLUMN credits_amount TYPE NUMERIC(14, 10)
  USING credits_amount::NUMERIC(14, 10);

COMMENT ON COLUMN public.profiles.credits IS
  'Account credit balance. 1 credit is equivalent to 150 Kz; precision retained to 10 decimal places.';

COMMENT ON COLUMN public.tasks.credits_used IS
  'Credits charged for a task, stored with sufficient precision for Kz/150 conversions.';

COMMENT ON COLUMN public.deposits.credits_amount IS
  'Credits granted for a deposit, calculated as amount_kz / 150 with 10 decimal places.';
