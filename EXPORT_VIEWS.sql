-- ============================================
-- Export Views from Supabase
-- ============================================
-- Run this in your OLD Supabase project SQL Editor
-- This will generate CREATE VIEW statements for all views
-- ============================================

-- ============================================
-- METHOD 1: Get All View Definitions
-- ============================================
-- This query will show all views and their definitions

SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views
WHERE schemaname = 'public'
ORDER BY viewname;

-- ============================================
-- METHOD 2: Generate CREATE VIEW Statements
-- ============================================
-- This generates ready-to-use CREATE VIEW statements

SELECT 
  'CREATE OR REPLACE VIEW ' || viewname || ' AS ' || definition || ';' as create_view_statement
FROM pg_views
WHERE schemaname = 'public'
ORDER BY viewname;

-- ============================================
-- METHOD 3: Export Specific View
-- ============================================
-- Replace 'your_view_name' with your actual view name

SELECT 
  'CREATE OR REPLACE VIEW ' || viewname || ' AS ' || definition || ';' as create_view_statement
FROM pg_views
WHERE schemaname = 'public' 
  AND viewname = 'your_view_name';

-- ============================================
-- METHOD 4: Export View with Dependencies
-- ============================================
-- Get view definition along with any dependencies

SELECT 
  v.viewname,
  v.definition,
  'CREATE OR REPLACE VIEW ' || v.viewname || ' AS ' || v.definition || ';' as create_statement,
  -- Get dependencies (tables/views this view depends on)
  (
    SELECT string_agg(DISTINCT dependent_ns.nspname || '.' || dependent_view.relname, ', ')
    FROM pg_depend
    JOIN pg_rewrite ON pg_depend.objid = pg_rewrite.oid
    JOIN pg_class AS dependent_view ON pg_rewrite.ev_class = dependent_view.oid
    JOIN pg_class AS source_table ON pg_depend.refobjid = source_table.oid
    JOIN pg_namespace dependent_ns ON dependent_ns.oid = dependent_view.relnamespace
    JOIN pg_namespace source_ns ON source_ns.oid = source_table.relnamespace
    WHERE source_table.relname = v.viewname
      AND source_ns.nspname = 'public'
  ) as depends_on
FROM pg_views v
WHERE v.schemaname = 'public'
ORDER BY v.viewname;

-- ============================================
-- METHOD 5: Export Materialized Views
-- ============================================
-- If you have materialized views, use this:

SELECT 
  schemaname,
  matviewname as viewname,
  definition
FROM pg_matviews
WHERE schemaname = 'public'
ORDER BY matviewname;

-- Generate CREATE MATERIALIZED VIEW statement
SELECT 
  'CREATE MATERIALIZED VIEW ' || matviewname || ' AS ' || definition || ';' as create_materialized_view_statement
FROM pg_matviews
WHERE schemaname = 'public'
ORDER BY matviewname;

-- ============================================
-- METHOD 6: Complete View Export Script
-- ============================================
-- This exports everything about views

-- Regular Views
SELECT 
  '-- View: ' || viewname || E'\n' ||
  'CREATE OR REPLACE VIEW ' || viewname || ' AS ' || definition || ';' || E'\n' ||
  E'\n' as export_statement
FROM pg_views
WHERE schemaname = 'public'
ORDER BY viewname;

-- Materialized Views (if any)
SELECT 
  '-- Materialized View: ' || matviewname || E'\n' ||
  'CREATE MATERIALIZED VIEW ' || matviewname || ' AS ' || definition || ';' || E'\n' ||
  E'\n' as export_statement
FROM pg_matviews
WHERE schemaname = 'public'
ORDER BY matviewname;

-- ============================================
-- IMPORT VIEWS (for new database)
-- ============================================
-- After getting the CREATE VIEW statements, run them in your NEW Supabase project:

-- 1. Copy the CREATE VIEW statements from above
-- 2. Paste and run in new Supabase SQL Editor
-- 3. Verify views are created:
SELECT viewname, definition 
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- ============================================
-- Export View Data (if needed)
-- ============================================
-- If you need to export data FROM a view (not the view definition):

-- Example: Export data from a view
COPY (SELECT * FROM your_view_name) TO STDOUT WITH CSV HEADER;

-- ============================================
-- Notes:
-- ============================================
-- 1. Views are query definitions, not data storage
-- 2. Export the CREATE VIEW statement, not the data
-- 3. Views depend on underlying tables - make sure tables exist first
-- 4. Materialized views store data - you may need to refresh them:
--    REFRESH MATERIALIZED VIEW your_materialized_view_name;
-- 5. Check view permissions/grants if needed:
--    SELECT grantee, privilege_type 
--    FROM information_schema.role_table_grants 
--    WHERE table_name = 'your_view_name';

