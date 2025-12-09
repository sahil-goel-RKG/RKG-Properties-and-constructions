# Supabase Database Migration Guide
## Moving from Unofficial to Official Google Account

This guide will help you migrate your entire Supabase database, storage, and configuration from your unofficial Google account to your official Google account.

---

## Prerequisites

1. Access to your current Supabase project (unofficial account)
2. Access to your official Google account
3. Supabase CLI installed (optional but recommended)
4. Backup of your `.env.local` file

---

## Step 1: Export Database Schema and Data

### Option A: Using Supabase Dashboard (Recommended)

1. **Go to your current Supabase project** (unofficial account)
2. **Navigate to SQL Editor**
3. **Run the following to export schema:**
   ```sql
   -- Export all table schemas
   SELECT 
     'CREATE TABLE ' || table_name || ' (' || 
     string_agg(column_name || ' ' || data_type || 
     CASE 
       WHEN character_maximum_length IS NOT NULL 
       THEN '(' || character_maximum_length || ')'
       ELSE ''
     END || 
     CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END,
     ', '
     ORDER BY ordinal_position
     ) || ');' as create_statement
   FROM information_schema.columns
   WHERE table_schema = 'public'
   GROUP BY table_name;
   ```

4. **Export all data:**
   - Go to **Table Editor** → Select each table → Click **Export** → Choose **CSV** or **JSON**
   - OR use the SQL Editor to export:
   ```sql
   -- Example: Export projects table
   COPY projects TO STDOUT WITH CSV HEADER;
   ```

### Option B: Using Supabase CLI (Faster)

