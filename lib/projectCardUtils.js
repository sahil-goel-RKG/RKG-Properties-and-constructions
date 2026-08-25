/** @typedef {{ label: string, className: string }} ProjectStatusInfo */

const STATUS_MAP = {
  'under-construction': {
    label: 'Under Construction',
    className: 'bg-yellow-900/80 text-yellow-200 border-yellow-700/60',
  },
  'ready-to-move': {
    label: 'Ready to Move',
    className: 'bg-green-900/80 text-green-200 border-green-700/60',
  },
  upcoming: {
    label: 'Upcoming',
    className: 'bg-blue-900/80 text-blue-200 border-blue-700/60',
  },
  completed: {
    label: 'Completed',
    className: 'bg-[#2a2a2a]/90 text-[#d4d4d4] border-[#404040]',
  },
}

/** @returns {ProjectStatusInfo | null} */
export function formatProjectStatus(status) {
  if (!status) return null
  const key = String(status).trim().toLowerCase()
  if (STATUS_MAP[key]) return STATUS_MAP[key]
  const label = String(status)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
  return {
    label,
    className: 'bg-[#2a2a2a]/90 text-[#d4d4d4] border-[#404040]',
  }
}

/** Compact BHK line for cards, e.g. "3 BHK · 4 BHK" */
export function formatBhkSummary(bhkConfig) {
  if (!bhkConfig) return null

  let items = []
  if (Array.isArray(bhkConfig)) {
    items = bhkConfig.flatMap((entry) => {
      if (typeof entry === 'string') {
        return entry.split(',').map((s) => s.trim())
      }
      if (entry && typeof entry === 'object' && entry.bhk) {
        return String(entry.bhk)
          .split(',')
          .map((s) => s.trim())
      }
      return []
    })
  } else if (typeof bhkConfig === 'string') {
    items = bhkConfig.split(',').map((s) => s.trim())
  }

  items = [...new Set(items.filter(Boolean))]
  if (!items.length) return null
  if (items.length <= 2) return items.join(' · ')
  return `${items.slice(0, 2).join(' · ')} +${items.length - 2}`
}

export function getProjectInitials(name) {
  if (!name) return 'RK'
  const words = String(name).trim().split(/\s+/).filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}
