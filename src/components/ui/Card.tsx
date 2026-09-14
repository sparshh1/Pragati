import { ReactNode } from 'react';
import { CountUp } from './CountUp';

export function Card({
  title,
  subtitle,
  action,
  children,
  className = '',
  dense = false,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  dense?: boolean;
}) {
  return (
    <section className={`gov-card ${className}`}>
      {title && (
        <header className="gov-card-head">
          <div className="min-w-0">
            <h2 className="gov-card-title truncate">{title}</h2>
            {subtitle && (
              <p className="text-[13px] text-[var(--ink-tertiary)] mt-1 font-normal normal-case tracking-normal leading-snug">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={dense ? '' : 'p-4'}>{children}</div>
    </section>
  );
}

/** A labelled figure. Used in the KPI strips at the top of every dashboard. */
export function Stat({
  label,
  value,
  sub,
  tone = 'neutral',
  accent,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: 'positive' | 'negative' | 'warn' | 'neutral';
  accent?: string;
}) {
  const toneClass = {
    positive: 'text-[var(--signal-rising)]',
    negative: 'text-[var(--signal-declining)]',
    warn: 'text-[var(--signal-warn)]',
    neutral: 'text-[var(--ink-tertiary)]',
  }[tone];

  return (
    <div
      className="gov-card px-4 py-3 ks-lift"
      style={accent ? { borderTop: `3px solid ${accent}` } : undefined}
    >
      <p className="text-[12.5px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-secondary)]">
        {label}
      </p>
      <p className="text-[30px] leading-tight font-bold text-[var(--ink)] mono mt-1.5">
        {typeof value === 'string' || typeof value === 'number' ? <CountUp value={value} /> : value}
      </p>
      {sub && <p className={`text-[12.5px] mt-1 leading-snug ${toneClass}`}>{sub}</p>}
    </div>
  );
}

/** Inline explanatory note — used to state what a mechanism actually does. */
export function Note({
  tone = 'info',
  title,
  children,
}: {
  tone?: 'info' | 'warn' | 'danger' | 'success';
  title?: string;
  children: ReactNode;
}) {
  const styles = {
    info: 'bg-[var(--accent-officer-light)] border-[var(--gov-navy)]/30 text-[var(--gov-navy)]',
    warn: 'bg-[var(--signal-warn-light)] border-[var(--signal-warn)]/40 text-[var(--signal-warn)]',
    danger: 'bg-[var(--signal-declining-light)] border-[var(--signal-declining)]/40 text-[var(--signal-declining)]',
    success: 'bg-[var(--signal-rising-light)] border-[var(--signal-rising)]/40 text-[var(--signal-rising)]',
  }[tone];

  return (
    <div className={`border-l-[4px] ${styles} px-4 py-3 rounded-sm`}>
      {title && <p className="text-[13.5px] font-bold uppercase tracking-wide mb-1.5">{title}</p>}
      <div className="text-[14px] leading-relaxed text-[var(--ink-secondary)]">{children}</div>
    </div>
  );
}
