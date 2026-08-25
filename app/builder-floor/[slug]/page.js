import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { cache, Suspense } from 'react'
import Link from 'next/link'
import ProjectImageGallery from '@/components/ProjectImageGallery'
import BuildingConfigurationSlider from '@/components/BuildingConfigurationSlider'
import { formatPriceLabel } from '@/lib/formatPrice'
import BuilderFloorDetailContent from './BuilderFloorDetailContent'

// ISR: cache detail page to reduce TTFB; regenerate every 1 hour
export const revalidate = 3600

// Pre-render known builder floor slugs at build time for fast TTFB
export async function generateStaticParams() {
  try {
    const supabase = createServerSupabaseClient()
    const { data } = await supabase.from('builder_floors').select('slug').not('slug', 'is', null)
    if (!data?.length) return []
    return data.map(({ slug }) => ({ slug }))
  } catch {
    return []
  }
}

// Fetch a single builder floor by slug
const getBuilderFloor = cache(async (slug) => {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('builder_floors')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      console.error('Error fetching builder floor:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('Error fetching builder floor:', err)
    return null
  }
})

export async function generateMetadata({ params }) {
  const { slug } = await params
  const floor = await getBuilderFloor(slug)

  if (!floor) {
    return {
      title: 'Builder Floor Not Found | RKG Properties and Constructions',
    }
  }

  return {
    title: `${floor.name} | Builder Floor | RKG Properties and Constructions`,
    description:
      floor.short_description ||
      floor.comments ||
      `Explore builder floor ${floor.name} located in ${floor.location}`,
  }
}

