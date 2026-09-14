export type BadgeVariant =
  | 'rising' | 'declining' | 'stable' | 'warn'
  | 'officer' | 'employer' | 'student'
  | 'default' | 'solid';

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  rising: 'bg-[var(--signal-rising-light)] text-[var(--signal-rising)] border-[var(--signal-rising)]/40',
  declining: 'bg-[var(--signal-declining-light)] text-[var(--signal-declining)] border-[var(--signal-declining)]/40',
  stable: 'bg-[var(--signal-stable-light)] text-[var(--signal-stable)] border-[var(--signal-stable)]/40',
  warn: 'bg-[var(--signal-warn-light)] text-[var(--signal-warn)] border-[var(--signal-warn)]/40',
  officer: 'bg-[var(--accent-officer-light)] text-[var(--accent-officer)] border-[var(--accent-officer)]/40',
  employer: 'bg-[var(--accent-employer-light)] text-[var(--accent-employer)] border-[var(--accent-employer)]/40',
  student: 'bg-[var(--accent-student-light)] text-[var(--accent-student)] border-[var(--accent-student)]/40',
  default: 'bg-[var(--surface-alt)] text-[var(--ink-secondary)] border-[var(--border-strong)]',
  solid: 'bg-[var(--gov-navy)] text-white border-[var(--gov-navy)]',
};

export function Badge({
  variant = 'default',
  children,
  className = '',
  dot = false,
}: {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-semibold border rounded-sm whitespace-nowrap ${VARIANT_STYLES[variant]} ${className}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
