'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

function TwoFactorSection() {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [disabling, setDisabling] = useState(false);
  const [disableCode, setDisableCode] = useState('');

  useEffect(() => {
    checkMfaStatus();
  }, []);

  const checkMfaStatus = async () => {
    if (!supabase) { setLoading(false); return; }
    const { data } = await supabase.auth.mfa.listFactors();
    const verified = data?.totp?.find((f) => f.status === 'verified');
    setMfaEnabled(!!verified);
    if (verified) setFactorId(verified.id);
    setLoading(false);
  };

  const handleEnroll = async () => {
    if (!supabase) return;
    setError('');
    setSuccess('');
    setEnrolling(true);

    const { data, error: enrollErr } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'ReferAus Authenticator',
    });

    if (enrollErr) {
      setError(enrollErr.message);
      setEnrolling(false);
      return;
    }

    setFactorId(data.id);
    setQrCode(data.totp.qr_code);
  };

  const handleVerifyEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !factorId) return;
    setError('');

    const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeErr) {
      setError(challengeErr.message);
      return;
    }

    const { error: verifyErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: verifyCode,
    });

    if (verifyErr) {
      setError('Invalid code. Please try again.');
      setVerifyCode('');
      return;
    }

    setMfaEnabled(true);
    setEnrolling(false);
    setQrCode(null);
    setVerifyCode('');
    setSuccess('Two-factor authentication enabled successfully!');
  };

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !factorId) return;
    setError('');

    // Verify the code first to confirm identity
    const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeErr) {
      setError(challengeErr.message);
      return;
    }

    const { error: verifyErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: disableCode,
    });

    if (verifyErr) {
      setError('Invalid code. Please enter a valid authenticator code.');
      setDisableCode('');
      return;
    }

    const { error: unenrollErr } = await supabase.auth.mfa.unenroll({ factorId });
    if (unenrollErr) {
      setError(unenrollErr.message);
      return;
    }

    setMfaEnabled(false);
    setDisabling(false);
    setFactorId(null);
    setDisableCode('');
    setSuccess('Two-factor authentication disabled.');
  };

  const handleCancelEnroll = async () => {
    if (supabase && factorId && !mfaEnabled) {
      await supabase.auth.mfa.unenroll({ factorId });
    }
    setEnrolling(false);
    setQrCode(null);
    setVerifyCode('');
    setFactorId(null);
    setError('');
  };

  if (loading) {
    return (
      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-bold mb-4">Two-Factor Authentication</h2>
        <div className="animate-pulse h-8 bg-gray-100 rounded w-48" />
      </section>
    );
  }

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="font-bold mb-2">Two-Factor Authentication</h2>
      <p className="text-sm text-gray-500 mb-4">
        Add an extra layer of security to your account using an authenticator app.
      </p>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 mb-4">
          {error}
        </div>
      )}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 mb-4"
        >
          {success}
        </motion.div>
      )}

      {mfaEnabled && !disabling && (
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
            Enabled
          </span>
          <button
            onClick={() => { setDisabling(true); setSuccess(''); setError(''); }}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
          >
            Disable 2FA
          </button>
        </div>
      )}

      {mfaEnabled && disabling && (
        <form onSubmit={handleDisable} className="max-w-sm space-y-3">
          <p className="text-sm text-gray-600">Enter your authenticator code to disable 2FA:</p>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={disableCode}
            onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-center text-xl tracking-[0.4em] font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={disableCode.length !== 6}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all disabled:opacity-50"
            >
              Confirm Disable
            </button>
            <button
              type="button"
              onClick={() => { setDisabling(false); setDisableCode(''); setError(''); }}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!mfaEnabled && !enrolling && (
        <button
          onClick={handleEnroll}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-all hover:shadow-lg hover:shadow-blue-600/25"
        >
          Enable 2FA
        </button>
      )}

      {enrolling && qrCode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm space-y-4"
        >
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">1. Scan this QR code with your authenticator app</p>
            <p className="text-xs text-gray-400">(Google Authenticator, Authy, 1Password, etc.)</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCode} alt="2FA QR Code" width={200} height={200} />
          </div>
          <form onSubmit={handleVerifyEnrollment} className="space-y-3">
            <p className="text-sm font-medium text-gray-600">2. Enter the 6-digit code to confirm:</p>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-center text-xl tracking-[0.4em] font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={verifyCode.length !== 6}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-all disabled:opacity-50"
              >
                Verify & Enable
              </button>
              <button
                type="button"
                onClick={handleCancelEnroll}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </section>
  );
}

