import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * Secure proxy route for downloading brochures
 * Masks the actual Supabase storage URL from users
 * 
 * GET /api/download-brochure?type=project&slug=project-slug
 * GET /api/download-brochure?type=builder-floor&slug=builder-floor-slug
 * GET /api/download-brochure?type=builder-floor&slug=builder-floor-slug&building=0
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'project' or 'builder-floor'
    const slug = searchParams.get('slug')
    const buildingIndex = searchParams.get('building') // For builder floors

    if (!type || !slug) {
      return NextResponse.json(
        { error: 'Missing required parameters: type and slug' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()
    let brochureUrl = null

    if (type === 'project') {
      // Fetch project brochure
      const { data: project, error } = await supabase
        .from('projects')
        .select('brochure_url, name')
        .eq('slug', slug)
        .single()

      if (error || !project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }

      brochureUrl = project.brochure_url
    } else if (type === 'builder-floor') {
      // Fetch builder floor brochure
      const { data: builderFloor, error } = await supabase
        .from('builder_floors')
        .select('building_config, name')
        .eq('slug', slug)
        .single()

      if (error || !builderFloor) {
        return NextResponse.json(
          { error: 'Builder floor not found' },
          { status: 404 }
        )
      }

      // Parse building_config to get brochure URL
      let buildingConfig = null
      try {
        buildingConfig = typeof builderFloor.building_config === 'string'
          ? JSON.parse(builderFloor.building_config)
          : builderFloor.building_config
      } catch (e) {
        console.error('Error parsing building_config:', e)
        return NextResponse.json(
          { error: 'Invalid building configuration' },
          { status: 500 }
        )
      }

      // Get brochure URL from specific building or first building
      const buildingIdx = buildingIndex ? parseInt(buildingIndex) : 0
      if (Array.isArray(buildingConfig) && buildingConfig[buildingIdx]) {
        brochureUrl = buildingConfig[buildingIdx].brochure_url
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be "project" or "builder-floor"' },
        { status: 400 }
      )
    }

    if (!brochureUrl) {
      return NextResponse.json(
        { error: 'Brochure not found for this property' },
        { status: 404 }
      )
    }

    // Validate that the URL is from Supabase storage
    if (!brochureUrl.includes('supabase.co/storage/v1/object/public')) {
      return NextResponse.json(
        { error: 'Invalid brochure URL' },
        { status: 400 }
      )
    }

    // Fetch the file from Supabase storage
    try {
      const response = await fetch(brochureUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      })

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch brochure' },
          { status: response.status }
        )
      }

      // Get the file content
      const fileBuffer = await response.arrayBuffer()
      const contentType = response.headers.get('content-type') || 'application/pdf'

      // Return the file with proper headers
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="brochure.pdf"`,
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      })
    } catch (fetchError) {
      console.error('Error fetching brochure from storage:', fetchError)
      return NextResponse.json(
        { error: 'Failed to retrieve brochure' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in download-brochure route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

