import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { apiLimiter, getClientIdentifier } from '@/lib/rateLimit'
import { sanitizeText, sanitizeTextWithFormatting, validateNumber, isValidSlug } from '@/lib/inputValidation'

/**
 * Create a project (admin only, bypasses RLS via service role)
 * POST /api/projects/create
 */
export async function POST(request) {
  try {
    // Authenticate admin (Clerk)
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

    // Rate limit per admin + client
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
    const project = { ...body }

    // Basic required fields
    if (!project.name || !project.slug || !project.type) {
      return NextResponse.json(
        { error: 'Name, slug, and type are required' },
        { status: 400 }
      )
    }

    // Sanitize text fields
    project.name = sanitizeText(project.name, 500)
    project.slug = sanitizeText(project.slug, 200)
    if (!isValidSlug(project.slug)) {
      return NextResponse.json({ error: 'Invalid slug format' }, { status: 400 })
    }
    if (project.location) project.location = sanitizeText(project.location, 500)
    if (project.developer) project.developer = sanitizeText(project.developer, 500)
    if (project.short_description) project.short_description = sanitizeText(project.short_description, 1000)
    if (project.full_description) project.full_description = sanitizeTextWithFormatting(project.full_description, 50000)
    if (project.connectivity) project.connectivity = sanitizeTextWithFormatting(project.connectivity, 5000)
    if (project.payment_plan) project.payment_plan = sanitizeTextWithFormatting(project.payment_plan, 5000)

    // Numbers
    if (project.price !== undefined && project.price !== null) {
      const priceValidation = validateNumber(project.price, 0)
      if (!priceValidation.valid) {
        return NextResponse.json({ error: priceValidation.error }, { status: 400 })
      }
      project.price = priceValidation.value !== null ? priceValidation.value.toString() : null
    }

    if (project.total_towers !== undefined && project.total_towers !== null) {
      const towersValidation = validateNumber(project.total_towers, 0, 1000)
      if (!towersValidation.valid) {
        return NextResponse.json({ error: towersValidation.error }, { status: 400 })
      }
      project.total_towers = towersValidation.value
    }

    if (project.total_units !== undefined && project.total_units !== null) {
      const unitsValidation = validateNumber(project.total_units, 0, 100000)
      if (!unitsValidation.valid) {
        return NextResponse.json({ error: unitsValidation.error }, { status: 400 })
      }
      project.total_units = unitsValidation.value
    }

    // Insert project
    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert(project)
      .select()
      .single()

    if (error) {
      if (error.code === '23505' || error.message?.includes('slug')) {
        return NextResponse.json(
          { error: 'A project with this slug already exists. Please use a different slug.' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to create project', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, project: data },
      {
        status: 201,
        headers: {
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        },
      }
    )
  } catch (error) {
    console.error('Error in projects/create route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

