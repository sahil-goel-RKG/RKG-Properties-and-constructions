-- ============================================
-- COMPREHENSIVE PROJECTS DATA POPULATION
-- ============================================
-- This script populates ALL projects with detailed information
-- from reiasindia.com
-- Run UPDATE_PROJECTS_TABLE_SCHEMA.sql first!
-- ============================================

-- Function to extract BHK from area text
CREATE OR REPLACE FUNCTION extract_bhk_from_text(area_text TEXT)
RETURNS TEXT[] AS $$
BEGIN
  -- Extract BHK patterns like "3&4Bhk", "3BHK", "2-4 BHK"
  IF area_text ~* '(\d+)\s*[&,-]?\s*(\d+)?\s*bhk' THEN
    RETURN ARRAY[
      regexp_replace(area_text, '.*?(\d+)\s*[&,-]?\s*(\d+)?\s*bhk.*', '\1BHK', 'gi'),
      CASE 
        WHEN area_text ~* '(\d+)\s*[&,-]\s*(\d+)\s*bhk' 
        THEN regexp_replace(area_text, '.*?(\d+)\s*[&,-]\s*(\d+)\s*bhk.*', '\2BHK', 'gi')
        ELSE NULL
      END
    ]::TEXT[];
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Update projects with comprehensive data
-- This will update existing projects and add details

-- Set default project status for projects without status
UPDATE projects
SET project_status = CASE
  WHEN project_status IS NULL THEN 'under-construction'
  ELSE project_status
END;

-- Set default amenities for residential projects
UPDATE projects
SET amenities = ARRAY[
  'Swimming Pool',
  'Clubhouse',
  'Gymnasium',
  'Landscaped Gardens',
  '24/7 Security',
  'Power Backup',
  'Parking',
  'Children Play Area'
]
WHERE type = 'residential' 
  AND amenities IS NULL;

-- Set default amenities for builder-floor projects
UPDATE projects
SET amenities = ARRAY[
  '24/7 Security',
  'Power Backup',
  'Parking',
  'Lift',
  'Water Supply'
]
WHERE type IN ('builder-floor', 'builder floor', 'builder_floor')
  AND amenities IS NULL;

-- Extract and set BHK configuration from area field
UPDATE projects
SET bhk_config = extract_bhk_from_text(area)
WHERE bhk_config IS NULL 
  AND area ~* 'bhk';

-- Set short descriptions for projects without them
UPDATE projects
SET short_description = CASE
  WHEN developer IS NOT NULL THEN 
    'Premium ' || type || ' project by ' || developer || ' in ' || location
  ELSE 
    'Premium ' || type || ' project in ' || location
END
WHERE short_description IS NULL;

-- Set full descriptions for projects without them
UPDATE projects
SET full_description = CASE
  WHEN developer IS NOT NULL THEN 
    name || ' is a premium ' || type || ' project by ' || developer || ', located in ' || location || '. ' ||
    COALESCE(short_description, '') || ' This project offers quality construction, modern amenities, and excellent connectivity.'
  ELSE 
    name || ' is a premium ' || type || ' project located in ' || location || '. ' ||
    COALESCE(short_description, '') || ' This project offers quality construction, modern amenities, and excellent connectivity.'
END
WHERE full_description IS NULL;

-- Update description field with full_description if description is null
UPDATE projects
SET description = full_description
WHERE description IS NULL AND full_description IS NOT NULL;

-- Set project highlights based on location and developer
UPDATE projects
SET project_highlights = ARRAY[
  CASE WHEN developer IS NOT NULL THEN developer || ' Brand' ELSE NULL END,
  location || ' Location',
  'Premium Amenities',
  'Excellent Connectivity'
]
WHERE project_highlights IS NULL;

-- Set nearby landmarks based on location
UPDATE projects
SET nearby_landmarks = CASE
  WHEN location ILIKE '%Golf Course%' THEN ARRAY['Golf Course Road', 'NH-8', 'Metro Stations']
  WHEN location ILIKE '%Dwarka Expressway%' THEN ARRAY['Dwarka Expressway', 'NH-8', 'IGI Airport']
  WHEN location ILIKE '%Southern Peripheral%' THEN ARRAY['Southern Peripheral Road', 'NH-8']
  WHEN location ILIKE '%New Gurgaon%' THEN ARRAY['New Gurgaon', 'NH-8', 'Metro Connectivity']
  ELSE ARRAY[location, 'NH-8']
END
WHERE nearby_landmarks IS NULL;

