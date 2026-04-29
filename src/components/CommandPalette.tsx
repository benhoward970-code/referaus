"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface CommandItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  group?: string;
}

const PAGES: CommandItem[] = [
  { label: "Home", href: "/", group: "Pages" },
  { label: "Providers", href: "/providers", group: "Pages" },
  { label: "Pricing", href: "/pricing", group: "Pages" },
  { label: "About", href: "/about", group: "Pages" },
  { label: "Contact", href: "/contact", group: "Pages" },
  { label: "FAQ", href: "/faq", group: "Pages" },
  { label: "Services", href: "/services", group: "Pages" },
  { label: "Blog", href: "/blog", group: "Pages" },
  { label: "Login", href: "/login", group: "Account" },
  { label: "Register", href: "/register", group: "Account" },
  { label: "Dashboard", href: "/dashboard", group: "Account" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [providers, setProviders] = useState<CommandItem[]>([]);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Fetch providers for search
  useEffect(() => {
    if (!open) return;
    fetch("/api/providers-public")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProviders(
            data.slice(0, 50).map((p: { name: string; slug: string }) => ({
              label: p.name,
              href: `/providers/${p.slug}`,
              group: "Providers",
            }))
          );
        }
      })
      .catch(() => {});
  }, [open]);

  const allItems = [...PAGES, ...providers];

  const filtered = query.trim()
    ? allItems.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
    : PAGES;

  // Group filtered items
  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    const g = item.group || "Other";
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {});

  const flatFiltered = Object.values(grouped).flat();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelected(0);
  }, []);

  const navigate = useCallback(
    (href: string) => {
      router.push(href);
      close();
    },
    [router, close]
  );

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Focus input when open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelected(0);
    }
  }, [open]);

  // Arrow key navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { close(); return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, flatFiltered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = flatFiltered[selected];
        if (item) navigate(item.href);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, flatFiltered, selected, close, navigate]);

  // Reset selected on query change
  useEffect(() => { setSelected(0); }, [query]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4"
          onClick={close}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-400 shrink-0">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search pages, providers..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none"
              />
              <kbd className="hidden sm:flex items-center gap-1 text-[10px] text-gray-400 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-mono">Esc</kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto py-2">
              {flatFiltered.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">No results found</div>
              ) : (
                (() => {
                  let idx = 0;
                  return Object.entries(grouped).map(([group, items]) => (
                    <div key={group}>
                      <div className="px-4 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{group}</div>
                      {items.map((item) => {
                        const currentIdx = idx++;
                        const isSelected = currentIdx === selected;
                        return (
                          <button
                            key={item.href}
                            onClick={() => navigate(item.href)}
                            onMouseEnter={() => setSelected(currentIdx)}
                            className={`w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm transition-colors ${
                              isSelected ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={isSelected ? "text-blue-500" : "text-gray-400"}>
                              <path d="M9 5l7 7-7 7" />
                            </svg>
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  ));
                })()
              )}
            </div>

            <div className="px-4 py-2.5 border-t border-gray-100 flex items-center gap-4 text-[10px] text-gray-400">
              <span className="flex items-center gap-1"><kbd className="font-mono bg-gray-100 border border-gray-200 rounded px-1 py-0.5">↑↓</kbd> navigate</span>
              <span className="flex items-center gap-1"><kbd className="font-mono bg-gray-100 border border-gray-200 rounded px-1 py-0.5">↵</kbd> select</span>
              <span className="flex items-center gap-1"><kbd className="font-mono bg-gray-100 border border-gray-200 rounded px-1 py-0.5">Esc</kbd> close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
