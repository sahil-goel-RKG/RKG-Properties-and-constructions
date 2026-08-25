'use client'

import { useEffect, useState } from 'react'
import { testimonials } from '@/config/testimonials'
import { resolveSectionClass, resolveSectionStyle } from '@/lib/resolveSectionClass'
import './testimonials-section.css'

const ROTATE_MS = 8500
const FADE_MS = 1500

const srOnlyStyle = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
}

function StarRating({ rating }) {
  const stars = Math.round(rating)

  return (
    <div className="testimonials-section-stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <svg
          key={index}
          className="testimonials-section-star"
          style={{ color: index < stars ? '#c9a227' : '#404040' }}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function TestimonialCard({ item, isActive }) {
  return (
    <article
      className="testimonials-section-card card-luxury"
      style={{
        opacity: isActive ? 1 : 0,
        pointerEvents: isActive ? 'auto' : 'none',
        transitionDuration: `${FADE_MS}ms`,
      }}
      aria-hidden={!isActive}
    >
      <StarRating rating={item.rating} />
      <p className="testimonials-section-feedback">&ldquo;{item.feedback}&rdquo;</p>
      <p className="testimonials-section-name">{item.name}</p>
    </article>
  )
}

export default function TestimonialsSection({ bgColor = 'section-light' }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (testimonials.length <= 1) return undefined

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, ROTATE_MS)

    return () => clearInterval(interval)
  }, [])

  if (!testimonials.length) return null

  const activeItem = testimonials[currentIndex]

  return (
    <section
      className={`testimonials-section ${resolveSectionClass(bgColor)} py-8 sm:py-16`}
      style={resolveSectionStyle(bgColor)}
    >
      <div className="container mx-auto px-4 sm:px-6 min-w-0">
        <div className="mb-6 text-center sm:mb-12">
          <h2 className="font-serif-display text-2xl font-bold text-[#f5f5f5] sm:text-3xl mb-2 sm:mb-4">
            What Our Clients Say
          </h2>
          <p className="text-sm text-[#a3a3a3] sm:text-xl px-1">
            Real stories from buyers who found their place in Gurgaon with us
          </p>
        </div>

        <div className="testimonials-section__wrap">
          <div
            className="testimonials-carousel"
            aria-live="polite"
            aria-atomic="true"
            aria-label={`Client testimonial ${currentIndex + 1} of ${testimonials.length}`}
          >
            {testimonials.map((item, index) => (
              <TestimonialCard key={item.id} item={item} isActive={index === currentIndex} />
            ))}
          </div>
        </div>

        <p style={srOnlyStyle}>
          {activeItem.name}: {activeItem.feedback}
        </p>
      </div>
    </section>
  )
}
