import { Suspense } from 'react';
import { SiteHeader } from '@/components/gov/SiteHeader';
import { SiteFooter } from '@/components/gov/SiteFooter';
import { RegisterFlow } from './RegisterFlow';

export const metadata = { title: 'New Registration' };

export default function RegisterPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1 bg-[var(--surface)]">
        <Suspense fallback={<div className="p-10 text-center text-[var(--ink-tertiary)]">Loading registration form…</div>}>
          <RegisterFlow />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
