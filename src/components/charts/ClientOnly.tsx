'use client';

import { useEffect, useState, ReactNode } from 'react';

export default function ClientOnly({ children, height = 300 }: { children: ReactNode; height?: number }) {
  const [mounted, setMounted] = useState(false);
  
  // Recharts measures the DOM, so charts must not render during SSR. Flipping a
  // flag once after mount is the intended pattern here.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div 
        className="w-full animate-pulse rounded bg-[var(--surface)] flex items-center justify-center text-xs text-[var(--ink-tertiary)]"
        style={{ height }}
      >
        Loading chart…
      </div>
    );
  }

  return <div style={{ width: '100%', height }}>{children}</div>;
}
