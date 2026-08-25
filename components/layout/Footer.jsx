import Link from 'next/link'
import { OFFICE_ADDRESS } from '@/config/constants'

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[#2a2a2a] text-[#f5f5f5]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="font-serif-display text-xl font-semibold mb-2 golden-text">
              RKG Properties and Constructions
            </h3>
            <p className="label-upper mb-4 !text-[#737373]">Excellence in Real Estate Solutions</p>
            <div className="space-y-2 text-sm text-[#a3a3a3]">
              <p>{OFFICE_ADDRESS.lines[0]}</p>
              <p>{OFFICE_ADDRESS.lines[1]}</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="label-upper mb-4">Quick Links</h4>
            <ul className="space-y-2 text-[#a3a3a3]">
              <li>
                <Link href="/about" className="hover:text-[#c9a227] transition-colors">
                  About us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#c9a227] transition-colors">
                  Contact us
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-[#c9a227] transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Projects */}
          <div>
            <h4 className="label-upper mb-4">Projects</h4>
            <ul className="space-y-2 text-[#a3a3a3]">
              <li>
                <Link href="/apartments" className="hover:text-[#c9a227] transition-colors">
                  Apartments
                </Link>
              </li>
              <li>
                <Link href="/builder-floor" className="hover:text-[#c9a227] transition-colors">
                  Builder Floors
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="label-upper mb-4">Contact Us</h4>
            <ul className="space-y-2 text-[#a3a3a3] text-sm">
              <li>
                <a href="tel:+918851753005" className="hover:text-[#c9a227] transition-colors">
                  +91-8851753005
                </a>
              </li>
              <li>
                <a href="tel:+919220286089" className="hover:text-[#c9a227] transition-colors">
                  +91-9220286089
                </a>
              </li>
              <li>
                <a href="mailto:sahil@rkgproperties.in" className="golden-text hover:underline">
                  sahil@rkgproperties.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="divider-silver my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#737373] text-sm text-center md:text-left">
            © RKG Properties and Constructions, All rights reserved.
            <Link href="/privacy-policy" className="ml-2 hover:text-[#c0c0c0] transition-colors">
              Privacy Policy
            </Link>
          </p>
          <Link
            href="/admin/login"
            className="text-[#737373] hover:text-[#c0c0c0] transition-colors text-sm"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  )
}
