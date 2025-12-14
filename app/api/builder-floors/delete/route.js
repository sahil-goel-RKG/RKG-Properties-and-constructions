import { supabaseAdmin } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { apiLimiter, getClientIdentifier } from '@/lib/rateLimit'

/**
 * API Route to delete a builder floor
 * DELETE /api/builder-floors/delete
 * Body: { id }
 * 
 * Uses admin client to bypass RLS for authenticated admin deletes
 */
export async function DELETE(request) {
  try {
    // Check if user is authenticated
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to delete builder floors.' },
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
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Builder floor ID is required' },
        { status: 400 }
      )
    }

    // Delete builder floor using admin client (bypasses RLS)
    const { error: deleteError } = await supabaseAdmin
      .from('builder_floors') // 👈 IMPORTANT: different table
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting builder floor:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete builder floor', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Builder floor deleted successfully'
    }, {
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      }
    })
  } catch (error) {
    console.error('Error in builder-floors/delete route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
