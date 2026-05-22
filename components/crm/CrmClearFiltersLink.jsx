'use client'

import Link from 'next/link'
import { clearLeadsReturnStorage } from '@/lib/crm/leadsReturn'

export default function CrmClearFiltersLink({ className, children }) {
  return (
    <Link
      href="/crm"
      className={className}
      onClick={() => clearLeadsReturnStorage()}
    >
      {children}
    </Link>
  )
}
