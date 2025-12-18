'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import UserButtonWrapper from '@/app/builder-floor/UserButtonWrapper'

const propertySections = [
  {
    title: 'Residential',
    items: [
      { label: 'Apartments', href: '/apartments' },
      { label: 'Builder floors', href: '/builder-floor' },
    ],
  },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isPropertyOpen, setIsPropertyOpen] = useState(false)
  const closeTimeoutRef = useRef(null)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  return (
    <>
      <style jsx>{`
        .logo-hover-group:hover .logo-image {
          filter: drop-shadow(0 2px 12px rgba(201, 151, 0, 0.5));
        }
        .logo-hover-group:hover .logo-text {
          text-shadow: 0 2px 12px rgba(201, 151, 0, 0.5);
        }
      `}</style>
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16 py-0">
            <Link
              href="/"
              className="flex items-center gap-1 sm:gap-2 golden-text logo-hover-group transition-all duration-300"
            >
              <Image
                src="/img/Logo4.png"
                alt="RKG Properties & Constructions Logo"
                width={100}
                height={100}
                className="object-contain -mb-2 logo-image transition-all duration-300 w-12 h-12 sm:w-16 sm:h-16"
                priority
              />
               <div className="flex flex-col items-start -ml-3 sm:-ml-5">
                <span 
                  className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-wide leading-none logo-text transition-all duration-300" 
                  style={{ letterSpacing: '0.05em', fontFamily: 'Georgia, serif', color: '#DEB63B' }}
                >
                  RKG
                </span>
                 
              </div>
              
            </Link>

          {/* Desktop Navigation and User Icon */}
          <div className="hidden md:flex items-center h-full">
            <nav className="flex items-center h-full">
              <Link href="/" className="h-full px-4 flex items-center text-gray-700 hover:text-[#c99700] hover:bg-gray-100 transition">
                Home
              </Link>
              <div
                className="relative h-full"
                onMouseEnter={() => {
                  // Clear any pending close timeout
                  if (closeTimeoutRef.current) {
                    clearTimeout(closeTimeoutRef.current)
                    closeTimeoutRef.current = null
                  }
                  setIsPropertyOpen(true)
                }}
                onMouseLeave={() => {
                  // Set a 1 second delay before closing
                  closeTimeoutRef.current = setTimeout(() => {
                    setIsPropertyOpen(false)
                    closeTimeoutRef.current = null
                  }, 100)
                }}
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
                    {propertySections.map((section, sectionIndex) => (
                      <div key={sectionIndex}>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {section.title}
                        </div>
                        {section.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="block px-4 py-2 pl-6 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#c99700] transition"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
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
            {/* User Icon - Only shows when signed in */}
            <div className="flex items-center ml-2">
              <UserButtonWrapper afterSignOutUrl="/" />
            </div>
          </div>

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
                {propertySections.map((section, sectionIndex) => (
                  <div key={sectionIndex}>
                    <div className="py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {section.title}
                    </div>
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block py-1 pl-2 text-gray-700 hover:text-[#c99700]"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
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
            {/* User Icon for Mobile - Only shows when signed in */}
            <div className="md:hidden py-2">
              <UserButtonWrapper afterSignOutUrl="/" />
            </div>
          </nav>
        )}
      </div>
    </header>
    </>
  )
}

