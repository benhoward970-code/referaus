import type { Metadata } from "next";
import Link from "next/link";
import { providers } from "@/lib/providers";
import { ServiceCategoryGrid } from "@/components/ServiceCategoryGrid";

export const metadata: Metadata = {
  title: "NDIS Services Directory | ReferAus",
  description: "Browse all NDIS support categories and find providers near you in Newcastle and the Hunter Region. From daily living to therapy, find the support you need.",
  openGraph: {
    title: "NDIS Services Directory | ReferAus",
    description: "Find NDIS providers by support category in Newcastle and the Hunter Region.",
    url: "https://referaus.com/services",
    siteName: "ReferAus",
    type: "website",
  },
  alternates: { canonical: "https://referaus.com/services" },
};

const supportCategories = [
  {
    slug: "daily-living",
    name: "Daily Living",
    category: "Daily Living",
    icon: "house",
    color: "blue",
    tagline: "Support with everyday tasks at home and in the community",
    description: "Daily living supports help participants with personal care, meal preparation, household tasks, and building the skills needed to live more independently. Providers can assist in your home or out in the community.",
    examples: ["Personal care and hygiene", "Meal preparation and cooking", "Household cleaning and laundry", "Shopping and errands", "Community access and social activities"],
    ndisCategory: "Core Supports - Daily Activities",
  },
  {
    slug: "support-coordination",
    name: "Support Coordination",
    category: "Support Coordination",
    icon: "users",
    color: "orange",
    tagline: "Expert help to understand and use your NDIS plan",
    description: "Support Coordinators help you understand your NDIS plan, connect with the right providers, and get the most out of your funding. They are your guide through the NDIS system.",
    examples: ["Explaining your NDIS plan and funding", "Finding and connecting with providers", "Setting up service agreements", "Crisis support and plan reviews", "Building your capacity to self-manage"],
    ndisCategory: "Support Coordination",
  },
  {
    slug: "plan-management",
    name: "Plan Management",
    category: "Plan Management",
    icon: "clipboard",
    color: "green",
    tagline: "Professional management of your NDIS funding and invoices",
    description: "Plan managers handle the financial administration of your NDIS funding - paying provider invoices, keeping track of your budget, and providing monthly statements so you always know where you stand.",
    examples: ["Paying provider invoices on your behalf", "Monthly budget statements", "Claiming NDIS funds from the NDIA", "Helping you choose between providers", "Financial plan reporting"],
    ndisCategory: "Support Coordination - Plan Management",
  },
  {
    slug: "allied-health",
    name: "Allied Health",
    category: "Allied Health",
    icon: "heart",
    color: "red",
    tagline: "Therapy and clinical support to improve function and wellbeing",
    description: "Allied health providers include physiotherapists, occupational therapists, speech pathologists, psychologists, dietitians, and more. They assess your needs and deliver evidence-based therapy to help you achieve your goals.",
    examples: ["Physiotherapy and exercise physiology", "Occupational therapy (OT)", "Speech pathology and communication", "Psychology and counselling", "Dietetics and nutrition support"],
    ndisCategory: "Capacity Building - Daily Activity",
  },
  {
    slug: "mental-health",
    name: "Mental Health",
    category: "Mental Health",
    icon: "brain",
    color: "purple",
    tagline: "Psychosocial support for participants with mental health conditions",
    description: "Mental health supports help participants living with psychosocial disability. This includes individual counselling, peer support, community participation, and supports designed to build resilience and independence.",
    examples: ["Individual counselling and therapy", "Peer support and group programs", "Mental health coaching", "Community participation and social skills", "Crisis support and early intervention"],
    ndisCategory: "Core Supports - Daily Activities",
  },
  {
    slug: "early-intervention",
    name: "Early Intervention",
    category: "Early Intervention",
    icon: "star",
    color: "yellow",
    tagline: "Specialist support for children with developmental needs",
    description: "Early intervention supports are delivered to young children to address developmental delays and disabilities as early as possible. The goal is to build skills and reduce the long-term impact of the child's disability.",
    examples: ["Early childhood development programs", "Speech and language therapy for children", "Occupational therapy for kids", "Behavioural support and ABA therapy", "Family coaching and training"],
    ndisCategory: "Early Childhood Supports",
  },
  {
    slug: "accommodation",
    name: "Accommodation",
    category: "Accommodation",
    icon: "building",
    color: "teal",
    tagline: "Supported living arrangements and specialist housing",
    description: "Accommodation supports include Supported Independent Living (SIL) where support workers assist you in a shared or individual home, and Specialist Disability Accommodation (SDA), which is purpose-built housing for people with very high support needs.",
    examples: ["Supported Independent Living (SIL)", "Specialist Disability Accommodation (SDA)", "Respite and short-term accommodation", "In-home overnight support", "Transitional housing support"],
    ndisCategory: "Core Supports - Assistance with Daily Life",
  },
  {
    slug: "transport",
    name: "Transport",
    category: "Transport",
    icon: "car",
    color: "indigo",
    tagline: "Safe, reliable transport to help you get where you need to go",
    description: "Transport supports help participants get to medical appointments, work, education, and community activities. Providers can offer door-to-door transport, vehicle modifications, or support to use public transport independently.",
    examples: ["Medical and therapy appointments", "Work, education and training travel", "Community access and social outings", "Vehicle modifications assessment", "Public transport training and support"],
    ndisCategory: "Core Supports - Transport",
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string; icon: string; cta: string }> = {
  blue:   { bg: "bg-blue-50",   border: "border-blue-100",   text: "text-blue-700",   badge: "bg-blue-100 text-blue-700",   icon: "bg-blue-100 text-blue-600",   cta: "bg-blue-600 hover:bg-blue-700 text-white" },
  orange: { bg: "bg-orange-50", border: "border-orange-100", text: "text-orange-700", badge: "bg-orange-100 text-orange-700", icon: "bg-orange-100 text-orange-600", cta: "bg-orange-500 hover:bg-orange-600 text-white" },
  green:  { bg: "bg-green-50",  border: "border-green-100",  text: "text-green-700",  badge: "bg-green-100 text-green-700",  icon: "bg-green-100 text-green-600",  cta: "bg-green-600 hover:bg-green-700 text-white" },
  red:    { bg: "bg-red-50",    border: "border-red-100",    text: "text-red-700",    badge: "bg-red-100 text-red-700",    icon: "bg-red-100 text-red-600",    cta: "bg-red-600 hover:bg-red-700 text-white" },
  purple: { bg: "bg-purple-50", border: "border-purple-100", text: "text-purple-700", badge: "bg-purple-100 text-purple-700", icon: "bg-purple-100 text-purple-600", cta: "bg-purple-600 hover:bg-purple-700 text-white" },
  yellow: { bg: "bg-yellow-50", border: "border-yellow-100", text: "text-yellow-700", badge: "bg-yellow-100 text-yellow-700", icon: "bg-yellow-100 text-yellow-600", cta: "bg-yellow-500 hover:bg-yellow-600 text-white" },
  teal:   { bg: "bg-teal-50",   border: "border-teal-100",   text: "text-teal-700",   badge: "bg-teal-100 text-teal-700",   icon: "bg-teal-100 text-teal-600",   cta: "bg-teal-600 hover:bg-teal-700 text-white" },
  indigo: { bg: "bg-indigo-50", border: "border-indigo-100", text: "text-indigo-700", badge: "bg-indigo-100 text-indigo-700", icon: "bg-indigo-100 text-indigo-600", cta: "bg-indigo-600 hover:bg-indigo-700 text-white" },
};

function CategoryIcon({ type, className }: { type: string; className?: string }) {
  const base = "w-6 h-6 " + (className || "");
  switch (type) {
    case "house": return <svg className={base} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.5 1.5 0 012.092 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>;
    case "users": return <svg className={base} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>;
    case "clipboard": return <svg className={base} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>;
    case "heart": return <svg className={base} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>;
    case "brain": return <svg className={base} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" /></svg>;
    case "star": return <svg className={base} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>;
    case "building": return <svg className={base} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>;
    case "car": return <svg className={base} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>;
    default: return <svg className={base} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>;
  }
}

export default function ServicesPage() {
  const providerCounts = Object.fromEntries(
    supportCategories.map((cat) => [
      cat.category,
      providers.filter((p) => p.category === cat.category || p.services?.some((s) => s.toLowerCase().includes(cat.name.toLowerCase()))).length,
    ])
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-28 pb-16 px-4 sm:px-6 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[0.7rem] text-blue-600 tracking-[0.2em] uppercase mb-5 flex items-center gap-3">
            <span className="w-8 h-px bg-orange-500" />
            NDIS Support Categories
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 mb-5 leading-tight">
            Find providers by<br />
            <span className="text-orange-500">support category</span>
          </h1>
          <p className="text-gray-500 text-lg sm:text-xl max-w-2xl mb-8 font-light leading-relaxed">
            Browse all NDIS support categories and connect with qualified providers in Newcastle and the Hunter Region. Every category. Every need.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/providers" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm">
              Browse All Providers
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <Link href="/register" className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-orange-300 text-gray-700 hover:text-orange-600 font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              List your organisation
            </Link>
          </div>
        </div>
      </section>

      {/* Category Grid Cards */}
      <ServiceCategoryGrid />

      {/* Quick jump */}
      <section className="sticky top-[72px] z-10 bg-white border-b border-gray-100 px-4 sm:px-6 py-3">
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-1" style={{scrollbarWidth: "none"}}>
            {supportCategories.map((cat) => {
              const c = colorMap[cat.color];
              return (
                <a key={cat.slug} href={`#${cat.slug}`}
                  className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${c.badge} ${c.border} hover:opacity-80`}>
                  <CategoryIcon type={cat.icon} className="w-3 h-3" />
                  {cat.name}
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-5xl mx-auto space-y-10">
          {supportCategories.map((cat) => {
            const c = colorMap[cat.color];
            const count = providerCounts[cat.category] || 0;

            return (
              <div key={cat.slug} id={cat.slug}
                className={`rounded-2xl border ${c.border} ${c.bg} p-6 sm:p-8 scroll-mt-32`}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                  <div className={`flex-shrink-0 w-14 h-14 rounded-2xl ${c.icon} flex items-center justify-center`}>
                    <CategoryIcon type={cat.icon} className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h2 className={`text-xl sm:text-2xl font-black ${c.text}`}>{cat.name}</h2>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${c.badge}`}>
                        {count > 0 ? `${count} provider${count === 1 ? "" : "s"}` : "Providers available"}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-1">{cat.tagline}</p>
                    <p className="text-[0.7rem] text-gray-400 font-mono uppercase tracking-wider mb-4">{cat.ndisCategory}</p>
                    <p className="text-gray-600 text-sm leading-relaxed mb-5">{cat.description}</p>
                    <div className="mb-6">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">What this covers</p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                        {cat.examples.map((ex) => (
                          <li key={ex} className="flex items-start gap-2 text-sm text-gray-600">
                            <svg className={`flex-shrink-0 mt-0.5 w-4 h-4 ${c.text}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            {ex}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Link
                      href={`/providers?category=${encodeURIComponent(cat.category)}`}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm ${c.cta} transition-all hover:-translate-y-0.5`}>
                      Find {cat.name} Providers
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black mb-3">Not sure what category you need?</h2>
              <p className="text-blue-100 max-w-md leading-relaxed text-sm">
                Browse all providers and filter by location, service type, or rating. Or contact us and we can help point you in the right direction.
              </p>
            </div>
            <div className="flex flex-col gap-3 min-w-[200px] text-center">
              <Link href="/providers" className="px-8 py-3.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-400 transition-all shadow-lg whitespace-nowrap">
                Browse All Providers
              </Link>
              <Link href="/contact" className="text-sm text-blue-200 hover:text-white transition-colors">
                Get help choosing &rarr;
              </Link>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-base mb-2 text-gray-900">Are you a provider?</h3>
              <p className="text-sm text-gray-500 mb-4">List your organisation on ReferAus and get found by participants searching for your services.</p>
              <Link href="/register" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Create free listing &rarr;
              </Link>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-base mb-2 text-gray-900">Support Coordinators</h3>
              <p className="text-sm text-gray-500 mb-4">Free tools to find registered providers for your clients. Share personalised provider shortlists.</p>
              <Link href="/for-coordinators" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Learn more &rarr;
              </Link>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-base mb-2 text-gray-900">July 2026 Registration</h3>
              <p className="text-sm text-gray-500 mb-4">All NDIS providers must be registered from 1 July 2026. Find providers who are already prepared.</p>
              <Link href="/registered-providers" className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                View registered providers &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
