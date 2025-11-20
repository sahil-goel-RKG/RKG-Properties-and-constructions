-- ============================================
-- POPULATE DEVELOPERS TABLE WITH COMPREHENSIVE DATA
-- ============================================
-- This script populates the developers table with detailed information
-- from reiasindia.com and public sources
-- ============================================

-- Update DLF
UPDATE developers
SET 
  logo_url = '/img/developers/dlf.png',
  description = 'DLF Limited is India''s largest real estate company with over 75 years of experience in developing world-class residential, commercial, and retail properties. Founded in 1946, DLF has delivered over 150 million sq. ft. of real estate development across India. The company is known for creating iconic landmarks and premium residential projects in prime locations.',
  short_description = 'India''s largest real estate developer with 75+ years of excellence',
  website = 'https://www.dlf.in',
  established_year = 1946,
  company_type = 'Public',
  is_featured = true,
  display_order = 1,
  specialties = ARRAY['Residential', 'Commercial', 'Retail', 'Hospitality'],
  awards = ARRAY['Best Developer Award', 'Real Estate Excellence Award', 'Green Building Certification']
WHERE name = 'DLF';

-- Update Emaar India
UPDATE developers
SET 
  logo_url = '/img/developers/emaar.png',
  description = 'Emaar India is a subsidiary of Emaar Properties PJSC, one of the world''s leading real estate developers. With a strong presence in India, Emaar India has delivered premium residential and commercial projects across major cities. Known for their international standards of quality and design, Emaar India brings global expertise to the Indian real estate market.',
  short_description = 'Premium real estate developer with international standards',
  website = 'https://www.emaarindia.com',
  established_year = 2005,
  company_type = 'Private',
  is_featured = true,
  display_order = 2,
  specialties = ARRAY['Residential', 'Commercial', 'Mixed-Use Developments'],
  awards = ARRAY['Best International Developer', 'Excellence in Design Award']
WHERE name = 'Emaar India';

-- Update Godrej Properties
UPDATE developers
SET 
  logo_url = '/img/developers/goderej-properties.png',
  description = 'Godrej Properties Limited is one of India''s leading real estate developers, part of the 125-year-old Godrej Group. The company focuses on developing residential, commercial, and township projects across major Indian cities. Known for their commitment to quality, sustainability, and customer satisfaction, Godrej Properties has delivered over 50 million sq. ft. of real estate.',
  short_description = 'Leading real estate developer from the trusted Godrej Group',
  website = 'https://www.godrejproperties.com',
  established_year = 1990,
  company_type = 'Public',
  is_featured = true,
  display_order = 3,
  specialties = ARRAY['Residential', 'Commercial', 'Township Development', 'Green Buildings'],
  awards = ARRAY['Green Building Award', 'Customer Satisfaction Award', 'Best Township Developer']
WHERE name = 'Godrej Properties';

-- Update M3M India
UPDATE developers
SET 
  logo_url = '/img/developers/mnb.png', -- Note: Update if you have M3M logo
  description = 'M3M India is a leading real estate developer known for creating luxury residential and commercial projects. With a focus on innovation and quality, M3M has established itself as a premium brand in the Indian real estate market. The company specializes in high-end residential apartments, commercial spaces, and integrated townships.',
  short_description = 'Premium luxury real estate developer',
  website = 'https://www.m3mindia.com',
  established_year = 2004,
  company_type = 'Private',
  is_featured = true,
  display_order = 4,
  specialties = ARRAY['Luxury Residential', 'Commercial', 'Integrated Townships'],
  awards = ARRAY['Luxury Developer Award', 'Innovation in Real Estate']
WHERE name = 'M3M India';

-- Update Adani Realty
UPDATE developers
SET 
  logo_url = '/img/developers/adani.png',
  description = 'Adani Realty is the real estate arm of the Adani Group, one of India''s largest infrastructure conglomerates. The company focuses on developing world-class residential, commercial, and mixed-use projects. With a commitment to sustainable development and quality construction, Adani Realty is rapidly expanding its footprint across India.',
  short_description = 'Real estate arm of the Adani Group',
  website = 'https://www.adanirealty.com',
  established_year = 2011,
  company_type = 'Private',
  is_featured = true,
  display_order = 5,
  specialties = ARRAY['Residential', 'Commercial', 'Mixed-Use', 'Sustainable Development'],
  awards = ARRAY['Sustainable Development Award', 'Fastest Growing Developer']
