'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { saveLeadsReturnToStorage } from '@/lib/crm/leadsReturn'

/** Remember current /crm filters + page for return after editing a lead. */
export default function CrmLeadsListPersist() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname !== '/crm') return
    const qs = searchParams.toString()
    saveLeadsReturnToStorage(qs ? `/crm?${qs}` : '/crm')
  }, [pathname, searchParams])

  return null
}
