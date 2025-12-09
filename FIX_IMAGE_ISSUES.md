# Fix Image Issues After Migration

## Issues Fixed:

1. ✅ **Main cover image can now be removed** - Added "Remove Cover Image" button
2. ✅ **Better logging** - Added console logs to track image operations
3. ✅ **Cache disabled** - Changed revalidate to 0 for immediate updates

## Additional Steps to Fix:

### Step 1: Verify RLS Policies for project_images

Run this in your NEW Supabase SQL Editor:

```sql
-- Check if project_images table has public read access
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'project_images';

-- If no policies exist, run PROJECT_IMAGES_TABLE.sql
-- Or create the policy manually:
CREATE POLICY "Allow public read access to project images"
ON project_images
FOR SELECT
TO public
USING (true);
```

### Step 2: Verify Images Were Inserted

Check if images are actually in the database:

```sql
-- Check project_images table
SELECT 
  id,
  project_id,
  image_url,
  display_order,
  created_at
FROM project_images
ORDER BY created_at DESC
LIMIT 10;

-- Check a specific project
SELECT 
  p.name as project_name,
  pi.image_url,
  pi.display_order
FROM project_images pi
JOIN projects p ON pi.project_id = p.id
WHERE p.slug = 'sobha-altus'  -- Replace with your project slug
ORDER BY pi.display_order;
```

### Step 3: Clear Next.js Cache

```bash
# Delete .next folder
rm -rf .next
# Or on Windows:
rmdir /s .next

# Restart server
npm run dev
```

### Step 4: Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Look for:
   - "Fetched X project images" - confirms images are being fetched
   - Any RLS errors
   - Any network errors

### Step 5: Test Image Insertion

After adding secondary images, check the console for:
- "✅ Project images inserted successfully" message
- Any error messages

### Step 6: Verify Image URLs

Make sure image URLs point to your NEW Supabase project:

```sql
-- Check if any images still point to old project
SELECT 
  id,
  image_url
FROM project_images
WHERE image_url LIKE '%bgombdxqcuuhuujmvbze%';

-- If found, update them (replace YOUR_NEW_REF):
UPDATE project_images
SET image_url = REPLACE(
  image_url,
  'https://bgombdxqcuuhuujmvbze.supabase.co',
  'https://YOUR_NEW_PROJECT_REF.supabase.co'
)
WHERE image_url LIKE '%bgombdxqcuuhuujmvbze%';
```

## Common Issues:

### Issue: Images not showing after adding

**Check:**
1. Browser console for errors
2. Server terminal for API errors
3. Database to verify images were inserted

**Solution:**
- Run `PROJECT_IMAGES_TABLE.sql` if table doesn't exist
- Verify RLS policies allow public reads
- Check image URLs are correct

### Issue: Main image still shows after deletion

**Solution:**
- Use the new "Remove Cover Image" button
- This will set `image_url` to `null` in the database
- Refresh the page after saving

### Issue: Cache showing old images

**Solution:**
- Clear `.next` folder
- Hard refresh browser (Ctrl+Shift+R)
- Check `revalidate` is set to 0 (for development)

## Testing Checklist:

- [ ] RLS policies exist for project_images
- [ ] Images are in project_images table
- [ ] Image URLs point to new Supabase project
- [ ] Console shows "Fetched X project images"
- [ ] "Remove Cover Image" button works
- [ ] Secondary images appear after adding
- [ ] Cache cleared and server restarted

