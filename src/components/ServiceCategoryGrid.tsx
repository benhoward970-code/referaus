"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Breadcrumbs } from "@/components/Breadcrumbs";

/* ──────────────────────────────────────────────
   Service Category Cards with icons + hover
   Links to /providers?q=CategoryName
────────────────────────────────────────────── */

const SERVICE_CATEGORIES = [
  {
    name: "Occupational Therapy",
    emoji: "🖐️",
    desc: "Improve daily function, independence, and quality of life through goal-focused therapy.",
    color: "blue",
  },
  {
    name: "Speech Pathology",
    emoji: "💬",
    desc: "Support for communication, language, and swallowing difficulties of all ages.",
    color: "purple",
  },
  {
    name: "Physiotherapy",
    emoji: "🦵",
    desc: "Physical rehabilitation, pain management, and movement support.",
    color: "green",
  },
  {
    name: "Psychology",
    emoji: "🧠",
    desc: "Mental health assessment, therapy, and psychosocial support.",
    color: "indigo",
  },
  {
    name: "Support Coordination",
    emoji: "🗺️",
    desc: "Expert guidance to navigate your NDIS plan and connect with the right supports.",
    color: "orange",
  },
  {
    name: "Plan Management",
    emoji: "📋",
    desc: "Professional financial management of your NDIS funding and invoices.",
    color: "teal",
  },
  {
    name: "Behaviour Support",
    emoji: "🤝",
    desc: "Positive behaviour support plans and specialist intervention strategies.",
    color: "red",
  },
  {
    name: "Daily Living Support",
    emoji: "🏠",
    desc: "Assistance with personal care, meals, household tasks, and daily routines.",
    color: "blue",
  },
  {
    name: "Community Access",
    emoji: "🌏",
    desc: "Support to participate in community activities, social groups, and recreation.",
    color: "green",
  },
  {
    name: "Supported Independent Living",
    emoji: "🏘️",
    desc: "Shared or individual housing support to live as independently as possible.",
    color: "teal",
  },
  {
    name: "Transport",
    emoji: "🚐",
    desc: "Safe, reliable transport to appointments, work, education, and community activities.",
    color: "indigo",
  },
  {
    name: "Respite Care",
    emoji: "😌",
    desc: "Short-term accommodation and in-home respite to support participants and carers.",
    color: "purple",
  },
  {
    name: "Early Childhood",
    emoji: "⭐",
    desc: "Specialist support for children with developmental delays and disabilities.",
    color: "yellow",
  },
  {
    name: "Home Modifications",
    emoji: "🔧",
    desc: "Assessments and modifications to make your home safe and accessible.",
    color: "orange",
  },
  {
    name: "Assistive Technology",
    emoji: "💻",
    desc: "Equipment, devices, and technology to support independence and participation.",
    color: "red",
  },
];

const colorMap: Record<string, { bg: string; border: string; hover: string; text: string }> = {
  blue:   { bg: "bg-blue-50",   border: "border-blue-100",   hover: "hover:border-blue-300",   text: "text-blue-700" },
  orange: { bg: "bg-orange-50", border: "border-orange-100", hover: "hover:border-orange-300", text: "text-orange-700" },
  green:  { bg: "bg-green-50",  border: "border-green-100",  hover: "hover:border-green-300",  text: "text-green-700" },
  red:    { bg: "bg-red-50",    border: "border-red-100",    hover: "hover:border-red-300",    text: "text-red-700" },
  purple: { bg: "bg-purple-50", border: "border-purple-100", hover: "hover:border-purple-300", text: "text-purple-700" },
  yellow: { bg: "bg-yellow-50", border: "border-yellow-100", hover: "hover:border-yellow-300", text: "text-yellow-700" },
  teal:   { bg: "bg-teal-50",   border: "border-teal-100",   hover: "hover:border-teal-300",   text: "text-teal-700" },
  indigo: { bg: "bg-indigo-50", border: "border-indigo-100", hover: "hover:border-indigo-300", text: "text-indigo-700" },
};

export function ServiceCategoryGrid() {
  return (
    <section className="px-4 sm:px-6 py-12 max-w-5xl mx-auto">
      <Breadcrumbs className="mb-4" />
      <h2 className="text-xl font-bold text-gray-800 mb-6">Browse by Category</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {SERVICE_CATEGORIES.map((cat, i) => {
          const c = colorMap[cat.color] ?? colorMap.blue;
          return (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.4 }}
            >
              <Link
                href={`/providers?q=${encodeURIComponent(cat.name)}`}
                className={`flex flex-col gap-3 p-5 rounded-2xl border ${c.bg} ${c.border} ${c.hover} cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className={`font-semibold text-sm ${c.text}`}>{cat.name}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{cat.desc}</p>
                <span className={`text-xs font-medium ${c.text} flex items-center gap-1 mt-auto`}>
                  Find providers
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
