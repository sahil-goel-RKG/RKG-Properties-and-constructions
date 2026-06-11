'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const InactivityTimer = dynamic(
  () => import('@/components/features/InactivityTimer'),
  { ssr: false }
)
const ContactPopup = dynamic(
  () => import('@/components/features/ContactPopup'),
  { ssr: false }
)

export default function ClientOverlays() {
  // Avoid hydration mismatch: server render can't reliably know pathname.
  // Render nothing until after the component mounts on the client.
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null
  const hideContactPopup =
    typeof pathname === 'string' &&
    (pathname.startsWith('/crm') || pathname.startsWith('/admin'))
  return (
    <>
      <InactivityTimer />
      {hideContactPopup ? null : <ContactPopup />}
    </>
  )
}
