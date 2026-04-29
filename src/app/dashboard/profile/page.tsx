'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Pencil, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { getProviderByUserId, updateProvider } from '@/lib/supabase';
import { categories } from '@/lib/providers';

const SERVICE_OPTIONS = [
  'Support Coordination', 'Daily Living', 'Community Access', 'Therapy',
  'Allied Health', 'SIL', 'SDA', 'Transport', 'Plan Management',
  'Respite', 'Employment Support', 'Early Childhood', 'Personal Care',
  'Meal Preparation', 'Behaviour Support', 'Occupational Therapy',
  'Speech Pathology', 'Psychology', 'Physiotherapy', 'Group Programs',
];

const STATE_OPTIONS = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;
}

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white';

export default function EditProfilePage() {
  const { user, loading: authLoading } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [provider, setProvider] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [form, setForm] = useState({
    name: '', bio: '', description: '', category: '',
    services: [] as string[],
    phone: '', email: '', website: '', abn: '',
    suburb: '', state: '', postcode: '',
    brand_color: '#3b82f6',
  });

  const fetchProvider = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const p = await getProviderByUserId(user.id);
    setProvider(p);
    if (p) {
      setForm({
        name: p.name || '',
        bio: p.bio || '',
        description: p.description || '',
        category: p.category || '',
        services: Array.isArray(p.services) ? p.services : [],
        phone: p.phone || '',
        email: p.email || '',
        website: p.website || '',
        abn: p.abn || '',
        suburb: p.suburb || p.location || '',
        state: p.state || '',
        postcode: p.postcode || '',
        brand_color: p.brand_color || '#3b82f6',
      });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) fetchProvider();
  }, [authLoading, fetchProvider]);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleService = (s: string) =>
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(s)
        ? prev.services.filter((x) => x !== s)
        : [...prev.services, s],
    }));

  const handleSave = async () => {
    if (!provider?.id) return;
    setSaving(true);
    setToast(null);

    const result = await updateProvider(provider.id, {
      name: form.name,
      bio: form.bio,
      description: form.description,
      category: form.category,
      services: form.services,
      phone: form.phone,
      email: form.email,
      website: form.website,
      abn: form.abn,
      suburb: form.suburb,
      location: form.suburb,
      state: form.state,
      postcode: form.postcode,
      brand_color: form.brand_color,
    });

    setSaving(false);

    if (result.success) {
      setToast({ type: 'success', message: 'Profile saved successfully!' });
      if (result.data) setProvider(result.data);
    } else {
      setToast({ type: 'error', message: 'Failed to save profile. Please try again.' });
    }

    setTimeout(() => setToast(null), 4000);
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6">
            <Skeleton className="h-5 w-40 mb-4" />
            <div className="grid sm:grid-cols-2 gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!provider) {
    return (
      <motion.div {...fadeUp(0)} className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
        <AlertCircle className="w-10 h-10 text-orange-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Provider Profile Found</h2>
        <p className="text-sm text-gray-500 mb-4">Please contact support to set up your provider profile.</p>
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">Back to Dashboard</Link>
      </motion.div>
    );
  }

  const categoryOptions = categories.filter((c) => c !== 'All');

  return (
    <div>
      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </motion.div>
      )}

      <motion.div {...fadeUp(0)}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: "'Oswald'" }}>
              Edit Profile
            </h1>
            <p className="text-gray-500 text-sm mt-1">Update your listing details</p>
          </div>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>

        <div className="space-y-8">
          {/* Business Information */}
          <motion.section {...fadeUp(0.05)} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Pencil className="w-4 h-4 text-blue-500" /> Business Information
            </h2>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    className={inputClass}
                    placeholder="Your business name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => update('category', e.target.value)}
                    className={inputClass + ' bg-white'}
                  >
                    <option value="">Select a category</option>
                    {categoryOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Short Bio</label>
                <input
                  value={form.bio}
                  onChange={(e) => update('bio', e.target.value)}
                  className={inputClass}
                  placeholder="A short tagline for your business"
                  maxLength={160}
                />
                <p className="text-xs text-gray-400 mt-1">{form.bio.length}/160 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  rows={4}
                  className={inputClass + ' resize-none'}
                  placeholder="Describe your services, approach, and what makes you unique"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ABN</label>
                <input
                  value={form.abn}
                  onChange={(e) => update('abn', e.target.value)}
                  className={inputClass}
                  placeholder="XX XXX XXX XXX"
                />
              </div>
            </div>
          </motion.section>

          {/* Contact Information */}
          <motion.section {...fadeUp(0.1)} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    className={inputClass}
                    placeholder="02 XXXX XXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className={inputClass}
                    placeholder="hello@yourbusiness.com.au"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
                <input
                  value={form.website}
                  onChange={(e) => update('website', e.target.value)}
                  className={inputClass}
                  placeholder="https://yourbusiness.com.au"
                />
              </div>
            </div>
          </motion.section>

          {/* Services */}
          <motion.section {...fadeUp(0.15)} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Services</h2>
            <p className="text-sm text-gray-500 mb-3">Select all services you provide.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {SERVICE_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleService(s)}
                  className={
                    'px-4 py-3 rounded-xl text-sm font-medium border transition-all ' +
                    (form.services.includes(s)
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300')
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.section>

          {/* Location */}
          <motion.section {...fadeUp(0.2)} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Location</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Suburb</label>
                <input
                  value={form.suburb}
                  onChange={(e) => update('suburb', e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Newcastle CBD"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                <select
                  value={form.state}
                  onChange={(e) => update('state', e.target.value)}
                  className={inputClass + ' bg-white'}
                >
                  <option value="">Select state</option>
                  {STATE_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Postcode</label>
                <input
                  value={form.postcode}
                  onChange={(e) => update('postcode', e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 2300"
                />
              </div>
            </div>
          </motion.section>

          {/* Brand Colour */}
          <motion.section {...fadeUp(0.25)} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Brand Colour</h2>
            <p className="text-sm text-gray-500 mb-3">Choose a colour to personalise your listing.</p>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={form.brand_color}
                onChange={(e) => update('brand_color', e.target.value)}
                className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer p-1"
              />
              <input
                value={form.brand_color}
                onChange={(e) => update('brand_color', e.target.value)}
                className={inputClass + ' max-w-[160px] font-mono'}
                placeholder="#3b82f6"
                maxLength={7}
              />
              <div
                className="h-12 flex-1 rounded-xl border border-gray-200 flex items-center justify-center text-sm font-semibold text-white"
                style={{ backgroundColor: form.brand_color }}
              >
                Preview
              </div>
            </div>
          </motion.section>

          {/* Save */}
          <motion.div {...fadeUp(0.3)} className="flex items-center justify-between pt-2 pb-8">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
              Cancel
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Save Changes
                </>
              )}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
