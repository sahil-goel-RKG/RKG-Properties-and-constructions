# Developers Database Setup Guide

This guide explains how to set up and use the dynamic developers database system.

## Overview

The developers table stores comprehensive information about real estate developers, making it easy to:
- Display developer profiles with detailed information
- Track developer statistics automatically
- Manage developer data dynamically
- Sync data from the projects table

## Setup Instructions

### 1. Create the Developers Table

Run the SQL script in your Supabase SQL Editor:

```bash
# Copy and paste the contents of DEVELOPERS_TABLE_SETUP.sql
# into Supabase SQL Editor and execute
```

This will create:
- `developers` table with all necessary columns
- Indexes for optimal performance
- RLS policies for security
- Helper functions for auto-syncing statistics
- Initial data from reiasindia.com

### 2. Sync Developers from Projects Table

After creating the table, sync all developers that exist in your projects:

**Option A: Using API Endpoint**
```bash
POST /api/developers/sync-from-projects
```

**Option B: Using Node Script**
```bash
node scripts/sync-developers-from-projects.js
```

This will:
- Extract all unique developers from the `projects` table
- Insert them into the `developers` table
- Auto-generate slugs
- Sync statistics (total projects, residential, commercial, etc.)

### 3. Update Developer Information

You can update developer details using the API:

```bash
POST /api/developers/update
Content-Type: application/json

{
  "name": "DLF",
  "logo_url": "/img/developers/dlf.png",
  "description": "DLF Limited is India's largest real estate company...",
  "short_description": "India's largest real estate developer",
  "website": "https://www.dlf.in",
  "email": "info@dlf.in",
  "phone": "+91-11-xxxx-xxxx",
  "office_address": "DLF Centre, Sansad Marg, New Delhi",
  "established_year": 1946,
  "rera_registration": "RC/HARERA/GGM/xxxx",
  "is_featured": true,
  "display_order": 1
}
```

### 4. Sync Statistics Regularly

Developer statistics (project counts, locations) are automatically calculated from the projects table. To sync:

```bash
POST /api/developers/sync-stats
```

Or use the SQL function directly:
```sql
SELECT sync_developer_stats();
```

## Database Schema

### Developers Table Columns

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Developer name (unique) |
| `slug` | TEXT | URL-friendly slug (unique) |
| `logo_url` | TEXT | Path to developer logo |
| `description` | TEXT | Full description |
| `short_description` | TEXT | Brief description |
| `website` | TEXT | Official website URL |
| `email` | TEXT | Contact email |
| `phone` | TEXT | Contact phone |
| `office_address` | TEXT | Office address |
| `established_year` | INTEGER | Year established |
| `company_type` | TEXT | Company type |
| `rera_registration` | TEXT | RERA registration number |
| `total_projects` | INTEGER | Total project count |
| `residential_projects` | INTEGER | Residential project count |
| `commercial_projects` | INTEGER | Commercial project count |
| `builder_floor_projects` | INTEGER | Builder floor project count |
| `locations` | TEXT[] | Array of locations |
| `specialties` | TEXT[] | Array of specialties |
| `awards` | TEXT[] | Array of awards |
| `certifications` | TEXT[] | Array of certifications |
| `linkedin_url` | TEXT | LinkedIn URL |
| `facebook_url` | TEXT | Facebook URL |
| `twitter_url` | TEXT | Twitter URL |
| `instagram_url` | TEXT | Instagram URL |
| `is_featured` | BOOLEAN | Featured developer flag |
| `is_active` | BOOLEAN | Active status |
| `display_order` | INTEGER | Display order |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

## API Endpoints

### 1. Sync Developers from Projects
```
POST /api/developers/sync-from-projects
```
Syncs all developers from the projects table into the developers table.

### 2. Update Developer
```
POST /api/developers/update
Body: { name, logo_url, description, ... }
```
Creates or updates a developer record.

### 3. Sync Statistics
```
POST /api/developers/sync-stats
```
Syncs developer statistics from the projects table.

## SQL Functions

### `sync_developer_stats()`
Automatically updates all developer statistics from the projects table.

```sql
SELECT sync_developer_stats();
```

### `generate_developer_slug(name)`
Generates a URL-friendly slug from developer name.

```sql
SELECT generate_developer_slug('DLF Limited');
-- Returns: 'dlf-limited'
```

## Views

### `developer_statistics`
A view that provides real-time statistics for all developers:

```sql
SELECT * FROM developer_statistics
ORDER BY total_projects_count DESC;
```

## Usage in Code

### Fetch All Developers
```javascript
const { data, error } = await supabase
  .from('developers')
  .select('*')
  .eq('is_active', true)
  .order('display_order', { ascending: true })
```

### Fetch Developer by Slug
```javascript
const { data, error } = await supabase
  .from('developers')
  .select('*')
  .eq('slug', 'dlf')
  .single()
```

### Fetch Featured Developers
```javascript
const { data, error } = await supabase
  .from('developers')
  .select('*')
  .eq('is_featured', true)
  .eq('is_active', true)
  .order('display_order', { ascending: true })
```

## Maintenance

### Regular Tasks

1. **Sync Statistics Weekly**
   - Run `sync_developer_stats()` function
   - Or call `/api/developers/sync-stats` endpoint

2. **Update Developer Information**
   - Add descriptions, contact info, social media links
   - Update logos and images

3. **Sync New Developers**
   - When new projects are added, run sync-from-projects
   - Or manually add developers via the update API

## Notes

- Developer statistics are calculated from the `projects` table
- The `sync_developer_stats()` function should be run after any project updates
- Slugs are auto-generated but can be manually set
- All timestamps are automatically managed by triggers

## Troubleshooting

### Developers not showing up?
1. Check if `is_active = true`
2. Verify RLS policies allow public read access
3. Run sync-from-projects to ensure all developers are in the table

### Statistics not updating?
1. Run `sync_developer_stats()` function
2. Check that project `developer` field matches developer `name` exactly
3. Verify projects table has the correct developer names

### Slug conflicts?
- Slugs must be unique
- The system auto-generates slugs, but you can override them
- Check for duplicate slugs in the database

