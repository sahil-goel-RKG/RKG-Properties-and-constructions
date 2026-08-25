'use client'

import { usePathname } from 'next/navigation'
import WhatsAppButton from '@/components/layout/WhatsAppButton'

export default function WhatsAppRouter() {
  const pathname = usePathname()
  const hideWhatsApp =
    typeof pathname === 'string' &&
    (pathname.startsWith('/crm') || pathname.startsWith('/admin'))

  if (hideWhatsApp) return null
  return <WhatsAppButton />
}
