"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const plans = [
  { name: "Free", slug: "free", monthlyPrice: 0, yearlyPrice: 0, yearlySaving: 0, desc: "Get discovered by NDIS participants in your area.", features: ["Basic provider profile", "Appear in search results", "Receive enquiries via email", "Up to 5 service categories"], cta: "Get Started Free", highlight: false, popular: false },
  { name: "Starter", slug: "starter", monthlyPrice: 29, yearlyPrice: 199, yearlySaving: 149, desc: "Perfect for new providers building their presence.", features: ["Verified badge", "Priority search ranking", "Up to 10 service categories", "Review management", "Email support"], cta: "Get Starter", highlight: false, popular: false },
  { name: "Pro", slug: "pro", monthlyPrice: 79, yearlyPrice: 549, yearlySaving: 399, desc: "Everything you need to grow your provider business.", features: ["Everything in Starter", "Direct booking system", "Analytics dashboard", "Unlimited service categories", "Area alerts", "Phone and email support"], cta: "Get Pro", highlight: true, popular: true },
  { name: "Premium", slug: "premium", monthlyPrice: 149, yearlyPrice: 999, yearlySaving: 789, desc: "For established providers who want maximum visibility.", features: ["Everything in Pro", "Featured homepage placement", "Competitor insights", "Custom branded profile", "API access", "Dedicated account manager", "Multi-location support"], cta: "Get Premium", highlight: false, popular: false },
];

type Plan = typeof plans[0];

// Computed from the actual plan prices above rather than hardcoded, so the
// "Save X%" badge can never drift out of sync with the real numbers again —
// it was previously a static "17%" while the real per-plan savings ran
// 42-44%. Averaged across the paid plans and rounded to the nearest percent.
const paidPlans = plans.filter((p) => p.monthlyPrice > 0);
const avgYearlySavingPercent = Math.round(
  (paidPlans.reduce((sum, p) => sum + p.yearlySaving / (p.monthlyPrice * 12), 0) / paidPlans.length) * 100
);

