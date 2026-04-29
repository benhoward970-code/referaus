"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const plans = [
  { name: "Free", price: "$0", period: "forever", highlight: false, features: ["Basic profile", "Appear in search", "Receive enquiries", "Up to 5 categories"] },
  { name: "Starter", price: "$29", period: "/month", highlight: false, features: ["Verified badge", "Priority ranking", "10 categories", "Review management"] },
  { name: "Pro", price: "$79", period: "/month", highlight: true, features: ["Direct booking", "Analytics dashboard", "Unlimited categories", "Area alerts", "Priority support"] },
  { name: "Premium", price: "$149", period: "/month", highlight: false, features: ["Homepage featured", "Competitor insights", "Custom profile", "Dedicated manager", "Multi-location"] },
];

const benefits = [
  { icon: "📈", title: "Get found by participants", desc: "Participants across Newcastle and the Hunter Region are actively searching for providers. A verified ReferAus listing puts you directly in front of people who need your services right now." },
  { icon: "✅", title: "Build trust with a verified badge", desc: "The ReferAus verified badge signals to participants that your NDIS registration, qualifications, and details have been checked. It is one of the most effective ways to convert enquiries to clients." },
  { icon: "⭐", title: "Let your reviews do the selling", desc: "Happy participants leave reviews. Those reviews build your reputation automatically — working 24 hours a day to convert new participants long after the work is done." },
  { icon: "📊", title: "Track your performance", desc: "See how many participants view your profile, what they search for, how many enquiries you receive, and where your leads convert. Data-driven growth, not guesswork." },
  { icon: "💬", title: "Respond to enquiries fast", desc: "Participants message through the platform. Respond quickly, demonstrate your expertise, and win clients before they enquire elsewhere. Speed wins in competitive categories." },
  { icon: "🌏", title: "Grow beyond word-of-mouth", desc: "Word-of-mouth is great, but it has a ceiling. ReferAus extends your reach to participants who have never heard of you — but are actively searching for what you do." },
];

const testimonials = [
  { name: "Jason H.", role: "Support Coordination · Newcastle", text: "Within two weeks of listing on ReferAus, we had 11 new enquiries. Three converted to ongoing participants. The ROI compared to any other marketing we have done is not even close." },
  { name: "Leanne M.", role: "Occupational Therapy · Lake Macquarie", text: "The verified badge has made a real difference. Participants say they chose us because they saw we were verified and had genuine reviews. It builds trust before they even call." },
  { name: "David K.", role: "Support Worker · Maitland", text: "I was fully booked within 6 weeks. I had tried Facebook ads and other directories — nothing worked like ReferAus. The participants here are actively looking, not just scrolling." },
];

const faqs = [
  { q: "How long does it take to set up a listing?", a: "Most providers complete their profile in under 20 minutes. Our onboarding wizard guides you through each step — your details, services, location, and verification. Once submitted, your listing is live within 24 hours." },
  { q: "What does verification involve?", a: "We check your NDIS provider registration number, business ABN, and service categories. For individual support workers, we verify NDIS Worker Screening clearance. The verification badge is only awarded once checks are complete." },
  { q: "Can I cancel at any time?", a: "Yes. Paid plans can be cancelled at any time with no lock-in contracts. You will retain your listing at the Free tier if you downgrade." },
  { q: "What is the difference between Professional and Premium?", a: "Professional gives you everything you need to grow — analytics, direct booking, unlimited categories. Premium adds homepage featured placement, competitor insights, a custom branded profile, and a dedicated account manager." },
  { q: "Do you operate outside Newcastle?", a: "We are starting in Newcastle and the Hunter Region and expanding nationally. If you operate in another area, create a listing now to be first when we launch in your region." },
];

