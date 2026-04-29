"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import type { BlogPost } from "@/data/blog-posts";

interface Props {
  post: BlogPost;
  related: BlogPost[];
}

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

function extractToc(content: string): TocItem[] {
  const lines = content.split("\n");
  const items: TocItem[] = [];
  for (const line of lines) {
    if (line.startsWith("## ")) {
      items.push({ id: slugify(line.slice(3)), text: line.slice(3), level: 2 });
    } else if (line.startsWith("### ")) {
      items.push({ id: slugify(line.slice(4)), text: line.slice(4), level: 3 });
    }
  }
  return items;
}

function TableOfContents({ items, activeId }: { items: TocItem[]; activeId: string }) {
  if (items.length === 0) return null;
  return (
    <nav className="space-y-1">
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={`block text-sm leading-snug transition-colors py-1 ${
            item.level === 3 ? "pl-4" : ""
          } ${
            activeId === item.id
              ? "text-blue-600 font-semibold border-l-2 border-blue-600 pl-3"
              : "text-gray-500 hover:text-gray-800 border-l-2 border-transparent pl-3"
          }`}
        >
          {item.text}
        </a>
      ))}
    </nav>
  );
}

function ContentFreshnessIndicator({ date }: { date: string }) {
  // Parse date string like "11 Mar 2026" or "2026-03-11"
  const postDate = new Date(date);
  if (isNaN(postDate.getTime())) return null;
  const now = new Date();
  const diffMs = now.getTime() - postDate.getTime();
  const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
  if (diffMonths < 6) return null;
  return (
    <div className="mt-4 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
      <span className="text-amber-500 shrink-0 mt-0.5">⚠</span>
      <span>
        This article was published {diffMonths} month{diffMonths !== 1 ? "s" : ""} ago. Some information may have changed.
      </span>
    </div>
  );
}

function parseContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("### ")) {
      const text = line.slice(4);
      const id = slugify(text);
      elements.push(<h3 id={id} key={i} className="text-xl font-bold mt-8 mb-3 text-gray-900 scroll-mt-24">{text}</h3>);
    } else if (line.startsWith("## ")) {
      const text = line.slice(3);
      const id = slugify(text);
      elements.push(<h2 id={id} key={i} className="text-2xl font-bold mt-10 mb-4 text-gray-900 scroll-mt-24">{text}</h2>);
    } else if (line.startsWith("# ")) {
      elements.push(<h1 key={i} className="text-3xl font-black mt-10 mb-4 text-gray-900">{line.slice(2)}</h1>);
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(<ul key={"ul-" + i} className="my-4 space-y-1">{items.map((item, j) => <li key={j} className="ml-4 text-gray-700 list-disc list-inside">{formatInline(item)}</li>)}</ul>);
      continue;
    } else if (/^\d+\./.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\./.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s*/, ""));
        i++;
      }
      elements.push(<ol key={"ol-" + i} className="my-4 space-y-1 list-decimal list-inside">{items.map((item, j) => <li key={j} className="ml-4 text-gray-700">{formatInline(item)}</li>)}</ol>);
      continue;
    } else if (line.startsWith("| ")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        if (!lines[i].match(/^\|[-| ]+\|$/)) {
          rows.push(lines[i].split("|").filter(c => c.trim() !== "").map(c => c.trim()));
        }
        i++;
      }
      if (rows.length > 0) {
        elements.push(
          <div key={"table-" + i} className="overflow-x-auto my-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {rows[0].map((cell, j) => <th key={j} className="px-4 py-2 text-left font-semibold text-gray-700 border border-gray-200">{cell}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.slice(1).map((row, ri) => (
                  <tr key={ri} className="even:bg-gray-50">
                    {row.map((cell, ci) => <td key={ci} className="px-4 py-2 text-gray-600 border border-gray-200">{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    } else if (line.trim() !== "") {
      elements.push(<p key={i} className="mb-4 text-gray-700 leading-relaxed">{formatInline(line)}</p>);
    }
    i++;
  }
  return elements;
}

function formatInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// Item 74: Author Bio Card
function AuthorBio() {
  return (
    <div className="mt-10 pt-8 border-t border-gray-200">
      <div className="flex items-start gap-4 p-5 bg-blue-50 border border-blue-100 rounded-2xl">
        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-black shrink-0 select-none">
          R
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 mb-1">ReferAus Team</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            The ReferAus team is dedicated to connecting NDIS participants with trusted providers in the Hunter Region.
          </p>
        </div>
      </div>
    </div>
  );
}

// Item 79: Related Resources box — internal links based on post content/tags
type ResourceLink = { label: string; href: string; desc: string };

function getRelatedResources(post: BlogPost): ResourceLink[] {
  const resources: ResourceLink[] = [];
  const text = (post.content + " " + post.title + " " + post.excerpt).toLowerCase();

  if (text.includes("finding a provider") || text.includes("search for") || text.includes("provider directory") || text.includes("browse") || post.tags.includes("providers") || post.tags.includes("search")) {
    resources.push({ label: "Find NDIS Providers", href: "/providers", desc: "Browse verified NDIS providers in the Hunter Region." });
  }
  if (text.includes("pricing") || text.includes("price guide") || text.includes("rates") || text.includes("fee") || post.tags.includes("rates") || post.tags.includes("price guide") || post.tags.includes("funding")) {
    resources.push({ label: "NDIS Pricing Information", href: "/pricing", desc: "View ReferAus plan options and provider listing fees." });
  }
  if (text.includes("register") || text.includes("list your") || text.includes("provider registration") || post.category === "Provider Tips") {
    resources.push({ label: "List Your Organisation", href: "/register", desc: "Register as an NDIS provider on ReferAus for free." });
  }
  if (text.includes("support coordination") || text.includes("support coordinator")) {
    resources.push({ label: "Browse Support Coordinators", href: "/providers?category=Support+Coordination", desc: "Find support coordinators in the Hunter Region." });
  }
  if (text.includes("plan management") || text.includes("plan manager")) {
    resources.push({ label: "Find Plan Managers", href: "/providers?category=Plan+Management", desc: "Compare plan managers available near you." });
  }
  if (resources.length === 0) {
    resources.push({ label: "Find NDIS Providers", href: "/providers", desc: "Browse verified providers in the Hunter Region." });
    resources.push({ label: "For Participants", href: "/for-participants", desc: "Learn how ReferAus helps NDIS participants." });
  }
  return resources.slice(0, 3);
}

function RelatedResources({ post }: { post: BlogPost }) {
  const links = getRelatedResources(post);
  return (
    <div className="mt-10 p-5 bg-gray-50 border border-gray-200 rounded-2xl">
      <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-blue-500">
          <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        Related Resources
      </h3>
      <div className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all group"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-blue-500 mt-0.5 shrink-0 group-hover:text-blue-600 transition-colors">
              <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors leading-snug">{link.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{link.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function BlogPostClient({ post, related }: Props) {
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const tocItems = extractToc(post.content);
  const [activeId, setActiveId] = useState("");
  const [tocOpen, setTocOpen] = useState(false);
  const articleRef = useRef<HTMLElement>(null);

  // Highlight current section on scroll
  useEffect(() => {
    if (tocItems.length === 0) return;
    const headings = tocItems.map(({ id }) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );
    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [tocItems]);

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(shareUrl || "https://referaus.com/blog/" + post.slug);
    const text = encodeURIComponent(post.title);
    const links: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`,
    };
    if (links[platform]) window.open(links[platform], "_blank", "width=600,height=400");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl || "https://referaus.com/blog/" + post.slug);
      alert("Link copied!");
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link href="/blog" className="text-sm text-gray-400 hover:text-blue-600 transition-colors">
            ← Back to Resources
          </Link>
        </motion.div>

        <div className="flex gap-10">
          {/* Sticky TOC sidebar - desktop */}
          {tocItems.length > 0 && (
            <aside className="hidden lg:block w-56 shrink-0">
              <div className="sticky top-24">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">On this page</p>
                <TableOfContents items={tocItems} activeId={activeId} />
              </div>
            </aside>
          )}

          <div className="flex-1 min-w-0">
            {/* Mobile TOC collapsible */}
            {tocItems.length > 0 && (
              <div className="lg:hidden mb-6 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setTocOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700"
                >
                  <span className="flex items-center gap-2">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M4 6h16M4 12h8M4 18h12" />
                    </svg>
                    Table of Contents
                  </span>
                  <svg
                    width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                    className={`transition-transform ${tocOpen ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <AnimatePresence>
                  {tocOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-2 border-t border-gray-200">
                        <TableOfContents items={tocItems} activeId={activeId} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-10">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">{post.category}</span>
                <span className="text-xs text-gray-400">{post.date}</span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-400">{post.readTime}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 mb-4 leading-tight">{post.title}</h1>
              <p className="text-lg text-gray-500 leading-relaxed mb-6">{post.excerpt}</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">R</div>
                <span className="text-sm font-medium text-gray-700">{post.author}</span>
              </div>
              <ContentFreshnessIndicator date={post.date} />
            </motion.div>

            <motion.article ref={articleRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
              {parseContent(post.content)}
            </motion.article>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mt-10 flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
                  #{tag}
                </span>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-10 pt-8 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-4">Share this article</p>
              <div className="flex items-center gap-3 flex-wrap">
                <button onClick={() => handleShare("twitter")} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 text-xs font-medium transition-all">
                  Twitter / X
                </button>
                <button onClick={() => handleShare("linkedin")} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 text-xs font-medium transition-all">
                  LinkedIn
                </button>
                <button onClick={() => handleShare("facebook")} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 text-xs font-medium transition-all">
                  Facebook
                </button>
                <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium transition-all">
                  Copy link
                </button>
              </div>
            </motion.div>

            {related.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Related Articles</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {related.map(rel => (
                    <Link key={rel.slug} href={"/blog/" + rel.slug} className="block group rounded-xl bg-white border border-gray-200 p-5 hover:border-blue-500/40 hover:shadow-md transition-all">
                      <span className="text-xs font-medium text-blue-600 mb-2 block">{rel.category}</span>
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug mb-2">{rel.title}</h3>
                      <span className="text-xs text-gray-400">{rel.readTime}</span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Item 79: Related Resources box */}
            <RelatedResources post={post} />

            {/* Item 74: Author bio card */}
            <AuthorBio />

            <div className="mt-12 pt-8 border-t border-gray-200">
              <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline">
                ← View all articles
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
