'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Preferences {
  analytics: boolean;
  marketing: boolean;
}

const PREF_KEY = 'referaus-cookie-prefs';

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${checked ? 'bg-blue-600' : 'bg-gray-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
}

export default function CookiePreferencesPage() {
  const [prefs, setPrefs] = useState<Preferences>({ analytics: false, marketing: false });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREF_KEY);
      if (stored) setPrefs(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const save = () => {
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
      // Also mark cookie consent as accepted if not already
      if (!localStorage.getItem('referaus-cookie-consent')) {
        localStorage.setItem('referaus-cookie-consent', 'accepted');
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <nav className="text-xs text-gray-400 mb-8 flex items-center gap-1.5">
          <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-600">Cookie Preferences</span>
        </nav>

        <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-2">Cookie Preferences</h1>
        <p className="text-gray-500 mb-8">
          Manage how ReferAus uses cookies on your device. Essential cookies cannot be disabled as they are required for the site to function.
          Your preferences are saved locally on your device.
        </p>

        <div className="space-y-4 mb-8">
          {/* Essential */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-gray-900">Essential Cookies</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">Always on</span>
              </div>
              <Toggle checked={true} disabled />
            </div>
            <p className="text-sm text-gray-500">
              Required for the site to function. These include authentication, session management, and security cookies. They cannot be disabled.
            </p>
          </div>

          {/* Analytics */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-bold text-gray-900">Analytics Cookies</span>
              <Toggle checked={prefs.analytics} onChange={v => setPrefs(p => ({ ...p, analytics: v }))} />
            </div>
            <p className="text-sm text-gray-500">
              Help us understand how visitors use ReferAus — which pages are most visited, how users navigate the directory, and where we can improve. We use Google Analytics for this purpose. No personally identifiable information is collected.
            </p>
          </div>

          {/* Marketing */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-bold text-gray-900">Marketing Cookies</span>
              <Toggle checked={prefs.marketing} onChange={v => setPrefs(p => ({ ...p, marketing: v }))} />
            </div>
            <p className="text-sm text-gray-500">
              Allow us to show you relevant advertising based on your interests, and to measure the effectiveness of our marketing campaigns. Disabling these will not affect your ability to use ReferAus.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={save}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all text-sm shadow-sm hover:shadow-md"
          >
            Save Preferences
          </button>
          {saved && (
            <span className="text-sm text-green-600 font-medium flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
              Saved!
            </span>
          )}
        </div>

        <div className="mt-10 pt-8 border-t border-gray-100 text-sm text-gray-400 space-y-1">
          <p>For more information, see our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.</p>
          <p>Questions? <Link href="/contact" className="text-blue-600 hover:underline">Contact us</Link>.</p>
        </div>
      </div>
    </div>
  );
}
