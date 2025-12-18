import { createServerSupabaseClient } from '@/lib/supabase/server'
import { cache } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import HeroCarousel from '@/components/HeroCarousel'
import LocationsSlider from '@/components/LocationsSlider'
import ProjectsSlider from '@/components/ProjectsSlider'
import DevelopersSlider from '@/components/DevelopersSlider'
import CountUpStats from '@/components/CountUpStats'
import ContactForm from '@/components/features/ContactForm'

// Add revalidation for ISR
//export const revalidate = 1800 // Revalidate every 30 minutes
export const revalidate = 0 // Revalidate every 0 minutes

// Cache project fetches for faster loads
const getResidentialProjects = cache(async () => {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, slug, location, developer, area, price, image_url, type, short_description, bhk_config, project_status, is_featured')
      .eq('type', 'apartment')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(12)

    if (error) {
      console.error('Error fetching residential projects:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching residential projects:', error)
    return []
  }
})

const getBuilderFloorProjects = cache(async () => {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('builder_floors')
      .select(`
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
        image_url,
        comments,
        short_description,
        full_description,
        status
      `)
      .order('created_at', { ascending: false })
      .limit(12)

    if (error) {
      console.error('Error fetching builder floor projects:', error)
      return []
    }

    // Map to the same shape ProjectCard / ProjectsSlider expects
    return (data || []).map((floor) => {
      // Parse building_config if it exists
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
        if (floor.price_ug) legacyPrices.push(Number(floor.price_ug))
        if (floor.price_mid1) legacyPrices.push(Number(floor.price_mid1))
        if (floor.price_mid2) legacyPrices.push(Number(floor.price_mid2))
        if (floor.price_top) legacyPrices.push(Number(floor.price_top))
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
      if (!areaRange && floor.plot_size) {
        areaRange = floor.plot_size
      }

      return {
        id: floor.id,
        name: floor.name,
        slug: floor.slug,
        location: floor.location,
        developer: null, // not used for builder floors on card
        area: areaRange, // show area range as "lowest-highest sqyd"
        price: lowestPrice, // lowest price from all buildings and floors
        image_url: floor.image_url,
        type: 'builder-floor', // 👈 IMPORTANT for routing
        short_description: floor.short_description || floor.comments || null,
        bhk_config: null,
        project_status: floor.status || null,
        is_featured: false, // or true later if you add a column
      }
    })
  } catch (error) {
    console.error('Error fetching builder floor projects:', error)
    return []
  }
})


const getHeroImages = cache(async () => {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('projects')
      .select('image_url')
      .eq('type', 'apartment')
      .not('image_url', 'is', null)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching hero images:', error)
      return []
    }

    return data.map(item => item.image_url).filter(Boolean)
  } catch (error) {
    console.error('Error fetching hero images:', error)
    return []
  }
})

