create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 60),
  style_preferences text not null default '' check (char_length(style_preferences) <= 500),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
grant select, insert, update, delete on table public.profiles to authenticated;

create policy "Users can view their own profile" on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create their own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can edit their own profile" on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can remove their own profile" on public.profiles for delete to authenticated using ((select auth.uid()) = user_id);
