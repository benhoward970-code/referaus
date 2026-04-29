"use client";
import { use, useState, useEffect, useRef } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { providers } from "@/lib/providers";
import type { Provider } from "@/lib/providers";
import { EnquiryModal } from "@/components/EnquiryModal";
import { CallbackModal } from "@/components/CallbackModal";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShareButtons } from "@/components/ShareButtons";
import { RecentlyViewed, saveRecentlyViewed } from "@/components/RecentlyViewed";
import { showToast } from "@/components/Toast";
import { getProviderBySlug, getProviderReviews, submitEnquiry } from "@/lib/supabase";
import { fetchWithSWR } from "@/lib/swr-cache";
import { mapDbProvider } from "@/lib/map-provider";
import { useAuth } from "@/components/AuthProvider";
import { ProviderCard } from "@/components/ProviderCard";
import { GalleryLightbox } from "@/components/GalleryLightbox";
import { TrustScore } from "@/components/TrustScore";

const mockReviews: ReviewData[] = [];

// Item 28: Provider FAQ accordion
const PROVIDER_FAQS = [
  {
    q: "What NDIS plan types do you accept?",
    a: "Contact this provider to discuss your plan type.",
  },
  {
    q: "Do you offer home visits?",
    a: "Contact this provider to ask about service delivery options.",
  },
  {
    q: "What are your fees?",
    a: "NDIS pricing is regulated. Contact this provider for a quote based on your plan.",
  },
  {
    q: "How do I book?",
    a: "Send an enquiry through ReferAus and the provider will get back to you.",
  },
];

function ProviderFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {PROVIDER_FAQS.map((faq, i) => (
        <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-expanded={openIndex === i}
          >
            <span>{faq.q}</span>
            <svg
              width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              className={`shrink-0 ml-3 transition-transform duration-200 ${openIndex === i ? "rotate-180" : ""}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {openIndex === i && (
            <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function RatingDistribution({ reviews }: { reviews: ReviewData[] }) {
  if (reviews.length === 0) return null;
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  const max = Math.max(...counts.map((c) => c.count), 1);
  return (
    <div className="space-y-1.5">
      {counts.map(({ star, count }) => (
        <div key={star} className="flex items-center gap-2 text-xs">
          <span className="w-6 text-right text-gray-500 shrink-0">{star}</span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="#F97316" className="shrink-0">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-400 rounded-full transition-all duration-500"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <span className="w-4 text-gray-400 shrink-0 text-right">{count}</span>
        </div>
      ))}
    </div>
  );
}

interface ReviewData {
  id?: string;
  author?: string;
  name?: string;
  date?: string;
  created_at?: string;
  rating: number;
  text?: string;
  content?: string;
  providerReply?: string;
  // Item 85: verified review flag (true when reviewer sent an enquiry to this provider)
  isVerifiedReview?: boolean;
}

// Item 85: Verified Review Badge — infrastructure ready, badge shown only when isVerifiedReview === true
function VerifiedReviewBadge() {
  const [showTip, setShowTip] = useState(false);
  return (
    <span className="relative inline-flex items-center gap-1">
      <button
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
        onFocus={() => setShowTip(true)}
        onBlur={() => setShowTip(false)}
        className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
        aria-label="Verified review — this reviewer used ReferAus to connect with this provider"
        tabIndex={0}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
        Verified Review
      </button>
      {showTip && (
        <span className="absolute bottom-full left-0 mb-2 z-10 w-56 px-3 py-2 bg-gray-900 text-white text-xs rounded-xl shadow-lg pointer-events-none">
          This reviewer has used ReferAus to connect with this provider.
        </span>
      )}
    </span>
  );
}

// Review helpfulness voting (localStorage)
function getHelpfulVotes(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("review-helpful-votes") || "{}"); } catch { return {}; }
}
function setHelpfulVote(reviewId: string, delta: number) {
  const votes = getHelpfulVotes();
  votes[reviewId] = (votes[reviewId] || 0) + delta;
  localStorage.setItem("review-helpful-votes", JSON.stringify(votes));
}
function getMyVotes(): Record<string, "up" | "down"> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("review-my-votes") || "{}"); } catch { return {}; }
}
function setMyVote(reviewId: string, vote: "up" | "down") {
  const votes = getMyVotes();
  votes[reviewId] = vote;
  localStorage.setItem("review-my-votes", JSON.stringify(votes));
}

// Review replies (localStorage, keyed by reviewId)
function getReviewReplies(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("review-replies") || "{}"); } catch { return {}; }
}
function saveReviewReply(reviewId: string, reply: string) {
  const replies = getReviewReplies();
  replies[reviewId] = reply;
  localStorage.setItem("review-replies", JSON.stringify(replies));
}

function ReviewItem({
  review,
  reviewId,
  isOwner,
}: {
  review: ReviewData;
  reviewId: string;
  isOwner: boolean;
  isVerified?: boolean;
}) {
  const [helpfulCount, setHelpfulCount] = useState(0);
  const [myVote, setMyVoteState] = useState<"up" | "down" | null>(null);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [savedReply, setSavedReply] = useState<string | null>(null);
  const [replySubmitting, setReplySubmitting] = useState(false);

  useEffect(() => {
    const votes = getHelpfulVotes();
    setHelpfulCount(votes[reviewId] || 0);
    const myVotes = getMyVotes();
    setMyVoteState(myVotes[reviewId] || null);
    // Load saved reply
    const replies = getReviewReplies();
    if (review.providerReply) {
      setSavedReply(review.providerReply);
    } else if (replies[reviewId]) {
      setSavedReply(replies[reviewId]);
    }
  }, [reviewId, review.providerReply]);

  const handleVote = (vote: "up" | "down") => {
    if (myVote) return; // already voted
    const delta = vote === "up" ? 1 : -1;
    setHelpfulVote(reviewId, delta);
    setMyVote(reviewId, vote);
    setHelpfulCount(prev => prev + delta);
    setMyVoteState(vote);
  };

  const handleReplySubmit = () => {
    if (!replyText.trim()) return;
    setReplySubmitting(true);
    saveReviewReply(reviewId, replyText.trim());
    setSavedReply(replyText.trim());
    setReplyText("");
    setShowReplyInput(false);
    setReplySubmitting(false);
    showToast("Reply saved!", "success");
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-1 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
            {(review.author || "A")[0]}
          </div>
          <span className="text-sm font-semibold text-gray-800">{review.author}</span>
          <div className="flex gap-0.5">
            {[...Array(review.rating)].map((_, j) => (
              <svg key={j} width="12" height="12" viewBox="0 0 24 24" fill="#F97316"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            ))}
          </div>
          {/* Item 85: Show verified badge only when review.isVerifiedReview is true */}
          {review.isVerifiedReview && <VerifiedReviewBadge />}
        </div>
        <span className="text-xs text-gray-400">{review.date}</span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed ml-10">{review.text}</p>

      {/* Provider Reply */}
      {savedReply && (
        <div className="ml-10 mt-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
          <p className="text-xs font-semibold text-blue-700 mb-1">Provider response:</p>
          <p className="text-sm text-gray-700 leading-relaxed">{savedReply}</p>
        </div>
      )}

      {/* Owner: Reply button */}
      {isOwner && !savedReply && (
        <div className="ml-10 mt-2">
          {showReplyInput ? (
            <div className="flex flex-col gap-2">
              <textarea
                rows={2}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Write a reply to this review..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-blue-400 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReplySubmit}
                  disabled={replySubmitting || !replyText.trim()}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 disabled:opacity-50 transition-colors"
                >
                  {replySubmitting ? "Saving..." : "Post Reply"}
                </button>
                <button
                  onClick={() => setShowReplyInput(false)}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowReplyInput(true)}
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
              Reply
            </button>
          )}
        </div>
      )}

      {/* Helpfulness voting */}
      <div className="ml-10 mt-3 flex items-center gap-3">
        <span className="text-xs text-gray-400">Was this helpful?</span>
        <button
          onClick={() => handleVote("up")}
          disabled={!!myVote}
          className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-colors ${
            myVote === "up"
              ? "border-green-300 bg-green-50 text-green-600"
              : "border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600 disabled:opacity-50"
          }`}
          aria-label="Helpful"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/>
            <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
          </svg>
          {myVote === "up" ? "Helpful" : "Yes"}
        </button>
        <button
          onClick={() => handleVote("down")}
          disabled={!!myVote}
          className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-colors ${
            myVote === "down"
              ? "border-red-200 bg-red-50 text-red-500"
              : "border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500 disabled:opacity-50"
          }`}
          aria-label="Not helpful"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z"/>
            <path d="M17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/>
          </svg>
          No
        </button>
        {helpfulCount > 0 && (
          <span className="text-xs text-gray-400">{helpfulCount} {helpfulCount === 1 ? "person" : "people"} found this helpful</span>
        )}
      </div>
    </div>
  );
}

function formatReviewDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return "Today";
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
  if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? "s" : ""} ago`;
  return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? "s" : ""} ago`;
}

export default function ProviderDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user } = useAuth();
  const hardcodedProvider = providers.find((p) => p.slug === slug);

  const [provider, setProvider] = useState<Provider | null>(hardcodedProvider || null);
  const [reviews, setReviews] = useState<ReviewData[]>(mockReviews);
  const [isLoading, setIsLoading] = useState(true);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [similarProviders, setSimilarProviders] = useState<Provider[]>([]);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Incorrect info");
  const [reportText, setReportText] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    // Item 94: SWR cache for provider detail — show cached data immediately
    fetchWithSWR<{ provider: Provider | null; reviews: ReviewData[] }>(
      `provider-detail:${slug}`,
      async () => {
        const [dbRow, dbReviews] = await Promise.all([
          getProviderBySlug(slug),
          getProviderReviews(slug),
        ]);
        return {
          provider: dbRow ? mapDbProvider(dbRow) : null,
          reviews: dbReviews.length > 0
            ? dbReviews.map((r: Record<string, unknown>) => ({
                id: r.id as string | undefined,
                author: (r.author as string) || (r.name as string) || "Anonymous",
                date: formatReviewDate(r.created_at as string),
                rating: (r.rating as number) ?? 5,
                text: (r.text as string) || (r.content as string) || "",
              }))
            : [],
        };
      },
      (fresh) => {
        if (!cancelled) {
          if (fresh.provider) setProvider(fresh.provider);
          if (fresh.reviews.length > 0) setReviews(fresh.reviews);
          setIsLoading(false);
        }
      },
    ).then((cached) => {
      if (!cancelled && cached) {
        if (cached.provider) setProvider(cached.provider);
        if (cached.reviews.length > 0) setReviews(cached.reviews);
        setIsLoading(false);
      } else if (!cancelled && !cached) {
        // no cache — loading state until background fetch completes
      }
    }).catch((err) => {
      console.error("[provider-detail] SWR fetch failed:", err);
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [slug]);

  // Fetch similar providers
  useEffect(() => {
    if (!provider) return;
    let cancelled = false;
    fetch("/api/providers-public")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !Array.isArray(data)) return;
        const similar = data
          .filter((p: Provider) => p.category === provider.category && p.slug !== provider.slug)
          .slice(0, 3);
        setSimilarProviders(similar.map((p: Record<string, unknown>) => ({
          slug: p.slug as string,
          name: p.name as string,
          category: p.category as string,
          location: (p.location as string) || "",
          state: (p.state as string) || "NSW",
          description: (p.description as string) || "",
          rating: (p.rating as number) || 0,
          reviewCount: (p.review_count as number) || (p.reviewCount as number) || 0,
          services: (p.services as string[]) || [],
          verified: (p.verified as boolean) || false,
          logo_url: (p.logo_url as string) || undefined,
          registrationReady: (p.registration_ready as boolean) || false,
          bio: (p.bio as string) || undefined,
        } as Provider)));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [provider]);

  // Save to recently viewed when provider loads
  useEffect(() => {
    if (provider) {
      saveRecentlyViewed({ slug: provider.slug, name: provider.name, category: provider.category });
    }
  }, [provider]);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        setShowStickyBar(heroRef.current.getBoundingClientRect().bottom < 0);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const jsonLd = provider ? {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: provider.name,
    description: provider.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: provider.location,
      addressRegion: "NSW",
      addressCountry: "AU",
    },
    ...(provider.phone ? { telephone: provider.phone } : {}),
    ...(provider.email ? { email: provider.email } : {}),
    url: `https://referaus.com/providers/${provider.slug}`,
    ...(provider.website ? { sameAs: provider.website } : {}),
    ...(provider.category ? { knowsAbout: provider.category } : {}),
    areaServed: "Newcastle, Hunter Region, NSW, Australia",
    ...(provider.rating && provider.reviewCount && provider.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: provider.rating,
            reviewCount: provider.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(reviews.length > 0
      ? {
          review: reviews.map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.author || "Anonymous" },
            reviewRating: {
              "@type": "Rating",
              ratingValue: r.rating,
              bestRating: 5,
              worstRating: 1,
            },
            reviewBody: r.text || r.content || "",
            datePublished: r.date || new Date().toISOString().split("T")[0],
          })),
        }
      : {}),
  } : null;

  if (!provider && !isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Provider not found</h1>
        <Link href="/providers" className="text-blue-600 hover:text-blue-700">Back to directory</Link>
      </div>
    </div>
  );

  if (!provider) return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-48 mb-8" />
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="w-24 h-24 rounded-2xl bg-gray-200" />
          <div className="flex-1 space-y-3">
            <div className="h-8 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
            <div className="h-16 bg-gray-100 rounded w-full" />
          </div>
        </div>
      </div>
    </div>
  );

  // Use brand_color as accent if available
  const accent = provider.brand_color || "#2563eb";
  const accentLight = provider.brand_color ? `${provider.brand_color}20` : "rgba(37,99,235,0.12)";

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);
    const result = await submitEnquiry({
      provider_slug: provider!.slug,
      provider_name: provider!.name,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      service: "General Enquiry",
      message: formData.message,
    });
    setFormLoading(false);
    if (result.success) {
      setFormSubmitted(true);
      showToast("Message sent successfully!", "success");
    } else {
      setFormError("Something went wrong. Please try again or use the enquiry form.");
      showToast("Failed to send message. Please try again.", "error");
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportLoading(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "report",
          provider_slug: provider!.slug,
          provider_name: provider!.name,
          reason: reportReason,
          message: reportText,
        }),
      });
      setReportSubmitted(true);
      showToast("Report submitted. Thank you.", "success");
      setTimeout(() => { setReportOpen(false); setReportSubmitted(false); setReportText(""); setReportReason("Incorrect info"); }, 2000);
    } catch {
      showToast("Failed to submit report. Please try again.", "error");
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-28 md:pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}

        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Providers", href: "/providers" },
            { label: provider.name, href: `/providers/${provider.slug}` },
          ]}
          className="mb-6"
        />

        {/* Cover Banner (Item 16) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: prefersReduced ? 0 : 0.5 }}
          className="relative w-full h-[150px] sm:h-[200px] rounded-2xl overflow-hidden mb-8"
        >
          {provider.cover_image_url ? (
            <Image
              src={provider.cover_image_url}
              alt={`${provider.name} cover`}
              fill
              className="object-cover"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACCAYAAAB/qH1jAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAF0lEQVR4nGNkYGD4z8BQDwAAAf8A/ob0qgAAAABJRU5ErkJggg=="
            />
          ) : (
            <div
              className="w-full h-full"
              style={{ background: "linear-gradient(135deg, #2563eb 0%, #1e40af 40%, #f97316 100%)" }}
            />
          )}
          {/* Provider avatar overlaid on banner */}
          <div className="absolute bottom-0 left-8 translate-y-1/2">
            <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white">
              {provider.logo_url ? (
                <Image
                  src={provider.logo_url}
                  alt={`${provider.name} logo`}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACCAYAAAB/qH1jAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAF0lEQVR4nGNkYGD4z8BQDwAAAf8A/ob0qgAAAABJRU5ErkJggg=="
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${accentLight}, rgba(249,115,22,0.15))` }}
                >
                  <span className="text-3xl font-black" style={{ color: accent }}>{provider.name[0]}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Hero — mt-12 to clear the avatar overlapping the banner */}
        <motion.div ref={heroRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: prefersReduced ? 0 : 0.5 }} className="mt-12 mb-12">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900">{provider.name}</h1>
              {provider.verified && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                  Verified Provider
                </span>
              )}
              {!provider.verified && (
                <Link href="/register" className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 transition-colors">
                  Claim this listing
                </Link>
              )}
            </div>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="text-sm text-orange-500 font-medium">{provider.category}</span>
              <span className="hidden sm:inline text-gray-300">|</span>
              <span className="text-sm text-gray-500">{provider.location}, {provider.state || "NSW"}</span>
              <span className="hidden sm:inline text-gray-300">|</span>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((star) => (
                  <svg key={star} width="14" height="14" viewBox="0 0 24 24" fill={star <= Math.round(provider.rating) ? "#F97316" : "#e5e7eb"}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
                <span className="text-sm font-semibold text-orange-500 ml-1">{provider.rating}</span>
                <span className="text-xs text-gray-400">({provider.reviewCount} reviews)</span>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6">{provider.bio || provider.description}</p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setEnquiryOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-xl text-white font-semibold text-sm transition-all hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
                style={{ backgroundColor: accent === "#2563eb" ? "#f97316" : accent, boxShadow: `0 10px 25px -5px ${accent === "#2563eb" ? "rgba(249,115,22,0.25)" : accent + "40"}` }}
                aria-label={`Send enquiry to ${provider.name}`}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                Request a Quote
              </button>
              <button
                onClick={() => setCallbackOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl font-semibold text-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 bg-white border border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600"
                aria-label={`Request a callback from ${provider.name}`}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Request Callback
              </button>
            </div>
            {/* Share buttons */}
            <ShareButtons
              url={`https://referaus.com/providers/${provider.slug}`}
              title={`${provider.name} – NDIS Provider in ${provider.location}`}
              className="mt-4"
            />
            {/* Report this listing */}
            <div className="mt-3">
              <button
                onClick={() => setReportOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" y1="22" x2="4" y2="15" />
                </svg>
                Report this listing
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Services */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: prefersReduced ? 0 : 0.1, duration: prefersReduced ? 0 : 0.5 }} className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold mb-6 text-gray-900">Services Offered</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {provider.services.map((s) => (
                  <div key={s} className="flex items-center gap-3 py-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: accent }} />
                    <span className="text-sm text-gray-600">{s}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Operating Hours (Item 29) */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: prefersReduced ? 0 : 0.11, duration: prefersReduced ? 0 : 0.5 }} className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold mb-5 text-gray-900">Operating Hours</h2>
              <div className="space-y-2">
                {[
                  { day: "Monday", hours: "9:00 AM – 5:00 PM", open: true },
                  { day: "Tuesday", hours: "9:00 AM – 5:00 PM", open: true },
                  { day: "Wednesday", hours: "9:00 AM – 5:00 PM", open: true },
                  { day: "Thursday", hours: "9:00 AM – 5:00 PM", open: true },
                  { day: "Friday", hours: "9:00 AM – 5:00 PM", open: true },
                  { day: "Saturday", hours: "Closed", open: false },
                  { day: "Sunday", hours: "Closed", open: false },
                ].map(({ day, hours, open }) => (
                  <div key={day} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-sm font-medium text-gray-700 w-28">{day}</span>
                    <span className={`text-sm ${open ? "text-gray-600" : "text-gray-400"}`}>{hours}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4">Contact provider to confirm hours.</p>
            </motion.div>

            {/* Gallery */}
            {provider.gallery_urls && provider.gallery_urls.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: prefersReduced ? 0 : 0.12, duration: prefersReduced ? 0 : 0.5 }} className="bg-white rounded-2xl border border-gray-200 p-8">
                <h2 className="text-xl font-bold mb-6 text-gray-900">Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {provider.gallery_urls.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                      <Image src={url} alt={`${provider.name} gallery ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-300" placeholder="blur" blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACCAYAAAB/qH1jAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAF0lEQVR4nGNkYGD4z8BQDwAAAf8A/ob0qgAAAABJRU5ErkJggg==" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Map */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: prefersReduced ? 0 : 0.15, duration: prefersReduced ? 0 : 0.5 }} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-8 pt-8 pb-4">
                <h2 className="text-xl font-bold text-gray-900">Location</h2>
                <p className="text-sm text-gray-500 mt-1">{provider.location}, {provider.state || "NSW"}, Australia</p>
              </div>
              <div className="relative bg-gray-100 h-56 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-30" style={{backgroundImage: "linear-gradient(#c8d6e5 1px, transparent 1px), linear-gradient(90deg, #c8d6e5 1px, transparent 1px)", backgroundSize: "40px 40px"}} />
                <div className="relative flex flex-col items-center gap-2 text-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: accent }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 bg-white px-3 py-1 rounded-full shadow">{provider.location}</span>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(provider.name + " " + provider.location + " " + (provider.state || "NSW"))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs hover:underline"
                    style={{ color: accent }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: prefersReduced ? 0 : 0.2, duration: prefersReduced ? 0 : 0.5 }} className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold mb-2 text-gray-900">Send a Message</h2>
              <p className="text-sm text-gray-500 mb-6">Get in touch with {provider.name} directly.</p>
              {formSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#16a34a"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                  </div>
                  <p className="font-semibold text-gray-800">Message sent!</p>
                  <p className="text-sm text-gray-500 mt-1">{provider.name} will be in touch soon.</p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus:border-blue-500 transition-colors"
                        placeholder="Jane Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus:border-blue-500 transition-colors"
                        placeholder="jane@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone (optional)</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus:border-blue-500 transition-colors"
                      placeholder="04xx xxx xxx"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Message</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                      placeholder="Hi, I am interested in learning more about your services..."
                    />
                  </div>
                  {formError && (
                    <p className="text-sm text-red-500">{formError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:shadow-lg disabled:opacity-60"
                    style={{ backgroundColor: accent, boxShadow: `0 10px 25px -5px ${accent}40` }}
                  >
                    {formLoading ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </motion.div>

            {/* FAQ Section (Item 28) */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: prefersReduced ? 0 : 0.22, duration: prefersReduced ? 0 : 0.5 }} className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold mb-1 text-gray-900">Frequently Asked Questions</h2>
              <p className="text-xs text-gray-400 mb-6">Common questions about NDIS providers</p>
              <ProviderFAQ />
            </motion.div>

            {/* Reviews */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: prefersReduced ? 0 : 0.25, duration: prefersReduced ? 0 : 0.5 }} className="bg-white rounded-2xl border border-gray-200 p-8">
              <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
                <div className="flex items-start gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-orange-500">{provider.rating}</span>
                    <div>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((star) => (
                          <svg key={star} width="12" height="12" viewBox="0 0 24 24" fill={star <= Math.round(provider.rating) ? "#F97316" : "#e5e7eb"}>
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400">{provider.reviewCount} reviews</p>
                    </div>
                  </div>
                  {reviews.length > 0 && (
                    <div className="w-36">
                      <RatingDistribution reviews={reviews} />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-6">
                {reviews.map((r, i) => {
                  const reviewId = r.id || `${slug}-review-${i}`;
                  // isOwner: user is logged in and provider email matches or user_id matches
                  const isOwner = !!(user && provider && (
                    user.email === provider.email ||
                    (provider as any).user_id === user.id
                  ));
                  return (
                    <div key={reviewId} className={i > 0 ? "pt-6 border-t border-gray-100" : ""}>
                      <ReviewItem review={r} reviewId={reviewId} isOwner={isOwner} />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: prefersReduced ? 0 : 0.1, duration: prefersReduced ? 0 : 0.5 }} className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4 text-gray-900">Get in Touch</h3>
              <button
                onClick={() => setEnquiryOpen(true)}
                className="w-full min-h-[44px] py-3 rounded-xl text-white font-semibold text-sm transition-all hover:shadow-lg mb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-400"
                style={{ backgroundColor: accent, boxShadow: `0 10px 25px -5px ${accent}40` }}
                aria-label={`Send enquiry to ${provider.name}`}
              >
                Send Enquiry
              </button>
              <button
                onClick={() => setCallbackOpen(true)}
                className="w-full min-h-[44px] py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-md mb-6 bg-white border border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 flex items-center justify-center gap-2"
                aria-label={`Request a callback from ${provider.name}`}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Request Callback
              </button>
              <div className="space-y-3 text-sm">
                <a href={`tel:${provider.phone}`} className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {provider.phone}
                </a>
                <a href={`mailto:${provider.email}`} className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {provider.email}
                </a>
                {provider.website && (
                  <a href={provider.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" /></svg>
                    Website
                  </a>
                )}
                <div className="flex items-center gap-3 text-gray-600">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {provider.location}, {provider.state || "NSW"}
                </div>
              </div>
              {provider.verified && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-xl p-3 border border-green-200">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                    <span className="font-medium">Verified NDIS Provider</span>
                  </div>
                </div>
              )}
              {!provider.verified && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Link href="/register" className="block text-center text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors">
                    Is this your business? Claim this listing
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Similar Providers */}
      {similarProviders.length > 0 && (
        <div className="max-w-5xl mx-auto mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Providers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarProviders.map((p) => (
              <ProviderCard key={p.slug} provider={p} />
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed */}
      <div className="max-w-5xl mx-auto mt-4">
        <RecentlyViewed currentSlug={provider.slug} />
      </div>

      <EnquiryModal
        providerName={provider.name}
        providerSlug={provider.slug}
        open={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
      />

      <CallbackModal
        providerName={provider.name}
        providerSlug={provider.slug}
        open={callbackOpen}
        onClose={() => setCallbackOpen(false)}
      />

      {/* Report Modal */}
      <AnimatePresence>
        {reportOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            onClick={() => setReportOpen(false)}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-2xl p-6"
            >
              <button
                onClick={() => setReportOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M6 18L18 6" /></svg>
              </button>
              {reportSubmitted ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#16a34a"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                  </div>
                  <p className="font-semibold text-gray-800">Report submitted</p>
                  <p className="text-sm text-gray-500 mt-1">Thank you for helping keep ReferAus accurate.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Report this listing</h3>
                  <p className="text-xs text-gray-500 mb-5">Help us keep ReferAus accurate and trustworthy.</p>
                  <form onSubmit={handleReportSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Reason</label>
                      <select
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-blue-500 transition-colors bg-white"
                      >
                        <option>Incorrect info</option>
                        <option>Suspicious</option>
                        <option>Spam</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Additional details (optional)</label>
                      <textarea
                        rows={3}
                        value={reportText}
                        onChange={(e) => setReportText(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                        placeholder="Please describe the issue..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={reportLoading}
                      className="w-full py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-all disabled:opacity-60"
                    >
                      {reportLoading ? "Submitting..." : "Submit Report"}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQrModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            onClick={() => setShowQrModal(false)}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xs rounded-2xl bg-white border border-gray-200 shadow-2xl p-6 text-center"
            >
              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M6 18L18 6" /></svg>
              </button>
              <h3 className="text-base font-bold text-gray-900 mb-1">Share this provider</h3>
              <p className="text-xs text-gray-500 mb-4">Scan to view this provider</p>
              <div className="flex justify-center mb-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent("https://referaus.com/providers/" + provider.slug)}&size=200x200&bgcolor=ffffff&color=1e3a5f&margin=8`}
                  alt="QR code"
                  width={200}
                  height={200}
                  className="rounded-xl border border-gray-100"
                />
              </div>
              <p className="text-xs text-gray-400 mb-4 break-all">referaus.com/providers/{provider.slug}</p>
              <button
                onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent("https://referaus.com/providers/" + provider.slug)}&size=400x400&bgcolor=ffffff&color=1e3a5f&margin=10`, "_blank")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Download QR Code
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky mobile CTA bar */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-gray-400 truncate">{provider.category}</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{provider.name}</p>
          </div>
          <button
            onClick={() => setCallbackOpen(true)}
            aria-label={`Request a callback from ${provider.name}`}
            className="shrink-0 min-w-[44px] min-h-[44px] px-3 py-2.5 rounded-xl text-blue-600 border border-gray-200 bg-white hover:border-blue-400 active:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          <button
            onClick={() => setEnquiryOpen(true)}
            className="shrink-0 min-h-[44px] px-5 py-2.5 rounded-xl text-white font-semibold text-sm bg-orange-500 hover:bg-orange-600 active:bg-orange-700 transition-colors"
          >
            Send Enquiry
          </button>
        </div>
      )}
    </div>
  );
}
