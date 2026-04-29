"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitEnquiry } from "@/lib/supabase";
import { showToast } from "@/components/Toast";

const DRAFT_KEY = "referaus_enquiry_draft";

interface Props {
  providerName: string;
  providerSlug: string;
  open: boolean;
  onClose: () => void;
}

export function EnquiryModal({ providerName, providerSlug, open, onClose }: Props) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "Personal Care", message: "" });
  const [draftSaved, setDraftSaved] = useState(false);
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftIndicatorRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore draft when modal opens
  useEffect(() => {
    if (!open) return;
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setForm((prev) => ({ ...prev, ...parsed }));
      }
    } catch { /**/ }
  }, [open]);

  const scheduleDraftSave = useCallback((data: typeof form) => {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
        setDraftSaved(true);
        if (draftIndicatorRef.current) clearTimeout(draftIndicatorRef.current);
        draftIndicatorRef.current = setTimeout(() => setDraftSaved(false), 2000);
      } catch { /**/ }
    }, 2000);
  }, []);

  const updateForm = useCallback((updates: Partial<typeof form>) => {
    setForm((prev) => {
      const next = { ...prev, ...updates };
      scheduleDraftSave(next);
      return next;
    });
  }, [scheduleDraftSave]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await submitEnquiry({
      provider_slug: providerSlug,
      provider_name: providerName,
      ...form,
    });
    setSending(false);
    setSent(true);
    try { localStorage.removeItem(DRAFT_KEY); } catch { /**/ }
    showToast("Enquiry sent successfully!", "success");
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
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-2xl bg-white border border-gray-200 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M6 18L18 6" /></svg>
          </button>

          {sent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Enquiry sent!</h3>
              <p className="text-sm text-gray-500">{providerName} will receive your message and respond shortly.</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Send Enquiry</h2>
              <p className="text-sm text-gray-500 mb-6">to {providerName}</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Your Name *</label>
                    <input type="text" required value={form.name} onChange={e => updateForm({ name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Phone</label>
                    <input type="tel" value={form.phone} onChange={e => updateForm({ phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Email *</label>
                  <input type="email" required value={form.email} onChange={e => updateForm({ email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Service Needed</label>
                  <select value={form.service} onChange={e => updateForm({ service: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none">
                    {["Personal Care","Community Access","Allied Health","Plan Management","Support Coordination","Early Intervention","Mental Health","Other"].map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Message *</label>
                  <textarea required rows={4} value={form.message} onChange={e => updateForm({ message: e.target.value })}
                    placeholder="Tell the provider about your needs..."
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none" />
                </div>
                <div className="flex items-center gap-3">
                  <button type="submit" disabled={sending}
                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-blue-600/25">
                    {sending ? "Sending..." : "Send Enquiry"}
                  </button>
                  <AnimatePresence>
                    {draftSaved && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-gray-400 shrink-0"
                      >
                        Draft saved
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <p className="text-xs text-gray-400 text-center">Your details will only be shared with this provider.</p>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
