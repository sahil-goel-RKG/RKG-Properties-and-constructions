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

function normalizeOptionalString(v) {
  if (typeof v !== 'string') return null
  const s = v.trim()
  return s ? s : null
}

function normalizeEnumCI(v, allowedMap) {
  const s = normalizeOptionalString(v)
  if (!s) return null
  const key = s.toLowerCase()
  return allowedMap[key] ?? s
}

function normalizeBhkInterestedIn(v) {
  const s = normalizeOptionalString(v)
  if (!s) return null
  const normalized = s.toUpperCase().replace(/\s+/g, ' ')
  const m = normalized.match(/^([2-6])\s*BHK$/) || normalized.match(/^([2-6])$/)
  if (m && m[1]) return `${m[1]} BHK`
  return s
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

  const update = {}
  if (typeof body?.location === 'string') {
    update.location = normalizeOptionalString(body.location)
  }
  if (typeof body?.initial_assessment === 'string') {
    update.initial_assessment = normalizeEnumCI(body.initial_assessment, {
      hot: 'running', // backward-compat: treat "hot" as "running"
      running: 'running',
      warm: 'warm',
      cold: 'cold',
    })
  }
  if (typeof body?.projects_interested === 'string') {
    update.projects_interested = normalizeOptionalString(body.projects_interested)
  }
  if (typeof body?.uc_rtm === 'string') {
    update.uc_rtm = normalizeEnumCI(body.uc_rtm, { uc: 'UC', rtm: 'RTM' })
  }
  if (typeof body?.agreed_walk_in === 'string') {
    update.agreed_walk_in = normalizeEnumCI(body.agreed_walk_in, {
      yes: 'YES',
      no: 'NO',
    })
  }
  if (typeof body?.end_use_investment === 'string') {
    update.end_use_investment = normalizeEnumCI(body.end_use_investment, {
      'end use': 'End Use',
      enduse: 'End Use',
      investment: 'Investment',
    })
  }
  if (typeof body?.bhk_interested_in === 'string') {
    update.bhk_interested_in = normalizeBhkInterestedIn(body.bhk_interested_in)
  }
  if (typeof body?.follow_up_date === 'string') {
    update.follow_up_date = normalizeOptionalString(body.follow_up_date)
  }
  if (typeof body?.remarks === 'string') {
    update.remarks = normalizeOptionalString(body.remarks)
  }
  if (typeof body?.assigned_to_name === 'string') {
    update.assigned_to_name = normalizeOptionalString(body.assigned_to_name)
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const db = requireSupabaseAdmin()
  const { data, error } = await db
    .from('crm_leads')
    .update(update)
    .eq('id', id)
    .select(
      'id, excel_name, source, location, customer_name, phone, initial_assessment, projects_interested, uc_rtm, agreed_walk_in, end_use_investment, bhk_interested_in, follow_up_date, remarks, assigned_to_name, created_at, updated_at'
    )
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, lead: data })
}

