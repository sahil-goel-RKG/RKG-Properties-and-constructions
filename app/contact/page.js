import ContactForm from '@/components/ContactForm'

export const metadata = {
  title: 'Contact Us | RKG Properties and Constructions',
  description: 'Get in touch with RKG Properties and Constructions for expert real estate guidance',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-xl text-gray-600">
              Get expert guidance for your successful real estate journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Send us a Message
              </h2>
              <ContactForm />
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-lg shadow-md">
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
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">✉️ Email</h3>
                    <a
                      href="mailto:sahil@rkgproperties.in"
                      className="golden-text hover:underline"
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
                    <p className="text-gray-600 text-sm">
                      RC/HARERA/GGM/2727/2322/2024/440
                    </p>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Business Hours
                </h2>
                <div className="space-y-2 text-gray-600">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p>Saturday: 10:00 AM - 4:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

