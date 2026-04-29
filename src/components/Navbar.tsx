"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, isConfigured, signOut } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { PrefetchLink } from "@/components/PrefetchOnHover";

const NAV_LINKS = [
  { label: "Providers", href: "/providers" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Blog", href: "/blog" },
];

function NotificationBell({ userEmail }: { userEmail: string }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; name: string; service: string; created_at: string; read: boolean }>>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch notifications (enquiries as notifications)
  useEffect(() => {
    if (!userEmail) return;
    const key = `referaus_read_notifs_${userEmail}`;
    const stored = JSON.parse(localStorage.getItem(key) || "[]") as string[];
    setReadIds(new Set(stored));

    fetch("/api/providers-public")
      .then((r) => r.json())
      .then(async (providers) => {
        if (!Array.isArray(providers) || providers.length === 0) return;
        // Find user's provider by matching... just use first for demo
        // Actually fetch from supabase directly via existing hook
      })
      .catch(() => {});
  }, [userEmail]);

  const unread = notifications.filter((n) => !readIds.has(n.id));

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open && notifications.length > 0) {
      const key = `referaus_read_notifs_${userEmail}`;
      const allIds = notifications.map((n) => n.id);
      setReadIds(new Set(allIds));
      localStorage.setItem(key, JSON.stringify(allIds));
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread.length > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">Notifications</span>
              {unread.length > 0 && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">{unread.length} new</span>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="mx-auto mb-2 text-gray-300">
                  <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                No new notifications
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
                {notifications.map((n) => {
                  const isRead = readIds.has(n.id);
                  return (
                    <div key={n.id} className={`px-4 py-3 ${isRead ? "opacity-60" : ""}`}>
                      <div className="flex items-start gap-2">
                        {!isRead && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
                        <div>
                          <p className="text-xs font-semibold text-gray-800">New enquiry from {n.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{n.service || "General enquiry"}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{n.created_at ? new Date(n.created_at).toLocaleDateString() : ""}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="px-4 py-2.5 border-t border-gray-100">
              <Link href="/dashboard/enquiries" className="text-xs font-semibold text-blue-600 hover:text-blue-700" onClick={() => setOpen(false)}>
                View all enquiries →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UserMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <div className="flex items-center gap-1">
      <NotificationBell userEmail={user.email || ""} />
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 text-sm text-gray-700 hover:text-gray-900 transition-all"
        >
          <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
            {user.email?.[0]?.toUpperCase() ?? "?"}
          </span>
          <span className="max-w-[120px] truncate">{user.email}</span>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50"
            >
              <Link
                href="/dashboard"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setOpen(false)}
              >
                Dashboard
              </Link>
              <hr className="my-1 border-gray-100" />
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
              >
                Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  // Auth state
  useEffect(() => {
    if (!isConfigured() || !supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleMobileSignOut = async () => {
    await signOut();
    setOpen(false);
    window.location.href = "/";
  };

  return (
    <>
      <nav
        style={{ top: "var(--announcement-height, 0px)" }}
        className={`fixed left-0 right-0 z-50 transition-all duration-200 ${
          scrolled
            ? "bg-white shadow-sm border-b border-gray-200"
            : "bg-white border-b border-gray-100"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <Logo />
          </Link>

          <div className="hidden md:flex items-center md:gap-4 lg:gap-7">
            {NAV_LINKS.map(({ label, href }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <PrefetchLink
                  key={href}
                  href={href}
                  className={`text-sm font-medium transition-colors ${
                    active
                      ? "text-gray-900 border-b-2 border-orange-500 pb-0.5"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {label}
                </PrefetchLink>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => {
                window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
              }}
              className="hidden lg:flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded-lg border border-gray-200 hover:border-gray-300 bg-gray-50"
              aria-label="Open command palette"
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <span className="font-mono">⌘K</span>
            </button>
            {user ? (
              <UserMenu user={user} />
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900 transition-all"
                >
                  Sign Up
                </Link>
                <Link
                  href="/register?role=provider"
                  className="text-sm font-semibold px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-all shadow-sm"
                >
                  List Your Business
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            className="md:hidden p-2 -mr-1 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? (
                <path d="M6 6l10 10M6 16L16 6" />
              ) : (
                <>
                  <line x1="3" y1="6" x2="19" y2="6" />
                  <line x1="3" y1="12" x2="19" y2="12" />
                  <line x1="3" y1="18" x2="19" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-white shadow-2xl flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100">
                <Logo />
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M5 5l10 10M5 15L15 5" />
                  </svg>
                </button>
              </div>

              {/* Auth buttons at top of drawer for non-logged-in users */}
              {!user && (
                <div className="px-5 pt-5 pb-3 flex flex-col gap-3">
                  <Link
                    href="/login"
                    className="text-center text-base font-semibold px-4 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="text-center text-base font-semibold px-4 py-3.5 rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all"
                  >
                    Sign Up
                  </Link>
                  <Link
                    href="/register?role=provider"
                    className="text-center text-sm font-semibold px-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-all shadow-sm"
                  >
                    List Your Business
                  </Link>
                </div>
              )}

              <nav className="flex-1 px-5 py-4 flex flex-col gap-1 overflow-y-auto border-t border-gray-100">
                {NAV_LINKS.map(({ label, href }) => {
                  const active = pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? "bg-orange-50 text-orange-600"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
                {user && (
                  <Link href="/dashboard" className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Dashboard
                  </Link>
                )}
              </nav>

              {user && (
                <div className="px-5 pb-8 pt-4 border-t border-gray-100 flex flex-col gap-3">
                  <p className="text-xs text-gray-500 truncate px-1">{user.email}</p>
                  <button
                    onClick={handleMobileSignOut}
                    className="text-center text-sm font-medium px-4 py-2.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-all"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}



