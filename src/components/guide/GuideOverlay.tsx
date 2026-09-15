'use client';

import { useEffect, useLayoutEffect, useState, useCallback } from 'react';
import { useGuide } from '@/lib/guide';
import { TourStep } from '@/data/guides';

interface Rect { top: number; left: number; width: number; height: number }

const CALLOUT_W = 380;
const GAP = 14;

/**
 * The guided tour overlay.
 *
 * A single fixed element sits over the highlighted control and casts a huge
 * spread box-shadow, which dims everything else while leaving a clean hole -
 * cheaper and sharper than an SVG mask, and it animates between targets.
 */
export function GuideOverlay() {
  const { active, stepIndex, next, back, stop, goTo } = useGuide();
  const [rect, setRect] = useState<Rect | null>(null);

  const step: TourStep | undefined = active?.steps[stepIndex];
  const isCentred = !step?.target || step.placement === 'centre';

  // Reading a DOM rectangle is only possible after layout, so this genuinely
  // has to write state from an effect.
  /* eslint-disable react-hooks/set-state-in-effect */
  const measure = useCallback(() => {
    if (!step?.target) { setRect(null); return; }
    const el = document.querySelector<HTMLElement>(`[data-guide="${step.target}"]`);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top - 6, left: r.left - 6, width: r.width + 12, height: r.height + 12 });
  }, [step]);

  // Bring the target into view, then measure once it has settled.
  useEffect(() => {
    if (!active || !step?.target) return;
    const el = document.querySelector<HTMLElement>(`[data-guide="${step.target}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const t = setTimeout(measure, 420);
    return () => clearTimeout(t);
  }, [active, step, measure]);

  useLayoutEffect(() => { measure(); }, [measure]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!active) return;
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [active, measure]);

  // The page behind the tour must not scroll away underneath it.
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [active]);

  if (!active || !step) return null;

  const total = active.steps.length;
  const isLast = stepIndex === total - 1;
  const callout = calloutPosition(rect, step.placement, isCentred);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${active.title}: step ${stepIndex + 1} of ${total}`}
      className="fixed inset-0 z-[70]"
    >
      {/* Scrim, or the spotlight that punches through it */}
      {rect && !isCentred ? (
        <div className="ks-spotlight" style={rect} aria-hidden />
      ) : (
        <div className="fixed inset-0 bg-[rgba(7,32,63,0.72)] ks-fade" aria-hidden onClick={() => stop(true)} />
      )}

      {/* Callout */}
      <div
        className="fixed z-[71] ks-pop"
        style={{ ...callout, width: Math.min(CALLOUT_W, typeof window !== 'undefined' ? window.innerWidth - 28 : CALLOUT_W) }}
      >
        <div className="bg-white border-2 border-[var(--gov-saffron)] rounded-sm shadow-2xl overflow-hidden">
          <div className="h-1 tricolour-bar" />

          <div className="px-5 pt-4 pb-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11.5px] font-bold uppercase tracking-[0.09em] text-[var(--gov-saffron)]">
                {active.title} · Step {stepIndex + 1} of {total}
              </p>
              <h2 className="text-[19px] font-bold text-[var(--gov-navy)] leading-snug mt-1">
                {step.title}
              </h2>
            </div>
            <button
              onClick={() => stop(true)}
              aria-label="Close guide"
              className="shrink-0 w-8 h-8 grid place-items-center rounded-sm border border-[var(--border-strong)] text-[var(--ink-secondary)] hover:bg-[var(--surface-alt)] focus-ring text-[16px] leading-none"
            >
              ×
            </button>
          </div>

          <div className="px-5 pb-4">
            <p className="text-[15px] text-[var(--ink)] leading-relaxed">{step.body}</p>
            {step.marathi && (
              <p className="text-[14px] text-[var(--ink-secondary)] leading-relaxed mt-2.5 pt-2.5 border-t border-[var(--border)]">
                {step.marathi}
              </p>
            )}
          </div>

          {/* Step dots */}
          <div className="px-5 pb-3 flex items-center gap-1.5" role="tablist" aria-label="Tour steps">
            {active.steps.map((s, i) => (
              <button
                key={s.title}
                onClick={() => goTo(i)}
                role="tab"
                aria-selected={i === stepIndex}
                aria-label={`Step ${i + 1}: ${s.title}`}
                className={`h-1.5 rounded-full transition-all focus-ring ${
                  i === stepIndex
                    ? 'w-7 bg-[var(--gov-saffron)]'
                    : i < stepIndex
                      ? 'w-3 bg-[var(--signal-rising)]'
                      : 'w-3 bg-[var(--border-strong)] hover:bg-[var(--ink-tertiary)]'
                }`}
              />
            ))}
          </div>

          <div className="px-5 py-3.5 bg-[var(--surface-alt)] border-t border-[var(--border)] flex items-center justify-between gap-2">
            <button
              onClick={() => stop(true)}
              className="text-[13.5px] font-semibold text-[var(--ink-secondary)] hover:text-[var(--ink)] underline underline-offset-2 focus-ring"
            >
              Skip the guide
            </button>
            <div className="flex items-center gap-2">
              {stepIndex > 0 && (
                <button
                  onClick={back}
                  className="text-[14px] font-semibold px-4 py-2.5 border border-[var(--border-strong)] bg-white rounded-sm hover:bg-white/60 focus-ring"
                >
                  ← Back
                </button>
              )}
              <button
                onClick={next}
                className="text-[14.5px] font-bold px-5 py-2.5 bg-[var(--gov-navy)] text-white rounded-sm hover:bg-[var(--gov-navy-light)] focus-ring"
              >
                {isLast ? 'Finish' : 'Next →'}
              </button>
            </div>
          </div>
        </div>

        <p className="text-[11.5px] text-white/70 mt-2 text-center">
          Use ← → to move between steps, Esc to close
        </p>
      </div>
    </div>
  );
}

