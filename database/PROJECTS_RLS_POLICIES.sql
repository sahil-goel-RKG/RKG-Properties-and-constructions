-- ============================================
-- RLS Policies for Projects Table
-- ============================================
-- Run this in your NEW Supabase project SQL Editor
-- This allows authenticated users (admins) to insert, update, and delete projects
-- ============================================

-- Ensure RLS is enabled
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DROP EXISTING POLICIES (if any)
-- ============================================

DROP POLICY IF EXISTS "Allow public read access to projects" ON projects;
DROP POLICY IF EXISTS "Allow authenticated users to insert projects" ON projects;
DROP POLICY IF EXISTS "Allow authenticated users to update projects" ON projects;
DROP POLICY IF EXISTS "Allow authenticated users to delete projects" ON projects;

-- ============================================
-- CREATE RLS POLICIES
-- ============================================

-- Allow public read access to projects (for website visitors)
CREATE POLICY "Allow public read access to projects"
ON projects
FOR SELECT
TO public
USING (true);

-- Allow authenticated users to insert projects (for admin adding new listings)
CREATE POLICY "Allow authenticated users to insert projects"
ON projects
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update projects (for admin editing listings)
CREATE POLICY "Allow authenticated users to update projects"
ON projects
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete projects (for admin deleting listings)
CREATE POLICY "Allow authenticated users to delete projects"
ON projects
FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- VERIFY POLICIES
-- ============================================

-- Check if policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'projects'
ORDER BY policyname;

-- ============================================
-- NOTES:
-- ============================================
-- 1. These policies allow ANY authenticated user to modify projects
-- 2. If you want more restrictive access, you can add conditions like:
--    USING (auth.uid() = created_by_user_id)
-- 3. For now, this assumes all authenticated users are admins
-- 4. Make sure Clerk authentication is properly configured with Supabase