export default async function BuilderFloorDetailPage({ params }) {
  const { slug } = await params
  const floor = await getBuilderFloor(slug)

  if (!floor) {
    notFound()
  }

  // ---------- IMAGES: COVER + GALLERY ----------
  const galleryImages = Array.isArray(floor.gallery_images)
    ? floor.gallery_images.filter(Boolean)
    : []

  const allImages = floor.image_url
    ? [floor.image_url, ...galleryImages]
    : galleryImages

  // ---------- BUILDING CONFIG ----------
  let buildingConfig = null
  if (floor.building_config) {
    try {
      buildingConfig = typeof floor.building_config === 'string' 
        ? JSON.parse(floor.building_config) 
        : floor.building_config
      if (!Array.isArray(buildingConfig)) {
        buildingConfig = null
      }
    } catch (e) {
      console.error('Error parsing building_config:', e)
      buildingConfig = null
    }
  }

  // ---------- PRICING: Find lowest price across all buildings and all floors ----------
  let fallbackPrice = null
  if (buildingConfig && buildingConfig.length > 0) {
    // Collect all prices from all buildings and all floor types
    const allPrices = []
    buildingConfig.forEach((building) => {
      // Add all price fields from this building (filter out null/undefined)
      if (building.price_ug) allPrices.push(Number(building.price_ug))
      if (building.price_mid1) allPrices.push(Number(building.price_mid1))
      if (building.price_mid2) allPrices.push(Number(building.price_mid2))
      if (building.price_top) allPrices.push(Number(building.price_top))
    })
    
    // Find the minimum price
    if (allPrices.length > 0) {
      fallbackPrice = Math.min(...allPrices)
    }
  } else {
    // Fallback to old individual fields
    const legacyPrices = []
    if (floor.price_ug) legacyPrices.push(Number(floor.price_ug))
    if (floor.price_mid1) legacyPrices.push(Number(floor.price_mid1))
    if (floor.price_mid2) legacyPrices.push(Number(floor.price_mid2))
    if (floor.price_top) legacyPrices.push(Number(floor.price_top))
    
    if (legacyPrices.length > 0) {
      fallbackPrice = Math.min(...legacyPrices)
    }
  }

  const priceInfo = fallbackPrice ? formatPriceLabel(fallbackPrice) : null

  // Get possession date - from top-level or first building config
  let possessionDate = floor.possession_date || null
  if (!possessionDate && buildingConfig && buildingConfig.length > 0) {
    // Get from first building config if top-level doesn't exist
    possessionDate = buildingConfig[0].possession_date || null
  }

  // Calculate area range from building_config
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
  if (!areaRange && floor.plot_size) {
    areaRange = floor.plot_size
  }

  // Helper to show a label for condition / status
  const pretty = (str) =>
    !str ? null : str.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <Suspense fallback={
      <div className="page-shell flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c9a227] mx-auto mb-4"></div>
          <p className="text-[#a3a3a3]">Loading...</p>
        </div>
      </div>
    }>
      <BuilderFloorDetailContent>
        <div className="page-shell">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
          <nav className="py-8 text-sm text-[#a3a3a3]">
            <Link href="/" className="golden-text hover:underline">
              Home
            </Link>
            {' / '}
            <Link href="/builder-floor" className="golden-text hover:underline">
              Builder Floors
            </Link>
            {' / '}
            <span className="text-[#f5f5f5]">{floor.name}</span>
          </nav>

          <section className="section-surface py-8">
            <div className="rounded-lg overflow-hidden border border-[#2a2a2a]">
              <ProjectImageGallery
                images={allImages && allImages.length > 0 ? allImages : []}
                projectName={floor.name}
              />
            </div>
          </section>

          <section className="section-surface py-8">
            <div className="px-4">
              <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold font-serif-display text-[#f5f5f5] mb-4">
                  {floor.name}
                </h1>
                <div className="flex flex-wrap gap-4 text-[#a3a3a3]">
                  {floor.location && (
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
                      {floor.location}
                    </span>
                  )}
                  {areaRange && (
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
                      {areaRange}
                    </span>
                  )}
                  {floor.facing && (
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
                          d="M12 2l4 4-4 4-4-4 4-4zM12 14l4 4-4 4-4-4 4-4z"
                        />
                      </svg>
                      {floor.facing}
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-6 flex flex-wrap gap-4 items-center">
                {priceInfo?.label && (
                  <div className="flex-1 p-4 surface-elevated rounded-lg border border-[#2a2a2a]">
                    <p className="text-sm text-[#737373] mb-1">Starting Price</p>
                    <p className="text-2xl font-bold golden-text">
                      {priceInfo.label}
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <Link
                  href={`/contact?enquiry=${encodeURIComponent(floor.name)}`}
                  className="btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[48px]"
                  data-ga="builder_floor_enquire"
                >
                  Enquire about {floor.name}
                </Link>
              </div>

              {floor.short_description && (
                <div className="mb-6 p-4 surface-elevated border-l-4 border-[#c9a227] rounded">
                  <p className="text-lg text-[#f5f5f5] font-medium">
                    {floor.short_description}
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="section-muted py-8">
            <div className="px-4">
              <h2 className="text-2xl font-bold font-serif-display text-[#f5f5f5] mb-6">
                Property Information
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {floor.location && (
                  <div className="card-luxury p-6 rounded-lg">
                    <h3 className="font-semibold text-[#f5f5f5] mb-2">Location</h3>
                    <p className="text-[#a3a3a3]">{floor.location}</p>
                  </div>
                )}

                {floor.developer && (
                  <div className="card-luxury p-6 rounded-lg">
                    <h3 className="font-semibold text-[#f5f5f5] mb-2">Developer</h3>
                    <p className="text-[#a3a3a3]">{floor.developer}</p>
                  </div>
                )}

                {floor.total_land_parcel && (
                  <div className="card-luxury p-6 rounded-lg">
                    <h3 className="font-semibold text-[#f5f5f5] mb-2">
                      Total Land Parcel
                    </h3>
                    <p className="text-[#a3a3a3]">
                      {floor.total_land_parcel.toLowerCase().includes('acre') 
                        ? floor.total_land_parcel 
                        : `${floor.total_land_parcel} acres`}
                    </p>
                  </div>
                )}

                {floor.plot_number && (
                  <div className="card-luxury p-6 rounded-lg">
                    <h3 className="font-semibold text-[#f5f5f5] mb-2">
                      Plot Number
                    </h3>
                    <p className="text-[#a3a3a3]">{floor.plot_number}</p>
                  </div>
                )}

                {possessionDate && (
                  <div className="card-luxury p-6 rounded-lg">
                    <h3 className="font-semibold text-[#f5f5f5] mb-2">
                      Possession
                    </h3>
                    <p className="text-[#a3a3a3]">{possessionDate}</p>
                  </div>
                )}

                {/* Show legacy fields only if no building_config exists */}
                {!buildingConfig && floor.floors_count && (
                  <div className="card-luxury p-6 rounded-lg">
                    <h3 className="font-semibold text-[#f5f5f5] mb-2">
                      Number of Floors
                    </h3>
                    <p className="text-[#a3a3a3]">{floor.floors_count}</p>
                  </div>
                )}

                {!buildingConfig && floor.category && (
                  <div className="card-luxury p-6 rounded-lg">
                    <h3 className="font-semibold text-[#f5f5f5] mb-2">
                      Category
                    </h3>
                    <p className="text-[#a3a3a3]">{pretty(floor.category)}</p>
                  </div>
                )}

                {!buildingConfig && floor.condition && (
                  <div className="card-luxury p-6 rounded-lg">
                    <h3 className="font-semibold text-[#f5f5f5] mb-2">
                      Condition
                    </h3>
                    <p className="text-[#a3a3a3]">{pretty(floor.condition)}</p>
                  </div>
                )}

                {!buildingConfig && floor.roof_rights && (
                  <div className="card-luxury p-6 rounded-lg">
                    <h3 className="font-semibold text-[#f5f5f5] mb-2">
                      Roof Rights
                    </h3>
                    <p className="text-[#a3a3a3]">{floor.roof_rights}</p>
                  </div>
                )}


                {!buildingConfig && floor.has_basement && (
                  <div className="card-luxury p-6 rounded-lg">
                    <h3 className="font-semibold text-[#f5f5f5] mb-2">
                      Basement
                    </h3>
                    <p className="text-[#a3a3a3]">Yes</p>
                  </div>
                )}

                {!buildingConfig && floor.is_triplex && (
                  <div className="card-luxury p-6 rounded-lg">
                    <h3 className="font-semibold text-[#f5f5f5] mb-2">
                      Triplex
                    </h3>
                    <p className="text-[#a3a3a3]">Yes</p>
                  </div>
                )}

                {!buildingConfig && floor.is_gated && (
                  <div className="card-luxury p-6 rounded-lg">
                    <h3 className="font-semibold text-[#f5f5f5] mb-2">
                      Gated
                    </h3>
                    <p className="text-[#a3a3a3]">Yes</p>
                  </div>
                )}

                {!buildingConfig && floor.owner_name && (
                  <div className="card-luxury p-6 rounded-lg">
                    <h3 className="font-semibold text-[#f5f5f5] mb-2">
                      Owner Name
                    </h3>
                    <p className="text-[#a3a3a3]">{floor.owner_name}</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {buildingConfig && buildingConfig.length > 0 && (
            <section className="section-surface py-8">
              <div className="px-4">
                <h2 className="text-2xl font-bold font-serif-display text-[#f5f5f5] mb-6">Building Configuration</h2>
                <BuildingConfigurationSlider buildingConfig={buildingConfig} status={floor.status} />
              </div>
            </section>
          )}

          {floor.full_description && (
            <section className="section-muted py-8">
              <div className="px-4">
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold font-serif-display text-[#f5f5f5] mb-4">
                    About {floor.name}
                  </h2>
                  <p className="text-[#a3a3a3] leading-relaxed whitespace-pre-line">
                    {floor.full_description}
                  </p>
                </div>
              </div>
            </section>
          )}

          <section className="section-surface py-8">
            <div className="px-4">
              <div className="flex flex-wrap gap-4 pt-6">
                <Link
                  href="/contact"
                  className="btn-primary"
                >
                  Book a Consultation
                </Link>
                <Link
                  href="/builder-floor"
                  className="btn-secondary"
                >
                  View All Builder Floors
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
      </BuilderFloorDetailContent>
    </Suspense>
  )
}
