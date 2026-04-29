import type { Metadata } from "next";
import { Outfit, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CookieConsent } from '@/components/CookieConsent';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { AuthProvider } from "@/components/AuthProvider";
import { ChatWidget } from "@/components/ChatWidget";
import { BackToTop } from "@/components/BackToTop";
import { PageTransition } from "@/components/PageTransition";
import { ToastProvider } from "@/components/Toast";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { CommandPalette } from "@/components/CommandPalette";
import { ScrollProgressBar } from "@/components/ScrollProgressBar";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
// WebVitals removed — used internal Next.js path that caused runtime errors
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { MobileFAB } from "@/components/MobileFAB";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const viewport = { width: "device-width", initialScale: 1, maximumScale: 5 };

export const metadata: Metadata = {
  metadataBase: new URL("https://referaus.com"),
  title: {
    default: "ReferAus - NDIS Provider Directory",
    template: "%s | ReferAus - NDIS Provider Directory",
  },
  description:
    "Search, compare and connect with trusted NDIS providers in Newcastle and the Hunter Region. Free for participants. Real reviews, direct messaging, no middleman.",
  keywords: ["NDIS", "NDIS providers", "Newcastle", "Hunter Region", "disability support", "NDIS directory"],
  authors: [{ name: "ReferAus", url: "https://referaus.com" }],
  creator: "ReferAus",
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "https://referaus.com",
    siteName: "ReferAus",
    title: "ReferAus - NDIS Provider Directory",
    description: "Find trusted NDIS providers in Newcastle and the Hunter Region. Real reviews, direct messaging, free for participants.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ReferAus - NDIS Provider Directory" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ReferAus - NDIS Provider Directory",
    description: "Find trusted NDIS providers in Newcastle and the Hunter Region. Free for participants.",
    images: ["/og-image.png"],
    creator: "@ReferAus",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: "https://referaus.com" },
};

// Organization / LocalBusiness JSON-LD schema (Item 18)
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness"],
  name: "ReferAus",
  url: "https://referaus.com",
  logo: "https://referaus.com/favicon.svg",
  description: "Search, compare and connect with trusted NDIS providers in Newcastle and the Hunter Region. Free for participants. Real reviews, direct messaging, no middleman.",
  email: "hello@referaus.com",
  areaServed: "Newcastle, Hunter Region, NSW, Australia",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Newcastle",
    addressRegion: "NSW",
    addressCountry: "AU",
  },
  sameAs: [],
  foundingDate: "2026",
  knowsAbout: ["NDIS", "Disability Support", "Support Workers", "Occupational Therapy", "Speech Therapy"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${mono.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        {/* DNS prefetch for Google Fonts */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        {/* Preconnect for faster font loading (Item 21) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preload critical font stylesheets (Item 21) */}
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
        {/* Organization Schema (Item 18) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body suppressHydrationWarning className="font-sans antialiased bg-sky-50 text-gray-900">
        <div className="mesh-bg" aria-hidden="true"><div className="mesh-wave-3" /></div>
        <div className="dot-grid" aria-hidden="true" />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none">Skip to main content</a>
        <AuthProvider>
          <ToastProvider>
            <OfflineIndicator />
          <AnnouncementBar />
            <ScrollProgressBar />
            <GoogleAnalytics />
            <Navbar />
            <main id="main-content" role="main" tabIndex={-1}>
              <ErrorBoundary>
                <PageTransition>{children}</PageTransition>
              </ErrorBoundary>
            </main>
            <Footer />
            <ChatWidget />
            <BackToTop />
            <KeyboardShortcuts />
            <CommandPalette />
            <ServiceWorkerRegistration />
            <PWAInstallBanner />
            <MobileFAB />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
