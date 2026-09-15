import { Suspense } from 'react';
import { SiteHeader } from '@/components/gov/SiteHeader';
import { SiteFooter } from '@/components/gov/SiteFooter';
import { PublicDemand } from './PublicDemand';

export const metadata = {
  title: 'Jobs in your district',
  description: 'Real hiring numbers by district and trade, published by the Department of Skill, Employment, Entrepreneurship & Innovation.',
};

export default function DemandPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1 bg-[var(--surface)]">
        <Suspense fallback={<div className="p-12 text-center text-[var(--ink-tertiary)]">Loading dashboard…</div>}>
          <PublicDemand />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
