'use client'

import ProjectCard from '@/components/ui/ProjectCard'
import Link from 'next/link'
import { resolveSectionClass, resolveSectionStyle } from '@/lib/resolveSectionClass'

export default function ProjectsSlider({
  projects,
  title = 'Apartments',
  description = 'Discover premium apartment properties in Gurgaon',
  ctaLabel = 'View All Apartments',
  ctaHref = '/apartments',
  allowEmpty = false,
  emptyMessage = 'No projects available at the moment. Check back soon!',
  bgColor = 'section-mid',
  variant = 'apartment',
}) {
  const sectionClass = resolveSectionClass(bgColor)
  const sectionStyle = resolveSectionStyle(bgColor)
  const isLightBand = bgColor === 'section-light'
  const sectionPy = isLightBand ? 'py-8 sm:py-14' : 'py-8 sm:py-16'
  const headMb = isLightBand ? 'mb-6 sm:mb-10' : 'mb-6 sm:mb-12'
  const ctaMt = isLightBand ? 'mt-4 sm:mt-7' : 'mt-4 sm:mt-8'

  if (!projects || projects.length === 0) {
    if (!allowEmpty) return null

    return (
      <section className={`${sectionClass} ${sectionPy}`} style={sectionStyle}>
        <div className="container mx-auto px-4">
          <div className={`text-center ${headMb}`}>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#f5f5f5] mb-2 sm:mb-4">{title}</h2>
            {description && <p className="text-base sm:text-xl text-[#a3a3a3]">{description}</p>}
          </div>
          <div className="card-luxury p-6 sm:p-10 text-center max-w-3xl mx-auto">
            <p className="text-sm sm:text-base text-[#a3a3a3] mb-4 sm:mb-6">{emptyMessage}</p>
            <Link href={ctaHref} className="btn-primary">
              {ctaLabel}
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={`${sectionClass} ${sectionPy}`} style={sectionStyle}>
      <div className="container mx-auto px-4">
        <div className={`text-center ${headMb}`}>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#f5f5f5] mb-2 sm:mb-4">{title}</h2>
          {description && <p className="text-base sm:text-xl text-[#a3a3a3]">{description}</p>}
        </div>

        <div>
          <div
            className="slider-scroll-elegant flex snap-x snap-mandatory scroll-smooth items-start gap-4 overflow-x-auto overflow-y-hidden pb-4 sm:gap-8 sm:pb-5"
          >
            {projects.map((project) => (
              <div key={project.id} className="shrink-0 snap-start">
                <ProjectCard project={project} variant={variant} />
              </div>
            ))}
          </div>

          <div className={`text-center ${ctaMt}`}>
            <Link href={ctaHref} className="btn-primary">
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