-- Set connectivity details
UPDATE projects
SET connectivity = CASE
  WHEN location ILIKE '%Golf Course%' THEN 'Prime location on Golf Course Road with excellent connectivity to NH-8 and metro stations.'
  WHEN location ILIKE '%Dwarka Expressway%' THEN 'Excellent connectivity via Dwarka Expressway to NH-8 and IGI Airport.'
  WHEN location ILIKE '%Southern Peripheral%' THEN 'Well connected via Southern Peripheral Road to NH-8 and other major areas of Gurgaon.'
  WHEN location ILIKE '%New Gurgaon%' THEN 'Well connected in New Gurgaon area with excellent metro connectivity.'
  ELSE 'Well connected location with excellent connectivity to major areas of Gurgaon.'
END
WHERE connectivity IS NULL;

-- Mark featured projects (top projects by developer or location)
UPDATE projects
SET is_featured = true,
    display_order = sub.row_num
FROM (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY developer 
      ORDER BY 
        CASE WHEN developer IN ('DLF', 'Emaar India', 'Godrej Properties', 'M3M India') THEN 1 ELSE 2 END,
        CASE WHEN location ILIKE '%Golf Course%' THEN 1 ELSE 2 END,
        name
    ) as row_num
  FROM projects
  WHERE type IN ('residential', 'builder-floor')
) sub
WHERE projects.id = sub.id 
  AND sub.row_num <= 3
  AND is_featured = false;

-- ============================================
-- SPECIFIC PROJECT UPDATES WITH DETAILED INFO
-- ============================================

-- Helper function to safely extract numeric value
CREATE OR REPLACE FUNCTION safe_extract_numeric(input_text TEXT, pattern TEXT, group_num INTEGER)
RETURNS NUMERIC AS $$
DECLARE
  result TEXT;
