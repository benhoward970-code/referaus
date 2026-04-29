"use client";
import { motion, useInView, useReducedMotion, Variants, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { SearchAutocomplete } from '@/components/SearchAutocomplete';
import { AuroraBackground } from '@/components/AuroraBackground';
// ActivitySocialProof removed — no fake data

/* Word-by-word blur-in text animation */
function BlurInText({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: delay } },
  };
  const word: Variants = {
    hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };
  return (
    <motion.span className={className} variants={container} initial="hidden" animate="visible" aria-label={text}>
      {words.map((w, i) => (
        <motion.span key={i} variants={word} className="inline-block mr-[0.3em]">{w}</motion.span>
      ))}
    </motion.span>
  );
}

/* Section wrapper with scroll-triggered fade */
function ScrollSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const prefersReduced = useReducedMotion();
  useEffect(() => {
    if (!inView) return;
    if (prefersReduced) { setCount(target); return; }
    let start = 0;
    const duration = 2000;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - progress, 3)) * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, prefersReduced]);
  return <span ref={ref}>{count}{suffix}</span>;
}


/* ─── Typing Effect Hero Word ─── */
const CYCLING_WORDS = ["Providers", "Therapists", "Support", "Services"];
function TypingWord() {
  const [wordIdx, setWordIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const target = CYCLING_WORDS[wordIdx];
    let timeout: ReturnType<typeof setTimeout>;
    if (!deleting) {
      if (displayed.length < target.length) {
        timeout = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 80);
      } else {
        timeout = setTimeout(() => setDeleting(true), 2600);
      }
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 50);
      } else {
        setDeleting(false);
        setWordIdx((i) => (i + 1) % CYCLING_WORDS.length);
      }
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, wordIdx]);

  useEffect(() => {
    const id = setInterval(() => setShowCursor((c) => !c), 530);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="text-orange-500 inline-block">
      {displayed}
      <span className={`ml-0.5 inline-block w-[3px] h-[0.85em] bg-orange-500 align-middle transition-opacity ${showCursor ? "opacity-100" : "opacity-0"}`} />
    </span>
  );
}

/* ─── Auto-rotating Hero Subtitle ─── */
const HERO_SUBTITLES = [
  "Find trusted NDIS providers in Newcastle",
  "List your NDIS business and grow",
  "Compare providers, read real reviews",
];

function HeroSubtitle() {
  const [idx, setIdx] = useState(0);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % HERO_SUBTITLES.length), 4000);
    return () => clearInterval(id);
  }, [prefersReduced]);

  return (
    <div className="relative h-[1.8em] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: prefersReduced ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="text-gray-300 text-lg max-w-[550px] font-light leading-relaxed absolute"
        >
          {HERO_SUBTITLES[idx]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

/* Testimonials carousel removed — will add back when we have real testimonials */

/* ─── Newsletter Section ─── */
function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setStatus("sending");
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="max-w-[1200px] mx-auto px-6 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-orange-400 p-[2px]"
      >
        <div className="rounded-2xl bg-white px-8 py-10 sm:py-12 flex flex-col sm:flex-row items-center gap-8">
          <div className="flex-1 text-center sm:text-left">
            <div className="text-2xl mb-2">📬</div>
            <h2 className="heading-bold text-xl sm:text-2xl text-gray-900 mb-1">Stay in the loop</h2>
            <p className="text-gray-500 text-sm">
              Get NDIS updates and new listings straight to your inbox.
            </p>
          </div>
          <div className="w-full sm:w-auto sm:min-w-[340px]">
            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4"
              >
                <span className="text-green-500 text-xl">✓</span>
                <div>
                  <p className="font-semibold text-green-700 text-sm">You&apos;re in!</p>
                  <p className="text-xs text-green-600">We&apos;ll keep you posted with the latest updates.</p>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 px-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="px-6 py-3.5 bg-orange-500 text-white font-semibold text-sm rounded-xl hover:bg-orange-400 transition-all whitespace-nowrap disabled:opacity-50"
                >
                  {status === "sending" ? "..." : "Subscribe"}
                </button>
              </form>
            )}
            {status === "error" && (
              <p className="text-red-500 text-xs mt-2 text-center">Something went wrong. Please try again.</p>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

const features = [
  { icon: "🔍", title: "Smart Search", desc: "Search by location, NDIS support category, availability, and ratings. Find providers who offer what you need, near where you are." },
  { icon: "⭐", title: "Real Reviews", desc: "Verified reviews from real NDIS participants. No fake ratings, no paid placements. See what people actually think." },
  { icon: "💬", title: "Direct Messaging", desc: "Message providers instantly. Ask questions, check availability, discuss your needs before you pick up the phone." },
  { icon: "📋", title: "Detailed Profiles", desc: "Every provider shows services, areas covered, qualifications, availability, and what participants say about them." },
  { icon: "📍", title: "Location-Based", desc: "Find providers near you. Search by suburb, region, or postcode. See distance and service areas at a glance." },
  { icon: "🆓", title: "Free for Participants", desc: "Always. No sign-up fees, no premium tiers, no hidden costs. Browse, search, message, connect completely free." },
];

const testimonials = [
  {
    name: "Built for Participants",
    role: "Free. Always.",
    text: "Search, compare, and connect with NDIS providers in your area. Read real reviews, message providers directly, and find the right support — all in one place.",
  },
  {
    name: "Built for Providers",
    role: "List free. Grow faster.",
    text: "Get found by NDIS participants actively searching for your services. Create your profile in minutes, showcase your expertise, and start receiving enquiries.",
  },
  {
    name: "Built for the Hunter",
    role: "Newcastle & Surrounds",
    text: "ReferAus is made in Newcastle for the Hunter Region. We know the local NDIS landscape and we are building the directory that this community deserves.",
  },
];

// featured providers removed - using early access CTA instead

function useProviderCount() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    fetch('/api/providers-public')
      .then(r => r.json())
      .then((data: unknown[]) => { if (Array.isArray(data)) setCount(data.length); })
      .catch(() => {});
  }, []);
  return count;
}

