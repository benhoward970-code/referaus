"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { blogPosts, categories } from "@/data/blog-posts";

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = blogPosts.filter(post => {
    const matchesCat = activeCategory === "All" || post.category === activeCategory;
    const matchesSearch = search.trim() === "" || 
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const featured = filtered.slice(0, 2);
  const rest = filtered.slice(2);

  return (
    <div className="min-h-screen pt-28 pb-14 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-orange-400 mb-4 block">Resources</span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Guides & <span className="gradient-text">Resources</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl">Practical guides to help you navigate the NDIS with confidence.</p>
        </motion.div>

        {/* Search + Filters */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-14 text-gray-400">
            <p className="text-lg font-medium">No articles found</p>
            <p className="text-sm mt-1">Try a different search or category</p>
          </div>
        )}

        {/* Featured posts */}
        {featured.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {featured.map((post, i) => (
              <motion.div key={post.slug} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Link href={`/blog/${post.slug}`} className="block group rounded-2xl bg-white border border-gray-200 p-5 sm:p-8 h-full transition-all duration-300 hover:border-blue-500/40 hover:shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">{post.category}</span>
                    <span className="text-xs text-gray-400">{post.date}</span>
                  </div>
                  <h2 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors leading-snug">{post.title}</h2>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{post.readTime}</span>
                    <span className="text-xs font-medium text-blue-600 group-hover:underline">Read more →</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Other posts */}
        {rest.length > 0 && (
          <div className="space-y-4">
            {rest.map((post, i) => (
              <motion.div key={post.slug} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
                <Link href={`/blog/${post.slug}`} className="block group rounded-2xl bg-white border border-gray-200 p-6 transition-all duration-300 hover:border-blue-500/40 hover:shadow-md flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{post.category}</span>
                      <span className="text-xs text-gray-400">{post.date}</span>
                    </div>
                    <h3 className="text-base font-bold group-hover:text-blue-600 transition-colors">{post.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 hidden sm:block">{post.excerpt}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-xs text-gray-400">{post.readTime}</span>
                    <span className="text-xs font-medium text-blue-600 group-hover:underline hidden sm:block">Read →</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Newsletter CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-20">
          <div className="rounded-2xl bg-blue-600/[0.06] border border-blue-500/20 p-5 sm:p-10 text-center">
            <h3 className="text-2xl font-bold mb-2">Stay in the loop</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">Get NDIS tips, provider updates, and platform news delivered to your inbox. No spam, unsubscribe anytime.</p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={e => { e.preventDefault(); (e.target as HTMLFormElement).reset(); alert("Subscribed!"); }}>
              <input type="email" name="email" required placeholder="your@email.com" className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-blue-500/40" />
              <button type="submit" className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shrink-0">Subscribe</button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
