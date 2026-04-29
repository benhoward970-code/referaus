"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitEnquiry } from "@/lib/supabase";

interface Props {
  providerName: string;
  providerSlug: string;
  open: boolean;
  onClose: () => void;
}

export function CallbackModal({ providerName, providerSlug, open, onClose }: Props) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", preferredTime: "Morning" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSending(true);
    const result = await submitEnquiry({
      provider_slug: providerSlug,
      provider_name: providerName,
      name: form.name,
      email: "",
      phone: form.phone,
      service: "Callback Request",
      message: `Callback request. Preferred time: ${form.preferredTime}. Phone: ${form.phone}`,
    });
    setSending(false);
    if (result.success) {
      setSent(true);
    } else {
      setError("Something went wrong. Please try again.");
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="callback-modal-title"
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-2xl p-6 sm:p-8"
        >
          <button
            onClick={onClose}
            aria-label="Close callback modal"
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M6 18L18 6" /></svg>
          </button>

          {sent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Callback requested!</h3>
              <p className="text-sm text-gray-500">{providerName} will call you back during your preferred time.</p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h2 id="callback-modal-title" className="text-lg font-bold text-gray-900">Request a Callback</h2>
                  <p className="text-xs text-gray-500">from {providerName}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="callback-name" className="block text-xs font-medium text-gray-600 mb-1.5">
                    Your Name <span aria-hidden="true" className="text-red-500">*</span>
                  </label>
                  <input
                    id="callback-name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Jane Smith"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus:border-blue-500 transition-colors min-h-[44px]"
                  />
                </div>
                <div>
                  <label htmlFor="callback-phone" className="block text-xs font-medium text-gray-600 mb-1.5">
                    Phone Number <span aria-hidden="true" className="text-red-500">*</span>
                  </label>
                  <input
                    id="callback-phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="04xx xxx xxx"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus:border-blue-500 transition-colors min-h-[44px]"
                  />
                </div>
                <div>
                  <label htmlFor="callback-time" className="block text-xs font-medium text-gray-600 mb-1.5">
                    Preferred Time
                  </label>
                  <select
                    id="callback-time"
                    value={form.preferredTime}
                    onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus:border-blue-500 transition-colors min-h-[44px] appearance-none"
                  >
                    <option value="Morning">Morning (8am – 12pm)</option>
                    <option value="Afternoon">Afternoon (12pm – 5pm)</option>
                    <option value="Evening">Evening (5pm – 7pm)</option>
                  </select>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full min-h-[44px] py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition-all hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  {sending ? "Sending..." : "Request Callback"}
                </button>
                <p className="text-xs text-gray-400 text-center">Your details will only be shared with this provider.</p>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
