import { supabaseAdmin } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * API Route to update a project
 * PUT /api/projects/update
 * Body: { id, ...projectData }
 * 
 * Uses admin client to bypass RLS for authenticated admin updates
 */
export async function PUT(request) {
  try {
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

    // Ensure updated_at is set
    updateData.updated_at = new Date().toISOString()

    // Update project using admin client (bypasses RLS)
    const { data: updatedProject, error: updateError } = await supabaseAdmin
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating project:', updateError)
      return NextResponse.json(
        { error: 'Failed to update project', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    })
  } catch (error) {
    console.error('Error in projects/update route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}


