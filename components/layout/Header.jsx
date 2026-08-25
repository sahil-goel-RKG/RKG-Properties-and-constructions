'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
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

const navLink =
  'h-full px-4 flex items-center text-[#a3a3a3] hover:text-[#c9a227] hover:bg-white/5 transition-colors'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isPropertyOpen, setIsPropertyOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const closeTimeoutRef = useRef(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMenuOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }
    } else {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [isMenuOpen])

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  const mobileMenu = isMenuOpen ? (
    <div className="mobile-nav-overlay" role="presentation">
      <button
        type="button"
        className="mobile-nav-overlay__scrim"
        aria-label="Close menu"
        onClick={() => setIsMenuOpen(false)}
      />
      <nav className="mobile-nav-overlay__panel" aria-label="Mobile navigation">
        <div className="container mx-auto px-3 py-4 space-y-1">
          <Link
            href="/"
            className="block py-3 text-[#a3a3a3] hover:text-[#c9a227] active:text-[#c9a227] touch-manipulation min-h-[44px] flex items-center"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <details className="group" open={false}>
            <summary className="flex justify-between items-center py-3 text-[#a3a3a3] hover:text-[#c9a227] cursor-pointer touch-manipulation min-h-[44px]">
              Properties
              <span className="text-sm text-[#737373] group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="pl-4 space-y-1">
              {propertySections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <div className="py-2 label-upper">{section.title}</div>
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block py-2 pl-4 text-[#a3a3a3] hover:text-[#c9a227] touch-manipulation min-h-[44px] flex items-center"
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
            className="block py-3 text-[#a3a3a3] hover:text-[#c9a227] touch-manipulation min-h-[44px] flex items-center"
            onClick={() => setIsMenuOpen(false)}
          >
            About Us
          </Link>
          <Link
            href="/contact"
            className="block py-3 text-[#a3a3a3] hover:text-[#c9a227] touch-manipulation min-h-[44px] flex items-center"
            onClick={() => setIsMenuOpen(false)}
          >
            Contact Us
          </Link>
          <Link
            href="/contact"
            className="btn-primary w-full mt-3"
            onClick={() => setIsMenuOpen(false)}
            data-ga="header_book_consultation_mobile"
          >
            Book Consultation
          </Link>
          <div className="py-2 pt-4 border-t border-[#2a2a2a]">
            <UserButtonWrapper afterSignOutUrl="/" />
          </div>
        </div>
      </nav>
    </div>
  ) : null

  return (
    <>
      <style jsx>{`
        .logo-hover-group:hover .logo-image {
          filter: drop-shadow(0 2px 16px rgba(201, 162, 39, 0.55));
        }
        .logo-hover-group:hover .logo-text {
          text-shadow: 0 0 20px rgba(201, 162, 39, 0.45);
        }
      `}</style>
      <header className={`header-glass sticky top-0 ${isMenuOpen ? 'z-[10001]' : 'z-50'}`}>
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16 py-0">
            <Link
              href="/"
              className="flex items-center gap-1 sm:gap-2 logo-hover-group transition-all duration-300"
            >
              <Image
                src="/img/Logo4.png"
                alt="RKG Properties & Constructions Logo"
                width={100}
                height={100}
                className="object-contain -mb-2 logo-image transition-all duration-300 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
                priority
              />
              <div className="flex flex-col items-start -ml-3 sm:-ml-5">
                <span className="font-serif-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide leading-none logo-text golden-text transition-all duration-300">
                  RKG
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center h-full gap-1">
              <nav className="flex items-center h-full">
                <Link href="/" className={navLink}>
                  Home
                </Link>
                <div
                  className="relative h-full"
                  onMouseEnter={() => {
                    if (closeTimeoutRef.current) {
                      clearTimeout(closeTimeoutRef.current)
                      closeTimeoutRef.current = null
                    }
                    setIsPropertyOpen(true)
                  }}
                  onMouseLeave={() => {
                    closeTimeoutRef.current = setTimeout(() => {
                      setIsPropertyOpen(false)
                      closeTimeoutRef.current = null
                    }, 100)
                  }}
                >
                  <button className={`${navLink} gap-2`}>
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
                    <div className="absolute left-0 top-full mt-1 w-56 surface-elevated rounded-lg py-2 shadow-lg">
                      {propertySections.map((section, sectionIndex) => (
                        <div key={sectionIndex}>
                          <div className="px-4 py-2 label-upper">{section.title}</div>
                          {section.items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="block px-4 py-2 pl-6 text-sm text-[#a3a3a3] hover:bg-white/5 hover:text-[#c9a227] transition-colors"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Link href="/about" className={navLink}>
                  About Us
                </Link>
                <Link href="/contact" className={navLink}>
                  Contact Us
                </Link>
              </nav>
              <Link
                href="/contact"
                className="btn-primary ml-2 !min-h-[40px] !py-2 !px-4 text-sm"
                data-ga="header_book_consultation"
              >
                Book Consultation
              </Link>
              <div className="flex items-center ml-2">
                <UserButtonWrapper afterSignOutUrl="/" />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center text-[#c0c0c0] hover:text-[#c9a227]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>
      {isMounted && mobileMenu ? createPortal(mobileMenu, document.body) : null}
    </>
  )
}
