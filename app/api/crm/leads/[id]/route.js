import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase/server'

function requireSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not configured. CRM requires server-side Supabase admin access.'
    )
  }
  return supabaseAdmin
}

export async function PATCH(request, { params }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const p = await Promise.resolve(params)
  const id = p && typeof p.id === 'string' ? p.id : null
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const initialAssessment =
    typeof body?.initial_assessment === 'string'
      ? body.initial_assessment.trim().toLowerCase()
      : null
  const projectsInterested =
    typeof body?.projects_interested === 'string'
      ? body.projects_interested.trim()
      : null
  const ucRtm =
    typeof body?.uc_rtm === 'string' ? body.uc_rtm.trim().toUpperCase() : null
  const agreedWalkIn =
    typeof body?.agreed_walk_in === 'string'
      ? body.agreed_walk_in.trim().toUpperCase()
      : null
  const endUseInvestment =
    typeof body?.end_use_investment === 'string'
      ? body.end_use_investment.trim()
      : null
  const followUpDate =
    typeof body?.follow_up_date === 'string' ? body.follow_up_date.trim() : null
  const remarks = typeof body?.remarks === 'string' ? body.remarks.trim() : null
  const assignedToName =
    typeof body?.assigned_to_name === 'string' ? body.assigned_to_name.trim() : null

  const update = {}
  if (initialAssessment != null) update.initial_assessment = initialAssessment
  if (projectsInterested != null) update.projects_interested = projectsInterested
  if (ucRtm != null) update.uc_rtm = ucRtm
  if (agreedWalkIn != null) update.agreed_walk_in = agreedWalkIn
  if (endUseInvestment != null) update.end_use_investment = endUseInvestment
  if (followUpDate != null) update.follow_up_date = followUpDate || null
  if (remarks != null) update.remarks = remarks
  if (assignedToName != null) update.assigned_to_name = assignedToName

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const db = requireSupabaseAdmin()
  const { data, error } = await db
    .from('crm_leads')
    .update(update)
    .eq('id', id)
    .select(
      'id, excel_name, source, customer_name, phone, initial_assessment, projects_interested, uc_rtm, agreed_walk_in, end_use_investment, follow_up_date, remarks, assigned_to_name, created_at, updated_at'
    )
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, lead: data })
}

