-- ============================================
-- Add Tower BHK Configuration Column to Projects Table
-- ============================================
-- Run this script in your Supabase SQL Editor to add a new column
-- for tower-based BHK configuration.

-- Add the tower_bhk_config column (using JSONB for better querying, or TEXT if JSONB not available)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS tower_bhk_config JSONB;

-- Alternative if JSONB is not available, use TEXT:
-- ALTER TABLE projects
-- ADD COLUMN IF NOT EXISTS tower_bhk_config TEXT;

-- Optional: Add an index if you expect to query frequently by tower configuration
-- CREATE INDEX IF NOT EXISTS idx_projects_tower_bhk_config ON projects USING GIN (tower_bhk_config);

-- Verify the column has been added
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'projects'
  AND column_name = 'tower_bhk_config';

-- Example structure stored in tower_bhk_config:
-- [
--   {
--     "tower_number": 1,
--     "bhk": "2BHK, 3BHK",
--     "area_sqft": "0.5-1",
--     "flats_per_floor": 4,
--     "floors_in_tower": "G+14",
--     "lifts": 2,
--     "penthouse": true,
--     "parking_per_floor": 4
--   },
--   {
--     "tower_number": 2,
--     "bhk": "3BHK, 4BHK",
--     "area_sqft": "1-1.5",
--     "flats_per_floor": 3,
--     "floors_in_tower": "G+12",
--     "lifts": 2,
--     "penthouse": false,
--     "parking_per_floor": 3
--   }
-- ]
--
-- Note: parking_per_floor is stored within the tower_bhk_config JSON structure,
-- not as a separate column. The tower_bhk_config JSONB column supports all
-- tower-related fields including parking_per_floor.

