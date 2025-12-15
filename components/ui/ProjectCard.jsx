'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useUser } from '@clerk/nextjs'
import { formatPriceLabel } from '@/lib/formatPrice'

export default function ProjectCard({ project, variant }) {
  const { isSignedIn, isLoaded } = useUser()
  
  // variant comes from the caller: "apartment" or "builder-floor"
  // For safety, also fall back to project.type if present
  const isBuilderFloor =
    variant === 'builder-floor' || project.type === 'builder-floor'

  const href = isBuilderFloor
    ? `/builder-floor/${project.slug}`   // 👉 for builder floors
    : `/projects/${project.slug}`        // 👉 for apartments

  const priceInfo = formatPriceLabel(project.price)

  // For builder floors, blur if user is not signed in
  const shouldBlur = isBuilderFloor && isLoaded && !isSignedIn

  return (
    <Link
      href={href}
      className="block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col"
      style={{ willChange: 'transform', transform: 'translateZ(0)' }}
    >
      <div className={`relative h-48 bg-gray-200 flex-shrink-0 ${shouldBlur ? 'blur-sm' : ''}`}>
        {project.image_url ? (
          <Image
            src={project.image_url}
            alt={project.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <svg
              className="w-16 h-16"
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
        )}
      </div>
      <div className={`p-6 flex flex-col flex-grow ${shouldBlur ? 'blur-sm' : ''}`}>
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 h-16">
          {project.name}
        </h3>
        <p className="text-gray-600 mb-2">
          <span className="font-medium">Location:</span> {project.location}
        </p>
        {project.area && (
          <p className="text-gray-600 mb-2">
            <span className="font-medium">Area:</span> {project.area}
          </p>
        )}
        {priceInfo?.label && (
          <p className="font-semibold mb-2 text-[#f70000]">
            {priceInfo.label}
          </p>
        )}
        <span className="inline-block mt-auto font-medium text-[rgb(0,37,122)] hover:text-[rgb(0,50,150)] hover:underline">
          View Details →
        </span>
      </div>
    </Link>
  )
}
