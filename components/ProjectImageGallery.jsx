'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

export default function ProjectImageGallery({ images = [], projectName = '' }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imageContainerRef = useRef(null)

  // Reset zoom when image changes or modal closes
  useEffect(() => {
    if (!isFullScreen) {
      setZoom(1)
      setPosition({ x: 0, y: 0 })
    }
  }, [isFullScreen, selectedImage])

  // Handle zoom in
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3)) // Max zoom 3x
  }

  // Handle zoom out
  const handleZoomOut = () => {
    setZoom(prev => {
      const newZoom = Math.max(prev - 0.25, 1) // Min zoom 1x
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 }) // Reset position when zoomed out
      }
      return newZoom
    })
  }

  // Handle reset zoom
  const handleResetZoom = () => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }

  // Handle mouse wheel zoom
  const handleWheel = (e) => {
    if (!isFullScreen) return
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom(prev => {
      const newZoom = Math.max(1, Math.min(3, prev + delta))
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 })
      }
      return newZoom
    })
  }

  // Handle mouse down for dragging
  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  // Handle mouse move for dragging
  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  // Handle mouse up for dragging
  const handleMouseUp = () => {
    setIsDragging(false)
  }

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
      <div 
        className="relative h-96 bg-gray-200 rounded-t-lg overflow-hidden cursor-pointer"
        onClick={() => setIsFullScreen(true)}
      >
        <Image
          src={images[selectedImage]}
          alt={`${projectName} - Image ${selectedImage + 1}`}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
          priority={selectedImage === 0}
        />
      </div>
      
      {/* Full Screen Modal */}
      {isFullScreen && (
        <div 
          className="fixed inset-0 z-[9999] bg-black bg-opacity-95 flex items-center justify-center p-4"
          onClick={(e) => {
            // Close if clicking on the background (not the image or controls)
            if (e.target === e.currentTarget) {
              setIsFullScreen(false)
            }
          }}
          onWheel={handleWheel}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div 
            ref={imageContainerRef}
            className="relative w-full h-full max-w-7xl max-h-[95vh] flex items-center justify-center overflow-hidden"
            onMouseDown={handleMouseDown}
            style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
          >
            <div
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                transformOrigin: 'center center'
              }}
              className="relative w-full h-full flex items-center justify-center"
            >
              <Image
                src={images[selectedImage]}
                alt={`${projectName} - Full View`}
                fill
                className="object-contain select-none"
                sizes="100vw"
                priority
                draggable={false}
              />
            </div>
          </div>
          
          {/* Zoom Controls */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-50">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleZoomIn()
              }}
              className="bg-black/50 hover:bg-black/70 text-white rounded-lg p-3 transition-colors"
              aria-label="Zoom in"
              title="Zoom In"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleZoomOut()
              }}
              className="bg-black/50 hover:bg-black/70 text-white rounded-lg p-3 transition-colors"
              aria-label="Zoom out"
              title="Zoom Out"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
                />
              </svg>
            </button>
            {zoom > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleResetZoom()
                }}
                className="bg-black/50 hover:bg-black/70 text-white rounded-lg p-3 transition-colors"
                aria-label="Reset zoom"
                title="Reset Zoom"
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            )}
            <div className="bg-black/50 text-white rounded-lg px-3 py-2 text-sm text-center">
              {Math.round(zoom * 100)}%
            </div>
          </div>
          
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsFullScreen(false)
            }}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-50 bg-black/50 hover:bg-black/70 rounded-lg p-3"
            aria-label="Close full screen view"
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

          {/* Navigation Arrows (if multiple images) */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedImage(prev => (prev > 0 ? prev - 1 : images.length - 1))
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-50 bg-black/50 hover:bg-black/70 rounded-lg p-3"
                aria-label="Previous image"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedImage(prev => (prev < images.length - 1 ? prev + 1 : 0))
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-50 bg-black/50 hover:bg-black/70 rounded-lg p-3"
                aria-label="Next image"
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      )}

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative h-20 md:h-24 rounded-lg overflow-hidden border-2 transition w-full ${
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
