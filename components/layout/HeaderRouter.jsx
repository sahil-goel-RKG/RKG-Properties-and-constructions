'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/layout/Header'
import CrmHeader from '@/components/layout/CrmHeader'

export default function HeaderRouter() {
  const pathname = usePathname()
  const isCrm = typeof pathname === 'string' && pathname.startsWith('/crm')
  return isCrm ? <CrmHeader /> : <Header />
}

