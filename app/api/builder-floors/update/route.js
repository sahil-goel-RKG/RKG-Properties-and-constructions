import { supabaseAdmin } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { apiLimiter, getClientIdentifier } from '@/lib/rateLimit'

export async function PUT(request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      )
    }

    const clientId = getClientIdentifier(request)
    const rate = await apiLimiter.limit(`${userId}-${clientId}`)
    if (!rate.success) {
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

    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          error:
            'Admin client not configured. Set SUPABASE_SERVICE_ROLE_KEY in env.',
        },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Builder floor ID is required' },
        { status: 400 }
      )
    }

    // 👇 actually update the builder_floors table
    const { data, error } = await supabaseAdmin
      .from('builder_floors')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating builder floor:', error)
      return NextResponse.json(
        {
          error: 'Failed to update builder floor',
          details: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': rate.remaining.toString(),
        },
      }
    )
  } catch (err) {
    console.error('Error in builder-floors/update route:', err)
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    )
  }
}