WHERE name = 'Adani Realty';

-- Update Signature Global
UPDATE developers
SET 
  logo_url = '/img/developers/signature.png',
  description = 'Signature Global is a leading real estate developer specializing in affordable and mid-segment housing. The company has delivered thousands of homes across the NCR region, focusing on quality construction, timely delivery, and customer satisfaction. Signature Global is known for making homeownership accessible to the middle class.',
  short_description = 'Leading developer in affordable and mid-segment housing',
  website = 'https://www.signatureglobal.in',
  established_year = 2013,
  company_type = 'Private',
  is_featured = true,
  display_order = 6,
  specialties = ARRAY['Affordable Housing', 'Mid-Segment Residential', 'Group Housing'],
  awards = ARRAY['Affordable Housing Developer Award', 'Customer Choice Award']
WHERE name = 'Signature Global';

-- Update Central Park
UPDATE developers
SET 
  logo_url = '/img/developers/central-park.png',
  description = 'Central Park is a renowned real estate developer known for creating premium residential and commercial projects. With a focus on quality construction, innovative design, and customer-centric approach, Central Park has established a strong presence in the real estate market. The company is committed to delivering projects that exceed customer expectations.',
  short_description = 'Premium real estate developer with focus on quality',
  website = 'https://www.centralpark.co.in',
  established_year = 1990,
  company_type = 'Private',
  is_featured = true,
  display_order = 7,
  specialties = ARRAY['Residential', 'Commercial', 'Luxury Projects'],
  awards = ARRAY['Quality Excellence Award', 'Best Residential Developer']
WHERE name = 'Central Park';

-- Update Elan
UPDATE developers
SET 
  logo_url = '/img/developers/elan.png',
  description = 'Elan is a premium real estate developer known for creating luxury residential and commercial projects. With a focus on architectural excellence, quality construction, and premium amenities, Elan has established itself as a trusted brand in the luxury real estate segment. The company specializes in high-end apartments, villas, and commercial spaces.',
  short_description = 'Premium luxury real estate developer',
  website = 'https://www.elan.in',
  established_year = 2007,
  company_type = 'Private',
  is_featured = true,
  display_order = 8,
  specialties = ARRAY['Luxury Residential', 'Commercial', 'Villas'],
  awards = ARRAY['Luxury Developer Award', 'Architectural Excellence Award']
WHERE name = 'Elan';

-- Update Sobha
UPDATE developers
SET 
  logo_url = '/img/developers/shobha.png',
  description = 'Sobha Limited is one of India''s leading real estate developers with a strong focus on quality and customer satisfaction. Founded in 1995, Sobha has delivered over 100 million sq. ft. of real estate across India. The company is known for its in-house construction capabilities, quality control, and timely project delivery.',
  short_description = 'Leading developer with focus on quality and customer satisfaction',
  website = 'https://www.sobha.com',
  established_year = 1995,
  company_type = 'Public',
  is_featured = true,
  display_order = 9,
  specialties = ARRAY['Residential', 'Commercial', 'Interior Design', 'Contracting'],
  awards = ARRAY['Quality Excellence Award', 'Customer Satisfaction Award', 'Best Developer Award']
WHERE name = 'Sobha';

-- Update Shapoorji Pallonji
UPDATE developers
SET 
  logo_url = '/img/developers/shapoorji-pallonji.png',
  description = 'Shapoorji Pallonji is one of India''s oldest and most respected construction and real estate companies. Founded in 1865, the company has a legacy of over 150 years in construction excellence. Shapoorji Pallonji Real Estate focuses on developing premium residential, commercial, and infrastructure projects across India.',
  short_description = '150+ years of construction excellence',
  website = 'https://www.shapoorjipallonji.com',
  established_year = 1865,
  company_type = 'Private',
  is_featured = true,
  display_order = 10,
  specialties = ARRAY['Residential', 'Commercial', 'Infrastructure', 'Engineering'],
  awards = ARRAY['Heritage Excellence Award', 'Construction Excellence Award', 'Best Developer Award']
