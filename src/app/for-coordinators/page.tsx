import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "For Support Coordinators | ReferAus",
  description: "ReferAus is the free tool NDIS Support Coordinators use to find registered providers for their clients. Search by registration status, share referral links, and connect clients with trusted providers in the Hunter Region.",
  openGraph: {
    title: "For Support Coordinators | ReferAus",
    description: "The free tool Support Coordinators trust to find registered NDIS providers for their clients.",
    url: "https://referaus.com/for-coordinators",
    siteName: "ReferAus",
    type: "website",
  },
  alternates: { canonical: "https://referaus.com/for-coordinators" },
};

export default function ForCoordinatorsPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="pt-28 pb-16 px-4 sm:px-6 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
            For Support Coordinators
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 mb-5">
            The easiest way to find<br /><span className="text-blue-600">registered providers</span> for your clients
          </h1>
          <p className="text-gray-500 text-lg sm:text-xl max-w-2xl mx-auto mb-8">
            ReferAus is free for Support Coordinators. Search registered NDIS providers, share personalised links with your clients, and track who they connect with.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact?role=coordinator" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 rounded-xl transition-colors text-base">
              Get Your Free SC Account
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <Link href="/providers" className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-600 font-semibold px-7 py-3.5 rounded-xl transition-colors text-base">
              Browse Providers Now
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-3">No cost. No obligation. Always free for Support Coordinators.</p>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 flex flex-col md:flex-row gap-5 items-start">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#f97316"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" /></svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-orange-900 mb-1">July 2026: Only registered providers can operate</h2>
              <p className="text-sm text-orange-800 leading-relaxed">
                From 1 July 2026, all NDIS providers must be registered with the NDIS Quality and Safeguards Commission.
                When you recommend someone to your clients, you need to know they are registered.
                ReferAus filters by registration status so you are always referring confidently.
              </p>
              <Link href="/registered-providers" className="inline-block mt-3 text-sm font-semibold text-orange-700 hover:text-orange-900 underline underline-offset-2">
                Browse registered providers
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 text-center">Built for how you actually work</h2>
          <p className="text-gray-500 text-center mb-10">Tools that respect your time and your clients trust.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#2563eb"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Instant provider search</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Search by service type, suburb, and registration status. Find registered options for your client in seconds.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#2563eb"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" /></svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Shareable referral links</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Send clients a personalised ReferAus link pre-filtered to services and location they need. No confusion.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#2563eb"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Registration-verified providers</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Every provider with a Verified or Registration Ready badge has confirmed their status. Refer with confidence after July 2026.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-14 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 text-center">How it works</h2>
          <p className="text-gray-500 text-center mb-10">Three steps. Completely free.</p>
          <div className="space-y-6">
            <div className="flex gap-5 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm">01</div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Create your free SC account</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Sign up with your name and email. No credit card, no commitment. We verify you as a Support Coordinator to unlock SC-only features.</p>
              </div>
            </div>
            <div className="flex gap-5 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm">02</div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Get your personalised referral link</h3>
                <p className="text-sm text-gray-500 leading-relaxed">You receive a unique link: referaus.com/ref/[yourname]. Share it with clients and they land on a search page pre-filtered to registered providers in their area.</p>
              </div>
            </div>
            <div className="flex gap-5 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm">03</div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Track who your clients connect with</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Your SC dashboard shows how many clients used your referral link and which providers they contacted. Simple, useful, private.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-14">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">Why SCs matter to us</div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4">You are the most trusted voice in the room</h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                NDIS participants do not pick providers from a Google search. They ask their Support Coordinator.
                When you recommend a provider on ReferAus, it carries real weight and real responsibility.
              </p>
              <p className="text-gray-500 leading-relaxed mb-6">
                We built SC tools specifically to make sure your recommendations are grounded in accurate, up-to-date provider information. Not word of mouth. Not outdated lists. Live data.
              </p>
              <Link href="/blog/ndis-july-2026-mandatory-registration-checklist" className="text-sm font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2">
                Read: What July 2026 means for your clients
              </Link>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-5 py-4 border border-gray-100">
                <span className="text-sm text-gray-500">NDIS participants in Hunter Region</span>
                <span className="text-lg font-black text-blue-600">15,000+</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-5 py-4 border border-gray-100">
                <span className="text-sm text-gray-500">Providers who need to be found after July 2026</span>
                <span className="text-lg font-black text-blue-600">Growing</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-5 py-4 border border-gray-100">
                <span className="text-sm text-gray-500">Days until mandatory registration deadline</span>
                <span className="text-lg font-black text-blue-600">111</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-5 py-4 border border-gray-100">
                <span className="text-sm text-gray-500">Cost to SC partners</span>
                <span className="text-lg font-black text-blue-600">$0</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="bg-blue-600 rounded-2xl p-8 text-white text-center">
            <svg className="mx-auto mb-4 opacity-50" width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" /></svg>
            <p className="text-lg font-medium mb-4 text-blue-100 italic">
              I spent 30 minutes every time a client needed a new provider. ReferAus cut that to 5 minutes. And I know the ones I am recommending are actually registered.
            </p>
            <p className="text-sm font-semibold text-white">Support Coordinator, Hunter Region NSW</p>
            <p className="text-xs text-blue-300 mt-1">Early ReferAus partner</p>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-3">Ready to get started?</h2>
          <p className="text-gray-500 mb-6">Connect your clients with registered NDIS providers in the Hunter Region. Free for Support Coordinators, always.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact?role=coordinator" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 rounded-xl transition-colors">
              Get Your Free SC Account
            </Link>
            <Link href="/providers" className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-blue-300 text-gray-700 font-semibold px-7 py-3.5 rounded-xl transition-colors">
              Browse Providers First
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-4">No credit card. No obligation. Free forever for Support Coordinators.</p>
        </div>
      </section>
    </div>
  );
}
