import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { apiLimiter, getClientIdentifier } from '@/lib/rateLimit'
import { sanitizeText, sanitizeTextWithFormatting, validateNumber, isValidSlug } from '@/lib/inputValidation'

/**
 * Create a builder floor (admin only, bypasses RLS via service role)
 * POST /api/builder-floors/create
 */
export async function POST(request) {
  try {
    // Auth
    let userId = null
    try {
      const authResult = await auth()
      userId = authResult?.userId
      if (!userId) {
        const user = await currentUser()
        userId = user?.id
      }
    } catch (authError) {
      return NextResponse.json(
        { error: 'Authentication error. Please sign in again.' },
        { status: 401 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Admin client not configured. Please set SUPABASE_SERVICE_ROLE_KEY.' },
        { status: 500 }
      )
    }

    // Rate limit
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
    const payload = { ...body }

    // Required fields
    if (!payload.name || !payload.slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Sanitize text
    payload.name = sanitizeText(payload.name, 500)
    payload.slug = sanitizeText(payload.slug, 200)
    if (!isValidSlug(payload.slug)) {
      return NextResponse.json({ error: 'Invalid slug format' }, { status: 400 })
    }
    if (payload.location) payload.location = sanitizeText(payload.location, 500)
    if (payload.plot_number) payload.plot_number = sanitizeText(payload.plot_number, 200)
    if (payload.plot_size) payload.plot_size = sanitizeText(payload.plot_size, 200)
    if (payload.facing) payload.facing = sanitizeText(payload.facing, 200)
    if (payload.roof_rights) payload.roof_rights = sanitizeText(payload.roof_rights, 50)
    if (payload.condition) payload.condition = sanitizeText(payload.condition, 50)
    if (payload.status) payload.status = sanitizeText(payload.status, 50)
    if (payload.category) payload.category = sanitizeText(payload.category, 50)
    if (payload.possession_date) payload.possession_date = sanitizeText(payload.possession_date, 200)
    if (payload.owner_name) payload.owner_name = sanitizeText(payload.owner_name, 200)
    if (payload.comments) payload.comments = sanitizeTextWithFormatting(payload.comments, 5000)

    // Numbers
    if (payload.floors_count !== undefined && payload.floors_count !== null) {
      const floorsValidation = validateNumber(payload.floors_count, 0, 10)
      if (!floorsValidation.valid) {
        return NextResponse.json({ error: floorsValidation.error }, { status: 400 })
      }
      payload.floors_count = floorsValidation.value
    }

    const priceFields = ['price_top', 'price_mid1', 'price_mid2', 'price_ug']
    for (const field of priceFields) {
      if (payload[field] !== undefined && payload[field] !== null && payload[field] !== '') {
        const validation = validateNumber(payload[field], 0)
        if (!validation.valid) {
          return NextResponse.json({ error: `${field} ${validation.error}` }, { status: 400 })
        }
        payload[field] = validation.value
      } else {
        payload[field] = null
      }
    }

    // Insert builder floor
    const { data, error } = await supabaseAdmin
      .from('builder_floors')
      .insert(payload)
      .select()
      .single()

    if (error) {
      if (error.code === '23505' || error.message?.includes('slug')) {
        return NextResponse.json(
          { error: 'A builder floor with this slug already exists. Please use a different slug.' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to create builder floor', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, builderFloor: data },
      {
        status: 201,
        headers: {
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        },
      }
    )
  } catch (error) {
    console.error('Error in builder-floors/create route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

