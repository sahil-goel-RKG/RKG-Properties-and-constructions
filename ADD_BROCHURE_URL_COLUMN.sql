-- Add brochure_url column to projects table if it doesn't exist
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS brochure_url TEXT;

-- Add comment to the column
COMMENT ON COLUMN projects.brochure_url IS 'URL to the property brochure PDF file';

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND column_name = 'brochure_url';

