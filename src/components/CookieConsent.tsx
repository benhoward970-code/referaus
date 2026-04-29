'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('referaus-cookie-consent');
    if (!consent) setTimeout(() => setShow(true), 2000);
  }, []);

  const accept = () => {
    localStorage.setItem('referaus-cookie-consent', 'accepted');
    window.dispatchEvent(new Event('storage'));
    setShow(false);
  };
  const decline = () => { localStorage.setItem('referaus-cookie-consent', 'declined'); setShow(false); };

  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-0 left-0 right-0 z-50 p-4">
          <div className="max-w-4xl mx-auto bg-gray-900 text-white rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-2xl">
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">We use cookies</p>
              <p className="text-xs text-gray-400">We use cookies to improve your experience and analyse site traffic. See our <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link> for details. <Link href="/cookie-preferences" className="text-blue-400 hover:underline">Manage preferences</Link>.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={decline} className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white transition-colors">Decline</button>
              <button onClick={accept} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all">Accept</button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
