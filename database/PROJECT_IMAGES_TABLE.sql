-- Create project_images table to store additional images for each property
CREATE TABLE IF NOT EXISTS project_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique image URLs per project
  UNIQUE(project_id, image_url)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_project_images_project_id ON project_images(project_id);
CREATE INDEX IF NOT EXISTS idx_project_images_display_order ON project_images(display_order);

-- Enable Row Level Security
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access to project images"
ON project_images
FOR SELECT
TO public
USING (true);

-- Create policy to allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert project images"
ON project_images
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy to allow authenticated users to update
CREATE POLICY "Allow authenticated users to update project images"
ON project_images
FOR UPDATE
TO authenticated
USING (true);

-- Create policy to allow authenticated users to delete
CREATE POLICY "Allow authenticated users to delete project images"
ON project_images
FOR DELETE
TO authenticated
USING (true);