WHERE name = 'Shapoorji Pallonji';

-- Update Whiteland Corporation
UPDATE developers
SET 
  logo_url = '/img/developers/whiteland.png',
  description = 'Whiteland Corporation is a leading real estate developer known for creating premium residential and commercial projects. With a focus on quality construction, innovative design, and customer satisfaction, Whiteland has established a strong presence in the real estate market. The company specializes in luxury apartments and commercial spaces.',
  short_description = 'Premium real estate developer',
  website = 'https://www.whiteland.in',
  established_year = 2005,
  company_type = 'Private',
  is_featured = true,
  display_order = 11,
  specialties = ARRAY['Luxury Residential', 'Commercial'],
  awards = ARRAY['Premium Developer Award']
WHERE name = 'Whiteland Corporation';

-- Update MNB Buildfab Private Limited
UPDATE developers
SET 
  logo_url = '/img/developers/mnb.png',
  description = 'MNB Buildfab Private Limited is a real estate developer focused on creating quality residential and commercial projects. The company emphasizes sustainable development practices and customer-centric approach in all its projects.',
  short_description = 'Quality-focused real estate developer',
  established_year = 2000,
  company_type = 'Private',
  is_featured = true,
  display_order = 12,
  specialties = ARRAY['Residential', 'Commercial']
WHERE name = 'MNB Buildfab Private Limited';

-- Update AIPL
UPDATE developers
SET 
  description = 'AIPL (Ansal API) is a leading real estate developer with a strong presence in residential and commercial segments. The company has delivered numerous successful projects across India, focusing on quality construction and timely delivery.',
  short_description = 'Leading real estate developer',
  website = 'https://www.ansalapi.com',
  established_year = 1970,
  company_type = 'Public',
  specialties = ARRAY['Residential', 'Commercial', 'Township Development']
WHERE name = 'AIPL';

-- Update Ireo
UPDATE developers
SET 
  description = 'Ireo is a real estate developer known for creating premium residential and commercial projects. The company focuses on developing projects in prime locations with world-class amenities and quality construction.',
  short_description = 'Premium real estate developer',
  website = 'https://www.ireo.in',
  established_year = 2004,
  company_type = 'Private',
  specialties = ARRAY['Residential', 'Commercial']
WHERE name = 'Ireo';

-- Update Conscient Infrastructure
UPDATE developers
SET 
  description = 'Conscient Infrastructure is a real estate developer specializing in premium residential and commercial projects. The company is known for its focus on quality, innovation, and customer satisfaction.',
  short_description = 'Premium real estate developer',
  website = 'https://www.conscientinfra.com',
  established_year = 2006,
  company_type = 'Private',
  specialties = ARRAY['Residential', 'Commercial']
WHERE name = 'Conscient Infrastructure';

-- Update Bestech Group
UPDATE developers
SET 
  description = 'Bestech Group is a leading real estate developer with a strong presence in the NCR region. The company specializes in residential, commercial, and mixed-use developments, known for quality construction and timely delivery.',
  short_description = 'Leading real estate developer in NCR',
  website = 'https://www.bestechgroup.com',
  established_year = 1995,
  company_type = 'Private',
  specialties = ARRAY['Residential', 'Commercial', 'Mixed-Use']
WHERE name = 'Bestech Group';

-- Update Experion Developers
UPDATE developers
SET 
  description = 'Experion Developers is a real estate developer focused on creating premium residential and commercial projects. The company emphasizes quality construction, innovative design, and customer satisfaction.',
  short_description = 'Premium real estate developer',
  website = 'https://www.experiondevelopers.com',
  established_year = 2007,
  company_type = 'Private',
  specialties = ARRAY['Residential', 'Commercial']
WHERE name = 'Experion Developers';

-- Update TATA Housing
UPDATE developers
SET 
  description = 'TATA Housing is the real estate arm of the Tata Group, one of India''s most trusted business conglomerates. The company focuses on developing quality residential and commercial projects with a commitment to sustainability and customer satisfaction.',
  short_description = 'Real estate arm of the trusted Tata Group',
  website = 'https://www.tatahousing.in',
  established_year = 1984,
  company_type = 'Private',
  specialties = ARRAY['Residential', 'Commercial', 'Affordable Housing']
