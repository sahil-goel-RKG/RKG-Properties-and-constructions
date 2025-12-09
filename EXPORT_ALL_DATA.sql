-- ============================================
-- Export All Data for Supabase Migration
-- ============================================
-- Run this in your OLD Supabase project SQL Editor
-- Note: Supabase SQL Editor doesn't support \copy command
-- Use the methods below instead
-- ============================================

-- ============================================
-- METHOD 1: Export via Supabase Dashboard (Easiest)
-- ============================================
-- 1. Go to Table Editor in Supabase Dashboard
-- 2. Select each table
-- 3. Click "Export" button → Choose CSV or JSON format
-- 4. Download the file
-- 
-- Tables to export:
-- - projects
-- - project_images
-- - developers
-- - contact_submissions (if exists)

-- ============================================
-- METHOD 2: Generate INSERT Statements (SQL Editor)
-- ============================================
-- This will generate INSERT statements you can copy and run in new database

-- Export Projects as INSERT statements
SELECT 
  'INSERT INTO projects (' ||
  string_agg(column_name, ', ' ORDER BY ordinal_position) ||
  ') VALUES (' ||
  string_agg(
    CASE 
      WHEN data_type IN ('text', 'varchar', 'uuid', 'date', 'timestamp') 
      THEN COALESCE('''' || REPLACE(column_name::text, '''', '''''') || '''', 'NULL')
      WHEN data_type = 'boolean' 
      THEN COALESCE(column_name::text, 'NULL')
      WHEN data_type = 'jsonb' 
      THEN COALESCE('''' || REPLACE(column_name::text, '''', '''''') || '''', 'NULL')
      ELSE COALESCE(column_name::text, 'NULL')
    END,
    ', ' ORDER BY ordinal_position
  ) ||
  ');' as insert_statement
FROM information_schema.columns
WHERE table_name = 'projects' AND table_schema = 'public'
LIMIT 1;

-- ============================================
-- METHOD 3: Use COPY TO STDOUT (Copy output manually)
-- ============================================
-- Run these one at a time and copy the output
-- Paste into a text file and save as CSV

-- 1. Export Projects (copy the output)
COPY (SELECT * FROM projects) TO STDOUT WITH CSV HEADER;

-- 2. Export Project Images (copy the output)
COPY (SELECT * FROM project_images) TO STDOUT WITH CSV HEADER;

-- 3. Export Developers (copy the output)
COPY (SELECT * FROM developers) TO STDOUT WITH CSV HEADER;

-- 4. Export Contact Submissions (copy the output, if exists)
COPY (SELECT * FROM contact_submissions) TO STDOUT WITH CSV HEADER;

-- ============================================
-- METHOD 4: Generate INSERT Statements for All Rows
-- ============================================
-- Run this for each table to generate INSERT statements

-- For Projects table
DO $$
DECLARE
  rec record;
  sql_text text;
BEGIN
  FOR rec IN SELECT * FROM projects LOOP
    sql_text := 'INSERT INTO projects (';
    sql_text := sql_text || 'id, name, slug, location, area, type, developer, ';
    sql_text := sql_text || 'short_description, full_description, price, project_status, ';
    sql_text := sql_text || 'possession_date, is_featured, tower_bhk_config, amenities, ';
    sql_text := sql_text || 'project_highlights, nearby_landmarks, connectivity, ';
    sql_text := sql_text || 'payment_plan, total_towers, total_units, facing, ';
    sql_text := sql_text || 'club_house, club_house_area, brochure_url, image_url, ';
    sql_text := sql_text || 'created_at, updated_at) VALUES (';
    sql_text := sql_text || quote_literal(rec.id) || ', ';
    sql_text := sql_text || quote_literal(rec.name) || ', ';
    sql_text := sql_text || quote_literal(rec.slug) || ', ';
    sql_text := sql_text || quote_literal(rec.location) || ', ';
    sql_text := sql_text || quote_nullable(rec.area) || ', ';
    sql_text := sql_text || quote_literal(rec.type) || ', ';
    sql_text := sql_text || quote_nullable(rec.developer) || ', ';
    sql_text := sql_text || quote_nullable(rec.short_description) || ', ';
    sql_text := sql_text || quote_nullable(rec.full_description) || ', ';
    sql_text := sql_text || quote_nullable(rec.price) || ', ';
    sql_text := sql_text || quote_nullable(rec.project_status) || ', ';
    sql_text := sql_text || quote_nullable(rec.possession_date) || ', ';
    sql_text := sql_text || COALESCE(rec.is_featured::text, 'false') || ', ';
    sql_text := sql_text || quote_nullable(rec.tower_bhk_config::text) || ', ';
    sql_text := sql_text || quote_nullable(rec.amenities::text) || ', ';
    sql_text := sql_text || quote_nullable(rec.project_highlights::text) || ', ';
    sql_text := sql_text || quote_nullable(rec.nearby_landmarks::text) || ', ';
    sql_text := sql_text || quote_nullable(rec.connectivity) || ', ';
    sql_text := sql_text || quote_nullable(rec.payment_plan) || ', ';
    sql_text := sql_text || quote_nullable(rec.total_towers) || ', ';
    sql_text := sql_text || quote_nullable(rec.total_units) || ', ';
    sql_text := sql_text || quote_nullable(rec.facing) || ', ';
    sql_text := sql_text || COALESCE(rec.club_house::text, 'false') || ', ';
    sql_text := sql_text || quote_nullable(rec.club_house_area) || ', ';
    sql_text := sql_text || quote_nullable(rec.brochure_url) || ', ';
    sql_text := sql_text || quote_nullable(rec.image_url) || ', ';
    sql_text := sql_text || quote_literal(rec.created_at) || ', ';
    sql_text := sql_text || quote_nullable(rec.updated_at) || ');';
    RAISE NOTICE '%', sql_text;
  END LOOP;
END $$;

-- ============================================
-- IMPORT SCRIPT (for new database)
-- ============================================
-- After exporting data, import into new Supabase project:

-- Option 1: Using Supabase Dashboard Table Editor
-- 1. Go to Table Editor → Select table
-- 2. Click "Import data" → Upload CSV file
-- 3. Map columns correctly
-- 4. Import

-- Option 2: Using SQL INSERT statements
-- Copy and paste the INSERT statements generated above
-- Run them in the new database SQL Editor

-- Option 3: Using COPY FROM (if you have CSV files)
-- Note: This requires direct database access (not available in SQL Editor)
-- Use Supabase CLI or psql for this:
-- COPY projects FROM '/path/to/projects_export.csv' WITH CSV HEADER;

-- ============================================
-- After Import - Reset Sequences
-- ============================================
-- Run these in your NEW database to reset auto-increment sequences:

-- Reset projects sequence
SELECT setval('projects_id_seq', COALESCE((SELECT MAX(id::bigint) FROM projects), 1), true);

-- Reset project_images sequence
SELECT setval('project_images_id_seq', COALESCE((SELECT MAX(id::bigint) FROM project_images), 1), true);

-- Reset developers sequence (if exists)
SELECT setval('developers_id_seq', COALESCE((SELECT MAX(id::bigint) FROM developers), 1), true);

-- Reset contact_submissions sequence (if exists)
SELECT setval('contact_submissions_id_seq', COALESCE((SELECT MAX(id::bigint) FROM contact_submissions), 1), true);

-- ============================================
-- Verify Data Migration
-- ============================================
-- Run these queries in both old and new databases to compare:

-- Count records in each table
SELECT 'projects' as table_name, COUNT(*) as count FROM projects
UNION ALL
SELECT 'project_images', COUNT(*) FROM project_images
UNION ALL
SELECT 'developers', COUNT(*) FROM developers
UNION ALL
SELECT 'contact_submissions', COUNT(*) FROM contact_submissions;

-- ============================================
-- Notes:
-- ============================================
-- 1. Supabase SQL Editor doesn't support \copy (psql command)
-- 2. Use Dashboard Table Editor export/import for easiest migration
-- 3. For large datasets, export via Dashboard → CSV
-- 4. Make sure to export in correct order (respect foreign keys)
-- 5. Always verify data counts match between old and new database
-- 6. Test all functionality after migration before deleting old project

