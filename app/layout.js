import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import "./globals.css";
import HeaderRouter from "@/components/layout/HeaderRouter";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import ClientOverlays from "@/components/layout/ClientOverlays";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "RKG Properties and Constructions | Excellence in Real Estate Solutions",
  description: "Premium residential and commercial properties in Gurgaon. Your trusted partner for real estate solutions.",
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

const supabaseOrigin =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === 'string' && process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
    : null

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      domain="rkgproperties.in"
      appearance={{
        variables: {
          colorPrimary: '#c99700',
        },
        elements: {
          formButtonPrimary: 'bg-[#c99700] hover:bg-[#a67800]',
        },
      }}
    >
      <html lang="en">
        <head>
          <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
          <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
          {supabaseOrigin && (
            <>
              <link rel="preconnect" href={supabaseOrigin} />
              <link rel="dns-prefetch" href={supabaseOrigin} />
            </>
          )}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'RealEstateAgent',
                name: 'RKG Properties and Constructions',
                description: 'Premium residential and commercial properties in Gurgaon. Your trusted partner for real estate solutions.',
                url: 'https://rkgproperties.in',
                areaServed: { '@type': 'City', name: 'Gurgaon', containedInPlace: { '@type': 'State', name: 'Haryana' } },
                address: { '@type': 'PostalAddress', streetAddress: 'Sector 57, Sushant Lok', addressLocality: 'Gurugram', postalCode: '122001' },
                telephone: ['+91-8851753005', '+91-9220286089'],
                email: 'sahil@rkgproperties.in',
              }),
            }}
          />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden min-w-0`}
        >
          {/* Google tag (gtag.js) - AW-17915227011 - load early so conversion hits can be sent */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=AW-17915227011"
            strategy="afterInteractive"
          />
          <Script
            id="gtag-config"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'AW-17915227011');
              `,
            }}
          />
          <ClientOverlays />
          <HeaderRouter />
          <main className="min-w-0 overflow-x-hidden">{children}</main>
          <Footer />
          <WhatsAppButton />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                document.body.addEventListener('click', function(e) {
                  var a = e.target.closest('a[data-ga]');
                  if (a && typeof gtag === 'function') {
                    gtag('event', 'click', { event_category: 'CTA', event_label: a.getAttribute('data-ga') });
                  }
                });
              `,
            }}
          />
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}

