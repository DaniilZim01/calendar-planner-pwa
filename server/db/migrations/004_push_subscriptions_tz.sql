-- Add timezone fields to push_subscriptions
ALTER TABLE IF EXISTS public.push_subscriptions
  ADD COLUMN IF NOT EXISTS timezone TEXT,
  ADD COLUMN IF NOT EXISTS tz_offset INTEGER;

-- Optional indexes to query by timezone if needed later
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_timezone ON public.push_subscriptions(timezone);

