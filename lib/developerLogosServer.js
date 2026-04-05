import fs from 'fs'
import path from 'path'
import { developerNameToSlug, getLogoPathToDeveloperName } from '@/lib/developerUtils'

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|svg)$/i

function humanizeFilenameBase(base) {
  return base
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * One entry per image in public/img/developers (server-only).
 * Links to /developers/[slug] when we can match a DB developer or known logo map.
 */
export function getDeveloperLogoDisplayEntries(dbDeveloperNames = []) {
  const dir = path.join(process.cwd(), 'public', 'img', 'developers')
  if (!fs.existsSync(dir)) {
    return []
  }

  const pathToName = getLogoPathToDeveloperName()
  const names = Array.isArray(dbDeveloperNames) ? dbDeveloperNames : []

  const files = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isFile() && IMAGE_EXT.test(d.name))
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b))

  return files.map((file) => {
    const src = `/img/developers/${file}`
    const base = path.basename(file, path.extname(file))
    const slugFromFile = base

    let developerName = pathToName[src]
    if (!developerName) {
      developerName = names.find((d) => developerNameToSlug(d) === slugFromFile)
    }

    const label = developerName || humanizeFilenameBase(base)
    const href = developerName
      ? `/developers/${developerNameToSlug(developerName)}`
      : '/apartments'

    return { src, label, href, key: file }
  })
}
