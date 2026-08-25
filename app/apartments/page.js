import ProjectCard from '@/components/ui/ProjectCard'
import ResidentialFilters from '@/components/features/ResidentialFilters'
import Pagination from '@/components/ui/Pagination'
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
      .eq('type', 'apartment')
      .not('location', 'is', null)

    if (error) {
      console.error('Error fetching locations:', error)
      return []
    }

    const uniqueLocations = [...new Set(data.map(item => item.location).filter(Boolean))]
    return uniqueLocations.sort()
  } catch (error) {
    console.error('Error fetching locations:', error)
    return []
  }
})

const getUniqueDevelopers = cache(async () => {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('projects')
      .select('developer')
      .eq('type', 'apartment')
      .not('developer', 'is', null)

    if (error) {
      console.error('Error fetching developers:', error)
      return []
    }

    const uniqueDevelopers = [...new Set(data.map(item => item.developer).filter(Boolean))]
    return uniqueDevelopers.sort()
  } catch (error) {
    console.error('Error fetching developers:', error)
    return []
  }
})

const getUniqueAreas = cache(async () => {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('projects')
      .select('area')
      .eq('type', 'apartment')
      .not('area', 'is', null)

    if (error) {
      console.error('Error fetching areas:', error)
      return []
    }

    const uniqueAreas = [...new Set(data.map(item => item.area).filter(Boolean))]
    return uniqueAreas.sort()
  } catch (error) {
    console.error('Error fetching areas:', error)
    return []
  }
})

const ITEMS_PER_PAGE = 12

async function getResidentialProjectsCount(location = null, developer = null, area = null) {
  try {
    const supabase = createServerSupabaseClient()
    let query = supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('type', 'apartment')

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
      console.error('Error fetching projects count:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Error fetching projects count:', error)
    return 0
  }
}

async function getResidentialProjects(location = null, developer = null, area = null, page = 1, limit = ITEMS_PER_PAGE) {
  try {
    const supabase = createServerSupabaseClient()
    const offset = (page - 1) * limit
    
    let query = supabase
      .from('projects')
      .select('id, name, slug, location, developer, area, price, image_url, type, short_description, bhk_config, project_status, is_featured')
      .eq('type', 'apartment')

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
      console.error('Error fetching projects:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching projects:', error)
    return []
  }
}

export const metadata = {
  title: 'Apartments | RKG Properties and Constructions',
  description: 'Browse our premium apartment projects in Gurgaon',
}

export default async function ResidentialPage({ searchParams }) {
  // In Next.js 15+, searchParams is a Promise
  const params = await searchParams
  const locationFilter = params?.location || null
  const developerFilter = params?.developer || null
  const areaFilter = params?.area || null
  const currentPage = Math.max(1, parseInt(params?.page || '1', 10))

  // Fetch all data in parallel for faster loading
  const [projects, totalCount, locations, developers, areas] = await Promise.all([
    getResidentialProjects(locationFilter, developerFilter, areaFilter, currentPage, ITEMS_PER_PAGE),
    getResidentialProjectsCount(locationFilter, developerFilter, areaFilter),
    getUniqueLocations(),
    getUniqueDevelopers(),
    getUniqueAreas()
  ])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  // Build filter description text
  const filterText = []
  if (locationFilter) filterText.push(`location: ${locationFilter}`)
  if (developerFilter) filterText.push(`developer: ${developerFilter}`)
  if (areaFilter) filterText.push(`area: ${areaFilter}`)
  const hasFilters = filterText.length > 0

  // Build clear filter URL (preserve the other filter if one is cleared)
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
    return queryString ? `/apartments?${queryString}` : '/apartments'
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
    return queryString ? `/apartments?${queryString}` : '/apartments'
  }

  return (
    <div className="page-shell py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-serif-display text-[#f5f5f5] mb-4">Apartments</h1>
          <p className="text-xl text-[#a3a3a3]">
            Discover premium apartment properties in Gurgaon
          </p>
        </div>

        <ResidentialFilters locations={locations} developers={developers} areas={areas} />

        {/* Active Filters Display */}
        {hasFilters && (
          <div className="mb-6 alert-success">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-[#a3a3a3]">Active Filters:</span>
              {locationFilter && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#c9a227] text-[#0a0a0a] rounded-full text-sm font-semibold">
                  Location: {locationFilter}
                  <Link
                    href={getClearFilterUrl('location')}
                    className="hover:text-[#f5f5f5]"
                    title="Remove filter"
                  >
                    ×
                  </Link>
                </span>
              )}
              {developerFilter && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#c9a227] text-[#0a0a0a] rounded-full text-sm font-semibold">
                  Developer: {developerFilter}
                  <Link
                    href={getClearFilterUrl('developer')}
                    className="hover:text-[#f5f5f5]"
                    title="Remove filter"
                  >
                    ×
                  </Link>
                </span>
              )}
              {areaFilter && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#c9a227] text-[#0a0a0a] rounded-full text-sm font-semibold">
                  Area: {areaFilter}
                  <Link
                    href={getClearFilterUrl('area')}
                    className="hover:text-[#f5f5f5]"
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
            <div className="mb-6 text-[#a3a3a3]">
              <p>
                {totalCount} {totalCount === 1 ? 'property' : 'properties'} found
                {hasFilters && ` (${filterText.join(', ')})`}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                variant="apartment"   // 👈 important
              />
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
          <div className="text-center py-12 card-luxury rounded-lg">
            {hasFilters ? (
              <>
                <p className="text-[#a3a3a3] mb-4">
                  No apartment projects found {hasFilters && `with ${filterText.join(' and ')}`}.
                </p>
                <Link
                  href="/apartments"
                  className="golden-text hover:underline"
                >
                  View all apartment projects
                </Link>
              </>
            ) : (
              <p className="text-[#a3a3a3] mb-4">
                No apartment projects found. Please add projects to your Supabase database.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
