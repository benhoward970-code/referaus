import { MetadataRoute } from "next";
// providers loaded from DB only
import { blogPosts } from "@/data/blog-posts";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zfhapnnlxfhxsqpqcuje.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://referaus.com";

  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/providers`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/for-participants`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/for-providers`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/for-coordinators`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/resources`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/registered-providers`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/compare`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/testimonial`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/cookie-preferences`, lastModified: now, changeFrequency: "yearly", priority: 0.1 },
  ];

  const allSlugs = new Set<string>();

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/providers?select=slug`, {
      headers: { apikey: SUPABASE_KEY.trim(), Authorization: `Bearer ${SUPABASE_KEY.trim()}` },
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const dbProviders = await res.json();
      dbProviders.forEach((p: { slug: string }) => allSlugs.add(p.slug));
    }
  } catch {
    // No providers yet
  }

  const providerRoutes: MetadataRoute.Sitemap = Array.from(allSlugs).map((slug) => ({
    url: `${base}/providers/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...providerRoutes, ...blogRoutes];
}
