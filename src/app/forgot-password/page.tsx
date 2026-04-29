"use client";
import { LogoMark } from "../../components/Logo";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { supabase, isConfigured } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!isConfigured() || !supabase) {
      setError("Service unavailable. Please try again later.");
      setLoading(false);
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://referaus.com/reset-password",
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-16">
      <div className="absolute top-[-20%] left-[30%] w-[500px] h-[500px] rounded-full bg-blue-600/[0.04] blur-[120px]" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4"><LogoMark /></div>
          <h1 className="text-2xl font-black tracking-tight mb-2">Reset your password</h1>
          <p className="text-sm text-gray-500">We&apos;ll send you a link to reset it</p>
        </div>

        {sent ? (
          <div className="glass rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <h2 className="text-lg font-bold mb-2">Check your email</h2>
            <p className="text-sm text-gray-500 mb-6">
              We&apos;ve sent a password reset link to <strong>{email}</strong>. Click the link in the email to set a new password.
            </p>
            <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Back to login
            </Link>
          </div>
        ) : (
          <div className="glass rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                  {error}
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-blue-600/25"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
            <div className="mt-6 text-center">
              <Link href="/login" className="text-xs text-gray-500 hover:text-blue-600">
                Back to login
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
