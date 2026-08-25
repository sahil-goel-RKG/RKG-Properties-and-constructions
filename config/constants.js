/**
 * Application Constants
 * Centralized configuration for the application
 */

// Inactivity timeout (10 minutes)
export const INACTIVITY_TIMEOUT = 10 * 60 * 1000

// Pagination
export const ITEMS_PER_PAGE = 12

// Rate Limiting
export const RATE_LIMIT_MAX_REQUESTS = 5
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

// Revalidation
export const REVALIDATE_TIME = 1800 // 30 minutes in seconds

// Email Configuration
export const DEFAULT_CONTACT_EMAIL = 'sahil@rkgproperties.in'
export const DEFAULT_FROM_EMAIL = 'onboarding@resend.dev'

// Office address
export const OFFICE_ADDRESS = {
  full: '9th floor, Badshahpur Sohna Road Highway, Sohna - Gurgaon Rd, Gurugram, Haryana 122018',
  lines: [
    '9th floor, Badshahpur Sohna Road Highway',
    'Sohna - Gurgaon Rd, Gurugram, Haryana 122018',
  ],
  postal: {
    '@type': 'PostalAddress',
    streetAddress: '9th floor, Badshahpur Sohna Road Highway, Sohna - Gurgaon Rd',
    addressLocality: 'Gurugram',
    addressRegion: 'Haryana',
    postalCode: '122018',
    addressCountry: 'IN',
  },
}

// Routes
export const ROUTES = {
  HOME: '/',
  APARTMENTS: '/apartments',
  BUILDER_FLOORS: '/builder-floor',
  CONTACT: '/contact',
  ABOUT: '/about',
  ADMIN: '/admin',
  ADMIN_LOGIN: '/admin/login',
}

// Property Types
export const PROPERTY_TYPES = {
  APARTMENT: 'apartment',
  BUILDER_FLOOR: 'builder-floor',
}

// Status Types
export const STATUS_TYPES = {
  READY_TO_MOVE: 'ready-to-move',
  UNDER_CONSTRUCTION: 'under-construction',
}

// Dark luxury theme colors (public site)
export const COLORS = {
  BACKGROUND: '#0a0a0a',
  SURFACE: '#141414',
  SURFACE_ELEVATED: '#1e1e1e',
  BORDER: '#2a2a2a',
  TEXT_PRIMARY: '#f5f5f5',
  TEXT_MUTED: '#a3a3a3',
  PRIMARY: '#c9a227',
  PRIMARY_HOVER: '#e0b840',
  SILVER: '#c0c0c0',
  SILVER_LIGHT: '#e8e8e8',
  NAVY: '#0f2744',
  // Legacy aliases (prefer PRIMARY / SILVER in new UI)
  RED: '#AB090A',
  RED_HOVER: '#8a0708',
  GOLDEN: '#c9a227',
}

