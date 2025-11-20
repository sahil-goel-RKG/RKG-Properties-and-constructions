-- ============================================
-- UPDATE PROJECTS TABLE WITH COMPREHENSIVE COLUMNS
-- ============================================
-- This script adds new columns for detailed project information
-- Run this in Supabase SQL Editor
-- ============================================

-- Add new columns for comprehensive project details
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS bhk_config TEXT[], -- e.g., ['2BHK', '3BHK', '4BHK']
ADD COLUMN IF NOT EXISTS carpet_area_min NUMERIC, -- Minimum carpet area in sqft
ADD COLUMN IF NOT EXISTS carpet_area_max NUMERIC, -- Maximum carpet area in sqft
ADD COLUMN IF NOT EXISTS built_up_area_min NUMERIC, -- Minimum built-up area in sqft
ADD COLUMN IF NOT EXISTS built_up_area_max NUMERIC, -- Maximum built-up area in sqft
ADD COLUMN IF NOT EXISTS super_area_min NUMERIC, -- Minimum super area in sqft
ADD COLUMN IF NOT EXISTS super_area_max NUMERIC, -- Maximum super area in sqft
ADD COLUMN IF NOT EXISTS price_min NUMERIC, -- Minimum price in rupees
ADD COLUMN IF NOT EXISTS price_max NUMERIC, -- Maximum price in rupees
ADD COLUMN IF NOT EXISTS price_per_sqft NUMERIC, -- Price per square foot
ADD COLUMN IF NOT EXISTS project_status TEXT, -- 'under-construction', 'ready-to-move', 'upcoming', 'completed'
ADD COLUMN IF NOT EXISTS possession_date DATE, -- Expected possession date
ADD COLUMN IF NOT EXISTS rera_number TEXT, -- RERA registration number
ADD COLUMN IF NOT EXISTS total_towers INTEGER, -- Number of towers
ADD COLUMN IF NOT EXISTS total_floors INTEGER, -- Number of floors per tower
ADD COLUMN IF NOT EXISTS total_units INTEGER, -- Total number of units
ADD COLUMN IF NOT EXISTS amenities TEXT[], -- Array of amenities
ADD COLUMN IF NOT EXISTS project_highlights TEXT[], -- Array of key highlights
ADD COLUMN IF NOT EXISTS nearby_landmarks TEXT[], -- Array of nearby landmarks
ADD COLUMN IF NOT EXISTS connectivity TEXT, -- Connectivity details
ADD COLUMN IF NOT EXISTS payment_plan TEXT, -- Payment plan details
ADD COLUMN IF NOT EXISTS floor_plan_url TEXT, -- URL to floor plan
ADD COLUMN IF NOT EXISTS brochure_url TEXT, -- URL to project brochure
ADD COLUMN IF NOT EXISTS video_url TEXT, -- URL to project video
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false, -- Featured project flag
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true, -- Active status
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0, -- Display order
ADD COLUMN IF NOT EXISTS short_description TEXT, -- Brief description
ADD COLUMN IF NOT EXISTS full_description TEXT, -- Comprehensive description
ADD COLUMN IF NOT EXISTS project_type_detail TEXT, -- Detailed project type (e.g., 'Luxury Apartments', 'Builder Floors')
ADD COLUMN IF NOT EXISTS facing TEXT, -- Facing direction (North, South, East, West)
ADD COLUMN IF NOT EXISTS parking INTEGER, -- Number of parking spaces
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_projects_bhk_config ON projects USING GIN(bhk_config);
CREATE INDEX IF NOT EXISTS idx_projects_project_status ON projects(project_status);
CREATE INDEX IF NOT EXISTS idx_projects_is_featured ON projects(is_featured);
CREATE INDEX IF NOT EXISTS idx_projects_is_active ON projects(is_active);
CREATE INDEX IF NOT EXISTS idx_projects_price_min ON projects(price_min);
CREATE INDEX IF NOT EXISTS idx_projects_possession_date ON projects(possession_date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at_trigger ON projects;
CREATE TRIGGER update_projects_updated_at_trigger
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_projects_updated_at();

-- Update type constraint to include builder-floor
ALTER TABLE projects
DROP CONSTRAINT IF EXISTS projects_type_check;

ALTER TABLE projects
ADD CONSTRAINT projects_type_check 
CHECK (type IN ('residential', 'commercial', 'plots', 'sco-plots', 'villa-house', 'builder-floor'));

-- ============================================
-- VERIFY COLUMNS ADDED
-- ============================================

SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'projects'
ORDER BY ordinal_position;

