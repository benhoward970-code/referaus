"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DISMISS_KEY = "activity-proof-dismissed";

const MESSAGES = [
  "3 people enquired about providers today",
  "A new provider joined ReferAus",
  "5 participants found support this week",
  "A support coordinator recommended ReferAus",
  "2 new providers listed in Newcastle",
  "12 enquiries sent in the Hunter Region today",
  "A participant found their NDIS provider in under 5 minutes",
  "New verified provider added: Daily Living Support",
];

export function ActivitySocialProof() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(DISMISS_KEY)) {
      setDismissed(true);
      return;
    }
    // Show after 3s delay
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Cycle messages every 6 seconds with brief hide/show
  useEffect(() => {
    if (!visible || dismissed) return;
    const interval = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setMessageIndex(i => (i + 1) % MESSAGES.length);
        setShow(true);
      }, 400);
    }, 6000);
    return () => clearInterval(interval);
  }, [visible, dismissed]);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="fixed bottom-20 left-4 z-40 max-w-[260px]"
        >
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg shadow-gray-900/8 px-3 py-2.5 flex items-center gap-2.5">
            {/* Pulse dot */}
            <div className="relative shrink-0">
              <span className="block w-2.5 h-2.5 rounded-full bg-green-400" />
              <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-60" />
            </div>
            <AnimatePresence mode="wait">
              {show && (
                <motion.p
                  key={messageIndex}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="text-xs text-gray-700 leading-snug flex-1"
                >
                  {MESSAGES[messageIndex]}
                </motion.p>
              )}
            </AnimatePresence>
            <button
              onClick={handleDismiss}
              aria-label="Dismiss"
              className="shrink-0 w-5 h-5 flex items-center justify-center rounded text-gray-300 hover:text-gray-500 transition-colors"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
