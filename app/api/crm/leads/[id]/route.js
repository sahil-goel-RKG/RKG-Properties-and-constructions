import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
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

function isWhitelistedAdminEmail(email) {
  const list = String(process.env.CRM_ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  if (!list.length) return false
  return list.includes(String(email || '').trim().toLowerCase())
}

function isMissingWhatsappRemindedColumn(error) {
  const msg = String(error?.message || '')
  return msg.includes("follow_up_whatsapp_reminded_at")
}

function normalizeDateForCompare(value) {
  if (value == null || value === '') return ''
  return String(value).slice(0, 10)
}

function normalizeTimeForCompare(value) {
  if (value == null || value === '') return ''
  const s = String(value).trim()
  const m = s.match(/^(\d{1,2}):(\d{2})/)
  if (!m) return s
  return `${String(Number(m[1])).padStart(2, '0')}:${m[2]}`
}

async function employeeNameForId(db, employeeId) {
  if (!employeeId) return null
  const { data } = await db
    .from('crm_employees')
    .select('name')
    .eq('employee_id', employeeId)
    .single()
  return data?.name || null
}

export async function PATCH(request, { params }) {
  const { userId, sessionClaims } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Prefer live user metadata (session claims can be stale until re-login).
  let isAdmin =
    sessionClaims?.publicMetadata?.role === 'admin' ||
    sessionClaims?.metadata?.role === 'admin'
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const role = user?.publicMetadata?.role
    const primaryEmail = user?.primaryEmailAddress?.emailAddress
    isAdmin = role === 'admin' || isWhitelistedAdminEmail(primaryEmail)
  } catch {
    // If Clerk read fails, fall back to session claims.
  }

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
      closed: 'closed',
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
  if (typeof body?.assigned_to_employee_id === 'string') {
    update.assigned_to_employee_id = normalizeOptionalString(body.assigned_to_employee_id)
  }
  if (typeof body?.follow_up_date === 'string') {
    update.follow_up_date = normalizeOptionalString(body.follow_up_date)
  }
  if (typeof body?.follow_up_time === 'string') {
    const s = body.follow_up_time.trim()
    if (!s) {
      update.follow_up_time = null
    } else {
      const m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
      if (m) {
        const hh = String(Math.min(23, Number(m[1]))).padStart(2, '0')
        const mm = String(Math.min(59, Number(m[2]))).padStart(2, '0')
        const ss =
          m[3] != null ? String(Math.min(59, Number(m[3]))).padStart(2, '0') : '00'
        update.follow_up_time = `${hh}:${mm}:${ss}`
      } else {
        update.follow_up_time = null
      }
    }
  }
  if (typeof body?.remarks === 'string') {
    update.remarks = normalizeOptionalString(body.remarks)
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const db = requireSupabaseAdmin()

  // Permission: employees cannot change assignment once a lead is assigned
  if (!isAdmin && Object.prototype.hasOwnProperty.call(update, 'assigned_to_employee_id')) {
    const { data: existing, error: existingError } = await db
      .from('crm_leads')
      .select('assigned_to_employee_id')
      .eq('id', id)
      .single()
    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 })
    }
    const existingAssigned = existing?.assigned_to_employee_id || null
    const nextAssigned = update.assigned_to_employee_id || null
    if (existingAssigned !== nextAssigned) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  // If assigned_to_employee_id is provided, keep assigned_to_name consistent.
  if (Object.prototype.hasOwnProperty.call(update, 'assigned_to_employee_id')) {
    update.assigned_to_name = await employeeNameForId(db, update.assigned_to_employee_id)
  }

  // Reset WhatsApp reminder stamp only when follow-up actually changes.
  // The live table may not have follow_up_whatsapp_reminded_at yet.
  const followUpFieldsInPayload =
    Object.prototype.hasOwnProperty.call(update, 'follow_up_date') ||
    Object.prototype.hasOwnProperty.call(update, 'follow_up_time')
  if (followUpFieldsInPayload) {
    const { data: existingFollowUp } = await db
      .from('crm_leads')
      .select('follow_up_date, follow_up_time')
      .eq('id', id)
      .single()

    const nextDate = Object.prototype.hasOwnProperty.call(update, 'follow_up_date')
      ? update.follow_up_date
      : existingFollowUp?.follow_up_date
    const nextTime = Object.prototype.hasOwnProperty.call(update, 'follow_up_time')
      ? update.follow_up_time
      : existingFollowUp?.follow_up_time

    const followUpChanged =
      normalizeDateForCompare(existingFollowUp?.follow_up_date) !==
        normalizeDateForCompare(nextDate) ||
      normalizeTimeForCompare(existingFollowUp?.follow_up_time) !==
        normalizeTimeForCompare(nextTime)

    if (followUpChanged) {
      update.follow_up_whatsapp_reminded_at = null
    }
  }

  const leadSelect =
    'id, excel_name, source, location, customer_name, phone, initial_assessment, projects_interested, uc_rtm, agreed_walk_in, end_use_investment, bhk_interested_in, follow_up_date, follow_up_time, remarks, assigned_to_employee_id, assigned_to_name, created_at, updated_at'

  let { data, error } = await db
    .from('crm_leads')
    .update(update)
    .eq('id', id)
    .select(leadSelect)
    .single()

  if (error && isMissingWhatsappRemindedColumn(error) && 'follow_up_whatsapp_reminded_at' in update) {
    delete update.follow_up_whatsapp_reminded_at
    const retry = await db
      .from('crm_leads')
      .update(update)
      .eq('id', id)
      .select(leadSelect)
      .single()
    data = retry.data
    error = retry.error
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, lead: data })
}

