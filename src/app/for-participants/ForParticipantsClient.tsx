"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const steps = [
  { icon: "🔍", num: "01", title: "Search for what you need", desc: "Enter your suburb and the type of support you're after - whether it is a support worker, OT, physio, speech therapist, or anything else in your NDIS plan." },
  { icon: "📋", num: "02", title: "Read real reviews", desc: "Every provider profile shows reviews from verified NDIS participants. No paid placements. No fake ratings. Just honest experiences from people like you." },
  { icon: "💬", num: "03", title: "Message directly", desc: "Send an enquiry straight to the provider. Ask about availability, costs, and whether they're a good fit - before committing to anything." },
  { icon: "🤝", num: "04", title: "Connect and get started", desc: "Once you've found the right match, connect and start your support journey. You stay in control every step of the way." },
];

const benefits = [
  { icon: "🆓", title: "Always free for participants", desc: "No account required to browse. No premium tiers. No hidden fees. ReferAus is and always will be 100% free for NDIS participants." },
  { icon: "✅", title: "Verified providers", desc: "Every provider on ReferAus is verified. We check registrations, qualifications, and NDIS registration status so you don't have to." },
  { icon: "⭐", title: "Honest reviews", desc: "Real feedback from real participants. We never hide negative reviews or let providers pay to boost their ratings." },
  { icon: "📍", title: "Find local support", desc: "Search by your suburb, region, or postcode. See which providers service your area, how far they travel, and what they charge." },
  { icon: "🔒", title: "Your privacy protected", desc: "Your details are only shared with providers you choose to contact. We never sell your data or share it without your permission." },
  { icon: "📞", title: "No phone tag", desc: "Message providers directly through the platform. Get answers on your schedule - not during business hours when you might be in a session." },
];

const supportCategories = [
  "Support Coordination",
  "Improved Daily Living",
  "Assistance with Daily Life",
  "Improved Living Arrangements",
  "Support Workers",
  "Occupational Therapy",
  "Physiotherapy",
  "Speech Pathology",
  "Psychology & Mental Health",
  "Positive Behaviour Support",
  "Transport & Community Access",
  "Assistive Technology",
];

const faqs = [
  { q: "Is ReferAus really free for participants?", a: "Yes, completely. You can search, browse profiles, read reviews, and message providers - all without paying a cent. We charge providers a small subscription to list on the platform, not participants." },
  { q: "Do I need an NDIS plan to use ReferAus?", a: "No. You can browse and research providers at any time. Whether you're waiting for your plan to be approved or already have funding, ReferAus is here to help." },
  { q: "Are the reviews genuine?", a: "We verify that reviewers are real NDIS participants before publishing their reviews. We never hide negative reviews, and providers cannot pay to improve their ratings." },
  { q: "What if I can't find a provider in my area?", a: "We're growing our network every week. If you can't find what you need, use the contact form to let us know your location and support type - we'll try to help or point you in the right direction." },
  { q: "Can I use ReferAus if I'm plan-managed or self-managed?", a: "Yes. ReferAus works for participants across all plan management types - NDIA-managed, plan-managed, or self-managed." },
];

