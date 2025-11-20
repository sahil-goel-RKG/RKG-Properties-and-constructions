-- ============================================
-- MAP YOUR IMAGES: P1.jpeg through P10.jpeg
-- ============================================
-- Your Supabase URL: https://bgombdxqcuuhuujmvbze.supabase.co
-- Your project reference: bgombdxqcuuhuujmvbze
-- Your images: P1.jpeg, P2.jpeg, P3.jpeg, P4.jpeg, P5.jpeg, P6.jpeg, P7.jpeg, P8.jpeg, P9.jpeg, P10.jpeg

-- Copy and paste this entire section into Supabase SQL Editor and run it
-- ============================================

-- Map P1.jpeg to first project
UPDATE projects 
SET image_url = 'https://bgombdxqcuuhuujmvbze.supabase.co/storage/v1/object/public/project-images/P1.jpeg' 
WHERE slug = 'godrej-sora';

-- Map p2.jpeg to second project (lowercase)
UPDATE projects 
SET image_url = 'https://bgombdxqcuuhuujmvbze.supabase.co/storage/v1/object/public/project-images/p2.jpeg' 
WHERE slug = 'godrej-miraya';

-- Map p3.jpeg to third project (lowercase)
UPDATE projects 
SET image_url = 'https://bgombdxqcuuhuujmvbze.supabase.co/storage/v1/object/public/project-images/p3.jpeg' 
WHERE slug = 'godrej-vriksha';

-- Map p4.jpeg to fourth project (lowercase)
UPDATE projects 
SET image_url = 'https://bgombdxqcuuhuujmvbze.supabase.co/storage/v1/object/public/project-images/p4.jpeg' 
WHERE slug = 'm3m-soulitude';

-- Map p5.jpeg to fifth project (lowercase)
UPDATE projects 
SET image_url = 'https://bgombdxqcuuhuujmvbze.supabase.co/storage/v1/object/public/project-images/p5.jpeg' 
WHERE slug = 'dlf-privana-north';

-- Map p6.jpeg to sixth project (lowercase)
UPDATE projects 
SET image_url = 'https://bgombdxqcuuhuujmvbze.supabase.co/storage/v1/object/public/project-images/p6.jpeg' 
WHERE slug = 'dlf-privana-gurgaon';

-- Map p7.jpeg to seventh project (lowercase)
UPDATE projects 
SET image_url = 'https://bgombdxqcuuhuujmvbze.supabase.co/storage/v1/object/public/project-images/p7.jpeg' 
WHERE slug = 'adani-samsara-ivana';

-- Map p8.jpeg to eighth project (lowercase)
UPDATE projects 
SET image_url = 'https://bgombdxqcuuhuujmvbze.supabase.co/storage/v1/object/public/project-images/p8.jpeg' 
WHERE slug = 'signature-global-cloverdale-spr';

-- Map p9.jpeg to ninth project (lowercase)
UPDATE projects 
SET image_url = 'https://bgombdxqcuuhuujmvbze.supabase.co/storage/v1/object/public/project-images/p9.jpeg' 
WHERE slug = 'signature-global-twin-tower-dxp';

-- Map p10.jpeg to tenth project (lowercase)
UPDATE projects 
SET image_url = 'https://bgombdxqcuuhuujmvbze.supabase.co/storage/v1/object/public/project-images/p10.jpeg' 
WHERE slug = 'bptp-amstoria-verti-greens';

-- ============================================
-- VERIFY THE UPDATES
-- ============================================

-- Check if images were mapped successfully
SELECT name, slug, image_url
FROM projects
WHERE image_url IS NOT NULL
ORDER BY name
LIMIT 10;

-- Count how many projects have images
SELECT 
  COUNT(*) FILTER (WHERE image_url IS NOT NULL) as with_images,
  COUNT(*) FILTER (WHERE image_url IS NULL) as without_images,
  COUNT(*) as total
FROM projects
WHERE type = 'residential';

-- ============================================
-- DONE! 
-- ============================================
-- After running this, your hero carousel should work!
-- Refresh your browser at http://localhost:3000
-- ============================================

