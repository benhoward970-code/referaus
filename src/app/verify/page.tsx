"use client";
import { LogoMark } from "../../components/Logo";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function VerifyPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!supabase) {
      setStatus("error");
      setMessage("Supabase not configured.");
      return;
    }

    // Supabase redirects back with hash params like #access_token=...&type=signup
    const hash = window.location.hash;
    if (!hash) {
      setStatus("error");
      setMessage("No verification token found. Please check your email link.");
      return;
    }

    const params = new URLSearchParams(hash.substring(1));
    const type = params.get("type");
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (type === "signup" || type === "email") {
      if (accessToken && refreshToken) {
        supabase.auth
          .setSession({ access_token: accessToken, refresh_token: refreshToken })
          .then(({ error }) => {
            if (error) {
              setStatus("error");
              setMessage(error.message);
            } else {
              setStatus("success");
              setMessage("Your email has been verified successfully!");
            }
          });
      } else {
        setStatus("success");
        setMessage("Your email has been verified!");
      }
    } else if (type === "recovery") {
      setStatus("success");
      setMessage("Password recovery link confirmed. You can now reset your password.");
    } else {
      setStatus("error");
      setMessage("Invalid verification link. Please try again.");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-16">
      <div className="absolute top-[-20%] left-[30%] w-[500px] h-[500px] rounded-full bg-blue-600/[0.04] blur-[120px]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10 text-center"
      >
        <div className="mx-auto mb-4"><LogoMark /></div>

        {status === "loading" && (
          <div className="glass rounded-2xl p-8">
            <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Verifying your email...</p>
          </div>
        )}

        {status === "success" && (
          <div className="glass rounded-2xl p-8">
            <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-black mb-2">Email Verified</h2>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-block px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-blue-600/25"
            >
              Sign In
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="glass rounded-2xl p-8">
            <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <h2 className="text-2xl font-black mb-2">Verification Failed</h2>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <Link
              href="/register"
              className="inline-block px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-blue-600/25"
            >
              Try Again
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
