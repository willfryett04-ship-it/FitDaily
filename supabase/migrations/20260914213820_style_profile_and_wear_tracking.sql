alter table public.profiles
  add column favorite_colors text[] not null default '{}',
  add column style_vibes text[] not null default '{}',
  add column avoid_items text not null default '' check (char_length(avoid_items) <= 240);

create table public.outfit_wears (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  outfit_id uuid not null references public.outfits (id) on delete cascade,
  worn_on date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, outfit_id, worn_on)
);

create index outfit_wears_user_worn_on_idx on public.outfit_wears (user_id, worn_on desc);

alter table public.outfit_wears enable row level security;
grant select, insert, delete on table public.outfit_wears to authenticated;

create policy "Users can view their own outfit wears" on public.outfit_wears
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can add their own outfit wears" on public.outfit_wears
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can remove their own outfit wears" on public.outfit_wears
  for delete to authenticated using ((select auth.uid()) = user_id);
