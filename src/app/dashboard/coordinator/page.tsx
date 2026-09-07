'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Link2, Users, MessageSquare, Building2, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

interface CoordinatorData {
  coordinator: {
    name: string;
    email: string | null;
    organisation: string | null;
    referralSlug: string;
    memberSince: string;
  };
  stats: { visits: number; enquiries: number; providersContacted: number };
  topProviders: { name: string; slug: string | null; count: number }[];
  recent: { event_type: string; provider_name: string | null; provider_slug: string | null; created_at: string }[];
}

function StatCard({ icon, value, label, hint }: { icon: React.ReactNode; value: number; label: string; hint: string }) {
  return (
    <div className="card-flat p-6">
      <div className="flex items-center gap-2 text-blue-600 mb-3">{icon}</div>
      <div className="font-mono text-[32px] font-medium leading-none text-ink-900">{value}</div>
      <div className="text-sm font-semibold text-ink-900 mt-2">{label}</div>
      <p className="text-xs text-ink-500 mt-1 leading-relaxed">{hint}</p>
    </div>
  );
}

function ReferralLinkCard({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const link = `https://referaus.com/ref/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard can be blocked — the link is visible and selectable anyway.
    }
  };

  return (
    <div className="card-flat p-6 mb-8">
      <div className="flex items-center gap-2 mb-2">
        <Link2 className="w-4 h-4 text-orange-500" />
        <h2 className="text-sm font-bold text-ink-900">Your referral link</h2>
      </div>
      <p className="text-sm text-ink-500 mb-4 leading-relaxed">
        Share this with your clients. It opens the provider directory, and anyone who
        contacts a provider after following it shows up below.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <code className="flex-1 px-4 py-3 rounded-[3px] border border-ink-950 bg-white text-sm font-mono text-ink-900 break-all">
          {link}
        </code>
        <button
          onClick={handleCopy}
          className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-[3px] bg-orange-500 hover:bg-orange-400 text-ink-950 font-bold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
          aria-label="Copy referral link"
        >
          {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy link</>}
        </button>
      </div>
    </div>
  );
}

export default function CoordinatorDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<CoordinatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase) { setError('Not configured'); setLoading(false); return; }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/coordinator', {
        headers: { ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}) },
      });
      if (res.status === 403) { setError('not-coordinator'); setLoading(false); return; }
      if (!res.ok) { setError('Could not load your referral activity.'); setLoading(false); return; }
      setData(await res.json());
    } catch {
      setError('Could not load your referral activity.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    load();
  }, [user, authLoading, load]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <h1 className="h-editorial text-2xl mb-3">Sign in to continue</h1>
          <p className="text-sm text-ink-500 mb-6">This page is for Support Coordinators.</p>
          <Link href="/login" className="btn-block !inline-flex">Log in</Link>
        </div>
      </div>
    );
  }

  if (error === 'not-coordinator') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-8 h-8 text-ink-400 mx-auto mb-4" />
          <h1 className="h-editorial text-2xl mb-3">This is a coordinator page</h1>
          <p className="text-sm text-ink-500 mb-6 leading-relaxed">
            Your account isn&apos;t registered as a Support Coordinator. Create a free
            coordinator account to get your own referral link.
          </p>
          <Link href="/register?role=coordinator" className="btn-block !inline-flex">Create a coordinator account</Link>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-8 h-8 text-ink-400 mx-auto mb-4" />
          <p className="text-sm text-ink-500">{error || 'Something went wrong.'}</p>
        </div>
      </div>
    );
  }

  const { coordinator, stats, topProviders, recent } = data;
  const nothingYet = stats.visits === 0 && stats.enquiries === 0;

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="eyebrow-rule text-orange-500 mb-3">Support Coordinator</div>
          <h1 className="h-editorial text-3xl sm:text-4xl mb-2">
            Hello, <em>{coordinator.name}.</em>
          </h1>
          <p className="text-ink-500">Track the clients you send to ReferAus and who they connect with.</p>
        </motion.div>

        <ReferralLinkCard slug={coordinator.referralSlug} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={<Users className="w-5 h-5" />}
            value={stats.visits}
            label="Link opens"
            hint="Times someone followed your link into the directory."
          />
          <StatCard
            icon={<MessageSquare className="w-5 h-5" />}
            value={stats.enquiries}
            label="Providers contacted"
            hint="Enquiries sent after following your link."
          />
          <StatCard
            icon={<Building2 className="w-5 h-5" />}
            value={stats.providersContacted}
            label="Different providers"
            hint="How many distinct providers your clients reached."
          />
        </div>

        {nothingYet ? (
          <div className="card-flat p-10 text-center">
            <Link2 className="w-8 h-8 text-ink-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-ink-900 mb-2">No activity yet</h2>
            <p className="text-sm text-ink-500 max-w-md mx-auto leading-relaxed">
              Once you share your link and a client follows it, their visits and the
              providers they contact will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-flat p-6">
              <h2 className="text-sm font-bold text-ink-900 mb-1">Most contacted providers</h2>
              <p className="text-xs text-ink-500 mb-5">Where your referrals are going.</p>
              {topProviders.length === 0 ? (
                <p className="text-sm text-ink-400">No provider contacts yet.</p>
              ) : (
                <ul className="divide-y divide-line-100">
                  {topProviders.map((p) => (
                    <li key={p.slug || p.name} className="flex items-center justify-between py-3">
                      <span className="text-sm text-ink-700">
                        {p.slug ? (
                          <Link href={`/providers/${p.slug}`} className="hover:text-blue-600 transition-colors">{p.name}</Link>
                        ) : p.name}
                      </span>
                      <span className="font-mono text-xs text-ink-500">
                        {p.count} {p.count === 1 ? 'enquiry' : 'enquiries'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card-flat p-6">
              <h2 className="text-sm font-bold text-ink-900 mb-1">Recent activity</h2>
              <p className="text-xs text-ink-500 mb-5">Your client details stay private — only the provider is shown.</p>
              <ul className="divide-y divide-line-100">
                {recent.map((e, i) => (
                  <li key={i} className="flex items-center justify-between py-3 gap-4">
                    <span className="text-sm text-ink-700">
                      {e.event_type === 'visit'
                        ? 'Someone opened your link'
                        : <>Contacted <strong className="font-semibold">{e.provider_name || 'a provider'}</strong></>}
                    </span>
                    <span className="font-mono text-[11px] text-ink-400 shrink-0">
                      {new Date(e.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
