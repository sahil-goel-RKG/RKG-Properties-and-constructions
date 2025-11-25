import ProjectCard from '@/components/ProjectCard'
import ResidentialFilters from '@/components/ResidentialFilters'
import Pagination from '@/components/Pagination'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { cache } from 'react'
import Link from 'next/link'

// Add revalidation for ISR
export const revalidate = 1800 // Revalidate every 30 minutes

// Cache filter options for faster loads
const getUniqueLocations = cache(async () => {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('projects')
      .select('location')
      .in('type', ['builder-floor', 'builder floor', 'builder_floor'])
      .not('location', 'is', null)

    if (error) {
      console.error('Error fetching builder floor locations:', error)
      return []
    }

    const uniqueLocations = [...new Set(data.map((item) => item.location).filter(Boolean))]
    return uniqueLocations.sort()
  } catch (error) {
    console.error('Error fetching builder floor locations:', error)
    return []
  }
})

const getUniqueDevelopers = cache(async () => {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('projects')
      .select('developer')
      .in('type', ['builder-floor', 'builder floor', 'builder_floor'])
      .not('developer', 'is', null)

    if (error) {
      console.error('Error fetching builder floor developers:', error)
      return []
    }

    const uniqueDevelopers = [...new Set(data.map((item) => item.developer).filter(Boolean))]
    return uniqueDevelopers.sort()
  } catch (error) {
    console.error('Error fetching builder floor developers:', error)
    return []
  }
})

const getUniqueAreas = cache(async () => {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('projects')
      .select('area')
      .in('type', ['builder-floor', 'builder floor', 'builder_floor'])
      .not('area', 'is', null)

    if (error) {
      console.error('Error fetching builder floor areas:', error)
      return []
    }

    const uniqueAreas = [...new Set(data.map((item) => item.area).filter(Boolean))]
    return uniqueAreas.sort()
  } catch (error) {
    console.error('Error fetching builder floor areas:', error)
    return []
  }
})

const ITEMS_PER_PAGE = 12

