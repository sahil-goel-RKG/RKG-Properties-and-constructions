'use client'

import { useState } from 'react'
import { fireGoogleAdsLeadConversion } from '@/lib/gtag'

export default function ContactForm({ size = 'md', defaultMessage = '' }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: defaultMessage,
    // spam defenses
    company: '',
    website: '',
    ts: String(Date.now()),
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
      // 1. User submits form → send to backend
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setSubmitStatus({
          type: 'error',
          message: data.error || 'Something went wrong. Please try again.',
        })
        return
      }

      // 2. Backend returned success
      // 3. Fire gtag conversion once → Google Ads receives hit
      fireGoogleAdsLeadConversion()

      // 4. Update UI
      setSubmitStatus({
        type: 'success',
        message: 'Thank you! Your message has been submitted successfully.',
      })
      setFormData({ name: '', email: '', phone: '', message: '' })
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
    <form
      id="contact-form"
      name="contact"
      method="post"
      action="/api/contact"
      encType="application/x-www-form-urlencoded"
      onSubmit={handleSubmit}
      className={`${spacingMap[size] ?? spacingMap.md} min-w-0 w-full max-w-full box-border`}
    >
      {/* Honeypot fields (bots often fill these). Keep visually hidden. */}
      <div className="hidden" aria-hidden="true">
        <label>
          Company
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={formData.company}
            onChange={handleChange}
          />
        </label>
        <label>
          Website
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={formData.website}
            onChange={handleChange}
          />
        </label>
        <input type="hidden" name="ts" value={formData.ts} />
      </div>
      <div className={size === 'sm' || size === 'xs' ? 'text-sm' : ''}>
        <label htmlFor="name" className={`form-label ${labelClass}`}>
          Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className={`form-input ${inputClass}`}
          placeholder="Your Name"
        />
      </div>

      <div className={size === 'sm' || size === 'xs' ? 'text-sm' : ''}>
        <label htmlFor="email" className={`form-label ${labelClass}`}>
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className={`form-input ${inputClass}`}
          placeholder="your.email@example.com"
        />
      </div>

      <div className={size === 'sm' || size === 'xs' ? 'text-sm' : ''}>
        <label htmlFor="phone" className={`form-label ${labelClass}`}>
          Phone *
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          required
          value={formData.phone}
          onChange={handleChange}
          className={`form-input ${inputClass}`}
          placeholder="+91-9999999999"
        />
      </div>

      <div className={size === 'sm' || size === 'xs' ? 'text-sm' : ''}>
        <label htmlFor="message" className={`form-label ${labelClass}`}>
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={messageRows}
          value={formData.message}
          onChange={handleChange}
          className={`form-input ${size === 'sm' || size === 'xs' ? 'px-3 py-2 text-sm' : 'px-4 py-4'}`}
          placeholder="Your Message"
        />
      </div>

      {submitStatus.type && (
        <div
          className={submitStatus.type === 'success' ? 'alert-success' : 'alert-error'}
        >
          {submitStatus.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={`btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed ${buttonClass}`}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}
