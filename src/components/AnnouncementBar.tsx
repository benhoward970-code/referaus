"use client";
import { useState, useEffect } from "react";

const STORAGE_KEY = "referaus_announcement_dismissed";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setVisible(true);
      document.documentElement.style.setProperty("--announcement-height", "36px");
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
    document.documentElement.style.setProperty("--announcement-height", "0px");
  };

  if (!visible) return null;

  return (
    <div
      id="announcement-bar"
      className="fixed top-0 left-0 right-0 z-[60] bg-blue-600 text-white text-xs sm:text-sm py-2 px-4 flex items-center justify-center gap-3"
    >
      <span className="text-center leading-snug">
        🎉 Now live! Find trusted NDIS providers in Newcastle &amp; Hunter Valley
      </span>
      <button
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="ml-2 shrink-0 flex items-center justify-center w-5 h-5 rounded-full hover:bg-blue-500 transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
