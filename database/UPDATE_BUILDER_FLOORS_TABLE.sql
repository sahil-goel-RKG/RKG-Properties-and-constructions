-- Add short_description, full_description, gallery_images, building_config, developer, and total_land_parcel columns to builder_floors table
-- Run this in Supabase SQL Editor

ALTER TABLE public.builder_floors
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS full_description TEXT,
ADD COLUMN IF NOT EXISTS gallery_images JSONB,
ADD COLUMN IF NOT EXISTS building_config JSONB,
ADD COLUMN IF NOT EXISTS developer TEXT,
ADD COLUMN IF NOT EXISTS total_land_parcel TEXT;

-- Optional: Migrate existing comments to short_description if short_description is null
UPDATE public.builder_floors
SET short_description = comments
WHERE short_description IS NULL AND comments IS NOT NULL;

