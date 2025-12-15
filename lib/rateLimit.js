/**
 * Simple in-memory rate limiter
 * For production, consider using Redis-based solution like @upstash/ratelimit
 */

class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
    this.requests = new Map()
  }

  // Clean up old entries periodically
  cleanup() {
    const now = Date.now()
    for (const [key, value] of this.requests.entries()) {
      if (now - value.resetTime > this.windowMs) {
        this.requests.delete(key)
      }
    }
  }

  async limit(identifier) {
    const now = Date.now()
    
    // Cleanup old entries every 100 requests
    if (Math.random() < 0.01) {
      this.cleanup()
    }

    const record = this.requests.get(identifier)

    if (!record) {
      // First request
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return { success: true, remaining: this.maxRequests - 1 }
    }

    // Check if window has expired
    if (now > record.resetTime) {
      // Reset window
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return { success: true, remaining: this.maxRequests - 1 }
    }

    // Check if limit exceeded
    if (record.count >= this.maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetTime: record.resetTime
      }
    }

    // Increment count
    record.count++
    return {
      success: true,
      remaining: this.maxRequests - record.count
    }
  }
}

// Rate limiters for different endpoints
export const contactFormLimiter = new RateLimiter(5, 60 * 60 * 1000) // 5 requests per hour
export const apiLimiter = new RateLimiter(100, 60 * 1000) // 100 requests per minute
export const authLimiter = new RateLimiter(10, 15 * 60 * 1000) // 10 requests per 15 minutes

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request) {
  // Try to get IP from various headers (for production with proxies)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  
  return ip
}

