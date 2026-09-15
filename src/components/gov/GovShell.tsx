'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { useGov } from '@/lib/session';
import { GOV_ROLES, Permission, ALL_PERMISSIONS } from '@/lib/rbac';
import { GOV_NAV, NAV_ICONS } from '@/data/pillars';
import { districts } from '@/data/districts';
import { Emblem } from './Emblem';
import { AccessibilityBar } from './AccessibilityBar';
import { GuideOverlay } from '@/components/guide/GuideOverlay';
import { GuideLauncher } from '@/components/guide/GuideLauncher';

/**
 * The departmental portal is deliberately a different environment from the
 * citizen portal: darker chrome, a restricted-access banner, a visible data
 * scope and a permission-gated navigation. The typography, spacing and
 * component shapes are the same, so it reads as the same government family.
 */
export function GovShell({ children }: { children: ReactNode }) {
  const { officer, ready, signOut, can, scopeLabel } = useGov();
  const router = useRouter();
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (ready && !officer) router.replace('/gov');
  }, [ready, officer, router]);

  if (!ready || !officer) {
    return (
      <div className="min-h-screen grid place-items-center bg-[var(--gov-navy-dark)]">
        <p className="text-[13px] text-slate-300">Authenticating departmental session…</p>
      </div>
    );
  }

  const role = GOV_ROLES[officer.role];
  const districtName = officer.districtId
    ? districts.find(d => d.id === officer.districtId)?.name
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface)]">
      <AccessibilityBar variant="gov" />

      {/* Restricted-access strip */}
      <div className="bg-[var(--gov-maroon)] text-white text-[11px] no-print">
        <div className="mx-auto max-w-[1600px] px-4 py-1 flex flex-wrap items-center justify-between gap-2">
          <span className="font-bold uppercase tracking-[0.1em] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white blink-new" />
            Restricted: Departmental Use Only
          </span>
          <span className="opacity-90">
            Every action on this portal is written to the audit register against{' '}
            <span className="mono font-semibold">{officer.employeeId}</span>
          </span>
        </div>
      </div>

      {/* Masthead */}
      <header className="bg-[var(--gov-navy-dark)] text-white no-print">
        <div className="mx-auto max-w-[1600px] px-4 py-2.5 flex items-center gap-3">
          <Link href="/gov/console" className="flex items-center gap-3 focus-ring shrink-0">
            <Emblem size={30} className="text-white" />
            <span className="leading-tight">
              <span className="block text-[15px] font-bold">प्रgati: Departmental Portal</span>
              <span className="block text-[10px] text-slate-400 uppercase tracking-[0.07em]">
                Dept. of Skill, Employment, Entrepreneurship &amp; Innovation
              </span>
            </span>
          </Link>

          <div className="flex-1" />

          {/* Data scope is always visible: it is the second half of access control */}
          <div data-guide="scope" className="hidden md:flex items-center gap-2 bg-white/10 border border-white/15 rounded-sm px-3 py-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="text-[var(--gov-saffron)]">
              <path d="M9 4L3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5zM9 4v13M15 6.5v13" />
            </svg>
            <span className="leading-tight">
              <span className="block text-[9.5px] uppercase tracking-wide text-slate-400 font-semibold">Data scope</span>
              <span className="block text-[11.5px] font-semibold">{scopeLabel}</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5 border-l border-white/15 pl-3">
            <span className="w-8 h-8 rounded-full grid place-items-center text-[11px] font-bold bg-[var(--gov-saffron)] text-[var(--gov-navy-dark)]">
              {officer.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
            </span>
            <span className="leading-tight hidden sm:block">
              <span className="block text-[12.5px] font-semibold">{officer.name}</span>
              <span className="block text-[10px] text-slate-400">{role.title}</span>
            </span>
            <button onClick={() => { signOut(); router.push('/gov'); }}
              className="ml-1 px-2.5 py-1.5 text-[11.5px] border border-white/25 rounded-sm hover:bg-white/10 focus-ring">
              Sign out
            </button>
          </div>

          <button className="lg:hidden p-2 border border-white/25 rounded-sm"
            onClick={() => setNavOpen(o => !o)} aria-label="Toggle menu" aria-expanded={navOpen}>
            <svg width="18" height="18" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="5.5" x2="17" y2="5.5" /><line x1="3" y1="10" x2="17" y2="10" /><line x1="3" y1="14.5" x2="17" y2="14.5" />
            </svg>
          </button>
        </div>
        <div className="h-[3px] tricolour-bar" />
      </header>

      <div className="flex-1 mx-auto max-w-[1600px] w-full px-4 py-5 flex gap-5">
        {/* Permission-gated navigation */}
        <aside className={`${navOpen ? 'block' : 'hidden'} lg:block w-full lg:w-[262px] shrink-0 no-print`}>
          <nav data-guide="nav" className="gov-card sticky top-4 overflow-hidden" aria-label="Departmental sections">
            <div className="px-4 py-3 bg-[var(--gov-navy)] text-white">
              <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[var(--gov-saffron)]">
                {role.title}
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5">{role.titleHi}</p>
              <p className="text-[10.5px] text-slate-400 mt-1.5 leading-snug">{role.designation}</p>
            </div>

            <ul>
              {GOV_NAV.map(item => {
                const allowed = can(item.permission as Permission);
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    {allowed ? (
                      <Link href={item.href} onClick={() => setNavOpen(false)}
                        className={`flex items-start gap-2.5 px-3.5 py-2.5 border-b border-[var(--border)] transition-colors focus-ring ${
                          active ? 'bg-[var(--accent-officer-light)]' : 'hover:bg-[var(--surface)]'
                        }`}
                        style={active ? { boxShadow: 'inset 3px 0 0 var(--gov-navy)' } : undefined}
                        aria-current={active ? 'page' : undefined}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="1.7"
                          strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"
                          style={{ stroke: active ? 'var(--gov-navy)' : 'var(--ink-tertiary)' }}>
                          <path d={NAV_ICONS[item.icon]} />
                        </svg>
                        <span className="min-w-0">
                          <span className={`block text-[13px] leading-snug ${active ? 'font-bold text-[var(--gov-navy)]' : 'font-semibold text-[var(--ink-secondary)]'}`}>
                            {item.label}
                          </span>
                          <span className="block text-[10.5px] text-[var(--ink-tertiary)] leading-snug mt-0.5">
                            {item.description}
                          </span>
                        </span>
                      </Link>
                    ) : (
                      <div className="flex items-start gap-2.5 px-3.5 py-2.5 border-b border-[var(--border)] bg-[var(--surface-alt)] cursor-not-allowed"
                        title={`Requires permission: ${item.permission}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-tertiary)"
                          strokeWidth="1.7" className="shrink-0 mt-0.5 opacity-60">
                          <rect x="5" y="11" width="14" height="9" rx="1.5" />
                          <path d="M8 11V8.5a4 4 0 018 0V11" />
                        </svg>
                        <span className="min-w-0">
                          <span className="block text-[13px] font-semibold text-[var(--ink-tertiary)] leading-snug">
                            {item.label}
                          </span>
                          <span className="block text-[10px] text-[var(--ink-tertiary)] mono mt-0.5">
                            requires {item.permission}
                          </span>
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="px-3.5 py-3 bg-[var(--surface-alt)] border-t border-[var(--border)]">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mb-1.5">
                Permissions held: {role.permissions.length} of {ALL_PERMISSIONS.length}
              </p>
              <div className="flex flex-wrap gap-1">
                {role.permissions.slice(0, 8).map(p => (
                  <span key={p} className="text-[9px] mono bg-white border border-[var(--border)] px-1 py-0.5 rounded-sm text-[var(--ink-secondary)]">
                    {p}
                  </span>
                ))}
                {role.permissions.length > 8 && (
                  <span className="text-[9px] mono text-[var(--ink-tertiary)] px-1 py-0.5">
                    +{role.permissions.length - 8} more
                  </span>
                )}
              </div>
              {districtName && (
                <p className="text-[10.5px] text-[var(--ink-tertiary)] mt-2">
                  Scoped to <strong>{districtName}</strong> only
                </p>
              )}
              <Link href="/" className="text-[11px] gov-link font-semibold mt-2 inline-block">
                ← Public portal
              </Link>
            </div>
          </nav>
        </aside>

        <div className="flex-1 min-w-0">{children}</div>
      </div>

      <GuideOverlay />
      <GuideLauncher />

      <footer className="border-t border-[var(--border)] bg-white no-print">
        <div className="mx-auto max-w-[1600px] px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-[var(--ink-tertiary)]">
          <p>Departmental portal · Session opened {new Date(officer.signedInAt).toLocaleString('en-IN')}</p>
          <p>Unauthorised access is an offence under the Information Technology Act, 2000</p>
        </div>
      </footer>
    </div>
  );
}

/**
 * Wraps a privileged action. Where the officer lacks the permission, the control
 * is replaced by an explicit statement of what is missing - the portal never
 * silently hides why something cannot be done.
 */
export function Gated({
  permission, children, label,
}: {
  permission: Permission;
  children: ReactNode;
  label?: string;
}) {
  const { can, officer } = useGov();
  if (can(permission)) return <>{children}</>;

  const perm = ALL_PERMISSIONS.find(p => p.id === permission);
  return (
    <div className="flex items-start gap-2 border border-dashed border-[var(--border-strong)] bg-[var(--surface-alt)] rounded-sm px-3 py-2.5">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ink-tertiary)" strokeWidth="1.8"
        className="shrink-0 mt-0.5">
        <rect x="5" y="11" width="14" height="9" rx="1.5" />
        <path d="M8 11V8.5a4 4 0 018 0V11" />
      </svg>
      <p className="text-[11.5px] text-[var(--ink-secondary)] leading-snug">
        <strong>{label ?? perm?.label ?? permission}</strong> is not available to a{' '}
        {officer ? GOV_ROLES[officer.role].title : 'user'}.
        <span className="block mono text-[10.5px] text-[var(--ink-tertiary)] mt-0.5">
          requires {permission}
        </span>
      </p>
    </div>
  );
}

/** Small inline badge showing which permission an action consumes. */
export function PermTag({ permission }: { permission: Permission }) {
  const { can } = useGov();
  return (
    <span className={`inline-flex items-center gap-1 text-[9.5px] mono px-1.5 py-0.5 rounded-sm border ${
      can(permission)
        ? 'bg-[var(--signal-rising-light)] border-[var(--signal-rising)]/40 text-[var(--signal-rising)]'
        : 'bg-[var(--surface-alt)] border-[var(--border-strong)] text-[var(--ink-tertiary)]'
    }`}>
      {can(permission) ? '✓' : '🔒'} {permission}
    </span>
  );
}
