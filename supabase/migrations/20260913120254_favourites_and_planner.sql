alter table public.clothing_items
  add column is_favorite boolean not null default false;

create index clothing_items_user_favorite_created_at_idx
  on public.clothing_items (user_id, is_favorite, created_at desc)
  where is_favorite = true;

create table public.planned_outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  outfit_id uuid not null references public.outfits (id) on delete cascade,
  planned_for date not null,
  created_at timestamptz not null default now(),
  unique (user_id, planned_for)
);

create index planned_outfits_user_date_idx
  on public.planned_outfits (user_id, planned_for);

alter table public.planned_outfits enable row level security;

grant select, insert, update, delete on table public.planned_outfits to authenticated;

create policy "Users can view their own planned outfits"
  on public.planned_outfits for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own planned outfits"
  on public.planned_outfits for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can edit their own planned outfits"
  on public.planned_outfits for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can remove their own planned outfits"
  on public.planned_outfits for delete to authenticated
  using ((select auth.uid()) = user_id);
