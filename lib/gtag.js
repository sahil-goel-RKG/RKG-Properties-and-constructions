/**
 * Google Ads conversion: fire only after backend returns success.
 * Flow: User submits form → Backend returns success → gtag('event','conversion') → Google Ads receives hit.
 */
const CONVERSION_ID = 'AW-17915227011'
const CONVERSION_LABEL = 'kW0TClJey7_MbEIPX0t5C'
const SEND_TO = `${CONVERSION_ID}/${CONVERSION_LABEL}`

function sendConversion() {
  if (typeof window === 'undefined') return false
  if (typeof window.gtag !== 'function') return false
  try {
    window.gtag('event', 'conversion', { send_to: SEND_TO })
    return true
  } catch (e) {
    return false
  }
}

/**
 * Fire Google Ads "Submit lead form" conversion. Call once per successful form submit.
 * Uses gtag() directly (Google's required method). Retries a few times if gtag isn't ready yet.
 * Ensures only one conversion is sent per call.
 */
export function fireGoogleAdsLeadConversion() {
  if (typeof window === 'undefined') return

  let sent = false
  const trySend = () => {
    if (sent) return
    if (sendConversion()) sent = true
  }

  trySend()
  if (sent) return

  // gtag may still be loading; retry at 100ms, 300ms, 600ms (stop once sent)
  ;[100, 300, 600].forEach((delay) => {
    setTimeout(() => {
      trySend()
    }, delay)
  })
}
