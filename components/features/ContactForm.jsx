'use client'

import { useState } from 'react'

export default function ContactForm({ size = 'md' }) {
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
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: 'Thank you! Your message has been submitted successfully.',
        })
        setFormData({ name: '', email: '', phone: '', message: '' })
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

  const spacingMap = {
    xs: 'space-y-3',
    sm: 'space-y-4',
    md: 'space-y-6',
    lg: 'space-y-8',
  }

  const labelClass = size === 'sm' || size === 'xs' ? 'text-xs' : 'text-sm'
  const inputClass = size === 'sm' || size === 'xs' ? 'px-3 py-1.5 text-sm' : 'px-4 py-3'
  const messageRows = size === 'sm' || size === 'xs' ? 3 : 5
  const buttonClass = size === 'sm' || size === 'xs' ? 'py-2 text-sm' : 'py-3 text-base'

  return (
    <form onSubmit={handleSubmit} className={spacingMap[size] ?? spacingMap.md}>
      <div className={size === 'sm' || size === 'xs' ? 'text-sm' : ''}>
        <label htmlFor="name" className={`block font-medium text-gray-700 mb-2 ${labelClass}`}>
          Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400 ${inputClass}`}
          placeholder="Your Name"
        />
      </div>

      <div className={size === 'sm' || size === 'xs' ? 'text-sm' : ''}>
        <label htmlFor="email" className={`block font-medium text-gray-700 mb-2 ${labelClass}`}>
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400 ${inputClass}`}
          placeholder="your.email@example.com"
        />
      </div>

      <div className={size === 'sm' || size === 'xs' ? 'text-sm' : ''}>
        <label htmlFor="phone" className={`block font-medium text-gray-700 mb-2 ${labelClass}`}>
          Phone *
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          required
          value={formData.phone}
          onChange={handleChange}
          className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400 ${inputClass}`}
          placeholder="+91-9999999999"
        />
      </div>

      <div className={size === 'sm' || size === 'xs' ? 'text-sm' : ''}>
        <label htmlFor="message" className={`block font-medium text-gray-700 mb-2 ${labelClass}`}>
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={messageRows}
          value={formData.message}
          onChange={handleChange}
          className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400 ${size === 'sm' || size === 'xs' ? 'px-3 py-2 text-sm' : 'px-4 py-4'}`}
          placeholder="Your Message"
        />
      </div>

      {submitStatus.type && (
        <div
          className={`p-4 rounded-lg ${
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
        className={`w-full bg-[#AB090A] text-white rounded-lg font-semibold hover:bg-[#8a0708] transition disabled:opacity-50 disabled:cursor-not-allowed ${buttonClass}`}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}

