'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const STEPS = ['Business Details', 'Services', 'Location', 'Review'];
const SERVICE_OPTIONS = ['Support Coordination', 'Daily Living', 'Community Access', 'Therapy', 'Allied Health', 'SIL', 'SDA', 'Transport', 'Plan Management', 'Respite', 'Employment Support', 'Early Childhood'];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ businessName: '', contactName: '', email: '', phone: '', abn: '', description: '', services: [] as string[], suburb: '', state: 'NSW', postcode: '' });

  const update = (field: string, value: string | string[]) => setForm(prev => ({ ...prev, [field]: value }));
  const toggleService = (s: string) => {
    setForm(prev => ({ ...prev, services: prev.services.includes(s) ? prev.services.filter(x => x !== s) : [...prev.services, s] }));
  };

  const canNext = step === 0 ? form.businessName && form.email : step === 1 ? form.services.length > 0 : step === 2 ? form.suburb && form.postcode : true;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black tracking-tight mb-2">Set up your listing</h1>
        <p className="text-gray-500 text-sm mb-8">Complete these steps to go live on ReferAus</p>

        {/* Progress Indicator */}
        <div className="mb-10">
          <div className="flex items-center">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                {/* Circle */}
                <div className="relative flex flex-col items-center">
                  <motion.div
                    animate={{
                      backgroundColor: i < step ? '#16a34a' : i === step ? '#2563eb' : '#ffffff',
                      borderColor: i < step ? '#16a34a' : i === step ? '#2563eb' : '#d1d5db',
                    }}
                    transition={{ duration: 0.3 }}
                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                    style={{ color: i <= step ? '#ffffff' : '#9ca3af' }}
                  >
                    {i < step ? (
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </motion.div>
                  <span className={`absolute top-10 text-[10px] whitespace-nowrap font-medium ${i === step ? 'text-blue-600' : i < step ? 'text-green-600' : 'text-gray-400'}`}>
                    {s}
                  </span>
                </div>
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-1 relative overflow-hidden bg-gray-200">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-blue-600"
                      animate={{ width: i < step ? '100%' : '0%' }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="mb-6" />

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            {step === 0 && (
              <div className="space-y-5">
                <div><label className="block text-sm font-medium mb-1.5">Business Name *</label><input value={form.businessName} onChange={e => update('businessName', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Hunter Disability Services" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1.5">Contact Name</label><input value={form.contactName} onChange={e => update('contactName', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                  <div><label className="block text-sm font-medium mb-1.5">Phone</label><input value={form.phone} onChange={e => update('phone', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                </div>
                <div><label className="block text-sm font-medium mb-1.5">Email *</label><input type="email" value={form.email} onChange={e => update('email', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium mb-1.5">ABN (optional)</label><input value={form.abn} onChange={e => update('abn', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="XX XXX XXX XXX" /></div>
                <div><label className="block text-sm font-medium mb-1.5">About your business</label><textarea value={form.description} onChange={e => update('description', e.target.value)} rows={4} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Tell participants what makes your services special..." /></div>
              </div>
            )}

            {step === 1 && (
              <div>
                <p className="text-sm text-gray-500 mb-4">Select the NDIS services you provide (at least one):</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {SERVICE_OPTIONS.map(s => (
                    <button key={s} onClick={() => toggleService(s)} className={'px-4 py-3 rounded-lg text-sm font-medium border transition-all ' + (form.services.includes(s) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300')}>
                      {s}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-4">{form.services.length} selected</p>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div><label className="block text-sm font-medium mb-1.5">Suburb *</label><input value={form.suburb} onChange={e => update('suburb', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Newcastle" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1.5">State</label><select value={form.state} onChange={e => update('state', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"><option>NSW</option><option>VIC</option><option>QLD</option><option>WA</option><option>SA</option><option>TAS</option><option>ACT</option><option>NT</option></select></div>
                  <div><label className="block text-sm font-medium mb-1.5">Postcode *</label><input value={form.postcode} onChange={e => update('postcode', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="2300" /></div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <h3 className="font-bold text-lg">Review your listing</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Business:</span> <span className="font-medium">{form.businessName}</span></div>
                  <div><span className="text-gray-500">Email:</span> <span className="font-medium">{form.email}</span></div>
                  <div><span className="text-gray-500">Location:</span> <span className="font-medium">{form.suburb}, {form.state} {form.postcode}</span></div>
                  <div><span className="text-gray-500">Services:</span> <span className="font-medium">{form.services.length} selected</span></div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">{form.services.map(s => <span key={s} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{s}</span>)}</div>
                {form.description && <p className="text-sm text-gray-600 mt-2">{form.description}</p>}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-10">
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="px-6 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">Back</button>
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} disabled={!canNext} className="px-8 py-3 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Continue</button>
          ) : (
            <Link href="/dashboard" className="px-8 py-3 rounded-lg text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-all">Launch My Listing</Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}
