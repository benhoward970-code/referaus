"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CheckCircle, MapPin, Mail, Clock } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const subjects = [
  "General Enquiry",
  "Provider Enquiry",
  "Partnership",
  "Support",
  "Media",
];

const faqs = [
  {
    q: "Is ReferAus free for participants?",
    a: "Yes — 100% free for NDIS participants. Always. You can search, compare, and contact providers without paying a cent. We are funded by providers who choose to list their services.",
  },
  {
    q: "How do I list my business on ReferAus?",
    a: "Head to our Register page and create a provider account. We review every application to ensure quality. Once approved, your profile goes live in our directory. Basic listings are free; premium features are available on paid plans.",
  },
  {
    q: "How are providers verified?",
    a: "We check that every provider holds current NDIS registration (or relevant exemptions), verify their business details, and review their service descriptions before they appear in search results.",
  },
  {
    q: "How do I leave a review for a provider?",
    a: "You need a free participant account to leave reviews. Once logged in, search for the provider and click 'Leave a Review'. We verify reviews are from genuine NDIS participants to keep them trustworthy.",
  },
  {
    q: "I found incorrect information — how do I report it?",
    a: "Use the 'Report an issue' link on any provider profile, or contact us directly via this form with the subject 'Support'. We take accuracy seriously and will investigate within 48 hours.",
  },
];

// Validation helpers
const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const validatePhone = (v: string) => !v || /^[\d\s\+\-\(\)]{8,}$/.test(v.trim());
const formatPhone = (v: string) => {
  const digits = v.replace(/\D/g, "");
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
};

