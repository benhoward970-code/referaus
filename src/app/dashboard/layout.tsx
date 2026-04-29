import { DashboardSidebar } from '@/components/DashboardSidebar';
import { DashboardFAB } from '@/components/DashboardFAB';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row gap-6 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20">
      <DashboardSidebar />
      <div className="flex-1 min-w-0">{children}</div>
      <DashboardFAB />
    </div>
  );
}
