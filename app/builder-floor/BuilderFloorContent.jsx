'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import ContactForm from '@/components/features/ContactForm'

export default function BuilderFloorContent({ children }) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loadingTimeout, setLoadingTimeout] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTimeout(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isLoaded && user) {
      const urlParams = new URLSearchParams(window.location.search)
      const returnUrl = urlParams.get('returnUrl')
      const storedReturnUrl = typeof window !== 'undefined' ? sessionStorage.getItem('returnUrl') : null
      
      if (returnUrl && returnUrl !== pathname) {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('returnUrl')
        }
        router.replace(decodeURIComponent(returnUrl))
      } else if (storedReturnUrl && storedReturnUrl !== pathname) {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('returnUrl')
        }
        router.replace(decodeURIComponent(storedReturnUrl))
      }
    }
  }, [isLoaded, user, pathname, router])

  if (!isLoaded && !loadingTimeout) {
    return (
      <div className="page-shell flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c9a227] mx-auto mb-4"></div>
          <p className="text-[#a3a3a3]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || (!isLoaded && loadingTimeout)) {
    return (
      <div className="page-shell py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="card-luxury p-8">
                <h1 className="text-3xl font-bold font-serif-display text-[#f5f5f5] mb-4">
                  Builder Floor Projects
                </h1>
                <p className="text-lg text-[#a3a3a3] mb-6">
                  Builder floors are currently under admin&apos;s control. Please fill the contact form below to get in touch with us.
                </p>
                <div className="mt-8">
                  <ContactForm size="sm" />
                </div>
              </div>

              <div className="card-luxury p-8 flex flex-col items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <h2 className="text-2xl font-bold font-serif-display text-[#f5f5f5] mb-4">
                    Admin Access
                  </h2>
                  <p className="text-[#a3a3a3] mb-8">
                    If you are an admin, please sign in to access the builder floor listings.
                  </p>
                  <button
                    onClick={() => {
                      const currentPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
                      if (typeof window !== 'undefined') {
                        sessionStorage.setItem('returnUrl', currentPath)
                      }
                      router.push(`/admin/login?returnUrl=${encodeURIComponent(currentPath)}`)
                    }}
                    className="btn-primary w-full"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
