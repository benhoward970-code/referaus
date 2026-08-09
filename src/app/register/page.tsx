"use client";
import { useState } from "react";
import Link from "next/link";
import { signUp, isConfigured, submitWaitlist } from "@/lib/supabase";

export default function RegisterPage() {
  const [role, setRole] = useState<"participant" | "provider">("participant");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      if (!isConfigured()) {
        await submitWaitlist(email, role);
        setDone(true);
        return;
      }

      const result = await signUp(email, password, { name, role });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      // The provider/participant profile row is created server-side by the
      // handle_new_user() DB trigger on auth.users insert — no client call needed.
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-black mb-2">You&apos;re in!</h2>
          <p className="text-ink-500 text-sm mb-6">
            {isConfigured()
              ? "Check your email to verify your account, then sign in."
              : "Added to the waitlist — we will be in touch soon!"}
          </p>
          <Link href="/login" className="btn-block">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="h-editorial text-3xl mb-2">Create your <em>account.</em></h1>
          <p className="text-sm text-ink-500">Join ReferAus today</p>
        </div>

        <div className="card-flat p-8">
          {/* Role toggle */}
          <div className="flex rounded-[3px] border border-ink-950 p-1 mb-6 bg-white">
            <button
              type="button"
              onClick={() => setRole("participant")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${role === "participant" ? "bg-ink-950 text-cream" : "text-ink-500 hover:text-ink-700"}`}
            >
              Participant
            </button>
            <button
              type="button"
              onClick={() => setRole("provider")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${role === "provider" ? "bg-ink-950 text-cream" : "text-ink-500 hover:text-ink-700"}`}
            >
              Provider
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-ink-500 mb-1.5">
                {role === "provider" ? "Business Name" : "Full Name"}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={role === "provider" ? "Your business name" : "Your full name"}
                className="w-full px-4 py-3 rounded-[3px] bg-white border border-ink-950 text-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-500 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-[3px] bg-white border border-ink-950 text-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-500 mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-3 rounded-[3px] bg-white border border-ink-950 text-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-[3px] bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-ink-950 font-bold text-sm transition-all"
            >
              {loading ? "Creating account…" : role === "provider" ? "Create Provider Account" : "Sign Up Free"}
            </button>
          </form>

          <p className="text-center text-xs text-ink-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-orange-600 hover:text-orange-500 font-medium underline underline-offset-2">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
