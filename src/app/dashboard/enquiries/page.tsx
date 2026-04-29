'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  MessageSquare, Phone, Mail, Calendar, Check, Loader2, AlertCircle, Eye, Download, Clipboard,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import {
  getProviderByUserId,
  getProviderEnquiries,
  markEnquiryRead,
} from '@/lib/supabase';

const REPLY_TEMPLATES = [
  "Thanks for reaching out! I'll get back to you within 24 hours.",
  "I'd love to help. What times work for a phone call?",
  "Thanks for your enquiry. Unfortunately we're fully booked at the moment.",
];

function ReplyTemplates() {
  const [toast, setToast] = useState<string | null>(null);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast('Copied to clipboard!');
      setTimeout(() => setToast(null), 2500);
    } catch {
      setToast('Copy failed — please copy manually.');
      setTimeout(() => setToast(null), 2500);
    }
  };

  return (
    <div className="relative">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick Reply Templates</p>
      <div className="flex flex-wrap gap-2">
        {REPLY_TEMPLATES.map((template) => (
          <button
            key={template}
            onClick={() => handleCopy(template)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100 hover:bg-blue-100 transition-colors max-w-[280px] text-left"
          >
            <Clipboard className="w-3 h-3 shrink-0" />
            <span className="truncate">{template}</span>
          </button>
        ))}
      </div>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute left-0 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function exportEnquiriesToCSV(enquiries: EnquiryRecord[]) {
  const headers = ['Name', 'Email', 'Phone', 'Service', 'Message', 'Date'];
  const rows = enquiries.map((e) => [
    e.name || '',
    e.email || '',
    e.phone || '',
    e.service || 'General',
    (e.message || '').replace(/"/g, '""'),
    e.created_at ? new Date(e.created_at).toLocaleDateString() : '',
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `enquiries-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EnquiryRecord = Record<string, any>;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;
}

export default function EnquiriesPage() {
  const { user, loading: authLoading } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [provider, setProvider] = useState<Record<string, any> | null>(null);
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const p = await getProviderByUserId(user.id);
    setProvider(p);
    if (p?.slug) {
      const enq = await getProviderEnquiries(p.slug);
      setEnquiries(enq);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) fetchData();
  }, [authLoading, fetchData]);

  const handleMarkRead = async (id: string) => {
    setMarkingRead(id);
    const result = await markEnquiryRead(id);
    if (result.success) {
      setEnquiries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, read: true } : e)),
      );
    }
    setMarkingRead(null);
  };

  const unreadCount = enquiries.filter((e) => !e.read).length;

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!provider) {
    return (
      <motion.div {...fadeUp(0)} className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
        <AlertCircle className="w-10 h-10 text-orange-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Provider Profile Found</h2>
        <p className="text-sm text-gray-500 mb-4">Set up your profile first to receive enquiries.</p>
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
            Enquiries
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {enquiries.length} total enquirie{enquiries.length !== 1 ? 's' : ''}
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold border border-orange-200">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {enquiries.length > 0 && (
            <button
              onClick={() => exportEnquiriesToCSV(enquiries)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </motion.div>

      {/* Reply Templates */}
      {enquiries.length > 0 && (
        <motion.div {...fadeUp(0.05)} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <ReplyTemplates />
        </motion.div>
      )}

      {/* Empty state */}
      {enquiries.length === 0 ? (
        <motion.div {...fadeUp(0.1)} className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">No Enquiries Yet</h2>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            When participants send you enquiries through your listing, they will appear here.
          </p>
        </motion.div>
      ) : (
        <>
          {/* Desktop table */}
          <motion.div {...fadeUp(0.1)} className="hidden sm:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Participant</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Phone</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Service</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Message</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {enquiries.map((e, i) => (
                    <motion.tr
                      key={e.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.05 * i }}
                      className={`hover:bg-gray-50/50 transition-colors group ${!e.read ? 'bg-orange-50/30' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            !e.read ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {(e.name || '?').charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{e.name}</p>
                            <p className="text-xs text-gray-400">{e.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        {e.phone ? (
                          <a href={`tel:${e.phone}`} className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline">
                            <Phone className="w-3 h-3" /> {e.phone}
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">--</span>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                          {e.service || 'General'}
                        </span>
                      </td>
                      <td className="px-3 py-4 max-w-[220px]">
                        <p className="text-xs text-gray-500 line-clamp-2">{e.message}</p>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {e.created_at ? new Date(e.created_at).toLocaleDateString() : ''}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        {e.read ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            Read
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            New
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex gap-2">
                          {!e.read && (
                            <button
                              onClick={() => handleMarkRead(e.id)}
                              disabled={markingRead === e.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors disabled:opacity-60"
                            >
                              {markingRead === e.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                              Mark read
                            </button>
                          )}
                          <a href={`mailto:${e.email}`} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {enquiries.map((e, i) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.35 }}
                className={`bg-white rounded-2xl border shadow-sm p-4 space-y-3 ${
                  !e.read ? 'border-orange-200 bg-orange-50/30' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      !e.read ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {(e.name || '?').charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{e.name}</p>
                      <p className="text-xs text-gray-400">{e.email}</p>
                    </div>
                  </div>
                  {!e.read ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      New
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      Read
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                    {e.service || 'General'}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {e.created_at ? new Date(e.created_at).toLocaleDateString() : ''}
                  </span>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed">{e.message}</p>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex gap-2">
                    {e.phone && (
                      <a href={`tel:${e.phone}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors">
                        <Phone className="w-3 h-3" /> Call
                      </a>
                    )}
                    <a href={`mailto:${e.email}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors">
                      <Mail className="w-3 h-3" /> Email
                    </a>
                  </div>
                  {!e.read && (
                    <button
                      onClick={() => handleMarkRead(e.id)}
                      disabled={markingRead === e.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-xs font-medium hover:bg-green-100 transition-colors disabled:opacity-60"
                    >
                      {markingRead === e.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                      Mark read
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
