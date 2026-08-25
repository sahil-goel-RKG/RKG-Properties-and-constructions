'use client'

import { useMemo, useRef } from 'react'
import Link from 'next/link'
import { resolveSectionClass, resolveSectionStyle } from '@/lib/resolveSectionClass'

export default function LocationsSlider({ locations, bgColor = 'section-light' }) {
  const locationsRef = useRef(null)

  const stableLocations = useMemo(() => {
    if (!locations || locations.length === 0) return []
    const locationsStr = JSON.stringify([...locations].sort())
    if (locationsRef.current === locationsStr) {
      return locationsRef.current ? JSON.parse(locationsRef.current) : []
    }
    locationsRef.current = locationsStr
    return locations
  }, [locations])

  if (!stableLocations || stableLocations.length === 0) {
    return null
  }

  const renderLocation = (location, keySuffix) => (
    <Link
      key={keySuffix}
      href={`/apartments?location=${encodeURIComponent(location)}`}
      className="btn-pill-gold group flex-shrink-0 whitespace-nowrap text-sm sm:text-base sm:px-6 sm:py-3"
    >
      <span className="relative font-semibold transition-colors duration-200 group-hover:text-[#0a0a0a]">
        {location}
      </span>
    </Link>
  )

  return (
    <section
      className={`${resolveSectionClass(bgColor)} py-8 sm:py-16 overflow-hidden`}
      style={resolveSectionStyle(bgColor)}
    >
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold font-serif-display text-[#f5f5f5] mb-4 sm:mb-8 text-center">
          Locations
        </h2>

        <div className="relative">
          <div className="overflow-hidden group">
            <div className="flex animate-scroll-right gap-4 sm:gap-6 group-hover:[animation-play-state:paused]">
              {stableLocations.map((location) => renderLocation(location, location))}
              {stableLocations.map((location, index) =>
                renderLocation(location, `dup1-${location}-${index}`)
              )}
              {stableLocations.map((location, index) =>
                renderLocation(location, `dup2-${location}-${index}`)
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
