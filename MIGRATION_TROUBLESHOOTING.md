# Migration Troubleshooting Guide
## Projects Not Loading After Supabase Migration

This guide will help you diagnose and fix issues after migrating to a new Supabase project.

---

## Step 1: Verify Environment Variables

### Check `.env.local` file:

```env
# Verify these are updated with NEW project credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-new-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-new-service-role-key
```

### Steps:
1. **Get new credentials:**
   - Go to Supabase Dashboard → Project Settings → API
   - Copy Project URL and API keys

2. **Update `.env.local`:**
   - Replace ALL old values with new ones
   - Make sure there are no typos or extra spaces

3. **Restart development server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart
   npm run dev
   ```

---

## Step 2: Check Browser Console for Errors

1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Look for errors:**
   - Supabase connection errors
   - API errors
   - CORS errors
   - Authentication errors

### Common Errors:

**Error: "Invalid API key"**
- Solution: Check environment variables are correct

**Error: "Failed to fetch"**
- Solution: Check Supabase URL is correct

**Error: "Row Level Security policy violation"**
- Solution: RLS policies not migrated correctly (see Step 4)

---

## Step 3: Verify Database Data

### Check if data exists:

1. **Go to Supabase Dashboard → Table Editor**
2. **Check `projects` table:**
   - Does it have rows?
   - Are the columns populated?
   - Check `image_url` values

3. **Run this query in SQL Editor:**
   ```sql
   -- Check project count
   SELECT COUNT(*) FROM projects;
   
   -- Check if projects have images
   SELECT id, name, image_url FROM projects LIMIT 5;
   
   -- Check project_images table
   SELECT COUNT(*) FROM project_images;
   ```

---

## Step 4: Verify Row Level Security (RLS)

### Check RLS is enabled and policies exist:

1. **Run this in SQL Editor:**
   ```sql
   -- Check if RLS is enabled
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   
   -- Check policies exist
   SELECT schemaname, tablename, policyname 
   FROM pg_policies 
   WHERE schemaname = 'public';
   ```

2. **If RLS policies are missing:**
   - Run `ADMIN_RLS_SETUP.sql` in your new project
   - This sets up all necessary RLS policies

---

## Step 5: Check Storage Files

### Verify images are uploaded:

1. **Go to Storage → `project-images` bucket**
2. **Check if files exist:**
   - Navigate to `properties/` folder
   - Verify images are there

3. **Check image URLs in database:**
   ```sql
   -- Check image URLs
   SELECT id, name, image_url 
   FROM projects 
   WHERE image_url IS NOT NULL 
   LIMIT 5;
   ```

4. **If URLs are from old project:**
   - URLs will still point to old Supabase project
   - You need to update them OR re-upload files

### Update Image URLs:

**Option A: Re-upload all images** (Recommended if files weren't migrated)
- Upload all images to new storage bucket
- Update URLs in database using `UPDATE_IMAGE_URLS.sql`

**Option B: Update URLs in database** (If files are already in new storage)
- Use the script `UPDATE_IMAGE_URLS.sql`
- Replace `YOUR_NEW_PROJECT_REF` with your new project reference
- Run the UPDATE statements
- This updates:
  - `projects.image_url`
  - `projects.brochure_url`
  - `project_images.image_url`

**Quick Update:**
```sql
-- Replace bgombdxqcuuhuujmvbze with your new project reference
UPDATE projects 
SET image_url = REPLACE(
  image_url, 
  'https://bgombdxqcuuhuujmvbze.supabase.co',
  'https://YOUR_NEW_PROJECT_REF.supabase.co'
)
WHERE image_url LIKE '%bgombdxqcuuhuujmvbze.supabase.co%';
```

---

## Step 6: Test API Routes

### Check if API routes are working:

1. **Test projects API:**
   ```bash
   # In browser console or Postman
   fetch('http://localhost:3000/api/projects')
     .then(r => r.json())
     .then(console.log)
   ```

2. **Check server logs:**
   - Look for errors in terminal where `npm run dev` is running
   - Check for Supabase connection errors

---

## Step 7: Clear Cache and Restart

1. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   # Or on Windows:
   rmdir /s .next
   ```

2. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear browser cache completely

3. **Restart development server:**
   ```bash
   npm run dev
   ```

---

## Step 8: Check Specific Issues

### Issue: Projects page shows "No projects found"

**Check:**
```sql
-- Verify projects exist
SELECT COUNT(*) FROM projects WHERE type = 'apartment';
SELECT COUNT(*) FROM projects WHERE type = 'builder-floor';
```

**Solution:**
- If count is 0, data wasn't imported correctly
- Re-import data from old database

### Issue: Images not displaying

**Check:**
1. Image URLs in database
2. Storage bucket is public
3. Files are uploaded to storage

**Solution:**
```sql
-- Check if image URLs are correct
SELECT id, name, image_url 
FROM projects 
WHERE image_url IS NOT NULL;
```

### Issue: "Unauthorized" errors

**Check:**
- RLS policies are set up
- Service role key is correct
- API routes are using correct client

**Solution:**
- Run `ADMIN_RLS_SETUP.sql`
- Verify `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

---

## Step 9: Verify Database Connection

### Test connection directly:

1. **Create a test file** `test-connection.js`:
   ```javascript
   const { createClient } = require('@supabase/supabase-js')
   
   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
   const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
   
   const supabase = createClient(supabaseUrl, supabaseKey)
   
   async function test() {
     const { data, error } = await supabase
       .from('projects')
       .select('*')
       .limit(1)
     
     if (error) {
       console.error('Error:', error)
     } else {
       console.log('Success! Data:', data)
     }
   }
   
   test()
   ```

2. **Run it:**
   ```bash
   node test-connection.js
   ```

---

## Step 10: Check Network Tab

1. **Open browser DevTools → Network tab**
2. **Reload the page**
3. **Look for failed requests:**
   - Red requests = errors
   - Check response for error messages
   - Check request URLs are correct

---

## Quick Diagnostic Checklist

Run these checks in order:

- [ ] Environment variables updated in `.env.local`
- [ ] Development server restarted after updating env vars
- [ ] Browser console shows no errors
- [ ] Database has data (check Table Editor)
- [ ] RLS policies are set up (run ADMIN_RLS_SETUP.sql)
- [ ] Storage bucket exists and is public
- [ ] Images/files are uploaded to storage
- [ ] Image URLs in database are correct
- [ ] API routes are working
- [ ] Next.js cache cleared
- [ ] Browser cache cleared

---

## Common Solutions Summary

| Problem | Solution |
|---------|----------|
| Projects not loading | Check env vars, restart server, verify data exists |
| Images not showing | Upload files to storage, update URLs in database |
| "Unauthorized" errors | Run ADMIN_RLS_SETUP.sql, check service role key |
| "Invalid API key" | Update environment variables with new keys |
| Empty project list | Verify data was imported, check RLS policies |
| CORS errors | Check Supabase URL is correct |

---

## Still Not Working?

If none of the above works:

1. **Check Supabase Dashboard:**
   - Is the project active?
   - Are there any project warnings/errors?
   - Check project logs

2. **Compare old vs new:**
   - Compare table structures
   - Compare RLS policies
   - Compare data counts

3. **Contact Support:**
   - Supabase support: support@supabase.com
   - Or check Supabase Discord community

