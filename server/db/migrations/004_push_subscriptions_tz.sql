alter table if exists push_subscriptions
  add column if not exists timezone text,
  add column if not exists tz_offset integer;