async function getBuilderFloorProjectsCount(location = null, developer = null, area = null) {
  try {
    const supabase = createServerSupabaseClient()
    let query = supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .in('type', ['builder-floor', 'builder floor', 'builder_floor'])

    if (location) {
      query = query.ilike('location', `%${location}%`)
    }

    if (developer) {
      query = query.ilike('developer', `%${developer}%`)
    }

    if (area) {
      query = query.ilike('area', `%${area}%`)
    }

    const { count, error } = await query

    if (error) {
      console.error('Error fetching builder floor projects count:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Error fetching builder floor projects count:', error)
    return 0
  }
}

async function getBuilderFloorProjects(location = null, developer = null, area = null, page = 1, limit = ITEMS_PER_PAGE) {
  try {
    const supabase = createServerSupabaseClient()
    const offset = (page - 1) * limit
    
    let query = supabase
      .from('projects')
      .select('id, name, slug, location, developer, area, price, image_url, type, short_description, bhk_config, project_status, is_featured')
      .in('type', ['builder-floor', 'builder floor', 'builder_floor'])

    if (location) {
      query = query.ilike('location', `%${location}%`)
    }

    if (developer) {
      query = query.ilike('developer', `%${developer}%`)
    }

    if (area) {
      query = query.ilike('area', `%${area}%`)
    }

    query = query
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      console.error('Error fetching builder floor projects:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching builder floor projects:', error)
    return []
  }
}

export const metadata = {
  title: 'Builder Floor Projects | RKG Properties and Constructions',
  description: 'Browse our curated builder floor listings across Gurgaon',
}

export default async function BuilderFloorPage({ searchParams }) {
  const params = await searchParams
  const locationFilter = params?.location || null
  const developerFilter = params?.developer || null
  const areaFilter = params?.area || null
  const currentPage = Math.max(1, parseInt(params?.page || '1', 10))

  // Fetch all data in parallel for faster loading
  const [projects, totalCount, locations, developers, areas] = await Promise.all([
    getBuilderFloorProjects(locationFilter, developerFilter, areaFilter, currentPage, ITEMS_PER_PAGE),
    getBuilderFloorProjectsCount(locationFilter, developerFilter, areaFilter),
    getUniqueLocations(),
    getUniqueDevelopers(),
    getUniqueAreas()
  ])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  const filterText = []
  if (locationFilter) filterText.push(`location: ${locationFilter}`)
  if (developerFilter) filterText.push(`developer: ${developerFilter}`)
  if (areaFilter) filterText.push(`area: ${areaFilter}`)
  const hasFilters = filterText.length > 0

  const getClearFilterUrl = (filterToClear) => {
    const newParams = new URLSearchParams()
    if (filterToClear !== 'location' && locationFilter) {
      newParams.set('location', locationFilter)
    }
    if (filterToClear !== 'developer' && developerFilter) {
      newParams.set('developer', developerFilter)
    }
    if (filterToClear !== 'area' && areaFilter) {
      newParams.set('area', areaFilter)
    }
    // Reset to page 1 when clearing filters
    const queryString = newParams.toString()
    return queryString ? `/builder-floor?${queryString}` : '/builder-floor'
  }

  // Build base URL for pagination (preserves filters)
  const getBaseUrl = () => {
    const newParams = new URLSearchParams()
    if (locationFilter) {
      newParams.set('location', locationFilter)
    }
    if (developerFilter) {
      newParams.set('developer', developerFilter)
    }
    if (areaFilter) {
      newParams.set('area', areaFilter)
    }
    const queryString = newParams.toString()
    return queryString ? `/builder-floor?${queryString}` : '/builder-floor'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Builder Floor Projects</h1>
          <p className="text-xl text-gray-600">
            Discover boutique builder floor residences crafted for premium living
          </p>
        </div>

        <ResidentialFilters locations={locations} developers={developers} areas={areas} />

        {hasFilters && (
          <div className="mb-6 bg-[#fff5d6] border border-[#f2cd6d] rounded-lg p-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Active Filters:</span>
              {locationFilter && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#c99700] text-white rounded-full text-sm">
                  Location: {locationFilter}
                  <Link
                    href={getClearFilterUrl('location')}
                    className="hover:text-[#fff5d6]"
                    title="Remove filter"
                  >
                    ×
                  </Link>
                </span>
              )}
              {developerFilter && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#c99700] text-white rounded-full text-sm">
                  Developer: {developerFilter}
                  <Link
                    href={getClearFilterUrl('developer')}
                    className="hover:text-[#fff5d6]"
                    title="Remove filter"
                  >
                    ×
                  </Link>
                </span>
              )}
              {areaFilter && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#c99700] text-white rounded-full text-sm">
                  Area: {areaFilter}
                  <Link
                    href={getClearFilterUrl('area')}
                    className="hover:text-[#fff5d6]"
                    title="Remove filter"
                  >
                    ×
                  </Link>
                </span>
              )}
            </div>
          </div>
        )}

        {projects.length > 0 ? (
          <>
            <div className="mb-6 text-gray-600">
              <p>
                {totalCount} {totalCount === 1 ? 'builder floor' : 'builder floors'} found
                {hasFilters && ` (${filterText.join(', ')})`}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl={getBaseUrl()}
              totalItems={totalCount}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            {hasFilters ? (
              <>
                <p className="text-gray-600 mb-4">
                  No builder floor listings found {hasFilters && `with ${filterText.join(' and ')}`}.
                </p>
                <Link
                  href="/builder-floor"
                  className="inline-block golden-text hover:text-[#a67800] hover:underline"
                >
                  View all builder floor projects
                </Link>
              </>
            ) : (
              <p className="text-gray-600 mb-4">
                No builder floor listings found. Please add builder floor projects to your Supabase database.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
