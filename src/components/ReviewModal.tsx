"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ReviewModalProps {
  providerName: string;
  providerSlug: string;
  open: boolean;
  onClose: () => void;
  onSubmitted: (review: { author_name: string; rating: number; text: string; service_type?: string; created_at: string }) => void;
}

const SERVICE_TYPES = [
  "Daily Living Support",
  "Occupational Therapy",
  "Speech Pathology",
  "Psychology / Behaviour Support",
  "Community Access",
  "Plan Management",
  "Support Coordination",
  "Transport",
  "Other",
];

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill={(hovered || value) >= star ? "#F97316" : "#e5e7eb"}
            className="transition-colors duration-100"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

const LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

export function ReviewModal({ providerName, providerSlug, open, onClose, onSubmitted }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const reset = () => {
    setRating(0); setName(""); setText(""); setServiceType(""); setError(""); setDone(false); setLoading(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (rating === 0) { setError("Please select a star rating."); return; }
    if (name.trim().length < 2) { setError("Please enter your name."); return; }
    if (text.trim().length < 10) { setError("Review must be at least 10 characters."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider_slug: providerSlug, author_name: name, rating, text, service_type: serviceType }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); setLoading(false); return; }
      const submitted = data.review || { author_name: name, rating, text, service_type: serviceType, created_at: new Date().toISOString() };
      onSubmitted(submitted);
      setDone(true);
    } catch {
      setError("Network error. Your review was not saved.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 z-10"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {done ? (
              <div className="text-center py-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="#16a34a"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Review submitted!</h3>
                <p className="text-sm text-gray-500 mb-6">Thank you for helping others find the right provider.</p>
                <button onClick={handleClose} className="px-6 py-2.5 rounded-xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-400 transition-colors">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Write a Review</h2>
                <p className="text-sm text-gray-500 mb-6">Share your experience with <span className="font-medium text-gray-700">{providerName}</span></p>

                {/* Star Rating */}
                <div className="mb-5">
                  <label className="block text-xs font-medium text-gray-600 mb-2">Overall Rating *</label>
                  <StarPicker value={rating} onChange={setRating} />
                  {rating > 0 && <p className="text-sm font-medium text-orange-500 mt-1">{LABELS[rating]}</p>}
                </div>

                {/* Name */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Your Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="e.g. Sarah M."
                    maxLength={80}
                  />
                </div>

                {/* Service type */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Service Used (optional)</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-blue-500 transition-colors bg-white"
                  >
                    <option value="">Select a service...</option>
                    {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Review text */}
                <div className="mb-5">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Your Review *</label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    placeholder="Tell others about your experience — what went well, what could improve, and who you would recommend this provider to..."
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{text.length}/1000</p>
                </div>

                {error && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Submitting...
                    </>
                  ) : "Submit Review"}
                </button>

                <p className="text-xs text-gray-400 text-center mt-3">
                  Reviews are moderated to ensure they are genuine and helpful.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
