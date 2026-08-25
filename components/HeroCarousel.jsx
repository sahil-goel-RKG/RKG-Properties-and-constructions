'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

/*
 * Image band spans 25% → 100% of the page container (same as ProjectsSlider, etc.).
 * Local % within band = (global% - 25) / 75:
 *   0–25% container  → black bg only
 *   25–50% container → ghosted fade (~45% opacity)
 *   50–70% container → fade → fully clear
 *   70%+ container    → fully sharp
 */
const FADE_ZONE_END = '33.33%'
const CLEAR_END = '60%'

const FADE_MASK = {
  WebkitMaskImage: `linear-gradient(to right,
    transparent 0%,
    rgba(0, 0, 0, 0.2) 5%,
    rgba(0, 0, 0, 0.45) ${FADE_ZONE_END},
    rgba(0, 0, 0, 0.85) 55%,
    black ${CLEAR_END},
    black 100%)`,
  maskImage: `linear-gradient(to right,
    transparent 0%,
    rgba(0, 0, 0, 0.2) 5%,
    rgba(0, 0, 0, 0.45) ${FADE_ZONE_END},
    rgba(0, 0, 0, 0.85) 55%,
    black ${CLEAR_END},
    black 100%)`,
}

const IMAGE_STYLE = { objectPosition: '28% center' }

function HeroSlide({ src, alt, priority = false, sizes = '50vw' }) {
  return (
    <div
      className="hero-image-fade-layer"
      style={{
        ...FADE_MASK,
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      }}
    >
      <div className="relative h-full w-full overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
          style={IMAGE_STYLE}
          unoptimized
        />
      </div>
    </div>
  )
}

export default function HeroCarousel({
  images,
  className = '',
  imageSizes = '(min-width: 1280px) 960px, (min-width: 768px) 60vw, 100vw',
}) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (images?.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [images])

  if (!images?.length) {
    return null
  }

  return (
    <div
      className={className}
      style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
    >
      {images.map((imgUrl, index) => (
        <div
          key={`${imgUrl}-${index}`}
          className={`absolute transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ top: 0, right: 0, bottom: 0, left: 0 }}
          aria-hidden={index !== currentIndex}
        >
          <HeroSlide
            src={imgUrl}
            alt={`Featured property ${index + 1}`}
            priority={index === 0}
            sizes={imageSizes}
          />
        </div>
      ))}

    </div>
  )
}
