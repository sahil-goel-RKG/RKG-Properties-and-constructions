/**
 * Input validation and sanitization utilities
 */

/**
 * Validate email format
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false
  const phoneDigits = phone.replace(/\D/g, '')
  // Must have at least 10 digits
  return phoneDigits.length >= 10 && phoneDigits.length <= 15
}

/**
 * Sanitize text input - removes HTML tags and limits length
 */
export function sanitizeText(input, maxLength = 10000) {
  if (!input || typeof input !== 'string') return ''
  
  return input
    .trim()
    .slice(0, maxLength)
    // Remove potential HTML tags
    .replace(/[<>]/g, '')
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
}

/**
 * Sanitize text but allow basic formatting (for descriptions)
 */
export function sanitizeTextWithFormatting(input, maxLength = 50000) {
  if (!input || typeof input !== 'string') return ''
  
  return input
    .trim()
    .slice(0, maxLength)
    // Remove script tags and dangerous attributes
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
}

/**
 * Validate and sanitize name
 */
export function validateName(name, minLength = 2, maxLength = 200) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' }
  }
  
  const sanitized = sanitizeText(name, maxLength)
  
  if (sanitized.length < minLength) {
    return { valid: false, error: `Name must be at least ${minLength} characters long` }
  }
  
  return { valid: true, value: sanitized }
}

/**
 * Validate and sanitize email
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' }
  }
  
  const sanitized = sanitizeText(email, 255).toLowerCase()
  
  if (!isValidEmail(sanitized)) {
    return { valid: false, error: 'Invalid email format' }
  }
  
  return { valid: true, value: sanitized }
}

/**
 * Validate and sanitize phone
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' }
  }
  
  const sanitized = sanitizeText(phone, 20)
  
  if (!isValidPhone(sanitized)) {
    return { valid: false, error: 'Invalid phone number. Must contain at least 10 digits.' }
  }
  
  return { valid: true, value: sanitized }
}

/**
 * Validate and sanitize message
 */
export function validateMessage(message, minLength = 10, maxLength = 5000) {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Message is required' }
  }
  
  const sanitized = sanitizeText(message, maxLength)
  
  if (sanitized.length < minLength) {
    return { valid: false, error: `Message must be at least ${minLength} characters long` }
  }
  
  return { valid: true, value: sanitized }
}

/**
 * Validate URL
 */
export function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Validate slug format
 */
export function isValidSlug(slug) {
  if (!slug || typeof slug !== 'string') return false
  // Allow lowercase letters, numbers, and hyphens
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug) && slug.length >= 1 && slug.length <= 200
}

/**
 * Sanitize slug
 */
export function sanitizeSlug(input) {
  if (!input || typeof input !== 'string') return ''
  
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .slice(0, 200)
}

/**
 * Validate number
 */
export function validateNumber(value, min = null, max = null) {
  if (value === null || value === undefined || value === '') {
    return { valid: true, value: null } // Allow empty/null
  }
  
  const num = Number(value)
  
  if (isNaN(num)) {
    return { valid: false, error: 'Must be a valid number' }
  }
  
  if (min !== null && num < min) {
    return { valid: false, error: `Must be at least ${min}` }
  }
  
  if (max !== null && num > max) {
    return { valid: false, error: `Must be at most ${max}` }
  }
  
  return { valid: true, value: num }
}

