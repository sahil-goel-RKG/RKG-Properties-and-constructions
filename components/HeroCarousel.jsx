'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function HeroCarousel({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Rotate images every 5 seconds
  useEffect(() => {
    if (images && images.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        )
      }, 5000) // Change image every 5 seconds

      return () => clearInterval(interval)
    }
  }, [images])

  if (!images || images.length === 0) {
    return null
  }

  return (
    <>
      {/* Background Images */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full">
          {images.map((imgUrl, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={imgUrl}
                alt={`Hero image ${index + 1}`}
                fill
                priority={index === 0}
                className="object-cover"
              />
            </div>
          ))}
        </div>
        {/* Grey Blend Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-800/50 to-gray-900/60"></div>
      </div>

      {/* Image Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-8 bg-white' 
                  : 'w-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </>
  )
}

