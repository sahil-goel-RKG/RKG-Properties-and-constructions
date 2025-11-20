import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { cache } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ProjectImageGallery from '@/components/ProjectImageGallery'
import { formatPriceLabel } from '@/lib/formatPrice'
import { developerNameToSlug } from '@/lib/developerUtils'

// Cache the project fetch for faster loads
const getProject = cache(async (slug) => {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching project:', error)
    return null
  }
})

// Cache project images fetch
const getProjectImages = cache(async (projectId) => {
  if (!projectId) {
    return []
  }
  
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('project_images')
      .select('image_url, display_order')
      .eq('project_id', projectId)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching project images:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Error fetching project images:', err)
    return []
  }
})

// Add revalidation for ISR (Incremental Static Regeneration)
export const revalidate = 3600 // Revalidate every hour

export async function generateMetadata({ params }) {
  const { slug } = await params
  const project = await getProject(slug)

  if (!project) {
    return {
      title: 'Project Not Found | RKG Properties and Constructions',
    }
  }

  return {
    title: `${project.name} | RKG Properties and Constructions`,
    description: project.short_description || project.full_description || project.description || `Discover ${project.name} - ${project.location}`,
  }
}

export default async function ProjectDetailPage({ params }) {
  const { slug } = await params
  
  // Fetch project first, then images
  const project = await getProject(slug)
  
  if (!project) {
    notFound()
  }
  
  // Fetch images after we have the project
  const projectImages = await getProjectImages(project.id)

  const priceInfo = formatPriceLabel(project.price)

  // Use already fetched images
  const allImages = project.image_url 
    ? [project.image_url, ...projectImages.map(img => img.image_url)]
    : projectImages.map(img => img.image_url)

  // Format area display
  const formatAreaDisplay = () => {
    if (project.carpet_area_min && project.carpet_area_max) {
      if (project.carpet_area_min === project.carpet_area_max) {
        return `${project.carpet_area_min} sq. ft.`
      }
      return `${project.carpet_area_min} - ${project.carpet_area_max} sq. ft.`
    }
    if (project.super_area_min && project.super_area_max) {
      if (project.super_area_min === project.super_area_max) {
        return `${project.super_area_min} sq. yd.`
      }
      return `${project.super_area_min} - ${project.super_area_max} sq. yd.`
    }
    return project.area || 'Not specified'
  }

  // Format project status
  const formatProjectStatus = (status) => {
    if (!status) return null
    const statusMap = {
      'under-construction': { label: 'Under Construction', color: 'bg-yellow-100 text-yellow-800' },
      'ready-to-move': { label: 'Ready to Move', color: 'bg-green-100 text-green-800' },
      'upcoming': { label: 'Upcoming', color: 'bg-blue-100 text-blue-800' },
      'completed': { label: 'Completed', color: 'bg-gray-100 text-gray-800' }
    }
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
  }

  const statusInfo = formatProjectStatus(project.project_status)
  const developerSlug = project.developer ? developerNameToSlug(project.developer) : null

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#c99700]">
              Home
            </Link>
            {' / '}
            <Link
              href={`/${project.type}`}
              className="hover:text-[#c99700] capitalize"
            >
              {project.type.replace('-', ' ')}
            </Link>
            {' / '}
            <span className="text-gray-900">{project.name}</span>
          </nav>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Project Image Gallery */}
            <ProjectImageGallery images={allImages} projectName={project.name} />

            {/* Project Details */}
            <div className="p-8">
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {project.name}
                </h1>
                <div className="flex flex-wrap gap-4 text-gray-600">
                  <span className="flex items-center">
                    <svg
                    className="w-5 h-5 mr-2 golden-text"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {project.location}
                  </span>
                  {project.area && (
                    <span className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 golden-text"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                      {project.area}
                    </span>
                  )}
                </div>
              </div>

              {/* Price and Status Banner */}
              <div className="mb-6 flex flex-wrap gap-4 items-center">
                {priceInfo?.label && (
                  <div className="flex-1 p-4 bg-[#fff5d6] rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Starting Price</p>
                    <p className="text-2xl font-bold text-[#f70000]">
                      {priceInfo.label}
                    </p>
                    {project.price_min && project.price_max && project.price_min !== project.price_max && (
                      <p className="text-sm text-gray-600 mt-1">
                        ₹ {project.price_min.toLocaleString('en-IN')} - ₹ {project.price_max.toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                )}
                {statusInfo && (
                  <div className="px-4 py-2 rounded-lg">
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Short Description */}
              {project.short_description && (
                <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <p className="text-lg text-gray-800 font-medium">
                    {project.short_description}
                  </p>
                </div>
              )}

              {/* BHK Configuration */}
              {project.bhk_config && project.bhk_config.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Configurations</h3>
                  <div className="flex flex-wrap gap-3">
                    {project.bhk_config.map((bhk, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-[#f70000] text-white rounded-lg font-semibold"
                      >
                        {bhk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Details Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2 golden-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Location
                  </h3>
                  <p className="text-gray-700">{project.location}</p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2 golden-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Area
                  </h3>
                  <p className="text-gray-700">{formatAreaDisplay()}</p>
                  {project.carpet_area_min && project.carpet_area_max && (
                    <p className="text-sm text-gray-500 mt-1">Carpet Area</p>
                  )}
                  {project.super_area_min && project.super_area_max && (
                    <p className="text-sm text-gray-500 mt-1">Super Area</p>
                  )}
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Project Type</h3>
                  <p className="text-gray-700 capitalize">
                    {project.project_type_detail || project.type.replace('-', ' ')}
                  </p>
                </div>

                {project.developer && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Developer</h3>
                    {developerSlug ? (
                      <Link
                        href={`/developers/${developerSlug}`}
                        className="text-[#c99700] hover:text-[#a67800] hover:underline font-medium"
                      >
                        {project.developer} →
                      </Link>
                    ) : (
                      <p className="text-gray-700">{project.developer}</p>
                    )}
                  </div>
                )}

                {project.project_status && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
                    {statusInfo && (
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    )}
                  </div>
                )}

                {project.possession_date && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Possession</h3>
                    <p className="text-gray-700">
                      {new Date(project.possession_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}

                {project.rera_number && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">RERA Number</h3>
                    <p className="text-gray-700 font-mono text-sm">{project.rera_number}</p>
                  </div>
                )}

                {project.total_towers && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Towers</h3>
                    <p className="text-gray-700">{project.total_towers}</p>
                  </div>
                )}

                {project.total_units && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Total Units</h3>
                    <p className="text-gray-700">{project.total_units.toLocaleString('en-IN')}</p>
                  </div>
                )}

                {project.parking !== null && project.parking !== undefined && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Parking</h3>
                    <p className="text-gray-700">{project.parking} {project.parking === 1 ? 'space' : 'spaces'}</p>
                  </div>
                )}

                {project.facing && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Facing</h3>
                    <p className="text-gray-700">{project.facing}</p>
                  </div>
                )}
              </div>

              {/* Full Description */}
              {(project.full_description || project.description) && (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    About {project.name}
                  </h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {project.full_description || project.description}
                  </p>
                </div>
              )}

              {/* Project Highlights */}
              {project.project_highlights && project.project_highlights.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Project Highlights</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {project.project_highlights.map((highlight, index) => (
                      <div key={index} className="flex items-start">
                        <svg className="w-5 h-5 mr-3 mt-1 golden-text flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-gray-700">{highlight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities */}
              {project.amenities && project.amenities.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Amenities</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center bg-gray-50 p-4 rounded-lg">
                        <svg className="w-5 h-5 mr-3 golden-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-gray-700">{amenity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nearby Landmarks */}
              {project.nearby_landmarks && project.nearby_landmarks.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Nearby Landmarks</h2>
                  <div className="flex flex-wrap gap-3">
                    {project.nearby_landmarks.map((landmark, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-medium"
                      >
                        {landmark}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Connectivity */}
              {project.connectivity && (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Connectivity</h2>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">{project.connectivity}</p>
                  </div>
                </div>
              )}

              {/* Payment Plan */}
              {project.payment_plan && (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Payment Plan</h2>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{project.payment_plan}</p>
                  </div>
                </div>
              )}

              {/* Floor Plans & Documents */}
              {(project.floor_plan_url || project.brochure_url || project.video_url) && (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Documents & Media</h2>
                  <div className="flex flex-wrap gap-4">
                    {project.floor_plan_url && (
                      <a
                        href={project.floor_plan_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-[#c99700] text-white rounded-lg font-semibold hover:bg-[#a67800] transition"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Floor Plan
                      </a>
                    )}
                    {project.brochure_url && (
                      <a
                        href={project.brochure_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-[#c99700] text-white rounded-lg font-semibold hover:bg-[#a67800] transition"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Download Brochure
                      </a>
                    )}
                    {project.video_url && (
                      <a
                        href={project.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-[#c99700] text-white rounded-lg font-semibold hover:bg-[#a67800] transition"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Watch Video
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
                <Link
                  href="/contact"
                  className="bg-[#22c55e] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#16a34a] transition"
                >
                  Book a Consultation
                </Link>
                <Link
                  href={`/${project.type}`}
                  className="border-2 border-[#c99700] text-[#c99700] px-8 py-3 rounded-lg font-semibold hover:bg-[#fff5d6] transition"
                >
                  View All {project.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Link>
                {developerSlug && (
                  <Link
                    href={`/developers/${developerSlug}`}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    View Developer
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

