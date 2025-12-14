import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import ProjectCard from '@/components/ui/ProjectCard'
import ResidentialFilters from '@/components/features/ResidentialFilters'
import { developerNameToSlug, getDeveloperLogo } from '@/lib/developerUtils'
import Image from 'next/image'

async function getAllDevelopers() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('developer')
      .not('developer', 'is', null)

    if (error) {
      console.error('Error fetching developers:', error)
      return []
    }

    const uniqueDevelopers = [...new Set(data.map(item => item.developer).filter(Boolean))]
    return uniqueDevelopers
  } catch (error) {
    console.error('Error fetching developers:', error)
    return []
  }
}

async function findDeveloperBySlug(slug) {
  const developers = await getAllDevelopers()
  
  for (const developer of developers) {
    if (developerNameToSlug(developer) === slug) {
      return developer
    }
  }
  
  return null
}

async function getUniqueLocations(developerName) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('location')
      .ilike('developer', developerName)
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
}

async function getUniqueAreas(developerName) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('area')
      .ilike('developer', developerName)
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
}

async function getDeveloperProjects(developerName, location = null, area = null, type = null) {
  try {
    let query = supabase
      .from('projects')
      .select('*')
      .ilike('developer', developerName)

    if (location) {
      query = query.ilike('location', `%${location}%`)
    }

    if (area) {
      query = query.ilike('area', `%${area}%`)
    }

    if (type) {
      query = query.eq('type', type)
    }

    query = query.order('created_at', { ascending: false })

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

export async function generateMetadata({ params }) {
  const { slug } = await params
  const developerName = await findDeveloperBySlug(slug)

  if (!developerName) {
    return {
      title: 'Developer Not Found | RKG Properties and Constructions',
    }
  }

  return {
    title: `${developerName} Properties | RKG Properties and Constructions`,
    description: `Browse all properties by ${developerName}. Find residential and builder floor projects.`,
  }
}

export default async function DeveloperPropertiesPage({ params, searchParams }) {
  const { slug } = await params
  const paramsObj = await searchParams
  const developerName = await findDeveloperBySlug(slug)

  if (!developerName) {
    notFound()
  }

  const locationFilter = paramsObj?.location || null
  const areaFilter = paramsObj?.area || null
  const typeFilter = paramsObj?.type || null

  const projects = await getDeveloperProjects(developerName, locationFilter, areaFilter, typeFilter)
  const locations = await getUniqueLocations(developerName)
  const areas = await getUniqueAreas(developerName)
  const logo = getDeveloperLogo(developerName)

  // Build filter description text
  const filterText = []
  if (locationFilter) filterText.push(`location: ${locationFilter}`)
  if (areaFilter) filterText.push(`area: ${areaFilter}`)
  if (typeFilter) filterText.push(`type: ${typeFilter}`)
  const hasFilters = filterText.length > 0

  // Build clear filter URL
  const getClearFilterUrl = (filterToClear) => {
    const newParams = new URLSearchParams()
    if (filterToClear !== 'location' && locationFilter) {
      newParams.set('location', locationFilter)
    }
    if (filterToClear !== 'area' && areaFilter) {
      newParams.set('area', areaFilter)
    }
    if (filterToClear !== 'type' && typeFilter) {
      newParams.set('type', typeFilter)
    }
    const queryString = newParams.toString()
    return queryString ? `/developers/${slug}/properties?${queryString}` : `/developers/${slug}/properties`
  }

  // Get unique types for this developer
  const uniqueTypes = [...new Set(projects.map(p => p.type).filter(Boolean))]

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        {/* Developer Header */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {logo && (
              <div className="relative w-24 h-24 bg-gray-100 rounded-lg p-3 flex-shrink-0">
                <Image
                  src={logo}
                  alt={developerName}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div className="flex-1 text-center md:text-left">
              <nav className="mb-4 text-sm text-gray-600">
                <Link href="/" className="hover:text-[#c99700]">
                  Home
                </Link>
                {' / '}
                <Link href={`/developers/${slug}`} className="hover:text-[#c99700]">
                  Developers
                </Link>
                {' / '}
                <span className="text-gray-900">Properties</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {developerName} Properties
              </h1>
              <p className="text-gray-600">
                Browse all properties by {developerName}
              </p>
            </div>
            <Link
              href={`/developers/${slug}`}
              className="text-[#c99700] hover:text-[#a67800] font-medium hover:underline"
            >
              ← Back to Developer
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <ResidentialFilters 
            locations={locations} 
            developers={[]} 
            areas={areas}
            showDeveloperFilter={false}
            showTypeFilter={uniqueTypes.length > 1}
            types={uniqueTypes}
            basePath={`/developers/${slug}/properties`}
          />
        </div>

        {/* Active Filters Display */}
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
              {typeFilter && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#c99700] text-white rounded-full text-sm">
                  Type: {typeFilter}
                  <Link
                    href={getClearFilterUrl('type')}
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
                {projects.length} {projects.length === 1 ? 'property' : 'properties'} found
                {hasFilters && ` (${filterText.join(', ')})`}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            {hasFilters ? (
              <>
                <p className="text-gray-600 mb-4">
                  No properties found {hasFilters && `with ${filterText.join(' and ')}`}.
                </p>
                <Link
                  href={`/developers/${slug}/properties`}
                  className="inline-block golden-text hover:text-[#a67800] hover:underline"
                >
                  View all {developerName} properties
                </Link>
              </>
            ) : (
              <p className="text-gray-600 mb-4">
                No properties found for {developerName}. Please check back later.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

