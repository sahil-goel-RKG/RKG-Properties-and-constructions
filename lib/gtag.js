/**
 * Google Ads conversion: fire only after backend returns success.
 * Flow: User submits form → Backend returns success → conversion event → Google Ads receives hit.
 */
const CONVERSION_ID = 'AW-17915227011'
const CONVERSION_LABEL = 'kW0TClJey7_MbEIPX0t5C'
const SEND_TO = `${CONVERSION_ID}/${CONVERSION_LABEL}`

/**
 * Fire Google Ads "Submit lead form" conversion. Call once per successful form submit.
 * Pushes to dataLayer in gtag format so gtag.js (or GTM) sends the hit to Google Ads.
 * Using dataLayer ensures the conversion is sent even if gtag script loads after our code.
 */
export function fireGoogleAdsLeadConversion() {
  if (typeof window === 'undefined') return

  window.dataLayer = window.dataLayer || []
  // Same format gtag('event', 'conversion', { send_to }) uses internally
  window.dataLayer.push(['event', 'conversion', { send_to: SEND_TO }])
}
