"use client";
import React, { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Eye, MessageSquare, Star, TrendingUp, ChevronRight,
  CheckCircle2, Circle, Lightbulb, Pencil, ExternalLink,
  Zap, User, Phone, Mail, Calendar, ArrowUpRight, Image,
  PartyPopper, X, Crown, Shield, Award,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import {
  getProviderByUserId,
  getProviderEnquiries,
  getProviderReviews,
  supabase,
} from "@/lib/supabase";
import { Globe } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProviderRecord = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EnquiryRecord = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReviewRecord = Record<string, any>;

// Item 68: Provider Ranking Indicator
function RankingIndicator({ providerId, avgRating, hasReviews }: { providerId?: string; avgRating: number; hasReviews: boolean }) {
  const [rank, setRank] = useState<{ rank: number; total: number } | null>(null);

  useEffect(() => {
    if (!hasReviews) return;
    fetch("/api/providers-public")
      .then((r) => r.json())
      .then((data: any[]) => {
        if (!Array.isArray(data)) return;
        const sorted = [...data].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        const idx = sorted.findIndex((p) => p.id === providerId);
        if (idx !== -1) setRank({ rank: idx + 1, total: sorted.length });
        else setRank({ rank: -1, total: sorted.length });
      })
      .catch(() => {});
  }, [providerId, hasReviews]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4"
    >
      <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
        <TrendingUp className="w-5 h-5 text-orange-500" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium mb-0.5">Your ranking</p>
        {!hasReviews ? (
          <p className="text-sm font-semibold text-gray-700">Get reviews to improve your ranking</p>
        ) : rank ? (
          rank.rank > 0 ? (
            <p className="text-sm font-semibold text-gray-900">
              You rank{" "}
              <span className="text-orange-500 font-black">#{rank.rank}</span>
              {" "}out of{" "}
              <span className="font-bold">{rank.total}</span> providers
            </p>
          ) : (
            <p className="text-sm font-semibold text-gray-700">Keep collecting reviews to build your ranking</p>
          )
        ) : (
          <p className="text-sm text-gray-400">Calculating...</p>
        )}
      </div>
    </motion.div>
  );
}

// Item 58: Quick-Edit Profile from Dashboard
function QuickEditProfile({ provider, onSaved }: { provider: any; onSaved: (updated: any) => void }) {
  const [editField, setEditField] = useState<"phone" | "bio" | "website" | null>(null);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedField, setSavedField] = useState<string | null>(null);

  const startEdit = (field: "phone" | "bio" | "website") => {
    setEditField(field);
    if (field === "phone") setValue(provider?.phone || "");
    if (field === "bio") setValue((provider?.bio || provider?.description || "").slice(0, 100));
    if (field === "website") setValue(provider?.website || "");
  };

  const handleSave = async () => {
    if (!provider?.id || editField === null) return;
    setSaving(true);
    try {
      const fieldKey = editField === "bio" ? "bio" : editField;
      const { data: { session } } = await supabase!.auth.getSession();
      const res = await fetch("/api/provider", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ id: provider.id, [fieldKey]: value }),
      });
      if (res.ok) {
        onSaved({ [fieldKey]: value });
        setSavedField(editField);
        setTimeout(() => setSavedField(null), 2500);
      }
    } catch {}
    setSaving(false);
    setEditField(null);
  };

  const fields: Array<{ key: "phone" | "bio" | "website"; label: string; icon: React.ReactNode; value: string; placeholder: string }> = [
    {
      key: "phone",
      label: "Phone",
      icon: <Phone className="w-4 h-4 text-blue-500" />,
      value: provider?.phone || "Not set",
      placeholder: "04xx xxx xxx",
    },
    {
      key: "bio",
      label: "Bio",
      icon: <User className="w-4 h-4 text-blue-500" />,
      value: (provider?.bio || provider?.description || "").slice(0, 100) || "Not set",
      placeholder: "Brief description of your organisation...",
    },
    {
      key: "website",
      label: "Website",
      icon: <Globe className="w-4 h-4 text-blue-500" />,
      value: provider?.website || "Not set",
      placeholder: "https://yourwebsite.com",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.18 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Quick Edit Profile</h2>
          <p className="text-xs text-gray-400 mt-0.5">Update key fields without leaving the dashboard</p>
        </div>
        <Link href="/dashboard/profile" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
          Full edit <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-3">
        {fields.map((f) => (
          <div key={f.key} className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-gray-50 border border-gray-200">
            <span className="shrink-0">{f.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 font-medium">{f.label}</p>
              {editField === f.key ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(f.key === "bio" ? e.target.value.slice(0, 100) : e.target.value)}
                    placeholder={f.placeholder}
                    autoFocus
                    className="flex-1 text-sm px-2.5 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 min-w-0"
                    onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditField(null); }}
                  />
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors shrink-0"
                  >
                    {saving ? "…" : "Save"}
                  </button>
                  <button
                    onClick={() => setEditField(null)}
                    className="px-2 py-1.5 rounded-lg bg-gray-100 text-gray-500 text-xs hover:bg-gray-200 transition-colors shrink-0"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <p className={`text-sm truncate ${f.value === "Not set" ? "text-gray-400 italic" : "text-gray-800"}`}>
                  {f.value}
                  {savedField === f.key && <span className="ml-2 text-green-600 text-xs font-semibold">✓ Saved</span>}
                </p>
              )}
            </div>
            {editField !== f.key && (
              <button
                onClick={() => startEdit(f.key)}
                className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                aria-label={`Edit ${f.label}`}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Confetti Component ─── */
const CONFETTI_COLORS = ["#f97316", "#2563eb", "#7c3aed", "#10b981", "#f59e0b", "#ef4444"];
function ConfettiCelebration({ onDone }: { onDone: () => void }) {
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    duration: 2 + Math.random() * 2,
    delay: Math.random() * 1.5,
    size: 6 + Math.random() * 8,
  }));

  useEffect(() => {
    const t = setTimeout(onDone, 5000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
        />
      ))}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl px-8 py-6 text-center pointer-events-auto"
      >
        <div className="text-4xl mb-2">🎉</div>
        <h3 className="text-xl font-black text-gray-900 mb-1">Your profile is complete!</h3>
        <p className="text-sm text-gray-500">You&apos;re ready to attract more NDIS participants.</p>
      </motion.div>
    </div>
  );
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`w-3.5 h-3.5 ${n <= rating ? "fill-orange-400 text-orange-400" : "text-gray-200"}`} />
      ))}
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

