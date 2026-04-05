'use client'

import { useMemo, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getDeveloperLogo, developerNameToSlug } from '@/lib/developerUtils'

/**
 * @param {string[]} [developers] - from DB (fallback when logoEntries empty)
 * @param {{ src: string, label: string, href: string, key: string }[]} [logoEntries] - from public/img/developers scan
 */
export default function DevelopersSlider({ developers = [], logoEntries }) {
  const developersRef = useRef(null)

  const stableDevelopers = useMemo(() => {
    if (!developers || developers.length === 0) return []
    const developersStr = JSON.stringify(developers.sort())
    if (developersRef.current === developersStr) {
      return developersRef.current ? JSON.parse(developersRef.current) : []
    }
    developersRef.current = developersStr
    return developers
  }, [developers])

  const entries = useMemo(() => {
    if (logoEntries && logoEntries.length > 0) {
      return logoEntries
    }
    return stableDevelopers
      .filter((dev) => getDeveloperLogo(dev))
      .map((developer) => ({
        src: getDeveloperLogo(developer),
        label: developer,
        href: `/developers/${developerNameToSlug(developer)}`,
        key: developer,
      }))
  }, [logoEntries, stableDevelopers])

  if (!entries || entries.length === 0) {
    return null
  }

  const renderCard = (item, keySuffix) => {
    const { src, label, href } = item
    return (
      <Link
        key={keySuffix}
        href={href}
        className="bg-white p-4 sm:p-8 rounded-lg shadow-sm hover:shadow-md transition flex-shrink-0 flex items-center justify-center h-[100px] sm:h-[140px] cursor-pointer border border-transparent hover:border-[#c99700]"
      >
        <div className="relative w-20 h-20 sm:w-32 sm:h-32">
          <Image
            src={src}
            alt={label}
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      </Link>
    )
  }

  return (
    <section className="bg-white py-8 sm:py-16 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
            Developers
          </h2>
          <p className="text-base sm:text-xl text-gray-600">
            Transforming Visions into Iconic Spaces
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden group">
            <div className="flex animate-scroll-right gap-6 group-hover:[animation-play-state:paused]">
              {entries.map((item) => renderCard(item, item.key))}
              {entries.map((item, index) => renderCard(item, `dup1-${item.key}-${index}`))}
              {entries.map((item, index) => renderCard(item, `dup2-${item.key}-${index}`))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
