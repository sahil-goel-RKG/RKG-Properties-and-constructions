import { supabaseAdmin } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { apiLimiter, getClientIdentifier } from '@/lib/rateLimit'
import { sanitizeText, sanitizeTextWithFormatting, validateNumber, isValidSlug } from '@/lib/inputValidation'

/**
 * API Route to update a project
 * PUT /api/projects/update
 * Body: { id, ...projectData }
 * 
 * Uses admin client to bypass RLS for authenticated admin updates
 */
export async function PUT(request) {
  try {
    // Check if user is authenticated
    // Try multiple methods to get user ID
    let userId = null
    
    try {
      // Method 1: Try auth() first
      const authResult = await auth()
      userId = authResult?.userId
      
      // Method 2: If auth() doesn't work, try currentUser()
      if (!userId) {
        try {
          const user = await currentUser()
          userId = user?.id
          console.log('API Update Route - Using currentUser():', { userId })
        } catch (userError) {
          console.log('API Update Route - currentUser() failed:', userError.message)
        }
      }
      
      console.log('API Update Route - Auth check:', { 
        userId, 
        hasAuth: !!authResult,
        authKeys: authResult ? Object.keys(authResult) : [],
        hasCookies: request.headers.get('cookie') ? 'yes' : 'no'
      })
    } catch (authError) {
      console.error('API Update Route - Auth error:', authError)
      // Try currentUser as fallback
      try {
        const user = await currentUser()
        userId = user?.id
        console.log('API Update Route - Fallback to currentUser():', { userId })
      } catch (fallbackError) {
        console.error('API Update Route - Fallback auth error:', fallbackError)
        return NextResponse.json(
          { error: 'Authentication error. Please sign in again.', details: authError.message },
          { status: 401 }
        )
      }
    }
    
    if (!userId) {
      // Log request headers for debugging (excluding sensitive data)
      const headers = {}
      request.headers.forEach((value, key) => {
        if (!key.toLowerCase().includes('cookie') && !key.toLowerCase().includes('authorization')) {
          headers[key] = value
        }
      })
      const hasCookie = request.headers.get('cookie') ? 'yes' : 'no'
      console.error('API Update Route - Unauthorized: No userId found', {
        url: request.url,
        method: request.method,
        headers: Object.keys(headers),
        hasCookie
      })
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to update projects.', details: 'No user ID found in session. Please refresh the page and try again.' },
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
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Get current project to check if slug is being changed
    const { data: currentProject } = await supabaseAdmin
      .from('projects')
      .select('slug')
      .eq('id', id)
      .single()

    // Validate and sanitize input data
    if (updateData.name) {
      updateData.name = sanitizeText(updateData.name, 500)
    }
    
    if (updateData.slug) {
      if (!isValidSlug(updateData.slug)) {
        return NextResponse.json(
          { error: 'Invalid slug format' },
          { status: 400 }
        )
      }
      
      // Only check for duplicates if slug is being changed
      const slugChanged = currentProject && currentProject.slug !== updateData.slug
      
      if (slugChanged) {
        // Check if slug already exists for a different project
        const { data: existingProject, error: checkError } = await supabaseAdmin
          .from('projects')
          .select('id, slug')
          .eq('slug', updateData.slug)
          .neq('id', id)
          .maybeSingle()
        
        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error checking slug:', checkError)
        }
        
        if (existingProject) {
          return NextResponse.json(
            { error: `A property with the slug "${updateData.slug}" already exists. Please choose a different slug.` },
            { status: 400 }
          )
        }
      }
    }
    
    if (updateData.location) {
      updateData.location = sanitizeText(updateData.location, 500)
    }
    
    if (updateData.short_description) {
      updateData.short_description = sanitizeTextWithFormatting(updateData.short_description, 10000)
    }
    
    if (updateData.full_description) {
      updateData.full_description = sanitizeTextWithFormatting(updateData.full_description, 50000)
    }
    
    if (updateData.price !== undefined) {
      // Remove "Cr" suffix if present (for display purposes)
      let priceValue = updateData.price
      if (typeof priceValue === 'string') {
        priceValue = priceValue.replace(/\s*(Cr|cr|Crore|crore)\s*/gi, '').trim()
      }
      
      const priceValidation = validateNumber(priceValue, 0)
      if (!priceValidation.valid) {
        return NextResponse.json(
          { error: priceValidation.error },
          { status: 400 }
        )
      }
      // Store the numeric value (database stores as number or text without Cr)
      updateData.price = priceValidation.value !== null ? priceValidation.value.toString() : null
    }
    
    if (updateData.total_towers !== undefined) {
      const towersValidation = validateNumber(updateData.total_towers, 0, 1000)
      if (!towersValidation.valid) {
        return NextResponse.json(
          { error: towersValidation.error },
          { status: 400 }
        )
      }
      updateData.total_towers = towersValidation.value
    }
    
    if (updateData.total_units !== undefined) {
      const unitsValidation = validateNumber(updateData.total_units, 0, 100000)
      if (!unitsValidation.valid) {
        return NextResponse.json(
          { error: unitsValidation.error },
          { status: 400 }
        )
      }
      updateData.total_units = unitsValidation.value
    }

    // Validate and sanitize brochure_url if provided
    if (updateData.brochure_url !== undefined && updateData.brochure_url !== null) {
      if (typeof updateData.brochure_url === 'string' && updateData.brochure_url.trim() !== '') {
        // Validate it's a valid URL
        try {
          new URL(updateData.brochure_url)
          // Sanitize the URL (remove any potential XSS)
          updateData.brochure_url = sanitizeText(updateData.brochure_url, 1000)
          console.log('✅ Brochure URL validated and sanitized:', updateData.brochure_url)
        } catch (urlError) {
          console.error('❌ Invalid brochure_url:', updateData.brochure_url, urlError)
          return NextResponse.json(
            { error: 'Invalid brochure URL format' },
            { status: 400 }
          )
        }
      } else {
        // Remove empty or invalid brochure_url from update
        delete updateData.brochure_url
        console.log('⚠️ Brochure URL is empty/invalid, removing from update')
      }
    } else if (updateData.brochure_url === null) {
      // Explicitly set to null to clear existing brochure
      console.log('ℹ️ Setting brochure_url to null to clear existing brochure')
    } else {
      console.log('ℹ️ No brochure_url in updateData')
    }

    // Ensure updated_at is set
    updateData.updated_at = new Date().toISOString()
    
    console.log('Final updateData before database update:', JSON.stringify(updateData, null, 2))

    // Update project using admin client (bypasses RLS)
    const { data: updatedProject, error: updateError } = await supabaseAdmin
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating project:', updateError)
      
      // Handle duplicate slug error specifically
      if (updateError.code === '23505' || updateError.message?.includes('duplicate key') || updateError.message?.includes('unique constraint')) {
        if (updateError.message?.includes('slug')) {
          return NextResponse.json(
            { error: `A property with this slug already exists. Please choose a different slug.`, details: updateError.message },
            { status: 400 }
          )
        }
        return NextResponse.json(
          { error: 'A property with this information already exists. Please check for duplicates.', details: updateError.message },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to update project', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    }, {
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      }
    })
  } catch (error) {
    console.error('Error in projects/update route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}


