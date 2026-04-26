import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'

export const metadata = {
  title: 'CRM | RKG Properties and Constructions',
  robots: { index: false, follow: false },
}

export default function CrmLayout({ children }) {
  return (
    <div className="crm-scope min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
              Internal
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">CRM</h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/crm"
              className="text-sm font-semibold text-gray-700 hover:text-gray-900 hover:underline"
            >
              ← Back to leads
            </Link>
            <UserButton appearance={{ elements: { avatarBox: 'h-9 w-9' } }} />
          </div>
        </div>

        <nav className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/crm"
            className="px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-gray-200 hover:bg-gray-50 text-gray-900"
          >
            Leads
          </Link>
          <Link
            href="/crm/import"
            className="px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-gray-200 hover:bg-gray-50 text-gray-900"
          >
            Import CSV
          </Link>
        </nav>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