function NotificationPreferences() {
  const [prefs, setPrefs] = useState({ newEnquiries: true, newReviews: true, marketingUpdates: true });
  const [savedPrefs, setSavedPrefs] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('referaus_notification_prefs');
      if (stored) setPrefs(JSON.parse(stored));
    } catch {}
  }, []);

  const toggle = (key: keyof typeof prefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem('referaus_notification_prefs', JSON.stringify(prefs));
      setSavedPrefs(true);
      setTimeout(() => setSavedPrefs(false), 2500);
    } catch {}
  };

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="font-bold mb-2">Notification Preferences</h2>
      <p className="text-sm text-gray-500 mb-5">Choose what you want to be notified about.</p>
      <div className="space-y-4 max-w-md">
        {[
          { key: 'newEnquiries' as const, label: 'New Enquiries', desc: 'When a participant sends you an enquiry' },
          { key: 'newReviews' as const, label: 'New Reviews', desc: 'When a participant leaves a review on your profile' },
          { key: 'marketingUpdates' as const, label: 'Marketing Updates', desc: 'Platform news, tips, and feature announcements' },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900">{label}</p>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
            <button
              role="switch"
              aria-checked={prefs[key]}
              onClick={() => toggle(key)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${prefs[key] ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${prefs[key] ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-6">
        <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-all">
          Save Preferences
        </button>
        {savedPrefs && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-green-600 font-medium">Saved!</motion.span>
        )}
      </div>
    </section>
  );
}

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ email: '', currentPassword: '', newPassword: '', confirmPassword: '', timezone: 'Australia/Sydney', language: 'en' });
  const update = (f: string, v: string) => setForm(prev => ({ ...prev, [f]: v }));
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setForm(prev => ({ ...prev, email: data.user!.email! }));
      }
    });
  }, []);

  return (
    <div className="">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black tracking-tight mb-2">Settings</h1>
        <p className="text-gray-500 text-sm mb-8">Account and security settings</p>

        <div className="space-y-8">
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-bold mb-4">Account Email</h2>
            <div><label className="block text-sm font-medium mb-1.5">Email Address</label><input type="email" value={form.email} onChange={e => update('email', e.target.value)} className="w-full max-w-md px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          </section>

          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-bold mb-4">Change Password</h2>
            <div className="space-y-4 max-w-md">
              <div><label className="block text-sm font-medium mb-1.5">Current Password</label><input type="password" value={form.currentPassword} onChange={e => update('currentPassword', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium mb-1.5">New Password</label><input type="password" value={form.newPassword} onChange={e => update('newPassword', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium mb-1.5">Confirm New Password</label><input type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            </div>
          </section>

          <TwoFactorSection />

          <NotificationPreferences />

          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-bold mb-4">Preferences</h2>
            <div className="grid sm:grid-cols-2 gap-4 max-w-md">
              <div><label className="block text-sm font-medium mb-1.5">Timezone</label><select value={form.timezone} onChange={e => update('timezone', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="Australia/Sydney">Sydney (AEST)</option><option value="Australia/Melbourne">Melbourne (AEST)</option><option value="Australia/Brisbane">Brisbane (AEST)</option><option value="Australia/Perth">Perth (AWST)</option></select></div>
              <div><label className="block text-sm font-medium mb-1.5">Language</label><select value={form.language} onChange={e => update('language', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="en">English</option></select></div>
            </div>
          </section>

          <section className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h2 className="font-bold text-red-700 mb-2">Danger Zone</h2>
            <p className="text-sm text-red-600 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
            <button className="px-6 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all">Delete Account</button>
          </section>

          <div className="flex items-center justify-end gap-3">
            {saved && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-green-600 font-medium">Settings saved!</motion.span>}
            <button onClick={handleSave} className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-500 transition-all">Save Settings</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
