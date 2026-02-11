'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { fireGoogleAdsLeadConversion } from '@/lib/gtag'

export default function ContactPopup() {
  const { user, isLoaded } = useUser()
  const [isVisible, setIsVisible] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    // Check if user has already submitted in this session
    const hasSubmitted = sessionStorage.getItem('contactPopupSubmitted')
    
    if (!hasSubmitted) {
      // Show popup after 1-2 seconds (randomized between 1000-2000ms)
      const delay = Math.random() * 1000 + 1000 // 1000-2000ms
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [])

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

      // 4. Update UI (mark submitted, close popup)
      sessionStorage.setItem('contactPopupSubmitted', 'true')
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
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col mx-auto animate-in fade-in zoom-in duration-300">
        {/* Top bar: close button always visible in top-right */}
        <div className="flex-shrink-0 flex items-center justify-end p-2 pr-1 sm:p-3 sm:pr-2 border-b border-gray-100">
          <button
            onClick={handleClose}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 cursor-pointer touch-manipulation transition-colors"
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
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Get in Touch
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base">
            Please provide your contact details to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base text-gray-900 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c99700] transition placeholder:text-gray-400 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
              disabled={isSubmitting}
              autoComplete="name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base text-gray-900 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c99700] transition placeholder:text-gray-400 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
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

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base text-gray-900 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c99700] transition placeholder:text-gray-400 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
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

          {/* Error Message */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {submitError}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#c99700] hover:bg-[#a67800] active:bg-[#a67800] text-white font-semibold py-3 sm:py-3.5 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4 sm:mt-6 text-base touch-manipulation min-h-[44px]"
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
