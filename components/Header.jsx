'use client'

import Link from 'next/link'
import { useState } from 'react'

const propertyTypes = [
  { label: 'Residential Projects', href: '/residential' },
  { label: 'Builder Floor Projects', href: '/builder-floor' },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isPropertyOpen, setIsPropertyOpen] = useState(false)

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="inline-flex flex-col items-center golden-text"
            style={{ textShadow: '0 2px 6px rgba(201, 151, 0, 0.4)' }}
          >
            <span className="text-4xl font-extrabold tracking-wide leading-none" style={{ letterSpacing: '0.50em', fontFamily: 'Georgia, serif' }}>RKG</span>
            <span className="mt-1 text-xs uppercase text-center whitespace-nowrap" style={{ letterSpacing: '0.05em', fontFamily: 'serif' }}>
              Properties &amp; Constructions
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center h-full">
            <Link href="/" className="h-full px-4 flex items-center text-gray-700 hover:text-[#c99700] hover:bg-gray-100 transition">
              Home
            </Link>
            <div
              className="relative h-full"
              onMouseEnter={() => setIsPropertyOpen(true)}
              onMouseLeave={() => setIsPropertyOpen(false)}
            >
              <button
                className="h-full px-4 flex items-center gap-2 text-gray-700 hover:text-[#c99700] hover:bg-gray-100 transition"
              >
                Properties
                <svg
                  className={`w-4 h-4 transition-transform ${isPropertyOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.939l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0l-4.24-4.24a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {isPropertyOpen && (
                <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                  {propertyTypes.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#c99700] transition"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link href="/about" className="h-full px-4 flex items-center text-gray-700 hover:text-[#c99700] hover:bg-gray-100 transition">
              About Us
            </Link>
            <Link href="/contact" className="h-full px-4 flex items-center text-gray-700 hover:text-[#c99700] hover:bg-gray-100 transition">
              Contact Us
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 space-y-2">
            <Link
              href="/"
              className="block py-2 text-gray-700 hover:text-[#c99700]"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <details className="group" open={false}>
              <summary className="flex justify-between items-center py-2 text-gray-700 hover:text-[#c99700] cursor-pointer">
                Properties
                <span className="text-sm text-gray-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="pl-4 space-y-2">
                {propertyTypes.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block py-1 text-gray-700 hover:text-[#c99700]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </details>
            <Link
              href="/about"
              className="block py-2 text-gray-700 hover:text-[#c99700]"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="block py-2 text-gray-700 hover:text-[#c99700]"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact Us
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}

