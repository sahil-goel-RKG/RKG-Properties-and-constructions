-- ============================================
-- Add Club House Columns to Projects Table
-- ============================================
-- Run this query in your Supabase SQL Editor to add club house fields
-- ============================================

-- Add club_house column (boolean, default false)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS club_house BOOLEAN DEFAULT false;

-- Add club_house_area column (text, nullable)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS club_house_area TEXT;

-- Verify the columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'projects'
  AND column_name IN ('club_house', 'club_house_area')
ORDER BY column_name;

-- ============================================
-- Notes:
-- - club_house: Boolean flag to indicate if project has club house
-- - club_house_area: Text field to store the area of the club house (e.g., "5000 sqft")
-- - Both fields are optional and can be null/empty
-- ============================================