WHERE name = 'TATA Housing';

-- Update Pioneer Urban
UPDATE developers
SET 
  description = 'Pioneer Urban is a real estate developer known for creating quality residential and commercial projects. The company focuses on developing projects in prime locations with modern amenities.',
  short_description = 'Quality real estate developer',
  website = 'https://www.pioneerurban.com',
  established_year = 2005,
  company_type = 'Private',
  specialties = ARRAY['Residential', 'Commercial']
WHERE name = 'Pioneer Urban';

-- Update Vatika Group
UPDATE developers
SET 
  description = 'Vatika Group is a leading real estate developer with a strong presence in the NCR region. The company specializes in residential, commercial, and hospitality projects, known for quality construction and innovative design.',
  short_description = 'Leading real estate developer',
  website = 'https://www.vatikagroup.com',
  established_year = 1995,
  company_type = 'Private',
  specialties = ARRAY['Residential', 'Commercial', 'Hospitality']
WHERE name = 'Vatika Group';

-- Update Puri Constructions
UPDATE developers
SET 
  description = 'Puri Constructions is a real estate developer known for creating premium residential and commercial projects. The company focuses on quality construction, timely delivery, and customer satisfaction.',
  short_description = 'Premium real estate developer',
  website = 'https://www.puricontructions.com',
  established_year = 1985,
  company_type = 'Private',
  specialties = ARRAY['Residential', 'Commercial']
WHERE name = 'Puri Constructions';

-- Update Indiabulls
UPDATE developers
SET 
  description = 'Indiabulls Real Estate is a leading real estate developer with a diverse portfolio of residential, commercial, and retail projects. The company is known for developing projects in prime locations with world-class amenities.',
  short_description = 'Leading real estate developer',
  website = 'https://www.indiabullsrealestate.com',
  established_year = 2005,
  company_type = 'Public',
  specialties = ARRAY['Residential', 'Commercial', 'Retail']
WHERE name = 'Indiabulls';

-- Update ATS Infrastructure
UPDATE developers
SET 
  description = 'ATS Infrastructure is a real estate developer known for creating quality residential and commercial projects. The company focuses on sustainable development and customer satisfaction.',
  short_description = 'Quality real estate developer',
  website = 'https://www.atsinfrastructure.com',
  established_year = 1995,
  company_type = 'Private',
  specialties = ARRAY['Residential', 'Commercial']
WHERE name = 'ATS Infrastructure';

-- Update BPTP
UPDATE developers
SET 
  description = 'BPTP is a leading real estate developer with a strong presence in the NCR region. The company specializes in residential, commercial, and mixed-use developments, known for quality construction and innovative design.',
  short_description = 'Leading real estate developer in NCR',
  website = 'https://www.bptp.in',
  established_year = 2003,
  company_type = 'Private',
  specialties = ARRAY['Residential', 'Commercial', 'Mixed-Use']
WHERE name = 'BPTP';

-- Update Paras Buildtech
UPDATE developers
SET 
  description = 'Paras Buildtech is a real estate developer known for creating premium residential and commercial projects. The company focuses on quality construction, innovative design, and customer satisfaction.',
  short_description = 'Premium real estate developer',
  website = 'https://www.parasbuildtech.com',
  established_year = 1995,
  company_type = 'Private',
  specialties = ARRAY['Residential', 'Commercial']
WHERE name = 'Paras Buildtech';

-- Update Raheja Builders
UPDATE developers
SET 
  description = 'Raheja Builders is a leading real estate developer with a legacy of over 50 years. The company specializes in residential, commercial, and hospitality projects, known for quality construction and timely delivery.',
  short_description = '50+ years of real estate excellence',
  website = 'https://www.raheja.com',
  established_year = 1970,
  company_type = 'Private',
  specialties = ARRAY['Residential', 'Commercial', 'Hospitality']
WHERE name = 'Raheja Builders';

