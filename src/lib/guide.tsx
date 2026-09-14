'use client';

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import { Tour, tourForRoute, pageGuideFor } from '@/data/guides';

const SEEN_KEY = 'ks.guide.seen.v1';

interface GuideCtx {
  /** The tour currently running, if any. */
  active: Tour | null;
  stepIndex: number;
  /** A tour exists for the current route. */
  availableTour: Tour | undefined;
  /** A written page guide exists for the current route. */
  hasPageGuide: boolean;
  start: (tour?: Tour) => void;
  next: () => void;
  back: () => void;
  goTo: (i: number) => void;
  stop: (markSeen?: boolean) => void;
  /** Tours this browser has already completed. */
  seen: string[];
  resetSeen: () => void;
}

const Ctx = createContext<GuideCtx | null>(null);

function readSeen(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(SEEN_KEY) || '[]');
  } catch {
    return [];
  }
}

export function GuideProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [active, setActive] = useState<Tour | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [seen, setSeen] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setSeen(readSeen());
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const availableTour = useMemo(() => tourForRoute(pathname), [pathname]);
  const hasPageGuide = useMemo(() => Boolean(pageGuideFor(pathname)), [pathname]);

  const stop = useCallback((markSeen = true) => {
    setActive(prev => {
      if (prev && markSeen) {
        setSeen(s => {
          if (s.includes(prev.id)) return s;
          const next = [...s, prev.id];
          try { window.localStorage.setItem(SEEN_KEY, JSON.stringify(next)); } catch { /* private mode */ }
          return next;
        });
      }
      return null;
    });
    setStepIndex(0);
  }, []);

  const start = useCallback((tour?: Tour) => {
    const t = tour ?? availableTour;
    if (!t) return;
    setStepIndex(0);
    setActive(t);
  }, [availableTour]);

  const next = useCallback(() => {
    setStepIndex(i => {
      if (!active) return i;
      if (i >= active.steps.length - 1) {
        // Finishing the last step closes the tour and records it as seen.
        setTimeout(() => stop(true), 0);
        return i;
      }
      return i + 1;
    });
  }, [active, stop]);

  const back = useCallback(() => setStepIndex(i => Math.max(0, i - 1)), []);
  const goTo = useCallback((i: number) => setStepIndex(i), []);

  const resetSeen = useCallback(() => {
    setSeen([]);
    try { window.localStorage.removeItem(SEEN_KEY); } catch { /* private mode */ }
  }, []);

  // A first-time visitor on a route that has a tour gets it offered once,
  // after a short beat so the page has painted and nothing jumps at them.
  useEffect(() => {
    if (!ready || !availableTour || active) return;
    if (seen.includes(availableTour.id)) return;
    const t = setTimeout(() => setActive(availableTour), 900);
    return () => clearTimeout(t);
  }, [ready, availableTour, seen, active]);

  // Route change ends any running tour — its steps point at a page that is gone.
  // The router is the external system being synchronised with here.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setActive(null);
    setStepIndex(0);
  }, [pathname]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Escape always exits.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') stop(true);
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, stop, next, back]);

  return (
    <Ctx.Provider
      value={{ active, stepIndex, availableTour, hasPageGuide, start, next, back, goTo, stop, seen, resetSeen }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useGuide(): GuideCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useGuide must be used inside <GuideProvider>');
  return ctx;
}
