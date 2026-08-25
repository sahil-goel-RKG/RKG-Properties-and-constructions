'use client'

import { useRef, useState, useEffect } from 'react'

export default function BuildingConfigurationSlider({ buildingConfig, status }) {
  const scrollContainerRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [selectedBuilding, setSelectedBuilding] = useState(null)

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
  }, [buildingConfig])

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && selectedBuilding) {
        setSelectedBuilding(null)
      }
    }
    if (selectedBuilding) {
      window.addEventListener('keydown', handleEscape)
    }
    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [selectedBuilding])

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  if (!buildingConfig || !Array.isArray(buildingConfig) || buildingConfig.length === 0) {
    return null
  }

  const pretty = (str) =>
    !str ? null : str.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  const handleCardClick = (building, index, e) => {
    // Don't open modal if clicking on brochure button or link
    if (e.target.closest('a')) {
      return
    }
    setSelectedBuilding({ ...building, index })
  }

  const closeModal = () => {
    setSelectedBuilding(null)
  }

  // Determine background color based on status
  const getCardBgColor = () => {
    if (status === 'ready-to-move') {
      return 'bg-green-900/20 border-green-800/40'
    } else if (status === 'under-construction') {
      return 'bg-[#c9a227]/10 border-[#c9a227]/30'
    }
    return 'surface-muted border-[#2a2a2a]'
  }

  const getBadgeBgColor = () => {
    if (status === 'ready-to-move') {
      return 'bg-green-900/40 text-green-300'
    } else if (status === 'under-construction') {
      return 'bg-[#c9a227]/20 text-[#c9a227]'
    }
    return 'bg-[#2a2a2a] text-[#a3a3a3]'
  }

  const getBrochureButtonBgColor = () => {
    return 'btn-outline-gold w-full text-xs py-2'
  }

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 surface-elevated border border-[#2a2a2a] rounded-full p-2 hover:border-[#c9a227] transition"
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
        {buildingConfig.map((building, index) => {

          return (
          <div
            key={index}
            onClick={(e) => handleCardClick(building, index, e)}
            className={`min-w-[320px] max-w-[380px] border rounded-lg p-4 ${getCardBgColor()} flex-shrink-0 cursor-pointer hover:border-[#c9a227] transition-shadow`}
          >
            <h4 className="text-sm font-semibold text-[#f5f5f5] mb-3 pb-2 border-b border-[#2a2a2a]">
              Building {building.building_number || index + 1}
            </h4>
            <div className="space-y-2">
              {building.plot_size && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#737373]">Plot Size:</span>
                  <span className="text-sm text-[#a3a3a3]">
                    {building.plot_size.toLowerCase().includes('sqyd') 
                      ? building.plot_size 
                      : `${building.plot_size} sqyd`}
                  </span>
                </div>
              )}
              {building.facing && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#737373]">Facing:</span>
                  <span className="text-sm text-[#a3a3a3]">{building.facing}</span>
                </div>
              )}
              {building.floors_count && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#737373]">Floors:</span>
                  <span className="text-sm text-[#a3a3a3]">{building.floors_count}</span>
                </div>
              )}
              {building.roof_rights && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#737373]">Roof Rights:</span>
                  <span className="text-sm text-[#a3a3a3]">{building.roof_rights}</span>
                </div>
              )}
              {building.condition && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#737373]">Condition:</span>
                  <span className="text-sm text-[#a3a3a3]">{pretty(building.condition)}</span>
                </div>
              )}
              {building.status && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#737373]">Status:</span>
                  <span className="text-sm text-[#a3a3a3]">{pretty(building.status)}</span>
                </div>
              )}
              {building.category && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#737373]">Category:</span>
                  <span className="text-sm text-[#a3a3a3]">{pretty(building.category)}</span>
                </div>
              )}
              {building.possession_date && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#737373]">Possession:</span>
                  <span className="text-sm text-[#a3a3a3]">{building.possession_date}</span>
                </div>
              )}
              {building.owner_name && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#737373]">Owner:</span>
                  <span className="text-sm text-[#a3a3a3]">{building.owner_name}</span>
                </div>
              )}
              {building.price_top && (
                <div className="flex items-center justify-between pt-1 border-t border-[#2a2a2a]">
                  <span className="text-xs font-medium text-[#737373]">Top Floor:</span>
                  <span className="text-sm text-[#a3a3a3] font-semibold">
                    ₹{Number(building.price_top).toLocaleString('en-IN')} Cr
                  </span>
                </div>
              )}
              {building.price_mid1 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#737373]">Mid Floor 1:</span>
                  <span className="text-sm text-[#a3a3a3]">
                    ₹{Number(building.price_mid1).toLocaleString('en-IN')} Cr
                  </span>
                </div>
              )}
              {building.price_mid2 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#737373]">Mid Floor 2:</span>
                  <span className="text-sm text-[#a3a3a3]">
                    ₹{Number(building.price_mid2).toLocaleString('en-IN')} Cr
                  </span>
                </div>
              )}
              {building.price_ug && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#737373]">UG Floor:</span>
                  <span className="text-sm text-[#a3a3a3]">
                    ₹{Number(building.price_ug).toLocaleString('en-IN')} Cr
                  </span>
                </div>
              )}
              {(building.has_basement || building.is_triplex || building.is_gated) && (
                <div className="pt-1 border-t border-[#2a2a2a]">
                  <div className="flex flex-wrap gap-2">
                    {building.has_basement && (
                      <span className={`text-xs px-2 py-1 ${getBadgeBgColor()} rounded`}>
                        Basement
                      </span>
                    )}
                    {building.is_triplex && (
                      <span className={`text-xs px-2 py-1 ${getBadgeBgColor()} rounded`}>
                        Triplex
                      </span>
                    )}
                    {building.is_gated && (
                      <span className={`text-xs px-2 py-1 ${getBadgeBgColor()} rounded`}>
                        Gated
                      </span>
                    )}
                  </div>
                </div>
              )}
              {building.comments && (
                <div className="pt-1 border-t border-[#2a2a2a]">
                  <span className="text-xs font-medium text-[#737373]">Notes:</span>
                  <p className="text-xs text-[#a3a3a3] mt-1 whitespace-pre-line line-clamp-3">{building.comments}</p>
                </div>
              )}
              {building.brochure_url && (
                <div className="pt-2 border-t border-[#2a2a2a]">
                  <a
                    href={building.brochure_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2 ${getBrochureButtonBgColor()}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    View Brochure
                  </a>
                </div>
              )}
            </div>
          </div>
          )
        })}
      </div>

      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 surface-elevated border border-[#2a2a2a] rounded-full p-2 hover:border-[#c9a227] transition"
          aria-label="Scroll right"
        >
          <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Modal for building details */}
      {selectedBuilding && (
        <div 
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="card-luxury rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#2a2a2a]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 section-surface border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold font-serif-display text-[#f5f5f5]">
                Building {selectedBuilding.building_number || selectedBuilding.index + 1} - Full Details
              </h3>
              <button
                onClick={closeModal}
                className="text-[#737373] hover:text-[#f5f5f5] transition"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {selectedBuilding.plot_size && (
                <div className="flex items-center justify-between py-2 border-b border-[#2a2a2a]">
                  <span className="text-sm font-semibold text-[#a3a3a3]">Plot Size:</span>
                  <span className="text-base text-[#f5f5f5]">
                    {selectedBuilding.plot_size.toLowerCase().includes('sqyd') 
                      ? selectedBuilding.plot_size 
                      : `${selectedBuilding.plot_size} sqyd`}
                  </span>
                </div>
              )}
              {selectedBuilding.facing && (
                <div className="flex items-center justify-between py-2 border-b border-[#2a2a2a]">
                  <span className="text-sm font-semibold text-[#a3a3a3]">Facing:</span>
                  <span className="text-base text-[#f5f5f5]">{selectedBuilding.facing}</span>
                </div>
              )}
              {selectedBuilding.floors_count && (
                <div className="flex items-center justify-between py-2 border-b border-[#2a2a2a]">
                  <span className="text-sm font-semibold text-[#a3a3a3]">Floors:</span>
                  <span className="text-base text-[#f5f5f5]">{selectedBuilding.floors_count}</span>
                </div>
              )}
              {selectedBuilding.roof_rights && (
                <div className="flex items-center justify-between py-2 border-b border-[#2a2a2a]">
                  <span className="text-sm font-semibold text-[#a3a3a3]">Roof Rights:</span>
                  <span className="text-base text-[#f5f5f5]">{selectedBuilding.roof_rights}</span>
                </div>
              )}
              {selectedBuilding.condition && (
                <div className="flex items-center justify-between py-2 border-b border-[#2a2a2a]">
                  <span className="text-sm font-semibold text-[#a3a3a3]">Condition:</span>
                  <span className="text-base text-[#f5f5f5]">{pretty(selectedBuilding.condition)}</span>
                </div>
              )}
              {selectedBuilding.status && (
                <div className="flex items-center justify-between py-2 border-b border-[#2a2a2a]">
                  <span className="text-sm font-semibold text-[#a3a3a3]">Status:</span>
                  <span className="text-base text-[#f5f5f5]">{pretty(selectedBuilding.status)}</span>
                </div>
              )}
              {selectedBuilding.category && (
                <div className="flex items-center justify-between py-2 border-b border-[#2a2a2a]">
                  <span className="text-sm font-semibold text-[#a3a3a3]">Category:</span>
                  <span className="text-base text-[#f5f5f5]">{pretty(selectedBuilding.category)}</span>
                </div>
              )}
              {selectedBuilding.possession_date && (
                <div className="flex items-center justify-between py-2 border-b border-[#2a2a2a]">
                  <span className="text-sm font-semibold text-[#a3a3a3]">Possession:</span>
                  <span className="text-base text-[#f5f5f5]">{selectedBuilding.possession_date}</span>
                </div>
              )}
              {selectedBuilding.owner_name && (
                <div className="flex items-center justify-between py-2 border-b border-[#2a2a2a]">
                  <span className="text-sm font-semibold text-[#a3a3a3]">Owner:</span>
                  <span className="text-base text-[#f5f5f5]">{selectedBuilding.owner_name}</span>
                </div>
              )}
              
              {(selectedBuilding.price_top || selectedBuilding.price_mid1 || selectedBuilding.price_mid2 || selectedBuilding.price_ug) && (
                <div className="py-3 border-t-2 border-[#2a2a2a]">
                  <h4 className="text-base font-bold font-serif-display text-[#f5f5f5] mb-3">Pricing</h4>
                  <div className="space-y-2">
                    {selectedBuilding.price_top && (
                      <div className="flex items-center justify-between py-2 card-luxury rounded px-3">
                        <span className="text-sm font-medium text-[#737373]">Top Floor:</span>
                        <span className="text-base text-[#f5f5f5] font-semibold">
                          ₹{Number(selectedBuilding.price_top).toLocaleString('en-IN')} Cr
                        </span>
                      </div>
                    )}
                    {selectedBuilding.price_mid1 && (
                      <div className="flex items-center justify-between py-2 card-luxury rounded px-3">
                        <span className="text-sm font-medium text-[#737373]">Mid Floor 1:</span>
                        <span className="text-base text-[#f5f5f5] font-semibold">
                          ₹{Number(selectedBuilding.price_mid1).toLocaleString('en-IN')} Cr
                        </span>
                      </div>
                    )}
                    {selectedBuilding.price_mid2 && (
                      <div className="flex items-center justify-between py-2 card-luxury rounded px-3">
                        <span className="text-sm font-medium text-[#737373]">Mid Floor 2:</span>
                        <span className="text-base text-[#f5f5f5] font-semibold">
                          ₹{Number(selectedBuilding.price_mid2).toLocaleString('en-IN')} Cr
                        </span>
                      </div>
                    )}
                    {selectedBuilding.price_ug && (
                      <div className="flex items-center justify-between py-2 card-luxury rounded px-3">
                        <span className="text-sm font-medium text-[#737373]">UG Floor:</span>
                        <span className="text-base text-[#f5f5f5] font-semibold">
                          ₹{Number(selectedBuilding.price_ug).toLocaleString('en-IN')} Cr
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(selectedBuilding.has_basement || selectedBuilding.is_triplex || selectedBuilding.is_gated) && (
                <div className="py-3 border-t border-[#2a2a2a]">
                  <div className="flex flex-wrap gap-2">
                    {selectedBuilding.has_basement && (
                      <span className={`text-sm px-3 py-1.5 ${getBadgeBgColor()} rounded`}>
                        Basement
                      </span>
                    )}
                    {selectedBuilding.is_triplex && (
                      <span className={`text-sm px-3 py-1.5 ${getBadgeBgColor()} rounded`}>
                        Triplex
                      </span>
                    )}
                    {selectedBuilding.is_gated && (
                      <span className={`text-sm px-3 py-1.5 ${getBadgeBgColor()} rounded`}>
                        Gated
                      </span>
                    )}
                  </div>
                </div>
              )}

              {selectedBuilding.comments && (
                <div className="py-3 border-t-2 border-[#2a2a2a]">
                  <h4 className="text-base font-bold font-serif-display text-[#f5f5f5] mb-3">Additional Notes</h4>
                  <div className={`rounded-lg p-4 ${getCardBgColor()}`}>
                    <p className="text-sm text-[#a3a3a3] whitespace-pre-line leading-relaxed">
                      {selectedBuilding.comments}
                    </p>
                  </div>
                </div>
              )}

              {selectedBuilding.brochure_url && (
                <div className="pt-3 border-t border-[#2a2a2a]">
                  <a
                    href={selectedBuilding.brochure_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2 ${getBrochureButtonBgColor()} text-sm`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    View Brochure
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

