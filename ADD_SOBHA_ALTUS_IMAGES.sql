-- ============================================
-- Add Images for Sobha Altus Project
-- ============================================
-- This script adds images to the project_images table for Sobha Altus
-- 
-- Instructions:
-- 1. Replace the placeholder URLs below with your actual image URLs
-- 2. Images should be hosted (e.g., on Supabase Storage, AWS S3, or any CDN)
-- 3. Run this script in Supabase SQL Editor
-- ============================================

-- First, get the project ID for Sobha Altus
DO $$
DECLARE
    project_uuid UUID;
    image_urls TEXT[] := ARRAY[
        -- Add your image URLs here (one per line)
        -- Example:
        -- 'https://bgombdxqcuuhuujmvbze.supabase.co/storage/v1/object/public/project-images/properties/sobha-altus/image1.jpg',
        -- 'https://bgombdxqcuuhuujmvbze.supabase.co/storage/v1/object/public/project-images/properties/sobha-altus/image2.jpg',
        -- 'https://bgombdxqcuuhuujmvbze.supabase.co/storage/v1/object/public/project-images/properties/sobha-altus/image3.jpg',
        -- Add more URLs as needed...
    ];
    url_item TEXT;
    display_order INTEGER := 1;
BEGIN
    -- Get project ID
    SELECT id INTO project_uuid
    FROM projects
    WHERE slug = 'sobha-altus'
    LIMIT 1;

    IF project_uuid IS NULL THEN
        RAISE EXCEPTION 'Project "sobha-altus" not found. Please check the slug.';
    END IF;

    RAISE NOTICE 'Found project ID: %', project_uuid;

    -- Insert images
    FOREACH url_item IN ARRAY image_urls
    LOOP
        -- Skip empty URLs
        IF url_item IS NULL OR TRIM(url_item) = '' THEN
            CONTINUE;
        END IF;

        -- Insert image (ignore if duplicate)
        INSERT INTO project_images (project_id, image_url, display_order)
        VALUES (project_uuid, url_item, display_order)
        ON CONFLICT (project_id, image_url) DO NOTHING;

        display_order := display_order + 1;
    END LOOP;

    RAISE NOTICE 'Successfully added % images for Sobha Altus', display_order - 1;
END $$;

-- Verify the images were added
SELECT 
    pi.id,
    pi.image_url,
    pi.display_order,
    p.name as project_name
FROM project_images pi
JOIN projects p ON pi.project_id = p.id
WHERE p.slug = 'sobha-altus'
ORDER BY pi.display_order;

