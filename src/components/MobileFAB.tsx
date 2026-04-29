"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function MobileFAB() {
  const [hidden, setHidden] = useState(false);
  const [onAuthPage, setOnAuthPage] = useState(false);
  const baseHeightRef = useRef<number | null>(null);

  useEffect(() => {
    // Hide on auth/admin pages to avoid covering forms
    const path = window.location.pathname;
    const authPaths = ["/login", "/register", "/forgot-password", "/reset-password", "/admin", "/dashboard"];
    setOnAuthPage(authPaths.some((p) => path.startsWith(p)));
  }, []);

  useEffect(() => {
    // Detect keyboard open via viewport height change
    const handleResize = () => {
      if (baseHeightRef.current === null) {
        baseHeightRef.current = window.innerHeight;
        return;
      }
      // If viewport shrinks by more than 150px, keyboard is likely open
      setHidden(window.innerHeight < baseHeightRef.current - 150);
    };

    // Set base height on mount
    baseHeightRef.current = window.innerHeight;

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (onAuthPage) return null;

  const handleSearch = () => {
    // Try to scroll to search bar first
    const searchEl = document.querySelector<HTMLElement>('[data-search-bar], input[type="search"], .search-autocomplete input');
    if (searchEl) {
      searchEl.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => searchEl.focus(), 400);
    } else {
      // Fall back to providers page
      window.location.href = "/providers";
    }
  };

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          // Above ChatWidget (z-40) and sticky bars
          className="fixed bottom-20 left-0 right-0 z-[45] flex justify-center gap-3 px-4 md:hidden pointer-events-none"
          aria-label="Quick actions"
        >
          {/* Search button */}
          <button
            onClick={handleSearch}
            className="pointer-events-auto flex items-center gap-2 px-5 py-3 rounded-full bg-blue-600 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 hover:bg-blue-500 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label="Search providers"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            Search
          </button>

          {/* List Business button */}
          <Link
            href="/register?role=provider"
            className="pointer-events-auto flex items-center gap-2 px-5 py-3 rounded-full bg-orange-500 text-white font-semibold text-sm shadow-lg shadow-orange-500/30 hover:bg-orange-400 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            aria-label="List your business"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
            </svg>
            List Business
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
