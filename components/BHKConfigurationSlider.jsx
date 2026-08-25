'use client'

import { useRef, useState, useEffect } from 'react'

const scrollBtnClass =
  'absolute top-1/2 -translate-y-1/2 z-10 surface-elevated border border-[#2a2a2a] rounded-full p-2 hover:border-[#c9a227] transition'

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
              className="px-4 py-2 bg-[#c9a227] text-[#0a0a0a] rounded-lg font-semibold whitespace-nowrap flex-shrink-0"
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
          className={`left-0 ${scrollBtnClass}`}
          aria-label="Scroll left"
        >
          <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            className="min-w-[280px] max-w-[320px] card-luxury border border-[#2a2a2a] rounded-lg p-4 flex-shrink-0"
          >
            <h4 className="text-sm font-semibold text-[#f5f5f5] mb-3 pb-2 border-b border-[#2a2a2a]">
              Tower {tower.tower_number || index + 1}
            </h4>
            <div className="space-y-2">
              {tower.bhk && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#737373]">BHK:</span>
                  <span className="text-sm text-[#f5f5f5] font-semibold">{tower.bhk}</span>
                </div>
              )}
              {tower.area_sqft && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#737373]">Area:</span>
                  <span className="text-sm text-[#a3a3a3]">{tower.area_sqft} sqft</span>
                </div>
              )}
              {tower.flats_per_floor && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#737373]">Flats/Floor:</span>
                  <span className="text-sm text-[#a3a3a3]">{tower.flats_per_floor}</span>
                </div>
              )}
              {tower.floors_in_tower && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#737373]">Floors:</span>
                  <span className="text-sm text-[#a3a3a3]">{tower.floors_in_tower}</span>
                </div>
              )}
              {tower.lifts && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#737373]">Lifts:</span>
                  <span className="text-sm text-[#a3a3a3]">{tower.lifts}</span>
                </div>
              )}
              {tower.parking_per_floor && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#737373]">Parking/Floor:</span>
                  <span className="text-sm text-[#a3a3a3]">{tower.parking_per_floor}</span>
                </div>
              )}
              {tower.penthouse && (
                <div className="flex items-center justify-between pt-1 border-t border-[#2a2a2a]">
                  <span className="text-xs font-medium golden-text">Penthouse:</span>
                  <span className="text-sm golden-text font-semibold">Yes</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className={`right-0 ${scrollBtnClass}`}
          aria-label="Scroll right"
        >
          <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  )
}
