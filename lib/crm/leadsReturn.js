/** @param {string | null | undefined} value */
export function parseLeadsReturnTo(value) {
  if (typeof value !== 'string' || !value.trim()) return '/crm'
  const path = value.trim()
  if (!path.startsWith('/crm')) return '/crm'
  if (path.startsWith('/crm/login')) return '/crm'
  return path
}

const STORAGE_KEY = 'crm-leads-return'

/** @param {string} path */
export function saveLeadsReturnToStorage(path) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(STORAGE_KEY, parseLeadsReturnTo(path))
  } catch {
    // ignore quota / private mode
  }
}

export function getLeadsReturnFromStorage() {
  if (typeof window === 'undefined') return '/crm'
  try {
    return parseLeadsReturnTo(sessionStorage.getItem(STORAGE_KEY))
  } catch {
    return '/crm'
  }
}

export function clearLeadsReturnStorage() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
