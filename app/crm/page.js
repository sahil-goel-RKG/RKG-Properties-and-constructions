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
  const q =
    typeof (sp && sp.q) === 'string'
      ? sp.q.trim()
      : ''
  const status =
    typeof (sp && sp.status) === 'string'
      ? sp.status.trim()
      : ''
  const page = toPositiveInt(sp && sp.page, 1)
  const pageSize = 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const db = requireSupabaseAdmin()

  let query = db
    .from('crm_leads')
    .select(
      'id, source, customer_name, phone, initial_assessment, remarks, assigned_to_name, follow_up_date, created_at, updated_at',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status) query = query.eq('initial_assessment', status)
  if (q) {
    query = query.or(
      `customer_name.ilike.%${q}%,phone.ilike.%${q}%,source.ilike.%${q}%,remarks.ilike.%${q}%`
    )
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

        <form className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search name, phone, SM, remarks"
            className="w-full sm:w-80 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]"
          />
          <select
            name="status"
            defaultValue={status}
            className="w-full sm:w-56 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]"
          >
            <option value="">All statuses</option>
            {statusValues.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button className="px-4 py-2 bg-[#c99700] text-white rounded-lg text-sm font-semibold hover:bg-[#a67800]">
            Search
          </button>
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
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-3 py-3">Created</th>
                <th className="px-3 py-3">Source</th>
                <th className="px-3 py-3">Customer</th>
                <th className="px-3 py-3">Phone</th>
                <th className="px-3 py-3">Assigned</th>
                <th className="px-3 py-3">Initial</th>
                <th className="px-3 py-3">Follow up</th>
                <th className="px-3 py-3">Remarks</th>
                <th className="px-3 py-3">Actions</th>
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
        </div>
      )}
    </div>
  )
}

