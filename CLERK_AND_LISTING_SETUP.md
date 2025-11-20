# Clerk Authentication & Add Listing Setup Guide

This guide will help you set up Clerk authentication and the add listing functionality for your real estate website.

## 1. Install Dependencies

Run the following command to install Clerk:

```bash
npm install @clerk/nextjs
```

## 2. Set Up Clerk

1. Go to [https://clerk.com](https://clerk.com) and create an account or sign in
2. Create a new application
3. Copy your API keys from the Clerk Dashboard:
   - Go to **API Keys** section
   - Copy the following keys:
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
     - `CLERK_SECRET_KEY`

4. Add these to your `.env.local` file:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Your existing Supabase keys
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Required for admin API routes
```

## 3. Set Up Supabase Database

### Create the `project_images` table

Run the following SQL in your Supabase SQL Editor:

```sql
-- Run the SQL from PROJECT_IMAGES_TABLE.sql file
```

Or manually:

```sql
CREATE TABLE IF NOT EXISTS project_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, image_url)
);

CREATE INDEX IF NOT EXISTS idx_project_images_project_id ON project_images(project_id);
CREATE INDEX IF NOT EXISTS idx_project_images_display_order ON project_images(display_order);

ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to project images"
ON project_images FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to insert project images"
ON project_images FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update project images"
ON project_images FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete project images"
ON project_images FOR DELETE TO authenticated USING (true);
```

## 4. Configure Supabase Storage

✅ **Note**: The `project-images` storage bucket is already configured in your Supabase project.

If you need to verify or reconfigure it:

1. Go to **Storage** in your Supabase dashboard
2. Ensure you have a bucket named `project-images`
3. If the bucket doesn't exist, create it:
   - Click **New bucket**
   - Name: `project-images`
   - **Make it public** (or set appropriate RLS policies)

4. Set up Storage RLS Policies (if needed):

```sql
-- Allow public read access
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-images');

-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-images');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Allow authenticated users to update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'project-images');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Allow authenticated users to delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-images');
```

## 5. Configure Projects Table RLS (if needed)

Ensure your `projects` table allows authenticated users to insert:

```sql
-- If you haven't already, allow authenticated users to insert projects
CREATE POLICY "Allow authenticated users to insert projects"
ON projects FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update projects
CREATE POLICY "Allow authenticated users to update projects"
ON projects FOR UPDATE
TO authenticated
USING (true);
```

## 6. Set Up Clerk Webhook (Optional)

If you want to sync Clerk users with Supabase:

1. Go to **Webhooks** in Clerk Dashboard
2. Add a new endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Subscribe to events:
   - `user.created`
   - `user.updated`
   - `user.deleted`

4. Create the webhook handler at `app/api/webhooks/clerk/route.js` (optional, not required for basic functionality)

## 7. Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`
3. Scroll to the bottom of the page and click **Admin Login** in the footer
4. Sign up for a new account or sign in with Clerk
5. After logging in, you'll be redirected to the **Admin Dashboard** at `/admin`
6. You should see:
   - Welcome message with your name/email
   - **Add New Listing** button
   - **Contact Form Submissions** table (if any submissions exist)
7. Click **Add New Listing** to test the form
8. Fill in the form and upload images (cover image + additional images)
9. Submit and verify the property appears in your listings
10. Return to the dashboard to see contact submissions from the contact form

## Features

- ✅ **Admin Authentication**: Only authenticated users can access `/admin/*` routes
- ✅ **Admin Dashboard**: Centralized admin panel at `/admin` with:
  - Quick access to add new listings
  - View all contact form submissions
  - User profile management
- ✅ **Multiple Image Upload**: Upload a cover image and multiple additional images
- ✅ **Image Gallery**: View all images in the property detail page with thumbnail navigation
- ✅ **Automatic Image Storage**: Images are automatically uploaded to Supabase Storage (already configured)
- ✅ **Database Integration**: Property details and image URLs are stored in Supabase
- ✅ **Contact Submissions Management**: View all contact form submissions with full details

## Troubleshooting

### Images not uploading?
- Check that the `project-images` bucket exists and is public
- Verify RLS policies are set correctly
- Check browser console for errors

### Can't access admin pages?
- Ensure you're signed in with Clerk (click "Admin Login" in footer)
- Check that `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set correctly in `.env.local`
- Verify `middleware.js` is configured correctly
- Make sure you're accessing `/admin` or `/admin/add-listing` (not `/add-listing`)

### Database errors?
- Ensure `project_images` table exists
- Check RLS policies allow authenticated users to insert
- Verify foreign key relationship with `projects` table

## Notes

- The cover image is stored in `projects.image_url`
- Additional images are stored in `project_images` table
- Images are organized in storage as: `properties/{slug}/cover-{timestamp}.{ext}`
- The gallery shows cover image first, then additional images
