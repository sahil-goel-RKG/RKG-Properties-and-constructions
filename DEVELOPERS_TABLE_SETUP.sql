-- ============================================
-- DEVELOPERS TABLE SETUP
-- ============================================
-- This script creates a developers table to store comprehensive
-- developer information dynamically from the website
-- ============================================

-- ============================================
-- 1. CREATE DEVELOPERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS developers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  
  -- Basic Information
  logo_url TEXT,
  description TEXT,
  short_description TEXT,
  
  -- Contact Information
  website TEXT,
  email TEXT,
  phone TEXT,
  office_address TEXT,
  
  -- Company Details
  established_year INTEGER,
  company_type TEXT, -- e.g., 'Public', 'Private', 'Partnership'
  rera_registration TEXT,
  
  -- Statistics (can be calculated from projects table)
  total_projects INTEGER DEFAULT 0,
  residential_projects INTEGER DEFAULT 0,
  commercial_projects INTEGER DEFAULT 0,
  builder_floor_projects INTEGER DEFAULT 0,
  
  -- Locations where developer has projects
  locations TEXT[], -- Array of locations
  
  -- Additional Information
  specialties TEXT[], -- Array of specialties
  awards TEXT[], -- Array of awards/recognitions
  certifications TEXT[], -- Array of certifications
  
  -- Social Media & Online Presence
  linkedin_url TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  
  -- Metadata
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_developers_slug ON developers(slug);
CREATE INDEX IF NOT EXISTS idx_developers_name ON developers(name);
CREATE INDEX IF NOT EXISTS idx_developers_is_featured ON developers(is_featured);
CREATE INDEX IF NOT EXISTS idx_developers_is_active ON developers(is_active);
CREATE INDEX IF NOT EXISTS idx_developers_display_order ON developers(display_order);

-- ============================================
-- 3. CREATE FUNCTION TO UPDATE UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_developers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_developers_updated_at_trigger
  BEFORE UPDATE ON developers
  FOR EACH ROW
  EXECUTE FUNCTION update_developers_updated_at();

-- ============================================
-- 4. CREATE FUNCTION TO AUTO-GENERATE SLUG
-- ============================================

CREATE OR REPLACE FUNCTION generate_developer_slug(developer_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(
    regexp_replace(developer_name, '[^a-zA-Z0-9\s]', '', 'g'),
    '\s+', '-', 'g'
  ));
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE developers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. CREATE RLS POLICIES
-- ============================================

-- Allow public read access to active developers
CREATE POLICY "Allow public read access to developers"
ON developers
FOR SELECT
TO public
USING (is_active = true);

-- Allow authenticated users to insert developers
CREATE POLICY "Allow authenticated users to insert developers"
ON developers
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update developers
CREATE POLICY "Allow authenticated users to update developers"
ON developers
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete developers
CREATE POLICY "Allow authenticated users to delete developers"
ON developers
FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- 7. CREATE VIEW FOR DEVELOPER STATISTICS
-- ============================================

CREATE OR REPLACE VIEW developer_statistics AS
SELECT 
  d.id,
  d.name,
  d.slug,
  d.logo_url,
  COUNT(DISTINCT p.id) as total_projects_count,
  COUNT(DISTINCT CASE WHEN p.type = 'residential' THEN p.id END) as residential_count,
  COUNT(DISTINCT CASE WHEN p.type = 'commercial' THEN p.id END) as commercial_count,
  COUNT(DISTINCT CASE WHEN p.type IN ('builder-floor', 'builder floor', 'builder_floor') THEN p.id END) as builder_floor_count,
  array_agg(DISTINCT p.location) FILTER (WHERE p.location IS NOT NULL) as locations
FROM developers d
LEFT JOIN projects p ON LOWER(TRIM(p.developer)) = LOWER(TRIM(d.name))
WHERE d.is_active = true
GROUP BY d.id, d.name, d.slug, d.logo_url;

-- ============================================
-- 8. FUNCTION TO SYNC DEVELOPER STATS FROM PROJECTS
-- ============================================