const statColors: Record<string, { bg: string; icon: string; border: string }> = {
  blue: { bg: "bg-blue-50", icon: "text-blue-500", border: "border-blue-100" },
  orange: { bg: "bg-orange-50", icon: "text-orange-500", border: "border-orange-100" },
  purple: { bg: "bg-purple-50", icon: "text-purple-500", border: "border-purple-100" },
  yellow: { bg: "bg-yellow-50", icon: "text-yellow-500", border: "border-yellow-100" },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PLAN_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
  free: { label: "Free", icon: User, color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200" },
  starter: { label: "Starter", icon: Award, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  pro: { label: "Professional", icon: Shield, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  premium: { label: "Premium", icon: Crown, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
};

function DashboardContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const [provider, setProvider] = useState<ProviderRecord | null>(null);
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiShownRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const p = await getProviderByUserId(user.id);
    setProvider(p);
    if (p?.slug) {
      const [enq, rev] = await Promise.all([
        getProviderEnquiries(p.slug),
        getProviderReviews(p.slug),
      ]);
      setEnquiries(enq);
      setReviews(rev);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) fetchData();
  }, [authLoading, fetchData]);

  useEffect(() => {
    if (searchParams.get("upgraded") === "true") {
      setShowUpgradeBanner(true);
      const t = setTimeout(() => setShowUpgradeBanner(false), 8000);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  const unreadCount = enquiries.filter((e) => !e.read).length;
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : "0";

  const stats = [
    { label: "Total Enquiries", value: String(enquiries.length), icon: MessageSquare, color: "orange" },
    { label: "Unread Enquiries", value: String(unreadCount), icon: Eye, color: "blue" },
    { label: "Total Reviews", value: String(reviews.length), icon: Star, color: "yellow" },
    { label: "Average Rating", value: avgRating, icon: TrendingUp, color: "purple" },
    { label: "Profile Views", value: null, icon: Eye, color: "blue", comingSoon: true },
  ];

  const profileChecks = provider
    ? [
        { label: "Business name added", done: !!provider.name },
        { label: "Description added", done: !!provider.description },
        { label: "Logo uploaded", done: !!provider.logo_url },
        { label: "Cover image uploaded", done: !!provider.cover_image_url },
        { label: "Phone number added", done: !!provider.phone },
        { label: "Services listed", done: Array.isArray(provider.services) && provider.services.length > 0 },
        { label: "Location set", done: !!provider.suburb || !!provider.location },
        { label: "Website added", done: !!provider.website },
      ]
    : [];

  const profileCompletion = profileChecks.length
    ? Math.round((profileChecks.filter((c) => c.done).length / profileChecks.length) * 100)
    : 0;

  // Show confetti once when profile reaches 100%
  useEffect(() => {
    if (profileCompletion === 100 && !loading && !confettiShownRef.current) {
      const key = "referaus_confetti_shown";
      if (typeof window !== "undefined" && !localStorage.getItem(key)) {
        confettiShownRef.current = true;
        localStorage.setItem(key, "1");
        setShowConfetti(true);
      }
    }
  }, [profileCompletion, loading]);

  const recentEnquiries = enquiries.slice(0, 5);
  const recentReviews = reviews.slice(0, 3);

  const tips = [
    { icon: Image, title: "Add more photos", desc: "Listings with 3+ photos get 2x more enquiries.", action: "Add photos", href: "/dashboard/images" },
    { icon: MessageSquare, title: "Reply faster", desc: "Responding within 1 hour increases booking rate by 40%.", action: "View enquiries", href: "/dashboard/enquiries" },
    { icon: Star, title: "Ask for reviews", desc: "Send a review request to your recent clients to build trust.", action: "Get reviews", href: "/dashboard/reviews" },
    { icon: Pencil, title: "Complete your profile", desc: `You are at ${profileCompletion}%. Full profiles rank higher in search.`, action: "Edit profile", href: "/dashboard/profile" },
  ];

  const currentPlan = provider?.plan || "free";
  const planConfig = PLAN_CONFIG[currentPlan] || PLAN_CONFIG.free;
  const PlanIcon = planConfig.icon;
  const isPaid = currentPlan !== "free";

  if (authLoading || loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-9 w-72 mb-1" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="space-y-8">
        <motion.div {...fadeUp(0)} className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 mb-2" style={{ fontFamily: "'Oswald'" }}>
            Complete Your Provider Profile
          </h1>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Set up your provider profile to start receiving enquiries and appearing in search results on ReferAus.
          </p>
          <Link href="/dashboard/profile" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all shadow-sm">
            <Pencil className="w-4 h-4" /> Set Up Profile
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Confetti Celebration */}
      <AnimatePresence>
        {showConfetti && <ConfettiCelebration onDone={() => setShowConfetti(false)} />}
      </AnimatePresence>

      {/* Pending Approval Banner */}
      {provider && !provider.verified && (
        <motion.div {...fadeUp(0)} className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="font-bold text-amber-800">Profile pending approval</p>
            <p className="text-amber-700 text-sm mt-0.5">
              Your listing is being reviewed by our team. This usually takes less than 24 hours.
              In the meantime, you can complete your profile so it&apos;s ready to go live.
            </p>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showUpgradeBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            className="relative bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <PartyPopper className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-base">You&apos;re upgraded! Welcome to {planConfig.label}.</p>
              <p className="text-green-100 text-sm mt-0.5">Your new plan features are now active. Thanks for supporting ReferAus.</p>
            </div>
            <button onClick={() => setShowUpgradeBanner(false)} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Provider Dashboard</p>
          <h1 className="text-3xl font-black tracking-tight text-gray-900" style={{ fontFamily: "'Oswald'" }}>
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
              {provider.name}
            </span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here&apos;s what&apos;s happening with your listing.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold ${planConfig.bg} ${planConfig.border} ${planConfig.color}`}>
            <PlanIcon className="w-4 h-4" />
            {planConfig.label} Plan
          </div>
          <Link href={`/providers/${provider.slug}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm">
            <ExternalLink className="w-4 h-4" /> View Listing
          </Link>
          {/* Item 63: Preview Profile button */}
          <a
            href={`/providers/${provider.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Preview your public profile"
            className="group relative inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
            aria-label="Preview your public profile"
          >
            <Eye className="w-4 h-4" />
            <span>Preview Profile</span>
          </a>
          <Link href="/dashboard/profile" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-sm">
            <Pencil className="w-4 h-4" /> Edit Profile
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s, i) => {
          const colors = statColors[s.color];
          const Icon = s.icon;
          const isComingSoon = (s as any).comingSoon;
          return (
            <motion.div key={s.label} {...fadeUp(0.05 + i * 0.06)} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs text-gray-500 font-medium leading-tight">{s.label}</p>
                <span className={`p-1.5 rounded-lg ${colors.bg} ${colors.border} border`}>
                  <Icon className={`w-3.5 h-3.5 ${colors.icon}`} />
                </span>
              </div>
              {isComingSoon ? (
                <div>
                  <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">Coming soon</span>
                  <p className="text-[10px] text-gray-400 mt-1.5">Tracking being set up</p>
                </div>
              ) : (
                <span className="text-3xl font-black text-gray-900">{s.value}</span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Item 68: Provider Ranking Indicator */}
      <RankingIndicator providerId={provider.id} avgRating={Number(avgRating)} hasReviews={reviews.length > 0} />

      {/* Item 58: Quick-Edit Profile */}
      <QuickEditProfile provider={provider} onSaved={(updated) => setProvider((p) => ({ ...p, ...updated }))} />

      {/* Onboarding Checklist (Item 61) */}
      {(() => {
        const onboardingItems = [
          { label: "Create account", done: true, alwaysDone: true },
          { label: "Verify email", done: !!(user && ((user as any).email_confirmed_at || (user as any).confirmed_at)) },
          { label: "Complete profile", done: !!(provider?.description && provider?.phone) },
          { label: "Add services", done: !!(Array.isArray(provider?.services) && provider?.services.length > 0) },
          { label: "Add contact details", done: !!(provider?.phone || provider?.email) },
          { label: "Get first enquiry", done: enquiries.length > 0 },
        ];
        const doneCount = onboardingItems.filter((i) => i.done).length;
        const total = onboardingItems.length;
        const allDone = doneCount === total;
        return (
          <motion.div {...fadeUp(0.17)} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Getting Started</h2>
                <p className="text-xs text-gray-400 mt-0.5">{doneCount}/{total} complete</p>
              </div>
              <div className="text-right">
                <span className={`text-sm font-black ${allDone ? "text-green-600" : "text-blue-600"}`}>{Math.round((doneCount / total) * 100)}%</span>
              </div>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-green-500"
                initial={{ width: 0 }}
                animate={{ width: `${(doneCount / total) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {onboardingItems.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  {item.done ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  )}
                  <span className={`text-xs ${item.done ? "text-gray-700 font-medium" : "text-gray-400"}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.section {...fadeUp(0.2)} className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900">Recent Enquiries</h2>
              <p className="text-xs text-gray-400 mt-0.5">{unreadCount} unread requiring action</p>
            </div>
            <Link href="/dashboard/enquiries" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recentEnquiries.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">No enquiries yet</p>
              <p className="text-xs text-gray-400 mt-1">Enquiries from participants will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Participant</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Service</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Date</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentEnquiries.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {(e.name || "?").charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{e.name}</p>
                            <p className="text-xs text-gray-400">{e.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">{e.service || "General"}</span>
                      </td>
                      <td className="px-3 py-4 hidden md:table-cell">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {e.created_at ? new Date(e.created_at).toLocaleDateString() : ""}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        {e.read ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />Read
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />New
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex gap-2">
                          {e.phone && (
                            <a href={`tel:${e.phone}`} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" aria-label={`Call ${e.name}`}>
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <a href={`mailto:${e.email}`} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" aria-label={`Email ${e.name}`}>
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.section>

        <div className="space-y-5">
          <motion.div {...fadeUp(0.22)} className={`rounded-2xl border shadow-sm p-5 ${planConfig.bg} ${planConfig.border}`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900">Current Plan</h2>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${planConfig.color} bg-white/70`}>
                <PlanIcon className="w-3.5 h-3.5" />
                {planConfig.label}
              </div>
            </div>
            {isPaid ? (
              <div className="space-y-1.5 mb-3">
                <p className="text-sm text-gray-600">Active subscription — thank you!</p>
                <Link href="/pricing" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  Manage plan <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <div className="space-y-1 mb-4">
                <p className="text-sm text-gray-600">You are on the free plan.</p>
                <p className="text-xs text-gray-400">Upgrade to get verified badge, priority ranking, and direct bookings.</p>
              </div>
            )}
            {!isPaid && (
              <Link href="/pricing" className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold text-center flex items-center justify-center gap-2 transition-all">
                <Zap className="w-3.5 h-3.5" /> Upgrade Now
              </Link>
            )}
          </motion.div>

          <motion.div {...fadeUp(0.25)} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900">Profile Strength</h2>
              <span className={`text-sm font-black ${profileCompletion >= 80 ? "text-green-600" : profileCompletion >= 50 ? "text-orange-500" : "text-red-500"}`}>
                {profileCompletion}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-orange-500"
                initial={{ width: 0 }}
                animate={{ width: `${profileCompletion}%` }}
                transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              />
            </div>
            <div className="space-y-2">
              {profileChecks.map((check) => (
                <div key={check.label} className="flex items-center gap-2.5">
                  {check.done ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  )}
                  <span className={`text-xs ${check.done ? "text-gray-600" : "text-gray-400"}`}>{check.label}</span>
                </div>
              ))}
            </div>
            <Link href="/dashboard/profile" className="mt-4 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold text-center flex items-center justify-center gap-2 transition-all">
              <Pencil className="w-3.5 h-3.5" /> Complete Profile
            </Link>
          </motion.div>

          <motion.div {...fadeUp(0.3)} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-base font-bold text-gray-900 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/dashboard/profile" className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700 border border-gray-200 transition-all group">
                <span className="flex items-center gap-2"><Pencil className="w-4 h-4 text-blue-500" /> Edit Profile</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </Link>
              <Link href={`/providers/${provider.slug}`} className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700 border border-gray-200 transition-all group">
                <span className="flex items-center gap-2"><ExternalLink className="w-4 h-4 text-blue-500" /> View Public Listing</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </Link>
              <Link href="/dashboard/images" className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700 border border-gray-200 transition-all group">
                <span className="flex items-center gap-2"><Image className="w-4 h-4 text-blue-500" /> Manage Images</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </Link>
              {!isPaid && (
                <Link href="/pricing" className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-sm font-medium text-orange-700 border border-orange-200 transition-all group">
                  <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-orange-500" /> Upgrade Plan</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-orange-400 group-hover:text-orange-600 transition-colors" />
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <motion.section {...fadeUp(0.35)} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Recent Reviews</h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-0.5">
                <Stars rating={Math.round(Number(avgRating))} />
                <span className="text-xs text-gray-500">{avgRating} avg from {reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
              </div>
            )}
          </div>
          <Link href="/dashboard/reviews" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {recentReviews.length === 0 ? (
          <div className="p-8 text-center">
            <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">No reviews yet</p>
            <p className="text-xs text-gray-400 mt-1">Reviews from participants will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {recentReviews.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.07 }} className="p-5 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{r.author || r.reviewer_name || "Anonymous"}</p>
                      <p className="text-xs text-gray-400">{r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}</p>
                    </div>
                  </div>
                  <Stars rating={r.rating || 0} />
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">&ldquo;{r.text || r.comment || r.review || ""}&rdquo;</p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      {/* Item 67: Activity Feed */}
      <motion.section {...fadeUp(0.38)} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Recent Activity</h2>
          <p className="text-xs text-gray-400 mt-0.5">Your last 5 activities</p>
        </div>
        {enquiries.length === 0 && reviews.length === 0 ? (
          <div className="p-8 text-center">
            <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">No activity yet</p>
            <p className="text-xs text-gray-400 mt-1">Activity will appear as enquiries and reviews come in.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {[
              ...enquiries.map((e) => ({
                type: "enquiry" as const,
                title: `New enquiry from ${e.name || "Someone"}`,
                desc: e.service ? `Service: ${e.service}` : "General enquiry",
                date: e.created_at,
                icon: "enquiry",
              })),
              ...reviews.map((r) => ({
                type: "review" as const,
                title: `New review from ${r.author || r.reviewer_name || "Anonymous"}`,
                desc: `Rating: ${r.rating}/5 — "${(r.text || r.comment || "").slice(0, 60)}${(r.text || r.comment || "").length > 60 ? "…" : ""}"`,
                date: r.created_at,
                icon: "review",
              })),
            ]
              .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
              .slice(0, 5)
              .map((activity, i) => {
                const now = Date.now();
                const then = activity.date ? new Date(activity.date).getTime() : 0;
                const diff = now - then;
                const mins = Math.floor(diff / 60000);
                const hours = Math.floor(diff / 3600000);
                const days = Math.floor(diff / 86400000);
                const relTime = days > 0 ? `${days}d ago` : hours > 0 ? `${hours}h ago` : mins > 0 ? `${mins}m ago` : "Just now";
                return (
                  <div key={i} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.type === "enquiry" ? "bg-orange-50" : "bg-yellow-50"
                    }`}>
                      {activity.type === "enquiry" ? (
                        <MessageSquare className="w-4 h-4 text-orange-500" />
                      ) : (
                        <Star className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{activity.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{activity.desc}</p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{relTime}</span>
                  </div>
                );
              })}
          </div>
        )}
      </motion.section>

      <motion.section {...fadeUp(0.4)}>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-4 h-4 text-orange-500" />
          <h2 className="text-base font-bold text-gray-900">Tips to Improve Your Listing</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tips.map((tip, i) => {
            const TipIcon = tip.icon;
            return (
              <motion.div key={tip.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 + i * 0.06 }} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mb-2">
                  <TipIcon className="w-4 h-4 text-blue-500" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">{tip.title}</h3>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">{tip.desc}</p>
                <Link href={tip.href} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  {tip.action} <ArrowUpRight className="w-3 h-3" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {!isPaid && (
        <motion.div {...fadeUp(0.5)} className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 sm:p-8 text-white shadow-lg">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-blue-200" />
                <span className="text-xs font-semibold text-blue-200 uppercase tracking-wide">Grow your organisation</span>
              </div>
              <h3 className="text-xl font-black" style={{ fontFamily: "'Oswald'" }}>Unlock Professional Features</h3>
              <p className="text-blue-200 text-sm mt-1">Get verified badge, priority ranking, direct booking, and analytics.</p>
            </div>
            <Link href="/pricing" className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-all text-sm shadow-sm">
              <Zap className="w-4 h-4" /> View Plans
            </Link>
          </div>
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
          <div className="absolute -right-4 -bottom-10 w-28 h-28 bg-white/5 rounded-full pointer-events-none" />
        </motion.div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
