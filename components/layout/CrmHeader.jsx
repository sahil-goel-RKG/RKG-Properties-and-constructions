'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import UserButtonWrapper from '@/app/builder-floor/UserButtonWrapper'

const navItem =
  'h-full px-3 sm:px-4 flex items-center text-gray-700 hover:text-[#c99700] hover:bg-gray-100 transition whitespace-nowrap'

export default function CrmHeader() {
  const [isAdmin, setIsAdmin] = useState(false)
  useEffect(() => {
    let cancelled = false
    fetch('/api/crm/whoami')
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return
        setIsAdmin(Boolean(j?.isAdmin))
      })
      .catch(() => {
        if (cancelled) return
        setIsAdmin(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link href="/crm" className="flex items-center gap-2">
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
              <span className="text-sm sm:text-base font-bold text-gray-900">
                CRM
              </span>
            </div>
          </Link>

          <div className="flex items-center h-full">
            <nav className="hidden md:flex items-center h-full">
              <Link href="/crm" className={navItem}>
                Leads
              </Link>
              {isAdmin ? (
                <>
                  <Link href="/crm/add" className={navItem}>
                    Add Lead
                  </Link>
                  <Link href="/crm/import" className={navItem}>
                    Import CSV
                  </Link>
                </>
              ) : null}
            </nav>
            <div className="flex items-center ml-2">
              <UserButtonWrapper afterSignOutUrl="/" />
            </div>
          </div>
        </div>

        <nav className="md:hidden pb-3 flex items-center gap-2 overflow-x-auto">
          <Link
            href="/crm"
            className="px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 whitespace-nowrap"
          >
            Leads
          </Link>
          {isAdmin ? (
            <>
              <Link
                href="/crm/add"
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 whitespace-nowrap"
              >
                Add Lead
              </Link>
              <Link
                href="/crm/import"
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 whitespace-nowrap"
              >
                Import CSV
              </Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  )
}

