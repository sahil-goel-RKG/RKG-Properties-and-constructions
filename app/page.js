import { createServerSupabaseClient } from '@/lib/supabase/server'
import { cache } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import HeroCarousel from '@/components/HeroCarousel'
import LocationsSlider from '@/components/LocationsSlider'
import ProjectsSlider from '@/components/ProjectsSlider'
import DevelopersSlider from '@/components/DevelopersSlider'
import CountUpStats from '@/components/CountUpStats'
import ContactForm from '@/components/ContactForm'

// Add revalidation for ISR
export const revalidate = 1800 // Revalidate every 30 minutes

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
      .from('projects')
      .select('id, name, slug, location, developer, area, price, image_url, type, short_description, bhk_config, project_status, is_featured')
      .in('type', ['builder-floor', 'builder floor', 'builder_floor'])
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(12)

    if (error) {
      console.error('Error fetching builder floor projects:', error)
      return []
    }

    return data || []
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
      <section className="relative py-20 overflow-hidden">
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
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
            <div className="text-white">
              <h1 className="text-5xl font-bold mb-6">
                Your Trusted Real Estate Partner
              </h1>
              <p className="text-xl mb-8 text-gray-100">
                Buying, selling, or investing — We help clients achieve their real estate goals with market insight, negotiation expertise, and concierge-level service.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <Link href="/apartments" className="inline-block bg-white golden-text px-8 py-3 rounded-lg font-semibold hover:bg-[#fff2be] transition">
                  Browse Projects
                </Link>
                <a href="/pdf/Sahil Goel.pdf" download className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#c99700] transition">
                  Download Resume
                </a>
              </div>
              <div className="flex flex-wrap gap-8 mt-10">
                <div>
                  <p className="text-3xl font-bold">10+</p>
                  <p className="text-gray-200">Featured Projects</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">500+</p>
                  <p className="text-gray-200">Happy Clients</p>
                </div>
              </div>
            </div>
            <div className="w-full">
              <div className="bg-white/95 rounded-2xl shadow-2xl p-6 md:p-8 max-w-sm ml-auto backdrop-blur">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  Book a Consultation
                </h2>
                <p className="text-sm text-gray-600 mb-6 text-center">
                  Share your details and we’ll reach out with tailored property recommendations.
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
      />

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Work With Us</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
      <section className="bg-[#0f172a] text-white py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Move?</h2>
          <p className="text-xl mb-8 text-gray-200">
            Let's discuss your goals and build a tailored plan to get you there.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-[#22c55e] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#16a34a] transition"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  )
}

