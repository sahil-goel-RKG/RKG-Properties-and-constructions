import Link from 'next/link'
import { Suspense } from 'react'
import CrmClearFiltersLink from '@/components/crm/CrmClearFiltersLink'
import CrmLeadsListPersist from '@/components/crm/CrmLeadsListPersist'
import { supabaseAdmin } from '@/lib/supabase/server'
import { auth, currentUser } from '@clerk/nextjs/server'

function requireSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not configured. CRM requires server-side Supabase admin access.'
    )
  }
  return supabaseAdmin
}

export const revalidate = 0

function isWhitelistedAdminEmail(email) {
  const list = String(process.env.CRM_ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  if (!list.length) return false
  return list.includes(String(email || '').trim().toLowerCase())
}

function toPositiveInt(value, fallback) {
  const n = Number.parseInt(String(value ?? ''), 10)
  if (!Number.isFinite(n) || n <= 0) return fallback
  return n
}

function buildCrmQueryString({
  q,
  status,
  name,
  phone,
  source,
  location,
  excelName,
  assigned,
  followUpFrom,
  followUpTo,
  sort,
  page,
}) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (status) params.set('status', status)
  if (name) params.set('name', name)
  if (phone) params.set('phone', phone)
  if (source) params.set('source', source)
  if (location) params.set('location', location)
  if (excelName) params.set('excelName', excelName)
  if (assigned) params.set('assigned', assigned)
  if (followUpFrom) params.set('followUpFrom', followUpFrom)
  if (followUpTo) params.set('followUpTo', followUpTo)
  if (sort) params.set('sort', sort)
  if (page && page > 1) params.set('page', String(page))
  const s = params.toString()
  return s ? `?${s}` : ''
}

function buildPageItems(currentPage, totalPages) {
  if (!Number.isFinite(totalPages) || totalPages <= 0) return []
  const current = Math.min(Math.max(1, currentPage), totalPages)

  // Always show: 1, last, current, and neighbors around current.
  const visible = new Set([1, totalPages])
  for (let p = current - 1; p <= current + 1; p++) {
    if (p >= 1 && p <= totalPages) visible.add(p)
  }

  const pages = Array.from(visible).sort((a, b) => a - b)

  /** @type {(number | '…')[]} */
  const items = []
  let prev = null
  for (const p of pages) {
    if (prev != null && p - prev > 1) items.push('…')
    items.push(p)
    prev = p
  }
  return items
}

function formatIsoDateToDmy(value) {
  if (typeof value !== 'string') return null
  const s = value.trim()
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return s || null
  return `${m[3]}-${m[2]}-${m[1]}`
}

function toIsoDateOnly(value) {
  if (value == null) return ''
  const s = String(value).trim()
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? `${m[1]}-${m[2]}-${m[3]}` : ''
}

function toTimeSortKey(value) {
  if (value == null) return ''
  const s = String(value).trim()
  const m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/)
  if (!m) return ''
  return `${String(m[1]).padStart(2, '0')}:${m[2]}:${m[3] ? m[3] : '00'}`
}

/** Format HH:MM[:SS] as 12-hour with AM/PM (e.g. 3:30 PM). */
function formatTimeAmPm(value) {
  if (value == null) return ''
  const s = String(value).trim()
  const m = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/)
  if (!m) return s || ''
  let hh = Number(m[1])
  const mm = m[2]
  if (!Number.isFinite(hh) || hh < 0 || hh > 23) return s
  const ap = hh >= 12 ? 'PM' : 'AM'
  hh = hh % 12
  if (hh === 0) hh = 12
  return `${hh}:${mm} ${ap}`
}

