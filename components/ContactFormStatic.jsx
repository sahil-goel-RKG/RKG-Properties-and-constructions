/**
 * Server-rendered contact form (no 'use client') so crawlers and Google Ads
 * "Form submission" setup see a real <form> in the initial HTML.
 */
export default function ContactFormStatic({ defaultMessage = '' }) {
  const labelClass = 'text-sm'
  const inputClass = 'px-4 py-3'

  return (
    <form
      id="contact-form"
      name="contact"
      method="post"
      action="/api/contact"
      encType="application/x-www-form-urlencoded"
      className="space-y-6 min-w-0 w-full max-w-full box-border"
    >
      {/* Honeypot fields (bots often fill these). Visually hidden. */}
      <div className="hidden" aria-hidden="true">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div>
        <label htmlFor="name" className={`form-label ${labelClass}`}>
          Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          autoComplete="name"
          required
          className={`form-input ${inputClass}`}
          placeholder="Your Name"
        />
      </div>

      <div>
        <label htmlFor="email" className={`form-label ${labelClass}`}>
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          autoComplete="email"
          required
          className={`form-input ${inputClass}`}
          placeholder="your.email@example.com"
        />
      </div>

      <div>
        <label htmlFor="phone" className={`form-label ${labelClass}`}>
          Phone *
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          autoComplete="tel"
          required
          className={`form-input ${inputClass}`}
          placeholder="+91-9999999999"
        />
      </div>

      <div>
        <label htmlFor="message" className={`form-label ${labelClass}`}>
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          defaultValue={defaultMessage}
          className="form-input px-4 py-4"
          placeholder="Your Message"
        />
      </div>

      <button
        type="submit"
        className="btn-primary w-full py-3 text-base"
      >
        Submit
      </button>
    </form>
  )
}
