'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

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
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }
    } else {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [isOpen])

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

  const filterModal = isOpen ? (
    <div
      className="filter-modal-overlay"
      onClick={() => setIsOpen(false)}
      role="presentation"
    >
      <div
        className="filter-modal-panel surface-elevated rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-modal-title"
      >
        {/* Modal Header */}
        <div className="sticky top-0 surface-elevated border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between z-10">
          <h2 id="filter-modal-title" className="text-2xl font-bold font-serif-display text-[#f5f5f5]">Filter Properties</h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-[#737373] hover:text-[#f5f5f5] transition"
            aria-label="Close filters"
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
              <label htmlFor="location" className="form-label">
                Location
              </label>
              <select
                id="location"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="form-input px-4 py-2"
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
              <label htmlFor="area" className="form-label">
                Area
              </label>
              <select
                id="area"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="form-input px-4 py-2"
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
                <label htmlFor="developer" className="form-label">
                  Developer
                </label>
                <select
                  id="developer"
                  value={selectedDeveloper}
                  onChange={(e) => setSelectedDeveloper(e.target.value)}
                  className="form-input px-4 py-2"
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
                <label htmlFor="type" className="form-label">
                  Type
                </label>
                <select
                  id="type"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="form-input px-4 py-2"
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
        <div className="sticky bottom-0 section-muted border-t border-[#2a2a2a] px-6 py-4 flex justify-end gap-3 z-10">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="btn-secondary"
            >
              Clear All
            </button>
          )}
          <button
            type="button"
            onClick={applyFilters}
            className="btn-primary"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      {/* Filter Button - Hamburger Menu */}
      <div className={`flex justify-end mb-6 ${buttonWrapperClassName}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="btn-primary flex items-center gap-2"
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
            <span className="bg-[#0a0a0a] text-[#c9a227] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              !
            </span>
          )}
        </button>
      </div>

      {isMounted && filterModal ? createPortal(filterModal, document.body) : null}
    </>
  )
}
