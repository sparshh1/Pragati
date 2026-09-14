'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { pageGuideFor } from '@/data/guides';

/**
 * The written "how to use this page" strip. Sits directly under the page
 * header, collapsed by default so it never gets in the way of someone who
 * already knows the screen, and expanded in one tap for someone who does not.
 */
export function PageGuide({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const pathname = usePathname();
  const guide = pageGuideFor(pathname);
  const [open, setOpen] = useState(defaultOpen);

  if (!guide) return null;

  return (
    <section id="page-guide" className="mb-5 scroll-mt-24 no-print">
      <div className="gov-card overflow-hidden" style={{ borderLeft: '5px solid var(--gov-saffron)' }}>
        <button
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[var(--surface)] focus-ring"
        >
          <span className="w-6 h-6 shrink-0 grid place-items-center rounded-full bg-[var(--gov-saffron)] text-[var(--gov-navy-dark)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <circle cx="12" cy="12" r="9.2" />
              <path d="M9.4 9.2a2.7 2.7 0 115.2 1c0 1.8-2.6 2-2.6 3.6M12 17.2v.01" />
            </svg>
          </span>
          <span className="text-[14px] font-bold text-[var(--gov-navy)] flex-1">
            How to use this page
          </span>
          <span className="text-[13px] text-[var(--ink-tertiary)] hidden sm:inline">
            {guide.steps.length} steps
          </span>
          <svg
            width="14" height="14" viewBox="0 0 12 12" fill="currentColor" aria-hidden
            className={`shrink-0 text-[var(--ink-tertiary)] transition-transform ${open ? 'rotate-180' : ''}`}
          >
            <path d="M1 4l5 5 5-5z" />
          </svg>
        </button>

        {open && (
          <div className="px-4 pb-4 pt-3 border-t border-[var(--border)] ks-fade">
            <p className="text-[14.5px] text-[var(--ink)] leading-relaxed mb-3">{guide.what}</p>
            {guide.marathi && (
              <p className="text-[14px] text-[var(--ink-secondary)] leading-relaxed mb-3.5 pb-3 border-b border-[var(--border)]">
                {guide.marathi}
              </p>
            )}

            <ol className="ks-stagger space-y-3">
              {guide.steps.map((s, i) => (
                <li key={s} className="flex gap-3.5" style={{ ['--i' as string]: i }}>
                  <span className="w-7 h-7 shrink-0 grid place-items-center rounded-full bg-[var(--gov-navy)] text-white text-[13px] font-bold mono">
                    {i + 1}
                  </span>
                  <span className="text-[15px] text-[var(--ink)] leading-relaxed pt-0.5">{s}</span>
                </li>
              ))}
            </ol>

            {guide.tip && (
              <p className="text-[14.5px] text-[var(--ink-secondary)] leading-relaxed mt-4 pt-3.5 border-t border-[var(--border)]">
                <strong className="text-[var(--gov-navy)]">Worth knowing: </strong>{guide.tip}
              </p>
            )}

            <button
              onClick={() => setOpen(false)}
              className="text-[13.5px] font-semibold text-[var(--gov-navy)] underline underline-offset-2 mt-4 focus-ring"
            >
              Close this guide
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
