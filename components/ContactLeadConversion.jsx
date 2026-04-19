'use client'

import { useEffect } from 'react'
import { fireGoogleAdsLeadConversion } from '@/lib/gtag'

/** Fires Google Ads lead conversion after native form POST redirect (?thankyou=1). */
export default function ContactLeadConversion() {
  useEffect(() => {
    fireGoogleAdsLeadConversion()
  }, [])
  return null
}
