/**
 * Convert developer name to URL-friendly slug
 */
export function developerNameToSlug(name) {
  if (!name) return ''
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Get developer logo path
 */
const LOGO_MAP = {
  DLF: '/img/developers/dlf.png',
  'Emaar India': '/img/developers/emaar.png',
  'Godrej Properties': '/img/developers/goderej-properties.png',
  'Whiteland Corporation': '/img/developers/whiteland.png',
  'MNB Buildfab Private Limited': '/img/developers/mnb.png',
  'Adani Realty': '/img/developers/adani.png',
  'Signature Global': '/img/developers/signature.png',
  'Central Park': '/img/developers/central-park.png',
  Elan: '/img/developers/elan.png',
  Sobha: '/img/developers/shobha.png',
  'Shapoorji Pallonji': '/img/developers/shapoorji-pallonji.png',
}

/** Path -> official developer name (for matching files on disk to DB names) */
export function getLogoPathToDeveloperName() {
  const rev = {}
  for (const [name, p] of Object.entries(LOGO_MAP)) {
    rev[p] = name
  }
  return rev
}

export function getDeveloperLogo(developerName) {
  return LOGO_MAP[developerName] || null
}

