import ProjectCard from '@/components/ui/ProjectCard'
import ResidentialFilters from '@/components/features/ResidentialFilters'
import Pagination from '@/components/ui/Pagination'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { cache } from 'react'
import Link from 'next/link'
import BuilderFloorContent from './BuilderFloorContent'

// Add revalidation for ISR
export const revalidate = 1800 // Revalidate every 30 minutes

// Cache filter options for faster loads
const getUniqueLocations = cache(async () => {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('builder_floors')
      .select('location')
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

// We don’t have a developer column in builder_floors, so we skip developers
const getUniqueAreas = cache(async () => {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('builder_floors')
      .select('plot_size')
      .not('plot_size', 'is', null)

    if (error) {
      console.error('Error fetching builder floor areas:', error)
      return []
    }

    const uniqueAreas = [...new Set(data.map((item) => item.plot_size).filter(Boolean))]
    return uniqueAreas.sort()
  } catch (error) {
    console.error('Error fetching builder floor areas:', error)
    return []
  }
})

const ITEMS_PER_PAGE = 12

async function getBuilderFloorProjectsCount(location = null, area = null) {
  try {
    const supabase = createServerSupabaseClient()
    let query = supabase
      .from('builder_floors')
      .select('id', { count: 'exact', head: true })

    if (location) {
      query = query.ilike('location', `%${location}%`)
    }

    if (area) {
      query = query.ilike('plot_size', `%${area}%`)
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

async function getBuilderFloorProjects(location = null, area = null, page = 1, limit = ITEMS_PER_PAGE) {
  try {
    const supabase = createServerSupabaseClient()
    const offset = (page - 1) * limit

    let query = supabase
      .from('builder_floors')
      .select(
        `
        id,
        name,
        slug,
        location,
        plot_size,
        price_top,
        price_mid1,
        price_mid2,
        price_ug,
        building_config,
        status,
        condition,
        category,
        possession_date,
        has_basement,
        is_triplex,
        is_gated,
        roof_rights,
        owner_name,
        comments,
        short_description,
        full_description,
        image_url,
        brochure_url,
        created_at
      `
      )

    if (location) {
      query = query.ilike('location', `%${location}%`)
    }

    if (area) {
      query = query.ilike('plot_size', `%${area}%`)
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      console.error('Error fetching builder floor projects:', error)
      return []
    }

    // Map builder_floors rows into "project-like" objects for ProjectCard
    return (data || []).map((item) => {
      // Parse building_config if it exists
      let buildingConfig = null
      if (item.building_config) {
        try {
          buildingConfig = typeof item.building_config === 'string' 
            ? JSON.parse(item.building_config) 
            : item.building_config
          if (!Array.isArray(buildingConfig)) {
            buildingConfig = null
          }
        } catch (e) {
          console.error('Error parsing building_config:', e)
          buildingConfig = null
        }
      }

      // Calculate lowest price from all buildings and all floor types
      let lowestPrice = null
      if (buildingConfig && buildingConfig.length > 0) {
        const allPrices = []
        buildingConfig.forEach((building) => {
          if (building.price_ug) allPrices.push(Number(building.price_ug))
          if (building.price_mid1) allPrices.push(Number(building.price_mid1))
          if (building.price_mid2) allPrices.push(Number(building.price_mid2))
          if (building.price_top) allPrices.push(Number(building.price_top))
        })
        if (allPrices.length > 0) {
          lowestPrice = Math.min(...allPrices)
        }
      } else {
        // Fallback to legacy individual fields
        const legacyPrices = []
        if (item.price_ug) legacyPrices.push(Number(item.price_ug))
        if (item.price_mid1) legacyPrices.push(Number(item.price_mid1))
        if (item.price_mid2) legacyPrices.push(Number(item.price_mid2))
        if (item.price_top) legacyPrices.push(Number(item.price_top))
        if (legacyPrices.length > 0) {
          lowestPrice = Math.min(...legacyPrices)
        }
      }

      // Calculate area range from all buildings
      let areaRange = null
      if (buildingConfig && buildingConfig.length > 0) {
        const allAreas = []
        buildingConfig.forEach((building) => {
          if (building.plot_size) {
            // Extract numeric value from plot_size (e.g., "263 sqyd" -> 263)
            const match = building.plot_size.toString().match(/([\d.]+)/)
            if (match) {
              allAreas.push(parseFloat(match[1]))
            }
          }
        })
        if (allAreas.length > 0) {
          const minArea = Math.min(...allAreas)
          const maxArea = Math.max(...allAreas)
          if (minArea === maxArea) {
            areaRange = `${minArea} sqyd`
          } else {
            areaRange = `${minArea}-${maxArea} sqyd`
          }
        }
      }
      
      // Fallback to single plot_size if no building_config
      if (!areaRange && item.plot_size) {
        areaRange = item.plot_size
      }

      return {
        id: item.id,
        name: item.name,
        slug: item.slug,
        location: item.location,
        developer: null, // no developer column in builder_floors
        area: areaRange, // show area range as "lowest-highest sqyd"
        price: lowestPrice,
        image_url: item.image_url,
        type: 'builder-floor',
        short_description: item.short_description || item.comments || '',
        bhk_config: null,
        project_status: item.status || null,
        is_featured: false
      }
    })
  } catch (error) {
    console.error('Error fetching builder floor projects:', error)
    return []
  }
}

export const metadata = {
  title: 'Builder Floor Projects | RKG Properties and Constructions',
  description: 'Browse our curated builder floor listings across Gurgaon'
}

export default async function BuilderFloorPage({ searchParams }) {
  const params = await searchParams
  const locationFilter = params?.location || null
  const areaFilter = params?.area || null
  const currentPage = Math.max(1, parseInt(params?.page || '1', 10))

  // Fetch all data in parallel for faster loading
  const [projects, totalCount, locations, areas] = await Promise.all([
    getBuilderFloorProjects(locationFilter, areaFilter, currentPage, ITEMS_PER_PAGE),
    getBuilderFloorProjectsCount(locationFilter, areaFilter),
    getUniqueLocations(),
    getUniqueAreas()
  ])

  const developers = [] // no developers in builder_floors table
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  const filterText = []
  if (locationFilter) filterText.push(`location: ${locationFilter}`)
  if (areaFilter) filterText.push(`area: ${areaFilter}`)
  const hasFilters = filterText.length > 0

  const getClearFilterUrl = (filterToClear) => {
    const newParams = new URLSearchParams()
    if (filterToClear !== 'location' && locationFilter) {
      newParams.set('location', locationFilter)
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
    if (areaFilter) {
      newParams.set('area', areaFilter)
    }
    const queryString = newParams.toString()
    return queryString ? `/builder-floor?${queryString}` : '/builder-floor'
  }

  return (
    <BuilderFloorContent>
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Builder Floor Projects</h1>
            <p className="text-xl text-gray-600">
              Discover boutique builder floor residences crafted for premium living
            </p>
          </div>

          {/* Filter Row */}
          <div className="flex items-center justify-end gap-4 mb-6">
            {/* We pass developers = [] because builder_floors has no developer column */}
            <ResidentialFilters 
              locations={locations} 
              developers={developers} 
              areas={areas}
              buttonWrapperClassName="!mb-0"
            />
          </div>

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
                <ProjectCard
                  key={project.id}
                  project={project}
                  variant="builder-floor"
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
    </BuilderFloorContent>
  )
}
