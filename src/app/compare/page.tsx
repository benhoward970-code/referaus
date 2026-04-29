"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { providers } from "@/lib/providers";
import type { Provider } from "@/lib/providers";

const MAX_COMPARE = 3;

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-orange-400">★</span>
      <span className="font-semibold">{rating.toFixed(1)}</span>
      <span className="text-gray-400">/ 5.0</span>
    </span>
  );
}

function ServiceTag({ service, highlight }: { service: string; highlight?: boolean }) {
  return (
    <span
      className={`inline-block text-xs px-2 py-1 rounded-lg border mr-1 mb-1 ${
        highlight
          ? "bg-orange-50 border-orange-300 text-orange-700 font-medium"
          : "bg-gray-50 border-gray-200 text-gray-600"
      }`}
    >
      {service}
    </span>
  );
}

function ProviderCard({ provider, onRemove, allServices }: { provider: Provider; onRemove: () => void; allServices: string[] }) {
  const uniqueServices = provider.services.filter(
    (s) => !allServices.filter((as) => as !== s || provider.services.indexOf(s) === -1)
  );
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/20 to-orange-500/20 border border-gray-200 flex items-center justify-center shrink-0">
            <span className="text-lg font-black text-blue-600">{provider.name[0]}</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm leading-tight">{provider.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{provider.suburb}</p>
          </div>
        </div>
        <button onClick={onRemove} className="text-gray-300 hover:text-gray-500 transition-colors text-lg leading-none p-1 min-w-[32px] min-h-[32px] flex items-center justify-center">✕</button>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-gray-500">Category</span>
          <span className="font-medium text-gray-800">{provider.category}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-gray-500">Rating</span>
          <StarRating rating={provider.rating} />
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-gray-500">Reviews</span>
          <span className="font-medium text-gray-800">{provider.reviewCount} reviews</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-gray-500">Verified</span>
          {provider.verified ? (
            <span className="flex items-center gap-1 text-green-600 font-semibold text-xs">
              <span>✓</span> Verified
            </span>
          ) : (
            <span className="text-gray-400 text-xs">Unverified</span>
          )}
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-gray-500">Plan Tier</span>
          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
            provider.plan === "premium" ? "bg-blue-50 text-blue-700 border border-blue-200" :
            provider.plan === "free" ? "bg-green-50 text-green-700 border border-green-200" :
            provider.plan === "pro" ? "bg-purple-50 text-purple-700 border border-purple-200" :
            "bg-orange-50 text-orange-700 border border-orange-200"
          }`}>{provider.plan}</span>
        </div>
        <div className="py-2">
          <p className="text-gray-500 mb-2">Services</p>
          <div>
            {provider.services.map((s) => (
              <ServiceTag key={s} service={s} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Link
          href={`/providers/${provider.slug}`}
          className="flex-1 text-center text-xs font-semibold py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          View Profile
        </Link>
        <Link
          href={`/contact?provider=${provider.slug}`}
          className="flex-1 text-center text-xs font-semibold py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:border-orange-400 hover:text-orange-600 transition-colors"
        >
          Send Enquiry
        </Link>
      </div>
    </motion.div>
  );
}

export default function ComparePage() {
  const [selections, setSelections] = useState<(string | "")[]>(["", "", ""]);

  const selectedProviders = useMemo(
    () =>
      selections
        .map((s) => (s ? providers.find((p) => p.slug === s) : undefined))
        .filter((p): p is Provider => Boolean(p)),
    [selections]
  );

  // Collect all services across selected providers
  const allSelectedServices = useMemo(
    () => Array.from(new Set(selectedProviders.flatMap((p) => p.services))).sort(),
    [selectedProviders]
  );

  const handleSelect = (idx: number, value: string) => {
    setSelections((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  };

  const removeProvider = (idx: number) => {
    setSelections((prev) => {
      const next = [...prev];
      next[idx] = "";
      return next;
    });
  };

  // For table view: which slugs are already selected in other slots
  const usedSlugs = selections.filter(Boolean);

  const rows: { label: string; render: (p: Provider) => React.ReactNode; isDiff?: (vals: React.ReactNode[]) => boolean }[] = [
    {
      label: "Category",
      render: (p) => <span className="font-medium">{p.category}</span>,
      isDiff: (vals) => new Set(vals.map(String)).size > 1,
    },
    {
      label: "Rating",
      render: (p) => <StarRating rating={p.rating} />,
      isDiff: (vals) => new Set(vals.map(String)).size > 1,
    },
    {
      label: "Reviews",
      render: (p) => <span>{p.reviewCount} reviews</span>,
      isDiff: (vals) => new Set(vals.map(String)).size > 1,
    },
    {
      label: "Verified",
      render: (p) =>
        p.verified ? (
          <span className="flex items-center gap-1 text-green-600 font-semibold text-sm">✓ Yes</span>
        ) : (
          <span className="text-gray-400">No</span>
        ),
      isDiff: (vals) => new Set(vals.map(String)).size > 1,
    },
    {
      label: "Plan Tier",
      render: (p) => (
        <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
          p.plan === "premium" ? "bg-blue-50 text-blue-700 border border-blue-200" :
          p.plan === "free" ? "bg-green-50 text-green-700 border border-green-200" :
          p.plan === "pro" ? "bg-purple-50 text-purple-700 border border-purple-200" :
          "bg-orange-50 text-orange-700 border border-orange-200"
        }`}>{p.plan}</span>
      ),
      isDiff: (vals) => new Set(vals.map(String)).size > 1,
    },
    {
      label: "Suburb",
      render: (p) => <span>{p.suburb}</span>,
      isDiff: (vals) => new Set(vals.map(String)).size > 1,
    },
    {
      label: "Services",
      render: (p) => (
        <div className="flex flex-wrap gap-1">
          {allSelectedServices.map((s) => (
            <span
              key={s}
              className={`text-xs px-2 py-0.5 rounded-md border ${
                p.services.includes(s)
                  ? "bg-blue-50 border-blue-200 text-blue-700 font-medium"
                  : "bg-gray-50 border-gray-100 text-gray-300 line-through"
              }`}
            >
              {s}
            </span>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <span className="section-label mb-4 block">Compare</span>
          <h1 className="heading-bold text-4xl sm:text-5xl mb-3">
            Compare <span className="gradient-text">Providers</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-xl">
            Select up to 3 NDIS providers to compare side by side. Differences are highlighted automatically.
          </p>
        </motion.div>

        {/* Dropdowns */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
        >
          {[0, 1, 2].map((idx) => (
            <div key={idx} className="relative">
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                Provider {idx + 1}
              </label>
              <select
                value={selections[idx]}
                onChange={(e) => handleSelect(idx, e.target.value)}
                className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
              >
                <option value="">— Select a provider —</option>
                {providers.map((p) => (
                  <option
                    key={p.slug}
                    value={p.slug}
                    disabled={usedSlugs.includes(p.slug) && selections[idx] !== p.slug}
                  >
                    {p.name} ({p.suburb})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-[2.35rem] text-gray-400">▾</div>
            </div>
          ))}
        </motion.div>

        {/* Empty state */}
        {selectedProviders.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 rounded-2xl border border-dashed border-gray-200 bg-gray-50"
          >
            <div className="text-5xl mb-4">⚖️</div>
            <p className="text-gray-600 text-lg font-medium mb-2">No providers selected yet</p>
            <p className="text-gray-400 text-sm">Pick 2 or 3 providers from the dropdowns above to start comparing</p>
          </motion.div>
        )}

        {/* Single provider hint */}
        {selectedProviders.length === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 mb-8"
          >
            <p className="text-blue-600 text-sm font-medium">Select at least one more provider to compare</p>
          </motion.div>
        )}

        {/* MOBILE: Stacked Cards */}
        {selectedProviders.length >= 1 && (
          <AnimatePresence>
            <div className="grid grid-cols-1 gap-4 sm:hidden mb-8">
              {selections.map((slug, idx) => {
                const p = providers.find((pr) => pr.slug === slug);
                if (!p) return null;
                return (
                  <ProviderCard
                    key={p.slug}
                    provider={p}
                    onRemove={() => removeProvider(idx)}
                    allServices={allSelectedServices}
                  />
                );
              })}
            </div>
          </AnimatePresence>
        )}

        {/* DESKTOP: Side-by-side Table */}
        {selectedProviders.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="hidden sm:block rounded-2xl border border-gray-200 overflow-x-auto shadow-sm"
          >
            {/* Provider header row */}
            <div
              className="grid border-b border-gray-200 bg-gray-50"
              style={{ gridTemplateColumns: `220px repeat(${selectedProviders.length}, 1fr)` }}
            >
              <div className="p-5 border-r border-gray-200" />
              {selections.map((slug, idx) => {
                const p = providers.find((pr) => pr.slug === slug);
                if (!p) return <div key={idx} className="p-5 border-r border-gray-200 last:border-r-0" />;
                return (
                  <div key={p.slug} className="p-5 border-r border-gray-200 last:border-r-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/20 to-orange-500/20 border border-gray-200 flex items-center justify-center shrink-0">
                          <span className="text-lg font-black text-blue-600">{p.name[0]}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">{p.name}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{p.suburb}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeProvider(idx)}
                        className="text-gray-300 hover:text-gray-500 transition-colors p-1 min-w-[32px] min-h-[32px] flex items-center justify-center"
                      >✕</button>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/providers/${p.slug}`}
                        className="flex-1 text-center text-xs font-semibold py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        View Profile
                      </Link>
                      <Link
                        href={`/contact?provider=${p.slug}`}
                        className="flex-1 text-center text-xs font-semibold py-2 rounded-lg border border-gray-200 text-gray-700 hover:border-orange-400 hover:text-orange-600 transition-colors"
                      >
                        Enquire
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Data rows */}
            {rows.map((row, rowIdx) => {
              const vals = selectedProviders.map((p) => row.render(p));
              const hasDiff = row.isDiff ? row.isDiff(vals) : false;
              return (
                <div
                  key={row.label}
                  className={`grid border-b border-gray-200 last:border-b-0 ${hasDiff ? "bg-amber-50/40" : ""}`}
                  style={{ gridTemplateColumns: `220px repeat(${selectedProviders.length}, 1fr)` }}
                >
                  <div className="p-4 px-5 border-r border-gray-200 flex items-start gap-2">
                    <span className="text-sm font-semibold text-gray-600">{row.label}</span>
                    {hasDiff && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium shrink-0">diff</span>
                    )}
                  </div>
                  {selectedProviders.map((p, pIdx) => (
                    <div key={p.slug} className="p-4 px-5 border-r border-gray-200 last:border-r-0 text-sm text-gray-700">
                      {row.render(p)}
                    </div>
                  ))}
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Desktop single provider card */}
        {selectedProviders.length === 1 && (
          <div className="hidden sm:grid grid-cols-3 gap-4">
            {selections.map((slug, idx) => {
              const p = providers.find((pr) => pr.slug === slug);
              if (!p) return <div key={idx} />;
              return (
                <ProviderCard key={p.slug} provider={p} onRemove={() => removeProvider(idx)} allServices={allSelectedServices} />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