const getUniqueLocations = cache(async () => {
  try {
    const supabase = createServerSupabaseClient()
    
    // Fetch locations from both projects (apartments) and builder_floors tables
    const [projectsResult, builderFloorsResult] = await Promise.all([
      supabase
        .from('projects')
        .select('location')
        .eq('type', 'apartment')
        .not('location', 'is', null)
        .neq('location', ''),
      supabase
        .from('builder_floors')
        .select('location')
        .not('location', 'is', null)
        .neq('location', '')
    ])

    // Combine locations from both tables
    const allLocations = []
    if (!projectsResult.error && projectsResult.data) {
      allLocations.push(...projectsResult.data.map(item => item.location).filter(Boolean))
    }
    if (!builderFloorsResult.error && builderFloorsResult.data) {
      allLocations.push(...builderFloorsResult.data.map(item => item.location).filter(Boolean))
    }

    // Get unique locations and sort
    const uniqueLocations = [...new Set(allLocations)]
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

// Note: getDeveloperLogo is now imported from @/lib/developerUtils
// This function is kept for backward compatibility but can be removed if not used elsewhere

export default async function Home() {
  // Fetch all data in parallel for faster loading
  const [residentialProjects, builderFloorProjects, heroImages, locations, developers] = await Promise.all([
    getResidentialProjects(),
    getBuilderFloorProjects(),
    getHeroImages(),
    getUniqueLocations(),
    getUniqueDevelopers()
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden">
        {/* Background Image Carousel or Fallback */}
        {heroImages.length > 0 ? (
          <HeroCarousel images={heroImages} />
        ) : (
          <div className="absolute inset-0 z-0">
            <div className="relative w-full h-full">
              <Image
                src="/img/hero.jpg"
                alt="Modern real estate property"
                fill
                priority
                className="object-cover"
              />
            </div>
            {/* Subtle Fade Overlay */}
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        )}
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 md:gap-12 items-start">
            <div className="text-white">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              Your Trusted Real Estate Partner in Gurgaon
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 text-gray-100">
              With over a decade of hands-on experience in Gurgaon's most premium corridors—Golf Course Road, Golf Course Extension, SPR, Sohna Road, Dwarka Expressway, and New Gurgaon—RKG brings a powerful blend of market knowledge, negotiation expertise, and personalised guidance that helps clients make confident decisions in a complex market.
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-8">
                <Link href="/apartments" className="inline-block bg-white golden-text px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-[#fff2be] transition">
                  Browse Projects
                </Link>
                
              </div>
              <div className="flex flex-wrap gap-4 sm:gap-6 md:gap-8 mt-6 sm:mt-8 md:mt-10">
                <div>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">10+</p>
                  <p className="text-xs sm:text-sm text-gray-200">Featured Projects</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">500+</p>
                  <p className="text-xs sm:text-sm text-gray-200">Happy Clients</p>
                </div>
              </div>
            </div>
            <div className="w-full mt-6 md:mt-0">
              <div className="bg-white/95 rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-sm mx-auto md:ml-auto backdrop-blur">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 text-center">
                  Book a Consultation
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 text-center">
                  Share your details and we'll reach out with tailored property recommendations.
                </p>
                <ContactForm size="xs" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Residential Property Cards Section */}
      <ProjectsSlider projects={residentialProjects} bgColor="bg-gray-100" />

      {/* RKG Properties and Constructions Summary Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gray-50 rounded-lg shadow-md p-8">
              <p className="text-lg leading-relaxed text-gray-700 mb-8">
                Let us get to know each other first. Well, if you&apos;re engaging with us, we guess you&apos;re seeking real estate agents. We are aware of how tiresome finding a realtor would be. We would say that you&apos;re on the verge of reaching &quot;The right place&quot; and making &quot;The Right Choice.&quot;
              </p>
              
              <CountUpStats />

              <div className="text-center">
                <Link 
                  href="/about" 
                  className="inline-block bg-[#22c55e] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#16a34a] transition"
                >
                  Read More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Builder Floor Projects Section */}
      <ProjectsSlider
        projects={builderFloorProjects}
        title="Builder Floor Projects"
        description="Curated selection of premium builder floors with bespoke amenities."
        ctaLabel="View All Builder Floor Listings"
        ctaHref="/builder-floor"
        allowEmpty
        emptyMessage="We are curating the finest builder floor listings. Leave your details and we'll notify you as soon as they go live."
        bgColor="bg-gray-100"
        variant="builder-floor"
      />

      {/* Features Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 md:mb-12 text-center">Why Work With Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <div className="text-center p-8 bg-white rounded-xl hover:shadow-lg transition">
              <div className="text-5xl mb-4">🏡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Local Expertise</h3>
              <p className="text-gray-600">Deep knowledge of neighborhood trends, pricing, and inventory to guide smart decisions.</p>
            </div>
            <div className="text-center p-8 bg-white rounded-xl hover:shadow-lg transition">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Negotiation Power</h3>
              <p className="text-gray-600">Proven strategy to secure the best price and terms for buyers and sellers.</p>
            </div>
            <div className="text-center p-8 bg-white rounded-xl hover:shadow-lg transition">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">End-to-End Service</h3>
              <p className="text-gray-600">From staging and photography to financing and closing, we handle the details.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <LocationsSlider locations={locations} />

      {/* Developers Section */}
      <DevelopersSlider developers={developers} />

      {/* CTA Section */}
      <section className="bg-[#0f172a] text-white py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Ready to Move?</h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-gray-200">
            Let's discuss your goals and build a tailored plan to get you there.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-[#22c55e] text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-[#16a34a] transition"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  )
}

