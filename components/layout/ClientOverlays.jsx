'use client'

import dynamic from 'next/dynamic'

const InactivityTimer = dynamic(
  () => import('@/components/features/InactivityTimer'),
  { ssr: false }
)
const ContactPopup = dynamic(
  () => import('@/components/features/ContactPopup'),
  { ssr: false }
)

export default function ClientOverlays() {
  return (
    <>
      <InactivityTimer />
      <ContactPopup />
    </>
  )
}
