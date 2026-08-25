import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getDeveloperLogoDisplayEntries } from '@/lib/developerLogosServer'
import YouTubeVideoSectionLoader from '@/components/YouTubeVideoSectionLoader'
import { cache, Suspense } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import HeroCarousel from '@/components/HeroCarousel'
import ProjectsSlider from '@/components/ProjectsSlider'
import LocationsSlider from '@/components/LocationsSlider'
import { resolveSectionStyle } from '@/lib/resolveSectionClass'
const DevelopersSlider = dynamic(() => import('@/components/DevelopersSlider'), { ssr: true })
const CountUpStats = dynamic(() => import('@/components/CountUpStats'), { ssr: true })
import WhyWorkWithUsSection from '@/components/WhyWorkWithUsSection'
import TestimonialsSection from '@/components/TestimonialsSection'

// ISR: cache page for 10 min to improve TTFB on repeat visits
export const revalidate = 600

export const metadata = {
  title: 'RKG Properties and Constructions | Gurgaon Real Estate',
  description: 'Your trusted real estate partner in Gurgaon. Premium apartments and builder floors on Golf Course Road, SPR, Sohna Road, Dwarka Expressway. 10+ projects, 500+ happy clients.',
}

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
      .limit(5)

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

// Below-fold content: fetches after hero so first byte can be sent sooner (streaming)
async function HomeBelowFold() {
  const [residentialProjects, builderFloorProjects, developers] = await Promise.all([
    getResidentialProjects(),
    getBuilderFloorProjects(),
    getUniqueDevelopers(),
  ])
  const developerLogoEntries = getDeveloperLogoDisplayEntries(developers)
  return (
    <>
      <ProjectsSlider projects={residentialProjects} bgColor="section-light" />
      <section className="py-8 sm:py-16 section-mid" style={resolveSectionStyle('section-mid')}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="card-luxury intro-card-luxury rounded-lg p-4 sm:p-6 md:p-8">
              <p className="text-sm sm:text-lg leading-relaxed text-[#a3a3a3] mb-4 sm:mb-8">
                Let us get to know each other first. Well, if you&apos;re engaging with us, we guess you&apos;re seeking real estate agents. We are aware of how tiresome finding a realtor would be. We would say that you&apos;re on the verge of reaching &quot;The right place&quot; and making &quot;The Right Choice.&quot;
              </p>
              <CountUpStats />
              <div className="text-center">
                <Link
                  href="/about"
                  className="btn-primary mx-auto"
                  data-ga="about_read_more"
                >
                  Read More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ProjectsSlider
        projects={builderFloorProjects}
        title="Builder Floor Projects"
        description="Curated selection of premium builder floors with bespoke amenities."
        ctaLabel="View All Builder Floor Listings"
        ctaHref="/builder-floor"
        allowEmpty
        emptyMessage="We are curating the finest builder floor listings. Leave your details and we'll notify you as soon as they go live."
        bgColor="section-light"
        variant="builder-floor"
      />
      <WhyWorkWithUsSection />
      <YouTubeVideoSectionLoader bgColor="section-light" />
      <DevelopersSlider developers={developers} logoEntries={developerLogoEntries} bgColor="section-mid" />
      <TestimonialsSection bgColor="section-light" />
      <section className="section-cta py-8 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 text-center max-w-3xl">
          <h2 className="text-xl sm:text-3xl font-bold font-serif-display text-[#f5f5f5] mb-2 sm:mb-4">Ready to Move?</h2>
          <p className="text-base sm:text-xl mb-4 sm:mb-8 text-[#a3a3a3]">
            Let&apos;s discuss your goals and build a tailored plan to get you there.
          </p>
          <Link
            href="/contact"
            className="btn-primary mx-auto"
            data-ga="cta_get_in_touch"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  )
}

function BelowFoldSkeleton() {
  return <div className="min-h-[300px] section-mid" aria-hidden />
}

