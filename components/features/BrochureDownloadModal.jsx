'use client'

import { useState } from 'react'
import ContactForm from './ContactForm'

export default function BrochureDownloadModal({ isOpen, onClose, onDownload, projectName }) {
  const [formSubmitted, setFormSubmitted] = useState(false)

  if (!isOpen) return null

  const handleFormSuccess = () => {
    setFormSubmitted(true)
    // Trigger download after a short delay
    setTimeout(() => {
      onDownload()
      onClose()
    }, 1000)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
        <div className="border-b border-gray-200 px-5 py-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            Contact Us to Download Brochure
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-5">
          {formSubmitted ? (
            <div className="text-center py-6">
              <div className="mb-3">
                <svg className="w-12 h-12 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-base font-semibold text-gray-900 mb-1">Thank you!</p>
              <p className="text-sm text-gray-600">Your brochure download will start shortly...</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-700 mb-4">
                Please fill out the form below to download the brochure for{' '}
                <span className="font-semibold">{projectName}</span>.
              </p>
              <ContactFormWithCallback onSuccess={handleFormSuccess} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Wrapper component to handle form submission callback
function ContactFormWithCallback({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState({
    type: null,
    message: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source: 'brochure_download', // Flag to identify brochure download requests
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: 'Thank you! Your message has been submitted successfully.',
        })
        // Call onSuccess callback after successful submission
        setTimeout(() => {
          onSuccess()
        }, 500)
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.error || 'Something went wrong. Please try again.',
        })
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Network error. Please try again later.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400"
          placeholder="Your Name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400"
          placeholder="your.email@example.com"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1">
          Phone *
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          required
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400"
          placeholder="+91-9999999999"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-xs font-medium text-gray-700 mb-1">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={3}
          value={formData.message}
          onChange={handleChange}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400"
          placeholder="Your Message"
        />
      </div>

      {submitStatus.type && (
        <div
          className={`p-3 rounded-lg text-sm ${
            submitStatus.type === 'success'
              ? 'bg-[#fff5d6] text-[#a67800] border border-[#f2cd6d]'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {submitStatus.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#AB090A] text-white rounded-lg font-semibold hover:bg-[#8a0708] transition disabled:opacity-50 disabled:cursor-not-allowed py-2 text-sm"
      >
        {isSubmitting ? 'Submitting...' : 'Submit & Download Brochure'}
      </button>
    </form>
  )
}

