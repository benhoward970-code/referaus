'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface NotifSetting { id: string; label: string; description: string; email: boolean; push: boolean; }

const defaultSettings: NotifSetting[] = [
  { id: 'new_enquiry', label: 'New Enquiries', description: 'When a participant sends you an enquiry', email: true, push: true },
  { id: 'new_review', label: 'New Reviews', description: 'When someone leaves a review on your listing', email: true, push: true },
  { id: 'weekly_digest', label: 'Weekly Digest', description: 'Weekly summary of views, enquiries, and performance', email: true, push: false },
  { id: 'plan_expiry', label: 'Plan Expiry', description: 'Reminder before your subscription renews or expires', email: true, push: false },
  { id: 'profile_tips', label: 'Profile Tips', description: 'Suggestions to improve your listing performance', email: false, push: false },
  { id: 'platform_updates', label: 'Platform Updates', description: 'New features and improvements to ReferAus', email: true, push: false },
];

export default function NotificationsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [saved, setSaved] = useState(false);

  const toggle = (id: string, channel: 'email' | 'push') => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, [channel]: !s[channel] } : s));
  };

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <div className="">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-3xl font-black tracking-tight">Notifications</h1><p className="text-gray-500 text-sm mt-1">Choose how you want to be notified</p></div>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">Back to Dashboard</Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-[1fr_80px_80px] items-center">
            <span className="text-sm font-medium text-gray-500">Notification</span>
            <span className="text-xs font-medium text-gray-400 text-center">Email</span>
            <span className="text-xs font-medium text-gray-400 text-center">Push</span>
          </div>
          {settings.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="px-6 py-5 border-b border-gray-50 grid grid-cols-[1fr_80px_80px] items-center">
              <div><div className="text-sm font-medium text-gray-900">{s.label}</div><div className="text-xs text-gray-400 mt-0.5">{s.description}</div></div>
              <div className="flex justify-center">
                <button onClick={() => toggle(s.id, 'email')} className={'w-10 h-6 rounded-full transition-colors duration-200 relative ' + (s.email ? 'bg-blue-600' : 'bg-gray-200')} aria-label={'Toggle email for ' + s.label}>
                  <span className={'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ' + (s.email ? 'left-[18px]' : 'left-0.5')} />
                </button>
              </div>
              <div className="flex justify-center">
                <button onClick={() => toggle(s.id, 'push')} className={'w-10 h-6 rounded-full transition-colors duration-200 relative ' + (s.push ? 'bg-blue-600' : 'bg-gray-200')} aria-label={'Toggle push for ' + s.label}>
                  <span className={'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ' + (s.push ? 'left-[18px]' : 'left-0.5')} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-end mt-6 gap-3">
          {saved && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-green-600 font-medium">Preferences saved!</motion.span>}
          <button onClick={handleSave} className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-500 transition-all">Save Preferences</button>
        </div>
      </motion.div>
    </div>
  );
}
