import { supabase } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'
import { developerNameToSlug } from '@/lib/developerUtils'

/**
 * API Route to create or update developer information
 * POST /api/developers/update
 * Body: { name, logo_url, description, website, email, phone, ... }
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { name, ...developerData } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Developer name is required' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = developerNameToSlug(name)

    // Prepare data for insert/update
    const dataToInsert = {
      name: name.trim(),
      slug,
      ...developerData,
      updated_at: new Date().toISOString()
    }

    // Use upsert to insert or update
    const { data, error } = await supabase
      .from('developers')
      .upsert(dataToInsert, {
        onConflict: 'name',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error upserting developer:', error)
      return NextResponse.json(
        { error: 'Failed to update developer', details: error.message },
        { status: 500 }
      )
    }

    // Sync stats after update
    await supabase.rpc('sync_developer_stats')

    return NextResponse.json({
      success: true,
      message: 'Developer updated successfully',
      data
    })
  } catch (error) {
    console.error('Error in developers/update route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

