export function normalizePhone(input) {
  if (input == null) return null
  const raw = String(input).trim()
  if (!raw) return null

  const digits = raw.replace(/\D/g, '')
  if (!digits) return null

  // Common patterns:
  // - 10 digit: local mobile
  // - 12 digit starting with 91: country code + mobile
  // - longer: keep last 10 digits as best-effort
  if (digits.length === 10) return digits
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  if (digits.length > 10) return digits.slice(-10)
  return digits
}

