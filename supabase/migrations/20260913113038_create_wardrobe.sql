create table public.clothing_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  category text not null check (category in ('top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory', 'other')),
  color text,
  seasons text[] not null default '{}',
  occasions text[] not null default '{}',
  image_path text,
  notes text,
  ai_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clothing_items_user_created_at_idx
  on public.clothing_items (user_id, created_at desc);

alter table public.clothing_items enable row level security;

grant select, insert, update, delete on table public.clothing_items to authenticated;

create policy "Users can view their own clothing"
  on public.clothing_items for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own clothing"
  on public.clothing_items for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can edit their own clothing"
  on public.clothing_items for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can remove their own clothing"
  on public.clothing_items for delete to authenticated
  using ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wardrobe',
  'wardrobe',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "Users can view their wardrobe images"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'wardrobe'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can upload wardrobe images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'wardrobe'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their wardrobe images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'wardrobe'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'wardrobe'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their wardrobe images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'wardrobe'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
