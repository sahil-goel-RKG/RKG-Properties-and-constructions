/**
 * Application Constants
 * Centralized configuration for the application
 */

// Inactivity timeout (5 minutes)
export const INACTIVITY_TIMEOUT = 5 * 60 * 1000

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

// Colors
export const COLORS = {
  PRIMARY: '#c99700',
  PRIMARY_HOVER: '#a67800',
  RED: '#AB090A',
  RED_HOVER: '#8a0708',
  GOLDEN: '#DEB63B',
}

