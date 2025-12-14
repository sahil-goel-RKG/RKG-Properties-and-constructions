import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import InactivityTimer from "@/components/features/InactivityTimer";

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

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
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
          <InactivityTimer />
          <Header />
          {children}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}

