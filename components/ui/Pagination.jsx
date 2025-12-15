'use client'

import Link from 'next/link'

export default function Pagination({ 
  currentPage, 
  totalPages, 
  baseUrl,
  totalItems,
  itemsPerPage 
}) {
  if (totalPages <= 1) return null

  const getPageUrl = (page) => {
    // Parse the baseUrl to extract path and existing query params
    const [path, existingQuery] = baseUrl.split('?')
    const params = new URLSearchParams(existingQuery || '')
    
    if (page > 1) {
      params.set('page', page.toString())
    } else {
      params.delete('page')
    }
    
    const queryString = params.toString()
    return queryString ? `${path}?${queryString}` : path
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 7
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)
      
      if (currentPage > 3) {
        pages.push('...')
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...')
      }
      
      // Always show last page
      pages.push(totalPages)
    }
    
    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="mt-8 flex flex-col items-center gap-4">
      {/* Results info */}
      <div className="text-sm text-gray-600">
        Showing <span className="font-semibold">{startItem}</span> to{' '}
        <span className="font-semibold">{endItem}</span> of{' '}
        <span className="font-semibold">{totalItems}</span> properties
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        {currentPage > 1 ? (
          <Link
            href={getPageUrl(currentPage - 1)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition"
          >
            Previous
          </Link>
        ) : (
          <span className="px-4 py-2 border border-gray-300 rounded-lg text-gray-400 cursor-not-allowed">
            Previous
          </span>
        )}

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                  ...
                </span>
              )
            }
            
            const isActive = page === currentPage
            
            return (
              <Link
                key={page}
                href={getPageUrl(page)}
                className={`px-4 py-2 border rounded-lg transition ${
                  isActive
                    ? 'bg-[#c99700] text-white border-[#c99700] font-semibold'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </Link>
            )
          })}
        </div>

        {/* Next button */}
        {currentPage < totalPages ? (
          <Link
            href={getPageUrl(currentPage + 1)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition"
          >
            Next
          </Link>
        ) : (
          <span className="px-4 py-2 border border-gray-300 rounded-lg text-gray-400 cursor-not-allowed">
            Next
          </span>
        )}
      </div>
    </div>
  )
}

