-- Add admin-editable columns to contact_submissions table
-- Run this in your Supabase SQL Editor

-- Add status column (for tracking submission status)
ALTER TABLE contact_submissions 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new' 
CHECK (status IN ('new', 'in-progress', 'resolved', 'closed'));

-- Add admin_notes column (for admin to add notes/comments)
ALTER TABLE contact_submissions 
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add priority column (for prioritizing submissions)
ALTER TABLE contact_submissions 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium'
CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Add follow_up_date column (for scheduling follow-ups)
ALTER TABLE contact_submissions 
ADD COLUMN IF NOT EXISTS follow_up_date DATE;

-- Add response_sent column (to track if response was sent)
ALTER TABLE contact_submissions 
ADD COLUMN IF NOT EXISTS response_sent BOOLEAN DEFAULT false;

-- Add assigned_to column (to track which admin is handling it)
ALTER TABLE contact_submissions 
ADD COLUMN IF NOT EXISTS assigned_to TEXT;

-- Add updated_by column (to track who last updated the submission)
ALTER TABLE contact_submissions 
ADD COLUMN IF NOT EXISTS updated_by TEXT;

-- Add updated_at column (to track when it was last updated)
ALTER TABLE contact_submissions 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_priority ON contact_submissions(priority);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_follow_up_date ON contact_submissions(follow_up_date);

-- Update the updated_at column when row is updated
CREATE OR REPLACE FUNCTION update_contact_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contact_submissions_updated_at
BEFORE UPDATE ON contact_submissions
FOR EACH ROW
EXECUTE FUNCTION update_contact_submissions_updated_at();

