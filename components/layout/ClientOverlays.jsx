'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

const InactivityTimer = dynamic(
  () => import('@/components/features/InactivityTimer'),
  { ssr: false }
)
const ContactPopup = dynamic(
  () => import('@/components/features/ContactPopup'),
  { ssr: false }
)

export default function ClientOverlays() {
  const pathname = usePathname()
  if (typeof pathname === 'string' && pathname.startsWith('/crm')) {
    return null
  }
  return (
    <>
      <InactivityTimer />
      <ContactPopup />
    </>
  )
}
