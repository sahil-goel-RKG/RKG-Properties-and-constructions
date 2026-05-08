import Link from 'next/link'
import CrmLeadEditor from './ui'
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

export default async function CrmLeadDetailPage({ params }) {
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

  const p = await Promise.resolve(params)
  const id = p && typeof p.id === 'string' ? p.id : null
  if (!id) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          Missing lead id.
        </div>
        <Link href="/crm" className="text-sm font-semibold text-[#a67800] hover:underline">
          ← Back to leads
        </Link>
      </div>
    )
  }
  const db = requireSupabaseAdmin()

  const { data: lead, error } = await db
    .from('crm_leads')
    .select(
      'id, excel_name, source, location, customer_name, phone, initial_assessment, projects_interested, uc_rtm, agreed_walk_in, end_use_investment, bhk_interested_in, follow_up_date, remarks, assigned_to_employee_id, assigned_to_name, created_at, updated_at'
    )
    .eq('id', id)
    .single()

  if (error || !lead) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          Lead not found.
        </div>
        <Link href="/crm" className="text-sm font-semibold text-[#a67800] hover:underline">
          ← Back to leads
        </Link>
      </div>
    )
  }

  const assignedKey =
    typeof lead.assigned_to_employee_id === 'string'
      ? lead.assigned_to_employee_id.trim().toUpperCase()
      : ''
  if (!isAdmin && assignedKey.startsWith(restrictedEmployeeId)) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          Lead not found.
        </div>
        <Link href="/crm" className="text-sm font-semibold text-[#a67800] hover:underline">
          ← Back to leads
        </Link>
      </div>
    )
  }

  return <CrmLeadEditor lead={lead} isAdmin={isAdmin} />
}