export default function ForProvidersClient() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-28 pb-20 px-6 max-w-[1200px] mx-auto">
        <div className="max-w-[760px]">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-mono text-[0.7rem] text-blue-600 tracking-[0.2em] uppercase mb-6 flex items-center gap-3"
          >
            <span className="w-8 h-px bg-blue-500" />
            For NDIS Providers
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="heading-bold text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] mb-6"
          >
            Grow your NDIS business with{" "}
            <span className="text-blue-600">ReferAus</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-500 text-lg leading-relaxed mb-10 font-light"
          >
            Participants across Newcastle and the Hunter Region are actively searching for providers right now. A verified ReferAus listing puts you in front of them — with real reviews building trust 24 hours a day.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all hover:-translate-y-0.5 shadow-sm"
            >
              List Your Business — Free
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-3.5 rounded-lg border border-gray-200 text-gray-700 font-semibold text-sm hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              View Pricing Plans
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-6 mt-10 pt-8 border-t border-gray-100"
          >
            {[
              { icon: "🚀", label: "Start free, upgrade anytime" },
              { icon: "✅", label: "NDIS provider verified" },
              { icon: "📊", label: "Analytics included" },
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

      {/* Benefits */}
      <section className="py-24 px-6 max-w-[1200px] mx-auto">
        <p className="section-label mb-3">Why Providers Choose ReferAus</p>
        <h2 className="heading-bold text-[clamp(2rem,5vw,3rem)] leading-tight mb-3">More participants. Less hustle.</h2>
        <p className="text-gray-500 max-w-[560px] mb-12 font-light">Stop relying on word-of-mouth and cold calls. Let a verified listing and genuine reviews bring participants to you.</p>

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

      {/* Testimonials */}
      <section className="py-24 px-6 max-w-[1200px] mx-auto">
        <p className="section-label mb-3">Provider Stories</p>
        <h2 className="heading-bold text-[clamp(2rem,5vw,3rem)] leading-tight mb-12">What providers are saying</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="card p-7"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">&ldquo;{t.text}&rdquo;</p>
              <div>
                <div className="font-semibold text-sm">{t.name}</div>
                <div className="text-xs text-gray-400">{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="divider max-w-[800px] mx-auto" />

      {/* Pricing Snapshot */}
      <section className="py-24 px-6 max-w-[1100px] mx-auto">
        <p className="section-label mb-3">Pricing</p>
        <h2 className="heading-bold text-[clamp(2rem,5vw,3rem)] leading-tight mb-3">Start free. Scale as you grow.</h2>
        <p className="text-gray-500 max-w-[560px] mb-12 font-light">Get listed for free and upgrade when you are ready. No lock-in contracts. Cancel anytime.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={"rounded-2xl p-6 border flex flex-col " + (plan.highlight ? "border-blue-500/40 bg-blue-600/5" : "card")}
            >
              {plan.highlight && (
                <div className="mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-600 text-white">Most Popular</span>
                </div>
              )}
              <h3 className="font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-black">{plan.price}</span>
                <span className="text-sm text-gray-400">{plan.period}</span>
              </div>
              <ul className="space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="text-green-500">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        <Link href="/pricing" className="text-sm text-blue-600 font-medium hover:text-blue-700">
          See full pricing details →
        </Link>
      </section>

      <div className="divider max-w-[800px] mx-auto" />

      {/* FAQs */}
      <section className="py-24 px-6 max-w-[800px] mx-auto">
        <p className="section-label mb-3">Common Questions</p>
        <h2 className="heading-bold text-[clamp(2rem,5vw,3rem)] leading-tight mb-12">Questions from providers</h2>

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
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl mx-auto mb-6">🚀</div>
          <h2 className="heading-bold text-[clamp(2rem,5vw,3rem)] leading-tight mb-4">
            Ready to grow your caseload?
          </h2>
          <p className="text-gray-500 mb-8 max-w-[480px] mx-auto font-light">
            Get listed for free in minutes. Participants searching for your services in Newcastle and the Hunter Region will find you.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/register"
              className="px-9 py-3.5 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all hover:-translate-y-0.5 shadow-sm"
            >
              Create Free Listing
            </Link>
            <Link
              href="/pricing"
              className="px-9 py-3.5 rounded-lg border border-gray-200 text-gray-700 font-semibold text-sm hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              View Pricing
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
