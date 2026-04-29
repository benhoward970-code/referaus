'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';

const faqs = [
  { q: 'Is ReferAus free for NDIS participants?', a: 'Yes, completely free. Searching, comparing, and contacting providers costs nothing for participants. We are funded by provider subscriptions.' },
  { q: 'How do I list my NDIS provider business?', a: 'Click "List Your Business" in the top navigation or go to our register page. The free listing takes about 2 minutes to set up. You can upgrade to a paid plan anytime for more features.' },
  { q: 'Do providers need to be NDIS registered?', a: 'No. Both registered and unregistered NDIS providers can list on ReferAus. We clearly indicate registration status so participants can make informed choices.' },
  { q: 'How are providers verified?', a: 'Verified providers have confirmed their ABN, NDIS registration status, and contact details with our team. We check against the NDIS Provider Register and ABN Lookup.' },
  { q: 'Can I leave a review for a provider?', a: 'Yes. After receiving services from a provider listed on ReferAus, you can leave a review with a star rating and written feedback. All reviews are moderated for quality.' },
  { q: 'What areas does ReferAus cover?', a: 'We currently focus on the Hunter Region including Newcastle, Lake Macquarie, Maitland, Cessnock, Port Stephens, and surrounding areas. We plan to expand across NSW and then nationally.' },
  { q: 'How much does a provider listing cost?', a: 'We offer four tiers: Free ($0 forever), Starter ($29/mo), Professional ($79/mo), and Premium ($149/mo). The free tier includes a basic listing and enquiry notifications. Paid plans add features like verified badges, analytics, and priority search ranking.' },
  { q: 'Can I compare providers side by side?', a: 'Yes. Our Compare tool lets you select up to 3 providers and compare them across services, ratings, verification status, and location.' },
  { q: 'How do I contact a provider?', a: 'Each provider profile has a contact form. Fill in your name, email, and message, and we will forward your enquiry directly to the provider. You can also call providers who display their phone number.' },
  { q: 'Is my personal information safe?', a: 'Yes. We take privacy seriously and comply with the Australian Privacy Act 1988. Read our Privacy Policy for full details. We never sell your personal information.' },
  { q: 'What is the difference between plan managed, self managed, and NDIA managed?', a: 'NDIA-managed means the NDIA pays providers directly (you can only use registered providers). Plan-managed means a plan manager handles payments (you can use any provider). Self-managed means you manage payments yourself (you can use any provider and claim reimbursement).' },
  { q: 'How do I report a problem with a provider?', a: 'If you have a concern about a provider listed on ReferAus, contact us through our Contact page. For serious concerns about provider conduct, you can also report directly to the NDIS Quality and Safeguards Commission.' },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.a,
    },
  })),
};

const categories = ['All', 'Participants', 'Providers', 'Platform'];
const catMap: Record<string, number[]> = { 'All': [], 'Participants': [0, 4, 5, 8, 9, 10, 11], 'Providers': [1, 2, 3, 6], 'Platform': [7, 9] };

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);
  const [cat, setCat] = useState('All');
  const filtered = cat === 'All' ? faqs : faqs.filter((_, i) => catMap[cat]?.includes(i));

  return (
    <div className="min-h-screen pt-28 pb-14 px-4 sm:px-6 max-w-3xl mx-auto">
      <Breadcrumbs />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold tracking-widest uppercase text-orange-400 mb-4">Support</p>
        <h1 className="text-4xl font-black tracking-tight mb-3">Frequently Asked Questions</h1>
        <p className="text-gray-500 mb-8">Everything you need to know about ReferAus and the NDIS</p>

        <div className="flex gap-2 mb-8 flex-wrap">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => { setCat(c); setOpen(null); }}
              className={'min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ' + (cat === c ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((faq, i) => (
            <div key={faq.q} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full min-h-[44px] px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                aria-expanded={open === i}
              >
                <span className="text-sm font-medium text-gray-900">{faq.q}</span>
                <span className={'text-gray-400 transition-transform duration-200 ' + (open === i ? 'rotate-180' : '')} aria-hidden="true">&#9662;</span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed">{faq.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center bg-gray-50 rounded-xl p-8">
          <h3 className="font-bold mb-2">Still have questions?</h3>
          <p className="text-sm text-gray-500 mb-4">Our team is here to help</p>
          <Link
            href="/contact"
            className="inline-block min-h-[44px] px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Contact Us
          </Link>
        </div>
      </motion.div>
      <p className="text-xs text-gray-400 text-center mt-8 pb-4">Last updated: March 2026</p>
    </div>
  );
}
