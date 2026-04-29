"use client";
import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { providers as hardcodedProviders, categories, locations } from "@/lib/providers";
import type { Provider } from "@/lib/providers";
import { ProviderCard } from "@/components/ProviderCard";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { getAllProviders } from "@/lib/supabase";
import { mapDbProvider } from "@/lib/map-provider";
import { fetchWithSWR } from "@/lib/swr-cache";

type SortOption = "rating" | "name" | "reviews" | "newest";
const PAGE_SIZE = 12;

function AnimatedCount({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    if (prefersReduced) { setDisplayed(value); return; }
    let start = 0;
    const duration = 800;
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, value, prefersReduced]);

  useEffect(() => { setDisplayed(0); }, [value]);

  return <span ref={ref}>{displayed}</span>;
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function ProvidersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [location, setLocation] = useState(searchParams.get("location") || "All Locations");
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get("verified") === "true");
  const [minRating, setMinRating] = useState(Number(searchParams.get("minRating") || "0"));
  const [sort, setSort] = useState<SortOption>((searchParams.get("sort") as SortOption) || "rating");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Sync filter state to URL
  useEffect(() => {
    if (!mounted) return;
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (category !== "All") params.set("category", category);
    if (location !== "All Locations") params.set("location", location);
    if (verifiedOnly) params.set("verified", "true");
    if (minRating > 0) params.set("minRating", String(minRating));
    if (sort !== "rating") params.set("sort", sort);
    const query = params.toString();
    router.replace(query ? `/providers?${query}` : "/providers", { scroll: false });
  }, [search, category, location, verifiedOnly, minRating, sort, mounted, router]);

  useEffect(() => {
    let cancelled = false;
    // Item 94: SWR cache — show cached providers instantly, revalidate in background
    fetchWithSWR<Provider[]>(
      "providers-all",
      async () => {
        const dbRows = await getAllProviders();
        return dbRows.map((row: any) => mapDbProvider(row));
      },
      (fresh) => {
        if (!cancelled) {
          setProviders(fresh);
          setIsLoading(false);
        }
      },
    ).then((cached) => {
      if (!cancelled && cached) {
        setProviders(cached);
        setIsLoading(false);
      } else if (!cancelled && !cached) {
        // no cache — loading state stays until background fetch completes
      }
    }).catch(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let result = providers.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.services.some((s) => s.toLowerCase().includes(search.toLowerCase())) || (p.postcode && p.postcode.includes(search)) || (p.suburb && p.suburb.toLowerCase().includes(search.toLowerCase()));
      const matchCat = category === "All" || p.category === category;
      const matchLoc = location === "All Locations" || p.location === location;
      const matchVerified = !verifiedOnly || p.verified;
      const matchRating = minRating === 0 || p.rating >= minRating;
      return matchSearch && matchCat && matchLoc && matchVerified && matchRating;
    });

    if (sort === "rating") result = [...result].sort((a, b) => b.rating - a.rating);
    else if (sort === "name") result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "reviews") result = [...result].sort((a, b) => b.reviewCount - a.reviewCount);
    else if (sort === "newest") result = [...result].sort((a, b) => {
      const aDate = (a as any).created_at ? new Date((a as any).created_at).getTime() : 0;
      const bDate = (b as any).created_at ? new Date((b as any).created_at).getTime() : 0;
      return bDate - aDate;
    });

    return result;
  }, [search, category, location, verifiedOnly, minRating, sort, providers]);

  const hasActiveFilters = category !== "All" || location !== "All Locations" || verifiedOnly || !!search || minRating > 0;

  // Reset visible count when filters change
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [search, category, location, verifiedOnly, minRating, sort]);

  const visibleProviders = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          setLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((v) => v + PAGE_SIZE);
            setLoadingMore(false);
          }, 400);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore]);

  return (
    <div className="min-h-screen pt-28 pb-14 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReduced ? 0 : 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Browse <span className="text-orange-500">Providers</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-xl">
            {providers.length > 0 ? `${providers.length} NDIS providers across Newcastle & the Hunter Region` : "Find NDIS providers in Newcastle & the Hunter Region"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReduced ? 0 : 0.1, duration: prefersReduced ? 0 : 0.5 }}
          className="space-y-3 mb-4"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search providers, services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus:border-blue-500/40 transition-colors"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-3 rounded-xl bg-surface border border-gray-200 text-gray-500 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus:border-blue-500/40 appearance-none cursor-pointer w-full sm:min-w-[180px] sm:w-auto"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-4 py-3 rounded-xl bg-surface border border-gray-200 text-gray-500 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus:border-blue-500/40 appearance-none cursor-pointer w-full sm:min-w-[180px] sm:w-auto"
            >
              {locations.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div
                  role="checkbox"
                  aria-checked={verifiedOnly}
                  tabIndex={0}
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); setVerifiedOnly(!verifiedOnly); } }}
                  className={`w-5 h-5 rounded flex items-center justify-center border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${verifiedOnly ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"}`}
                >
                  {verifiedOnly && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-600 font-medium">Verified only</span>
              </label>

              {/* Min Rating Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Min rating:</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setMinRating(minRating === star ? 0 : star)}
                      aria-label={`Minimum ${star} stars`}
                      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={star <= minRating ? "#f97316" : "#e5e7eb"} className="hover:fill-orange-300 transition-colors">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  ))}
                  {minRating > 0 && (
                    <button onClick={() => setMinRating(0)} className="ml-1 text-xs text-gray-400 hover:text-gray-600">✕</button>
                  )}
                </div>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 whitespace-nowrap">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus:border-blue-500/40 appearance-none cursor-pointer"
              >
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviews</option>
                <option value="newest">Newest</option>
                <option value="name">A-Z</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Active filter pills */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {search && (
              <button
                onClick={() => setSearch("")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 text-xs font-medium border border-orange-200 hover:bg-orange-100 transition-colors"
              >
                &ldquo;{search}&rdquo;
                <CloseIcon />
              </button>
            )}
            {category !== "All" && (
              <button
                onClick={() => setCategory("All")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                {category}
                <CloseIcon />
              </button>
            )}
            {location !== "All Locations" && (
              <button
                onClick={() => setLocation("All Locations")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                {location}
                <CloseIcon />
              </button>
            )}
            {verifiedOnly && (
              <button
                onClick={() => setVerifiedOnly(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-200 hover:bg-green-100 transition-colors"
              >
                Verified Only
                <CloseIcon />
              </button>
            )}
            {minRating > 0 && (
              <button
                onClick={() => setMinRating(0)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 text-xs font-medium border border-orange-200 hover:bg-orange-100 transition-colors"
              >
                {minRating}+ Stars
                <CloseIcon />
              </button>
            )}
            <button
              onClick={() => { setSearch(""); setCategory("All"); setLocation("All Locations"); setVerifiedOnly(false); setMinRating(0); setSort("rating"); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium border border-gray-200 hover:bg-gray-200 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Search results header */}
        {search && (
          <motion.div
            key={`search-header-${search}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mb-4 flex flex-wrap items-center gap-3"
          >
            <h2 className="text-xl font-bold text-gray-900">
              Results for <span className="text-orange-500">&ldquo;{search}&rdquo;</span>
            </h2>
            <span className="text-sm text-gray-500 font-medium">
              {filtered.length} provider{filtered.length !== 1 ? "s" : ""} found
            </span>
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs font-medium transition-colors"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
              Clear
            </button>
          </motion.div>
        )}

        <motion.p
          key={`${filtered.length}-${providers.length}`}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-sm text-gray-500 font-medium mb-6 flex items-center gap-1.5"
        >
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
            Showing <AnimatedCount value={Math.min(visibleCount, filtered.length)} /> of <AnimatedCount value={filtered.length} /> providers
          </span>
        </motion.p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-5/6" />
                </div>
                <div className="flex gap-2 mt-4">
                  <div className="h-6 bg-gray-100 rounded-full w-20" />
                  <div className="h-6 bg-gray-100 rounded-full w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center py-14 max-w-lg mx-auto"
          >
            {hasActiveFilters ? (
              <>
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No providers found matching your search</h2>
                <p className="text-gray-500 text-sm mb-6">Try adjusting your filters or broadening your search.</p>
                <button
                  onClick={() => { setSearch(""); setCategory("All"); setLocation("All Locations"); setVerifiedOnly(false); setMinRating(0); setSort("rating"); }}
                  className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all text-sm"
                >
                  Clear all filters
                </button>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">🏗️</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">We&apos;re just getting started</h2>
                <p className="text-gray-500 text-sm mb-6">
                  ReferAus is new and we&apos;re onboarding NDIS providers in the Hunter Region right now. Check back soon — or if you&apos;re a provider, be one of the first to list.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href="/register" className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-400 transition-all text-sm">List Your Organisation</a>
                  <a href="/contact" className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all text-sm">Get in Touch</a>
                </div>
              </>
            )}
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleProviders.map((p, i) => (
                <motion.div
                  key={p.slug}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: prefersReduced ? 0 : Math.min((i % PAGE_SIZE) * 0.05, 0.3), duration: prefersReduced ? 0 : 0.4 }}
                >
                  <ProviderCard provider={p} />
                </motion.div>
              ))}
            </div>
            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="mt-8 flex justify-center min-h-[40px]">
              {loadingMore && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <svg className="animate-spin w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading more providers...
                </div>
              )}
              {!hasMore && filtered.length > PAGE_SIZE && (
                <p className="text-xs text-gray-400">All {filtered.length} providers loaded</p>
              )}
            </div>
          </>
        )}

        {/* Recently Viewed */}
        <RecentlyViewed />
      </div>
    </div>
  );
}

export default function ProvidersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-28 pb-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto animate-pulse">
          <div className="h-12 bg-gray-200 rounded w-64 mb-4" />
          <div className="h-5 bg-gray-100 rounded w-80 mb-12" />
        </div>
      </div>
    }>
      <ProvidersContent />
    </Suspense>
  );
}
