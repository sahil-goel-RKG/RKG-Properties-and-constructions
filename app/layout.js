import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import InactivityTimer from "@/components/features/InactivityTimer";
import ContactPopup from "@/components/features/ContactPopup";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "RKG Properties and Constructions | Excellence in Real Estate Solutions",
  description: "Premium residential and commercial properties in Gurgaon. Your trusted partner for real estate solutions.",
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
          <InactivityTimer />
          <ContactPopup />
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

