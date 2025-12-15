-- Create builder_floors table for builder floor listings
-- Run in Supabase SQL editor

create table if not exists public.builder_floors (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  name text not null,
  slug text not null unique,
  location text,
  developer text,
  total_land_parcel text,
  plot_number text,
  plot_size text,
  facing text,
  floors_count int,
  price_top numeric,
  price_mid1 numeric,
  price_mid2 numeric,
  price_ug numeric,
  has_basement boolean default false,
  is_triplex boolean default false,
  is_gated boolean default false,
  roof_rights text, -- full, half, 1/3, 1/4
  condition text,   -- new, old
  status text,      -- ready-to-move, under-construction
  category text,    -- deendayal, regular
  possession_date text,
  owner_name text,
  comments text,
  short_description text,
  full_description text,
  image_url text,
  brochure_url text,
  gallery_images jsonb, -- Array of image URLs
  building_config jsonb -- Array of building configurations
);

-- Images table
create table if not exists public.builder_floor_images (
  id uuid primary key default gen_random_uuid(),
  builder_floor_id uuid references public.builder_floors(id) on delete cascade,
  image_url text not null,
  display_order int default 1,
  created_at timestamptz default now()
);

-- Triggers to keep updated_at fresh
create or replace function update_builder_floors_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_builder_floors_updated_at on public.builder_floors;
create trigger trg_builder_floors_updated_at
before update on public.builder_floors
for each row execute function update_builder_floors_updated_at();

-- RLS
alter table public.builder_floors enable row level security;
alter table public.builder_floor_images enable row level security;

-- Allow public read access (for displaying on website)
drop policy if exists "Public select builder_floors" on public.builder_floors;
create policy "Public select builder_floors"
  on public.builder_floors
  for select
  to public
  using (true);

-- Allow public insert (forms) if needed; adjust per your policy
drop policy if exists "Public insert builder_floors" on public.builder_floors;
create policy "Public insert builder_floors"
  on public.builder_floors
  for insert
  to public
  with check (true);

drop policy if exists "Public insert builder_floor_images" on public.builder_floor_images;
create policy "Public insert builder_floor_images"
  on public.builder_floor_images
  for insert
  to public
  with check (true);

-- Allow authenticated (admins) full access
drop policy if exists "Authenticated select builder_floors" on public.builder_floors;
create policy "Authenticated select builder_floors"
  on public.builder_floors
  for select to authenticated using (true);

drop policy if exists "Authenticated update builder_floors" on public.builder_floors;
create policy "Authenticated update builder_floors"
  on public.builder_floors
  for update to authenticated using (true) with check (true);

drop policy if exists "Authenticated delete builder_floors" on public.builder_floors;
create policy "Authenticated delete builder_floors"
  on public.builder_floors
  for delete to authenticated using (true);

drop policy if exists "Authenticated select builder_floor_images" on public.builder_floor_images;
create policy "Authenticated select builder_floor_images"
  on public.builder_floor_images
  for select to authenticated using (true);

drop policy if exists "Authenticated update builder_floor_images" on public.builder_floor_images;
create policy "Authenticated update builder_floor_images"
  on public.builder_floor_images
  for update to authenticated using (true) with check (true);

drop policy if exists "Authenticated delete builder_floor_images" on public.builder_floor_images;
create policy "Authenticated delete builder_floor_images"
  on public.builder_floor_images
  for delete to authenticated using (true);

-- Allow public read access to builder_floor_images (for displaying on website)
drop policy if exists "Public select builder_floor_images" on public.builder_floor_images;
create policy "Public select builder_floor_images"
  on public.builder_floor_images
  for select
  to public
  using (true);

