import Link from "next/link";
import type { Metadata } from "next";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";

export const metadata: Metadata = {
  title: "Page Not Found | ReferAus",
  description: "The page you are looking for could not be found. Search for NDIS providers or browse our directory.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-24 pb-16">
      <div className="max-w-xl w-full text-center">
        <p className="font-mono text-[0.7rem] text-orange-500 tracking-[0.2em] uppercase mb-6 flex items-center justify-center gap-3">
          <span className="w-8 h-px bg-orange-500" />
          404 Error
          <span className="w-8 h-px bg-orange-500" />
        </p>

        <h1 className="text-[clamp(4rem,15vw,8rem)] font-black leading-none text-gray-100 select-none mb-2">
          404
        </h1>

        <h2 className="text-2xl font-bold mb-3 text-gray-900">Page not found</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Search for a provider or explore the links below.
        </p>

        {/* Search Bar */}
        <div className="mb-8 text-left">
          <SearchAutocomplete className="w-full" />
        </div>

        {/* Quick links */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link
            href="/"
            className="px-8 py-3 min-h-[44px] rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            Go Home
          </Link>
          <Link
            href="/providers"
            className="px-8 py-3 min-h-[44px] rounded-lg border border-gray-200 text-gray-700 font-medium hover:border-blue-600 hover:text-blue-600 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Find Providers
          </Link>
          <Link
            href="/contact"
            className="px-8 py-3 min-h-[44px] rounded-lg border border-gray-200 text-gray-700 font-medium hover:border-blue-600 hover:text-blue-600 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Contact Us
          </Link>
        </div>

        {/* Popular pages */}
        <div className="border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Popular Pages</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { href: "/pricing", label: "Pricing" },
              { href: "/faq", label: "FAQ" },
              { href: "/for-participants", label: "For Participants" },
              { href: "/for-providers", label: "For Providers" },
              { href: "/services", label: "Services" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 min-h-[44px] flex items-center rounded-full bg-gray-50 border border-gray-200 text-sm text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
