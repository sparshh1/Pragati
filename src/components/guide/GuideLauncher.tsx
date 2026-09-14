'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useGuide } from '@/lib/guide';
import { pageGuideFor } from '@/data/guides';

/**
 * The persistent help affordance. Present on every signed-in screen, bottom
 * right, above the fold of the thumb on mobile. It offers whichever kind of
 * help the current route actually has: a walkthrough, a written page guide, or
 * the voice helpline.
 */
export function GuideLauncher() {
  const pathname = usePathname();
  const { availableTour, start, seen, resetSeen } = useGuide();
  const [open, setOpen] = useState(false);

  const guide = pageGuideFor(pathname);
  const hasAnything = Boolean(availableTour || guide);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[58] bg-black/25 ks-fade no-print"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <div className="fixed bottom-5 right-5 z-[60] no-print flex flex-col items-end gap-3">
        {open && (
          <div
            className="ks-pop w-[min(360px,calc(100vw-2.5rem))] bg-white border-2 border-[var(--gov-navy)] rounded-sm shadow-2xl overflow-hidden"
            role="dialog"
            aria-label="Help and guidance"
          >
            <div className="h-1 tricolour-bar" />
            <div className="px-4 py-3 bg-[var(--gov-navy)] text-white flex items-center justify-between gap-2">
              <div>
                <p className="text-[15px] font-bold">Need help?</p>
                <p className="text-[12.5px] text-slate-300">मदत हवी आहे? · मदद चाहिए?</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close help"
                className="w-8 h-8 grid place-items-center rounded-sm border border-white/30 hover:bg-white/10 focus-ring text-[17px] leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-3 space-y-2">
              {availableTour && (
                <button
                  onClick={() => { setOpen(false); start(); }}
                  className="w-full text-left border border-[var(--border)] rounded-sm p-3.5 hover:border-[var(--gov-navy)] hover:bg-[var(--surface)] focus-ring ks-lift"
                >
                  <span className="flex items-start gap-3">
                    <span className="w-9 h-9 shrink-0 grid place-items-center rounded-sm bg-[var(--accent-officer-light)] text-[var(--gov-navy)]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 16v-4M12 8.5v.01" />
                      </svg>
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[14.5px] font-bold text-[var(--ink)]">
                        {seen.includes(availableTour.id) ? 'Show me around again' : 'Show me around this page'}
                      </span>
                      <span className="block text-[13px] text-[var(--ink-secondary)] leading-snug mt-0.5">
                        {availableTour.steps.length}-step walkthrough · about a minute
                      </span>
                    </span>
                  </span>
                </button>
              )}

              {guide && (
                <a
                  href="#page-guide"
                  onClick={() => setOpen(false)}
                  className="block border border-[var(--border)] rounded-sm p-3.5 hover:border-[var(--gov-navy)] hover:bg-[var(--surface)] focus-ring ks-lift"
                >
                  <span className="flex items-start gap-3">
                    <span className="w-9 h-9 shrink-0 grid place-items-center rounded-sm bg-[var(--accent-student-light)] text-[var(--accent-student)]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 5.5A1.5 1.5 0 015.5 4H11v15H5.5A1.5 1.5 0 014 17.5zM20 5.5A1.5 1.5 0 0018.5 4H13v15h5.5a1.5 1.5 0 001.5-1.5z" />
                      </svg>
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[14.5px] font-bold text-[var(--ink)]">
                        How to use this page
                      </span>
                      <span className="block text-[13px] text-[var(--ink-secondary)] leading-snug mt-0.5">
                        Written steps you can read at your own pace
                      </span>
                    </span>
                  </span>
                </a>
              )}

              <a
                href="tel:18002330202"
                className="block border border-[var(--border)] rounded-sm p-3.5 hover:border-[var(--gov-navy)] hover:bg-[var(--surface)] focus-ring ks-lift"
              >
                <span className="flex items-start gap-3">
                  <span className="w-9 h-9 shrink-0 grid place-items-center rounded-sm bg-[var(--signal-rising-light)] text-[var(--signal-rising)]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 4h4l2 5-2.5 1.5a12 12 0 005 5L15 13l5 2v4a1 1 0 01-1 1A16 16 0 014 5a1 1 0 011-1z" />
                    </svg>
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[14.5px] font-bold text-[var(--ink)]">
                      Talk to a person — 1800-233-0202
                    </span>
                    <span className="block text-[13px] text-[var(--ink-secondary)] leading-snug mt-0.5">
                      Free call. Speak in Marathi, Hindi, English or Urdu.
                    </span>
                  </span>
                </span>
              </a>

              {!hasAnything && (
                <p className="text-[13.5px] text-[var(--ink-tertiary)] px-1 py-2 leading-relaxed">
                  There is no walkthrough for this screen yet. The helpline above can answer anything.
                </p>
              )}

              {seen.length > 0 && (
                <button
                  onClick={resetSeen}
                  className="w-full text-[12.5px] text-[var(--ink-tertiary)] hover:text-[var(--ink)] underline underline-offset-2 pt-1 focus-ring"
                >
                  Reset all guides so they show automatically again
                </button>
              )}
            </div>
          </div>
        )}

        <button
          data-guide="guide-launcher"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-label="Help and guidance"
          className={`flex items-center gap-2.5 pl-4 pr-5 py-3.5 rounded-full bg-[var(--gov-navy)] text-white font-bold text-[15px] shadow-xl hover:bg-[var(--gov-navy-light)] focus-ring transition-transform hover:scale-[1.03] active:scale-100 ${
            !open && availableTour && !seen.includes(availableTour.id) ? 'ks-halo' : ''
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round">
            <circle cx="12" cy="12" r="9.2" />
            <path d="M9.4 9.2a2.7 2.7 0 115.2 1c0 1.8-2.6 2-2.6 3.6M12 17.2v.01" />
          </svg>
          <span className="hidden sm:inline">Guide me</span>
        </button>
      </div>
    </>
  );
}
