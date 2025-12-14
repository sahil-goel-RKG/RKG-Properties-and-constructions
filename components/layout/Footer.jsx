import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">RKG Properties and Constructions</h3>
            <p className="text-gray-400 mb-4">
              Excellence in Real Estate Solutions
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Sector 57, Sushant Lok</p>
              <p>Gurugram, 122001</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact us
                </Link>
              </li>
            </ul>
          </div>

          {/* Projects */}
          <div>
            <h4 className="font-semibold mb-4">Projects</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/apartments" className="hover:text-white transition">
                  Apartments
                </Link>
              </li>
            <li>
              <Link href="/builder-floor" className="hover:text-white transition">
                Builder Floors
              </Link>
            </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="tel:+918851753005" className="hover:text-white transition">
                  📞 +91-8851753005
                </a>
              </li>
              <li>
                <a href="tel:+919220286089" className="hover:text-white transition">
                  📞 +91-9220286089
                </a>
              </li>
              <li>
                <a href="mailto:sahil@rkgproperties.in" className="hover:text-white transition">
                  ✉️ sahil@rkgproperties.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © RKG Properties and Constructions, All rights reserved.
            </p>
            <Link
              href="/admin/login"
              className="text-gray-400 hover:text-white transition text-sm"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

