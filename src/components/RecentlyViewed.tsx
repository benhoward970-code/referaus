'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export interface RecentProvider {
  slug: string;
  name: string;
  category: string;
}

const KEY = 'referaus-recently-viewed';
const MAX = 5;

export function saveRecentlyViewed(provider: RecentProvider) {
  if (typeof window === 'undefined') return;
  try {
    const existing: RecentProvider[] = JSON.parse(localStorage.getItem(KEY) || '[]');
    const filtered = existing.filter(p => p.slug !== provider.slug);
    const updated = [provider, ...filtered].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch { /* ignore */ }
}

export function getRecentlyViewed(): RecentProvider[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch { return []; }
}

export function RecentlyViewed({ currentSlug }: { currentSlug?: string }) {
  const [recent, setRecent] = useState<RecentProvider[]>([]);

  useEffect(() => {
    const all = getRecentlyViewed();
    setRecent(currentSlug ? all.filter(p => p.slug !== currentSlug) : all);
  }, [currentSlug]);

  if (recent.length === 0) return null;

  return (
    <section className="mt-10 pt-8 border-t border-gray-100">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Recently Viewed</h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {recent.map(p => (
          <Link
            key={p.slug}
            href={`/providers/${p.slug}`}
            className="shrink-0 flex flex-col gap-1 px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all min-w-[150px] max-w-[180px]"
          >
            <span className="text-sm font-semibold text-gray-800 truncate">{p.name}</span>
            <span className="text-xs text-orange-500 truncate">{p.category}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