export default function ForParticipantsClient() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-28 pb-20 px-6 max-w-[1200px] mx-auto">
        <div className="max-w-[720px]">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-mono text-[0.7rem] text-orange-500 tracking-[0.2em] uppercase mb-6 flex items-center gap-3"
          >
            <span className="w-8 h-px bg-orange-500" />
            For NDIS Participants
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="heading-bold text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] mb-6"
          >
            Find the right{" "}
            <span className="text-orange-500">NDIS support</span>{" "}
            near you
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-500 text-lg leading-relaxed mb-10 font-light"
          >
            Searching for NDIS providers is stressful and time-consuming. ReferAus makes it simple — search verified providers in the Hunter Region, read real reviews from other participants, and message directly. 100% free, always.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              href="/providers"
              className="px-8 py-3.5 rounded-lg bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition-all hover:-translate-y-0.5 shadow-sm"
            >
              Search Providers Near Me
            </Link>
            <Link
              href="/resources"
              className="px-8 py-3.5 rounded-lg border border-gray-200 text-gray-700 font-semibold text-sm hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              NDIS Resources &amp; Guides
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-6 mt-10 pt-8 border-t border-gray-100"
          >
            {[
              { icon: "🆓", label: "100% Free for participants" },
              { icon: "✅", label: "Verified providers" },
              { icon: "⭐", label: "Real reviews only" },
            ].map((b) => (
              <span key={b.label} className="flex items-center gap-2 text-sm text-gray-500">
                <span>{b.icon}</span>
                {b.label}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="divider max-w-[800px] mx-auto" />

      {/* How it works */}
      <section className="py-24 px-6 max-w-[1200px] mx-auto">
        <p className="section-label mb-3">How It Works</p>
        <h2 className="heading-bold text-[clamp(2rem,5vw,3rem)] leading-tight mb-3">From search to support in minutes</h2>
        <p className="text-gray-500 max-w-[560px] mb-14 font-light">No account needed to browse. Find what you need without the runaround.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-7 relative overflow-hidden group"
            >
              <div className="absolute top-4 right-5 heading-bold text-[3.5rem] text-gray-100 leading-none select-none group-hover:text-orange-50 transition-colors">
                {step.num}
              </div>
              <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center text-xl mb-5">
                {step.icon}
              </div>
              <h3 className="font-bold text-base mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="divider max-w-[800px] mx-auto" />

      {/* Benefits */}
      <section className="py-24 px-6 max-w-[1200px] mx-auto">
        <p className="section-label mb-3">Why Participants Choose ReferAus</p>
        <h2 className="heading-bold text-[clamp(2rem,5vw,3rem)] leading-tight mb-3">Everything you need. Nothing you don't.</h2>
        <p className="text-gray-500 max-w-[560px] mb-12 font-light">Designed with NDIS participants in mind - simple, honest, and always on your side.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card p-8"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4 text-xl">{b.icon}</div>
              <h3 className="font-semibold text-[1.05rem] mb-2">{b.title}</h3>
              <p className="text-gray-500 text-[0.85rem] leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="divider max-w-[800px] mx-auto" />

      {/* Support Categories */}
      <section className="py-24 px-6 max-w-[1200px] mx-auto">
        <p className="section-label mb-3">Support Categories</p>
        <h2 className="heading-bold text-[clamp(2rem,5vw,3rem)] leading-tight mb-3">Find providers across all NDIS categories</h2>
        <p className="text-gray-500 max-w-[560px] mb-12 font-light">Whether you need a support worker for daily tasks or a specialist therapist, we have verified providers listed across all major NDIS support categories.</p>

        <div className="flex flex-wrap gap-3 mb-8">
          {supportCategories.map((cat) => (
            <Link
              key={cat}
              href={`/providers?q=${encodeURIComponent(cat)}`}
              className="px-4 py-2.5 rounded-full border border-gray-200 text-sm text-gray-600 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-all"
            >
              {cat}
            </Link>
          ))}
        </div>
        <Link href="/providers" className="text-sm text-orange-500 font-medium hover:text-orange-600">
          Browse all providers →
        </Link>
      </section>

      <div className="divider max-w-[800px] mx-auto" />

      {/* FAQs */}
      <section className="py-24 px-6 max-w-[800px] mx-auto">
        <p className="section-label mb-3">Common Questions</p>
        <h2 className="heading-bold text-[clamp(2rem,5vw,3rem)] leading-tight mb-12">Questions from participants</h2>

        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card p-7"
            >
              <h3 className="font-semibold mb-2">{faq.q}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-[700px] mx-auto text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-3xl mx-auto mb-6">🔍</div>
          <h2 className="heading-bold text-[clamp(2rem,5vw,3rem)] leading-tight mb-4">
            Start searching - it&apos;s free
          </h2>
          <p className="text-gray-500 mb-8 max-w-[480px] mx-auto font-light">
            Verified NDIS providers in Newcastle and the Hunter Region, ready to help. No account needed to get started.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/providers"
              className="px-9 py-3.5 rounded-lg bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition-all hover:-translate-y-0.5 shadow-sm"
            >
              Find Providers Near Me
            </Link>
            <Link
              href="/blog"
              className="px-9 py-3.5 rounded-lg border border-gray-200 text-gray-700 font-semibold text-sm hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              Read NDIS Guides
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
