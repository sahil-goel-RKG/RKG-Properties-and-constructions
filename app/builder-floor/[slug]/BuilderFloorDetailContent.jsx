'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import ContactForm from '@/components/features/ContactForm'

export default function BuilderFloorDetailContent({ children }) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Handle redirect after authentication - check if we came from login with returnUrl
  useEffect(() => {
    if (isLoaded && user) {
      // Check if there's a returnUrl in the URL (from Clerk redirect or query param)
      const urlParams = new URLSearchParams(window.location.search)
      const returnUrl = urlParams.get('returnUrl')
      
      // Also check sessionStorage for returnUrl (stored before redirecting to login)
      const storedReturnUrl = typeof window !== 'undefined' ? sessionStorage.getItem('returnUrl') : null
      
      if (returnUrl && returnUrl !== pathname) {
        // Clear sessionStorage and redirect
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('returnUrl')
        }
        router.replace(decodeURIComponent(returnUrl))
      } else if (storedReturnUrl && storedReturnUrl !== pathname) {
        // Use stored returnUrl if no query param
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('returnUrl')
        }
        router.replace(decodeURIComponent(storedReturnUrl))
      }
    }
  }, [isLoaded, user, pathname, router])

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c99700] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is not authenticated, show login/contact form
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Left Section - Message and Contact Form */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Builder Floor Details
                </h1>
                <p className="text-lg text-gray-700 mb-6">
                  Builder floors are currently under admin&apos;s control. Please fill the contact form below to get in touch with us.
                </p>
                <div className="mt-8">
                  <ContactForm size="sm" />
                </div>
              </div>

              {/* Right Section - Login Button */}
              <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Admin Access
                  </h2>
                  <p className="text-gray-600 mb-8">
                    If you are an admin, please sign in to access the builder floor details.
                  </p>
                  <button
                    onClick={() => {
                      // Get the full current path including search params
                      const currentPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
                      // Store returnUrl in sessionStorage as backup
                      if (typeof window !== 'undefined') {
                        sessionStorage.setItem('returnUrl', currentPath)
                      }
                      router.push(`/admin/login?returnUrl=${encodeURIComponent(currentPath)}`)
                    }}
                    className="w-full px-8 py-3 bg-[#c99700] text-white rounded-lg font-semibold hover:bg-[#a67800] transition"
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

  // If user is authenticated, show the normal builder floor details
  return <>{children}</>
}

