"use client";

/* ──────────────────────────────────────────────
   PageTransition — simple wrapper, no animation.
   Previous framer-motion opacity:0 was causing
   blank pages on client-side rendered routes.
────────────────────────────────────────────── */

export function PageTransition({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
