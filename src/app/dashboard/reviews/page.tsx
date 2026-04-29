'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Star, User, AlertCircle } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { getProviderByUserId, getProviderReviews } from '@/lib/supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReviewRecord = Record<string, any>;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-4 h-4 ${n <= rating ? 'fill-orange-400 text-orange-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  );
}

function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-6 text-right">{stars}</span>
      <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-orange-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 w-6">{count}</span>
    </div>
  );
}

export default function ReviewsPage() {
  const { user, loading: authLoading } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [provider, setProvider] = useState<Record<string, any> | null>(null);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const p = await getProviderByUserId(user.id);
    setProvider(p);
    if (p?.slug) {
      const rev = await getProviderReviews(p.slug);
      setReviews(rev);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) fetchData();
  }, [authLoading, fetchData]);

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : 0;

  const ratingDist = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }));

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-36 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          <Skeleton className="h-48 rounded-2xl" />
          <div className="sm:col-span-2 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <motion.div {...fadeUp(0)} className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
        <AlertCircle className="w-10 h-10 text-orange-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Provider Profile Found</h2>
        <p className="text-sm text-gray-500 mb-4">Set up your profile first to receive reviews.</p>
        <Link href="/dashboard/profile" className="text-sm text-blue-600 hover:underline">Set Up Profile</Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: "'Oswald'" }}>
            Reviews
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {reviews.length} review{reviews.length !== 1 ? 's' : ''} from participants
          </p>
        </div>
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </motion.div>

      {/* Empty state */}
      {reviews.length === 0 ? (
        <motion.div {...fadeUp(0.1)} className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">No Reviews Yet</h2>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            When participants leave reviews on your listing, they will appear here. Ask your clients to share their experience.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary card */}
          <motion.div {...fadeUp(0.05)} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm lg:sticky lg:top-24 self-start">
            <div className="text-center mb-5">
              <p className="text-5xl font-black text-gray-900">{avgRating.toFixed(1)}</p>
              <div className="flex justify-center mt-2">
                <Stars rating={Math.round(avgRating)} />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="space-y-2">
              {ratingDist.map((d) => (
                <RatingBar key={d.stars} stars={d.stars} count={d.count} total={reviews.length} />
              ))}
            </div>
          </motion.div>

          {/* Review cards */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.map((r, i) => (
              <motion.div
                key={r.id || i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {r.author || r.reviewer_name || 'Anonymous'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString('en-AU', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        }) : ''}
                      </p>
                    </div>
                  </div>
                  <Stars rating={r.rating || 0} />
                </div>
                {r.service && (
                  <span className="inline-block text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg mb-2">
                    {r.service}
                  </span>
                )}
                <p className="text-sm text-gray-600 leading-relaxed">
                  &ldquo;{r.text || r.comment || r.review || ''}&rdquo;
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
