import { supabase } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

/**
 * API Route to sync developer statistics from projects table
 * POST /api/developers/sync-stats
 */
export async function POST(request) {
  try {
    // Call the sync function
    const { data, error } = await supabase.rpc('sync_developer_stats')

    if (error) {
      console.error('Error syncing developer stats:', error)
      return NextResponse.json(
        { error: 'Failed to sync developer statistics', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Developer statistics synced successfully'
    })
  } catch (error) {
    console.error('Error in sync-stats route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

