alter table public.profiles
  add column reminder_enabled boolean not null default false,
  add column reminder_time time not null default '08:00';
