import { ReactNode } from 'react';
import Link from 'next/link';

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  breadcrumb,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  breadcrumb?: { label: string; href?: string }[];
}) {
  return (
    <div className="mb-5">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-[var(--ink-tertiary)]">
            {breadcrumb.map((b, i) => (
              <li key={b.label} className="flex items-center gap-1.5">
                {b.href ? (
                  <Link href={b.href} className="gov-link">{b.label}</Link>
                ) : (
                  <span className="text-[var(--ink-secondary)]">{b.label}</span>
                )}
                {i < breadcrumb.length - 1 && <span aria-hidden>›</span>}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-[var(--gov-saffron)] mb-1.5">
              {eyebrow}
            </p>
          )}
          <h1 className="text-[27px] sm:text-[32px] font-bold text-[var(--gov-navy)] tracking-tight leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-[15.5px] text-[var(--ink-secondary)] mt-2 max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
