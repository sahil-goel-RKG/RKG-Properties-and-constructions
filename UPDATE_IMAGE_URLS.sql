-- ============================================
-- Update Image URLs After Supabase Migration
-- ============================================
-- This script updates all image URLs from old Supabase project to new one
-- 
-- IMPORTANT: Replace the placeholders with your actual URLs:
-- - OLD_PROJECT_REF: Your old Supabase project reference (e.g., bgombdxqcuuhuujmvbze)
-- - NEW_PROJECT_REF: Your new Supabase project reference
-- ============================================

-- Step 1: Find your old and new project references
-- Old: bgombdxqcuuhuujmvbze (from the URL you provided)
-- New: Get from your new Supabase Dashboard → Project Settings → API → Project URL

-- ============================================
-- UPDATE PROJECTS TABLE - image_url
-- ============================================

-- Replace OLD_PROJECT_REF with your old project reference
-- Replace NEW_PROJECT_REF with your new project reference

UPDATE projects
SET image_url = REPLACE(
  image_url,
  'https://bgombdxqcuuhuujmvbze.supabase.co',
  'https://YOUR_NEW_PROJECT_REF.supabase.co'
)
WHERE image_url LIKE '%bgombdxqcuuhuujmvbze.supabase.co%';

-- ============================================
-- UPDATE PROJECTS TABLE - brochure_url
-- ============================================

UPDATE projects
SET brochure_url = REPLACE(
  brochure_url,
  'https://bgombdxqcuuhuujmvbze.supabase.co',
  'https://YOUR_NEW_PROJECT_REF.supabase.co'
)
WHERE brochure_url LIKE '%bgombdxqcuuhuujmvbze.supabase.co%';

-- ============================================
-- UPDATE PROJECT_IMAGES TABLE - image_url
-- ============================================

UPDATE project_images
SET image_url = REPLACE(
  image_url,
  'https://bgombdxqcuuhuujmvbze.supabase.co',
  'https://YOUR_NEW_PROJECT_REF.supabase.co'
)
WHERE image_url LIKE '%bgombdxqcuuhuujmvbze.supabase.co%';

-- ============================================
-- VERIFY UPDATES
-- ============================================

-- Check how many URLs were updated
SELECT 
  'projects.image_url' as table_column,
  COUNT(*) as old_urls_remaining
FROM projects
WHERE image_url LIKE '%bgombdxqcuuhuujmvbze.supabase.co%'

UNION ALL

SELECT 
  'projects.brochure_url',
  COUNT(*)
FROM projects
WHERE brochure_url LIKE '%bgombdxqcuuhuujmvbze.supabase.co%'

UNION ALL

SELECT 
  'project_images.image_url',
  COUNT(*)
FROM project_images
WHERE image_url LIKE '%bgombdxqcuuhuujmvbze.supabase.co%';

-- ============================================
-- ALTERNATIVE: Update using pattern matching
-- ============================================
-- If you want to update any Supabase URL (more flexible)

-- UPDATE projects
-- SET image_url = REGEXP_REPLACE(
--   image_url,
--   'https://[^.]+\.supabase\.co',
--   'https://YOUR_NEW_PROJECT_REF.supabase.co'
-- )
-- WHERE image_url LIKE '%.supabase.co%';

-- ============================================
-- IMPORTANT NOTES:
-- ============================================
-- 1. Replace YOUR_NEW_PROJECT_REF with your actual new project reference
-- 2. Get your new project reference from:
--    Supabase Dashboard → Project Settings → API → Project URL
--    Example: https://abcdefghijklmnop.supabase.co
--    Your project ref is: abcdefghijklmnop
-- 3. Make sure files are uploaded to new storage bucket first
-- 4. Test a few URLs after updating to ensure they work
-- 5. Keep a backup before running updates

