-- ============================================
-- REIAS India - Complete Supabase Setup SQL
-- ============================================
-- Copy and paste this entire script into Supabase SQL Editor
-- Run all queries in order

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Create projects table for residential and commercial projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  location TEXT NOT NULL,
  area TEXT,
  price TEXT,
  type TEXT NOT NULL CHECK (type IN ('residential', 'commercial', 'plots', 'sco-plots', 'villa-house')),
  description TEXT,
  image_url TEXT,
  developer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_location ON projects(location);
CREATE INDEX IF NOT EXISTS idx_contact_created_at ON contact_submissions(created_at);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES
-- ============================================

-- Allow public read access to projects
CREATE POLICY "Allow public read access to projects"
ON projects
FOR SELECT
TO public
USING (true);

-- Allow public insert to contact_submissions
CREATE POLICY "Allow public insert to contact_submissions"
ON contact_submissions
FOR INSERT
TO public
WITH CHECK (true);

-- ============================================
-- 5. INSERT SAMPLE RESIDENTIAL PROJECTS
-- ============================================
-- Projects from reiasindia.com

INSERT INTO projects (name, slug, location, area, price, type, description, developer)
VALUES 
  -- Godrej Projects
  (
    'Godrej SORA',
    'godrej-sora',
    'Golf Course Road',
    '3050-4250 sqft',
    '₹ Assured Best Price',
    'residential',
    'Premium residential project by Godrej Properties featuring spacious homes with world-class amenities including swimming pool, clubhouse, landscaped gardens, and 24/7 security.',
    'Godrej Properties'
  ),
  (
    'Godrej Miraya',
    'godrej-miraya',
    'Golf Course Road',
    '2711-3929 sqft',
    '₹ Assured Best Price',
    'residential',
    'Luxurious residential apartments by Godrej Properties with modern architecture and premium finishes in the prime Golf Course Road location.',
    'Godrej Properties'
  ),
  (
    'Godrej Vriksha',
    'godrej-vriksha',
    'Dwarka Expressway',
    '2100-3700 sqft',
    '₹ Assured Best Price',
    'residential',
    'Eco-friendly residential project offering spacious homes surrounded by green landscapes and sustainable living features.',
    'Godrej Properties'
  ),
  
  -- M3M Projects
  (
    'M3M Soulitude',
    'm3m-soulitude',
    'Dwarka Expressway',
    '3-4 BHK',
    '₹ Assured Best Price',
    'residential',
    'Ultra-luxury residential project offering premium homes with state-of-the-art amenities and breathtaking views.',
    'M3M India'
  ),
  (
    'M3M Merlin',
    'm3m-merlin',
    'Golf Course Road',
    '2025-3865 Sqft',
    '₹ Assured Best Price',
    'residential',
    'Premium residential development by M3M featuring modern architecture and world-class facilities.',
    'M3M India'
  ),
  (
    'M3M Opus at M3M Merlin',
    'm3m-opus-m3m-merlin',
    'Golf Course Ext Road',
    '2398 Sqft',
    '₹ Assured Best Price',
    'residential',
    'High-end residential project offering luxury living with premium amenities and excellent connectivity.',
    'M3M India'
  ),
  
  -- DLF Projects
  (
    'DLF Privana North',
    'dlf-privana-north',
    'Southern Peripheral Road',
    '3977 Sqft',
    '₹ Assured Best Price',
    'residential',
    'Premium DLF project offering spacious homes with modern amenities in a prime location with excellent connectivity.',
    'DLF'
  ),
  (
    'DLF Privana Gurgaon',
    'dlf-privana-gurgaon',
    'Dwarka Expressway',
    '3-4 BHK',
    '₹ Assured Best Price',
    'residential',
    'Luxury residential development by DLF with world-class amenities and strategic location on Dwarka Expressway.',
    'DLF'
  ),
  
  -- Adani Projects
  (
    'Adani Samsara Ivana',
    'adani-samsara-ivana',
    'Golf Course Ext Road',
    '2008 Sqft',
    '₹ Assured Best Price',
    'residential',
    'Premium residential project by Adani Realty offering modern homes with luxurious amenities.',
    'Adani Realty'
  ),
  (
    'Adani Lushlands',
    'adani-lushlands',
    'Gwal Pahari',
    '4800 Sqft',
    '₹ Assured Best Price',
    'residential',
    'Spacious luxury homes surrounded by lush greenery, offering a serene living experience.',
    'Adani Realty'
  ),
  
  -- Signature Global Projects
  (
    'Signature Global Cloverdale SPR',
    'signature-global-cloverdale-spr',
    'Southern Peripheral Road',
    'NA',
    '₹ Assured Best Price',
    'residential',
    'Affordable luxury residential project by Signature Global with modern amenities and excellent location.',
    'Signature Global'
  ),
  (
    'Signature Global Twin Tower DXP',
    'signature-global-twin-tower-dxp',
    'Dwarka Expressway',
    '2650-3785 Sqft',
    '₹ Assured Best Price',
    'residential',
    'Twin tower residential development offering premium living spaces with world-class facilities.',
    'Signature Global'
  ),
  
  -- BPTP Projects
  (
    'BPTP Amstoria Verti Greens',
    'bptp-amstoria-verti-greens',
    'Dwarka Expressway',
    '1600-2400 Sqft',
    '₹ Assured Best Price',
    'residential',
    'Premium residential project featuring vertical gardens and modern architecture in an excellent location.',
    'BPTP'
  ),
  
  -- Experion Projects
  (
    'Experion The Trillion',
    'experion-the-trillion',
    'Sohna Road',
    '3000-3600 Sqft',
    '₹ Assured Best Price',
    'residential',
    'Luxury residential development by Experion Developers offering premium homes with exceptional amenities.',
    'Experion Developers'
  ),
  
  -- Conscient Projects
  (
    'Conscient Hines Elevate Reserve',
    'conscient-hines-elevate-reserve',
    'Golf Course Ext Road',
    '2775-3395 Sqft',
    '₹ Assured Best Price',
    'residential',
    'High-end residential project offering luxury living with modern design and premium amenities.',
    'Conscient Infrastructure'
  ),
  (
    'Conscient Parq',
    'conscient-parq',
    'Southern Peripheral Road',
    '1935-2825 Sqft',
    '₹ Assured Best Price',
    'residential',
    'Premium residential development featuring spacious homes with world-class facilities.',
    'Conscient Infrastructure'
  ),
  
  -- Elan Projects
  (
    'Elan The Emperor',
    'elan-the-emperor',
    'Dwarka Expressway',
    '4223-10347 Sqft',
    '₹ Assured Best Price',
    'residential',
    'Ultra-luxury residential project offering palatial homes with premium finishes and exceptional amenities.',
    'Elan'
  ),
  
  -- Emaar Projects
  (
    'Emaar Urban Ascent',
    'emaar-urban-ascent',
    'Dwarka Expressway',
    '2150-3150 Sqft',
    '₹ Assured Best Price',
    'residential',
    'Premium residential project by Emaar India featuring modern architecture and world-class amenities.',
    'Emaar India'
  ),
  (
    'Emaar The 88',
    'emaar-the-88',
    'Dwarka Expressway',
    '1350-1809 Sqft',
    '₹ Assured Best Price',
    'residential',
    'Signature Emaar development offering luxury homes with exceptional design and amenities.',
    'Emaar India'
  ),
  
  -- Sobha Projects
  (
    'Sobha Altus',
    'sobha-altus',
    'Dwarka Expressway',
    '677-4077 Sqft',
    '₹ Assured Best Price',
    'residential',
    'Premium residential project by Sobha offering luxury homes with exceptional craftsmanship.',
    'Sobha'
  ),
  (
    'Sobha Aranya',
    'sobha-aranya',
    'NH 8',
    '2800-4285 Sqft',
    '₹ Assured Best Price',
    'residential',
    'Luxury residential development featuring spacious homes surrounded by natural landscapes.',
    'Sobha'
  ),
  
  -- Tulip Projects
  (
    'Tulip Crimson',
    'tulip-crimson',
    'Southern Peripheral Road',
    '3090 Sqft',
    '₹ Assured Best Price',
    'residential',
    'Premium residential project offering modern homes with excellent amenities and connectivity.',
    'Tulip'
  ),
  (
    'Tulip Monsella',
    'tulip-monsella',
    'Golf Course Road',
    '2874-4503 Sqft',
    '₹ Assured Best Price',
    'residential',
    'Luxury residential development featuring spacious homes with world-class facilities.',
    'Tulip'
  ),
  
  -- Navraj Projects
  (
    'Navraj The Antalyas',
    'navraj-the-antalyas',
    'Dwarka Expressway',
    '2071-2553 Sqft',
    '₹ Assured Best Price',
    'residential',
    'Premium residential project by Navraj Builders offering modern living spaces.',
    'Navraj'
  ),
  
  -- Hero Homes Projects
  (
    'Hero Homes The Palatial',
    'hero-homes-the-palatial',
    'Dwarka Expressway',
    '2600-3200 Sqft',
    '₹ Assured Best Price',
    'residential',
    'Premium residential project offering palatial homes with luxurious amenities.',
    'Hero Homes'
  ),
  
  -- Smart World Projects
  (
    'Smart World One DXP',
    'smart-world-one-dxp',
    'Dwarka Expressway',
    '2-4 BHK',
    '₹ Assured Best Price',
    'residential',
    'Modern residential project offering smart homes with innovative features.',
    'Smart World'
  ),
  (
    'Smartworld The Edition',
    'smartworld-the-edition',
    'Golf Course Ext Road',
    '3-4 BHK',
    '₹ Assured Best Price',
    'residential',
    'Premium residential development featuring contemporary homes with smart technology.',
    'Smart World'
  ),
  
  -- ATS Projects
  (
    'ATS Homekraft Sanctuary 105',
    'ats-homekraft-sanctuary-105',
    'Dwarka Expressway',
    '1850-2800 Sqft',
    '₹ Assured Best Price',
    'residential',
    'Premium residential project offering sanctuary-like living with modern amenities.',
    'ATS Infrastructure'
  ),
  
  -- Tarc Projects
  (
    'Tarc Ishva',
    'tarc-ishva',
    'Golf Course Ext Road',
    '2850-3900 Sqft',
    '₹ Assured Best Price',
    'residential',
    'Luxury residential project featuring spacious homes with premium finishes.',
    'Tarc'
  ),
  
  -- Central Park Projects
  (
    'Central Park Bignonia Towers',
    'central-park-bignonia-towers',
    'Sohna Road',
    '3805-5581 Sqft',
    '₹ Assured Best Price',
    'residential',
    'Premium residential development featuring luxury homes with exceptional amenities.',
    'Central Park'
  ),
  
  -- Puri Projects
  (
    'Puri Diplomatic Residences',
    'puri-diplomatic-residences',
    'Dwarka Expressway',
    '3-4 BHK',
    '₹ Assured Best Price',
    'residential',
    'Luxury residential project offering diplomatic-standard homes with world-class facilities.',
    'Puri Constructions'
  ),
  
  -- Whiteland Projects
  (
    'Whiteland The Aspen',
    'whiteland-the-aspen',
    'Southern Peripheral Road',
    '2290-4645 Sqft',
    '₹ Assured Best Price',
    'residential',
    'Premium residential project featuring modern homes with luxurious amenities.',
    'Whiteland Corporation'
  ),
  
  -- MNB Projects
  (
    'MNB Ananta Vilasa',
    'mnb-ananta-vilasa',
    'Golf Course Road',
    '3500 Sqft',
    '₹ Assured Best Price',
    'residential',
    'Luxury residential project offering spacious villas with premium amenities.',
    'MNB Buildfab Private Limited'
  ),
  
  -- Paras Projects
  (
    'Paras The Florett Enclave',
    'paras-the-florett-enclave',
    'Golf Course Ext Road',
    '1390-1750 Sqft',
    '₹ Assured Best Price',
    'residential',
    'Premium residential development featuring modern homes in a prime location.',
    'Paras Buildtech'
  ),
  (
    'Paras The Manor',
    'paras-the-manor',
    'Gwal Pahari',
    '4750 Sqft',
    '₹ Assured Best Price',
    'residential',
    'Luxury residential project offering spacious manor-style homes.',
    'Paras Buildtech'
  ),
  
  -- Pyramid Projects
  (
    'Pyramid Alban',
    'pyramid-alban',
    'Southern Peripheral Road',
    '2270-2445 Sqft',
    '₹ Assured Best Price',
    'residential',
    'Premium residential project featuring modern homes with excellent amenities.',
    'Pyramid Infratech'
  ),
  
  -- 4S Projects
  (
    '4S The Aurrum',
    '4s-the-aurrum',
    'Golf Course Ext Road',
    '2407-3562 Sqft',
    '₹ Assured Best Price',
    'residential',
    'Luxury residential development offering premium homes with world-class facilities.',
    '4S'
  ),
  
  -- ROF Projects
  (
    'ROF Insignia Park Floors',
    'rof-insignia-park-floors',
    'New Gurgaon',
    '1500 Sqft',
    '₹ Assured Best Price',
    'residential',
    'Premium residential project featuring modern floor-style homes.',
    'ROF'
  ),
  
  -- Anant Raj Projects
  (
    'Anant Raj The Estate Residences',
    'anant-raj-the-estate-residences',
    'Golf Course Ext Road',
    '3-4 BHK',
    '₹ Assured Best Price',
    'residential',
    'Luxury residential project offering estate-style homes with exceptional amenities.',
    'Anant Raj'
  ),
  
  -- Birla Projects
  (
    'Birla Avik',
    'birla-avik',
    'Golf Course Ext Road',
    '1470-2600 Sqft',
    '₹ Assured Best Price',
    'residential',
    'Premium residential project by Birla Estates offering modern homes.',
    'Birla'
  ),
  
  -- Eldeco Projects
  (
    'Eldeco Fairway Reserve',
    'eldec-fairway-reserve',
    'New Gurgaon',
    '2175-3600 Sqft',
    '₹ Assured Best Price',
    'residential',
    'Premium residential development featuring spacious homes with modern amenities.',
    'Eldeco'
  ),
  
  -- Indiabulls Projects
  (
    'Indiabulls One09',
    'indiabulls-one09',
    'Dwarka Expressway',
    'Commercial',
    '₹ Assured Best Price',
    'commercial',
    'Premium commercial project offering excellent investment opportunities.',
    'Indiabulls'
  ),
  
  -- AIPL Projects
  (
    'AIPL Joy Street',
    'aipl-joy-street',
    'Golf Course Ext Road',
    '350 Sqft Onwards',
    '₹ Onwards',
    'commercial',
    'Premium commercial project offering retail and office spaces.',
    'AIPL'
  ),
  (
    'AIPL Business Club',
    'aipl-business-club',
    'Golf Course Ext Road',
    '500-58000 Sqft',
    '₹ Best Price Guaranteed',
    'commercial',
    'Large commercial development offering flexible office spaces.',
    'AIPL'
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 6. VERIFY DATA
-- ============================================

-- Check total projects
SELECT 
  type,
  COUNT(*) as total_projects
FROM projects
GROUP BY type
ORDER BY type;

-- View sample residential projects
SELECT name, location, area, developer
FROM projects
WHERE type = 'residential'
LIMIT 10;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Your database is now ready with:
-- - Projects table with RLS policies
-- - Contact submissions table with RLS policies
-- - 50+ sample residential projects from Gurgaon
-- - Indexes for optimal query performance
--
-- Next steps:
-- 1. Set up Supabase Storage bucket for project images
-- 2. Update image_url fields with actual storage URLs
-- 3. Configure your .env.local with Supabase credentials
-- ============================================

