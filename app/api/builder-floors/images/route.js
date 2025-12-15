import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { apiLimiter, getClientIdentifier } from '@/lib/rateLimit'

/**
 * Insert or delete builder floor images (admin only, bypasses RLS)
 * POST: { builderFloorId, images: [{ image_url, display_order }] }
 * DELETE: { imageIds: [id1, id2] }
 */

export async function POST(request) {
  try {
    let userId = null
    const authResult = await auth()
    userId = authResult?.userId
    if (!userId) {
      const user = await currentUser()
      userId = user?.id
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Admin client not configured. Please set SUPABASE_SERVICE_ROLE_KEY.' },
        { status: 500 }
      )
    }

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
          },
        }
      )
    }

    const body = await request.json()
    const { builderFloorId, images } = body

    if (!builderFloorId || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: 'builderFloorId and images are required' },
        { status: 400 }
      )
    }

    const payload = images.map((img, idx) => ({
      builder_floor_id: builderFloorId,
      image_url: img.image_url,
      display_order: img.display_order ?? idx + 1,
    }))

    const { data, error } = await supabaseAdmin
      .from('builder_floor_images')
      .insert(payload)
      .select()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to insert images', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, images: data },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        },
      }
    )
  } catch (error) {
    console.error('Error in builder-floors/images POST:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    let userId = null
    const authResult = await auth()
    userId = authResult?.userId
    if (!userId) {
      const user = await currentUser()
      userId = user?.id
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Admin client not configured. Please set SUPABASE_SERVICE_ROLE_KEY.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { imageIds } = body

    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json(
        { error: 'imageIds array is required' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('builder_floor_images')
      .delete()
      .in('id', imageIds)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete images', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error in builder-floors/images DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

