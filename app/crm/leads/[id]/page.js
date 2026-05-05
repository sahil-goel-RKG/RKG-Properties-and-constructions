import Link from 'next/link'
import CrmLeadEditor from './ui'
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

export default async function CrmLeadDetailPage({ params }) {
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
      'id, excel_name, source, location, customer_name, phone, initial_assessment, projects_interested, uc_rtm, agreed_walk_in, end_use_investment, follow_up_date, remarks, assigned_to_name, created_at, updated_at'
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

  return <CrmLeadEditor lead={lead} />
}

