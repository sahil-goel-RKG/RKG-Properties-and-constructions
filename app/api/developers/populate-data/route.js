import { supabaseAdmin } from '@/lib/supabase/server'
import { supabase } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

// Developers data - comprehensive information
const developersData = [
  {
    name: 'DLF',
    logo_url: '/img/developers/dlf.png',
    description: 'DLF Limited is India\'s largest real estate company with over 75 years of experience in developing world-class residential, commercial, and retail properties. Founded in 1946, DLF has delivered over 150 million sq. ft. of real estate development across India. The company is known for creating iconic landmarks and premium residential projects in prime locations.',
    short_description: 'India\'s largest real estate developer with 75+ years of excellence',
    website: 'https://www.dlf.in',
    established_year: 1946,
    company_type: 'Public',
    is_featured: true,
    display_order: 1,
    specialties: ['Residential', 'Commercial', 'Retail', 'Hospitality'],
    awards: ['Best Developer Award', 'Real Estate Excellence Award', 'Green Building Certification']
  },
  {
    name: 'Emaar India',
    logo_url: '/img/developers/emaar.png',
    description: 'Emaar India is a subsidiary of Emaar Properties PJSC, one of the world\'s leading real estate developers. With a strong presence in India, Emaar India has delivered premium residential and commercial projects across major cities. Known for their international standards of quality and design, Emaar India brings global expertise to the Indian real estate market.',
    short_description: 'Premium real estate developer with international standards',
    website: 'https://www.emaarindia.com',
    established_year: 2005,
    company_type: 'Private',
    is_featured: true,
    display_order: 2,
    specialties: ['Residential', 'Commercial', 'Mixed-Use Developments'],
    awards: ['Best International Developer', 'Excellence in Design Award']
  },
  {
    name: 'Godrej Properties',
    logo_url: '/img/developers/goderej-properties.png',
    description: 'Godrej Properties Limited is one of India\'s leading real estate developers, part of the 125-year-old Godrej Group. The company focuses on developing residential, commercial, and township projects across major Indian cities. Known for their commitment to quality, sustainability, and customer satisfaction, Godrej Properties has delivered over 50 million sq. ft. of real estate.',
    short_description: 'Leading real estate developer from the trusted Godrej Group',
    website: 'https://www.godrejproperties.com',
    established_year: 1990,
    company_type: 'Public',
    is_featured: true,
    display_order: 3,
    specialties: ['Residential', 'Commercial', 'Township Development', 'Green Buildings'],
    awards: ['Green Building Award', 'Customer Satisfaction Award', 'Best Township Developer']
  },
  {
    name: 'M3M India',
    description: 'M3M India is a leading real estate developer known for creating luxury residential and commercial projects. With a focus on innovation and quality, M3M has established itself as a premium brand in the Indian real estate market. The company specializes in high-end residential apartments, commercial spaces, and integrated townships.',
    short_description: 'Premium luxury real estate developer',
    website: 'https://www.m3mindia.com',
    established_year: 2004,
    company_type: 'Private',
    is_featured: true,
    display_order: 4,
    specialties: ['Luxury Residential', 'Commercial', 'Integrated Townships'],
    awards: ['Luxury Developer Award', 'Innovation in Real Estate']
  },
  {
    name: 'Adani Realty',
    logo_url: '/img/developers/adani.png',
    description: 'Adani Realty is the real estate arm of the Adani Group, one of India\'s largest infrastructure conglomerates. The company focuses on developing world-class residential, commercial, and mixed-use projects. With a commitment to sustainable development and quality construction, Adani Realty is rapidly expanding its footprint across India.',
    short_description: 'Real estate arm of the Adani Group',
    website: 'https://www.adanirealty.com',
    established_year: 2011,
    company_type: 'Private',
    is_featured: true,
    display_order: 5,
    specialties: ['Residential', 'Commercial', 'Mixed-Use', 'Sustainable Development'],
    awards: ['Sustainable Development Award', 'Fastest Growing Developer']
  },
  {
    name: 'Signature Global',
    logo_url: '/img/developers/signature.png',
    description: 'Signature Global is a leading real estate developer specializing in affordable and mid-segment housing. The company has delivered thousands of homes across the NCR region, focusing on quality construction, timely delivery, and customer satisfaction. Signature Global is known for making homeownership accessible to the middle class.',
    short_description: 'Leading developer in affordable and mid-segment housing',
    website: 'https://www.signatureglobal.in',
    established_year: 2013,
    company_type: 'Private',
    is_featured: true,
    display_order: 6,
    specialties: ['Affordable Housing', 'Mid-Segment Residential', 'Group Housing'],
    awards: ['Affordable Housing Developer Award', 'Customer Choice Award']
  },
  {
    name: 'Central Park',
    logo_url: '/img/developers/central-park.png',
    description: 'Central Park is a renowned real estate developer known for creating premium residential and commercial projects. With a focus on quality construction, innovative design, and customer-centric approach, Central Park has established a strong presence in the real estate market. The company is committed to delivering projects that exceed customer expectations.',
    short_description: 'Premium real estate developer with focus on quality',
    website: 'https://www.centralpark.co.in',
    established_year: 1990,
    company_type: 'Private',
    is_featured: true,
    display_order: 7,
    specialties: ['Residential', 'Commercial', 'Luxury Projects'],
    awards: ['Quality Excellence Award', 'Best Residential Developer']
  },
  {
    name: 'Elan',
    logo_url: '/img/developers/elan.png',
    description: 'Elan is a premium real estate developer known for creating luxury residential and commercial projects. With a focus on architectural excellence, quality construction, and premium amenities, Elan has established itself as a trusted brand in the luxury real estate segment. The company specializes in high-end apartments, villas, and commercial spaces.',
    short_description: 'Premium luxury real estate developer',
    website: 'https://www.elan.in',
    established_year: 2007,
    company_type: 'Private',
    is_featured: true,
    display_order: 8,
    specialties: ['Luxury Residential', 'Commercial', 'Villas'],
    awards: ['Luxury Developer Award', 'Architectural Excellence Award']
  },
  {
    name: 'Sobha',
    logo_url: '/img/developers/shobha.png',
    description: 'Sobha Limited is one of India\'s leading real estate developers with a strong focus on quality and customer satisfaction. Founded in 1995, Sobha has delivered over 100 million sq. ft. of real estate across India. The company is known for its in-house construction capabilities, quality control, and timely project delivery.',
    short_description: 'Leading developer with focus on quality and customer satisfaction',
    website: 'https://www.sobha.com',
    established_year: 1995,
    company_type: 'Public',
    is_featured: true,
    display_order: 9,
    specialties: ['Residential', 'Commercial', 'Interior Design', 'Contracting'],
    awards: ['Quality Excellence Award', 'Customer Satisfaction Award', 'Best Developer Award']
  },
  {
    name: 'Shapoorji Pallonji',
    logo_url: '/img/developers/shapoorji-pallonji.png',
    description: 'Shapoorji Pallonji is one of India\'s oldest and most respected construction and real estate companies. Founded in 1865, the company has a legacy of over 150 years in construction excellence. Shapoorji Pallonji Real Estate focuses on developing premium residential, commercial, and infrastructure projects across India.',
    short_description: '150+ years of construction excellence',
    website: 'https://www.shapoorjipallonji.com',
    established_year: 1865,
    company_type: 'Private',
    is_featured: true,
    display_order: 10,
    specialties: ['Residential', 'Commercial', 'Infrastructure', 'Engineering'],
    awards: ['Heritage Excellence Award', 'Construction Excellence Award', 'Best Developer Award']
  },
  {
    name: 'Whiteland Corporation',
    logo_url: '/img/developers/whiteland.png',
    description: 'Whiteland Corporation is a leading real estate developer known for creating premium residential and commercial projects. With a focus on quality construction, innovative design, and customer satisfaction, Whiteland has established a strong presence in the real estate market. The company specializes in luxury apartments and commercial spaces.',
    short_description: 'Premium real estate developer',
    website: 'https://www.whiteland.in',
    established_year: 2005,
    company_type: 'Private',
    is_featured: true,
    display_order: 11,
    specialties: ['Luxury Residential', 'Commercial'],
    awards: ['Premium Developer Award']
  },
  {
    name: 'MNB Buildfab Private Limited',
    logo_url: '/img/developers/mnb.png',
    description: 'MNB Buildfab Private Limited is a real estate developer focused on creating quality residential and commercial projects. The company emphasizes sustainable development practices and customer-centric approach in all its projects.',
    short_description: 'Quality-focused real estate developer',
    established_year: 2000,
    company_type: 'Private',
    is_featured: true,
    display_order: 12,
    specialties: ['Residential', 'Commercial']
  }
]

/**
 * API Route to populate developers table with comprehensive data
 * POST /api/developers/populate-data
 */
export async function POST(request) {
  try {
    // Use admin client if available, otherwise use regular client
    const client = supabaseAdmin || supabase

    let updated = 0
    let errors = []

    for (const devData of developersData) {
      try {
        const { data, error } = await client
          .from('developers')
          .update(devData)
          .eq('name', devData.name)
          .select()

        if (error) {
          errors.push({ name: devData.name, error: error.message })
        } else {
          updated++
        }
      } catch (err) {
        errors.push({ name: devData.name, error: err.message })
      }
    }

    // Sync statistics
    const { error: statsError } = await client.rpc('sync_developer_stats')

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updated} developers`,
      updated,
      errors: errors.length > 0 ? errors : undefined,
      statsSynced: !statsError
    })
  } catch (error) {
    console.error('Error in populate-data route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

