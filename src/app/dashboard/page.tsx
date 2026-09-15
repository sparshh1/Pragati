'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCitizen } from '@/lib/session';

/** Entry point after login - routes each user to their own role's dashboard. */
export default function DashboardIndex() {
  const { account, ready } = useCitizen();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    router.replace(account ? `/dashboard/${account.role}` : '/login');
  }, [ready, account, router]);

  return (
    <div className="min-h-screen grid place-items-center">
      <p className="text-[13px] text-[var(--ink-tertiary)]">Redirecting to your dashboard…</p>
    </div>
  );
}
