-- ============================================
-- Additional Useful Supabase Queries
-- ============================================
-- Run these queries as needed for database management

-- ============================================
-- 1. UPDATE IMAGE URLS (After Storage Setup)
-- ============================================

-- Update all projects with image URLs
-- Replace [YOUR-PROJECT-REF] with your actual Supabase project reference
UPDATE projects
SET image_url = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/project-images/' || slug || '.jpg'
WHERE image_url IS NULL;

-- Update specific project image
UPDATE projects
SET image_url = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/project-images/godrej-sora.jpg'
WHERE slug = 'godrej-sora';

-- ============================================
-- 2. SEARCH AND FILTER QUERIES
-- ============================================

-- Search projects by name
SELECT * FROM projects
WHERE name ILIKE '%godrej%'
ORDER BY created_at DESC;

-- Filter by developer
SELECT * FROM projects
WHERE developer = 'M3M India'
ORDER BY name;

-- Get projects by location
SELECT name, location, area, price
FROM projects
WHERE location = 'Dwarka Expressway'
ORDER BY name;

-- Get latest projects
SELECT name, slug, location, created_at
FROM projects
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- 3. STATISTICS QUERIES
-- ============================================

-- Count projects by type
SELECT 
  type,
  COUNT(*) as count
FROM projects
GROUP BY type
ORDER BY count DESC;

-- Count projects by developer
SELECT 
  developer,
  COUNT(*) as project_count
FROM projects
WHERE developer IS NOT NULL
GROUP BY developer
ORDER BY project_count DESC;

-- Projects by location
SELECT 
  location,
  COUNT(*) as project_count
FROM projects
GROUP BY location
ORDER BY project_count DESC;

-- ============================================
-- 4. CONTACT SUBMISSIONS QUERIES
-- ============================================

-- View all contact submissions
SELECT 
  id,
  name,
  email,
  phone,
  message,
  created_at
FROM contact_submissions
ORDER BY created_at DESC;

-- Count submissions by date
SELECT 
  DATE(created_at) as date,
  COUNT(*) as count
FROM contact_submissions
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Recent submissions (last 24 hours)
SELECT *
FROM contact_submissions
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- ============================================
-- 5. MAINTENANCE QUERIES
-- ============================================

-- Check for duplicate slugs
SELECT slug, COUNT(*) as count
FROM projects
GROUP BY slug
HAVING COUNT(*) > 1;

-- Find projects without images
SELECT name, slug
FROM projects
WHERE image_url IS NULL OR image_url = '';

-- Find projects without developers
SELECT name, slug
FROM projects
WHERE developer IS NULL OR developer = '';

-- Find projects with missing required fields
SELECT name, slug
FROM projects
WHERE location IS NULL 
   OR name IS NULL 
   OR type IS NULL;

-- ============================================
-- 6. DATA VALIDATION QUERIES
-- ============================================

-- Check project data integrity
SELECT 
  'Total Projects' as metric,
  COUNT(*) as value
FROM projects
UNION ALL
SELECT 
  'Projects with Images',
  COUNT(*)
FROM projects
WHERE image_url IS NOT NULL AND image_url != ''
UNION ALL
SELECT 
  'Projects with Developers',
  COUNT(*)
FROM projects
WHERE developer IS NOT NULL AND developer != ''
UNION ALL
SELECT 
  'Contact Submissions',
  COUNT(*)
FROM contact_submissions;

-- ============================================
-- 7. EXPORT QUERIES
-- ============================================

-- Export all projects as JSON structure
SELECT 
  json_agg(
    json_build_object(
      'id', id,
      'name', name,
      'slug', slug,
      'location', location,
      'area', area,
      'price', price,
      'type', type,
      'developer', developer,
      'description', description,
      'image_url', image_url,
      'created_at', created_at
    )
  ) as projects
FROM projects;

-- Export residential projects only
SELECT 
  json_agg(
    json_build_object(
      'id', id,
      'name', name,
      'slug', slug,
      'location', location,
      'area', area,
      'price', price
    )
  ) as residential_projects
FROM projects
WHERE type = 'residential';

-- ============================================
-- 8. BACKUP QUERIES
-- ============================================

-- Create backup of projects table
CREATE TABLE IF NOT EXISTS projects_backup AS
SELECT * FROM projects;

-- Create backup with timestamp
CREATE TABLE IF NOT EXISTS projects_backup_2024 AS
SELECT * FROM projects;

-- ============================================
-- 9. CLEANUP QUERIES
-- ============================================

-- Delete test contact submissions
DELETE FROM contact_submissions
WHERE email LIKE '%test%'
   OR email LIKE '%example%';

-- Archive old contact submissions (older than 1 year)
-- First, create archive table:
CREATE TABLE IF NOT EXISTS contact_submissions_archive AS
SELECT * FROM contact_submissions
WHERE created_at < NOW() - INTERVAL '1 year';

-- Then delete archived records:
-- DELETE FROM contact_submissions
-- WHERE created_at < NOW() - INTERVAL '1 year';

-- ============================================
-- 10. PERFORMANCE OPTIMIZATION
-- ============================================

-- Add additional index for developer search
CREATE INDEX IF NOT EXISTS idx_projects_developer ON projects(developer);

-- Add index for name search
CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);

-- Analyze tables for optimization
ANALYZE projects;
ANALYZE contact_submissions;

-- Get table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename IN ('projects', 'contact_submissions')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================
-- 11. USEFUL ADMIN QUERIES
-- ============================================

-- Get all table names
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Get table structures
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'projects'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('projects', 'contact_submissions');

-- ============================================
-- END OF ADDITIONAL QUERIES
-- ============================================

