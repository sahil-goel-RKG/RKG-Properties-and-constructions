'use client'

import { useRef, useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import BrochureDownloadModal from '@/components/features/BrochureDownloadModal'

export default function BuildingConfigurationSlider({ buildingConfig, status, slug, builderFloorName }) {
  const scrollContainerRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const { user, isLoaded } = useUser()
  const [showModal, setShowModal] = useState(false)
  const [pendingDownloadUrl, setPendingDownloadUrl] = useState(null)
  const [pendingProjectName, setPendingProjectName] = useState('')

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
      return 'bg-green-50'
    } else if (status === 'under-construction') {
      return 'bg-[#fff5d6]'
    }
    return 'bg-gray-50'
  }

  // Determine badge background color (darker version of card background)
  const getBadgeBgColor = () => {
    if (status === 'ready-to-move') {
      return 'bg-green-200'
    } else if (status === 'under-construction') {
      return 'bg-[#f2cd6d]'
    }
    return 'bg-gray-200'
  }

  // Determine brochure button background color (even darker version of card background)
  const getBrochureButtonBgColor = () => {
    if (status === 'ready-to-move') {
      return 'bg-green-300 hover:bg-green-400'
    } else if (status === 'under-construction') {
      return 'bg-[#d4b85a] hover:bg-[#c5a84a]'
    }
    return 'bg-gray-300 hover:bg-gray-400'
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
        {buildingConfig.map((building, index) => {

          return (
          <div
            key={index}
            onClick={(e) => handleCardClick(building, index, e)}
            className={`min-w-[320px] max-w-[380px] border border-gray-200 rounded-lg p-4 ${getCardBgColor()} flex-shrink-0 cursor-pointer hover:shadow-md transition-shadow`}
          >
            <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              Building {building.building_number || index + 1}
            </h4>
            <div className="space-y-2">
              {building.plot_size && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Plot Size:</span>
                  <span className="text-sm text-gray-900">
                    {building.plot_size.toLowerCase().includes('sqyd') 
                      ? building.plot_size 
                      : `${building.plot_size} sqyd`}
                  </span>
                </div>
              )}
              {building.facing && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Facing:</span>
                  <span className="text-sm text-gray-900">{building.facing}</span>
                </div>
              )}
              {building.floors_count && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Floors:</span>
                  <span className="text-sm text-gray-900">{building.floors_count}</span>
                </div>
              )}
              {building.roof_rights && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Roof Rights:</span>
                  <span className="text-sm text-gray-900">{building.roof_rights}</span>
                </div>
              )}
              {building.condition && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Condition:</span>
                  <span className="text-sm text-gray-900">{pretty(building.condition)}</span>
                </div>
              )}
              {building.status && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Status:</span>
                  <span className="text-sm text-gray-900">{pretty(building.status)}</span>
                </div>
              )}
              {building.category && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Category:</span>
                  <span className="text-sm text-gray-900">{pretty(building.category)}</span>
                </div>
              )}
              {building.possession_date && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Possession:</span>
                  <span className="text-sm text-gray-900">{building.possession_date}</span>
                </div>
              )}
              {building.owner_name && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Owner:</span>
                  <span className="text-sm text-gray-900">{building.owner_name}</span>
                </div>
              )}
              {building.price_top && (
                <div className="flex items-center justify-between pt-1 border-t border-gray-200">
                  <span className="text-xs font-medium text-gray-600">Top Floor:</span>
                  <span className="text-sm text-gray-900 font-semibold">
                    ₹{Number(building.price_top).toLocaleString('en-IN')} Cr
                  </span>
                </div>
              )}
              {building.price_mid1 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Mid Floor 1:</span>
                  <span className="text-sm text-gray-900">
                    ₹{Number(building.price_mid1).toLocaleString('en-IN')} Cr
                  </span>
                </div>
              )}
              {building.price_mid2 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Mid Floor 2:</span>
                  <span className="text-sm text-gray-900">
                    ₹{Number(building.price_mid2).toLocaleString('en-IN')} Cr
                  </span>
                </div>
              )}
              {building.price_ug && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">UG Floor:</span>
                  <span className="text-sm text-gray-900">
                    ₹{Number(building.price_ug).toLocaleString('en-IN')} Cr
                  </span>
                </div>
              )}
              {(building.has_basement || building.is_triplex || building.is_gated) && (
                <div className="pt-1 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {building.has_basement && (
                      <span className={`text-xs px-2 py-1 ${getBadgeBgColor()} text-gray-800 rounded`}>
                        Basement
                      </span>
                    )}
                    {building.is_triplex && (
                      <span className={`text-xs px-2 py-1 ${getBadgeBgColor()} text-gray-800 rounded`}>
                        Triplex
                      </span>
                    )}
                    {building.is_gated && (
                      <span className={`text-xs px-2 py-1 ${getBadgeBgColor()} text-gray-800 rounded`}>
                        Gated
                      </span>
                    )}
                  </div>
                </div>
              )}
              {building.comments && (
                <div className="pt-1 border-t border-gray-200">
                  <span className="text-xs font-medium text-gray-600">Notes:</span>
                  <p className="text-xs text-gray-700 mt-1 whitespace-pre-line line-clamp-3">{building.comments}</p>
                </div>
              )}
              {building.brochure_url && (
                <div className="pt-2 border-t border-gray-200">
                  <a
                    href={slug ? `/api/download-brochure?type=builder-floor&slug=${slug}&building=${index}` : building.brochure_url}
                    onClick={(e) => {
                      // If user is not authenticated, show modal
                      if (!isLoaded || !user) {
                        e.preventDefault()
                        setPendingDownloadUrl(slug ? `/api/download-brochure?type=builder-floor&slug=${slug}&building=${index}` : building.brochure_url)
                        setPendingProjectName(`${builderFloorName || 'Builder Floor'} - Building ${building.building_number || index + 1}`)
                        setShowModal(true)
                      }
                      // If authenticated, allow default link behavior
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2 w-full px-3 py-2 ${getBrochureButtonBgColor()} text-gray-800 rounded-lg text-xs font-semibold transition`}
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
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition"
          aria-label="Scroll right"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Modal for building details */}
      {selectedBuilding && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Building {selectedBuilding.building_number || selectedBuilding.index + 1} - Full Details
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {selectedBuilding.plot_size && (
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">Plot Size:</span>
                  <span className="text-base text-gray-900">
                    {selectedBuilding.plot_size.toLowerCase().includes('sqyd') 
                      ? selectedBuilding.plot_size 
                      : `${selectedBuilding.plot_size} sqyd`}
                  </span>
                </div>
              )}
              {selectedBuilding.facing && (
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">Facing:</span>
                  <span className="text-base text-gray-900">{selectedBuilding.facing}</span>
                </div>
              )}
              {selectedBuilding.floors_count && (
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">Floors:</span>
                  <span className="text-base text-gray-900">{selectedBuilding.floors_count}</span>
                </div>
              )}
              {selectedBuilding.roof_rights && (
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">Roof Rights:</span>
                  <span className="text-base text-gray-900">{selectedBuilding.roof_rights}</span>
                </div>
              )}
              {selectedBuilding.condition && (
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">Condition:</span>
                  <span className="text-base text-gray-900">{pretty(selectedBuilding.condition)}</span>
                </div>
              )}
              {selectedBuilding.status && (
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">Status:</span>
                  <span className="text-base text-gray-900">{pretty(selectedBuilding.status)}</span>
                </div>
              )}
              {selectedBuilding.category && (
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">Category:</span>
                  <span className="text-base text-gray-900">{pretty(selectedBuilding.category)}</span>
                </div>
              )}
              {selectedBuilding.possession_date && (
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">Possession:</span>
                  <span className="text-base text-gray-900">{selectedBuilding.possession_date}</span>
                </div>
              )}
              {selectedBuilding.owner_name && (
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">Owner:</span>
                  <span className="text-base text-gray-900">{selectedBuilding.owner_name}</span>
                </div>
              )}
              
              {(selectedBuilding.price_top || selectedBuilding.price_mid1 || selectedBuilding.price_mid2 || selectedBuilding.price_ug) && (
                <div className="py-3 border-t-2 border-gray-300">
                  <h4 className="text-base font-bold text-gray-900 mb-3">Pricing</h4>
                  <div className="space-y-2">
                    {selectedBuilding.price_top && (
                      <div className="flex items-center justify-between py-2 bg-gray-50 rounded px-3">
                        <span className="text-sm font-medium text-gray-700">Top Floor:</span>
                        <span className="text-base text-gray-900 font-semibold">
                          ₹{Number(selectedBuilding.price_top).toLocaleString('en-IN')} Cr
                        </span>
                      </div>
                    )}
                    {selectedBuilding.price_mid1 && (
                      <div className="flex items-center justify-between py-2 bg-gray-50 rounded px-3">
                        <span className="text-sm font-medium text-gray-700">Mid Floor 1:</span>
                        <span className="text-base text-gray-900 font-semibold">
                          ₹{Number(selectedBuilding.price_mid1).toLocaleString('en-IN')} Cr
                        </span>
                      </div>
                    )}
                    {selectedBuilding.price_mid2 && (
                      <div className="flex items-center justify-between py-2 bg-gray-50 rounded px-3">
                        <span className="text-sm font-medium text-gray-700">Mid Floor 2:</span>
                        <span className="text-base text-gray-900 font-semibold">
                          ₹{Number(selectedBuilding.price_mid2).toLocaleString('en-IN')} Cr
                        </span>
                      </div>
                    )}
                    {selectedBuilding.price_ug && (
                      <div className="flex items-center justify-between py-2 bg-gray-50 rounded px-3">
                        <span className="text-sm font-medium text-gray-700">UG Floor:</span>
                        <span className="text-base text-gray-900 font-semibold">
                          ₹{Number(selectedBuilding.price_ug).toLocaleString('en-IN')} Cr
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(selectedBuilding.has_basement || selectedBuilding.is_triplex || selectedBuilding.is_gated) && (
                <div className="py-3 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {selectedBuilding.has_basement && (
                      <span className={`text-sm px-3 py-1.5 ${getBadgeBgColor()} text-gray-800 rounded`}>
                        Basement
                      </span>
                    )}
                    {selectedBuilding.is_triplex && (
                      <span className={`text-sm px-3 py-1.5 ${getBadgeBgColor()} text-gray-800 rounded`}>
                        Triplex
                      </span>
                    )}
                    {selectedBuilding.is_gated && (
                      <span className={`text-sm px-3 py-1.5 ${getBadgeBgColor()} text-gray-800 rounded`}>
                        Gated
                      </span>
                    )}
                  </div>
                </div>
              )}

              {selectedBuilding.comments && (
                <div className="py-3 border-t-2 border-gray-300">
                  <h4 className="text-base font-bold text-gray-900 mb-3">Additional Notes</h4>
                  <div className={`rounded-lg p-4 ${getCardBgColor()}`}>
                    <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                      {selectedBuilding.comments}
                    </p>
                  </div>
                </div>
              )}

              {selectedBuilding.brochure_url && (
                <div className="pt-3 border-t border-gray-200">
                  <a
                    href={slug ? `/api/download-brochure?type=builder-floor&slug=${slug}&building=${selectedBuilding.index}` : selectedBuilding.brochure_url}
                    onClick={(e) => {
                      // If user is not authenticated, show modal
                      if (!isLoaded || !user) {
                        e.preventDefault()
                        setPendingDownloadUrl(slug ? `/api/download-brochure?type=builder-floor&slug=${slug}&building=${selectedBuilding.index}` : selectedBuilding.brochure_url)
                        setPendingProjectName(`${builderFloorName || 'Builder Floor'} - Building ${selectedBuilding.building_number || selectedBuilding.index + 1}`)
                        setShowModal(true)
                      }
                      // If authenticated, allow default link behavior
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2 w-full px-4 py-3 ${getBrochureButtonBgColor()} text-gray-800 rounded-lg text-sm font-semibold transition`}
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

      {/* Brochure Download Modal */}
      {showModal && (
        <BrochureDownloadModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setPendingDownloadUrl(null)
            setPendingProjectName('')
          }}
          onDownload={() => {
            if (pendingDownloadUrl) {
              window.open(pendingDownloadUrl, '_blank')
            }
          }}
          projectName={pendingProjectName}
        />
      )}
    </div>
  )
}

