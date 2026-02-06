import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy | RKG Properties and Constructions',
  description: 'Privacy Policy for RKG Properties and Constructions. Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <nav className="mb-8 text-sm text-gray-600">
          <Link href="/" className="hover:text-[#c99700]">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Privacy Policy</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Privacy Policy
        </h1>
        <p className="text-gray-500 text-sm mb-12">
          Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <div className="bg-white rounded-lg shadow-md p-6 md:p-10 space-y-10">
          {/* 1. Introduction */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-[#c99700]">1.</span> Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              RKG Properties & Constructions respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you visit our website or submit your details through our forms or advertisements.
            </p>
          </section>

          {/* 2. Information We Collect */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-[#c99700]">2.</span> Information We Collect
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We may collect the following information:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
              <li>Full name</li>
              <li>Phone number</li>
              <li>Email address</li>
              <li>Property preferences</li>
              <li>Any information voluntarily submitted through contact forms or lead forms</li>
            </ul>
          </section>

          {/* 3. How We Use Your Information */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-[#c99700]">3.</span> How We Use Your Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We use the collected information to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
              <li>Respond to your property inquiries</li>
              <li>Share project details, pricing, and offers</li>
              <li>Arrange site visits and consultations</li>
              <li>Contact you via phone, email, or WhatsApp</li>
              <li>Improve our services and customer experience</li>
            </ul>
          </section>

          {/* 4. Data Sharing & Disclosure */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-[#c99700]">4.</span> Data Sharing & Disclosure
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We do not sell, rent, or trade your personal information. Your data may be shared only with authorized team members or developer partners strictly for fulfilling your inquiry.
            </p>
          </section>

          {/* 5. Google Ads & Tracking Disclosure */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-[#c99700]">5.</span> Google Ads & Tracking Disclosure
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may use Google Ads and other advertising platforms that collect data through cookies and similar technologies to show relevant advertisements and measure campaign performance.
            </p>
          </section>

          {/* 6. Cookies Policy */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-[#c99700]">6.</span> Cookies Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our website may use cookies to enhance user experience, analyze traffic, and improve website performance. You may choose to disable cookies through your browser settings.
            </p>
          </section>

          {/* 7. Data Security */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-[#c99700]">7.</span> Data Security
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We take appropriate technical and organizational measures to protect your personal data from unauthorized access, misuse, or disclosure.
            </p>
          </section>

          {/* 8. User Consent */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-[#c99700]">8.</span> User Consent
            </h2>
            <p className="text-gray-700 leading-relaxed">
              By submitting your information on our website or through our advertisements, you consent to the collection and use of your data as described in this Privacy Policy.
            </p>
          </section>

          {/* 9. Contact Information */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-[#c99700]">9.</span> Contact Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions regarding this Privacy Policy, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-gray-700">
              <p><span className="font-semibold">Business Name:</span> RKG Properties & Constructions</p>
              <p><span className="font-semibold">Phone:</span> <a href="tel:+919220286089" className="text-[#c99700] hover:underline">9220286089</a></p>
              <p><span className="font-semibold">Email:</span> <a href="mailto:sahil@rkgproperties.in" className="text-[#c99700] hover:underline">sahil@rkgproperties.in</a></p>
              <p><span className="font-semibold">Website:</span> <a href="https://www.rkgproperties.in" className="text-[#c99700] hover:underline">www.rkgproperties.in</a></p>
            </div>
          </section>

          {/* 10. Policy Updates */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-[#c99700]">10.</span> Policy Updates
            </h2>
            <p className="text-gray-700 leading-relaxed">
              This Privacy Policy may be updated from time to time. Any changes will be posted on this page.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block text-[#c99700] font-semibold hover:text-[#a67800] hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
