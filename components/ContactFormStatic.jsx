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
        <label htmlFor="name" className={`block font-medium text-gray-700 mb-2 ${labelClass}`}>
          Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          autoComplete="name"
          required
          className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400 ${inputClass}`}
          placeholder="Your Name"
        />
      </div>

      <div>
        <label htmlFor="email" className={`block font-medium text-gray-700 mb-2 ${labelClass}`}>
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          autoComplete="email"
          required
          className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400 ${inputClass}`}
          placeholder="your.email@example.com"
        />
      </div>

      <div>
        <label htmlFor="phone" className={`block font-medium text-gray-700 mb-2 ${labelClass}`}>
          Phone *
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          autoComplete="tel"
          required
          className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400 ${inputClass}`}
          placeholder="+91-9999999999"
        />
      </div>

      <div>
        <label htmlFor="message" className={`block font-medium text-gray-700 mb-2 ${labelClass}`}>
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          defaultValue={defaultMessage}
          className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400 px-4 py-4"
          placeholder="Your Message"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-[#AB090A] text-white rounded-lg font-semibold hover:bg-[#8a0708] transition py-3 text-base"
      >
        Submit
      </button>
    </form>
  )
}