/** Calendar date in Asia/Kolkata as YYYY-MM-DD. */
function indiaTodayIso() {
  // en-CA yields YYYY-MM-DD reliably
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function isFollowUpDateToday(value) {
  const d = toIsoDateOnly(value)
  if (!d) return false
  if (d === indiaTodayIso()) return true
  // Fallbacks if timezone helpers differ in runtime
  const utc = new Date().toISOString().slice(0, 10)
  if (d === utc) return true
  const local = new Date()
  const localIso = `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, '0')}-${String(local.getDate()).padStart(2, '0')}`
  return d === localIso
}

function indiaTomorrowIso() {
  const today = indiaTodayIso()
  const [y, m, d] = today.split('-').map((n) => Number(n))
  const dt = new Date(Date.UTC(y, m - 1, d + 1))
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`
}

function isFollowUpDateTomorrow(value) {
  const d = toIsoDateOnly(value)
  if (!d) return false
  return d === indiaTomorrowIso()
}

/** Darker shade of the status row color for today's / tomorrow's follow-up 3D highlight. */
function urgencyRowColors(statusKey, kind) {
  // kind: 'today' | 'tomorrow' — tomorrow is a bit softer / less deep
  const todayMap = {
    closed: { backgroundColor: '#f87171', shadow: '#b91c1c' },
    warm: { backgroundColor: '#facc15', shadow: '#a16207' },
    cold: { backgroundColor: '#60a5fa', shadow: '#1d4ed8' },
    running: { backgroundColor: '#4ade80', shadow: '#15803d' },
    hot: { backgroundColor: '#4ade80', shadow: '#15803d' },
    default: { backgroundColor: '#e5e7eb', shadow: '#6b7280' },
  }
  const tomorrowMap = {
    closed: { backgroundColor: '#fca5a5', shadow: '#dc2626' },
    warm: { backgroundColor: '#fde047', shadow: '#ca8a04' },
    cold: { backgroundColor: '#93c5fd', shadow: '#2563eb' },
    running: { backgroundColor: '#86efac', shadow: '#16a34a' },
    hot: { backgroundColor: '#86efac', shadow: '#16a34a' },
    default: { backgroundColor: '#f3f4f6', shadow: '#9ca3af' },
  }
  const map = kind === 'today' ? todayMap : tomorrowMap
  return map[statusKey] || map.default
}

function urgencyTdStyle(statusKey, kind) {
  const colors = urgencyRowColors(statusKey, kind)
  const lift = kind === 'today' ? -3 : -2
  const depth = kind === 'today' ? 5 : 3
  const blur = kind === 'today' ? 14 : 10
  return {
    backgroundColor: colors.backgroundColor,
    color: '#111827',
    boxShadow: `inset 0 2px 0 rgba(255,255,255,0.45), inset 0 -2px 0 rgba(0,0,0,0.12), 0 ${depth}px 0 ${colors.shadow}, 0 ${depth + 4}px ${blur}px rgba(0,0,0,0.2)`,
    transform: `translateY(${lift}px)`,
    borderTop: '1px solid rgba(255,255,255,0.5)',
    borderBottom: `2px solid ${colors.shadow}`,
    position: 'relative',
    zIndex: kind === 'today' ? 3 : 2,
    fontWeight: kind === 'today' ? 700 : 400,
  }
}

/**
 * Sort: today → tomorrow → later upcoming → overdue → no follow-up.
 * Within upcoming: date ASC, time ASC.
 * Within overdue: most recent overdue first (date DESC, time DESC).
 */
function sortLeadsClosestFollowUp(leads, todayIso) {
  const bucket = (lead) => {
    const d = toIsoDateOnly(lead?.follow_up_date)
    if (!d) return 2
    if (d < todayIso) return 1 // overdue
    return 0 // today + future
  }

  return [...(leads || [])].sort((a, b) => {
    const ba = bucket(a)
    const bb = bucket(b)
    if (ba !== bb) return ba - bb

    const da = toIsoDateOnly(a.follow_up_date)
    const db = toIsoDateOnly(b.follow_up_date)
    const ta = toTimeSortKey(a.follow_up_time)
    const tb = toTimeSortKey(b.follow_up_time)

    if (ba === 0) {
      if (da !== db) return da < db ? -1 : 1
      if (ta !== tb) {
        if (!ta) return 1
        if (!tb) return -1
        return ta < tb ? -1 : 1
      }
    } else if (ba === 1) {
      if (da !== db) return da > db ? -1 : 1
      if (ta !== tb) {
        if (!ta) return 1
        if (!tb) return -1
        return ta > tb ? -1 : 1
      }
    }

    const ca = a.created_at || ''
    const cb = b.created_at || ''
    if (ca !== cb) return ca > cb ? -1 : 1
    return 0
  })
}

export default async function CrmLeadsPage({ searchParams }) {
  const { userId, sessionClaims } = await auth()
  let isAdmin =
    sessionClaims?.publicMetadata?.role === 'admin' ||
    sessionClaims?.metadata?.role === 'admin' ||
    sessionClaims?.public_metadata?.role === 'admin'

  // Most reliable in App Router: read role from the current user object.
  if (userId) {
    try {
      const user = await currentUser()
      if (user) {
        const role = user?.publicMetadata?.role
        const primaryEmail = user?.primaryEmailAddress?.emailAddress
        isAdmin = role === 'admin' || isWhitelistedAdminEmail(primaryEmail)
      }
    } catch {
      // fall back to claims
    }
  }
  const restrictedEmployeeId = 'E001'

  const sp = await Promise.resolve(searchParams)
  const q = typeof (sp && sp.q) === 'string' ? sp.q.trim() : ''
  const status = typeof (sp && sp.status) === 'string' ? sp.status.trim() : ''
  const name = typeof (sp && sp.name) === 'string' ? sp.name.trim() : ''
  const phone = typeof (sp && sp.phone) === 'string' ? sp.phone.trim() : ''
  const source = typeof (sp && sp.source) === 'string' ? sp.source.trim() : ''
  const location =
    typeof (sp && sp.location) === 'string' ? sp.location.trim() : ''
  const excelName =
    typeof (sp && sp.excelName) === 'string' ? sp.excelName.trim() : ''
  const assigned = typeof (sp && sp.assigned) === 'string' ? sp.assigned.trim() : ''
  const followUpFrom =
    typeof (sp && sp.followUpFrom) === 'string' ? sp.followUpFrom.trim() : ''
  const followUpTo =
    typeof (sp && sp.followUpTo) === 'string' ? sp.followUpTo.trim() : ''
  const sort = typeof (sp && sp.sort) === 'string' ? sp.sort.trim() : ''
  const page = toPositiveInt(sp && sp.page, 1)
  const pageSize = 30
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const db = requireSupabaseAdmin()

  let query = db
    .from('crm_leads')
    .select(
      'id, excel_name, source, location, customer_name, phone, initial_assessment, projects_interested, uc_rtm, end_use_investment, bhk_interested_in, remarks, assigned_to_employee_id, assigned_to_name, follow_up_date, follow_up_time, created_at, updated_at',
      { count: 'exact' }
    )

  // Visibility rule:
  // - Unassigned leads: visible to everyone
  // - Assigned to E001: admin only
  // - Assigned to others: visible to everyone
  if (!isAdmin) {
    // Be defensive: existing rows might have "E001", "E001 ", "e001", or other variants.
    query = query.or(
      `assigned_to_employee_id.is.null,assigned_to_employee_id.not.ilike.${restrictedEmployeeId}%`
    )
  }

  // Filtering
  if (status === 'running') {
    // backward-compat: treat existing "hot" records as "running"
    query = query.in('initial_assessment', ['running', 'hot'])
  } else if (status) {
    query = query.eq('initial_assessment', status)
  }
  if (name) query = query.ilike('customer_name', `%${name}%`)
  if (phone) query = query.ilike('phone', `%${phone}%`)
  if (source) query = query.ilike('source', `%${source}%`)
  if (location) query = query.ilike('location', `%${location}%`)
  if (excelName) query = query.ilike('excel_name', `%${excelName}%`)
  if (assigned) {
    // Allow filtering by either employee id or employee name
    query = query.or(
      `assigned_to_employee_id.ilike.%${assigned}%,assigned_to_name.ilike.%${assigned}%`
    )
  }
  if (followUpFrom) query = query.gte('follow_up_date', followUpFrom)
  if (followUpTo) query = query.lte('follow_up_date', followUpTo)

  if (q) {
    query = query.or(
      `customer_name.ilike.%${q}%,phone.ilike.%${q}%,source.ilike.%${q}%,location.ilike.%${q}%,excel_name.ilike.%${q}%,remarks.ilike.%${q}%`
    )
  }

  // Sorting
  // Default ("closest"): today → tomorrow → later → overdue → no date (in-memory for correct order)
  const useClosestFollowUpSort = !sort
  if (sort === 'followup_desc') {
    query = query
      .order('follow_up_date', { ascending: false, nullsFirst: false })
      .order('follow_up_time', { ascending: false, nullsFirst: false })
  } else if (sort === 'created_desc') {
    query = query.order('created_at', { ascending: false })
  } else if (sort === 'updated_desc') {
    query = query.order('updated_at', { ascending: false, nullsFirst: false })
  } else if (!useClosestFollowUpSort) {
    query = query
      .order('follow_up_date', { ascending: true, nullsFirst: false })
      .order('follow_up_time', { ascending: true, nullsFirst: false })
  } else {
    // Stable secondary order before in-memory re-sort
    query = query.order('created_at', { ascending: false })
  }

  let leads
  let error
  let count

  if (useClosestFollowUpSort) {
    // Fetch filtered set (cap for safety; enough for this CRM size)
    const result = await query.limit(10000)
    error = result.error
    count = result.count
    const sorted = sortLeadsClosestFollowUp(result.data || [], indiaTodayIso())
    leads = sorted.slice(from, to + 1)
  } else {
    query = query.range(from, to)
    const result = await query
    leads = result.data
    error = result.error
    count = result.count
  }

  if (error) {
    return (
      <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
        Failed to load leads. {error.message}
      </div>
    )
  }

  const statusValues = ['warm', 'running', 'cold', 'closed']

  const total = typeof count === 'number' ? count : null
  const totalPages = total != null ? Math.max(1, Math.ceil(total / pageSize)) : null
  const hasPrev = page > 1
  const hasNext = totalPages != null ? page < totalPages : (leads?.length || 0) === pageSize
  const pageHref = (p) =>
    `/crm${buildCrmQueryString({
      q,
      status,
      name,
      phone,
      source,
      location,
      excelName,
      assigned,
      followUpFrom,
      followUpTo,
      sort,
      page: p,
    })}`
  const prevHref = pageHref(page - 1)
  const nextHref = pageHref(page + 1)
  const lastHref = totalPages != null ? pageHref(totalPages) : null
  const pageItems = totalPages != null ? buildPageItems(page, totalPages) : []

  const leadsListReturn = `/crm${buildCrmQueryString({
    q,
    status,
    name,
    phone,
    source,
    location,
    excelName,
    assigned,
    followUpFrom,
    followUpTo,
    sort,
    page,
  })}`
  const returnToQuery = encodeURIComponent(leadsListReturn)

  return (
    <div className="min-w-0 overflow-visible">
      <Suspense fallback={null}>
        <CrmLeadsListPersist />
      </Suspense>
      <div className="relative z-30 crm-toolbar rounded-xl p-4 sm:p-5 mb-4 overflow-visible">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 overflow-visible">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Leads</h2>
            <p className="text-sm text-gray-700">
              Showing {pageSize} per page
              {total != null ? ` (total: ${total})` : ''}.
            </p>
          </div>

          <form className="relative z-40 flex flex-col sm:flex-row gap-2 sm:items-center overflow-visible" method="get" action="/crm">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search name, phone, SM, remarks"
              className="w-full sm:w-80 px-3 py-2 border border-gray-300 rounded-lg text-sm font-normal text-gray-700 placeholder:text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]"
            />
            <select
              name="status"
              defaultValue={status}
              className="w-full sm:w-56 px-3 py-2 border border-gray-300 rounded-lg text-sm font-normal text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]"
            >
              <option value="">All statuses</option>
              {statusValues.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <details className="relative z-50 w-full sm:w-auto flex-none overflow-visible">
              <summary className="list-none cursor-pointer select-none inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-900 hover:bg-gray-100 whitespace-nowrap w-full sm:w-auto">
                Filters & sort
              </summary>
              <div className="absolute mt-2 right-0 w-[92vw] max-w-[560px] min-w-[320px] bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-[100] max-h-[min(70vh,32rem)] overflow-auto">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <div className="text-[11px] font-semibold text-gray-500 mb-1 whitespace-nowrap">
                      Sort / recently updated
                    </div>
                    <select
                      name="sort"
                      defaultValue={sort}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-normal text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]"
                    >
                      <option value="">Follow up (today → upcoming → overdue)</option>
                      <option value="followup_desc">Follow up (latest first)</option>
                      <option value="updated_desc">Recently updated (latest first)</option>
                      <option value="created_desc">Created (latest first)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      name="location"
                      defaultValue={location}
                      placeholder="Location"
                      className="w-full min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-sm font-normal text-gray-700 placeholder:text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]"
                    />
                    <input
                      type="text"
                      name="excelName"
                      defaultValue={excelName}
                      placeholder="Excel name"
                      className="w-full min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-sm font-normal text-gray-700 placeholder:text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]"
                    />
                    <input
                      type="text"
                      name="phone"
                      defaultValue={phone}
                      placeholder="Phone"
                      className="w-full min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-sm font-normal text-gray-700 placeholder:text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]"
                    />
                    <input
                      type="text"
                      name="assigned"
                      defaultValue={assigned}
                      placeholder="Assigned"
                      className="w-full min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-sm font-normal text-gray-700 placeholder:text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <div className="text-[11px] font-semibold text-gray-500 mb-1 whitespace-nowrap">
                        Follow up (from)
                      </div>
                      <input
                        type="date"
                        name="followUpFrom"
                        defaultValue={followUpFrom}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-normal text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]"
                      />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-gray-500 mb-1 whitespace-nowrap">
                        Follow up (to)
                      </div>
                      <input
                        type="date"
                        name="followUpTo"
                        defaultValue={followUpTo}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-normal text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Link href="/crm" className="text-sm font-semibold text-gray-700 hover:underline">
                      Reset
                    </Link>
                    <button className="px-4 py-2 bg-[#c99700] text-white rounded-lg text-sm font-semibold hover:bg-[#a67800]">
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </details>

            <button className="px-4 py-2 bg-[#c99700] text-white rounded-lg text-sm font-semibold hover:bg-[#a67800]">
              Search
            </button>
            <CrmClearFiltersLink className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-900 hover:bg-gray-100 text-center">
              Clear
            </CrmClearFiltersLink>
          </form>
        </div>
      </div>

      {!leads?.length ? (
        <div className="text-sm text-gray-600">
          No leads found.
          {isAdmin ? (
            <>
              {' '}
              Import from{' '}
              <Link href="/crm/import" className="font-semibold text-[#a67800] hover:underline">
                Import CSV
              </Link>
              .
            </>
          ) : null}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px]">
            <thead className="bg-gray-200">
              <tr className="text-left text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                <th className="px-2 py-2">Location</th>
                <th className="px-2 py-2">Customer</th>
                <th className="px-2 py-2">Phone</th>
                <th className="px-2 py-2">Assigned</th>
                <th className="px-2 py-2 whitespace-nowrap">UC/RTM</th>
                <th className="px-2 py-2">Initial</th>
                <th className="px-2 py-2 whitespace-nowrap">Projects</th>
                <th className="px-2 py-2 whitespace-nowrap">End Use</th>
                <th className="px-2 py-2 whitespace-nowrap">BHK</th>
                <th className="px-2 py-2 whitespace-nowrap">Follow up</th>
                <th className="px-2 py-2 whitespace-nowrap">Follow up time</th>
                <th className="px-2 py-2">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300/80">
              {leads.map((lead) => (
                (() => {
                  const href = `/crm/leads/${lead.id}?returnTo=${returnToQuery}`
                  const linkBase =
                    'block w-full h-full px-2 py-2 text-left text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd86b] focus-visible:ring-inset'
                  const statusKey =
                    typeof lead.initial_assessment === 'string'
                      ? lead.initial_assessment.trim().toLowerCase()
                      : ''
                  const isToday = isFollowUpDateToday(lead.follow_up_date)
                  const isTomorrow = !isToday && isFollowUpDateTomorrow(lead.follow_up_date)
                  const urgencyKind = isToday ? 'today' : isTomorrow ? 'tomorrow' : null
                  const urgencyStyle = urgencyKind
                    ? urgencyTdStyle(statusKey, urgencyKind)
                    : undefined
                  const rowStyle =
                    !urgencyKind && statusKey === 'closed'
                      ? { backgroundColor: '#fecaca' }
                      : undefined
                  const textWeightClass = isToday
                    ? 'font-bold'
                    : isTomorrow
                      ? 'font-normal'
                      : ''
                  return (
                <tr
                  key={lead.id}
                  style={rowStyle}
                  className={[
                    urgencyKind ? `crm-leads-row--urgency crm-leads-row--urgency-${urgencyKind}` : '',
                    !urgencyKind
                      ? statusKey === 'closed'
                        ? '!bg-red-200'
                        : statusKey === 'warm'
                          ? '!bg-yellow-200'
                          : statusKey === 'cold'
                            ? '!bg-blue-200'
                            : statusKey === 'running' || statusKey === 'hot'
                              ? '!bg-green-200'
                              : 'bg-white'
                      : '',
                    'cursor-pointer hover:brightness-95 transition-[filter] duration-150',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <td
                    className={`p-0 text-xs text-gray-900 whitespace-nowrap max-w-[160px] ${textWeightClass}`}
                    style={urgencyStyle}
                  >
                    <Link href={href} className={`${linkBase} truncate`}>
                      {lead.location || '-'}
                    </Link>
                  </td>
                  <td
                    className={`p-0 text-xs text-gray-900 whitespace-nowrap max-w-[210px] ${isToday ? 'font-bold' : isTomorrow ? 'font-normal' : 'font-semibold'}`}
                    style={urgencyStyle}
                  >
                    <Link href={href} className={`${linkBase} truncate`}>
                      {lead.customer_name}
                    </Link>
                  </td>
                  <td
                    className={`p-0 text-xs text-gray-700 whitespace-nowrap ${textWeightClass}`}
                    style={urgencyStyle}
                  >
                    <Link href={href} className={linkBase}>
                      {lead.phone || '-'}
                    </Link>
                  </td>
                  <td
                    className={`p-0 text-xs text-gray-700 whitespace-nowrap max-w-[140px] ${textWeightClass}`}
                    style={urgencyStyle}
                  >
                    <Link href={href} className={linkBase}>
                      {lead.assigned_to_employee_id
                        ? `${lead.assigned_to_employee_id}_${lead.assigned_to_name || ''}`.replace(
                            /_$/,
                            ''
                          )
                        : lead.assigned_to_name || '-'}
                    </Link>
                  </td>
                  <td
                    className={`p-0 text-xs text-gray-700 whitespace-nowrap ${textWeightClass}`}
                    style={urgencyStyle}
                  >
                    <Link href={href} className={linkBase}>
                      {lead.uc_rtm || '-'}
                    </Link>
                  </td>
                  <td
                    className={`p-0 text-xs text-gray-700 whitespace-nowrap ${textWeightClass}`}
                    style={urgencyStyle}
                  >
                    <Link href={href} className={linkBase}>
                      {statusKey === 'hot'
                        ? 'running'
                        : statusKey || '-'}
                    </Link>
                  </td>
                  <td
                    className={`p-0 text-xs text-gray-700 whitespace-nowrap max-w-[200px] ${textWeightClass}`}
                    style={urgencyStyle}
                  >
                    <Link href={href} className={`${linkBase} truncate`}>
                      {lead.projects_interested || '-'}
                    </Link>
                  </td>
                  <td
                    className={`p-0 text-xs text-gray-700 whitespace-nowrap ${textWeightClass}`}
                    style={urgencyStyle}
                  >
                    <Link href={href} className={linkBase}>
                      {lead.end_use_investment || '-'}
                    </Link>
                  </td>
                  <td
                    className={`p-0 text-xs text-gray-700 whitespace-nowrap ${textWeightClass}`}
                    style={urgencyStyle}
                  >
                    <Link href={href} className={linkBase}>
                      {lead.bhk_interested_in || '-'}
                    </Link>
                  </td>
                  <td
                    className={`p-0 text-xs text-gray-700 whitespace-nowrap ${textWeightClass}`}
                    style={urgencyStyle}
                  >
                    <Link href={href} className={linkBase}>
                      {formatIsoDateToDmy(lead.follow_up_date) || '-'}
                    </Link>
                  </td>
                  <td
                    className={`p-0 text-xs text-gray-700 whitespace-nowrap ${textWeightClass}`}
                    style={urgencyStyle}
                  >
                    <Link href={href} className={linkBase}>
                      {formatTimeAmPm(lead.follow_up_time) || '-'}
                    </Link>
                  </td>
                  <td
                    className={`p-0 text-xs text-gray-700 max-w-[300px] min-w-[200px] ${textWeightClass}`}
                    style={urgencyStyle}
                  >
                    <Link href={href} className={`${linkBase} line-clamp-2`}>
                      {lead.remarks || '-'}
                    </Link>
                  </td>
                </tr>
                  )
                })()
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages != null && totalPages > 1 ? (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
          <div className="text-sm text-gray-700">
            <span className="font-semibold">Page:</span> {page} / {totalPages}
          </div>

          <nav className="flex items-center gap-2 flex-wrap">
            {hasPrev ? (
              <Link
                href={prevHref}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                Prev
              </Link>
            ) : (
              <span className="px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-400 cursor-not-allowed">
                Prev
              </span>
            )}

            {pageItems.map((item, idx) =>
              item === '…' ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-2 text-sm font-semibold text-gray-500"
                >
                  …
                </span>
              ) : item === page ? (
                <span
                  key={item}
                  className="px-3 py-2 rounded-lg border border-[#ffd86b] bg-[#fff7db] text-sm font-extrabold text-gray-900"
                  aria-current="page"
                >
                  {item}
                </span>
              ) : (
                <Link
                  key={item}
                  href={pageHref(item)}
                  className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-900 hover:bg-gray-50"
                >
                  {item}
                </Link>
              )
            )}

            {lastHref && totalPages !== page && !pageItems.includes(totalPages) ? (
              <Link
                href={lastHref}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                {totalPages}
              </Link>
            ) : null}

            {hasNext ? (
              <Link
                href={nextHref}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                Next
              </Link>
            ) : (
              <span className="px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-400 cursor-not-allowed">
                Next
              </span>
            )}
          </nav>
        </div>
      ) : null}
    </div>
  )
}

