'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { fireGoogleAdsLeadConversion } from '@/lib/gtag'

const CONTACT_POPUP_SESSION_KEY = 'contactPopupHandled'

function isPopupHandled() {
  if (typeof window === 'undefined') return true
  return sessionStorage.getItem(CONTACT_POPUP_SESSION_KEY) === 'true'
}

function markPopupHandled() {
  sessionStorage.setItem(CONTACT_POPUP_SESSION_KEY, 'true')
}

export default function ContactPopup() {
  const pathname = usePathname()
  const initRef = useRef(false)
  const [isVisible, setIsVisible] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    // spam defenses
    company: '',
    website: '',
    ts: String(Date.now()),
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    if (
      typeof pathname === 'string' &&
      (pathname.startsWith('/crm') || pathname.startsWith('/admin'))
    ) {
      return
    }

    if (isPopupHandled()) {
      return
    }

    const delay = Math.random() * 1000 + 1000
    const timer = setTimeout(() => {
      markPopupHandled()
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [pathname])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      })
    }
    setSubmitError('')
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else {
      const phoneDigits = formData.phone.replace(/\D/g, '')
      if (phoneDigits.length < 10 || phoneDigits.length > 15) {
        newErrors.phone = 'Please enter a valid phone number (10-15 digits)'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // 1. User submits form → send to backend
      const response = await fetch('/api/contact/popup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setSubmitError(data.error || 'Something went wrong. Please try again.')
        return
      }

      // 2. Backend returned success
      // 3. Fire gtag conversion once → Google Ads receives hit
      fireGoogleAdsLeadConversion()

      // 4. Update UI (mark handled, close popup)
      markPopupHandled()
      setIsVisible(false)
    } catch (error) {
      setSubmitError('Network error. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle close button click
  const handleClose = (e) => {
    e.preventDefault()
    e.stopPropagation()
    markPopupHandled()
    setIsVisible(false)
  }

  // Prevent closing on backdrop click or ESC key
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      // Do nothing - popup is non-skippable
      return
    }
  }

  // Prevent ESC key from closing
  useEffect(() => {
    if (isVisible) {
      const handleEsc = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          e.stopPropagation()
        }
      }
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }
  }, [isVisible])

  if (!isVisible) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
      style={{ pointerEvents: 'auto' }}
    >
      <div className="relative card-luxury rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col mx-auto animate-in fade-in zoom-in duration-300 border border-[#2a2a2a]">
        <div className="flex-shrink-0 flex items-center justify-end p-2 pr-1 sm:p-3 sm:pr-2 border-b border-[#2a2a2a]">
          <button
            onClick={handleClose}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="w-10 h-10 flex items-center justify-center rounded-full surface-elevated text-[#a3a3a3] hover:text-[#f5f5f5] cursor-pointer touch-manipulation transition-colors"
            aria-label="Close popup"
            title="Close"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pt-2 sm:pt-4">
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif-display text-[#f5f5f5] mb-2">
            Get in Touch
          </h2>
          <p className="text-[#a3a3a3] text-xs sm:text-sm md:text-base">
            Please provide your contact details to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label htmlFor="name" className="form-label text-xs sm:text-sm">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input px-3 sm:px-4 py-2.5 sm:py-3 text-base ${
                errors.name ? 'border-red-500' : 'border-[#2a2a2a]'
              }`}
              placeholder="Enter your full name"
              disabled={isSubmitting}
              autoComplete="name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="form-label text-xs sm:text-sm">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input px-3 sm:px-4 py-2.5 sm:py-3 text-base ${
                errors.email ? 'border-red-500' : 'border-[#2a2a2a]'
              }`}
              placeholder="Enter your email address"
              disabled={isSubmitting}
              autoComplete="email"
              inputMode="email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="form-label text-xs sm:text-sm">
              Phone Number <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`form-input px-3 sm:px-4 py-2.5 sm:py-3 text-base ${
                errors.phone ? 'border-red-500' : 'border-[#2a2a2a]'
              }`}
              placeholder="Enter your phone number"
              disabled={isSubmitting}
              autoComplete="tel"
              inputMode="tel"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          {submitError && (
            <div className="alert-error text-sm">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full mt-4 sm:mt-6 text-base touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit'
            )}
          </button>
        </form>
        </div>
      </div>
    </div>
  )
}