/** Places the callout beside the spotlight, flipping when it would overflow. */
function calloutPosition(
  rect: Rect | null,
  placement: TourStep['placement'] = 'auto',
  centred = false,
): { top: number; left: number } {
  if (typeof window === 'undefined') return { top: 120, left: 24 };
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.min(CALLOUT_W, vw - 28);

  if (!rect || centred) {
    return { top: Math.max(24, vh / 2 - 190), left: Math.max(14, vw / 2 - w / 2) };
  }

  const clampL = (l: number) => Math.max(14, Math.min(l, vw - w - 14));
  const clampT = (t: number) => Math.max(14, Math.min(t, vh - 300));

  const spaceRight = vw - (rect.left + rect.width);
  const spaceBelow = vh - (rect.top + rect.height);

  let resolved = placement;
  if (placement === 'auto' || !placement) {
    if (spaceRight > w + GAP) resolved = 'right';
    else if (rect.left > w + GAP) resolved = 'left';
    else if (spaceBelow > 300) resolved = 'bottom';
    else resolved = 'top';
  }

  switch (resolved) {
    case 'right':
      if (spaceRight < w + GAP) return { top: clampT(rect.top + rect.height + GAP), left: clampL(rect.left) };
      return { top: clampT(rect.top), left: clampL(rect.left + rect.width + GAP) };
    case 'left':
      if (rect.left < w + GAP) return { top: clampT(rect.top + rect.height + GAP), left: clampL(rect.left) };
      return { top: clampT(rect.top), left: clampL(rect.left - w - GAP) };
    case 'top':
      if (rect.top < 300) return { top: clampT(rect.top + rect.height + GAP), left: clampL(rect.left) };
      return { top: clampT(rect.top - 290), left: clampL(rect.left) };
    case 'bottom':
    default:
      if (spaceBelow < 300) return { top: clampT(rect.top - 290), left: clampL(rect.left) };
      return { top: clampT(rect.top + rect.height + GAP), left: clampL(rect.left) };
  }
}
