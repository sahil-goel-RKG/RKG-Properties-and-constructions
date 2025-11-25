-- Complete Database Migration Script
-- Run this in Supabase SQL Editor

-- PART 1: ADD NEW COLUMNS
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS club_house BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS club_house_area TEXT,
ADD COLUMN IF NOT EXISTS tower_bhk_config JSONB;

-- PART 2: UPDATE POSSESSION_DATE TO YEAR FORMAT
-- First, alter the column type from DATE to TEXT
ALTER TABLE projects
ALTER COLUMN possession_date TYPE TEXT USING 
  CASE 
    WHEN possession_date IS NULL THEN NULL
    WHEN possession_date::text ~ '^\d{4}-\d{2}-\d{2}' THEN EXTRACT(YEAR FROM possession_date::date)::text
    ELSE possession_date::text
  END;

-- PART 3: UPDATE PROPERTY TYPE FROM RESIDENTIAL TO APARTMENT
-- Drop existing constraint
ALTER TABLE projects
DROP CONSTRAINT IF EXISTS projects_type_check;

-- Add temporary constraint allowing both
ALTER TABLE projects
ADD CONSTRAINT projects_type_check_temp
CHECK (type IN ('residential', 'apartment', 'commercial', 'plots', 'sco-plots', 'villa-house', 'builder-floor'));

-- Update all residential to apartment
UPDATE projects
SET type = 'apartment'
WHERE type = 'residential';

-- Drop temporary constraint
ALTER TABLE projects
DROP CONSTRAINT IF EXISTS projects_type_check_temp;

-- Add final constraint
ALTER TABLE projects
ADD CONSTRAINT projects_type_check
CHECK (type IN ('apartment', 'commercial', 'plots', 'sco-plots', 'villa-house', 'builder-floor'));

-- PART 4: OPTIONAL - REMOVE UNUSED COLUMNS (Uncomment if you want to remove)
-- ALTER TABLE projects
-- DROP COLUMN IF EXISTS carpet_area_min,
-- DROP COLUMN IF EXISTS carpet_area_max,
-- DROP COLUMN IF EXISTS price_min,
-- DROP COLUMN IF EXISTS price_max,
-- DROP COLUMN IF EXISTS rera_number;

-- PART 5: CREATE INDEXES (Optional)
CREATE INDEX IF NOT EXISTS idx_projects_club_house ON projects(club_house);

-- VERIFICATION QUERIES
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'projects'
  AND column_name IN ('club_house', 'club_house_area', 'tower_bhk_config')
ORDER BY ordinal_position;

SELECT type, COUNT(*) as count
FROM projects
GROUP BY type
ORDER BY count DESC;
