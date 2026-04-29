"use client";
import { useRouter } from "next/navigation";
import { useCallback, useRef, AnchorHTMLAttributes, forwardRef } from "react";
import Link, { LinkProps } from "next/link";
import React from "react";

const PREFETCH_DELAY_MS = 200;

type PrefetchLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children: React.ReactNode;
  };

/**
 * PrefetchLink — a drop-in replacement for Next.js <Link> that prefetches
 * the destination page on hover with a 200ms delay to avoid unnecessary
 * prefetches when the user is just moving their mouse across the page.
 */
export const PrefetchLink = forwardRef<HTMLAnchorElement, PrefetchLinkProps>(
  function PrefetchLink({ href, onMouseEnter, onMouseLeave, children, ...props }, ref) {
    const router = useRouter();
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        timerRef.current = setTimeout(() => {
          router.prefetch(typeof href === "string" ? href : href.pathname ?? "/");
        }, PREFETCH_DELAY_MS);
        onMouseEnter?.(e);
      },
      [href, router, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        onMouseLeave?.(e);
      },
      [onMouseLeave]
    );

    return (
      <Link
        ref={ref}
        href={href}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

export default PrefetchLink;
