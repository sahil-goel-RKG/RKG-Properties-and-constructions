import Image from 'next/image'

export const metadata = {
  title: 'About Us | RKG Properties and Constructions',
  description: 'Learn about RKG Properties and Constructions - Excellence in Real Estate Solutions',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        {/* Company Section */}
        <div className="max-w-7xl mx-auto space-y-16 mb-16">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">About RKG Properties and Constructions</h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-4">Premier Real Estate Consultancy</p>
            <p className="text-gray-500 mb-6 sm:mb-8">Since 2015 • RERA Certified</p>
            
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
              {/* Left Column - Content */}
              <div className="min-w-0">
                <p className="text-gray-700 leading-relaxed mb-6 text-sm sm:text-base">
                  RKG Properties and Constructions is a leading real estate consultancy dedicated to helping clients buy, sell, and invest with confidence across Gurugram and surrounding areas. Since 2015, we have combined market expertise, strategic negotiation, and personalized service to deliver exceptional results.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 my-6 sm:my-8 p-4 sm:p-6 bg-gray-50 rounded-lg">
                  <div className="min-w-0 p-2 sm:p-0">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 sm:mb-2">Established</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">2015</p>
                  </div>
                  <div className="min-w-0 p-2 sm:p-0">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 sm:mb-2">Location</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">Gurugram</p>
                  </div>
                  <div className="min-w-0 p-2 sm:p-0 sm:col-span-2 lg:col-span-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 sm:mb-2">Certification</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">RERA</p>
                  </div>
                </div>
                
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">Our Mission</h2>
                <p className="text-gray-700 leading-relaxed mb-6 text-sm sm:text-base">
                  To provide data-driven guidance and white-glove service, empowering clients to make informed real estate decisions and achieve their property goals with confidence.
                </p>
                
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">Services</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed text-sm sm:text-base">
                  <li>Buyer and Seller Representation</li>
                  <li>Investment Property Advisory</li>
                  <li>Home Preparation & Staging</li>
                  <li>Pricing Strategy & Market Analysis</li>
                  <li>Negotiation & Closing Coordination</li>
                  <li>Property Portfolio Management</li>
                </ul>
              </div>

              {/* Right Column - Image */}
              <div className="min-w-0 md:sticky md:top-24">
                <Image 
                  src="/img/about-office.jpg" 
                  alt="RKG Properties and Constructions Office" 
                  width={800} 
                  height={1000} 
                  className="w-full h-auto rounded-lg shadow-xl mb-4 sm:mb-6"
                  style={{
                    boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
                  }}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                
                {/* Contact Card */}
                <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Get in Touch</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">📍 Location</p>
                      <p className="text-gray-900 font-medium">9th floor, Badshahpur Sohna Road Highway, Sohna - Gurgaon Rd, Gurugram, Haryana 122018</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">📧 Email</p>
                      <p className="text-gray-900 font-medium">sahil@rkgproperties.in</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">📞 Phone</p>
                      <p className="text-gray-900 font-medium">+91-8851753005</p>
                      <p className="text-gray-900 font-medium">+91-9220286089</p>
                    </div>
                  </div>
                  <a 
                    href="/contact" 
                    className="inline-block w-full mt-6 text-center bg-[#c99700] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#a67800] transition"
                  >
                    Contact Us
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Managing Director Section */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8 border border-gray-200">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Managing Director</h2>
            <div className="grid grid-cols-1 md:grid-cols-[minmax(280px,450px)_1fr] gap-6 md:gap-8 items-stretch">
              <div className="relative w-full aspect-[4/5] min-h-[320px] md:min-h-[500px]">
                <Image 
                  src="/img/about.jpg?v=2"
                  alt="Sahil Goel - Managing Director" 
                  fill
                  className="object-cover rounded-lg shadow-lg"
                  style={{
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                  }}
                  unoptimized
                />
              </div>
              <div className="min-w-0">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Sahil Goel</h3>
                <p className="text-gray-600 mb-1 text-sm sm:text-base">Real Estate Consultant | Advisor</p>
                <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6">📍 9th floor, Badshahpur Sohna Road Highway, Sohna - Gurgaon Rd, Gurugram, Haryana 122018</p>
                <p className="text-gray-700 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                  Dedicated real estate professional with deep knowledge of the local market and a commitment to delivering exceptional client experiences. Sahil brings strategic insight, negotiation expertise, and personalized attention to every transaction.
                </p>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Skills</h3>
                <p className="text-gray-600 mb-1 text-sm sm:text-base">10+ years in real estate</p>
                <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6">Cold calling Professional</p>

                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mt-4 sm:mt-6 mb-2 sm:mb-3">Credentials & Achievements</h4>
                <ul className="space-y-2 text-gray-600 leading-relaxed text-sm sm:text-base">
                  <li>Licensed Real Estate Consultant</li>
                  <li>RERA Certified Professional</li>
                  <li>Top Producer (multi‑year)</li>
                  <li>Member, National Association of REALTORS®</li>
                  <li>Certified Negotiation Expert</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

