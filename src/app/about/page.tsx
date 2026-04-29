"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Eye, Heart, Shield, Users, X, Check, MapPin } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

const values = [
  {
    Icon: Eye,
    title: "Transparency",
    desc: "No sponsored rankings, no pay-to-win listings. Every result is based on real reviews and verified quality — not who pays the most.",
  },
  {
    Icon: Heart,
    title: "Accessibility",
    desc: "Built from the ground up to be usable by everyone, regardless of ability. WCAG-compliant design, plain language, no jargon.",
  },
  {
    Icon: Shield,
    title: "Quality",
    desc: "We verify every provider before they appear in our directory. Participants deserve to know they're choosing from vetted, reputable services.",
  },
  {
    Icon: Users,
    title: "Community",
    desc: "We're local. We know the Hunter. We believe the best NDIS platform is one built in partnership with the community it serves.",
  },
];

const stats = [
  { value: "Free", label: "To list & search" },
  { value: "24/7", label: "Always available" },
  { value: "Hunter Region", label: "Home base, NSW" },
  { value: "100%", label: "Free for participants" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-28 pb-14">

      {/* Hero */}
      <section className="px-4 sm:px-6 pb-12 sm:pb-12">
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs />
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
            <span className="section-label mb-4 block">About ReferAus</span>
            <h1 className="heading-bold text-[clamp(2.4rem,6vw,4.2rem)] leading-[1.05] mb-6">
              Built for the<br />
              <span className="gradient-text">NDIS Community</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
              ReferAus is a modern, searchable directory that makes it easy to find, compare, and connect with quality NDIS providers — starting in the Hunter Region, NSW.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.55 }}
            className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-black text-blue-600 mb-1">{s.value}</p>
                <p className="text-xs text-gray-400 font-medium">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="px-4 sm:px-6 py-10 sm:py-10 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}>
            <span className="section-label mb-4 block">Our Mission</span>
            <div className="rounded-2xl bg-white border border-gray-200 p-6 sm:p-14 shadow-sm">
              <p className="text-2xl sm:text-3xl font-bold leading-snug text-gray-700">
                To connect every NDIS participant with the{" "}
                <span className="gradient-text">right provider</span> — based on real reviews, verified quality, and genuine compatibility.{" "}
                <span className="text-gray-400">Not who pays the most to advertise.</span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="px-4 sm:px-6 py-10 sm:py-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}
            className="rounded-2xl border border-red-100 bg-red-50/50 p-8 sm:p-10">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-red-400 mb-4">The Problem</span>
            <h2 className="text-2xl font-black mb-4 text-gray-800">Finding NDIS providers is broken</h2>
            <ul className="space-y-3 text-gray-600 text-sm leading-relaxed">
              <li className="flex gap-2"><X className="text-red-400 mt-0.5 shrink-0 w-4 h-4" /> Outdated government directories with missing or stale information</li>
              <li className="flex gap-2"><X className="text-red-400 mt-0.5 shrink-0 w-4 h-4" /> No way to compare providers side-by-side</li>
              <li className="flex gap-2"><X className="text-red-400 mt-0.5 shrink-0 w-4 h-4" /> Participants rely on word-of-mouth and hope for the best</li>
              <li className="flex gap-2"><X className="text-red-400 mt-0.5 shrink-0 w-4 h-4" /> Paid rankings bury quality providers under big advertisers</li>
              <li className="flex gap-2"><X className="text-red-400 mt-0.5 shrink-0 w-4 h-4" /> No real reviews from real participants</li>
            </ul>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.1 }}
            className="rounded-2xl border border-green-100 bg-green-50/50 p-8 sm:p-10">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-green-500 mb-4">Our Solution</span>
            <h2 className="text-2xl font-black mb-4 text-gray-800">ReferAus: the directory you deserve</h2>
            <ul className="space-y-3 text-gray-600 text-sm leading-relaxed">
              <li className="flex gap-2"><Check className="text-green-500 mt-0.5 shrink-0 w-4 h-4" /> Modern, searchable directory — fast and always up to date</li>
              <li className="flex gap-2"><Check className="text-green-500 mt-0.5 shrink-0 w-4 h-4" /> Real reviews from verified NDIS participants</li>
              <li className="flex gap-2"><Check className="text-green-500 mt-0.5 shrink-0 w-4 h-4" /> Side-by-side provider comparison built in</li>
              <li className="flex gap-2"><Check className="text-green-500 mt-0.5 shrink-0 w-4 h-4" /> Every provider vetted — no pay-to-rank system</li>
              <li className="flex gap-2"><Check className="text-green-500 mt-0.5 shrink-0 w-4 h-4" /> Completely free for NDIS participants</li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="px-4 sm:px-6 py-10 sm:py-10 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
            <span className="section-label mb-4 block">Our Values</span>
            <h2 className="heading-bold text-3xl sm:text-4xl">What we stand for</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
                className="rounded-2xl bg-white border border-gray-200 p-8 hover:border-orange-300 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
                  <v.Icon className="w-5 h-5 text-orange-500" />
                </div>
                <h3 className="text-lg font-bold mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="px-4 sm:px-6 py-10 sm:py-10">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
            <span className="section-label mb-4 block">Our Team</span>
            <h2 className="heading-bold text-3xl sm:text-4xl">Founded in the Hunter Region</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }}
              className="rounded-2xl bg-white border border-gray-200 p-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600/20 to-orange-500/20 border border-gray-200 flex items-center justify-center mb-4">
                <span className="text-2xl font-black text-blue-600">B</span>
              </div>
              <h3 className="text-lg font-bold mb-1">Ben Howard</h3>
              <p className="text-sm font-medium text-orange-500 mb-3">Founder &amp; CEO</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Passionate about using technology to improve disability services in Australia. Based in the Hunter Region, NSW — building the platform he wished existed.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="rounded-2xl bg-white border border-gray-200 p-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500/20 to-blue-600/20 border border-gray-200 flex items-center justify-center mb-4">
                <MapPin className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="text-lg font-bold mb-1">Hunter Region, NSW</h3>
              <p className="text-sm font-medium text-blue-500 mb-3">Home Base</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                We are proudly local. ReferAus was founded and operates out of the Hunter Region — built for this community, by this community. Expanding across NSW while keeping the local focus that makes us different.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 py-10 sm:py-10 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="heading-bold text-3xl sm:text-4xl mb-4">
              Ready to <span className="gradient-text">get started?</span>
            </h2>
            <p className="text-gray-500 mb-8 text-lg">
              Whether you are a participant looking for support or a provider wanting to reach more people — ReferAus is here for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/providers"
                className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-blue-600/25">
                Find Providers
              </Link>
              <Link href="/register"
                className="px-8 py-3.5 rounded-xl bg-white hover:bg-gray-50 text-gray-900 font-medium border border-gray-200 transition-all hover:border-orange-300">
                List Your Business
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      <div className="text-center pb-8">
        <p className="text-xs text-gray-400">Last updated: March 2026</p>
      </div>
    </div>
  );
}

