'use client'

import { usePathname } from 'next/navigation'
import Footer from '@/components/layout/Footer'

export default function FooterRouter() {
  const pathname = usePathname()
  const hideFooter =
    typeof pathname === 'string' &&
    (pathname.startsWith('/crm') || pathname.startsWith('/admin'))

  if (hideFooter) return null
  return <Footer />
}
