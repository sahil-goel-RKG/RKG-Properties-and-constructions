import { NextResponse } from 'next/server'
import Papa from 'papaparse'
import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { normalizePhone } from '@/lib/crm/normalizePhone'

function requireSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not configured. CRM import requires server-side Supabase admin access.'
    )
  }
  return supabaseAdmin
}

function serializeSupabaseError(err) {
  if (!err) return null
  // PostgREST errors usually include: message, details, hint, code
  if (typeof err === 'object') {
    const { message, details, hint, code } = err
    return { message, details, hint, code }
  }
  return { message: String(err) }
}

function unknownColumnFromSchemaCacheError(err) {
  const msg = typeof err?.message === 'string' ? err.message : ''
  const code = err?.code
  // Example:
  // "Could not find the 'lead_date' column of 'crm_leads' in the schema cache"
  if (code === 'PGRST204') {
    const m = msg.match(/Could not find the '([^']+)' column of 'crm_leads'/)
    if (m && m[1]) return m[1]
  }
  return null
}

function pickFirst(obj, keys) {
  for (const key of keys) {
    if (obj[key] != null && String(obj[key]).trim() !== '') return obj[key]
  }
  return null
}

function filenameToLabel(filename) {
  if (typeof filename !== 'string') return null
  const base = filename.split(/[\\/]/).pop() || filename
  // remove common extensions
  return base.replace(/\.(csv|xlsx|xls)$/i, '').trim() || base.trim()
}

