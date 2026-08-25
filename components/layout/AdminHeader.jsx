'use client'

import Link from 'next/link'
import Image from 'next/image'
import UserButtonWrapper from '@/app/builder-floor/UserButtonWrapper'
import '@/app/admin/admin-theme.css'

const navLinks = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/edit-property', label: 'Edit Property' },
  { href: '/admin/add-listing', label: 'Add Listing' },
  { href: '/admin/sync-developers', label: 'Sync Developers' },
]

export default function AdminHeader() {
  return (
    <header className="admin-header sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/img/Logo4.png"
              alt="RKG Properties & Constructions Logo"
              width={80}
              height={80}
              className="object-contain w-12 h-12 sm:w-14 sm:h-14"
              priority
            />
            <div className="flex items-baseline gap-2">
              <span
                className="text-2xl sm:text-3xl font-extrabold leading-none"
                style={{ letterSpacing: '0.05em', fontFamily: 'Georgia, serif', color: '#DEB63B' }}
              >
                RKG
              </span>
              <span className="admin-brand-sub text-sm sm:text-base font-bold">Admin</span>
            </div>
          </Link>

          <div className="flex items-center h-full">
            <nav className="hidden lg:flex items-center h-full">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="admin-nav-link h-full px-3 sm:px-4 flex items-center transition whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/"
                className="admin-nav-link h-full px-3 sm:px-4 flex items-center transition whitespace-nowrap"
              >
                Website
              </Link>
            </nav>
            <div className="flex items-center ml-2">
              <UserButtonWrapper afterSignOutUrl="/" />
            </div>
          </div>
        </div>

        <nav className="lg:hidden pb-3 flex items-center gap-2 overflow-x-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="admin-nav-pill px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/"
            className="admin-nav-pill px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition"
          >
            Website
          </Link>
        </nav>
      </div>
    </header>
  )
}
