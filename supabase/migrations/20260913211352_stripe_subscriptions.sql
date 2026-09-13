create table public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  status text not null,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

grant select on public.subscriptions to authenticated;

create policy "Users can view their own subscription"
  on public.subscriptions for select to authenticated
  using ((select auth.uid()) = user_id);
