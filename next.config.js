/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Homepage: allow CDN to cache HTML (ISR revalidate still applies)
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=600, stale-while-revalidate=300',
          },
        ],
      },
      {
        // Long cache for static assets (Vercel CDN)
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.com https://*.clerk.accounts.dev https://clerk.rkgproperties.in https://www.google.com https://www.gstatic.com https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://www.recaptcha.net",
              "worker-src 'self' blob: https://*.clerk.com https://*.clerk.accounts.dev https://clerk.rkgproperties.in",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.clerk.com https://*.clerk.accounts.dev https://clerk.rkgproperties.in",
              "font-src 'self' data: https://fonts.gstatic.com https://*.clerk.com https://clerk.rkgproperties.in",
              "img-src 'self' data: https: blob: https://www.googleads.g.doubleclick.net",
              "connect-src 'self' https://*.supabase.co https://*.clerk.com https://*.clerk.accounts.dev https://clerk.rkgproperties.in https://www.google.com https://www.gstatic.com https://www.googletagmanager.com https://www.google-analytics.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://www.recaptcha.net",
              "frame-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://clerk.rkgproperties.in https://www.google.com https://www.gstatic.com https://www.googletagmanager.com https://www.recaptcha.net https://www.youtube.com https://www.youtube-nocookie.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://*.clerk.com https://*.clerk.accounts.dev",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

