import ContactForm from '@/components/features/ContactForm'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rkgproperties.in'

export const metadata = {
  title: 'Contact Us | RKG Properties and Constructions',
  description: 'Get in touch with RKG Properties and Constructions for expert real estate guidance',
}

export default async function ContactPage({ searchParams }) {
  const params = await searchParams
  const enquiry = typeof params?.enquiry === 'string' ? params.enquiry.trim() : ''
  const defaultMessage = enquiry ? `I am interested in: ${enquiry}` : ''
  const thankyou = params?.thankyou === '1'
  const contactError =
    params?.contact_error === '1' || params?.contact_error === 'rate_limit'

  const contactJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Us',
    url: `${SITE_URL.replace(/\/$/, '')}/contact`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'RKG Properties and Constructions',
      url: SITE_URL.replace(/\/$/, ''),
    },
    mainEntity: {
      '@type': 'Organization',
      name: 'RKG Properties and Constructions',
      email: 'sahil@rkgproperties.in',
      telephone: ['+91-8851753005', '+91-9220286089'],
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Sector 57, Sushant Lok',
        addressLocality: 'Gurugram',
        postalCode: '122001',
        addressCountry: 'IN',
      },
    },
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 w-full max-w-[100vw] overflow-x-hidden box-border">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <div className="w-full max-w-[100vw] box-border px-4 sm:px-6 mx-auto">
        <div className="max-w-4xl mx-auto w-full min-w-0">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-xl text-gray-600">
              Get expert guidance for your successful real estate journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 min-w-0">
            {/* Contact Form */}
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md min-w-0 overflow-hidden">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Send us a Message
              </h2>
              {thankyou && (
                <div
                  className="mb-6 p-4 rounded-lg bg-[#fff5d6] text-[#a67800] border border-[#f2cd6d]"
                  role="status"
                >
                  Thank you! Your message has been submitted successfully.
                </div>
              )}
              {contactError && (
                <div
                  className="mb-6 p-4 rounded-lg bg-red-50 text-red-800 border border-red-200"
                  role="alert"
                >
                  {params?.contact_error === 'rate_limit'
                    ? 'Too many submissions. Please try again in a few minutes.'
                    : 'Something went wrong. Please check your details and try again.'}
                </div>
              )}
              <ContactForm defaultMessage={defaultMessage} />
            </div>

            {/* Contact Information */}
            <div className="space-y-8 min-w-0 overflow-hidden">
              <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md break-words">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Get in Touch
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      📞 Phone Number
                    </h3>
                    <a
                      href="tel:+918851753005"
                      className="golden-text hover:underline block"
                    >
                      +91-8851753005
                    </a>
                    <a
                      href="tel:+919220286089"
                      className="golden-text hover:underline block"
                    >
                      +91-9220286089
                    </a>
                  </div>
                 
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">✉️ Email</h3>
                    <a
                      href="mailto:sahil@rkgproperties.in"
                      className="golden-text hover:underline break-all"
                    >
                      sahil@rkgproperties.in
                    </a>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">📍 Address</h3>
                    <p className="text-gray-600">
                      Sector 57, Sushant Lok<br />
                      Gurugram, 122001
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      🏢 RERA Registration
                    </h3>
                    <p className="text-gray-600 text-sm break-all">
                      RC/HARERA/GGM/3244/2839/2025/121
                    </p>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Business Hours
                </h2>
                <div className="space-y-2 text-gray-600">
                  <p>Mon : 10:00 AM - 7:00 PM</p>
                  <p>Tue : Closed</p>
                  <p>Wed - Sun : 10:00 AM - 7:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

