'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function TestimonialPage() {
  const [form, setForm] = useState({ name: '', role: 'participant', provider: '', rating: 5, message: '' });
  const [submitted, setSubmitted] = useState(false);
  const update = (f: string, v: string | number) => setForm(prev => ({ ...prev, [f]: v }));

  if (submitted) return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 max-w-xl mx-auto flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-black mb-2">Thank you!</h2>
        <p className="text-gray-500">Your testimonial has been submitted for review. We appreciate your feedback.</p>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 max-w-xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold tracking-widest uppercase text-orange-400 mb-4">Share Your Experience</p>
        <h1 className="text-3xl font-black tracking-tight mb-2">Leave a Testimonial</h1>
        <p className="text-gray-500 text-sm mb-8">Help other participants find the right providers by sharing your experience</p>

        <div className="space-y-5">
          <div><label className="block text-sm font-medium mb-1.5">Your Name</label><input value={form.name} onChange={e => update('name', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="First name or initials" /></div>
          <div><label className="block text-sm font-medium mb-1.5">I am a...</label>
            <div className="flex gap-3">
              {['participant', 'family member', 'support coordinator'].map(r => (
                <button key={r} onClick={() => update('role', r)} className={'px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ' + (form.role === r ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300')}>{r.charAt(0).toUpperCase() + r.slice(1)}</button>
              ))}
            </div>
          </div>
          <div><label className="block text-sm font-medium mb-1.5">Provider Name (optional)</label><input value={form.provider} onChange={e => update('provider', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Which provider did you use?" /></div>
          <div><label className="block text-sm font-medium mb-1.5">Rating</label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => update('rating', n)} className="text-2xl transition-transform hover:scale-110" aria-label={n + ' stars'}>{n <= form.rating ? '★' : '☆'}</button>
              ))}
            </div>
          </div>
          <div><label className="block text-sm font-medium mb-1.5">Your Experience</label><textarea value={form.message} onChange={e => update('message', e.target.value)} rows={5} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="How has the NDIS or your provider helped you? What would you tell other participants?" /></div>
          <button onClick={() => { if (form.name && form.message) setSubmitted(true); }} disabled={!form.name || !form.message} className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Submit Testimonial</button>
          <p className="text-xs text-gray-400 text-center">Testimonials are reviewed before being published. We may edit for clarity.</p>
        </div>
      </motion.div>
    </div>
  );
}