export default function Home() {
  const prefersReduced = useReducedMotion();
  const d = (n: number) => prefersReduced ? 0 : n;
  const providerCount = useProviderCount();

  // Parallax for hero background blobs
  const heroRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 600], [0, prefersReduced ? 0 : -180]);

  return (
    <>
      {/* Hero — white background matching rest of page */}
      <div className="relative overflow-hidden bg-white">
        <section ref={heroRef} className="min-h-[85vh] flex flex-col justify-center px-6 pt-28 pb-12 max-w-[1200px] mx-auto relative z-10">

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: d(0.5) }}
          className="mb-6">
          <span className="rounded-full px-4 py-1.5 text-[0.7rem] text-blue-600 tracking-[0.15em] uppercase font-medium inline-flex items-center gap-3 bg-blue-50 border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            referaus.com — Australia&apos;s NDIS Marketplace
          </span>
        </motion.div>

        <h1 className="heading-bold text-[clamp(2.8rem,7vw,5rem)] leading-[1.05] mb-6 max-w-[820px]">
          <BlurInText text="Find Trusted" delay={d(0.2)} />
          <br />
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: d(0.5), delay: d(0.4) }}
            className="inline-block"
          >
            NDIS{" "}<TypingWord />
          </motion.span>
          <br />
          <BlurInText text="Near You" delay={d(0.6)} />
        </h1>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: d(0.6), delay: d(0.2) }}
          className="mb-8">
          <HeroSubtitle />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: d(0.5), delay: d(0.3) }}
          className="mb-7">
          <SearchAutocomplete className="w-full max-w-[600px]" />
          <p className="mt-2 text-xs text-gray-400">Press <kbd className="inline-flex items-center px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 font-mono text-[10px] text-gray-500">/</kbd> to search</p>
          {/* Quick-Filter Chips */}
          <div className="mt-4 max-w-[600px]">
            <p className="text-xs text-gray-500 mb-2 font-medium">Popular searches:</p>
            <div className="flex flex-wrap gap-2">
              {["OT", "Speech", "Physio", "Psychology", "Support Coordination", "Plan Management", "Daily Living"].map((chip) => (
                <a
                  key={chip}
                  href={`/providers?q=${encodeURIComponent(chip)}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 bg-white text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                >
                  {chip}
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: d(0.5), delay: d(0.4) }}
          className="flex flex-wrap gap-3 mb-4">
          {[
            { icon: "🏢", label: "NDIS Providers" },
            { icon: "✅", label: "Verified Reviews" },
            { icon: "🆓", label: "100% Free" },
          ].map((badge) => (
            <span key={badge.label}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200">
              <span>{badge.icon}</span>
              {badge.label}
            </span>
          ))}
          {providerCount !== null && (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              {providerCount >= 10
                ? `Join ${providerCount} NDIS providers already on ReferAus`
                : "Join our growing network of NDIS providers"}
            </span>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: d(0.6), delay: d(0.55) }}
          className="flex flex-wrap gap-6 sm:gap-12 mt-12 pt-8 border-t border-gray-100">
          {[
            { num: 100, suffix: "%", label: "Free for Participants" },
            { num: 24, suffix: "/7", label: "Always Available" },
            { num: 5, suffix: "min", label: "To Get Listed" },
          ].map((s) => (
            <div key={s.label}>
              <div className="heading-bold text-[2rem] sm:text-[2.5rem] text-blue-600">
                <AnimatedCounter target={s.num} suffix={s.suffix} />
              </div>
              <div className="text-[0.75rem] text-gray-500 uppercase tracking-[0.1em] mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>
      </div>

      <div className="divider max-w-[800px] mx-auto" />

      {/* Trust Badges */}
      <section className="py-10 px-6 max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-blue-50 border border-blue-100 rounded-2xl py-8 px-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              {
                icon: (
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" className="text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
                label: "Verified Providers",
                desc: "Every provider reviewed",
              },
              {
                icon: (
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" className="text-orange-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                ),
                label: "Free for Participants",
                desc: "Always. No hidden costs",
              },
              {
                icon: (
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" className="text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                ),
                label: "Secure & Private",
                desc: "Your data is protected",
              },
              {
                icon: (
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" className="text-orange-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                label: "Australian Owned",
                desc: "Built in the Hunter Region",
              },
            ].map((badge) => (
              <div key={badge.label} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center">
                  {badge.icon}
                </div>
                <div className="font-semibold text-gray-900 text-sm">{badge.label}</div>
                <div className="text-xs text-gray-500">{badge.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <div className="divider max-w-[800px] mx-auto" />

      {/* NDIS Trust Markers */}
      <section className="bg-gray-50 border-y border-gray-100 py-8 px-6">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              {[
                { icon: "🏛️", label: "NDIS Provider Directory" },
                { icon: "🛡️", label: "Verified Providers" },
                { icon: "🇦🇺", label: "Australian Owned" },
                { icon: "🔒", label: "Privacy Compliant" },
              ].map((badge) => (
                <span
                  key={badge.label}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-medium text-gray-700"
                >
                  <span>{badge.icon}</span>
                  {badge.label}
                </span>
              ))}
            </div>
            <p className="text-center text-xs text-gray-400">
              ReferAus is an independent directory. We are not affiliated with the NDIA.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="divider max-w-[800px] mx-auto" />

      {/* How It Works */}
      <ScrollSection className="py-10 px-6 max-w-[1200px] mx-auto">
        <span className="glass-pill rounded-full px-3.5 py-1 text-xs font-medium text-orange-500 inline-block mb-4">How It Works</span>
        <h2 className="heading-bold text-[clamp(2rem,5vw,3.5rem)] leading-tight mb-3">Three steps. That&apos;s it.</h2>
        <p className="text-gray-500 max-w-[600px] mb-6 font-light">No sign-up required to browse. Find the support you need in minutes, not weeks.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: "🔍", num: "01", title: "Search", desc: "Enter your location and what kind of support you need. Filter by category, rating, availability, and distance." },
            { icon: "⚖️", num: "02", title: "Compare", desc: "Browse provider profiles with real reviews from other participants. See services, specialties, and ratings side by side." },
            { icon: "🤝", num: "03", title: "Connect", desc: "Send an enquiry or message the provider directly. No phone tag, no waiting on hold. Get a response and start." },
          ].map((step, i) => (
            <motion.div key={step.num} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: d(i * 0.15), duration: d(0.5) }}
              className="card p-8 relative overflow-hidden group">
              <div className="absolute top-4 right-5 heading-bold text-[4rem] text-gray-100 leading-none select-none group-hover:text-orange-50 transition-colors">
                {step.num}
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-2xl mb-5">
                {step.icon}
              </div>
              <h3 className="font-bold text-xl mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </ScrollSection>

      <div className="divider max-w-[800px] mx-auto" />

      {/* Features */}
      <ScrollSection className="py-10 px-6 max-w-[1200px] mx-auto">
        <span className="glass-pill rounded-full px-3.5 py-1 text-xs font-medium text-orange-500 inline-block mb-4">Why ReferAus</span>
        <h2 className="heading-bold text-[clamp(2rem,5vw,3.5rem)] leading-tight mb-3">Built for the NDIS community</h2>
        <p className="text-gray-500 max-w-[600px] mb-8 font-light">Everything participants and providers need to find each other — nothing they don&apos;t.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: d(i * 0.08), duration: d(0.4) }}
              className="glass-card relative overflow-hidden p-8 rounded-2xl hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4 text-lg">{f.icon}</div>
              <h3 className="font-semibold text-[1.05rem] mb-2">{f.title}</h3>
              <p className="text-gray-500 text-[0.85rem] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </ScrollSection>

      {/* Stats bar */}
      <ScrollSection className="bg-blue-600 text-white py-12 px-6">
        <div className="max-w-[1200px] mx-auto flex justify-around text-center flex-wrap gap-8">
          {[
            { num: "Growing", label: "Provider Network" },
            { num: "Free", label: "For Participants" },
            { num: "24/7", label: "Always Available" },
            { num: "Hunter", label: "Region Focus" },
          ].map((s) => (
            <div key={s.label}>
              <div className="heading-bold text-[2rem] sm:text-[3rem]">{s.num}</div>
              <div className="text-sm opacity-80 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </ScrollSection>

      {/* Early Access CTA */}
      <ScrollSection className="py-10 px-6 max-w-[1200px] mx-auto">
        <div className="text-center mb-8">
          <span className="glass-pill rounded-full px-3.5 py-1 text-xs font-medium text-orange-500 inline-block mb-4">Now Live</span>
          <h2 className="heading-bold text-[clamp(2rem,5vw,3.5rem)] leading-tight">Be one of the first providers on ReferAus</h2>
          <p className="text-gray-500 max-w-[600px] mx-auto mt-4 font-light">We&apos;re building the Hunter Region&apos;s most trusted NDIS provider directory. Early providers get maximum visibility as we grow.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[900px] mx-auto">
          {[
            { icon: "🥇", title: "First Mover Advantage", desc: "Be found first by participants searching for services in your area." },
            { icon: "📈", title: "Free to List", desc: "Create your profile in 5 minutes. No cost, no commitment. Upgrade when you're ready." },
            { icon: "✅", title: "Get Verified", desc: "Stand out with a verified badge that builds trust with NDIS participants." },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: d(i * 0.1), duration: d(0.4) }}
              className="glass-card-strong rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <div className="btn-gradient-border inline-block">
            <span className="block px-2 py-1 rounded-[10px]">
              <Link href="/register" className="inline-block px-8 py-4 bg-orange-500 text-white font-bold rounded-[8px] hover:bg-orange-400 hover:-translate-y-0.5 transition-all shadow-lg">
                List Your Organisation Free
              </Link>
            </span>
          </div>
        </div>
      </ScrollSection>

      <div className="divider max-w-[800px] mx-auto" />

      {/* Testimonials - static cards */}
      <section className="py-10 px-6 max-w-[1200px] mx-auto">
        <p className="section-label mb-3">Why ReferAus</p>
        <h2 className="heading-bold text-[clamp(2rem,5vw,3.5rem)] leading-tight mb-8">A better way to connect</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: d(i * 0.1), duration: d(0.4) }}
              className="glass-card rounded-2xl p-8">
              <div className="font-bold text-lg mb-2 text-gray-900">{t.name}</div>
              <div className="text-xs text-orange-500 font-medium uppercase tracking-wider mb-4">{t.role}</div>
              <p className="text-gray-600 text-sm leading-relaxed">{t.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="divider max-w-[800px] mx-auto" />

      {/* Provider CTA */}
      <section className="py-10 px-6 max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: d(0.5) }}
          className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          <div>
            <p className="font-mono text-[0.7rem] tracking-[0.2em] uppercase text-orange-500 mb-3">For Providers</p>
            <h2 className="heading-bold text-[clamp(1.8rem,4vw,2.8rem)] mb-3 text-gray-900">Are you an NDIS Provider?</h2>
            <p className="text-gray-500 max-w-[480px] leading-relaxed text-sm">
              Get listed in front of NDIS participants actively searching for your services in the Hunter Region. Free to list — upgrade when you&apos;re ready.
            </p>
            <ul className="mt-5 space-y-2">
              {["Free basic listing", "Verified profile badge", "Direct participant messaging"].map((item) => (
                <li key={item} className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="text-orange-400 font-bold">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3 min-w-[200px] text-center">
            <div className="btn-gradient-border">
              <span className="block px-2 py-1 rounded-[10px]">
                <Link href="/register"
                  className="block px-8 py-4 bg-orange-500 text-white font-bold rounded-[8px] hover:bg-orange-400 hover:-translate-y-0.5 transition-all shadow-lg whitespace-nowrap">
                  List Your Organisation Free
                </Link>
              </span>
            </div>
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              View pricing plans &rarr;
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Provider Pricing */}
      <section className="py-8 pb-10 px-6 max-w-[1200px] mx-auto">
        <p className="section-label mb-3">For Providers</p>
        <h2 className="heading-bold text-[clamp(2rem,5vw,3.5rem)] leading-tight mb-3">Grow your organisation</h2>
        <p className="text-gray-500 max-w-[600px] mb-8 font-light">Get found by participants actively looking for your services. Free to list. Upgrade when you&apos;re ready.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { tier: "Free", price: "$0", desc: "Get listed and start receiving enquiries.", features: ["Basic provider listing", "Show services and areas", "Enquiry notifications", "Up to 5 reviews"], cta: "Get Started Free", style: "outline" },
            { tier: "Starter", price: "$29", desc: "Perfect for new providers building their presence.", features: ["Verified badge", "Priority search ranking", "Up to 10 categories", "Review management"], cta: "Get Starter", style: "outline" },
            { tier: "Pro", price: "$79", desc: "Everything you need to grow.", features: ["Everything in Starter", "Direct messaging", "Analytics dashboard", "Unlimited categories", "Area alerts"], cta: "Get Pro", style: "orange", popular: true },
            { tier: "Premium", price: "$149", desc: "Maximum visibility and dedicated support.", features: ["Everything in Pro", "Featured placement", "Multi-location support", "Custom branded profile", "Dedicated manager"], cta: "Get Premium", style: "outline" },
          ].map((plan) => (
            <div key={plan.tier} className={`bg-white border rounded-xl p-8 relative ${plan.popular ? "border-orange-500 shadow-lg shadow-orange-500/10" : "border-gray-200"}`}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[0.6rem] font-bold px-3 py-0.5 rounded-full tracking-wider">MOST POPULAR</div>}
              <div className="text-sm text-gray-500 uppercase tracking-wider">{plan.tier}</div>
              <div className="heading-bold text-[3rem] my-2">{plan.price}<span className="text-base text-gray-400 font-sans not-italic">/mo</span></div>
              <p className="text-sm text-gray-500 mb-6">{plan.desc}</p>
              <ul className="space-y-2 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="text-orange-500 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register"
                className={`block text-center py-3 rounded-lg font-semibold text-sm transition-all ${plan.style === "orange" ? "bg-orange-500 text-white hover:bg-orange-600" : "border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterSection />

      {/* Participant CTA Banner */}
      <section className="max-w-[1200px] mx-auto px-6 pb-10">
        <div className="bg-gradient-to-br from-orange-500 to-orange-400 text-white rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="heading-bold text-[clamp(1.8rem,4vw,2.8rem)] mb-4">Ready to find the right provider?</h2>
          <p className="opacity-90 max-w-[500px] mx-auto mb-8">Search, compare, and connect with NDIS providers in Newcastle and the Hunter Region. Free, fast, and built for participants.</p>
          <Link href="/providers" className="inline-block px-8 py-3.5 bg-white text-orange-500 font-bold rounded-lg hover:-translate-y-0.5 hover:shadow-lg transition-all">
            Search Providers Now
          </Link>
        </div>
      </section>

      {/* Activity Social Proof */}
      {/* Social proof removed until we have real data */}
    </>
  );
}
