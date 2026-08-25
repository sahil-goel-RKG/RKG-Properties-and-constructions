const SECTION_MID_SOLID = '#0e0e0e'

const SECTION_MID_GRADIENT =
  'linear-gradient(to bottom, #0e0e0e 0%, #0e0e0e 88%, #181818 100%)'

const SECTION_LIGHT_GRADIENT =
  'linear-gradient(to bottom, #181818 0%, #181818 88%, #0e0e0e 100%)'

const SECTION_MID_FLAT_FADE =
  'linear-gradient(to bottom, #0e0e0e 0%, #0e0e0e 92%, #181818 100%)'

const SECTION_CLASS_MAP = {
  'section-dark': 'section-dark bg-[#050505]',
  'section-mid': 'section-mid',
  'section-mid-flat': 'section-mid-flat',
  'section-mid-flat-fade': 'section-mid-flat-fade',
  'section-light': 'section-light',
  'section-cta': 'section-cta',
  'section-muted': 'section-mid',
  'section-surface': 'section-light',
  'bg-gray-50': 'section-dark bg-[#050505]',
  'bg-gray-100': 'section-mid',
  'bg-white': 'section-light',
}

const SECTION_STYLE_MAP = {
  'section-dark': { backgroundColor: '#050505' },
  'section-mid': { background: SECTION_MID_GRADIENT },
  'section-mid-flat': { backgroundColor: SECTION_MID_SOLID },
  'section-mid-flat-fade': { background: SECTION_MID_FLAT_FADE },
  'section-light': { background: SECTION_LIGHT_GRADIENT },
  'section-muted': { background: SECTION_MID_GRADIENT },
  'section-surface': { background: SECTION_LIGHT_GRADIENT },
  'bg-gray-50': { backgroundColor: '#050505' },
  'bg-gray-100': { background: SECTION_MID_GRADIENT },
  'bg-white': { background: SECTION_LIGHT_GRADIENT },
}

/** Map section bg prop values to dark-theme band utility classes */
export function resolveSectionClass(bgColor) {
  return SECTION_CLASS_MAP[bgColor] || bgColor || SECTION_CLASS_MAP['section-mid']
}

/** Inline fallback so alternating band gradients always render */
export function resolveSectionStyle(bgColor) {
  if (bgColor === 'section-cta') return undefined
  return SECTION_STYLE_MAP[bgColor] || SECTION_STYLE_MAP['section-mid']
}
