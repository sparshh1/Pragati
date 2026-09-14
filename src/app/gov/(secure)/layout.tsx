import { GovShell } from '@/components/gov/GovShell';

export default function SecureGovLayout({ children }: { children: React.ReactNode }) {
  return <GovShell>{children}</GovShell>;
}
