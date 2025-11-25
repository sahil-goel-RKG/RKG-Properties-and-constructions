# Database Update Notes

This file tracks all database changes, modifications, and updates that need to be implemented.

---

## Pending Changes

### 2025-01-XX - Add Club House Fields
- **Status**: ⏳ Pending
- **Change**: Add club house checkbox and area field to projects table
- **Tables Affected**: `projects`
- **SQL Script**: `ADD_CLUB_HOUSE_COLUMNS.sql`
- **Details**:
  - Add `club_house` column (BOOLEAN, default false)
  - Add `club_house_area` column (TEXT, nullable)
  - When club_house is checked, allow entering area
- **Notes**: 
  - Forms updated: Add listing form, Edit property form
  - Display updated: Project details page
  - Need to run SQL migration to add columns to database

### 2025-01-XX - Add Tower BHK Configuration
- **Status**: ⏳ Pending
- **Change**: Add `tower_bhk_config` column (JSONB or TEXT) to store tower-based BHK configuration
- **Tables Affected**: `projects`
- **SQL Script**: `ADD_TOWER_BHK_CONFIG.sql`
- **Details**:
  - Replaces simple `bhk_config` array with detailed tower-based structure
  - Each tower can have: BHK, Area (acres), Flats/Floor, Floors in Tower (e.g., G+14), No. of Lifts, Penthouse checkbox, Parking/Floor
  - Supports multiple towers per project
  - Legacy `bhk_config` field is maintained for backward compatibility
  - `parking_per_floor` is stored within the tower_bhk_config JSON structure (not a separate column)
- **Notes**: 
  - Forms updated: Add listing form (moved payment plan to step 3), Edit property form
  - Display updated: Project details page shows tower-based configuration
  - Payment plan moved to step 3 (Images & Payment section) in add-listing form
  - Status and Parking fields removed from Project Information section
  - Parking/Floor added to BHK Configuration section
  - Need to run SQL migration to add column to database

---

## Completed Changes

### 2025-01-XX - Property Type Update
- **Status**: ✅ Completed
- **Change**: Updated property type from 'residential' to 'apartment'
- **Files**: 
  - `UPDATE_RESIDENTIAL_TO_APARTMENT.sql` - SQL migration script
  - Updated all application code to use 'apartment' instead of 'residential'
- **Notes**: Constraint was updated to allow 'apartment' type, and all existing records were migrated.

---

## Change Log Format

When adding new changes, use this format:

```markdown
### YYYY-MM-DD - [Brief Description]
- **Status**: ⏳ Pending / ✅ Completed / ❌ Cancelled
- **Change**: [Detailed description of what needs to be changed]
- **Tables Affected**: [List of database tables]
- **SQL Script**: [Name of SQL file if applicable]
- **Notes**: [Any additional notes or considerations]
```

---

## Instructions

1. Add new database changes below in the "Pending Changes" section
2. Update status as work progresses
3. Move completed items to "Completed Changes" section
4. Include SQL scripts, table names, and any relevant notes