type FieldState = "idle" | "valid" | "error";

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-5 text-left gap-4 hover:text-blue-600 transition-colors"
      >
        <span className="font-semibold text-gray-800 text-sm sm:text-base">{q}</span>
        <span className={`text-xl text-gray-400 transition-transform duration-300 shrink-0 ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-gray-500 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FieldWrapper({
  label,
  required,
  state,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  state: FieldState;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        {children}
        {state === "valid" && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </span>
        )}
      </div>
      <AnimatePresence>
        {state === "error" && error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="text-red-500 text-xs mt-1"
          >
            {error}
          </motion.p>
        )}
        {state === "valid" && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="text-green-600 text-xs mt-1"
          >
            ✓ Looks good
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function inputClass(state: FieldState, extra = "") {
  const base =
    "w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all duration-150 pr-9";
  if (state === "error")
    return `${base} border-red-400 bg-red-50 focus:border-red-500 ${extra}`;
  if (state === "valid")
    return `${base} border-green-400 bg-green-50 focus:border-green-500 ${extra}`;
  return `${base} border-gray-200 focus:border-blue-600 ${extra}`;
}

const shakeVariant = {
  idle: { x: 0 },
  shake: {
    x: [0, -8, 8, -6, 6, -4, 4, 0],
    transition: { duration: 0.4 },
  },
};

const DRAFT_KEY = "referaus_contact_draft";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: subjects[0],
    message: "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [shaking, setShaking] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [draftSaved, setDraftSaved] = useState(false);
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftIndicatorRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore draft on load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setForm((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore
    }
  }, []);

  // Auto-save draft every 2 seconds after change
  const scheduleDraftSave = useCallback((data: typeof form) => {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
        setDraftSaved(true);
        if (draftIndicatorRef.current) clearTimeout(draftIndicatorRef.current);
        draftIndicatorRef.current = setTimeout(() => setDraftSaved(false), 2000);
      } catch {
        // ignore
      }
    }, 2000);
  }, []);

  const updateForm = useCallback((updates: Partial<typeof form>) => {
    setForm((prev) => {
      const next = { ...prev, ...updates };
      scheduleDraftSave(next);
      return next;
    });
  }, [scheduleDraftSave]);

  const getFieldState = useCallback(
    (field: string): { state: FieldState; error?: string } => {
      if (!touched[field]) return { state: "idle" };
      if (field === "name") {
        if (!form.name.trim()) return { state: "error", error: "Name is required" };
        return { state: "valid" };
      }
      if (field === "email") {
        if (!form.email.trim()) return { state: "error", error: "Email is required" };
        if (!validateEmail(form.email)) return { state: "error", error: "Enter a valid email address" };
        return { state: "valid" };
      }
      if (field === "message") {
        if (!form.message.trim()) return { state: "error", error: "Message is required" };
        if (form.message.trim().length < 10) return { state: "error", error: "Message is too short" };
        return { state: "valid" };
      }
      return { state: "idle" };
    },
    [form, touched]
  );

  const isFormValid =
    form.name.trim() &&
    validateEmail(form.email) &&
    form.message.trim().length >= 10;

  const handleBlur = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Touch all fields
    setTouched({ name: true, email: true, message: true });

    if (!isFormValid) {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          type: form.subject.toLowerCase().replace(" ", "_"),
        }),
      });
      if (res.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", subject: subjects[0], message: "" });
        setTouched({});
        try { localStorage.removeItem(DRAFT_KEY); } catch { /**/ }
        // Dynamic import to avoid SSR issues
        import("@/components/Toast").then(({ showToast }) => showToast("Message sent! We'll be in touch soon.", "success"));
      } else {
        setStatus("error");
        import("@/components/Toast").then(({ showToast }) => showToast("Failed to send message. Please try again.", "error"));
      }
    } catch {
      setStatus("error");
      import("@/components/Toast").then(({ showToast }) => showToast("Failed to send message. Please try again.", "error"));
    }
  };

  const nameField = getFieldState("name");
  const emailField = getFieldState("email");
  const messageField = getFieldState("message");

  return (
    <div className="min-h-screen pt-28 pb-14">
      {/* Hero */}
      <section className="px-4 sm:px-6 pb-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <Breadcrumbs className="mb-2" />
            <span className="section-label mb-4 block">Contact Us</span>
            <h1 className="heading-bold text-[clamp(2.2rem,5vw,3.8rem)] leading-tight mb-4">
              Get in <span className="gradient-text">touch</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-xl leading-relaxed">
              Have a question, partnership idea, or need support? We would love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <section className="px-4 sm:px-6 pb-14">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.55 }}
            className="lg:col-span-3"
          >
            {status === "sent" ? (
              <div className="rounded-2xl bg-green-50 border border-green-200 p-10 text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <h3 className="font-bold text-xl mb-2">Message sent!</h3>
                <p className="text-gray-600 text-sm mb-6">We will get back to you within 24 hours.</p>
                <button
                  onClick={() => setStatus("idle")}
                  className="text-blue-600 text-sm font-semibold hover:text-blue-700"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <motion.form
                onSubmit={handleSubmit}
                variants={shakeVariant}
                animate={shaking ? "shake" : "idle"}
                className="rounded-2xl bg-white border border-gray-200 p-5 sm:p-10 shadow-sm space-y-5"
              >
                <h2 className="text-xl font-bold mb-1">Send us a message</h2>
                <p className="text-sm text-gray-400 mb-2">
                  We typically respond within one business day.
                  Fields marked <span className="text-red-500">*</span> are required.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FieldWrapper
                    label="Name"
                    required
                    state={nameField.state}
                    error={nameField.error}
                  >
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => updateForm({ name: e.target.value })}
                      onBlur={() => handleBlur("name")}
                      className={inputClass(nameField.state)}
                      placeholder="Your full name"
                      autoComplete="name"
                    />
                  </FieldWrapper>

                  <FieldWrapper
                    label="Email"
                    required
                    state={emailField.state}
                    error={emailField.error}
                  >
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateForm({ email: e.target.value })}
                      onBlur={() => handleBlur("email")}
                      className={inputClass(emailField.state)}
                      placeholder="you@email.com"
                      autoComplete="email"
                    />
                  </FieldWrapper>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) => updateForm({ subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-600 transition-colors bg-white"
                  >
                    {subjects.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <FieldWrapper
                  label="Message"
                  required
                  state={messageField.state}
                  error={messageField.error}
                >
                  <textarea
                    rows={6}
                    value={form.message}
                    onChange={(e) => updateForm({ message: e.target.value })}
                    onBlur={() => handleBlur("message")}
                    className={inputClass(messageField.state, "resize-none")}
                    placeholder="How can we help?"
                  />
                </FieldWrapper>

                <div className="flex items-center justify-between gap-4">
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="flex-1 py-3.5 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-orange-500/25"
                  >
                    {status === "sending" ? "Sending..." : "Send Message"}
                  </button>
                  <AnimatePresence>
                    {draftSaved && (
                      <motion.span
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-gray-400 shrink-0"
                      >
                        Draft saved
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {status === "error" && (
                  <p className="text-red-500 text-sm text-center">
                    Something went wrong. Try again or email{" "}
                    <a href="mailto:hello@referaus.com" className="underline">
                      hello@referaus.com
                    </a>{" "}
                    directly.
                  </p>
                )}
              </motion.form>
            )}
          </motion.div>

          {/* Office info */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.55 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="rounded-2xl bg-white border border-gray-200 p-8 shadow-sm">
              <h3 className="font-bold text-lg mb-5">Office</h3>
              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex gap-3">
                  <MapPin className="text-orange-500 mt-0.5 shrink-0 w-4 h-4" />
                  <div>
                    <p className="font-medium text-gray-800">Hunter Region, NSW</p>
                    <p className="text-gray-400">Australia</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Mail className="text-orange-500 mt-0.5 shrink-0 w-4 h-4" />
                  <div>
                    <p className="font-medium text-gray-800">Email</p>
                    <a
                      href="mailto:hello@referaus.com"
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      hello@referaus.com
                    </a>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Clock className="text-orange-500 mt-0.5 shrink-0 w-4 h-4" />
                  <div>
                    <p className="font-medium text-gray-800">Response time</p>
                    <p className="text-gray-400">Within 1 business day</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-8">
              <h3 className="font-bold text-lg mb-3">Are you a provider?</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Want to list your NDIS services and connect with more participants? Create a free
                provider account today.
              </p>
              <Link
                href="/register"
                className="inline-block px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-all"
              >
                List Your Business
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 sm:px-6 py-10 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <span className="section-label mb-4 block">FAQ</span>
            <h2 className="heading-bold text-3xl sm:text-4xl">Common questions</h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white border border-gray-200 p-6 sm:p-8 shadow-sm"
          >
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
