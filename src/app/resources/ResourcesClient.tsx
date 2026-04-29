"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { resourceCategories, glossaryTerms } from "@/data/resources";

const colorMap = {
  blue: {
    badge: "bg-blue-50 text-blue-600 border-blue-200",
    accent: "text-blue-400",
    dot: "bg-blue-400",
    tab: "bg-blue-600 text-white",
    tabHover: "hover:bg-blue-50 hover:text-blue-600",
  },
  orange: {
    badge: "bg-orange-50 text-orange-600 border-orange-200",
    accent: "text-orange-400",
    dot: "bg-orange-400",
    tab: "bg-orange-500 text-white",
    tabHover: "hover:bg-orange-50 hover:text-orange-600",
  },
  green: {
    badge: "bg-emerald-50 text-emerald-600 border-emerald-200",
    accent: "text-emerald-400",
    dot: "bg-emerald-400",
    tab: "bg-emerald-600 text-white",
    tabHover: "hover:bg-emerald-50 hover:text-emerald-600",
  },
  purple: {
    badge: "bg-purple-50 text-purple-600 border-purple-200",
    accent: "text-purple-400",
    dot: "bg-purple-400",
    tab: "bg-purple-600 text-white",
    tabHover: "hover:bg-purple-50 hover:text-purple-600",
  },
};

const badgeColors: Record<string, string> = {
  Essential: "bg-blue-50 text-blue-700 border border-blue-200",
  Important: "bg-red-50 text-red-700 border border-red-200",
  PDF: "bg-gray-100 text-gray-600 border border-gray-200",
};

export default function ResourcesClient() {
  const [activeTab, setActiveTab] = useState("participants");
  const [search, setSearch] = useState("");
  const [openGlossary, setOpenGlossary] = useState<string | null>(null);

  const tabs = [
    ...resourceCategories.map((c) => ({ id: c.id, label: c.label, color: c.color })),
    { id: "glossary", label: "Glossary", color: "purple" as const },
  ];

  const activeCategory = resourceCategories.find((c) => c.id === activeTab);

  const filteredResources = useMemo(() => {
    if (!activeCategory) return [];
    const q = search.toLowerCase();
    if (!q) return activeCategory.resources;
    return activeCategory.resources.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
  }, [activeCategory, search]);

  const filteredGlossary = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return glossaryTerms;
    return glossaryTerms.filter(
      (g) =>
        g.term.toLowerCase().includes(q) ||
        (g.acronym && g.acronym.toLowerCase().includes(q)) ||
        g.definition.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero */}
      <section className="px-4 sm:px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-xs font-semibold tracking-widest uppercase text-blue-400 mb-4 block">
              Resource Hub
            </span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.05] mb-6">
              NDIS Resources &amp;{" "}
              <span className="gradient-text">Guides</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
              Essential information for NDIS participants and providers. Official links, forms, and a plain-English glossary of NDIS terms.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search + Tabs */}
      <section className="px-4 sm:px-6 pb-10">
        <div className="max-w-5xl mx-auto">
          {/* Search */}
          <div className="relative mb-6 max-w-lg">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              placeholder="Search resources, terms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Tab bar */}
          <div className="flex flex-wrap gap-2 mb-8">
            {tabs.map((tab) => {
              const colors = colorMap[tab.color];
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    isActive
                      ? `${colors.tab} border-transparent shadow-sm`
                      : `bg-white border-gray-200 text-gray-600 ${colors.tabHover}`
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Resource Cards */}
          {activeTab !== "glossary" && activeCategory && (
            <div>
              {filteredResources.length === 0 ? (
                <p className="text-gray-400 text-sm py-8 text-center">No resources match your search.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {filteredResources.map((resource, i) => {
                    const colors = colorMap[activeCategory.color];
                    return (
                      <motion.a
                        key={resource.title}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="group rounded-2xl bg-white border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all flex flex-col gap-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${colors.dot}`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                                {resource.title}
                              </h3>
                              {resource.badge && (
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColors[resource.badge] ?? "bg-gray-100 text-gray-600"}`}>
                                  {resource.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed">{resource.description}</p>
                          </div>
                        </div>
                        <div className={`text-xs font-semibold flex items-center gap-1 ${colors.accent} mt-auto`}>
                          <span>View on NDIS/Commission</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path d="M7 17L17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </motion.a>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Glossary */}
          {activeTab === "glossary" && (
            <div>
              <p className="text-sm text-gray-500 mb-6">
                {filteredGlossary.length} term{filteredGlossary.length !== 1 ? "s" : ""} — click to expand
              </p>
              {filteredGlossary.length === 0 ? (
                <p className="text-gray-400 text-sm py-8 text-center">No terms match your search.</p>
              ) : (
                <div className="space-y-2">
                  {filteredGlossary.map((item, i) => {
                    const isOpen = openGlossary === item.term;
                    return (
                      <motion.div
                        key={item.term}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="rounded-xl border border-gray-200 bg-white overflow-hidden"
                      >
                        <button
                          onClick={() => setOpenGlossary(isOpen ? null : item.term)}
                          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {item.acronym && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 border border-purple-200 shrink-0">
                                {item.acronym}
                              </span>
                            )}
                            <span className="font-semibold text-gray-900 text-sm">{item.term}</span>
                          </div>
                          <svg
                            className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}
                            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                          >
                            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                                {item.definition}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <p className="text-xs text-gray-500 leading-relaxed">
              <strong className="text-gray-700">Disclaimer:</strong> The resources on this page link to official Australian Government and NDIS Commission websites. ReferAus does not provide legal or financial advice. For personalised NDIS support, contact the{" "}
              <a href="https://www.ndis.gov.au/contact" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">NDIA directly</a>{" "}
              or speak with a registered{" "}
              <Link href="/providers" className="text-blue-500 hover:underline">Support Coordinator</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 py-10 bg-surface/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-black tracking-tight mb-3">
            Need help finding an <span className="gradient-text">NDIS provider?</span>
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Search verified NDIS providers in your area, read real reviews, and connect with the right support.
          </p>
          <Link
            href="/providers"
            className="inline-flex px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-blue-600/25"
          >
            Browse Providers
          </Link>
        </div>
      </section>
    </div>
  );
}
