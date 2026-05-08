import Link from 'next/link'
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
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return s || null
  return `${m[3]}-${m[2]}-${m[1]}`
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
      'id, excel_name, source, location, customer_name, phone, initial_assessment, projects_interested, uc_rtm, end_use_investment, bhk_interested_in, remarks, assigned_to_employee_id, assigned_to_name, follow_up_date, created_at, updated_at',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to)

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
  if (sort === 'followup_desc') {
    query = query.order('follow_up_date', { ascending: false, nullsFirst: false })
  } else if (sort === 'followup_asc') {
    query = query.order('follow_up_date', { ascending: true, nullsFirst: false })
  }

  const { data: leads, error, count } = await query

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

  return (
    <div className="min-w-0">
      <div className="bg-gray-200 border border-gray-400 shadow-md rounded-xl p-4 sm:p-5 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Leads</h2>
            <p className="text-sm text-gray-700">
              Showing {pageSize} per page
              {total != null ? ` (total: ${total})` : ''}.
            </p>
          </div>

          <form className="flex flex-col sm:flex-row gap-2 sm:items-center" method="get" action="/crm">
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
            <select
              name="sort"
              defaultValue={sort}
              className="w-full sm:w-56 px-3 py-2 border border-gray-300 rounded-lg text-sm font-normal text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]"
            >
              <option value="">Sort: Created (latest)</option>
              <option value="followup_desc">Sort: Follow up (latest)</option>
              <option value="followup_asc">Sort: Follow up (earliest)</option>
            </select>

            <details className="relative w-full sm:w-auto flex-none">
              <summary className="list-none cursor-pointer select-none inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-900 hover:bg-gray-100 whitespace-nowrap w-full sm:w-auto">
                Filters
              </summary>
              <div className="absolute mt-2 right-0 w-[92vw] max-w-[560px] min-w-[320px] bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-20 max-h-[70vh] overflow-auto">
                <div className="grid grid-cols-1 gap-3">
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
            <Link
              href="/crm"
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-900 hover:bg-gray-100 text-center"
            >
              Clear
            </Link>
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
          <table className="w-full min-w-[1040px]">
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
                <th className="px-2 py-2">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300/80">
              {leads.map((lead) => (
                (() => {
                  const href = `/crm/leads/${lead.id}`
                  const linkBase =
                    'block w-full h-full px-2 py-2 text-left text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd86b] focus-visible:ring-inset'
                  const statusKey =
                    typeof lead.initial_assessment === 'string'
                      ? lead.initial_assessment.trim().toLowerCase()
                      : ''
                  const rowStyle =
                    statusKey === 'closed' ? { backgroundColor: '#fecaca' } : undefined
                  return (
                <tr
                  key={lead.id}
                  style={rowStyle}
                  className={[
                    statusKey === 'closed'
                      ? '!bg-red-200'
                      : statusKey === 'warm'
                        ? '!bg-yellow-200'
                        : statusKey === 'cold'
                          ? '!bg-blue-200'
                          : statusKey === 'running' || statusKey === 'hot'
                            ? '!bg-green-200'
                            : 'bg-white',
                    'cursor-pointer hover:brightness-95 transition-[filter] duration-150',
                  ].join(' ')}
                >
                  <td className="p-0 text-xs text-gray-900 whitespace-nowrap max-w-[160px]">
                    <Link href={href} className={`${linkBase} truncate`}>
                      {lead.location || '-'}
                    </Link>
                  </td>
                  <td className="p-0 text-xs font-semibold text-gray-900 whitespace-nowrap max-w-[210px]">
                    <Link href={href} className={`${linkBase} truncate`}>
                      {lead.customer_name}
                    </Link>
                  </td>
                  <td className="p-0 text-xs text-gray-700 whitespace-nowrap">
                    <Link href={href} className={linkBase}>
                      {lead.phone || '-'}
                    </Link>
                  </td>
                  <td className="p-0 text-xs text-gray-700 whitespace-nowrap max-w-[140px]">
                    <Link href={href} className={linkBase}>
                      {lead.assigned_to_employee_id
                        ? `${lead.assigned_to_employee_id}_${lead.assigned_to_name || ''}`.replace(
                            /_$/,
                            ''
                          )
                        : lead.assigned_to_name || '-'}
                    </Link>
                  </td>
                  <td className="p-0 text-xs text-gray-700 whitespace-nowrap">
                    <Link href={href} className={linkBase}>
                      {lead.uc_rtm || '-'}
                    </Link>
                  </td>
                  <td className="p-0 text-xs text-gray-700 whitespace-nowrap">
                    <Link href={href} className={linkBase}>
                      {statusKey === 'hot'
                        ? 'running'
                        : statusKey || '-'}
                    </Link>
                  </td>
                  <td className="p-0 text-xs text-gray-700 whitespace-nowrap max-w-[200px]">
                    <Link href={href} className={`${linkBase} truncate`}>
                      {lead.projects_interested || '-'}
                    </Link>
                  </td>
                  <td className="p-0 text-xs text-gray-700 whitespace-nowrap">
                    <Link href={href} className={linkBase}>
                      {lead.end_use_investment || '-'}
                    </Link>
                  </td>
                  <td className="p-0 text-xs text-gray-700 whitespace-nowrap">
                    <Link href={href} className={linkBase}>
                      {lead.bhk_interested_in || '-'}
                    </Link>
                  </td>
                  <td className="p-0 text-xs text-gray-700 whitespace-nowrap">
                    <Link href={href} className={linkBase}>
                      {formatIsoDateToDmy(lead.follow_up_date) || '-'}
                    </Link>
                  </td>
                  <td className="p-0 text-xs text-gray-700 max-w-[300px] min-w-[200px]">
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

