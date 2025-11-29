import { supabaseAdmin } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { apiLimiter, getClientIdentifier } from '@/lib/rateLimit'

/**
 * API Route to insert project images
 * POST /api/projects/images
 * Body: { projectId, images: [{ image_url, display_order? }] }
 * 
 * Uses admin client to bypass RLS for authenticated admin operations
 */
export async function POST(request) {
  try {
    // Check if user is authenticated
    let userId = null
    
    try {
      const authResult = await auth()
      userId = authResult?.userId
      
      if (!userId) {
        try {
          const user = await currentUser()
          userId = user?.id
        } catch (fallbackError) {
          console.error('API Images Route - Fallback auth error:', fallbackError)
        }
      }
    } catch (authError) {
      console.error('API Images Route - Auth error:', authError)
      return NextResponse.json(
        { error: 'Authentication error. Please sign in again.', details: authError.message },
        { status: 401 }
      )
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to add project images.', details: 'No user ID found in session' },
        { status: 401 }
      )
    }

    // Rate limiting
    const clientId = getClientIdentifier(request)
    const rateLimitResult = await apiLimiter.limit(`${userId}-${clientId}`)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': '0',
          }
        }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Admin client not configured. Please set SUPABASE_SERVICE_ROLE_KEY in .env.local' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { projectId, images } = body

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: 'Images array is required and must not be empty' },
        { status: 400 }
      )
    }

    // Validate each image object
    for (const image of images) {
      if (!image.image_url) {
        return NextResponse.json(
          { error: 'Each image must have an image_url' },
          { status: 400 }
        )
      }
    }

    // Prepare images for insertion
    const imagesToInsert = images.map((img, index) => ({
      project_id: projectId,
      image_url: img.image_url,
      display_order: img.display_order !== undefined ? img.display_order : index + 1
    }))

    // Insert images using admin client (bypasses RLS)
    const { data: insertedImages, error: insertError } = await supabaseAdmin
      .from('project_images')
      .insert(imagesToInsert)
      .select()

    if (insertError) {
      console.error('Error inserting project images:', insertError)
      
      // Handle table not found error gracefully
      if (insertError.code === 'PGRST205' || insertError.message?.includes('Could not find the table')) {
        return NextResponse.json(
          { error: 'project_images table does not exist. Please create the table first.', details: insertError.message },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to insert project images', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Project images inserted successfully',
      data: insertedImages
    }, {
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      }
    })
  } catch (error) {
    console.error('Error in projects/images route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * API Route to delete project images
 * DELETE /api/projects/images
 * Body: { imageIds: [id1, id2, ...] }
 * 
 * Uses admin client to bypass RLS for authenticated admin operations
 */
export async function DELETE(request) {
  try {
    // Check if user is authenticated
    let userId = null
    
    try {
      const authResult = await auth()
      userId = authResult?.userId
      
      if (!userId) {
        try {
          const user = await currentUser()
          userId = user?.id
        } catch (fallbackError) {
          console.error('API Images Delete Route - Fallback auth error:', fallbackError)
        }
      }
    } catch (authError) {
      console.error('API Images Delete Route - Auth error:', authError)
      return NextResponse.json(
        { error: 'Authentication error. Please sign in again.', details: authError.message },
        { status: 401 }
      )
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to delete project images.', details: 'No user ID found in session' },
        { status: 401 }
      )
    }

    // Rate limiting
    const clientId = getClientIdentifier(request)
    const rateLimitResult = await apiLimiter.limit(`${userId}-${clientId}`)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': '0',
          }
        }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Admin client not configured. Please set SUPABASE_SERVICE_ROLE_KEY in .env.local' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { imageIds } = body

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json(
        { error: 'Image IDs array is required and must not be empty' },
        { status: 400 }
      )
    }

    // Delete images using admin client (bypasses RLS)
    const { error: deleteError } = await supabaseAdmin
      .from('project_images')
      .delete()
      .in('id', imageIds)

    if (deleteError) {
      console.error('Error deleting project images:', deleteError)
      
      // Handle table not found error gracefully
      if (deleteError.code === 'PGRST205' || deleteError.message?.includes('Could not find the table')) {
        return NextResponse.json(
          { error: 'project_images table does not exist. Please create the table first.', details: deleteError.message },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to delete project images', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Project images deleted successfully'
    }, {
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      }
    })
  } catch (error) {
    console.error('Error in projects/images DELETE route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

