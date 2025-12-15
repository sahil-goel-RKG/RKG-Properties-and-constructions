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
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.com https://*.clerk.accounts.dev https://www.google.com https://www.gstatic.com https://www.recaptcha.net",
              "worker-src 'self' blob: https://*.clerk.com https://*.clerk.accounts.dev",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.clerk.com https://*.clerk.accounts.dev",
              "font-src 'self' data: https://fonts.gstatic.com https://*.clerk.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.supabase.co https://*.clerk.com https://*.clerk.accounts.dev https://www.google.com https://www.gstatic.com https://www.recaptcha.net",
              "frame-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://www.google.com https://www.gstatic.com https://www.recaptcha.net",
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

