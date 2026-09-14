'use client';

import { ReactNode, useMemo, useState } from 'react';

export interface Col<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => number | string;
  align?: 'left' | 'right' | 'center';
  width?: string;
  hideBelow?: 'sm' | 'md' | 'lg';
}

export function Table<T>({
  columns,
  rows,
  rowKey,
  empty = 'No records found.',
  onRowClick,
  highlight,
  caption,
}: {
  columns: Col<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: string;
  onRowClick?: (row: T) => void;
  highlight?: (row: T) => string | undefined;
  caption?: string;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [dir, setDir] = useState<'asc' | 'desc'>('desc');

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find(c => c.key === sortKey);
    if (!col?.sortValue) return rows;
    return [...rows].sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      const cmp =
        typeof va === 'number' && typeof vb === 'number'
          ? va - vb
          : String(va).localeCompare(String(vb));
      return dir === 'asc' ? cmp : -cmp;
    });
  }, [rows, sortKey, dir, columns]);

  const hideClass = { sm: 'hidden sm:table-cell', md: 'hidden md:table-cell', lg: 'hidden lg:table-cell' };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map(c => (
              <th
                key={c.key}
                scope="col"
                className={`gov-th ${c.hideBelow ? hideClass[c.hideBelow] : ''} ${
                  c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : ''
                }`}
                style={c.width ? { width: c.width } : undefined}
              >
                {c.sortValue ? (
                  <button
                    onClick={() => {
                      if (sortKey === c.key) setDir(d => (d === 'asc' ? 'desc' : 'asc'));
                      else { setSortKey(c.key); setDir('desc'); }
                    }}
                    className="inline-flex items-center gap-1 hover:underline focus-ring"
                  >
                    {c.header}
                    <span aria-hidden className="opacity-70">
                      {sortKey === c.key ? (dir === 'asc' ? '▲' : '▼') : '⇅'}
                    </span>
                  </button>
                ) : (
                  c.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="gov-td text-center py-8 text-[var(--ink-tertiary)]">
                {empty}
              </td>
            </tr>
          )}
          {sorted.map((row, i) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`${i % 2 ? 'bg-[var(--surface)]' : 'bg-white'} ${
                onRowClick ? 'cursor-pointer hover:bg-[var(--accent-officer-light)]' : ''
              }`}
              style={highlight?.(row) ? { boxShadow: `inset 3px 0 0 ${highlight(row)}` } : undefined}
            >
              {columns.map(c => (
                <td
                  key={c.key}
                  className={`gov-td ${c.hideBelow ? hideClass[c.hideBelow] : ''} ${
                    c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : ''
                  }`}
                >
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
