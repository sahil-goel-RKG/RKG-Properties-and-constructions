-- RLS Policies for Admin Access to Contact Submissions
-- Run this in your Supabase SQL Editor

-- Ensure contact_submissions table has RLS enabled
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (admins) to read all contact submissions
-- Note: This uses Clerk authentication, so we need to allow authenticated users
-- If using Clerk with Supabase, you may need to adjust these policies

-- Drop existing policy if it exists and create new one
DROP POLICY IF EXISTS "Allow authenticated users to read contact submissions" ON contact_submissions;

CREATE POLICY "Allow authenticated users to read contact submissions"
ON contact_submissions
FOR SELECT
TO authenticated
USING (true);

-- Allow public to insert (for contact form submissions)
DROP POLICY IF EXISTS "Allow public to insert contact submissions" ON contact_submissions;

CREATE POLICY "Allow public to insert contact submissions"
ON contact_submissions
FOR INSERT
TO public
WITH CHECK (true);

-- Optional: If you want admins to be able to delete submissions
DROP POLICY IF EXISTS "Allow authenticated users to delete contact submissions" ON contact_submissions;

CREATE POLICY "Allow authenticated users to delete contact submissions"
ON contact_submissions
FOR DELETE
TO authenticated
USING (true);
