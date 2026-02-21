import ContactForm from '@/components/features/ContactForm'

export const metadata = {
  title: 'Contact Us | RKG Properties and Constructions',
  description: 'Get in touch with RKG Properties and Constructions for expert real estate guidance',
}

export default async function ContactPage({ searchParams }) {
  const params = await searchParams
  const enquiry = typeof params?.enquiry === 'string' ? params.enquiry.trim() : ''
  const defaultMessage = enquiry ? `I am interested in: ${enquiry}` : ''

  return (
    <div className="min-h-screen bg-gray-50 py-16 w-full max-w-[100vw] overflow-x-hidden box-border">
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

