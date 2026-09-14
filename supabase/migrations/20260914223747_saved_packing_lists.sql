create table public.packing_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  destination text not null check (char_length(destination) between 2 and 80),
  days smallint not null check (days between 1 and 21),
  weather text not null,
  plans text not null check (char_length(plans) between 2 and 160),
  content jsonb not null,
  created_at timestamptz not null default now()
);
create index packing_lists_user_created_idx on public.packing_lists (user_id, created_at desc);
alter table public.packing_lists enable row level security;
grant select, insert, delete on public.packing_lists to authenticated;
create policy "Users can view their packing lists" on public.packing_lists for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can save their packing lists" on public.packing_lists for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can delete their packing lists" on public.packing_lists for delete to authenticated using ((select auth.uid()) = user_id);
