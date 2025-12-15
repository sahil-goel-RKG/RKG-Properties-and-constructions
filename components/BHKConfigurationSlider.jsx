'use client'

import { useRef, useState, useEffect } from 'react'

export default function BHKConfigurationSlider({ towerConfig, legacyConfig }) {
  const scrollContainerRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScrollability()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollability)
      window.addEventListener('resize', checkScrollability)
      return () => {
        container.removeEventListener('scroll', checkScrollability)
        window.removeEventListener('resize', checkScrollability)
      }
    }
  }, [towerConfig, legacyConfig])

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  if (legacyConfig && legacyConfig.length > 0) {
    return (
      <div className="relative">
      <div 
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto hide-scrollbar pb-2"
      >
          {legacyConfig.map((bhk, index) => (
            <span
              key={index}
              className="px-4 py-2 bg-[#f70000] text-white rounded-lg font-semibold whitespace-nowrap flex-shrink-0"
            >
              {bhk}
            </span>
          ))}
        </div>
      </div>
    )
  }

  if (!towerConfig || towerConfig.length === 0) {
    return null
  }

  const towersWithBHK = towerConfig.filter(t => t.bhk)

  if (towersWithBHK.length === 0) {
    return null
  }

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition"
          aria-label="Scroll left"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      
      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto hide-scrollbar pb-2"
      >
        {towersWithBHK.map((tower, index) => (
          <div
            key={index}
            className="min-w-[280px] max-w-[320px] border border-gray-200 rounded-lg p-4 bg-gray-50 flex-shrink-0"
          >
            <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              Tower {tower.tower_number || index + 1}
            </h4>
            <div className="space-y-2">
              {tower.bhk && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">BHK:</span>
                  <span className="text-sm text-gray-900 font-semibold">{tower.bhk}</span>
                </div>
              )}
              {tower.area_sqft && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Area:</span>
                  <span className="text-sm text-gray-900">{tower.area_sqft} sqft</span>
                </div>
              )}
              {tower.flats_per_floor && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Flats/Floor:</span>
                  <span className="text-sm text-gray-900">{tower.flats_per_floor}</span>
                </div>
              )}
              {tower.floors_in_tower && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Floors:</span>
                  <span className="text-sm text-gray-900">{tower.floors_in_tower}</span>
                </div>
              )}
              {tower.lifts && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Lifts:</span>
                  <span className="text-sm text-gray-900">{tower.lifts}</span>
                </div>
              )}
              {tower.parking_per_floor && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Parking/Floor:</span>
                  <span className="text-sm text-gray-900">{tower.parking_per_floor}</span>
                </div>
              )}
              {tower.penthouse && (
                <div className="flex items-center justify-between pt-1 border-t border-gray-200">
                  <span className="text-xs font-medium text-[#c99700]">Penthouse:</span>
                  <span className="text-sm text-[#c99700] font-semibold">Yes</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition"
          aria-label="Scroll right"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

    </div>
  )
}

