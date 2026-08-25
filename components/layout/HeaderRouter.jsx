'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/layout/Header'
import CrmHeader from '@/components/layout/CrmHeader'
import AdminHeader from '@/components/layout/AdminHeader'

export default function HeaderRouter() {
  const pathname = usePathname()
  const isCrm = typeof pathname === 'string' && pathname.startsWith('/crm')
  const isCrmLogin = typeof pathname === 'string' && pathname.startsWith('/crm/login')
  const isAdmin = typeof pathname === 'string' && pathname.startsWith('/admin')
  const isAdminLogin = typeof pathname === 'string' && pathname.startsWith('/admin/login')

  if (isCrmLogin || isAdminLogin) return null
  if (isCrm) return <CrmHeader />
  if (isAdmin) return <AdminHeader />
  return <Header />
}
