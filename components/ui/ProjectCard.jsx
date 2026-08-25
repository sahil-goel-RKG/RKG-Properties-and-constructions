'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useUser } from '@clerk/nextjs'
import { formatPriceLabel } from '@/lib/formatPrice'
import './project-card.css'

export default function ProjectCard({ project, variant }) {
  const { isSignedIn, isLoaded } = useUser()

  const isBuilderFloor =
    variant === 'builder-floor' || project.type === 'builder-floor'

  const href = isBuilderFloor
    ? `/builder-floor/${project.slug}`
    : `/projects/${project.slug}`

  const priceInfo = formatPriceLabel(project.price)
  const shouldBlur = isBuilderFloor && isLoaded && !isSignedIn

  return (
    <Link
      href={href}
      className={`project-card card-luxury group ${shouldBlur ? 'project-card--blurred' : ''}`}
    >
      {project.image_url ? (
        <>
          <div className="project-card-media">
            <div className="project-card-media-fade">
              <Image
                src={project.image_url}
                alt={project.name}
                width={320}
                height={160}
                sizes="320px"
                className="project-card-media-img project-card-media-img--desktop"
                unoptimized
              />
              <div className="project-card-media-frame project-card-media-frame--mobile">
                <Image
                  src={project.image_url}
                  alt=""
                  fill
                  sizes="(max-width: 767px) 90vw, 320px"
                  className="project-card-media-img project-card-media-img--mobile"
                  unoptimized
                  aria-hidden
                />
              </div>
            </div>
            <div className="project-card-desktop-fade" aria-hidden="true" />
          </div>
          <div className="project-card-mobile-scrim" aria-hidden="true" />
        </>
      ) : (
        <div className="project-card-fallback" aria-hidden="true" />
      )}

      <div className={`project-card-body ${shouldBlur ? 'project-card-body--blurred' : ''}`}>
        <h3 className="project-card-title">{project.name}</h3>

        <p className="project-card-line">
          <span className="project-card-label">Location:</span>{' '}
          {project.location || '\u00A0'}
        </p>

        <p className="project-card-line">
          <span className="project-card-label">Area:</span> {project.area || '\u00A0'}
        </p>

        <p className="project-card-line">
          {shouldBlur ? (
            <span className="project-card-muted">Sign in to view pricing</span>
          ) : priceInfo?.label ? (
            <span className="project-card-price golden-text">{priceInfo.label}</span>
          ) : (
            <span className="project-card-muted">&nbsp;</span>
          )}
        </p>

        <span className="project-card-cta">View Details →</span>
      </div>
    </Link>
  )
}
