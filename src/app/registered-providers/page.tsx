"use client";
import type { Metadata } from "next";
import Link from "next/link";
import { providers } from "@/lib/providers";
import { ProviderCard } from "@/components/ProviderCard";

const registrationReadyProviders = providers.filter((p) => p.registrationReady);
const verifiedProviders = providers.filter((p) => p.verified && !p.registrationReady);

export default function RegisteredProvidersPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">

        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            Mandatory from July 2026
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 text-gray-900">
            NDIS <span className="text-orange-500">Registered Providers</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mb-6">
            From July 2026, all NDIS providers must be registered with the NDIS Quality and Safeguards Commission.
            Browse providers who are already registered or actively preparing so you can choose with confidence.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/providers"
              className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Browse All Providers
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              List your organisation Free
            </Link>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-12">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <h2 className="text-base font-bold text-blue-900 mb-1">What does mandatory registration mean?</h2>
              <p className="text-sm text-blue-700">
                The NDIS Commission is requiring all providers to be registered by 1 July 2026.
                Unregistered providers who offer regulated supports will not be able to operate.
                Participants should prioritise choosing registered providers to ensure continuity of care.
              </p>
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-blue-900 mb-1">What is "Registration Ready"?</h2>
              <p className="text-sm text-blue-700">
                Providers marked Reg Ready have confirmed they are actively pursuing NDIS registration
                and are on track to be fully registered by July 2026.
              </p>
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-blue-900 mb-1">Are you a provider?</h2>
              <p className="text-sm text-blue-700">
                List free on ReferAus and get a Registration Ready badge at no cost until July 2026,
                then auto-convert to a Verified Badge ($29/mo). Stand out during the compliance window.
              </p>
            </div>
          </div>
        </div>

        {registrationReadyProviders.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-bold px-3 py-1.5 rounded-full">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                </svg>
                Registration Ready
              </div>
              <span className="text-sm text-gray-400">{registrationReadyProviders.length} providers</span>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              These providers are actively preparing for mandatory NDIS registration ahead of the July 2026 deadline.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registrationReadyProviders.map((p) => (
                <ProviderCard key={p.slug} provider={p} />
              ))}
            </div>
          </section>
        )}

        {verifiedProviders.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm font-bold px-3 py-1.5 rounded-full">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                Verified Providers
              </div>
              <span className="text-sm text-gray-400">{verifiedProviders.length} providers</span>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Verified providers have been reviewed by the ReferAus team and confirmed as active NDIS participants.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {verifiedProviders.map((p) => (
                <ProviderCard key={p.slug} provider={p} />
              ))}
            </div>
          </section>
        )}

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-black mb-2">Are you an NDIS provider preparing to register?</h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            Get compliant. Get found. List on ReferAus free and receive the Registration Ready badge
            at no cost until July 2026. Be where participants are searching when they need registered providers.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              List Free - Takes 10 Minutes
            </Link>
            <Link
              href="/for-providers"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-colors border border-white/20"
            >
              Learn More
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
