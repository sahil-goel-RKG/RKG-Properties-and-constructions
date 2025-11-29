# Guide: Adding Images for Sobha Altus Project

This guide explains how to add images for the Sobha Altus project to your database.

## Option 1: Using SQL Script (Recommended if you have image URLs)

If your images are already hosted somewhere (Supabase Storage, AWS S3, CDN, etc.):

1. **Open** `ADD_SOBHA_ALTUS_IMAGES.sql`
2. **Replace** the placeholder URLs in the `image_urls` array with your actual image URLs
3. **Run** the script in Supabase SQL Editor

**Example:**
```sql
image_urls TEXT[] := ARRAY[
    'https://bgombdxqcuuhuujmvbze.supabase.co/storage/v1/object/public/project-images/properties/sobha-altus/image1.jpg',
    'https://bgombdxqcuuhuujmvbze.supabase.co/storage/v1/object/public/project-images/properties/sobha-altus/image2.jpg',
    'https://bgombdxqcuuhuujmvbze.supabase.co/storage/v1/object/public/project-images/properties/sobha-altus/image3.jpg'
];
```

## Option 2: Using Node.js Script (If you have local image files)

If you have image files on your computer:

1. **Create a folder** for images:
   ```bash
   mkdir sobha-altus-images
   ```

2. **Place your images** in the `sobha-altus-images` folder

3. **Update** `scripts/add-sobha-altus-images.js`:
   - Add your image filenames to the `IMAGE_FILES` array
   - Example: `['image1.jpg', 'image2.jpg', 'image3.jpg']`

4. **Install dependencies** (if not already installed):
   ```bash
   npm install dotenv form-data node-fetch
   ```

5. **Run the script**:
   ```bash
   node scripts/add-sobha-altus-images.js
   ```

The script will:
- Upload images to Supabase Storage
- Add image records to the `project_images` table
- Set display order automatically

## Option 3: Using Admin Interface (Manual Upload)

1. **Log in** to your admin panel: `/admin`
2. **Go to** Edit Property for Sobha Altus
3. **Scroll to** the "Additional Images" section
4. **Upload images** using the file input
5. **Click Save**

## Uploading Images to Supabase Storage First

If you need to upload images to Supabase Storage first:

### Using Supabase Dashboard:
1. Go to Supabase Dashboard → Storage
2. Navigate to `project-images` bucket
3. Create folder: `properties/sobha-altus/`
4. Upload your images there
5. Copy the public URLs
6. Use Option 1 (SQL script) with those URLs

### Using Supabase CLI:
```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login
supabase login

# Upload images
supabase storage upload project-images properties/sobha-altus/image1.jpg --file ./path/to/image1.jpg
```

## Finding Your Project

The script looks for a project with slug `sobha-altus`. If your project has a different slug:

1. **Check your project slug** in the database:
   ```sql
   SELECT id, name, slug FROM projects WHERE name ILIKE '%sobha%altus%';
   ```

2. **Update the script** with the correct slug

## Verification

After adding images, verify they were added:

```sql
SELECT 
    pi.id,
    pi.image_url,
    pi.display_order,
    p.name as project_name
FROM project_images pi
JOIN projects p ON pi.project_id = p.id
WHERE p.slug = 'sobha-altus'
ORDER BY pi.display_order;
```

Or simply visit the project details page: `/projects/sobha-altus`

## Troubleshooting

### Error: "Project not found"
- Check that the project slug is correct
- Verify the project exists in the database

### Error: "Duplicate key violation"
- The image URL already exists for this project
- This is normal if you run the script multiple times
- The script uses `ON CONFLICT DO NOTHING` to handle this

### Error: "Storage bucket not found"
- Ensure the `project-images` bucket exists in Supabase Storage
- Check bucket permissions (should be public for read access)

### Images not showing on the page
- Clear browser cache
- Check that image URLs are accessible (open in browser)
- Verify `project_images` table has RLS policies enabled

## Need Help?

If you have image URLs ready, use **Option 1 (SQL script)** - it's the quickest method.
If you have local files, use **Option 2 (Node.js script)** - it handles uploads automatically.