export default async function Home() {
  const [heroImages, locations] = await Promise.all([
    getHeroImages(),
    getUniqueLocations(),
  ])
  const carouselImages = heroImages.length > 0 ? heroImages : ['/img/hero.jpg']

  return (
    <div className="page-shell bg-[#050505]">
      {heroImages.length > 0 && (
        <link rel="preload" as="image" href={heroImages[0]} />
      )}
      <section
        className="hero-section section-mid-flat relative overflow-hidden py-0 md:py-14 min-h-[340px] md:min-h-[380px]"
        style={resolveSectionStyle('section-mid-flat')}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .hero-stage {
                position: relative;
                width: 100%;
                min-height: 260px;
              }
              .hero-copy-wrap {
                position: relative;
                z-index: 10;
                max-width: 36rem;
                width: 100%;
              }
              .hero-image-band {
                position: relative;
                width: 100%;
                height: 220px;
                margin-top: 1.5rem;
                overflow: hidden;
              }
              .hero-mobile-scrim {
                display: none;
              }
              @media (max-width: 767px) {
                .hero-stage {
                  min-height: 340px;
                  display: flex;
                  align-items: flex-end;
                  padding: 1.25rem 0 1.5rem;
                }
                .hero-image-band {
                  position: absolute;
                  top: 0;
                  bottom: 0;
                  left: 50%;
                  width: 100vw;
                  max-width: 100vw;
                  height: auto;
                  margin-top: 0;
                  margin-left: -50vw;
                  z-index: 0;
                  overflow: hidden;
                }
                .hero-mobile-scrim {
                  display: block;
                  position: absolute;
                  top: 0;
                  bottom: 0;
                  left: 50%;
                  width: 100vw;
                  max-width: 100vw;
                  margin-left: -50vw;
                  z-index: 1;
                  pointer-events: none;
                  background: linear-gradient(
                    180deg,
                    rgba(0, 0, 0, 0.45) 0%,
                    rgba(0, 0, 0, 0.62) 45%,
                    rgba(0, 0, 0, 0.78) 100%
                  );
                }
                .hero-copy-wrap {
                  z-index: 2;
                  max-width: none;
                }
                .hero-image-fade-layer {
                  -webkit-mask-image: none !important;
                  mask-image: none !important;
                }
                .hero-image-fade-layer img {
                  object-position: center center !important;
                }
              }
              @media (min-width: 768px) {
                .hero-stage {
                  min-height: 300px;
                  display: flex;
                  align-items: center;
                }
                .hero-image-band {
                  position: absolute;
                  top: 50%;
                  transform: translateY(-50%);
                  left: 25%;
                  right: 0;
                  width: auto;
                  height: 280px;
                  margin-top: 0;
                  margin-left: 0;
                  z-index: 1;
                }
              }
            `,
          }}
        />
        <div className="container mx-auto px-4">
          <div className="hero-stage">
            <div className="hero-image-band">
              <HeroCarousel
                images={carouselImages}
                imageSizes="(min-width: 1280px) 960px, (min-width: 768px) 60vw, 100vw"
              />
            </div>
            <div className="hero-mobile-scrim" aria-hidden="true" />
            <div className="hero-copy-wrap text-[#f5f5f5] min-w-0">
              <p className="label-upper golden-text mb-2 sm:mb-3">Premium Gurgaon Real Estate</p>
              <h1 className="font-serif-display text-2xl sm:text-3xl md:text-4xl font-semibold text-[#f5f5f5] mb-2 sm:mb-3 leading-tight tracking-wide">
                Gurgaon&apos;s Trusted Real Estate Partner
              </h1>
              <p className="text-sm sm:text-base text-[#d4d4d4] md:text-[#a3a3a3] mb-4 sm:mb-5 leading-relaxed max-w-lg">
                Expert guidance across Golf Course Road, SPR, Sohna Road &amp; premium corridors.
              </p>

              <div className="flex flex-wrap gap-3 sm:gap-4">
                <Link href="/apartments" className="btn-primary" data-ga="hero_browse_projects">
                  Browse Projects
                </Link>
                <Link href="/contact" className="btn-secondary" data-ga="hero_book_consultation">
                  Book a Consultation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LocationsSlider locations={locations} bgColor="section-mid-flat-fade" />
      <Suspense fallback={<BelowFoldSkeleton />}>
        <HomeBelowFold />
      </Suspense>
    </div>
  )
}

