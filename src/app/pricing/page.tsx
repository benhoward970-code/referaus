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
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md z-10">
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
        <div className="mb-6">
          <h2 className="text-2xl font-black mb-1">Start {plan.name}</h2>
          <p className="text-gray-500 text-sm">
            ${price}/mo{billing === "yearly" ? " � billed $" + plan.yearlyPrice + "/yr" : " � billed monthly"} � Cancel anytime
          </p>
        </div>
        <form onSubmit={handleCheckout} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Business email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourbusiness.com.au"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
              autoFocus
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        <p className="text-xs text-gray-400 text-center mt-4">
          Payments processed by Stripe · 256-bit SSL encryption · All prices in AUD
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
            className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-6 py-4"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-gray-900 text-sm sm:text-base">Ready to list your business?</p>
                <p className="text-xs text-gray-500 hidden sm:block">Join NDIS providers already on ReferAus. Free to start.</p>
              </div>
              <Link
                href="/register"
                className="flex-shrink-0 px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm rounded-xl transition-all shadow-sm whitespace-nowrap"
              >
                Get Started Free
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
          <span className="text-xs font-semibold tracking-widest uppercase text-orange-400 mb-4 block">Pricing</span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Simple, transparent <span className="gradient-text">pricing</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-lg mx-auto">Free for participants. Affordable plans for providers who want to grow.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center justify-center gap-4 mb-14">
          <span className={"text-sm font-medium " + (!yearly ? "text-gray-900" : "text-gray-400")}>Monthly</span>
          <button onClick={() => setYearly(!yearly)} className="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none" style={{ backgroundColor: yearly ? "#2563EB" : "#E5E7EB" }} aria-label="Toggle yearly billing">
            <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300" style={{ transform: yearly ? "translateX(24px)" : "translateX(0)" }} />
          </button>
          <span className={"text-sm font-medium " + (yearly ? "text-gray-900" : "text-gray-400")}>Yearly</span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700 tracking-wide">Save 17%</span>
        </motion.div>

        <div ref={pricingCardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className={"relative rounded-2xl p-5 sm:p-7 flex flex-col transition-all hover:shadow-2xl hover:-translate-y-2"} style={plan.highlight ? { background: "#ffffff", border: "3px solid #2563eb", boxShadow: "0 20px 80px -20px rgba(37,99,235,0.5), 0 0 0 1px rgba(255,255,255,0.8) inset" } : { background: "#ffffff", border: "2px solid #d1d5db", boxShadow: "0 20px 60px -15px rgba(0,0,0,0.25)" }}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-600 text-white whitespace-nowrap">Most Popular</span></div>}
              <h3 className="text-base font-bold mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-1" style={{ minHeight: "52px" }}>
                <AnimatePresence mode="wait">
                  <motion.span key={yearly ? "yearly" : "monthly"} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.18 }} className="text-4xl font-black">
                    {plan.monthlyPrice === 0 ? "$0" : yearly ? "$" + Math.round(plan.yearlyPrice / 12) : "$" + plan.monthlyPrice}
                  </motion.span>
                </AnimatePresence>
                <span className="text-sm text-gray-400">{plan.monthlyPrice === 0 ? "forever" : "/month"}</span>
              </div>
              <div className="mb-3" style={{ minHeight: "20px" }}>
                <AnimatePresence>
                  {yearly && plan.yearlySaving > 0 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-green-600 font-medium">${plan.yearlyPrice}/yr - save ${plan.yearlySaving}</motion.p>}
                </AnimatePresence>
              </div>
              <p className="text-sm text-gray-500 mb-6 flex-shrink-0">{plan.desc}</p>
              {plan.slug === "free" ? (
                <Link href="/register?plan=free" className="block text-center py-3 rounded-xl font-semibold text-sm transition-all mb-7 bg-purple-50 hover:bg-gray-100 text-gray-900 border border-gray-200">{plan.cta}</Link>
              ) : (
                <button onClick={() => handleCTA(plan)} className={"w-full py-3 rounded-xl font-semibold text-sm transition-all mb-7 " + (plan.highlight ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-purple-50 hover:bg-gray-100 text-gray-900 border border-gray-200")}>{plan.cta}</button>
              )}
              <ul className="space-y-2.5 mt-auto">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-500">
                    <svg className="flex-shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={plan.highlight ? "#3B82F6" : "#4B5563"} strokeWidth="2.5"><path d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center text-xs text-gray-400 mt-12">
          All prices in AUD. Cancel anytime. Free for all NDIS participants.
        </motion.p>
      </div>
    </div>
  );
}
