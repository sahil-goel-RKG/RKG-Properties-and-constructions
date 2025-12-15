'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import ProjectCard from '@/components/ui/ProjectCard'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ProjectsSlider({
  projects,
  title = 'Apartments',
  description = 'Discover premium apartment properties in Gurgaon',
  ctaLabel = 'View All Apartments',
  ctaHref = '/apartments',
  allowEmpty = false,
  emptyMessage = 'No projects available at the moment. Check back soon!',
  bgColor = 'bg-white',
  variant = 'apartment', // 'apartment' or 'builder-floor'
}) {
  const scrollContainerRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

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
      const scrollAmount = 400
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  if (!projects || projects.length === 0) {
    if (!allowEmpty) return null

    return (
      <section className={`${bgColor} py-16`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
            {description && <p className="text-xl text-gray-600">{description}</p>}
          </div>
          <div className="bg-white rounded-xl shadow-md p-10 text-center max-w-3xl mx-auto">
            <p className="text-gray-600 mb-6">{emptyMessage}</p>
            <Link
              href={ctaHref}
              className="inline-block bg-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#16a34a] transition"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={`${bgColor} py-16`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          {description && <p className="text-xl text-gray-600">{description}</p>}
        </div>

        <div className="relative">
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md transition bg-white absolute left-4 top-1/2 -translate-y-1/2 z-10"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700 hover:text-[#c99700]" />
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md transition bg-white absolute right-4 top-1/2 -translate-y-1/2 z-10"
            >
              <ChevronRight className="w-6 h-6 text-gray-700 hover:text-[#c99700]" />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            className="flex gap-8 overflow-x-auto overflow-y-visible px-12 pb-6 scroll-smooth hide-scrollbar items-stretch"
            onScroll={checkScrollButtons}
          >
            {projects.map((project) => (
              <div key={project.id} className="flex-shrink-0 w-80 self-stretch">
                <ProjectCard project={project} variant={variant} />
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href={ctaHref}
              className="inline-block bg-[#22c55e] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#16a34a] transition"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
