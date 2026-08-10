"use client";
import { motion, useInView, useReducedMotion, Variants, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { SearchAutocomplete } from '@/components/SearchAutocomplete';
import { AuroraBackground } from '@/components/AuroraBackground';
import { Icon } from "@/components/Icon";
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
    <em className="gradient-accent-text inline-block">
      {displayed}
      <span className={`ml-0.5 inline-block w-[3px] h-[0.85em] bg-orange-500 align-middle transition-opacity ${showCursor ? "opacity-100" : "opacity-0"}`} />
    </em>
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
          className="text-ink-300 text-lg max-w-[550px] font-light leading-relaxed absolute"
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
            <div className="eyebrow-rule text-orange-500 mb-2">Newsletter</div>
            <h2 className="heading-bold text-xl sm:text-2xl text-ink-900 mb-1">Stay in the loop</h2>
            <p className="text-ink-500 text-sm">
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
                  className="flex-1 px-4 py-3.5 rounded-xl border border-line-200 text-sm focus:outline-none focus:border-blue-500 transition-colors"
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
  { icon: "search" as const, title: "Smart Search", desc: "Search by location, NDIS support category, availability, and ratings. Find providers who offer what you need, near where you are." },
  { icon: "star" as const, title: "Real Reviews", desc: "Verified reviews from real NDIS participants. No fake ratings, no paid placements. See what people actually think." },
  { icon: "message" as const, title: "Direct Messaging", desc: "Message providers instantly. Ask questions, check availability, discuss your needs before you pick up the phone." },
  { icon: "clipboard" as const, title: "Detailed Profiles", desc: "Every provider shows services, areas covered, qualifications, availability, and what participants say about them." },
  { icon: "pin" as const, title: "Location-Based", desc: "Find providers near you. Search by suburb, region, or postcode. See distance and service areas at a glance." },
  { icon: "check" as const, title: "Free for Participants", desc: "Always. No sign-up fees, no premium tiers, no hidden costs. Browse, search, message, connect completely free." },
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

// Approximate placement (% within the hero map panel) for Hunter Region
// suburbs — the map itself is a stylised illustration, not a real
// projection, so these are hand-placed rather than real lat/lng.
const SUBURB_MAP_POSITIONS: Record<string, { top: string; left: string }> = {
  "newcastle": { top: "52%", left: "60%" },
  "newcastle west": { top: "50%", left: "58%" },
  "mayfield": { top: "44%", left: "56%" },
  "wallsend": { top: "40%", left: "62%" },
  "hamilton": { top: "48%", left: "62%" },
  "lambton": { top: "42%", left: "64%" },
  "adamstown": { top: "56%", left: "62%" },
  "merewether": { top: "58%", left: "66%" },
  "charlestown": { top: "64%", left: "68%" },
  "belmont": { top: "70%", left: "72%" },
  "lake macquarie": { top: "72%", left: "68%" },
  "toronto": { top: "76%", left: "60%" },
  "morisset": { top: "82%", left: "58%" },
  "swansea": { top: "78%", left: "70%" },
  "maitland": { top: "30%", left: "46%" },
  "cessnock": { top: "34%", left: "36%" },
  "kurri kurri": { top: "30%", left: "38%" },
  "singleton": { top: "20%", left: "30%" },
  "muswellbrook": { top: "12%", left: "24%" },
  "port stephens": { top: "24%", left: "78%" },
  "raymond terrace": { top: "26%", left: "66%" },
};

interface HomeProvider {
  slug: string;
  name: string;
  category: string;
  suburb: string;
  rating: number;
  review_count: number;
}

function useHomeProviders() {
  const [providers, setProviders] = useState<HomeProvider[] | null>(null);
  useEffect(() => {
    fetch('/api/providers-public')
      .then(r => r.json())
      .then((data: unknown[]) => { if (Array.isArray(data)) setProviders(data as HomeProvider[]); })
      .catch(() => {});
  }, []);
  return providers;
}

export default function Home() {
  const prefersReduced = useReducedMotion();
  const d = (n: number) => prefersReduced ? 0 : n;
  const homeProviders = useHomeProviders();
  const providerCount = homeProviders?.length ?? null;

  // Only plot pins for providers that are actually listed, matched to a
  // known Hunter Region suburb — no placeholder/dummy pins.
  const mapPins = (homeProviders ?? [])
    .map((p) => ({ provider: p, pos: SUBURB_MAP_POSITIONS[(p.suburb || "").trim().toLowerCase()] }))
    .filter((p): p is { provider: HomeProvider; pos: { top: string; left: string } } => !!p.pos)
    .slice(0, 6);
  const featuredMapProvider = [...mapPins].sort((a, b) => (b.provider.rating || 0) - (a.provider.rating || 0))[0];

  // Parallax for hero background blobs
  const heroRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 600], [0, prefersReduced ? 0 : -180]);

  return (
    <>
      {/* Hero — dark editorial panel + Hunter Region map */}
      <div className="bg-paper">
        <section ref={heroRef} className="grid lg:grid-cols-[60%_40%] min-h-[85vh]">
          {/* Left: editorial copy */}
          <div className="relative flex flex-col justify-center bg-ink-950 text-cream px-8 sm:px-12 py-14 overflow-hidden">
            <div className="relative z-20">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: d(0.5) }}
                className="eyebrow-rule text-orange-500 mb-6">
                Newcastle — Hunter Region, NSW
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: d(0.6), delay: d(0.1) }}
                className="h-editorial text-[clamp(2.4rem,4vw,3.6rem)] mb-6"
              >
                Support,<br />sorted by <em>people<br />who live here.</em>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: d(0.5), delay: d(0.25) }}
                className="text-[15px] leading-relaxed text-ink-soft font-light max-w-[340px] mb-8">
                Not a national call centre. A directory built and checked by the Hunter Region community — search, compare, and message providers directly.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: d(0.5), delay: d(0.35) }}
                className="mb-7">
                <SearchAutocomplete className="w-full max-w-[420px]" />
                <p className="mt-2 text-xs text-ink-soft">Press <kbd className="inline-flex items-center px-1.5 py-0.5 rounded border border-line-dark font-mono text-[10px] text-ink-soft">/</kbd> to search</p>
                <div className="mt-4 flex flex-wrap gap-2 max-w-[420px]">
                  {["OT", "Speech", "Physio", "Psychology", "Support Coordination", "Plan Management", "Daily Living"].map((chip) => (
                    <Link
                      key={chip}
                      href={`/providers?q=${encodeURIComponent(chip)}`}
                      className="link-underline border-line-dark text-cream hover:border-orange-500 !text-xs"
                    >
                      {chip}
                    </Link>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: d(0.5), delay: d(0.45) }}
                className="flex items-center gap-7">
                <Link href="/providers" className="btn-block">Search the network →</Link>
                <Link href="/register" className="link-underline border-line-dark text-cream hover:border-orange-500">List a business</Link>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: d(0.6), delay: d(0.6) }}
              className="relative z-10 flex justify-between items-end border-t border-line-dark pt-5 mt-12">
              <div className="font-mono">
                <div className="text-[22px] font-medium text-cream">
                  {providerCount !== null ? providerCount : "—"}
                </div>
                <div className="text-[10.5px] text-ink-soft uppercase tracking-[0.08em] mt-0.5">Active listings</div>
              </div>
              <div className="font-mono">
                <div className="text-[22px] font-medium text-cream">100%</div>
                <div className="text-[10.5px] text-ink-soft uppercase tracking-[0.08em] mt-0.5">Free to search</div>
              </div>
              <div className="font-mono">
                <div className="text-[22px] font-medium text-cream">24/7</div>
                <div className="text-[10.5px] text-ink-soft uppercase tracking-[0.08em] mt-0.5">Search anytime</div>
              </div>
            </motion.div>
          </div>

          {/* Right: Hunter Region map */}
          <div className="relative overflow-hidden bg-map-panel min-h-[420px]">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 900 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <path fill="var(--color-map-panel-deep)" d="M900,0 L900,1000 L280,1000 C240,900 300,820 260,760 C210,690 300,640 270,570 C240,500 340,470 310,400 C280,330 380,300 350,220 C320,140 420,110 400,40 C390,10 420,0 420,0 Z"/>
              <path fill="none" stroke="var(--color-line-map)" strokeWidth="1" d="M900,90 C560,60 480,150 430,90 C400,55 420,10 420,10"/>
              <path fill="none" stroke="var(--color-line-map)" strokeWidth="1" d="M900,180 C520,150 440,240 380,180 C340,140 360,80 340,60"/>
              <path fill="none" stroke="var(--color-line-map)" strokeWidth="1" d="M900,270 C480,240 400,330 330,270 C280,220 300,150 270,120"/>
              <path fill="none" stroke="var(--color-line-map)" strokeWidth="1" d="M900,420 C440,390 360,480 290,420 C240,370 260,300 230,270"/>
              <path fill="none" stroke="var(--color-line-map)" strokeWidth="1" d="M900,560 C400,540 320,620 260,560 C220,520 230,460 200,430"/>
              <path fill="none" stroke="var(--color-line-map)" strokeWidth="1" d="M900,700 C380,690 300,760 250,710 C210,670 220,610 190,590"/>
            </svg>

            <div className="absolute top-7 right-10 font-mono text-[11px] text-ink-900 text-right tracking-wide">
              HUNTER REGION<br />
              <span className="text-orange-500 font-medium">
                {providerCount !== null ? `${providerCount} ACTIVE LISTINGS` : "LOADING LISTINGS…"}
              </span>
            </div>

            {mapPins.map(({ provider, pos }) => (
              <Link
                key={provider.slug}
                href={`/providers/${provider.slug}`}
                className="map-pin"
                style={pos}
                aria-label={provider.name}
              >
                {provider.slug === featuredMapProvider?.provider.slug && <span className="map-pin-ring" />}
              </Link>
            ))}

            {featuredMapProvider && (
              <Link
                href={`/providers/${featuredMapProvider.provider.slug}`}
                className="card-flat absolute p-4 w-[200px] block"
                style={{
                  top: `calc(${featuredMapProvider.pos.top} - 14px)`,
                  left: `calc(${featuredMapProvider.pos.left} + 18px)`,
                }}
              >
                <div className="text-[13px] font-bold text-ink-900 mb-0.5">{featuredMapProvider.provider.name}</div>
                <div className="text-[11px] text-ink-500">{featuredMapProvider.provider.category} · {featuredMapProvider.provider.suburb}</div>
                <div className="font-mono text-[10.5px] text-orange-500 mt-2">★ {featuredMapProvider.provider.rating?.toFixed(1) ?? "—"} · {featuredMapProvider.provider.review_count ?? 0} reviews</div>
              </Link>
            )}

            {homeProviders !== null && mapPins.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center px-10 text-center">
                <p className="font-mono text-[11px] text-ink-500 uppercase tracking-wide">New listings coming to the map soon</p>
              </div>
            )}

            <div className="absolute bottom-6 left-10 font-mono text-[10.5px] text-ink-500">32.9283° S, 151.7817° E</div>
          </div>
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
                <div className="w-12 h-12 rounded-[3px] bg-white border border-ink-900 flex items-center justify-center">
                  {badge.icon}
                </div>
                <div className="font-semibold text-ink-900 text-sm">{badge.label}</div>
                <div className="text-xs text-ink-500">{badge.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <div className="divider max-w-[800px] mx-auto" />

      {/* NDIS Trust Markers */}
      <section className="bg-gray-50 border-y border-line-100 py-8 px-6">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              {[
                "NDIS Provider Directory",
                "Verified Providers",
                "Australian Owned",
                "Privacy Compliant",
              ].map((label) => (
                <span
                  key={label}
                  className="font-mono text-[11px] uppercase tracking-wide px-3.5 py-2 rounded-[2px] bg-white border border-line-200 text-ink-700"
                >
                  {label}
                </span>
              ))}
            </div>
            <p className="text-center text-xs text-ink-400">
              ReferAus is an independent directory. We are not affiliated with the NDIA.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="divider max-w-[800px] mx-auto" />

      {/* How It Works */}
      <ScrollSection className="py-10 px-6 max-w-[1200px] mx-auto">
        <div className="eyebrow-rule text-orange-500 mb-4">How it works</div>
        <h2 className="h-editorial text-[clamp(2rem,5vw,3.2rem)] mb-3">Three steps. <em>That&apos;s it.</em></h2>
        <p className="text-ink-500 max-w-[600px] mb-6 font-light">No sign-up required to browse. Find the support you need in minutes, not weeks.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { num: "01", title: "Search", desc: "Enter your location and what kind of support you need. Filter by category, rating, availability, and distance." },
            { num: "02", title: "Compare", desc: "Browse provider profiles with real reviews from other participants. See services, specialties, and ratings side by side." },
            { num: "03", title: "Connect", desc: "Send an enquiry or message the provider directly. No phone tag, no waiting on hold. Get a response and start." },
          ].map((step, i) => (
            <motion.div key={step.num} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: d(i * 0.15), duration: d(0.5) }}
              className="card-flat p-8 relative overflow-hidden group">
              <div className="absolute top-4 right-5 h-editorial text-[4rem] text-line-100 leading-none select-none group-hover:text-orange-50 transition-colors">
                {step.num}
              </div>
              <div className="font-mono text-[11px] text-orange-500 mb-4 relative">{step.num} / {step.title.toUpperCase()}</div>
              <h3 className="font-bold text-xl mb-2">{step.title}</h3>
              <p className="text-ink-500 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </ScrollSection>

      <div className="divider max-w-[800px] mx-auto" />

      {/* Features */}
      <ScrollSection className="py-10 px-6 max-w-[1200px] mx-auto">
        <div className="eyebrow-rule text-orange-500 mb-4">Why ReferAus</div>
        <h2 className="h-editorial text-[clamp(2rem,5vw,3.2rem)] mb-3">Built for the <em>NDIS community.</em></h2>
        <p className="text-ink-500 max-w-[600px] mb-8 font-light">Everything participants and providers need to find each other — nothing they don&apos;t.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: d(i * 0.08), duration: d(0.4) }}
              className="card-flat p-8">
              <div className="w-8 h-1 bg-orange-500 mb-4" />
              <h3 className="font-semibold text-[1.05rem] mb-2">{f.title}</h3>
              <p className="text-ink-500 text-[0.85rem] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </ScrollSection>

      {/* Stat rail — hairline-divided mono figures, matching the hero's footer rail */}
      <ScrollSection className="border-y border-line-200 py-10 px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4">
          {[
            { num: "Growing", label: "Provider network" },
            { num: "Free", label: "For participants" },
            { num: "24/7", label: "Always available" },
            { num: "Hunter", label: "Region focus" },
          ].map((s, i) => (
            <div
              key={s.label}
              className={`py-3 px-6 ${i > 0 ? "md:border-l md:border-line-200" : ""}`}
            >
              <div className="font-mono text-[26px] font-medium tracking-tight text-ink-900">{s.num}</div>
              <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </ScrollSection>

      {/* Early Access CTA */}
      <ScrollSection className="py-10 px-6 max-w-[1200px] mx-auto">
        <div className="text-center mb-8">
          <div className="eyebrow-rule text-orange-500 justify-center mb-4">Now live</div>
          <h2 className="h-editorial text-[clamp(2rem,5vw,3.2rem)]">Be one of the first providers <em>on ReferAus.</em></h2>
          <p className="text-ink-500 max-w-[600px] mx-auto mt-4 font-light">We&apos;re building the Hunter Region&apos;s most trusted NDIS provider directory. Early providers get maximum visibility as we grow.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[900px] mx-auto">
          {[
            { title: "First Mover Advantage", desc: "Be found first by participants searching for services in your area." },
            { title: "Free to List", desc: "Create your profile in 5 minutes. No cost, no commitment. Upgrade when you're ready." },
            { title: "Get Verified", desc: "Stand out with a verified badge that builds trust with NDIS participants." },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: d(i * 0.1), duration: d(0.4) }}
              className="card-flat p-6 text-center">
              <div className="font-mono text-[11px] text-orange-500 mb-3">{String(i + 1).padStart(2, "0")}</div>
              <h3 className="font-bold text-ink-900 mb-2">{item.title}</h3>
              <p className="text-sm text-ink-500">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/register" className="btn-block !inline-flex">
            List Your Organisation Free →
          </Link>
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
              <div className="font-bold text-lg mb-2 text-ink-900">{t.name}</div>
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
          className="bg-white border border-line-200 rounded-2xl p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          <div>
            <p className="font-mono text-[0.7rem] tracking-[0.2em] uppercase text-orange-500 mb-3">For Providers</p>
            <h2 className="heading-bold text-[clamp(1.8rem,4vw,2.8rem)] mb-3 text-ink-900">Are you an NDIS Provider?</h2>
            <p className="text-ink-500 max-w-[480px] leading-relaxed text-sm">
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
            <Link href="/pricing" className="text-sm text-ink-400 hover:text-gray-600 transition-colors">
              View pricing plans &rarr;
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Provider Pricing */}
      <section className="py-8 pb-10 px-6 max-w-[1200px] mx-auto">
        <p className="section-label mb-3">For Providers</p>
        <h2 className="heading-bold text-[clamp(2rem,5vw,3.5rem)] leading-tight mb-3">Grow your organisation</h2>
        <p className="text-ink-500 max-w-[600px] mb-8 font-light">Get found by participants actively looking for your services. Free to list. Upgrade when you&apos;re ready.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { tier: "Free", price: "$0", desc: "Get listed and start receiving enquiries.", features: ["Basic provider listing", "Show services and areas", "Enquiry notifications", "Up to 5 reviews"], cta: "Get Started Free", style: "outline" },
            { tier: "Starter", price: "$29", desc: "Perfect for new providers building their presence.", features: ["Verified badge", "Priority search ranking", "Up to 10 categories", "Review management"], cta: "Get Starter", style: "outline" },
            { tier: "Pro", price: "$79", desc: "Everything you need to grow.", features: ["Everything in Starter", "Direct messaging", "Analytics dashboard", "Unlimited categories", "Area alerts"], cta: "Get Pro", style: "orange", popular: true },
            { tier: "Premium", price: "$149", desc: "Maximum visibility and dedicated support.", features: ["Everything in Pro", "Featured placement", "Multi-location support", "Custom branded profile", "Dedicated manager"], cta: "Get Premium", style: "outline" },
          ].map((plan) => (
            <div key={plan.tier} className={`bg-white border rounded-xl p-8 relative ${plan.popular ? "border-orange-500 shadow-lg shadow-orange-500/10" : "border-line-200"}`}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[0.6rem] font-bold px-3 py-0.5 rounded-full tracking-wider">MOST POPULAR</div>}
              <div className="text-sm text-ink-500 uppercase tracking-wider">{plan.tier}</div>
              <div className="heading-bold text-[3rem] my-2">{plan.price}<span className="text-base text-ink-400 font-sans not-italic">/mo</span></div>
              <p className="text-sm text-ink-500 mb-6">{plan.desc}</p>
              <ul className="space-y-2 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-ink-500 flex items-center gap-2">
                    <span className="text-orange-500 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register"
                className={`block text-center py-3 rounded-lg font-semibold text-sm transition-all ${plan.style === "orange" ? "bg-orange-500 text-white hover:bg-orange-600" : "border border-line-200 text-ink-700 hover:border-blue-600 hover:text-blue-600"}`}>
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
        <div className="bg-ink-950 text-cream rounded-[3px] p-8 sm:p-14 text-center">
          <div className="eyebrow-rule text-orange-500 justify-center mb-4">For participants</div>
          <h2 className="h-editorial text-[clamp(1.9rem,4vw,2.8rem)] text-cream mb-4">
            Ready to find <em>the right provider?</em>
          </h2>
          <p className="text-ink-soft max-w-[500px] mx-auto mb-8">Search, compare, and message NDIS providers across Newcastle and the Hunter Region. Free, fast, and built for participants.</p>
          <Link href="/providers" className="btn-block">
            Search providers now →
          </Link>
        </div>
      </section>

      {/* Activity Social Proof */}
      {/* Social proof removed until we have real data */}
    </>
  );
}
