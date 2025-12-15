'use client'

import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function LocationsSlider({ locations }) {
  const scrollContainerRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const locationsRef = useRef(null)

  // Memoize locations to prevent unnecessary re-renders
  const stableLocations = useMemo(() => {
    if (!locations || locations.length === 0) return []
    const locationsStr = JSON.stringify(locations.sort())
    if (locationsRef.current === locationsStr) {
      return locationsRef.current ? JSON.parse(locationsRef.current) : []
    }
    locationsRef.current = locationsStr
    return locations
  }, [locations])

  const checkScrollButtons = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }, [])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      // Check initially and on resize
      checkScrollButtons()
      const handleResize = () => {
        setTimeout(checkScrollButtons, 100)
      }
      
      window.addEventListener('resize', handleResize)
      container.addEventListener('scroll', checkScrollButtons)
      
      return () => {
        window.removeEventListener('resize', handleResize)
        container.removeEventListener('scroll', checkScrollButtons)
      }
    }
  }, [checkScrollButtons])

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  if (!stableLocations || stableLocations.length === 0) {
    return null
  }

  return (
    <section className="bg-gray-100 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Locations
        </h2>
        <div className="relative">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md transition bg-white absolute left-0 top-1/2 -translate-y-1/2 z-10"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700 hover:text-[rgb(0,37,122)]" />
            </button>
          )}

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md transition bg-white absolute right-0 top-1/2 -translate-y-1/2 z-10"
            >
              <ChevronRight className="w-6 h-6 text-gray-700 hover:text-[rgb(0,37,122)]" />
            </button>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pl-2 pr-12 scroll-smooth hide-scrollbar"
            onScroll={checkScrollButtons}
          >
            {stableLocations.map((location) => (
              <Link
                key={location}
                href={`/apartments?location=${encodeURIComponent(location)}`}
                className="group px-6 py-3 rounded-full text-center transition-all duration-200 cursor-pointer border-2 border-[rgb(0,37,122)] hover:border-[rgb(0,50,150)] flex-shrink-0 whitespace-nowrap shadow-md hover:shadow-[0_10px_25px_rgba(0,37,122,0.4)] bg-transparent hover:bg-[rgb(0,37,122)]"
              >
                <p className="font-semibold text-[rgb(0,37,122)] transition-all duration-200 group-hover:text-white">
                  {location}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