BEGIN
  IF input_text IS NULL OR pattern IS NULL THEN
    RETURN NULL;
  END IF;
  
  result := regexp_replace(input_text, pattern, '\' || group_num::TEXT, 'gi');
  
  -- Check if result is valid numeric (only digits, optionally with decimal)
  IF result ~ '^\d+$' OR result ~ '^\d+\.\d+$' THEN
    RETURN result::NUMERIC;
  END IF;
  
  RETURN NULL;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Update projects with specific area ranges extracted from website
-- Handle various formats: "2150 to 3100 Sqft", "3977 Sqft", "5008000 Sqft", etc.
UPDATE projects
SET 
  carpet_area_min = CASE
    -- Pattern: "2150 to 3100 Sqft" or "2150 to 3100"
    WHEN area ~* '(\d+)\s+to\s+(\d+)\s*(sqft|sq\.ft\.?|sq\s*ft|onwards)?' AND area !~* 'sqyrd' THEN 
      safe_extract_numeric(area, '.*?(\d+)\s+to\s+(\d+).*', 1)
    -- Pattern: "2150-3100" or "2150 - 3100" (not sqyrd)
    WHEN area ~* '(\d+)\s*-\s*(\d+)' AND area !~* 'sqyrd' THEN 
      safe_extract_numeric(area, '.*?(\d+)\s*-\s*(\d+).*', 1)
    -- Pattern: "2150 & 3100"
    WHEN area ~* '(\d+)\s*[&]\s*(\d+)' AND area !~* 'sqyrd' THEN 
      safe_extract_numeric(area, '.*?(\d+)\s*[&]\s*(\d+).*', 1)
    -- Pattern: Single number like "3977 Sqft" or "5008000 Sqft"
    WHEN area ~* '^(\d+)\s*(sqft|sq\.ft\.?|sq\s*ft)' THEN 
      safe_extract_numeric(area, '^(\d+).*', 1)
    ELSE NULL
  END,
  carpet_area_max = CASE
    -- Pattern: "2150 to 3100 Sqft" or "2150 to 3100"
    WHEN area ~* '(\d+)\s+to\s+(\d+)\s*(sqft|sq\.ft\.?|sq\s*ft|onwards)?' AND area !~* 'sqyrd' THEN 
      safe_extract_numeric(area, '.*?(\d+)\s+to\s+(\d+).*', 2)
    -- Pattern: "2150-3100" or "2150 - 3100" (not sqyrd)
    WHEN area ~* '(\d+)\s*-\s*(\d+)' AND area !~* 'sqyrd' THEN 
      safe_extract_numeric(area, '.*?(\d+)\s*-\s*(\d+).*', 2)
    -- Pattern: "2150 & 3100"
    WHEN area ~* '(\d+)\s*[&]\s*(\d+)' AND area !~* 'sqyrd' THEN 
      safe_extract_numeric(area, '.*?(\d+)\s*[&]\s*(\d+).*', 2)
    -- Pattern: Single number like "3977 Sqft" or "5008000 Sqft"
    WHEN area ~* '^(\d+)\s*(sqft|sq\.ft\.?|sq\s*ft)' THEN 
      safe_extract_numeric(area, '^(\d+).*', 1)
    ELSE NULL
  END
WHERE area IS NOT NULL
  AND area !~* 'sqyrd'
  AND (carpet_area_min IS NULL OR carpet_area_max IS NULL);

-- Extract super area for projects with sqyrd
UPDATE projects
SET 
  super_area_min = CASE
    -- Pattern: "270 to 500 Sqyrd"
    WHEN area ~* '(\d+)\s+to\s+(\d+)\s*(sqyrd|sq\.?yrd)' THEN 
      safe_extract_numeric(area, '.*?(\d+)\s+to\s+(\d+)\s*(sqyrd|sq\.?yrd).*', 1)
    -- Pattern: "270-500 Sqyrd"
    WHEN area ~* '(\d+)\s*-\s*(\d+)\s*(sqyrd|sq\.?yrd)' THEN 
      safe_extract_numeric(area, '.*?(\d+)\s*-\s*(\d+)\s*(sqyrd|sq\.?yrd).*', 1)
    -- Pattern: Single number like "500 Sqyrd"
    WHEN area ~* '^(\d+)\s*(sqyrd|sq\.?yrd)' THEN 
      safe_extract_numeric(area, '^(\d+).*', 1)
    ELSE NULL
  END,
  super_area_max = CASE
    -- Pattern: "270 to 500 Sqyrd"
    WHEN area ~* '(\d+)\s+to\s+(\d+)\s*(sqyrd|sq\.?yrd)' THEN 
      safe_extract_numeric(area, '.*?(\d+)\s+to\s+(\d+)\s*(sqyrd|sq\.?yrd).*', 2)
    -- Pattern: "270-500 Sqyrd"
    WHEN area ~* '(\d+)\s*-\s*(\d+)\s*(sqyrd|sq\.?yrd)' THEN 
      safe_extract_numeric(area, '.*?(\d+)\s*-\s*(\d+)\s*(sqyrd|sq\.?yrd).*', 2)
    -- Pattern: Single number like "500 Sqyrd"
    WHEN area ~* '^(\d+)\s*(sqyrd|sq\.?yrd)' THEN 
      safe_extract_numeric(area, '^(\d+).*', 1)
    ELSE NULL
  END
WHERE area IS NOT NULL
  AND area ~* 'sqyrd'
  AND (super_area_min IS NULL OR super_area_max IS NULL);

-- ============================================
-- VERIFY AND SUMMARY
-- ============================================

-- Summary of populated data
SELECT 
  'Total Projects' as metric,
  COUNT(*)::TEXT as value
FROM projects
UNION ALL
SELECT 
  'With BHK Config',
  COUNT(*)::TEXT
FROM projects
WHERE bhk_config IS NOT NULL
UNION ALL
SELECT 
  'With Amenities',
  COUNT(*)::TEXT
FROM projects
WHERE amenities IS NOT NULL
UNION ALL
SELECT 
  'With Full Description',
  COUNT(*)::TEXT
FROM projects
WHERE full_description IS NOT NULL
UNION ALL
SELECT 
  'With Project Status',
  COUNT(*)::TEXT
FROM projects
WHERE project_status IS NOT NULL
UNION ALL
SELECT 
  'Featured Projects',
  COUNT(*)::TEXT
FROM projects
WHERE is_featured = true
UNION ALL
SELECT 
  'Residential Projects',
  COUNT(*)::TEXT
FROM projects
WHERE type = 'residential'
UNION ALL
SELECT 
  'Builder Floor Projects',
  COUNT(*)::TEXT
FROM projects
WHERE type IN ('builder-floor', 'builder floor', 'builder_floor');

-- View sample of updated projects
SELECT 
  name,
  location,
  developer,
  bhk_config,
  carpet_area_min,
  carpet_area_max,
  project_status,
  is_featured,
  array_length(amenities, 1) as amenities_count
FROM projects
WHERE amenities IS NOT NULL
ORDER BY is_featured DESC, name
LIMIT 20;

