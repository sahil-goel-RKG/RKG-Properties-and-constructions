import { supabaseAdmin } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { developerNameToSlug } from '@/lib/developerUtils'

/**
 * API Route to sync a single developer
 * POST /api/developers/sync-single
 * Body: { developerName }
 * 
 * Automatically creates/updates a developer entry when a project is added/updated
 */
export async function POST(request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Admin client not configured. Please set SUPABASE_SERVICE_ROLE_KEY in .env.local' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { developerName } = body

    if (!developerName || !developerName.trim()) {
      return NextResponse.json(
        { success: true, message: 'No developer name provided, skipping sync' },
        { status: 200 }
      )
    }

    const trimmedName = developerName.trim()

    // Check if developer already exists
    const { data: existingDeveloper, error: checkError } = await supabaseAdmin
      .from('developers')
      .select('id, name')
      .eq('name', trimmedName)
      .single()

    // If developer exists, just sync stats and return
    if (existingDeveloper && !checkError) {
      // Sync statistics for this developer
      await supabaseAdmin.rpc('sync_developer_stats')
      return NextResponse.json({
        success: true,
        message: 'Developer already exists, stats synced',
        developer: existingDeveloper
      })
    }

    // Developer doesn't exist, create it
    const slug = developerNameToSlug(trimmedName)

    // Get current max display_order to append new developer
    const { data: maxOrderData } = await supabaseAdmin
      .from('developers')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single()

    const displayOrder = maxOrderData?.display_order ? maxOrderData.display_order + 1 : 1

    const { data: newDeveloper, error: insertError } = await supabaseAdmin
      .from('developers')
      .insert({
        name: trimmedName,
        slug,
        is_featured: false,
        display_order: displayOrder,
        is_active: true
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting developer:', insertError)
      return NextResponse.json(
        { error: 'Failed to create developer', details: insertError.message },
        { status: 500 }
      )
    }

    // Sync statistics after adding new developer
    await supabaseAdmin.rpc('sync_developer_stats')

    return NextResponse.json({
      success: true,
      message: 'Developer synced successfully',
      developer: newDeveloper
    })
  } catch (error) {
    console.error('Error in developers/sync-single route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}


