import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { getDeveloperLogo, developerNameToSlug } from '@/lib/developerUtils'

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

async function getDeveloperByName(developerName) {
  try {
    // Get all projects by this developer
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .ilike('developer', developerName)
      .order('created_at', { ascending: false })

    if (error || !projects || projects.length === 0) {
      return null
    }

    // Get unique locations
    const locations = [...new Set(projects.map(p => p.location).filter(Boolean))]
    
    // Get unique project types
    const types = [...new Set(projects.map(p => p.type).filter(Boolean))]

    // Calculate stats
    const totalProjects = projects.length
    const residentialProjects = projects.filter(p => p.type === 'apartment').length
    const builderFloorProjects = projects.filter(p => p.type === 'builder-floor' || p.type === 'builder floor' || p.type === 'builder_floor').length

    return {
      name: developerName,
      projects,
      locations,
      types,
      stats: {
        totalProjects,
        residentialProjects,
        builderFloorProjects,
      }
    }
  } catch (error) {
    console.error('Error fetching developer:', error)
    return null
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

export async function generateMetadata({ params }) {
  const { slug } = await params
  const developerName = await findDeveloperBySlug(slug)

  if (!developerName) {
    return {
      title: 'Developer Not Found | RKG Properties and Constructions',
    }
  }

  return {
    title: `${developerName} | RKG Properties and Constructions`,
    description: `Explore premium properties by ${developerName}. Browse apartments and builder floor projects.`,
  }
}

export default async function DeveloperDetailPage({ params }) {
  const { slug } = await params
  const developerName = await findDeveloperBySlug(slug)

  if (!developerName) {
    notFound()
  }

  const developer = await getDeveloperByName(developerName)

  if (!developer) {
    notFound()
  }

  const logo = getDeveloperLogo(developerName)
  const propertiesUrl = `/developers/${slug}/properties`

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
            <span className="text-gray-900">Developers</span>
            {' / '}
            <span className="text-gray-900">{developerName}</span>
          </nav>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Developer Header */}
            <div className="bg-gradient-to-r from-blue-950 to-blue-900 p-8 text-white">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {logo && (
                  <div className="relative w-32 h-32 bg-white rounded-lg p-4 flex-shrink-0">
                    <Image
                      src={logo}
                      alt={developerName}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-4xl font-bold mb-4">{developerName}</h1>
                  <p className="text-lg text-gray-100 mb-6">
                    Transforming Visions into Iconic Spaces
                  </p>
                  <Link
                    href={propertiesUrl}
                    className="inline-block bg-white text-[#c99700] px-8 py-3 rounded-lg font-semibold hover:bg-[#fff5d6] transition"
                  >
                    View All Properties
                  </Link>
                </div>
              </div>
            </div>

            {/* Developer Stats */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <div className="text-4xl font-bold text-[#c99700] mb-2">
                    {developer.stats.totalProjects}
                  </div>
                  <div className="text-gray-700 font-medium">
                    Total Projects
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <div className="text-4xl font-bold text-[#c99700] mb-2">
                    {developer.stats.residentialProjects}
                  </div>
                  <div className="text-gray-700 font-medium">
                    Apartments
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <div className="text-4xl font-bold text-[#c99700] mb-2">
                    {developer.stats.builderFloorProjects}
                  </div>
                  <div className="text-gray-700 font-medium">
                    Builder Floor Projects
                  </div>
                </div>
              </div>

              {/* Locations */}
              {developer.locations.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Locations
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {developer.locations.map((location) => (
                      <span
                        key={location}
                        className="inline-block bg-[#fff5d6] text-gray-800 px-4 py-2 rounded-full text-sm font-medium"
                      >
                        {location}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Featured Projects Preview */}
              {developer.projects.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Featured Projects
                    </h2>
                    <Link
                      href={propertiesUrl}
                      className="text-[#c99700] hover:text-[#a67800] font-medium hover:underline"
                    >
                      View All →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {developer.projects.slice(0, 3).map((project) => (
                      <Link
                        key={project.id}
                        href={`/projects/${project.slug}`}
                        className="block bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition"
                      >
                        {project.image_url && (
                          <div className="relative h-48 bg-gray-200">
                            <Image
                              src={project.image_url}
                              alt={project.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                            {project.name}
                          </h3>
                          <p className="text-sm text-gray-600">{project.location}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* About Developer */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  About {developerName}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {developerName} is a renowned real estate developer with a strong presence in the market. 
                  With {developer.stats.totalProjects} projects across {developer.locations.length} locations, 
                  they have established themselves as a trusted name in the industry. Their portfolio includes 
                  premium apartment projects and builder floor developments, each designed with attention to 
                  detail and quality craftsmanship.
                </p>
              </div>

              {/* CTA Section */}
              <div className="mt-8 text-center">
                <Link
                  href={propertiesUrl}
                  className="inline-block bg-[#c99700] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#a67800] transition mr-4"
                >
                  Browse All Properties
                </Link>
                <Link
                  href="/contact"
                  className="inline-block border-2 border-[#c99700] text-[#c99700] px-8 py-3 rounded-lg font-semibold hover:bg-[#fff5d6] transition"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

