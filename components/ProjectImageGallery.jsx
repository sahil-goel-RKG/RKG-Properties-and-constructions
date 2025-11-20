'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function ProjectImageGallery({ images = [], projectName = '' }) {
  const [selectedImage, setSelectedImage] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="relative h-96 bg-gray-200">
        <div className="flex items-center justify-center h-full text-gray-400">
          <svg
            className="w-24 h-24"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative h-96 bg-gray-200 rounded-t-lg overflow-hidden">
        <Image
          src={images[selectedImage]}
          alt={`${projectName} - Image ${selectedImage + 1}`}
          fill
          className="object-cover"
          priority={selectedImage === 0}
        />
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative h-20 md:h-24 rounded-lg overflow-hidden border-2 transition ${
                  selectedImage === index
                    ? 'border-[#c99700] ring-2 ring-[#ffd86b]'
                    : 'border-gray-200 hover:border-[#c99700]'
                }`}
              >
                <Image
                  src={image}
                  alt={`${projectName} - Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