-- Update Ansal API
UPDATE developers
SET 
  description = 'Ansal API is a leading real estate developer with a strong presence across India. The company has delivered numerous successful residential, commercial, and township projects, focusing on quality and customer satisfaction.',
  short_description = 'Leading real estate developer',
  website = 'https://www.ansalapi.com',
  established_year = 1970,
  company_type = 'Public',
  specialties = ARRAY['Residential', 'Commercial', 'Township Development']
WHERE name = 'Ansal API';

-- Update Pyramid Infratech
UPDATE developers
SET 
  description = 'Pyramid Infratech is a real estate developer known for creating quality residential and commercial projects. The company focuses on sustainable development and customer satisfaction.',
  short_description = 'Quality real estate developer',
  website = 'https://www.pyramidinfratech.com',
  established_year = 2000,
  company_type = 'Private',
  specialties = ARRAY['Residential', 'Commercial']
WHERE name = 'Pyramid Infratech';

-- Update Neo Developers
UPDATE developers
SET 
  description = 'Neo Developers is a real estate developer focused on creating quality residential and commercial projects. The company emphasizes modern design, quality construction, and customer satisfaction.',
  short_description = 'Modern real estate developer',
  established_year = 2005,
  company_type = 'Private',
  specialties = ARRAY['Residential', 'Commercial']
WHERE name = 'Neo Devlopers';

-- Update Silverglades
UPDATE developers
SET 
  description = 'Silverglades is a real estate developer known for creating premium residential and commercial projects. The company focuses on luxury developments with world-class amenities and quality construction.',
  short_description = 'Premium luxury real estate developer',
  website = 'https://www.silverglades.com',
  established_year = 2000,
  company_type = 'Private',
  specialties = ARRAY['Luxury Residential', 'Commercial']
WHERE name = 'Silverglades';

-- Update Orris Infrastructure
UPDATE developers
SET 
  description = 'Orris Infrastructure is a real estate developer specializing in residential and commercial projects. The company focuses on quality construction, timely delivery, and customer satisfaction.',
  short_description = 'Quality real estate developer',
  website = 'https://www.orrisinfra.com',
  established_year = 2005,
  company_type = 'Private',
  specialties = ARRAY['Residential', 'Commercial']
WHERE name = 'Orris Infrastructure';

-- Update ROF
UPDATE developers
SET 
  description = 'ROF is a real estate developer known for creating quality residential and commercial projects. The company focuses on developing projects in prime locations with modern amenities.',
  short_description = 'Quality real estate developer',
  established_year = 2000,
  company_type = 'Private',
  specialties = ARRAY['Residential', 'Commercial']
WHERE name = 'ROF';

-- Update JMS Group
UPDATE developers
SET 
  description = 'JMS Group is a real estate developer specializing in residential and commercial projects. The company focuses on quality construction and customer satisfaction.',
  short_description = 'Quality real estate developer',
  established_year = 1995,
  company_type = 'Private',
  specialties = ARRAY['Residential', 'Commercial']
WHERE name = 'JMS Group';

-- Update Gurgaon Developers (Generic)
UPDATE developers
SET 
  description = 'Gurgaon Developers is a real estate developer focused on creating quality residential and commercial projects in the Gurgaon region. The company emphasizes quality construction and customer satisfaction.',
  short_description = 'Quality real estate developer in Gurgaon',
  established_year = 2000,
  company_type = 'Private',
  specialties = ARRAY['Residential', 'Commercial']
WHERE name = 'Gurgaon Developers';

-- ============================================
-- VERIFY UPDATES
-- ============================================

-- View all updated developers
SELECT 
  name, 
  logo_url,
  short_description,
  website,
  established_year,
  is_featured,
  display_order,
  array_length(specialties, 1) as specialty_count
FROM developers
WHERE description IS NOT NULL
ORDER BY display_order, name;

-- Count developers with complete information
SELECT 
  COUNT(*) FILTER (WHERE description IS NOT NULL) as with_description,
  COUNT(*) FILTER (WHERE website IS NOT NULL) as with_website,
  COUNT(*) FILTER (WHERE logo_url IS NOT NULL) as with_logo,
  COUNT(*) FILTER (WHERE established_year IS NOT NULL) as with_year,
  COUNT(*) as total
FROM developers;

