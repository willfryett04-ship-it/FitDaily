alter table public.clothing_items
  add column is_in_laundry boolean not null default false;

alter table public.outfits
  add column feedback text check (feedback in ('loved', 'not_for_me'));
