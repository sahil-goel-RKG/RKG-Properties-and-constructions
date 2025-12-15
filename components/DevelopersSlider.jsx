'use client'

import { useMemo, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getDeveloperLogo, developerNameToSlug } from '@/lib/developerUtils'

export default function DevelopersSlider({ developers }) {
  const developersRef = useRef(null)

  // Memoize developers to prevent unnecessary re-renders
  const stableDevelopers = useMemo(() => {
    if (!developers || developers.length === 0) return []
    const developersStr = JSON.stringify(developers.sort())
    if (developersRef.current === developersStr) {
      return developersRef.current ? JSON.parse(developersRef.current) : []
    }
    developersRef.current = developersStr
    return developers
  }, [developers])

  // Filter developers that have logos
  const developersWithLogos = useMemo(() => {
    return stableDevelopers.filter(dev => getDeveloperLogo(dev))
  }, [stableDevelopers])

  if (!developersWithLogos || developersWithLogos.length === 0) {
    return null
  }

  return (
    <section className="bg-white py-16 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Developers
          </h2>
          <p className="text-xl text-gray-600">
            Transforming Visions into Iconic Spaces
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden group">
            <div className="flex animate-scroll-right gap-6 group-hover:[animation-play-state:paused]">
              {/* First set */}
              {developersWithLogos.map((developer) => {
                const logo = getDeveloperLogo(developer)
                const slug = developerNameToSlug(developer)
                return (
                  <Link
                    key={developer}
                    href={`/developers/${slug}`}
                    className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition flex-shrink-0 flex items-center justify-center h-[140px] cursor-pointer border border-transparent hover:border-[#c99700]"
                  >
                    {logo ? (
                      <div className="relative w-32 h-32">
                        <Image
                          src={logo}
                          alt={developer}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-700 font-medium text-center">{developer}</p>
                    )}
                  </Link>
                )
              })}
              {/* Duplicate for seamless loop */}
              {developersWithLogos.map((developer, index) => {
                const logo = getDeveloperLogo(developer)
                const slug = developerNameToSlug(developer)
                return (
                  <Link
                    key={`duplicate-${index}`}
                    href={`/developers/${slug}`}
                    className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition flex-shrink-0 flex items-center justify-center h-[140px] cursor-pointer border border-transparent hover:border-[#c99700]"
                  >
                    {logo ? (
                      <div className="relative w-32 h-32">
                        <Image
                          src={logo}
                          alt={developer}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-700 font-medium text-center">{developer}</p>
                    )}
                  </Link>
                )
              })}
              {/* Second duplicate for extra smoothness */}
              {developersWithLogos.map((developer, index) => {
                const logo = getDeveloperLogo(developer)
                const slug = developerNameToSlug(developer)
                return (
                  <Link
                    key={`duplicate2-${index}`}
                    href={`/developers/${slug}`}
                    className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition flex-shrink-0 flex items-center justify-center h-[140px] cursor-pointer border border-transparent hover:border-[#c99700]"
                  >
                    {logo ? (
                      <div className="relative w-32 h-32">
                        <Image
                          src={logo}
                          alt={developer}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-700 font-medium text-center">{developer}</p>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