function toIsoDateOrNull(raw) {
  if (raw == null) return null
  const s = String(raw).trim()
  if (!s) return null

  // YYYY-MM-DD
  const mIso = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (mIso) return `${mIso[1]}-${mIso[2]}-${mIso[3]}`

  // DD-MM-YYYY or DD/MM/YYYY
  const mDmy = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/)
  if (mDmy) {
    const dd = String(mDmy[1]).padStart(2, '0')
    const mm = String(mDmy[2]).padStart(2, '0')
    const yyyy = mDmy[3]
    return `${yyyy}-${mm}-${dd}`
  }

  // Fallback: Date.parse
  const t = Date.parse(s)
  if (!Number.isNaN(t)) {
    const d = new Date(t)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

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
  try {
    const { userId, sessionClaims } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
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

    let formData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json(
        { error: 'Expected multipart/form-data' },
        { status: 400 }
      )
    }

    const file = formData.get('file')
    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'CSV file is required' },
        { status: 400 }
      )
    }

    const filename = typeof file.name === 'string' ? file.name : 'upload.csv'
    const uploadedExcelName = filenameToLabel(filename)
    const uploadedLeadDate = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    const text = await file.text()

    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => String(h || '').trim(),
    })

    if (parsed.errors?.length) {
      return NextResponse.json(
        { error: 'CSV parse error', details: parsed.errors.slice(0, 5) },
        { status: 400 }
      )
    }

    const rows = Array.isArray(parsed.data) ? parsed.data : []
    if (!rows.length) {
      return NextResponse.json({ error: 'CSV has no rows' }, { status: 400 })
    }

    const db = requireSupabaseAdmin()

    const { data: employees } = await db
      .from('crm_employees')
      .select('employee_id, name')
    const employeeById = new Map(
      (employees || []).map((e) => [String(e.employee_id || '').trim().toLowerCase(), e])
    )
    const employeeByName = new Map(
      (employees || []).map((e) => [String(e.name || '').trim().toLowerCase(), e])
    )

    const { data: batch, error: batchError } = await db
      .from('crm_import_batches')
      .insert({
        filename,
        uploaded_by_clerk_user_id: userId,
      })
      .select('id')
      .single()

    if (batchError || !batch) {
      return NextResponse.json(
        {
          error: 'Failed to create import batch',
          details: serializeSupabaseError(batchError) || batchError?.message,
        },
        { status: 500 }
      )
    }

    let inserted = 0
    let updated = 0
    let skipped = 0
    const errors = []

    // Column mapping (supports your sheet variations)
    const leadDateKeys = ['DATE', 'Date', 'date', 'Lead Date', 'lead_date']
    const excelNameKeys = ['Excel Name', 'excel_name']
    const sourceKeys = ['Source', 'source']
    const locationKeys = ['Location', 'location', 'City', 'Area']
    const customerKeys = [
      'Customer Name',
      'Name',
      'customer_name',
      'customer',
      'Prospect Name',
      'Prospect',
    ]
    const phoneKeys = [
      'Contact',
      'Phone',
      'Mobile',
      'contact',
      'phone',
      'mobile',
      'Prospect Number',
      'Prospect No',
      'Prospect Phone',
    ]
    const initialAssessmentKeys = [
      'Initial Assesment',
      'Initial Assessment',
      'initial_assessment',
    ]
    const remarksKeys = ['Remarks', 'remarks']
    const projectsInterestedKeys = ['Projects Interested', 'projects_interested']
    const ucRtmKeys = ['UC/ RTM', 'UC/RTM', 'uc_rtm']
    const agreedWalkInKeys = [
      'Has the Client Agreed to Walk - in?',
      'Has the Client Agreed to Walk - in',
      'Agreed Walk-in',
      'agreed_walk_in',
    ]
    const endUseInvestmentKeys = [
      'End Use/ Investment',
      'End Use / Investment',
      'end_use_investment',
    ]
    const bhkInterestedInKeys = [
      'BHK Interested In',
      'BHK Interested',
      'bhk_interested_in',
      'bhk_interested',
    ]
    const followUpKeys = ['Follow UP', 'Follow Up', 'follow_up', 'follow_up_date']
    const assignedKeys = [
      'Assigned To',
      'Assigned',
      'Owner',
      'Agent',
      'SM Assigned',
      'assigned_to',
    ]

    // Process in chunks to avoid request limits
    const chunkSize = 500
    for (let offset = 0; offset < rows.length; offset += chunkSize) {
      const chunk = rows.slice(offset, offset + chunkSize)

      const payload = chunk
        .map((row, idx) => {
          const customerName = pickFirst(row, customerKeys)
          const phone = pickFirst(row, phoneKeys)
          const leadDateRaw = pickFirst(row, leadDateKeys)
          const excelNameRaw = pickFirst(row, excelNameKeys)
          const sourceRaw = pickFirst(row, sourceKeys)
          const locationRaw = pickFirst(row, locationKeys)
          const initialAssessmentRaw = pickFirst(row, initialAssessmentKeys)
          const remarksRaw = pickFirst(row, remarksKeys)
          const projectsInterestedRaw = pickFirst(row, projectsInterestedKeys)
          const ucRtmRaw = pickFirst(row, ucRtmKeys)
          const agreedWalkInRaw = pickFirst(row, agreedWalkInKeys)
          const endUseInvestmentRaw = pickFirst(row, endUseInvestmentKeys)
          const bhkInterestedInRaw = pickFirst(row, bhkInterestedInKeys)
          const followUpRaw = pickFirst(row, followUpKeys)
          const assignedRaw = pickFirst(row, assignedKeys)

          const customerNameClean = customerName
            ? String(customerName).trim()
            : ''
          if (!customerNameClean) {
            skipped += 1
            errors.push({
              row: offset + idx + 2, // +1 header row, +1 for 1-index
              error: 'Missing customer name',
            })
            return null
          }

          const phoneStr = phone != null ? String(phone).trim() : null
          const phoneNormalized = normalizePhone(phoneStr)

          let initialAssessmentStr =
            initialAssessmentRaw != null
              ? String(initialAssessmentRaw).trim().toLowerCase()
              : null
          if (initialAssessmentStr === 'hot') initialAssessmentStr = 'running'
          const remarksStr =
            remarksRaw != null ? String(remarksRaw).trim() : null
          const projectsInterestedStr =
            projectsInterestedRaw != null
              ? String(projectsInterestedRaw).trim()
              : null
          const ucRtmStr =
            ucRtmRaw != null ? String(ucRtmRaw).trim().toUpperCase() : null
          const agreedWalkInStr =
            agreedWalkInRaw != null
              ? String(agreedWalkInRaw).trim().toUpperCase()
              : null
          const endUseInvestmentStr =
            endUseInvestmentRaw != null
              ? String(endUseInvestmentRaw).trim()
              : null
          const bhkInterestedInStr =
            bhkInterestedInRaw != null ? String(bhkInterestedInRaw).trim() : null
          let bhkInterestedInNormalized = null
          if (bhkInterestedInStr) {
            const normalized = bhkInterestedInStr.toUpperCase().replace(/\s+/g, ' ')
            const m = normalized.match(/^([2-6])\s*BHK$/) || normalized.match(/^([2-6])$/)
            bhkInterestedInNormalized = m && m[1] ? `${m[1]} BHK` : bhkInterestedInStr
          }

          const leadDate = toIsoDateOrNull(leadDateRaw) || uploadedLeadDate

          let followUpDate = null
          if (followUpRaw != null && String(followUpRaw).trim() !== '') {
            const raw = String(followUpRaw).trim()
            // Prefer YYYY-MM-DD
            const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
            if (m) {
              followUpDate = `${m[1]}-${m[2]}-${m[3]}`
            } else {
              const t = Date.parse(raw)
              if (!Number.isNaN(t)) {
                const d = new Date(t)
                followUpDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
              }
            }
          }
          const assignedName =
            assignedRaw != null ? String(assignedRaw).trim() : null

          let assignedEmployeeId = null
          let assignedEmployeeName = null
          if (assignedName) {
            const key = assignedName.toLowerCase()
            const byId = employeeById.get(key)
            const byName = employeeByName.get(key)
            const emp = byId || byName
            if (emp?.employee_id) {
              assignedEmployeeId = String(emp.employee_id).trim()
              assignedEmployeeName = String(emp.name || '').trim() || null
            }
          }

          return {
            import_batch_id: batch.id,
            // If the CSV doesn't contain "Excel Name", use uploaded file name
            excel_name:
              excelNameRaw != null
                ? String(excelNameRaw).trim()
                : uploadedExcelName,
            // If the CSV doesn't contain "DATE", use upload date
            lead_date: leadDate,
            source: sourceRaw != null ? String(sourceRaw).trim() : null,
            location: locationRaw != null ? String(locationRaw).trim() : null,
            customer_name: customerNameClean,
            phone: phoneStr,
            phone_normalized: phoneNormalized,
            initial_assessment: initialAssessmentStr,
            projects_interested: projectsInterestedStr,
            uc_rtm: ucRtmStr,
            agreed_walk_in: agreedWalkInStr,
            end_use_investment: endUseInvestmentStr,
            bhk_interested_in: bhkInterestedInNormalized,
            follow_up_date: followUpDate,
            remarks: remarksStr,
            assigned_to_employee_id: assignedEmployeeId,
            assigned_to_name: assignedEmployeeName || assignedName,
          }
        })
        .filter(Boolean)

      if (!payload.length) continue

      const withPhone = payload.filter((p) => !!p.phone_normalized)
      const withoutPhone = payload.filter((p) => !p.phone_normalized)

      if (withPhone.length) {
        // Deduplicate within the same statement to avoid Postgres error:
        // "ON CONFLICT DO UPDATE command cannot affect row a second time"
        const byPhone = new Map()
        for (const row of withPhone) byPhone.set(row.phone_normalized, row)
        const uniqueWithPhone = Array.from(byPhone.values())

        let { data: upserted, error: upsertError } = await db
          .from('crm_leads')
          .upsert(uniqueWithPhone, {
            onConflict: 'phone_normalized',
            ignoreDuplicates: false,
          })
          .select('id, phone_normalized')

        // Backward-compatible retry if DB schema cache doesn't have newer columns yet
        const missingCol = unknownColumnFromSchemaCacheError(upsertError)
        if (missingCol) {
          const stripped = uniqueWithPhone.map((r) => {
            const copy = { ...r }
            delete copy[missingCol]
            return copy
          })
          ;({ data: upserted, error: upsertError } = await db
            .from('crm_leads')
            .upsert(stripped, {
              onConflict: 'phone_normalized',
              ignoreDuplicates: false,
            })
            .select('id, phone_normalized'))
        }

        if (upsertError) {
          return NextResponse.json(
            {
              error: 'Failed to import leads (upsert)',
              details: serializeSupabaseError(upsertError) || upsertError.message,
            },
            { status: 500 }
          )
        }

        inserted += upserted?.length || 0
      }

      if (withoutPhone.length) {
        let { data: insertedRows, error: insertError } = await db
          .from('crm_leads')
          .insert(withoutPhone)
          .select('id')

        const missingCol = unknownColumnFromSchemaCacheError(insertError)
        if (missingCol) {
          const stripped = withoutPhone.map((r) => {
            const copy = { ...r }
            delete copy[missingCol]
            return copy
          })
          ;({ data: insertedRows, error: insertError } = await db
            .from('crm_leads')
            .insert(stripped)
            .select('id'))
        }

        if (insertError) {
          return NextResponse.json(
            {
              error: 'Failed to import leads (insert)',
              details: serializeSupabaseError(insertError) || insertError.message,
            },
            { status: 500 }
          )
        }

        inserted += insertedRows?.length || 0
      }
    }

    return NextResponse.json({
      ok: true,
      batchId: batch.id,
      filename,
      totalRows: rows.length,
      imported: inserted,
      updated,
      skipped,
      errors: errors.slice(0, 50),
    })
  } catch (err) {
    console.error('CRM import error', err)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    )
  }
}

