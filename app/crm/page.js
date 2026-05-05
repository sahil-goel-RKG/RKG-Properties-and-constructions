import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/server'

function requireSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not configured. CRM requires server-side Supabase admin access.'
    )
  }
  return supabaseAdmin
}

export const revalidate = 0

function toPositiveInt(value, fallback) {
  const n = Number.parseInt(String(value ?? ''), 10)
  if (!Number.isFinite(n) || n <= 0) return fallback
  return n
}

function buildCrmQueryString({ q, status, page }) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (status) params.set('status', status)
  if (page && page > 1) params.set('page', String(page))
  const s = params.toString()
  return s ? `?${s}` : ''
}

export default async function CrmLeadsPage({ searchParams }) {
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
  const pageSize = 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const db = requireSupabaseAdmin()

  let query = db
    .from('crm_leads')
    .select(
      'id, excel_name, source, location, customer_name, phone, initial_assessment, remarks, assigned_to_name, follow_up_date, created_at, updated_at',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to)

  // Filtering
  if (status) query = query.eq('initial_assessment', status)
  if (name) query = query.ilike('customer_name', `%${name}%`)
  if (phone) query = query.ilike('phone', `%${phone}%`)
  if (source) query = query.ilike('source', `%${source}%`)
  if (location) query = query.ilike('location', `%${location}%`)
  if (excelName) query = query.ilike('excel_name', `%${excelName}%`)
  if (assigned) query = query.ilike('assigned_to_name', `%${assigned}%`)
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

  const statusValues = [
    'warm',
    'hot',
    'cold',
  ]

  const total = typeof count === 'number' ? count : null
  const totalPages = total != null ? Math.max(1, Math.ceil(total / pageSize)) : null
  const hasPrev = page > 1
  const hasNext = totalPages != null ? page < totalPages : (leads?.length || 0) === pageSize
  const prevHref = `/crm${buildCrmQueryString({ q, status, page: page - 1 })}`
  const nextHref = `/crm${buildCrmQueryString({ q, status, page: page + 1 })}`

  return (
    <div className="min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Leads</h2>
          <p className="text-sm text-gray-600">
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
            className="w-full sm:w-80 px-3 py-2 border border-gray-300 rounded-lg text-sm font-normal text-gray-600 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]"
          />
          <select
            name="status"
            defaultValue={status}
            className="w-full sm:w-56 px-3 py-2 border border-gray-300 rounded-lg text-sm font-normal text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]"
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
            className="w-full sm:w-56 px-3 py-2 border border-gray-300 rounded-lg text-sm font-normal text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]"
          >
            <option value="">Sort: Created (latest)</option>
            <option value="followup_desc">Sort: Follow up (latest)</option>
            <option value="followup_asc">Sort: Follow up (earliest)</option>
          </select>
          <button className="px-4 py-2 bg-[#c99700] text-white rounded-lg text-sm font-semibold hover:bg-[#a67800]">
            Search
          </button>
          <Link
            href="/crm"
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 hover:bg-gray-50 text-center"
          >
            Clear
          </Link>
        </form>
      </div>

      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="text-sm text-gray-700">
          <span className="font-semibold">Page:</span> {page}
          {totalPages != null ? ` / ${totalPages}` : ''}
        </div>
        <div className="flex items-center gap-2">
          {hasPrev ? (
            <Link
              href={prevHref}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              ← Previous
            </Link>
          ) : (
            <span className="px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-400 cursor-not-allowed">
              ← Previous
            </span>
          )}
          {hasNext ? (
            <Link
              href={nextHref}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              Next →
            </Link>
          ) : (
            <span className="px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-400 cursor-not-allowed">
              Next →
            </span>
          )}
        </div>
      </div>

      {!leads?.length ? (
        <div className="text-sm text-gray-600">
          No leads found. Import from{' '}
          <Link href="/crm/import" className="font-semibold text-[#a67800] hover:underline">
            Import CSV
          </Link>
          .
        </div>
      ) : (
        <div className="overflow-x-auto">
          <form method="get" action="/crm">
            <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-3 py-3">Created</th>
                <th className="px-3 py-3">Source</th>
                <th className="px-3 py-3">Location</th>
                <th className="px-3 py-3">Excel Name</th>
                <th className="px-3 py-3">Customer</th>
                <th className="px-3 py-3">Phone</th>
                <th className="px-3 py-3">Assigned</th>
                <th className="px-3 py-3">Initial</th>
                <th className="px-3 py-3">Follow up</th>
                <th className="px-3 py-3">Remarks</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
              <tr className="text-left text-xs text-gray-700">
                <th className="px-3 pb-3">
                  <span className="sr-only">Created</span>
                </th>
                <th className="px-3 pb-3">
                  <input
                    name="source"
                    defaultValue={source}
                    placeholder="Filter"
                    className="crm-filter w-full px-2 py-1 border border-gray-200 rounded bg-white text-xs placeholder:text-gray-400"
                    style={{ color: '#4b5563', fontWeight: 400, WebkitTextFillColor: '#4b5563' }}
                  />
                </th>
                <th className="px-3 pb-3">
                  <input
                    name="location"
                    defaultValue={location}
                    placeholder="Filter"
                    className="crm-filter w-full px-2 py-1 border border-gray-200 rounded bg-white text-xs placeholder:text-gray-400"
                    style={{ color: '#4b5563', fontWeight: 400, WebkitTextFillColor: '#4b5563' }}
                  />
                </th>
                <th className="px-3 pb-3">
                  <input
                    name="excelName"
                    defaultValue={excelName}
                    placeholder="Filter"
                    className="crm-filter w-full px-2 py-1 border border-gray-200 rounded bg-white text-xs placeholder:text-gray-400"
                    style={{ color: '#4b5563', fontWeight: 400, WebkitTextFillColor: '#4b5563' }}
                  />
                </th>
                <th className="px-3 pb-3">
                  <input
                    name="name"
                    defaultValue={name}
                    placeholder="Search name"
                    className="crm-filter w-full px-2 py-1 border border-gray-200 rounded bg-white text-xs placeholder:text-gray-400"
                    style={{ color: '#4b5563', fontWeight: 400, WebkitTextFillColor: '#4b5563' }}
                  />
                </th>
                <th className="px-3 pb-3">
                  <input
                    name="phone"
                    defaultValue={phone}
                    placeholder="Filter"
                    className="crm-filter w-full px-2 py-1 border border-gray-200 rounded bg-white text-xs placeholder:text-gray-400"
                    style={{ color: '#4b5563', fontWeight: 400, WebkitTextFillColor: '#4b5563' }}
                  />
                </th>
                <th className="px-3 pb-3">
                  <input
                    name="assigned"
                    defaultValue={assigned}
                    placeholder="Filter"
                    className="crm-filter w-full px-2 py-1 border border-gray-200 rounded bg-white text-xs placeholder:text-gray-400"
                    style={{ color: '#4b5563', fontWeight: 400, WebkitTextFillColor: '#4b5563' }}
                  />
                </th>
                <th className="px-3 pb-3">
                  <select
                    name="status"
                    defaultValue={status}
                    className="crm-filter w-full px-2 py-1 border border-gray-200 rounded bg-white text-xs"
                    style={{ color: '#4b5563', fontWeight: 400, WebkitTextFillColor: '#4b5563' }}
                  >
                    <option value="">All</option>
                    {statusValues.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </th>
                <th className="px-3 pb-3">
                  <div className="grid grid-rows-2 gap-2 min-w-[240px]">
                    <input
                      type="date"
                      name="followUpFrom"
                      defaultValue={followUpFrom}
                      className="crm-filter w-full min-w-[118px] px-2 py-1.5 border border-gray-200 rounded bg-white text-xs"
                      title="From"
                      style={{ color: '#4b5563', fontWeight: 400, WebkitTextFillColor: '#4b5563' }}
                    />
                    <input
                      type="date"
                      name="followUpTo"
                      defaultValue={followUpTo}
                      className="crm-filter w-full min-w-[118px] px-2 py-1.5 border border-gray-200 rounded bg-white text-xs"
                      title="To"
                      style={{ color: '#4b5563', fontWeight: 400, WebkitTextFillColor: '#4b5563' }}
                    />
                  </div>
                </th>
                <th className="px-3 pb-3">
                  <span className="sr-only">Remarks</span>
                </th>
                <th className="px-3 pb-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-2 py-1 rounded bg-[#c99700] text-white text-xs font-semibold hover:bg-[#a67800]"
                      title="Apply filters"
                    >
                      Apply
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {new Date(lead.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {lead.source || '-'}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap max-w-[180px]">
                    <span className="block truncate">{lead.location || '-'}</span>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap max-w-[220px]">
                    <span className="block truncate">{lead.excel_name || '-'}</span>
                  </td>
                  <td className="px-3 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap max-w-[260px]">
                    <span className="block truncate">{lead.customer_name}</span>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {lead.phone || '-'}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {lead.assigned_to_name || '-'}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {lead.initial_assessment || '-'}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {lead.follow_up_date || '-'}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-700 max-w-[380px] min-w-[240px]">
                    <span className="line-clamp-2">{lead.remarks || '-'}</span>
                  </td>
                  <td className="px-3 py-3 text-sm whitespace-nowrap">
                    <Link
                      href={`/crm/leads/${lead.id}`}
                      className="text-[#a67800] font-semibold hover:underline"
                    >
                      View / Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </form>
        </div>
      )}
    </div>
  )
}

