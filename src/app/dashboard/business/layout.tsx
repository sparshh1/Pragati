import { DashboardShell } from '@/components/dashboard/DashboardShell';

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="business">{children}</DashboardShell>;
}