1. **Install Supabase CLI** (if not installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Link to your project:**
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Export database:**
   ```bash
   # Export schema
   supabase db dump -f schema.sql
   
   # Export data
   supabase db dump --data-only -f data.sql
   ```

---

## Step 2: Export Storage Files

1. **Go to Storage** in your current Supabase project
2. **Download all files from `project-images` bucket:**
   - Navigate to Storage → `project-images` bucket
   - Download the entire `properties` folder structure
   - OR use Supabase CLI:
   ```bash
   # List all files
   supabase storage ls project-images
   
   # Download entire bucket (if CLI supports it)
   # Or manually download via dashboard
   ```

---

## Step 3: Create New Supabase Project

1. **Log out** from your unofficial Google account
2. **Log in** to Supabase with your **official Google account**
3. **Create a new project:**
   - Go to https://supabase.com/dashboard
   - Click **New Project**
   - Choose the same **Organization** (or create new)
   - Enter project name (e.g., "RKG Properties Official")
   - Set database password (save it securely!)
   - Choose region (same as before if possible)
   - Click **Create new project**

4. **Wait for project to be ready** (2-3 minutes)

---

## Step 4: Export Views (if any)

If you have views in your database:

1. **Go to SQL Editor** in your OLD project
2. **Run the view export query:**
   ```sql
   -- Get all view definitions
   SELECT 
     'CREATE OR REPLACE VIEW ' || viewname || ' AS ' || definition || ';' as create_view_statement
   FROM pg_views
   WHERE schemaname = 'public'
   ORDER BY viewname;
   ```
3. **Copy the CREATE VIEW statements** - you'll need them for the new database
4. **For materialized views** (if any):
   ```sql
   SELECT 
     'CREATE MATERIALIZED VIEW ' || matviewname || ' AS ' || definition || ';' as create_materialized_view_statement
   FROM pg_matviews
   WHERE schemaname = 'public'
   ORDER BY matviewname;
   ```

**Note:** See `EXPORT_VIEWS.sql` for complete view export script.

---

## Step 5: Import Database Schema

1. **Go to SQL Editor** in your new project
2. **Run your schema SQL:**
   - If you used Option A: Copy and paste the CREATE TABLE statements
   - If you used Option B: Run `schema.sql` file
   - OR use the consolidated migration file:
   ```sql
   -- Run COMPLETE_DATABASE_MIGRATION.sql
   -- This includes all your table structures
   ```

3. **Verify tables are created:**
   - Go to **Table Editor** → Check all tables exist

4. **Import Views** (if you exported any):
   - Paste and run the CREATE VIEW statements from Step 4
   - Verify views are created:
   ```sql
   SELECT viewname FROM pg_views WHERE schemaname = 'public';
   ```

---

## Step 5: Import Data

### Option A: Using SQL Editor

1. **For each table, insert data:**
   ```sql
   -- Example for projects table
   COPY projects FROM STDIN WITH CSV HEADER;
   -- Paste your CSV data here
   ```

### Option B: Using Supabase CLI

```bash
# Link to new project
supabase link --project-ref new-project-ref

# Import data
supabase db reset --db-url "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
# Then restore from backup
psql -h [HOST] -U postgres -d postgres -f data.sql
```

### Option C: Manual Import (Small datasets)

1. Go to **Table Editor** → Select table
2. Click **Insert row** → Manually enter data
3. OR use **Import data** feature (if available)

---

## Step 7: Set Up Storage

1. **Create storage bucket:**
   - Go to **Storage** → **New bucket**
   - Name: `project-images`
   - Make it **Public** (for public access)

2. **Upload files:**
   - Navigate to `project-images` bucket
   - Upload the entire `properties` folder structure
   - Maintain the same folder structure:
     ```
     project-images/
     └── properties/
         ├── sobha-altus/
         │   ├── cover-xxx.jpg
         │   ├── image-xxx.jpg
         │   └── brochure-xxx.pdf
         └── ...
     ```

3. **Set bucket policies:**
   - Go to **Storage** → **Policies**
   - Ensure public read access is enabled

---

## Step 8: Set Up Row Level Security (RLS)

1. **Run RLS setup SQL:**
   ```sql
   -- Run ADMIN_RLS_SETUP.sql
   -- This sets up all RLS policies
   ```

2. **Verify policies:**
   - Go to **Authentication** → **Policies**
   - Check all tables have appropriate policies

---

## Step 9: Update Environment Variables

1. **Get new project credentials:**
   - Go to **Project Settings** → **API**
   - Copy:
     - Project URL
     - `anon` public key
     - `service_role` secret key

2. **Update `.env.local` file:**
   ```env
   # Old values (comment out or remove)
   # NEXT_PUBLIC_SUPABASE_URL=https://old-project.supabase.co
   # NEXT_PUBLIC_SUPABASE_ANON_KEY=old-anon-key
   # SUPABASE_SERVICE_ROLE_KEY=old-service-key

   # New values
   NEXT_PUBLIC_SUPABASE_URL=https://new-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=new-anon-key
   SUPABASE_SERVICE_ROLE_KEY=new-service-role-key
   ```

3. **Update Clerk webhook URL** (if using):
   - Go to Clerk Dashboard → Webhooks
   - Update webhook URL to point to new Supabase project

---

## Step 10: Test the Migration

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Test key functionality:**
   - ✅ Home page loads
   - ✅ Projects list displays
   - ✅ Project details page works
   - ✅ Images load correctly
   - ✅ Admin login works
   - ✅ Add/Edit property works
   - ✅ File uploads work

3. **Check database:**
   - Verify all tables have data
   - Check image URLs are correct
   - Verify brochure URLs work

---

## Step 11: Update Production Environment

If you have a production deployment:

1. **Update production environment variables:**
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Environment Variables
   - Other: Update according to your platform

2. **Redeploy your application**

---

## Step 12: Clean Up Old Project (Optional)

⚠️ **Only after confirming everything works!**

1. **Export final backup** from old project
2. **Delete old Supabase project:**
   - Go to Project Settings → General
   - Scroll down → Delete Project
   - Confirm deletion

---

## Troubleshooting

### Issue: Images not loading
- **Solution:** Check storage bucket is public and files are uploaded correctly
- Verify image URLs in database match new storage paths

### Issue: RLS blocking access
- **Solution:** Re-run `ADMIN_RLS_SETUP.sql` in new project
- Check policies are correctly applied

### Issue: Authentication not working
- **Solution:** Update Clerk environment variables
- Re-configure Clerk webhooks

### Issue: Missing data
- **Solution:** Re-export and re-import data from old project
- Check for foreign key constraints

---

## Quick Checklist

- [ ] Exported database schema
- [ ] Exported views (if any)
- [ ] Exported all data
- [ ] Downloaded storage files
- [ ] Created new Supabase project
- [ ] Imported database schema
- [ ] Imported views (if any)
- [ ] Imported all data
- [ ] Created storage bucket
- [ ] Uploaded all files
- [ ] Set up RLS policies
- [ ] Updated environment variables
- [ ] Tested all functionality
- [ ] Updated production environment
- [ ] Verified everything works

---

## Important Notes

1. **Keep old project active** until migration is fully verified
2. **Test thoroughly** before deleting old project
3. **Update all environment variables** in all environments
4. **Backup everything** before starting migration
5. **Document any custom configurations** you had

---

## Need Help?

If you encounter issues:
1. Check Supabase documentation: https://supabase.com/docs
2. Review migration logs
3. Contact Supabase support if needed

---

## Alternative: Supabase Support

If you prefer, you can contact Supabase support to help with the migration:
- Email: support@supabase.com
- They may be able to transfer the project directly

