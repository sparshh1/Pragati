export function Progress({
  value,
  max = 100,
  color = 'var(--gov-navy)',
  height = 8,
  label,
  showValue = false,
}: {
  value: number;
  max?: number;
  color?: string;
  height?: number;
  label?: string;
  showValue?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      {(label || showValue) && (
        <div className="flex justify-between items-baseline mb-1">
          {label && <span className="text-[13px] text-[var(--ink-secondary)]">{label}</span>}
          {showValue && <span className="text-[13px] mono font-semibold">{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        className="w-full bg-[var(--surface-alt)] rounded-sm overflow-hidden border border-[var(--border)]"
        style={{ height }}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className="h-full ks-bar-grow transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