CREATE OR REPLACE FUNCTION sync_developer_stats()
RETURNS void AS $$
BEGIN
  UPDATE developers d
  SET 
    total_projects = COALESCE((
      SELECT COUNT(*) 
      FROM projects p 
      WHERE LOWER(TRIM(p.developer)) = LOWER(TRIM(d.name))
    ), 0),
    residential_projects = COALESCE((
      SELECT COUNT(*) 
      FROM projects p 
      WHERE LOWER(TRIM(p.developer)) = LOWER(TRIM(d.name))
      AND p.type = 'residential'
    ), 0),
    commercial_projects = COALESCE((
      SELECT COUNT(*) 
      FROM projects p 
      WHERE LOWER(TRIM(p.developer)) = LOWER(TRIM(d.name))
      AND p.type = 'commercial'
    ), 0),
    builder_floor_projects = COALESCE((
      SELECT COUNT(*) 
      FROM projects p 
      WHERE LOWER(TRIM(p.developer)) = LOWER(TRIM(d.name))
      AND p.type IN ('builder-floor', 'builder floor', 'builder_floor')
    ), 0),
    locations = (
      SELECT array_agg(DISTINCT p.location)
      FROM projects p
      WHERE LOWER(TRIM(p.developer)) = LOWER(TRIM(d.name))
      AND p.location IS NOT NULL
    ),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. INITIAL DEVELOPER DATA FROM WEBSITE
-- ============================================
-- Based on developers listed on reiasindia.com

INSERT INTO developers (name, slug, is_featured, display_order)
VALUES 
  ('DLF', 'dlf', true, 1),
  ('Emaar India', 'emaar-india', true, 2),
  ('Godrej Properties', 'godrej-properties', true, 3),
  ('M3M India', 'm3m-india', true, 4),
  ('Adani Realty', 'adani-realty', true, 5),
  ('Signature Global', 'signature-global', true, 6),
  ('Central Park', 'central-park', true, 7),
  ('Elan', 'elan', true, 8),
  ('Sobha', 'sobha', true, 9),
  ('Shapoorji Pallonji', 'shapoorji-pallonji', true, 10),
  ('Whiteland Corporation', 'whiteland-corporation', true, 11),
  ('MNB Buildfab Private Limited', 'mnb-buildfab-private-limited', true, 12),
  ('AIPL', 'aipl', false, 13),
  ('Ireo', 'ireo', false, 14),
  ('Conscient Infrastructure', 'conscient-infrastructure', false, 15),
  ('Bestech Group', 'bestech-group', false, 16),
  ('Experion Developers', 'experion-developers', false, 17),
  ('TATA Housing', 'tata-housing', false, 18),
  ('Pioneer Urban', 'pioneer-urban', false, 19),
  ('Vatika Group', 'vatika-group', false, 20),
  ('Puri Constructions', 'puri-constructions', false, 21),
  ('Gurgaon Developers', 'gurgaon-developers', false, 22),
  ('Indiabulls', 'indiabulls', false, 23),
  ('ATS Infrastructure', 'ats-infrastructure', false, 24),
  ('BPTP', 'bptp', false, 25),
  ('Paras Buildtech', 'paras-buildtech', false, 26),
  ('Raheja Builders', 'raheja-builders', false, 27),
  ('Ansal API', 'ansal-api', false, 28),
  ('Pyramid Infratech', 'pyramid-infratech', false, 29),
  ('Neo Devlopers', 'neo-devlopers', false, 30),
  ('Silverglades', 'silverglades', false, 31),
  ('Orris Infrastructure', 'orris-infrastructure', false, 32),
  ('ROF', 'rof', false, 33),
  ('JMS Group', 'jms-group', false, 34)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 10. SYNC STATISTICS FROM PROJECTS TABLE
-- ============================================

SELECT sync_developer_stats();

-- ============================================
-- 11. VERIFY DATA
-- ============================================

-- View all developers
SELECT 
  name, 
  slug, 
  total_projects, 
  residential_projects, 
  commercial_projects,
  is_featured
FROM developers
ORDER BY display_order, name;

-- View developer statistics
SELECT * FROM developer_statistics
ORDER BY total_projects_count DESC
LIMIT 10;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Your developers table is now ready with:
-- - Comprehensive developer information structure
-- - RLS policies for security
-- - Auto-updating statistics from projects table
-- - Initial data from reiasindia.com
-- - Indexes for optimal query performance
--
-- Next steps:
-- 1. Run this script in Supabase SQL Editor
-- 2. Use the API endpoint to update developer details
-- 3. The statistics will auto-sync from projects table
-- ============================================

