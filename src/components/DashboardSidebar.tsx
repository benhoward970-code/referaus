'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Image, MessageSquare, Star, Settings, Zap, BarChart2, Bell } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

const links: NavLink[] = [
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/images', label: 'Images', icon: Image },
  { href: '/dashboard/enquiries', label: 'Enquiries', icon: MessageSquare },
  { href: '/dashboard/reviews', label: 'Reviews', icon: Star },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  return (
    <nav className="w-full md:w-56 shrink-0">
      <div className="md:sticky md:top-24 space-y-1">
        <Link
          href="/dashboard"
          className={
            'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all mb-1 ' +
            (pathname === '/dashboard'
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')
          }
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
          </svg>
          Overview
        </Link>
        {links.map((l) => {
          const active = pathname === l.href;
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ' +
                (active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')
              }
            >
              <Icon className="w-4 h-4" />
              {l.label}
            </Link>
          );
        })}
        <hr className="my-3 border-gray-100" />
        <Link
          href="/pricing"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-orange-600 hover:bg-orange-50 transition-all"
        >
          <Zap className="w-4 h-4" />
          Upgrade Plan
        </Link>
      </div>
    </nav>
  );
}
