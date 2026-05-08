import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { normalizePhone } from '@/lib/crm/normalizePhone'

function requireSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not configured. CRM requires server-side Supabase admin access.'
    )
  }
  return supabaseAdmin
}

function toIsoDateOrNull(raw) {
  if (raw == null) return null
  const s = String(raw).trim()
  if (!s) return null

  const mIso = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (mIso) return `${mIso[1]}-${mIso[2]}-${mIso[3]}`
  return null
}

function isWhitelistedAdminEmail(email) {
  const list = String(process.env.CRM_ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  if (!list.length) return false
  return list.includes(String(email || '').trim().toLowerCase())
}

export async function POST(request) {
  const { userId, sessionClaims } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let isAdmin = sessionClaims?.publicMetadata?.role === 'admin'
  try {
    const user = await currentUser()
    const role = user?.publicMetadata?.role
    const primaryEmail = user?.primaryEmailAddress?.emailAddress
    isAdmin = role === 'admin' || isWhitelistedAdminEmail(primaryEmail)
  } catch {
    // fall back to claims only
  }
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const customerName =
    typeof body?.customer_name === 'string' ? body.customer_name.trim() : ''
  if (!customerName) {
    return NextResponse.json({ error: 'Customer name is required' }, { status: 400 })
  }

  const phone = typeof body?.phone === 'string' ? body.phone.trim() : ''
  if (!phone) {
    return NextResponse.json({ error: 'Phone is required' }, { status: 400 })
  }
  const phoneNormalized = normalizePhone(phone)

  const db = requireSupabaseAdmin()

  const assignedEmployeeId =
    typeof body?.assigned_to_employee_id === 'string'
      ? body.assigned_to_employee_id.trim() || null
      : null

  let assignedEmployeeName = null
  if (assignedEmployeeId) {
    const { data: emp } = await db
      .from('crm_employees')
      .select('name')
      .eq('employee_id', assignedEmployeeId)
      .single()
    assignedEmployeeName = emp?.name || null
  }

  const lead = {
    excel_name:
      typeof body?.excel_name === 'string' ? body.excel_name.trim() || null : null,
    lead_date:
      typeof body?.lead_date === 'string'
        ? toIsoDateOrNull(body.lead_date) || new Date().toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
    source: typeof body?.source === 'string' ? body.source.trim() || null : null,
    location:
      typeof body?.location === 'string' ? body.location.trim() || null : null,
    customer_name: customerName,
    phone: phone || null,
    phone_normalized: phoneNormalized,
    initial_assessment:
      typeof body?.initial_assessment === 'string'
        ? (() => {
            const v = body.initial_assessment.trim().toLowerCase()
            if (!v) return null
            if (v === 'closed') return 'closed'
            return v === 'hot' ? 'running' : v
          })()
        : null,
    projects_interested:
      typeof body?.projects_interested === 'string'
        ? body.projects_interested.trim() || null
        : null,
    uc_rtm:
      typeof body?.uc_rtm === 'string' ? body.uc_rtm.trim().toUpperCase() || null : null,
    agreed_walk_in:
      typeof body?.agreed_walk_in === 'string'
        ? body.agreed_walk_in.trim().toUpperCase() || null
        : null,
    end_use_investment:
      typeof body?.end_use_investment === 'string'
        ? body.end_use_investment.trim() || null
        : null,
    bhk_interested_in:
      typeof body?.bhk_interested_in === 'string'
        ? (() => {
            const v = body.bhk_interested_in.trim()
            if (!v) return null
            const normalized = v.toUpperCase().replace(/\s+/g, ' ')
            // Accept "2", "2bhk", "2 bhk" etc and store consistently as "2 BHK"
            const m = normalized.match(/^([2-6])\s*BHK$/) || normalized.match(/^([2-6])$/)
            if (m && m[1]) return `${m[1]} BHK`
            return v
          })()
        : null,
    follow_up_date:
      typeof body?.follow_up_date === 'string'
        ? toIsoDateOrNull(body.follow_up_date) || null
        : null,
    remarks: typeof body?.remarks === 'string' ? body.remarks.trim() || null : null,
    assigned_to_employee_id: assignedEmployeeId,
    assigned_to_name: assignedEmployeeName,
  }

  // If we have a normalized phone, upsert to avoid duplicates.
  if (lead.phone_normalized) {
    const { data, error } = await db
      .from('crm_leads')
      .upsert(lead, { onConflict: 'phone_normalized', ignoreDuplicates: false })
      .select(
        'id, excel_name, lead_date, source, location, customer_name, phone, initial_assessment, projects_interested, uc_rtm, agreed_walk_in, end_use_investment, bhk_interested_in, follow_up_date, remarks, assigned_to_employee_id, assigned_to_name, created_at, updated_at'
      )
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, lead: data })
  }

  const { data, error } = await db
    .from('crm_leads')
    .insert(lead)
    .select(
      'id, excel_name, lead_date, source, location, customer_name, phone, initial_assessment, projects_interested, uc_rtm, agreed_walk_in, end_use_investment, bhk_interested_in, follow_up_date, remarks, assigned_to_employee_id, assigned_to_name, created_at, updated_at'
    )
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, lead: data })
}

