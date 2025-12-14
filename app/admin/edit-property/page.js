'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { formatPriceLabel } from '@/lib/formatPrice'

export default function EditPropertyPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [developerFilter, setDeveloperFilter] = useState('all')
  const [areaFilter, setAreaFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [filtersOpen, setFiltersOpen] = useState(false)
  
  // Options for filters
  const [locations, setLocations] = useState([])
  const [developers, setDevelopers] = useState([])
  const [areas, setAreas] = useState([])
  

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/admin/login')
      return
    }

    if (user) {
      fetchProjects()
      fetchFilterOptions()
    }
  }, [user, isLoaded, router])

  
  const fetchProjects = async () => {
    try {
      setLoading(true)
  
      // Fetch Apartments
      const { data: apartments, error: aptError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
  
      if (aptError) throw aptError
  
      // Fetch Builder Floors
      const { data: builderFloors, error: bfError } = await supabase
        .from('builder_floors')
        .select('*')
        .order('created_at', { ascending: false })
  
      if (bfError) throw bfError
  
      // Normalize Builder Floor fields to match Apartment format
      const formattedBF = builderFloors.map(bf => {
        // Calculate lowest price from building_config or legacy fields
        let lowestPrice = null
        
        // Check if building_config exists
        let buildingConfig = null
        if (bf.building_config) {
          try {
            buildingConfig = typeof bf.building_config === 'string' 
              ? JSON.parse(bf.building_config) 
              : bf.building_config
            if (!Array.isArray(buildingConfig)) {
              buildingConfig = null
            }
          } catch (e) {
            console.error('Error parsing building_config:', e)
            buildingConfig = null
          }
        }
        
        if (buildingConfig && buildingConfig.length > 0) {
          // Collect all prices from all buildings and all floor types
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
          if (bf.price_ug) legacyPrices.push(Number(bf.price_ug))
          if (bf.price_mid1) legacyPrices.push(Number(bf.price_mid1))
          if (bf.price_mid2) legacyPrices.push(Number(bf.price_mid2))
          if (bf.price_top) legacyPrices.push(Number(bf.price_top))
          
          if (legacyPrices.length > 0) {
            lowestPrice = Math.min(...legacyPrices)
          }
        }
        
        return {
          ...bf,
          project_status: bf.status || null,
          area: bf.plot_size || null,
          price: lowestPrice,
          developer: bf.developer || null,
          type: "builder-floor"
        }
      })
  
      setProjects([ ...apartments, ...formattedBF ])
      
    } catch (err) {
      console.error('Error fetching projects:', err)
      setError('Failed to fetch properties')
    } finally {
      setLoading(false)
    }
  }
  


  const fetchFilterOptions = async () => {
    try {
      // Fetch unique locations
      const { data: locationData, error: locationError } = await supabase
        .from('projects')
        .select('location')
        .not('location', 'is', null)
        .neq('location', '')

      if (!locationError && locationData) {
        const uniqueLocations = [...new Set(locationData.map(item => item.location).filter(Boolean))]
        setLocations(uniqueLocations.sort())
      }

      // Fetch unique developers
      const { data: developerData, error: developerError } = await supabase
        .from('projects')
        .select('developer')
        .not('developer', 'is', null)
        .neq('developer', '')

      if (!developerError && developerData) {
        const uniqueDevelopers = [...new Set(developerData.map(item => item.developer).filter(Boolean))]
        setDevelopers(uniqueDevelopers.sort())
      }

      // Fetch unique areas
      const { data: areaData, error: areaError } = await supabase
        .from('projects')
        .select('area')
        .not('area', 'is', null)
        .neq('area', '')

      if (!areaError && areaData) {
        const uniqueAreas = [...new Set(areaData.map(item => item.area).filter(Boolean))]
        setAreas(uniqueAreas.sort())
      }
    } catch (err) {
      console.error('Error fetching filter options:', err)
    }
  }

  // Filter and search projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          project.name?.toLowerCase().includes(query) ||
          project.location?.toLowerCase().includes(query) ||
          project.developer?.toLowerCase().includes(query) ||
          project.description?.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Type filter
      if (typeFilter !== 'all') {
        if (typeFilter === 'builder-floor') {
          if (!['builder-floor', 'builder floor', 'builder_floor'].includes(project.type)) {
            return false
          }
        } else if (typeFilter === 'apartment') {
          // Handle both 'apartment' and legacy 'residential' types
          if (project.type !== 'apartment' && project.type !== 'residential') {
            return false
          }
        } else if (project.type !== typeFilter) {
          return false
        }
      }

      // Location filter
      if (locationFilter !== 'all' && project.location !== locationFilter) {
        return false
      }

      // Developer filter
      if (developerFilter !== 'all' && project.developer !== developerFilter) {
        return false
      }

      // Area filter
      if (areaFilter !== 'all' && project.area !== areaFilter) {
        return false
      }

      // Status filter
      if (statusFilter !== 'all' && project.project_status !== statusFilter) {
        return false
      }

      return true
    })
  }, [projects, searchQuery, typeFilter, locationFilter, developerFilter, areaFilter, statusFilter])


  const handleDelete = async (project) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }
  
    try {
      setSaving(true)
      setError('')
  
      // 👉 choose API based on type
      const url =
        project.type === 'builder-floor'
          ? '/api/builder-floors/delete'
          : '/api/projects/delete'
  
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: project.id }),
      })
  
      const data = await response.json()
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete project')
      }
  
      setSuccess('Project deleted successfully!')
      await fetchProjects()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error deleting project:', err)
      setError(err.message || 'Failed to delete project')
      setTimeout(() => setError(''), 5000)
    } finally {
      setSaving(false)
    }
  }
  

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c99700] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Properties</h1>
            <p className="text-gray-600 mt-1">Manage and update all properties</p>
          </div>
          <Link
            href="/admin"
            className="golden-text hover:text-[#a67800] hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4 items-start">
            {/* Search - Always visible */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, location, developer..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c99700] focus:border-transparent text-gray-900 bg-white"
              />
            </div>

            {/* Filters Toggle Button */}
            <div className="flex-shrink-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                &nbsp;
              </label>
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-[#c99700] focus:border-transparent flex items-center gap-2 text-gray-700 bg-white"
              >
                {/* Three horizontal lines icon */}
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>Filters</span>
                {/* Show count of active filters */}
                {(typeFilter !== 'all' || locationFilter !== 'all' || developerFilter !== 'all' || areaFilter !== 'all' || statusFilter !== 'all') && (
                  <span className="ml-1 px-2 py-0.5 bg-[#c99700] text-white text-xs rounded-full">
                    {[
                      typeFilter !== 'all' ? 1 : 0,
                      locationFilter !== 'all' ? 1 : 0,
                      developerFilter !== 'all' ? 1 : 0,
                      areaFilter !== 'all' ? 1 : 0,
                      statusFilter !== 'all' ? 1 : 0
                    ].reduce((a, b) => a + b, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Collapsible Filters Menu */}
          {filtersOpen && (
            <div className="mt-6 pt-6 border-t border-gray-200 animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c99700] focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="all">All Types</option>
                    <option value="apartment">Apartments</option>
                    <option value="builder-floor">Builder Floor</option>
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c99700] focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="all">All Locations</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Developer Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Developer
                  </label>
                  <select
                    value={developerFilter}
                    onChange={(e) => setDeveloperFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c99700] focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="all">All Developers</option>
                    {developers.map(dev => (
                      <option key={dev} value={dev}>{dev}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c99700] focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="under-construction">Under Construction</option>
                    <option value="ready-to-move">Ready to Move</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Area Filter - Full width */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area
                </label>
                <select
                  value={areaFilter}
                  onChange={(e) => setAreaFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c99700] focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="all">All Areas</option>
                  {/* Predefined area options from add-listing */}
                  <option value="500-1000 sqft">500-1000 sqft</option>
                  <option value="1000-1500 sqft">1000-1500 sqft</option>
                  <option value="1500-2000 sqft">1500-2000 sqft</option>
                  <option value="2000-2500 sqft">2000-2500 sqft</option>
                  <option value="2500-3000 sqft">2500-3000 sqft</option>
                  <option value="3000-3500 sqft">3000-3500 sqft</option>
                  <option value="3500-4000 sqft">3500-4000 sqft</option>
                  <option value="4000-5000 sqft">4000-5000 sqft</option>
                  <option value="5000-7000 sqft">5000-7000 sqft</option>
                  <option value="7000-10000 sqft">7000-10000 sqft</option>
                  <option value="10000+ sqft">10000+ sqft</option>
                  {/* Unique areas from database */}
                  {areas.filter(area => 
                    !['500-1000 sqft', '1000-1500 sqft', '1500-2000 sqft', '2000-2500 sqft', 
                      '2500-3000 sqft', '3000-3500 sqft', '3500-4000 sqft', '4000-5000 sqft',
                      '5000-7000 sqft', '7000-10000 sqft', '10000+ sqft'].includes(area)
                  ).map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setTypeFilter('all')
                    setLocationFilter('all')
                    setDeveloperFilter('all')
                    setAreaFilter('all')
                    setStatusFilter('all')
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">
              Properties ({filteredProjects.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c99700] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              <p>No projects found matching your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Developer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {project.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {project.location}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {project.developer}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                        {project.type?.replace('-', ' ')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {project.project_status ? (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            project.project_status === 'ready-to-move' ? 'bg-green-100 text-green-800' :
                            project.project_status === 'under-construction' ? 'bg-yellow-100 text-yellow-800' :
                            project.project_status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.project_status.replace('-', ' ')}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {project.price ? (() => {
                          const priceInfo = formatPriceLabel(project.price)
                          return priceInfo ? priceInfo.label : `₹${Number(project.price).toLocaleString('en-IN')} Cr`
                        })() : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          {(() => {
                            // Decide where to navigate for editing
                            const type = project.type

                            // Builder floor → dedicated builder floor edit page
                            const editHref =
                              type === 'builder-floor'
                                ? `/admin/edit-builder-floor/${project.id}`
                                : `/admin/edit-property/${project.id}` // Apartments (and other project types)

                            return (
                              <Link
                                href={editHref}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                              >
                                Edit
                              </Link>
                            )
                          })()}

                          <button
                            onClick={() => handleDelete(project)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

