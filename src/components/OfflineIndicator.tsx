"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, X } from "lucide-react";

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOffline(!navigator.onLine);

    const handleOffline = () => {
      setIsOffline(true);
      setDismissed(false); // show again if was dismissed
    };
    const handleOnline = () => {
      setIsOffline(false);
      setDismissed(false);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const show = isOffline && !dismissed;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-0 left-0 right-0 z-[200] bg-amber-500 text-white px-4 py-2.5 flex items-center justify-between gap-3 shadow-md"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>You appear to be offline. Some features may not work.</span>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 p-1 rounded hover:bg-amber-600 transition-colors"
            aria-label="Dismiss offline warning"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
