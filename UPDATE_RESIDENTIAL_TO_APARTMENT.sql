-- ============================================
-- Update Property Type from 'residential' to 'apartment'
-- ============================================
-- Run this query in your Supabase SQL Editor to update all existing properties
-- from type 'residential' to 'apartment'
-- 
-- IMPORTANT: Run this in a transaction or run each step separately
-- ============================================

-- Step 1: First, update the CHECK constraint to allow 'apartment' (and keep 'residential' temporarily)
-- This allows both values during the transition
ALTER TABLE projects 
DROP CONSTRAINT IF EXISTS projects_type_check;

-- Add constraint that allows both 'residential' and 'apartment' during transition
ALTER TABLE projects
ADD CONSTRAINT projects_type_check 
CHECK (type IN ('residential', 'apartment', 'commercial', 'plots', 'sco-plots', 'villa-house', 'builder-floor'));

-- Step 2: Now update all projects with type 'residential' to 'apartment'
UPDATE projects
SET type = 'apartment'
WHERE type = 'residential';

-- Step 3: Update the constraint to only allow 'apartment' (remove 'residential')
ALTER TABLE projects 
DROP CONSTRAINT IF EXISTS projects_type_check;

ALTER TABLE projects
ADD CONSTRAINT projects_type_check 
CHECK (type IN ('apartment', 'commercial', 'plots', 'sco-plots', 'villa-house', 'builder-floor'));

-- Step 4: Verify the update
SELECT 
  type,
  COUNT(*) as count
FROM projects
GROUP BY type
ORDER BY count DESC;

-- ============================================
-- Note: Your application code has already been updated to use 'apartment'
-- instead of 'residential', so after running this query, everything should work correctly.
-- ============================================

