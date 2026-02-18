import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
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
    icon: "/fevicon.png",
    apple: "/fevicon.png",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

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
          <link rel="icon" href="/fevicon.png" type="image/png" sizes="any" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {/* Google tag (gtag.js) - AW-17915227011 - load early so conversion hits can be sent */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=AW-17915227011"
            strategy="beforeInteractive"
          />
          <Script
            id="gtag-config"
            strategy="beforeInteractive"
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
          <Header />
          {children}
          <Footer />
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}

