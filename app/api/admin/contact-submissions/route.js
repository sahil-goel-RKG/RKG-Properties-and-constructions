import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Use service role key for server-side operations (bypasses RLS)
const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request) {
  try {
    // Check if user is authenticated with Clerk
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch contact submissions from Supabase
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch contact submissions' },
        { status: 500 }
      )
    }

    return NextResponse.json({ submissions: data || [] }, { status: 200 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    // Check if user is authenticated with Clerk
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      )
    }

    // Add updated_by and updated_at
    const updatePayload = {
      ...updateData,
      updated_by: userId,
      updated_at: new Date().toISOString()
    }

    // Update the contact submission
    const { data, error } = await supabase
      .from('contact_submissions')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to update contact submission', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ submission: data }, { status: 200 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}