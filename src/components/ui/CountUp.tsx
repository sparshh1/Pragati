'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Counts a number up on first paint so a figure that matters reads as a figure
 * that changed, rather than as static furniture.
 *
 * Three constraints kept it simple: it must never animate text that is not a
 * number (₹ signs, "3/12", "L4" all pass straight through), it must land
 * exactly on the target value rather than near it, and it must do nothing at
 * all when the visitor has asked for reduced motion.
 */
export function CountUp({
  value,
  duration = 850,
  className,
}: {
  value: string | number;
  duration?: number;
  className?: string;
}) {
  const text = String(value);

  // Pull a single leading/embedded integer out of the string, keeping whatever
  // prefix and suffix surround it (₹, %, /100, " seats").
  const match = text.match(/^([^\d-]*)(-?[\d,]+(?:\.\d+)?)(.*)$/);
  const target = match ? Number(match[2].replace(/,/g, '')) : NaN;
  const animatable = Boolean(match) && Number.isFinite(target);

  const [display, setDisplay] = useState(animatable ? 0 : target);
  const frame = useRef<number>(0);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!animatable) return;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reduced || duration <= 0) {
      setDisplay(target);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // Ease-out cubic: quick off the mark, settles gently on the value.
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(target * eased);
      if (t < 1) frame.current = requestAnimationFrame(tick);
      else setDisplay(target);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration, animatable]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!animatable || !match) return <span className={className}>{text}</span>;

  const decimals = (match[2].split('.')[1] ?? '').length;
  const shown = decimals
    ? display.toFixed(decimals)
    : new Intl.NumberFormat('en-IN').format(Math.round(display));

  return (
    <span className={className}>
      {match[1]}{shown}{match[3]}
    </span>
  );
}
