'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { User, MessageSquare, Eye, Share2, Plus, X } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { getProviderByUserId } from '@/lib/supabase';
import { useEffect } from 'react';

const QUICK_ACTIONS = [
  { icon: User, label: 'Edit Profile', href: '/dashboard/profile', color: 'bg-blue-600 hover:bg-blue-500' },
  { icon: MessageSquare, label: 'View Enquiries', href: '/dashboard/enquiries', color: 'bg-orange-500 hover:bg-orange-400' },
  { icon: Eye, label: 'Preview Profile', href: null, action: 'preview', color: 'bg-green-600 hover:bg-green-500' },
  { icon: Share2, label: 'Share Profile', href: null, action: 'share', color: 'bg-purple-600 hover:bg-purple-500' },
];

export function DashboardFAB() {
  const [open, setOpen] = useState(false);
  const [providerSlug, setProviderSlug] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    getProviderByUserId(user.id).then((p) => {
      if (p?.slug) setProviderSlug(p.slug);
    }).catch(() => {});
  }, [user]);

  const handleAction = (action: typeof QUICK_ACTIONS[number]) => {
    setOpen(false);
    if (action.href) {
      router.push(action.href);
      return;
    }
    if (action.action === 'preview' && providerSlug) {
      window.open(`/providers/${providerSlug}`, '_blank');
    } else if (action.action === 'share') {
      const url = providerSlug
        ? `${window.location.origin}/providers/${providerSlug}`
        : window.location.origin;
      navigator.clipboard.writeText(url).then(() => {
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      }).catch(() => {});
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg mb-2"
          >
            Profile link copied!
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-2 items-end"
          >
            {QUICK_ACTIONS.map((action, i) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
                onClick={() => handleAction(action)}
                className={`flex items-center gap-2.5 pl-4 pr-5 py-2.5 rounded-full text-white text-sm font-medium shadow-lg transition-all ${action.color}`}
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.9 }}
        className="w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-500/30 flex items-center justify-center transition-colors"
        aria-label={open ? 'Close quick actions' : 'Open quick actions'}
      >
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center"
        >
          {open ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </motion.span>
      </motion.button>
    </div>
  );
}
