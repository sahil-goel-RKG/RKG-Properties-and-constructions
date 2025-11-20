# Projects Data Population Guide

## Overview

This guide helps you populate the projects table with comprehensive data from reiasindia.com.

## Step 1: Update Table Schema

First, run the schema update script to add new columns:

```sql
-- Run this in Supabase SQL Editor
-- File: UPDATE_PROJECTS_TABLE_SCHEMA.sql
```

This adds columns for:
- BHK configuration
- Area details (carpet, built-up, super area)
- Price ranges
- Project status
- Amenities
- Project highlights
- Nearby landmarks
- Connectivity details
- And more...

## Step 2: Populate Comprehensive Data

Run the comprehensive population script:

```sql
-- Run this in Supabase SQL Editor
-- File: POPULATE_ALL_PROJECTS_COMPREHENSIVE.sql
```

This script:
- ✅ Extracts BHK from area text
- ✅ Sets default amenities for all projects
- ✅ Creates descriptions automatically
- ✅ Sets project highlights
- ✅ Sets nearby landmarks
- ✅ Sets connectivity details
- ✅ Marks featured projects
- ✅ Extracts area ranges from text

## Step 3: Add Specific Project Details (Optional)

For specific projects with detailed information, run:

```sql
-- Run this in Supabase SQL Editor
-- File: POPULATE_PROJECTS_DETAILED_DATA.sql
```

This updates specific projects with:
- Detailed descriptions
- Specific amenities
- Project highlights
- Nearby landmarks
- Connectivity details

## New Columns Added

### Basic Details
- `bhk_config` - Array of BHK options (e.g., ['2BHK', '3BHK', '4BHK'])
- `short_description` - Brief one-line description
- `full_description` - Comprehensive project description
- `project_type_detail` - Detailed project type

### Area Information
- `carpet_area_min` - Minimum carpet area in sqft
- `carpet_area_max` - Maximum carpet area in sqft
- `built_up_area_min` - Minimum built-up area in sqft
- `built_up_area_max` - Maximum built-up area in sqft
- `super_area_min` - Minimum super area in sqft
- `super_area_max` - Maximum super area in sqft

### Price Information
- `price_min` - Minimum price in rupees
- `price_max` - Maximum price in rupees
- `price_per_sqft` - Price per square foot

### Project Status
- `project_status` - 'under-construction', 'ready-to-move', 'upcoming', 'completed'
- `possession_date` - Expected possession date
- `rera_number` - RERA registration number

### Project Details
- `total_towers` - Number of towers
- `total_floors` - Number of floors per tower
- `total_units` - Total number of units
- `amenities` - Array of amenities
- `project_highlights` - Array of key highlights
- `nearby_landmarks` - Array of nearby landmarks
- `connectivity` - Connectivity details
- `payment_plan` - Payment plan details

### Media & Documents
- `floor_plan_url` - URL to floor plan
- `brochure_url` - URL to project brochure
- `video_url` - URL to project video

### Metadata
- `is_featured` - Featured project flag
- `is_active` - Active status
- `display_order` - Display order
- `updated_at` - Last update timestamp

## Verification

After running the scripts, verify the data:

```sql
-- Check data completeness
SELECT 
  COUNT(*) FILTER (WHERE bhk_config IS NOT NULL) as with_bhk,
  COUNT(*) FILTER (WHERE amenities IS NOT NULL) as with_amenities,
  COUNT(*) FILTER (WHERE full_description IS NOT NULL) as with_full_desc,
  COUNT(*) FILTER (WHERE project_status IS NOT NULL) as with_status,
  COUNT(*) as total
FROM projects;

-- View featured projects
SELECT name, location, developer, bhk_config, project_status, is_featured
FROM projects
WHERE is_featured = true
ORDER BY display_order;
```

## Manual Updates

You can manually update specific projects in Supabase:

1. Go to Table Editor → `projects`
2. Click on a project row
3. Update fields like:
   - `full_description` - Add comprehensive description
   - `amenities` - Add specific amenities
   - `project_highlights` - Add key highlights
   - `rera_number` - Add RERA number
   - `possession_date` - Add possession date
   - `price_min` / `price_max` - Add price range

## Using the Data

The enhanced project data is now available for:

1. **Project Detail Pages** - Show comprehensive information
2. **Search & Filters** - Filter by BHK, amenities, status
3. **Featured Projects** - Display featured projects prominently
4. **Project Cards** - Show more details in listings

## Next Steps

1. ✅ Update table schema
2. ✅ Populate comprehensive data
3. 🔄 Update project detail pages to show new fields
4. 🔄 Add filters for BHK, amenities, status
5. 🔄 Update project cards to show more information

