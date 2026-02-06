/**
 * Google Ads conversion: fire only after backend returns success.
 * Flow: User submits form → Backend returns success → gtag('event','conversion') → Google Ads receives hit.
 */
const CONVERSION_ID = 'AW-17915227011'
const CONVERSION_LABEL = 'kW0TClJey7_MbEIPX0t5C'

/**
 * Fire Google Ads "Submit lead form" conversion. Call once per successful form submit.
 * Ensures gtag exists before firing (gtag is loaded site-wide in layout).
 */
export function fireGoogleAdsLeadConversion() {
  if (typeof window === 'undefined') return
  if (typeof window.gtag !== 'function') return
  window.gtag('event', 'conversion', {
    send_to: `${CONVERSION_ID}/${CONVERSION_LABEL}`,
  })
}
