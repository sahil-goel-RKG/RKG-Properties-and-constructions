import { supabase } from '@/lib/supabase/client'
import { supabaseAdmin } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { developerNameToSlug } from '@/lib/developerUtils'

/**
 * API Route to sync developers from projects table
 * POST /api/developers/sync-from-projects
 * This ensures all developers mentioned in projects are in the developers table
 */
export async function POST(request) {
  try {
    // Use admin client if available, otherwise use regular client
    const client = supabaseAdmin || supabase

    // Get all unique developers from projects
    const { data: projects, error: projectsError } = await client
      .from('projects')
      .select('developer')
      .not('developer', 'is', null)

    if (projectsError) {
      return NextResponse.json(
        { error: 'Failed to fetch projects', details: projectsError.message },
        { status: 500 }
      )
    }

    // Get unique developer names
    const uniqueDevelopers = [...new Set(
      projects
        .map(p => p.developer?.trim())
        .filter(Boolean)
    )]

    // Prepare developers data
    const developersToInsert = uniqueDevelopers.map((name, index) => ({
      name: name.trim(),
      slug: developerNameToSlug(name),
      is_featured: false,
      display_order: index + 1,
      is_active: true
    }))

    // Upsert developers
    const { data: insertedDevelopers, error: insertError } = await client
      .from('developers')
      .upsert(developersToInsert, {
        onConflict: 'name',
        ignoreDuplicates: false
      })
      .select()

    if (insertError) {
      console.error('Insert error details:', insertError)
      return NextResponse.json(
        { 
          error: 'Failed to insert developers', 
          details: insertError.message,
          hint: 'Check RLS policies. You may need to run FIX_RLS_FOR_DEVELOPERS.sql or set SUPABASE_SERVICE_ROLE_KEY in .env.local'
        },
        { status: 500 }
      )
    }

    // Sync statistics
    const { error: statsError } = await client.rpc('sync_developer_stats')

    if (statsError) {
      console.warn('Warning: Could not sync stats:', statsError.message)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${insertedDevelopers.length} developers`,
      count: insertedDevelopers.length,
      developers: insertedDevelopers
    })
  } catch (error) {
    console.error('Error in sync-from-projects route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

