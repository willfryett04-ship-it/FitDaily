create table public.outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  occasion text not null default 'casual' check (occasion in ('casual', 'work', 'evening', 'formal', 'active')),
  explanation text not null check (char_length(explanation) between 1 and 500),
  created_at timestamptz not null default now()
);

create table public.outfit_items (
  outfit_id uuid not null references public.outfits (id) on delete cascade,
  clothing_item_id uuid not null references public.clothing_items (id) on delete cascade,
  position smallint not null check (position between 1 and 10),
  primary key (outfit_id, clothing_item_id),
  unique (outfit_id, position)
);

create index outfits_user_created_at_idx on public.outfits (user_id, created_at desc);
create index outfit_items_clothing_item_idx on public.outfit_items (clothing_item_id);

alter table public.outfits enable row level security;
alter table public.outfit_items enable row level security;

grant select, insert, update, delete on table public.outfits to authenticated;
grant select, insert, update, delete on table public.outfit_items to authenticated;

create policy "Users can view their own outfits"
  on public.outfits for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own outfits"
  on public.outfits for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can edit their own outfits"
  on public.outfits for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own outfits"
  on public.outfits for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can view items in their own outfits"
  on public.outfit_items for select to authenticated
  using (exists (
    select 1 from public.outfits
    where outfits.id = outfit_id and outfits.user_id = (select auth.uid())
  ));

create policy "Users can add items to their own outfits"
  on public.outfit_items for insert to authenticated
  with check (exists (
    select 1 from public.outfits
    where outfits.id = outfit_id and outfits.user_id = (select auth.uid())
  ));

create policy "Users can edit items in their own outfits"
  on public.outfit_items for update to authenticated
  using (exists (
    select 1 from public.outfits
    where outfits.id = outfit_id and outfits.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.outfits
    where outfits.id = outfit_id and outfits.user_id = (select auth.uid())
  ));

create policy "Users can delete items from their own outfits"
  on public.outfit_items for delete to authenticated
  using (exists (
    select 1 from public.outfits
    where outfits.id = outfit_id and outfits.user_id = (select auth.uid())
  ));
