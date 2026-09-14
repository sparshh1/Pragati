import { Suspense } from 'react';
import { SiteHeader } from '@/components/gov/SiteHeader';
import { SiteFooter } from '@/components/gov/SiteFooter';
import { CourseCatalogue } from './CourseCatalogue';

export const metadata = {
  title: 'Course Catalogue & Syllabus',
  description: 'Notified ITI, Polytechnic and PMKVY 4.0 courses across the pilot districts, with full module-level syllabus, duration, tools and assessment pattern.',
};

export default function CoursesPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1 bg-[var(--surface)]">
        <Suspense fallback={<div className="p-12 text-center text-[var(--ink-tertiary)]">Loading catalogue…</div>}>
          <CourseCatalogue />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