function CheckoutModal({ plan, billing, onClose }: { plan: Plan; billing: "monthly" | "yearly"; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const price = billing === "yearly" ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { setError("Please enter your email."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.slug, billing, email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-cream border border-ink-950 rounded-[3px] shadow-[6px_6px_0_var(--color-ink-950)] p-8 w-full max-w-md z-10">
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-ink-400 hover:text-ink-700 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
        <div className="mb-6">
          <div className="eyebrow-rule text-orange-500 mb-2">Checkout</div>
          <h2 className="h-editorial text-2xl mb-1">Start <em>{plan.name}.</em></h2>
          <p className="font-mono text-[11px] text-ink-500">
            ${price}/MO{billing === "yearly" ? " — BILLED $" + plan.yearlyPrice + "/YR" : " — BILLED MONTHLY"} — CANCEL ANYTIME
          </p>
        </div>
        <form onSubmit={handleCheckout} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Business email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourbusiness.com.au"
              className="w-full px-4 py-3 rounded-[3px] border border-ink-950 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm transition-all"
              autoFocus
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-[3px] font-bold text-sm bg-orange-500 hover:bg-orange-400 text-ink-950 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                Redirecting to payment...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                Continue to secure checkout
              </>
            )}
          </button>
        </form>
        <p className="font-mono text-[10px] uppercase tracking-wide text-ink-400 text-center mt-4">
          Payments by Stripe — 256-bit SSL — All prices in AUD
        </p>
      </motion.div>
    </div>
  );
}

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const [modal, setModal] = useState<{ plan: Plan; billing: "monthly" | "yearly" } | null>(null);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const pricingCardsRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!pricingCardsRef.current) return;
    const rect = pricingCardsRef.current.getBoundingClientRect();
    // Show sticky bar once pricing cards are scrolled past the viewport
    setShowStickyCTA(rect.bottom < 0);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  function handleCTA(plan: Plan) {
    if (plan.slug === "free") return;
    setModal({ plan, billing: yearly ? "yearly" : "monthly" });
  }

  return (
    <div className="min-h-screen pt-28 pb-14 px-4 sm:px-6">
      {/* Sticky CTA Bar */}
      <AnimatePresence>
        {showStickyCTA && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-ink-950 border-t border-line-dark px-6 py-4"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-cream text-sm sm:text-base">Ready to list your business?</p>
                <p className="text-xs text-ink-soft hidden sm:block">Join NDIS providers already on ReferAus. Free to start.</p>
              </div>
              <Link
                href="/register"
                className="btn-block flex-shrink-0 whitespace-nowrap"
              >
                Get Started Free →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modal && (
          <CheckoutModal plan={modal.plan} billing={modal.billing} onClose={() => setModal(null)} />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        <Breadcrumbs />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="eyebrow-rule text-orange-500 justify-center mb-4">Pricing</div>
          <h1 className="h-editorial text-4xl sm:text-5xl mb-4">
            Simple, transparent <em>pricing.</em>
          </h1>
          <p className="text-lg text-ink-500 max-w-lg mx-auto">Free for participants. Affordable plans for providers who want to grow.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center justify-center gap-4 mb-14">
          <span className={"text-sm font-medium " + (!yearly ? "text-ink-900" : "text-ink-400")}>Monthly</span>
          <button onClick={() => setYearly(!yearly)} className="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400" style={{ backgroundColor: yearly ? "#f97316" : "#E5E7EB" }} aria-label="Toggle yearly billing">
            <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300" style={{ transform: yearly ? "translateX(24px)" : "translateX(0)" }} />
          </button>
          <span className={"text-sm font-medium " + (yearly ? "text-ink-900" : "text-ink-400")}>Yearly</span>
          <span className="font-mono text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-[2px] border border-green-600 text-green-700">Save {avgYearlySavingPercent}%</span>
        </motion.div>

        <div ref={pricingCardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={"card-flat relative p-5 sm:p-7 flex flex-col " + (plan.highlight ? "!shadow-[7px_7px_0_var(--color-orange-500)]" : "")}
            >
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><span className="font-mono text-[10px] uppercase tracking-wide px-3 py-1 rounded-[2px] bg-orange-500 text-ink-950 font-semibold whitespace-nowrap">Most popular</span></div>}
              <div className="font-mono text-[11px] text-orange-500 uppercase tracking-wide mb-1">{plan.name}</div>
              <div className="flex items-baseline gap-1 mb-1" style={{ minHeight: "52px" }}>
                <AnimatePresence mode="wait">
                  <motion.span key={yearly ? "yearly" : "monthly"} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.18 }} className="font-mono text-4xl font-medium text-ink-900">
                    {plan.monthlyPrice === 0 ? "$0" : yearly ? "$" + Math.round(plan.yearlyPrice / 12) : "$" + plan.monthlyPrice}
                  </motion.span>
                </AnimatePresence>
                <span className="text-sm text-ink-400">{plan.monthlyPrice === 0 ? "forever" : "/month"}</span>
              </div>
              <div className="mb-3" style={{ minHeight: "20px" }}>
                <AnimatePresence>
                  {yearly && plan.yearlySaving > 0 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-mono text-[10.5px] text-green-700">${plan.yearlyPrice}/yr — save ${plan.yearlySaving}</motion.p>}
                </AnimatePresence>
              </div>
              <p className="text-sm text-ink-500 mb-6 flex-shrink-0">{plan.desc}</p>
              {plan.slug === "free" ? (
                <Link href="/register?plan=free" className="block text-center py-3 rounded-[3px] font-semibold text-sm transition-all mb-7 bg-white hover:bg-line-100 text-ink-900 border border-ink-950">{plan.cta}</Link>
              ) : (
                <button onClick={() => handleCTA(plan)} className={"w-full py-3 rounded-[3px] font-semibold text-sm transition-all mb-7 " + (plan.highlight ? "bg-orange-500 hover:bg-orange-400 text-ink-950" : "bg-white hover:bg-line-100 text-ink-900 border border-ink-950")}>{plan.cta}</button>
              )}
              <ul className="space-y-2.5 mt-auto">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-ink-500">
                    <svg className="flex-shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={plan.highlight ? "#f97316" : "#4B5563"} strokeWidth="2.5"><path d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center font-mono text-[10.5px] uppercase tracking-wide text-ink-400 mt-12">
          All prices in AUD — Cancel anytime — Free for all NDIS participants
        </motion.p>
      </div>
    </div>
  );
}
