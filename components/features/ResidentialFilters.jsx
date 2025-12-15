'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function ResidentialFilters({ 
  locations = [], 
  developers = [], 
  areas = [],
  types = [],
  showDeveloperFilter = true,
  showTypeFilter = false,
  basePath = '/apartments',
  buttonWrapperClassName = ''
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedDeveloper, setSelectedDeveloper] = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const [selectedType, setSelectedType] = useState('')

  // Sync with URL params on mount and when searchParams change
  useEffect(() => {
    setSelectedLocation(searchParams.get('location') || '')
    setSelectedDeveloper(searchParams.get('developer') || '')
    setSelectedArea(searchParams.get('area') || '')
    setSelectedType(searchParams.get('type') || '')
  }, [searchParams])

  const applyFilters = () => {
    const params = new URLSearchParams()
    
    if (selectedLocation) {
      params.set('location', selectedLocation)
    }
    
    if (selectedDeveloper && showDeveloperFilter) {
      params.set('developer', selectedDeveloper)
    }

    if (selectedArea) {
      params.set('area', selectedArea)
    }

    if (selectedType && showTypeFilter) {
      params.set('type', selectedType)
    }

    const queryString = params.toString()
    router.push(queryString ? `${basePath}?${queryString}` : basePath)
    setIsOpen(false)
  }

  const clearFilters = () => {
    setSelectedLocation('')
    setSelectedDeveloper('')
    setSelectedArea('')
    setSelectedType('')
    router.push(basePath)
    setIsOpen(false)
  }

  const hasActiveFilters = selectedLocation || selectedDeveloper || selectedArea || selectedType

  return (
    <>
      {/* Filter Button - Hamburger Menu */}
      <div className={`flex justify-end mb-6 ${buttonWrapperClassName}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#c99700] text-white rounded-lg font-semibold hover:bg-[#a67800] transition"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-white golden-text rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              !
            </span>
          )}
        </button>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          {/* Modal Content */}
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Filter Properties</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className={`grid gap-6 ${
                showDeveloperFilter && showTypeFilter 
                  ? 'md:grid-cols-4' 
                  : showDeveloperFilter || showTypeFilter 
                    ? 'md:grid-cols-3' 
                    : 'md:grid-cols-2'
              }`}>
                {/* Location Filter */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    id="location"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                  >
                    <option value="">All Locations</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Area Filter */}
                <div>
                  <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
                    Area
                  </label>
                  <select
                    id="area"
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                  >
                    <option value="">All Areas</option>
                    {areas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Developer Filter */}
                {showDeveloperFilter && (
                  <div>
                    <label htmlFor="developer" className="block text-sm font-medium text-gray-700 mb-2">
                      Developer
                    </label>
                    <select
                      id="developer"
                      value={selectedDeveloper}
                      onChange={(e) => setSelectedDeveloper(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                    >
                      <option value="">All Developers</option>
                      {developers.map((developer) => (
                        <option key={developer} value={developer}>
                          {developer}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Type Filter */}
                {showTypeFilter && (
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      id="type"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                    >
                      <option value="">All Types</option>
                      {types.map((type) => (
                        <option key={type} value={type}>
                          {type.replace('-', ' ').replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={applyFilters}
                className="px-6 py-2 bg-[#c99700] text-white rounded-lg font-semibold hover:bg-[#a67800] transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
